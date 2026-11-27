Ensaio.modulo((r) => ({
  id: "s2",
  trilha: "sql",
  ordem: 2,
  banco: "compras",
  titulo: "Agregação",
  resumo: "COUNT, SUM e AVG, GROUP BY, HAVING, CASE WHEN e funções de data.",
  licoes: [
    {
      id: "agregacoes",
      titulo: "Funções de agregação",
      explicacao: [
        "Funções de agregação resumem muitas linhas num valor: `COUNT`, `SUM`, `AVG`, `MIN` e `MAX`.",
        "`COUNT(*)` conta linhas; `COUNT(coluna)` conta só os valores **não nulos**; `COUNT(DISTINCT coluna)` conta os valores diferentes.",
        "`SUM` e `AVG` ignoram os NULL. Combine com contas: `SUM(qtd * preco_unit)` é o gasto total dos itens.",
        "Arredonde na saída com `ROUND(valor, 2)`.",
      ],
      exemplo: r`
SELECT COUNT(*) AS pedidos,
       COUNT(data_entrega) AS entregues,
       COUNT(DISTINCT comprador) AS compradores
FROM pedidos;

SELECT ROUND(AVG(preco_ref), 2) AS preco_medio,
       MIN(preco_ref) AS menor,
       MAX(preco_ref) AS maior
FROM produtos;

SELECT ROUND(SUM(qtd * preco_unit), 2) AS gasto_total FROM itens_pedido;
`,
      erro: {
        codigo: r`
-- média de unidades por item
SELECT SUM(qtd) / COUNT(*) AS media FROM itens_pedido;
`,
        explicacao: "Os dois lados são inteiros, então o SQLite faz divisão inteira e corta as casas decimais. Use `AVG(qtd)` ou force o decimal: `SUM(qtd) * 1.0 / COUNT(*)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Há 8 fornecedores, e só a Eta Gráfica não tem nota. Qual é o resultado?",
          codigo: r`
SELECT COUNT(*) AS total, COUNT(nota) AS com_nota FROM fornecedores;
`,
          opcoes: ["total | com_nota\n8 | 7", "total | com_nota\n8 | 8", "total | com_nota\n7 | 7", "total\n8"],
          resposta: 0,
          dicas: ["`COUNT(*)` conta linhas.", "`COUNT(coluna)` ignora NULL.", "Uma nota é nula."],
          comentario: "`COUNT(nota)` deixa a Eta Gráfica de fora porque a nota dela é NULL.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre `COUNT(*)` e `COUNT(data_entrega)` na tabela de pedidos?",
          opcoes: ["Nenhuma", "`COUNT(data_entrega)` conta só os pedidos que têm data de entrega", "`COUNT(*)` ignora os nulos", "`COUNT(data_entrega)` soma as datas"],
          resposta: 1,
          dicas: ["Qual das duas olha para uma coluna específica?", "Pedidos não entregues têm `data_entrega` NULL.", "`COUNT(coluna)` ignora NULL."],
          comentario: "Pedidos pendentes e cancelados não têm data de entrega, então ficam fora de `COUNT(data_entrega)`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para mostrar o maior e o menor preço de referência.",
          codigo: r`
SELECT ___(preco_ref) AS mais_caro,
       ___(preco_ref) AS mais_barato
FROM produtos;
`,
          respostas: [["MAX"], ["MIN"]],
          testes: [[r`assert mesmo_resultado("SELECT MAX(preco_ref), MIN(preco_ref) FROM produtos")`, "Devem vir 980.0 e 0.85"]],
          dicas: ["São duas funções de agregação.", "Uma pega o maior valor, a outra o menor.", "`MAX` e `MIN`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Na tabela `itens_pedido`, calcule numa linha: `itens` (quantidade de linhas), `unidades` (soma de `qtd`) e `gasto` (soma de `qtd * preco_unit`, arredondada em 2 casas).",
          inicial: r`
SELECT
`,
          testes: [
            [r`assert mesmo_resultado("SELECT COUNT(*), SUM(qtd), ROUND(SUM(qtd * preco_unit), 2) FROM itens_pedido")`, "Os três valores devem estar corretos"],
            [r`assert _cols == ["itens", "unidades", "gasto"], _cols`, "As colunas devem ser itens, unidades e gasto"],
          ],
          dicas: ["São três agregações no mesmo SELECT.", "`COUNT(*)`, `SUM(qtd)`...", "`ROUND(SUM(qtd * preco_unit), 2) AS gasto`."],
          solucao: r`
SELECT COUNT(*)                          AS itens,
       SUM(qtd)                          AS unidades,
       ROUND(SUM(qtd * preco_unit), 2)   AS gasto
FROM itens_pedido;
`,
        },
      ],
    },
    {
      id: "group-by",
      titulo: "GROUP BY",
      explicacao: [
        "`GROUP BY` separa as linhas em grupos e aplica as agregações em cada um: `SELECT status, COUNT(*) FROM pedidos GROUP BY status;`.",
        "Regra de ouro: toda coluna do SELECT que **não** está dentro de uma agregação precisa estar no `GROUP BY`.",
        "Dá para agrupar por várias colunas (`GROUP BY comprador, status`) e ordenar pelo resultado agregado (`ORDER BY pedidos DESC`).",
        "> O SQLite aceita colunas soltas fora do GROUP BY e devolve um valor qualquer do grupo. Outros bancos (PostgreSQL, SQL Server) dão erro. Não conte com esse comportamento.",
      ],
      exemplo: r`
SELECT status, COUNT(*) AS pedidos
FROM pedidos
GROUP BY status;

SELECT comprador, status, COUNT(*) AS pedidos
FROM pedidos
GROUP BY comprador, status
ORDER BY comprador, status;

SELECT pedido_id, ROUND(SUM(qtd * preco_unit), 2) AS gasto
FROM itens_pedido
GROUP BY pedido_id
ORDER BY gasto DESC
LIMIT 5;
`,
      erro: {
        codigo: r`
SELECT comprador, data, COUNT(*) AS pedidos
FROM pedidos
GROUP BY comprador;
`,
        explicacao: "`data` não está no GROUP BY nem dentro de uma agregação. Cada comprador tem 10 datas diferentes, e o SQLite mostra uma delas sem critério. Em outros bancos isso é erro. Agregue (`MAX(data) AS ultimo_pedido`) ou inclua a coluna no GROUP BY.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Dos 30 pedidos, 3 foram cancelados e 4 estão pendentes. Qual é o resultado?",
          codigo: r`
SELECT status, COUNT(*) AS n
FROM pedidos
GROUP BY status
ORDER BY status;
`,
          opcoes: ["status | n\naprovado | 23\ncancelado | 3\npendente | 4", "status | n\naprovado | 30", "status | n\npendente | 4\ncancelado | 3\naprovado | 23", "n\n23\n3\n4"],
          resposta: 0,
          dicas: ["Um grupo por status.", "Os aprovados são o que sobra: 30 − 3 − 4.", "Ordenado por status em ordem alfabética."],
          comentario: "Três grupos, ordenados alfabeticamente: aprovado, cancelado, pendente.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Qual é o problema em `SELECT comprador, status, COUNT(*) FROM pedidos GROUP BY comprador;`?",
          opcoes: ["Nenhum", "`status` não está no GROUP BY nem agregado, então o valor mostrado é arbitrário", "`COUNT(*)` não pode ser usado com GROUP BY", "Falta um ORDER BY"],
          resposta: 1,
          dicas: ["Quantos status diferentes cada comprador tem?", "O grupo é só por comprador.", "Qual status o banco deveria mostrar?"],
          comentario: "Para contar por comprador **e** status, agrupe pelas duas colunas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para contar os pedidos de cada fornecedor.",
          codigo: r`
SELECT fornecedor_id, COUNT(*) AS pedidos
FROM pedidos
___ ___ fornecedor_id
ORDER BY pedidos DESC, fornecedor_id;
`,
          respostas: [["GROUP"], ["BY"]],
          testes: [[r`assert mesmo_resultado("SELECT fornecedor_id, COUNT(*) AS pedidos FROM pedidos GROUP BY fornecedor_id ORDER BY pedidos DESC, fornecedor_id")`, "Deve vir um total por fornecedor"]],
          dicas: ["É a cláusula de agrupamento.", "São duas palavras.", "`GROUP BY`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Calcule o gasto de cada pedido a partir de `itens_pedido`: colunas `pedido_id` e `gasto` (soma de `qtd * preco_unit`, arredondada em 2 casas). Mostre só os **5 maiores**, do maior para o menor.",
          inicial: r`
SELECT pedido_id,
`,
          testes: [[r`assert mesmo_resultado("SELECT pedido_id, ROUND(SUM(qtd * preco_unit), 2) AS gasto FROM itens_pedido GROUP BY pedido_id ORDER BY gasto DESC LIMIT 5")`, "Devem vir os 5 pedidos de maior gasto, em ordem decrescente"]],
          dicas: ["Agrupe por `pedido_id`.", "Ordene pela coluna calculada: `ORDER BY gasto DESC`.", "Termine com `LIMIT 5`."],
          solucao: r`
SELECT pedido_id,
       ROUND(SUM(qtd * preco_unit), 2) AS gasto
FROM itens_pedido
GROUP BY pedido_id
ORDER BY gasto DESC     -- dá para ordenar pelo apelido
LIMIT 5;
`,
        },
      ],
    },
    {
      id: "having",
      titulo: "HAVING",
      explicacao: [
        "`WHERE` filtra **linhas**, antes do agrupamento. `HAVING` filtra **grupos**, depois do agrupamento, e por isso aceita agregações.",
        "Exemplo: fornecedores com 5 pedidos ou mais: `GROUP BY fornecedor_id HAVING COUNT(*) >= 5`.",
        "Os dois podem aparecer juntos: o WHERE escolhe quais linhas entram nos grupos e o HAVING escolhe quais grupos aparecem.",
        "A ordem de execução ajuda a entender: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
      ],
      exemplo: r`
SELECT fornecedor_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY fornecedor_id
HAVING COUNT(*) >= 5;

-- só pedidos aprovados entram; só compradores com mais de 7 aparecem
SELECT comprador, COUNT(*) AS aprovados
FROM pedidos
WHERE status = 'aprovado'
GROUP BY comprador
HAVING COUNT(*) > 7;
`,
      erro: {
        codigo: r`
SELECT fornecedor_id, COUNT(*) AS pedidos
FROM pedidos
WHERE COUNT(*) >= 5
GROUP BY fornecedor_id;
`,
        explicacao: "O WHERE roda antes do agrupamento, quando ainda não existe contagem: `misuse of aggregate`. Condições com agregação vão no HAVING, depois do GROUP BY.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre WHERE e HAVING?",
          opcoes: ["Nenhuma, são sinônimos", "WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois de agrupar", "HAVING filtra linhas e WHERE filtra grupos", "HAVING só funciona com ORDER BY"],
          resposta: 1,
          dicas: ["Pense na ordem de execução.", "Qual dos dois enxerga o resultado de `COUNT(*)`?", "HAVING vem depois do GROUP BY."],
          comentario: "Se a condição não usa agregação, prefira o WHERE: menos linhas chegam ao agrupamento.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Os pedidos pendentes são o 7 (Bruno), o 14 (Carla), o 21 (Ana) e o 28 (Bruno). Qual é o resultado?",
          codigo: r`
SELECT comprador, COUNT(*) AS n
FROM pedidos
WHERE status = 'pendente'
GROUP BY comprador
HAVING COUNT(*) > 1;
`,
          opcoes: ["comprador | n\nBruno | 2", "comprador | n\nAna | 1\nBruno | 2\nCarla | 1", "comprador | n\nBruno | 4", "(nenhuma linha)"],
          resposta: 0,
          dicas: ["O WHERE deixa só os 4 pendentes.", "Agrupando: Bruno 2, Carla 1, Ana 1.", "O HAVING mantém só quem tem mais de 1."],
          comentario: "WHERE e HAVING trabalhando juntos: primeiro as linhas, depois os grupos.",
        },
        {
          tipo: "corrigir", nivel: 1,
          enunciado: "A consulta deveria listar os fornecedores com 5 pedidos ou mais, mas dá erro. Corrija.",
          inicial: r`
SELECT fornecedor_id, COUNT(*) AS pedidos
FROM pedidos
WHERE COUNT(*) >= 5
GROUP BY fornecedor_id;
`,
          testes: [[r`assert mesmo_resultado("SELECT fornecedor_id, COUNT(*) FROM pedidos GROUP BY fornecedor_id HAVING COUNT(*) >= 5", ordem=False)`, "Devem vir os fornecedores 1, 2, 4 e 5"]],
          dicas: ["Leia o erro: `misuse of aggregate`.", "Agregações não vão no WHERE.", "Mova a condição para um HAVING depois do GROUP BY."],
          solucao: r`
SELECT fornecedor_id, COUNT(*) AS pedidos
FROM pedidos
GROUP BY fornecedor_id
HAVING COUNT(*) >= 5;     -- filtro de grupo vai no HAVING
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Liste os produtos (`produto_id`) cujo gasto total nos itens passa de 1000, com a coluna `gasto` (arredondada em 2 casas), do maior para o menor.",
          inicial: r`
SELECT produto_id,
`,
          testes: [[r`assert mesmo_resultado("SELECT produto_id, ROUND(SUM(qtd * preco_unit), 2) AS gasto FROM itens_pedido GROUP BY produto_id HAVING SUM(qtd * preco_unit) > 1000 ORDER BY gasto DESC")`, "Devem vir os produtos com gasto acima de 1000, em ordem decrescente"]],
          dicas: ["Agrupe por `produto_id`.", "O filtro usa a soma: vai no HAVING.", "`HAVING SUM(qtd * preco_unit) > 1000` e `ORDER BY gasto DESC`."],
          solucao: r`
SELECT produto_id,
       ROUND(SUM(qtd * preco_unit), 2) AS gasto
FROM itens_pedido
GROUP BY produto_id
HAVING SUM(qtd * preco_unit) > 1000
ORDER BY gasto DESC;
`,
        },
      ],
    },
    {
      id: "case-when",
      titulo: "CASE WHEN",
      explicacao: [
        "`CASE` é o \"se\" do SQL: `CASE WHEN condição THEN valor WHEN ... THEN ... ELSE outro END`. As condições são testadas em ordem e vale a primeira verdadeira.",
        "Use para criar faixas e rótulos: `CASE WHEN preco_ref >= 100 THEN 'caro' ELSE 'barato' END AS faixa`.",
        "Dentro de agregações, vira **agregação condicional**: `SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END)` conta só os cancelados. É assim que se monta uma tabela dinâmica em SQL.",
      ],
      exemplo: r`
SELECT nome, preco_ref,
       CASE WHEN preco_ref >= 100 THEN 'caro'
            WHEN preco_ref >= 10  THEN 'médio'
            ELSE 'barato'
       END AS faixa
FROM produtos
ORDER BY preco_ref;

SELECT comprador,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) AS aprovados
FROM pedidos
GROUP BY comprador;
`,
      erro: {
        codigo: r`
SELECT nome,
       CASE WHEN preco_ref >= 10 THEN 'médio'
            WHEN preco_ref >= 100 THEN 'caro'
            ELSE 'barato'
       END AS faixa
FROM produtos;
`,
        explicacao: "Não dá erro, mas nenhum produto vira 'caro': o Monitor (980) já é maior que 10 e para no primeiro WHEN. Como no `if/elif`, coloque as condições mais restritivas primeiro.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Os produtos 3, 4 e 10 custam 2.1, 18.9 e 980. Qual é o resultado?",
          codigo: r`
SELECT nome,
       CASE WHEN preco_ref >= 100 THEN 'caro'
            WHEN preco_ref >= 10 THEN 'médio'
            ELSE 'barato'
       END AS faixa
FROM produtos
WHERE id IN (3, 4, 10);
`,
          opcoes: ["nome | faixa\nFita adesiva | barato\nDetergente 5L | médio\nMonitor | caro", "nome | faixa\nFita adesiva | barato\nDetergente 5L | barato\nMonitor | caro", "nome | faixa\nFita adesiva | médio\nDetergente 5L | médio\nMonitor | caro", "faixa\nbarato\nmédio\ncaro"],
          resposta: 0,
          dicas: ["Teste cada preço nos WHEN, em ordem.", "18.9 não é ≥ 100, mas é ≥ 10.", "2.1 cai no ELSE."],
          comentario: "Cada linha recebe o rótulo do primeiro WHEN verdadeiro.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Dentro de um `GROUP BY comprador`, qual expressão conta só os pedidos cancelados?",
          opcoes: ["`COUNT(status = 'cancelado')`", "`SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END)`", "`COUNT(*) WHERE status = 'cancelado'`", "`CASE COUNT(*) WHEN 'cancelado' END`"],
          resposta: 1,
          dicas: ["`status = 'cancelado'` vale 0 ou 1, mas nunca é NULL.", "`COUNT` conta tudo o que não é NULL, inclusive o 0.", "Some 1 para os cancelados e 0 para os demais."],
          comentario: "A primeira opção conta todas as linhas, porque o 0 também é contado. A segunda funciona, e `SUM(status = 'cancelado')` também funcionaria no SQLite.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a estrutura do CASE.",
          codigo: r`
SELECT id,
       CASE ___ status = 'aprovado' THEN 'ok'
            ELSE 'atenção'
       ___ AS alerta
FROM pedidos;
`,
          respostas: [["WHEN"], ["END"]],
          testes: [[r`assert mesmo_resultado("SELECT id, CASE WHEN status = 'aprovado' THEN 'ok' ELSE 'atenção' END FROM pedidos")`, "Cada pedido deve receber 'ok' ou 'atenção'"]],
          dicas: ["Cada condição começa com uma palavra.", "Todo CASE precisa ser fechado.", "`WHEN` e `END`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Monte o resumo por comprador com as colunas `comprador`, `total`, `aprovados`, `pendentes` e `cancelados` (contagens), ordenado por comprador.",
          inicial: r`
SELECT comprador,
`,
          testes: [
            [r`assert mesmo_resultado("SELECT comprador, COUNT(*), SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END), SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END), SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) FROM pedidos GROUP BY comprador ORDER BY comprador")`, "As contagens por comprador e status devem estar corretas"],
            [r`assert _cols == ["comprador", "total", "aprovados", "pendentes", "cancelados"], _cols`, "As colunas devem ser comprador, total, aprovados, pendentes e cancelados"],
          ],
          dicas: ["Agrupe por comprador.", "Para cada status, uma agregação condicional.", "`SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS pendentes`."],
          solucao: r`
SELECT comprador,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'aprovado'  THEN 1 ELSE 0 END) AS aprovados,
       SUM(CASE WHEN status = 'pendente'  THEN 1 ELSE 0 END) AS pendentes,
       SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) AS cancelados
FROM pedidos
GROUP BY comprador
ORDER BY comprador;
`,
        },
      ],
    },
    {
      id: "datas",
      titulo: "Datas",
      explicacao: [
        "O SQLite guarda datas como texto no formato `'AAAA-MM-DD'`. Nesse formato, a ordem alfabética é a ordem cronológica, e comparar com `<`, `>` ou `BETWEEN` funciona.",
        "`strftime(formato, data)` extrai partes: `'%Y'` (ano), `'%m'` (mês), `'%Y-%m'` (ano e mês), `'%w'` (dia da semana, 0 = domingo).",
        "`date(data, '+30 days')` soma dias (também aceita `'+1 month'`, `'-7 days'`, `'start of month'`).",
        "`julianday(fim) - julianday(inicio)` dá a diferença em dias.",
        "> Em outros bancos, as funções mudam de nome (`DATE_TRUNC`, `DATEDIFF`, `EXTRACT`), mas as ideias são as mesmas.",
      ],
      exemplo: r`
SELECT strftime('%Y-%m', data) AS mes, COUNT(*) AS pedidos
FROM pedidos
GROUP BY mes
ORDER BY mes;

SELECT id, data, data_entrega,
       julianday(data_entrega) - julianday(data) AS dias_para_entregar,
       date(data, '+30 days') AS vencimento
FROM pedidos
WHERE data_entrega IS NOT NULL
LIMIT 5;
`,
      erro: {
        codigo: r`
SELECT id, data_entrega - data AS dias
FROM pedidos
WHERE data_entrega IS NOT NULL
LIMIT 3;
`,
        explicacao: "Subtrair textos de data faz o SQLite pegar só o número do começo (o ano): `2024 - 2024 = 0`. Para a diferença em dias, use `julianday(data_entrega) - julianday(data)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é o resultado?",
          codigo: r`
SELECT strftime('%m', '2024-03-15') AS mes,
       date('2024-03-15', '+20 days') AS venc;
`,
          opcoes: ["mes | venc\n03 | 2024-04-04", "mes | venc\n3 | 2024-04-04", "mes | venc\n03 | 2024-03-35", "mes | venc\n03 | 2024-04-05"],
          resposta: 0,
          dicas: ["`strftime` devolve texto, com zero à esquerda.", "Março tem 31 dias.", "15 + 20 = 35, ou seja, 4 de abril."],
          comentario: "`'%m'` sempre devolve dois dígitos. Para número, use `CAST(strftime('%m', data) AS INTEGER)`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "No SQLite, como calcular quantos dias se passaram entre `data` e `data_entrega`?",
          opcoes: ["`data_entrega - data`", "`julianday(data_entrega) - julianday(data)`", "`DATEDIFF(data_entrega, data)`", "`days(data_entrega, data)`"],
          resposta: 1,
          dicas: ["Datas são texto no SQLite.", "`DATEDIFF` existe em outros bancos, não no SQLite.", "`julianday` converte a data num número de dias."],
          comentario: "`julianday` transforma a data num número contínuo de dias, então a subtração dá a diferença.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para contar os pedidos por mês (no formato `2024-01`).",
          codigo: r`
SELECT strftime('___', data) AS mes, COUNT(*) AS pedidos
FROM pedidos
GROUP BY ___
ORDER BY mes;
`,
          respostas: [["%Y-%m"], ["mes", "strftime('%Y-%m', data)"]],
          testes: [[r`assert mesmo_resultado("SELECT strftime('%Y-%m', data), COUNT(*) FROM pedidos GROUP BY 1 ORDER BY 1")`, "Deve vir uma linha por mês, com 5 pedidos cada"]],
          dicas: ["O formato tem ano, hífen e mês.", "Agrupe pela expressão (ou pelo apelido).", "`%Y-%m` e `mes`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Calcule o **prazo médio de entrega** (em dias, arredondado com 1 casa) de cada `fornecedor_id`, considerando só os pedidos entregues. Ordene do mais rápido para o mais lento. Colunas: `fornecedor_id` e `prazo_medio`.",
          inicial: r`
SELECT fornecedor_id,
`,
          testes: [[r`assert mesmo_resultado("SELECT fornecedor_id, ROUND(AVG(julianday(data_entrega) - julianday(data)), 1) AS prazo_medio FROM pedidos WHERE data_entrega IS NOT NULL GROUP BY fornecedor_id ORDER BY prazo_medio, fornecedor_id")`, "Os prazos médios devem estar corretos e ordenados do menor para o maior"]],
          dicas: ["O prazo de cada pedido é `julianday(data_entrega) - julianday(data)`.", "Filtre os entregues com `WHERE data_entrega IS NOT NULL` e agrupe por fornecedor.", "`ROUND(AVG(...), 1) AS prazo_medio` e `ORDER BY prazo_medio`."],
          solucao: r`
SELECT fornecedor_id,
       ROUND(AVG(julianday(data_entrega) - julianday(data)), 1) AS prazo_medio
FROM pedidos
WHERE data_entrega IS NOT NULL
GROUP BY fornecedor_id
ORDER BY prazo_medio, fornecedor_id;   -- id desempata prazos iguais
`,
          comentario: "Se dois fornecedores empatarem no prazo, o `fornecedor_id` no ORDER BY garante uma ordem estável.",
        },
      ],
    },
  ],
  desafios: [
    {
      id: "painel-mensal",
      titulo: "Painel mensal de pedidos",
      enunciado: [
        "Monte o painel que a gerência acompanha todo mês, com uma linha por mês (`mes` no formato `2024-01`) e as colunas `total`, `aprovados`, `pendentes`, `cancelados` e `taxa_aprovacao` (aprovados / total × 100, arredondada em 1 casa). Ordene por mês.",
      ],
      inicial: r`
SELECT strftime('%Y-%m', data) AS mes,
`,
      testes: [
        [r`assert mesmo_resultado("SELECT strftime('%Y-%m', data), COUNT(*), SUM(status = 'aprovado'), SUM(status = 'pendente'), SUM(status = 'cancelado'), ROUND(SUM(status = 'aprovado') * 100.0 / COUNT(*), 1) FROM pedidos GROUP BY 1 ORDER BY 1")`, "As contagens e a taxa de aprovação por mês devem estar corretas"],
        [r`assert _cols == ["mes", "total", "aprovados", "pendentes", "cancelados", "taxa_aprovacao"], _cols`, "As colunas devem ser mes, total, aprovados, pendentes, cancelados e taxa_aprovacao"],
      ],
      dicas: ["Agrupe por `strftime('%Y-%m', data)`.", "Cada status é uma agregação condicional com `SUM(CASE WHEN ...)`.", "Cuidado com a divisão inteira: multiplique por `100.0` antes de dividir pelo `COUNT(*)`."],
      solucao: r`
SELECT strftime('%Y-%m', data) AS mes,
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'aprovado'  THEN 1 ELSE 0 END) AS aprovados,
       SUM(CASE WHEN status = 'pendente'  THEN 1 ELSE 0 END) AS pendentes,
       SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) AS cancelados,
       ROUND(SUM(CASE WHEN status = 'aprovado' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS taxa_aprovacao
FROM pedidos
GROUP BY mes
ORDER BY mes;
`,
    },
    {
      id: "resumo-produtos",
      titulo: "Resumo de compras por produto",
      enunciado: [
        "Para preparar uma negociação anual, liste por `produto_id`: `pedidos` (em quantos pedidos diferentes o produto aparece), `unidades` (soma de qtd), `preco_medio` (média de preco_unit, 2 casas) e `gasto` (soma de qtd × preco_unit, 2 casas).",
        "Mostre só os produtos com **100 unidades ou mais** e ordene pelo gasto, do maior para o menor.",
      ],
      inicial: r`
SELECT produto_id,
`,
      testes: [[r`assert mesmo_resultado("SELECT produto_id, COUNT(DISTINCT pedido_id), SUM(qtd), ROUND(AVG(preco_unit), 2), ROUND(SUM(qtd * preco_unit), 2) AS g FROM itens_pedido GROUP BY produto_id HAVING SUM(qtd) >= 100 ORDER BY g DESC")`, "Os números por produto, o filtro de 100 unidades e a ordem devem estar corretos"]],
      dicas: ["Todas as colunas saem de `itens_pedido`, agrupando por `produto_id`.", "Use `COUNT(DISTINCT pedido_id)` para contar os pedidos.", "O filtro de unidades é sobre a soma: `HAVING SUM(qtd) >= 100`."],
      solucao: r`
SELECT produto_id,
       COUNT(DISTINCT pedido_id)        AS pedidos,
       SUM(qtd)                         AS unidades,
       ROUND(AVG(preco_unit), 2)        AS preco_medio,
       ROUND(SUM(qtd * preco_unit), 2)  AS gasto
FROM itens_pedido
GROUP BY produto_id
HAVING SUM(qtd) >= 100
ORDER BY gasto DESC;
`,
    },
  ],
}));
