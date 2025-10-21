
import { useEffect, useState } from 'react';
import { Form, Row, Col, Input, Select, Button, Space, Divider, message, Spin } from 'antd';
import { PlusOutlined, MinusOutlined, LoadingOutlined } from '@ant-design/icons';
import InputMask from 'react-input-mask';
import axios from 'axios';

const { Option } = Select;
const antIcon = <LoadingOutlined style={{ fontSize: 32, color: '#234325' }} spin />;

export default function ModalContatos({ cliente, visivel, onClose }: any) {
  const [form] = Form.useForm();
  const [contatosExistentes, setContatosExistentes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [encontrado, setEncontrado] = useState<boolean | null>(null);
  const [erroConsulta, setErroConsulta] = useState(false);

  useEffect(() => {
    if (!visivel || !cliente?.codigo || !cliente?.loja) return;

    setErroConsulta(false);
    setEncontrado(null);
    setContatosExistentes([]);
    form.resetFields();
    form.setFieldsValue({ contatos: [{}] });
    setCarregando(true);

    axios.post('/api/consulta-contato-contato', {
      codCliente: cliente.codigo,
      loja: cliente.loja,
    })
      .then((res) => {
        const resposta = res.data?.[0];
        if (resposta?.encontrado) {
          setContatosExistentes(resposta.resultado || []);
          setEncontrado(true);
        } else {
          setEncontrado(false);
        }
      })
      .catch(() => {
        setErroConsulta(true);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [visivel, cliente]);

  const enviarContatos = async () => {
    try {
      const values = await form.validateFields();
      const contatos = values.contatos.map((c: any) => ({
        ...c,
        codCliente: cliente.codigo,
        loja: cliente.loja,
      }));

      setCarregando(true);
      const res = await axios.post('/api/cadastrar-contato-portal', contatos);

      if (Array.isArray(res.data) && res.data[0]?.status === true) {
        message.success(res.data[0]?.message || 'Contatos cadastrados com sucesso!', 3);
        onClose();
      } else {
        message.error('Não foi possível realizar o cadastro. Por favor, tente novamente.', 5);
      }
    } catch (err) {
      console.error(err);
      message.error('Erro ao enviar os dados. Verifique os campos e tente novamente.', 5);
    } finally {
      setCarregando(false);
    }
  };

  
  if (!visivel) return null;

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


  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 2147483647,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        width: 1200,
        maxHeight: '95vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', zIndex: 2
      }}>
        <div style={{
          background: "linear-gradient(to right, #1e4321, #47763b)",
          color: "white",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}>
          <h5 style={{ margin: 0 }}>Contatos do Cliente</h5>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: "1.5rem", color: "white", cursor: "pointer"
          }}>×</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {cliente && (
            <div style={{ paddingBottom: '1rem', fontSize: '15px' }}>
              <b>{cliente.codigo}-{cliente.loja}</b> | 📍 {cliente.endereco} - {cliente.municipio}/{cliente.estado} <br />
              🧾 {cliente.cnpj?.length === 11 ? 'CPF' : 'CNPJ'}: {cliente.cnpj} | IE: {cliente.inscricao}
            </div>
          )}

          {carregando && (
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Spin indicator={antIcon} />
              <div style={{ marginTop: 8, color: '#234325', fontWeight: 500 }}>Carregando contatos...</div>
            </div>
          )}

          {!carregando && erroConsulta && (
            <div style={{ marginTop: '1rem', color: 'red' }}>
              ❌ Houve um erro ao consultar os contatos. Tente novamente mais tarde.
            </div>
          )}

          {!carregando && encontrado === true && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: 8 }}>
              <b>Contatos já cadastrados:</b>
              {contatosExistentes.filter(c => c.nome || c.telefone || c.email).length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {contatosExistentes
                    .filter(c => c.nome || c.telefone || c.email)
                    .map((contato, idx) => (
                      <li key={idx}>
                        {contato.nome || '-'} - {contato.cargo || '-'} | 📞 {contato.ddd || ''} {contato.telefone || ''} | ✉️ {contato.email || ''}
                      </li>
                  ))}
                </ul>
              ) : (
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>
                  📞 Não há contatos cadastrados nesse cliente.
                </div>
              )}
            </div>
          )}

          {!carregando && encontrado === false && (
            <div style={{ marginTop: '1rem', color: '#666', fontStyle: 'italic' }}>
              📞 Não há contatos cadastrados nesse cliente.
            </div>
          )}

          <Divider />

          <Form form={form} layout="vertical" name="contatos_form">
            <Form.List name="contatos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row key={key} gutter={[16, 16]} align="middle" style={{ marginBottom: 8 }}>
                      <Col xs={24} sm={12} md={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'nome']}
                          label="Nome"
                          rules={[{ required: true, message: 'Por favor, insira o nome.' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'cargo']}
                          label="Cargo"
                          rules={[{ required: true, message: 'Por favor, selecione o cargo.' }]}
                        >
                          <Select getPopupContainer={(trigger) => trigger.parentNode}>
                            <Option value="000001">PROPRIETÁRIO/COMPRADOR</Option>
                            <Option value="000002">GERENTE FAZENDA</Option>
                            <Option value="000003">FINANCEIRO</Option>
                           </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'telefone']}
                          label="Telefone"
                          rules={[{ required: true, message: 'Informe o telefone.' }]}
                        >
                          <InputMask mask="(99) 99999-9999" maskChar={null}>
                            {(inputProps: any) => <Input {...inputProps} />}
                          </InputMask>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'email']}
                          label="E-mail"
                          rules={[{ required: true, type: 'email', message: 'Informe um e-mail válido.' }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4}>
                        <Form.Item label=" " colon={false}>
                          <Space>
                            <Button onClick={() => add()} icon={<PlusOutlined />} />
                            {fields.length > 1 && (
                              <Button danger onClick={() => remove(name)} icon={<MinusOutlined />} />
                            )}
                          </Space>
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>

            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <Space>
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="primary" onClick={enviarContatos} loading={carregando}>Cadastrar Contatos</Button>
              </Space>
            </div>
          </Form>
        </div>
      </div>
    </div>
    </div>
  </>
  );
}