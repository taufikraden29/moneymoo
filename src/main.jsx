import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import AuthPage from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AddTransaction from "./pages/AddTransaction";
import Categories from "./pages/CategoriesPage.jsx";
import { Toaster } from "react-hot-toast";
import UpdatePassword from "./pages/UpdatePassword.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Toaster position="top-center" reverseOrder={false} />

    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-transaction" element={<AddTransaction />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/update-password" element={<UpdatePassword />} />
    </Routes>
  </BrowserRouter>
);
