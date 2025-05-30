import React from "react";
import stringSimilarity from "string-similarity";
import useProdutosFarmacias from "../hooks/useProdutosFarmacias";

// Função para normalizar nomes
const normalizarNome = (nome) =>
  nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/\s+/g, " ") // remove espaços duplicados
    .trim();

const Comparador = () => {
  const { produtosFarmacia1, produtosFarmacia2, loading, erro } =
    useProdutosFarmacias();

  if (loading) return <div>Carregando...</div>;
  if (erro) return <div>{`Erro ao carregar os produtos: ${erro}`}</div>;

  const compararProdutos = () => {
    return produtosFarmacia1
      .map((produto1) => {
        const nome1 = normalizarNome(produto1.nome);

        const match = produtosFarmacia2
          .map((produto2) => ({
            produto2,
            score: stringSimilarity.compareTwoStrings(
              nome1,
              normalizarNome(produto2.nome)
            ),
          }))
          .sort((a, b) => b.score - a.score)[0]; // pega o melhor match

        if (match && match.score > 0.5) {
          return {
            nome: produto1.nome,
            precoFarmacia1: parseFloat(
              produto1.preco.replace("R$", "").replace(",", ".")
            ),
            precoFarmacia2: parseFloat(
              match.produto2.preco.replace("R$", "").replace(",", ".")
            ),
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const produtosComparados = compararProdutos();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Comparador de Preços</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2 text-left">Produto</th>
            <th className="border px-4 py-2">Farmácia São João</th>
            <th className="border px-4 py-2">Farmácia Drogasil</th>
          </tr>
        </thead>
        <tbody>
          {produtosComparados.map((produto, index) => {
            const { nome, precoFarmacia1, precoFarmacia2 } = produto;
            const menorPreco =
              precoFarmacia1 < precoFarmacia2 ? "farm1" : "farm2";
            return (
              <tr key={index}>
                <td className="border px-4 py-2">{nome}</td>
                <td
                  className={`border px-4 py-2 ${
                    menorPreco === "farm1" ? "bg-green-100 font-bold" : ""
                  }`}
                >
                  R$ {precoFarmacia1.toFixed(2).replace(".", ",")}
                </td>
                <td
                  className={`border px-4 py-2 ${
                    menorPreco === "farm2" ? "bg-green-100 font-bold" : ""
                  }`}
                >
                  R$ {precoFarmacia2.toFixed(2).replace(".", ",")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Comparador;
