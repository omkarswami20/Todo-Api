// config/db.js
const { PrismaClient } = require('@prisma/client'); // YE MISSING THA
const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully! Bro !!!!!');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

module.exports = { prisma, connectDB }; // YE BHI MISSING THA