
require("dotenv").config();

const mongoose = require("mongoose");
const Question = require("../models/Question");
const Category = require("../models/Category");

const categoryNames = {
    programming: "Programming",
    dbms: "DBMS",
    web: "Web Development",
    ml: "Machine Learning",
    java: "Java",
    python: "Python",
    dsa: "Data Structures",
    os: "Operating Systems",
    cn: "Computer Networks",
    cybersecurity: "Cyber Security",
    datascience: "Data Science",
    aptitude: "Aptitude"
};

async function seedQuestions() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected!");

        // Import existing frontend questions
        const questionsModule = await import("../../src/data/questions.js");
        const quizzes = questionsModule.default;

        if (!quizzes) {
            throw new Error("Could not load questions.js");
        }

        // Create missing categories without changing existing ones
        for (const [slug, name] of Object.entries(categoryNames)) {
            await Category.updateOne(
                { slug },
                { $setOnInsert: { slug, name } },
                { upsert: true }
            );
        }

        const operations = [];

        for (const [category, questions] of Object.entries(quizzes)) {
            if (!categoryNames[category]) {
                throw new Error(`Unknown category: ${category}`);
            }

            for (const q of questions) {
                if (
                    !q.question ||
                    !Array.isArray(q.options) ||
                    q.options.length !== 4 ||
                    !q.options.includes(q.answer) ||
                    !["Easy", "Medium", "Hard"].includes(q.difficulty)
                ) {
                    throw new Error(
                        `Invalid question found in category: ${category}, ID: ${q.id}`
                    );
                }

                operations.push({
                    updateOne: {
                        filter: {
                            category,
                            question: q.question.trim()
                        },
                        update: {
                            $setOnInsert: {
                                category,
                                question: q.question.trim(),
                                options: q.options,
                                answer: q.answer,
                                difficulty: q.difficulty
                            }
                        },
                        upsert: true
                    }
                });
            }
        }

        if (operations.length === 0) {
            console.log("No questions found to import.");
        } else {
            const result = await Question.bulkWrite(operations);

            console.log("Question migration completed!");
            console.log("Total questions checked:", operations.length);
            console.log("New questions inserted:", result.upsertedCount);
            console.log("Existing questions skipped:", result.matchedCount);
        }

        // Show category-wise question counts
        const counts = await Question.aggregate([
            {
                $group: {
                    _id: "$category",
                    total: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log("\nCategory-wise question count:");
        console.table(
            counts.map((item) => ({
                Category: item._id,
                Questions: item.total
            }))
        );

    } catch (error) {
        console.error("Migration failed:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
}

seedQuestions();
