import { useNavigate } from "react-router-dom";

function UserLogout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");

        navigate("/login", { replace: true });
    };

    return (
        <button onClick={handleLogout} className="logout-btn">
            Logout
        </button>
    );
}

export default UserLogout;