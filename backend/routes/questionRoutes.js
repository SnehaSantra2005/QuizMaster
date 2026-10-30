const express = require("express");
const Question = require("../models/Question");
const Category = require("../models/Category");
const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// PUBLIC: Get questions by category and difficulty
router.get("/", async (req, res) => {
    try {
        const { category, difficulty } = req.query;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required."
            });
        }

        const categoryExists = await Category.findOne({
            slug: category.toLowerCase()
        });

        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        const filter = {
            category: category.toLowerCase()
        };

        if (difficulty) {
            if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid difficulty."
                });
            }

            filter.difficulty = difficulty;
        }

        const questions = await Question.find(filter)
            .select("-__v")
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: questions.length,
            questions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not fetch questions."
        });
    }
});

// ADMIN: Add question
router.post("/", protectAdmin, async (req, res) => {
    try {
        const { category, question, options, answer, difficulty } = req.body;

        if (!category || !question || !options || !answer || !difficulty) {
            return res.status(400).json({
                success: false,
                message: "All question fields are required."
            });
        }

        const categoryExists = await Category.findOne({
            slug: category.toLowerCase()
        });

        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: "Invalid category."
            });
        }

        const newQuestion = await Question.create({
            category: category.toLowerCase(),
            question,
            options,
            answer,
            difficulty
        });

        res.status(201).json({
            success: true,
            message: "Question added successfully.",
            question: newQuestion
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ADMIN: Update question
router.put("/:id", protectAdmin, async (req, res) => {
    try {
        const { category, question, options, answer, difficulty } = req.body;

        const updatedQuestion = await Question.findByIdAndUpdate(
            req.params.id,
            { category, question, options, answer, difficulty },
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Question updated successfully.",
            question: updatedQuestion
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ADMIN: Delete question
router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(
            req.params.id
        );

        if (!deletedQuestion) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Question deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not delete question."
        });
    }
});

module.exports = router;