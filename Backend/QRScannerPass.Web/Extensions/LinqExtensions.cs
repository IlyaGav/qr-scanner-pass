using System.Linq.Expressions;

namespace QRScannerPass.Web.Extensions;

public static class LinqExtensions
{
    public static IQueryable<TSource> WhereIf<TSource>(this IQueryable<TSource> source, bool condition,
        Expression<Func<TSource, bool>> predicate)
    {
        return condition ? source.Where(predicate) : source;
    }

    public static IQueryable<TSource> WhereIf<TSource>(this IQueryable<TSource> source, bool condition,
        Expression<Func<TSource, int, bool>> predicate)
    {
        return condition ? source.Where(predicate) : source;
    }
}