import { Schema } from "joi";
import { Request, Response, NextFunction } from "express";

const validateTransaction =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false to get all errors

    if (error) {
      res.status(400).send(error.details.map((detail) => detail.message));

      return;
    }
    next();
  };
export default validateTransaction;
