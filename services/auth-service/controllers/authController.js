const { signupService, loginService  } = require('../services/authService');

const signup = async (req, res) => {
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

//  LOGIN CONTROLLER
const login = async (req, res) => {
    try {
        // Step 1 — Request se data nikalo
        const { email, password } = req.body;

        // Step 2 — Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email aur password required hai'
            });
        }

        // Step 3 — Service ko call karo
        const result = await loginService({ email, password });

        // Step 4 — Success response
        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { signup, login };
