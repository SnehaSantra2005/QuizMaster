
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";

function Difficulty() {
    const { category } = useParams();

    const [questionCounts, setQuestionCounts] = useState({
        Easy: 0,
        Medium: 0,
        Hard: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const categoryInfo = {
        programming: {
            name: "Programming",
            icon: "💻",
            description: "Test your coding and problem-solving skills."
        },
        dbms: {
            name: "DBMS",
            icon: "🗄️",
            description: "Challenge your database and SQL knowledge."
        },
        web: {
            name: "Web Development",
            icon: "🌐",
            description: "Test your HTML, CSS and JavaScript knowledge."
        },
        ml: {
            name: "Machine Learning",
            icon: "🤖",
            description: "Explore algorithms and fundamental ML concepts."
        },
        java: {
            name: "Java",
            icon: "☕",
            description: "Practice Java programming and OOP concepts."
        },
        python: {
            name: "Python",
            icon: "🐍",
            description: "Test your Python programming knowledge."
        },
        dsa: {
            name: "Data Structures",
            icon: "🧠",
            description: "Challenge yourself with data structures and algorithms."
        },
        os: {
            name: "Operating Systems",
            icon: "🖥️",
            description: "Explore processes, memory and CPU scheduling."
        },
        cn: {
            name: "Computer Networks",
            icon: "📡",
            description: "Test your knowledge of networking protocols."
        },
        cybersecurity: {
            name: "Cyber Security",
            icon: "🔐",
            description: "Learn about cyber threats and security concepts."
        },
        datascience: {
            name: "Data Science",
            icon: "📊",
            description: "Explore data analysis and statistical concepts."
        },
        aptitude: {
            name: "Aptitude",
            icon: "🧮",
            description: "Practice quantitative aptitude and logical reasoning."
        }
    };

    const currentCategory = categoryInfo[category];

    // Fetch questions from MongoDB
    useEffect(() => {
        const fetchQuestionCounts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/api/questions?category=${encodeURIComponent(category)}`
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message || "Failed to fetch questions."
                    );
                }

                const questions = data.questions || [];

                const counts = {
                    Easy: 0,
                    Medium: 0,
                    Hard: 0
                };

                questions.forEach((question) => {
                    if (counts[question.difficulty] !== undefined) {
                        counts[question.difficulty]++;
                    }
                });

                setQuestionCounts(counts);

            } catch (err) {
                console.error("Question fetch error:", err);
                setError("Unable to load questions. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (category && currentCategory) {
            fetchQuestionCounts();
        }
    }, [category]);

    // Handle invalid category URLs
    if (!currentCategory) {
        return (
            <div className="difficulty-page">
                <h1>Category not found</h1>
                <p>Please select a valid quiz category.</p>
                <Link to="/categories" className="back-link">
                    ← Browse Categories
                </Link>
            </div>
        );
    }

    const easyCount = questionCounts.Easy;
    const mediumCount = questionCounts.Medium;
    const hardCount = questionCounts.Hard;

    return (
        <div className="difficulty-page">

            {/* Top navigation */}
            <div className="difficulty-nav">
                <Link to="/categories" className="back-link">
                    ← Back to Categories
                </Link>

                <Link to="/" className="difficulty-logo">
                    <span>Q</span>
                    QuizMaster
                </Link>
            </div>

            {/* Header */}
            <section className="difficulty-hero">
                <div className="difficulty-icon">
                    {currentCategory.icon}
                </div>

                <p className="difficulty-label">
                    CHOOSE YOUR CHALLENGE
                </p>

                <h1>
                    {currentCategory.name}{" "}
                    <span>Quiz</span>
                </h1>

                <p className="difficulty-description">
                    {currentCategory.description}
                    <br />
                    Choose a level and start testing yourself.
                </p>
            </section>

            {/* Error message */}
            {error && (
                <p className="difficulty-error">
                    {error}
                </p>
            )}

            {/* Difficulty cards */}
            <section className="difficulty-options">

                {/* Easy */}
                <Link
                    to={`/quiz/${category}?difficulty=Easy`}
                    className="difficulty-link"
                >
                    <div className="difficulty-card easy-card">
                        <div className="difficulty-card-top">
                            <div className="level-icon">🌱</div>
                            <span className="level-number">01</span>
                        </div>

                        <p className="level-label">BEGINNER</p>
                        <h2>Easy</h2>

                        <p className="level-description">
                            Start with basic concepts and
                            build your confidence.
                        </p>

                        <div className="level-info">
                            <span>
                                📝 {loading ? "Loading..." : `${easyCount} ${easyCount === 1 ? "Question" : "Questions"}`}
                            </span>
                            <span>⏱ 2 Minutes</span>
                        </div>

                        <div className="difficulty-start">
                            Start Quiz <span>→</span>
                        </div>
                    </div>
                </Link>

                {/* Medium */}
                <Link
                    to={`/quiz/${category}?difficulty=Medium`}
                    className="difficulty-link"
                >
                    <div className="difficulty-card medium-card">
                        <div className="difficulty-card-top">
                            <div className="level-icon">🔥</div>
                            <span className="level-number">02</span>
                        </div>

                        <p className="level-label">INTERMEDIATE</p>
                        <h2>Medium</h2>

                        <p className="level-description">
                            Put your knowledge to the test
                            with challenging questions.
                        </p>

                        <div className="level-info">
                            <span>
                                📝 {loading ? "Loading..." : `${mediumCount} ${mediumCount === 1 ? "Question" : "Questions"}`}
                            </span>
                            <span>⏱ 2 Minutes</span>
                        </div>

                        <div className="difficulty-start">
                            Start Quiz <span>→</span>
                        </div>
                    </div>
                </Link>

                {/* Hard */}
                <Link
                    to={`/quiz/${category}?difficulty=Hard`}
                    className="difficulty-link"
                >
                    <div className="difficulty-card hard-card">
                        <div className="difficulty-card-top">
                            <div className="level-icon">⚡</div>
                            <span className="level-number">03</span>
                        </div>

                        <p className="level-label">ADVANCED</p>
                        <h2>Hard</h2>

                        <p className="level-description">
                            Ready for the ultimate challenge?
                            Push your limits.
                        </p>

                        <div className="level-info">
                            <span>
                                📝 {loading ? "Loading..." : `${hardCount} ${hardCount === 1 ? "Question" : "Questions"}`}
                            </span>
                            <span>⏱ 2 Minutes</span>
                        </div>

                        <div className="difficulty-start">
                            Start Quiz <span>→</span>
                        </div>
                    </div>
                </Link>

            </section>

            {/* Bottom note */}
            <div className="difficulty-note">
                <span>💡</span>
                <p>
                    Not sure where to start? Try <strong>Easy</strong> and
                    work your way up!
                </p>
            </div>

        </div>
    );
}

export default Difficulty;
