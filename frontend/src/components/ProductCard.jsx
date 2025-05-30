import React from "react";

const ProductCard = ({ nome, preco, imagem, link }) => {
  return (
    <div className="flex justify-center align-middle w-80 h-100">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 rounded shadow hover:shadow-lg"
      >
        <img src={imagem} alt={nome} className="w-60 h-60" />
        <h2>{nome}</h2>
        <p className="text-black font-bold">{preco}</p>
      </a>
    </div>
  );
};

export default ProductCard;
