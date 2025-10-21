import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE =
  process.env.N8N_BASE_URL?.replace(/\/+$/, '') || 'http://192.168.0.204:5678';
const N8N_WEBHOOK_PATH =
  process.env.N8N_WEBHOOK_PATH || '/webhook/consulta-status-wkf-autentique';

export async function POST(_req: NextRequest) {
  try {
    const resp = await fetch(`${N8N_BASE}${N8N_WEBHOOK_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Consulta não precisa de payload específico, mas enviaremos um objeto vazio por consistência
      body: JSON.stringify({}),
    });

    const data = await resp.json().catch(() => ({}));

    // Esperado do n8n: { status: "ok"|"erro", active: boolean }
    if (!resp.ok || !data) {
      return NextResponse.json(
        { ok: false, message: 'Falha ao consultar status no n8n.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: data.status === 'ok',
      active: !!data.active,
      raw: data,
    });
  } catch (e) {
    console.error('Erro consulta assinatura digital:', e);
    return NextResponse.json(
      { ok: false, message: 'Erro interno ao consultar status.' },
      { status: 500 },
    );
  }
}