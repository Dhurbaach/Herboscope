//add authentication middleware
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const {jwtAuthMiddleware,generateToken} = require('../jwt');
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Include password explicitly because schema sets password select:false
        const user = await User.findOne({ username }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate token
        const payload = {
            id: user.id
        };
        const token = generateToken(payload);

        // Return token as response
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
    

router.post('/register', async (req, res) => {
    try {
         // Create a new user document using the Mongoose model
        const data = req.body;
        //check if email already exists
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        // Do not generate or return a token on registration. Require explicit login to obtain a token.
        res.status(200).json({ response });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        // jwtAuthMiddleware attaches the user document to req.user
        const user = req.user;
        if (user) {
            // Return only safe fields
            const safeUser = { id: user._id, username: user.username, email: user.email };
            res.status(200).json({ user: safeUser });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;