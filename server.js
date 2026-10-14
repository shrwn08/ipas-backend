import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/connectDB.js"
dotenv.config();


const app = express();
const PORT = process.env.PORT;



app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors({
    origin : process.env.URL || "http://localhost:5173/"
}));

app.get("/api/health", (req, res) =>
    res.status(200).json({
        message: "Server is working fine"
    })
);

connectDB()
    .then(() => {
       console.log("MongoDB Connected successfully");
    })
    .catch((error) => {
        console.error("unable to connect the MongoDB ", error.message);
        process.exit(1);
    });

     app.listen(PORT, () => console.log("Server is running on PORT ", PORT));








