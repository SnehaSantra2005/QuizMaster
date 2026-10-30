import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";

const API_URL = "http://localhost:5000";

function StudentProfile() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [photoMessage, setPhotoMessage] = useState("");
    const [photoError, setPhotoError] = useState("");
    const [photoLoading, setPhotoLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem("userToken");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load profile.");
                }

                setUser(data.user);
                setName(data.user.name);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (!token) {
            navigate("/login");
            return;
        }

        fetchProfile();
    }, [token, navigate]);

    // Upload profile picture
    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setPhotoMessage("");
        setPhotoError("");

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setPhotoError("Please select a JPG, PNG, or WEBP image.");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setPhotoError("Image size must be less than 2 MB.");
            e.target.value = "";
            return;
        }

        try {
            setPhotoLoading(true);

            const formData = new FormData();
            formData.append("profileImage", file);

            const response = await fetch(
                `${API_URL}/api/users/profile-image`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Photo upload failed.");
            }

            setUser((previousUser) => ({
                ...previousUser,
                profileImage: data.profileImage || data.user?.profileImage || ""
            }));

            setPhotoMessage("Profile picture updated successfully!");
        } catch (err) {
            setPhotoError(err.message);
        } finally {
            setPhotoLoading(false);
            e.target.value = "";
        }
    };

    // Remove profile picture
    const handleRemovePhoto = async () => {
        const confirmRemove = window.confirm(
            "Are you sure you want to remove your profile picture?"
        );

        if (!confirmRemove) return;

        setPhotoMessage("");
        setPhotoError("");

        try {
            setPhotoLoading(true);

            const response = await fetch(
                `${API_URL}/api/users/profile-image`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not remove photo.");
            }

            setUser((previousUser) => ({
                ...previousUser,
                profileImage: ""
            }));

            setPhotoMessage("Profile picture removed successfully!");
        } catch (err) {
            setPhotoError(err.message);
        } finally {
            setPhotoLoading(false);
        }
    };

    // Update name
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(`${API_URL}/api/users/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: name.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Profile update failed.");
            }

            setUser(data.user);
            setName(data.user.name);
            setEditing(false);
            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError("New password must contain at least 8 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirm password do not match.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `${API_URL}/api/users/change-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Password change failed.");
            }

            setPasswordMessage("Password changed successfully!");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setPasswordError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        navigate("/login");
    };

    if (loading) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    if (!user) {
        return (
            <div className="profile-loading">
                {error || "Unable to load profile."}
                <button onClick={() => navigate("/login")}>Go to Login</button>
            </div>
        );
    }

    const initials = user.name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const profileImageUrl = user.profileImage
        ? `${API_URL}${user.profileImage}`
        : "";

    return (
        <div className="student-profile-page">
            <div className="profile-container">

                {/* Top Navigation */}
                <div className="profile-topbar">
                    <button
                        className="profile-back-btn"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Dashboard
                    </button>

                    <button
                        className="profile-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

                {/* Page Heading */}
                <div className="profile-heading">
                    <h1>My Profile</h1>
                    <p>Manage your personal information and account settings.</p>
                </div>

                <div className="profile-card">

                    {/* User Header and Profile Picture */}
                    <div className="profile-user-header">

                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar">
                                {profileImageUrl ? (
                                    <img
                                        src={profileImageUrl}
                                        alt="Profile"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                hidden
                            />

                            <button
                                type="button"
                                className="profile-photo-btn"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={photoLoading}
                            >
                                {photoLoading
                                    ? "Uploading..."
                                    : profileImageUrl
                                        ? "Change Photo"
                                        : "Upload Photo"}
                            </button>

                            {profileImageUrl && (
                                <button
                                    type="button"
                                    className="profile-photo-remove-btn"
                                    onClick={handleRemovePhoto}
                                    disabled={photoLoading}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="profile-user-details">
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                            <span className="profile-role">Student Account</span>
                        </div>
                    </div>

                    {photoMessage && (
                        <p className="profile-success">{photoMessage}</p>
                    )}

                    {photoError && (
                        <p className="profile-error">{photoError}</p>
                    )}

                    <p className="profile-photo-hint">
                        JPG, PNG or WEBP · Maximum size: 2 MB
                    </p>

                    {/* Personal Information */}
                    <div className="profile-section">
                        <div className="profile-section-heading">
                            <div>
                                <h3>Personal Information</h3>
                                <p>Update your account details.</p>
                            </div>

                            {!editing && (
                                <button
                                    className="profile-edit-btn"
                                    onClick={() => {
                                        setName(user.name);
                                        setEditing(true);
                                        setMessage("");
                                        setError("");
                                    }}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {message && (
                            <p className="profile-success">{message}</p>
                        )}

                        {error && (
                            <p className="profile-error">{error}</p>
                        )}

                        <form onSubmit={handleUpdateProfile}>
                            <div className="profile-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={!editing}
                                />
                            </div>

                            <div className="profile-form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                />
                            </div>

                            <div className="profile-form-group">
                                <label>Account Type</label>
                                <input
                                    type="text"
                                    value={
                                        user.authProvider === "google"
                                            ? "Google Account"
                                            : "Email & Password"
                                    }
                                    disabled
                                />
                            </div>

                            {editing && (
                                <div className="profile-action-buttons">
                                    <button
                                        type="submit"
                                        className="profile-save-btn"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>

                                    <button
                                        type="button"
                                        className="profile-cancel-btn"
                                        onClick={() => {
                                            setEditing(false);
                                            setName(user.name);
                                            setError("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Account Information */}
                    <div className="profile-section">
                        <h3>Account Information</h3>

                        <div className="profile-info-row">
                            <span>Account Created</span>
                            <strong>
                                {new Date(user.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    }
                                )}
                            </strong>
                        </div>
                    </div>

                    {/* Change Password */}
                    {user.authProvider === "local" && (
                        <div className="profile-section">
                            <h3>Change Password</h3>

                            <p className="profile-section-description">
                                Keep your account secure with a strong password.
                            </p>

                            {passwordMessage && (
                                <p className="profile-success">
                                    {passwordMessage}
                                </p>
                            )}

                            {passwordError && (
                                <p className="profile-error">
                                    {passwordError}
                                </p>
                            )}

                            <form onSubmit={handleChangePassword}>
                                <div className="profile-form-group">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <div className="profile-form-group">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        minLength={8}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="profile-save-btn"
                                    disabled={saving}
                                >
                                    {saving ? "Updating..." : "Update Password"}
                                </button>
                            </form>
                        </div>
                    )}

                    {user.authProvider === "google" && (
                        <div className="profile-google-note">
                            Your account uses Google Sign-In. Password
                            management is handled through your Google account.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentProfile;