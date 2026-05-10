// grey-toggle.js

let greyEnabled = false;

// IDs de elementos únicos
const greyIds = ['desktop', 'startMenu'];

// Classes que podem ter múltiplos elementos (como janelas)
const greyClasses = ['window'];

// Classe CSS aplicada para o filtro
const GREY_CLASS = 'grey-filter';

function toggleGrey() {
  // Elementos por ID
  greyIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.toggle(GREY_CLASS, !greyEnabled);
    }
  });

  // Elementos por classe
  greyClasses.forEach(className => {
    document.querySelectorAll(`.${className}`).forEach(el => {
      el.classList.toggle(GREY_CLASS, !greyEnabled);
    });
  });

  greyEnabled = !greyEnabled;
}

// Função utilitária para aplicar grey em um novo elemento
function applyGreyToElement(el) {
  if (greyEnabled && el) {
    el.classList.add(GREY_CLASS);
  }
}

// Torna as funções acessíveis globalmente
window.toggleGrey = toggleGrey;
window.applyGreyToElement = applyGreyToElement;

