// src/hooks/useProdutosFarmacias.js
import { useEffect, useState } from "react";

const useProdutosFarmacias = () => {
  const [produtosFarmacia1, setProdutosFarmacia1] = useState([]);
  const [produtosFarmacia2, setProdutosFarmacia2] = useState([]);
  const [produtosFarmacia3, setProdutosFarmacia3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          fetch("http://localhost:3000/produtos"),
          fetch("http://localhost:3001/produtos"),
          fetch("http://localhost:3002/produtos"),
        ]);

        if (!res1.ok || !res2.ok || !res3.ok) {
          throw new Error("Falha ao carregar os produtos das farmácias");
        }

        const [data1, data2, data3] = await Promise.all([
          res1.json(),
          res2.json(),
          res3.json(),
        ]);

        setProdutosFarmacia1(data1);
        setProdutosFarmacia2(data2);
        setProdutosFarmacia3(data3);
      } catch (error) {
        setErro(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  return {
    produtosFarmacia1,
    produtosFarmacia2,
    produtosFarmacia3,
    loading,
    erro,
  };
};

export default useProdutosFarmacias;
