import dotenv from "dotenv";

dotenv.config();

export default {
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  COOKIE_NAME: process.env.COOKIE_NAME,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_ID: process.env.ADMIN_ID,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
 
};