const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeProdutos() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setDefaultNavigationTimeout(60000);

    console.log("Navegando para a página da São João...");
    await page.goto("https://www.saojoaofarmacias.com.br/higiene", {
      waitUntil: "networkidle2",
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("Aguardando carregamento dos produtos...");
    await autoScroll(page);

    await page
      .waitForSelector(".vtex-product-summary-2-x-element--vitrine", {
        timeout: 10000,
      })
      .catch(() =>
        console.log(
          "Não encontrou o seletor .vtex-product-summary-2-x-element--vitrine"
        )
      );

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

    const produtos = await page.evaluate(() => {
      const listaProdutos = [];
      const produtosElements = document.querySelectorAll(
        ".vtex-product-summary-2-x-element--vitrine"
      );

      if (produtosElements.length === 0) {
        return { error: "Não foi possível encontrar produtos na página" };
      }

      produtosElements.forEach((produto) => {
        try {
          const nomeElement =
            produto.querySelector(".vtex-product-summary-2-x-productBrand") ||
            produto.querySelector(".vtex-product-summary-2-x-brandName ") ||
            produto.querySelector(
              ".vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName.t-body"
            );
          const precoElement =
            produto.querySelector(
              ".sjdigital-custom-apps-7-x-sellingPriceValue"
            ) ||
            produto.querySelector(
              ".sjdigital-custom-apps-7-x-sellingPriceValue"
            ) ||
            produto.querySelector(
              ".sjdigital-custom-apps-7-x-currencyContainer"
            );
          // Acessa o href do elemento pai (a tag <a>)
          const linkElement = produto.parentElement;

          const imagemElement = produto.querySelector(
            ".vtex-product-summary-2-x-imageNormal"
          );

          const nome = nomeElement
            ? nomeElement.innerText.trim()
            : "Nome não encontrado";
          const preco = precoElement
            ? precoElement.innerText.trim()
            : "Preço não encontrado";
          const link =
            linkElement && linkElement.href
              ? linkElement.href
              : "Link não encontrado";

          const imagem = imagemElement
            ? imagemElement.src
            : "Imagem não encontrada";

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
        "produtos-saojoao.json",
        JSON.stringify(produtos, null, 2),
        "utf-8"
      );
      console.log("Arquivo JSON salvo como 'produtos-saojoao.json'");
    }

    // await page.screenshot({ path: "saojoao-screenshot.png" });
    // console.log("Screenshot salvo como 'saojoao-screenshot.png'");

    await browser.close();
    console.log("Navegador fechado");
  } catch (error) {
    console.error("Erro durante o scraping:", error);
  }
}

scrapeProdutos();
