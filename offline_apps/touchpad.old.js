/**
 * TOUCHPAD VIRTUAL - VERSÃO INTEGRADA (DRAG & DROP)
 * Focado em: Baixa latência, suporte a Drag e Minimalismo.
 */

let touchpadAtivo = false;
let atualizarCursorPos;

function toggleTouchpad() {
  if (touchpadAtivo) {
    const pad = document.getElementById("custom-touchpad");
    const cursor = document.getElementById("custom-cursor");
    if (pad) pad.remove();
    if (cursor) cursor.remove();
    window.removeEventListener("scroll", atualizarCursorPos);
    touchpadAtivo = false;
  } else {
    iniciarTouchpad();
    touchpadAtivo = true;
  }
}

function iniciarTouchpad() {
  if (document.getElementById("custom-touchpad")) return;

  // --- 1. Elemento Visual do Cursor ---
  const cursor = document.createElement("div");
  cursor.id = "custom-cursor";
  Object.assign(cursor.style, {
    position: "absolute",
    width: "0",
    height: "0",
    borderTop: "10px solid transparent",
    borderBottom: "10px solid transparent",
    borderLeft: "15px solid white",
    pointerEvents: "none",
    zIndex: "9999",
    filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))"
  });
  document.body.appendChild(cursor);

  // --- 2. Área do Touchpad ---
  const pad = document.createElement("div");
  pad.id = "custom-touchpad";
  Object.assign(pad.style, {
    position: "fixed",
    right: "0",
    bottom: "50px",
    width: "60%",
    height: "220px",
    backgroundColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "10px 0 0 10px",
    zIndex: "9998",
    touchAction: "none"
  });
  document.body.appendChild(pad);

  // --- 3. Estado do Sistema ---
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let startX, startY;
  let lastTap = 0;
  let isMouseDown = false;

  // Helper para disparar eventos de mouse sintéticos
  const dispatchMouseEvent = (type, clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return;

    const event = new MouseEvent(type, {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: clientX,
      clientY: clientY,
      buttons: 1 // Simula botão esquerdo pressionado
    });
    el.dispatchEvent(event);
    return el;
  };

  // --- 4. Gerenciamento de Toque ---

  pad.addEventListener("touchstart", e => {
    e.preventDefault();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    const now = Date.now();
    // Lógica de Double Tap para iniciar Arraste
    if (now - lastTap < 300) {
      isMouseDown = true;
      const fatorZoom = (parseFloat(document.body.style.zoom) || 100) / 100;
      dispatchMouseEvent("mousedown", x * fatorZoom, (y - window.scrollY) * fatorZoom);
    }
    lastTap = now;
  });

  pad.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    const fatorZoom = (parseFloat(document.body.style.zoom) || 100) / 100;

    // Cálculo Delta (Relativo)
    const dx = (touch.clientX - startX) / fatorZoom;
    const dy = (touch.clientY - startY) / fatorZoom;

    // Atualiza coordenadas internas
    x = Math.max(0, Math.min(window.innerWidth / fatorZoom, x + dx));
    y = Math.max(0, Math.min(document.body.scrollHeight / fatorZoom, y + dy));

    // Move o cursor visual
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    // Se estiver em modo "drag", dispara o mousemove para a janela seguir
    if (isMouseDown) {
      dispatchMouseEvent("mousemove", x * fatorZoom, (y - window.scrollY) * fatorZoom);
    }

    startX = touch.clientX;
    startY = touch.clientY;
  });

  pad.addEventListener("touchend", e => {
    e.preventDefault();
    const fatorZoom = (parseFloat(document.body.style.zoom) || 100) / 100;
    const vX = x * fatorZoom;
    const vY = (y - window.scrollY) * fatorZoom;

    if (isMouseDown) {
      // Finaliza o arraste
      dispatchMouseEvent("mouseup", vX, vY);
      isMouseDown = false;
    } else {
      // Clique simples (se não foi double tap)
      const el = dispatchMouseEvent("click", vX, vY);
      if (el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT')) {
        el.focus();
      }
    }
  });

  // Mantém o cursor centralizado no scroll se necessário
  atualizarCursorPos = () => {
    cursor.style.top = `${y}px`;
  };
  window.addEventListener("scroll", atualizarCursorPos);
}
