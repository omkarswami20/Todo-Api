const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../../config/db');

const signupService = async ({ name, email, password, phone }) => {
    
    const existingEmail = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (existingEmail) {
        throw new Error('Email already exists');
    } 

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone
        }
    });

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    ); 

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };

}; // ← function yahan band hota hai

// ✅ module.exports BAHAR hona chahiye
module.exports = {
    signupService,
};