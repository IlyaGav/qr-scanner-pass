using System.Collections.Concurrent;
using System.Security;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace QRScannerPass.Consul.Extensions;
/// <summary>Клиент для работы с сервером Consul</summary>
public class ConsulClient: IDisposable {
	private static readonly JsonSerializerOptions JS = new()
	{
		Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, true) },
		Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
		DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
		IncludeFields = true,
		NumberHandling = JsonNumberHandling.AllowNamedFloatingPointLiterals | JsonNumberHandling.AllowReadingFromString,
		PropertyNameCaseInsensitive = true,
		PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
		ReadCommentHandling = JsonCommentHandling.Skip,
		WriteIndented = true
	};
	private static readonly string HttpTokenHeader = "X-Consul-Token";

	/// <summary>Список разделителей</summary>
	public static readonly char[] SplitChars = new[] { '/' };
	/// <summary>Переменная окружения адреса Consul</summary>
	public static readonly string ConsulHttpEnv = "CONSUL_HTTP_ADDR";
	/// <summary>Переменная окружения токена клиента Consul</summary>
	public static readonly string ConsulTokenEnv = "CONSUL_HTTP_TOKEN";

	private readonly HttpClient http;
	private readonly TimeSpan? cacheDuration;
	private readonly ConcurrentDictionary<string, (DateTime updatedAt, string value)> cache = new();
	private readonly ConcurrentDictionary<string, (DateTime updatedAt, string[] value)> keysCache = new();
	/// <summary>Токен, используемый клиентом</summary>
	public string Token { get; }
	/// <summary>Идентификатор приложения, используемый клиентом</summary>
	public string AppId { get; }
	/// <summary>
	/// </summary>
	public ConsulClient(string appId, Uri? consulUri = null, string? token = null, string? postfix = null, TimeSpan? cacheDuration = null) {
		this.AppId = appId;
		this.Token = token ?? GetClientToken(appId, postfix) ?? throw new ArgumentNullException(nameof(token));
		this.cacheDuration = cacheDuration;
		consulUri ??= new Uri(
			Environment.GetEnvironmentVariable($"{ConsulHttpEnv}_{postfix}") ?? Environment.GetEnvironmentVariable(ConsulHttpEnv)
				?? throw new ArgumentNullException(nameof(consulUri))
		);
		this.http = new HttpClient
		{
			BaseAddress = new Uri(consulUri, "v1/"),
			DefaultRequestHeaders = { { HttpTokenHeader, this.Token } }, Timeout = TimeSpan.FromMinutes(10)
		};
	}
	/// <summary>Получить инфраструктурные метаданные, хранящиеся в Consul</summary>
	public async Task<IDictionary<string, string>> GetMetadata(CancellationToken cancellation = default) {
		var c = cancellation;
		using var res = await this.http.SendAsync(
			new(HttpMethod.Get, "kv/__metadata?keys=true") { Headers = { { HttpTokenHeader, "anonymous" } } }, c
		).ConfigureAwait(false);
		var keys = await JsonSerializer.DeserializeAsync<string[]>(
			await res.EnsureSuccessStatusCode().Content.ReadAsStreamAsync(c).ConfigureAwait(false), JS, c
		).ConfigureAwait(false) ?? Array.Empty<string>();
		var result = new Dictionary<string, string>(keys.Length);
		foreach (var key in keys) {
			using var resValue = await this.http.SendAsync(
				new(HttpMethod.Get, $"kv/{key}?raw=true") { Headers = { { HttpTokenHeader, "anonymous" } } }, c
			).ConfigureAwait(false);
			result[key[11..]] = await resValue.EnsureSuccessStatusCode().Content.ReadAsStringAsync(c).ConfigureAwait(false);
		}
		return result;
	}
	/// <summary>Получить значение по ключу инфраструктурных метаданных</summary>
	public async Task<string?> GetMetadataValue(string metadataKey, bool forceGet = false, CancellationToken cancellation = default) =>
		(this.cache.TryGetValue($"_metadata/{metadataKey}", out var ce), DateTime.UtcNow) switch
		{
			(true, var now) when !forceGet && ce.updatedAt.Add(this.cacheDuration.GetValueOrDefault()) >= now => ce.value,
			(var isCached, var now) => await this.http.SendAsync(
				new(HttpMethod.Get, $"kv/__metadata/{metadataKey}?raw=true") { Headers = { { HttpTokenHeader, "anonymous" } } }, cancellation
			).ConfigureAwait(false) switch
			{
				{ StatusCode: System.Net.HttpStatusCode.NotFound } => null,
				{ StatusCode: System.Net.HttpStatusCode.Forbidden } => throw new SecurityException($"Отсутствуют права для получения {metadataKey}"),
				{ IsSuccessStatusCode: false } when isCached => ce.value,
				var res => await res.EnsureSuccessStatusCode().Content.ReadAsStringAsync(cancellation).ConfigureAwait(false) switch
				{
					var v when this.cacheDuration.HasValue => (this.cache[$"_metadata/{metadataKey}"] = (now, v)).value,
					var v => v
				}
			}
		};
	/// <summary>Получить список ключей, соответствующих заданному префиксу</summary>
	public async Task<string[]> GetKeys(string prefix, bool strictPrefix = true, bool forceGet = false, CancellationToken cancellation = default) =>
		(this.keysCache.TryGetValue($"{strictPrefix}/{prefix}", out var ce), DateTime.UtcNow) switch
		{
			(true, var now) when !forceGet && ce.updatedAt.Add(this.cacheDuration.GetValueOrDefault()) >= now => ce.value,
			(var isCached, var now) => await this.http.GetAsync(
				$"kv/{Uri.EscapeUriString((strictPrefix && prefix.LastOrDefault() != SplitChars[0]) ? prefix + SplitChars[0] : prefix)}?keys=true", cancellation
			).ConfigureAwait(false) switch
			{
				{ StatusCode: System.Net.HttpStatusCode.NotFound } => Array.Empty<string>(),
				{ StatusCode: System.Net.HttpStatusCode.Forbidden } =>
					throw new SecurityException($"Отсутствуют права для получения {prefix}{(strictPrefix ? "" : "*")}"),
				{ IsSuccessStatusCode: false } when isCached => ce.value,
				var res => (await JsonSerializer.DeserializeAsync<string[]>(
					await res.EnsureSuccessStatusCode().Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
				).ConfigureAwait(false))
					?.Where(v => v.LastOrDefault() != SplitChars[0]).ToArray() ?? Array.Empty<string>() switch
					{
						var v when this.cacheDuration.HasValue => (this.keysCache[$"{strictPrefix}/{prefix}"] = (now, v)).value,
						var v => v
					}
			}
		};
	/// <summary>Получить значение ключа</summary>
	public async Task<string?> GetKeyValue(string key, bool throwOnUnauthorized = true, bool forceGet = false, CancellationToken cancellation = default) =>
		(this.cache.TryGetValue(key, out var ce), DateTime.UtcNow) switch
		{
			(true, var now) when !forceGet && ce.updatedAt.Add(this.cacheDuration.GetValueOrDefault()) >= now => ce.value,
			(var isCached, var now) => await this.http.GetAsync($"kv/{Uri.EscapeUriString(key)}?raw=true", cancellation).ConfigureAwait(false) switch
			{
				{ StatusCode: System.Net.HttpStatusCode.NotFound } => null,
				{ StatusCode: System.Net.HttpStatusCode.Forbidden } when !throwOnUnauthorized => null,
				{ StatusCode: System.Net.HttpStatusCode.Forbidden } when throwOnUnauthorized => throw new SecurityException($"Отсутствуют права для получения {key}"),
				{ IsSuccessStatusCode: false } when isCached => ce.value,
				var res => await res.EnsureSuccessStatusCode().Content.ReadAsStringAsync(cancellation).ConfigureAwait(false) switch
				{
					var v when this.cacheDuration.HasValue => (this.cache[key] = (now, v)).value,
					var v => v
				}
			}
		};
	/// <summary>Обновить значение ключа</summary>
	public async Task UpdateKeyValue(string key, string value, CancellationToken cancellation = default) {
		var content = new StringContent(value, System.Text.Encoding.UTF8, "application/text");
		_ = (await this.http.PutAsync($"kv/{Uri.EscapeUriString(key)}", content, cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
	}
	/// <summary>Удалить ключ</summary>
	public async Task DeleteKey(string key, bool isRecurse = false, CancellationToken cancellation = default) {
		var url = $"kv/{Uri.EscapeUriString(key)}{(isRecurse ? "?recurse=true" : "")}";
		_ = (await this.http.DeleteAsync(url, cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
	}
	/// <summary>Получить список политик прав доступа</summary>
	public async Task<ConsulPolicy[]> GetPolicies(CancellationToken cancellation = default) {
		var res = (await this.http.GetAsync("acl/policies", cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
		return await JsonSerializer.DeserializeAsync<ConsulPolicy[]>(
			await res.Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
		).ConfigureAwait(false) ?? Array.Empty<ConsulPolicy>();
	}
	/// <summary>Получение данных политики прав доступа по идентификатору</summary>
	public async Task<ConsulPolicy> GetPolicy(string id, CancellationToken cancellation = default) {
		var res = (await this.http.GetAsync($"acl/policy/{id}", cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
		return await JsonSerializer.DeserializeAsync<ConsulPolicy>(
			await res.Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
		).ConfigureAwait(false) ?? throw new InvalidOperationException();
	}
	/// <summary>Обновить права доступа</summary>
	public async Task<string> UpdatePolicy(ConsulPolicy policy, CancellationToken cancellation = default) {
		var content = new Utf8JsonContent(JsonSerializer.SerializeToUtf8Bytes(policy, JS));
		var res = (
			string.IsNullOrEmpty(policy.Id)
				? await this.http.PutAsync("acl/policy", content, cancellation).ConfigureAwait(false)
				: await this.http.PutAsync($"acl/policy/{policy.Id}", content, cancellation).ConfigureAwait(false)
		).EnsureSuccessStatusCode();
		return (await JsonSerializer.DeserializeAsync<ConsulPolicy>(
			await res.Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
		).ConfigureAwait(false) ?? throw new InvalidOperationException()).Id ?? throw new InvalidOperationException();
	}
	/// <summary>Удалить права доступа</summary>
	public async Task DeletePolicy(string id, CancellationToken cancellation = default) =>
		(await this.http.DeleteAsync($"acl/policy/{id}", cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
	/// <summary>Получить список токенов доступа</summary>
	public async Task<ConsulToken[]> GetTokens(CancellationToken cancellation = default) {
		var res = (await this.http.GetAsync("acl/tokens", cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
		return await JsonSerializer.DeserializeAsync<ConsulToken[]>(
			await res.Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
		).ConfigureAwait(false) ?? Array.Empty<ConsulToken>();
	}
	/// <summary>Получение данных токена доступа по идентификатору</summary>
	public async Task<ConsulToken> GetToken(string accessorId, CancellationToken cancellation = default) {
		var res = (await this.http.GetAsync($"acl/token/{accessorId}", cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();
		return await JsonSerializer.DeserializeAsync<ConsulToken>(
			await res.Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
		).ConfigureAwait(false) ?? throw new InvalidOperationException();
	}
	/// <summary>Обновить токен доступа</summary>
	public async Task<string> UpdateToken(ConsulToken token, CancellationToken cancellation = default) {
		var content = new Utf8JsonContent(JsonSerializer.SerializeToUtf8Bytes(token, JS));
		var res = await this.http.PutAsync(token switch { { AccessorId: { Length: > 0 } id } => $"acl/token/{id}", _ => "acl/token" }, content, cancellation).ConfigureAwait(false);
		return (
			await JsonSerializer.DeserializeAsync<ConsulToken>(
				await res.EnsureSuccessStatusCode().Content.ReadAsStreamAsync(cancellation).ConfigureAwait(false), JS, cancellation
			).ConfigureAwait(false) ?? throw new InvalidOperationException()
		).AccessorId ?? throw new InvalidOperationException();
	}
	/// <summary>Удалить токен доступа</summary>
	public async Task DeleteToken(string id, CancellationToken cancellation = default) =>
		(await this.http.DeleteAsync($"acl/token/{id}", cancellation).ConfigureAwait(false)).EnsureSuccessStatusCode();

	/// <summary>Отслеживание изменений в значениях, заданных префиксом</summary>
	public async IAsyncEnumerable<int> WatchKeyPrefix(string prefix, bool strictPrefix, [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellation) {
		var p = (strictPrefix && prefix.LastOrDefault() != SplitChars[0]) ? prefix + SplitChars[0] : prefix;
		var index = 0;
		while (!cancellation.IsCancellationRequested) {
			var res = await this.http.GetAsync($"kv/{Uri.EscapeUriString(p)}?keys=true&recurse=true&index={index}", cancellation).ConfigureAwait(false);
			if (res.StatusCode is System.Net.HttpStatusCode.NotFound or System.Net.HttpStatusCode.Forbidden) {
				yield return -1;
				yield break;
			} else if (!res.IsSuccessStatusCode) {
				await Task.Delay(TimeSpan.FromSeconds(10), cancellation).ConfigureAwait(false);
			} else {
				var ndx = res.Headers.TryGetValues("X-Consul-Index", out var vs) switch
				{
					true when vs!.Any() => int.TryParse(vs!.First(), out var i) ? i : 0,
					_ => 0
				};
				if (ndx > index && index > 0) {
					yield return ndx;
				}
				index = ndx;
			}
		}
	}

	/// <summary>Получение токена из окружения по идентификатору приложения</summary>
	public static string? GetClientToken(string appId, string? postfix = null) =>
		$"{ConsulTokenEnv}_{appId ?? ""}".GetFromSecretsByName()
			?? Environment.GetEnvironmentVariable($"{ConsulTokenEnv}_{appId}_{postfix}".ToUpperInvariant())
			?? Environment.GetEnvironmentVariable($"{ConsulTokenEnv}_{postfix}".ToLowerInvariant())
			?? Environment.GetEnvironmentVariable($"{ConsulTokenEnv}_{appId}".ToUpperInvariant())
			?? Environment.GetEnvironmentVariable(ConsulTokenEnv);


	/// <summary>
	/// </summary>
	public void Dispose() {
		this.http.Dispose();
		GC.SuppressFinalize(this);
	}

	/// <summary>Ключи инфраструктурных метаданных</summary>
	public static class MetadataKeys {
		/// <summary>Наименование окружения</summary>
		public static readonly string Environment = "Environment";
		/// <summary>Url сервера Elasticsearch</summary>
		public static readonly string ElasticsearchUrl = "ElasticsearchUrl";
		/// <summary>Url сервера аутентификации</summary>
		public static readonly string AuthWebServiceUrl = "AuthWebServiceUrl";
		/// <summary>Url менеджера дискретизации Jaeger</summary>
		public static readonly string JaegerSamplerManagerUrl = "JaegerSamplerManagerUrl";
		/// <summary>Url сервера Jaeger</summary>
		public static readonly string JaegerEndpointUrl = "JaegerEndpointUrl";
		/// <summary>Url веб-сервиса tasks-web</summary>
		public static readonly string TasksWebServiceUrl = "TasksWebServiceUrl";
		/// <summary>Имя хоста сервера RabbitMQ в контуре</summary>
		public static readonly string RmqHost = "RmqHost";
	}
}

internal class Utf8JsonContent: ByteArrayContent {
	public Utf8JsonContent(byte[] utf8Json) : base(utf8Json) =>
		this.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json") { CharSet = System.Text.Encoding.UTF8.WebName };
}
/// <summary>Константы защищённых значений</summary>
public static class ConsulSecrets {
	/// <summary>Префикс пути</summary>
	public const string Prefix = "__secrets";
	/// <summary>Область паролей к БД</summary>
	public const string DbArea = "db";
	/// <summary>Область паролей к RabbitMQ</summary>
	public const string RmqArea = "rmq";
	/// <summary>Область защищённых данных для приложений</summary>
	public const string ApiArea = "api";
	/// <summary>Область для сертификатов, используемых для RabbitMQ</summary>
	public const string CertsArea = "certs";
	/// <summary>Область для сертификатов, используемых приложениями</summary>
	public const string AppCertsArea = "appCerts";

}
/// <summary>Описание токена прав доступа</summary>
public record ConsulToken {
	/// <summary>Открытый идентификатор токена</summary>
	public string? AccessorId { get; init; }
	/// <summary>Закрытый идентификатор токена</summary>
	public string? SecretId { get; init; }
	/// <summary>Имя токена</summary>
	[JsonPropertyName("Description")]
	public string? Name { get; init; }
	/// <summary>Ссылки на политики доступа, определённые для токена</summary>
	public PolicyRef[]? Policies { get; init; }
	/// <summary>Признак локальности токена (относительно кластера)</summary>
	[JsonPropertyName("Local")]
	public bool IsLocal { get; init; }
	/// <summary>Время создания токена</summary>
	[JsonPropertyName("CreateTime")]
	public DateTime? CreatedAt { get; init; }
	/// <summary>Хэш код токена</summary>
	public string? Hash { get; init; }
	/// <summary>Индекс создания</summary>
	public int? CreateIndex { get; init; }
	/// <summary>Индекс изменения</summary>
	public int? ModifyIndex { get; init; }

	/// <summary>Ссылка на политику</summary>
	public record PolicyRef {
		/// <summary>Идентификатор политики</summary>
		[JsonPropertyName("ID")]
		public string? Id { get; init; }
		/// <summary>Наименование политики</summary>
		public string? Name { get; init; }
	}
}
/// <summary>Описание политики доступа</summary>
public record ConsulPolicy {
	/// <summary>Идентификатор политики</summary>
	[JsonPropertyName("ID")]
	public string? Id { get; init; }
	/// <summary>Наименование политики</summary>
	public string? Name { get; init; }
	/// <summary>Описание политики</summary>
	public string? Description { get; init; }
	/// <summary>Набор прав</summary>
	public string? Rules { get; init; }
	/// <summary>Хэш код политики</summary>
	public string? Hash { get; init; }
	/// <summary>Индекс создания</summary>
	public int? CreateIndex { get; init; }
	/// <summary>Индекс изменения</summary>
	public int? ModifyIndex { get; init; }
}