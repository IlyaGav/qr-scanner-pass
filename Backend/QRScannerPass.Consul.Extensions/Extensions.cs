using System.ComponentModel;
using System.Globalization;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
using CS = QRScannerPass.Consul.Extensions.ConsulSecrets;

namespace QRScannerPass.Consul.Extensions;
/// <summary>Методы расширения Consul</summary>
public static class ConsulExtensions {
	/// <summary>Регистрация Consul в качестве источника данных конфигурации</summary>
	public static IConfigurationBuilder AddConsul(
		this IConfigurationBuilder builder, string appId, string? token = null, string? postfix = null, Uri? consulUri = null,
		Func<IConfigurationBinderOptionsBuilder, IConfigurationBinderOptionsBuilder>? binderConfig = null
	) => AddConsul(builder, new ConsulClient(appId, consulUri, token, postfix), binderConfig);
	/// <summary>Регистрация Consul в качестве источника данных конфигурации</summary>
	public static IConfigurationBuilder AddConsul(
		this IConfigurationBuilder builder, ConsulClient client, Func<IConfigurationBinderOptionsBuilder, IConfigurationBinderOptionsBuilder>? binderConfig = null
	) => AddConsul(builder, client, new(client.AppId, null), binderConfig);

	/// <summary>Регистрация Consul в качестве источника данных конфигурации</summary>
	public static IConfigurationBuilder AddConsul(
		this IConfigurationBuilder builder, ConsulClient client, ConsulConfigurationOptions options,
		Func<IConfigurationBinderOptionsBuilder, IConfigurationBinderOptionsBuilder>? binderConfig = null
	) {
		if (binderConfig is not null) {
			var c = new ConfigurationBinderOptionsBuilder();
			_ = binderConfig(c);
			c.Apply();
		}
		return builder.Add(new ConsulConfigurationSource(client, options));
	}

	/// <summary>Получение защищённой информации из Consul</summary>
	[Obsolete("Рекомендуется использование через шаблонирование параметров в конфигурации")]
	public static async Task<string?> GetSecretByApi(this ConsulClient client, string apiKey, string? login = null, CancellationToken cancellation = default) {
		string? result = null;
		var tries = new[] { new[] { apiKey, login ?? "" }, new[] { apiKey } };
		var prefix = $"{CS.Prefix}/{CS.ApiArea}/";
		var keys = await client.GetKeys(prefix, strictPrefix: true, forceGet: false, cancellation).ConfigureAwait(false);
		foreach (var t in tries) {
			var key = prefix + string.Join("/", t);
			if (keys.Contains(key)) {
				result = await client.GetKeyValue(key, throwOnUnauthorized: true, forceGet: false, cancellation).ConfigureAwait(false);
				break;
			}
		}
		return result;
	}
	/// <summary>Получение данных сертификата из Consul</summary>
	public static async Task<X509Certificate2?> GetCertificateByAppId(this ConsulClient client, string appId, CancellationToken cancellation = default) =>
		(await client.GetKeyValue($"{CS.Prefix}/{CS.AppCertsArea}/{appId}", throwOnUnauthorized: false, forceGet: false, cancellation).ConfigureAwait(false)
			?? await client.GetKeyValue($"{CS.Prefix}/{CS.CertsArea}/{appId}", throwOnUnauthorized: true, forceGet: false, cancellation).ConfigureAwait(false)) switch
		{
			string v when v.Contains("BEGIN CERTIFICATE", StringComparison.Ordinal) => X509Certificate2.CreateFromPem(v, v),
			string v => new X509Certificate2(Convert.FromBase64String(v)),
			_ => null
		};
	/// <summary>Получение данных сертификата из Consul</summary>
	public static Task<X509Certificate2?> GetCertificate(this ConsulClient client, string key, CancellationToken cancellation = default) =>
		GetCertificateByAppId(client, key, cancellation);

	private static readonly string[] SecretPaths = new[] { "/run/secrets/", "C:\\ProgramData\\Docker\\secrets" };
	/// <summary>Получение строки, заданной в swarm secrets</summary>
	public static string? GetFromSecretsByName(this string key) =>
		SecretPaths.SelectMany(
			p => new[] { Path.Combine(p, key), Path.Combine(p, key.ToUpperInvariant()) }
		).Where(p => File.Exists(p)).Select(p => File.ReadAllText(p).Trim()).FirstOrDefault();


	internal class CertificateConverter: TypeConverter {
		public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType) =>
			sourceType == typeof(string) || base.CanConvertFrom(context, sourceType);
		public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value) => value switch
		{
			string v when v.Contains("BEGIN CERTIFICATE", StringComparison.Ordinal) => X509Certificate2.CreateFromPem(v, v),
			string v => new X509Certificate2(Convert.FromBase64String(v)),
			X509Certificate2 v => new System.Text.StringBuilder().AppendLine("-----BEGIN CERTIFICATE-----")
				.AppendLine(Convert.ToBase64String(v.Export(X509ContentType.Cert), Base64FormattingOptions.InsertLineBreaks))
				.AppendLine("-----END CERTIFICATE-----").ToString(),
			_ => throw new NotImplementedException()
		};
	}
	internal class ArrayConverter<T>: TypeConverter {
		private static readonly char[] delims = new[] { '\r', '\n' };
		private readonly TypeConverter converter;

		public ArrayConverter() => this.converter = TypeDescriptor.GetConverter(typeof(T));

		public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType) =>
			(sourceType == typeof(string) && this.converter.CanConvertFrom(typeof(string))) || base.CanConvertFrom(context, sourceType);

		public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value) => value switch
		{
			string v when typeof(T) == typeof(string) => v.Split(delims, StringSplitOptions.RemoveEmptyEntries).Select(i => i.Trim()).ToArray(),
			string v => v.Split(delims, StringSplitOptions.RemoveEmptyEntries).Select(i => this.converter.ConvertFromInvariantString(i)).Cast<T>().ToArray(),
			_ => throw new NotImplementedException()
		};
	}
	internal class ConfigurationBinderOptionsBuilder: IConfigurationBinderOptionsBuilder {
		private static readonly HashSet<(Type, Type)> appliedConverterTypes = new();
		private readonly HashSet<(Type, Type)> converterTypes = new();

		public IConfigurationBinderOptionsBuilder WithArrays<T>() {
			_ = this.converterTypes.Add((typeof(T[]), typeof(ArrayConverter<T>)));
			return this;
		}
		public IConfigurationBinderOptionsBuilder WithCertificates() {
			_ = this.converterTypes.Add((typeof(X509Certificate2), typeof(CertificateConverter)));
			return this;
		}

		public void Apply() {
			lock (appliedConverterTypes) {
				foreach (var item in this.converterTypes) {
					var (type, converterType) = item;
					if (!appliedConverterTypes.Contains(item)) {
						_ = TypeDescriptor.AddAttributes(type, new TypeConverterAttribute(converterType));
						_ = appliedConverterTypes.Add(item);
					}
				}
			}
		}
	}
}
/// <summary>Настройки расширенных преобразований модели конфигурации</summary>
public interface IConfigurationBinderOptionsBuilder {
	/// <summary>Преобразования в X509Certificate2</summary>
	IConfigurationBinderOptionsBuilder WithCertificates();
	/// <summary>Преобразование в массив значений (разделитель элементов -- новая строка)</summary>
	IConfigurationBinderOptionsBuilder WithArrays<T>();
}