require("dotenv").config();

const mongoose = require("mongoose");
const Category = require("../models/Category");

const categories = [
    { name: "Programming", slug: "programming" },
    { name: "DBMS", slug: "dbms" },
    { name: "Web Development", slug: "web" },
    { name: "Machine Learning", slug: "ml" }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        for (const item of categories) {
            await Category.updateOne(
                { slug: item.slug },
                { $setOnInsert: item },
                { upsert: true }
            );
        }

        console.log("Default categories added successfully!");
    } catch (error) {
        console.error("Category seeding failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedCategories();