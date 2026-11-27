Ensaio.modulo((r) => ({
  id: "s4",
  trilha: "sql",
  ordem: 4,
  banco: "compras",
  titulo: "Subconsultas, CTEs e janelas",
  resumo: "Subconsultas no WHERE e no FROM, EXISTS, CTEs com WITH, rankings e acumulados com funções de janela.",
  licoes: [
    {
      id: "subconsulta-where",
      titulo: "Subconsultas no WHERE",
      explicacao: [
        "Uma **subconsulta** é um SELECT dentro de outro, entre parênteses. No WHERE, ela responde perguntas que dependem de outro cálculo.",
        "Subconsulta **escalar** (devolve um valor): `WHERE preco_ref > (SELECT AVG(preco_ref) FROM produtos)`.",
        "Subconsulta de **lista**, com `IN`: `WHERE id IN (SELECT fornecedor_id FROM pedidos WHERE status = 'cancelado')`.",
        "> Cuidado com `NOT IN` quando a lista pode ter NULL: se algum valor da lista for NULL, nenhuma linha passa. Filtre os nulos na subconsulta ou use `NOT EXISTS`.",
      ],
      exemplo: r`
SELECT nome, preco_ref
FROM produtos
WHERE preco_ref > (SELECT AVG(preco_ref) FROM produtos);

SELECT nome
FROM fornecedores
WHERE id IN (SELECT fornecedor_id FROM pedidos WHERE status = 'pendente');
`,
      erro: {
        codigo: r`
SELECT nome, nota
FROM fornecedores
WHERE nota NOT IN (SELECT nota FROM fornecedores WHERE uf = 'RJ');
`,
        explicacao: "As notas do RJ são 9.1 e NULL. Com um NULL na lista, `nota NOT IN (9.1, NULL)` nunca é verdadeiro, e o resultado vem vazio. Acrescente `AND nota IS NOT NULL` dentro da subconsulta.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "A média dos preços de referência dos 12 produtos é 174.35. Só três produtos custam mais que isso: Monitor (980), Cadeira (650) e Frete regional (350). Qual é o resultado?",
          codigo: r`
SELECT nome
FROM produtos
WHERE preco_ref > (SELECT AVG(preco_ref) FROM produtos)
ORDER BY nome;
`,
          opcoes: ["nome\nCadeira\nFrete regional\nMonitor", "nome\nMonitor\nCadeira\nFrete regional", "nome\nMonitor", "nome\n174.35"],
          resposta: 0,
          dicas: ["A subconsulta devolve 174.35.", "Quais produtos passam no filtro?", "Ordenados por nome."],
          comentario: "A subconsulta roda uma vez e o resultado vira um número na comparação.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que faz `WHERE id IN (SELECT fornecedor_id FROM pedidos)`?",
          opcoes: ["Compara o id com a soma dos fornecedor_id", "Mantém os fornecedores cujo id aparece em algum pedido", "Junta as duas tabelas coluna a coluna", "Dá erro, porque a subconsulta devolve várias linhas"],
          resposta: 1,
          dicas: ["A subconsulta devolve uma lista de ids.", "`IN` testa se o valor está na lista.", "Fornecedores que têm pedido."],
          comentario: "Repetições na lista não importam: cada fornecedor aparece uma vez no resultado.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para listar os fornecedores que têm pedidos cancelados.",
          codigo: r`
SELECT nome
FROM fornecedores
WHERE id ___ (SELECT fornecedor_id FROM pedidos WHERE status = 'cancelado');
`,
          respostas: [["IN"]],
          testes: [[r`assert mesmo_resultado("SELECT nome FROM fornecedores WHERE id IN (SELECT fornecedor_id FROM pedidos WHERE status = 'cancelado')", ordem=False)`, "Devem vir Beta Insumos e Eta Gráfica"]],
          dicas: ["A subconsulta devolve vários ids.", "É o mesmo operador usado com listas fixas.", "`IN`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Liste os fornecedores com nota **acima da média** das notas (a média ignora os nulos): `nome` e `nota`, da maior nota para a menor e, no empate, pelo nome.",
          inicial: r`
SELECT nome, nota
FROM fornecedores
`,
          testes: [[r`assert mesmo_resultado("SELECT nome, nota FROM fornecedores WHERE nota > (SELECT AVG(nota) FROM fornecedores) ORDER BY nota DESC, nome")`, "Devem vir os fornecedores com nota acima da média, ordenados"]],
          dicas: ["A média vem de uma subconsulta escalar.", "`AVG` já ignora os NULL.", "`WHERE nota > (SELECT AVG(nota) FROM fornecedores)`."],
          solucao: r`
SELECT nome, nota
FROM fornecedores
WHERE nota > (SELECT AVG(nota) FROM fornecedores)   -- média calculada na hora
ORDER BY nota DESC, nome;
`,
        },
      ],
    },
    {
      id: "subconsulta-from",
      titulo: "Subconsultas no FROM e EXISTS",
      explicacao: [
        "Uma subconsulta no **FROM** funciona como uma tabela temporária: calcule um nível de agregação e consulte por cima dele. Dê sempre um apelido: `FROM (SELECT ...) AS g`.",
        "Exemplo clássico, a média de algo que já é uma soma: o ticket médio é a média do gasto **por pedido**, e não a média dos itens.",
        "`EXISTS (subconsulta)` é verdadeiro quando a subconsulta devolve pelo menos uma linha. Ela costuma referenciar a consulta de fora (subconsulta *correlacionada*): `WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.fornecedor_id = f.id)`.",
        "`NOT EXISTS` é a forma segura de dizer \"não tem\", e não sofre com NULL como o `NOT IN`.",
      ],
      exemplo: r`
-- ticket médio: primeiro o gasto por pedido, depois a média
SELECT ROUND(AVG(gasto), 2) AS ticket_medio
FROM (SELECT pedido_id, SUM(qtd * preco_unit) AS gasto
      FROM itens_pedido
      GROUP BY pedido_id) AS g;

-- fornecedores que têm algum pedido pendente
SELECT f.nome
FROM fornecedores f
WHERE EXISTS (SELECT 1 FROM pedidos p
              WHERE p.fornecedor_id = f.id AND p.status = 'pendente');
`,
      erro: {
        codigo: r`
-- queria a média do gasto por pedido
SELECT ROUND(AVG(qtd * preco_unit), 2) AS ticket_medio
FROM itens_pedido;
`,
        explicacao: "Isso é a média por **item**, não por pedido: um pedido com 3 itens pesa 3 vezes. Primeiro some por pedido numa subconsulta e depois calcule a média por cima dela.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Os pedidos foram feitos por três compradores: Ana, Bruno e Carla. Qual é o resultado?",
          codigo: r`
SELECT COUNT(*) AS n
FROM (SELECT DISTINCT comprador FROM pedidos) AS c;
`,
          opcoes: ["n\n3", "n\n30", "n\n1", "comprador\nAna\nBruno\nCarla"],
          resposta: 0,
          dicas: ["A subconsulta devolve os compradores distintos.", "A consulta de fora conta as linhas dela.", "São três compradores."],
          comentario: "O mesmo resultado sai com `COUNT(DISTINCT comprador)`, mas o padrão de \"agregar por cima de uma agregação\" é o que importa aqui.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Quando `EXISTS (subconsulta)` é verdadeiro?",
          opcoes: ["Quando a subconsulta devolve pelo menos uma linha", "Quando a subconsulta devolve exatamente uma linha", "Quando a subconsulta devolve o número 1", "Quando a tabela existe no banco"],
          resposta: 0,
          dicas: ["O conteúdo das colunas não importa.", "Por isso se escreve `SELECT 1`.", "Basta existir uma linha."],
          comentario: "O banco pode parar de procurar na primeira linha encontrada, o que torna o EXISTS eficiente.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para listar os fornecedores que têm algum pedido pendente.",
          codigo: r`
SELECT f.nome
FROM fornecedores f
WHERE ___ (SELECT 1 FROM pedidos p
           WHERE p.fornecedor_id = f.id AND p.status = 'pendente');
`,
          respostas: [["EXISTS"]],
          testes: [[r`assert mesmo_resultado("SELECT nome FROM fornecedores WHERE id IN (SELECT fornecedor_id FROM pedidos WHERE status = 'pendente')", ordem=False)`, "Devem vir Alfa Embalagens, Beta Insumos e Delta Papéis"]],
          dicas: ["A subconsulta está ligada à de fora por `f.id`.", "Você quer saber se existe alguma linha.", "`EXISTS`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Liste os pedidos cujo gasto está **acima do ticket médio**. Use uma subconsulta no FROM para o gasto por pedido. Colunas: `pedido_id` e `gasto` (2 casas), do maior para o menor.",
          inicial: r`
SELECT pedido_id,
`,
          testes: [[r`assert mesmo_resultado("SELECT pedido_id, ROUND(gasto, 2) FROM (SELECT pedido_id, SUM(qtd * preco_unit) AS gasto FROM itens_pedido GROUP BY pedido_id) WHERE gasto > (SELECT AVG(g) FROM (SELECT SUM(qtd * preco_unit) AS g FROM itens_pedido GROUP BY pedido_id)) ORDER BY gasto DESC")`, "Devem vir os pedidos acima do ticket médio, do maior para o menor"]],
          dicas: ["Monte a subconsulta `SELECT pedido_id, SUM(qtd * preco_unit) AS gasto FROM itens_pedido GROUP BY pedido_id`.", "A média também precisa ser calculada sobre o gasto por pedido, em outra subconsulta.", "`WHERE gasto > (SELECT AVG(gasto) FROM (...))`. Na próxima lição, uma CTE evita repetir a mesma subconsulta."],
          solucao: r`
SELECT pedido_id, ROUND(gasto, 2) AS gasto
FROM (SELECT pedido_id, SUM(qtd * preco_unit) AS gasto
      FROM itens_pedido
      GROUP BY pedido_id) AS g
WHERE gasto > (SELECT AVG(gasto)
               FROM (SELECT SUM(qtd * preco_unit) AS gasto
                     FROM itens_pedido
                     GROUP BY pedido_id))
ORDER BY gasto DESC;
`,
          comentario: "A subconsulta do gasto aparece duas vezes. É exatamente o problema que a CTE resolve.",
        },
      ],
    },
    {
      id: "cte",
      titulo: "CTEs com WITH",
      explicacao: [
        "Uma **CTE** (*common table expression*) dá nome a uma subconsulta antes da consulta principal: `WITH gasto_pedido AS (SELECT ...) SELECT ... FROM gasto_pedido;`.",
        "Ela deixa a consulta legível de cima para baixo, em etapas, e permite reutilizar o mesmo resultado várias vezes.",
        "Várias CTEs são separadas por vírgula, e cada uma pode usar as anteriores: `WITH a AS (...), b AS (SELECT ... FROM a) SELECT ...`.",
        "Pense numa CTE como as etapas de um notebook: cada uma prepara os dados para a próxima.",
      ],
      exemplo: r`
WITH gasto_pedido AS (
    SELECT pedido_id, SUM(qtd * preco_unit) AS gasto
    FROM itens_pedido
    GROUP BY pedido_id
),
media AS (
    SELECT AVG(gasto) AS ticket FROM gasto_pedido
)
SELECT g.pedido_id, ROUND(g.gasto, 2) AS gasto, ROUND(m.ticket, 2) AS ticket_medio
FROM gasto_pedido g, media m
WHERE g.gasto > m.ticket
ORDER BY g.gasto DESC;
`,
      erro: {
        codigo: r`
WITH caros AS (
    SELECT * FROM produtos WHERE preco_ref > 100
);
SELECT * FROM caros;
`,
        explicacao: "O ponto e vírgula depois do parêntese encerrou o comando, e a CTE ficou sem consulta principal (`incomplete input` ou erro de sintaxe). A CTE e o SELECT final são um único comando: tire o `;` do meio.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a principal vantagem de uma CTE (`WITH`)?",
          opcoes: ["Grava uma tabela nova no banco", "Dá nome a uma etapa da consulta, deixando o código legível e reutilizável no mesmo comando", "Sempre deixa a consulta mais rápida", "Substitui os índices"],
          resposta: 1,
          dicas: ["A CTE existe só durante aquele comando.", "Ela organiza a consulta em etapas.", "Nada é gravado no banco."],
          comentario: "Para guardar a consulta de forma permanente, existe a VIEW (módulo 5).",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Três produtos custam mais de 100: Frete regional (350), Cadeira (650) e Monitor (980). Qual é o resultado?",
          codigo: r`
WITH caros AS (SELECT * FROM produtos WHERE preco_ref > 100)
SELECT COUNT(*) AS n, MIN(preco_ref) AS menor FROM caros;
`,
          opcoes: ["n | menor\n3 | 350.0", "n | menor\n3 | 980.0", "n | menor\n12 | 0.85", "n\n3"],
          resposta: 0,
          dicas: ["A CTE filtra os produtos caros.", "A consulta principal conta e pega o menor preço deles.", "O menor entre 350, 650 e 980."],
          comentario: "A CTE é usada como se fosse uma tabela.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a CTE que calcula o ticket médio por pedido.",
          codigo: r`
___ gasto_pedido ___ (
    SELECT pedido_id, SUM(qtd * preco_unit) AS gasto
    FROM itens_pedido
    GROUP BY pedido_id
)
SELECT ROUND(AVG(gasto), 2) AS ticket_medio FROM gasto_pedido;
`,
          respostas: [["WITH"], ["AS"]],
          testes: [[r`assert mesmo_resultado("SELECT ROUND(AVG(g), 2) FROM (SELECT SUM(qtd * preco_unit) AS g FROM itens_pedido GROUP BY pedido_id)")`, "O ticket médio deve estar correto"]],
          dicas: ["A primeira palavra começa a CTE.", "A segunda liga o nome à subconsulta.", "`WITH` e `AS`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Com CTEs, liste os pedidos acima do ticket médio, agora com o nome do fornecedor. Colunas: `pedido_id`, `fornecedor` e `gasto` (2 casas), do maior gasto para o menor.",
          inicial: r`
WITH gasto_pedido AS (
    SELECT pedido_id, SUM(qtd * preco_unit) AS gasto
    FROM itens_pedido
    GROUP BY pedido_id
)
`,
          testes: [
            [r`assert mesmo_resultado("WITH g AS (SELECT pedido_id, SUM(qtd * preco_unit) AS gasto FROM itens_pedido GROUP BY pedido_id) SELECT g.pedido_id, f.nome, ROUND(g.gasto, 2) FROM g JOIN pedidos p ON p.id = g.pedido_id JOIN fornecedores f ON f.id = p.fornecedor_id WHERE g.gasto > (SELECT AVG(gasto) FROM g) ORDER BY g.gasto DESC")`, "Pedidos acima da média, com o fornecedor, do maior para o menor"],
            [r`assert "with" in _src.lower()`, "Use WITH"],
          ],
          dicas: ["Junte a CTE com `pedidos` e `fornecedores`.", "A média pode vir de `(SELECT AVG(gasto) FROM gasto_pedido)`.", "Filtre `g.gasto > (SELECT AVG(gasto) FROM gasto_pedido)` e ordene por `g.gasto DESC`."],
          solucao: r`
WITH gasto_pedido AS (
    SELECT pedido_id, SUM(qtd * preco_unit) AS gasto
    FROM itens_pedido
    GROUP BY pedido_id
)
SELECT g.pedido_id,
       f.nome AS fornecedor,
       ROUND(g.gasto, 2) AS gasto
FROM gasto_pedido g
JOIN pedidos p      ON p.id = g.pedido_id
JOIN fornecedores f ON f.id = p.fornecedor_id
WHERE g.gasto > (SELECT AVG(gasto) FROM gasto_pedido)   -- reaproveita a CTE
ORDER BY g.gasto DESC;
`,
        },
      ],
    },
    {
      id: "janelas-ranking",
      titulo: "Funções de janela: rankings",
      explicacao: [
        "Uma **função de janela** calcula sobre um conjunto de linhas relacionadas **sem juntar as linhas** num grupo, como o GROUP BY faria. Cada linha continua no resultado, com um valor a mais.",
        "Sintaxe: `funcao() OVER (PARTITION BY grupo ORDER BY critério)`. `PARTITION BY` reinicia o cálculo a cada grupo; `ORDER BY` define a ordem dentro dele.",
        "Rankings: `ROW_NUMBER()` (1, 2, 3, sem empates), `RANK()` (empates recebem a mesma posição e pulam a seguinte: 1, 1, 3) e `DENSE_RANK()` (sem pular: 1, 1, 2).",
        "\"Top N por grupo\" é o uso clássico: numere com ROW_NUMBER numa CTE e filtre `WHERE posicao <= N` por fora.",
      ],
      exemplo: r`
SELECT nome, categoria, preco_ref,
       ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY preco_ref DESC) AS pos_na_categoria,
       RANK() OVER (ORDER BY preco_ref DESC) AS pos_geral
FROM produtos
ORDER BY categoria, pos_na_categoria;

SELECT nome, nota,
       RANK() OVER (ORDER BY nota DESC) AS rank,
       DENSE_RANK() OVER (ORDER BY nota DESC) AS dense
FROM fornecedores
WHERE nota IS NOT NULL;
`,
      erro: {
        codigo: r`
SELECT nome, categoria,
       ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY preco_ref DESC) AS pos
FROM produtos
WHERE pos = 1;
`,
        explicacao: "As funções de janela são calculadas depois do WHERE, então `pos` ainda não existe ali: `no such column: pos`. Calcule a posição numa CTE ou subconsulta e filtre por fora.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre `SUM(x) ... GROUP BY g` e `SUM(x) OVER (PARTITION BY g)`?",
          opcoes: ["Nenhuma", "O GROUP BY devolve uma linha por grupo; a janela mantém todas as linhas e repete o total do grupo em cada uma", "A janela devolve uma linha por grupo", "O GROUP BY não aceita SUM"],
          resposta: 1,
          dicas: ["Uma das duas \"colapsa\" as linhas.", "A janela acrescenta uma coluna sem perder detalhe.", "É ótima para participação no total do grupo."],
          comentario: "Com a janela, dá para calcular `valor / SUM(valor) OVER (PARTITION BY categoria)`: a participação de cada item na sua categoria.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Os produtos de limpeza são Detergente 5L (18.9), Álcool 70% (9.8) e Luvas (0.85). Qual é o resultado?",
          codigo: r`
SELECT nome, preco_ref,
       ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY preco_ref DESC) AS pos
FROM produtos
WHERE categoria = 'limpeza'
ORDER BY pos;
`,
          opcoes: ["nome | preco_ref | pos\nDetergente 5L | 18.9 | 1\nÁlcool 70% | 9.8 | 2\nLuvas | 0.85 | 3", "nome | preco_ref | pos\nLuvas | 0.85 | 1\nÁlcool 70% | 9.8 | 2\nDetergente 5L | 18.9 | 3", "nome | preco_ref | pos\nDetergente 5L | 18.9 | 1", "nome | preco_ref | pos\nDetergente 5L | 18.9 | 1\nÁlcool 70% | 9.8 | 1\nLuvas | 0.85 | 1"],
          resposta: 0,
          dicas: ["A ordem da janela é preço decrescente.", "O mais caro recebe 1.", "A consulta é ordenada pela posição."],
          comentario: "Com `PARTITION BY categoria`, a numeração recomeçaria em 1 a cada categoria, se houvesse várias.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para classificar os fornecedores pela nota de modo que **empates recebam a mesma posição** e a posição seguinte seja pulada (1, 1, 3...).",
          codigo: r`
SELECT nome, nota,
       ___() OVER (ORDER BY nota DESC) AS posicao
FROM fornecedores
WHERE nota IS NOT NULL;
`,
          respostas: [["RANK"]],
          testes: [[r`assert mesmo_resultado("SELECT nome, nota, RANK() OVER (ORDER BY nota DESC) FROM fornecedores WHERE nota IS NOT NULL", ordem=False)`, "Alfa e Gama empatam em 1º, e a Beta fica em 3º"]],
          dicas: ["Não é ROW_NUMBER, que nunca empata.", "Não é DENSE_RANK, que não pula posições.", "`RANK`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Monte o ranking mensal de compradores por gasto: `mes` (`'%Y-%m'`), `comprador`, `gasto` (2 casas) e `posicao` (RANK dentro do mês, com o maior gasto em 1º). Ordene por mês e posição.",
          inicial: r`
WITH g AS (
    -- gasto por mês e comprador
)
SELECT
`,
          testes: [[r`assert mesmo_resultado("WITH g AS (SELECT strftime('%Y-%m', p.data) AS mes, p.comprador, SUM(i.qtd * i.preco_unit) AS gasto FROM pedidos p JOIN itens_pedido i ON i.pedido_id = p.id GROUP BY mes, p.comprador) SELECT mes, comprador, ROUND(gasto, 2), RANK() OVER (PARTITION BY mes ORDER BY gasto DESC) FROM g", ordem=False)`, "Cada mês deve ter o seu ranking de compradores por gasto"]],
          dicas: ["Na CTE, junte pedidos e itens e agrupe por mês e comprador.", "Depois, `RANK() OVER (PARTITION BY mes ORDER BY gasto DESC)`.", "Ordene por `mes, posicao`."],
          solucao: r`
WITH g AS (
    SELECT strftime('%Y-%m', p.data) AS mes,
           p.comprador,
           SUM(i.qtd * i.preco_unit) AS gasto
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    GROUP BY mes, p.comprador
)
SELECT mes,
       comprador,
       ROUND(gasto, 2) AS gasto,
       RANK() OVER (PARTITION BY mes ORDER BY gasto DESC) AS posicao
FROM g
ORDER BY mes, posicao;
`,
        },
      ],
    },
    {
      id: "janelas-acumulados",
      titulo: "Funções de janela: acumulados e comparações",
      explicacao: [
        "Com `ORDER BY` dentro do `OVER`, a soma vira **acumulada**: `SUM(gasto) OVER (ORDER BY mes)`.",
        "`LAG(coluna)` pega o valor da linha **anterior** e `LEAD(coluna)`, o da seguinte. É assim que se calcula a variação mês a mês: `gasto - LAG(gasto) OVER (ORDER BY mes)`.",
        "O tamanho da janela pode ser explícito: `AVG(gasto) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` é a média móvel de 3 meses.",
        "Na primeira linha, `LAG` devolve NULL, porque não há linha anterior.",
      ],
      exemplo: r`
WITH mensal AS (
    SELECT strftime('%Y-%m', p.data) AS mes,
           SUM(i.qtd * i.preco_unit) AS gasto
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    WHERE p.status = 'aprovado'
    GROUP BY mes
)
SELECT mes,
       ROUND(gasto, 2) AS gasto,
       ROUND(SUM(gasto) OVER (ORDER BY mes), 2) AS acumulado,
       ROUND(LAG(gasto) OVER (ORDER BY mes), 2) AS mes_anterior,
       ROUND(AVG(gasto) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS media_3m
FROM mensal
ORDER BY mes;
`,
      erro: {
        codigo: r`
WITH mensal AS (
    SELECT strftime('%Y-%m', data) AS mes, COUNT(*) AS pedidos
    FROM pedidos GROUP BY mes
)
SELECT mes, pedidos, LAG(pedidos) OVER () AS anterior
FROM mensal;
`,
        explicacao: "Sem `ORDER BY` dentro do `OVER`, a \"linha anterior\" não tem ordem definida, e o resultado pode sair embaralhado. Sempre diga a ordem: `LAG(pedidos) OVER (ORDER BY mes)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Os produtos 1, 2 e 3 custam 3.5, 5.2 e 2.1. Qual é o resultado?",
          codigo: r`
SELECT id, preco_ref,
       SUM(preco_ref) OVER (ORDER BY id) AS acumulado
FROM produtos
WHERE id <= 3;
`,
          opcoes: ["id | preco_ref | acumulado\n1 | 3.5 | 3.5\n2 | 5.2 | 8.7\n3 | 2.1 | 10.8", "id | preco_ref | acumulado\n1 | 3.5 | 10.8\n2 | 5.2 | 10.8\n3 | 2.1 | 10.8", "acumulado\n10.8", "id | preco_ref | acumulado\n1 | 3.5 | 3.5\n2 | 5.2 | 5.2\n3 | 2.1 | 2.1"],
          resposta: 0,
          dicas: ["Com ORDER BY na janela, a soma vai acumulando.", "3.5, depois 3.5 + 5.2...", "Sem ORDER BY, todas as linhas mostrariam 10.8."],
          comentario: "A segunda opção seria o resultado de `SUM(preco_ref) OVER ()`, sem ordem.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que `LAG(gasto) OVER (ORDER BY mes)` devolve?",
          opcoes: ["O gasto do mês seguinte", "O gasto do mês anterior (NULL no primeiro mês)", "A soma de todos os meses anteriores", "O menor gasto"],
          resposta: 1,
          dicas: ["*Lag* quer dizer atraso.", "O oposto é o LEAD.", "No primeiro mês, não há anterior."],
          comentario: "`LAG(gasto, 12)` pegaria o mesmo mês do ano anterior, numa série mensal.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para mostrar, ao lado de cada mês, a quantidade de pedidos do mês anterior.",
          codigo: r`
WITH m AS (
    SELECT strftime('%Y-%m', data) AS mes, COUNT(*) AS total
    FROM pedidos
    GROUP BY mes
)
SELECT mes, total, ___(total) ___ (ORDER BY mes) AS anterior
FROM m;
`,
          respostas: [["LAG"], ["OVER"]],
          testes: [[r`assert mesmo_resultado("WITH m AS (SELECT strftime('%Y-%m', data) AS mes, COUNT(*) AS total FROM pedidos GROUP BY mes) SELECT mes, total, LAG(total) OVER (ORDER BY mes) FROM m", ordem=False)`, "Cada mês deve mostrar o total do mês anterior"]],
          dicas: ["A função pega a linha anterior.", "Toda função de janela precisa de uma palavra antes dos parênteses.", "`LAG` e `OVER`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Calcule a **média móvel de 3 meses** do gasto mensal dos pedidos aprovados: colunas `mes`, `gasto` (2 casas) e `media_3m` (média do mês atual e dos dois anteriores, 2 casas). Ordene por mês.",
          inicial: r`
WITH mensal AS (
    SELECT strftime('%Y-%m', p.data) AS mes,
           SUM(i.qtd * i.preco_unit) AS gasto
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    WHERE p.status = 'aprovado'
    GROUP BY mes
)
SELECT
`,
          testes: [[r`assert mesmo_resultado("WITH m AS (SELECT strftime('%Y-%m', p.data) AS mes, SUM(i.qtd * i.preco_unit) AS gasto FROM pedidos p JOIN itens_pedido i ON i.pedido_id = p.id WHERE p.status = 'aprovado' GROUP BY mes) SELECT mes, ROUND(gasto, 2), ROUND(AVG(gasto) OVER (ORDER BY mes ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) FROM m ORDER BY mes")`, "A média móvel de 3 meses deve estar correta"]],
          dicas: ["A CTE já entrega o gasto por mês.", "A janela usa `AVG(gasto) OVER (ORDER BY mes ROWS BETWEEN ...)`.", "`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`."],
          solucao: r`
WITH mensal AS (
    SELECT strftime('%Y-%m', p.data) AS mes,
           SUM(i.qtd * i.preco_unit) AS gasto
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    WHERE p.status = 'aprovado'
    GROUP BY mes
)
SELECT mes,
       ROUND(gasto, 2) AS gasto,
       ROUND(AVG(gasto) OVER (ORDER BY mes
                              ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS media_3m
FROM mensal
ORDER BY mes;
`,
          comentario: "Nos dois primeiros meses, a média usa só os meses disponíveis (1 e 2), porque ainda não há três meses para trás.",
        },
      ],
    },
  ],
  desafios: [
    {
      id: "campeao-categoria",
      titulo: "Produto campeão de cada categoria",
      enunciado: [
        "Para cada categoria de produto, encontre o produto com **maior gasto** em pedidos aprovados. Colunas: `categoria`, `produto` e `gasto` (2 casas), ordenadas por categoria.",
      ],
      inicial: r`
WITH gasto_produto AS (
    -- gasto por categoria e produto (só aprovados)
),
ranking AS (
    -- numere os produtos dentro de cada categoria
)
SELECT
`,
      testes: [[r`assert mesmo_resultado("WITH g AS (SELECT pr.categoria, pr.nome, SUM(i.qtd * i.preco_unit) AS gasto FROM itens_pedido i JOIN produtos pr ON pr.id = i.produto_id JOIN pedidos p ON p.id = i.pedido_id WHERE p.status = 'aprovado' GROUP BY pr.categoria, pr.nome), r AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY gasto DESC) AS pos FROM g) SELECT categoria, nome, ROUND(gasto, 2) FROM r WHERE pos = 1 ORDER BY categoria")`, "Deve vir um produto por categoria: o de maior gasto"]],
      dicas: ["A primeira CTE junta itens, produtos e pedidos e agrupa por categoria e produto.", "A segunda acrescenta `ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY gasto DESC) AS pos`.", "No SELECT final, filtre `WHERE pos = 1`."],
      solucao: r`
WITH gasto_produto AS (
    SELECT pr.categoria, pr.nome AS produto, SUM(i.qtd * i.preco_unit) AS gasto
    FROM itens_pedido i
    JOIN produtos pr ON pr.id = i.produto_id
    JOIN pedidos p   ON p.id  = i.pedido_id
    WHERE p.status = 'aprovado'
    GROUP BY pr.categoria, pr.nome
),
ranking AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY gasto DESC) AS pos
    FROM gasto_produto
)
SELECT categoria, produto, ROUND(gasto, 2) AS gasto
FROM ranking
WHERE pos = 1            -- top 1 de cada categoria
ORDER BY categoria;
`,
    },
    {
      id: "evolucao-mensal",
      titulo: "Evolução mensal do gasto",
      enunciado: [
        "Monte a série mensal do gasto com pedidos aprovados com as colunas `mes`, `gasto`, `acumulado` (soma desde janeiro) e `variacao_pct` (variação em relação ao mês anterior, em %, com 1 casa; NULL no primeiro mês). Os valores de gasto e acumulado devem ter 2 casas. Ordene por mês.",
      ],
      inicial: r`
WITH mensal AS (
    SELECT strftime('%Y-%m', p.data) AS mes,
           SUM(i.qtd * i.preco_unit) AS gasto
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    WHERE p.status = 'aprovado'
    GROUP BY mes
)
SELECT
`,
      testes: [
        [r`assert mesmo_resultado("WITH m AS (SELECT strftime('%Y-%m', p.data) AS mes, SUM(i.qtd * i.preco_unit) AS gasto FROM pedidos p JOIN itens_pedido i ON i.pedido_id = p.id WHERE p.status = 'aprovado' GROUP BY mes) SELECT mes, ROUND(gasto, 2), ROUND(SUM(gasto) OVER (ORDER BY mes), 2), ROUND((gasto - LAG(gasto) OVER (ORDER BY mes)) / LAG(gasto) OVER (ORDER BY mes) * 100, 1) FROM m ORDER BY mes")`, "Gasto, acumulado e variação devem estar corretos"],
        [r`assert _cols == ["mes", "gasto", "acumulado", "variacao_pct"], _cols`, "As colunas devem ser mes, gasto, acumulado e variacao_pct"],
      ],
      dicas: ["O acumulado é `SUM(gasto) OVER (ORDER BY mes)`.", "A variação usa `LAG(gasto) OVER (ORDER BY mes)` duas vezes: na subtração e na divisão.", "`ROUND((gasto - LAG(...)) / LAG(...) * 100, 1)`. No primeiro mês, o LAG é NULL e o resultado também."],
      solucao: r`
WITH mensal AS (
    SELECT strftime('%Y-%m', p.data) AS mes,
           SUM(i.qtd * i.preco_unit) AS gasto
    FROM pedidos p
    JOIN itens_pedido i ON i.pedido_id = p.id
    WHERE p.status = 'aprovado'
    GROUP BY mes
)
SELECT mes,
       ROUND(gasto, 2) AS gasto,
       ROUND(SUM(gasto) OVER (ORDER BY mes), 2) AS acumulado,
       ROUND((gasto - LAG(gasto) OVER (ORDER BY mes))
             / LAG(gasto) OVER (ORDER BY mes) * 100, 1) AS variacao_pct
FROM mensal
ORDER BY mes;
`,
      comentario: "Para não repetir a janela, dá para criar uma segunda CTE com `LAG(gasto) OVER (ORDER BY mes) AS anterior` e calcular a variação por cima dela.",
    },
  ],
}));
