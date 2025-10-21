import { NextRequest, NextResponse } from 'next/server';

const N8N_BASE =
  process.env.N8N_BASE_URL?.replace(/\/+$/, '') || 'http://192.168.0.204:5678';
const N8N_WEBHOOK_PATH =
  process.env.N8N_WEBHOOK_PATH || '/webhook/altera-status-wkf-autentique';

// Esta rota recebe { habilitar: boolean } e repassa ao n8n como { status_usr: boolean }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const habilitar = !!body?.habilitar;

    const resp = await fetch(`${N8N_BASE}${N8N_WEBHOOK_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // No seu fluxo do n8n, o IF lê $json.status_usr (true/false) para ativar/desativar
      body: JSON.stringify({ status_usr: habilitar }),
    });

    const data = await resp.json().catch(() => ({}));

    // Esperado do n8n ao ativar: { status: "ok", message: "Workflow Ativado" }
    // Ao desativar: { status: "ok", message: "Workflow Desativado" }
    if (!resp.ok || !data) {
      return NextResponse.json(
        { ok: false, message: 'Falha ao alterar status no n8n.' },
        { status: 500 },
      );
    }

    const ok = data.status === 'ok';
    return NextResponse.json({
      ok,
      message: ok ? data.message || 'Alteração realizada.' : 'Não foi possível alterar.',
      raw: data,
    });
  } catch (e) {
    console.error('Erro altera assinatura digital:', e);
    return NextResponse.json(
      { ok: false, message: 'Erro interno ao alterar status.' },
      { status: 500 },
    );
  }
}