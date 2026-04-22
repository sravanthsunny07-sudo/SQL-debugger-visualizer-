import express from "express";
import executeQueryRouter from "./routes/executeQuery.js";
import healthRouter from "./routes/health.js";

const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use("/execute-query", executeQueryRouter);

export default app;
