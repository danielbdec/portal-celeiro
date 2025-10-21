import { useEffect, useState } from 'react';
import { Form, Row, Col, InputNumber, Button, Spin, message, Divider, Table, Select } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const antIcon = <LoadingOutlined style={{ fontSize: 32, color: '#234325' }} spin />;
const { Option } = Select;

export default function ModalAreas({ cliente, visivel, onClose }: any) {
  const [form] = Form.useForm();
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [areasCadastradas, setAreasCadastradas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoAreas, setCarregandoAreas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const formatarDocumento = (valor: string) => {
    const doc = valor?.replace(/\D/g, '');
    if (!doc) return '';
    if (doc.length === 11) {
      return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (doc.length === 14) {
      return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return valor;
  };

  const formatarNumero = (valor: number) => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  useEffect(() => {
    if (!visivel || !cliente?.codigo) return;

    setCarregando(true);
    setMunicipios([]);
    setAreasCadastradas([]);
    form.resetFields();

    const payload = {
      codCliente: cliente.codigo
    };

    axios.post('/api/consulta-municipios-cliente', payload)
      .then((resMunicipios) => {
        setMunicipios(resMunicipios.data || []);
      })
      .catch((err) => {
        console.error('Erro ao consultar municipios:', err);
        message.error('Erro ao consultar os municípios do cliente.');
      });

    setCarregandoAreas(true);
    axios.post('/api/consulta-area-cadastrada', payload)
      .then((resAreas) => {
        const resultado = Array.isArray(resAreas.data) ? resAreas.data : [];
        setAreasCadastradas(resultado);
      })
      .catch((err) => {
        console.error('Erro ao consultar áreas cadastradas:', err);
        message.warning('Áreas cadastradas não puderam ser carregadas.');
      })
      .finally(() => {
        setCarregando(false);
        setCarregandoAreas(false);
      });
  }, [visivel, cliente]);

  const enviar = async () => {
    try {
      const values = await form.validateFields();
      const safraGlobal = values.safra_global;

      const resultado = municipios.map((m: any, i: number) => ({
        cod_cliente: cliente.codigo,
        estado: m.estado,
        municipio: m.municipio,
        cod_municipio: m.cod_municipio,
        area: values[`area_${i}`] || 0,
        safra: safraGlobal
      }));

      setEnviando(true);

      const res = await axios.post('/api/cadastra-area-plantada', resultado);

      if (res.data?.[0]?.status === true) {
        message.success(res.data?.[0]?.message || 'Áreas registradas com sucesso!');
        onClose();
      } else {
        message.error('Não foi possível registrar as áreas.');
      }
    } catch (err: any) {
      console.error('Campos com erro:', err?.errorFields || err);
      message.error('Preencha todos os campos antes de enviar.');
    } finally {
      setEnviando(false);
    }
  };

  const colunasTabela = [
    { title: 'Estado', dataIndex: 'estado', key: 'estado' },
    { title: 'Município', dataIndex: 'municipio', key: 'municipio' },
    {
      title: 'Área (ha)',
      dataIndex: 'area',
      key: 'area',
      render: (valor: number) => <b>{formatarNumero(valor)}</b>
    }
  ];

  return visivel ? (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 2147483646 }} />

      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 12, width: 800, maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', zIndex: 2 }}>
          <div style={{ background: "linear-gradient(to right, #1e4321, #47763b)", color: "white", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
            <h5 style={{ margin: 0 }}>Cadastro de Áreas por Município</h5>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", color: "white", cursor: "pointer" }}>×</button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <Divider orientation="left" style={{ color: '#1e4321', fontWeight: 'bold' }}>Dados Cadastrais</Divider>
            {cliente && (
              <div style={{ paddingBottom: '1rem', fontSize: '15px' }}>
                <b>{cliente.codigo} - {cliente.nome}</b><br />
                🧾 {formatarDocumento(cliente.cnpj)}
              </div>
            )}

            <Divider orientation="left" style={{ color: '#1e4321', fontWeight: 'bold' }}>Áreas já cadastradas</Divider>
            <div style={{ marginBottom: '1rem' }}>
              {carregandoAreas ? (
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Spin indicator={antIcon} />
                  <div style={{ marginTop: 8, color: '#234325' }}>Buscando se há áreas cadastradas...</div>
                </div>
              ) : areasCadastradas.length === 0 ? (
                <div style={{ marginTop: '0.5rem', color: '#999' }}>❗Não há áreas cadastradas nesse cliente ainda.</div>
              ) : (
                <Table
                  columns={colunasTabela}
                  dataSource={areasCadastradas.map((item, index) => ({ ...item, key: index }))}
                  title={() => <b style={{ color: '#1e4321', fontSize: '15px' }}>Lista de áreas cadastradas</b>}
                  pagination={false}
                  bordered
                />
              )}
            </div>

            <Divider orientation="left" style={{ color: '#1e4321', fontWeight: 'bold' }}>Novas áreas cadastradas</Divider>
            {carregando ? (
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Spin indicator={antIcon} />
                <div style={{ marginTop: 8, color: '#234325' }}>Carregando municípios...</div>
              </div>
            ) : (
              <Form form={form} layout="vertical">
                <Form.Item
                  name="safra_global"
                  initialValue="2025"
                  label="Safra"
                  rules={[{ required: true, message: 'Selecione a safra.' }]}
                >
                  <Select style={{ width: 200 }}>
                    <Option value="2025">2025</Option>
                  </Select>
                </Form.Item>

                {municipios.map((m, i) => {
                  const areaExistente = areasCadastradas.find(a => a.estado === m.estado && a.municipio === m.municipio);
                  return (
                    <Row key={`${m.cod_municipio}-${i}`} gutter={[16, 16]}>
                      <Col span={8}>
                        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>📍 {m.estado} / {m.municipio}</div>
                      </Col>
                      <Col span={8}>
                        <Form.Item name={`area_${i}`} rules={[{ required: true, message: 'Informe a área.' }]} initialValue={areaExistente?.area || 0}>
                          <InputNumber
                            placeholder="Área em hectares"
                            min={0}
                            disabled={areaExistente !== undefined}
                            formatter={value => `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                            parser={(value: string | undefined): number => Number(value?.replace(/\./g, '').replace(/,/g, '')) || 0}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                })}

                <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                  <Button onClick={onClose} style={{ marginRight: 8 }}>Cancelar</Button>
                  <Button type="primary" onClick={enviar} loading={enviando} disabled={municipios.every((m) => areasCadastradas.some((a) => a.estado === m.estado && a.municipio === m.municipio))}>Salvar Áreas</Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </>
  ) : null;
}