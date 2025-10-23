// File: ./src/types.ts

// ==========================
// 👤 Seller Type Definition
// ==========================
export interface Seller {
    id: number;
    name: string;
    avatar: string; // URL to the avatar image
    bio: string; // Short biography or description
    rating: number; // Seller's average rating
    itemsRented: number; // Number of items successfully rented out by this seller
}

// ==========================
// 🎒 Rental Item Definition
// ==========================
export interface RentalItem {
    id: number;
    name: string;
    category: string; // e.g., 'Outdoor', 'Elektronik', 'Olahraga'
    description: string;
    image: string; // URL to the primary item image
    rating: number; // Average user rating for this specific item
    reviews: number; // Total number of reviews for this item
    trending: boolean; // Flag if the item is currently trending
    price: string; // Formatted price string (e.g., "Rp 150.000")
    period: string; // Rental period unit (e.g., "/hari", "/minggu")
    location: string; // General location (e.g., "Jakarta Selatan")
    seller: Seller; // Nested Seller object
}

// ==========================
// ⭐ User Review Definition
// ==========================
export interface UserReview {
    id: number; // Unique ID for the review
    itemId: number; // ID of the RentalItem being reviewed
    name: string; // Name of the reviewer
    avatar: string; // URL to the reviewer's avatar
    rating: number; // Star rating given (1-5)
    comment: string; // Textual comment
    timestamp: number; // Unix timestamp of when the review was submitted
}

// ==========================
// 🛒 Checkout Rental Item
// ==========================
export interface CheckoutRentalItem extends RentalItem {
    duration: number; // Selected rental duration (in units matching 'period', e.g., days)
}

// ==========================
// 📍 Address Definition
// ==========================
export interface Address {
    id: number;
    label: string; // e.g., 'Rumah', 'Kantor'
    name: string; // Recipient's name
    phone: string;
    fullAddress: string; // Complete address details
    latitude?: number; // Optional: For map integration
    longitude?: number; // Optional: For map integration
}

// ==========================
// 🧺 Cart Entry Definition
// ==========================
export interface CartEntry {
    item: RentalItem;
    selected: boolean; // Is this item selected for checkout?
    duration: number; // Duration chosen for this item in the cart
}
