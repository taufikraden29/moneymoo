import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import AuthPage from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddTransaction from "./pages/AddTransaction";
import Categories from "./pages/CategoriesPage.jsx";
import UpdatePassword from "./pages/UpdatePassword.jsx";
import Account from "./pages/Account.jsx";
import DebtPage from "./pages/DebtPage";

import ProtectedRoute from "./components/ProtectedRoute"; // sesuaikan path

import { Toaster } from "react-hot-toast"; // ✅ import Toaster

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* Toaster global untuk menampilkan toast di seluruh aplikasi */}
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          fontSize: "14px",
        },
      }}
    />

    <Routes>
      <Route path="/" element={<AuthPage />} />

      {/* Route yang dilindungi */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-transaction"
        element={
          <ProtectedRoute>
            <AddTransaction />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/update-password"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/akun"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      <Route
        path="/utang"
        element={
          <ProtectedRoute>
            <DebtPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  </BrowserRouter>
);
