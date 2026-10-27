export function formatTime(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

export function inr(amount: number | null | undefined): string {
    return amount ? `₹${amount.toLocaleString('en-IN')}` : '–';
}
