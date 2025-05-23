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
      "https://www.drogasil.com.br/cuidados-diarios/higiene-pessoal.html",
      { waitUntil: "networkidle2" } // Esperar até que a rede esteja praticamente inativa
    );

    // Aguardar um tempo para garantir que a página carregue completamente
    // Usando setTimeout com Promise como alternativa a waitForTimeout
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("Aguardando carregamento dos produtos...");
    await autoScroll(page); // <--- Adiciona isso aqui

    // Esperar pelo seletor que provavelmente contém os produtos
    // Usando um seletor mais genérico que tem mais chances de funcionar
    await page
      .waitForSelector(".product-item", { timeout: 10000 })
      .catch(() =>
        console.log("Não encontrou o seletor .product-item, tentando outro...")
      );

    // Função que faz scroll automático até o final da página
    async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 300;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight - window.innerHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 200);
        });
      });
    }

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
          const precoElement = produto.querySelector(".price-number");
          // produto.querySelector(".product-price") ||
          // produto.querySelector("[data-testid='price']");

          // Tentando diferentes seletores para o link
          const linkElement = produto.querySelector("a") || produto;

          const imagemElement = produto.querySelector(
            "[data-testid='product-image']"
          );
          let imagem = "Imagem não encontrada";

          if (imagemElement) {
            const src = imagemElement.getAttribute("src");
            if (src && src.includes("/_next/image?url=")) {
              try {
                const urlParams = new URLSearchParams(src.split("?")[1]);
                const rawUrl = urlParams.get("url");
                imagem = decodeURIComponent(rawUrl);
              } catch (error) {
                console.error("Erro ao extrair URL real da imagem:", error);
                imagem = "Erro ao extrair imagem";
              }
            } else if (src && !src.startsWith("data:image")) {
              imagem = src;
            }
          }

          const nome = nomeElement
            ? nomeElement.innerText.trim()
            : "Nome não encontrado";
          const preco = precoElement
            ? precoElement.innerText.trim()
            : "Preço não encontrado";

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

    // // Capturar screenshot para debug
    // await page.screenshot({ path: "drogasil-screenshot.png" });
    // console.log("Screenshot salvo como 'drogasil-screenshot.png'");

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
