
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function Home({ darkMode, toggleTheme }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("userToken")
    );

    const [menuOpen, setMenuOpen] = useState(false);

    const categoriesRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");

        setIsLoggedIn(false);
        setMenuOpen(false);

        navigate("/", { replace: true });
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const scrollToCategories = () => {
        categoriesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        closeMenu();
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/categories")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load categories");
                }
                return response.json();
            })
            .then((data) => {
                setCategories(data.categories || []);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load categories. Please try again.");
                setLoading(false);
            });
    }, []);

    const categoryDetails = {
        programming: {
            icon: "💻",
            description:
                "Test your coding fundamentals, programming concepts and problem-solving skills."
        },
        dbms: {
            icon: "🗄️",
            description:
                "Challenge yourself with databases, SQL, keys and fundamental DBMS concepts."
        },
        web: {
            icon: "🌐",
            description:
                "Test your knowledge of HTML, CSS, JavaScript and modern web concepts."
        },
        ml: {
            icon: "🤖",
            description:
                "Explore machine learning algorithms, concepts and fundamental AI knowledge."
        }
    };

    return (
        <div className="home-page">

            {/* Navbar */}
            <nav className="navbar">

                {/* Logo */}
                <Link
                    to="/"
                    className="logo"
                    onClick={closeMenu}
                >
                    <span className="logo-icon">Q</span>
                    <span>QuizMaster</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="nav-links">

                    <Link to="/">Home</Link>

                    <Link to="/categories">Quizzes</Link>

                    {isLoggedIn && (
                        <Link to="/dashboard">Dashboard</Link>
                    )}

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>

                    {isLoggedIn ? (
                        <button
                            className="login-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="login-btn"
                        >
                            Login
                        </Link>
                    )}

                </div>

                {/* Mobile Navbar Actions */}
                <div className="mobile-navbar-actions">

                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                    >
                        {menuOpen ? "✕" : "☰"}
                    </button>

                </div>

                {/* Mobile Dropdown Menu */}
                <div
                    id="mobile-navigation"
                    className={`mobile-nav-links ${menuOpen ? "active" : ""
                        }`}
                >

                    <Link to="/" onClick={closeMenu}>
                        Home
                    </Link>

                    <Link to="/categories" onClick={closeMenu}>
                        Quizzes
                    </Link>

                    {isLoggedIn && (
                        <Link to="/dashboard" onClick={closeMenu}>
                            Dashboard
                        </Link>
                    )}

                    {isLoggedIn ? (
                        <button
                            className="mobile-logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="mobile-login-btn"
                            onClick={closeMenu}
                        >
                            Login
                        </Link>
                    )}

                </div>

            </nav>


            {/* Hero Section */}
            <section className="hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        ✨ Learn smarter. Practice better.
                    </div>

                    <p className="welcome-text">
                        WELCOME TO QUIZMASTER
                    </p>

                    <h1>
                        Learn.
                        <br />
                        <span>Practice.</span>
                        <br />
                        Master.
                    </h1>

                    <p className="hero-description">
                        Challenge yourself with interactive quizzes,
                        improve your knowledge and track your learning
                        progress — all in one place.
                    </p>

                    <div className="hero-buttons">

                        <button
                            className="start-btn"
                            onClick={scrollToCategories}
                        >
                            Explore Quizzes →
                        </button>

                        <Link to="/dashboard">
                            <button className="secondary-btn">
                                View Dashboard
                            </button>
                        </Link>

                    </div>

                    <div className="hero-stats">

                        <div>
                            <strong>4+</strong>
                            <span>Categories</span>
                        </div>

                        <div>
                            <strong>3</strong>
                            <span>Difficulty Levels</span>
                        </div>

                        <div>
                            <strong>∞</strong>
                            <span>Learning</span>
                        </div>

                    </div>

                </div>


                {/* Hero Visual */}
                <div className="hero-visual">

                    <div className="floating-card card-top">
                        <span>🔥</span>

                        <div>
                            <strong>Keep Learning</strong>
                            <small>You're doing great!</small>
                        </div>
                    </div>

                    <div className="quiz-preview">

                        <div className="preview-header">
                            <span>Today's Challenge</span>
                            <span className="preview-icon">✦</span>
                        </div>

                        <p className="preview-question">
                            Which data structure follows FIFO?
                        </p>

                        <div className="preview-option correct">
                            <span>✓</span>
                            Queue
                        </div>

                        <div className="preview-option">
                            <span>○</span>
                            Stack
                        </div>

                        <div className="preview-option">
                            <span>○</span>
                            Tree
                        </div>

                        <div className="preview-progress">
                            <div></div>
                        </div>

                        <small>Question 3 of 10</small>

                    </div>

                    <div className="floating-card card-bottom">

                        <div className="progress-circle">
                            82%
                        </div>

                        <div>
                            <strong>Your Progress</strong>
                            <small>Keep it up! 🚀</small>
                        </div>

                    </div>

                </div>

            </section>


            {/* Why QuizMaster */}
            <section className="features">

                <div className="section-heading">

                    <p>WHY QUIZMASTER</p>

                    <h2>
                        Everything you need to
                        <span> learn better.</span>
                    </h2>

                    <small>
                        A simple and engaging way to test your knowledge
                        and improve every day.
                    </small>

                </div>

                <div className="feature-container">

                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>

                        <h3>Smart Practice</h3>

                        <p>
                            Choose your topic and difficulty level
                            and practice at your own pace.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>

                        <h3>Instant Results</h3>

                        <p>
                            Get your score immediately and understand
                            how well you performed.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📊</div>

                        <h3>Track Progress</h3>

                        <p>
                            Keep track of your quiz history and
                            monitor your learning progress.
                        </p>
                    </div>

                </div>

            </section>


            {/* Categories */}
            <section
                className="categories"
                id="categories"
                ref={categoriesRef}
            >

                <div className="section-heading">

                    <p>EXPLORE & LEARN</p>

                    <h2>
                        Pick your
                        <span> challenge.</span>
                    </h2>

                    <small>
                        Start with a topic you love and test your knowledge.
                    </small>

                </div>

                <div className="category-container">

                    {loading && <p>Loading categories...</p>}

                    {error && <p>{error}</p>}

                    {!loading && !error &&
                        categories.slice(0, 4).map((category, index) => {

                            const details = categoryDetails[category.id] || {
                                icon: "📚",
                                description: `Explore and practice ${category.name} concepts.`
                            };

                            return (
                                <Link
                                    to={`/difficulty/${category.id}`}
                                    key={category._id || category.id}
                                >
                                    <div className="category-card">

                                        <div className="category-icon">
                                            {details.icon}
                                        </div>

                                        <span className="category-number">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <h3>{category.name}</h3>

                                        <p>{details.description}</p>

                                        <span className="category-link">
                                            Start Quiz →
                                        </span>

                                    </div>
                                </Link>
                            );
                        })
                    }

                </div>

                <div className="more-categories-wrap">

                    <Link
                        to="/categories"
                        className="more-categories-btn"
                    >
                        More Categories →
                    </Link>

                </div>

            </section>


            {/* How It Works */}
            <section className="how-it-works">

                <div className="section-heading">

                    <p>HOW IT WORKS</p>

                    <h2>
                        Start learning in
                        <span> four simple steps.</span>
                    </h2>

                </div>

                <div className="steps-container">

                    <div className="step">
                        <span>01</span>

                        <div>
                            <h3>Choose a Topic</h3>
                            <p>Select the subject you want to practice.</p>
                        </div>
                    </div>

                    <div className="step">
                        <span>02</span>

                        <div>
                            <h3>Select Difficulty</h3>
                            <p>Choose Easy, Medium or Hard.</p>
                        </div>
                    </div>

                    <div className="step">
                        <span>03</span>

                        <div>
                            <h3>Take the Quiz</h3>
                            <p>Answer questions and challenge yourself.</p>
                        </div>
                    </div>

                    <div className="step">
                        <span>04</span>

                        <div>
                            <h3>Track Progress</h3>
                            <p>Check your results and keep improving.</p>
                        </div>
                    </div>

                </div>

            </section>


            {/* CTA */}
            <section className="cta-section">

                <div>
                    <p>READY TO TEST YOURSELF?</p>

                    <h2>
                        Your next challenge
                        <br />
                        is waiting.
                    </h2>
                </div>

                <button
                    className="start-btn"
                    onClick={scrollToCategories}
                >
                    Start Learning →
                </button>

            </section>


            {/* Footer */}
            <footer className="footer">

                <div>
                    <h3>
                        <span>Q</span> QuizMaster
                    </h3>

                    <p>
                        Learn. Practice. Master.
                    </p>
                </div>

                <p>
                    © 2026 QuizMaster. Built for learning.
                </p>

            </footer>

        </div>
    );
}

export default Home;
