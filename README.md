# Chess React App with Stockfish AI

Este proyecto es un juego de ajedrez interactivo desarrollado en React, que permite jugar contra otro humano o contra una IA fuerte (Stockfish) ejecutada como Web Worker en el navegador.

## Características principales

- **Modo vs IA**: Juega contra Stockfish (el usuario siempre juega con blancas, la IA con negras).
- **Modo 2 jugadores**: Juega contra otra persona en el mismo dispositivo.
- **Detección automática de fin de partida**: Jaque mate, ahogado y material insuficiente.
- **Animaciones de movimiento** y visualización de piezas capturadas.
- **Historial de movimientos** y resumen de partida.
- **Cronómetro** y opción de rendirse.
- **Stockfish** corre como Web Worker desde `/public/stockfish.js` (no requiere backend).

## Instalación y uso

1. **Clona el repositorio**

```sh
git clone <url-del-repo>
cd Chess
```

2. **Instala las dependencias**

```sh
npm install
```

3. **Inicia la app en modo desarrollo**

```sh
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Estructura del proyecto

- `src/App.jsx`: Lógica principal, integración con Stockfish, control de estado y UI.
- `src/components/Board.jsx`: Renderizado del tablero y animaciones.
- `src/components/GameStartPanel.jsx`: Selección de modo de juego.
- `src/components/GameSummary.jsx`: Resumen de partida.
- `public/stockfish.js`, `public/stockfish.wasm`, `public/stockfish.wasm.js`: Motor Stockfish para IA.

## Notas técnicas

- El motor Stockfish se ejecuta como Web Worker para no bloquear la UI.
- El FEN se genera dinámicamente para cada posición y se envía al motor.


## Créditos
- Interfaz y lógica: [Tu nombre]
- Motor de ajedrez: [Stockfish](https://stockfishchess.org/)

---

¡Disfruta jugando y mejorando tu ajedrez!
