import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cnpj, ie } = body;

    const res = await fetch("http://srv.gcsagro.com.br:5678/webhook/consulta-cliente-portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cnpj, ie }),
    });

    if (!res.ok) {
      console.error("Resposta HTTP não OK do n8n:", res.status);
      return NextResponse.json({ error: "Erro ao consultar cliente no ERP" }, { status: res.status });
    }

    const json = await res.json();
    const payload = Array.isArray(json) ? json[0] : json;

    if (typeof payload?.existe === "boolean") {
      return NextResponse.json(payload);
    }

    return NextResponse.json({ error: "Resposta inesperada do ERP" }, { status: 502 });
  } catch (error) {
    console.error("Erro ao consultar cliente no ERP:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
