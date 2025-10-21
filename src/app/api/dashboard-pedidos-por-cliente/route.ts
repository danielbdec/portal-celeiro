import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
  }

  const email = session.user.email;

  const payload = {
    email
  };

  console.log("Enviando para o n8n:", JSON.stringify(payload, null, 2));

  const res = await fetch("http://187.32.243.161:5678/webhook/dashboard-pedidos-por-cliente", {
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
