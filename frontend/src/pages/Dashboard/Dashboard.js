import React, { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import Footer from "../../components/layout/Footer";
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
      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-auto">
          <Navbar />

          <div className="p-6 flex-1">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold">Total de Clientes</h2>
                <p className="text-2xl font-bold mt-2">{resumoClientes.total}</p>
              </Card>
              <Card className="transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold">Locadores</h2>
                <p className="text-2xl font-bold mt-2">{resumoClientes.locadores}</p>
              </Card>
              <Card className="transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold">Locatarios</h2>
                <p className="text-2xl font-bold mt-2">{resumoClientes.locatarios}</p>
              </Card>
            </div>

            <hr /><hr /><hr /><br />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold">Total de Arquivos</h2>
                <p className="text-2xl font-bold mt-2">{resumoArquivos.total}</p>
              </Card>
              
              <Card className="p-6 transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold"><span className="w-4 h-4 rounded-full bg-lime-500 inline-block mr-2"></span>Arquivos Ativos</h2>
                <p className="text-2xl font-bold mt-2">{resumoArquivos.ativos}</p>
              </Card>
              <Card className="p-6 transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold"><span className="w-4 h-4 rounded-full bg-zinc-500 inline-block mr-2"></span>Arquivos Encerrados</h2>
                <p className="text-2xl font-bold mt-2">{resumoArquivos.encerrados}</p>
              </Card>
              <Card className="p-6 transform transition duration-300 hover:scale-101">
                <h2 className="text-lg font-semibold"><span className="w-4 h-4 rounded-full bg-amber-500 inline-block mr-2"></span>Inadimplentes</h2>
                <p className="text-2xl font-bold mt-2">{resumoArquivos.inadimplentes}</p>
              </Card>
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
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
