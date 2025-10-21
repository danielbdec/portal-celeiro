import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { termo } = body;

    const res = await fetch("http://187.32.243.161:5678/webhook/consulta-cliente-contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termo }),
    });

    const json = await res.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
