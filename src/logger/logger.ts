import { createLogger, format, transports } from "winston";

//destructure format
const { combine, timestamp, printf, colorize } = format;

export const logger = createLogger({
  level: "info",
  format: combine(
    colorize(), //add color to log levels
    timestamp(),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] :${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    // new transports.File({
    //   filename: "logs/error.log",
    //   level: "error",
    //   format: format.json(),
    // }),
    // new transports.File({
    //   filename: "logs/combined.log",
    //   format: format.json(),
    // }),
  ],
});
