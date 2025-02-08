import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';

configDotenv({path: ".env.local"})

const secret_token = process.env.JWT_SECRET;
if (!secret_token) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

interface User {
    id:number;
    username:string;
    password:string;
    email:string;
    is_active:number;
    role:number;
}
const generateToken = (user: User) => {
   return jwt.sign(
    {id:user.id, username:user.username},
    secret_token,
    { expiresIn:'2d' }
   )
};

export default generateToken
