import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const cep = req.nextUrl.searchParams.get('cep');

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ erro: true, message: 'CEP inválido' }, { status: 400 });
  }

  // 1. ViaCEP
  try {
    const viaCep = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 5000 });
    if (viaCep.data?.erro) throw new Error('ViaCEP erro');
    return NextResponse.json({
      logradouro: viaCep.data.logradouro,
      bairro: viaCep.data.bairro,
      localidade: viaCep.data.localidade,
      uf: viaCep.data.uf,
      ibge: viaCep.data.ibge,
    });
  } catch (e1: any) {
    console.warn('[ViaCEP falhou]', e1.message);
  }

  // 2. AwesomeAPI
  try {
    const awesome = await axios.get(`https://api.awesomeapi.com.br/cep/json/${cep}`, { timeout: 5000 });
    return NextResponse.json({
      logradouro: awesome.data.address,
      bairro: awesome.data.district,
      localidade: awesome.data.city,
      uf: awesome.data.state,
      ibge: awesome.data.city_ibge_code,
    });
  } catch (e2: any) {
    console.warn('[AwesomeAPI falhou]', e2.message);
  }

  // 3. OpenCEP
  try {
    const open = await axios.get(`https://opencep.com/v1/${cep}`, { timeout: 5000 });
    console.log('[OpenCEP resposta]', open.data);
    return NextResponse.json({
      logradouro: open.data.logradouro,
      bairro: open.data.bairro,
      localidade: open.data.localidade?.toUpperCase(), // <-- aqui o ajuste
      uf: open.data.uf,
      ibge: open.data.ibge,
    });
  } catch (e3: any) {
    console.warn('[OpenCEP falhou]', e3.message);
  }

  return NextResponse.json({ erro: true, message: 'Não foi possível consultar o CEP' }, { status: 500 });
}
