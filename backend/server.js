require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/adminRoutes");

const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const categoryRoutes = require("./routes/categoryRoutes");


const questionRoutes = require("./routes/questionRoutes");

// Check required environment variables
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("MONGODB_URI or JWT_SECRET is missing in .env");
    process.exit(1);
}


const path = require("path");

// Middleware
const allowedOrigins = [
    "http://localhost:5173",
    "https://quiz-master-teal-two.vercel.app",
    "https://quiz-master-gekc12687-sneha-santras-projects.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
}));
app.use(express.json());

// Serve uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check API
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "QuizMaster Backend is running!"
    });
});

// Home route
app.get("/", (req, res) => {
    res.send("QuizMaster Backend is running!");
});


// Existing Categories API (preserved)
app.use("/api/categories", categoryRoutes);

// Admin APIs
app.use("/api/admin", adminRoutes);


app.use("/api/questions", questionRoutes);


// Student APIs
app.use("/api/users", userRoutes);

// Connect MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");

        app.listen(PORT, () => {
            console.log(
                `QuizMaster backend running at http://localhost:${PORT}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    });