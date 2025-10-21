
import { useState, useRef, useEffect } from 'react';

export default function ModalCredito({ cliente, visivel, onClose, onStatusUpdate }: any) {
  const statusOriginal = useRef(cliente?.status_credito === 'S');
  const [aprovado, setAprovado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setAprovado(cliente?.status_credito === 'S');
    statusOriginal.current = cliente?.status_credito === 'S';
    setMotivo("");
  }, [cliente]);

  if (!visivel) return null;

  const salvar = async () => {
    if (aprovado !== statusOriginal.current) {
      if (!aprovado && motivo.trim() === "") {
        setErro("Por favor, informe o motivo da reprovação do crédito.");
        return;
      }

      setSalvando(true);
      setErro("");
      setSucesso("");
      try {
        const res = await fetch('/api/grava-status-credito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codigo: cliente.codigo,
            loja: cliente.loja,
            status: aprovado ? 'S' : 'N',
            motivo: aprovado ? undefined : motivo
          })
        });

        const result = await res.json();

        if (!res.ok || !result?.ok) throw new Error('Erro ao salvar');

        if (typeof onStatusUpdate === 'function') {
          onStatusUpdate(cliente.codigo, cliente.loja, aprovado ? 'S' : 'N');
        }

        setSucesso("✅ Status de crédito atualizado com sucesso.");
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err) {
        setErro("❌ Não foi possível alterar o status do crédito. Favor tente novamente.");
        console.error(err);
      } finally {
        setSalvando(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 2147483646
      }} />

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          width: 600,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            background: "linear-gradient(to right, #1e4321, #47763b)",
            color: "white",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
          }}>
            <h5 style={{ margin: 0 }}>Status de Crédito</h5>
            <button onClick={onClose} style={{
              background: "none", border: "none", fontSize: "1.5rem", color: "white", cursor: "pointer"
            }}>×</button>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ border: "1px solid #28a745", borderRadius: "10px", padding: "1rem" }}>
              <strong style={{ color: "#1e4321" }}>📋 Dados Cadastrais:</strong>
              <div style={{ marginTop: "0.75rem", lineHeight: "1.9em" }}>
                <div><b>Código:</b> {cliente.codigo}</div>
                <div><b>Loja:</b> {cliente.loja}</div>
                <div><b>Nome:</b> {cliente.nome}</div>
                <div><b>CPF/CNPJ:</b> {cliente.cnpj}</div>
                <div><b>Inscrição Estadual:</b> {cliente.inscricao}</div>
                <div><b>Município:</b> {cliente.municipio}</div>
                <div><b>Estado:</b> {cliente.estado}</div>
                <div><b>Endereço:</b> {cliente.endereco}</div>
              </div>
            </div>

            <div style={{ border: "1px solid #28a745", borderRadius: "10px", padding: "1rem" }}>
              <strong style={{ color: "#1e4321" }}>💲 Crédito Aprovado:</strong>
              <div onClick={() => setAprovado(!aprovado)} style={{
                marginTop: '1rem',
                width: 60,
                height: 30,
                borderRadius: 15,
                backgroundColor: aprovado ? '#6cbf3c' : '#ccc',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: 26,
                  height: 26,
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 2,
                  left: aprovado ? 32 : 2,
                  transition: 'left 0.3s ease'
                }}></div>
              </div>

              {!aprovado && (
                <div style={{ marginTop: '1rem' }}>
                  <label><strong>Motivo da Reprovação:</strong></label>
                  <textarea
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      resize: 'none'
                    }}
                    rows={3}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    required
                  />
                </div>
              )}

              {erro && <div style={{ marginTop: '1rem', color: 'red', fontWeight: 'bold' }}>{erro}</div>}
              {sucesso && <div style={{ marginTop: '1rem', color: 'green', fontWeight: 'bold' }}>{sucesso}</div>}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={onClose} style={{
                backgroundColor: '#f2c94c',
                color: '#000',
                padding: '8px 18px',
                border: 'none',
                borderRadius: '20px',
                marginRight: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando} style={{
                backgroundColor: '#8dc63f',
                color: '#fff',
                padding: '8px 18px',
                border: 'none',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: salvando ? 'wait' : 'pointer',
                opacity: salvando ? 0.6 : 1
              }}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
