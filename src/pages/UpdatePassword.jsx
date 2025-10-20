import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// Import icon dari react-icons
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // State untuk validasi
    const [validation, setValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        // hasSpecialChar: false,
    });

    // Cek validasi setiap kali password berubah
    useEffect(() => {
        const minLength = newPassword.length >= 6;
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        setValidation({
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            // hasSpecialChar,
        });
    }, [newPassword]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (
            !validation.minLength ||
            !validation.hasUpperCase ||
            !validation.hasLowerCase ||
            !validation.hasNumber
            // || !validation.hasSpecialChar
        ) {
            toast.error("Password tidak memenuhi syarat!");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Password berhasil diperbarui!");
            navigate("/");
        }

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

                {/* Checklist validasi dengan ikon */}
                <div className="mt-2 space-y-1 text-sm">
                    <div
                        className={`flex items-center gap-2 ${validation.minLength ? "text-green-600" : "text-gray-600"
                            }`}
                    >
                        {validation.minLength ? <AiOutlineCheck /> : <AiOutlineClose />}
                        Minimal 6 karakter
                    </div>
                    <div
                        className={`flex items-center gap-2 ${validation.hasUpperCase ? "text-green-600" : "text-gray-600"
                            }`}
                    >
                        {validation.hasUpperCase ? <AiOutlineCheck /> : <AiOutlineClose />}
                        Mengandung huruf besar
                    </div>
                    <div
                        className={`flex items-center gap-2 ${validation.hasLowerCase ? "text-green-600" : "text-gray-600"
                            }`}
                    >
                        {validation.hasLowerCase ? <AiOutlineCheck /> : <AiOutlineClose />}
                        Mengandung huruf kecil
                    </div>
                    <div
                        className={`flex items-center gap-2 ${validation.hasNumber ? "text-green-600" : "text-gray-600"
                            }`}
                    >
                        {validation.hasNumber ? <AiOutlineCheck /> : <AiOutlineClose />}
                        Mengandung angka
                    </div>
                    {/* Jika menambahkan karakter spesial, aktifkan bagian ini */}
                    {/* <div
                        className={`flex items-center gap-2 ${
                            validation.hasSpecialChar ? "text-green-600" : "text-gray-600"
                        }`}
                    >
                        {validation.hasSpecialChar ? <AiOutlineCheck /> : <AiOutlineClose />}
                        Mengandung karakter spesial
                    </div> */}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-medium flex justify-center items-center"
                >
                    {loading ? (
                        <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                        </svg>
                    ) : null}
                    {loading ? "Memproses..." : "Perbarui Password"}
                </button>
            </form>
        </div>
    );
}