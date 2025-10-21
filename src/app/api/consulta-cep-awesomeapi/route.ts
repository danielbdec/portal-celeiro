import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cep = req.nextUrl.searchParams.get('cep');

  if (!cep || cep.length !== 8) {
    return NextResponse.json({ erro: 'CEP inválido' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
    if (!response.ok) throw new Error('Erro na consulta à AwesomeAPI');

    const data = await response.json();

    return NextResponse.json({
      endereco: data.address || '',
      bairro: data.district || '',
      municipio: data.city || '',
      estado: data.state || '',
      codIbge: data.city_ibge || '',
    });
  } catch (error) {
    return NextResponse.json({ erro: 'Erro ao consultar AwesomeAPI' }, { status: 500 });
  }
}
