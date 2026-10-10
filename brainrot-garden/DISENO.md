# Brain Rot Garden — Documento de diseño para el desarrollador

> **Para la IA que programa el juego:** este documento es la fuente de verdad. Léelo completo para
> entender la idea, pero **implementa solo la fase que se te pida** (sección 12). Si algo no está
> aquí o es ambiguo, **pregunta antes de inventarlo**. Los números son de partida: van todos en un
> módulo de configuración para poder balancear sin tocar código.

---

## 1. La idea en una frase

Es como *Grow a Garden*, pero de cada planta en vez de frutas salen **brain rots** (personajes
locos). Los cultivas, los coleccionas y los vendes, y **otros jugadores te pueden robar los que ya
maduraron**. Eso es lo que da emoción.

**La planta se queda, la fruta es el premio.**

## 2. El ciclo que engancha

```
comprar semilla → plantar → la fruta crece (bebé → madura) → cosechar → vender → comprar mejores semillas
                                     ↑                                    
                     mientras tanto: regar, defender, robar a otros
```

La espera **nunca es pasiva**: mientras crece lo tuyo estás regando, defendiendo tu base o robando.

## 3. Rangos

De menor a mayor. Cada rango vale más y se ve más loco.

| Rango | Color | Tiempo por fruta | Precio semilla | Valor de venta (por brain rot) | Cómo se consigue la semilla |
|---|---|---|---|---|---|
| Común | Gris | 15 s | 25 | 10–20 | Tienda |
| Raro | Azul | 45 s | 150 | 60–100 | Tienda |
| Épico | Morado | 2 min | 800 | 300–500 | Tienda |
| Legendario | Dorado | 5 min | **No se vende** | 2 000–3 500 | Solo en el evento de semillas |
| Mítico | Rosa | 10 min | **No se vende** | 10 000–20 000 | Solo en el evento (chance baja) |

Los legendarios valen muchísimo más: ganar una semilla legendaria es un **salto real en la
economía**, no solo presumir.

## 4. Plantas y frutas (regla central)

- El jugador tiene una base con **8 macetas**.
- Una semilla tiene **rango**, no personaje. Se planta en una maceta vacía.
- Cada planta da **3 frutas, una tras otra**, y luego **se seca** (se libera la maceta).
- Cada fruta es un **brain rot al azar del mismo rango que la semilla**. Las 3 pueden salir
  distintas. Así cada cosecha es sorpresa y una planta nunca rompe la economía.
- La fruta **crece visible** en la planta: aparece chiquita (bebé) y va escalando hasta tamaño
  completo, y se ve cómo se forma el personaje.
- Cuando madura, el jugador la **cosecha** (se acerca y presiona). Va a su inventario.
- **Regar** (botón/herramienta) acelera la fruta actual un 20% una vez por fruta. Es lo que hace
  la espera activa.
- Al madurar se tira **mutación** (independiente del personaje):

| Mutación | Chance | Valor ×  | Efecto visual |
|---|---|---|---|
| Arcoíris | 0.5% | ×10 | Brillo arcoíris |
| Fuego | 2% | ×4 | Llamitas |
| Dorada | 5% | ×2.5 | Color dorado |

## 5. Robo (con reglas para que sea justo)

- **Solo se roba fruta madura que sigue colgada en la planta.** Lo que ya cosechaste está a salvo
  en tu inventario. Las plantas sin madurar no se roban. *(Así cosechar rápido es tu defensa.)*
- Robar = acercarse a la planta ajena y mantener presionado **3 s** (se cancela si te mueves o te
  golpean).
- Cuesta **energía** (máx. 100, robar cuesta 35, se recupera 1/s) y tiene **cooldown de 20 s**.
- **Máximo 2 atacantes a la vez por base.** Un tercero no puede entrar a robar.
- **Inmunidad de fruta recién madurada:** 20 s sin poder ser robada (te da tiempo de cosechar).
- **Escudo tras ser robado:** tu base es inmune 90 s.
- **Escudo de jugador nuevo:** 5 min al entrar por primera vez.
- Toda la validación se hace **en el servidor** (distancia, energía, cooldown, escudos).

### Defensas (se compran con monedas, duran un rato)

