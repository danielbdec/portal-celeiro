import https from "https";
import fs from "fs";
import path from "path";
import next from "next";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = next({ dev: false });
const handle = app.getRequestHandler();

const options = {
  key: fs.readFileSync(path.join(__dirname, "certs", "privkey.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "fullchain.pem")),
};

app.prepare().then(() => {
  https.createServer(options, (req, res) => {
    handle(req, res);
  }).listen(3003, "0.0.0.0", () => {
    console.log("✅ Rodando em: https://portal.celeirosementes.com.br:3003");
  });
});
