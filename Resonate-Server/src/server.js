import cluster from "cluster";
import os from "os";
import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startFitnessSync } from "./cron/fitnessSync.js";

const PORT = process.env.PORT || 3000;

// Use all CPU cores in production; single process in dev
const NUM_WORKERS =
    process.env.NODE_ENV === "production" ? os.cpus().length : 1;

if (cluster.isPrimary && NUM_WORKERS > 1) {
    console.log(
        `Primary ${process.pid} — spawning ${NUM_WORKERS} workers across ${NUM_WORKERS} CPU cores`
    );
    startFitnessSync();

    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.warn(
            `Worker ${worker.process.pid} exited (code=${code}, signal=${signal}). Restarting...`
        );
        cluster.fork(); // Auto-restart any crashed workers
    });
} else {
    // Worker process (or single dev process)
    if (NUM_WORKERS === 1) {
        startFitnessSync();
    }
    await connectDB();
    app.listen(PORT, () =>
        console.log(`Worker ${process.pid} listening on port ${PORT}`)
    );
}
