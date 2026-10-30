
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Difficulty from "./components/Difficulty";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import Categories from "./components/Categories";
import QuizHistory from "./components/QuizHistory";

// Admin components
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Student authentication
import UserProtectedRoute from "./components/UserProtectedRoute";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";

import "./App.css";

import StudentProfile from "./components/StudentProfile";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const toggleTheme = () => {
    setDarkMode((previousMode) => {
      const newMode = !previousMode;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
      <BrowserRouter>
        <Routes>
          {/* Home and Student Authentication */}
          <Route
            path="/"
            element={
              <Home
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            }
          />

          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          {/* Student Protected Routes */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/categories" element={<Categories />} />
            <Route path="/difficulty/:category" element={<Difficulty />} />
            <Route path="/quiz/:category" element={<Quiz />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<QuizHistory />} />
            <Route path="/profile" element={<StudentProfile />} />
          </Route>

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
