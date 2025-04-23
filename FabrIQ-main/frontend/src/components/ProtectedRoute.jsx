import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedUserType }) => {
	const token = localStorage.getItem("access_token");
	const userType = localStorage.getItem("user_type");

	if (!token) return <Navigate to="/login" />;

	if (allowedUserType && userType !== allowedUserType) {
		return <Navigate to="/" />;
	}

	return children;
};

export default ProtectedRoute;
