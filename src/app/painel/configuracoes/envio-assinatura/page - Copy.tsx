"use client";

import { useEffect, useState } from "react";
import { Modal, message, Spin } from "antd";

export default function AssinaturaDigitalAutoPage() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [ativo, setAtivo] = useState<boolean>(false);
  const [erro, setErro] = useState<string>("");
  const [sucesso, setSucesso] = useState<string>("");

  const carregarStatus = async () => {
    setCarregando(true);
    setErro("");
    setSucesso("");
    try {
      const res = await fetch("/api/worflow-consulta-assinatura-digital", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErro("Não foi possível consultar o status no momento.");
        return;
      }
      setAtivo(!!data.active);
    } catch (e) {
      console.error(e);
      setErro("Falha ao consultar o status.");
    } finally {
      setCarregando(false);
    }
  };

  const alternar = async () => {
    Modal.confirm({
      title: ativo ? "Desativar envio automático?" : "Ativar envio automático?",
      content: ativo
        ? "Deseja realmente DESATIVAR o envio automático de contratos para assinatura digital?"
        : "Deseja realmente ATIVAR o envio automático de contratos para assinatura digital?",
      okText: ativo ? "Desativar" : "Ativar",
      cancelText: "Cancelar",
      centered: true,
      okButtonProps: {
        style: {
          backgroundColor: "#ccc",
          color: "#000",
          fontWeight: "bold",
          borderRadius: "20px",
          border: "none",
        },
      },
      cancelButtonProps: {
        style: {
          backgroundColor: "#6cbf3c",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "20px",
          border: "none",
        },
      },
      onOk: async () => {
        setSalvando(true);
        setErro("");
        setSucesso("");
        try {
          const novo = !ativo;
          const res = await fetch("/api/worflow-altera-assinatura-digital", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ habilitar: novo }),
          });
          const data = await res.json();
          if (!res.ok || !data?.ok) {
            setErro("❌ Não foi possível alterar o status. Tente novamente.");
            return;
          }
          setAtivo(novo);
          const msg =
            data?.message || (novo ? "Workflow Ativado" : "Workflow Desativado");
          setSucesso(`✅ ${msg}`);
          message.success(msg);
        } catch (e) {
          console.error(e);
          setErro("❌ Erro ao comunicar com a API.");
        } finally {
          setSalvando(false);
        }
      },
    });
  };

  useEffect(() => {
    carregarStatus();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>
      <h2
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "2rem",
          fontWeight: "bold",
          background: "linear-gradient(90deg, #2b572d, #8dc891)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Assinatura Digital Automática
      </h2>

      {/* Card principal */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          padding: "1.5rem",
          borderLeft: `6px solid ${ativo ? "#6cbf3c" : "#ff4d4f"}`,
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {carregando ? (
          <Spin tip="Carregando status..." size="large" />
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: "1rem" }}>
              <strong style={{ color: "#1e4321", fontSize: 16 }}>
                📄 Envio Automático de Contratos
              </strong>
              <div style={{ color: "#4b704b", marginTop: 6 }}>
                Habilite para que contratos sejam enviados automaticamente para
                assinatura digital.
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                onClick={() => !salvando && alternar()}
                style={{
                  width: 60,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: ativo ? "#6cbf3c" : "#ccc",
                  position: "relative",
                  cursor: salvando ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
                aria-label={ativo ? "Desativar" : "Ativar"}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 2,
                    left: ativo ? 32 : 2,
                    transition: "left 0.3s ease",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "2px 10px",
                  borderRadius: 12,
                  backgroundColor: ativo ? "#6cbf3c" : "#ff4d4f",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                {ativo ? "Habilitado" : "Desabilitado"}
              </div>
            </div>

            {/* Mensagens */}
            {erro && (
              <div
                style={{ marginTop: "1rem", color: "#d63031", fontWeight: 600 }}
              >
                {erro}
              </div>
            )}
            {sucesso && (
              <div
                style={{ marginTop: "1rem", color: "#27ae60", fontWeight: 600 }}
              >
                {sucesso}
              </div>
            )}

            <div style={{ marginTop: "1rem", fontSize: 13, color: "#6b8e6b" }}>
              * As alterações são aplicadas diretamente no workflow do n8n.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
