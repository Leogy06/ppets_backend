import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { protectRoute } from "./middlewares/auth.js";
import { logger } from "./logger/logger.js";

// Import routes
import employee_routes from "./routes/employee_routes.js";
import user_routes from "./routes/user_routes.js";
import department_routes from "./routes/department_routes.js";
import item_category_routes from "./routes/item_category_routes.js";
import user_type_routes from "./routes/user_type_routes.js";
import processingStatus_routes from "./routes/processingStatus_routes.js";
import notification_routes from "./routes/notifcation_routes.js";
import distributedItem_routes from "./routes/distributedItem_routes.js";
import item_routes from "./routes/item_routes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import pdfKitRoutes from "./routes/pdfKitRoutes.js";
import accountItemRoutes from "./routes/accountItem_routes.js";

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// CORS setup
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/employees", protectRoute, employee_routes);
app.use("/departments", protectRoute, department_routes);
app.use("/user", user_routes);
app.use("/item", protectRoute, distributedItem_routes);
app.use("/item-category", protectRoute, item_category_routes);
app.use("/transaction", protectRoute, transactionRoutes);
app.use("/user_type", user_type_routes);
app.use("/status_process", protectRoute, processingStatus_routes);
app.use("/notification", protectRoute, notification_routes);
app.use("/api/item", protectRoute, item_routes);
app.use("/api/pdfkit", protectRoute, pdfKitRoutes);
app.use("/account_code", protectRoute, accountItemRoutes);

export default app; // Export app (without starting the server)
