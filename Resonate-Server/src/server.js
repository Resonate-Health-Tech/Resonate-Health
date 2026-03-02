import cluster from "cluster";
import os from "os";
import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startFitnessSync } from "./cron/fitnessSync.js";

const PORT = process.env.PORT || 3000;

// Railway sets WEB_CONCURRENCY automatically based on container RAM.
// Never use os.cpus().length — it reports the host's cores (e.g. 48),
// not your container's allocation, causing catastrophic OOM kills.
const NUM_WORKERS =
    process.env.NODE_ENV === "production"
        ? Math.min(parseInt(process.env.WEB_CONCURRENCY || "1", 10), 2)
        : 1;

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
