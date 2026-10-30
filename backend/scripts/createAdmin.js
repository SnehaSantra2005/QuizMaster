require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const createAdmin = async () => {
    try {
        const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error(
                "Please provide ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD."
            );
        }

        if (ADMIN_PASSWORD.length < 8) {
            throw new Error("Admin password must be at least 8 characters.");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        const email = ADMIN_EMAIL.trim().toLowerCase();

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            console.log("This admin already exists.");
            return;
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

        await Admin.create({
            name: ADMIN_NAME,
            email,
            password: hashedPassword
        });

        console.log("First admin created successfully!");

    } catch (error) {
        console.error("Admin creation failed:", error.message);

    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();