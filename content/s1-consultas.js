Ensaio.modulo((r) => ({
  id: "s1",
  trilha: "sql",
  ordem: 1,
  banco: "compras",
  titulo: "Consultas básicas",
  resumo: "SELECT, filtros com WHERE, IN, BETWEEN e LIKE, ordenação, LIMIT e o tratamento de NULL.",
  licoes: [
    {
      id: "select",
      titulo: "SELECT e FROM",
      explicacao: [
        "Toda consulta começa com `SELECT` (quais colunas) e `FROM` (de qual tabela): `SELECT nome, uf FROM fornecedores;`. O `*` traz todas as colunas.",
        "Dá para calcular colunas na hora e dar um nome a elas com `AS`: `SELECT nome, preco_ref * 1.1 AS preco_reajustado FROM produtos;`.",
        "`LIMIT n` mostra só as primeiras n linhas, o que ajuda a espiar uma tabela grande.",
        "O ponto e vírgula termina o comando. Palavras-chave podem ser escritas em maiúsculas ou minúsculas; a convenção é usar maiúsculas para facilitar a leitura.",
        "> No SQLite, dividir inteiro por inteiro dá inteiro: `7 / 2` é 3. Para ter 3.5, use `7 / 2.0` ou `7 * 1.0 / 2`.",
        "Neste módulo você consulta um banco fictício de compras. Abra o painel do banco abaixo para ver as tabelas e colunas.",
      ],
      exemplo: r`
SELECT * FROM fornecedores;

-- só algumas colunas, com uma coluna calculada
SELECT nome, preco_ref, ROUND(preco_ref * 1.1, 2) AS reajustado
FROM produtos
LIMIT 5;
`,
      erro: {
        codigo: r`
SELECT nome preco_ref
FROM produtos;
`,
        explicacao: "Faltou a vírgula entre as colunas. O SQL entende `preco_ref` como um **apelido** para `nome`: a consulta roda, mas devolve uma coluna só, chamada `preco_ref` e cheia de nomes. Separe as colunas com vírgula.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual consulta traz só o nome e a UF de todos os fornecedores?",
          opcoes: ["`SELECT * FROM fornecedores;`", "`SELECT nome, uf FROM fornecedores;`", "`SELECT nome uf FROM fornecedores;`", "`FROM fornecedores SELECT nome, uf;`"],
          resposta: 1,
          dicas: ["O `*` traz todas as colunas.", "Sem vírgula, a segunda palavra vira apelido.", "A ordem é SELECT, depois FROM."],
          comentario: "As colunas vêm separadas por vírgula, e o `SELECT` sempre vem antes do `FROM`.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "O produto de id 3 é a Fita adesiva, com preço de referência 2.1. Qual é o resultado?",
          codigo: r`
SELECT nome, preco_ref * 2 AS dobro
FROM produtos
WHERE id = 3;
`,
          opcoes: ["nome | dobro\nFita adesiva | 4.2", "nome | preco_ref\nFita adesiva | 2.1", "dobro\n4.2", "nome | dobro\nFita adesiva | 2.1"],
          resposta: 0,
          dicas: ["Quantas colunas o SELECT pede?", "A segunda coluna é calculada e renomeada.", "2.1 × 2."],
          comentario: "Duas colunas: `nome` e a coluna calculada, que recebeu o nome `dobro`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para listar o nome e o preço de referência dos produtos, com a segunda coluna chamada `preco`.",
          codigo: r`
SELECT nome, preco_ref ___ preco
FROM ___;
`,
          respostas: [["AS"], ["produtos"]],
          testes: [
            [r`assert mesmo_resultado("SELECT nome, preco_ref AS preco FROM produtos")`, "O resultado deve ter o nome e o preço de todos os produtos"],
            [r`assert _cols == ["nome", "preco"], _cols`, "As colunas devem se chamar nome e preco"],
          ],
          dicas: ["A primeira lacuna renomeia a coluna.", "A segunda é a tabela.", "`AS` e `produtos`."],
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "Liste o nome, o preço de referência e o preço com 10% de reajuste de **todos** os produtos. A terceira coluna deve se chamar `preco_reajustado` e ser arredondada com `ROUND(..., 2)`.",
          inicial: r`
-- escreva sua consulta aqui
`,
          testes: [
            [r`assert mesmo_resultado("SELECT nome, preco_ref, ROUND(preco_ref * 1.1, 2) FROM produtos")`, "Os valores devem ser nome, preço e preço × 1.1 arredondado"],
            [r`assert _cols[2] == "preco_reajustado", _cols`, "A terceira coluna deve se chamar `preco_reajustado`"],
          ],
          dicas: ["São três colunas no SELECT, separadas por vírgula.", "O reajuste é `preco_ref * 1.1`.", "`ROUND(preco_ref * 1.1, 2) AS preco_reajustado`."],
          solucao: r`
SELECT nome,
       preco_ref,
       ROUND(preco_ref * 1.1, 2) AS preco_reajustado  -- coluna calculada e renomeada
FROM produtos;
`,
        },
      ],
    },
    {
      id: "where",
      titulo: "Filtrar com WHERE",
      explicacao: [
        "`WHERE` filtra as linhas antes de mostrar: `SELECT nome FROM fornecedores WHERE uf = 'SP';`.",
        "Comparações: `=`, `<>` (diferente), `>`, `<`, `>=`, `<=`. Textos vão entre **aspas simples**; números, sem aspas. Decimais usam ponto: `8.5`.",
        "Combine condições com `AND` (as duas) e `OR` (pelo menos uma), e negue com `NOT`.",
        "O `AND` tem precedência sobre o `OR`. Use parênteses sempre que misturar os dois: `WHERE (uf = 'SP' OR uf = 'RJ') AND ativo = 1`.",
      ],
      exemplo: r`
SELECT nome, uf, nota
FROM fornecedores
WHERE uf = 'SP';

SELECT id, data, status
FROM pedidos
WHERE status <> 'aprovado' AND comprador = 'Bruno';
`,
      erro: {
        codigo: r`
SELECT nome FROM fornecedores WHERE uf = SP;
`,
        explicacao: "Sem aspas, `SP` é lido como o nome de uma coluna, e ela não existe: `no such column: SP`. Textos sempre entre aspas simples: `'SP'`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Os fornecedores do RJ são a Gama Logística (id 3) e a Eta Gráfica (id 7). Qual é o resultado?",
          codigo: r`
SELECT nome FROM fornecedores WHERE uf = 'RJ';
`,
          opcoes: ["nome\nGama Logística\nEta Gráfica", "nome | uf\nGama Logística | RJ\nEta Gráfica | RJ", "nome\nGama Logística", "(nenhuma linha)"],
          resposta: 0,
          dicas: ["Só a coluna `nome` foi pedida.", "Os dois fornecedores do RJ passam no filtro.", "Sem ORDER BY, o SQLite costuma devolver na ordem em que as linhas foram inseridas."],
          comentario: "Uma coluna e duas linhas. Para garantir a ordem, sempre use `ORDER BY` (lição 4).",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Qual filtro traz fornecedores de SP **ou** RJ que estejam ativos?",
          opcoes: ["`WHERE uf = 'SP' OR uf = 'RJ' AND ativo = 1`", "`WHERE (uf = 'SP' OR uf = 'RJ') AND ativo = 1`", "`WHERE uf = 'SP' AND 'RJ' AND ativo = 1`", "`WHERE uf = 'SP', 'RJ' AND ativo = 1`"],
          resposta: 1,
          dicas: ["`AND` é avaliado antes de `OR`.", "Na primeira opção, o `ativo = 1` só vale para o RJ.", "Os parênteses agrupam as duas UFs."],
          comentario: "Sem parênteses, a primeira opção traz todos de SP (ativos ou não) e só os ativos do RJ.",
        },
        {
          tipo: "corrigir", nivel: 1,
          enunciado: "A consulta deveria trazer o nome e a nota dos fornecedores **ativos** com nota acima de 8,5, mas dá erro. Corrija.",
          inicial: r`
SELECT nome, nota
FROM fornecedores
WHERE ativo = 1 AND nota > 8,5;
`,
          testes: [[r`assert mesmo_resultado("SELECT nome, nota FROM fornecedores WHERE ativo = 1 AND nota > 8.5")`, "Devem vir Alfa Embalagens, Beta Insumos e Gama Logística"]],
          dicas: ["Leia o erro: o problema está perto da vírgula.", "Em SQL, a vírgula separa colunas.", "Decimais usam ponto: `8.5`."],
          solucao: r`
SELECT nome, nota
FROM fornecedores
WHERE ativo = 1 AND nota > 8.5;   -- decimal com ponto
`,
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "Liste o id, a data e o fornecedor_id dos pedidos **aprovados** feitos pela compradora **Ana**.",
          inicial: r`
SELECT
`,
          testes: [[r`assert mesmo_resultado("SELECT id, data, fornecedor_id FROM pedidos WHERE status = 'aprovado' AND comprador = 'Ana'", ordem=False)`, "Devem vir os pedidos aprovados da Ana, com id, data e fornecedor_id"]],
          dicas: ["A tabela é `pedidos`.", "São duas condições ao mesmo tempo.", "`WHERE status = 'aprovado' AND comprador = 'Ana'`."],
          solucao: r`
SELECT id, data, fornecedor_id
FROM pedidos
WHERE status = 'aprovado'
  AND comprador = 'Ana';
`,
        },
      ],
    },
    {
      id: "in-between-like",
      titulo: "IN, BETWEEN e LIKE",
      explicacao: [
        "`IN (...)` testa se o valor está numa lista: `WHERE uf IN ('SP', 'MG')`. É o mesmo que vários `OR`.",
        "`BETWEEN a AND b` testa um intervalo **incluindo** as pontas: `WHERE preco_ref BETWEEN 5 AND 20`. Funciona com datas no formato `'AAAA-MM-DD'`.",
        "`LIKE` busca por padrão de texto: `%` vale qualquer sequência (inclusive vazia) e `_` vale exatamente um caractere. `'Caixa%'` começa com Caixa; `'%adesiva%'` contém adesiva.",
        "Todos aceitam `NOT`: `NOT IN`, `NOT BETWEEN`, `NOT LIKE`.",
      ],
      exemplo: r`
SELECT nome, uf FROM fornecedores WHERE uf IN ('SP', 'MG');

SELECT nome, preco_ref FROM produtos WHERE preco_ref BETWEEN 5 AND 20;

SELECT nome FROM produtos WHERE nome LIKE 'Caixa%';

SELECT id, data FROM pedidos WHERE data BETWEEN '2024-02-01' AND '2024-02-29';
`,
      erro: {
        codigo: r`
SELECT nome FROM fornecedores WHERE nome LIKE 'épsilon%';
`,
        explicacao: "No SQLite, o `LIKE` ignora maiúsculas só nas letras sem acento. `'é'` e `'É'` são diferentes, e a busca não encontra nada. Use a grafia exata (`'Épsilon%'`) ou compare com `lower()` dos dois lados, tomando cuidado com os acentos.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Os preços de referência dos produtos 1 a 6 são 3.5, 5.2, 2.1, 18.9, 9.8 e 0.85; os demais custam mais de 20. Qual é o resultado?",
          codigo: r`
SELECT nome FROM produtos WHERE preco_ref BETWEEN 5 AND 20;
`,
          opcoes: ["nome\nCaixa M\nDetergente 5L\nÁlcool 70%", "nome\nDetergente 5L\nÁlcool 70%", "nome\nCaixa M\nDetergente 5L\nÁlcool 70%\nPapel A4", "nome\nCaixa P\nCaixa M"],
          resposta: 0,
          dicas: ["Quais preços ficam entre 5 e 20?", "5.2, 18.9 e 9.8.", "Os produtos 2, 4 e 5."],
          comentario: "`BETWEEN` inclui as pontas: um produto de exatamente 5 ou 20 também entraria.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual padrão de `LIKE` encontra nomes que **começam** com 'Caixa'?",
          opcoes: ["`LIKE 'Caixa'`", "`LIKE 'Caixa%'`", "`LIKE '%Caixa'`", "`LIKE '_Caixa'`"],
          resposta: 1,
          dicas: ["Sem curinga, o LIKE compara o texto inteiro.", "`%` no fim aceita qualquer coisa depois.", "`%` no começo aceita qualquer coisa antes."],
          comentario: "`'Caixa%'` aceita 'Caixa P', 'Caixa M' e 'Caixa G'.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para trazer os fornecedores de SP, MG ou PR.",
          codigo: r`
SELECT nome, uf
FROM fornecedores
WHERE uf ___ ('SP', 'MG', 'PR');
`,
          respostas: [["IN"]],
          testes: [[r`assert mesmo_resultado("SELECT nome, uf FROM fornecedores WHERE uf IN ('SP', 'MG', 'PR')", ordem=False)`, "Devem vir os fornecedores das três UFs"]],
          dicas: ["É um operador para listas.", "Equivale a `uf = 'SP' OR uf = 'MG' OR uf = 'PR'`.", "`IN`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Liste id, data e status dos pedidos do **1º trimestre de 2024** (de 2024-01-01 a 2024-03-31) que **não** foram cancelados.",
          inicial: r`
SELECT id, data, status
FROM pedidos
`,
          testes: [[r`assert mesmo_resultado("SELECT id, data, status FROM pedidos WHERE data BETWEEN '2024-01-01' AND '2024-03-31' AND status <> 'cancelado'", ordem=False)`, "Devem vir os pedidos de janeiro a março, sem os cancelados"]],
          dicas: ["Use `BETWEEN` com as datas entre aspas.", "Junte com `AND` uma segunda condição para o status.", "`status <> 'cancelado'` ou `status NOT IN ('cancelado')`."],
          solucao: r`
SELECT id, data, status
FROM pedidos
WHERE data BETWEEN '2024-01-01' AND '2024-03-31'   -- datas ISO comparam bem como texto
  AND status <> 'cancelado';
`,
        },
      ],
    },
    {
      id: "ordenar",
      titulo: "ORDER BY, LIMIT e DISTINCT",
      explicacao: [
        "`ORDER BY coluna` ordena o resultado: `ASC` (crescente, o padrão) ou `DESC` (decrescente). Com várias colunas, a segunda desempata a primeira: `ORDER BY nota DESC, nome`.",
        "**Sem ORDER BY, a ordem não é garantida.** Sempre ordene quando a ordem importa.",
        "`LIMIT n` corta nas n primeiras linhas, e `OFFSET k` pula as k primeiras. Com `ORDER BY`, isso responde perguntas de \"top N\" e monta paginação.",
        "`SELECT DISTINCT` remove as linhas repetidas do resultado: `SELECT DISTINCT uf FROM fornecedores;`.",
        "A ordem das cláusulas é fixa: `SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...`.",
      ],
      exemplo: r`
SELECT nome, preco_ref
FROM produtos
ORDER BY preco_ref DESC
LIMIT 3;

SELECT DISTINCT comprador FROM pedidos ORDER BY comprador;

SELECT nome, uf, nota FROM fornecedores ORDER BY uf, nota DESC;
`,
      erro: {
        codigo: r`
SELECT nome, preco_ref
FROM produtos
ORDER BY preco_ref
WHERE categoria = 'limpeza';
`,
        explicacao: "As cláusulas estão fora de ordem: o `WHERE` precisa vir antes do `ORDER BY`. O erro é `near \"WHERE\": syntax error`. A ordem é SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "As notas são: Alfa 9.1, Gama 9.1, Beta 8.7, Épsilon 8.4, Teta 8.0, Delta 7.9, Zeta 6.5 e Eta sem nota (NULL). No SQLite, NULL vem por último numa ordenação decrescente. Qual é o resultado?",
          codigo: r`
SELECT nome, nota
FROM fornecedores
ORDER BY nota DESC, nome
LIMIT 3;
`,
          opcoes: ["nome | nota\nAlfa Embalagens | 9.1\nGama Logística | 9.1\nBeta Insumos | 8.7", "nome | nota\nGama Logística | 9.1\nAlfa Embalagens | 9.1\nBeta Insumos | 8.7", "nome | nota\nEta Gráfica | NULL\nAlfa Embalagens | 9.1\nGama Logística | 9.1", "nome | nota\nAlfa Embalagens | 9.1\nGama Logística | 9.1"],
          resposta: 0,
          dicas: ["Primeiro pela nota, da maior para a menor.", "No empate em 9.1, o nome desempata em ordem alfabética.", "LIMIT 3 corta na terceira linha."],
          comentario: "Alfa e Gama empatam com 9.1; 'Alfa' vem antes de 'Gama'. Depois vem a Beta, com 8.7.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Há 8 fornecedores em 5 UFs diferentes. O que `SELECT DISTINCT uf FROM fornecedores;` devolve?",
          opcoes: ["8 linhas, uma por fornecedor", "5 linhas, uma para cada UF diferente", "Só a primeira UF", "A quantidade de UFs, num único número"],
          resposta: 1,
          dicas: ["`DISTINCT` remove as repetições.", "Cada UF aparece uma vez.", "Para contar, seria `COUNT(DISTINCT uf)`."],
          comentario: "`DISTINCT` atua sobre a linha inteira do resultado. Com duas colunas, remove só as combinações repetidas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para mostrar os 3 produtos **mais caros**.",
          codigo: r`
SELECT nome, preco_ref
FROM produtos
ORDER BY preco_ref ___
LIMIT ___;
`,
          respostas: [["DESC"], ["3"]],
          testes: [[r`assert mesmo_resultado("SELECT nome, preco_ref FROM produtos ORDER BY preco_ref DESC LIMIT 3")`, "Devem vir Monitor, Cadeira e Frete regional"]],
          dicas: ["Mais caro primeiro: ordem decrescente.", "Quantas linhas você quer?", "`DESC` e `3`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Uma tela mostra os pedidos 10 por página, ordenados por data (e por id, para desempatar). Traga a **página 2**, ou seja, do 11º ao 20º pedido, com id e data. Use `LIMIT` e `OFFSET`.",
          inicial: r`
SELECT id, data
FROM pedidos
`,
          testes: [
            [r`assert mesmo_resultado("SELECT id, data FROM pedidos ORDER BY data, id LIMIT 10 OFFSET 10")`, "Devem vir os pedidos da 11ª à 20ª posição"],
            [r`assert "offset" in _src.lower()`, "Use OFFSET"],
          ],
          dicas: ["Primeiro ordene: `ORDER BY data, id`.", "Cada página tem 10 linhas.", "A página 2 pula as 10 primeiras: `LIMIT 10 OFFSET 10`."],
          solucao: r`
SELECT id, data
FROM pedidos
ORDER BY data, id      -- id desempata pedidos do mesmo dia
LIMIT 10 OFFSET 10;    -- página 2: pula 10, mostra 10
`,
        },
      ],
    },
    {
      id: "null",
      titulo: "Valores nulos (NULL)",
      explicacao: [
        "`NULL` representa a **ausência** de valor: um fornecedor sem nota, um pedido ainda sem data de entrega. Não é zero nem texto vazio.",
        "Qualquer comparação com NULL dá \"desconhecido\", e não verdadeiro. Por isso `WHERE nota = NULL` nunca encontra nada. Use `IS NULL` e `IS NOT NULL`.",
        "Contas com NULL resultam em NULL: `NULL + 1` é NULL.",
        "`COALESCE(a, b, ...)` devolve o primeiro valor não nulo. É ótimo para substituir ausentes: `COALESCE(nota, 0)`, `COALESCE(data_entrega, 'aguardando')`.",
        "> Cuidado: `WHERE nota <> 9.1` também descarta as linhas com nota NULL.",
      ],
      exemplo: r`
SELECT nome, nota FROM fornecedores WHERE nota IS NULL;

SELECT id, status, data_entrega,
       COALESCE(data_entrega, 'aguardando') AS situacao
FROM pedidos
WHERE status <> 'aprovado';

SELECT NULL + 1 AS soma, COALESCE(NULL, 'padrão') AS texto;
`,
      erro: {
        codigo: r`
-- queria todos os fornecedores com nota diferente de 9.1
SELECT nome, nota FROM fornecedores WHERE nota <> 9.1;
`,
        explicacao: "A Eta Gráfica, que não tem nota, sumiu do resultado: `NULL <> 9.1` é \"desconhecido\", não verdadeiro. Se ela deve aparecer, escreva `WHERE nota <> 9.1 OR nota IS NULL`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "No RJ estão a Gama Logística (nota 9.1) e a Eta Gráfica (nota NULL). Qual é o resultado?",
          codigo: r`
SELECT nome, COALESCE(nota, 0) AS nota
FROM fornecedores
WHERE uf = 'RJ';
`,
          opcoes: ["nome | nota\nGama Logística | 9.1\nEta Gráfica | 0", "nome | nota\nGama Logística | 9.1\nEta Gráfica | NULL", "nome | nota\nGama Logística | 9.1", "nome | nota\nGama Logística | 0\nEta Gráfica | 0"],
          resposta: 0,
          dicas: ["COALESCE devolve o primeiro valor que não é NULL.", "Para a Gama, a nota existe.", "Para a Eta, a nota é NULL, então vem o 0."],
          comentario: "`COALESCE(nota, 0)` só troca os nulos. As outras notas ficam como estão.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que `WHERE nota = NULL` não traz nenhuma linha, nem a da Eta Gráfica?",
          opcoes: ["Porque não existem notas nulas", "Porque comparar com NULL dá \"desconhecido\", nunca verdadeiro; o certo é `IS NULL`", "Porque NULL precisa ficar entre aspas", "Porque o SQLite não aceita NULL"],
          resposta: 1,
          dicas: ["NULL não é um valor comum.", "`NULL = NULL` também não é verdadeiro.", "Existe um operador próprio para testar ausência."],
          comentario: "`'NULL'` entre aspas seria o texto N-U-L-L, que é outra coisa.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para encontrar os fornecedores **sem** nota.",
          codigo: r`
SELECT nome
FROM fornecedores
WHERE nota ___ ___;
`,
          respostas: [["IS"], ["NULL"]],
          testes: [[r`assert mesmo_resultado("SELECT nome FROM fornecedores WHERE nota IS NULL")`, "Deve vir a Eta Gráfica"]],
          dicas: ["Não é `=`.", "São duas palavras.", "`IS NULL`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Liste os pedidos de **março de 2024** com as colunas `id`, `status` e `entrega`. A coluna `entrega` mostra a data de entrega ou o texto `'sem entrega'` quando ela for nula.",
          inicial: r`
SELECT
`,
          testes: [
            [r`assert mesmo_resultado("SELECT id, status, COALESCE(data_entrega, 'sem entrega') FROM pedidos WHERE data LIKE '2024-03%'", ordem=False)`, "Devem vir os pedidos de março, com a data de entrega ou 'sem entrega'"],
            [r`assert _cols == ["id", "status", "entrega"], _cols`, "As colunas devem ser id, status e entrega"],
          ],
          dicas: ["Para março: `data LIKE '2024-03%'` ou `BETWEEN '2024-03-01' AND '2024-03-31'`.", "Para trocar o NULL por texto, use COALESCE.", "`COALESCE(data_entrega, 'sem entrega') AS entrega`."],
          solucao: r`
SELECT id,
       status,
       COALESCE(data_entrega, 'sem entrega') AS entrega
FROM pedidos
WHERE data LIKE '2024-03%';
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "homologados",
      titulo: "Fornecedores homologados",
      enunciado: [
        "O setor de compras quer a lista de fornecedores homologados para uma concorrência: **ativos**, com **nota de 8 para cima** e localizados em **SP, RJ ou SC**.",
        "Mostre `nome`, `uf` e `nota`, ordenados pela nota (maior primeiro) e, no empate, pelo nome.",
      ],
      inicial: r`
SELECT nome, uf, nota
FROM fornecedores
`,
      testes: [[r`assert mesmo_resultado("SELECT nome, uf, nota FROM fornecedores WHERE ativo = 1 AND nota >= 8 AND uf IN ('SP', 'RJ', 'SC') ORDER BY nota DESC, nome")`, "Devem vir Alfa, Gama, Beta, Épsilon e Teta, nessa ordem"]],
      dicas: ["São três condições ligadas por AND.", "Para as UFs, use `IN`.", "Ordene com `ORDER BY nota DESC, nome`."],
      solucao: r`
SELECT nome, uf, nota
FROM fornecedores
WHERE ativo = 1
  AND nota >= 8              -- NULL não passa aqui (nem deveria)
  AND uf IN ('SP', 'RJ', 'SC')
ORDER BY nota DESC, nome;
`,
    },
    {
      id: "acompanhamento",
      titulo: "Acompanhamento do 2º trimestre",
      enunciado: [
        "Monte o relatório de acompanhamento dos pedidos de **abril a junho de 2024** que **não** foram cancelados.",
        "Colunas: `pedido` (o id), `data`, `comprador` e `situacao`, que mostra a data de entrega ou `'aguardando entrega'` quando ela ainda não existe. Ordene do pedido mais recente para o mais antigo.",
      ],
      inicial: r`
SELECT
`,
      testes: [
        [r`assert mesmo_resultado("SELECT id, data, comprador, COALESCE(data_entrega, 'aguardando entrega') FROM pedidos WHERE data BETWEEN '2024-04-01' AND '2024-06-30' AND status <> 'cancelado' ORDER BY data DESC")`, "O conteúdo e a ordem devem estar corretos"],
        [r`assert _cols == ["pedido", "data", "comprador", "situacao"], _cols`, "As colunas devem ser pedido, data, comprador e situacao"],
      ],
      dicas: ["Renomeie `id AS pedido`.", "O período é `BETWEEN '2024-04-01' AND '2024-06-30'`; acrescente o filtro de status.", "`COALESCE(data_entrega, 'aguardando entrega') AS situacao` e `ORDER BY data DESC`."],
      solucao: r`
SELECT id AS pedido,
       data,
       comprador,
       COALESCE(data_entrega, 'aguardando entrega') AS situacao
FROM pedidos
WHERE data BETWEEN '2024-04-01' AND '2024-06-30'
  AND status <> 'cancelado'
ORDER BY data DESC;
`,
    },
  ],
}));
