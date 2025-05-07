// server.js
const express = require("express");
const app = express();
const port = 3000; // Você pode escolher outra porta

// Middleware para permitir CORS (Cross-Origin Resource Sharing)
// Isso é importante se você for acessar o servidor de outro domínio (por exemplo, um frontend React)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Rota para servir o arquivo JSON
app.get("/produtos", (req, res) => {
  try {
    const produtos = require("./produtos-saojoao.json"); // Caminho para o seu arquivo JSON
    res.json(produtos);
  } catch (error) {
    console.error("Erro ao ler o arquivo JSON:", error);
    res.status(500).send("Erro ao carregar os produtos.");
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
