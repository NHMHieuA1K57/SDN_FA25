const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// load StudentCourses model
const StudentCourses = require(path.join(__dirname, '..', 'models', 'StudentCourses'));

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Connected. Clearing existing student courses...');
  await StudentCourses.deleteMany({});

  const studentCourses = [
    {
      userId: '690b00101319d74a78c08303', // Using the provided ObjectId
      courses: [
        {
          courseId: 'course_01',
          title: 'Introduction to Node.js',
          instructorId: 'inst_01',
          instructorName: 'Nguyen Van A',
          dateOfPurchase: new Date(),
          courseImage: 'https://placehold.co/600x400?text=Node.js',
        }
      ]
    },
    {
      userId: 'stu_02',
      courses: [
        {
          courseId: 'course_02',
          title: 'React Fundamentals',
          instructorId: 'inst_02',
          instructorName: 'Le Thi C',
          dateOfPurchase: new Date(),
          courseImage: 'https://placehold.co/600x400?text=React',
        }
      ]
    }
  ];

  const inserted = await StudentCourses.insertMany(studentCourses);
  console.log(`Inserted ${inserted.length} student courses.`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Seed complete.');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});