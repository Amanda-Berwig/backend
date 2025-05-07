const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeProdutos() {
  try {
    // Iniciar o navegador com algumas configurações para evitar detecção como bot
    const browser = await puppeteer.launch({
      headless: false, // Definir como true para executar sem interface gráfica
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Configurar um user-agent para parecer um navegador normal
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // Configurar timeout maior para carregamento da página
    await page.setDefaultNavigationTimeout(60000);

    console.log("Navegando para a página da Drogasil...");
    await page.goto(
      "https://www.drogasil.com.br/beleza/cuidados-com-a-pele.html",
      { waitUntil: "networkidle2" } // Esperar até que a rede esteja praticamente inativa
    );

    // Aguardar um tempo para garantir que a página carregue completamente
    // Usando setTimeout com Promise como alternativa a waitForTimeout
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("Aguardando carregamento dos produtos...");

    // Esperar pelo seletor que provavelmente contém os produtos
    // Usando um seletor mais genérico que tem mais chances de funcionar
    await page
      .waitForSelector(".product-item", { timeout: 10000 })
      .catch(() =>
        console.log("Não encontrou o seletor .product-item, tentando outro...")
      );

    // Capturando os dados dos produtos
    const produtos = await page.evaluate(() => {
      const listaProdutos = [];

      // Tentando diferentes seletores que podem conter produtos
      const produtosElements =
        document.querySelectorAll(".product-item") ||
        document.querySelectorAll(".product") ||
        document.querySelectorAll("[data-testid='product-card']");

      if (produtosElements.length === 0) {
        return { error: "Não foi possível encontrar produtos na página" };
      }

      produtosElements.forEach((produto) => {
        try {
          // Tentando diferentes seletores para o nome do produto
          const nomeElement =
            produto.querySelector(".product-name") ||
            produto.querySelector(".product-title") ||
            produto.querySelector("h2") ||
            produto.querySelector("a[title]");

          // Tentando diferentes seletores para o preço
          const precoElement =
            produto.querySelector(".price") ||
            produto.querySelector(".product-price") ||
            produto.querySelector("[data-testid='price']");

          // Tentando diferentes seletores para a imagem
          const imagemElement = produto.querySelector("img");

          // Tentando diferentes seletores para o link
          const linkElement = produto.querySelector("a") || produto;

          const nome = nomeElement
            ? nomeElement.innerText.trim()
            : "Nome não encontrado";
          const preco = precoElement
            ? precoElement.innerText.trim()
            : "Preço não encontrado";
          const imagem = imagemElement
            ? imagemElement.src
            : "Imagem não encontrada";
          const link = linkElement.href || "Link não encontrado";

          listaProdutos.push({ nome, preco, imagem, link });
        } catch (err) {
          console.log("Erro ao processar um produto:", err);
        }
      });

      return listaProdutos;
    });

    if (produtos.error) {
      console.error(produtos.error);
    } else {
      console.log(`Encontrados ${produtos.length} produtos:`);
      console.log(JSON.stringify(produtos, null, 2));

      fs.writeFileSync(
        "produtos-drogasil.json",
        JSON.stringify(produtos, null, 2),
        "utf-8"
      );
      console.log("Arquivo JSON salvo como 'produtos-drogasil.json'");
    }

    // Capturar screenshot para debug
    await page.screenshot({ path: "drogasil-screenshot.png" });
    console.log("Screenshot salvo como 'drogasil-screenshot.png'");

    await browser.close();
    console.log("Navegador fechado");
  } catch (error) {
    console.error("Erro durante o scraping:", error);
  }
}

// Executar a função
scrapeProdutos();

// Dicas para debug:
// 1. Se os seletores não funcionarem, verifique o HTML da página usando o DevTools do navegador
// 2. O site pode ter proteção anti-bot, tente adicionar delays entre as ações
// 3. Alguns sites carregam conteúdo dinamicamente com JavaScript, pode ser necessário esperar mais tempo
// 4. Verifique o screenshot gerado para ver o que o Puppeteer está realmente vendo
