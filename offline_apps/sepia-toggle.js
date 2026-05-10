// sepia-toggle.js

let sepiaEnabled = false;

// IDs de elementos únicos
const sepiaIds = ['desktop', 'startMenu'];

// Classes que podem ter múltiplos elementos (como janelas)
const sepiaClasses = ['window'];

// Classe CSS aplicada para o filtro
const SEPIA_CLASS = 'sepia-filter';

function toggleSepia() {
  // Elementos por ID
  sepiaIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle(SEPIA_CLASS, !sepiaEnabled);
    }
  });

  // Elementos por classe
  sepiaClasses.forEach(className => {
    document.querySelectorAll(`.${className}`).forEach(el => {
      el.classList.toggle(SEPIA_CLASS, !sepiaEnabled);
    });
  });

  sepiaEnabled = !sepiaEnabled;
}

// Função utilitária para aplicar sepia em um novo elemento
function applySepiaToElement(el) {
  if (sepiaEnabled && el) {
    el.classList.add(SEPIA_CLASS);
  }
}

// Torna as funções acessíveis globalmente
window.toggleSepia = toggleSepia;
window.applySepiaToElement = applySepiaToElement;

