// src/utils/priceParser.ts

/**
 * Mengubah string harga format Rupiah (misal "Rp 150.000") menjadi angka.
 * Menghilangkan "Rp ", spasi, dan titik sebagai pemisah ribuan.
 * Mengembalikan 0 jika string tidak valid.
 * @param priceString String harga yang akan di-parse.
 * @returns Harga dalam bentuk angka (number).
 */
export function parsePrice(priceString: string): number {
    // Cek jika string null, undefined, atau kosong
    if (!priceString) {
        return 0;
    }
    // Hilangkan 'Rp', spasi di awal/akhir, dan titik (.)
    const numericString = priceString.replace(/Rp\s*|\./g, '').trim();
    // Konversi ke integer
    const price = parseInt(numericString, 10);
    // Kembalikan 0 jika hasil konversi bukan angka (NaN)
    return isNaN(price) ? 0 : price;
}

/**
 * Mengubah angka menjadi string format Rupiah (misal 150000 -> "Rp 150.000").
 * Menggunakan locale 'id-ID' untuk format Indonesia.
 * @param amount Angka yang akan diformat.
 * @returns String harga dalam format Rupiah.
 */
export function formatCurrency(amount: number): string {
    // Cek jika amount bukan angka atau null/undefined
    if (typeof amount !== 'number' || isNaN(amount)) {
        return 'Rp 0'; // Atau kembalikan string error/default
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
}