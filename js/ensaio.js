/*
 * Registro de conteúdo do Level Code.
 *
 * Cada arquivo em content/ chama Ensaio.modulo((r) => ({ ...definição... })).
 * O parâmetro `r` é String.raw: use r`...` para blocos de código Python, assim
 * barras invertidas (\n, \t) chegam ao Python exatamente como foram escritas.
 * Veja o README para o formato completo.
 */
(function () {
  "use strict";

  const TIPOS = ["multipla", "prever", "completar", "corrigir", "escrever"];

  const Ensaio = {
    modules: [],
    erros: [],

    modulo(def) {
      try {
        const m = typeof def === "function" ? def(String.raw) : def;
        this.modules.push(m);
      } catch (e) {
        this.erros.push(String(e));
        console.error("Erro ao registrar módulo:", e);
      }
    },

    /* Monta índices depois que todos os arquivos de conteúdo carregaram. */
    preparar() {
      this.modules.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      this.items = {};
      this.lessonsByKey = {};
      this.modulesById = {};
      this.modules.forEach((m, mi) => {
        m.index = mi;
        m.licoes = m.licoes || [];
        m.desafios = m.desafios || [];
        m.arquivos = m.arquivos || {};
        this.modulesById[m.id] = m;
        m.licoes.forEach((l, li) => {
          l.index = li;
          l.key = m.id + "/" + l.id;
          l.module = m;
          this.lessonsByKey[l.key] = l;
          l.exercicios = l.exercicios || [];
          l.exercicios.forEach((ex, ei) => {
            const id = l.key + "/" + (ei + 1);
            ex.id = id;
            if (!TIPOS.includes(ex.tipo)) console.warn("Tipo de exercício desconhecido:", id, ex.tipo);
            this.items[id] = { id, ex, module: m, lesson: l, number: ei + 1, isChallenge: false };
          });
        });
        m.desafios.forEach((d, di) => {
          const id = m.id + "/desafio/" + d.id;
          d.id_completo = id;
          d.tipo = d.tipo || "escrever";
          d.nivel = d.nivel || 3;
          d.index = di;
          this.items[id] = { id, ex: d, module: m, lesson: null, number: di + 1, isChallenge: true };
        });
      });
      return this;
    },

    /* Arquivos disponíveis para um exercício: os do módulo + os do próprio exercício. */
    arquivosDe(item) {
      return Object.assign({}, item.module.arquivos || {}, item.ex.arquivos || {});
    },

    contagem() {
      let licoes = 0, exercicios = 0, desafios = 0;
      this.modules.forEach((m) => {
        licoes += m.licoes.length;
        desafios += m.desafios.length;
        m.licoes.forEach((l) => (exercicios += l.exercicios.length));
      });
      return { modulos: this.modules.length, licoes, exercicios, desafios };
    },
  };

  window.Ensaio = Ensaio;
})();
