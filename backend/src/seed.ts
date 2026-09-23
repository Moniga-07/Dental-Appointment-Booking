import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@dental.com' },
    update: {},
    create: {
      email: 'admin@dental.com',
      password: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
    },
  });

  // Create Services
  const services = [
    { name: 'Teeth Cleaning', description: 'Comprehensive dental cleaning and polishing.', duration: 30, price: 50 },
    { name: 'Root Canal', description: 'Endodontic therapy to treat infection.', duration: 90, price: 400 },
    { name: 'Teeth Whitening', description: 'Professional laser teeth whitening.', duration: 60, price: 150 },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
       await prisma.service.create({ data: s });
    }
  }

  // Create Doctors
  const docPassword = await bcrypt.hash('doctor123', 10);
  
  const doctors = [
    {
      email: 'dr.smith@dental.com', name: 'Dr. John Smith', specialty: 'Endodontist', experience: 10,
      biography: 'Expert in root canals and complex restorative dentistry.', consultationFee: 100, profilePhoto: '/images/dr_john.png'
    },
    {
      email: 'dr.emily@dental.com', name: 'Dr. Emily Chen', specialty: 'Orthodontist', experience: 8,
      biography: 'Specializes in clear aligners and traditional braces for perfect smiles.', consultationFee: 80, profilePhoto: '/images/dr_emily.png'
    },
    {
      email: 'dr.michael@dental.com', name: 'Dr. Michael Davis', specialty: 'Pediatric Dentist', experience: 12,
      biography: 'Dedicated to providing gentle and fun dental care for children.', consultationFee: 75, profilePhoto: '/images/dr_michael.png'
    }
  ];

  for (const doc of doctors) {
    let doctorUser = await prisma.user.findUnique({ where: { email: doc.email } });
    if (!doctorUser) {
      await prisma.user.create({
        data: {
          email: doc.email,
          password: docPassword,
          name: doc.name,
          role: 'DOCTOR',
          doctor: {
            create: {
              specialty: doc.specialty,
              experience: doc.experience,
              biography: doc.biography,
              consultationFee: doc.consultationFee,
              profilePhoto: doc.profilePhoto,
              availabilities: {
                create: [
                  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
                  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
                  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
                  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
                  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
                ]
              }
            }
          }
        }
      });
    } else {
      await prisma.profileDoctor.update({
        where: { userId: doctorUser.id },
        data: { profilePhoto: doc.profilePhoto }
      });
    }
  }

  // Create Patient
  const patientPassword = await bcrypt.hash('patient123', 10);
  await prisma.user.upsert({
    where: { email: 'jane.doe@example.com' },
    update: {},
    create: {
      email: 'jane.doe@example.com',
      password: patientPassword,
      name: 'Jane Doe',
      role: 'PATIENT',
      patient: {
        create: {
          whatsappNumber: '+1234567890'
        }
      }
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
