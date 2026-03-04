import mongoose from 'mongoose';
import { DashboardCache } from './src/models/DashboardCache.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const caches = await DashboardCache.find();
        console.log("Dashboard caches:", caches);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
