/* Pruebas del escáner y del lector.
   Levanta el index.html en un servidor local, lo abre en un Chromium con una
   cámara de mentira (pruebas/camara-falsa.js) y comprueba que escanee, que
   parta el libro abierto en dos hojas, que el lector haga zoom y pase solo,
   y que el PDF salga armado.

   Correr:  node pruebas/pruebas.mjs        (agregar --ver para mirarlo)
*/
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes("--ver");

/* ---------- playwright, esté instalado acá o global ---------- */
async function cargarNavegador() {
  try {
    return (await import("playwright")).chromium;
  } catch (e) {
    const global = execSync("npm root -g").toString().trim();
    const modulo = await import(pathToFileURL(path.join(global, "playwright", "index.js")).href);
    const chromium = modulo.chromium || (modulo.default && modulo.default.chromium);
    if (!chromium) throw new Error("Falta playwright: npm i -D playwright");
    return chromium;
  }
}

/* ---------- servidor de archivos ---------- */
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

function servir() {
  const servidor = http.createServer((pedido, respuesta) => {
    const relativo = decodeURIComponent(pedido.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
    const archivo = path.join(RAIZ, relativo);
    if (!archivo.startsWith(RAIZ) || !fs.existsSync(archivo) || fs.statSync(archivo).isDirectory()) {
      respuesta.writeHead(404).end("no está");
      return;
    }
    respuesta.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream" });
    fs.createReadStream(archivo).pipe(respuesta);
  });
  return new Promise((listo) => servidor.listen(0, "127.0.0.1", () => listo(servidor)));
}

/* ---------- comprobaciones ---------- */
let bien = 0, mal = 0;

function esperar(condicion, texto) {
  if (condicion) { bien++; console.log("  ✓ " + texto); }
  else { mal++; console.log("  ✗ " + texto); }
}

function cerca(valor, esperado, tolerancia, texto) {
  esperar(Math.abs(valor - esperado) <= tolerancia,
          `${texto} (${Number(valor).toFixed(3)} ≈ ${esperado} ±${tolerancia})`);
}

async function hasta(pagina, funcion, mensaje, limite = 12000) {
  const arranque = Date.now();
  while (Date.now() - arranque < limite) {
    if (await pagina.evaluate(funcion)) return true;
    await pagina.waitForTimeout(120);
  }
  throw new Error("se acabó la paciencia esperando: " + mensaje);
}

/* ---------- las pruebas ---------- */
async function principal() {
  const chromium = await cargarNavegador();
  const servidor = await servir();
  const puerto = servidor.address().port;

  const navegador = await chromium.launch({ headless: !VER });
  const contexto = await navegador.newContext({
    viewport: { width: 420, height: 860 },
    acceptDownloads: true
  });
  await contexto.addInitScript({ path: path.join(RAIZ, "pruebas", "camara-falsa.js") });

  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on("pageerror", (e) => errores.push(String(e)));

  await pagina.goto(`http://127.0.0.1:${puerto}/index.html`);
  await pagina.waitForFunction(() => window.__escaner);

  console.log("\nCuentas sueltas");
  const cuentas = await pagina.evaluate(() => {
    const { detectarPagina, buscarPliegue, partirEnDos, acotarEje } = window.__escaner;

    // una hoja clara en el medio de un fondo oscuro
    const ancho = 192, alto = 108;
    const gris = new Uint8ClampedArray(ancho * alto).fill(30);
    for (let y = 10; y < 98; y++) for (let x = 40; x < 150; x++) gris[y * ancho + x] = 230;
    const caja = detectarPagina(gris, ancho, alto);

    // una hoja doble con la sombra del pliegue al 60%
    const anchoD = 200, altoD = 120;
    const doble = new Uint8ClampedArray(anchoD * altoD).fill(235);
    for (let y = 0; y < altoD; y++) for (let x = 117; x < 123; x++) doble[y * anchoD + x] = 120;
    const pliegue = buscarPliegue(doble, anchoD, altoD);

    return {
      caja,
      pliegue,
      apaisado: partirEnDos(document.createElement("canvas"), { x: 0, y: 0, w: 100, h: 100 }),
      // la hoja entra entera en la pantalla: queda centrada, sin desplazamiento
      centrada: acotarEje(400, 300, 1, 55),
      // agrandada al doble, arrastrando a full: se frena pegada al borde
      pegada: acotarEje(400, 300, 2, 999),
      pegadaAlOtro: acotarEje(400, 300, 2, -999)
    };
  });

  esperar(cuentas.caja !== null, "encuentra la hoja sobre el fondo oscuro");
  cerca(cuentas.caja.x, 40 / 192, 0.02, "el borde izquierdo cae donde va");
  cerca(cuentas.caja.w, 110 / 192, 0.03, "el ancho de la hoja es el que se dibujó");
  cerca(cuentas.pliegue.x, 0.6, 0.03, "el pliegue aparece donde está la sombra");
  esperar(cuentas.pliegue.hundimiento > 0.06, "la sombra del pliegue se nota lo suficiente");
  esperar(cuentas.apaisado === null, "una hoja más alta que ancha no se parte en dos");
  cerca(cuentas.centrada, 0, 0.01, "la hoja chica queda centrada");
  cerca(cuentas.pegada, -50, 0.01, "la hoja grande se frena pegada a un borde");
  cerca(cuentas.pegadaAlOtro, -250, 0.01, "y también pegada al otro, sin dejar hueco");

  console.log("\nEscáner");
  await pagina.click("#btnIniciar");
  await hasta(pagina, () => !document.getElementById("vistaCamara").classList.contains("activa") === false
                            && document.getElementById("inicio").style.display === "none",
              "que arranque la cámara");
  esperar(true, "la cámara arranca y se ve el escáner");

  await hasta(pagina, () => window.__escaner.ultimaCaja !== null, "que detecte la hoja");
  esperar(true, "detecta la hoja del libro en el video");

  await hasta(pagina, () => window.__escaner.paginas.length >= 1, "la primera captura sola");
  esperar(true, "captura sola cuando la hoja se queda quieta");

  // pasar la hoja: la mano cruza el cuadro y aparece otra página
  await pagina.evaluate(() => window.__camara.pintar({ hoja: false }));
  await pagina.waitForTimeout(700);
  await pagina.evaluate(() => window.__camara.pintar({ hoja: true, semilla: 9 }));
  await hasta(pagina, () => window.__escaner.paginas.length >= 2, "la segunda captura");
  esperar(true, "al pasar la hoja captura la siguiente");

  const antesDeQuieto = await pagina.evaluate(() => window.__escaner.paginas.length);
  await pagina.waitForTimeout(2500);
  esperar(await pagina.evaluate(() => window.__escaner.paginas.length) === antesDeQuieto,
          "con la misma hoja quieta no repite la captura");

  console.log("\nLibro abierto en dos hojas");
  await pagina.click("#btnDoble");
  esperar(await pagina.evaluate(() => window.__escaner.doble), "el botón Doble queda encendido");

  const antesDeDoble = await pagina.evaluate(() => window.__escaner.paginas.length);
  await pagina.evaluate(() => window.__camara.pintar({ hoja: false }));
  await pagina.waitForTimeout(700);
  await pagina.evaluate(() => window.__camara.pintar({
    hoja: true, doble: true, semilla: 21, x: 0.05, y: 0.04, w: 0.90, h: 0.92, pliegue: 0.52
  }));
  await pagina.evaluate((antes) => { window.__antesDoble = antes; }, antesDeDoble);
  await hasta(pagina, () => window.__escaner.paginas.length > window.__antesDoble,
              "la captura de la hoja doble");
  await pagina.waitForTimeout(600);   // por si la segunda mitad todavía se está guardando

  const nuevas = await pagina.evaluate((antes) => {
    const p = window.__escaner.paginas;
    return p.slice(antes).map((x) => ({ ancho: x.ancho, alto: x.alto }));
  }, antesDeDoble);

  esperar(nuevas.length === 2, `el libro abierto se guarda como dos hojas (guardó ${nuevas.length})`);
  if (nuevas.length === 2) {
    esperar(nuevas.every((h) => h.alto > h.ancho), "cada mitad queda vertical, como una página");
    cerca(nuevas[0].ancho / nuevas[1].ancho, 1, 0.15, "las dos mitades salen parecidas");
  }

  console.log("\nLector");
  const total = await pagina.evaluate(() => window.__escaner.paginas.length);
  await pagina.click("#irBiblioteca");
  await pagina.click("#grilla .tarjeta img");
  esperar(await pagina.textContent("#posicion") === `1 / ${total}`, "abre en la hoja que tocaste");

  await pagina.keyboard.press("ArrowRight");
  esperar(await pagina.textContent("#posicion") === `2 / ${total}`, "la flecha derecha pasa de hoja");
  await pagina.keyboard.press("ArrowLeft");
  esperar(await pagina.textContent("#posicion") === `1 / ${total}`, "la flecha izquierda vuelve");

  // tocar el costado derecho pasa de hoja
  const zona = await pagina.locator("#zonaLectura").boundingBox();
  await pagina.mouse.click(zona.x + zona.width * 0.88, zona.y + zona.height / 2);
  esperar(await pagina.textContent("#posicion") === `2 / ${total}`, "tocar a la derecha pasa de hoja");
  await pagina.mouse.click(zona.x + zona.width * 0.10, zona.y + zona.height / 2);
  esperar(await pagina.textContent("#posicion") === `1 / ${total}`, "tocar a la izquierda vuelve");

  // arrastrar de costado también pasa de hoja
  await pagina.mouse.move(zona.x + zona.width * 0.8, zona.y + zona.height / 2);
  await pagina.mouse.down();
  await pagina.mouse.move(zona.x + zona.width * 0.2, zona.y + zona.height / 2, { steps: 8 });
  await pagina.mouse.up();
  esperar(await pagina.textContent("#posicion") === `2 / ${total}`, "arrastrar hacia el costado pasa de hoja");

  // dos toques en el centro: zoom
  const centroX = zona.x + zona.width / 2, centroY = zona.y + zona.height / 2;
  await pagina.mouse.click(centroX, centroY);
  await pagina.mouse.click(centroX, centroY, { delay: 10 });
  esperar(await pagina.evaluate(() => window.__escaner.zoom) > 1, "dos toques en el centro agrandan la hoja");

  // con zoom, arrastrar mueve la hoja en vez de pasar de página
  const posicionConZoom = await pagina.textContent("#posicion");
  await pagina.mouse.move(centroX + 60, centroY);
  await pagina.mouse.down();
  await pagina.mouse.move(centroX - 60, centroY, { steps: 8 });
  await pagina.mouse.up();
  esperar(await pagina.textContent("#posicion") === posicionConZoom, "con zoom, arrastrar no pasa de hoja");
  esperar(await pagina.evaluate(() => window.__escaner.desplazamiento.x) < 0, "con zoom, arrastrar corre la hoja");

  await pagina.keyboard.press("Escape");
  esperar(await pagina.evaluate(() => window.__escaner.zoom) === 1, "Escape vuelve al tamaño normal");

  // un toque solo en el centro esconde las barras (y otro las trae)
  const inmersivo = () => pagina.evaluate(() => document.getElementById("vistaLector").classList.contains("inmersivo"));
  await pagina.mouse.click(centroX, centroY);
  await pagina.waitForTimeout(400);
  esperar(await inmersivo(), "un toque en el centro deja la hoja sola");
  await pagina.mouse.click(centroX, centroY);
  await pagina.waitForTimeout(400);
  esperar(!(await inmersivo()), "otro toque devuelve las barras");

  console.log("\nLectura automática");
  while ((await pagina.textContent("#posicion")) !== `1 / ${total}`) {
    await pagina.keyboard.press("ArrowLeft");
  }
  await pagina.click("#btnLeerSolo");
  esperar(await pagina.evaluate(() => window.__escaner.segundosAuto) === 10, "el botón Auto arranca en 10 s");

  const antesDeAuto = await pagina.textContent("#posicion");
  await pagina.evaluate((texto) => { window.__antes = texto; }, antesDeAuto);
  await hasta(pagina, () => document.getElementById("posicion").textContent !== window.__antes,
              "que pase la hoja sola", 14000);
  esperar(await pagina.textContent("#posicion") !== antesDeAuto, "la hoja pasa sola sin tocar nada");

  await pagina.click("#btnLeerSolo");   // 20 s
  await pagina.click("#btnLeerSolo");   // 40 s
  await pagina.click("#btnLeerSolo");   // apagado
  esperar(await pagina.evaluate(() => window.__escaner.segundosAuto) === 0, "el botón Auto se apaga al dar la vuelta");

  console.log("\nPDF");
  await pagina.click("#volverBib");
  const [descarga] = await Promise.all([
    pagina.waitForEvent("download", { timeout: 20000 }),
    pagina.click("#btnPdf")
  ]);
  const destino = path.join(os.tmpdir(), "prueba-" + Date.now() + ".pdf");
  await descarga.saveAs(destino);
  const pdf = fs.readFileSync(destino);
  const hojas = (pdf.toString("latin1").match(/\/Type \/Page[^s]/g) || []).length;

  esperar(pdf.subarray(0, 5).toString() === "%PDF-", "el archivo es un PDF");
  esperar(hojas === total, `el PDF trae las ${total} hojas (trajo ${hojas})`);
  esperar(pdf.length > 10000, "el PDF pesa lo que pesan las fotos");
  fs.unlinkSync(destino);

  console.log("\nDónde quedaste leyendo");
  await pagina.click("#grilla .tarjeta img");
  await pagina.keyboard.press("ArrowRight");
  await pagina.keyboard.press("ArrowRight");
  esperar(await pagina.textContent("#posicion") === `3 / ${total}`, "quedamos en la hoja 3");

  await pagina.reload();
  await pagina.waitForSelector("#btnSeguir:not([hidden])", { timeout: 8000 });
  esperar((await pagina.textContent("#btnSeguir")).includes(`3/${total}`),
          "al volver a abrir, ofrece seguir en la hoja 3");
  await pagina.click("#btnSeguir");
  esperar(await pagina.textContent("#posicion") === `3 / ${total}`, "y abre justo donde dejaste de leer");

  /* ---------- la misma app, pero en una computadora ----------
     Otra pestaña del mismo contexto: comparte la biblioteca ya escaneada.
     Cerramos la del celular para que su escáner no siga guardando hojas. */
  await pagina.close();

  console.log("\nEn la computadora");
  const pc = await contexto.newPage();
  pc.on("pageerror", (e) => errores.push(String(e)));
  await pc.setViewportSize({ width: 1440, height: 900 });
  await pc.goto(`http://127.0.0.1:${puerto}/index.html`);
  await pc.waitForFunction(() => window.__escaner && window.__escaner.paginas.length > 0);
  await pc.click("#btnIniciar");
  await pc.waitForSelector("#listaCamaras:not([hidden])", { timeout: 8000 });

  esperar(await pc.locator("#btnCamara").isHidden(), "en pantalla ancha, «Girar» deja paso al selector de cámaras");
  esperar((await pc.locator("#listaCamaras option").count()) === 2, "el selector lista las dos webcams (y no el micrófono)");
  // la cámara puede informar un deviceId que no está en la lista; el selector
  // no tiene que quedar en blanco por eso
  esperar(await pc.evaluate(() => document.getElementById("listaCamaras").selectedIndex) >= 0,
          "el selector siempre muestra alguna cámara, nunca en blanco");

  await pc.selectOption("#listaCamaras", "webcam-usb");
  await pc.waitForTimeout(500);
  const pedido = await pc.evaluate(() => window.__camara.ultimaPeticion.video);
  esperar(pedido.deviceId && pedido.deviceId.exact === "webcam-usb", "elegir una cámara la pide por deviceId");
  esperar(!pedido.facingMode, "y deja de pedir la cámara trasera, que en una PC no existe");

  const anchoBoton = (await pc.locator("#btnAuto").boundingBox()).width;
  esperar(anchoBoton < 260, `los botones no se estiran a lo ancho de la pantalla (${Math.round(anchoBoton)} px)`);

  console.log("\nTraer fotos de la computadora");
  await pc.click("#irBiblioteca");
  const antesDeImportar = await pc.evaluate(() => window.__escaner.paginas.length);

  // dos fotos con distinto ancho, y a propósito con los nombres al revés
  await pc.evaluate(async () => {
    const foto = async (ancho, nombre) => {
      const lienzo = document.createElement("canvas");
      lienzo.width = ancho; lienzo.height = 800;
      const ctx = lienzo.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, ancho, 800);
      ctx.fillStyle = "#222";
      for (let y = 60; y < 740; y += 40) ctx.fillRect(40, y, ancho - 120, 12);
      const blob = await new Promise((r) => lienzo.toBlob(r, "image/jpeg", 0.9));
      return new File([blob], nombre, { type: "image/jpeg" });
    };
    await window.__escaner.importarArchivos([await foto(640, "pagina-10.jpg"), await foto(600, "pagina-2.jpg")]);
  });

  const importadas = await pc.evaluate((antes) => window.__escaner.paginas.slice(antes).map((p) => p.ancho), antesDeImportar);
  esperar(importadas.length === 2, `entran las fotos arrastradas de la compu (entraron ${importadas.length})`);
  esperar(importadas[0] === 600 && importadas[1] === 640, "y quedan ordenadas por nombre: la 2 antes que la 10");
  esperar((await pc.locator("#grilla .tarjeta").count()) === antesDeImportar + 2, "la biblioteca las muestra sin recargar");

  // y ahora soltando el archivo de verdad encima de la ventana
  const soltado = await pc.evaluateHandle(async () => {
    const lienzo = document.createElement("canvas");
    lienzo.width = 620; lienzo.height = 800;
    const ctx = lienzo.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 620, 800);
    ctx.fillStyle = "#222";
    for (let y = 60; y < 740; y += 40) ctx.fillRect(40, y, 500, 12);
    const blob = await new Promise((r) => lienzo.toBlob(r, "image/jpeg", 0.9));
    const datos = new DataTransfer();
    datos.items.add(new File([blob], "soltada.jpg", { type: "image/jpeg" }));
    return datos;
  });

  const antesDeSoltar = await pc.evaluate(() => window.__escaner.paginas.length);
  await pc.dispatchEvent("body", "dragenter", { dataTransfer: soltado });
  esperar(await pc.evaluate(() => document.body.classList.contains("soltando")),
          "al arrastrar una foto encima, avisa dónde soltarla");

  await pc.dispatchEvent("body", "drop", { dataTransfer: soltado });
  await pc.waitForFunction((antes) => window.__escaner.paginas.length > antes, antesDeSoltar, { timeout: 8000 });
  esperar(!(await pc.evaluate(() => document.body.classList.contains("soltando"))), "y el aviso se va al soltar");
  esperar(await pc.evaluate(() => window.__escaner.paginas.length) === antesDeSoltar + 1,
          "la foto soltada entra a la biblioteca");

  console.log("\nMouse y teclado");
  const totalPC = await pc.evaluate(() => window.__escaner.paginas.length);
  await pc.click("#grilla .tarjeta img");
  esperar(await pc.textContent("#posicion") === `1 / ${totalPC}`, "abre el lector en la hoja que tocaste");

  const zonaPC = await pc.locator("#zonaLectura").boundingBox();
  await pc.mouse.move(zonaPC.x + zonaPC.width / 2, zonaPC.y + zonaPC.height / 2);
  await pc.mouse.wheel(0, 120);
  await pc.waitForTimeout(150);
  esperar(await pc.textContent("#posicion") === `2 / ${totalPC}`, "la rueda del mouse pasa de hoja");
  await pc.mouse.wheel(0, -120);
  await pc.waitForTimeout(150);
  esperar(await pc.textContent("#posicion") === `1 / ${totalPC}`, "y para el otro lado vuelve");

  await pc.keyboard.down("Control");
  await pc.mouse.wheel(0, -240);
  await pc.keyboard.up("Control");
  await pc.waitForTimeout(150);
  esperar(await pc.evaluate(() => window.__escaner.zoom) > 1, "Ctrl + rueda hace zoom, como en un visor de PDF");

  const paginaAntesDeRueda = await pc.textContent("#posicion");
  await pc.mouse.wheel(0, 200);
  await pc.waitForTimeout(150);
  esperar(await pc.textContent("#posicion") === paginaAntesDeRueda, "con zoom, la rueda mueve la hoja en vez de pasarla");
  esperar(await pc.evaluate(() => window.__escaner.desplazamiento.y) < 0, "y la mueve para abajo");

  await pc.keyboard.press("Escape");
  esperar(await pc.evaluate(() => window.__escaner.zoom) === 1, "Escape vuelve al tamaño normal");

  await pc.keyboard.press("f");
  await pc.waitForTimeout(300);
  esperar(true, "la tecla F no rompe nada (pantalla completa)");

  console.log("\nSin errores en la consola");
  esperar(errores.length === 0, "el navegador no tiró ningún error" + (errores.length ? ": " + errores[0] : ""));

  await navegador.close();
  servidor.close();

  console.log(`\n${bien} bien, ${mal} mal\n`);
  process.exit(mal ? 1 : 0);
}

principal().catch((e) => { console.error("\nse rompió la prueba:", e); process.exit(1); });
