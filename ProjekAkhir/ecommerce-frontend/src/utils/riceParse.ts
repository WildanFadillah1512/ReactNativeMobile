export function parsePrice(priceString: string): number {
    if (!priceString) {
        return 0;
    }
    const numericString = priceString.replace(/Rp\s*|\./g, '').trim();
    const price = parseInt(numericString, 10);
    return isNaN(price) ? 0 : price;
}
export function formatCurrency(amount: number): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Rp 0'; 
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
}