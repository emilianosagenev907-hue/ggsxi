# Filtro con cámara 😎

Filtro de cámara con **lector automático de caras** (MediaPipe Face Detection): el emoji se
pega solo a tu cara y podés sacar una foto con el filtro puesto.

| Archivo | Para qué |
| --- | --- |
| `index.html` | **Versión celular** (también anda en PC). Es la que querés abrir en el teléfono. |
| `Kindest.html` | Versión original de PC, tal como estaba. Se deja como referencia. |

## Cómo abrirlo en el celular

La cámara del navegador **solo funciona con HTTPS** (o en `localhost`). Abrir el archivo con
doble clic desde la galería del celu no alcanza: hay que servirlo por web.

### Opción A — GitHub Pages (la más simple, queda para siempre)

1. En este repo: **Settings → Pages**.
2. En *Source* elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)` y **Save**.
3. Esperá un minuto y abrí desde el celular:
   `https://emilianosagenev907-hue.github.io/ggsxi/`
4. Tocá **Activar cámara** y aceptá el permiso.

Podés guardarlo en la pantalla de inicio (*Añadir a pantalla de inicio*) y se abre como una app.

### Opción B — desde tu PC, por la red de casa

Sirve para probar sin publicar nada, pero el celular tiene que estar en el **mismo WiFi**:

```bash
# en la carpeta del proyecto
python3 -m http.server 8000
```

Después buscá la IP de la PC (`ipconfig` en Windows, `ip a` en Linux/Mac) y en el celular abrí
`http://192.168.x.x:8000`.

⚠️ Ojo: por IP es `http://`, no `https://`, así que **Chrome y Safari van a bloquear la cámara**.
Para que ande por esta vía necesitás un túnel con HTTPS (por ejemplo `npx localtunnel --port 8000`
o `ngrok http 8000`) y abrir en el celu el link `https://…` que te devuelve. Por eso la Opción A
es más cómoda.

## Qué cambió respecto de la versión de PC

- **Arranque con un toque.** Los navegadores del celular solo piden permiso de cámara si el
  pedido sale de un gesto del usuario, por eso hay una pantalla con *Activar cámara*.
- **Pantalla adaptable.** El video ya no mide 500 px fijos: se estira al ancho del teléfono,
  respeta el notch (`safe-area-inset`) y no genera scroll horizontal.
- **Cámara frontal por defecto** (`facingMode: "user"`), en espejo como cualquier app del celu,
  con botón para **girar a la cámara trasera**.
- **El emoji escala con la cara** en vez de tener 150 px fijos, y tiene suavizado para que no
  tiemble con el pulso.
- **Guardar la foto funciona.** En el celular el `<a download>` no guarda nada: ahora la foto se
  muestra en pantalla y se guarda con el menú nativo (`navigator.share`), con la descarga de
  siempre como respaldo en PC.
- **Menos batería:** el detector procesa uno de cada dos cuadros y no encola cuadros nuevos hasta
  terminar el anterior.
- **Mensajes de error claros:** sin HTTPS, permiso denegado o detector sin cargar, avisa qué pasó.

## Requisitos

- Navegador con cámara: Chrome/Edge/Firefox en Android, Safari o Chrome en iOS 14.3+.
- Conexión a internet la primera vez (el detector de caras se baja desde el CDN de jsDelivr).
