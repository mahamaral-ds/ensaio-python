/* Componente de exercício: renderiza qualquer tipo e cuida de tentativas, dicas, solução e XP. */
(function () {
  "use strict";
  const esc = (s) => MD.esc(s);

  const TIPO_NOME = {
    multipla: "múltipla escolha",
    prever: "prever a saída",
    completar: "completar o código",
    corrigir: "corrigir o código",
    escrever: "escrever do zero",
  };

  function dots(n) {
    let s = "";
    for (let i = 1; i <= 3; i++) s += '<span class="dot' + (i <= n ? " on" : "") + '"></span>';
    return '<span class="diff" aria-label="Dificuldade ' + n + ' de 3">' + s + "</span>";
  }

  /* ---------- Saída de execução ---------- */

  function fmtCelula(v) {
    if (v === null || v === undefined) return '<span class="null">NULL</span>';
    if (typeof v === "number") return String(Math.round(v * 100) / 100);
    return esc(v);
  }

  function renderTable(t) {
    let h = '<div class="out-block"><div class="out-label">' + icon("terminal", 16) + " Resultado: " + t.total + " linha" + (t.total === 1 ? "" : "s") +
      (t.total > t.rows.length ? " (mostrando " + t.rows.length + ")" : "") + '</div><div class="sql-wrap"><table class="sql-table"><thead><tr>' +
      t.cols.map((c) => "<th scope=\"col\">" + esc(c) + "</th>").join("") + "</tr></thead><tbody>";
    if (!t.rows.length) h += '<tr><td colspan="' + t.cols.length + '" class="null">(nenhuma linha)</td></tr>';
    t.rows.forEach((r) => {
      h += "<tr>" + r.map((v) => '<td class="' + (typeof v === "number" ? "num" : "") + '">' + fmtCelula(v) + "</td>").join("") + "</tr>";
    });
    return h + "</tbody></table></div></div>";
  }

  function bancoPanel(amb) {
    if (!amb || !amb.banco) return "";
    const b = amb.banco;
    return '<details class="files banco"><summary>' + icon("arquivo", 16) + " " + esc(b.titulo || "Banco de dados") + ": " +
      (b.tabelas || []).map(esc).join(", ") + "</summary>" + MD.highlight(b.esquema, "sql") + "</details>";
  }

  function renderOutput(el, res, opts) {
    opts = opts || {};
    let h = "";
    if (res.table) {
      h += renderTable(res.table);
    } else if (res.out) {
      h += '<div class="out-block"><div class="out-label">' + icon("terminal", 16) + " Saída</div><pre class=\"out\">" + esc(res.out) + "</pre></div>";
    } else if (!res.error && !(res.figs || []).length && !opts.quietEmpty) {
      h += '<div class="out-block"><div class="out-label">' + icon("terminal", 16) + ' Saída</div><pre class="out out-empty">(nenhuma saída; use print() para ver valores)</pre></div>';
    }
    (res.figs || []).forEach((b64, i) => {
      h += '<figure class="out-fig"><img alt="Gráfico ' + (i + 1) + ' gerado pelo código" src="data:image/png;base64,' + b64 + '"></figure>';
    });
    if (res.error) {
      const e = res.error;
      h += '<div class="out-error" role="alert"><div class="err-title">' + icon("x", 16) + " " + esc(e.type) +
        (e.line ? ' <span class="err-line">linha ' + e.line + "</span>" : "") + "</div>" +
        (e.message ? '<div class="err-msg">' + esc(e.message) + "</div>" : "") +
        (e.tip ? '<p class="err-tip">' + esc(e.tip) + "</p>" : "") + "</div>";
    }
    if (opts.showTests && res.tests && res.tests.length) {
      const ok = res.tests.filter((t) => t.ok).length;
      h += '<div class="tests"><div class="out-label">Testes: ' + ok + " de " + res.tests.length + " passaram</div><ul>";
      res.tests.forEach((t) => {
        h += '<li class="' + (t.ok ? "t-ok" : "t-fail") + '">' + icon(t.ok ? "check" : "x", 16) +
          "<span>" + MD.inline(t.msg) + (t.ok || !t.detail ? "" : '<span class="t-detail">' + esc(t.detail) + "</span>") + "</span></li>";
      });
      h += "</ul></div>";
    }
    el.innerHTML = h;
  }

  function normalizeAnswer(s, modo) {
    if (modo === "sql") s = String(s).toLowerCase();
    return String(s).trim().replace(/\s+/g, " ").replace(/"/g, "'").replace(/\s*([(),:=\[\]])\s*/g, "$1");
  }
  function normalizeOutput(s) {
    return String(s).replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").trim();
  }

  /* ---------- Montagem ---------- */

  function mount(root, item, opts) {
    opts = opts || {};
    const ex = item.ex;
    const mode = opts.mode || "licao";
    const persistent = mode === "licao" || mode === "desafio";
    const es = Store.exState(item.id);
    const wasSolved = es.solved;
    const local = { tries: 0, hints: persistent ? es.hints : 0, solutionSeen: false, lapsed: false, done: false };
    const uid = "ex" + Math.random().toString(36).slice(2, 8);
    const files = Ensaio.arquivosDe(item);
    const amb = Ensaio.ambienteDe(item);
    const modo = amb.linguagem;
    const banco = amb.banco ? amb.banco.script : "";
    const hints = ex.dicas || [];
    const allowHelp = mode !== "nivelamento";
    let editor = null;

    const label = opts.label || (item.isChallenge ? "Desafio" : "Exercício " + item.number);
    const maxXp = Store.maxXP(item);
    const xpNote = mode === "nivelamento" ? "" :
      mode === "revisao" ? "revisão" :
      wasSolved ? "resolvido" : "até " + maxXp + " XP";

    let body = "";
    if (item.isChallenge && ex.titulo) body += '<h3 class="ex-title">' + esc(ex.titulo) + "</h3>";
    body += '<div class="ex-prompt prose">' + MD.render(ex.enunciado, modo) + "</div>";
    if (amb.banco) body += bancoPanel(amb);

    if (ex.tipo === "multipla" || (ex.tipo === "prever" && ex.opcoes)) {
      if (ex.codigo) body += MD.highlight(ex.codigo, modo);
      body += '<fieldset class="opts"><legend class="sr-only">Alternativas</legend>';
      ex.opcoes.forEach((o, i) => {
        const txt = ex.tipo === "prever" ? '<pre class="opt-pre">' + esc(o) + "</pre>" : '<span class="opt-text">' + MD.inline(o) + "</span>";
        body += '<label class="opt"><input type="radio" name="' + uid + '" value="' + i + '"><span class="opt-key" aria-hidden="true">' +
          String.fromCharCode(65 + i) + "</span>" + txt + "</label>";
      });
      body += "</fieldset>";
    } else if (ex.tipo === "prever") {
      body += MD.highlight(ex.codigo, modo);
      body += '<label class="field-label" for="' + uid + '-saida">Saída que você espera</label><textarea class="predict-input mono" id="' + uid + '-saida" rows="3" spellcheck="false"></textarea>';
    } else if (ex.tipo === "completar") {
      const parts = String(ex.codigo).replace(/^\n/, "").replace(/\s+$/, "").split("___");
      let pre = "";
      parts.forEach((p, i) => {
        pre += esc(p);
        if (i < parts.length - 1) {
          const ans = (ex.respostas && ex.respostas[i] && ex.respostas[i][0]) || "";
          const size = Math.max(4, ans.length + 2);
          pre += '<input class="blank" data-i="' + i + '" size="' + size + '" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Lacuna ' + (i + 1) + '">';
        }
      });
      body += '<pre class="fill code-static">' + pre + "</pre>";
    } else {
      const names = Object.keys(files);
      if (names.length) {
        body += '<details class="files"><summary>' + icon("arquivo", 16) + " Arquivos disponíveis: " + names.map(esc).join(", ") + "</summary>";
        names.forEach((n) => {
          body += '<div class="file"><div class="file-name">' + esc(n) + '</div><pre class="file-body">' + esc(String(files[n]).slice(0, 3000)) + "</pre></div>";
        });
        body += "</details>";
      }
      if (ex.entrada && ex.entrada.length) {
        body += '<p class="stdin-note">' + icon("terminal", 16) + " Entradas simuladas para <code>input()</code>: " + ex.entrada.map((v) => "<code>" + esc(v) + "</code>").join(", ") + "</p>";
      }
      body += '<div class="editor-wrap" id="' + uid + '-ed"></div>';
    }

    const isCode = ex.tipo === "corrigir" || ex.tipo === "escrever";
    root.innerHTML =
      '<article class="ex card' + (item.isChallenge ? " ex-challenge" : "") + '" aria-labelledby="' + uid + '-h">' +
      '<header class="ex-head"><span class="ex-tag" id="' + uid + '-h">' + esc(label) + " · " + TIPO_NOME[ex.tipo] + "</span>" +
      dots(ex.nivel || 1) + (xpNote ? '<span class="ex-xp">' + xpNote + "</span>" : "") + "</header>" +
      '<div class="ex-body">' + body + "</div>" +
      '<div class="ex-run" id="' + uid + '-run" aria-live="polite"></div>' +
      '<div class="ex-feedback" id="' + uid + '-fb" aria-live="polite"></div>' +
      '<div class="ex-hints" id="' + uid + '-hints"></div>' +
      '<div class="ex-solution" id="' + uid + '-sol"></div>' +
      '<div class="ex-actions">' +
      (isCode ? '<button class="btn" data-act="run" title="Ctrl+Enter">' + icon("play", 16) + " Executar</button>" : "") +
      '<button class="btn btn-primary" data-act="check"' + (isCode ? ' title="Ctrl+Shift+Enter"' : "") + ">" + icon("check", 16) + " Verificar</button>" +
      (allowHelp && hints.length ? '<button class="btn btn-ghost" data-act="hint"></button>' : "") +
      (allowHelp ? '<button class="btn btn-ghost" data-act="solution" hidden>' + icon("livro", 16) + " Ver solução</button>" : "") +
      (isCode ? '<button class="btn btn-ghost" data-act="reset" title="Voltar ao código inicial">' + icon("desfazer", 16) + " Restaurar</button>" : "") +
      '<button class="btn btn-hl" data-act="next" hidden>' + esc(opts.nextLabel || "Próximo") + " " + icon("direita", 16) + "</button>" +
      "</div>" +
      (isCode ? '<p class="kbd-hint">Ctrl+Enter executa · Ctrl+Shift+Enter verifica</p>' : "") +
      "</article>";

    const $ = (sel) => root.querySelector(sel);
    const runEl = $("#" + uid + "-run");
    const fbEl = $("#" + uid + "-fb");
    const hintsEl = $("#" + uid + "-hints");
    const solEl = $("#" + uid + "-sol");
    const btnCheck = $('[data-act="check"]');
    const btnHint = $('[data-act="hint"]');
    const btnSol = $('[data-act="solution"]');
    const btnNext = $('[data-act="next"]');
    const btnRun = $('[data-act="run"]');

    if (isCode) {
      const start = ex.inicial != null ? ex.inicial : "";
      const draft = persistent ? Store.getDraft(item.id) : null;
      let t = null;
      editor = Editor.create($("#" + uid + "-ed"), {
        linguagem: modo,
        value: draft != null ? draft : start,
        label: "Editor do " + label.toLowerCase(),
        onRun: () => runCode(false),
        onCheck: () => check(),
        onChange: persistent ? (v) => { clearTimeout(t); t = setTimeout(() => Store.setDraft(item.id, v), 400); } : null,
      });
      Runner.warmup();
    }

    /* ----- dicas ----- */
    function renderHints() {
      if (!hintsEl) return;
      let h = "";
      for (let i = 0; i < local.hints && i < hints.length; i++) {
        h += '<div class="hint"><span class="hint-n">Dica ' + (i + 1) + "</span>" + MD.render(hints[i], modo) + "</div>";
      }
      hintsEl.innerHTML = h;
      if (btnHint) {
        if (local.hints >= hints.length) btnHint.hidden = true;
        else {
          const free = (persistent && wasSolved) || local.done;
          const cost = mode === "revisao" ? "−2 XP" : "−" + Math.round(RULES.perdaPorDica * 100) + "% XP";
          btnHint.innerHTML = icon("dica", 16) + " Dica " + (local.hints + 1) + " de " + hints.length + (free ? "" : ' <span class="cost">' + cost + "</span>");
        }
      }
    }
    renderHints();

    function updateSolutionButton() {
      if (!btnSol) return;
      const can = local.done || (persistent && wasSolved) || local.tries >= RULES.tentativasParaSolucao;
      btnSol.hidden = !can || local.solutionShown;
    }
    updateSolutionButton();

    function showSolution() {
      local.solutionShown = true;
      if (!local.done && !wasSolved) {
        local.solutionSeen = true;
        if (persistent) Store.seeSolution(item);
      }
      let h = '<div class="solution"><div class="sol-label">' + icon("livro", 16) + " Solução comentada</div>";
      if (ex.tipo === "multipla" || (ex.tipo === "prever" && ex.opcoes)) {
        h += "<p>Resposta: <strong>" + String.fromCharCode(65 + ex.resposta) + "</strong>" + (ex.tipo === "multipla" ? ". " + MD.inline(ex.opcoes[ex.resposta]) : "") + "</p>";
      } else if (ex.tipo === "prever") {
        h += '<pre class="out">' + esc(ex.saida) + "</pre>";
      } else if (ex.tipo === "completar") {
        const parts = String(ex.codigo).replace(/^\n/, "").replace(/\s+$/, "").split("___");
        let full = "";
        parts.forEach((p, i) => { full += p + (i < parts.length - 1 ? ex.respostas[i][0] : ""); });
        h += MD.highlight(full, modo);
      }
      if (ex.solucao) h += MD.highlight(ex.solucao, modo);
      if (ex.comentario) h += '<div class="prose">' + MD.render(ex.comentario, modo) + "</div>";
      h += "</div>";
      solEl.innerHTML = h;
      updateSolutionButton();
    }

    /* ----- verificação ----- */
    function feedback(kind, html) {
      fbEl.className = "ex-feedback fb-" + kind;
      fbEl.innerHTML = html;
    }

    async function runCode(withTests) {
      const code = editor.get();
      busy(true);
      runEl.innerHTML = '<p class="running">' + icon("relogio", 16) + ' <span class="run-status">Executando…</span></p>';
      const res = await Runner.run({
        code,
        tests: withTests ? ex.testes : [],
        stdin: ex.entrada || [],
        files,
        linguagem: modo,
        banco,
        onStatus: (s) => { const st = runEl.querySelector(".run-status"); if (st) st.textContent = s; },
      });
      busy(false);
      renderOutput(runEl, res, { showTests: withTests });
      return res;
    }

    function busy(b) {
      [btnCheck, btnRun].forEach((x) => { if (x) x.disabled = b; });
      root.querySelector(".ex").classList.toggle("is-busy", b);
    }

    async function evaluate() {
      if (ex.tipo === "multipla" || (ex.tipo === "prever" && ex.opcoes)) {
        const sel = root.querySelector('input[name="' + uid + '"]:checked');
        if (!sel) return { invalid: "Escolha uma alternativa antes de verificar." };
        const ok = Number(sel.value) === ex.resposta;
        if (!ok && mode !== "nivelamento") {
          const lab = sel.closest(".opt");
          lab.classList.add("opt-wrong");
          sel.disabled = true;
          sel.checked = false;
        }
        if (ok) sel.closest(".opt").classList.add("opt-right");
        return { ok };
      }
      if (ex.tipo === "prever") {
        const v = root.querySelector(".predict-input").value;
        if (!v.trim()) return { invalid: "Escreva a saída que você espera antes de verificar." };
        return { ok: normalizeOutput(v) === normalizeOutput(ex.saida) };
      }
      if (ex.tipo === "completar") {
        const inputs = Array.from(root.querySelectorAll(".blank"));
        const vals = inputs.map((i) => i.value);
        if (vals.some((v) => !v.trim())) return { invalid: "Preencha todas as lacunas antes de verificar." };
        let ok = inputs.every((inp, i) => (ex.respostas[i] || []).some((a) => normalizeAnswer(a, modo) === normalizeAnswer(inp.value, modo)));
        if (!ok && ex.testes && ex.testes.length) {
          const parts = String(ex.codigo).replace(/^\n/, "").replace(/\s+$/, "").split("___");
          let code = "";
          parts.forEach((p, i) => { code += p + (i < parts.length - 1 ? vals[i] : ""); });
          busy(true);
          runEl.innerHTML = '<p class="running">' + icon("relogio", 16) + ' <span class="run-status">Testando sua resposta…</span></p>';
          const res = await Runner.run({ code, tests: ex.testes, stdin: ex.entrada || [], files, linguagem: modo, banco, onStatus: (s) => { const st = runEl.querySelector(".run-status"); if (st) st.textContent = s; } });
          busy(false);
          renderOutput(runEl, res, { showTests: true, quietEmpty: true });
          ok = !res.error && res.tests.length > 0 && res.tests.every((t) => t.ok);
        }
        inputs.forEach((inp, i) => {
          const right = (ex.respostas[i] || []).some((a) => normalizeAnswer(a, modo) === normalizeAnswer(inp.value, modo));
          inp.classList.toggle("blank-right", right || ok);
          inp.classList.toggle("blank-wrong", !right && !ok);
        });
        return { ok };
      }
      // corrigir / escrever
      const res = await runCode(true);
      if (!ex.testes || !ex.testes.length) return { ok: !res.error };
      return { ok: !res.error && res.tests.every((t) => t.ok), res };
    }

    async function check() {
      if (local.done && mode !== "licao" && mode !== "desafio") return;
      const r = await evaluate();
      if (r.invalid) {
        feedback("warn", "<p>" + esc(r.invalid) + "</p>");
        return;
      }
      local.tries++;

      if (mode === "nivelamento") {
        local.done = true;
        btnCheck.hidden = true;
        root.querySelectorAll("input, textarea").forEach((i) => (i.disabled = true));
        feedback(r.ok ? "ok" : "err", r.ok ? "<p><strong>Certo.</strong></p>" : "<p><strong>Não foi dessa vez.</strong> A resposta esperada aparece abaixo.</p>");
        if (!r.ok) showSolution();
        else if (ex.comentario) solEl.innerHTML = '<div class="prose">' + MD.render(ex.comentario, modo) + "</div>";
        btnNext.hidden = false;
        btnNext.onclick = () => opts.onAnswer && opts.onAnswer(r.ok);
        btnNext.focus();
        return;
      }

      if (mode === "revisao") {
        if (!r.ok) {
          if (!local.lapsed) Store.reviewResult(item, false);
          local.lapsed = true;
          feedback("err", "<p><strong>Ainda não.</strong> " + (local.tries >= RULES.tentativasParaSolucao ? "Se quiser, veja a solução. " : "Tente de novo. ") + "Este exercício volta para revisão amanhã.</p>");
          updateSolutionButton();
          return;
        }
        local.done = true;
        const xp = Store.reviewResult(item, true, { lapsed: local.lapsed, hints: local.hints, firstTry: local.tries === 1, solutionSeen: local.solutionSeen });
        const es2 = Store.exState(item.id);
        feedback("ok", "<p><strong>Certo.</strong> Próxima revisão em " + Store.diffDays(Store.today(), es2.due) + " dia(s). <span class=\"xp-inline\">+" + xp + " XP</span></p>");
        finish();
        return;
      }

      // lição ou desafio
      const xp = Store.attempt(item, r.ok);
      if (!r.ok) {
        const left = RULES.tentativasParaSolucao - local.tries;
        feedback("err", "<p><strong>Ainda não.</strong> " +
          (ex.tipo === "corrigir" || ex.tipo === "escrever" ? "Veja quais testes falharam acima. " : "") +
          (hints.length && local.hints < hints.length ? "Uma dica pode ajudar. " : "") +
          (left > 0 && !wasSolved ? "A solução fica disponível depois de mais " + left + " tentativa(s)." : "") + "</p>");
        updateSolutionButton();
        return;
      }
      const firstSolve = !local.done && !wasSolved;
      local.done = true;
      let msg = "<p><strong>Certo.</strong>";
      if (firstSolve && xp) {
        msg += ' <span class="xp-inline">+' + xp + " XP</span>";
        const es3 = Store.exState(item.id);
        if (es3.firstTry) msg += " De primeira.";
      } else if (!firstSolve) {
        msg += " (exercício já resolvido antes; refazer não dá XP)";
      }
      msg += "</p>";
      if (ex.comentario && !(ex.solucao)) msg += '<div class="prose">' + MD.render(ex.comentario, modo) + "</div>";
      feedback("ok", msg);
      if (persistent) Store.setDraft(item.id, null);
      if (ex.solucao) updateSolutionButton();
      finish();
      if (firstSolve && opts.onSolved) opts.onSolved({ xp });
    }

    function finish() {
      updateSolutionButton();
      btnCheck.hidden = true;
      if (btnHint) btnHint.hidden = true;
      if (opts.onNext) {
        btnNext.hidden = false;
        btnNext.onclick = opts.onNext;
        setTimeout(() => btnNext.focus({ preventScroll: true }), 50);
      }
    }

    btnCheck.addEventListener("click", check);
    if (btnRun) btnRun.addEventListener("click", () => runCode(false));
    if (btnHint) btnHint.addEventListener("click", () => {
      local.hints++;
      if (persistent && !wasSolved && !local.done) Store.useHint(item);
      renderHints();
      const last = hintsEl.lastElementChild;
      if (last) last.classList.add("appear");
    });
    if (btnSol) btnSol.addEventListener("click", showSolution);
    const btnReset = $('[data-act="reset"]');
    if (btnReset) btnReset.addEventListener("click", () => {
      editor.set(ex.inicial || "");
      if (persistent) Store.setDraft(item.id, null);
    });
    root.querySelectorAll(".opt input").forEach((inp) => inp.addEventListener("change", () => { fbEl.innerHTML = ""; fbEl.className = "ex-feedback"; }));
    root.querySelectorAll(".blank").forEach((inp) => inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } }));

    if (persistent && wasSolved) {
      feedback("ok", "<p>Você já resolveu este exercício. Pode refazer para fixar (sem XP).</p>");
      if (opts.onNext) { btnNext.hidden = false; btnNext.onclick = opts.onNext; }
    }

    return { refresh: () => editor && editor.refresh() };
  }

  window.Exercise = { mount, renderOutput, bancoPanel, TIPO_NOME };
})();
