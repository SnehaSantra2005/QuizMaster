
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./QuizHistory.css";

function formatDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getCategoryIcon(category) {
    const icons = {
        programming: "💻",
        dbms: "🗄️",
        web: "🌐",
        ml: "🤖"
    };

    return icons[category?.toLowerCase()] || "📝";
}

function QuizHistory() {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [difficulty, setDifficulty] = useState("All");
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("userToken");

                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/users/attempts",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem("userToken");
                        localStorage.removeItem("userInfo");
                        window.location.href = "/login";
                        return;
                    }

                    throw new Error(
                        data.message || "Unable to load quiz history."
                    );
                }

                const history = Array.isArray(data)
                    ? data
                    : data.attempts || [];

                setAttempts(history);
            } catch (err) {
                console.error("Quiz history error:", err);
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredAttempts = attempts
        .filter((quiz) => {
            const matchesSearch = quiz.category
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const matchesCategory =
                category === "All" ||
                quiz.category?.toLowerCase() === category.toLowerCase();

            const matchesDifficulty =
                difficulty === "All" ||
                quiz.difficulty?.toLowerCase() === difficulty.toLowerCase();

            return matchesSearch && matchesCategory && matchesDifficulty;
        })
        .sort((a, b) => {
            if (sort === "newest") {
                return new Date(b.completedAt) - new Date(a.completedAt);
            }

            if (sort === "oldest") {
                return new Date(a.completedAt) - new Date(b.completedAt);
            }

            if (sort === "highest") {
                return Number(b.percentage) - Number(a.percentage);
            }

            if (sort === "lowest") {
                return Number(a.percentage) - Number(b.percentage);
            }

            return 0;
        });

    if (loading) {
        return (
            <div className="quiz-history-page">
                <p className="history-message">Loading quiz history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-history-page">
                <p className="history-message">{error}</p>
                <Link to="/dashboard">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="quiz-history-page">

            <nav className="history-nav">
                <Link to="/" className="history-logo">
                    <span>Q</span> QuizMaster
                </Link>

                <Link to="/dashboard" className="history-back">
                    ← Dashboard
                </Link>
            </nav>

            <header className="history-header">
                <p>YOUR LEARNING JOURNEY</p>
                <h1>Quiz <span>History</span></h1>
                <p>Track every attempt and see how far you've improved.</p>
            </header>

            <section className="history-summary">
                <div>
                    <span>Total Quizzes</span>
                    <h2>{attempts.length}</h2>
                </div>

                <div>
                    <span>Average Score</span>
                    <h2>
                        {attempts.length
                            ? Math.round(
                                attempts.reduce(
                                    (sum, item) =>
                                        sum + (Number(item.percentage) || 0),
                                    0
                                ) / attempts.length
                            )
                            : 0}%
                    </h2>
                </div>
            </section>

            <section className="history-content">

                <div className="history-filter">
                    <h2>All Attempts</h2>
                </div>

                {/* Search and Filters */}
                <div className="history-controls">

                    <input
                        type="text"
                        placeholder="🔍 Search category..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                    >
                        <option value="All">All Categories</option>
                        <option value="Programming">Programming</option>
                        <option value="DBMS">DBMS</option>
                        <option value="Web">Web Development</option>
                        <option value="ML">Machine Learning</option>
                    </select>

                    <select
                        value={difficulty}
                        onChange={(event) => setDifficulty(event.target.value)}
                    >
                        <option value="All">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Score</option>
                        <option value="lowest">Lowest Score</option>
                    </select>

                </div>

                <p className="history-result-count">
                    Showing {filteredAttempts.length} of {attempts.length} attempts
                </p>

                {filteredAttempts.length === 0 ? (
                    <div className="history-empty">
                        <div>📚</div>
                        <h3>No quiz attempts found</h3>
                        <p>Try changing your search or filters.</p>

                        <button
                            onClick={() => {
                                setSearch("");
                                setCategory("All");
                                setDifficulty("All");
                                setSort("newest");
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="all-history-list">
                        {filteredAttempts.map((quiz, index) => (
                            <article
                                className="all-history-item"
                                key={quiz._id || quiz.attemptId || index}
                            >
                                <div className="all-history-icon">
                                    {getCategoryIcon(quiz.category)}
                                </div>

                                <div className="all-history-details">
                                    <h3>{quiz.category || "Quiz"}</h3>
                                    <p>
                                        {quiz.difficulty || "N/A"} Level
                                        <span> • </span>
                                        {formatDate(quiz.completedAt)}
                                    </p>
                                </div>

                                <div className="all-history-score">
                                    <strong>
                                        {quiz.score}/{quiz.total}
                                    </strong>
                                    <span>
                                        {Number(quiz.percentage) || 0}%
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <div className="history-footer">
                <Link to="/categories">Take Another Quiz →</Link>
            </div>

        </div>
    );
}

export default QuizHistory;
