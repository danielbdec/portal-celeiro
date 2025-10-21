import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codCliente } = body;

    const response = await fetch("http://187.32.243.161:5678/webhook/consulta-area-cadastrada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ codCliente }])
    });

    const text = await response.text();

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      return NextResponse.json({ raw: text }, { status: 200 });
    }

  } catch (err) {
    console.error("Erro:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