| Defensa | Precio | Dura | Efecto |
|---|---|---|---|
| Candado | 300 | 3 min | Nadie puede robar tu base mientras dure |
| Torreta | 500 | 4 min | 50% de cancelar cada robo y empujar al ladrón |
| Trampa | 200 | 5 min | Paraliza 4 s al primer ladrón que entra |
| Muro | 400 | 4 min | El robo tarda 3 s más |

## 6. Anti-bullying y karma

La idea: **juntarse a reventar a uno solo debe ser más caro que rentable.**

- Límite de atacantes, cooldown, defensas y escudos (sección 5).
- **Karma** de 0 a 100, empieza en 50.
  - "Poder" de un jugador = valor total de su jardín + su inventario.
  - Robar a alguien con menos del **35% de tu poder** = abuso: **−12 karma**.
  - Robar a alguien de tu nivel: **+1 karma**.
  - Se recupera 1 punto por minuto jugando limpio.
- Con karma **menor a 20** eres **forajido**: apareces **en rojo en el mapa** con recompensa por tu
  cabeza. Cualquiera que te tumbe cobra la recompensa y gana +15 karma.
- Buen karma desbloquea cosas: 70 → skin "Jardinero Honrado", 85 → +10% al vender,
  95 → skin "Guardián Dorado".

## 7. Evento de pelea por semillas

- Cada **10 minutos** aparece un aviso ("¡En 15 segundos caen semillas legendarias!").
- Caen **3 semillas** en el centro del mapa. Cada una tiene **10% de ser Mítica** en lugar de
  Legendaria.
- El primero que la toca se la lleva. Se pueden empujar/golpear para quitarse el paso.
- Si nadie las agarra en 90 s, desaparecen.
- Es un **evento especial**, no el corazón del juego: el resto del tiempo se cultiva tranquilo.

## 8. Brain-Rot-Dex (el libro)

Colección con **todos** los brain rots: los descubiertos se ven con su imagen, nombre, rango y
frase; los que faltan salen como silueta "???". Muestra cuántos llevas por rango y las mutaciones
que has encontrado de cada uno. El objetivo es que siempre quieras el siguiente.

## 9. Los brain rots

Cada uno es su propio personaje con su animación y su frase. **Su poder solo funciona mientras
está colocado en tu jardín** (en un pedestal/vitrina de exhibición; máximo 4 exhibidos, para que
no se acumulen poderes). Los poderes se implementan en la **fase 5**; antes de eso solo hacen falta
nombre, rango, aspecto y frase.

### Comunes (7)
| Nombre | Aspecto | Frase | Poder (mecánica) |
|---|---|---|---|
| Chipirini Papirini | Uno de los primeros que encuentras | — | Ninguno (el primero, de cariño) |
| Rexoni Lililini | Esqueleto de T-rex de museo; costillas como xilófono, cada paso suena | "li-li-li-ni" | Si te lo roban, el ladrón tarda 2 s más (se "desarma" y se rearma, a veces con la cabeza al revés) |
| Paloma Palomita | Paloma mensajera chiquita con gorrita de cartero | "palomita, palomita" | Cuando un ladrón entra a tu base, avisa a **todo el server** con el nombre del ladrón |
| Burrito Burrito | Burrito de frijoles con orejas y cola de burro | "ji-jaa-rito!" | Patea (empuja) al primer jugador que se acerca a tu jardín, cada 30 s |
| Coco Fieston | Coco con sombrero de charro y maracas, siempre bailando | "aaay, fiesta-coco!" | Hace bailar a los brain rots cercanos: +5% a la velocidad de crecimiento |
| Gallo Gallardo | Gallo galán, pecho inflado, cresta peinada | "gallardo, gallardo!" | Ninguno, solo presume (+10% de valor al venderlo) |
| Pequenini Picosini | Chiltepín chiquitito, hermanito del Chile Chilazo | "picosini-sini-sini" | Si lo intentan robar, el ladrón se pone rojo, echa humo y corre sin control 3 s |

