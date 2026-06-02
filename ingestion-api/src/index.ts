import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { ingestEvent } from "./controllers/ingest";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // If there's no origin (e.g., mobile apps, curl, or same-origin requests), allow it
      if (!origin) {
        return callback(null, true);
      }

      // Instead of '*', we dynamically allow the incoming origin.
      callback(null, true);
    },
    credentials: true, // This allows the 'include' credentials mode from your client SDK
    methods: ["POST", "OPTIONS"], // Ingestion only needs POST and the preflight OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.text()); // Fallback for sendBeacon (sometimes sends as text)

// Handle navigator.sendBeacon() edge cases where browsers might send text strings
const parseBeacon = (req: Request, _res: Response, next: NextFunction) => {
  if (typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
};

// Routes
app.post("/ingest", parseBeacon, ingestEvent);

app.get("/health", (_req, res) => res.status(200).send("OK"));

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Ingestion Gateway running on port ${PORT}`);
});
