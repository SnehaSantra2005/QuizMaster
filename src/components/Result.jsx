
import { useEffect } from "react";
import { Link } from "react-router-dom";

function Result({
    score,
    total,
    category,
    difficulty,
    attemptId
}) {
    const percentage = total > 0
        ? Math.round((score / total) * 100)
        : 0;

    useEffect(() => {
        const saveQuizResult = async () => {
            const now = new Date();

            // --------------------------------
            // 1. Save result in localStorage
            // --------------------------------

            const oldResults = JSON.parse(
                localStorage.getItem("quizResults") || "[]"
            );

            const alreadySaved = oldResults.some(
                (result) => result.attemptId === attemptId
            );

            if (!alreadySaved) {
                const result = {
                    attemptId,
                    category,
                    difficulty,
                    score,
                    total,
                    percentage,
                    completedAt: now.toISOString(),
                    date: now.toLocaleDateString()
                };

                oldResults.push(result);

                localStorage.setItem(
                    "quizResults",
                    JSON.stringify(oldResults)
                );

                // Save today's local date for streak tracking.
                const todayKey = [
                    now.getFullYear(),
                    String(now.getMonth() + 1).padStart(2, "0"),
                    String(now.getDate()).padStart(2, "0")
                ].join("-");

                const savedDates = JSON.parse(
                    localStorage.getItem("quizActivityDates") || "[]"
                );

                if (!savedDates.includes(todayKey)) {
                    savedDates.push(todayKey);

                    localStorage.setItem(
                        "quizActivityDates",
                        JSON.stringify(savedDates)
                    );
                }
            }

            // --------------------------------
            // 2. Save result in MongoDB
            // --------------------------------

            const token = localStorage.getItem("userToken");

            if (!token) {
                console.error(
                    "Student token not found. Please login again."
                );
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/users/attempts",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            attemptId,
                            category,
                            difficulty,
                            score,
                            total
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to save quiz result."
                    );
                }

                console.log(
                    "Quiz result saved successfully:",
                    data.attempt
                );

            } catch (error) {
                console.error(
                    "MongoDB quiz saving error:",
                    error
                );
            }
        };

        saveQuizResult();

    }, [
        attemptId,
        category,
        difficulty,
        score,
        total,
        percentage
    ]);

    // --------------------------------
    // Category names
    // --------------------------------

    const categoryName = {
        programming: "Programming",
        dbms: "DBMS",
        web: "Web Development",
        ml: "Machine Learning",
        java: "Java",
        python: "Python",
        dsa: "Data Structures & Algorithms",
        os: "Operating Systems",
        cn: "Computer Networks",
        cybersecurity: "Cybersecurity",
        datascience: "Data Science",
        aptitude: "Aptitude"
    };

    // --------------------------------
    // Result messages
    // --------------------------------

    let message = "";
    let emoji = "";

    if (percentage >= 80) {
        message = "Excellent work! You really know your stuff.";
        emoji = "🏆";
    } else if (percentage >= 60) {
        message = "Great job! Keep practicing and you'll get even better.";
        emoji = "🎉";
    } else if (percentage >= 40) {
        message = "Good effort! A little more practice will help.";
        emoji = "💪";
    } else {
        message = "Don't give up! Keep learning and try again.";
        emoji = "🚀";
    }

    // --------------------------------
    // Result Page UI
    // --------------------------------

    return (
        <div className="result-page">

            {/* Decorative background */}
            <div className="result-glow glow-one"></div>
            <div className="result-glow glow-two"></div>

            <div className="result-wrapper">

                {/* Top label */}
                <div className="result-completed">
                    <span>✦</span>
                    QUIZ COMPLETED
                    <span>✦</span>
                </div>

                {/* Celebration */}
                <div className="result-emoji">
                    {emoji}
                </div>

                <h1>
                    {percentage >= 80
                        ? "Outstanding!"
                        : percentage >= 60
                            ? "Great Job!"
                            : percentage >= 40
                                ? "Nice Effort!"
                                : "Keep Going!"}
                </h1>

                <p className="result-subtitle">
                    You completed the{" "}
                    <strong>
                        {categoryName[category] || category}
                    </strong>{" "}
                    quiz.
                </p>

                {/* Score Card */}
                <div className="result-score-card">

                    <div className="score-heading">
                        <span>Your Score</span>

                        <span className="result-difficulty">
                            {difficulty}
                        </span>
                    </div>

                    <div
                        className="result-score-circle"
                        style={{
                            "--score": percentage,
                            "--animated-score": `${percentage}%`
                        }}
                    >
                        <div className="score-circle-inner">
                            <strong>{percentage}%</strong>
                            <span>Score</span>
                        </div>
                    </div>

                    <div className="score-details">

                        <div className="score-detail">
                            <span>Correct Answers</span>
                            <strong>{score}</strong>
                        </div>

                        <div className="score-divider"></div>

                        <div className="score-detail">
                            <span>Total Questions</span>
                            <strong>{total}</strong>
                        </div>

                        <div className="score-divider"></div>

                        <div className="score-detail">
                            <span>Accuracy</span>
                            <strong>{percentage}%</strong>
                        </div>

                    </div>
                </div>

                {/* Message */}
                <div className="result-message-box">
                    <span>💡</span>
                    <p>{message}</p>
                </div>

                {/* Buttons */}
                <div className="result-actions">

                    <button
                        className="result-primary-btn"
                        onClick={() => {
                            window.location.href =
                                `/quiz/${category}?difficulty=${encodeURIComponent(difficulty)}`;
                        }}
                    >
                        Try Again
                        <span>↻</span>
                    </button>

                    <Link to="/dashboard">
                        <button className="result-secondary-btn">
                            View Dashboard
                            <span>→</span>
                        </button>
                    </Link>

                </div>

                <Link to="/" className="result-home-link">
                    ← Back to Home
                </Link>

            </div>
        </div>
    );
}

export default Result;
