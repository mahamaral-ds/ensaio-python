/*
 * Registro de conteúdo do Level Code.
 *
 * content/trilhas.js declara as trilhas (Python, SQL...) com Ensaio.trilha({...}).
 * Cada arquivo de módulo chama Ensaio.modulo((r) => ({ trilha: "python", ... })).
 * O parâmetro `r` é String.raw: use r`...` para blocos de código, assim
 * barras invertidas (\n, \t) chegam ao interpretador exatamente como foram escritas.
 * Bancos de dados para trilhas de SQL são registrados com Ensaio.banco(id, { esquema, script }).
 * Veja o README para o formato completo.
 */
(function () {
  "use strict";

  const TIPOS = ["multipla", "prever", "completar", "corrigir", "escrever"];

  const Ensaio = {
    modules: [],
    trilhas: [],
    bancos: {},
    erros: [],

    trilha(def) {
      this.trilhas.push(Object.assign({ linguagem: "python" }, def));
    },

    banco(id, def) {
      try {
        this.bancos[id] = typeof def === "function" ? def(String.raw) : def;
      } catch (e) {
        this.erros.push(String(e));
        console.error("Erro ao registrar banco:", e);
      }
    },

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
      if (!this.trilhas.length) this.trilha({ id: "python", titulo: "Python", ordem: 1 });
      this.trilhas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
      this.trilhasById = {};
      this.trilhas.forEach((t, ti) => {
        t.index = ti;
        t.modulos = [];
        this.trilhasById[t.id] = t;
      });
      this.modules.forEach((m) => {
        m.trilha = m.trilha || "python";
        if (!this.trilhasById[m.trilha]) {
          const t = { id: m.trilha, titulo: m.trilha, ordem: 99, linguagem: "python", index: this.trilhas.length, modulos: [] };
          this.trilhas.push(t);
          this.trilhasById[t.id] = t;
        }
      });
      const ordemTrilha = (m) => this.trilhasById[m.trilha].ordem || 0;
      this.modules.sort((a, b) => ordemTrilha(a) - ordemTrilha(b) || (a.ordem || 0) - (b.ordem || 0));
      this.items = {};
      this.lessonsByKey = {};
      this.modulesById = {};
      this.modules.forEach((m, mi) => {
        const t = this.trilhasById[m.trilha];
        m.index = mi;
        m.trilhaObj = t;
        m.linguagem = m.linguagem || t.linguagem || "python";
        t.modulos.push(m);
        m.numero = t.modulos.length;
        m.licoes = m.licoes || [];
        m.desafios = m.desafios || [];
        m.arquivos = m.arquivos || {};
        this.modulesById[m.id] = m;
        m.licoes.forEach((l, li) => {
          l.index = li;
          l.key = m.id + "/" + l.id;
          l.module = m;
          l.linguagem = l.linguagem || m.linguagem;
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

    /* Módulo anterior e seguinte dentro da mesma trilha. */
    anterior(m) {
      return m.trilhaObj.modulos[m.numero - 2] || null;
    },
    proximo(m) {
      return m.trilhaObj.modulos[m.numero] || null;
    },

    /* Arquivos disponíveis para um exercício: os do módulo + os do próprio exercício. */
    arquivosDe(item) {
      return Object.assign({}, item.module.arquivos || {}, item.ex.arquivos || {});
    },

    /* Ambiente de execução de uma lição ou exercício: linguagem e banco de dados. */
    ambiente(module, lesson, ex) {
      const linguagem = (ex && ex.linguagem) || (lesson && lesson.linguagem) || module.linguagem || "python";
      const bancoId = (ex && ex.banco) || (lesson && lesson.banco) || module.banco;
      const banco = bancoId ? this.bancos[bancoId] : null;
      const setup = [module.setup, lesson && lesson.setup, ex && ex.setup].filter(Boolean).join("\n");
      const arquivos = Object.assign({}, module.arquivos || {}, (lesson && lesson.arquivos) || {}, (ex && ex.arquivos) || {});
      return { linguagem, banco, bancoId, setup, arquivos };
    },
    ambienteDe(item) {
      return this.ambiente(item.module, item.lesson, item.ex);
    },

    contagem(trilhaId) {
      let licoes = 0, exercicios = 0, desafios = 0, modulos = 0;
      this.modules.forEach((m) => {
        if (trilhaId && m.trilha !== trilhaId) return;
        modulos++;
        licoes += m.licoes.length;
        desafios += m.desafios.length;
        m.licoes.forEach((l) => (exercicios += l.exercicios.length));
      });
      return { modulos, licoes, exercicios, desafios };
    },
  };

  window.Ensaio = Ensaio;
})();
