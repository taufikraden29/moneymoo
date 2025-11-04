import { Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient"; // pastikan path ini sesuai
import ErrorHandler from "../utils/errorHandler";

function ProtectedRoute({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) {
                    ErrorHandler.handle(error, `Auth Check - Route: ${location.pathname}`);
                    setUser(null);
                    setLoading(false);
                    return;
                }
                
                if (!data?.user) {
                    setUser(null);
                    setLoading(false);
                } else {
                    setUser(data.user);
                    setLoading(false);
                }
            } catch (error) {
                ErrorHandler.handle(error, `Auth Check - Route: ${location.pathname}`);
                setUser(null);
                setLoading(false);
            }
        };
        checkUser();
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <h1 className="mt-4 text-lg font-medium text-gray-700">Memeriksa autentikasi...</h1>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;