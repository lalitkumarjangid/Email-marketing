import express from "express"
import cors from "cors"
import AuthRouter from "./Routes/AuthRoutes.js"
import emailRoutes from "./Routes/emailRoutes.js"
import connectDB from "./config/db.js"
import dotenv from 'dotenv';
dotenv.config();


const app = express()

const Port = 5000
connectDB();

app.use(cors({
    origin: 'http://localhost:5173', // or specific origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
app.use(express.json())

app.use("/api/auth" , AuthRouter)
app.use("/api/emails" , emailRoutes)


app.listen(Port, ()=>{
    console.log(`listening on ${Port}`)
})