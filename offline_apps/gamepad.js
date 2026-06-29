let gamepadAtivo = false;
let gamepadContainerEl = null;

function toggleGamepad(){
  if (gamepadAtivo) {
    if (gamepadContainerEl) {
      gamepadContainerEl.remove();
      gamepadContainerEl = null;
    }
    gamepadAtivo = false;
  } else {
    iniciarGamepad();
    gamepadAtivo = true;
  }
}

// ── Injeta o CSS do gamepad uma única vez ──
function injetarEstilosGamepad() {
  if (document.getElementById('gamepad-styles')) return;

  var style = document.createElement('style');
  style.id = 'gamepad-styles';
  style.textContent = `
    #custom-gamepad {
      position: fixed;
      bottom: 24px;
      left: 24px;
      display: flex;
      align-items: center;
      gap: 28px;
      padding: 26px 26px 18px;
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.10);
      backdrop-filter: blur(18px) saturate(160%);
      -webkit-backdrop-filter: blur(18px) saturate(160%);
      border: 1px solid rgba(255, 255, 255, 0.28);
      box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.35),
        inset 0 1px 0 rgba(255, 255, 255, 0.35),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
      z-index: 999999;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }

    #custom-gamepad .gp-handle {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 36px;
      height: 4px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.35);
      cursor: grab;
    }

    #custom-gamepad .gp-dpad {
      position: relative;
      width: 108px;
      height: 108px;
      flex-shrink: 0;
    }

    #custom-gamepad .gp-dpad-shape {
      position: absolute;
      background: rgba(255, 255, 255, 0.14);
      border: 1px solid rgba(255, 255, 255, 0.30);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.30),
        inset 0 -2px 4px rgba(0, 0, 0, 0.25),
        0 2px 6px rgba(0, 0, 0, 0.25);
      border-radius: 8px;
    }

    /* Barra vertical e horizontal formando a cruz */
    #custom-gamepad .gp-dpad-shape.gp-v { left: 36px; top: 0;   width: 36px; height: 108px; }
    #custom-gamepad .gp-dpad-shape.gp-h { left: 0;  top: 36px;  width: 108px; height: 36px; }

    #custom-gamepad .gp-dpad-zone {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.75);
      font-size: 16px;
      line-height: 1;
      transition: background 0.08s ease, color 0.08s ease;
      border-radius: 6px;
    }
    #custom-gamepad .gp-dpad-zone.gp-up    { left: 36px; top: 0;   width: 36px; height: 36px; }
    #custom-gamepad .gp-dpad-zone.gp-down  { left: 36px; top: 72px; width: 36px; height: 36px; }
    #custom-gamepad .gp-dpad-zone.gp-left  { left: 0;   top: 36px; width: 36px; height: 36px; }
    #custom-gamepad .gp-dpad-zone.gp-right { left: 72px; top: 36px; width: 36px; height: 36px; }

    #custom-gamepad .gp-dpad-zone.active {
      background: rgba(255, 255, 255, 0.30);
      color: rgba(255, 255, 255, 0.95);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.30);
    }

    #custom-gamepad .gp-actions {
      position: relative;
      width: 108px;
      height: 108px;
      flex-shrink: 0;
    }

    #custom-gamepad .gp-btn {
      position: absolute;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.32);
      background: rgba(255, 255, 255, 0.14);
      box-shadow:
        inset 0 1px 1px rgba(255, 255, 255, 0.35),
        inset 0 -2px 4px rgba(0, 0, 0, 0.25),
        0 3px 8px rgba(0, 0, 0, 0.30);
      color: rgba(255, 255, 255, 0.85);
      font-size: 15px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.06s ease, background 0.08s ease, box-shadow 0.08s ease;
    }

    #custom-gamepad .gp-btn.gp-y { left: 33px; top: 0; }
    #custom-gamepad .gp-btn.gp-x { left: 0;   top: 33px; }
    #custom-gamepad .gp-btn.gp-a { left: 66px; top: 33px; }
    #custom-gamepad .gp-btn.gp-b { left: 33px; top: 66px; }

    #custom-gamepad .gp-btn.active {
      transform: scale(0.90);
      background: rgba(255, 255, 255, 0.32);
      box-shadow:
        inset 0 2px 5px rgba(0, 0, 0, 0.35),
        0 1px 3px rgba(0, 0, 0, 0.25);
    }

    /* Tons sutis de cor por botão, sem perder o vidro */
    #custom-gamepad .gp-btn.gp-a { color: #ffb3c1; border-color: rgba(255, 179, 193, 0.45); }
    #custom-gamepad .gp-btn.gp-b { color: #ffe0a3; border-color: rgba(255, 224, 163, 0.45); }
    #custom-gamepad .gp-btn.gp-x { color: #a3d9ff; border-color: rgba(163, 217, 255, 0.45); }
    #custom-gamepad .gp-btn.gp-y { color: #b8f5c2; border-color: rgba(184, 245, 194, 0.45); }
  `;
  document.head.appendChild(style);
}

