import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const res = await fetch("http://srv.gcsagro.com.br:5678/webhook/pedidos-aprovacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error("Erro ao buscar dados do n8n:", error);
    return NextResponse.json({ error: "Erro ao buscar dados do n8n" }, { status: 500 });
  }
}
