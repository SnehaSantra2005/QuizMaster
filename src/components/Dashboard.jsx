
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DAILY_GOAL = 20;

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getStreak(activityDates) {
    const dates = [...new Set(activityDates)].sort().reverse();

    if (dates.length === 0) return 0;

    const today = getLocalDateKey();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);

    if (dates[0] !== today && dates[0] !== yesterdayKey) {
        return 0;
    }

    let streak = 1;
    let expectedDate = new Date(`${dates[0]}T12:00:00`);

    for (let i = 1; i < dates.length; i++) {
        expectedDate.setDate(expectedDate.getDate() - 1);

        if (dates[i] !== getLocalDateKey(expectedDate)) {
            break;
        }

        streak++;
    }

    return streak;
}


function formatQuizDate(date) {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function Dashboard() {
    const [results, setResults] = useState([]);
    const [activityDates, setActivityDates] = useState([]);
    const [dailyGoal, setDailyGoal] = useState(DAILY_GOAL);
    const [weeklyActivity, setWeeklyActivity] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch student-specific quiz history from MongoDB
    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const token = localStorage.getItem("userToken");

                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                const response = await fetch(
                    "http://localhost:5000/api/users/attempts",
                    {
                        method: "GET",
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
                        data.message || "Failed to load quiz history."
                    );
                }

                const attempts = Array.isArray(data)
                    ? data
                    : data.attempts || [];

                setResults(attempts);

                // Get activity dates from MongoDB quiz attempts
                const dates = attempts
                    .map((attempt) => {
                        if (!attempt.completedAt) return null;

                        const date = new Date(attempt.completedAt);

                        if (Number.isNaN(date.getTime())) return null;

                        return getLocalDateKey(date);
                    })
                    .filter(Boolean);

                const uniqueDates = [...new Set(dates)];

                setActivityDates(uniqueDates);

                // Generate weekly activity
                const today = getLocalDateKey();
                const lastSevenDays = [];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);

                    const dateKey = getLocalDateKey(date);

                    lastSevenDays.push({
                        key: dateKey,
                        label: date.toLocaleDateString("en", {
                            weekday: "short"
                        }),
                        completed: uniqueDates.includes(dateKey),
                        isToday: dateKey === today
                    });
                }

                setWeeklyActivity(lastSevenDays);

            } catch (err) {
                console.error("Dashboard error:", err);
                setError(err.message || "Unable to load dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();

        // Daily goal remains stored locally
        const savedGoal = Number(
            localStorage.getItem("quizDailyGoal")
        );

        if (savedGoal > 0) {
            setDailyGoal(savedGoal);
        }
    }, []);

    const todayKey = getLocalDateKey();

    const todayResults = results.filter((result) => {
        if (!result.completedAt) return false;

        return (
            getLocalDateKey(new Date(result.completedAt)) === todayKey
        );
    });

    const todayQuestions = todayResults.reduce(
        (sum, result) => sum + (Number(result.total) || 0),
        0
    );

    const totalQuizzes = results.length;

    const averageScore =
        totalQuizzes > 0
            ? Math.round(
                results.reduce(
                    (sum, result) =>
                        sum + (Number(result.percentage) || 0),
                    0
                ) / totalQuizzes
            )
            : 0;

    const bestScore =
        totalQuizzes > 0
            ? Math.max(
                ...results.map(
                    (result) => Number(result.percentage) || 0
                )
            )
            : 0;

    const streak = getStreak(activityDates);

    const xp = results.reduce((sum, result) => {
        return sum + (Number(result.score) || 0) * 10;
    }, 0);

    const goalProgress = Math.min(
        100,
        Math.round((todayQuestions / dailyGoal) * 100)
    );

    function updateDailyGoal(value) {
        const goal = Number(value);

        if (goal > 0 && goal <= 200) {
            setDailyGoal(goal);
            localStorage.setItem("quizDailyGoal", String(goal));
        }
    }

    if (loading) {
        return (
            <div className="dashboard-page">
                <p style={{ textAlign: "center", padding: "80px 20px" }}>
                    Loading your dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <p style={{ textAlign: "center", padding: "80px 20px" }}>
                    {error}
                </p>

                <div style={{ textAlign: "center" }}>
                    <Link to="/login">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            <nav className="dashboard-nav">
                <Link to="/" className="dashboard-logo">
                    <span>Q</span>
                    QuizMaster
                </Link>

                <div className="dashboard-nav-links">
                    <Link to="/profile" className="dashboard-profile-link">
                        👤 My Profile
                    </Link>

                    <Link to="/" className="dashboard-back">
                        ← Back to Home
                    </Link>
                </div>
            </nav>

            <section className="dashboard-hero">
                <div>
                    <p className="dashboard-label">
                        YOUR LEARNING JOURNEY
                    </p>

                    <h1>
                        Build Your <span>Streak.</span>
                    </h1>

                    <p>
                        Small daily steps lead to big achievements.
                        Keep learning and beat your personal best.
                    </p>
                </div>

                <div className="dashboard-hero-icon">🎯</div>
            </section>

            <section className="dashboard-stats">

                <div className="dashboard-stat-card">
                    <div className="stat-icon purple">🔥</div>
                    <div>
                        <p>Learning Streak</p>
                        <h2>
                            {streak} {streak === 1 ? "Day" : "Days"}
                        </h2>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon blue">⚡</div>
                    <div>
                        <p>Total XP</p>
                        <h2>{xp.toLocaleString()}</h2>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon yellow">🏆</div>
                    <div>
                        <p>Best Score</p>
                        <h2>{bestScore}%</h2>
                    </div>
                </div>

            </section>

            <section className="dashboard-content">

                <div className="dashboard-performance">

                    <div className="dashboard-section-title">
                        <div>
                            <p>YOUR CONSISTENCY</p>
                            <h2>Weekly Activity</h2>
                        </div>
                        <span>✦</span>
                    </div>

                    <div className="performance-card streak-card">
                        <div className="streak-flame">🔥</div>

                        <div className="performance-text">
                            <h3>
                                {streak === 0
                                    ? "Start your learning streak!"
                                    : streak >= 7
                                        ? "Amazing consistency!"
                                        : "You're building a habit!"}
                            </h3>

                            <p>
                                {streak === 0
                                    ? "Complete a quiz today to start your streak."
                                    : `You've studied on ${streak} consecutive ${streak === 1 ? "day" : "days"}. Come back tomorrow to keep it going.`}
                            </p>
                        </div>
                    </div>

                    <div className="weekly-activity">

                        {weeklyActivity.map((day) => (
                            <div className="activity-day" key={day.key}>

                                <div
                                    className={`activity-dot ${day.completed ? "completed" : ""
                                        } ${day.isToday ? "today" : ""}`}
                                >
                                    {day.completed ? "✓" : "·"}
                                </div>

                                <span>{day.label}</span>

                            </div>
                        ))}

                    </div>
                </div>

                <div className="dashboard-history">

                    <div className="dashboard-section-title">
                        <div>
                            <p>DAILY HABIT</p>
                            <h2>Daily Study Goal</h2>
                        </div>
                        <span>🎯</span>
                    </div>

                    <div className="daily-goal-card">

                        <div className="goal-heading">
                            <span>Questions completed today</span>
                            <strong>
                                {todayQuestions}/{dailyGoal}
                            </strong>
                        </div>

                        <div className="goal-progress-track">
                            <div
                                className="goal-progress-fill"
                                style={{
                                    width: `${goalProgress}%`
                                }}
                            />
                        </div>

                        <p>
                            {goalProgress >= 100
                                ? "Daily goal completed! Great work 🎉"
                                : `${dailyGoal - todayQuestions} more questions to reach your goal.`}
                        </p>

                        <label htmlFor="dailyGoal">
                            Daily target
                        </label>

                        <select
                            id="dailyGoal"
                            value={dailyGoal}
                            onChange={(event) =>
                                updateDailyGoal(event.target.value)
                            }
                        >
                            <option value={5}>5 questions</option>
                            <option value={10}>10 questions</option>
                            <option value={20}>20 questions</option>
                            <option value={30}>30 questions</option>
                            <option value={50}>50 questions</option>
                        </select>

                    </div>

                    <div className="daily-goal-card score-summary">

                        <div className="goal-heading">
                            <span>Average quiz score</span>
                            <strong>{averageScore}%</strong>
                        </div>

                        <div className="goal-progress-track">
                            <div
                                className="goal-progress-fill"
                                style={{
                                    width: `${averageScore}%`
                                }}
                            />
                        </div>

                        <p>
                            {totalQuizzes === 0
                                ? "Take your first quiz to start tracking your performance."
                                : `You've completed ${totalQuizzes} ${totalQuizzes === 1 ? "quiz" : "quizzes"} so far. Keep improving!`}
                        </p>

                    </div>
                </div>

            </section>



            {/* Recent Quiz History */}
            <section className="recent-quiz-section">

                <div className="dashboard-section-title">
                    <div>
                        <p>YOUR PERFORMANCE</p>
                        <h2>Recent Quiz History</h2>
                    </div>

                    <span>📚</span>
                </div>
                <Link to="/history" className="view-all-history">
                    View All History →
                </Link>

                {results.length === 0 ? (

                    <div className="quiz-empty-state">
                        <div>📝</div>
                        <h3>No quizzes completed yet</h3>
                        <p>
                            Your completed quizzes will appear here.
                            Start your first quiz and track your progress!
                        </p>

                        <Link to="/categories">
                            Start Your First Quiz →
                        </Link>
                    </div>

                ) : (

                    <div className="quiz-history-list">

                        {results.slice(0, 5).map((quiz, index) => (

                            <div
                                className="quiz-history-item"
                                key={quiz._id || quiz.attemptId || index}
                            >

                                <div className="quiz-history-icon">
                                    {quiz.category?.toLowerCase() === "programming"
                                        ? "💻"
                                        : quiz.category?.toLowerCase() === "dbms"
                                            ? "🗄️"
                                            : quiz.category?.toLowerCase() === "web"
                                                ? "🌐"
                                                : "🤖"}
                                </div>

                                <div className="quiz-history-details">
                                    <h3>
                                        {quiz.category || "Quiz"}
                                    </h3>

                                    <p>
                                        {quiz.difficulty || "N/A"} Level
                                        <span> • </span>
                                        {formatQuizDate(quiz.completedAt)}
                                    </p>
                                </div>

                                <div className="quiz-history-score">
                                    <strong>
                                        {quiz.score}/{quiz.total}
                                    </strong>

                                    <span>
                                        {Number(quiz.percentage || 0)}%
                                    </span>
                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

            <section className="dashboard-cta">

                <div>
                    <p>READY FOR ANOTHER CHALLENGE?</p>
                    <h2>One quiz closer to your goal.</h2>
                </div>

                <Link to="/categories">
                    <button>Take a Quiz →</button>
                </Link>

            </section>

        </div>
    );
}

export default Dashboard;
