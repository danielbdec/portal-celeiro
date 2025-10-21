import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    console.warn("Nenhum body enviado. Usando objeto vazio.");
  }

  console.log("Body bruto recebido do front:", JSON.stringify(body, null, 2));

  const { termo, perfil, email } = body as { termo: string; perfil: string; email: string };

  const payload = [
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
      },
      params: {},
      query: {},
      body: {
        termo,
        perfil,
        email: email || session.user.email,
        usuario: session.user.email
      },
      webhookUrl: "http://192.168.0.204:5678/webhook/meus-pedidos-admin",
      executionMode: "production"
    }
  ];

  console.log("Payload enviado ao n8n:", JSON.stringify(payload, null, 2));

  const res = await fetch("http://srv.gcsagro.com.br:5678/webhook/meus-pedidos-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ raw: text }, { status: 200 });
  }
}
