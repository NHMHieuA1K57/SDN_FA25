const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// load models
const Course = require(path.join(__dirname, '..', 'models', 'Course'));
const Category = require(path.join(__dirname, '..', 'models', 'Category'));

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Connected. Clearing existing courses...');
  await Course.deleteMany({});

  // Fetch categories to map names to ObjectIds
  const categories = await Category.find({});
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  const courses = [
    {
      instructorId: 'inst_01',
      instructorName: 'Nguyen Van A',
      date: new Date(),
      title: 'Introduction to Node.js',
      category: categoryMap['Programming'],
      level: 'Beginner',
      primaryLanguage: 'Vietnamese',
      subtitle: 'Build backend apps with Node.js',
      description: 'A practical course covering basics of Node.js, Express and MongoDB.',
      image: 'https://placehold.co/600x400?text=Node.js',
      welcomeMessage: 'Welcome to Node.js course — let\'s build something!',
      pricing: 199000,
      objectives: 'Understand Node runtime; build REST APIs; connect to MongoDB',
      students: [
        {
          studentId: 'stu_01',
          studentName: 'Tran Thi B',
          studentEmail: 'tranb@example.com',
          paidAmount: '199000'
        }
      ],
      curriculum: [
        { title: 'Setup and Hello World', videoUrl: 'https://example.com/video1', public_id: '', freePreview: true },
        { title: 'Modules and NPM', videoUrl: 'https://example.com/video2', public_id: '', freePreview: false },
        { title: 'Express Basics', videoUrl: 'https://example.com/video3', public_id: '', freePreview: false }
      ],
      isPublised: true
    },

    {
      instructorId: 'inst_02',
      instructorName: 'Le Thi C',
      date: new Date(),
      title: 'React Fundamentals',
      category: categoryMap['Programming'], // Changed from 'Frontend' to 'Programming'
      level: 'Intermediate',
      primaryLanguage: 'English',
      subtitle: 'Build reactive UIs with React',
      description: 'Learn components, hooks, state management and routing.',
      image: 'https://placehold.co/600x400?text=React',
      welcomeMessage: 'Start building modern UIs with React!',
      pricing: 249000,
      objectives: 'Create components, hooks, and single page apps',
      students: [],
      curriculum: [
        { title: 'JSX and Components', videoUrl: 'https://example.com/r1', public_id: '', freePreview: true },
        { title: 'State & Props', videoUrl: 'https://example.com/r2', public_id: '', freePreview: false }
      ],
      isPublised: false
    },

    {
      instructorId: 'inst_03',
      instructorName: 'Pham D',
      date: new Date(),
      title: 'Introduction to Data Science',
      category: categoryMap['Data Science'], // Changed from 'Data' to 'Data Science'
      level: 'Beginner',
      primaryLanguage: 'English',
      subtitle: 'Data analysis and basics of ML',
      description: 'An overview of data science tools, pandas, numpy and introductory ML concepts.',
      image: 'https://placehold.co/600x400?text=Data+Science',
      welcomeMessage: 'Discover data science and machine learning fundamentals.',
      pricing: 0,
      objectives: 'Data wrangling, visualization and simple models',
      students: [],
      curriculum: [
        { title: 'Introduction to Python for Data', videoUrl: 'https://example.com/ds1', public_id: '', freePreview: true }
      ],
      isPublised: true
    }
  ];

  const inserted = await Course.insertMany(courses);
  console.log(`Inserted ${inserted.length} courses.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Seed complete.');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
