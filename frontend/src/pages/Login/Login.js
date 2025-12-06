import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import { useAuth } from "../../context/authContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const { login, error, setError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
    // eslint-disable-next-line
  }, [user]);

  const handleChange = (e) => {
    setError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form.email, form.senha);
    
    if (res.ok) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>

        {error && (
          <p className="mb-3 text-red-600 text-sm text-center bg-red-100 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="E-mail"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            required
          />

          <Button type="submit" className="mt-3 w-full">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
