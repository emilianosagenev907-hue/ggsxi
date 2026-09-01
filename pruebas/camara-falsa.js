/* Cámara de mentira para las pruebas.
   Reemplaza getUserMedia por un canvas que dibuja un libro sobre un fondo
   oscuro. Desde la prueba se cambia la escena con window.__camara.pintar({...})
   para simular que pasás la hoja, que tapás el libro con la mano, etc. */
(() => {
  "use strict";

  const ANCHO = 1280, ALTO = 720;

  const lienzo = document.createElement("canvas");
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext("2d");

  const escena = {
    hoja: true,        // false = la mano tapa el libro
    doble: false,      // libro abierto (dos hojas y el pliegue en el medio)
    x: 0.20, y: 0.06, w: 0.60, h: 0.88,
    pliegue: 0.5,      // dónde cae el pliegue dentro de la hoja doble
    semilla: 1         // cambia el "texto", para que sea otra página
  };

  function renglones(x, y, w, h, semilla) {
    ctx.fillStyle = "#303030";
    let n = 0;
    for (let fila = y + h * 0.08; fila < y + h * 0.92; fila += h * 0.055) {
      const largo = 0.62 + 0.34 * ((Math.sin((n + semilla * 7.3) * 12.9898) + 1) / 2);
      ctx.fillRect(x + w * 0.09, fila, w * 0.82 * largo, Math.max(2, h * 0.016));
      n++;
    }
  }

  function dibujar() {
    ctx.fillStyle = "#282828";                      // la mesa, oscura
    ctx.fillRect(0, 0, ANCHO, ALTO);
    if (!escena.hoja) return;

    const x = escena.x * ANCHO, y = escena.y * ALTO;
    const w = escena.w * ANCHO, h = escena.h * ALTO;

    ctx.fillStyle = "#f0f0f0";                      // el papel
    ctx.fillRect(x, y, w, h);

    if (escena.doble) {
      // el pliegue del medio: sombra, pero más claro que la mesa (las hojas se tocan)
      const corte = x + w * escena.pliegue;
      ctx.fillStyle = "#aeaeae";
      ctx.fillRect(corte - w * 0.02, y, w * 0.04, h);
      renglones(x, y, w * escena.pliegue - w * 0.03, h, escena.semilla);
      renglones(corte + w * 0.03, y, w * (1 - escena.pliegue) - w * 0.03, h, escena.semilla + 40);
    } else {
      renglones(x, y, w, h, escena.semilla);
    }
  }

  dibujar();
  // repintar seguido mantiene el flujo vivo aunque la escena no cambie
  setInterval(dibujar, 40);
  const flujo = lienzo.captureStream(25);

  window.__camara = {
    escena,
    pintar(cambios) { Object.assign(escena, cambios || {}); dibujar(); }
  };

  navigator.mediaDevices.getUserMedia = async () => flujo;
})();
