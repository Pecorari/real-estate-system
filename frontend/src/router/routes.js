import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Clientes from "../pages/Clientes/Clientes";
import Arquivos from "../pages/Arquivos/Arquivos";
import DetalhesArquivo from "../pages/Arquivos/DetalhesArquivo/DetalhesArquivo";
import Usuarios from "../pages/Usuarios/Usuarios";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/arquivos" element={<ProtectedRoute><Arquivos /></ProtectedRoute>} />
        <Route path="/arquivos/:id" element={<ProtectedRoute><DetalhesArquivo /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
