import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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
        usuario: session.user.email  // <- aqui vai o e-mail para o n8n
      },
      webhookUrl: "http://192.168.0.204:5678/webhook/consulta-cliente-contato",
      executionMode: "production"
    }
  ];

  const res = await fetch("http://srv.gcsagro.com.br:5678/webhook/consulta-cliente-contato", {
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
