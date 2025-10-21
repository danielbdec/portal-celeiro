'use client';



import { Suspense } from "react";
import { useState } from 'react';
import { Input, Button, message, Form, Row, Col, Select, notification, Spin } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import InputMask from 'react-input-mask';

const { Option } = Select;

import type { CSSProperties } from 'react';

function validarCNPJouCPF(valor: string): boolean {
  const cnpj = valor.replace(/\D/g, '');

  if (cnpj.length === 11) {
    let soma = 0;
    let resto;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    for (let i = 1; i <= 9; i++) soma += parseInt(cnpj.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cnpj.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cnpj.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(cnpj.substring(10, 11));
  }

  if (cnpj.length === 14) {
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digitos.charAt(1));
  }

  return false;
}


export default function CadastroCliente() {
  const [form] = Form.useForm();
  const [verificando, setVerificando] = useState(false);
  const [carregandoCep, setCarregandoCep] = useState(false);
  const [tipoCliente, setTipoCliente] = useState<'F' | 'J'>('J');
  const [liberado, setLiberado] = useState(false);
  const [carregandoReceita, setCarregandoReceita] = useState(false);
  const [carregandoSubmit, setCarregandoSubmit] = useState(false);
  const [formBloqueado, setFormBloqueado] = useState(false);

  const verdeEscuro = '#234325';

  const spinVerde = <LoadingOutlined style={{ fontSize: 36, color: '#52c41a' }} spin />;

  const buscarEndereco = async () => {
    const cep = form.getFieldValue('cep')?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    setCarregandoCep(true);
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) {
        try {
          const { data: fallbackData } = await axios.get(`/api/consulta-cep-awesomeapi?cep=${cep}`);
          form.setFieldsValue({
            endereco: fallbackData.endereco,
            bairro: fallbackData.bairro,
            municipio: fallbackData.municipio,
            estado: fallbackData.estado,
            codIbge: fallbackData.codIbge,
          });
        } catch {
          // Falha silenciosa
        }
        return;
      }

      form.setFieldsValue({
        endereco: data.logradouro,
        bairro: data.bairro,
        municipio: data.localidade,
        estado: data.uf,
        codIbge: data.ibge,
      });
    } catch {
      
      try {
        const { data: fallbackData } = await axios.get(`/api/consulta-cep-awesomeapi?cep=${cep}`);
        form.setFieldsValue({
          endereco: fallbackData.endereco,
          bairro: fallbackData.bairro,
          municipio: fallbackData.municipio,
          estado: fallbackData.estado,
          codIbge: fallbackData.codIbge,
        });
      } catch {}
    
    } finally {
      setCarregandoCep(false);
    }
  };

  const getCnpjMask = () => (tipoCliente === 'F' ? '999.999.999-99' : '99.999.999/9999-99');

  const blocoStyle = {
  backgroundColor: '#ffffff',
  border: `2px solid ${verdeEscuro}`,
  borderRadius: 8,
  padding: '1rem',
  marginBottom: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

  const tituloBlocoStyle: CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
  color: verdeEscuro,
  marginBottom: '1rem',
  textTransform: 'uppercase',
};

  const onFinish = async (values: any) => {
    const contatos = values.contatos || [];
    const proprietario = contatos.find((c: any) => c.cargo === "000001");

    if (!proprietario || !proprietario.nome || !proprietario.telefone || !proprietario.email) {
      message.error("É obrigatório informar um contato com cargo 000001 - COMPRADOR/PROPRIETARIO com todos os campos preenchidos.");
      return;
    }

    try {
      setCarregandoSubmit(true);
      setFormBloqueado(true);
      const res = await axios.post('/api/cadastrar-cliente-portal', values);
	const retorno = Array.isArray(res.data) ? res.data[0] : res.data;

	if (retorno?.status === true) {
        notification.success({
          message: 'Sucesso!',
          description: `Cliente ${retorno.codigo}-${retorno.loja}-${retorno.nome} cadastrado com sucesso!`,
          duration: 0,
          placement: 'top',
          btn: (
            <Button type="primary" onClick={() => {
              notification.destroy();
              setFormBloqueado(true);
              form.resetFields();
              setCarregandoSubmit(false);
              setFormBloqueado(false);
              setLiberado(false);
            }}>
              OK
            </Button>
          )
        });
      } else {
        setCarregandoSubmit(false);
        setFormBloqueado(false);
        notification.error({
          message: 'Erro na integração',
          description: retorno?.message || 'Não foi possível integrar o cliente, por favor tente novamente.',
          placement: 'top',
        });
      }
    } catch (err) {
      console.error('Erro na integração:', err);
      setCarregandoSubmit(false);
      setFormBloqueado(false);
      setCarregandoSubmit(false);
        setFormBloqueado(false);
        notification.error({
        message: 'Erro ao integrar',
        description: 'Falha ao comunicar com o servidor. Tente novamente mais tarde.',
        placement: 'top',
      });
    }
  };

  return (<Suspense fallback={<div>Carregando...</div>}>
    <Spin
      spinning={carregandoReceita}
      indicator={<LoadingOutlined style={{ fontSize: 48, color: '#52c41a' }} spin />}
      tip={
        <div style={{ marginTop: '1rem', color: '#234325', fontWeight: 'bold', fontSize: '1.2rem' }}>
            Consultando dados...
        </div>
    }
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>
        <h2 style={{
  textAlign: 'center',
  marginBottom: '2rem',
  fontSize: '2rem',
  fontWeight: 'bold',
  background: 'linear-gradient(90deg, #2b572d, #8dc891)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}}>
          Cadastro de Cliente
        </h2>

        <Form
  form={form}
  layout="vertical"
  onFinish={onFinish}
  initialValues={{ tipo: 'J' }}
>
          <div style={blocoStyle}>
            <div style={tituloBlocoStyle}>Identificação</div>
            <Row gutter={16}>
              <Col span={8}>
              <Form.Item name="tipo" label="Tipo de Cliente" rules={[{ required: true }]}>
                  <Select disabled={formBloqueado} onChange={setTipoCliente}>
                    <Option value="F">Pessoa Física</Option>
                    <Option value="J">Pessoa Jurídica</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
              <Form.Item name="cnpj" label="CPF/CNPJ" rules={[{ required: true }, { validator: (_, value) => validarCNPJouCPF(value) ? Promise.resolve() : Promise.reject("CPF ou CNPJ inválido") }]}>
                  <InputMask disabled={formBloqueado}
                    mask={getCnpjMask()}
                    onChange={(e) => {
                      setLiberado(false);
                      form.setFieldValue('cnpj', e.target.value);
                    }}
                    value={form.getFieldValue('cnpj')}
                  >
                    {(inputProps: any) => <Input disabled={formBloqueado} {...inputProps} />}
                  </InputMask>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="ie" label="Inscrição Estadual" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado} onChange={() => setLiberado(false)} />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'left', marginTop: '0.5rem' }}>
              <Button
                type="default"
                icon={<SearchOutlined />}
                loading={verificando}
                disabled={verificando || formBloqueado}
                onClick={async () => {
                  const { cnpj, ie } = form.getFieldsValue();
                  const tipo = tipoCliente;
                  const cnpjLimpo = (cnpj || '').replace(/\D/g, '');

                  if (!cnpj || !ie) {
                    message.warning('Informe CPF/CNPJ e IE antes de consultar.');
                    return;
                  }

                  setVerificando(true);
                  setCarregandoReceita(true);

                  try {
                    const res = await axios.post('/api/consulta-cliente', { cnpj, ie });

                    if (res.data.existe) {
                      setLiberado(false);
                      setCarregandoSubmit(false);
        setFormBloqueado(false);
        notification.error({
                        message: 'Cliente já cadastrado',
                        description: res.data.mensagem || 'Cliente já cadastrado no ERP.',
                        placement: 'topRight',
                      });
                    } else {
                      setLiberado(true);
                      message.success('Cliente não encontrado. Continue o cadastro.');

                      if (tipo === 'J' && cnpjLimpo.length === 14) {
                        try {
                          const receitaRes = await axios.get(`/api/receitaws?cnpj=${cnpjLimpo}`);
                          const dados = receitaRes.data;

                          if (dados.status === 'OK') {
                            form.setFieldsValue({
                              nome: dados.nome,
                              cep: dados.cep?.replace(/\D/g, ''),
                              endereco: `${dados.logradouro || ''} ${dados.complemento || ''}`.trim(),
                              bairro: dados.bairro,
                              estado: dados.uf,
                              email: dados.email,
                              telefone: dados.telefone,
                              nomeFazenda: dados.fantasia || '',
                            });

                            const cepLimpo = dados.cep?.replace(/\D/g, '');
                            if (cepLimpo && cepLimpo.length === 8) {
                              try {
                                const viaCep = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                                form.setFieldsValue({
                                  municipio: viaCep.data.localidade,
                                  codIbge: viaCep.data.ibge,
                                });
                              } catch (err) {
                                console.warn('Erro ao consultar ViaCEP:', err);
                              }
                            }
                          } else {
                            message.warning('CNPJ não encontrado na ReceitaWS.');
                          }
                        } catch (err) {
                          console.warn('Erro na ReceitaWS:', err);
                          message.warning('Erro ao consultar a ReceitaWS.');
                        }
                      }
                    }
                  } catch (error: any) {
                    console.error('Erro ao consultar cliente:', error);
                    setCarregandoSubmit(false);
        setFormBloqueado(false);
        notification.error({
                      message: 'Erro ao consultar cliente',
                      description: error.response?.data?.error || 'Erro ao consultar cliente.',
                      placement: 'topRight',
                    });
                  } finally {
                    setVerificando(false);
                    setCarregandoReceita(false);
                  }
                }}
              >
                Consulta Cadastro
              </Button>
            </div>
          </div>

          <div style={{ ...blocoStyle, opacity: liberado ? 1 : 0.5, pointerEvents: liberado ? 'auto' : 'none' }}>
            <div style={tituloBlocoStyle}>Informações do Grupo</div>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="codGrupo" label="Código do Grupo">
                  <Input disabled={formBloqueado} addonAfter={<SearchOutlined style={{ cursor: 'pointer' }} />} />
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="descGrupo" label="Descrição do Grupo">
                  <Input disabled={formBloqueado} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ ...blocoStyle, opacity: liberado ? 1 : 0.5, pointerEvents: liberado ? 'auto' : 'none' }}>
            <div style={tituloBlocoStyle}>Dados do Cliente</div>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="nome" label="Razão Social / Nome" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="nomeFazenda" label="Nome da Fazenda">
                  <Input disabled={formBloqueado} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email" label="E-mail" rules={[{ type: 'email' }]}>
                  <Input disabled={formBloqueado} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="telefone" label="Telefone">
                  <Input disabled={formBloqueado} placeholder="(99) 99999-9999" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ ...blocoStyle, opacity: liberado ? 1 : 0.5, pointerEvents: liberado ? 'auto' : 'none' }}>
            <div style={tituloBlocoStyle}>Endereço</div>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="cep" label="CEP" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado}
                    addonAfter={
                      carregandoCep ? (
                        <span className="ant-spin-dot ant-spin-dot-spin" style={{ marginRight: 5 }} />
                      ) : (
                        <SearchOutlined style={{ cursor: 'pointer' }} onClick={buscarEndereco} />
                      )
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item name="endereco" label="Endereço" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bairro" label="Bairro" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="estado" label="UF" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado} readOnly style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="municipio" label="Município" rules={[{ required: true }]}>
                  <Input disabled={formBloqueado} readOnly style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="codIbge"
                  label="Código IBGE"
                  rules={[{ required: true, message: 'Obrigatório' }]}
                >
                  <Input disabled={formBloqueado} readOnly style={{ backgroundColor: '#f5f5f5' }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ ...blocoStyle, opacity: liberado ? 1 : 0.5, pointerEvents: liberado ? 'auto' : 'none' }}>
            <div style={tituloBlocoStyle}>Contatos</div>
            <Form.List name="contatos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row gutter={16} key={key} style={{ marginBottom: 12 }}>
                      <Col span={5}>
                        <Form.Item {...restField} name={[name, 'nome']} label="Nome" rules={[{ required: true }]}>
                          <Input disabled={formBloqueado} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...restField} name={[name, 'cargo']} label="Cargo" rules={[{ required: true }]}>
                          <Select disabled={formBloqueado}>
                            <Option value="000001">000001 - COMPRADOR/PROPRIETARIO</Option>
                            <Option value="000002">000002 - GERENTE FAZENDA</Option>
                            <Option value="000003">000003 - FINANCEIRO</Option>
                                                       
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item {...restField} name={[name, 'telefone']} label="Telefone" rules={[{ required: true }]}>
                          <Input disabled={formBloqueado} placeholder="(99) 99999-9999" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...restField} name={[name, 'email']} label="E-mail" rules={[{ type: 'email', required: true }]}>
                          <Input disabled={formBloqueado} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button danger onClick={() => remove(name)} style={{ marginTop: 30 }} disabled={formBloqueado}>
                          Remover
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} style={{ width: "200px" }} disabled={formBloqueado}>
                      + Adicionar Contato
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button
      htmlType="submit"
      loading={carregandoSubmit}
      disabled={verificando || !liberado || carregandoSubmit}
      style={{
        background: "#1b331d",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        color: "#fff",
        border: "none",
        padding: "1.2rem 3.6rem",
        fontSize: "1.3rem",
        fontWeight: "bold",
        borderRadius: "8px"
      }}
    >
              Cadastrar Cliente
            </Button>
          </div>
        </Form>
      </div>
    </Spin>
  </Suspense>);
}
