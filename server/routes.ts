import type { Express } from "express";
import { createServer, type Server } from "http";
import askRouter from "./routes/ask";
import searchRouter from "./routes/search";
import fetchRouter from "./routes/fetch";
import answerRouter from "./routes/answer";
import logsRouter from "./routes/logs";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/api/ask', askRouter);
  app.use('/api/search-openalex', searchRouter);
  app.use('/api/fetch-openalex', fetchRouter);
  app.use('/api/answer', answerRouter);
  app.use('/api/logs', logsRouter);

  const httpServer = createServer(app);

  return httpServer;
}
