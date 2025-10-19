import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (mode === "login") {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    setLoading(false);

    if (result.error) {
      alert(result.error.message);
    } else {
      window.location.href = "/dashboard"; // 🔁 redirect ke dashboard
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold text-center mb-4">
          {mode === "login" ? "Masuk" : "Daftar"}
        </h2>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Loading..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>
        <p className="text-sm text-center mt-3">
          {mode === "login" ? (
            <>
              Belum punya akun?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => setMode("register")}
              >
                Daftar
              </span>
            </>
          ) : (
            <>
              Sudah punya akun?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => setMode("login")}
              >
                Masuk
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
