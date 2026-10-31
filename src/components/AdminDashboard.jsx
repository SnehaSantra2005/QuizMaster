
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import API_URL from "../api";

const CATEGORY_API = `${API_URL}/api/categories`;
const QUESTION_API = `${API_URL}/api/questions`;
const ADMIN_API = `${API_URL}/api/admin/admins`;
const QUESTIONS_PER_PAGE = 5;

const emptyQuestionForm = {
    category: "",
    question: "",
    options: ["", "", "", ""],
    answer: "",
    difficulty: "Easy"
};

function AdminDashboard() {
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState("dashboard");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [adminInfo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("adminInfo") || "{}");
        } catch {
            return {};
        }
    });

    const token = localStorage.getItem("adminToken");

    // ==============================
    // CATEGORY STATES
    // ==============================

    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ==============================
    // QUESTION STATES
    // ==============================

    const [questions, setQuestions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
    const [editingQuestionId, setEditingQuestionId] = useState(null);

    const [questionLoading, setQuestionLoading] = useState(false);
    const [questionSaving, setQuestionSaving] = useState(false);

    const [questionError, setQuestionError] = useState("");
    const [questionMessage, setQuestionMessage] = useState("");

    const [showQuestionForm, setShowQuestionForm] = useState(false);

    // ==============================
    // DASHBOARD STATISTICS
    // ==============================

    const [totalQuestionCount, setTotalQuestionCount] = useState(0);
    const [categoryCounts, setCategoryCounts] = useState([]);

    const [statisticsLoading, setStatisticsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // ==============================
    // ADMIN MANAGEMENT STATES
    // ==============================

    const [admins, setAdmins] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminSaving, setAdminSaving] = useState(false);

    const [adminError, setAdminError] = useState("");
    const [adminMessage, setAdminMessage] = useState("");

    const [showAdminForm, setShowAdminForm] = useState(false);

    const [adminForm, setAdminForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    // ==============================
    // COMMON FUNCTIONS
    // ==============================

    const getCategorySlug = (category) =>
        category.id || category.slug;

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        navigate("/admin/login");
    };

    // ==============================
    // FETCH ADMINS
    // ==============================

    const fetchAdmins = async () => {
        try {
            setAdminLoading(true);
            setAdminError("");

            const response = await fetch(ADMIN_API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not load admins.");
            }

            setAdmins(data.admins || []);

        } catch (err) {
            setAdminError(err.message);
        } finally {
            setAdminLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAdmins();
        }
    }, []);

    // ==============================
    // ADMIN FORM HANDLERS
    // ==============================

    const handleAdminChange = (e) => {
        const { name, value } = e.target;

        setAdminForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();

        try {
            setAdminSaving(true);
            setAdminError("");
            setAdminMessage("");

            const response = await fetch(ADMIN_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(adminForm)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not create admin.");
            }

            setAdminForm({
                name: "",
                email: "",
                password: ""
            });

            setShowAdminForm(false);

            setAdminMessage(
                data.message || "Admin created successfully."
            );

            await fetchAdmins();

        } catch (err) {
            setAdminError(err.message);
        } finally {
            setAdminSaving(false);
        }
    };

    // ==============================
    // DELETE ADMIN
    // ==============================

    const handleAdminDelete = async (id) => {
        if (!window.confirm(
            "Are you sure you want to delete this admin account?"
        )) {
            return;
        }

        try {
            setAdminError("");
            setAdminMessage("");

            const response = await fetch(`${ADMIN_API}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not delete admin.");
            }

            setAdminMessage(
                data.message || "Admin deleted successfully."
            );

            await fetchAdmins();

        } catch (err) {
            setAdminError(err.message);
        }
    };

    // ==============================
    // FETCH CATEGORIES
    // ==============================

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(CATEGORY_API);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not load categories."
                );
            }

            const categoryList = data.categories || [];

            setCategories(categoryList);

            if (categoryList.length > 0) {
                setSelectedCategory((previous) => {
                    const stillExists = categoryList.some(
                        (item) => getCategorySlug(item) === previous
                    );

                    return stillExists
                        ? previous
                        : getCategorySlug(categoryList[0]);
                });
            } else {
                setSelectedCategory("");
                setQuestions([]);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ==============================
    // QUESTION STATISTICS
    // ==============================

    const fetchQuestionStatistics = async (categoryList = categories) => {
        if (!categoryList.length) {
            setCategoryCounts([]);
            setTotalQuestionCount(0);
            return;
        }

        try {
            setStatisticsLoading(true);

            const results = await Promise.all(
                categoryList.map(async (category) => {
                    const slug = getCategorySlug(category);

                    const response = await fetch(
                        `${QUESTION_API}?category=${encodeURIComponent(slug)}`
                    );

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(
                            data.message ||
                            `Could not count ${category.name} questions.`
                        );
                    }

                    return {
                        name: category.name,
                        count: data.count ?? data.questions?.length ?? 0
                    };
                })
            );

            setCategoryCounts(results);

            setTotalQuestionCount(
                results.reduce(
                    (total, item) => total + item.count,
                    0
                )
            );

        } catch (err) {
            console.error("Question statistics error:", err);
        } finally {
            setStatisticsLoading(false);
        }
    };

    useEffect(() => {
        if (categories.length) {
            fetchQuestionStatistics(categories);
        } else {
            setCategoryCounts([]);
            setTotalQuestionCount(0);
        }
    }, [categories]);

    // ==============================
    // ADD / UPDATE CATEGORY
    // ==============================

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanName = categoryName.trim();

        if (!cleanName) {
            setError("Please enter a category name.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const isEditing = Boolean(editingId);

            const response = await fetch(
                isEditing
                    ? `${CATEGORY_API}/${editingId}`
                    : CATEGORY_API,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: cleanName
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Category operation failed."
                );
            }

            setCategoryName("");
            setEditingId(null);

            setMessage(
                data.message || "Category saved successfully."
            );

            await fetchCategories();

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setCategoryName(category.name);
        setEditingId(category._id);

        setError("");
        setMessage("");
    };

    // ==============================
    // DELETE CATEGORY
    // ==============================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            const response = await fetch(`${CATEGORY_API}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not delete category."
                );
            }

            if (editingId === id) {
                setEditingId(null);
                setCategoryName("");
            }

            setMessage(
                data.message || "Category deleted successfully."
            );

            await fetchCategories();

        } catch (err) {
            setError(err.message);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setCategoryName("");
        setError("");
        setMessage("");
    };

    // ==============================
    // FETCH QUESTIONS
    // ==============================

    const fetchQuestions = async () => {
        if (!selectedCategory) {
            setQuestions([]);
            return;
        }

        try {
            setQuestionLoading(true);
            setQuestionError("");

            const response = await fetch(
                `${QUESTION_API}?category=${encodeURIComponent(selectedCategory)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Could not load questions."
                );
            }

            setQuestions(data.questions || []);

        } catch (err) {
            setQuestionError(err.message);
            setQuestions([]);
        } finally {
            setQuestionLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
        setCurrentPage(1);
    }, [selectedCategory]);

    // ==============================
    // QUESTION FORM HANDLERS
    // ==============================

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;

        setQuestionForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleOptionChange = (index, value) => {
        setQuestionForm((previous) => {
            const updatedOptions = [...previous.options];

            updatedOptions[index] = value;

            return {
                ...previous,
                options: updatedOptions
            };
        });
    };

    const openAddQuestion = () => {
        setEditingQuestionId(null);

        setQuestionForm({
            ...emptyQuestionForm,
            category: selectedCategory
        });

        setQuestionError("");
        setQuestionMessage("");
        setShowQuestionForm(true);
    };

    const handleQuestionEdit = (question) => {
        setEditingQuestionId(question._id);

        setQuestionForm({
            category: question.category,
            question: question.question,
            options: [...question.options],
            answer: question.answer,
            difficulty: question.difficulty
        });

        setQuestionError("");
        setQuestionMessage("");
        setShowQuestionForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // ==============================
    // ADD / UPDATE QUESTION
    // ==============================

    const handleQuestionSubmit = async (e) => {
        e.preventDefault();

        const cleanQuestion = questionForm.question.trim();

        const cleanOptions = questionForm.options.map(
            (option) => option.trim()
        );

        const cleanAnswer = questionForm.answer.trim();

        if (!cleanQuestion || cleanOptions.some((option) => !option)) {
            setQuestionError(
                "Please fill in the question and all four options."
            );
            return;
        }

        if (new Set(cleanOptions).size !== 4) {
            setQuestionError(
                "All four options must be different."
            );
            return;
        }

        if (!cleanOptions.includes(cleanAnswer)) {
            setQuestionError(
                "Please select a valid correct answer."
            );
            return;
        }

        try {
            setQuestionSaving(true);
            setQuestionError("");
            setQuestionMessage("");

            const isEditing = Boolean(editingQuestionId);

            const response = await fetch(
                isEditing
                    ? `${QUESTION_API}/${editingQuestionId}`
                    : QUESTION_API,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        category: questionForm.category,
                        question: cleanQuestion,
                        options: cleanOptions,
                        answer: cleanAnswer,
                        difficulty: questionForm.difficulty
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not save question."
                );
            }

            const savedCategory = questionForm.category;

            setQuestionMessage(
                data.message || "Question saved successfully."
            );

            setEditingQuestionId(null);
            setShowQuestionForm(false);

            setQuestionForm({
                ...emptyQuestionForm,
                category: selectedCategory
            });

            if (savedCategory !== selectedCategory) {
                setSelectedCategory(savedCategory);
            } else {
                await fetchQuestions();
            }

            await fetchQuestionStatistics(categories);

        } catch (err) {
            setQuestionError(err.message);
        } finally {
            setQuestionSaving(false);
        }
    };

    // ==============================
    // DELETE QUESTION
    // ==============================

    const handleQuestionDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this question?"
        );

        if (!confirmed) return;

        try {
            setQuestionError("");
            setQuestionMessage("");

            const response = await fetch(`${QUESTION_API}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not delete question."
                );
            }

            setQuestionMessage(
                data.message || "Question deleted successfully."
            );

            await fetchQuestions();
            await fetchQuestionStatistics(categories);

        } catch (err) {
            setQuestionError(err.message);
        }
    };

    const cancelQuestionForm = () => {
        setShowQuestionForm(false);
        setEditingQuestionId(null);

        setQuestionForm({
            ...emptyQuestionForm,
            category: selectedCategory
        });

        setQuestionError("");
    };

    // ==============================
    // SEARCH AND FILTER
    // ==============================

    const filteredQuestions = useMemo(() => {
        return questions.filter((question) => {
            const matchesSearch = question.question
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

            const matchesDifficulty =
                selectedDifficulty === "All" ||
                question.difficulty === selectedDifficulty;

            return matchesSearch && matchesDifficulty;
        });
    }, [questions, searchTerm, selectedDifficulty]);

    const totalPages = Math.ceil(
        filteredQuestions.length / QUESTIONS_PER_PAGE
    );

    const safeCurrentPage = Math.min(
        currentPage,
        Math.max(totalPages, 1)
    );

    const startIndex = (safeCurrentPage - 1) * QUESTIONS_PER_PAGE;

    const paginatedQuestions = filteredQuestions.slice(
        startIndex,
        startIndex + QUESTIONS_PER_PAGE
    );

    const changeSearchTerm = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const changeDifficulty = (value) => {
        setSelectedDifficulty(value);
        setCurrentPage(1);
    };

    const changeCategory = (value) => {
        setSelectedCategory(value);
        setSearchTerm("");
        setSelectedDifficulty("All");
        setCurrentPage(1);

        setShowQuestionForm(false);
        setQuestionMessage("");
        setQuestionError("");
    };

    // ==============================
    // NAVIGATION
    // ==============================

    const navigateSection = (section) => {
        setActiveSection(section);
        setMobileMenuOpen(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const currentAdminId = String(
        adminInfo._id || adminInfo.id || ""
    );

    // ==============================
    // JSX
    // ==============================

    return (
        <div className="admin-dashboard">

            {/* SIDEBAR */}

            <aside className="admin-sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">Q</div>

                    <div className="brand-text">
                        <h2>QuizMaster</h2>
                        <span>ADMIN PANEL</span>
                    </div>

                    <button
                        type="button"
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen((previous) => !previous)}
                        aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? "✕" : "☰"}
                    </button>
                </div>

                <p className="sidebar-label">MAIN MENU</p>

                <nav className={`sidebar-nav ${mobileMenuOpen ? "mobile-open" : ""}`}>

                    <button
                        type="button"
                        className={activeSection === "dashboard" ? "active" : ""}
                        onClick={() => navigateSection("dashboard")}
                    >
                        <span>▦</span>
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className={activeSection === "categories" ? "active" : ""}
                        onClick={() => navigateSection("categories")}
                    >
                        <span>▤</span>
                        Categories
                    </button>

                    <button
                        type="button"
                        className={activeSection === "questions" ? "active" : ""}
                        onClick={() => navigateSection("questions")}
                    >
                        <span>☷</span>
                        Questions
                    </button>

                    <button
                        type="button"
                        className={activeSection === "admins" ? "active" : ""}
                        onClick={() => navigateSection("admins")}
                    >
                        <span>♙</span>
                        Admin Management
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {(adminInfo.name || "A")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>{adminInfo.name || "Admin"}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        ↪ Logout
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}

            <main className="admin-main">

                {/* TOP HEADER */}

                <header className="admin-topbar">

                    <div>
                        <span className="topbar-label">
                            ADMINISTRATION
                        </span>

                        <h2>
                            {activeSection === "dashboard" && "Dashboard"}
                            {activeSection === "categories" && "Category Management"}
                            {activeSection === "questions" && "Question Management"}
                            {activeSection === "admins" && "Admin Management"}
                        </h2>
                    </div>

                    <div className="topbar-profile">

                        <div className="user-avatar">
                            {(adminInfo.name || "A")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>{adminInfo.name || "Admin"}</strong>
                            <span>Super Admin</span>
                        </div>

                    </div>

                </header>

                <div className="admin-content">

                    {/* ==========================
                        DASHBOARD OVERVIEW
                    ========================== */}

                    {activeSection === "dashboard" && (

                        <section className="dashboard-overview">

                            <div className="welcome-section">

                                <div>
                                    <span className="welcome-tag">
                                        OVERVIEW
                                    </span>

                                    <h1>
                                        Welcome back, {adminInfo.name || "Admin"}!
                                    </h1>

                                    <p>
                                        Here's what's happening with your
                                        QuizMaster platform.
                                    </p>
                                </div>

                            </div>

                            {/* STATISTICS CARDS */}

                            <div className="admin-cards">

                                <div className="admin-card">

                                    <div className="stat-icon category-icon">
                                        ▤
                                    </div>

                                    <p>Total Categories</p>

                                    <h3>
                                        {loading ? "..." : categories.length}
                                    </h3>

                                    <span>Available quiz categories</span>

                                </div>

                                <div className="admin-card">

                                    <div className="stat-icon question-icon">
                                        ☷
                                    </div>

                                    <p>Total Questions</p>

                                    <h3>
                                        {statisticsLoading
                                            ? "..."
                                            : totalQuestionCount}
                                    </h3>

                                    <span>
                                        Questions across all categories
                                    </span>

                                </div>

                                <div className="admin-card">

                                    <div className="stat-icon admin-icon">
                                        ♙
                                    </div>

                                    <p>Total Admins</p>

                                    <h3>
                                        {adminLoading ? "..." : admins.length}
                                    </h3>

                                    <span>Registered administrators</span>

                                </div>

                            </div>

                            {/* QUICK ACTIONS */}

                            <div className="overview-panel">

                                <h2>Quick Actions</h2>

                                <p>
                                    Choose what you want to manage.
                                </p>

                                <div className="quick-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateSection("categories")
                                        }
                                    >
                                        <span>▤</span>
                                        <strong>Manage Categories</strong>
                                        <small>
                                            Add, edit or remove categories
                                        </small>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateSection("questions")
                                        }
                                    >
                                        <span>☷</span>
                                        <strong>Manage Questions</strong>
                                        <small>
                                            Organize your quiz questions
                                        </small>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigateSection("admins")
                                        }
                                    >
                                        <span>♙</span>
                                        <strong>Manage Admins</strong>
                                        <small>
                                            Control administrator accounts
                                        </small>
                                    </button>

                                </div>

                            </div>

                            {/* CATEGORY STATISTICS */}

                            <div className="overview-panel category-overview">

                                <h2>Category-wise Question Statistics</h2>

                                {statisticsLoading ? (
                                    <p>Loading statistics...</p>
                                ) : categoryCounts.length === 0 ? (
                                    <p>No category statistics available.</p>
                                ) : (
                                    <div className="category-statistics">

                                        {categoryCounts.map((item) => (
                                            <div
                                                className="category-stat-item"
                                                key={item.name}
                                            >
                                                <span>{item.name}</span>
                                                <strong>
                                                    {item.count} Questions
                                                </strong>
                                            </div>
                                        ))}

                                    </div>
                                )}

                            </div>

                        </section>

                    )}

                    {/* ==========================
                        CATEGORY MANAGEMENT
                    ========================== */}

                    {activeSection === "categories" && (

                        <section className="category-management">

                            <h2>Category Management</h2>

                            <p>
                                Add, update and manage your quiz categories.
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="category-form"
                            >

                                <input
                                    type="text"
                                    placeholder="Enter category name"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                    required
                                />

                                <button type="submit" disabled={saving}>
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Category"
                                            : "Add Category"}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                )}

                            </form>

                            {error && (
                                <p className="admin-error">{error}</p>
                            )}

                            {message && (
                                <p className="admin-success">{message}</p>
                            )}

                            <div className="category-table-wrapper">

                                <table className="category-table">

                                    <thead>
                                        <tr>
                                            <th>Sl. No.</th>
                                            <th>Category Name</th>
                                            <th>Category ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {loading ? (

                                            <tr>
                                                <td colSpan="4">
                                                    Loading categories...
                                                </td>
                                            </tr>

                                        ) : categories.length === 0 ? (

                                            <tr>
                                                <td colSpan="4">
                                                    No categories found.
                                                </td>
                                            </tr>

                                        ) : (

                                            categories.map((category, index) => (

                                                <tr key={category._id || category.id}>

                                                    <td>{index + 1}</td>

                                                    <td>{category.name}</td>

                                                    <td>
                                                        {getCategorySlug(category)}
                                                    </td>

                                                    <td>

                                                        <div className="category-actions">

                                                            <button
                                                                type="button"
                                                                className="edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(category)
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(category._id)
                                                                }
                                                                disabled={!category._id}
                                                            >
                                                                Delete
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))

                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="category-statistics">

                                <h3>Category-wise Question Statistics</h3>

                                {statisticsLoading ? (
                                    <p>Loading statistics...</p>
                                ) : categoryCounts.length === 0 ? (
                                    <p>No category statistics available.</p>
                                ) : (

                                    categoryCounts.map((item) => (

                                        <div
                                            className="category-stat-item"
                                            key={item.name}
                                        >
                                            <span>{item.name}</span>
                                            <strong>
                                                {item.count} Questions
                                            </strong>
                                        </div>

                                    ))

                                )}

                            </div>

                        </section>

                    )}

                    {/* ==========================
                        ADMIN MANAGEMENT
                    ========================== */}

                    {activeSection === "admins" && (

                        <section className="category-management admin-management">

                            <h2>Admin Management</h2>

                            <p>
                                View existing admin accounts and create or
                                remove administrators.
                            </p>

                            {/* ADMIN ACTION BUTTONS */}

                            <div className="question-controls">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAdminForm((previous) => !previous);
                                        setAdminError("");
                                        setAdminMessage("");
                                    }}
                                >
                                    {showAdminForm
                                        ? "Close Form"
                                        : "+ Add Admin"}
                                </button>

                                <button
                                    type="button"
                                    onClick={fetchAdmins}
                                    disabled={adminLoading}
                                >
                                    {adminLoading
                                        ? "Refreshing..."
                                        : "Refresh Admins"}
                                </button>

                            </div>

                            {adminError && (
                                <p className="admin-error">
                                    {adminError}
                                </p>
                            )}

                            {adminMessage && (
                                <p className="admin-success">
                                    {adminMessage}
                                </p>
                            )}

                            {/* ADD ADMIN FORM */}

                            {showAdminForm && (

                                <div className="question-form-section">

                                    <h3>Create New Admin</h3>

                                    <form
                                        className="question-form"
                                        onSubmit={handleAdminSubmit}
                                    >

                                        <label htmlFor="new-admin-name">
                                            Name
                                        </label>

                                        <input
                                            id="new-admin-name"
                                            name="name"
                                            type="text"
                                            value={adminForm.name}
                                            onChange={handleAdminChange}
                                            placeholder="Enter admin name"
                                            required
                                        />

                                        <label htmlFor="new-admin-email">
                                            Email
                                        </label>

                                        <input
                                            id="new-admin-email"
                                            name="email"
                                            type="email"
                                            value={adminForm.email}
                                            onChange={handleAdminChange}
                                            placeholder="Enter admin email"
                                            required
                                        />

                                        <label htmlFor="new-admin-password">
                                            Password
                                        </label>

                                        <input
                                            id="new-admin-password"
                                            name="password"
                                            type="password"
                                            value={adminForm.password}
                                            onChange={handleAdminChange}
                                            placeholder="Create a password"
                                            minLength="8"
                                            required
                                        />

                                        <div className="question-form-actions">

                                            <button
                                                type="submit"
                                                disabled={adminSaving}
                                            >
                                                {adminSaving
                                                    ? "Creating..."
                                                    : "Create Admin"}
                                            </button>

                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={() =>
                                                    setShowAdminForm(false)
                                                }
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            )}

                            {/* ADMIN TABLE */}

                            <div className="category-table-wrapper">

                                <table className="category-table">

                                    <thead>
                                        <tr>
                                            <th>Sl. No.</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {adminLoading ? (

                                            <tr>
                                                <td colSpan="6">
                                                    Loading admins...
                                                </td>
                                            </tr>

                                        ) : admins.length === 0 ? (

                                            <tr>
                                                <td colSpan="6">
                                                    No admin accounts found.
                                                </td>
                                            </tr>

                                        ) : (

                                            admins.map((admin, index) => {

                                                const adminId =
                                                    admin._id || admin.id;

                                                const isCurrentAdmin =
                                                    String(adminId) === currentAdminId;

                                                return (

                                                    <tr key={adminId}>

                                                        <td>{index + 1}</td>

                                                        <td>{admin.name}</td>

                                                        <td>{admin.email}</td>

                                                        <td>
                                                            {admin.role || "admin"}
                                                        </td>

                                                        <td>
                                                            {admin.createdAt
                                                                ? new Date(
                                                                    admin.createdAt
                                                                ).toLocaleDateString()
                                                                : "—"}
                                                        </td>

                                                        <td>

                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                disabled={
                                                                    !adminId ||
                                                                    isCurrentAdmin
                                                                }
                                                                title={
                                                                    isCurrentAdmin
                                                                        ? "You cannot delete your own account"
                                                                        : "Delete admin"
                                                                }
                                                                onClick={() =>
                                                                    handleAdminDelete(adminId)
                                                                }
                                                            >
                                                                {isCurrentAdmin
                                                                    ? "Current Admin"
                                                                    : "Delete"}
                                                            </button>

                                                        </td>

                                                    </tr>

                                                );

                                            })

                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <p className="admin-note">
                                Your currently logged-in admin account cannot
                                be deleted from this panel.
                            </p>

                        </section>

                    )}

                    {/* ==========================
                        QUESTION MANAGEMENT
                    ========================== */}

                    {activeSection === "questions" && (

                        <section className="category-management question-management">

                            <h2>Question Management</h2>

                            <p>
                                Add, edit, delete and manage quiz questions.
                            </p>

                            {/* QUESTION CONTROLS */}

                            <div className="question-controls">

                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        changeCategory(e.target.value)
                                    }
                                >

                                    {categories.map((category) => (

                                        <option
                                            key={category._id || category.id}
                                            value={getCategorySlug(category)}
                                        >
                                            {category.name}
                                        </option>

                                    ))}

                                </select>

                                <input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        changeSearchTerm(e.target.value)
                                    }
                                />

                                <select
                                    value={selectedDifficulty}
                                    onChange={(e) =>
                                        changeDifficulty(e.target.value)
                                    }
                                >
                                    <option value="All">
                                        All Difficulties
                                    </option>

                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>

                                </select>

                                <button
                                    type="button"
                                    onClick={openAddQuestion}
                                    disabled={categories.length === 0}
                                >
                                    + Add Question
                                </button>

                            </div>

                            {questionError && (
                                <p className="admin-error">
                                    {questionError}
                                </p>
                            )}

                            {questionMessage && (
                                <p className="admin-success">
                                    {questionMessage}
                                </p>
                            )}

                            {/* QUESTION LIST */}

                            <div className="question-list">

                                {questionLoading ? (

                                    <p>Loading questions...</p>

                                ) : paginatedQuestions.length === 0 ? (

                                    <p>No questions found.</p>

                                ) : (

                                    paginatedQuestions.map((question, index) => (

                                        <div
                                            className="question-item"
                                            key={question._id}
                                        >

                                            <div className="question-item-content">

                                                <div className="question-item-meta">

                                                    <span>
                                                        Question {startIndex + index + 1}
                                                    </span>

                                                    <span
                                                        className={`difficulty-tag ${(
                                                            question.difficulty || "easy"
                                                        ).toLowerCase()}`}
                                                    >
                                                        {question.difficulty}
                                                    </span>

                                                </div>

                                                <h3>{question.question}</h3>

                                                <div className="question-options-preview">

                                                    {question.options.map(
                                                        (option, optionIndex) => (

                                                            <p key={optionIndex}>

                                                                <strong>
                                                                    {String.fromCharCode(
                                                                        65 + optionIndex
                                                                    )}.
                                                                </strong>{" "}

                                                                {option}

                                                                {option === question.answer &&
                                                                    " ✓"}

                                                            </p>

                                                        )
                                                    )}

                                                </div>

                                            </div>

                                            <div className="category-actions">

                                                <button
                                                    type="button"
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleQuestionEdit(question)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleQuestionDelete(question._id)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    ))

                                )}

                            </div>

                            {/* PAGINATION */}

                            {totalPages > 1 && (

                                <div className="question-pagination">

                                    <button
                                        type="button"
                                        disabled={safeCurrentPage === 1}
                                        onClick={() =>
                                            setCurrentPage((page) => page - 1)
                                        }
                                    >
                                        Previous
                                    </button>

                                    <span>
                                        Page {safeCurrentPage} of {totalPages}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={safeCurrentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage((page) => page + 1)
                                        }
                                    >
                                        Next
                                    </button>

                                </div>

                            )}

                            {/* ADD / EDIT QUESTION FORM */}

                            {showQuestionForm && (

                                <div className="question-form-section">

                                    <h2>
                                        {editingQuestionId
                                            ? "Update Question"
                                            : "Add New Question"}
                                    </h2>

                                    <form
                                        onSubmit={handleQuestionSubmit}
                                        className="question-form"
                                    >

                                        <label>Category</label>

                                        <select
                                            name="category"
                                            value={questionForm.category}
                                            onChange={handleQuestionChange}
                                            required
                                        >

                                            {categories.map((category) => (

                                                <option
                                                    key={category._id || category.id}
                                                    value={getCategorySlug(category)}
                                                >
                                                    {category.name}
                                                </option>

                                            ))}

                                        </select>

                                        <label>Difficulty</label>

                                        <select
                                            name="difficulty"
                                            value={questionForm.difficulty}
                                            onChange={handleQuestionChange}
                                            required
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>

                                        <label>Question</label>

                                        <textarea
                                            name="question"
                                            placeholder="Enter your question..."
                                            value={questionForm.question}
                                            onChange={handleQuestionChange}
                                            rows="3"
                                            required
                                        />

                                        <label>Options</label>

                                        {questionForm.options.map(
                                            (option, index) => (

                                                <input
                                                    key={index}
                                                    type="text"
                                                    placeholder={`Option ${String.fromCharCode(
                                                        65 + index
                                                    )}`}
                                                    value={option}
                                                    onChange={(e) =>
                                                        handleOptionChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                />

                                            )
                                        )}

                                        <label>Correct Answer</label>

                                        <select
                                            name="answer"
                                            value={questionForm.answer}
                                            onChange={handleQuestionChange}
                                            required
                                        >

                                            <option value="">
                                                Select correct answer
                                            </option>

                                            {questionForm.options
                                                .filter((option) => option.trim())
                                                .map((option, index) => (

                                                    <option
                                                        key={index}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </option>

                                                ))}

                                        </select>

                                        <div className="question-form-actions">

                                            <button
                                                type="submit"
                                                disabled={questionSaving}
                                            >
                                                {questionSaving
                                                    ? "Saving..."
                                                    : editingQuestionId
                                                        ? "Update Question"
                                                        : "Add Question"}
                                            </button>

                                            <button
                                                type="button"
                                                className="cancel-btn"
                                                onClick={cancelQuestionForm}
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </form>

                                </div>

                            )}

                        </section>

                    )}

                </div>

            </main>

        </div>
    );
}

export default AdminDashboard;
