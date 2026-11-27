# Ensaio · Caderno de estudos

Um caderno de estudos gamificado que roda inteiro no navegador, inclusive no celular. A primeira trilha ensina Python do básico à ciência de dados: o código é executado com o [Pyodide](https://pyodide.org), os exercícios são corrigidos por testes automáticos e o progresso fica salvo no próprio navegador. Não há servidor nem login.

## Como abrir

**No computador (Windows):** dê dois cliques em `abrir.bat`. Ele inicia um servidor local e abre `http://localhost:8000`. Para encerrar, feche a janela preta.

Em qualquer sistema, também dá para usar o terminal, dentro da pasta do projeto:

```
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador.

**No celular:** abra https://mahamaral-ds.github.io/level-code/ (o site é publicado pelo GitHub Pages a partir da branch `main`). No Chrome do Android ou no Safari do iPhone, use "Adicionar à tela inicial" para abrir como app.

> **Primeiro acesso:** é preciso internet para baixar o Python do navegador (cerca de 10 MB) e, quando você chegar ao módulo 7, o NumPy, o pandas e o matplotlib (cerca de 30 MB). Depois disso, tudo fica guardado e o app abre sem internet.

## Seu progresso

O progresso (XP, níveis, revisões e conquistas) fica salvo no navegador em que você estuda. Em **Ajustes**:

- **Exportar progresso** baixa um arquivo `.json`, que funciona como backup ou para levar o progresso para outro navegador ou para o celular;
- **Importar arquivo** restaura um progresso exportado;
- **Apagar progresso** recomeça do zero.

Limpar os dados do navegador apaga o progresso. Exporte de vez em quando.

## Trilhas

Cada lição tem quatro partes: **I. Anotação** (explicação curta), **II. Experimento** (exemplo executável e editável), **III. Erro comum** (que dá para executar e ver o erro acontecer) e **IV. Exercícios** (4 por lição, de tipos variados). Cada módulo termina com desafios mais próximos do dia a dia de um analista de dados.

| # | Módulo | Lições | Exercícios | Desafios |
|---|---|---|---|---|
| 1 | Fundamentos: variáveis, tipos, operadores, entrada e saída, strings, condicionais, laços | 8 | 32 | 2 |
| 2 | Estruturas de dados: listas, tuplas, dicionários, conjuntos, fatiamento, compreensões | 7 | 28 | 2 |
| 3 | Funções: retorno, parâmetros, escopo, `*args` e `**kwargs`, lambda, recursão | 6 | 24 | 2 |
| 4 | Organização do código: módulos, pacotes, tratamento de erros, arquivos | 5 | 20 | 2 |
| 5 | Orientação a objetos: classes, métodos, herança, métodos especiais, dataclasses | 5 | 20 | 2 |
| 6 | Intermediário e avançado: iteradores, geradores, decoradores, contexto, type hints, pytest, PEP 8 | 7 | 28 | 2 |
| 7 | Python para dados: NumPy, pandas (leitura, limpeza, groupby, merge), matplotlib | 8 | 32 | 3 |
| 8 | Tópicos avançados: desempenho, otimização, asyncio, APIs, organização de projetos | 5 | 20 | 2 |
| | **Total** | **51** | **204** | **17** |

Os tipos de exercício são: múltipla escolha, prever a saída, completar o código, corrigir um código com erro e escrever do zero. Os de código são corrigidos por testes, e cada teste que falha explica o que era esperado.

**Desbloqueio:** o módulo seguinte abre quando você conclui 70% das lições do anterior. Cada módulo tem um **teste de nivelamento** (10 questões sorteadas, sem dicas): com 80% de acerto, as lições ficam marcadas como dominadas e o próximo módulo é liberado.

## Regras de XP e níveis

| Ação | XP |
|---|---|
| Exercício fácil / médio / difícil | 10 / 20 / 35 |
| Desafio de fim de módulo | 60 |
| Acerto de primeira, sem dicas | +50% |
| Cada dica usada | −20% do XP base (mínimo de 40%) |
| Ver a solução antes de acertar | 20% do XP base |
| Lição concluída (todos os exercícios) | +30 |
| Revisão correta | 5 + 3 × nível do exercício (+50% de primeira) |
| Teste de nivelamento aprovado | +100 |
| Meta diária batida | +20 |
| Conquista desbloqueada | +50 |

Refazer um exercício já resolvido não dá XP. Dicas são progressivas: a primeira é sutil e a terceira quase entrega a resposta. A solução comentada aparece depois de acertar ou depois de 3 tentativas.

**Níveis:** Aprendiz de bancada (0) → Assistente (150) → Técnico (400) → Analista (800) → Pesquisador (1.400) → Cientista (2.200) → Pesquisador sênior (3.300) → Orientador (4.700) → Referência (6.500 XP).

**Sequência diária:** conta os dias seguidos em que você bateu a meta diária. A meta é configurável em Ajustes: 20, 50 (padrão), 100 ou 150 XP.

**Repetição espaçada:** cada exercício resolvido volta para revisão em 1 dia. A cada acerto na revisão, o intervalo cresce para 3, 7, 15 e 30 dias. Se você errar, ele volta para o começo: reaparece no dia seguinte.

**Conquistas:** 19 marcos, entre eles primeiro acerto, primeira lição, primeiro módulo, 10 acertos de primeira, 50, 100 e 200 exercícios, sequências de 3, 7 e 30 dias, 25 e 100 revisões, primeiro desafio e nível 5.

O painel **Progresso** mostra XP, nível, sequência, atividade das últimas 16 semanas, taxa de acerto por módulo, temas que precisam de reforço (lições com menos de 65% de acerto) e conquistas.

Todas essas regras ficam em `js/rules.js` e podem ser ajustadas.

## Conceito visual: caderno de laboratório

Ciência de dados é trabalho experimental: hipótese, ensaio, observação e anotação. O app imita um caderno de laboratório quadriculado. Cada lição é uma página numerada (I a IV), os exercícios são fichas, o que você conclui é riscado à caneta no índice e o XP aparece como carimbo.

- **Paleta:** papel `#F4F1EA`, tinta `#1F2328` e um único destaque, o amarelo marca-texto `#F2C230`, sempre como fundo atrás de tinta escura. Verde-musgo para acerto e carmim para erro. Sem gradientes, sem efeito de vidro e sem sombras.
- **Tipografia:** Newsreader (títulos, serifada editorial), Atkinson Hyperlegible Next (texto, desenhada para legibilidade) e IBM Plex Mono (código e rótulos).
- **Ícones:** um conjunto próprio de ícones em traço de 1,5 px, num grid de 24 px, com cantos retos e sem preenchimento (`js/icons.js`).
- **Microinterações:** carimbo de XP, item riscado ao concluir a lição, carimbo de nível. Tudo fica desligado quando o sistema pede menos movimento.
- **Modo claro e escuro** (automático ou fixo, em Ajustes), layout para computador (índice na margem) e celular (abas na parte de baixo), foco visível e navegação por teclado (`Ctrl+Enter` executa o código, `Ctrl+Shift+Enter` verifica).

## Como adicionar lições e exercícios

O conteúdo fica em `content/`, com um arquivo por módulo, separado do código do app. Cada arquivo chama `Ensaio.modulo(...)`:

```js
Ensaio.modulo((r) => ({          // r é String.raw: use r`...` para blocos de código
  id: "m9", ordem: 9,
  titulo: "Meu módulo",
  resumo: "Uma frase sobre o módulo.",
  arquivos: { "dados.csv": "a;b\n1;2\n" },   // opcional: arquivos disponíveis para todas as lições
  licoes: [{
    id: "minha-licao",                       // não mude depois de publicar: o progresso usa esse id
    titulo: "Título da lição",
    explicacao: ["Parágrafo com `código` e **destaque**.", "- item de lista", "> nota"],
    exemplo: r`print("olá")`,
    erro: { codigo: r`print(x)`, explicacao: "Por que isso dá erro." },
    exercicios: [
      { tipo: "multipla", nivel: 1, enunciado: "...", opcoes: ["A", "B"], resposta: 1,
        dicas: ["sutil", "média", "quase a resposta"], comentario: "explicação" },
      { tipo: "prever", nivel: 1, enunciado: "...", codigo: r`print(1 + 1)`, opcoes: ["2", "11"], resposta: 0, dicas: [...] },
      { tipo: "completar", nivel: 1, enunciado: "...", codigo: r`x = ___`, respostas: [["10"]],
        testes: [["assert x == 10", "x deve ser 10"]], dicas: [...] },
      { tipo: "escrever", nivel: 2, enunciado: "...", inicial: r`# seu código`,
        testes: [["assert total == 100", "total deve ser 100"]], dicas: [...], solucao: r`total = 100` },
    ],
  }],
  desafios: [{ id: "meu-desafio", titulo: "...", enunciado: ["..."], inicial: r``, testes: [...], dicas: [...], solucao: r`` }],
}));
```

- **Testes** são pares `[código Python, mensagem]`. Eles rodam depois do código da pessoa, no mesmo espaço de nomes. Use `_out` (tudo o que foi impresso) e `_src` (o código-fonte digitado). Testes com várias linhas podem usar `r`...``.
- **Tipos:** `multipla`, `prever`, `completar` (lacunas `___`), `corrigir` e `escrever`. Os níveis vão de 1 a 3. Exercícios com `input()` recebem as entradas em `entrada: ["Ana", "30"]`.
- **IDs:** os exercícios são identificados pela posição dentro da lição. Para não bagunçar o progresso salvo, acrescente exercícios novos no fim da lista.
- **Módulo novo:** crie o arquivo em `content/` e acrescente uma linha `<script src="content/...">` em `index.html` e em `validar.html`.
- Dentro de `r`...``, não use crase nem `${`.

### Validar o conteúdo

Abra `validar.html` (com o servidor rodando) e clique em **Validar**. A página roda cada solução contra os testes, confere se o código inicial falha, compara a saída dos exercícios de prever e as respostas de completar, e lista o que estiver errado.

## Estrutura

```
index.html            app
validar.html          validador de conteúdo
abrir.bat             atalho para abrir no Windows
sw.js                 funcionamento sem internet
content/m1…m8-*.js    lições, exercícios e desafios (dados)
js/ensaio.js          registro e índice do conteúdo
js/runner.js          Python no navegador (Pyodide em Web Worker, com tempo limite)
js/exercise.js        componente de exercício (tipos, dicas, solução, XP)
js/state.js           progresso, XP, sequência, revisão espaçada, exportar e importar
js/rules.js           regras de XP, níveis e conquistas
js/app.js             telas e navegação
css/style.css         identidade visual
```

Todo o conteúdo usa dados fictícios.
