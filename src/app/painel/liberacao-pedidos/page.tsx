"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import ModalDetalhes from "./ModalDetalhes";

function LiberacaoPedidosInner() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("pendente");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any | null>(null);

  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        const response = await fetch("/api/pedidos-aprovacao-consulta", { method: "POST" });
        const data = await response.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarPedidos();
  }, []);

  useEffect(() => {
    const handler = () => {
      console.log("🔄 Evento refreshPedidos recebido, atualizando pedidos...");
      setLoading(true);
      fetch("/api/pedidos-aprovacao-consulta", { method: "POST" })
        .then((res) => res.json())
        .then((data) => setPedidos(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Erro ao atualizar pedidos via evento:", err))
        .finally(() => setLoading(false));
    };

    window.addEventListener("refreshPedidos", handler);
    return () => window.removeEventListener("refreshPedidos", handler);
  }, []);

  const coresStatus: any = {
    pendente: "#FFD700",
    aprovado: "#28a745",
    reprovado: "#dc3545",
    parcial: "#ff8c00",
  };

  const pedidosFiltrados = pedidos.filter((p: any) => {
    const correspondeStatus = filtro === "todos" || p.status_aprovacao === filtro;
    const termoBusca = busca.toLowerCase();
    const correspondeBusca =
      p.cliente_nome?.toLowerCase().includes(termoBusca) ||
      String(p.id).includes(termoBusca) ||
      p.tipo_pedido?.toLowerCase().includes(termoBusca) ||
      p.frete?.toLowerCase().includes(termoBusca) ||
      p.nome_vendedor?.toLowerCase().includes(termoBusca);

    return correspondeStatus && (!busca || correspondeBusca);
  });

  
  const filtrarManualmente = () => {
    const input = document.getElementById("campoBusca");
    if (input) {
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
    }
  };


  const mostrarSegundaBarra = pedidosFiltrados.length > 1;

  return (
    <div style={{ ...(isMobile ? { flexDirection: "column", width: "100%", padding: "1rem" } : {}), padding: "2rem", backgroundColor: "#f9fbf7" }}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #2b572d, #8dc891)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Liberação de Pedidos
      </h2>

      
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          id="campoBusca"
          type="text"
          placeholder="Buscar por nome, número, tipo, frete ou vendedor"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ccc", minWidth: "500px" }}
        />
        <button
          onClick={() => filtrarManualmente()}
          style={{ padding: "10px 16px", background: "#599c2f", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          🔍 Pesquisar
        </button>
      </div>


      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #a8d08d',
            borderTop: '4px solid #599c2f',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ marginTop: '1rem', fontWeight: 'bold', color: '#599c2f' }}>
            Carregando pedidos...
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            {[
              "todos",
              "pendente",
              "aprovado",
              "reprovado",
              "parcial",
            ].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFiltro(status);
                  window.dispatchEvent(new Event("refreshPedidos"));
                }}
                style={{
                  backgroundColor:
                    filtro === status ? coresStatus[status] || "#ddd" : "#f1f1f1",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  color: filtro === status ? "#fff" : "#333",
                  boxShadow:
                    filtro === status ? "0 0 0 2px rgba(0,0,0,0.1)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 6px 12px rgba(0,0,0,0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 4px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {pedidosFiltrados.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                margin: "4rem auto",
                fontSize: "16px",
                fontStyle: "italic",
              }}
            >
              Nenhum pedido encontrado para o filtro selecionado.
            </div>
          )}

          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              style={{
                borderLeft: `5px solid ${coresStatus[pedido.status_aprovacao] || "#ccc"}`,
                backgroundColor: "#fff",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "0.5rem", fontSize: "16px" }}>
                #{pedido.id} - {pedido.cliente_nome.toUpperCase()} - {pedido.municipio}/{pedido.estado}
              </div>

              <div style={{ marginBottom: "0.5rem", fontSize: "14px" }}>
                📦 <strong>Tipo:</strong>{" "}
                <span
                  style={{
                    backgroundColor: pedido.tipo_pedido?.toLowerCase() === "bonificação" ? "#f0ad4e" : "#5cb85c",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {pedido.tipo_pedido || "NÃO INFORMADO"}
                </span>
              </div>
              <div style={{ marginBottom: "0.5rem", fontSize: "14px" }}>
                🌾 <strong>Safra:</strong>{" "}
                <span
                  style={{
                    backgroundColor: "#2b572d",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {pedido.safra || "NÃO INFORMADA"}
                </span>
              </div>

              <div style={{ marginBottom: "0.5rem" }}>
                💰 <strong>Total do Pedido:</strong> R${" "}
                {(pedido.vl_primeira_parc + pedido.vl_segunda_parc).toLocaleString('pt-BR')}
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "1rem",
              }}>
                🚛 <span style={{ background: "#444", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "12px" }}>{pedido.frete}</span>
                | 👤 <span style={{ background: "#6c757d", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "12px" }}>{pedido.nome_vendedor.trim()}</span>
                | 📅 <span style={{ background: "#6c757d", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "12px" }}>{new Date(pedido.data_entrega).toLocaleDateString()}</span>
              </div>

              <button
                onClick={() => setPedidoSelecionado(pedido)}
                style={{
                  backgroundColor: "#599c2f",
                  width: isMobile ? "100%" : "auto",
                  maxWidth: "160px",
                  fontWeight: "bold",
                  transition: "background 0.2s",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🔍 Ver Detalhes
              </button>
            </div>
          ))}

          {mostrarSegundaBarra && pedidosFiltrados.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
              {["todos", "pendente", "aprovado", "reprovado", "parcial"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setFiltro(status);
                    window.dispatchEvent(new Event("refreshPedidos"));
                  }}
                  style={{
                    backgroundColor: filtro === status ? coresStatus[status] || "#ddd" : "#f1f1f1",
                    border: "none",
                    padding: "10px 16px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: filtro === status ? "#fff" : "#333",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.2)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {pedidoSelecionado && (
        <ModalDetalhes
          pedido={pedidoSelecionado}
          onClose={() => setPedidoSelecionado(null)}
        />
      )}
    </div>
  );
}

export default function LiberacaoPedidos() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LiberacaoPedidosInner />
    </Suspense>
  );
}
