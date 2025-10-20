// src/pages/UpdatePassword.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("Password minimal 6 karakter!");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) toast.error(error.message);
        else toast.success("Password berhasil diperbarui!");

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50">
            <Toaster />
            <form
                onSubmit={handleUpdatePassword}
                className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4"
            >
                <h2 className="text-xl font-semibold text-center">Ubah Password</h2>
                <input
                    type="password"
                    placeholder="Password Baru"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium"
                >
                    {loading ? "Memproses..." : "Perbarui Password"}
                </button>
            </form>
        </div>
    );
}
