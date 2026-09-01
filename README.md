# Escáner de libros 📖

Escanea páginas de libros **solo, sin apretar nada**: detecta la hoja, espera a que quede quieta,
la recorta, la endereza de contraste y la guarda en el teléfono. Si le apuntás a un libro abierto,
lo parte por el pliegue y guarda las dos hojas por separado.

Después las leés adentro de la misma app: zoom con los dedos, se pasa tocando a los costados,
arranca donde lo dejaste y, si querés, **pasa las hojas solo** mientras leés. También podés
exportar todo a un PDF.

Anda igual en el celular y en la computadora, en el navegador, sin instalar nada y sin servidor:
las páginas quedan guardadas en el aparato con el que las escaneaste (IndexedDB).

| Archivo | Qué es |
| --- | --- |
| `index.html` | **El escáner.** Es la app. |
| `filtro.html` | El filtro de cámara con emoji, adaptado a celular. Quedó del contenido anterior del repo. |
| `Kindest.html` | Ese mismo filtro, versión original de PC, sin tocar. |
| `pruebas/` | Pruebas automáticas, con una cámara de mentira. |

## Cómo abrirlo en el celular

La cámara del navegador **solo funciona con HTTPS** (o en `localhost`). Mandarte el archivo por
WhatsApp y abrirlo desde la galería no alcanza: hay que servirlo por web.

### GitHub Pages (lo más simple, queda para siempre)

1. En este repo: **Settings → Pages**.
2. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)` y **Save**.
3. Esperá un minuto y abrí desde el celular:
   `https://emilianosagenev907-hue.github.io/ggsxi/`
4. Tocá **Activar cámara** y aceptá el permiso.

Conviene agregarlo a la pantalla de inicio (*Añadir a pantalla de inicio*): se abre como una app
y las páginas escaneadas siguen ahí.

## Cómo abrirlo en la computadora

Tres formas, de la más cómoda a la más simple:

1. **La misma dirección de GitHub Pages** que en el celular. Es lo más práctico: la abrís en
   los dos lados.
2. **Doble clic en `index.html`.** En Chrome y Edge la cámara anda igual desde un archivo suelto
   (te va a pedir permiso). Las páginas se guardan lo mismo.
3. Si tu navegador se niega a dar la cámara desde un archivo suelto, servila local: parada en la
   carpeta, `python -m http.server` y entrás a `http://localhost:8000`.

Ojo: **la biblioteca no es la misma** en la computadora y en el teléfono. Cada navegador guarda
lo suyo. Para pasar las páginas de uno a otro, exportá el PDF, o mandate las fotos y usá
**Agregar fotos** del otro lado.

## Cómo se usa

### Escanear

1. Apoyá el libro con **buena luz** y que la hoja se vea más clara que lo que tiene alrededor.
2. Apuntá. Cuando aparece el recuadro **verde**, la hoja está detectada y quieta: se guarda sola.
3. **Pasá la hoja.** Al pasarla, la mano cruza el cuadro y eso habilita la próxima captura.
4. En **Biblioteca** las ves todas, las borrás, o exportás todo a PDF.

Botones del escáner:

- **Auto** — apagalo si preferís disparar vos con el botón redondo.
- **Doble** — para fotografiar el libro abierto: cada foto se guarda como **dos hojas**,
  cortadas por el pliegue. Con esto escaneás el doble de rápido y después se lee bien en el
  celular, que es lo que no pasa con una hoja doble entera.
- **Contraste** — deja el papel blanco y la letra negra. Apagalo para fotos o ilustraciones.
- **Girar** — cambia entre cámara trasera y frontal.
- **Luz** — enciende la linterna. Solo aparece si el teléfono la deja usar desde el navegador.

### En la computadora

- **Elegir la cámara**: si hay más de una (la de la pantalla y una USB), en vez del botón
  *Girar* aparece una lista con los nombres. La USB casi siempre saca mejor que la integrada.
- **Agregar fotos 📂**: metés fotos que ya tenías sacadas, o las **arrastrás y las soltás**
  encima de la ventana. Entran por el mismo camino que las del escáner (se achican, se les
  levanta el contraste si está prendido, y si está prendido *Doble* se parten por el pliegue).
  Se ordenan solas por nombre, con los números bien: `pagina-2` va antes que `pagina-10`.
- Sirve también sin cámara: si tenés las fotos, la usás de lector y para armar el PDF.
- **La rueda del mouse** pasa de hoja. **Ctrl + rueda** hace zoom, como en un visor de PDF, y
  con zoom la rueda sube y baja por la hoja.
- **F** para pantalla completa.

### Leer

