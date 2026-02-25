export function formatCurrency(v: string | number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(v));
}

export function parseDate(date: string) {
    // Always parse date-only strings as local time to prevent timezone-offset day shift
    return new Date(date.split('T')[0] + 'T00:00:00');
}

export function formatDate(date: string) {
    return parseDate(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
