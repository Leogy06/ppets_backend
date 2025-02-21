import { config } from "dotenv";
import express from "express";
import sequilize from "./db/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { protectRoute } from "./middlewares/auth.js";
import { createServer } from "http";
import socketManager from "./sockets/socketManager.js";
import { Server } from "socket.io";

//import routes
import employee_routes from "./routes/employee_routes.js";
import user_routes from "./routes/user_routes.js";
import department_routes from "./routes/department_routes.js";
import item_routes from "./routes/item_routes.js";
import item_category_routes from "./routes/item_category_routes.js";
import borrowing_routes from "./routes/borrowing_routes.js";
import user_type_routes from "./routes/user_type_routes.js";
import processingStatus_routes from "./routes/processingStatus_routes.js";
import notification_routes from "./routes/notifcation_routes.js";
<<<<<<< HEAD

=======
import itemStatus_route from "./routes/item_status.js";
>>>>>>> 266c9a77b45b0cd26293e343f5c2b5eccf92a43c
config();

const app = express();

const port = process.env.PORT || 8080;

//create http server
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  },
});

//middleware to parse JSON bodies
app.use(express.json());

//http cookie parser
app.use(cookieParser());

// Enable CORS for specific origins and credentials
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

//attach io to request so controller can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

//web socket logic
socketManager(io);

//routes
//employee routes
app.use("/employees", protectRoute, employee_routes);

//department routes
app.use("/departments", protectRoute, department_routes);

//user routes
app.use("/user", user_routes);

//item routes
app.use("/item", protectRoute, item_routes);

//item category
app.use("/item-category", protectRoute, item_category_routes);

//borrowing
app.use("/borrowing", protectRoute, borrowing_routes);

//user type
app.use("/user_type", user_type_routes);

//status process
app.use("/status_process", protectRoute, processingStatus_routes);

//notfication
app.use("/notification", protectRoute, notification_routes);

const startServer = () => {
  //synchronize model's prop with db's table column
  sequilize.sync().then(() => {
    console.log(
      "\x1b[32m\x1b[1m✔ All models were synchronized succesfully.\x1b[0m"
    );
  });

<<<<<<< HEAD
=======
  //employee routes
  app.use("/employees", protectRoute, employee_routes);

  //department routes
  app.use("/departments", protectRoute, department_routes);

  //user routes
  app.use("/user", user_routes);

  //item routes
  app.use("/item", protectRoute, item_routes);

  //item category
  app.use("/item-category", protectRoute, item_category_routes);

  //borrowing
  app.use("/borrowing", protectRoute, borrowing_routes);

  //user type
  app.use("/user_type", user_type_routes);

  //status process
  app.use("/status_process", protectRoute, processingStatus_routes);

  //notfication
  app.use("/notification", protectRoute, notification_routes);

  //item status
  app.use("/item-status", protectRoute, itemStatus_route);

>>>>>>> 266c9a77b45b0cd26293e343f5c2b5eccf92a43c
  app.listen(port, () => {
    console.log(`\x1b[32m\x1b[1m✔ App is running on port: ${port}\x1b[0m`);
  });
};

//starting the server
startServer();
