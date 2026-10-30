
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const protectUser = require("../middleware/userAuthMiddleware");
const QuizAttempt = require("../models/QuizAttempt");

const router = express.Router();

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// ===============================
// Profile Image Upload Configuration
// ===============================

const uploadDirectory = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const uniqueName =
            `profile-${req.user._id}-${Date.now()}${extension}`;

        cb(null, uniqueName);
    }
});

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const upload = multer({
    storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, PNG and WEBP images are allowed."));
        }
    }
});


// ===============================
// Generate Student JWT
// ===============================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: "user"
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};


// ===============================
// Delete Old Profile Image
// ===============================

const deleteOldProfileImage = (imagePath) => {
    if (!imagePath || !imagePath.startsWith("/uploads/")) {
        return;
    }

    const filename = path.basename(imagePath);

    const fullPath = path.join(uploadDirectory, filename);

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};


// ===============================
// Student Registration
// ===============================

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

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

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            authProvider: "local"
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: "Registration successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed."
        });
    }
});


// ===============================
// Student Login
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

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});


// ===============================
// Google Login / Registration
// ===============================

router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body || {};

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required."
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(401).json({
                success: false,
                message: "Google account verification failed."
            });
        }

        const email = payload.email.toLowerCase();
        const googleId = payload.sub;

        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = "google";
                await user.save();
            }
        } else {
            user = await User.create({
                name: payload.name || "Student",
                email,
                googleId,
                authProvider: "google"
            });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: "Google authentication successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Google authentication error:", error);

        res.status(401).json({
            success: false,
            message: "Google authentication failed."
        });
    }
});


// ===============================
// Get Logged-in Student Profile
// ===============================

router.get("/me", protectUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "name email authProvider role createdAt profileImage"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error("Fetch profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch profile."
        });
    }
});


// ===============================
// Update Student Name
// ===============================

router.put("/profile", protectUser, async (req, res) => {
    try {
        const { name } = req.body || {};

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required."
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name: name.trim()
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("name email authProvider role createdAt profileImage");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
        });

    } catch (error) {
        console.error("Update profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update profile."
        });
    }
});


// ===============================
// Upload / Change Profile Picture
// ===============================

router.post(
    "/profile-image",
    protectUser,
    (req, res, next) => {
        upload.single("profileImage")(req, res, (error) => {
            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "Image size must not exceed 2 MB."
                    });
                }

                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            next();
        });
    },
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please select an image."
                });
            }

            const user = await User.findById(req.user._id);

            if (!user) {
                fs.unlinkSync(req.file.path);

                return res.status(404).json({
                    success: false,
                    message: "Student not found."
                });
            }

            const oldImage = user.profileImage;

            user.profileImage = `/uploads/${req.file.filename}`;

            await user.save();

            deleteOldProfileImage(oldImage);

            res.status(200).json({
                success: true,
                message: "Profile picture updated successfully.",
                profileImage: user.profileImage
            });

        } catch (error) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error("Profile image upload error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to upload profile picture."
            });
        }
    }
);


// ===============================
// Remove Profile Picture
// ===============================

router.delete("/profile-image", protectUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (!user.profileImage) {
            return res.status(400).json({
                success: false,
                message: "No profile picture to remove."
            });
        }

        const oldImage = user.profileImage;

        user.profileImage = "";

        await user.save();

        deleteOldProfileImage(oldImage);

        res.status(200).json({
            success: true,
            message: "Profile picture removed successfully."
        });

    } catch (error) {
        console.error("Remove profile image error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to remove profile picture."
        });
    }
});


// ===============================
// Change Student Password
// ===============================

router.put("/change-password", protectUser, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide both current and new passwords."
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 8 characters."
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Google accounts cannot change password here."
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error("Change password error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to change password."
        });
    }
});


// ===============================
// Save Student Quiz Attempt
// ===============================

router.post("/attempts", protectUser, async (req, res) => {
    try {
        const {
            attemptId,
            category,
            difficulty,
            score,
            total
        } = req.body || {};

        if (
            !attemptId ||
            !category ||
            !["Easy", "Medium", "Hard"].includes(difficulty) ||
            score === undefined ||
            total === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid quiz attempt details."
            });
        }

        const numericScore = Number(score);
        const numericTotal = Number(total);

        if (
            !Number.isInteger(numericScore) ||
            !Number.isInteger(numericTotal) ||
            numericTotal < 1 ||
            numericScore < 0 ||
            numericScore > numericTotal
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid score or total questions."
            });
        }

        const percentage = Math.round(
            (numericScore / numericTotal) * 100
        );

        const attempt = await QuizAttempt.findOneAndUpdate(
            {
                user: req.user._id,
                attemptId
            },
            {
                $setOnInsert: {
                    user: req.user._id,
                    attemptId,
                    category,
                    difficulty,
                    score: numericScore,
                    total: numericTotal,
                    percentage,
                    completedAt: new Date()
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        return res.status(201).json({
            success: true,
            message: "Quiz attempt saved successfully.",
            attempt
        });

    } catch (error) {
        console.error("Save quiz attempt error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save quiz attempt."
        });
    }
});


// ===============================
// Get Student Quiz History
// ===============================

router.get("/attempts", protectUser, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({
            user: req.user._id
        }).sort({ completedAt: -1 });

        return res.status(200).json({
            success: true,
            count: attempts.length,
            attempts
        });

    } catch (error) {
        console.error("Fetch quiz attempts error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch quiz history."
        });
    }
});


// ===============================
// Multer Error Handler
// ===============================

router.use((error, req, res, next) => {
    console.error("User route error:", error);

    res.status(500).json({
        success: false,
        message: "Something went wrong."
    });
});


module.exports = router;
