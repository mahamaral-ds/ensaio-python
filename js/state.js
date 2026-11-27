/* Estado e progresso: salvo no navegador (localStorage), com exportação e importação em arquivo. */
(function () {
  "use strict";

  const KEY = "ensaio:progresso:v1";
  const DRAFTS = "ensaio:rascunhos:v1";
  const listeners = {};

  function today(d) {
    const x = d ? new Date(d) : new Date();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return x.getFullYear() + "-" + m + "-" + day;
  }
  function addDays(iso, n) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d + n);
    return today(dt);
  }
  function diffDays(a, b) {
    const pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    return Math.round((new Date(pb[0], pb[1] - 1, pb[2]) - new Date(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }

  function fresh() {
    return {
      app: "ensaio",
      version: 1,
      createdAt: new Date().toISOString(),
      xp: 0,
      xpLog: {}, // { "2026-11-27": 45 }
      goalDays: {}, // dias em que a meta foi batida
      bestStreak: 0,
      settings: { theme: "auto", dailyGoal: RULES.metaPadrao },
      ex: {}, // estado por exercício
      lessons: {}, // { "m1/variaveis": { done, at, noHints, mastered } }
      placement: {}, // { m1: { passed, score, at } }
      achievements: {}, // { id: data }
      reviews: 0,
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const s = JSON.parse(raw);
      return Object.assign(fresh(), s, { settings: Object.assign(fresh().settings, s.settings || {}) });
    } catch (e) {
      console.warn("Não foi possível ler o progresso salvo:", e);
      return fresh();
    }
  }

  let saveOk = true;
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      saveOk = true;
    } catch (e) {
      saveOk = false;
      console.warn("Não foi possível salvar o progresso:", e);
    }
  }

  function on(evt, fn) {
    (listeners[evt] = listeners[evt] || []).push(fn);
  }
  function emit(evt, data) {
    (listeners[evt] || []).forEach((fn) => {
      try { fn(data); } catch (e) { console.error(e); }
    });
  }

  function exState(id) {
    if (!state.ex[id]) {
      state.ex[id] = { solved: false, tries: 0, wrong: 0, hints: 0, solutionSeen: false, firstTry: false, xp: 0, box: 0, due: null, reviews: 0, reviewWrong: 0 };
    }
    return state.ex[id];
  }

  /* ---------- XP, níveis e sequência ---------- */

  function todayXP() {
    return state.xpLog[today()] || 0;
  }

  function addXP(amount, reason) {
    amount = Math.max(0, Math.round(amount));
    if (!amount) return;
    const before = levelFor(state.xp);
    const d = today();
    const hadGoal = !!state.goalDays[d];
    state.xp += amount;
    state.xpLog[d] = (state.xpLog[d] || 0) + amount;
    emit("xp", { amount, reason });
    if (!hadGoal && state.xpLog[d] >= state.settings.dailyGoal) {
      state.goalDays[d] = true;
      state.xp += RULES.xpMetaDiaria;
      state.xpLog[d] += RULES.xpMetaDiaria;
      state.bestStreak = Math.max(state.bestStreak, streak());
      emit("goal", { streak: streak(), bonus: RULES.xpMetaDiaria });
    }
    const after = levelFor(state.xp);
    if (after.n > before.n) emit("level", after);
    save();
    checkAchievements();
  }

  function streak() {
    let d = today();
    let count = 0;
    if (!state.goalDays[d]) d = addDays(d, -1); // hoje ainda pode ser cumprido
    while (state.goalDays[d]) {
      count++;
      d = addDays(d, -1);
    }
    return count;
  }

  /* ---------- Exercícios ---------- */

  function xpForSolve(item, es) {
    const ex = item.ex;
    const base = item.isChallenge ? RULES.xpDesafio : RULES.xpBase[ex.nivel || 1] || 10;
    if (es.solutionSeen) return Math.round(base * RULES.fatorSolucao);
    let mult = Math.max(RULES.pisoComDicas, 1 - RULES.perdaPorDica * es.hints);
    if (es.tries === 1 && es.hints === 0) mult = 1 + RULES.bonusPrimeira;
    return Math.round(base * mult);
  }

  function maxXP(item) {
    const base = item.isChallenge ? RULES.xpDesafio : RULES.xpBase[item.ex.nivel || 1] || 10;
    return Math.round(base * (1 + RULES.bonusPrimeira));
  }

  /* Registra uma tentativa no fluxo normal (lição ou desafio). Retorna XP ganho. */
  function attempt(item, correct) {
    const es = exState(item.id);
    if (es.solved) {
      // refazendo um exercício já resolvido: conta para estatística, sem XP
      es.tries++;
      if (!correct) es.wrong++;
      save();
      return 0;
    }
    es.tries++;
    if (!correct) {
      es.wrong++;
      save();
      return 0;
    }
    es.solved = true;
    es.firstTry = es.tries === 1 && es.hints === 0;
    es.solvedAt = today();
    es.box = 0;
    es.due = addDays(today(), RULES.intervalos[0]);
    const xp = xpForSolve(item, es);
    es.xp = xp;
    save();
    addXP(xp, "exercicio");
    return xp;
  }

  function useHint(item) {
    const es = exState(item.id);
    es.hints++;
    save();
  }
  function seeSolution(item) {
    const es = exState(item.id);
    if (!es.solved) es.solutionSeen = true;
    save();
  }

  /* Revisão espaçada. lapsed = já errou nesta sessão de revisão. */
  function reviewResult(item, correct, info) {
    const es = exState(item.id);
    es.tries++;
    if (!correct) {
      es.wrong++;
      es.reviewWrong++;
      es.box = 0;
      es.due = today(); // volta ainda nesta sessão / hoje
      es.lapsedOn = today(); // lembra do erro mesmo se a página for recarregada
      save();
      return 0;
    }
    es.reviews++;
    state.reviews++;
    info = Object.assign({}, info);
    if (es.lapsedOn === today()) info.lapsed = true;
    delete es.lapsedOn;
    if (info.lapsed) {
      es.box = 0;
    } else {
      es.box = Math.min(es.box + 1, RULES.intervalos.length - 1);
    }
    es.due = addDays(today(), RULES.intervalos[es.box]);
    let xp = RULES.xpRevisao(item.ex.nivel || 1);
    if (info.hints) xp = Math.max(2, xp - 2 * info.hints);
    else if (!info.lapsed && info.firstTry) xp = Math.round(xp * 1.5);
    if (info.solutionSeen) xp = 2;
    save();
    addXP(xp, "revisao");
    return xp;
  }

  function dueItems() {
    const t = today();
    const out = [];
    Object.keys(state.ex).forEach((id) => {
      const es = state.ex[id];
      const item = Ensaio.items[id];
      if (!item || !es.solved || !es.due) return;
      if (es.due <= t) out.push(item);
    });
    // mais atrasados primeiro
    out.sort((a, b) => (state.ex[a.id].due < state.ex[b.id].due ? -1 : 1));
    return out;
  }

  function upcoming(days) {
    const t = today();
    const counts = [];
    for (let i = 0; i < days; i++) counts.push(0);
    Object.keys(state.ex).forEach((id) => {
      const es = state.ex[id];
      if (!Ensaio.items[id] || !es.solved || !es.due) return;
      const dd = Math.max(0, diffDays(t, es.due));
      if (dd < days) counts[dd]++;
    });
    return counts;
  }

  /* ---------- Lições, módulos e desbloqueio ---------- */

  function lessonStatus(lesson) {
    const ls = state.lessons[lesson.key];
    const solved = lesson.exercicios.filter((ex) => (state.ex[ex.id] || {}).solved).length;
    return {
      solved,
      total: lesson.exercicios.length,
      done: !!(ls && (ls.done || ls.mastered)),
      mastered: !!(ls && ls.mastered && !ls.done),
    };
  }

  function completeLessonIfDone(lesson) {
    const st = lessonStatus(lesson);
    const ls = state.lessons[lesson.key] || {};
    if (ls.done || st.solved < st.total) return false;
    const noHints = lesson.exercicios.every((ex) => {
      const e = state.ex[ex.id];
      return e && e.hints === 0 && !e.solutionSeen;
    });
    state.lessons[lesson.key] = Object.assign(ls, { done: true, at: today(), noHints });
    save();
    addXP(RULES.xpLicao, "licao");
    emit("lesson", lesson);
    return true;
  }

  function moduleStatus(m) {
    const lessonsDone = m.licoes.filter((l) => lessonStatus(l).done).length;
    const chDone = m.desafios.filter((d) => (state.ex[d.id_completo] || {}).solved).length;
    const exTotal = m.licoes.reduce((a, l) => a + l.exercicios.length, 0);
    const exSolved = m.licoes.reduce((a, l) => a + lessonStatus(l).solved, 0);
    const pl = state.placement[m.id];
    return {
      lessonsDone,
      lessonsTotal: m.licoes.length,
      chDone,
      chTotal: m.desafios.length,
      exSolved,
      exTotal,
      mastered: !!(pl && pl.passed),
      done: lessonsDone === m.licoes.length && chDone === m.desafios.length && m.licoes.length > 0,
      pct: m.licoes.length ? lessonsDone / m.licoes.length : 0,
    };
  }

  function isUnlocked(m) {
    if (m.index === 0) return true;
    if (state.placement[m.id] && state.placement[m.id].passed) return true;
    if (Object.keys(state.lessons).some((k) => k.startsWith(m.id + "/"))) return true;
    const prev = Ensaio.modules[m.index - 1];
    const ps = moduleStatus(prev);
    return ps.mastered || ps.pct >= RULES.desbloqueio;
  }

  function placementResult(m, score, total) {
    const passed = score / total >= RULES.aprovacaoNivelamento;
    const prevPassed = state.placement[m.id] && state.placement[m.id].passed;
    state.placement[m.id] = { passed: passed || !!prevPassed, score, total, at: today() };
    if (passed) {
      m.licoes.forEach((l) => {
        const ls = state.lessons[l.key] || {};
        if (!ls.done) state.lessons[l.key] = Object.assign(ls, { mastered: true, at: today() });
      });
    }
    save();
    if (passed && !prevPassed) addXP(RULES.xpNivelamento, "nivelamento");
    else checkAchievements();
    return passed;
  }

  /* ---------- Resumo e conquistas ---------- */

  function summary() {
    let solved = 0, firstTry = 0, challenges = 0;
    Object.keys(state.ex).forEach((id) => {
      const es = state.ex[id];
      const item = Ensaio.items[id];
      if (!item || !es.solved) return;
      solved++;
      if (es.firstTry) firstTry++;
      if (item.isChallenge) challenges++;
    });
    const lessonsDone = Object.values(state.lessons).filter((l) => l.done).length;
    const lessonsNoHints = Object.values(state.lessons).filter((l) => l.done && l.noHints).length;
    const doneModules = Ensaio.modules.filter((m) => moduleStatus(m).done).map((m) => m.id);
    return {
      solved,
      firstTry,
      challenges,
      lessonsDone,
      lessonsNoHints,
      doneModules,
      modulesDone: doneModules.length,
      modulesTotal: Ensaio.modules.length,
      bestStreak: Math.max(state.bestStreak, streak()),
      streak: streak(),
      reviews: state.reviews,
      placements: Object.values(state.placement).filter((p) => p.passed).length,
      level: levelFor(state.xp).n,
      xp: state.xp,
    };
  }

  let checking = false;
  function checkAchievements() {
    if (checking) return;
    checking = true;
    try {
      const s = summary();
      ACHIEVEMENTS.forEach((a) => {
        if (!state.achievements[a.id] && a.test(s)) {
          state.achievements[a.id] = today();
          save();
          emit("achievement", a);
          addXP(RULES.xpConquista, "conquista");
        }
      });
    } finally {
      checking = false;
    }
  }

  /* Taxa de acerto por tema (módulo e lição): acertos / tentativas. */
  function accuracy() {
    const byModule = {};
    const byLesson = {};
    Object.keys(state.ex).forEach((id) => {
      const es = state.ex[id];
      const item = Ensaio.items[id];
      if (!item || !es.tries) return;
      const ok = es.tries - es.wrong;
      const mm = (byModule[item.module.id] = byModule[item.module.id] || { ok: 0, tries: 0 });
      mm.ok += ok;
      mm.tries += es.tries;
      if (item.lesson) {
        const ll = (byLesson[item.lesson.key] = byLesson[item.lesson.key] || { ok: 0, tries: 0, lesson: item.lesson });
        ll.ok += ok;
        ll.tries += es.tries;
      }
    });
    return { byModule, byLesson };
  }

  /* ---------- Configurações, exportar, importar ---------- */

  function setSetting(k, v) {
    state.settings[k] = v;
    save();
    emit("settings", state.settings);
  }

  function exportJSON() {
    return JSON.stringify(Object.assign({}, state, { exportedAt: new Date().toISOString() }), null, 2);
  }

  function importJSON(text) {
    let s;
    try {
      s = JSON.parse(text);
    } catch (e) {
      throw new Error("O arquivo não é um JSON válido.");
    }
    if (!s || s.app !== "ensaio" || typeof s.xp !== "number" || typeof s.ex !== "object") {
      throw new Error("Esse arquivo não parece ser um progresso exportado do Ensaio.");
    }
    delete s.exportedAt;
    state = Object.assign(fresh(), s, { settings: Object.assign(fresh().settings, s.settings || {}) });
    save();
    emit("settings", state.settings);
  }

  function reset() {
    state = fresh();
    save();
    try { localStorage.removeItem(DRAFTS); } catch (e) { /* ignora */ }
  }

  /* Rascunhos do editor (conveniência local) */
  let drafts = null;
  function getDraft(id) {
    try {
      if (!drafts) drafts = JSON.parse(localStorage.getItem(DRAFTS) || "{}");
    } catch (e) { drafts = {}; }
    return drafts[id];
  }
  function setDraft(id, code) {
    try {
      if (!drafts) drafts = JSON.parse(localStorage.getItem(DRAFTS) || "{}");
      if (code == null) delete drafts[id];
      else drafts[id] = code;
      localStorage.setItem(DRAFTS, JSON.stringify(drafts));
    } catch (e) { /* sem armazenamento: ignora */ }
  }

  window.Store = {
    get state() { return state; },
    get saveOk() { return saveOk; },
    on, today, addDays, diffDays,
    exState, attempt, useHint, seeSolution, reviewResult, xpForSolve, maxXP,
    dueItems, upcoming,
    lessonStatus, completeLessonIfDone, moduleStatus, isUnlocked, placementResult,
    addXP, todayXP, streak, summary, checkAchievements, accuracy,
    setSetting, exportJSON, importJSON, reset,
    getDraft, setDraft,
  };
})();
