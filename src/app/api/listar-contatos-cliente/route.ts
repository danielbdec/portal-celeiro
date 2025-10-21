import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch("http://187.32.243.161:5678/webhook/listar-contatos-cliente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text(); // debug opcional
      console.warn("Resposta não-JSON recebida do n8n:", text);
      return NextResponse.json({ error: "Resposta inválida da integração." }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no proxy de cadastro:", error);
    return NextResponse.json({ error: "Erro interno no proxy." }, { status: 500 });
  }
}
