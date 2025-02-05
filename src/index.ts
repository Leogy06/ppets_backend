import { config } from "dotenv";
import express from "express";
import sequilize from "./db/config.ts";
import employee_routes from "./routes/employee_routes.ts";
import cors from "cors";

config();

const app = express();

const port = process.env.PORT || 8080;

//middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all origins
app.use(cors());
const startServer = () => {
  //creates table in db base on our models
  sequilize.sync().then(() => {
    console.log("All models were synchronized succesfully.");
  });

  app.use("/employees", employee_routes);

  app.listen(port, () => {
    console.log(`\x1b[32m\x1b[1m✔ App is running on port: ${port}\x1b[0m`);
  });
};

startServer();
