import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { default as admin } from 'firebase-admin';

// Initialize firebase admin if not already
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
    });
} catch (e) { }

import { InsightsEngine } from './src/services/insights/insights.engine.js';
import { memoryService } from './src/services/memory/memoryService.singleton.js';

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Get the user ID from the database or just use a known test one
    // Let's just find the first user in the system to test
    const db = mongoose.connection.db;
    const user = await db.collection('users').findOne({});
    if (!user) {
        console.log("No users found in database.");
        process.exit(0);
    }
    const userId = user.firebaseUid;
    console.log(`Testing insights for user: ${userId} (${user.email})`);

    const engine = new InsightsEngine();

    console.log("Building Context...");
    const context = await engine.contextBuilder.buildMemoryContext(userId, 'insights');
    console.log("Memory Context Built:");
    console.log(JSON.stringify(context, null, 2));

    console.log("\nGenerating Insights...");
    const insights = await engine.generateInsights(userId);
    console.log("Insights Generated:");
    console.log(JSON.stringify(insights, null, 2));

    process.exit(0);
}
run().catch(console.error);
