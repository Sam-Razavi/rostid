import { PrismaClient, RoastLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'single-origin' },
      update: {},
      create: {
        name: 'Single Origin',
        slug: 'single-origin',
        description: 'Traceable coffees from a single farm or region',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'blends' },
      update: {},
      create: {
        name: 'Blends',
        slug: 'blends',
        description: 'Carefully crafted blends for balance and complexity',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'decaf' },
      update: {},
      create: {
        name: 'Decaf',
        slug: 'decaf',
        description: 'All the flavour, without the caffeine',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'equipment' },
      update: {},
      create: {
        name: 'Equipment',
        slug: 'equipment',
        description: 'Tools for the perfect brew',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'subscriptions' },
      update: {},
      create: {
        name: 'Subscriptions',
        slug: 'subscriptions',
        description: 'Fresh coffee delivered monthly',
      },
    }),
  ]);

  const [singleOrigin, blends, decaf, equipment, subscriptions] = categories;

  // Products
  const products = [
    {
      name: 'Ethiopia Yirgacheffe',
      slug: 'ethiopia-yirgacheffe',
      description:
        'A classic Ethiopian washed natural from the Yirgacheffe region. Bright and floral with extraordinary complexity.',
      priceOre: 18900,
      categoryId: singleOrigin.id,
      roastLevel: RoastLevel.light,
      origin: 'Ethiopia',
      tastingNotes: 'Blueberry, jasmine, citrus',
      weightGrams: 250,
      stock: 48,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&q=80',
    },
    {
      name: 'Guatemala Antigua',
      slug: 'guatemala-antigua',
      description:
        'Grown in the volcanic highlands of Antigua. Rich and balanced with a creamy body and long finish.',
      priceOre: 17900,
      categoryId: singleOrigin.id,
      roastLevel: RoastLevel.medium,
      origin: 'Guatemala',
      tastingNotes: 'Chocolate, caramel, walnut',
      weightGrams: 250,
      stock: 52,
      imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&q=80',
    },
    {
      name: 'Kenya AA',
      slug: 'kenya-aa',
      description:
        'Top-grade Kenyan beans from Nyeri. Bold and wine-like with a striking acidity that coffee lovers seek out.',
      priceOre: 19900,
      categoryId: singleOrigin.id,
      roastLevel: RoastLevel.light,
      origin: 'Kenya',
      tastingNotes: 'Blackcurrant, tomato, citrus',
      weightGrams: 250,
      stock: 34,
      imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&q=80',
    },
    {
      name: 'Colombia Huila',
      slug: 'colombia-huila',
      description:
        'From the Huila department of southern Colombia. Smooth and sweet with a wonderfully clean finish.',
      priceOre: 17400,
      categoryId: singleOrigin.id,
      roastLevel: RoastLevel.medium,
      origin: 'Colombia',
      tastingNotes: 'Caramel, red apple, hazelnut',
      weightGrams: 250,
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&q=80',
    },
    {
      name: 'Brazil Santos',
      slug: 'brazil-santos',
      description:
        'A natural-processed Brazilian from São Paulo state. Heavy body, low acidity — the backbone of great espresso.',
      priceOre: 22900,
      categoryId: singleOrigin.id,
      roastLevel: RoastLevel.dark,
      origin: 'Brazil',
      tastingNotes: 'Peanut, dark chocolate, smoky',
      weightGrams: 500,
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=800&auto=format&q=80',
    },
    {
      name: 'Norrland Blend',
      slug: 'norrland-blend',
      description:
        'Our signature dark blend inspired by the midnight forests of northern Sweden. Bold and unapologetic.',
      priceOre: 24900,
      categoryId: blends.id,
      roastLevel: RoastLevel.dark,
      origin: null,
      tastingNotes: 'Smoky, full body, dark chocolate',
      weightGrams: 500,
      stock: 55,
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&q=80',
    },
    {
      name: 'Morgonblandning',
      slug: 'morgonblandning',
      description:
        'The perfect morning blend — easy drinking, balanced, and welcoming. Swedish for "morning blend".',
      priceOre: 21900,
      categoryId: blends.id,
      roastLevel: RoastLevel.medium,
      origin: null,
      tastingNotes: 'Balanced, nuts, mild sweetness',
      weightGrams: 500,
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&q=80',
    },
    {
      name: 'Decaf Colombia',
      slug: 'decaf-colombia',
      description:
        'Swiss water processed Colombian decaf. All the flavour of a good medium roast, without the buzz.',
      priceOre: 16900,
      categoryId: decaf.id,
      roastLevel: RoastLevel.medium,
      origin: 'Colombia',
      tastingNotes: 'Chocolate, mild fruit, clean',
      weightGrams: 250,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&q=80',
    },
    {
      name: 'Hario V60 Dripper',
      slug: 'hario-v60-dripper',
      description:
        'The iconic glass V60 dripper from Hario. The pour-over standard for specialty coffee the world over.',
      priceOre: 34900,
      categoryId: equipment.id,
      roastLevel: null,
      origin: null,
      tastingNotes: null,
      weightGrams: null,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1748895177768-b4a54b9c2954?w=800&auto=format&q=80',
    },
    {
      name: 'Timemore Hand Grinder',
      slug: 'timemore-hand-grinder',
      description:
        'Portable precision grinder with stepless adjustment and a conical steel burr. Perfect travel companion.',
      priceOre: 89900,
      categoryId: equipment.id,
      roastLevel: null,
      origin: null,
      tastingNotes: null,
      weightGrams: null,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1743410552676-569a2d0ef4a9?w=800&auto=format&q=80',
    },
    {
      name: 'Monthly Single Origin Box',
      slug: 'monthly-single-origin-box',
      description:
        'Four rotating single origin coffees delivered to your door each month. Discover the world one cup at a time.',
      priceOre: 69900,
      categoryId: subscriptions.id,
      roastLevel: null,
      origin: null,
      tastingNotes: 'Rotating single origin 4×250g',
      weightGrams: 1000,
      stock: 99,
      imageUrl: 'https://images.unsplash.com/photo-1766072866363-aaabeb462db3?w=800&auto=format&q=80',
    },
    {
      name: 'Espresso Discovery Box',
      slug: 'espresso-discovery-box',
      description:
        'Three espresso-forward blends monthly, curated for the home barista who wants to dial in the perfect shot.',
      priceOre: 54900,
      categoryId: subscriptions.id,
      roastLevel: RoastLevel.medium,
      origin: null,
      tastingNotes: '3 espresso blends monthly',
      weightGrams: 750,
      stock: 99,
      imageUrl: 'https://images.unsplash.com/photo-1748895177768-b4a54b9c2954?w=800&auto=format&q=80',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { imageUrl: product.imageUrl },
      create: product,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const adminHash = await bcrypt.hash('admin123', 12);
    const customerHash = await bcrypt.hash('password123', 12);

    await prisma.user.upsert({
      where: { email: 'admin@rostid.se' },
      update: {},
      create: {
        email: 'admin@rostid.se',
        passwordHash: adminHash,
        name: 'Admin',
        role: 'admin',
      },
    });

    await prisma.user.upsert({
      where: { email: 'customer@rostid.se' },
      update: {},
      create: {
        email: 'customer@rostid.se',
        passwordHash: customerHash,
        name: 'Test Customer',
        role: 'customer',
      },
    });
  }

  console.log('[seed] Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
