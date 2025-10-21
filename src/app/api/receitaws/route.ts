// src/app/api/receitaws/route.ts
import { NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cnpj = searchParams.get('cnpj');

  if (!cnpj) {
    return new Response(JSON.stringify({ error: 'CNPJ não informado' }), {
      status: 400,
    });
  }

  try {
    const resposta = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: { Accept: 'application/json' },
    });

    return new Response(JSON.stringify(resposta.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Erro ReceitaWS:', error?.message);
    return new Response(JSON.stringify({ error: 'Erro ReceitaWS', detalhe: error?.message }), {
      status: 500,
    });
  }
}
