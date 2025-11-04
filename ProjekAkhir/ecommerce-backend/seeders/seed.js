const { PrismaClient } = require('@prisma/client');
const { allRentalProducts } = require('./data.js'); 

const prisma = new PrismaClient();

function cleanPrice(priceString) {
  if (!priceString) return 0;
  return parseFloat(priceString.replace(/Rp /g, '').replace(/\./g, ''));
}

async function main() {
  console.log('Start seeding ...');
  await prisma.product.deleteMany({});
  await prisma.seller.deleteMany({});
  console.log('Deleted old data.');

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
  const productsToCreate = allRentalProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: cleanPrice(product.price),
    description: product.description,
    imageUrl: product.image, 
    category: product.category,
    rating: product.rating,
    reviews: product.reviews,
    trending: product.trending,
    location: product.location,
    period: product.period,
    sellerId: product.seller.id,
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