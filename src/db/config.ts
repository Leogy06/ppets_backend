import { config } from "dotenv";
import { Dialect, Sequelize } from "sequelize";

// Determine which .env file to load
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
config({ path: ".env" });

const { DB_NAME, DB_DIALECT, DB_PASSWORD, DB_HOST, DB_PORT, DB_USERNAME } =
  process.env;

const db_password = String(DB_PASSWORD);
const db_host = DB_HOST;
const db_port = Number(DB_PORT);
const db_name = String(DB_NAME);
const db_username = String(DB_USERNAME);
const db_dialect = DB_DIALECT as Dialect;

const sequelize = new Sequelize(db_name, db_username, db_password, {
  host: db_host,
  port: db_port,
  dialect: db_dialect,
});

sequelize
  .authenticate()
  .then(() => console.log("\x1b[32m\x1b[1m✔ Connected to MySQL \x1b[0m"))
  .catch((err) =>
    console.error("\x1b[31m\x1b[1m✖ Unable to connect database: \x1b[0m", err)
  );

export default sequelize;
