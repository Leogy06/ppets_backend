import { config } from "dotenv";
import { Sequelize } from "sequelize";

config({ path: ".env.local" });

const { DB_NAME, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const db_password = DB_PASSWORD;
const db_host = DB_HOST;
const db_port = Number(DB_PORT);
const db_name = String(DB_NAME);

const sequelize = new Sequelize(db_name, "root", db_password, {
  host: db_host,
  dialect: "mysql",
  port: db_port,
});

sequelize
  .authenticate()
  .then(() => console.log("\x1b[32m\x1b[1m✔ Connected to MySQL \x1b[0m"))
  .catch((err) =>
    console.error("\x1b[31m\x1b[1m✖ Unable to connect database: \x1b[0m", err)
  );

export default sequelize;