### Raros (6)
| Nombre | Aspecto | Frase | Poder |
|---|---|---|---|
| Gomitón Plopín | Gomita roja gelatinosa que rebota por todo el jardín | "plop" | Ninguno, solo rebota (decorativo) |
| Llamanina Borlona | Llamita esponjada con borlas de colores y gorrito peruano | "nina-nina-nina" | Avienta borlas que rebotan y empujan a los ladrones |
| Guacamola Surfeola | Tazón de guacamole con nachos de cresta, surfeando en una ola | "guaca-mola, surfe-ola!" | Riega solita las plantas (como regar gratis cada 60 s) |
| Nubecita Truenito | Nube gris gruñona con ceño fruncido | — | Tira mini rayos a ladrones cercanos (aturde 1 s). Trío de elementos con Chile Chilazo (fuego) y Yeti Ice (hielo) |
| Los Camaroncitos Escandalosos | Dos camaroncitos de una sola fruta: uno con trompeta, otro con tambora | — | El ladrón se marea y **suelta** lo que robó (25% de chance) |
| Macaco Ballardo | Changuito con armadura de lata montando un plátano gigante, con lanza de vara | "ballardooo!" | Carga contra el ladrón y lo saca del jardín |

### Épicos (7)
| Nombre | Aspecto | Frase | Poder |
|---|---|---|---|
| Taco Pastorini | Taquito al pastor con piña de sombrero, gira como trompo | "pastorini-rini-rini" | **Riesgo:** al madurar en la planta suelta olorcito que marca tu base en el mapa de todos 30 s |
| Torito Embestini | Torito cachetón, cuernos más grandes que él, campanita | "muuu-le-lini" / ronca "muuu… muuu…" | Embiste y saca volando a quien entre a robar. Si nadie molesta, se duerme |
| Mosquito Mosquetero | Mosquito con sombrero de pluma y espadita | "zzz-en garde!" | Pica a ladrones: les quita 10 de energía |
| Yeti Ice | Yeti chiquito que es un cono de nieve: cuerpo de galleta, pelo de nieve de vainilla, tiembla | "brrr-yetiii" | Estornuda copos que congelan al ladrón 2 s. **Riesgo:** de día, si no lo cosechas en 60 s tras madurar, se derrite (pierde 50% de valor) |
| Luchador Partidor | Luchador chiquito y mamado, máscara brillante y capa | "partidooor!" | Al atacar con él, rompe candados y muros de un madrazo (solo contra bases de tu nivel o mayor) |
| Bulldog Estadounidense | Bulldog cachetón y gruñón, sombrero vaquero, bandera de EE. UU. como capa | "yee-haw, guau!" | Persigue a los ladrones por tu base |
| Bill Bank | Billete verde con carita, monóculo y sombrero de copa; camina doblándose | "bill, bill, bank!" | Da intereses: suelta monedas solito cada cierto tiempo |

### Legendarios (5) — solo del evento
| Nombre | Aspecto | Frase | Poder |
|---|---|---|---|
| Volcancito Lavarini | Volcán chiquito enojón que eructa lava de colores | — | Calienta el jardín: todo lo cercano crece +25% más rápido |
| Piñatón Reventón | Llama de piñata de colores con lentes oscuros, presumida | "piñata, piñata" | Si le pegas suelta dulces y monedas, pero se enoja y te persigue |
| Lunita Dormilini | Media luna con gorro de dormir | — | Solo crece de noche. De noche, los ladrones que se acercan se duermen 3 s |
| Chile Chilazo | Chile habanero enojado que echa fuego | — | Al atacar, quema trampas y defensas de la base (solo bases de tu nivel o mayor) |
| Plátano Platinano | Plátano de platino, brillante como espejo, con lentes, voz de millonario | "platinano, platinano" | Deja cáscaras que hacen resbalar a los ladrones. De los que más valen al vender |

### Míticos (3) — solo del evento, chance baja
| Nombre | Aspecto | Frase | Poder |
|---|---|---|---|
| Rainbow Patilini | Arcoíris con carita sonriente y dos patitas flaquitas; camina chueco como compás; cuelga curveadito de la planta | "tilini, tilini" | Al cosecharlo, brillo de colores en todo el jardín: la siguiente fruta de cada planta tiene doble chance de mutación |
| Alebrije Revoltije | Alebrije neón: cabeza de conejo, cuerpo de lagartija, alas de colibrí, cola de pez | — | Copia el poder de otro brain rot exhibido en tu jardín. Sus colores salen distintos en cada cosecha (no hay dos iguales) |
| Ajolote Estrellón | Ajolote rosa con piel de galaxia y branquias de estrellitas; flota | — | Al cosecharlo cae lluvia de estrellas en todo el server: **todos** ganan monedas y se anuncia quién lo sacó. Si te lo roban, te deja el 10% de su valor |

