import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json([], { status: 401 });
  }

  const email = session.user.email;

  try {
    const resposta = await fetch("http://187.32.243.161:5678/webhook/historico_ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const dados = await resposta.json();

    // 🔍 Verifica se a resposta é array ou está em 'data'
    const mensagensOriginais = Array.isArray(dados)
      ? dados
      : Array.isArray(dados.data)
        ? dados.data
        : [];

    // 🎯 Formato final esperado pelo ChatWidget
    const mensagens = mensagensOriginais.map((item: any) => ({
      sender: item.tipo === "usuario" ? "user" : "bot",
      text: item.mensagem,
      timestamp: item.data_envio,
    }));

    return NextResponse.json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json([], { status: 500 });
  }
}
