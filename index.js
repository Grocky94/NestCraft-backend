import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
import { registration, login, addServices, deleteSelected, viewCategory, uploadMiddleware } from "./controller/user.js";

const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

dotenv.config();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serving static files

// const imageDirectory = path.join(__dirname, "/uploads");
// console.log(imageDirectory, "here")
// app.use("/image", express.static(imageDirectory));

// const imageDirectory = path.join(__dirname, "./uploads");
// const imageDirectory = "/mnt/uploads";
// console.log(imageDirectory, "here")
// app.use("/image", express.static(imageDirectory));


// Routes
app.get('/', (req, res) => {
    res.send("working");
    console.log("working");
})

app.post('/register', registration);
app.post('/login', login);
app.post('/addservice', uploadMiddleware, addServices);
app.post('/deleteSelected', deleteSelected);
app.post("/viewcategory", viewCategory);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database connected!"))
    .catch((err) => console.error("Database connection error:", err));

// Server listening
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});