## 10. Mundo

- Mapa con las bases de los jugadores alrededor y una **plaza central** (donde cae el evento).
- Cada jugador recibe una base al entrar y la pierde al salir (sus datos se guardan).
- Tienda (semillas, defensas) y puesto de venta accesibles desde la base.
- Ciclo de **día y noche** (para Lunita y Yeti), de unos 10 min por ciclo. Se hace en la fase 5.

## 11. Reglas técnicas (obligatorias)

1. **El servidor manda.** Monedas, inventario, crecimiento, robos y tiradas al azar se calculan
   solo en el servidor. El cliente solo pide ("quiero plantar en la maceta 3") y muestra.
2. El servidor **valida todo** lo que pide el cliente: que sea su maceta, que tenga la semilla,
   que tenga las monedas, la distancia, la energía, el cooldown…
3. Todos los números (precios, tiempos, chances) van en **un solo módulo de configuración**.
4. Catálogo de brain rots en **un módulo de datos** (nombre, rango, valor, frase, poder). Agregar un
   brain rot nuevo = agregar una entrada, no programar de nuevo.
5. Guardado con **DataStore**, con autoguardado y guardado al salir. El tiempo de crecimiento se
   guarda con marcas de tiempo (no se pierde si sales).
6. Código organizado por sistemas (jardín, tienda, robo, karma, evento, dex).

## 12. Fases de desarrollo

Se hace **una fase a la vez**, se prueba en Roblox Studio y el gerente la aprueba antes de seguir.

| Fase | Qué incluye | Está lista cuando… |
|---|---|---|
| **1. Base jugable** | Base de 8 macetas, tienda con semilla Común, plantar, fruta que crece visible, 3 frutas y se seca, cosechar, inventario, vender, regar, guardar datos. Los 7 comunes | Plantas, cosechas 3 brain rots distintos al azar, la planta se seca, vendes, sales y al volver todo sigue ahí |
| **2. Rangos y colección** | Semillas Raras y Épicas en la tienda, todos los brain rots raros y épicos (sin poderes), mutaciones, Brain-Rot-Dex | El Dex muestra descubiertos y siluetas; las mutaciones salen y suben el valor |
| **3. Robo** | Robar fruta madura, energía, cooldown, límite de atacantes, inmunidades, escudos, defensas | Dos jugadores pueden robarse y **todas** las reglas de la sección 5 se cumplen |
| **4. Evento** | Evento de semillas, legendarios y míticos (sin poderes) | Cae el aviso, caen 3 semillas, alguien las gana y las planta |
| **5. Poderes y karma** | Exhibir brain rots, poderes de la sección 9, día/noche, karma, forajidos, recompensas | Cada poder hace lo que dice su ficha |
| **6. Pulido** | Tutorial, sonidos, animaciones, balance | Un jugador nuevo entiende el juego sin que le expliquen |

## 13. Cómo entregar cada fase

Al terminar una fase, entrega:
1. La lista de archivos y dónde va cada uno en Roblox Studio.
2. Los pasos para probarla.
3. Qué quedó pendiente o qué decidiste tú (para que el gerente lo apruebe).

## 14. Decisiones tomadas por el gerente

El diseño original no las definía. Están decididas así, pero se pueden cambiar:

- **Míticos:** salen del evento con 10% de chance por semilla.
- **Qué se roba:** solo la fruta madura que sigue en la planta, no el inventario.
- **Luchador Partidor y Chile Chilazo** solo rompen defensas de bases de tu nivel o mayor (para no
  chocar con el anti-bullying).
- **Poderes:** solo funcionan con el brain rot exhibido en tu jardín, máximo 4 a la vez.
- **Robux / monetización:** todavía sin definir. **No** se pone nada que sea "pagar para robar".
