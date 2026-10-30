
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const protectAdmin = require("../middleware/authMiddleware");

const router = express.Router();

const mongoose = require("mongoose");

// ===============================
// Admin Login
// ===============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const admin = await Admin.findOne({
            email: email.trim().toLowerCase()
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed.",
            error: error.message
        });
    }
});


// ===============================
// Get Logged-in Admin Profile
// ===============================
router.get("/me", protectAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        admin: req.admin
    });
});


// ===============================
// Get All Admins + Total Count
// ===============================
router.get("/admins", protectAdmin, async (req, res) => {
    try {
        const admins = await Admin.find()
            .select("-password")
            .sort({ createdAt: -1 });

        const totalAdmins = admins.length;

        res.status(200).json({
            success: true,
            totalAdmins,
            admins
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not fetch admins.",
            error: error.message
        });
    }
});


// ===============================
// Create Another Admin
// ===============================
router.post("/admins", protectAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingAdmin = await Admin.findOne({
            email: normalizedEmail
        });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "An admin with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newAdmin = await Admin.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "New admin created successfully.",
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not create admin.",
            error: error.message
        });
    }
});


// ===============================
// Delete Admin
// ===============================
router.delete("/admins/:id", protectAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID."
            });
        }

        // Prevent deleting your own account
        if (req.admin._id.toString() === id) {
            return res.status(403).json({
                success: false,
                message: "You cannot delete your own admin account."
            });
        }

        const adminToDelete = await Admin.findById(id);

        if (!adminToDelete) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }

        // Prevent deleting the last admin
        const totalAdmins = await Admin.countDocuments();

        if (totalAdmins <= 1) {
            return res.status(400).json({
                success: false,
                message: "The last admin account cannot be deleted."
            });
        }

        await Admin.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Admin deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Could not delete admin.",
            error: error.message
        });
    }
});

module.exports = router;
