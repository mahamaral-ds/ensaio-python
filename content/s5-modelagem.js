Ensaio.modulo((r) => ({
  id: "s5",
  trilha: "sql",
  ordem: 5,
  banco: "compras",
  titulo: "Modelar e modificar dados",
  resumo: "CREATE TABLE e restrições, INSERT, UPDATE, DELETE e transações, índices e views, e SQL dentro do Python.",
  // para a lição de SQL no Python: o mesmo banco como script
  arquivos: { "compras.sql": Ensaio.bancos.compras.script },
  licoes: [
    {
      id: "create-table",
      titulo: "Criar tabelas e restrições",
      explicacao: [
        "`CREATE TABLE nome (coluna tipo restrições, ...)` cria uma tabela. Os tipos mais usados no SQLite são `INTEGER`, `REAL`, `TEXT` e `NUMERIC`.",
        "As **restrições** protegem a qualidade dos dados: `PRIMARY KEY` (identificador único), `NOT NULL` (obrigatório), `UNIQUE` (sem repetição), `DEFAULT valor` (valor padrão), `CHECK (condição)` (regra) e `REFERENCES tabela(coluna)` (chave estrangeira).",
        "Uma coluna `INTEGER PRIMARY KEY` recebe um número automaticamente quando você não informa o valor.",
        "Restrições fazem o banco **recusar** dados ruins na entrada, o que é muito melhor do que limpar depois.",
        "`DROP TABLE nome` apaga a tabela. `sqlite_master` lista as tabelas existentes, e `PRAGMA table_info(nome)` mostra as colunas.",
      ],
      exemplo: r`
CREATE TABLE centros_custo (
    id         INTEGER PRIMARY KEY,
    codigo     TEXT NOT NULL UNIQUE,
    nome       TEXT NOT NULL,
    orcamento  REAL NOT NULL DEFAULT 0 CHECK (orcamento >= 0),
    ativo      INTEGER NOT NULL DEFAULT 1
);

INSERT INTO centros_custo (codigo, nome, orcamento) VALUES ('CC-01', 'Compras', 50000);
INSERT INTO centros_custo (codigo, nome) VALUES ('CC-02', 'Logística');

SELECT * FROM centros_custo;
`,
      erro: {
        codigo: r`
CREATE TABLE teste (id INTEGER PRIMARY KEY, valor REAL CHECK (valor > 0));
INSERT INTO teste (valor) VALUES (-5);
`,
        explicacao: "O banco recusou o valor negativo: `CHECK constraint failed`. Não é um defeito, é a restrição funcionando. Corrija o dado, ou a regra, se ela estiver errada.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve a `PRIMARY KEY` de uma tabela?",
          opcoes: ["Ordenar a tabela automaticamente", "Identificar cada linha de forma única, sem repetição nem NULL", "Criptografar a coluna", "Ligar duas tabelas obrigatoriamente"],
          resposta: 1,
          dicas: ["Pense no `id` dos pedidos.", "Dois pedidos podem ter o mesmo id?", "É o identificador único da linha."],
          comentario: "Quem liga tabelas é a chave **estrangeira** (`REFERENCES`), que aponta para a chave primária de outra tabela.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é o resultado?",
          codigo: r`
CREATE TABLE teste (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, ativo INTEGER DEFAULT 1);
INSERT INTO teste (nome) VALUES ('a');
INSERT INTO teste (nome) VALUES ('b');
SELECT * FROM teste;
`,
          opcoes: ["id | nome | ativo\n1 | a | 1\n2 | b | 1", "id | nome | ativo\nNULL | a | NULL\nNULL | b | NULL", "nome\na\nb", "Erro: falta o id"],
          resposta: 0,
          dicas: ["O `INTEGER PRIMARY KEY` é preenchido sozinho.", "O `DEFAULT` entra quando a coluna não é informada.", "As duas linhas recebem ids 1 e 2."],
          comentario: "Você só informou o nome. O id veio da chave primária e o ativo, do DEFAULT.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para que `id` seja a chave primária e `nome` seja obrigatório.",
          codigo: r`
CREATE TABLE centros_custo (
    id INTEGER ___ KEY,
    nome TEXT ___ NULL,
    orcamento REAL CHECK (orcamento >= 0)
);
`,
          respostas: [["PRIMARY"], ["NOT"]],
          testes: [[r`
info = {c[1]: c for c in consulta("PRAGMA table_info(centros_custo)")}
assert info["id"][5] == 1, "id deve ser a chave primária"
assert info["nome"][3] == 1, "nome deve ser NOT NULL"
`, "id deve ser a chave primária e nome deve ser obrigatório"]],
          dicas: ["As duas restrições têm duas palavras.", "Uma é PRIMARY ..., a outra é ... NULL.", "`PRIMARY` e `NOT`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a tabela `cotacoes` com as colunas: `id` (chave primária), `produto_id` (inteiro obrigatório que referencia `produtos(id)`), `fornecedor_id` (inteiro obrigatório que referencia `fornecedores(id)`), `preco` (REAL obrigatório e **maior que zero**) e `data` (TEXT obrigatório).",
          inicial: r`
CREATE TABLE cotacoes (

);
`,
          testes: [
            [r`
info = {c[1]: c for c in consulta("PRAGMA table_info(cotacoes)")}
assert set(info) == {"id", "produto_id", "fornecedor_id", "preco", "data"}, sorted(info)
assert info["id"][5] == 1, "id deve ser a chave primária"
assert all(info[c][3] == 1 for c in ("produto_id", "fornecedor_id", "preco", "data")), "produto_id, fornecedor_id, preco e data devem ser NOT NULL"
`, "As colunas, a chave primária e os NOT NULL devem estar certos"],
            [r`
fks = {(f[2], f[3]) for f in consulta("PRAGMA foreign_key_list(cotacoes)")}
assert ("produtos", "produto_id") in fks and ("fornecedores", "fornecedor_id") in fks, fks
`, "produto_id e fornecedor_id devem referenciar produtos e fornecedores"],
            [r`
_con.execute("INSERT INTO cotacoes (produto_id, fornecedor_id, preco, data) VALUES (4, 2, 17.5, '2024-07-01')")
recusou = False
try:
    _con.execute("INSERT INTO cotacoes (produto_id, fornecedor_id, preco, data) VALUES (4, 2, 0, '2024-07-01')")
except Exception as e:
    recusou = "CHECK" in str(e)
assert recusou, "um preço zero deveria ser recusado (CHECK preco > 0)"
`, "Um preço válido entra; um preço zero é recusado"],
          ],
          dicas: ["Uma coluna por linha, separadas por vírgula (a última sem vírgula).", "Chave estrangeira: `produto_id INTEGER NOT NULL REFERENCES produtos(id)`.", "Preço: `preco REAL NOT NULL CHECK (preco > 0)`."],
          solucao: r`
CREATE TABLE cotacoes (
    id             INTEGER PRIMARY KEY,
    produto_id     INTEGER NOT NULL REFERENCES produtos(id),
    fornecedor_id  INTEGER NOT NULL REFERENCES fornecedores(id),
    preco          REAL    NOT NULL CHECK (preco > 0),
    data           TEXT    NOT NULL
);
`,
        },
      ],
    },
    {
      id: "insert",
      titulo: "Inserir dados",
      explicacao: [
        "`INSERT INTO tabela (colunas) VALUES (valores);` acrescenta uma linha. Liste as colunas explicitamente: o código fica claro e não quebra se a tabela ganhar colunas novas.",
        "Várias linhas de uma vez: `VALUES (...), (...), (...)`.",
        "`INSERT INTO destino (colunas) SELECT ...` copia o resultado de uma consulta para outra tabela. É ótimo para montar tabelas de resumo ou de arquivo.",
        "`CREATE TABLE nova AS SELECT ...` cria e preenche a tabela de uma vez, mas não copia as restrições.",
      ],
      exemplo: r`
INSERT INTO produtos (nome, categoria, preco_ref)
VALUES ('Grampeador', 'papelaria', 32.0),
       ('Clips', 'papelaria', 4.5);

SELECT * FROM produtos WHERE categoria = 'papelaria';

CREATE TABLE resumo_status AS
SELECT status, COUNT(*) AS pedidos FROM pedidos GROUP BY status;

SELECT * FROM resumo_status;
`,
      erro: {
        codigo: r`
INSERT INTO fornecedores (id, nome, uf, categoria, ativo)
VALUES (1, 'Nova Embalagens', 'SP', 'embalagem', 1);
`,
        explicacao: "Já existe um fornecedor com id 1: `UNIQUE constraint failed: fornecedores.id`. Deixe o id de fora para o banco escolher o próximo número, ou use um id livre.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que listar as colunas no INSERT (`INSERT INTO produtos (nome, categoria, preco_ref) VALUES ...`)?",
          opcoes: ["É obrigatório no SQLite", "Deixa claro qual valor vai em qual coluna e não quebra quando a tabela ganha colunas", "Deixa o INSERT mais rápido", "Impede valores repetidos"],
          resposta: 1,
          dicas: ["Sem a lista, os valores seguem a ordem das colunas da tabela.", "O que acontece se alguém acrescentar uma coluna?", "Clareza e robustez."],
          comentario: "Sem a lista de colunas, é preciso informar todas, na ordem exata da tabela.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "A tabela `produtos` tem 12 produtos (ids 1 a 12). Qual é o resultado?",
          codigo: r`
INSERT INTO produtos (nome, categoria, preco_ref)
VALUES ('Grampeador', 'papelaria', 32.0), ('Clips', 'papelaria', 4.5);

SELECT COUNT(*) AS n, MAX(id) AS ultimo FROM produtos;
`,
          opcoes: ["n | ultimo\n14 | 14", "n | ultimo\n12 | 12", "n | ultimo\n14 | 2", "n | ultimo\n2 | 14"],
          resposta: 0,
          dicas: ["Duas linhas foram acrescentadas.", "Os ids continuam a sequência.", "13 e 14."],
          comentario: "O INSERT com várias linhas acrescentou dois produtos, que receberam os ids 13 e 14.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para cadastrar um novo fornecedor.",
          codigo: r`
INSERT ___ fornecedores (id, nome, uf, categoria, ativo, nota)
___ (9, 'Iota Copos', 'BA', 'copa', 1, NULL);

SELECT nome, uf FROM fornecedores WHERE id = 9;
`,
          respostas: [["INTO"], ["VALUES"]],
          testes: [[r`assert consulta("SELECT nome, uf FROM fornecedores WHERE id = 9") == [("Iota Copos", "BA")]`, "O fornecedor 9 deve existir"]],
          dicas: ["`INSERT ... tabela`.", "Antes da lista de valores vem uma palavra-chave.", "`INTO` e `VALUES`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a tabela `pedidos_pendentes` com as colunas `id` (INTEGER PRIMARY KEY), `data` (TEXT) e `comprador` (TEXT), e preencha com os pedidos pendentes usando `INSERT INTO ... SELECT`.",
          inicial: r`
CREATE TABLE pedidos_pendentes (

);
`,
          testes: [
            [r`assert [c[1] for c in consulta("PRAGMA table_info(pedidos_pendentes)")] == ["id", "data", "comprador"]`, "A tabela deve ter as colunas id, data e comprador"],
            [r`assert consulta("SELECT * FROM pedidos_pendentes ORDER BY id") == consulta("SELECT id, data, comprador FROM pedidos WHERE status = 'pendente' ORDER BY id")`, "Devem estar lá os 4 pedidos pendentes"],
            [r`assert "insert" in _src.lower() and "select" in _src.lower()`, "Use INSERT INTO ... SELECT"],
          ],
          dicas: ["Primeiro o CREATE TABLE, depois o INSERT.", "`INSERT INTO pedidos_pendentes (id, data, comprador)` seguido de um SELECT, sem VALUES.", "`SELECT id, data, comprador FROM pedidos WHERE status = 'pendente'`."],
          solucao: r`
CREATE TABLE pedidos_pendentes (
    id         INTEGER PRIMARY KEY,
    data       TEXT,
    comprador  TEXT
);

INSERT INTO pedidos_pendentes (id, data, comprador)
SELECT id, data, comprador
FROM pedidos
WHERE status = 'pendente';

SELECT * FROM pedidos_pendentes;
`,
        },
      ],
    },
    {
      id: "update-delete",
      titulo: "UPDATE, DELETE e transações",
      explicacao: [
        "`UPDATE tabela SET coluna = valor WHERE condição;` altera linhas existentes. `DELETE FROM tabela WHERE condição;` apaga linhas.",
        "**Sem WHERE, a alteração vale para todas as linhas.** Antes de um UPDATE ou DELETE, rode um SELECT com o mesmo WHERE para ver o que será afetado.",
        "Uma **transação** agrupa vários comandos num bloco de tudo ou nada: `BEGIN;` ... `COMMIT;` grava tudo, e `ROLLBACK;` desfaz tudo desde o BEGIN.",
        "Chaves estrangeiras impedem apagar um pedido que ainda tem itens. Apague os filhos primeiro, dentro da mesma transação.",
      ],
      exemplo: r`
SELECT id, nome, preco_ref FROM produtos WHERE categoria = 'ti';

UPDATE produtos SET preco_ref = ROUND(preco_ref * 1.05, 2) WHERE categoria = 'ti';

SELECT id, nome, preco_ref FROM produtos WHERE categoria = 'ti';

BEGIN;
DELETE FROM itens_pedido WHERE pedido_id = 30;
DELETE FROM pedidos WHERE id = 30;
ROLLBACK;   -- desfaz as duas exclusões

SELECT COUNT(*) AS pedidos FROM pedidos;
`,
      erro: {
        codigo: r`
DELETE FROM pedidos WHERE id = 10;
`,
        explicacao: "O pedido 10 tem itens em `itens_pedido` que apontam para ele: `FOREIGN KEY constraint failed`. O banco impede deixar itens órfãos. Apague os itens primeiro (de preferência numa transação) ou marque o pedido como cancelado.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que acontece com `UPDATE pedidos SET status = 'cancelado';`?",
          opcoes: ["Nada, falta o WHERE", "Todos os pedidos passam a ser cancelados", "Só o último pedido muda", "Dá erro de sintaxe"],
          resposta: 1,
          dicas: ["Sem WHERE, não há filtro.", "O UPDATE vale para todas as linhas.", "É um erro clássico e caro."],
          comentario: "Por isso o hábito de rodar o SELECT com o mesmo WHERE antes, e de usar transações em alterações grandes.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Os produtos de TI são Mouse (45.0) e Monitor (980.0). Qual é o resultado?",
          codigo: r`
UPDATE produtos SET preco_ref = preco_ref * 1.1 WHERE categoria = 'ti';
SELECT nome, ROUND(preco_ref, 2) AS preco FROM produtos WHERE categoria = 'ti';
`,
          opcoes: ["nome | preco\nMouse | 49.5\nMonitor | 1078.0", "nome | preco\nMouse | 45.0\nMonitor | 980.0", "nome | preco\nMouse | 49.5", "Comando executado. Linhas afetadas: 2."],
          resposta: 0,
          dicas: ["O UPDATE aumenta 10%.", "O SELECT vem depois e mostra os novos valores.", "45 × 1.1 e 980 × 1.1."],
          comentario: "O resultado mostrado é o do último comando, o SELECT.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para apagar o pedido 10 e os seus itens dentro de uma transação e, no fim, **desfazer** tudo.",
          codigo: r`
___;
DELETE FROM itens_pedido WHERE pedido_id = 10;
DELETE FROM pedidos WHERE id = 10;
___;

SELECT COUNT(*) AS n FROM pedidos WHERE id = 10;
`,
          respostas: [["BEGIN", "BEGIN TRANSACTION"], ["ROLLBACK"]],
          testes: [
            [r`assert _rows == [(1,)], _rows`, "O pedido 10 deve continuar existindo (n = 1)"],
            [r`assert consulta("SELECT COUNT(*) FROM itens_pedido WHERE pedido_id = 10")[0][0] > 0`, "Os itens do pedido 10 também devem voltar"],
          ],
          dicas: ["A primeira lacuna abre a transação.", "A segunda desfaz o que foi feito desde a abertura.", "`BEGIN` e `ROLLBACK`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Marque como `'cancelado'` os pedidos **pendentes** com data anterior a 2024-04-01. Depois, mostre o `id` e o `status` de todos os pedidos cancelados.",
          inicial: r`
UPDATE pedidos
`,
          testes: [
            [r`assert consulta("SELECT id FROM pedidos WHERE status = 'pendente' ORDER BY id") == [(21,), (28,)]`, "Só os pendentes de abril em diante (21 e 28) devem continuar pendentes"],
            [r`assert sorted(_rows) == [(7, "cancelado"), (10, "cancelado"), (14, "cancelado"), (20, "cancelado"), (30, "cancelado")], _rows`, "O SELECT final deve mostrar os 5 pedidos cancelados"],
          ],
          dicas: ["`UPDATE pedidos SET status = 'cancelado' WHERE ...`.", "São duas condições: status pendente **e** data antes de abril.", "Depois: `SELECT id, status FROM pedidos WHERE status = 'cancelado';`."],
          solucao: r`
UPDATE pedidos
SET status = 'cancelado'
WHERE status = 'pendente'
  AND data < '2024-04-01';

SELECT id, status
FROM pedidos
WHERE status = 'cancelado';
`,
        },
      ],
    },
    {
      id: "indices-views",
      titulo: "Índices e views",
      explicacao: [
        "Um **índice** é como o índice remissivo de um livro: deixa buscas e junções por uma coluna muito mais rápidas, ao custo de espaço e de inserções um pouco mais lentas. Use `CREATE INDEX nome ON tabela (coluna);`.",
        "Indexe as colunas que aparecem muito em WHERE, JOIN e ORDER BY, como as chaves estrangeiras (`pedidos.fornecedor_id`). Chaves primárias já têm índice.",
        "`EXPLAIN QUERY PLAN SELECT ...` mostra como o banco vai executar a consulta: `SCAN` (lê a tabela toda) ou `SEARCH ... USING INDEX` (usa um índice).",
        "Uma **view** é uma consulta guardada com nome: `CREATE VIEW vw_x AS SELECT ...`. Ela não guarda dados, roda a consulta toda vez, e simplifica relatórios que se repetem.",
      ],
      exemplo: r`
EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE fornecedor_id = 3;

CREATE INDEX idx_pedidos_fornecedor ON pedidos (fornecedor_id);

EXPLAIN QUERY PLAN
SELECT * FROM pedidos WHERE fornecedor_id = 3;

CREATE VIEW vw_pedidos_detalhe AS
SELECT p.id, p.data, f.nome AS fornecedor, p.status
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id;

SELECT * FROM vw_pedidos_detalhe WHERE status = 'pendente';
`,
      erro: {
        codigo: r`
CREATE VIEW vw_teste AS SELECT * FROM pedidos;
CREATE VIEW vw_teste AS SELECT * FROM fornecedores;
`,
        explicacao: "Já existe uma view com esse nome: `view vw_teste already exists`. Para recriar, apague antes com `DROP VIEW IF EXISTS vw_teste;`, ou use `CREATE VIEW IF NOT EXISTS`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Quando vale a pena criar um índice?",
          opcoes: ["Em todas as colunas de todas as tabelas", "Em colunas muito usadas em filtros, junções e ordenações de tabelas grandes", "Só em colunas de texto", "Nunca, o banco cria tudo sozinho"],
          resposta: 1,
          dicas: ["Índices aceleram buscas, mas têm custo.", "Cada INSERT ou UPDATE também precisa atualizar os índices.", "Indexe o que é muito consultado."],
          comentario: "Em tabelas pequenas, como as deste banco, o ganho é imperceptível. Índices fazem diferença com milhares ou milhões de linhas.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que uma VIEW guarda?",
          opcoes: ["Uma cópia dos dados no momento da criação", "A consulta, que é executada de novo a cada uso", "Só os nomes das colunas", "Um índice da tabela"],
          resposta: 1,
          dicas: ["Se os pedidos mudarem, a view mostra os dados novos?", "Ela é uma consulta com nome.", "Os dados continuam nas tabelas."],
          comentario: "Por isso a view sempre mostra os dados atuais. Para guardar uma \"foto\" dos dados, use `CREATE TABLE ... AS SELECT`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para criar um índice na coluna `fornecedor_id` de `pedidos`.",
          codigo: r`
CREATE ___ idx_pedidos_fornecedor ON pedidos (fornecedor_id);

SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_pedidos_fornecedor';
`,
          respostas: [["INDEX"]],
          testes: [[r`assert _rows == [("idx_pedidos_fornecedor",)], _rows`, "O índice deve existir"]],
          dicas: ["`CREATE ___ nome ON tabela (coluna)`.", "O nome do objeto já diz o que ele é: idx.", "`INDEX`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a view `vw_gasto_fornecedor` com as colunas `fornecedor` (nome) e `gasto` (soma dos itens dos pedidos **aprovados**, 2 casas). Depois, consulte a view para mostrar os **3 fornecedores de maior gasto**.",
          inicial: r`
CREATE VIEW vw_gasto_fornecedor AS
`,
          testes: [
            [r`assert consulta("SELECT type FROM sqlite_master WHERE name = 'vw_gasto_fornecedor'") == [("view",)]`, "A view vw_gasto_fornecedor deve existir"],
            [r`assert [c[1] for c in consulta("PRAGMA table_info(vw_gasto_fornecedor)")] == ["fornecedor", "gasto"]`, "A view deve ter as colunas fornecedor e gasto"],
            [r`assert mesmo_resultado("SELECT f.nome, ROUND(SUM(i.qtd * i.preco_unit), 2) AS g FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id JOIN itens_pedido i ON i.pedido_id = p.id WHERE p.status = 'aprovado' GROUP BY f.nome ORDER BY g DESC LIMIT 3")`, "A consulta final deve mostrar os 3 maiores"],
          ],
          dicas: ["O corpo da view é uma consulta com JOIN e GROUP BY.", "Renomeie `f.nome AS fornecedor` e calcule `ROUND(SUM(...), 2) AS gasto`.", "Depois: `SELECT * FROM vw_gasto_fornecedor ORDER BY gasto DESC LIMIT 3;`."],
          solucao: r`
CREATE VIEW vw_gasto_fornecedor AS
SELECT f.nome AS fornecedor,
       ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN itens_pedido i ON i.pedido_id = p.id
WHERE p.status = 'aprovado'
GROUP BY f.nome;

SELECT *
FROM vw_gasto_fornecedor
ORDER BY gasto DESC
LIMIT 3;
`,
        },
      ],
    },
    {
      id: "sql-no-python",
      titulo: "SQL dentro do Python",
      linguagem: "python",
      explicacao: [
        "No dia a dia de dados, o SQL costuma rodar a partir do Python. O módulo `sqlite3` (da biblioteca padrão) conecta a um banco SQLite: `con = sqlite3.connect('arquivo.db')`.",
        "`con.execute(sql, parametros)` roda um comando, e `fetchall()` ou `fetchone()` trazem as linhas.",
        "**Nunca monte SQL juntando texto do usuário com f-string.** Use parâmetros `?`: `con.execute('SELECT * FROM fornecedores WHERE uf = ?', (uf,))`. Isso evita *SQL injection* e problemas com aspas.",
        "Com o pandas, `pd.read_sql(sql, con, params=(...))` traz o resultado direto para um DataFrame. Para outros bancos (PostgreSQL, SQL Server), a ideia é a mesma, usando o driver de cada um ou o SQLAlchemy.",
        "> Nesta lição o código é Python. O arquivo `compras.sql` tem o mesmo banco de compras, para você carregar com `executescript`.",
      ],
      exemplo: r`
import sqlite3
import pandas as pd

con = sqlite3.connect(":memory:")
con.executescript(open("compras.sql", encoding="utf-8").read())

cur = con.execute("SELECT nome, uf FROM fornecedores WHERE ativo = ? AND uf = ?", (1, "SP"))
print(cur.fetchall())

df = pd.read_sql("SELECT status, COUNT(*) AS n FROM pedidos GROUP BY status", con)
print(df)

uf = "RJ"
print(pd.read_sql("SELECT nome, nota FROM fornecedores WHERE uf = ?", con, params=(uf,)))
`,
      erro: {
        codigo: r`
import sqlite3
con = sqlite3.connect(":memory:")
con.executescript(open("compras.sql", encoding="utf-8").read())

nome = "x' OR '1'='1"          # texto digitado por alguém
sql = f"SELECT nome FROM fornecedores WHERE nome = '{nome}'"
print(sql)
print(con.execute(sql).fetchall())
`,
        explicacao: "O texto digitado virou parte do SQL e trouxe **todos** os fornecedores: isso é *SQL injection*. Com parâmetros (`WHERE nome = ?` e `(nome,)`), o texto é tratado sempre como valor, nunca como comando.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que usar `?` (parâmetros) em vez de f-string para colocar valores num SQL?",
          opcoes: ["Porque é mais curto", "Porque o valor é tratado sempre como dado, evitando SQL injection e problemas com aspas", "Porque o SQLite não aceita f-string", "Porque deixa a consulta mais rápida em qualquer caso"],
          resposta: 1,
          dicas: ["Lembre do erro comum desta lição.", "E se o valor tiver uma aspa, como em \"D'Ávila\"?", "O driver cuida do valor separado do comando."],
          comentario: "Parâmetros também evitam ter que escapar aspas à mão.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Há 4 pedidos pendentes no banco. Qual é a saída?",
          codigo: r`
import sqlite3
con = sqlite3.connect(":memory:")
con.executescript(open("compras.sql", encoding="utf-8").read())
n = con.execute("SELECT COUNT(*) FROM pedidos WHERE status = ?", ("pendente",)).fetchone()[0]
print(n)
`,
          opcoes: ["4", "(4,)", "[(4,)]", "pendente"],
          resposta: 0,
          dicas: ["`fetchone()` devolve uma tupla com uma linha.", "`[0]` pega o primeiro valor da tupla.", "A contagem é 4."],
          comentario: "Sem o `[0]`, a saída seria a tupla `(4,)`; com `fetchall()`, seria a lista `[(4,)]`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para carregar num DataFrame os produtos de limpeza, passando a categoria como parâmetro.",
          codigo: r`
import sqlite3
import pandas as pd
con = sqlite3.connect(":memory:")
con.executescript(open("compras.sql", encoding="utf-8").read())
df = pd.___("SELECT * FROM produtos WHERE categoria = ?", con, params=(___,))
print(len(df))
`,
          respostas: [["read_sql", "read_sql_query"], ["'limpeza'", "\"limpeza\""]],
          testes: [["assert len(df) == 3 and set(df['categoria']) == {'limpeza'}", "`df` deve ter os 3 produtos de limpeza"]],
          dicas: ["A função do pandas que lê o resultado de um SQL.", "O parâmetro é o texto da categoria, entre aspas.", "`read_sql` e `'limpeza'`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Escreva `gasto_por_fornecedor(con, status='aprovado')`, que devolve um DataFrame com as colunas `nome` e `gasto` (2 casas) dos pedidos com o status informado, do maior gasto para o menor. Passe o status como parâmetro `?`.",
          inicial: r`
import sqlite3
import pandas as pd

def gasto_por_fornecedor(con, status="aprovado"):
    pass

con = sqlite3.connect(":memory:")
con.executescript(open("compras.sql", encoding="utf-8").read())
print(gasto_por_fornecedor(con))
`,
          testes: [
            [r`
c = sqlite3.connect(":memory:")
c.executescript(open("compras.sql", encoding="utf-8").read())
r = gasto_por_fornecedor(c)
esp = pd.read_sql("SELECT f.nome, ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto FROM pedidos p JOIN fornecedores f ON f.id = p.fornecedor_id JOIN itens_pedido i ON i.pedido_id = p.id WHERE p.status = 'aprovado' GROUP BY f.nome ORDER BY gasto DESC", c)
assert isinstance(r, pd.DataFrame), "devolva um DataFrame"
assert list(r.columns) == ["nome", "gasto"], list(r.columns)
assert r["nome"].tolist() == esp["nome"].tolist() and np.allclose(r["gasto"], esp["gasto"]), r
`, "Com o padrão, devolve o gasto dos aprovados por fornecedor, do maior para o menor"],
            [r`
c = sqlite3.connect(":memory:")
c.executescript(open("compras.sql", encoding="utf-8").read())
assert sorted(gasto_por_fornecedor(c, "pendente")["nome"]) == ["Alfa Embalagens", "Beta Insumos", "Delta Papéis"]
`, "Com status='pendente', traz só os fornecedores com pedidos pendentes"],
            [r`assert "?" in _src and "f\"select" not in _src.lower() and "f'select" not in _src.lower()`, "Use o parâmetro ? (sem f-string no SQL)"],
          ],
          dicas: ["Escreva o SQL com JOIN, GROUP BY e `WHERE p.status = ?`.", "`pd.read_sql(sql, con, params=(status,))`.", "Não esqueça do `ORDER BY gasto DESC` e de devolver o DataFrame."],
          solucao: r`
import sqlite3
import pandas as pd

SQL = """
SELECT f.nome,
       ROUND(SUM(i.qtd * i.preco_unit), 2) AS gasto
FROM pedidos p
JOIN fornecedores f ON f.id = p.fornecedor_id
JOIN itens_pedido i ON i.pedido_id = p.id
WHERE p.status = ?
GROUP BY f.nome
ORDER BY gasto DESC
"""

def gasto_por_fornecedor(con, status="aprovado"):
    return pd.read_sql(SQL, con, params=(status,))   # valor separado do comando

con = sqlite3.connect(":memory:")
con.executescript(open("compras.sql", encoding="utf-8").read())
print(gasto_por_fornecedor(con))
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "cotacoes",
      titulo: "Cotações × preço de referência",
      enunciado: [
        "O time recebeu quatro cotações para 2024-07-01: Detergente 5L (produto 4) com a Beta Insumos (fornecedor 2) por 17.50 e com a Zeta Química (6) por 16.90; Papel A4 (produto 7) com a Delta Papéis (4) por 26.00 e com a Eta Gráfica (7) por 23.90.",
        "Crie a tabela `cotacoes` (id, produto_id, fornecedor_id, preco, data, com as restrições que fizerem sentido), insira as quatro cotações e mostre a comparação com as colunas `produto`, `fornecedor`, `preco`, `preco_ref` e `diferenca_pct` (diferença em % em relação ao preço de referência, com 1 casa), ordenada por produto e preço.",
      ],
      inicial: r`
CREATE TABLE cotacoes (

);
`,
      testes: [
        [r`assert consulta("SELECT COUNT(*) FROM cotacoes") == [(4,)]`, "A tabela cotacoes deve ter as 4 cotações"],
        [r`
esperado = consulta("SELECT pr.nome, f.nome, c.preco, pr.preco_ref, ROUND((c.preco - pr.preco_ref) / pr.preco_ref * 100, 1) FROM cotacoes c JOIN produtos pr ON pr.id = c.produto_id JOIN fornecedores f ON f.id = c.fornecedor_id ORDER BY pr.nome, c.preco")
assert [tuple(x) for x in _rows] == esperado, _rows
assert sorted(x[4] for x in _rows) == [-10.6, -7.4, -4.0, 4.4], [x[4] for x in _rows]
`, "A comparação deve mostrar as 4 cotações com a diferença correta, ordenadas"],
        [r`assert _cols == ["produto", "fornecedor", "preco", "preco_ref", "diferenca_pct"], _cols`, "As colunas devem ser produto, fornecedor, preco, preco_ref e diferenca_pct"],
      ],
      dicas: ["Reaproveite o CREATE TABLE da lição 1 deste módulo.", "Um único INSERT com quatro linhas em VALUES resolve a carga.", "A comparação junta cotacoes com produtos e fornecedores: `ROUND((c.preco - pr.preco_ref) / pr.preco_ref * 100, 1)`."],
      solucao: r`
CREATE TABLE cotacoes (
    id             INTEGER PRIMARY KEY,
    produto_id     INTEGER NOT NULL REFERENCES produtos(id),
    fornecedor_id  INTEGER NOT NULL REFERENCES fornecedores(id),
    preco          REAL    NOT NULL CHECK (preco > 0),
    data           TEXT    NOT NULL
);

INSERT INTO cotacoes (produto_id, fornecedor_id, preco, data) VALUES
    (4, 2, 17.50, '2024-07-01'),
    (4, 6, 16.90, '2024-07-01'),
    (7, 4, 26.00, '2024-07-01'),
    (7, 7, 23.90, '2024-07-01');

SELECT pr.nome AS produto,
       f.nome  AS fornecedor,
       c.preco,
       pr.preco_ref,
       ROUND((c.preco - pr.preco_ref) / pr.preco_ref * 100, 1) AS diferenca_pct
FROM cotacoes c
JOIN produtos pr    ON pr.id = c.produto_id
JOIN fornecedores f ON f.id  = c.fornecedor_id
ORDER BY produto, c.preco;
`,
    },
    {
      id: "arquivar-cancelados",
      titulo: "Arquivar pedidos cancelados",
      enunciado: [
        "Os pedidos cancelados devem sair das tabelas do dia a dia e ir para uma tabela de arquivo. Numa **transação** (`BEGIN` ... `COMMIT`):",
        "1. crie `pedidos_cancelados` com as mesmas colunas de `pedidos` e copie para ela os pedidos cancelados;",
        "2. apague os itens desses pedidos de `itens_pedido`;",
        "3. apague os pedidos cancelados de `pedidos`.",
        "No fim, mostre quantos pedidos ficaram (`SELECT COUNT(*) AS pedidos FROM pedidos;`).",
      ],
      inicial: r`
BEGIN;

COMMIT;
`,
      testes: [
        [r`assert [c[1] for c in consulta("PRAGMA table_info(pedidos_cancelados)")] == [c[1] for c in consulta("PRAGMA table_info(pedidos)")]`, "pedidos_cancelados deve ter as mesmas colunas de pedidos"],
        [r`assert consulta("SELECT id FROM pedidos_cancelados ORDER BY id") == [(10,), (20,), (30,)]`, "Os pedidos 10, 20 e 30 devem estar no arquivo"],
        [r`assert consulta("SELECT COUNT(*) FROM pedidos WHERE status = 'cancelado'") == [(0,)] and consulta("SELECT COUNT(*) FROM itens_pedido WHERE pedido_id IN (10, 20, 30)") == [(0,)]`, "Os cancelados e os seus itens devem ter saído das tabelas originais"],
        [r`assert _rows == [(27,)], _rows`, "Devem sobrar 27 pedidos"],
        [r`assert "begin" in _src.lower() and "commit" in _src.lower()`, "Faça tudo dentro de BEGIN ... COMMIT"],
      ],
      dicas: ["`CREATE TABLE pedidos_cancelados AS SELECT * FROM pedidos WHERE status = 'cancelado';` cria e copia de uma vez.", "Os itens saem primeiro: `DELETE FROM itens_pedido WHERE pedido_id IN (SELECT id FROM pedidos WHERE status = 'cancelado');`.", "Depois apague os pedidos, feche com `COMMIT;` e rode a contagem."],
      solucao: r`
BEGIN;

CREATE TABLE pedidos_cancelados AS
SELECT * FROM pedidos WHERE status = 'cancelado';

-- os itens primeiro, por causa da chave estrangeira
DELETE FROM itens_pedido
WHERE pedido_id IN (SELECT id FROM pedidos WHERE status = 'cancelado');

DELETE FROM pedidos WHERE status = 'cancelado';

COMMIT;

SELECT COUNT(*) AS pedidos FROM pedidos;
`,
      comentario: "Se qualquer passo falhasse, um `ROLLBACK` deixaria o banco exatamente como estava. É essa garantia de tudo ou nada que a transação oferece.",
    },
  ],
}));
