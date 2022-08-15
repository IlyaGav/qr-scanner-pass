using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace QRScannerPass.Consul.Extensions;
/// <summary>Параметры источника конфигурации из Consul</summary>
public record ConsulConfigurationOptions {
	/// <summary>Идентификатор приложения</summary>
	public string AppId { get; init; }
	/// <summary>Период отложенного применения значений</summary>
	public TimeSpan DebounceDuration { get; init; }

	/// <summary></summary>
	public ConsulConfigurationOptions(string appId, TimeSpan? debounceDuration) {
		this.AppId = appId;
		this.DebounceDuration = debounceDuration ?? TimeSpan.FromSeconds(1);
	}
}

internal class ConsulConfigurationSource: IConfigurationSource {
	public readonly ConsulConfigurationOptions Options;
	public readonly ConsulClient Client;

	public ConsulConfigurationSource(ConsulClient client) : this(client, new(client.AppId, null)) { }
	public ConsulConfigurationSource(ConsulClient client, ConsulConfigurationOptions options) => (this.Client, this.Options) = (client, options);

	public IConfigurationProvider Build(IConfigurationBuilder builder) => new ConsulConfigurationProvider(this);
}

internal class ConsulConfigurationProvider: ConfigurationProvider, IDisposable {
	private readonly ConsulConfigurationSource source;
	private readonly CancellationTokenSource cts = new();
	private readonly Task watcherTask;
	private readonly ConcurrentDictionary<string, string> secretsCache = new();
	private readonly Timer updateDebounce;
	private Exception? error;

	public ConsulConfigurationProvider(ConsulConfigurationSource source) {
		this.updateDebounce = new Timer(this.UpdateCycle);
		this.source = source;
		this.watcherTask = Task.WhenAll(this.WatchData(this.cts.Token), this.WatchSecrets(this.cts.Token));
	}
	public void Dispose() {
		try {
			this.cts.Cancel();
			this.watcherTask.GetAwaiter().GetResult();
		}
		catch (OperationCanceledException) { }
		this.cts.Dispose();
	}
	public override void Load() => this.Data = this.GetKVs();

	private async Task WatchData(CancellationToken cancellation) {
		var isStalled = false;
		do {
			try {
				if (isStalled) {
					_ = this.updateDebounce.Change(this.source.Options.DebounceDuration, Timeout.InfiniteTimeSpan);
				}
				await foreach (var ndx in this.source.Client.WatchKeyPrefix(this.source.Options.AppId, strictPrefix: true, cancellation).ConfigureAwait(false)) {
					if (ndx < 0) {
						this.error = new InvalidOperationException("Отсутствует запрошенная конфигурация, либо доступ к ней");
						return;
					}
					_ = this.updateDebounce.Change(this.source.Options.DebounceDuration, Timeout.InfiniteTimeSpan);
				}
			}
			catch {
				if (!cancellation.IsCancellationRequested) {
					await Task.Delay(TimeSpan.FromSeconds(10), cancellation).ConfigureAwait(false);
					isStalled = true;
				}
			}
		} while (!cancellation.IsCancellationRequested);
	}

	private async Task WatchSecrets(CancellationToken cancellation) {
		do {
			try {
				await foreach (var ndx in this.source.Client.WatchKeyPrefix(ConsulSecrets.Prefix, strictPrefix: true, cancellation).ConfigureAwait(false)) {
					if (ndx < 0) {
						this.error = new InvalidOperationException("Отсутствуют запрошенные секреты, либо доступ к ним");
						return;
					}
					var copy = this.secretsCache.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
					var hasChanges = false;
					foreach (var kvp in copy) {
						var current = await this.source.Client.GetKeyValue($"{ConsulSecrets.Prefix}/{kvp.Key}", forceGet: true, cancellation: cancellation).ConfigureAwait(false);
						if (current is { Length: > 0 } && !string.Equals(kvp.Value, current, StringComparison.Ordinal)) {
							this.secretsCache[kvp.Key] = current;
							hasChanges = true;
						}
					}
					if (hasChanges) {
						_ = this.updateDebounce.Change(this.source.Options.DebounceDuration, Timeout.InfiniteTimeSpan);
					}
				}
			}
			catch {
				if (!cancellation.IsCancellationRequested) {
					await Task.Delay(TimeSpan.FromSeconds(10), cancellation).ConfigureAwait(false);
				}
			}
		} while (!cancellation.IsCancellationRequested);
	}

	private void UpdateCycle(object? state) {
		try {
			var after = this.GetKVs();
			var l = this.Data;
			var r = after;
			var hasDifferences = l.Count != r.Count || l.Keys.Count != r.Keys.Count
				|| !l.Keys.OrderBy(v => v).SequenceEqual(r.Keys.OrderBy(v => v), StringComparer.Ordinal)
				|| !l.Values.OrderBy(v => v).SequenceEqual(r.Values.OrderBy(v => v), StringComparer.Ordinal);
			if (hasDifferences) {
				this.Data = after;
				this.OnReload();
			}
		}
		catch { }
	}

	private static readonly Regex templatePattern =
		new(@"\{\{(?<section>api|db|rmq|certs|appCerts|metadata):(?<key>[^\}:]+)(?::(?<discr>[^\}]+))?\}\}", RegexOptions.Compiled);
	private Dictionary<string, string> GetKVs() {
		if (this.error is not null) {
			throw this.error;
		}
		var keyPaths = this.source.Client.GetKeys(this.source.Options.AppId, strictPrefix: true, forceGet: true).GetAwaiter().GetResult();
		var result = new Dictionary<string, string>();
		foreach (var keyPath in keyPaths) {
			var key = string.Join(":", keyPath.Split(ConsulClient.SplitChars, StringSplitOptions.RemoveEmptyEntries).Skip(1));
			result[key] = this.source.Client.GetKeyValue(keyPath, forceGet: true).GetAwaiter().GetResult() switch
			{
				null => string.Empty,
				string v when templatePattern.Matches(v) is { Count: > 0 } ms => ms.Aggregate(
					v, (acc, m) => this.GetSecret(m.Groups["section"].Value, m.Groups["key"].Value, m.Groups["discr"].Value) switch {
						null => acc,
						var s => acc.Replace(m.Value, s)
					}
				),
				var v => v
			};
		}
		return result;
	}
	private string? GetSecret(string section, string key, string discriminator) =>
		discriminator switch { { Length: > 0 } v => $"{section}/{key}/{v}", _ => $"{section}/{key}" } switch
		{
			var k when this.secretsCache.TryGetValue(k, out var v) => v,
			var k when section == "metadata" =>
				this.source.Client.GetMetadataValue(key, forceGet: true).GetAwaiter().GetResult() switch
				{
					null => null,
					var v => this.secretsCache.TryAdd(k, v) ? v : v
				},
			var k => this.source.Client.GetKeyValue($"{ConsulSecrets.Prefix}/{k}", forceGet: true).GetAwaiter().GetResult() switch
			{
				null => null,
				var v => this.secretsCache.TryAdd(k, v) ? v : v
			}
		};
}