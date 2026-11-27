/* Editor de código: CodeMirror 5 quando disponível, com textarea de reserva. */
(function () {
  "use strict";

  function create(container, opts) {
    opts = opts || {};
    const value = (opts.value || "").replace(/^\n/, "").replace(/\s+$/, "") + "\n";
    let get, set, focus, refresh;

    const keys = (cm, e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) opts.onCheck && opts.onCheck();
        else opts.onRun && opts.onRun();
      }
    };

    if (window.CodeMirror) {
      const cm = CodeMirror(container, {
        value,
        mode: opts.linguagem === "sql" ? "text/x-sqlite" : "python",
        indentUnit: opts.linguagem === "sql" ? 2 : 4,
        theme: "ensaio",
        lineNumbers: true,

        tabSize: 4,
        indentWithTabs: false,
        matchBrackets: true,
        viewportMargin: Infinity,
        readOnly: !!opts.readOnly,
        screenReaderLabel: opts.label || "Editor de código",
        extraKeys: {
          Tab: (c) => {
            if (c.somethingSelected()) c.indentSelection("add");
            else c.replaceSelection("    ", "end");
          },
          "Shift-Tab": (c) => c.indentSelection("subtract"),
          Esc: (c) => c.getInputField().blur(), // não prender o foco do teclado
        },
      });
      cm.on("keydown", keys);
      if (opts.onChange) cm.on("change", () => opts.onChange(cm.getValue()));
      get = () => cm.getValue();
      set = (v) => cm.setValue((v || "").replace(/^\n/, "").replace(/\s+$/, "") + "\n");
      focus = () => cm.focus();
      refresh = () => cm.refresh();
      setTimeout(refresh, 0);
    } else {
      const ta = document.createElement("textarea");
      ta.className = "code-fallback";
      ta.spellcheck = false;
      ta.value = value;
      ta.setAttribute("aria-label", opts.label || "Editor de código");
      ta.rows = Math.max(4, value.split("\n").length + 1);
      ta.readOnly = !!opts.readOnly;
      ta.addEventListener("keydown", (e) => {
        keys(null, e);
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          const s = ta.selectionStart;
          ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(ta.selectionEnd);
          ta.selectionStart = ta.selectionEnd = s + 4;
        }
      });
      if (opts.onChange) ta.addEventListener("input", () => opts.onChange(ta.value));
      container.appendChild(ta);
      get = () => ta.value;
      set = (v) => (ta.value = v);
      focus = () => ta.focus();
      refresh = () => {};
    }
    return { get, set, focus, refresh };
  }

  window.Editor = { create };
})();
