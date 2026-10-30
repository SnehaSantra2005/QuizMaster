
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "./UserAuth.css";

function UserLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/users/login",
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

            localStorage.setItem("userToken", data.token);
            localStorage.setItem("userInfo", JSON.stringify(data.user));

            navigate("/categories");

        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/users/google",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        credential: credentialResponse.credential
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Google login failed.");
            }

            localStorage.setItem("userToken", data.token);
            localStorage.setItem("userInfo", JSON.stringify(data.user));

            navigate("/categories");

        } catch (err) {
            setError(err.message || "Google login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-auth-page">

            <div className="user-auth-card">

                <Link to="/" className="auth-logo">
                    <span>Q</span> QuizMaster
                </Link>

                <h1>Welcome Back!</h1>

                <p className="auth-subtitle">
                    Login to continue your learning journey.
                </p>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <label>Email Address</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="auth-submit-btn"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <div className="google-login-wrapper">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                            setError("Google login failed. Please try again.");
                        }}
                        useOneTap={false}
                    />
                </div>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/register">Create Account</Link>
                </p>

                <Link to="/" className="auth-back-link">
                    ← Back to Home
                </Link>

            </div>

        </div>
    );
}

export default UserLogin;
