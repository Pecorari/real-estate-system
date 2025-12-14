import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ReactComponent as Logo } from "../../assets/Logo.svg";

import { useAuth } from "../../context/authContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);

    const res = await login(form.email, form.senha);
    
    if (res.ok) {
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-4">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full">
          <div className="flex justify-center mb-12">
            <Logo className="w-80 h-auto" />
          </div>
          <Card className="w-full max-w-md m-auto">
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

              <div className="mt-5 flex justify-end">
                <Button type="submit" disabled={submitting}>Entrar</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      <p className="text-sm text-gray-500 text-center mt-4 mb-6">
        Desenvolvido por <span>Thiago Pecorari Clemente</span> | {new Date().getFullYear()} MAX IMÓVEIS
      </p>
    </div>
  );
}
