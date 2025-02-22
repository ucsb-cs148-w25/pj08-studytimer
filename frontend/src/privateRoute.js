import { Navigate } from "react-router-dom";
import { useAuth } from "./authContext";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? children : <Navigate to="/about" />;  // redirect to About page
};

export default PrivateRoute;