function iniciarGamepad(){

  // ── Acha pra onde mandar os eventos de teclado ──
  // No bookmarklet original, target = document.body funcionava porque o
  // script rodava DENTRO da página do jogo. Aqui no desktop, o jogo vive
  // num <iframe> isolado dentro da janela ativa (.window.ativa) — então
  // temos que mandar o evento pro document DE DENTRO do iframe, não pro
  // body do desktop. Same-origin: funciona normalmente. Cross-origin:
  // o navegador bloqueia o acesso a iframe.contentDocument por política
  // de segurança (same-origin policy) — não tem workaround via JS sem
  // cooperação do site de destino, então nesse caso avisamos no console
  // e caímos de volta no body do desktop (mantém o app não-quebrado, mas
  // o jogo cross-origin não vai responder aos botões).
  function getEventTarget() {
    const janelaAtiva = document.querySelector('.window.ativa');
    const iframe = janelaAtiva ? janelaAtiva.querySelector('.window-content iframe') : null;

    if (iframe) {
      try {
        const win = iframe.contentWindow;
        const doc = iframe.contentDocument || (win && win.document);
        if (doc && win) return { doc, win };
      } catch (err) {
        console.warn('[gamepad] iframe cross-origin — não é possível controlar este jogo via teclado sintético (bloqueio de segurança do navegador).', err);
      }
    }

    return { doc: document.body, win: null };
  }

  injetarEstilosGamepad();

  var gamepadContainer = document.createElement('div');
  gamepadContainer.id = 'custom-gamepad';

  var handle = document.createElement('div');
  handle.className = 'gp-handle';
  gamepadContainer.appendChild(handle);
  tornarArrastavel(gamepadContainer, handle);

  // ── D-pad: cruz única com 4 zonas clicáveis sobrepostas ──
  var dpad = document.createElement('div');
  dpad.className = 'gp-dpad';
  dpad.innerHTML = `
    <div class="gp-dpad-shape gp-v"></div>
    <div class="gp-dpad-shape gp-h"></div>
  `;
  gamepadContainer.appendChild(dpad);

  var direcionais = [
    { classe: 'gp-up',    label: '▲', keyCode: 38 },
    { classe: 'gp-down',  label: '▼', keyCode: 40 },
    { classe: 'gp-left',  label: '◀', keyCode: 37 },
    { classe: 'gp-right', label: '▶', keyCode: 39 }
  ];

  direcionais.forEach(function(dir) {
    var zona = document.createElement('div');
    zona.className = 'gp-dpad-zone ' + dir.classe;
    zona.textContent = dir.label;
    dpad.appendChild(zona);
    ligarBotao(zona, { label: dir.classe.replace('gp-', ''), keyCode: dir.keyCode });
  });

  // ── Botões de ação: diamante A/B/X/Y, estilo SNES ──
  var actions = document.createElement('div');
  actions.className = 'gp-actions';
  gamepadContainer.appendChild(actions);

  var acoes = [
    { classe: 'gp-y', label: 'Y', keyCode: 89 },
    { classe: 'gp-x', label: 'X', keyCode: 88 },
    { classe: 'gp-a', label: 'A', keyCode: 65 },
    { classe: 'gp-b', label: 'B', keyCode: 66 }
  ];

  acoes.forEach(function(acao) {
    var btn = document.createElement('div');
    btn.className = 'gp-btn ' + acao.classe;
    btn.textContent = acao.label;
    actions.appendChild(btn);
    ligarBotao(btn, acao);
  });

  function ligarBotao(elemento, button) {
    var pressButton = function() {
      var t = getEventTarget();
      var opts = { key: button.label, keyCode: button.keyCode, which: button.keyCode, bubbles: true, cancelable: true };
      t.doc.dispatchEvent(new KeyboardEvent('keydown', opts));
      if (t.win) t.win.dispatchEvent(new KeyboardEvent('keydown', opts));
    };

    var releaseButton = function() {
      var t = getEventTarget();
      var opts = { key: button.label, keyCode: button.keyCode, which: button.keyCode, bubbles: true, cancelable: true };
      t.doc.dispatchEvent(new KeyboardEvent('keyup', opts));
      if (t.win) t.win.dispatchEvent(new KeyboardEvent('keyup', opts));
    };

    elemento.addEventListener('mousedown', function() {
      elemento.classList.add('active');
      pressButton();
    });

    elemento.addEventListener('mouseup', function() {
      elemento.classList.remove('active');
      releaseButton();
    });

    elemento.addEventListener('mouseleave', function() {
      if (elemento.classList.contains('active')) {
        elemento.classList.remove('active');
        releaseButton();
      }
    });

    elemento.addEventListener('touchstart', function(e) {
      e.preventDefault();
      elemento.classList.add('active');
      pressButton();
    }, { passive: false });

    elemento.addEventListener('touchend', function(e) {
      e.preventDefault();
      elemento.classList.remove('active');
      releaseButton();
    }, { passive: false });

    elemento.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      elemento.classList.remove('active');
      releaseButton();
    }, { passive: false });
  }

  document.body.appendChild(gamepadContainer);
  gamepadContainerEl = gamepadContainer;
}

// ── Arrastar o painel pelo handle (mouse + touch) ──
function tornarArrastavel(painel, handle) {
  var offsetX = 0, offsetY = 0, arrastando = false;

  function aoMoverPara(clientX, clientY) {
    painel.style.left = (clientX - offsetX) + 'px';
    painel.style.bottom = 'auto';
    painel.style.top = (clientY - offsetY) + 'px';
  }

  handle.addEventListener('mousedown', function(e) {
    arrastando = true;
    var rect = painel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener('mousemove', function(e) {
    if (arrastando) aoMoverPara(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', function() {
    arrastando = false;
  });

  handle.addEventListener('touchstart', function(e) {
    arrastando = true;
    var touch = e.touches[0];
    var rect = painel.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
  }, { passive: true });

  document.addEventListener('touchmove', function(e) {
    if (arrastando && e.touches[0]) aoMoverPara(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  document.addEventListener('touchend', function() {
    arrastando = false;
  });
}