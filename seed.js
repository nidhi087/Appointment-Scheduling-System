require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./backend/models/User');
const Category = require('./backend/models/Category');
const Provider = require('./backend/models/Provider');
const Slot = require('./backend/models/Slot');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Provider.deleteMany({}),
    Slot.deleteMany({})
  ]);
  console.log('🗑️  Cleared old data');

  // ── Categories ──────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Healthcare',  icon: '❤️‍🩹', description: 'Doctors, dentists, therapists & more', color: 'rgba(239,68,68,0.12)' },
    { name: 'Beauty',      icon: '💅',    description: 'Salons, spas, skin care & wellness',   color: 'rgba(236,72,153,0.12)' },
    { name: 'Education',   icon: '📚',    description: 'Tutors, coaches & skill trainers',     color: 'rgba(56,189,248,0.12)' },
    { name: 'Consulting',  icon: '💼',    description: 'Legal, finance & business advisors',   color: 'rgba(245,158,11,0.12)' }
  ]);
  console.log('✅ Categories seeded');

  const [healthcare, beauty, education, consulting] = categories;

  // ── Providers ────────────────────────────────────────────────
  const providers = await Provider.insertMany([
    { name: 'Dr. Aisha Sharma',    specialization: 'General Physician',     category: healthcare._id, rating: 4.9, experienceYears: 12, fee: 600, bio: 'MBBS, MD. Experienced in primary care & preventive medicine.', avatarEmoji: '👩‍⚕️' },
    { name: 'Dr. Rahul Nair',      specialization: 'Dentist',               category: healthcare._id, rating: 4.7, experienceYears: 8,  fee: 500, bio: 'Specialist in cosmetic and restorative dentistry.', avatarEmoji: '🦷' },
    { name: 'Dr. Priya Mehta',     specialization: 'Mental Health Therapist',category: healthcare._id, rating: 4.8, experienceYears: 10, fee: 800, bio: 'Certified psychologist focusing on anxiety and depression.', avatarEmoji: '🧠' },
    { name: 'Salon by Natasha',    specialization: 'Hair & Skin Care',       category: beauty._id,     rating: 4.6, experienceYears: 6,  fee: 350, bio: 'Premium salon services for hair, skin and nails.', avatarEmoji: '💇‍♀️' },
    { name: 'Glow Spa',            specialization: 'Spa & Wellness',         category: beauty._id,     rating: 4.5, experienceYears: 4,  fee: 700, bio: 'Relaxing spa treatments and wellness therapies.', avatarEmoji: '🧖‍♀️' },
    { name: 'Prof. Amit Kumar',    specialization: 'Mathematics & Physics',  category: education._id,  rating: 4.8, experienceYears: 15, fee: 400, bio: 'IIT alumnus offering expert tutoring for Class 10–12 & JEE.', avatarEmoji: '📐' },
    { name: 'Sana English Classes', specialization: 'English Language Coach', category: education._id, rating: 4.7, experienceYears: 9,  fee: 300, bio: 'Spoken English, IELTS prep and communication skills.', avatarEmoji: '🗣️' },
    { name: 'LexAdvise LLP',       specialization: 'Legal Consulting',       category: consulting._id, rating: 4.9, experienceYears: 20, fee: 1500, bio: 'Senior legal advisors for corporate and civil matters.', avatarEmoji: '⚖️' }
  ]);
  console.log('✅ Providers seeded');

  // ── Slots (next 14 days for each provider) ───────────────────
  const times = [
    '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
    '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM',
    '05:00 PM','05:30 PM','06:00 PM','06:30 PM'
  ];

  const slotsToInsert = [];
  const today = new Date();

  for (const provider of providers) {
    for (let d = 0; d < 14; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      for (const time of times) {
        slotsToInsert.push({ provider: provider._id, date: dateStr, time, isBooked: false });
      }
    }
  }

  await Slot.insertMany(slotsToInsert);
  console.log(`✅ ${slotsToInsert.length} slots seeded`);

  // ── Users ────────────────────────────────────────────────────
  await User.create([
    { name: 'Admin',      email: 'admin@appointease.com', password: 'admin123',  role: 'admin' },
    { name: 'Test User',  email: 'user@test.com',          password: 'user123',   role: 'user'  }
  ]);
  console.log('✅ Users seeded');
  console.log('\n🎉 Database seeded successfully!');
  console.log('   Admin → admin@appointease.com / admin123');
  console.log('   User  → user@test.com / user123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
