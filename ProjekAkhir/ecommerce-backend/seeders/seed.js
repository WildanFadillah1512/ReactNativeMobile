const { PrismaClient } = require('@prisma/client');
const { allRentalProducts } = require('./data.js'); // Pastikan path ini benar

const prisma = new PrismaClient();

function cleanPrice(priceString) {
  if (!priceString) return 0;
  // Menghapus 'Rp ', spasi, dan mengganti '.' (ribuan)
  return parseFloat(priceString.replace(/Rp /g, '').replace(/\./g, ''));
}

async function main() {
  console.log('Start seeding ...');

  // --- PENYESUAIAN URUTAN PEMBERSIHAN ---
  // Hapus data dalam urutan yang benar (dependen dulu)
  
  // Hapus model baru dari Langkah 1
  await prisma.rentalItem.deleteMany({});    // <-- [BARU] Hapus anak dulu
  await prisma.rental.deleteMany({});      // <-- [BARU] Baru hapus induk
  await prisma.notification.deleteMany({}); // <-- [BARU] Hapus notifikasi

  // Hapus model lama
  await prisma.product.deleteMany({});
  await prisma.seller.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.promotion.deleteMany({}); 
  
  console.log('Deleted old data.');

  // --- 1. Buat Sellers ---
  // (Kode Anda di sini sudah benar)
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
    skipDuplicates: true, 
  });
  console.log(`Created ${sellersToCreate.length} sellers.`);

  // --- 2. BUAT CATEGORIES ---
  // (Kode Anda di sini sudah benar)
  const categoryNames = new Set(
    allRentalProducts.map(p => p.category).filter(Boolean) 
  );

  const categoriesToCreate = Array.from(categoryNames).map(name => ({
    name: name,
    imageUrl: `https://source.unsplash.com/400x400/?${name.toLowerCase()}`, 
  }));

  if (categoriesToCreate.length > 0) {
    await prisma.category.createMany({
      data: categoriesToCreate,
      skipDuplicates: true, 
    });
    console.log(`Created ${categoriesToCreate.length} categories.`);
  } else {
    console.log('No categories found to seed.');
  }

  // --- 3. Buat Products ---
  // (Kode Anda di sini sudah benar)
  const productsToCreate = allRentalProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: cleanPrice(product.price),
    description: product.description,
    imageUrl: product.image, 
    category: product.category,
    ratingAvg: product.rating,
    reviewsCount: product.reviews,
    trending: product.trending,
    location: product.location,
    period: product.period,
    sellerId: product.seller.id,
  }));

  await prisma.product.createMany({
    data: productsToCreate,
  });
  console.log(`Created ${productsToCreate.length} products.`);

  // --- 4. Buat Promotions ---
  // (Kode Anda di sini sudah benar)
  console.log('Seeding promotions...');
  await prisma.promotion.createMany({
    data: [
      {
        title: 'Kebutuhan Pesta & Acara',
        imageUrl: 'https://images.unsplash.com/photo-1512413316938-091a0c03c6cc?q=80&w=1974&auto=format&fit=crop',
        query: 'pesta',
      },
      {
        title: 'Sewa Alat Kemping Lengkap',
        imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop',
        query: 'kemping',
      },
      {
        title: 'Perkakas untuk Proyek Anda',
        imageUrl: 'https://images.unsplash.com/photo-1582211594532-2d0f4d7f0dbf?q=80&w=2070&auto=format&fit=crop',
        query: 'perkakas',
      },
    ],
    skipDuplicates: true,
  });
  console.log('Created promotions.');

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