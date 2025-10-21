import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const body = await req.json();

    const payload = [
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
        },
        params: {},
        query: {},
        body: {
          ...body,
          usuario: session.user.email,
          ...(body.status === "reprovado" && { motivo: body.mensagem })
        },
        webhookUrl: "http://187.32.243.161:5678/webhook/pedidos-aprovados",
        executionMode: "production"
      }
    ];

    const res = await fetch("http://srv.gcsagro.com.br:5678/webhook/pedidos-aprovados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    if (!text || text.trim() === "") {
      console.warn("⚠️ Webhook respondeu sem corpo.");
      return NextResponse.json({ status: "ok (sem resposta)" });
    }

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch (err) {
      console.error("❌ Erro ao fazer parse do retorno:", err);
      return NextResponse.json({ erro: "Retorno inválido do webhook", raw: text }, { status: 200 });
    }

  } catch (error) {
    console.error("Erro ao enviar aprovação:", error);
    return NextResponse.json({ error: "Falha interna" }, { status: 500 });
  }
}