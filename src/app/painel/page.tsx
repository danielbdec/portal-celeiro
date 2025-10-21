"use client";

import { useSession } from "next-auth/react";
import { Spin, Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
  BarChart, Bar
} from "recharts";
import SpinnerDashboard from "@/components/SpinnerDashboard";

const cores = ["#52c41a", "#a0d911", "#bae637", "#fadb14", "#ffd666"];

type PedidoMes = { mes: string; total: number; valor_total: number; };
type PedidoCliente = { nome: string; total: number; };
type PedidoEstado = { estado: string; total: number; };

export default function Home() {
  const { data: session, status } = useSession();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const [dadosPedidosMes, setDadosPedidosMes] = useState<PedidoMes[]>([]);
  const [dadosPorCliente, setDadosPorCliente] = useState<PedidoCliente[]>([]);
  const [dadosPorEstado, setDadosPorEstado] = useState<PedidoEstado[]>([]);
  const [municipiosBase, setMunicipiosBase] = useState(0);
  const [municipiosAtivos, setMunicipiosAtivos] = useState(0);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  const [loadingPedidosPorMes, setLoadingPedidosPorMes] = useState(false);
  const [loadingPedidosPorCliente, setLoadingPedidosPorCliente] = useState(false);
  const [loadingPedidosPorEstado, setLoadingPedidosPorEstado] = useState(false);

  const greenSpinner = <LoadingOutlined style={{ fontSize: 48, color: "#52c41a" }} spin />;
  const perfil = (session?.user?.perfil || "").toLowerCase();
  const [nome, sobrenome] = (session?.user?.name || "").split(" ");

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoadingPedidosPorMes(true);
    fetch("/api/dashboard-pedidos-mes", { method: "POST" })
      .then(res => res.json())
      .then(data => setDadosPedidosMes(data))
      .catch(() => setDadosPedidosMes([]))
      .finally(() => setLoadingPedidosPorMes(false));
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoadingPedidosPorCliente(true);
    fetch("/api/dashboard-pedidos-por-cliente", { method: "POST" })
      .then(res => res.json())
      .then(data => setDadosPorCliente(data))
      .catch(() => setDadosPorCliente([]))
      .finally(() => setLoadingPedidosPorCliente(false));
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoadingPedidosPorEstado(true);
    fetch("/api/dashboard-pedidos-por-estado", { method: "POST" })
      .then(res => res.json())
      .then(data => setDadosPorEstado(data))
      .catch(() => setDadosPorEstado([]))
      .finally(() => setLoadingPedidosPorEstado(false));
  }, [session?.user?.email]);

  useEffect(() => {
    if (!session?.user?.email) return;
    setLoadingMunicipios(true);
    fetch("/api/dashboard-ativacao-municipios", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        const item = Array.isArray(data) && data.length > 0 ? data[0] : { total_base: 0, total_ativos: 0 };
        setMunicipiosBase(item.total_base || 0);
        setMunicipiosAtivos(item.total_ativos || 0);
      })
      .catch(() => {
        setMunicipiosBase(0);
        setMunicipiosAtivos(0);
      })
      .finally(() => setLoadingMunicipios(false));
  }, [session?.user?.email]);

  function formatarMilhoes(valor: number) {
    if (valor >= 1_000_000) {
      return `R$ ${(valor / 1_000_000).toFixed(1)} mi`;
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const totalPedidos = Array.isArray(dadosPedidosMes)
    ? dadosPedidosMes.reduce((acc, item) => acc + (item.total || 0), 0)
    : 0;

  const valorTotalVendido = Array.isArray(dadosPedidosMes)
    ? dadosPedidosMes.reduce((acc, item) => acc + (item.valor_total || 0), 0)
    : 0;

  const totalClientesAtivos = Array.isArray(dadosPorCliente)
    ? dadosPorCliente.filter(cliente => cliente.total > 0).length
    : 0;

  const taxaAtivacao = municipiosBase > 0 ? Math.round((municipiosAtivos / municipiosBase) * 100) : 0;

  if (status === "loading" || loadingLogout) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 9999, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin tip={loadingLogout ? "Saindo..." : "Carregando..."} indicator={greenSpinner} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 6px 18px rgba(0,0,0,0.12)", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", background: "linear-gradient(90deg, #1e4321, #8dc891)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
          🏠 Bem-vindo, {nome} {sobrenome}
        </h1>
        <p style={{ fontSize: "1rem", color: "#444", marginBottom: "0.5rem", overflowWrap: "anywhere", wordBreak: "break-word" }}>
          <span style={{
            display: "inline-block",
            padding: "0.25rem 0.75rem",
            backgroundColor: "#f0f0f0",
            borderRadius: "1rem",
            fontSize: "0.875rem",
            color: "#333",
            maxWidth: "100%"
          }}>
            E-mail: {session?.user?.email}
          </span>
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", marginBottom: "2rem" }}>
        <Card className="kpi-card">
          <h3 style={{ margin: 0, color: "#888", textAlign: "center" }}>Total de Pedidos</h3>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#52c41a", textAlign: "center" }}>{totalPedidos}</h2>
        </Card>

        <Card className="kpi-card">
          <h3 style={{ margin: 0, color: "#888", textAlign: "center" }}>Valor Total Vendido</h3>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#52c41a", textAlign: "center" }}>
            {formatarMilhoes(valorTotalVendido)}
          </h2>
        </Card>

        <Card className="kpi-card">
          <h3 style={{ margin: 0, color: "#888", textAlign: "center" }}>Clientes Ativos</h3>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#52c41a", textAlign: "center" }}>{totalClientesAtivos}</h2>
        </Card>

        <Card className="kpi-card">
          <h3 style={{ margin: 0, color: "#888", textAlign: "center" }}>Ativação de Municípios</h3>
          <h2 style={{ margin: 0, fontSize: "2rem", color: "#faad14", textAlign: "center" }}>{taxaAtivacao}%</h2>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#aaa", textAlign: "center" }}>{municipiosAtivos} de {municipiosBase} municípios</p>
        </Card>
      </div>

      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <Card title="Pedidos por Mês">
          <div style={{ height: 300 }}>
            {loadingPedidosPorMes ? (
              <SpinnerDashboard tip="Carregando pedidos por mês..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosPedidosMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#52c41a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {perfil === "admin" && (
          <Card title="Pedidos por Cliente">
            <div style={{ height: 300 }}>
              {loadingPedidosPorCliente ? (
                <SpinnerDashboard tip="Carregando pedidos por cliente..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPorCliente}
                      dataKey="total"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name }) => name}
                      labelLine={true}
                    >
                      {dadosPorCliente.map((_, i) => (
                        <Cell key={i} fill={cores[i % cores.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        )}

        <Card title="Total Vendido por Estado" style={{ gridColumn: "span 2" }}>
          <div style={{ height: 300 }}>
            {loadingPedidosPorEstado ? (
              <SpinnerDashboard tip="Carregando pedidos por estado..." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="estado" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total">
                    {dadosPorEstado.map((_, i) => (
                      <Cell key={i} fill={cores[i % cores.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .kpi-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .kpi-card:hover {
          transform: scale(1.05);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.25);
        }
        @media (max-width: 768px) {
          .bemvindo {
            justify-content: center !important;
            text-align: center !important;
          }
        }
      `}</style>
    </div>
  );
}
