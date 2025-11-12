require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

// load Category model
const Category = require(path.join(__dirname, '..', 'models', 'Category'));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdn_dev';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Connected. Clearing existing categories...');
  await Category.deleteMany({});

  const categories = [
    {
      name: 'Programming',
      description: 'Courses related to software development and coding.',
      slug: 'programming',
      order: 1,
      status: 'active'
    },
    {
      name: 'Design',
      description: 'Graphic design, UI/UX, and creative courses.',
      slug: 'design',
      order: 2,
      status: 'active'
    },
    {
      name: 'Business',
      description: 'Entrepreneurship, management, and business skills.',
      slug: 'business',
      order: 3,
      status: 'active'
    },
    {
      name: 'Marketing',
      description: 'Digital marketing, SEO, and advertising strategies.',
      slug: 'marketing',
      order: 4,
      status: 'active'
    },
    {
      name: 'Data Science',
      description: 'Data analysis, machine learning, and AI courses.',
      slug: 'data-science',
      order: 5,
      status: 'active'
    },
    {
      name: 'Language',
      description: 'Foreign language learning courses.',
      slug: 'language',
      order: 6,
      status: 'active'
    }
  ];

  const inserted = await Category.insertMany(categories);
  console.log(`Inserted ${inserted.length} categories.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Seed complete.');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});