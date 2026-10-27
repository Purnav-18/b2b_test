require("dotenv").config();

const cors = require("cors");
const express = require("express");
const leadRoutes = require("./routes/leadRoutes");
const connectDB = require("./config/db");

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN;

app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json({ limit: "20kb" }));
app.use("/api/leads", leadRoutes);
app.use("/api/contacts", leadRoutes);
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use((error, _req, res, _next) => {
    console.error("Request failed:", error.message);
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Request body must contain valid JSON." });
    }
    return res.status(500).json({ message: "An unexpected server error occurred." });
});

async function startServer() {
    await connectDB();
    const port = Number(process.env.PORT) || 3001;
    return app.listen(port, () => {
        console.log(`Lead API listening on port ${port}`);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Unable to start the API:", error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, startServer };
