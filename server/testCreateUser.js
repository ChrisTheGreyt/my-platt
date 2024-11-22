const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testCreateUser = async () => {
  try {
    const newUser = await prisma.user.create({
      data: {
        cognitoId: 'se4981468-d051-70d5-a109-6c96320f29wc',
        username: 'aponexs3s',
        email: 'aponex2s@gmail.com',
        firstName: 'Chris23s',
        lastName: 'Grey23s',
        profilePictureUrl: 'https://main.d249lhj5v2utjs.amplifyapp.com/pd1.jpg',
        teamId: 1, // Replace with an actual teamId from your database if it's a foreign key
      },
    });

    console.log('User created successfully:', newUser);
  } catch (error) {
    console.error('Error while creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
};

testCreateUser();
