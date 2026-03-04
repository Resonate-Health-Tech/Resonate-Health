import axios from 'axios';
import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Load directly from .env file
const envConfig = dotenv.parse(fs.readFileSync('.env'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function testDashboard() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            process.exit(0);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123');

        console.log(`Testing dashboard for user: ${user.name} (${user.email})`);
        const response = await axios.get('http://localhost:5000/api/dashboard/summary', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error("Test failed:", error.response?.data || error.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testDashboard();
