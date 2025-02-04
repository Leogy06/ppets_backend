import { configDotenv } from "dotenv";
import express from "express";

configDotenv();

const app = express();

const port = process.env.PORT || 8080;

const startServer = () => {
  app.listen(port, () => {
    console.log(`App is running on port: ${port}`);
  });
};

startServer();
