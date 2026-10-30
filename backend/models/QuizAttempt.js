
const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        attemptId: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },

        score: {
            type: Number,
            required: true,
            min: 0,
        },

        total: {
            type: Number,
            required: true,
            min: 1,
        },

        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },

        completedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Prevent the same attempt from being saved twice for one student.
quizAttemptSchema.index(
    { user: 1, attemptId: 1 },
    { unique: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
