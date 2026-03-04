import axios from 'axios';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const parseEnv = (key) => envText.split('\n').find(l => l.startsWith(key + '='))?.split('=')[1].trim();
const secret = parseEnv('JWT_SECRET');

const token = jwt.sign({ id: '650c8fa21e2c140df8e8aab5' }, secret || 'notastring');

axios.get('http://localhost:5000/api/dashboard/summary', {
    headers: { Authorization: `Bearer ${token}` }
}).then(r => {
    console.log("HEALTH SCORE:", r.data.healthScore);
    console.log("BREAKDOWN:", r.data.healthScoreBreakdown);
    console.log("RECOVERY:", r.data.recoveryStatus);
    console.log("NARRATIVE:", r.data.weeklyNarrative);
}).catch(e => {
    console.error("FAIL:", e.response?.data || e.message);
});
