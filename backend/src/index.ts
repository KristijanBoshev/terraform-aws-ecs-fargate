import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/test", (_req: Request, res: Response) => {
  res.json({ message: "Test endpoint reached", random: Math.random() });
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
