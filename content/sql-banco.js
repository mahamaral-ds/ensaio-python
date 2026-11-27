/*
 * Banco fictício de compras usado na trilha de SQL.
 * O esquema é fixo; os pedidos e itens são gerados de forma determinística
 * (sempre os mesmos dados), para que os exercícios tenham respostas estáveis.
 */
Ensaio.banco("compras", (r) => {
  const esquema = r`
CREATE TABLE fornecedores (
  id         INTEGER PRIMARY KEY,
  nome       TEXT NOT NULL,
  uf         TEXT NOT NULL,
  categoria  TEXT NOT NULL,
  ativo      INTEGER NOT NULL,   -- 1 = ativo, 0 = inativo
  nota       REAL                -- avaliação de 0 a 10 (pode ser NULL)
);

CREATE TABLE produtos (
  id         INTEGER PRIMARY KEY,
  nome       TEXT NOT NULL,
  categoria  TEXT NOT NULL,
  preco_ref  REAL NOT NULL       -- preço de referência
);

CREATE TABLE pedidos (
  id             INTEGER PRIMARY KEY,
  data           TEXT NOT NULL,  -- 'AAAA-MM-DD'
  fornecedor_id  INTEGER NOT NULL REFERENCES fornecedores(id),
  comprador      TEXT NOT NULL,
  status         TEXT NOT NULL,  -- aprovado, pendente ou cancelado
  data_entrega   TEXT            -- NULL enquanto não foi entregue
);

CREATE TABLE itens_pedido (
  pedido_id   INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id  INTEGER NOT NULL REFERENCES produtos(id),
  qtd         INTEGER NOT NULL,
  preco_unit  REAL NOT NULL,
  PRIMARY KEY (pedido_id, produto_id)
);
`.trim();

  const fornecedores = [
    [1, "Alfa Embalagens", "SP", "embalagem", 1, 9.1],
    [2, "Beta Insumos", "SP", "limpeza", 1, 8.7],
    [3, "Gama Logística", "RJ", "frete", 1, 9.1],
    [4, "Delta Papéis", "MG", "papelaria", 1, 7.9],
    [5, "Épsilon Tech", "SP", "ti", 1, 8.4],
    [6, "Zeta Química", "PR", "limpeza", 0, 6.5],
    [7, "Eta Gráfica", "RJ", "papelaria", 1, null],
    [8, "Teta Móveis", "SC", "mobiliario", 1, 8.0],
  ];
  const produtos = [
    [1, "Caixa P", "embalagem", 3.5],
    [2, "Caixa M", "embalagem", 5.2],
    [3, "Fita adesiva", "embalagem", 2.1],
    [4, "Detergente 5L", "limpeza", 18.9],
    [5, "Álcool 70%", "limpeza", 9.8],
    [6, "Luvas", "limpeza", 0.85],
    [7, "Papel A4", "papelaria", 24.9],
    [8, "Caneta", "papelaria", 1.9],
    [9, "Mouse", "ti", 45.0],
    [10, "Monitor", "ti", 980.0],
    [11, "Frete regional", "frete", 350.0],
    [12, "Cadeira", "mobiliario", 650.0],
  ];
  const catDoFornecedor = {};
  fornecedores.forEach((f) => (catDoFornecedor[f[0]] = f[3]));
  const precoDe = {};
  const prodPorCat = {};
  produtos.forEach((p) => {
    precoDe[p[0]] = p[3];
    (prodPorCat[p[2]] = prodPorCat[p[2]] || []).push(p[0]);
  });

  const fornPedido = [1, 2, 3, 4, 5, 1, 2, 4, 5, 7, 1, 3, 2, 4, 5, 6, 1, 2, 3, 7, 4, 5, 1, 2, 3, 4, 5, 1, 6, 2];
  const compradores = ["Ana", "Bruno", "Carla"];
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  const txt = (v) => (v === null ? "NULL" : typeof v === "number" ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");

  const linhas = [esquema, ""];
  fornecedores.forEach((f) => linhas.push("INSERT INTO fornecedores VALUES (" + f.map(txt).join(", ") + ");"));
  produtos.forEach((p) => linhas.push("INSERT INTO produtos VALUES (" + p.map(txt).join(", ") + ");"));

  for (let i = 1; i <= 30; i++) {
    const mes = Math.ceil(i / 5);
    const dia = ((i * 7) % 27) + 1;
    const data = new Date(Date.UTC(2024, mes - 1, dia));
    const status = i % 10 === 0 ? "cancelado" : i % 7 === 0 ? "pendente" : "aprovado";
    let entrega = null;
    if (status === "aprovado") {
      const e = new Date(data.getTime());
      e.setUTCDate(e.getUTCDate() + (i % 9) + 2);
      entrega = iso(e);
    }
    const fid = fornPedido[i - 1];
    linhas.push("INSERT INTO pedidos VALUES (" + [i, iso(data), fid, compradores[i % 3], status, entrega].map(txt).join(", ") + ");");

    const lista = prodPorCat[catDoFornecedor[fid]];
    const n = Math.min(1 + (i % 3), lista.length);
    for (let k = 0; k < n; k++) {
      const prod = lista[(i + k) % lista.length];
      const ref = precoDe[prod];
      const qtd = ref > 100 ? 1 + ((i + k) % 5) : 5 + ((i * 13 + k * 7) % 95);
      const preco = Math.round(ref * (1 + (((i + k) % 5) - 2) / 100) * 100) / 100;
      linhas.push("INSERT INTO itens_pedido VALUES (" + [i, prod, qtd, preco].map(txt).join(", ") + ");");
    }
  }

  return {
    titulo: "Banco de compras",
    tabelas: ["fornecedores", "produtos", "pedidos", "itens_pedido"],
    esquema,
    script: linhas.join("\n") + "\n",
  };
});
