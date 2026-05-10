/**
 * TOUCHPAD VIRTUAL V3 - AJUSTE DE SENSIBILIDADE
 * Focado em: Diferenciar navegação de cliques e arrastes.
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

  const cursor = document.createElement("div");
  cursor.id = "custom-cursor";
  Object.assign(cursor.style, {
    position: "absolute",
    width: "0", height: "0",
    borderTop: "10px solid transparent",
    borderBottom: "10px solid transparent",
    borderLeft: "15px solid white",
    pointerEvents: "none",
    zIndex: "9999",
    filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.5))"
  });
  document.body.appendChild(cursor);

  const pad = document.createElement("div");
  pad.id = "custom-touchpad";
  Object.assign(pad.style, {
    position: "fixed",
    right: "0", bottom: "50px",
    width: "60%", height: "220px",
    backgroundColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(5px)",
    borderLeft: "2px solid rgba(255,255,255,0.4)",
    zIndex: "9998",
    touchAction: "none"
  });
  document.body.appendChild(pad);

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let startX, startY;
  let moveuBastante = false; // Flag para evitar cliques acidentais
  let isMouseDown = false;
  let lastTap = 0;

  const dispatch = (type, clientX, clientY) => {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return;
    el.dispatchEvent(new MouseEvent(type, {
      view: window, bubbles: true, cancelable: true,
      clientX, clientY, buttons: 1
    }));
    return el;
  };

  pad.addEventListener("touchstart", e => {
    e.preventDefault();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    moveuBastante = false; // Reseta a sensibilidade a cada toque

    const now = Date.now();
    if (now - lastTap < 300) {
      isMouseDown = true;
      const fZ = (parseFloat(document.body.style.zoom) || 100) / 100;
      dispatch("mousedown", x * fZ, (y - window.scrollY) * fZ);
    }
    lastTap = now;
  });

  pad.addEventListener("touchmove", e => {
    e.preventDefault();
    const touch = e.touches[0];
    const fZ = (parseFloat(document.body.style.zoom) || 100) / 100;

    const dx = (touch.clientX - startX) / fZ;
    const dy = (touch.clientY - startY) / fZ;

    // Se o movimento for maior que 3 pixels, cancelamos o clique simples
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      moveuBastante = true;
    }

    x = Math.max(0, Math.min(window.innerWidth / fZ, x + dx));
    y = Math.max(0, Math.min(document.body.scrollHeight / fZ, y + dy));

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    if (isMouseDown) {
      dispatch("mousemove", x * fZ, (y - window.scrollY) * fZ);
    }

    startX = touch.clientX;
    startY = touch.clientY;
  });

  pad.addEventListener("touchend", e => {
    e.preventDefault();
    const fZ = (parseFloat(document.body.style.zoom) || 100) / 100;
    const vX = x * fZ;
    const vY = (y - window.scrollY) * fZ;

    if (isMouseDown) {
      dispatch("mouseup", vX, vY);
      isMouseDown = false;
    } else if (!moveuBastante) {
      // SÓ CLICA se o dedo não tiver deslizado (clique intencional)
      const el = dispatch("click", vX, vY);
      if (el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT')) {
        el.focus();
      }
    }
    moveuBastante = false;
  });

  atualizarCursorPos = () => { cursor.style.top = `${y}px`; };
  window.addEventListener("scroll", atualizarCursorPos);
}
