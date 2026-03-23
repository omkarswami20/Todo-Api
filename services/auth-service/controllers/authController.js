const { signupService } = require('../services/authService');

const Signup = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const result = await signupService({ name, email, password, phone });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: result,
        });

    } catch (error) {
        console.error('Error in Signup controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

// ✅ YEH ADD KARO - sabse neeche!
module.exports = { Signup };