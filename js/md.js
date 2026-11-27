/*
 * Markdown mínimo para textos das lições.
 * Aceita uma string ou uma lista de blocos. Cada bloco pode ser:
 *   - "texto" (parágrafo), "- item" (lista), "1. item" (lista numerada), "> nota" (destaque)
 *   - { codigo: r`...` } bloco de código estático com destaque de sintaxe
 * Inline: `código`, **negrito**, *itálico*.
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inline(s) {
    const parts = String(s).split("`");
    return parts
      .map((p, i) => {
        if (i % 2 === 1) return "<code>" + esc(p) + "</code>";
        return esc(p)
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>");
      })
      .join("");
  }

  function highlight(code) {
    const pre = document.createElement("pre");
    pre.className = "code-static cm-s-ensaio";
    const text = String(code).replace(/^\n/, "").replace(/\s+$/, "");
    if (window.CodeMirror && CodeMirror.runMode) {
      CodeMirror.runMode(text, "python", pre);
    } else {
      pre.textContent = text;
    }
    return pre.outerHTML;
  }

  function render(input) {
    if (input == null) return "";
    const blocks = Array.isArray(input) ? input : String(input).split(/\n\s*\n/);
    let html = "";
    let list = null; // "ul" | "ol"
    const close = () => {
      if (list) html += "</" + list + ">";
      list = null;
    };
    blocks.forEach((b) => {
      if (b && typeof b === "object" && b.codigo != null) {
        close();
        html += highlight(b.codigo);
        return;
      }
      const t = String(b).trim();
      if (!t) return;
      let m;
      if ((m = t.match(/^-\s+([\s\S]*)$/))) {
        if (list !== "ul") { close(); html += "<ul>"; list = "ul"; }
        html += "<li>" + inline(m[1]) + "</li>";
      } else if ((m = t.match(/^\d+\.\s+([\s\S]*)$/))) {
        if (list !== "ol") { close(); html += "<ol>"; list = "ol"; }
        html += "<li>" + inline(m[1]) + "</li>";
      } else if ((m = t.match(/^>\s*([\s\S]*)$/))) {
        close();
        html += '<p class="note">' + inline(m[1]) + "</p>";
      } else {
        close();
        html += "<p>" + inline(t) + "</p>";
      }
    });
    close();
    return html;
  }

  window.MD = { render, inline, esc, highlight };
})();
