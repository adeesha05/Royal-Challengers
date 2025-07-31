const { connectDB, disconnectDB } = require('./config/database');
const Staff = require('./models/Staff');
require('dotenv').config();

const teamMembers = [
  {
    name: 'U.Malshika',
    title: 'Founder & Lead Photographer',
    email: 'malshika@globalimage.com',
    phone: '+94 11 234 5678',
    photo: '/GI_logo.png',
    description: 'Over 15 years of experience in event and corporate photography. Specializes in corporate events and professional headshots.',
    hourlyRate: 75,
    specializations: ['Corporate Events', 'Professional Headshots', 'Event Photography'],
    isActive: true
  },
  {
    name: 'D.gamage',
    title: 'Senior Photographer',
    email: 'gamage@globalimage.com',
    phone: '+94 11 234 5679',
    photo: '/GI_logo.png',
    description: 'Specializes in concert photography and dynamic event coverage.',
    hourlyRate: 65,
    specializations: ['Concert Photography', 'Dynamic Events', 'Live Performance'],
    isActive: true
  },
  {
    name: 'R.liyange',
    title: 'Senior Photographer',
    email: 'liyange@globalimage.com',
    phone: '+94 11 234 5680',
    photo: '/GI_logo.png',
    description: 'Expert in graduation ceremonies and large group event coverage.',
    hourlyRate: 65,
    specializations: ['Graduation Ceremonies', 'Large Group Events', 'Academic Events'],
    isActive: true
  },
  {
    name: 'S.Dilki',
    title: 'Photographer & Editor',
    email: 'dilki@globalimage.com',
    phone: '+94 11 234 5681',
    photo: '/GI_logo.png',
    description: 'Specializes in corporate events photography.',
    hourlyRate: 60,
    specializations: ['Corporate Events', 'Photo Editing', 'Post-Production'],
    isActive: true
  },
  {
    name: 'A.Perera',
    title: 'Photographer',
    email: 'perera@globalimage.com',
    phone: '+94 11 234 5682',
    photo: '/GI_logo.png',
    description: 'Experienced in wedding and family event photography.',
    hourlyRate: 55,
    specializations: ['Wedding Photography', 'Family Events', 'Portrait Photography'],
    isActive: true
  },
  {
    name: 'K.Silva',
    title: 'Editor',
    email: 'silva@globalimage.com',
    phone: '+94 11 234 5683',
    photo: '/GI_logo.png',
    description: 'Expert in post-production and photo editing.',
    hourlyRate: 50,
    specializations: ['Photo Editing', 'Post-Production', 'Color Correction'],
    isActive: true
  },
  {
    name: 'N.Jayasinghe',
    title: 'Assistant Photographer',
    email: 'jayasinghe@globalimage.com',
    phone: '+94 11 234 5684',
    photo: '/GI_logo.png',
    description: 'Supports event shoots and equipment setup.',
    hourlyRate: 40,
    specializations: ['Equipment Setup', 'Event Support', 'Assistant Photography'],
    isActive: true
  },
  {
    name: 'T.Fernando',
    title: 'Photographer',
    email: 'fernando@globalimage.com',
    phone: '+94 11 234 5685',
    photo: '/GI_logo.png',
    description: 'Specializes in outdoor and nature photography.',
    hourlyRate: 55,
    specializations: ['Outdoor Photography', 'Nature Photography', 'Landscape Photography'],
    isActive: true
  }
];

async function seedStaff() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing staff data
    await Staff.deleteMany({});
    console.log('Cleared existing staff data');

    // Insert team members
    const insertedStaff = await Staff.insertMany(teamMembers);
    console.log(`Successfully seeded ${insertedStaff.length} staff members`);

    // Display seeded data
    console.log('\nSeeded Staff Members:');
    insertedStaff.forEach(staff => {
      console.log(`- ${staff.name} (${staff.title}) - ${staff.email}`);
    });

    await disconnectDB();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding staff data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedStaff(); 