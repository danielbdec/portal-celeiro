import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const filePath = path.resolve(process.cwd(), "usuarios.json");

function readData() {
  if (!fs.existsSync(filePath)) return [];
  const jsonData = fs.readFileSync(filePath);
  return JSON.parse(jsonData.toString());
}

function writeData(data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const data = readData();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { email, perfil } = req.body;
    if (!email || !perfil) return res.status(400).json({ error: "Dados incompletos" });

    const data = readData();
    const jaExiste = data.find((u: any) => u.email === email);
    if (jaExiste) return res.status(400).json({ error: "Usuário já cadastrado" });

    data.push({ email, perfil });
    writeData(data);
    return res.status(200).json({ sucesso: true });
  }

  if (req.method === "DELETE") {
    const { email } = req.body;
    let data = readData();
    data = data.filter((u: any) => u.email !== email);
    writeData(data);
    return res.status(200).json({ sucesso: true });
  }

  return res.status(405).end();
}
