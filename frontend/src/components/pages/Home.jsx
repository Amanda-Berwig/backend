import React from "react";
import ProductCard from "../ProductCard";
import useProdutosFarmacias from "../hooks/useProdutosFarmacias";

const Home = () => {
  const {
    produtosFarmacia1,
    produtosFarmacia2,
    produtosFarmacia3,
    loading,
    erro,
  } = useProdutosFarmacias();

  if (loading) return <div>Carregando...</div>;
  if (erro) return <div>{`Erro ao carregar os produtos: ${erro}`}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 bg-amber-400">
        Produtos da Farmácia São João
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {produtosFarmacia1.map((produto, index) => (
          <ProductCard key={index} {...produto} />
        ))}
      </div>

      <h2 className="text-xl font-bold my-6 bg-red-500">
        Produtos da Farmácia Drogasil
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {produtosFarmacia2.map((produto, index) => (
          <ProductCard key={index} {...produto} />
        ))}
      </div>
      <h2 className="text-xl font-bold my-6 bg-red-500">
        Produtos da Farmácia Panvel
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {produtosFarmacia3.map((produto, index) => (
          <ProductCard key={index} {...produto} />
        ))}
      </div>
    </div>
  );
};

export default Home;
