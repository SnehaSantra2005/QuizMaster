const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        question: {
            type: String,
            required: true,
            trim: true
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: (options) =>
                    options.length === 4 &&
                    options.every((option) => option.trim().length > 0),
                message: "Exactly 4 non-empty options are required."
            }
        },

        answer: {
            type: String,
            required: true,
            trim: true
        },

        difficulty: {
            type: String,
            required: true,
            enum: ["Easy", "Medium", "Hard"]
        }
    },
    {
        timestamps: true
    }
);

questionSchema.pre("validate", function () {
    if (this.options && !this.options.includes(this.answer)) {
        this.invalidate(
            "answer",
            "Correct answer must match one of the options."
        );
    }
});

module.exports = mongoose.model("Question", questionSchema);