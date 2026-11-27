/* Regras de jogo: XP, níveis, repetição espaçada e conquistas. Ajuste à vontade. */
(function () {
  "use strict";

  const RULES = {
    // XP base por nível de dificuldade do exercício (1 = fácil, 2 = médio, 3 = difícil)
    xpBase: { 1: 10, 2: 20, 3: 35 },
    xpDesafio: 60, // desafios de fim de módulo
    bonusPrimeira: 0.5, // +50% ao acertar de primeira sem dicas
    perdaPorDica: 0.2, // −20% do XP base por dica usada
    pisoComDicas: 0.4, // com dicas, recebe no mínimo 40% do XP base
    fatorSolucao: 0.2, // se viu a solução antes de acertar, recebe 20% do XP base
    xpLicao: 30, // ao concluir todos os exercícios de uma lição
    xpRevisao: (nivel) => 5 + 3 * nivel, // revisão correta: 8, 11 ou 14 XP
    xpNivelamento: 100, // ao passar num teste de nivelamento
    xpMetaDiaria: 20, // bônus ao bater a meta do dia
    xpConquista: 50,

    // Repetição espaçada: intervalos em dias para cada "caixa"
    intervalos: [1, 3, 7, 15, 30],
    tentativasParaSolucao: 3,
    desbloqueio: 0.7, // fração de lições do módulo anterior para liberar o próximo
    aprovacaoNivelamento: 0.8,
    questoesNivelamento: 10,
    metasDiarias: [20, 50, 100, 150],
    metaPadrao: 50,
  };

  const LEVELS = [
    { n: 1, nome: "Aprendiz de bancada", xp: 0 },
    { n: 2, nome: "Assistente", xp: 150 },
    { n: 3, nome: "Técnico", xp: 400 },
    { n: 4, nome: "Analista", xp: 800 },
    { n: 5, nome: "Pesquisador", xp: 1400 },
    { n: 6, nome: "Cientista", xp: 2200 },
    { n: 7, nome: "Pesquisador sênior", xp: 3300 },
    { n: 8, nome: "Orientador", xp: 4700 },
    { n: 9, nome: "Referência", xp: 6500 },
  ];

  function levelFor(xp) {
    let cur = LEVELS[0];
    for (const l of LEVELS) if (xp >= l.xp) cur = l;
    const next = LEVELS.find((l) => l.n === cur.n + 1) || null;
    const span = next ? next.xp - cur.xp : 1;
    const pct = next ? Math.min(1, (xp - cur.xp) / span) : 1;
    return { ...cur, next, pct, faltam: next ? next.xp - xp : 0 };
  }

  // s = resumo calculado em state.js (Store.summary)
  const ACHIEVEMENTS = [
    { id: "primeiro-acerto", nome: "Primeira anotação", desc: "Acerte seu primeiro exercício.", test: (s) => s.solved >= 1 },
    { id: "primeira-licao", nome: "Página completa", desc: "Conclua sua primeira lição.", test: (s) => s.lessonsDone >= 1 },
    { id: "dez-primeira", nome: "Mão firme", desc: "Acerte 10 exercícios de primeira, sem dicas.", test: (s) => s.firstTry >= 10 },
    { id: "sem-dicas", nome: "De cabeça", desc: "Conclua uma lição inteira sem usar dicas.", test: (s) => s.lessonsNoHints >= 1 },
    { id: "primeiro-modulo", nome: "Capítulo fechado", desc: "Conclua um módulo inteiro, com desafios.", test: (s) => s.modulesDone >= 1 },
    { id: "cinquenta", nome: "Caderno cheio", desc: "Resolva 50 exercícios.", test: (s) => s.solved >= 50 },
    { id: "cem", nome: "Cem ensaios", desc: "Resolva 100 exercícios.", test: (s) => s.solved >= 100 },
    { id: "duzentos", nome: "Bancada própria", desc: "Resolva 200 exercícios.", test: (s) => s.solved >= 200 },
    { id: "desafio", nome: "Problema real", desc: "Resolva um desafio de fim de módulo.", test: (s) => s.challenges >= 1 },
    { id: "dez-desafios", nome: "Analista de campo", desc: "Resolva 10 desafios.", test: (s) => s.challenges >= 10 },
    { id: "streak-3", nome: "Três dias seguidos", desc: "Bata a meta diária 3 dias seguidos.", test: (s) => s.bestStreak >= 3 },
    { id: "streak-7", nome: "Uma semana", desc: "Bata a meta diária 7 dias seguidos.", test: (s) => s.bestStreak >= 7 },
    { id: "streak-30", nome: "Hábito formado", desc: "Bata a meta diária 30 dias seguidos.", test: (s) => s.bestStreak >= 30 },
    { id: "revisor", nome: "Revisor", desc: "Faça 25 revisões.", test: (s) => s.reviews >= 25 },
    { id: "revisor-100", nome: "Memória de longo prazo", desc: "Faça 100 revisões.", test: (s) => s.reviews >= 100 },
    { id: "nivelado", nome: "Já sabia", desc: "Passe num teste de nivelamento.", test: (s) => s.placements >= 1 },
    { id: "nivel-5", nome: "Pesquisador", desc: "Chegue ao nível 5.", test: (s) => s.level >= 5 },
    { id: "dados", nome: "Dados na mão", desc: "Conclua o módulo Python para dados.", test: (s) => s.doneModules.includes("m7") },
    { id: "trilha-completa", nome: "Tese defendida", desc: "Conclua todos os módulos.", test: (s) => s.modulesDone >= s.modulesTotal && s.modulesTotal > 0 },
  ];

  window.RULES = RULES;
  window.LEVELS = LEVELS;
  window.levelFor = levelFor;
  window.ACHIEVEMENTS = ACHIEVEMENTS;
})();
