"use client";

import { useEffect, useState } from "react";
import { Modal, message, Spin, Button } from "antd";

export default function AssinaturaDigitalAutoPage() {
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [ativo, setAtivo] = useState<boolean>(false);
  const [erro, setErro] = useState<boolean>(false);
  const [sucesso, setSucesso] = useState<string>("");

  const carregarStatus = async () => {
    setCarregando(true);
    setErro(false);
    setSucesso("");
    try {
      const res = await fetch("/api/worflow-consulta-assinatura-digital", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErro(true);
        return;
      }
      setAtivo(!!data.active);
    } catch (e) {
      console.error(e);
      setErro(true);
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
      // IMPORTANTÍSSIMO: classes globais para sobrescrever o estilo do Antd no botão primário
      okButtonProps: {
        className: "btn-ok-gray",
      },
      cancelButtonProps: {
        className: "btn-cancel-green",
      },
      onOk: async () => {
        setSalvando(true);
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
            message.error("❌ Não foi possível alterar o status. Tente novamente.");
            return;
          }
          setAtivo(novo);
          const msg = data?.message || (novo ? "Workflow Ativado" : "Workflow Desativado");
          setSucesso(`✅ ${msg}`);
          message.success(msg);
        } catch (e) {
          console.error(e);
          message.error("❌ Erro ao comunicar com a API.");
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
      {/* Estilos globais que afetam o portal do Modal.confirm */}
      <style jsx global>{`
        /* Botão OK (primário do Antd) deve ser CINZA */
        .btn-ok-gray.ant-btn-primary {
          background-color: #ccc !important;
          color: #000 !important;
          border: none !important;
          border-radius: 20px !important;
          font-weight: 700 !important;
          box-shadow: none !important;
        }
        .btn-ok-gray.ant-btn-primary:hover,
        .btn-ok-gray.ant-btn-primary:focus {
          background-color: #bfbfbf !important;
          color: #000 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        /* Botão Cancelar (default) deve ser VERDE */
        .btn-cancel-green.ant-btn-default {
          background-color: #6cbf3c !important;
          color: #fff !important;
          border: none !important;
          border-radius: 20px !important;
          font-weight: 700 !important;
          box-shadow: none !important;
        }
        .btn-cancel-green.ant-btn-default:hover,
        .btn-cancel-green.ant-btn-default:focus {
          background-color: #5aa732 !important;
          color: #fff !important;
          box-shadow: none !important;
          outline: none !important;
        }
        /* Remove aro azul padrão do foco do Antd nos botões do modal */
        .ant-modal-confirm-btns .ant-btn:focus-visible {
          outline: none !important;
        }
      `}</style>

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
        ) : erro ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "1rem", color: "#d63031", fontWeight: "bold" }}>
              ⚠️ Não foi possível consultar o status.
            </div>
            <Button
              type="primary"
              style={{
                background: "#6cbf3c",
                border: "none",
                borderRadius: 20,
                fontWeight: "bold",
                padding: "0 20px",
              }}
              onClick={carregarStatus}
            >
              🔄 Tentar novamente
            </Button>
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            <div style={{ marginBottom: "1rem" }}>
              <strong style={{ color: "#1e4321", fontSize: 16 }}>📄 Envio Automático de Contratos</strong>
              <div style={{ color: "#4b704b", marginTop: 6 }}>
                Habilite para que contratos sejam enviados automaticamente para assinatura digital.
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

            {sucesso && (
              <div style={{ marginTop: "1rem", color: "#27ae60", fontWeight: 600 }}>{sucesso}</div>
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
