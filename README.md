# Escáner de libros 📖

Escanea páginas de libros **solo, sin apretar nada**: detecta la hoja, espera a que quede quieta,
la recorta, la endereza de contraste y la guarda en el teléfono. Después las podés leer una por
una o exportarlas todas a un PDF.

Funciona en el navegador del celular, sin instalar nada y sin servidor: las páginas quedan
guardadas en el propio teléfono (IndexedDB).

| Archivo | Qué es |
| --- | --- |
| `index.html` | **El escáner.** Es la app. |
| `filtro.html` | El filtro de cámara con emoji, adaptado a celular. Quedó del contenido anterior del repo. |
| `Kindest.html` | Ese mismo filtro, versión original de PC, sin tocar. |

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

## Cómo se usa

1. Apoyá el libro con **buena luz** y que la hoja se vea más clara que lo que tiene alrededor.
2. Apuntá. Cuando aparece el recuadro **verde**, la hoja está detectada y quieta: se guarda sola.
3. **Pasá la hoja.** Al pasarla, la mano cruza el cuadro y eso habilita la próxima captura.
4. En **Biblioteca** las ves todas, las borrás, o exportás todo a PDF.

Botones del escáner:

- **Auto** — apagalo si preferís disparar vos con el botón redondo.
- **Contraste** — deja el papel blanco y la letra negra. Apagalo para fotos o ilustraciones.
- **Girar** — cambia entre cámara trasera y frontal.
- **Luz** — enciende la linterna. Solo aparece si el teléfono la deja usar desde el navegador.

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

Los números están todos juntos como constantes arriba del `<script>` de `index.html`, con un
comentario de para qué es cada uno. Si dispara de más o de menos, se tocan ahí.

## Detalles

- **Sin librerías externas ni CDN**: todo es JavaScript propio, así que anda aunque te quedes
  sin datos después de abrirla la primera vez.
- **El PDF se arma a mano**, metiendo cada JPEG tal cual (`/DCTDecode`), sin librerías.
- Las fotos se guardan en JPEG con el lado largo a un máximo de 2000 px, para no llenar el teléfono.
- **Nada sale del teléfono**: no hay servidor ni cuenta, las páginas viven en el navegador. Si
  borrás los datos del sitio, se borran.

## Requisitos

- Chrome/Edge/Firefox en Android, o Safari/Chrome en iOS 14.3+.
- Servido por HTTPS.
