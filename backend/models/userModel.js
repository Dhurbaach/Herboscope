const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {

        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (email) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
            },
            message: "Please enter a valid email address"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    }
})
module.exports = mongoose.model('User', userSchema);