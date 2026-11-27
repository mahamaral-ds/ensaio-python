/* Conjunto de ícones próprio: traço de 1,5 px, grid de 24 px, cantos retos, sem preenchimento. */
(function () {
  "use strict";
  const P = {
    caderno: "M5 3h14v18H5z M9 8h6 M9 12h6 M9 16h4 M3 7h2 M3 12h2 M3 17h2",
    trilhas: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 16.5h7 M16.5 13v7",
    revisar: "M20 12a8 8 0 1 1-2.34-5.66 M20 3.5V8h-4.5",
    progresso: "M4 20h16 M7 16v-4 M12 16V7 M17 16v-6",
    ajustes: "M4 7h9 M17 7h3 M15 4.5v5 M4 17h3 M11 17h9 M9 14.5v5",
    play: "M7 5l12 7-12 7z",
    dica: "M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z",
    check: "M5 12.5l4.5 4.5L19 7.5",
    x: "M6 6l12 12 M18 6L6 18",
    lock: "M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3",
    chama: "M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1-3.6 2.2-4.6.3 1.6 1 2.6 2 3.1C11 9 11 6 12 3z",
    medalha: "M8 3l2.5 6.2 M16 3l-2.5 6.2 M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 13.5v4",
    download: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
    upload: "M12 15V4 M7 9l5-5 5 5 M5 20h14",
    direita: "M5 12h14 M13 6l6 6-6 6",
    esquerda: "M19 12H5 M11 6l-6 6 6 6",
    sol: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
    lua: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
    frasco: "M9 3h6 M10 3v6l-5 9.5A1.7 1.7 0 0 0 6.5 21h11a1.7 1.7 0 0 0 1.5-2.5L14 9V3 M7.5 15h9",
    alvo: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M12 11.5v1",
    livro: "M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z M20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z",
    lixeira: "M4 7h16 M9 7V4h6v3 M6 7l1 14h10l1-14",
    desfazer: "M9 14L4 9l5-5 M4 9h10a6 6 0 0 1 0 12h-3",
    lapis: "M4 20l1-5L16 4l4 4L9 19z M14 6l4 4",
    relogio: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
    arquivo: "M6 3h8l4 4v14H6z M14 3v4h4",
    terminal: "M3 5h18v14H3z M7 10l3 2-3 2 M12 15h5",
  };

  function icon(name, size) {
    const s = size || 20;
    const d = P[name] || P.caderno;
    return (
      '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" ' +
      'aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>'
    );
  }

  window.icon = icon;
})();
