import axios from 'axios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';

// Quick manual parse to guarantee MONGODB_URI is loaded
const envContent = fs.readFileSync('.env', 'utf8');
const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
const dbUri = mongoLine.split('=')[1].trim();
const secretLine = envContent.split('\n').find(line => line.startsWith('JWT_SECRET='));
const secret = secretLine ? secretLine.split('=')[1].trim() : 'secret';

process.env.INTERNAL_API_SECRET = envContent.split('\n').find(line => line.startsWith('INTERNAL_API_SECRET=')).split('=')[1].trim();

async function run() {
    try {
        console.log("Connecting to:", dbUri);
        await mongoose.connect(dbUri);
        const user = await mongoose.connection.db.collection('users').findOne({});
        if (!user) {
            console.log("No user found.");
            return;
        }

        const token = jwt.sign({ id: user._id }, secret);

        console.log(`Fetching AI Dashboard for user ${user._id}...`);
        const res = await axios.get('http://localhost:5000/api/dashboard/summary', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("------------------------");
        console.log("Health Score:", res.data.healthScore);
        console.log("Breakdown:", res.data.healthScoreBreakdown);
        console.log("Recovery:", res.data.recoveryStatus);
        console.log("Rec. Narrative:", res.data.recoveryNarrative);
        console.log("Training Bal.:", res.data.trainingBalance);
        console.log("Weekly Narrative:", res.data.weeklyNarrative);
        console.log("------------------------");
        console.log("\nSuccess!");

    } catch (e) {
        console.error("Error:", e.response ? JSON.stringify(e.response.data) : e.message);
    } finally {
        await mongoose.disconnect();
    }
}
run();
