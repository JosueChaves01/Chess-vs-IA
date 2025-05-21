# Chess React App with Stockfish AI

**Descripción:**

Este proyecto es una aplicación web de ajedrez desarrollada en React que permite jugar partidas tanto contra otro jugador humano como contra una inteligencia artificial de alto nivel (Stockfish), ejecutada completamente en el navegador mediante un Web Worker. La aplicación ofrece una experiencia de usuario moderna, con animaciones, historial de movimientos, cronómetro, detección automática de jaque mate, ahogado y tablas por material insuficiente, así como opciones de promoción y rendición. No requiere backend: todo el procesamiento, incluida la IA, ocurre en el cliente.

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
