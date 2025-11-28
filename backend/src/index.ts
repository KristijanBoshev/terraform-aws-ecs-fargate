import cors from "cors";
import express, { Request, Response } from "express";
import prisma from "./prisma.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/test", async (_req: Request, res: Response) => {
  try {
    const randomValue = Number(Math.random().toFixed(6));
    const record = await prisma.randomResult.create({
      data: { value: randomValue },
    });

    res.json({
      message: "Test endpoint reached",
      random: record.value,
      id: record.id,
      createdAt: record.createdAt,
    });
  } catch (error) {
    console.error("Failed to persist random value", error);
    res.status(500).json({ error: "Unable to save random value" });
  }
});

app.get("/history", async (req: Request, res: Response) => {
  const limitParam = Number(req.query.limit);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 50)
    : 10;

  try {
    const results = await prisma.randomResult.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json({ count: results.length, results });
  } catch (error) {
    console.error("Failed to load history", error);
    res.status(500).json({ error: "Unable to fetch history" });
  }
});

app.get("/info", (_req: Request, res: Response) => {
  res.json({
    service: "simple-backend",
    version: "1.0.0",
    docs: "https://expressjs.com/en/api.html",
  });
});

app.listen(port, () => {
  console.log(`API ready on http://localhost:${port}`);
});
