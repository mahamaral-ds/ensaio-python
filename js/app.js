/* Level Code: telas, navegação e microinterações. */
(function () {
  "use strict";
  const esc = (s) => MD.esc(s);
  const main = document.getElementById("main");
  Ensaio.preparar();

  /* ---------- Tema ---------- */
  function applyTheme() {
    const t = Store.state.settings.theme || "auto";
    document.documentElement.setAttribute("data-theme", t === "claro" ? "light" : t === "escuro" ? "dark" : "auto");
  }
  applyTheme();
  Store.on("settings", () => { applyTheme(); renderChrome(); });

  /* ---------- Navegação ---------- */
  const NAV = [
    { id: "hoje", label: "Hoje", icon: "caderno" },
    { id: "trilhas", label: "Trilhas", icon: "trilhas" },
    { id: "revisar", label: "Revisar", icon: "revisar" },
    { id: "progresso", label: "Progresso", icon: "progresso" },
    { id: "ajustes", label: "Ajustes", icon: "ajustes" },
  ];
  const SECTION_OF = { modulo: "trilhas", licao: "trilhas", desafio: "trilhas", nivelamento: "trilhas" };

  function currentSection() {
    const r = parseRoute();
    return SECTION_OF[r.view] || r.view;
  }

  function renderChrome() {
    const sec = currentSection();
    const due = Store.dueItems().length;
    const navHtml = NAV.map((n) => {
      const badge = n.id === "revisar" && due ? '<span class="badge" aria-label="' + due + ' pendentes">' + due + "</span>" : "";
      return '<a href="#/' + n.id + '" class="nav-item' + (sec === n.id ? " active" : "") + '"' + (sec === n.id ? ' aria-current="page"' : "") + ">" +
        icon(n.icon, 22) + '<span class="nav-label">' + n.label + "</span>" + badge + "</a>";
    }).join("");
    document.getElementById("side-nav").innerHTML = navHtml;
    document.getElementById("tabbar").innerHTML = navHtml;

    const s = Store.state;
    const lv = levelFor(s.xp);
    const goal = s.settings.dailyGoal;
    const tx = Store.todayXP();
    const st = Store.streak();
    document.getElementById("side-status").innerHTML =
      '<div class="ss-level"><div class="ss-row"><span class="ss-name">' + esc(lv.nome) + '</span><span class="ss-n">nível ' + lv.n + "</span></div>" +
      bar(lv.pct, "Progresso até o próximo nível") +
      '<div class="ss-sub">' + (lv.next ? lv.faltam + " XP para " + esc(lv.next.nome) : "Nível máximo") + "</div></div>" +
      '<div class="ss-row ss-goal">' + icon("chama", 18) + "<span>" + st + " dia" + (st === 1 ? "" : "s") + '</span><span class="ss-muted">' + Math.min(tx, goal) + "/" + goal + " XP hoje</span></div>";
    document.getElementById("top-status").innerHTML =
      '<span class="chip" title="Sequência de dias">' + icon("chama", 16) + st + "</span>" +
      '<span class="chip chip-xp" title="' + esc(lv.nome) + '" aria-label="Nível ' + lv.n + ', ' + s.xp + ' XP"><span aria-hidden="true">' + lv.n + '</span>' + s.xp + " XP</span>";
  }

  function bar(pct, label, cls) {
    const p = Math.round(Math.max(0, Math.min(1, pct)) * 100);
    return '<div class="bar ' + (cls || "") + '" role="progressbar" aria-label="' + esc(label || "Progresso") + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p + '"><span style="width:' + p + '%"></span></div>';
  }

  function parseRoute() {
    const h = (location.hash || "#/hoje").replace(/^#\/?/, "");
    const parts = h.split("/").map(decodeURIComponent);
    return { view: parts[0] || "hoje", args: parts.slice(1) };
  }

  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function route() {
    const r = parseRoute();
    const views = { hoje: viewHoje, trilhas: viewTrilhas, modulo: viewModulo, licao: viewLicao, desafio: viewDesafio, revisar: viewRevisar, nivelamento: viewNivelamento, progresso: viewProgresso, ajustes: viewAjustes };
    const fn = views[r.view] || viewHoje;
    main.innerHTML = "";
    main.className = "view-" + r.view;
    try {
      fn.apply(null, r.args);
    } catch (e) {
      console.error(e);
      main.innerHTML = '<div class="page"><h1>Algo deu errado</h1><p>Não foi possível abrir esta página.</p><pre class="out">' + esc(e.stack || e) + "</pre></div>";
    }
    renderChrome();
    window.scrollTo(0, 0);
    const h1 = main.querySelector("h1");
    if (h1 && route.count++) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
  }
  route.count = 0;
  window.addEventListener("hashchange", route);

  /* ---------- Microinterações ---------- */
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function toast(html, kind, ms) {
    const box = document.getElementById("toasts");
    const t = document.createElement("div");
    t.className = "toast " + (kind || "");
    t.innerHTML = html;
    while (box.children.length >= 3) box.firstElementChild.remove();
    box.appendChild(t);
    setTimeout(() => {
      t.classList.add("out");
      setTimeout(() => t.remove(), reduced() ? 0 : 300);
    }, ms || 2600);
  }

  Store.on("xp", (e) => {
    if (e.reason === "conquista") { renderChrome(); return; }
    toast('<span class="stamp">+' + e.amount + " XP</span>", "toast-xp", 1800);
    renderChrome();
  });
  Store.on("goal", (e) => toast(icon("chama", 18) + " <span>Meta do dia batida. Sequência: <strong>" + e.streak + "</strong> dia(s). +" + e.bonus + " XP</span>", "toast-goal", 4200));
  Store.on("achievement", (a) => toast(icon("medalha", 18) + " <span>Conquista: <strong>" + esc(a.nome) + "</strong> <span class=\"xp-inline\">+" + RULES.xpConquista + " XP</span><br><small>" + esc(a.desc) + "</small></span>", "toast-ach", 5000));
  Store.on("level", (lv) => {
    const ov = document.getElementById("overlay");
    ov.hidden = false;
    ov.innerHTML = '<div class="levelup" role="dialog" aria-modal="true" aria-labelledby="lvl-t">' +
      '<div class="levelup-stamp"><span class="lu-n">nível ' + lv.n + '</span><span class="lu-name" id="lvl-t">' + esc(lv.nome) + "</span></div>" +
      "<p>" + (lv.next ? "Próximo: " + esc(lv.next.nome) + " em " + lv.faltam + " XP." : "Você chegou ao último nível.") + "</p>" +
      '<button class="btn btn-primary" id="lvl-ok">Continuar</button></div>';
    const close = () => { ov.hidden = true; ov.innerHTML = ""; document.removeEventListener("keydown", onKey); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    ov.onclick = (e) => { if (e.target === ov) close(); };
    document.getElementById("lvl-ok").onclick = close;
    setTimeout(() => document.getElementById("lvl-ok") && document.getElementById("lvl-ok").focus(), 60);
  });

  /* ---------- Auxiliares de conteúdo ---------- */
  function nextLesson() {
    const ultima = Store.state.ultimaTrilha;
    const ordem = Ensaio.modules.slice().sort((a, b) => (a.trilha === ultima ? 0 : 1) - (b.trilha === ultima ? 0 : 1) || a.index - b.index);
    for (const m of ordem) {
      if (!Store.isUnlocked(m)) continue;
      for (const l of m.licoes) if (!Store.lessonStatus(l).done) return l;
      for (const d of m.desafios) if (!(Store.state.ex[d.id_completo] || {}).solved) return { challenge: d, module: m };
    }
    return null;
  }

  function lessonHref(l) { return "#/licao/" + l.module.id + "/" + l.id; }
  function nomeModulo(m) { return m.trilhaObj.titulo + " · Módulo " + m.numero; }
  function crumbs(list) {
    return '<nav class="crumbs" aria-label="Você está em">' + list.map((c, i) =>
      i < list.length - 1 ? '<a href="' + c[1] + '">' + esc(c[0]) + "</a>" : '<span aria-current="page">' + esc(c[0]) + "</span>"
    ).join('<span class="sep" aria-hidden="true">/</span>') + "</nav>";
  }
  function fmtDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  }

  /* ========== Hoje ========== */
  function viewHoje() {
    const s = Store.state;
    const lv = levelFor(s.xp);
    const goal = s.settings.dailyGoal;
    const tx = Store.todayXP();
    const due = Store.dueItems().length;
    const nl = nextLesson();
    const first = s.xp === 0 && !Object.keys(s.ex).length;
    let cont = "";
    if (nl && nl.challenge) {
      cont = '<p class="card-kicker">Continuar</p><h2>Desafio: ' + esc(nl.challenge.titulo) + '</h2><p class="muted">' + esc(nomeModulo(nl.module)) + " · " + esc(nl.module.titulo) +
        '</p><a class="btn btn-primary" href="#/desafio/' + nl.module.id + "/" + nl.challenge.id + '">Abrir desafio ' + icon("direita", 16) + "</a>";
    } else if (nl) {
      const st = Store.lessonStatus(nl);
      cont = '<p class="card-kicker">' + (st.solved ? "Continuar de onde parou" : "Próxima lição") + "</p><h2>" + esc(nl.titulo) +
        '</h2><p class="muted">' + esc(nomeModulo(nl.module)) + " · " + esc(nl.module.titulo) + " · " + st.solved + "/" + st.total + " exercícios</p>" +
        '<a class="btn btn-primary" href="' + lessonHref(nl) + '">' + (st.solved ? "Continuar" : "Começar") + " " + icon("direita", 16) + "</a>";
    } else {
      cont = '<p class="card-kicker">Trilha</p><h2>Tudo concluído por aqui</h2><p class="muted">Siga revisando para manter o conteúdo vivo na memória.</p>';
    }

    main.innerHTML =
      '<div class="page">' +
      '<header class="page-head"><p class="kicker">' + esc(fmtDate(Store.today())) + "</p><h1>Caderno de hoje</h1></header>" +
      (first ? '<div class="card intro prose"><p><strong>Bem-vindo ao Level Code.</strong> Cada lição é uma página do caderno: uma anotação curta, um experimento que você roda aqui mesmo, um erro comum e quatro exercícios corrigidos automaticamente.</p><p>Já sabe parte do conteúdo? Em <a href="#/trilhas">Trilhas</a>, cada módulo tem um <strong>teste de nivelamento</strong> para pular o que você domina.</p></div>' : "") +
      '<div class="grid-2">' +
      '<section class="card card-continue">' + cont + "</section>" +
      '<section class="card"><p class="card-kicker">Meta do dia</p><div class="goal-num"><span class="big">' + Math.min(tx, goal) + '</span><span class="muted"> / ' + goal + " XP</span></div>" +
      bar(tx / goal, "Meta diária", "bar-lg") +
      '<p class="muted goal-streak">' + icon("chama", 18) + " Sequência de " + Store.streak() + " dia(s) · melhor: " + Math.max(s.bestStreak, Store.streak()) + "</p></section>" +
      '<section class="card"><p class="card-kicker">Revisão espaçada</p><div class="goal-num"><span class="big">' + due + '</span><span class="muted"> pendente' + (due === 1 ? "" : "s") + "</span></div>" +
      '<p class="muted">Exercícios já resolvidos voltam em 1, 3, 7, 15 e 30 dias. Os errados voltam mais cedo.</p>' +
      (due ? '<a class="btn btn-primary" href="#/revisar">' + icon("revisar", 16) + " Revisar agora</a>" : '<p class="muted small">Nada pendente hoje.</p>') + "</section>" +
      '<section class="card"><p class="card-kicker">Nível ' + lv.n + '</p><h2 class="serif">' + esc(lv.nome) + "</h2>" + bar(lv.pct, "Progresso no nível", "bar-lg") +
      '<p class="muted">' + s.xp + " XP no total" + (lv.next ? " · faltam " + lv.faltam + " para " + esc(lv.next.nome) : "") + "</p></section>" +
      "</div></div>";
  }

  /* ========== Trilhas ========== */
  function viewTrilhas() {
    let h = '<div class="page"><header class="page-head"><p class="kicker">Índice</p><h1>Trilhas</h1><p class="lead">' + Ensaio.trilhas.length + " trilhas. Cada uma tem os seus módulos, desbloqueados em ordem, e um teste de nivelamento por módulo para pular o que você já domina.</p></header>";
    h += '<nav class="track-jump" aria-label="Ir para a trilha">' + Ensaio.trilhas.map((t) => '<a class="btn btn-ghost" href="#trilha-' + t.id + '" data-trilha="' + t.id + '">' + esc(t.titulo) + "</a>").join("") + "</nav>";
    Ensaio.trilhas.forEach((t) => {
      const c = Ensaio.contagem(t.id);
      const feitos = t.modulos.filter((m) => Store.moduleStatus(m).done).length;
      h += '<section class="track" id="trilha-' + t.id + '" aria-labelledby="th-' + t.id + '"><header class="track-head"><h2 id="th-' + t.id + '">' + esc(t.titulo) + '</h2><p class="muted">' + esc(t.resumo || "") + '</p><p class="module-meta">' + c.modulos + " módulos · " + c.licoes + " lições · " + c.exercicios + " exercícios · " + c.desafios + " desafios · " + feitos + " concluído" + (feitos === 1 ? "" : "s") + '</p></header><ol class="modules">';
      t.modulos.forEach((m) => {
      const st = Store.moduleStatus(m);
      const un = Store.isUnlocked(m);
      const cls = st.done ? " is-done" : !un ? " is-locked" : "";
      h += '<li class="module-row' + cls + '"><a href="#/modulo/' + m.id + '" class="module-link">' +
        '<span class="module-n" aria-hidden="true">' + String(m.numero).padStart(2, "0") + "</span>" +
        '<span class="module-main"><span class="module-title">' + esc(m.titulo) + (un ? "" : ' <span class="tag">' + icon("lock", 14) + " bloqueado</span>") +
        (st.mastered ? ' <span class="tag tag-hl">dominado</span>' : "") + (st.done ? ' <span class="tag tag-ok">' + icon("check", 14) + " concluído</span>" : "") + "</span>" +
        '<span class="module-sum">' + esc(m.resumo) + "</span>" +
        '<span class="module-meta">' + st.lessonsDone + "/" + st.lessonsTotal + " lições · " + st.exSolved + "/" + st.exTotal + " exercícios · " + st.chDone + "/" + st.chTotal + " desafios</span>" +
        bar(st.pct, "Lições concluídas em " + m.titulo) + "</span></a></li>";
      });
      h += "</ol></section>";
    });
    h += "</div>";
    main.innerHTML = h;
    main.querySelectorAll(".track-jump a").forEach((a) => (a.onclick = (e) => {
      e.preventDefault();
      document.getElementById("trilha-" + a.dataset.trilha).scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    }));
  }

  /* ========== Módulo ========== */
  function viewModulo(id) {
    const m = Ensaio.modulesById[id];
    if (!m) return go("#/trilhas");
    const st = Store.moduleStatus(m);
    const un = Store.isUnlocked(m);
    const prev = Ensaio.anterior(m);
    let h = '<div class="page">' + crumbs([["Trilhas", "#/trilhas"], [m.trilhaObj.titulo, "#/trilhas"], [m.titulo]]) +
      '<header class="page-head"><p class="kicker">' + esc(nomeModulo(m)) + "</p><h1>" + esc(m.titulo) + '</h1><p class="lead">' + esc(m.resumo) + "</p></header>";
    if (!un) {
      h += '<div class="card notice">' + icon("lock", 20) + "<div><p><strong>Módulo bloqueado.</strong> Conclua " + Math.round(RULES.desbloqueio * 100) + "% das lições de <a href=\"#/modulo/" + prev.id + '">' + esc(prev.titulo) + "</a> ou passe no teste de nivelamento de um dos dois módulos.</p></div></div>";
    }
    const pl = Store.state.placement[m.id];
    h += '<div class="card placement-card"><div>' + icon("alvo", 22) + '</div><div><p><strong>Teste de nivelamento.</strong> ' + RULES.questoesNivelamento + " questões, sem dicas. Com " + Math.round(RULES.aprovacaoNivelamento * 100) + "% de acerto, o módulo fica marcado como dominado e o próximo é liberado." +
      (pl ? ' <span class="muted">Última tentativa: ' + pl.score + "/" + pl.total + (pl.passed ? ", aprovado." : ".") + "</span>" : "") + '</p></div><a class="btn" href="#/nivelamento/' + m.id + '">Fazer o teste</a></div>';

    h += '<h2 class="section-title">Lições</h2><ol class="lessons">';
    m.licoes.forEach((l, i) => {
      const ls = Store.lessonStatus(l);
      const cls = ls.done ? " is-done" : "";
      const inner = '<span class="lesson-n">' + m.numero + "." + (i + 1) + '</span><span class="lesson-title"><span class="strike">' + esc(l.titulo) + "</span></span>" +
        '<span class="lesson-meta">' + (ls.mastered ? '<span class="tag tag-hl">dominado</span>' : ls.solved + "/" + ls.total) + "</span>";
      h += '<li class="lesson-row' + cls + '">' + (un ? '<a href="' + lessonHref(l) + '">' + inner + "</a>" : '<span class="is-locked">' + inner + "</span>") + "</li>";
    });
    h += "</ol>";
    if (m.desafios.length) {
      h += '<h2 class="section-title">Desafios do módulo</h2><ol class="lessons challenges">';
      m.desafios.forEach((d, i) => {
        const ok = (Store.state.ex[d.id_completo] || {}).solved;
        const inner = '<span class="lesson-n">' + icon("frasco", 18) + '</span><span class="lesson-title"><span class="strike">' + esc(d.titulo) + "</span></span>" +
          '<span class="lesson-meta">' + (ok ? icon("check", 16) : "até " + Store.maxXP(Ensaio.items[d.id_completo]) + " XP") + "</span>";
        h += '<li class="lesson-row' + (ok ? " is-done" : "") + '">' + (un ? '<a href="#/desafio/' + m.id + "/" + d.id + '">' + inner + "</a>" : '<span class="is-locked">' + inner + "</span>") + "</li>";
      });
      h += "</ol>";
    }
    h += "</div>";
    main.innerHTML = h;
  }

  /* ========== Lição ========== */
  function viewLicao(mid, lid) {
    const l = Ensaio.lessonsByKey[mid + "/" + lid];
    if (!l) return go("#/trilhas");
    const m = l.module;
    if (!Store.isUnlocked(m)) return go("#/modulo/" + m.id);
    const pos = m.numero + "." + (l.index + 1);
    const amb = Ensaio.ambiente(m, l);
    const modo = amb.linguagem;
    const banco = amb.banco ? amb.banco.script : "";

    main.innerHTML = '<div class="page page-lesson">' + crumbs([["Trilhas", "#/trilhas"], [m.trilhaObj.titulo, "#/trilhas"], [m.titulo, "#/modulo/" + m.id], [l.titulo]]) +
      '<header class="page-head"><p class="kicker">' + esc(m.trilhaObj.titulo) + " · Lição " + pos + "</p><h1>" + esc(l.titulo) + "</h1></header>" +
      '<section class="sheet" aria-labelledby="s-anot"><h2 id="s-anot" class="sheet-title"><span class="sheet-n">I</span> Anotação</h2><div class="prose">' + MD.render(l.explicacao, modo) + "</div>" + Exercise.bancoPanel(amb) + "</section>" +
      '<section class="sheet" aria-labelledby="s-exp"><h2 id="s-exp" class="sheet-title"><span class="sheet-n">II</span> Experimento</h2><p class="muted small">Edite e execute à vontade. Nada aqui vale XP.</p>' +
      '<div class="editor-wrap" id="exp-ed"></div><div class="ex-actions"><button class="btn btn-primary" id="exp-run">' + icon("play", 16) + ' Executar</button><button class="btn btn-ghost" id="exp-reset">' + icon("desfazer", 16) + ' Restaurar</button></div><div id="exp-out" aria-live="polite"></div></section>' +
      (l.erro ? '<section class="sheet sheet-err" aria-labelledby="s-err"><h2 id="s-err" class="sheet-title"><span class="sheet-n">III</span> Erro comum</h2>' + MD.highlight(l.erro.codigo, modo) +
        '<div class="prose">' + MD.render(l.erro.explicacao, modo) + '</div><button class="btn btn-ghost" id="err-run">' + icon("play", 16) + ' Executar este código</button><div id="err-out" aria-live="polite"></div></section>' : "") +
      '<section class="sheet" aria-labelledby="s-ex"><h2 id="s-ex" class="sheet-title"><span class="sheet-n">IV</span> Exercícios</h2><ol class="stepper" id="stepper" aria-label="Exercícios da lição"></ol><div id="ex-slot"></div><div id="lesson-done"></div></section>' +
      '<nav class="lesson-nav" id="lesson-nav"></nav></div>';

    // Experimento
    const files = amb.arquivos || {};
    const exp = Editor.create(document.getElementById("exp-ed"), { value: l.exemplo, label: "Editor do experimento", onRun: runExp, linguagem: modo });
    async function runExp() {
      const out = document.getElementById("exp-out");
      out.innerHTML = '<p class="running">' + icon("relogio", 16) + ' <span class="run-status">Executando…</span></p>';
      const res = await Runner.run({ code: exp.get(), files, stdin: l.entrada || [], linguagem: modo, banco, setup: amb.setup, onStatus: (s) => { const e = out.querySelector(".run-status"); if (e) e.textContent = s; } });
      Exercise.renderOutput(out, res);
    }
    document.getElementById("exp-run").onclick = runExp;
    document.getElementById("exp-reset").onclick = () => exp.set(l.exemplo);
    const er = document.getElementById("err-run");
    if (er) er.onclick = async () => {
      const out = document.getElementById("err-out");
      out.innerHTML = '<p class="running">' + icon("relogio", 16) + ' <span class="run-status">Executando…</span></p>';
      const res = await Runner.run({ code: l.erro.codigo, files, stdin: l.entrada || [], linguagem: modo, banco, setup: amb.setup, onStatus: (s) => { const e = out.querySelector(".run-status"); if (e) e.textContent = s; } });
      Exercise.renderOutput(out, res);
    };
    Runner.warmup();

    // Exercícios
    const items = l.exercicios.map((ex) => Ensaio.items[ex.id]);
    let cur = items.findIndex((it) => !(Store.state.ex[it.id] || {}).solved);
    if (cur < 0) cur = 0;

    function renderStepper() {
      document.getElementById("stepper").innerHTML = items.map((it, i) => {
        const ok = (Store.state.ex[it.id] || {}).solved;
        return '<li><button class="step' + (ok ? " ok" : "") + (i === cur ? " cur" : "") + '" data-i="' + i + '" aria-label="Exercício ' + (i + 1) + (ok ? ", resolvido" : "") + '"' + (i === cur ? ' aria-current="step"' : "") + ">" +
          (ok ? icon("check", 14) : i + 1) + "</button></li>";
      }).join("");
      document.querySelectorAll("#stepper .step").forEach((b) => (b.onclick = () => { cur = Number(b.dataset.i); show(); }));
    }

    function show() {
      renderStepper();
      const it = items[cur];
      const isLast = cur === items.length - 1;
      Exercise.mount(document.getElementById("ex-slot"), it, {
        mode: "licao",
        label: "Exercício " + (cur + 1) + " de " + items.length,
        nextLabel: isLast ? "Concluir" : "Próximo exercício",
        onSolved: () => {
          renderStepper();
          if (Store.completeLessonIfDone(l)) celebrate();
        },
        onNext: () => {
          const nextUnsolved = items.findIndex((x, i) => i > cur && !(Store.state.ex[x.id] || {}).solved);
          if (nextUnsolved >= 0) cur = nextUnsolved;
          else if (cur < items.length - 1) cur++;
          else {
            const firstUnsolved = items.findIndex((x) => !(Store.state.ex[x.id] || {}).solved);
            if (firstUnsolved >= 0) cur = firstUnsolved;
            else { celebrate(true); return; }
          }
          show();
          document.getElementById("stepper").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        },
      });
    }
    show();

    function celebrate(scroll) {
      const box = document.getElementById("lesson-done");
      const nxt = l.module.licoes[l.index + 1];
      const nextHref = nxt ? lessonHref(nxt) : m.desafios.length ? "#/desafio/" + m.id + "/" + m.desafios[0].id : "#/modulo/" + m.id;
      const nextLabel = nxt ? "Próxima lição: " + nxt.titulo : m.desafios.length ? "Ir para os desafios do módulo" : "Voltar ao módulo";
      box.innerHTML = '<div class="done-card"><div class="done-stamp">Lição concluída</div><p>Os exercícios desta lição entram na revisão espaçada a partir de amanhã.</p>' +
        '<a class="btn btn-hl" href="' + nextHref + '">' + esc(nextLabel) + " " + icon("direita", 16) + "</a></div>";
      if (scroll) box.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    }
    if (Store.lessonStatus(l).done && !Store.lessonStatus(l).mastered) celebrate(false);

    // navegação entre lições
    const prevL = m.licoes[l.index - 1], nextL = m.licoes[l.index + 1];
    document.getElementById("lesson-nav").innerHTML =
      (prevL ? '<a class="btn btn-ghost" href="' + lessonHref(prevL) + '">' + icon("esquerda", 16) + " " + esc(prevL.titulo) + "</a>" : "<span></span>") +
      (nextL ? '<a class="btn btn-ghost" href="' + lessonHref(nextL) + '">' + esc(nextL.titulo) + " " + icon("direita", 16) + "</a>" : "");
  }

  /* ========== Desafio ========== */
  function viewDesafio(mid, did) {
    const m = Ensaio.modulesById[mid];
    const item = Ensaio.items[mid + "/desafio/" + did];
    if (!m || !item) return go("#/trilhas");
    if (!Store.isUnlocked(m)) return go("#/modulo/" + m.id);
    const d = item.ex;
    main.innerHTML = '<div class="page page-lesson">' + crumbs([["Trilhas", "#/trilhas"], [m.titulo, "#/modulo/" + m.id], [d.titulo]]) +
      '<header class="page-head"><p class="kicker">' + icon("frasco", 16) + " Desafio · " + esc(nomeModulo(m)) + "</p><h1>" + esc(d.titulo) + "</h1></header>" +
      '<div id="ch-slot"></div><div id="ch-done"></div></div>';
    const nextD = m.desafios[item.number];
    Exercise.mount(document.getElementById("ch-slot"), item, {
      mode: "desafio",
      label: "Desafio " + item.number + " de " + m.desafios.length,
      nextLabel: nextD ? "Próximo desafio" : "Voltar ao módulo",
      onNext: () => go(nextD ? "#/desafio/" + m.id + "/" + nextD.id : "#/modulo/" + m.id),
      onSolved: () => {
        Store.checkAchievements();
        if (Store.moduleStatus(m).done) {
          document.getElementById("ch-done").innerHTML = '<div class="done-card"><div class="done-stamp">Módulo concluído</div><p>' + esc(m.titulo) + ' fechado: lições e desafios completos.</p><a class="btn btn-hl" href="#/trilhas">Ver trilhas ' + icon("direita", 16) + "</a></div>";
        }
      },
    });
  }

  /* ========== Revisar ========== */
  function viewRevisar() {
    const due = Store.dueItems();
    if (!due.length) {
      const up = Store.upcoming(8).slice(1);
      const max = Math.max(1, ...up);
      main.innerHTML = '<div class="page"><header class="page-head"><p class="kicker">Revisão espaçada</p><h1>Nada para revisar agora</h1><p class="lead">Os exercícios resolvidos voltam aqui em intervalos de ' + RULES.intervalos.join(", ") + " dias. Errou na revisão? Ele volta no dia seguinte.</p></header>" +
        '<section class="card"><p class="card-kicker">Próximos 7 dias</p><div class="mini-bars">' +
        up.map((n, i) => '<div class="mb"><span class="mb-bar" style="height:' + Math.round((n / max) * 100) + '%"></span><span class="mb-n">' + n + '</span><span class="mb-d">' + shortDay(Store.addDays(Store.today(), i + 1)) + "</span></div>").join("") +
        "</div></section></div>";
      return;
    }
    const queue = due.slice(0, 20);
    let i = 0, correct = 0, xpStart = Store.state.xp;
    main.innerHTML = '<div class="page page-lesson"><header class="page-head"><p class="kicker">Revisão espaçada</p><h1>Revisão de hoje</h1><p class="lead" id="rv-count"></p></header><div id="rv-slot"></div></div>';
    function show() {
      if (i >= queue.length) return end();
      const it = queue[i];
      document.getElementById("rv-count").textContent = "Item " + (i + 1) + " de " + queue.length + (due.length > queue.length ? " (mais " + (due.length - queue.length) + " depois)" : "") + " · " + it.module.titulo + (it.lesson ? " · " + it.lesson.titulo : "");
      let wrongOnce = false;
      Exercise.mount(document.getElementById("rv-slot"), it, {
        mode: "revisao",
        label: "Revisão " + (i + 1),
        nextLabel: i < queue.length - 1 ? "Próxima" : "Finalizar",
        onNext: () => {
          const es = Store.state.ex[it.id];
          if (es && es.due > Store.today() && !wrongOnce) correct++;
          i++;
          show();
          renderChrome();
        },
      });
      const fb = document.querySelector("#rv-slot .ex-feedback");
      new MutationObserver(() => { if (fb.classList.contains("fb-err")) wrongOnce = true; }).observe(fb, { attributes: true });
    }
    function end() {
      const gained = Store.state.xp - xpStart;
      main.innerHTML = '<div class="page"><div class="done-card"><div class="done-stamp">Revisão feita</div><p>' + queue.length + " itens revisados, " + correct + " certos de primeira. +" + gained + ' XP.</p><a class="btn btn-hl" href="#/hoje">Voltar para hoje ' + icon("direita", 16) + "</a></div></div>";
      renderChrome();
    }
    show();
  }
  function shortDay(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  }

  /* ========== Nivelamento ========== */
  function viewNivelamento(mid) {
    const m = Ensaio.modulesById[mid];
    if (!m) return go("#/trilhas");
    const pool = [];
    m.licoes.forEach((l) => l.exercicios.forEach((ex) => { if (["multipla", "prever", "completar"].includes(ex.tipo)) pool.push(Ensaio.items[ex.id]); }));
    // embaralha e pega até N, tentando cobrir lições diferentes
    const shuffled = pool.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    const byLesson = {};
    const picked = [];
    shuffled.forEach((it) => { if (!byLesson[it.lesson.key] && picked.length < RULES.questoesNivelamento) { byLesson[it.lesson.key] = 1; picked.push(it); } });
    shuffled.forEach((it) => { if (!picked.includes(it) && picked.length < RULES.questoesNivelamento) picked.push(it); });

    main.innerHTML = '<div class="page page-lesson">' + crumbs([["Trilhas", "#/trilhas"], [m.titulo, "#/modulo/" + m.id], ["Nivelamento"]]) +
      '<header class="page-head"><p class="kicker">' + icon("alvo", 16) + " Teste de nivelamento</p><h1>" + esc(m.titulo) + '</h1><p class="lead">' + picked.length + " questões sorteadas das lições do módulo. Sem dicas e com uma tentativa por questão. Acertando " + Math.round(RULES.aprovacaoNivelamento * 100) + "% ou mais, as lições ficam marcadas como dominadas, o próximo módulo é liberado e você ganha " + RULES.xpNivelamento + ' XP.</p></header>' +
      '<div id="pl-slot"><button class="btn btn-primary" id="pl-start">Começar o teste</button></div></div>';
    let i = 0, score = 0;
    document.getElementById("pl-start").onclick = show;
    function show() {
      if (i >= picked.length) return end();
      Exercise.mount(document.getElementById("pl-slot"), picked[i], {
        mode: "nivelamento",
        label: "Questão " + (i + 1) + " de " + picked.length,
        nextLabel: i < picked.length - 1 ? "Próxima questão" : "Ver resultado",
        onAnswer: (ok) => { if (ok) score++; i++; show(); },
      });
      const h = document.querySelector("#pl-slot .ex");
      if (h) h.scrollIntoView({ block: "start", behavior: reduced() ? "auto" : "smooth" });
    }
    function end() {
      const passed = Store.placementResult(m, score, picked.length);
      const nx = Ensaio.proximo(m);
      document.getElementById("pl-slot").innerHTML = '<div class="done-card"><div class="done-stamp' + (passed ? "" : " stamp-muted") + '">' + score + " de " + picked.length + "</div>" +
        (passed ? "<p><strong>Aprovado.</strong> As lições de " + esc(m.titulo) + " estão marcadas como dominadas." + (nx ? " " + esc(nx.titulo) + " está liberado." : "") + "</p>" + (nx ? '<a class="btn btn-hl" href="#/modulo/' + nx.id + '">Ir para ' + esc(nx.titulo) + " " + icon("direita", 16) + "</a>" : "")
          : "<p>Faltou pouco: é preciso " + Math.ceil(RULES.aprovacaoNivelamento * picked.length) + " acertos. Estudar as lições deste módulo vai valer a pena.</p>" + '<a class="btn btn-hl" href="#/modulo/' + m.id + '">Ver lições ' + icon("direita", 16) + "</a>") + "</div>";
      renderChrome();
    }
  }

  /* ========== Progresso ========== */
  function viewProgresso() {
    const s = Store.state;
    const sum = Store.summary();
    const lv = levelFor(s.xp);
    const acc = Store.accuracy();
    const c = Ensaio.contagem();

    // atividade: últimas 16 semanas
    const weeks = 16;
    const t = Store.today();
    const [ty, tm, td] = t.split("-").map(Number);
    const dow = (new Date(ty, tm - 1, td).getDay() + 6) % 7; // segunda = 0
    const start = Store.addDays(t, -(weeks - 1) * 7 - dow);
    let heat = '<div class="heat" role="img" aria-label="Atividade das últimas ' + weeks + ' semanas">';
    for (let w = 0; w < weeks; w++) {
      heat += '<div class="heat-col">';
      for (let d = 0; d < 7; d++) {
        const day = Store.addDays(start, w * 7 + d);
        const xp = s.xpLog[day] || 0;
        const goal = s.settings.dailyGoal;
        const lvl = day > t ? "future" : xp === 0 ? 0 : xp < goal / 2 ? 1 : xp < goal ? 2 : xp < goal * 2 ? 3 : 4;
        heat += '<span class="hc lv' + lvl + '" title="' + day + ": " + xp + ' XP"></span>';
      }
      heat += "</div>";
    }
    heat += "</div>";

    const modRows = Ensaio.modules.map((m) => {
      const a = acc.byModule[m.id];
      const st = Store.moduleStatus(m);
      const rate = a && a.tries ? a.ok / a.tries : null;
      return '<li class="acc-row"><span class="acc-name">' + esc(m.trilhaObj.titulo) + " " + m.numero + ". " + esc(m.titulo) + '</span><span class="acc-bar">' + bar(rate || 0, "Taxa de acerto em " + m.titulo) + '</span><span class="acc-val">' + (rate == null ? "—" : Math.round(rate * 100) + "%") + '</span><span class="acc-sub">' + st.lessonsDone + "/" + st.lessonsTotal + " lições</span></li>";
    }).join("");

    const weak = Object.values(acc.byLesson).filter((x) => x.tries >= 3 && x.ok / x.tries < 0.65).sort((a, b) => a.ok / a.tries - b.ok / b.tries).slice(0, 6);
    const weakHtml = weak.length ? '<ul class="weak">' + weak.map((w) => '<li><a href="' + lessonHref(w.lesson) + '">' + esc(w.lesson.titulo) + '</a><span class="muted">' + Math.round((w.ok / w.tries) * 100) + "% de acerto em " + w.tries + " tentativas</span></li>").join("") + "</ul>"
      : '<p class="muted">Nenhum tema abaixo de 65% de acerto (mínimo de 3 tentativas). Continue assim.</p>';

    const ach = ACHIEVEMENTS.map((a) => {
      const got = s.achievements[a.id];
      return '<li class="ach' + (got ? " got" : "") + '">' + icon(got ? "medalha" : "lock", 22) + '<span><strong>' + esc(a.nome) + "</strong><small>" + esc(a.desc) + (got ? " · " + got.split("-").reverse().join("/") : "") + "</small></span></li>";
    }).join("");

    const up = Store.upcoming(8);
    main.innerHTML = '<div class="page page-wide"><header class="page-head"><p class="kicker">Painel</p><h1>Progresso</h1></header>' +
      '<div class="metrics">' +
      metric("XP total", s.xp) + metric("Nível", lv.n + " · " + lv.nome) + metric("Sequência", sum.streak + " dia(s)", "melhor: " + sum.bestStreak) +
      metric("Exercícios", sum.solved + " / " + (c.exercicios + c.desafios), sum.firstTry + " de primeira") + metric("Módulos concluídos", sum.modulesDone + " / " + c.modulos) + metric("Revisões feitas", sum.reviews, (up[0] || 0) + " pendentes hoje") +
      "</div>" +
      '<section class="card"><p class="card-kicker">Nível ' + lv.n + " · " + esc(lv.nome) + "</p>" + bar(lv.pct, "Progresso no nível", "bar-lg") + '<p class="muted">' + (lv.next ? lv.faltam + " XP para " + esc(lv.next.nome) + " (nível " + lv.next.n + ")" : "Nível máximo alcançado") + '</p><ol class="levels">' +
      LEVELS.map((L) => '<li class="' + (L.n < lv.n ? "past" : L.n === lv.n ? "cur" : "") + '"><span>' + L.n + "</span>" + esc(L.nome) + '<small>' + L.xp + " XP</small></li>").join("") + "</ol></section>" +
      '<div class="grid-2">' +
      '<section class="card"><p class="card-kicker">Atividade</p>' + heat + '<p class="muted small heat-legend">Cada quadrado é um dia. Mais escuro: mais XP em relação à meta diária.</p></section>' +
      '<section class="card"><p class="card-kicker">Temas que precisam de reforço</p>' + weakHtml + "</section>" +
      "</div>" +
      '<section class="card"><p class="card-kicker">Taxa de acerto por tema</p><ul class="acc">' + modRows + "</ul></section>" +
      '<section class="card"><p class="card-kicker">Conquistas · ' + Object.keys(s.achievements).length + " de " + ACHIEVEMENTS.length + '</p><ul class="achs">' + ach + "</ul></section>" +
      "</div>";
  }
  function metric(label, val, sub) {
    return '<div class="metric"><span class="m-label">' + esc(label) + '</span><span class="m-val">' + esc(val) + "</span>" + (sub ? '<span class="m-sub">' + esc(sub) + "</span>" : "") + "</div>";
  }

  /* ========== Ajustes ========== */
  function viewAjustes() {
    const s = Store.state;
    const c = Ensaio.contagem();
    const themes = [["auto", "Automático (segue o sistema)"], ["claro", "Claro"], ["escuro", "Escuro"]];
    main.innerHTML = '<div class="page"><header class="page-head"><p class="kicker">Configurações</p><h1>Ajustes</h1></header>' +
      (!Store.saveOk ? '<div class="card notice">' + icon("x", 20) + "<p>O navegador não está permitindo salvar o progresso (modo privado ou armazenamento bloqueado). Exporte o progresso em arquivo antes de fechar.</p></div>" : "") +
      '<section class="card"><h2 class="card-h">Aparência</h2><fieldset class="radios"><legend class="sr-only">Tema</legend>' +
      themes.map(([v, l]) => '<label class="radio"><input type="radio" name="theme" value="' + v + '"' + (s.settings.theme === v ? " checked" : "") + "> " + l + "</label>").join("") + "</fieldset></section>" +
      '<section class="card"><h2 class="card-h">Meta diária</h2><p class="muted">A sequência conta os dias em que você bate a meta.</p><label class="field-label" for="goal">XP por dia</label><select id="goal">' +
      RULES.metasDiarias.map((g) => "<option value=\"" + g + '"' + (s.settings.dailyGoal === g ? " selected" : "") + ">" + g + " XP" + (g === 20 ? " (leve)" : g === 50 ? " (regular)" : g === 100 ? " (puxado)" : " (intenso)") + "</option>").join("") + "</select></section>" +
      '<section class="card"><h2 class="card-h">Seu progresso</h2><p class="muted">O progresso fica salvo neste navegador. Exporte um arquivo de vez em quando (ou para levar ao celular) e importe-o em outro navegador.</p>' +
      '<div class="ex-actions"><button class="btn btn-primary" id="exp">' + icon("download", 16) + ' Exportar progresso</button><label class="btn" for="imp" tabindex="0" id="imp-l">' + icon("upload", 16) + ' Importar arquivo</label><input type="file" id="imp" accept="application/json,.json" class="sr-only"></div><p id="imp-msg" class="small" aria-live="polite"></p>' +
      '<details class="danger-zone"><summary>Apagar todo o progresso</summary><p>Isso apaga XP, níveis, conquistas, revisões e rascunhos deste navegador. Não dá para desfazer, a não ser que você tenha um arquivo exportado.</p><button class="btn btn-danger" id="reset">' + icon("lixeira", 16) + " Apagar progresso</button></details></section>" +
      '<section class="card"><h2 class="card-h">Sobre</h2><p class="muted">' + c.modulos + " módulos, " + c.licoes + " lições, " + c.exercicios + " exercícios e " + c.desafios + ' desafios. O Python roda no próprio navegador com o Pyodide; na primeira vez ele é baixado da internet e depois fica guardado.</p><p class="muted small" id="py-status"></p></section>' +
      "</div>";
    document.querySelectorAll('input[name="theme"]').forEach((r) => (r.onchange = () => Store.setSetting("theme", r.value)));
    document.getElementById("goal").onchange = (e) => Store.setSetting("dailyGoal", Number(e.target.value));
    document.getElementById("exp").onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "ensaio-progresso-" + Store.today() + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
    const impL = document.getElementById("imp-l");
    impL.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.getElementById("imp").click(); } };
    document.getElementById("imp").onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const msg = document.getElementById("imp-msg");
      f.text().then((txt) => {
        if (!confirm("Importar este arquivo vai substituir o progresso atual deste navegador. Continuar?")) return;
        try {
          Store.importJSON(txt);
          msg.textContent = "Progresso importado.";
          msg.className = "small fb-ok";
          renderChrome();
        } catch (err) {
          msg.textContent = err.message;
          msg.className = "small fb-err";
        }
      });
      e.target.value = "";
    };
    document.getElementById("reset").onclick = () => {
      if (confirm("Apagar todo o progresso deste navegador? Isso não pode ser desfeito.")) {
        Store.reset();
        applyTheme();
        go("#/hoje");
      }
    };
    document.getElementById("py-status").textContent = Runner.ready ? "Python carregado e pronto." : "O Python será carregado quando você abrir uma lição.";
  }

  /* ---------- Início ---------- */
  if (Ensaio.erros.length) console.error("Erros no conteúdo:", Ensaio.erros);
  Store.checkAchievements();
  route();

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
