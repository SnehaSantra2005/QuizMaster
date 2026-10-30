
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            default: null
        },

        googleId: {
            type: String,
            default: null,
            sparse: true,
            unique: true
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },

        // Student Profile Picture
        profileImage: {
            type: String,
            default: ""
        },

        role: {
            type: String,
            default: "user",
            enum: ["user"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
