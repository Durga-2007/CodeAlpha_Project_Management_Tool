const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, 'name email');
        console.log('Registered Users:');
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

listUsers();
