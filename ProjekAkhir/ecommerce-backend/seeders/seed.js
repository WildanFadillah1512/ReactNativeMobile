const { PrismaClient } = require('@prisma/client');
const { allRentalProducts } = require('./data.js'); // Impor data Anda

const prisma = new PrismaClient();

// Fungsi untuk membersihkan harga (misal 'Rp 50.000' -> 50000)
function cleanPrice(priceString) {
  if (!priceString) return 0;
  return parseFloat(priceString.replace(/Rp /g, '').replace(/\./g, ''));
}

async function main() {
  console.log('Start seeding ...');

  // 1. Hapus semua data lama (agar tidak duplikat)
  await prisma.product.deleteMany({});
  await prisma.seller.deleteMany({});
  console.log('Deleted old data.');

  // 2. Buat Sellers (Penjual)
  // Kita ambil data seller yang unik dari produk
  const sellersData = {};
  allRentalProducts.forEach(product => {
    if (!sellersData[product.seller.id]) {
      sellersData[product.seller.id] = product.seller;
    }
  });

  const sellersToCreate = Object.values(sellersData).map(seller => ({
    id: seller.id,
    name: seller.name,
    avatar: seller.avatar,
    bio: seller.bio,
    rating: seller.rating,
    itemsRented: seller.itemsRented,
  }));

  await prisma.seller.createMany({
    data: sellersToCreate,
  });
  console.log(`Created ${sellersToCreate.length} sellers.`);

  // 3. Buat Products (Produk)
  const productsToCreate = allRentalProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: cleanPrice(product.price),
    description: product.description,
    imageUrl: product.image, // Ini sekarang string nama file
    category: product.category,
    rating: product.rating,
    reviews: product.reviews,
    trending: product.trending,
    location: product.location,
    period: product.period,
    sellerId: product.seller.id, // Hubungkan ke Seller
  }));

  await prisma.product.createMany({
    data: productsToCreate,
  });
  console.log(`Created ${productsToCreate.length} products.`);

  console.log('Seeding finished. 🌱');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });