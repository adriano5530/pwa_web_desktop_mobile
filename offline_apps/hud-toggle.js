function toggleHUD(){
  const id = '__hud_style_toggle__';
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  } else {
    const css = `
      body {
        transform: scale(1, -1);
        filter: contrast(2) brightness(1.2);
        background: black !important;
        color: #0f0 !important;
      }
      *:not(img):not(video):not(svg) {
        color: #0f0 !important;
        text-shadow: 0 0 5px #0f0;
      }
      img, video {
        transform: scale(1, -1);
        filter: contrast(2) brightness(1.2) !important;
      }
    `;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
}

