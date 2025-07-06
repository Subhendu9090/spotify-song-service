import express from "express";
import dotenv from "dotenv";
import redis from "redis";
import cors from "cors";
dotenv.config();
export const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT),
  },
});
redisClient.connect().then(()=>{
  console.log("Connected to Redis")
}).catch((err)=>{
console.error(err);
})
const app = express();
app.use(cors())
import songRoutes from "./route.js";
app.use("/api/v1", songRoutes);

const port = process.env.PORT || 7000;
app.listen(port, () => {
  console.log(`Song Server is running in ${port}`);
});
