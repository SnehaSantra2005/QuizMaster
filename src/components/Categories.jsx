
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Categories.css";
import API_URL from "../api";

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    // Fetch categories from MongoDB through backend API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/categories`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }

                const data = await response.json();

                setCategories(data.categories || []);
                setError("");
            } catch (err) {
                setError("Could not load categories. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Category icons and descriptions
    const getCategoryDetails = (id, name) => {
        const details = {
            programming: [
                "💻",
                "Build your coding fundamentals and problem-solving skills.",
                "Coding"
            ],
            dbms: [
                "🗄️",
                "Explore SQL, database design, keys and normalization.",
                "Core CS"
            ],
            web: [
                "🌐",
                "Test your knowledge of HTML, CSS and JavaScript.",
                "Development"
            ],
            ml: [
                "🤖",
                "Discover ML algorithms, AI concepts and model evaluation.",
                "Artificial Intelligence"
            ],
            java: [
                "☕",
                "Practice Java syntax, OOP concepts and programming basics.",
                "Programming"
            ],
            python: [
                "🐍",
                "Improve your Python skills through concept-based quizzes.",
                "Programming"
            ],
            dsa: [
                "🧠",
                "Explore arrays, linked lists, stacks, queues and trees.",
                "Problem Solving"
            ],
            os: [
                "🖥️",
                "Learn about processes, memory management and scheduling.",
                "Core CS"
            ],
            cn: [
                "📡",
                "Test your understanding of networking and protocols.",
                "Core CS"
            ],
            cybersecurity: [
                "🔐",
                "Learn about cyber threats, vulnerabilities and security.",
                "Security"
            ],
            datascience: [
                "📊",
                "Explore data analysis, statistics and data-driven concepts.",
                "Data"
            ],
            aptitude: [
                "🧮",
                "Sharpen quantitative aptitude and logical reasoning.",
                "Placement Prep"
            ]
        };

        return details[id] || [
            "📚",
            `Explore and practice ${name} concepts.`,
            "New Category"
        ];
    };

    // Filter groups
    const filterGroups = {
        All: categories.map((category) => category.id),

        Programming: ["programming", "java", "python", "dsa"],

        "Core CS": ["dbms", "os", "cn", "cybersecurity"],

        "Web & AI": ["web", "ml", "datascience"],

        Aptitude: ["aptitude"]
    };

    // Search and filter categories
    const filteredCategories = categories.filter((category) => {
        const [, description, tag] = getCategoryDetails(
            category.id,
            category.name
        );

        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            category.name.toLowerCase().includes(searchText) ||
            description.toLowerCase().includes(searchText) ||
            tag.toLowerCase().includes(searchText);

        const matchesFilter =
            activeFilter === "All" ||
            (filterGroups[activeFilter] || []).includes(category.id);

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="all-categories-page">

            {/* Navbar */}
            <nav className="navbar">

                <Link to="/" className="logo">
                    <span className="logo-icon">Q</span>
                    <span>QuizMaster</span>
                </Link>

                <div className="nav-links">
                    <Link to="/">Home</Link>

                    <Link to="/categories" className="active">
                        Quizzes
                    </Link>

                    <Link to="/dashboard">Dashboard</Link>
                </div>

            </nav>

            <main className="categories-main">

                {/* Hero Section */}
                <section className="categories-hero">

                    <span className="categories-eyebrow">
                        ✦ LEARN SOMETHING NEW
                    </span>

                    <h1>
                        Explore All
                        <span> Categories.</span>
                    </h1>

                    <p className="categories-subtitle">
                        Choose a topic, test your knowledge, and take your
                        learning to the next level.
                    </p>

                    {/* Search */}
                    <div className="category-search-wrap">

                        <span className="search-icon" aria-hidden="true">
                            ⌕
                        </span>

                        <input
                            className="category-search"
                            type="text"
                            placeholder="Search topics, skills, or subjects..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            aria-label="Search categories"
                        />

                        {search && (
                            <button
                                className="clear-search"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                type="button"
                            >
                                ✕
                            </button>
                        )}

                    </div>

                    {/* Filters */}
                    <div
                        className="category-filters"
                        aria-label="Filter categories"
                    >

                        {Object.keys(filterGroups).map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={`category-filter ${activeFilter === filter ? "active" : ""
                                    }`}
                                onClick={() => setActiveFilter(filter)}
                                aria-pressed={activeFilter === filter}
                            >
                                {filter}
                            </button>
                        ))}

                    </div>

                </section>

                {/* Categories List */}
                <section className="categories-list-section">

                    <div className="categories-section-heading">

                        <div>
                            <h2>Find your next challenge</h2>

                            <p>
                                Choose from a range of subjects and practice
                                at your own pace.
                            </p>
                        </div>

                        <span className="category-count">
                            {filteredCategories.length}{" "}
                            {filteredCategories.length === 1
                                ? "category"
                                : "categories"}
                        </span>

                    </div>

                    {/* Loading */}
                    {loading && (
                        <p className="categories-message">
                            Loading categories...
                        </p>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="no-categories">
                            <h3>Unable to load categories</h3>
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Category Cards */}
                    {!loading && !error && filteredCategories.length > 0 && (

                        <div className="all-category-grid">

                            {filteredCategories.map((category, index) => {

                                const [icon, description, tag] =
                                    getCategoryDetails(
                                        category.id,
                                        category.name
                                    );

                                return (
                                    <article
                                        className="all-category-card"
                                        key={category._id || category.id}
                                        style={{
                                            "--card-index": index
                                        }}
                                    >

                                        <div className="category-card-top">

                                            <div className="all-category-icon">
                                                {icon}
                                            </div>

                                            <span className="category-card-tag">
                                                {tag}
                                            </span>

                                        </div>

                                        <h3>{category.name}</h3>

                                        <p className="category-card-description">
                                            {description}
                                        </p>

                                        <div className="category-card-footer">

                                            <Link
                                                to={`/difficulty/${category.id}`}
                                                className="category-explore-link"
                                            >
                                                Explore quiz <span>↗</span>
                                            </Link>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                    {/* Empty Search Result */}
                    {!loading && !error && filteredCategories.length === 0 && (

                        <div className="no-categories">

                            <span aria-hidden="true">🔎</span>

                            <h3>No categories found</h3>

                            <p>
                                Try another search term or select a different
                                filter.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setActiveFilter("All");
                                }}
                            >
                                Clear filters
                            </button>

                        </div>
                    )}

                </section>

                {/* Bottom Section */}
                <div className="categories-bottom">

                    <p>
                        Keep learning. Keep growing. Keep challenging yourself.
                    </p>

                    <Link to="/">
                        ← Back to Home
                    </Link>

                </div>

            </main>

        </div>
    );
}

export default Categories;
