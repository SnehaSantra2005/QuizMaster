const express = require("express");
const Category = require("../models/Category");
const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Create slug from category name
const createSlug = (name) => {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

// GET all categories - Public API
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories: categories.map((category) => ({
                _id: category._id,
                id: category.slug,
                name: category.name
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not fetch categories."
        });
    }
});

// ADD category - Admin only
router.post("/", protectAdmin, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        const cleanName = name.trim();
        const slug = createSlug(cleanName);

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid category name."
            });
        }

        const existing = await Category.findOne({
            $or: [
                { name: { $regex: `^${cleanName}$`, $options: "i" } },
                { slug }
            ]
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "This category already exists."
            });
        }

        const category = await Category.create({
            name: cleanName,
            slug
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully.",
            category: {
                id: category.slug,
                name: category.name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not create category."
        });
    }
});

// UPDATE category - Admin only
router.put("/:id", protectAdmin, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required."
            });
        }

        const cleanName = name.trim();
        const slug = createSlug(cleanName);

        const existing = await Category.findOne({
            $or: [
                { name: { $regex: `^${cleanName}$`, $options: "i" } },
                { slug }
            ],
            _id: { $ne: req.params.id }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Another category already uses this name."
            });
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name: cleanName, slug },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            category: {
                id: category.slug,
                name: category.name
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not update category."
        });
    }
});

// DELETE category - Admin only
router.delete("/:id", protectAdmin, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not delete category."
        });
    }
});

module.exports = router;