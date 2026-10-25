// worker.js
self.onmessage = function(e) {
    const { inicio, fim } = e.data;
    let contadorPrimos = 0;

    // Função de detecção de número primo pesada (Força Bruta Intencional)
    function ehPrimo(num) {
        if (num <= 1) return false;
        if (num <= 3) return true;
        if (num % 2 === 0 || num % 3 === 0) return false;
        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false;
        }
        return true;
    }

    // Varre o intervalo determinado pelo mestre
    for (let i = inicio; i <= fim; i++) {
        if (ehPrimo(i)) {
            contadorPrimos++;
        }
    }

    // Retorna a contagem final para a thread principal do navegador
    self.postMessage(contadorPrimos);
};
