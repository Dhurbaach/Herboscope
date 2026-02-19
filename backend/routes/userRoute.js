//add authentication middleware
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { jwtAuthMiddleware, generateToken } = require('../jwt');

//check if the admin role exists
const adminExists = async () => {
    try {
        const admin = await User.findOne({ role: 'admin' });
        return !!admin;
    } catch (err) {
        console.error(err);
    }
}

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find the user by email (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const safeUser = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };

        res.status(200).json({
            id: user._id,
            user: safeUser,
            token: generateToken(user._id)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        const normalizedRole = role === 'admin' ? 'admin' : 'user';

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        if (normalizedRole === 'admin' && await adminExists()) {
            return res.status(403).json({ message: 'Admin already exists' });
        }

        const newUser = new User({ fullName, email, password, role: normalizedRole });
        await newUser.save();

        res.status(201).json({
            id: newUser._id,
            newUser: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
            },
            token: generateToken(newUser._id)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        // jwtAuthMiddleware attaches the user document to req.user
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const safeUser = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };

        res.status(200).json(safeUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;