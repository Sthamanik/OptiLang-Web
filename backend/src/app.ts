import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "@middlewares/errorHandler.middleware.js";

const app: Application = express();

// App configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.urlencoded({limit: "50mb", extended: true}));
app.use(express.json({limit: "50mb"}))

// Routes import
// use this portion to import the route

// Health check endpoint
app.get("/health", (_, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Api routes initialization
// Initialize the imported routes here

// 404 handler for error routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// error handling middleware
app.use(errorHandler)

export default app;