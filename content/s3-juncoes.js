Ensaio.modulo((r) => ({
  id: "s3",
  trilha: "sql",
  ordem: 3,
  banco: "compras",
  titulo: "Junções",
  resumo: "INNER e LEFT JOIN, junções com várias tabelas, junção com agregação e operações de conjunto.",
  licoes: [
    {
      id: "inner-join",
      titulo: "INNER JOIN",
      explicacao: [
        "Dados relacionados ficam em tabelas separadas, ligadas por **chaves**: `pedidos.fornecedor_id` aponta para `fornecedores.id`.",
        "`JOIN` (ou `INNER JOIN`) junta as linhas que combinam pela condição do `ON`: `FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id`.",
        "Apelidos de tabela (`p`, `f`) encurtam a escrita. Quando a mesma coluna existe nas duas tabelas (como `id`), prefixe: `p.id`, `f.nome`.",
        "No INNER JOIN, linhas **sem par** do outro lado ficam de fora do resultado.",
      ],
      exemplo: r`
SELECT p.id, p.data, f.nome AS fornecedor, p.status
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
ORDER BY p.id
LIMIT 8;

SELECT i.pedido_id, pr.nome AS produto, i.qtd, i.preco_unit
FROM itens_pedido i
JOIN produtos pr ON pr.id = i.produto_id
WHERE i.pedido_id = 1;
`,
      erro: {
        codigo: r`
SELECT id, nome
FROM pedidos
JOIN fornecedores ON fornecedores.id = pedidos.fornecedor_id;
`,
        explicacao: "As duas tabelas têm uma coluna `id`, e o banco não sabe qual você quer: `ambiguous column name: id`. Prefixe com a tabela ou o apelido: `pedidos.id` ou `p.id`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "O pedido 1 é da Alfa Embalagens e o pedido 10 é da Eta Gráfica. Qual é o resultado?",
          codigo: r`
SELECT p.id, f.nome
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
WHERE p.id IN (1, 10)
ORDER BY p.id;
`,
          opcoes: ["id | nome\n1 | Alfa Embalagens\n10 | Eta Gráfica", "id | nome\n1 | Alfa Embalagens", "id | fornecedor_id\n1 | 1\n10 | 7", "nome\nAlfa Embalagens\nEta Gráfica"],
          resposta: 0,
          dicas: ["Duas colunas: o id do pedido e o nome do fornecedor.", "Os dois pedidos têm fornecedor cadastrado.", "Ordenado pelo id do pedido."],
          comentario: "O JOIN trouxe o nome do fornecedor para cada pedido.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Num `pedidos JOIN fornecedores`, o que acontece com um fornecedor que não tem nenhum pedido?",
          opcoes: ["Aparece com o pedido NULL", "Fica de fora do resultado", "Dá erro", "Aparece duplicado"],
          resposta: 1,
          dicas: ["O INNER JOIN só mantém as combinações.", "Sem pedido, não há com quem combinar.", "Para mantê-lo, seria preciso um LEFT JOIN."],
          comentario: "É o caso da Teta Móveis: ela não aparece num INNER JOIN com pedidos.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a junção de pedidos com fornecedores.",
          codigo: r`
SELECT p.id, f.nome
FROM pedidos p
___ fornecedores f ___ f.id = p.fornecedor_id;
`,
          respostas: [["JOIN", "INNER JOIN"], ["ON"]],
          testes: [[r`assert mesmo_resultado("SELECT p.id, f.nome FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id", ordem=False)`, "Deve vir o nome do fornecedor de cada um dos 30 pedidos"]],
          dicas: ["A primeira lacuna junta as tabelas.", "A segunda introduz a condição de ligação.", "`JOIN` e `ON`."],
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "Mostre os itens do **pedido 9** com o nome do produto: `pedido_id`, `nome` (do produto), `qtd` e `preco_unit`.",
          inicial: r`
SELECT
`,
          testes: [[r`assert mesmo_resultado("SELECT i.pedido_id, pr.nome, i.qtd, i.preco_unit FROM itens_pedido i JOIN produtos pr ON pr.id = i.produto_id WHERE i.pedido_id = 9", ordem=False)`, "Devem vir os itens do pedido 9 com o nome do produto"]],
          dicas: ["Junte `itens_pedido` com `produtos`.", "A ligação é `pr.id = i.produto_id`.", "Filtre com `WHERE i.pedido_id = 9`."],
          solucao: r`
SELECT i.pedido_id, pr.nome, i.qtd, i.preco_unit
FROM itens_pedido i
JOIN produtos pr ON pr.id = i.produto_id
WHERE i.pedido_id = 9;
`,
        },
      ],
    },
    {
      id: "left-join",
      titulo: "LEFT JOIN",
      explicacao: [
        "`LEFT JOIN` mantém **todas** as linhas da tabela da esquerda. Quando não há par na direita, as colunas da direita vêm como NULL.",
        "O padrão para achar o que **não tem** correspondência: `LEFT JOIN ... WHERE direita.id IS NULL`. Exemplos: fornecedores sem pedidos, produtos nunca comprados.",
        "Condições sobre a tabela da direita devem ir no `ON`, e não no `WHERE`. No WHERE, elas descartam as linhas com NULL e o LEFT vira, na prática, um INNER.",
        "Ao contar depois de um LEFT JOIN, use `COUNT(direita.id)`, que vale 0 para quem não tem par, e não `COUNT(*)`, que daria 1.",
      ],
      exemplo: r`
SELECT f.nome, COUNT(p.id) AS pedidos
FROM fornecedores f
LEFT JOIN pedidos p ON p.fornecedor_id = f.id
GROUP BY f.id, f.nome
ORDER BY pedidos;

-- fornecedores sem nenhum pedido
SELECT f.nome
FROM fornecedores f
LEFT JOIN pedidos p ON p.fornecedor_id = f.id
WHERE p.id IS NULL;
`,
      erro: {
        codigo: r`
SELECT f.nome, COUNT(*) AS pedidos
FROM fornecedores f
LEFT JOIN pedidos p ON p.fornecedor_id = f.id
GROUP BY f.nome
ORDER BY pedidos;
`,
        explicacao: "A Teta Móveis aparece com 1 pedido, mas não tem nenhum. No LEFT JOIN, ela vira uma linha com as colunas de pedido nulas, e `COUNT(*)` conta essa linha. Use `COUNT(p.id)`, que ignora o NULL.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "A Teta Móveis (id 8) não tem pedidos. Qual é o resultado?",
          codigo: r`
SELECT f.nome, p.id
FROM fornecedores f
LEFT JOIN pedidos p ON p.fornecedor_id = f.id
WHERE f.id = 8;
`,
          opcoes: ["nome | id\nTeta Móveis | NULL", "(nenhuma linha)", "nome | id\nTeta Móveis | 8", "nome\nTeta Móveis"],
          resposta: 0,
          dicas: ["O LEFT JOIN mantém o fornecedor.", "Sem par, as colunas de pedidos ficam nulas.", "`p.id` é uma coluna de pedidos."],
          comentario: "Com INNER JOIN, o resultado seria vazio.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Como encontrar os fornecedores **sem nenhum** pedido?",
          opcoes: ["`SELECT nome FROM fornecedores f JOIN pedidos p ON p.fornecedor_id = f.id WHERE p.id IS NULL`", "`SELECT nome FROM fornecedores f LEFT JOIN pedidos p ON p.fornecedor_id = f.id WHERE p.id IS NULL`", "`SELECT nome FROM fornecedores WHERE pedidos IS NULL`", "`SELECT nome FROM fornecedores f LEFT JOIN pedidos p ON p.id IS NULL`"],
          resposta: 1,
          dicas: ["Com INNER JOIN, quem não tem pedido já some.", "É preciso manter todos os fornecedores e ver quem ficou sem par.", "LEFT JOIN + filtro de NULL no lado direito."],
          comentario: "Esse padrão também é chamado de *anti-join*. Outra forma é `WHERE NOT EXISTS (...)`, vista no módulo 4.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "A consulta deveria mostrar **todos os 8 fornecedores** com a quantidade de pedidos cancelados (0 para quem não tem), mas só aparecem 2. Corrija.",
          inicial: r`
SELECT f.nome, COUNT(p.id) AS cancelados
FROM fornecedores f
LEFT JOIN pedidos p ON p.fornecedor_id = f.id
WHERE p.status = 'cancelado'
GROUP BY f.nome
ORDER BY f.nome;
`,
          testes: [[r`assert mesmo_resultado("SELECT f.nome, COUNT(p.id) FROM fornecedores f LEFT JOIN pedidos p ON p.fornecedor_id = f.id AND p.status = 'cancelado' GROUP BY f.nome ORDER BY f.nome")`, "Devem aparecer os 8 fornecedores, com 0 para quem não tem cancelados"]],
          dicas: ["O WHERE roda depois da junção e descarta as linhas com status NULL.", "A condição de status precisa fazer parte da junção.", "Mova para o ON: `ON p.fornecedor_id = f.id AND p.status = 'cancelado'`."],
          solucao: r`
SELECT f.nome, COUNT(p.id) AS cancelados
FROM fornecedores f
LEFT JOIN pedidos p
       ON p.fornecedor_id = f.id
      AND p.status = 'cancelado'      -- filtro do lado direito vai no ON
GROUP BY f.nome
ORDER BY f.nome;
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Liste os produtos que **nunca** foram comprados (não aparecem em `itens_pedido`): `id` e `nome`.",
          inicial: r`
SELECT pr.id, pr.nome
FROM produtos pr
`,
          testes: [
            [r`assert mesmo_resultado("SELECT pr.id, pr.nome FROM produtos pr LEFT JOIN itens_pedido i ON i.produto_id = pr.id WHERE i.produto_id IS NULL", ordem=False)`, "Devem vir os produtos sem nenhum item"],
            [r`assert "join" in _src.lower() or "exists" in _src.lower() or "not in" in _src.lower()`, "Use uma junção (ou NOT EXISTS / NOT IN)"],
          ],
          dicas: ["A tabela da esquerda é `produtos`.", "`LEFT JOIN itens_pedido i ON i.produto_id = pr.id`.", "`WHERE i.produto_id IS NULL`."],
          solucao: r`
SELECT pr.id, pr.nome
FROM produtos pr
LEFT JOIN itens_pedido i ON i.produto_id = pr.id
WHERE i.produto_id IS NULL;    -- sobrou sem par: nunca comprado
`,
        },
      ],
    },
    {
      id: "varias-tabelas",
      titulo: "Junções com várias tabelas",
      explicacao: [
        "Encadeie JOINs para atravessar o modelo: `itens_pedido → pedidos → fornecedores` e `itens_pedido → produtos`.",
        "Cada JOIN traz uma tabela e tem o seu `ON`. Desenhe o caminho das chaves antes de escrever a consulta.",
        "Apelidos curtos e consistentes (`i`, `p`, `f`, `pr`) deixam a consulta legível. Comece pela tabela mais detalhada (aqui, `itens_pedido`).",
      ],
      exemplo: r`
SELECT p.id AS pedido, p.data, f.nome AS fornecedor,
       pr.nome AS produto, i.qtd, i.preco_unit
FROM itens_pedido i
JOIN pedidos p       ON p.id = i.pedido_id
JOIN fornecedores f  ON f.id = p.fornecedor_id
JOIN produtos pr     ON pr.id = i.produto_id
ORDER BY p.id, pr.nome
LIMIT 10;
`,
      erro: {
        codigo: r`
SELECT p.id, pr.nome
FROM itens_pedido i
JOIN pedidos p ON p.id = i.pedido_id
JOIN produtos pr ON pr.id = i.pedido_id
WHERE p.id = 1;
`,
        explicacao: "O segundo ON liga o produto pelo `pedido_id`, e não pelo `produto_id`. A consulta roda, mas traz produtos errados, sem erro nenhum. Confira cada ON: a chave estrangeira de um lado e a chave primária do outro.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Partindo de `itens_pedido`, quantos JOINs são necessários para mostrar o nome do fornecedor e o nome do produto de cada item?",
          opcoes: ["1", "2", "3", "4"],
          resposta: 2,
          dicas: ["O item conhece o pedido e o produto.", "O fornecedor está no pedido, não no item.", "Pedidos, fornecedores e produtos."],
          comentario: "itens_pedido → pedidos → fornecedores, mais itens_pedido → produtos: três JOINs.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "O pedido 3 é da Gama Logística e tem um único item: 4 unidades de Frete regional. Qual é o resultado?",
          codigo: r`
SELECT f.nome, pr.nome AS produto, i.qtd
FROM itens_pedido i
JOIN pedidos p ON p.id = i.pedido_id
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN produtos pr ON pr.id = i.produto_id
WHERE i.pedido_id = 3;
`,
          opcoes: ["nome | produto | qtd\nGama Logística | Frete regional | 4", "nome | nome | qtd\nGama Logística | Frete regional | 4", "nome | produto | qtd\nFrete regional | Gama Logística | 4", "produto | qtd\nFrete regional | 4"],
          resposta: 0,
          dicas: ["Três colunas, na ordem do SELECT.", "A segunda foi renomeada para `produto`.", "Primeiro o fornecedor, depois o produto."],
          comentario: "Sem o `AS produto`, haveria duas colunas chamadas `nome`. Por isso vale renomear.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete as condições de ligação.",
          codigo: r`
SELECT p.id, f.nome, pr.nome AS produto
FROM itens_pedido i
JOIN pedidos p ON p.id = i.___
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN produtos pr ON pr.id = i.___
WHERE p.id = 5;
`,
          respostas: [["pedido_id"], ["produto_id"]],
          testes: [[r`assert mesmo_resultado("SELECT p.id, f.nome, pr.nome FROM itens_pedido i JOIN pedidos p ON p.id = i.pedido_id JOIN fornecedores f ON f.id = p.fornecedor_id JOIN produtos pr ON pr.id = i.produto_id WHERE p.id = 5", ordem=False)`, "Devem vir os itens do pedido 5 com fornecedor e produto"]],
          dicas: ["Cada ON liga uma chave estrangeira de `itens_pedido`.", "Uma aponta para o pedido, a outra para o produto.", "`pedido_id` e `produto_id`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Liste os itens dos pedidos **aprovados** da compradora **Carla**, com as colunas `data`, `fornecedor`, `produto` e `qtd`, ordenados por data e produto.",
          inicial: r`
SELECT p.data,
`,
          testes: [
            [r`assert mesmo_resultado("SELECT p.data, f.nome, pr.nome, i.qtd FROM itens_pedido i JOIN pedidos p ON p.id = i.pedido_id JOIN fornecedores f ON f.id = p.fornecedor_id JOIN produtos pr ON pr.id = i.produto_id WHERE p.status = 'aprovado' AND p.comprador = 'Carla' ORDER BY p.data, pr.nome")`, "Os itens e a ordem devem estar corretos"],
            [r`assert _cols == ["data", "fornecedor", "produto", "qtd"], _cols`, "As colunas devem ser data, fornecedor, produto e qtd"],
          ],
          dicas: ["São três JOINs a partir de `itens_pedido`.", "Renomeie `f.nome AS fornecedor` e `pr.nome AS produto`.", "Filtre por status e comprador e ordene com `ORDER BY p.data, pr.nome`."],
          solucao: r`
SELECT p.data,
       f.nome  AS fornecedor,
       pr.nome AS produto,
       i.qtd
FROM itens_pedido i
JOIN pedidos p      ON p.id  = i.pedido_id
JOIN fornecedores f ON f.id  = p.fornecedor_id
JOIN produtos pr    ON pr.id = i.produto_id
WHERE p.status = 'aprovado'
  AND p.comprador = 'Carla'
ORDER BY p.data, pr.nome;
`,
        },
      ],
    },
    {
      id: "join-agregacao",
      titulo: "Junção com agregação",
      explicacao: [
        "A combinação mais comum em análise: juntar as tabelas e depois agrupar. Por exemplo, o gasto por fornecedor sai de `itens_pedido` + `pedidos` + `fornecedores`, com `GROUP BY f.nome`.",
        "Cuidado com a **granularidade**: depois de juntar pedidos com itens, cada linha é um item. `COUNT(*)` passa a contar itens. Para contar pedidos, use `COUNT(DISTINCT p.id)`.",
        "Agrupe pela chave e pelo nome (`GROUP BY f.id, f.nome`) para não misturar dois fornecedores que tenham o mesmo nome.",
      ],
      exemplo: r`
SELECT f.nome AS fornecedor,
       COUNT(DISTINCT p.id) AS pedidos,
       COUNT(*) AS itens,
       ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN itens_pedido i ON i.pedido_id = p.id
WHERE p.status = 'aprovado'
GROUP BY f.id, f.nome
ORDER BY gasto DESC;
`,
      erro: {
        codigo: r`
SELECT f.nome, SUM(i.qtd * i.preco_unit) AS gasto, SUM(1) AS linhas
FROM fornecedores f
JOIN pedidos p ON p.fornecedor_id = f.id
JOIN itens_pedido i ON i.pedido_id = p.id
JOIN produtos pr ON pr.categoria = f.categoria
GROUP BY f.nome;
`,
        explicacao: "O último JOIN liga produtos pela categoria, e não pelo `produto_id`. Cada item se multiplica por todos os produtos da categoria, e o gasto infla. Sempre que um total parecer grande demais, confira se algum JOIN está multiplicando linhas.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Pedidos por fornecedor: Alfa 6, Beta 6, Gama 4, Delta 5, Épsilon 5, Zeta 2, Eta 2 e Teta 0. Alfa, Beta e Épsilon são de SP; Gama e Eta, do RJ; Delta, de MG; Zeta, do PR; Teta, de SC. Qual é o resultado?",
          codigo: r`
SELECT f.uf, COUNT(*) AS pedidos
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
GROUP BY f.uf
ORDER BY f.uf;
`,
          opcoes: ["uf | pedidos\nMG | 5\nPR | 2\nRJ | 6\nSP | 17", "uf | pedidos\nMG | 5\nPR | 2\nRJ | 6\nSC | 0\nSP | 17", "uf | pedidos\nSP | 17\nRJ | 6\nMG | 5\nPR | 2", "uf | pedidos\nMG | 1\nPR | 1\nRJ | 2\nSP | 3"],
          resposta: 0,
          dicas: ["Some os pedidos dos fornecedores de cada UF.", "SP: 6 + 6 + 5.", "Com INNER JOIN, SC (sem pedidos) não aparece."],
          comentario: "Para incluir SC com 0, a consulta precisaria partir de fornecedores com LEFT JOIN.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Depois de `pedidos JOIN itens_pedido`, o que `COUNT(*)` conta num `GROUP BY` fornecedor?",
          opcoes: ["Os pedidos de cada fornecedor", "Os itens (linhas da junção) de cada fornecedor", "Os produtos diferentes", "Sempre 1"],
          resposta: 1,
          dicas: ["Um pedido com 3 itens vira 3 linhas na junção.", "`COUNT(*)` conta linhas.", "Para pedidos, seria `COUNT(DISTINCT p.id)`."],
          comentario: "Saber qual é a granularidade (o que cada linha representa) evita boa parte dos erros de relatório.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O relatório deveria mostrar a quantidade de **pedidos** e o gasto de cada fornecedor, mas a coluna `pedidos` está inflada. Corrija.",
          inicial: r`
SELECT f.nome, COUNT(*) AS pedidos, ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN itens_pedido i ON i.pedido_id = p.id
GROUP BY f.nome
ORDER BY gasto DESC;
`,
          testes: [[r`assert mesmo_resultado("SELECT f.nome, COUNT(DISTINCT p.id), ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id JOIN itens_pedido i ON i.pedido_id = p.id GROUP BY f.nome ORDER BY gasto DESC")`, "A contagem de pedidos não pode contar os itens"]],
          dicas: ["Depois do JOIN com itens, cada linha é um item.", "Conte só os pedidos diferentes.", "`COUNT(DISTINCT p.id)`."],
          solucao: r`
SELECT f.nome,
       COUNT(DISTINCT p.id) AS pedidos,      -- pedidos, não itens
       ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN itens_pedido i ON i.pedido_id = p.id
GROUP BY f.nome
ORDER BY gasto DESC;
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Calcule o gasto por **categoria de produto**, só com pedidos aprovados: colunas `categoria` e `gasto` (2 casas), do maior para o menor.",
          inicial: r`
SELECT pr.categoria,
`,
          testes: [[r`assert mesmo_resultado("SELECT pr.categoria, ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto FROM itens_pedido i JOIN produtos pr ON pr.id = i.produto_id JOIN pedidos p ON p.id = i.pedido_id WHERE p.status = 'aprovado' GROUP BY pr.categoria ORDER BY gasto DESC")`, "O gasto por categoria (só aprovados) deve estar correto e ordenado"]],
          dicas: ["A categoria está em `produtos`; o status, em `pedidos`.", "Junte `itens_pedido` com as duas tabelas.", "Filtre `p.status = 'aprovado'`, agrupe por `pr.categoria` e ordene por gasto."],
          solucao: r`
SELECT pr.categoria,
       ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto
FROM itens_pedido i
JOIN produtos pr ON pr.id = i.produto_id
JOIN pedidos p   ON p.id  = i.pedido_id
WHERE p.status = 'aprovado'
GROUP BY pr.categoria
ORDER BY gasto DESC;
`,
        },
      ],
    },
    {
      id: "conjuntos",
      titulo: "UNION, INTERSECT e EXCEPT",
      explicacao: [
        "Operações de conjunto combinam os resultados de duas consultas com as **mesmas colunas** (mesma quantidade e tipos compatíveis).",
        "- `UNION`: junta os dois resultados e remove as linhas repetidas. `UNION ALL` mantém as repetições e é mais rápido.",
        "- `INTERSECT`: o que está nos dois resultados. `EXCEPT`: o que está no primeiro e não está no segundo.",
        "O `ORDER BY` vai uma vez só, no final, e vale para o resultado combinado.",
      ],
      exemplo: r`
SELECT nome, 'fornecedor' AS tipo FROM fornecedores
UNION ALL
SELECT DISTINCT comprador, 'comprador' FROM pedidos
ORDER BY tipo, nome;

-- fornecedores (id) que nunca fizeram pedido
SELECT id FROM fornecedores
EXCEPT
SELECT fornecedor_id FROM pedidos;
`,
      erro: {
        codigo: r`
SELECT nome, uf FROM fornecedores
UNION
SELECT comprador FROM pedidos;
`,
        explicacao: "As duas consultas precisam devolver o mesmo número de colunas. A primeira tem 2 e a segunda tem 1: `SELECTs to the left and right of UNION do not have the same number of result columns`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre `UNION` e `UNION ALL`?",
          opcoes: ["Nenhuma", "`UNION` remove as linhas repetidas; `UNION ALL` mantém todas", "`UNION ALL` remove as repetidas", "`UNION` só funciona com uma coluna"],
          resposta: 1,
          dicas: ["Uma das duas faz um trabalho extra.", "Remover duplicadas exige comparar as linhas.", "`ALL` quer dizer \"todas\"."],
          comentario: "Se você sabe que não há repetições, ou quer mantê-las, prefira `UNION ALL`, que é mais barato.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Os fornecedores de limpeza são de SP e PR; os de papelaria, de MG e RJ. Qual é o resultado?",
          codigo: r`
SELECT uf FROM fornecedores WHERE categoria = 'limpeza'
UNION
SELECT uf FROM fornecedores WHERE categoria = 'papelaria'
ORDER BY uf;
`,
          opcoes: ["uf\nMG\nPR\nRJ\nSP", "uf\nSP\nPR\nMG\nRJ", "uf\nMG\nRJ", "uf\nMG\nPR\nRJ\nSP\nSP"],
          resposta: 0,
          dicas: ["Junte as UFs das duas consultas.", "O ORDER BY vale para o resultado final.", "Não há UF repetida aqui."],
          comentario: "Quatro UFs em ordem alfabética.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para encontrar os ids de fornecedores que nunca aparecem em pedidos.",
          codigo: r`
SELECT id FROM fornecedores
___
SELECT fornecedor_id FROM pedidos;
`,
          respostas: [["EXCEPT"]],
          testes: [[r`assert _rows == [(8,)], _rows`, "Deve vir só o fornecedor 8"]],
          dicas: ["É uma diferença de conjuntos.", "O que está no primeiro e não está no segundo.", "`EXCEPT`."],
          comentario: "Em outros bancos, `EXCEPT` também aparece como `MINUS` (Oracle).",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Monte uma lista única de contatos com as colunas `nome` e `tipo`: os nomes dos fornecedores (tipo `'fornecedor'`) e os compradores distintos (tipo `'comprador'`). Ordene por tipo e nome.",
          inicial: r`
SELECT nome, 'fornecedor' AS tipo FROM fornecedores
`,
          testes: [
            [r`assert mesmo_resultado("SELECT nome, 'fornecedor' AS tipo FROM fornecedores UNION SELECT comprador, 'comprador' FROM pedidos ORDER BY tipo, nome")`, "Devem vir 3 compradores e 8 fornecedores, ordenados por tipo e nome"],
            [r`assert _cols == ["nome", "tipo"], _cols`, "As colunas devem ser nome e tipo"],
          ],
          dicas: ["Uma consulta para cada tipo, com uma coluna fixa de texto.", "Junte com `UNION` (que já remove os compradores repetidos) ou use DISTINCT com `UNION ALL`.", "Termine com `ORDER BY tipo, nome`."],
          solucao: r`
SELECT nome, 'fornecedor' AS tipo FROM fornecedores
UNION                                   -- remove os compradores repetidos
SELECT comprador, 'comprador' FROM pedidos
ORDER BY tipo, nome;
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "gasto-todos",
      titulo: "Gasto por fornecedor, incluindo quem não vendeu",
      enunciado: [
        "A diretoria quer ver **todos os fornecedores cadastrados**, inclusive os que não venderam no semestre. Mostre `nome`, `pedidos` (quantidade de pedidos **aprovados**) e `gasto` (soma dos itens desses pedidos, 2 casas, com 0 quando não houver).",
        "Ordene pelo gasto (maior primeiro) e, no empate, pelo nome.",
      ],
      inicial: r`
SELECT f.nome,
`,
      testes: [[r`assert mesmo_resultado("SELECT f.nome, COUNT(DISTINCT p.id), ROUND(COALESCE(SUM(i.qtd * i.preco_unit), 0), 2) AS g FROM fornecedores f LEFT JOIN pedidos p ON p.fornecedor_id = f.id AND p.status = 'aprovado' LEFT JOIN itens_pedido i ON i.pedido_id = p.id GROUP BY f.id, f.nome ORDER BY g DESC, f.nome")`, "Os 8 fornecedores devem aparecer, com pedidos aprovados, gasto e a ordem corretos"]],
      dicas: ["Comece por `fornecedores` e use LEFT JOIN nas duas junções.", "O filtro de status vai no ON do JOIN com pedidos, não no WHERE.", "`COUNT(DISTINCT p.id)` para os pedidos e `COALESCE(SUM(...), 0)` para o gasto."],
      solucao: r`
SELECT f.nome,
       COUNT(DISTINCT p.id) AS pedidos,
       ROUND(COALESCE(SUM(i.qtd * i.preco_unit), 0), 2) AS gasto
FROM fornecedores f
LEFT JOIN pedidos p
       ON p.fornecedor_id = f.id
      AND p.status = 'aprovado'        -- no ON, para não perder ninguém
LEFT JOIN itens_pedido i ON i.pedido_id = p.id
GROUP BY f.id, f.nome
ORDER BY gasto DESC, f.nome;
`,
    },
    {
      id: "variacao-preco",
      titulo: "Preço pago × preço de referência",
      enunciado: [
        "Compare o preço pago com o preço de referência. Para cada combinação de fornecedor e produto em pedidos **aprovados**, mostre `fornecedor`, `produto`, `unidades` (soma de qtd), `preco_medio` (média de preco_unit, 2 casas), `preco_ref` e `variacao_pct`: quanto o preço médio pago ficou acima (+) ou abaixo (−) da referência, em %, com 1 casa.",
        "Ordene por fornecedor e produto.",
      ],
      inicial: r`
SELECT f.nome AS fornecedor,
`,
      testes: [
        [r`assert mesmo_resultado("SELECT f.nome, pr.nome, SUM(i.qtd), ROUND(AVG(i.preco_unit), 2), pr.preco_ref, ROUND((AVG(i.preco_unit) - pr.preco_ref) / pr.preco_ref * 100, 1) FROM itens_pedido i JOIN pedidos p ON p.id = i.pedido_id JOIN fornecedores f ON f.id = p.fornecedor_id JOIN produtos pr ON pr.id = i.produto_id WHERE p.status = 'aprovado' GROUP BY f.nome, pr.nome, pr.preco_ref ORDER BY f.nome, pr.nome")`, "Os valores por fornecedor e produto devem estar corretos"],
        [r`assert _cols == ["fornecedor", "produto", "unidades", "preco_medio", "preco_ref", "variacao_pct"], _cols`, "As colunas devem ser fornecedor, produto, unidades, preco_medio, preco_ref e variacao_pct"],
      ],
      dicas: ["São três JOINs a partir de `itens_pedido`, com filtro de status.", "Agrupe por fornecedor e produto (inclua `pr.preco_ref` no GROUP BY).", "`ROUND((AVG(i.preco_unit) - pr.preco_ref) / pr.preco_ref * 100, 1) AS variacao_pct`."],
      solucao: r`
SELECT f.nome  AS fornecedor,
       pr.nome AS produto,
       SUM(i.qtd) AS unidades,
       ROUND(AVG(i.preco_unit), 2) AS preco_medio,
       pr.preco_ref,
       ROUND((AVG(i.preco_unit) - pr.preco_ref) / pr.preco_ref * 100, 1) AS variacao_pct
FROM itens_pedido i
JOIN pedidos p      ON p.id  = i.pedido_id
JOIN fornecedores f ON f.id  = p.fornecedor_id
JOIN produtos pr    ON pr.id = i.produto_id
WHERE p.status = 'aprovado'
GROUP BY f.nome, pr.nome, pr.preco_ref
ORDER BY f.nome, pr.nome;
`,
      comentario: "Uma média simples de preço trata igual um item de 5 unidades e um de 500. Para negociar, vale também olhar o preço médio ponderado: `SUM(qtd * preco_unit) / SUM(qtd)`.",
    },
  ],
}));
