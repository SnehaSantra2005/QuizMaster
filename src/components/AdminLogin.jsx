import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/admin/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed.");
            }

            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("adminInfo", JSON.stringify(data.admin));

            navigate("/admin");
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <form className="admin-login-card" onSubmit={handleLogin}>
                <h1>QuizMaster</h1>
                <p className="admin-subtitle">Admin Panel Login</p>

                {error && <div className="admin-error">{error}</div>}

                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login as Admin"}
                </button>

                <p className="admin-back-link">
                    <a href="/">← Back to QuizMaster</a>
                </p>
            </form>
        </div>
    );
}

export default AdminLogin;