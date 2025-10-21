'use client';

import { Suspense } from "react";
import { useState } from 'react';
import { Input, Button, message, Form, Row, Col } from 'antd';
import { useSession } from 'next-auth/react';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import ModalAreas from './ModalAreas';

export default function CadastroArea() {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const verdeEscuro = '#234325';

  const formatarDocumento = (valor: string) => {
    const doc = valor?.replace(/\D/g, '');
    if (!doc) return { tipo: '', doc: '' };
    if (doc.length === 11) {
      return { tipo: 'CPF', doc: doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') };
    } else if (doc.length === 14) {
      return { tipo: 'CNPJ', doc: doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') };
    }
    return { tipo: '', doc: valor };
  };

  const buscarCliente = async () => {
    const termo = form.getFieldValue('busca');
    if (!termo || termo.trim().length < 3) {
      message.warning('Digite ao menos 3 caracteres.');
      return;
    }

    if (!session?.user?.email) {
      message.error("Sessão não encontrada.");
      return;
    }

    setBuscando(true);
    try {
      let perfil = 'Não definido';
      const res = await fetch('/api/usuarios');
      const lista = await res.json();
      const emailUsuario = session?.user?.email?.toLowerCase();
      const usuario = lista.find((u: any) => u.email?.toLowerCase() === emailUsuario);
      if (usuario) perfil = usuario.perfil;

      const resposta = await axios.post('/api/consulta-cliente-area', {
        termo: termo.trim(),
        email: session.user.email,
        perfil
      });

      const listaFinal = resposta.data?.[0]?.resultado || resposta.data || [];
      const listaValida = listaFinal.filter((c: any) =>
        !!(c.codigo && c.loja && c.nome && c.cnpj)
      );

      if (listaValida.length > 0) {
        setClientes(listaValida);
      } else {
        setClientes([{ nenhum: true }]);
      }
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      message.error('Erro ao buscar cliente.');
    } finally {
      setBuscando(false);
    }
  };

  const abrirModalAreas = (cliente: any) => {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  return (<Suspense fallback={<div>Carregando...</div>}>
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        fontSize: '2rem',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #2b572d, #8dc891)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Cadastro de Áreas por Município
      </h2>

      <Form form={form} layout="vertical">
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={20}>
            <Form.Item label="Digite CPF, CNPJ, Nome ou Inscrição" name="busca">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              style={{ marginTop: 30, width: '100%' }}
              loading={buscando}
              onClick={buscarCliente}
            >
              Buscar
            </Button>
          </Col>
        </Row>
      </Form>

      {clientes.filter(c => !c.nenhum).map((cliente, index) => {
        const { tipo, doc } = formatarDocumento(cliente.cnpj);

        return (
          <div
            key={index}
            style={{
              borderLeft: `5px solid ${verdeEscuro}`,
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
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b572d' }}>
              {cliente.codigo} - {cliente.nome}
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              🧾 {tipo}: {doc}
            </div>

            <div style={{ marginTop: '0.3rem', fontStyle: 'italic', color: '#888', fontSize: '0.95rem' }}>
              Tipo: {tipo === 'CPF' ? 'Pessoa Física' : tipo === 'CNPJ' ? 'Pessoa Jurídica' : 'Desconhecido'}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button
                type="default"
                onClick={() => abrirModalAreas(cliente)}
                style={{ background: '#6cbf3c', color: '#fff', fontWeight: 'bold', borderRadius: 20 }}
              >
                🌾 Áreas Plantadas
              </Button>
            </div>
          </div>
        );
      })}

      {!!(clientes.length === 1 && clientes[0].nenhum) && (
        <div
          style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            borderLeft: `5px solid ${verdeEscuro}`,
            marginBottom: '2rem'
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#4b704b' }}>🔍</div>
          <div style={{ fontSize: '1rem', color: '#234325' }}>
            Nenhum cliente encontrado com esse termo ou o mesmo não está disponível para sua região.
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b8e6b' }}>
            Tente novamente com outro nome, CPF, CNPJ ou inscrição estadual.
          </div>
        </div>
      )}

      <ModalAreas
        cliente={clienteSelecionado}
        visivel={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  </Suspense>);
}
