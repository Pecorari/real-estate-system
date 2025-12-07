import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/ui/Card";
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, Cell } from "recharts";

import api from "../../hooks/useApi";

const Dashboard = () => {
  const [resumoArquivos, setResumoArquivos] = useState({
    total: 0,
    ativos: 0,
    encerrados: 0,
    inadimplentes: 0,
  });
  const [resumoClientes, setResumoClientes] = useState({
    total: 0,
    locadores: 0,
    locatarios: 0,
  });

  useEffect(() => {
    const fetchResumoArquivos = async () => {
      try {
        const { data } = await api.get('/arquivos/resumo');
        setResumoArquivos(data);
      } catch (err) {
        console.log("Erro:", err);
      }
    };

    const fetchResumoClientes = async () => {
      try {
        const { data } = await api.get("/clientes/resumo");
        setResumoClientes(data);
      } catch (err) {
        console.log("Erro:", err);
      }
    };

    fetchResumoArquivos();
    fetchResumoClientes();
  }, []);

  const dataBar = [
    { name: "Ativos", value: resumoArquivos.ativos },
    { name: "Encerrados", value: resumoArquivos.encerrados },
    { name: "Inadimplentes", value: resumoArquivos.inadimplentes }
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Navbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <h2 className="text-lg font-semibold">Total de Clientes</h2>
              <p className="text-2xl font-bold mt-2">{resumoClientes.total}</p>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">Locadores</h2>
              <p className="text-2xl font-bold mt-2">{resumoClientes.locadores}</p>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">Locatarios</h2>
              <p className="text-2xl font-bold mt-2">{resumoClientes.locatarios}</p>
            </Card>
          </div>

          <br /><hr /><hr /><hr /><br />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 mb-10">
            <Card>
              <h2 className="text-lg font-semibold">Total de Arquivos</h2>
              <p className="text-2xl font-bold mt-2">{resumoArquivos.total}</p>
            </Card>
            
            <div className="bg-lime-600 text-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg">Arquivos Ativos</h2>
              <p className="text-3xl font-bold mt-2">{resumoArquivos.ativos}</p>
            </div>

            <div className="bg-zinc-500 text-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg">Arquivos Encerrados</h2>
              <p className="text-3xl font-bold mt-2">{resumoArquivos.encerrados}</p>
            </div>

            <div className="bg-amber-600 text-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg">Inadimplentes</h2>
              <p className="text-3xl font-bold mt-2">{resumoArquivos.inadimplentes}</p>
            </div>
          </div>

          <div className="w-full flex justify-center mt-10">
            <div className="w-full md:w-1/2 bg-white p-4 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-10 text-center">Resumo dos Arquivos</h2>

              <ResponsiveContainer width="70%" height={350} style={{ margin: "auto" }}>
                <BarChart data={dataBar}>
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} >
                    <Cell fill="oklch(64.8% 0.2 131.684)" />
                    <Cell fill="oklch(55.2% 0.016 285.938)" />
                    <Cell fill="oklch(66.6% 0.179 58.318)" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
