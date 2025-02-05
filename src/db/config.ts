import { config } from "dotenv";
import { Sequelize } from "sequelize";

config();

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
  .then(() => console.log("Connected to MySQ ✅"))
  .catch((err) => console.error("Unable to connect database: ", err));

export default sequelize;