Tocá cualquier hoja de la Biblioteca y se abre el lector:

- **Tocar a la derecha** pasa a la siguiente, **a la izquierda** vuelve. Deslizar también.
- **Tocar en el centro** esconde las barras y deja la hoja sola. Otro toque las trae.
- **Dos toques** en el centro agrandan la hoja; con zoom se arrastra con el dedo para moverse,
  y los costados dejan de pasar de hoja para que no se te vaya sin querer. Pellizcar también
  hace zoom, hasta 4×.
- **Auto ▶** pasa las hojas solo: 10, 20 o 40 segundos, y un toque más lo apaga. Mientras está
  prendido, la barrita verde de arriba muestra cuánto falta y la pantalla no se apaga.
- **⛶** pone la hoja en pantalla completa (solo en pantallas anchas; en el celular ya lo hace
  el toque en el centro).
- Al salir y volver a entrar, arriba de todo aparece **Seguir leyendo** en la hoja donde estabas.
- En la compu andan las flechas, la barra espaciadora, `+` / `-` y `Esc`.

## Cómo decide cuándo disparar

- **Encontrar la hoja:** reduce el cuadro a 192 px, separa claro de oscuro con el método de Otsu
  y se queda con el grupo de píxeles claros más grande. Lo acepta si ocupa entre el 12 % y el
  97 % del cuadro y es bastante rectangular.
- **Esperar a que esté quieta:** 11 análisis seguidos (≈1,1 s) con el recuadro sin moverse.
- **Saber que es una página nueva:** hace falta que la vista se altere — perder la hoja de vista
  o que el recuadro se corra más de un 10 %. Pasar una hoja hace siempre una de las dos.

  Esto último se probó al revés primero, comparando el contenido de la hoja, y **no funciona**:
  medido sobre el video real, la misma página con pulso tembloroso cambia tanto (17,8) como una
  página distinta (18,9). Comparar el contenido quedó solo como freno de duplicados evidentes,
  donde el margen sí es amplio (0,8 contra un umbral de 6).

## Cómo parte el libro abierto en dos

Solo si el botón **Doble** está prendido. Una foto de un libro abierto entra apaisada: más ancha
que alta. Esa proporción (más de 1,15) es la señal de que hay dos páginas, porque una hoja sola
siempre entra vertical.

El corte va por el pliegue: la costura del medio hace sombra, así que se mira el brillo promedio
de cada columna, se suaviza (sin suavizar gana cualquier renglón oscuro suelto) y se busca la
columna más apagada dentro del centro ± 15 %. Si esa sombra no se destaca del papel de al lado
—luz muy pareja, libro casi plano— corta por la mitad exacta, que es donde cae el pliegue igual.
A cada lado del corte se descarta un 1,2 %, que es la parte curva del papel.

Los números están todos juntos como constantes arriba del `<script>` de `index.html`, con un
comentario de para qué es cada uno. Si dispara de más o de menos, se tocan ahí.

## Detalles

- **Sin librerías externas ni CDN**: todo es JavaScript propio, así que anda aunque te quedes
  sin datos después de abrirla la primera vez.
- **El PDF se arma a mano**, metiendo cada JPEG tal cual (`/DCTDecode`), sin librerías.
- Las fotos se guardan en JPEG con el lado largo a un máximo de 2000 px, para no llenar el teléfono.
- **Nada sale del teléfono**: no hay servidor ni cuenta, las páginas viven en el navegador. Si
  borrás los datos del sitio, se borran.

## Pruebas

Hay **60 comprobaciones** automáticas que abren la app en un Chromium con una **cámara de
mentira**: un canvas que dibuja un libro sobre una mesa oscura y que la prueba va cambiando para
simular que pasás la hoja o que la tapás con la mano. Van de punta a punta.

- **Como celular** (pantalla de 420 px): que capture sola, que no repita con la hoja quieta, que
  parta el libro abierto en dos hojas verticales, zoom, zonas de toque, avance automático,
  volver a donde quedaste después de recargar, y el PDF con la cantidad de hojas que va.
- **Como computadora** (1440 px): que aparezca el selector con las dos webcams y que elegir una
  la pida por `deviceId`, que los botones no se estiren, que entren las fotos importadas y las
  soltadas encima, ordenadas por nombre, y que la rueda del mouse pase de hoja y con Ctrl haga
  zoom.

```sh
npm i -D playwright        # una sola vez (o tener playwright global)
node pruebas/pruebas.mjs   # agregá --ver para mirarlo andar
```

## Requisitos

- Chrome/Edge/Firefox en Android, o Safari/Chrome en iOS 14.3+.
- Servido por HTTPS.
