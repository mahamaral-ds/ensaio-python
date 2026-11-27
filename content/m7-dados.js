Ensaio.modulo((r) => ({
  id: "m7",
  ordem: 7,
  titulo: "Python para dados",
  resumo: "NumPy, pandas (leitura, limpeza, agrupamentos e junções) e gráficos com matplotlib, com dados fictícios de compras e vendas.",
  // Dados fictícios disponíveis em todas as lições deste módulo
  arquivos: {
    "compras.csv": r`
pedido;data;fornecedor;categoria;produto;qtd;preco_unit;uf
1001;2024-01-05;Alfa Embalagens;embalagem;Caixa P;200;3,50;SP
1002;2024-01-09;Beta Insumos;limpeza;Detergente 5L;30;18,90;SP
1003;2024-01-15;Gama Logística;frete;Frete regional;4;350,00;RJ
1004;2024-01-22;Delta Papéis;papelaria;Papel A4;50;24,90;MG
1005;2024-02-02;Alfa Embalagens;embalagem;Caixa M;150;5,20;SP
1006;2024-02-07;Épsilon Tech;ti;Mouse;20;45,00;SP
1007;2024-02-14;Beta Insumos;limpeza;Álcool 70%;60;9,80;RJ
1008;2024-02-20;Delta Papéis;papelaria;Caneta;300;1,90;MG
1009;2024-03-01;Épsilon Tech;ti;Notebook;3;4200,00;SP
1010;2024-03-06;Gama Logística;frete;Frete nacional;2;1250,00;RJ
1011;2024-03-12;Alfa Embalagens;embalagem;Fita adesiva;400;2,10;SP
1012;2024-03-19;Delta Papéis;papelaria;Pasta;80;6,50;MG
1013;2024-04-03;Beta Insumos;limpeza;Detergente 5L;40;19,50;SP
1014;2024-04-10;Épsilon Tech;ti;Monitor;6;980,00;RJ
1015;2024-04-17;Alfa Embalagens;embalagem;Caixa G;100;8,40;SP
1016;2024-04-25;Gama Logística;frete;Frete regional;5;360,00;MG
1017;2024-05-06;Delta Papéis;papelaria;Papel A4;60;25,90;SP
1018;2024-05-13;Beta Insumos;limpeza;Luvas;500;0,85;RJ
1019;2024-05-21;Épsilon Tech;ti;Teclado;15;120,00;SP
1020;2024-05-28;Alfa Embalagens;embalagem;Caixa P;250;3,60;MG
1021;2024-06-04;Gama Logística;frete;Frete nacional;3;1300,00;SP
1022;2024-06-11;Delta Papéis;papelaria;Caneta;200;2,00;RJ
1023;2024-06-18;Épsilon Tech;ti;Mouse;25;44,00;SP
1024;2024-06-26;Beta Insumos;limpeza;Álcool 70%;80;10,20;MG
`.trim() + "\n",
    "compras_sujas.csv": r`
pedido;data;fornecedor;valor;status
1;2024-01-05; alfa embalagens ;700,00;Aprovado
2;2024-01-09;Beta Insumos;567,00;aprovado
3;2024-01-15;GAMA LOGÍSTICA;;Pendente
4;2024-01-22;Delta Papéis;1245,00;APROVADO
2;2024-01-09;Beta Insumos;567,00;aprovado
5;2024-02-02;Alfa Embalagens;n/d;cancelado
6;2024-02-07;Épsilon Tech;900,00;Aprovado
7;;Beta Insumos;588,00;pendente
`.trim() + "\n",
    "vendas.csv": r`
mes,regiao,vendedor,valor
2024-01,Sudeste,Ana,182000
2024-01,Sul,Bruno,96000
2024-01,Nordeste,Carla,74000
2024-01,Centro-Oeste,Diego,51000
2024-02,Sudeste,Ana,175000
2024-02,Sul,Bruno,101000
2024-02,Nordeste,Carla,79000
2024-02,Centro-Oeste,Diego,48000
2024-03,Sudeste,Ana,198000
2024-03,Sul,Bruno,99000
2024-03,Nordeste,Carla,83000
2024-03,Centro-Oeste,Diego,56000
2024-04,Sudeste,Ana,205000
2024-04,Sul,Bruno,108000
2024-04,Nordeste,Carla,81000
2024-04,Centro-Oeste,Diego,59000
2024-05,Sudeste,Ana,190000
2024-05,Sul,Bruno,112000
2024-05,Nordeste,Carla,88000
2024-05,Centro-Oeste,Diego,62000
2024-06,Sudeste,Ana,214000
2024-06,Sul,Bruno,115000
2024-06,Nordeste,Carla,91000
2024-06,Centro-Oeste,Diego,60000
`.trim() + "\n",
    "metas.csv": r`
regiao,meta_mensal
Sudeste,195000
Sul,100000
Nordeste,85000
Centro-Oeste,55000
`.trim() + "\n",
    "fornecedores.csv": r`
fornecedor,uf,prazo_medio,nota
Alfa Embalagens,SP,12,9.1
Beta Insumos,SP,7,8.7
Gama Logística,RJ,5,9.1
Delta Papéis,MG,3,7.9
Zeta Química,PR,9,8.2
`.trim() + "\n",
  },
  licoes: [
    {
      id: "numpy-arrays",
      titulo: "NumPy: arrays",
      explicacao: [
        "O **NumPy** traz o `ndarray`, um array de números do mesmo tipo guardados num bloco contínuo de memória. É a base do pandas, do scikit-learn e de quase todo o ecossistema de dados.",
        "Crie com `np.array([...])`, `np.arange(inicio, fim, passo)`, `np.linspace(a, b, n)` ou `np.zeros(n)`. Os atributos `dtype` (tipo) e `shape` (formato) descrevem o array.",
        "Indexação e fatiamento funcionam como nas listas e se estendem para várias dimensões: `matriz[linha, coluna]`, `matriz[:, 0]` (a primeira coluna inteira).",
        "**Máscaras booleanas** filtram sem laço: `precos[precos > 10]`. Esse mesmo padrão aparece no pandas.",
      ],
      exemplo: r`
import numpy as np

precos = np.array([12.5, 8.0, 31.9, 4.25])
print(precos, precos.dtype, precos.shape)
print(precos[0], precos[-1], precos[1:3])

matriz = np.array([[10, 20, 30], [40, 50, 60]])
print(matriz.shape)
print(matriz[1, 2], matriz[:, 0])

print(np.arange(0, 10, 2))
print(np.zeros(3), np.linspace(0, 1, 5))
print(np.arange(6).reshape(2, 3))

caros = precos[precos > 10]
print(caros)
`,
      erro: {
        codigo: r`
import numpy as np
valores = np.array([1, "2", 3])
print(valores.dtype)
print(valores.sum())
`,
        explicacao: "Com um texto no meio, o NumPy transformou **todos** os itens em texto (o `dtype` começa com `<U`) e a soma falha. Converta os dados antes: `np.array([1, 2, 3])` ou `valores.astype(float)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
import numpy as np
a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.shape, a[1, 0], a[:, 2])
`,
          opcoes: ["(2, 3) 4 [3 6]", "(3, 2) 2 [3 6]", "(2, 3) 2 [5 6]", "(2, 3) 4 [4 5 6]"],
          resposta: 0,
          dicas: ["`shape` é (linhas, colunas).", "`a[1, 0]`: segunda linha, primeira coluna.", "`a[:, 2]`: a terceira coluna de todas as linhas."],
          comentario: "2 linhas e 3 colunas; `a[1, 0]` é 4; a coluna 2 é [3 6]. Arrays aparecem sem vírgulas no `print`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que um array NumPy costuma ser bem mais rápido que uma lista para contas com milhões de números?",
          opcoes: ["Porque usa mais memória", "Porque guarda os números num bloco contínuo de um só tipo e faz as contas em código compilado", "Porque ordena os dados", "Porque roda na GPU automaticamente"],
          resposta: 1,
          dicas: ["Pense em como os dados ficam na memória.", "Uma lista guarda referências para objetos espalhados.", "As operações do NumPy são escritas em C."],
          comentario: "O laço acontece em C, sem passar pelo interpretador Python a cada número. Por isso se fala em *vetorização*.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para separar os produtos com estoque zerado e contá-los.",
          codigo: r`
import numpy as np
estoque = np.array([5, 0, 12, 3, 0, 40])
zerados = estoque[estoque ___ 0]
qtd_zerados = len(___)
print(qtd_zerados)
`,
          respostas: [["=="], ["zerados"]],
          testes: [["assert qtd_zerados == 2 and zerados.tolist() == [0, 0]", "Devem ser 2 produtos zerados"]],
          dicas: ["A máscara compara cada item com zero.", "Depois, conte os itens filtrados.", "`==` e `zerados`."],
          comentario: "Outra forma: `(estoque == 0).sum()`, porque `True` conta como 1.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "`vendas` tem uma linha por loja e uma coluna por mês. Crie `loja2` (a linha de índice 1), `marco` (a coluna de índice 2) e `acima_100` (um array 1D com os valores acima de 100, na ordem em que aparecem lendo linha por linha).",
          inicial: r`
import numpy as np
vendas = np.array([[80, 95, 110], [120, 130, 90], [70, 150, 105]])
`,
          testes: [
            ["assert loja2.tolist() == [120, 130, 90]", "`loja2` deve ser [120, 130, 90]"],
            ["assert marco.tolist() == [110, 90, 105]", "`marco` deve ser [110, 90, 105]"],
            ["assert acima_100.tolist() == [110, 120, 130, 150, 105]", "`acima_100` deve ser [110, 120, 130, 150, 105]"],
          ],
          dicas: ["Linha: `vendas[1]`; coluna: `vendas[:, 2]`.", "A máscara `vendas > 100` tem o mesmo formato da matriz.", "`vendas[vendas > 100]` já devolve um array 1D."],
          solucao: r`
import numpy as np
vendas = np.array([[80, 95, 110], [120, 130, 90], [70, 150, 105]])

loja2 = vendas[1]                 # linha de índice 1
marco = vendas[:, 2]              # todas as linhas, coluna 2
acima_100 = vendas[vendas > 100]  # máscara: resultado 1D
print(loja2, marco, acima_100)
`,
        },
      ],
    },
    {
      id: "numpy-vetorizacao",
      titulo: "NumPy: operações vetorizadas",
      explicacao: [
        "Operações com arrays valem **elemento a elemento**: `qtd * preco` multiplica cada par, sem laço.",
        "**Broadcasting**: um número (ou um array de formato compatível) se estende para combinar com o outro. `total * 1.18` aplica o imposto em todos os itens.",
        "Agregações: `sum`, `mean`, `max`, `min`, `std`. Em matrizes, `axis=0` agrega descendo as linhas (um resultado por coluna) e `axis=1` agrega ao longo da linha (um resultado por linha).",
        "`np.where(condicao, se_verdadeiro, se_falso)` é o `if` vetorizado.",
      ],
      exemplo: r`
import numpy as np

qtd = np.array([200, 30, 4, 50])
preco = np.array([3.5, 18.9, 350.0, 24.9])
total = qtd * preco
print(total)
print(total.sum(), total.mean().round(2), total.max())
print(np.round(total / total.sum() * 100, 1))

com_imposto = total * 1.18
print(com_imposto.round(2))
print(np.where(total > 1000, "alto", "baixo"))

vendas = np.array([[80, 95, 110], [120, 130, 90]])
print(vendas.sum(axis=0), vendas.sum(axis=1))
`,
      erro: {
        codigo: r`
import numpy as np
a = np.array([1, 2, 3])
b = np.array([10, 20])
print(a + b)
`,
        explicacao: "Os formatos (3,) e (2,) não combinam, e o NumPy não sabe parear os elementos: `ValueError ... could not be broadcast`. Confira o `shape` dos dois arrays antes de operar.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
import numpy as np
a = np.array([1, 2, 3])
print(a * 2, a + a, (a > 1).sum())
`,
          opcoes: ["[2 4 6] [2 4 6] 2", "[1 2 3 1 2 3] [2 4 6] 2", "[2 4 6] [2 4 6] True", "Erro"],
          resposta: 0,
          dicas: ["Com listas, `* 2` repetiria. Com arrays, não.", "`a + a` soma elemento a elemento.", "Somar uma máscara conta os `True`."],
          comentario: "Arrays fazem conta; listas concatenam. `(a > 1).sum()` conta quantos são maiores que 1.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "`vendas` é uma matriz lojas × meses. O que `vendas.sum(axis=0)` devolve?",
          opcoes: ["O total de cada loja", "O total de cada mês (soma descendo as linhas)", "O total geral", "A maior venda"],
          resposta: 1,
          dicas: ["O eixo 0 são as linhas.", "Somar no eixo 0 \"colapsa\" as linhas.", "Sobra um valor por coluna, ou seja, por mês."],
          comentario: "`axis=0` colapsa as linhas (resultado por coluna) e `axis=1` colapsa as colunas (resultado por linha).",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O código deveria calcular o total de cada **loja** (linha) e a participação de cada loja no total geral, mas está somando no eixo errado. Corrija.",
          inicial: r`
import numpy as np
vendas = np.array([[80, 95, 110], [120, 130, 90], [70, 150, 105]])
total_loja = vendas.sum(axis=0)
participacao = total_loja / vendas.sum() * 100
print(participacao.round(1))
`,
          testes: [
            ["assert total_loja.tolist() == [285, 340, 325]", "`total_loja` deve ser [285, 340, 325]"],
            ["assert np.allclose(participacao, np.array([285, 340, 325]) / 950 * 100)", "`participacao` deve ser a fatia de cada loja no total (≈ 30.0, 35.8 e 34.2)"],
          ],
          dicas: ["Cada loja é uma linha.", "Para um resultado por linha, colapse as colunas.", "`axis=1`."],
          solucao: r`
import numpy as np
vendas = np.array([[80, 95, 110], [120, 130, 90], [70, 150, 105]])
total_loja = vendas.sum(axis=1)        # um total por linha (loja)
participacao = total_loja / vendas.sum() * 100
print(participacao.round(1))
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Sem laços: calcule `total` por item (preço × quantidade), `desconto` de 5% só para os itens com total acima de 500 (use `np.where`), `liquido` (total − desconto) e `ticket_medio` (média de `liquido`, arredondada em 2 casas).",
          inicial: r`
import numpy as np
precos = np.array([3.5, 18.9, 350.0, 24.9, 45.0])
qtd = np.array([200, 30, 1, 50, 10])
`,
          testes: [
            ["assert np.allclose(total, [700, 567, 350, 1245, 450])", "`total` deve ser [700, 567, 350, 1245, 450]"],
            ["assert np.allclose(desconto, [35, 28.35, 0, 62.25, 0])", "`desconto` deve ser 5% só nos itens acima de 500"],
            ["assert np.allclose(liquido, total - desconto)", "`liquido` deve ser total − desconto"],
            ["assert abs(ticket_medio - 637.28) < 0.005", "`ticket_medio` deve ser 637.28"],
            ["assert 'for ' not in _src and 'while ' not in _src", "Não use laços"],
          ],
          dicas: ["`total = precos * qtd`.", "`np.where(total > 500, total * 0.05, 0)`.", "`round(liquido.mean(), 2)`."],
          solucao: r`
import numpy as np
precos = np.array([3.5, 18.9, 350.0, 24.9, 45.0])
qtd = np.array([200, 30, 1, 50, 10])

total = precos * qtd
desconto = np.where(total > 500, total * 0.05, 0)   # if vetorizado
liquido = total - desconto
ticket_medio = round(liquido.mean(), 2)
print(total, desconto, liquido, ticket_medio)
`,
        },
      ],
    },
    {
      id: "pandas-dataframe",
      titulo: "pandas: Series e DataFrame",
      explicacao: [
        "O **pandas** organiza dados em tabelas. Uma `Series` é uma coluna com índice; um `DataFrame` é uma tabela de várias Series que compartilham o índice.",
        "Selecione colunas com `df['coluna']` (Series) ou `df[['a', 'b']]` (DataFrame). Crie colunas com contas vetorizadas: `df['total'] = df['qtd'] * df['preco']`.",
        "Filtre linhas com máscaras: `df[df['total'] > 800]`. Para combinar condições, use `&` (e) e `|` (ou), com cada condição entre parênteses.",
        "`df.loc[linha, coluna]` seleciona por rótulo e `df.iloc[i, j]` por posição. `sort_values`, `head`, `describe` e `shape` completam o kit básico.",
      ],
      exemplo: r`
import pandas as pd

df = pd.DataFrame({
    "produto": ["Caixa P", "Detergente", "Papel A4", "Mouse"],
    "categoria": ["embalagem", "limpeza", "papelaria", "ti"],
    "qtd": [200, 30, 50, 20],
    "preco": [3.5, 18.9, 24.9, 45.0],
})
print(df)
print(df.shape, list(df.columns))

df["total"] = df["qtd"] * df["preco"]
print(df[["produto", "total"]])
print(df[(df["total"] > 800) & (df["qtd"] < 100)])
print(df.sort_values("total", ascending=False).head(2))
print(df.loc[0, "produto"], df.iloc[-1]["qtd"])
print(df["total"].sum(), df["total"].mean())
`,
      erro: {
        codigo: r`
import pandas as pd
df = pd.DataFrame({"qtd": [5, 20, 40], "preco": [50.0, 25.0, 10.0]})
print(df[df["qtd"] > 10 and df["preco"] < 30])
`,
        explicacao: "`and` tenta transformar a coluna inteira num único `True` ou `False`: `ValueError: The truth value of a Series is ambiguous`. Use `&` e parênteses: `df[(df['qtd'] > 10) & (df['preco'] < 30)]`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
import pandas as pd
df = pd.DataFrame({"x": [1, 2, 3, 4], "y": [10, 20, 30, 40]})
print(df[df["x"] > 2]["y"].sum(), df.shape)
`,
          opcoes: ["70 (4, 2)", "100 (4, 2)", "70 (2, 4)", "30 (4, 2)"],
          resposta: 0,
          dicas: ["Quais linhas têm `x > 2`?", "Some o `y` dessas linhas.", "`shape` é (linhas, colunas) do DataFrame original."],
          comentario: "Ficam as linhas com x = 3 e 4, cujos y somam 70. O filtro não altera `df`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual filtro seleciona as linhas com `qtd > 10` **e** `preco < 30`?",
          opcoes: ["`df[df.qtd > 10 and df.preco < 30]`", "`df[(df['qtd'] > 10) & (df['preco'] < 30)]`", "`df.filter(qtd > 10, preco < 30)`", "`df[df['qtd'] > 10 & df['preco'] < 30]`"],
          resposta: 1,
          dicas: ["`and` não funciona com Series.", "O `&` tem precedência maior que `>`.", "Por isso cada condição vai entre parênteses."],
          comentario: "Sem os parênteses, `10 & df['preco']` seria calculado primeiro e daria erro ou um resultado errado.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para criar a coluna `total` e achar o produto de maior total.",
          codigo: r`
import pandas as pd
df = pd.DataFrame({"produto": ["A", "B", "C"], "qtd": [5, 2, 8], "preco": [10.0, 60.0, 4.0]})
df["___"] = df["qtd"] * df["preco"]
top = df.sort_values("total", ascending=___).iloc[0]["produto"]
print(top)
`,
          respostas: [["total"], ["False"]],
          testes: [["assert top == 'B' and 'total' in df.columns", "A coluna `total` deve existir e o produto de maior total é B"]],
          dicas: ["O nome da coluna já aparece na linha seguinte.", "O maior primeiro é ordem decrescente.", "`total` e `False`."],
          comentario: "Atalho: `df.loc[df['total'].idxmax(), 'produto']`.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a coluna `df['total']`, o DataFrame `caros` (linhas com preço acima de 20, só com as colunas `produto` e `preco`) e `media_ti` (média do total na categoria `'ti'`).",
          inicial: r`
import pandas as pd
df = pd.DataFrame({
    "produto": ["Caixa P", "Detergente", "Papel A4", "Mouse", "Monitor", "Caneta"],
    "categoria": ["embalagem", "limpeza", "papelaria", "ti", "ti", "papelaria"],
    "qtd": [200, 30, 50, 20, 6, 300],
    "preco": [3.5, 18.9, 24.9, 45.0, 980.0, 1.9],
})
`,
          testes: [
            ["assert np.allclose(df['total'], [700, 567, 1245, 900, 5880, 570])" , "`df['total']` deve ser qtd × preço"],
            ["assert list(caros.columns) == ['produto', 'preco'] and caros['produto'].tolist() == ['Papel A4', 'Mouse', 'Monitor']", "`caros` deve ter só produto e preco, com Papel A4, Mouse e Monitor"],
            ["assert abs(media_ti - 3390) < 0.01", "`media_ti` deve ser 3390"],
          ],
          dicas: ["Filtre e selecione as colunas numa expressão: `df[df['preco'] > 20][['produto', 'preco']]`.", "Para a média, filtre a categoria e pegue a coluna `total`.", "`df[df['categoria'] == 'ti']['total'].mean()`."],
          solucao: r`
import pandas as pd
df = pd.DataFrame({
    "produto": ["Caixa P", "Detergente", "Papel A4", "Mouse", "Monitor", "Caneta"],
    "categoria": ["embalagem", "limpeza", "papelaria", "ti", "ti", "papelaria"],
    "qtd": [200, 30, 50, 20, 6, 300],
    "preco": [3.5, 18.9, 24.9, 45.0, 980.0, 1.9],
})

df["total"] = df["qtd"] * df["preco"]
caros = df.loc[df["preco"] > 20, ["produto", "preco"]]   # linhas e colunas de uma vez
media_ti = df.loc[df["categoria"] == "ti", "total"].mean()
print(caros)
print(media_ti)
`,
          comentario: "`df.loc[mascara, colunas]` filtra e seleciona numa operação só, e evita avisos de cópia (`SettingWithCopyWarning`) quando você altera o resultado depois.",
        },
      ],
    },
    {
      id: "leitura",
      titulo: "pandas: leitura de dados",
      explicacao: [
        "`pd.read_csv` lê arquivos de texto. Os parâmetros mais usados com dados brasileiros: `sep=';'`, `decimal=','`, `thousands='.'`, `encoding='latin-1'` (para arquivos antigos do Excel) e `parse_dates=['data']`.",
        "Logo depois de ler, confira: `df.head()`, `df.shape`, `df.dtypes` e `df.info()`. Uma coluna de valores com tipo `object` (texto) é sinal de que o separador decimal não foi entendido.",
        "Para explorar: `value_counts()` (frequências), `unique()` e `nunique()` (valores distintos), `min()` e `max()`.",
        "Também existem `pd.read_excel`, `pd.read_json` e `pd.read_sql`. Para gravar, use `df.to_csv('saida.csv', index=False)` e os equivalentes.",
        "> Neste módulo estão disponíveis `compras.csv`, `compras_sujas.csv`, `vendas.csv`, `metas.csv` e `fornecedores.csv`, todos fictícios.",
      ],
      exemplo: r`
import pandas as pd

df = pd.read_csv("compras.csv", sep=";", decimal=",", parse_dates=["data"])
print(df.head())
print(df.dtypes)
print(df.shape)
print(df["categoria"].value_counts())
print(df["fornecedor"].nunique(), "fornecedores")
print(df["data"].min().date(), "a", df["data"].max().date())

df["total"] = df["qtd"] * df["preco_unit"]
df.to_csv("compras_com_total.csv", index=False)
print(open("compras_com_total.csv", encoding="utf-8").readline())
`,
      erro: {
        codigo: r`
import pandas as pd
df = pd.read_csv("compras.csv")
print(df.shape)
print(df.columns.tolist())
`,
        explicacao: "Sem `sep=';'`, o pandas procurou vírgulas e encontrou as vírgulas decimais. Resultado: colunas quebradas no lugar errado e tudo virando texto. Sempre confira `shape` e `columns` logo depois de ler.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O arquivo usa `;` como separador e vírgula como separador decimal. Qual leitura está correta?",
          opcoes: ["`pd.read_csv('a.csv')`", "`pd.read_csv('a.csv', sep=';', decimal=',')`", "`pd.read_csv('a.csv', sep=',', decimal=';')`", "`pd.read_excel('a.csv')`"],
          resposta: 1,
          dicas: ["`sep` é o que separa as colunas.", "`decimal` é o que separa a parte inteira da decimal.", "No padrão brasileiro: `;` e `,`."],
          comentario: "Se os números tiverem ponto de milhar (`1.234,56`), acrescente `thousands='.'`.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída? (abra a lista de arquivos de qualquer exercício para ver `compras.csv`)",
          codigo: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",")
print(df.shape, df["uf"].nunique())
`,
          opcoes: ["(24, 8) 3", "(25, 8) 3", "(24, 7) 4", "(8, 24) 3"],
          resposta: 0,
          dicas: ["O cabeçalho não conta como linha.", "Conte as colunas do cabeçalho.", "As UFs que aparecem são SP, RJ e MG."],
          comentario: "24 pedidos, 8 colunas e 3 UFs distintas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a leitura para que a coluna `data` vire datas de verdade.",
          codigo: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=___, decimal=",", parse_dates=[___])
print(df["data"].dt.month.max())
`,
          respostas: [["\";\"", "';'"], ["\"data\"", "'data'"]],
          testes: [["assert _out.strip() == '6'", "O maior mês deve ser 6"]],
          dicas: ["O separador de colunas do arquivo, entre aspas.", "O nome da coluna de datas, entre aspas.", "`';'` e `'data'`."],
          comentario: "Com datas de verdade, o acessor `.dt` dá `year`, `month`, `day_name()` e muito mais.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Leia `compras.csv` em `df`, crie a coluna `total` (qtd × preco_unit) e calcule `n_pedidos_sp` (quantos pedidos são de SP) e `maior_pedido` (o número do pedido de maior total).",
          inicial: r`
import pandas as pd
`,
          testes: [
            ["assert 'total' in df.columns and abs(df['total'].sum() - 43405) < 0.01", "`df` deve ter a coluna `total` (soma 43405)"],
            ["assert n_pedidos_sp == 12", "`n_pedidos_sp` deve ser 12"],
            ["assert maior_pedido == 1009", "`maior_pedido` deve ser 1009"],
          ],
          dicas: ["Não esqueça `sep=';'` e `decimal=','`.", "Para contar: `(df['uf'] == 'SP').sum()`.", "`df.loc[df['total'].idxmax(), 'pedido']`."],
          solucao: r`
import pandas as pd

df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]

n_pedidos_sp = (df["uf"] == "SP").sum()               # True conta como 1
maior_pedido = df.loc[df["total"].idxmax(), "pedido"]  # rótulo da linha do máximo
print(n_pedidos_sp, maior_pedido)
`,
        },
      ],
    },
    {
      id: "limpeza",
      titulo: "pandas: limpeza de dados",
      explicacao: [
        "Dados reais vêm sujos. Roteiro básico: duplicados → textos → números → datas → ausentes.",
        "- Duplicados: `df.duplicated()` e `df.drop_duplicates()` (com `subset=` para considerar só algumas colunas).",
        "- Textos: o acessor `.str` aplica métodos de string na coluna inteira: `df['fornecedor'].str.strip().str.title()`.",
        "- Números: `pd.to_numeric(coluna, errors='coerce')` transforma o que não for número em `NaN`, sem quebrar.",
        "- Datas: `pd.to_datetime(coluna, errors='coerce')` faz o mesmo, com `NaT` para datas inválidas.",
        "- Ausentes: `isna().sum()` para medir, `dropna(subset=[...])` para descartar e `fillna(valor)` para preencher.",
        "> Decida e documente o que fazer com cada problema. Descartar pode esconder um defeito no sistema de origem.",
      ],
      exemplo: r`
import pandas as pd

df = pd.read_csv("compras_sujas.csv", sep=";", dtype={"valor": str})
print(df)
print(df.isna().sum())

df = df.drop_duplicates()
df["fornecedor"] = df["fornecedor"].str.strip().str.title()
df["status"] = df["status"].str.lower()
df["valor"] = pd.to_numeric(df["valor"].str.replace(",", "."), errors="coerce")
df["data"] = pd.to_datetime(df["data"], errors="coerce")
print(df)
print(df.dtypes)
print(df.dropna(subset=["valor"]).shape)
`,
      erro: {
        codigo: r`
import pandas as pd
df = pd.read_csv("compras_sujas.csv", sep=";", dtype={"valor": str})
df["valor"] = df["valor"].str.replace(",", ".").astype(float)
`,
        explicacao: "`astype(float)` exige que **todos** os valores sejam números, e `'n/d'` não é: `ValueError`. Use `pd.to_numeric(..., errors='coerce')` e depois decida o que fazer com os `NaN`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
import pandas as pd
s = pd.Series(["10", "x", None, "4"])
n = pd.to_numeric(s, errors="coerce")
print(n.isna().sum(), n.sum())
`,
          opcoes: ["2 14.0", "1 14.0", "2 Erro", "0 14"],
          resposta: 0,
          dicas: ["`'x'` vira NaN. E o `None`?", "Ausentes continuam ausentes.", "`sum` ignora NaN por padrão."],
          comentario: "Há dois ausentes (`'x'` e `None`), e a soma ignora os NaN: 10 + 4 = 14.0. É float porque NaN é float.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual linha remove as linhas totalmente repetidas?",
          opcoes: ["`df.dropna()`", "`df.drop_duplicates()`", "`df.unique()`", "`df.remove_duplicates()`"],
          resposta: 1,
          dicas: ["`dropna` trata de ausentes.", "`unique` é de Series, não de DataFrame.", "O método tem \"duplicates\" no nome."],
          comentario: "Com `subset=['pedido']`, considera duplicada qualquer linha com o mesmo número de pedido, e `keep='last'` mantém a última.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para padronizar os nomes e preencher os valores ausentes com zero.",
          codigo: r`
import pandas as pd
df = pd.DataFrame({"fornecedor": [" alfa ", "BETA", "Alfa"], "valor": [10.0, None, 5.0]})
df["fornecedor"] = df["fornecedor"].str.___().str.title()
df["valor"] = df["valor"].___(0)
print(df.groupby("fornecedor")["valor"].sum().to_dict())
`,
          respostas: [["strip"], ["fillna"]],
          testes: [["assert \"{'Alfa': 15.0, 'Beta': 0.0}\" in _out", "O resultado deve ser {'Alfa': 15.0, 'Beta': 0.0}"]],
          dicas: ["O primeiro tira os espaços das pontas.", "O segundo preenche ausentes.", "`strip` e `fillna`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Limpe `compras_sujas.csv` e guarde em `limpo`: remova duplicadas; padronize `fornecedor` (`strip` + `title`) e `status` (minúsculas); converta `valor` para número (inválidos viram NaN) e `data` para datetime; descarte as linhas sem valor ou sem data; reinicie o índice com `reset_index(drop=True)`.",
          inicial: r`
import pandas as pd
df = pd.read_csv("compras_sujas.csv", sep=";", dtype={"valor": str})
`,
          testes: [
            ["assert limpo['pedido'].tolist() == [1, 2, 4, 6], limpo['pedido'].tolist()", "Devem sobrar os pedidos 1, 2, 4 e 6"],
            ["assert limpo['fornecedor'].tolist() == ['Alfa Embalagens', 'Beta Insumos', 'Delta Papéis', 'Épsilon Tech'], limpo['fornecedor'].tolist()", "Os fornecedores devem estar padronizados"],
            ["assert (limpo['status'] == limpo['status'].str.lower()).all()", "`status` deve estar em minúsculas"],
            ["assert pd.api.types.is_datetime64_any_dtype(limpo['data']) and pd.api.types.is_float_dtype(limpo['valor'])", "`data` deve ser datetime e `valor`, numérico"],
            ["assert abs(limpo['valor'].sum() - 3412) < 0.01 and list(limpo.index) == [0, 1, 2, 3]", "A soma dos valores deve ser 3412 e o índice deve ser 0 a 3"],
          ],
          dicas: ["Siga a ordem do roteiro da lição; a última etapa é o `dropna`.", "Para o valor: `pd.to_numeric(df['valor'].str.replace(',', '.'), errors='coerce')`.", "`limpo = df.dropna(subset=['valor', 'data']).reset_index(drop=True)`."],
          solucao: r`
import pandas as pd
df = pd.read_csv("compras_sujas.csv", sep=";", dtype={"valor": str})

df = df.drop_duplicates()                                   # 1) duplicados
df["fornecedor"] = df["fornecedor"].str.strip().str.title() # 2) textos
df["status"] = df["status"].str.lower()
df["valor"] = pd.to_numeric(df["valor"].str.replace(",", "."), errors="coerce")  # 3) números
df["data"] = pd.to_datetime(df["data"], errors="coerce")    # 4) datas

limpo = df.dropna(subset=["valor", "data"]).reset_index(drop=True)  # 5) ausentes
print(limpo)
`,
          comentario: "Em vez de só descartar, vale guardar as linhas rejeitadas (`df[df['valor'].isna()]`) num relatório para corrigir na origem.",
        },
      ],
    },
    {
      id: "groupby",
      titulo: "pandas: agrupamentos",
      explicacao: [
        "`groupby` segue a ideia de separar, aplicar e combinar: separa as linhas por grupo, aplica uma agregação em cada um e junta os resultados.",
        "`df.groupby('categoria')['total'].sum()` dá uma Series com um valor por categoria. Para várias métricas, use a agregação nomeada: `agg(pedidos=('pedido', 'count'), gasto=('total', 'sum'))`.",
        "`size()` conta as linhas de cada grupo. `reset_index()` transforma o resultado numa tabela comum.",
        "`pivot_table(index=..., columns=..., values=..., aggfunc='sum')` monta tabelas cruzadas, como uma tabela dinâmica do Excel.",
        "`transform('sum')` devolve o total do grupo **em cada linha**. É ótimo para calcular a participação de cada item no seu grupo.",
      ],
      exemplo: r`
import pandas as pd

df = pd.read_csv("compras.csv", sep=";", decimal=",", parse_dates=["data"])
df["total"] = df["qtd"] * df["preco_unit"]

print(df.groupby("categoria")["total"].sum().sort_values(ascending=False))

resumo = df.groupby("fornecedor").agg(
    pedidos=("pedido", "count"),
    gasto=("total", "sum"),
    ticket_medio=("total", "mean"),
).round(2)
print(resumo)

df["mes"] = df["data"].dt.to_period("M")
print(df.pivot_table(index="mes", columns="uf", values="total", aggfunc="sum", fill_value=0))

df["part_cat"] = df["total"] / df.groupby("categoria")["total"].transform("sum")
print(df[["pedido", "categoria", "part_cat"]].head().round(3))
`,
      erro: {
        codigo: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",", parse_dates=["data"])
print(df.groupby("categoria").sum())
`,
        explicacao: "Sem escolher a coluna, o pandas tenta somar **todas**, inclusive as datas, e dá `TypeError`. Selecione o que quer agregar (`['qtd'].sum()`) ou use `sum(numeric_only=True)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
import pandas as pd
df = pd.DataFrame({"uf": ["SP", "RJ", "SP", "MG", "SP"], "valor": [10, 20, 30, 40, 50]})
print(df.groupby("uf")["valor"].sum().to_dict())
`,
          opcoes: ["{'MG': 40, 'RJ': 20, 'SP': 90}", "{'SP': 90, 'RJ': 20, 'MG': 40}", "{'SP': 3, 'RJ': 1, 'MG': 1}", "{'MG': 40, 'RJ': 20, 'SP': 30}"],
          resposta: 0,
          dicas: ["Some os valores de cada UF.", "SP tem 10 + 30 + 50.", "Por padrão, o `groupby` ordena as chaves."],
          comentario: "O `groupby` ordena os grupos alfabeticamente (use `sort=False` para manter a ordem de aparição).",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual expressão conta quantos pedidos cada fornecedor tem?",
          opcoes: ["`df.groupby('fornecedor').size()`", "`df['fornecedor'].sum()`", "`df.count('fornecedor')`", "`df.groupby('pedido')['fornecedor'].max()`"],
          resposta: 0,
          dicas: ["Você quer um número por fornecedor.", "Agrupe pelo fornecedor e conte as linhas.", "`size()` conta as linhas de cada grupo."],
          comentario: "`df['fornecedor'].value_counts()` dá o mesmo resultado, ordenado do maior para o menor.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para descobrir a UF com o maior gasto.",
          codigo: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]
por_uf = df.___("uf")["total"].___()
print(por_uf.idxmax())
`,
          respostas: [["groupby"], ["sum"]],
          testes: [["assert _out.strip() == 'SP'", "A UF de maior gasto é SP"]],
          dicas: ["Primeiro agrupe, depois agregue.", "A agregação é uma soma.", "`groupby` e `sum`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "A partir de `compras.csv`, crie `resumo` com uma linha por categoria (no índice) e as colunas `pedidos` (contagem), `gasto` (soma do total) e `maior` (maior total), nesta ordem e ordenado por `gasto` decrescente.",
          inicial: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]
`,
          testes: [
            ["assert list(resumo.columns) == ['pedidos', 'gasto', 'maior']", "As colunas devem ser pedidos, gasto e maior"],
            ["assert resumo.index.tolist() == ['ti', 'frete', 'papelaria', 'embalagem', 'limpeza'], resumo.index.tolist()", "As categorias devem estar ordenadas por gasto decrescente"],
            ["g = df.groupby('categoria')['total']\nassert (resumo['pedidos'] == g.count()[resumo.index]).all() and np.allclose(resumo['gasto'], g.sum()[resumo.index]) and np.allclose(resumo['maior'], g.max()[resumo.index])", "Os valores de contagem, soma e máximo devem estar corretos"],
          ],
          dicas: ["Use a agregação nomeada com `agg`.", "`pedidos=('pedido', 'count')`, `gasto=('total', 'sum')`, `maior=('total', 'max')`.", "Termine com `.sort_values('gasto', ascending=False)`."],
          solucao: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]

resumo = (
    df.groupby("categoria")
      .agg(pedidos=("pedido", "count"), gasto=("total", "sum"), maior=("total", "max"))
      .sort_values("gasto", ascending=False)
)
print(resumo)
`,
          comentario: "Quebrar a cadeia de métodos em várias linhas, dentro de parênteses, é um estilo comum e legível no pandas.",
        },
      ],
    },
    {
      id: "merge",
      titulo: "pandas: junções",
      explicacao: [
        "`merge` junta tabelas por uma chave em comum, como o PROCV do Excel ou o JOIN do SQL: `compras.merge(fornecedores, on='fornecedor', how='left')`.",
        "Tipos de junção (`how`): `inner` (só as chaves presentes nas duas), `left` (todas da esquerda), `right` e `outer` (todas de ambas).",
        "`indicator=True` cria a coluna `_merge`, que mostra de onde veio cada linha: ótimo para achar registros sem par.",
        "Cuidado com chaves **duplicadas**: cada combinação vira uma linha e os totais incham. `validate='many_to_one'` faz o pandas reclamar se a tabela da direita tiver chaves repetidas.",
        "`pd.concat([a, b])` empilha tabelas com as mesmas colunas, por exemplo, arquivos mensais.",
      ],
      exemplo: r`
import pandas as pd

compras = pd.read_csv("compras.csv", sep=";", decimal=",")
compras["total"] = compras["qtd"] * compras["preco_unit"]
forn = pd.read_csv("fornecedores.csv")
print(forn)

junto = compras.merge(forn[["fornecedor", "prazo_medio", "nota"]], on="fornecedor", how="left")
print(junto[["pedido", "fornecedor", "total", "nota"]].head())
print(junto["nota"].isna().sum(), "compras de fornecedor sem cadastro")

todos = forn.merge(compras, on="fornecedor", how="left", indicator=True)
print(todos.loc[todos["_merge"] == "left_only", "fornecedor"].tolist(), "sem compras")

print(pd.concat([compras.head(3), compras.iloc[3:5]]).shape)
`,
      erro: {
        codigo: r`
import pandas as pd
precos = pd.DataFrame({"produto": ["A", "A", "B"], "preco": [10, 11, 20]})
vendas = pd.DataFrame({"produto": ["A", "B"], "qtd": [5, 2]})
r = vendas.merge(precos, on="produto")
print(len(vendas), "->", len(r))
print(r)
`,
        explicacao: "O produto A aparece duas vezes na tabela de preços, então a venda de A foi duplicada. Não dá erro, mas os totais saem errados. Use `validate='many_to_one'` para o pandas avisar, e corrija a tabela de preços antes de juntar.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
import pandas as pd
a = pd.DataFrame({"id": [1, 2, 3], "x": ["a", "b", "c"]})
b = pd.DataFrame({"id": [2, 3, 4], "y": [20, 30, 40]})
print(len(a.merge(b, on="id")), len(a.merge(b, on="id", how="left")), len(a.merge(b, on="id", how="outer")))
`,
          opcoes: ["2 3 4", "3 3 4", "2 2 4", "2 3 3"],
          resposta: 0,
          dicas: ["`inner`: ids presentes nas duas tabelas.", "`left`: todos os ids de `a`.", "`outer`: todos os ids de qualquer uma das duas."],
          comentario: "inner = {2, 3}; left = {1, 2, 3}; outer = {1, 2, 3, 4}.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Você quer manter **todas** as compras, inclusive as de fornecedores sem cadastro. Qual junção usar?",
          opcoes: ["`compras.merge(forn, on='fornecedor', how='inner')`", "`compras.merge(forn, on='fornecedor', how='left')`", "`forn.merge(compras, on='fornecedor', how='left')`", "`pd.concat([compras, forn])`"],
          resposta: 1,
          dicas: ["A tabela que não pode perder linhas fica à esquerda.", "`inner` descartaria as compras sem par.", "A terceira opção mantém todos os fornecedores, não todas as compras."],
          comentario: "Nas compras sem cadastro, as colunas do fornecedor ficam com NaN, e isso já serve como alerta.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete a junção de vendas com metas para contar quantos meses e regiões bateram a meta.",
          codigo: r`
import pandas as pd
vendas = pd.read_csv("vendas.csv")
metas = pd.read_csv("metas.csv")
df = vendas.merge(metas, ___="regiao", how="___")
df["atingiu"] = df["valor"] >= df["meta_mensal"]
print(df["atingiu"].sum())
`,
          respostas: [["on"], ["left", "inner"]],
          testes: [["assert _out.strip() == '13'", "Devem ser 13 combinações de mês e região que bateram a meta"]],
          dicas: ["O primeiro parâmetro diz qual é a coluna-chave.", "Todas as regiões têm meta, então `left` e `inner` dão o mesmo resultado aqui.", "`on` e `left`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Junte `compras.csv` (com a coluna `total`) a `fornecedores.csv`. Crie `sem_cadastro`, a lista ordenada dos fornecedores que aparecem nas compras mas não no cadastro, e `nota_ponderada`, a média das notas ponderada pelo gasto, considerando só as compras com fornecedor cadastrado (arredondada em 2 casas).",
          inicial: r`
import pandas as pd
compras = pd.read_csv("compras.csv", sep=";", decimal=",")
compras["total"] = compras["qtd"] * compras["preco_unit"]
forn = pd.read_csv("fornecedores.csv")
`,
          testes: [
            ["assert sem_cadastro == ['Épsilon Tech']", "`sem_cadastro` deve ser ['Épsilon Tech']"],
            ["c = compras.merge(forn, on='fornecedor')\nesperado = round((c['nota'] * c['total']).sum() / c['total'].sum(), 2)\nassert nota_ponderada == esperado, (nota_ponderada, esperado)", "`nota_ponderada` deve ser a média das notas ponderada pelo gasto"],
          ],
          dicas: ["Junte com `how='left'` e `indicator=True` (ou procure as notas ausentes).", "Os sem cadastro são as linhas com `_merge == 'left_only'`; use `sorted(set(...))` nos nomes.", "Média ponderada: `(nota * total).sum() / total.sum()`, só nas linhas com nota."],
          solucao: r`
import pandas as pd
compras = pd.read_csv("compras.csv", sep=";", decimal=",")
compras["total"] = compras["qtd"] * compras["preco_unit"]
forn = pd.read_csv("fornecedores.csv")

j = compras.merge(forn[["fornecedor", "nota"]], on="fornecedor", how="left", indicator=True)
sem_cadastro = sorted(j.loc[j["_merge"] == "left_only", "fornecedor"].unique())

cad = j[j["_merge"] == "both"]
nota_ponderada = round((cad["nota"] * cad["total"]).sum() / cad["total"].sum(), 2)
print(sem_cadastro, nota_ponderada)
`,
        },
      ],
    },
    {
      id: "matplotlib",
      titulo: "Gráficos com matplotlib",
      explicacao: [
        "O **matplotlib** é a biblioteca de gráficos mais usada em Python. No estilo recomendado, você cria a figura e os eixos com `fig, ax = plt.subplots()` e desenha nos eixos: `ax.plot`, `ax.bar`, `ax.barh`, `ax.scatter`, `ax.hist`.",
        "Sempre dê contexto: `ax.set_title`, `ax.set_xlabel`, `ax.set_ylabel` e, com várias séries, `ax.legend()`.",
        "Escolha pelo objetivo: **linha** para evolução no tempo; **barras** (horizontais e ordenadas) para comparar categorias; **dispersão** para relação entre duas variáveis; **histograma** para distribuição.",
        "O pandas desenha direto: `serie.plot(kind='bar', ax=ax)`. Para salvar em arquivo, use `fig.savefig('grafico.png', dpi=150)`.",
        "> No Ensaio, os gráficos criados aparecem automaticamente abaixo da saída.",
      ],
      exemplo: r`
import pandas as pd
import matplotlib.pyplot as plt

vendas = pd.read_csv("vendas.csv")
mensal = vendas.groupby("mes")["valor"].sum() / 1000

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.plot(mensal.index, mensal.values, marker="o", color="#1F2328")
ax.set_title("Vendas totais por mês (R$ mil)")
ax.set_xlabel("mês")
ax.set_ylabel("R$ mil")
ax.grid(alpha=0.3)

por_regiao = vendas.groupby("regiao")["valor"].sum().sort_values() / 1000
fig2, ax2 = plt.subplots(figsize=(7, 3))
ax2.barh(por_regiao.index, por_regiao.values, color="#C9A227")
ax2.set_title("Vendas no semestre por região (R$ mil)")
plt.tight_layout()
plt.show()
`,
      erro: {
        codigo: r`
import matplotlib.pyplot as plt
meses = ["jan", "fev", "mar"]
valores = [120, 95]
fig, ax = plt.subplots()
ax.plot(meses, valores)
`,
        explicacao: "x e y precisam ter o mesmo tamanho: `ValueError: x and y must have same first dimension`. Isso costuma acontecer quando um filtro removeu linhas de só uma das listas.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual tipo de gráfico é mais adequado para comparar o gasto total de 8 categorias?",
          opcoes: ["Pizza com 8 fatias", "Barras, de preferência horizontais e ordenadas", "Linha", "Dispersão"],
          resposta: 1,
          dicas: ["Comparar comprimentos é mais fácil do que comparar ângulos.", "Linha sugere continuidade, como no tempo.", "Ordenar ajuda a achar o maior e o menor."],
          comentario: "Barras horizontais também acomodam bem nomes longos de categorias.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "No estilo `fig, ax = plt.subplots()`, como se define o título do gráfico?",
          opcoes: ["`plt.title = 'x'`", "`ax.set_title('x')`", "`fig.title('x')`", "`ax.title('x')`"],
          resposta: 1,
          dicas: ["Os métodos dos eixos para configurar começam com `set_`.", "Como `set_xlabel` e `set_ylabel`.", "`ax.set_title`."],
          comentario: "`plt.title('x')` também funciona, mas age sobre o \"gráfico atual\", o que confunde quando há vários.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para desenhar um gráfico de barras.",
          codigo: r`
import matplotlib.pyplot as plt
meses = ["jan", "fev", "mar"]
valores = [120, 95, 140]
fig, ax = plt.subplots()
ax.___(meses, valores)
ax.set_ylabel("R$ mil")
ax.set_title("Compras por mês")
`,
          respostas: [["bar"]],
          testes: [["assert len(ax.patches) == 3", "O gráfico deve ter 3 barras"]],
          dicas: ["É um método do `ax`.", "Em inglês, barra é *bar*.", "`bar`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Gere um gráfico de **barras verticais** com o gasto total por categoria de `compras.csv`, ordenado do maior para o menor, com título e rótulo no eixo y. Guarde os eixos em `ax`.",
          inicial: r`
import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]
`,
          testes: [
            ["alturas = [p.get_height() for p in ax.patches]\nassert len(alturas) == 5, f'{len(alturas)} barras'", "Deve haver uma barra por categoria (5)"],
            ["alturas = [p.get_height() for p in ax.patches]\nesperado = sorted(df.groupby('categoria')['total'].sum(), reverse=True)\nassert np.allclose(alturas, esperado), alturas", "As barras devem mostrar o gasto por categoria, do maior para o menor"],
            ["assert ax.get_title() and ax.get_ylabel()", "O gráfico precisa de título e de rótulo no eixo y"],
          ],
          dicas: ["Agrupe e some: `df.groupby('categoria')['total'].sum().sort_values(ascending=False)`.", "`fig, ax = plt.subplots()` e `ax.bar(serie.index, serie.values)`.", "Não esqueça `ax.set_title(...)` e `ax.set_ylabel(...)`."],
          solucao: r`
import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]

por_cat = df.groupby("categoria")["total"].sum().sort_values(ascending=False)

fig, ax = plt.subplots(figsize=(7, 3.5))
ax.bar(por_cat.index, por_cat.values, color="#C9A227")
ax.set_title("Gasto por categoria no semestre")
ax.set_ylabel("R$")
plt.tight_layout()
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "curva-abc",
      titulo: "Curva ABC de compras",
      enunciado: [
        "A curva ABC ajuda a decidir onde negociar primeiro: poucos itens concentram a maior parte do gasto.",
        "A partir de `compras.csv`, crie o DataFrame `abc` com uma linha por **produto** e as colunas `produto`, `total` (gasto do produto), `perc_acum` (percentual acumulado do gasto, de 0 a 100, já incluindo o próprio produto) e `classe`. Ordene do maior para o menor gasto e reinicie o índice.",
        "Regra das classes: `A` se `perc_acum <= 80`, `B` se `<= 95`, e `C` no resto. Mostre quantos produtos ficaram em cada classe.",
      ],
      inicial: r`
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]
`,
      testes: [
        ["assert list(abc.columns) == ['produto', 'total', 'perc_acum', 'classe'], list(abc.columns)", "As colunas devem ser produto, total, perc_acum e classe"],
        [r`
t = df.groupby("produto")["total"].sum().sort_values(ascending=False)
p = t.cumsum() / t.sum() * 100
assert abc["produto"].tolist() == t.index.tolist(), "ordem dos produtos"
assert np.allclose(abc["total"], t.values) and np.allclose(abc["perc_acum"], p.values), "total ou percentual acumulado"
`, "Os produtos devem estar ordenados por gasto, com total e percentual acumulado corretos"],
        [r`
esperada = ["A" if v <= 80 else "B" if v <= 95 else "C" for v in abc["perc_acum"]]
assert abc["classe"].tolist() == esperada, abc["classe"].tolist()
assert list(abc.index) == list(range(len(abc)))
`, "As classes seguem a regra (A ≤ 80, B ≤ 95, C acima) e o índice foi reiniciado"],
      ],
      dicas: ["Comece com `df.groupby('produto')['total'].sum().sort_values(ascending=False).reset_index()`.", "`abc['perc_acum'] = abc['total'].cumsum() / abc['total'].sum() * 100`.", "Para a classe: `np.select([abc['perc_acum'] <= 80, abc['perc_acum'] <= 95], ['A', 'B'], default='C')`, ou uma compreensão de lista."],
      solucao: r`
import numpy as np
import pandas as pd
df = pd.read_csv("compras.csv", sep=";", decimal=",")
df["total"] = df["qtd"] * df["preco_unit"]

abc = (
    df.groupby("produto")["total"].sum()
      .sort_values(ascending=False)
      .reset_index()
)
abc["perc_acum"] = abc["total"].cumsum() / abc["total"].sum() * 100
abc["classe"] = np.select(
    [abc["perc_acum"] <= 80, abc["perc_acum"] <= 95],
    ["A", "B"],
    default="C",
)
print(abc.round(1))
print(abc["classe"].value_counts().sort_index())
`,
      comentario: "Com poucos dados, a curva fica \"degrau\". Em bases reais, com milhares de itens, ela mostra a regra de Pareto: cerca de 20% dos itens respondem por 80% do gasto.",
    },
    {
      id: "vendas-metas",
      titulo: "Vendas × metas por região",
      enunciado: [
        "Monte o placar do semestre. Crie o DataFrame `placar` com uma linha por região (no índice) e as colunas:",
        "- `vendido`: soma das vendas no semestre;",
        "- `meta`: meta do semestre (meta mensal × número de meses de venda da região);",
        "- `atingimento`: vendido / meta × 100, arredondado em 1 casa;",
        "- `meses_batidos`: em quantos meses a região vendeu pelo menos a meta mensal.",
        "Ordene por `atingimento` decrescente.",
      ],
      inicial: r`
import pandas as pd
vendas = pd.read_csv("vendas.csv")
metas = pd.read_csv("metas.csv")
`,
      testes: [
        ["assert list(placar.columns) == ['vendido', 'meta', 'atingimento', 'meses_batidos'], list(placar.columns)", "As colunas devem ser vendido, meta, atingimento e meses_batidos"],
        [r`
v = vendas.merge(metas, on="regiao")
vendido = v.groupby("regiao")["valor"].sum()
meta = v.groupby("regiao")["meta_mensal"].sum()
ating = (vendido / meta * 100).round(1)
assert placar.index.tolist() == ating.sort_values(ascending=False).index.tolist(), placar.index.tolist()
assert np.allclose(placar.loc[vendido.index, "vendido"], vendido) and np.allclose(placar.loc[meta.index, "meta"], meta)
assert np.allclose(placar.loc[ating.index, "atingimento"], ating)
`, "Vendido, meta e atingimento corretos, ordenados por atingimento"],
        ["assert placar['meses_batidos'].to_dict() == {'Centro-Oeste': 4, 'Nordeste': 2, 'Sudeste': 3, 'Sul': 4} or dict(sorted(placar['meses_batidos'].to_dict().items())) == {'Centro-Oeste': 4, 'Nordeste': 2, 'Sudeste': 3, 'Sul': 4}", "`meses_batidos`: Centro-Oeste 4, Nordeste 2, Sudeste 3, Sul 4"],
      ],
      dicas: ["Junte primeiro: `v = vendas.merge(metas, on='regiao')` e crie `v['bateu'] = v['valor'] >= v['meta_mensal']`.", "Agregue com `groupby('regiao').agg(vendido=('valor', 'sum'), meta=('meta_mensal', 'sum'), meses_batidos=('bateu', 'sum'))`.", "Calcule o atingimento depois, reordene as colunas com `placar[[...]]` e ordene com `sort_values`."],
      solucao: r`
import pandas as pd
vendas = pd.read_csv("vendas.csv")
metas = pd.read_csv("metas.csv")

v = vendas.merge(metas, on="regiao", how="left")
v["bateu"] = v["valor"] >= v["meta_mensal"]

placar = v.groupby("regiao").agg(
    vendido=("valor", "sum"),
    meta=("meta_mensal", "sum"),       # meta mensal somada em cada mês = meta do semestre
    meses_batidos=("bateu", "sum"),
)
placar["atingimento"] = (placar["vendido"] / placar["meta"] * 100).round(1)
placar = placar[["vendido", "meta", "atingimento", "meses_batidos"]].sort_values("atingimento", ascending=False)
print(placar)
`,
    },
    {
      id: "grafico-evolucao",
      titulo: "Gráfico de evolução mensal por região",
      enunciado: [
        "Faça um gráfico de **linhas** com a evolução mensal das vendas de cada região (uma linha por região), com legenda, título e rótulos nos eixos. Guarde os eixos em `ax`.",
        "Dica de leitura: valores em R$ mil deixam o eixo y mais limpo.",
      ],
      inicial: r`
import pandas as pd
import matplotlib.pyplot as plt
vendas = pd.read_csv("vendas.csv")
`,
      testes: [
        ["assert len(ax.get_lines()) >= 4, f'{len(ax.get_lines())} linhas'", "Deve haver pelo menos uma linha por região (4)"],
        ["rotulos = {l.get_label() for l in ax.get_lines()}\nassert {'Sudeste', 'Sul', 'Nordeste', 'Centro-Oeste'} <= rotulos, rotulos", "As linhas devem ter os nomes das regiões como rótulo"],
        ["assert ax.get_legend() is not None", "O gráfico precisa de legenda"],
        ["assert ax.get_title() and ax.get_xlabel() and ax.get_ylabel()", "O gráfico precisa de título e rótulos nos dois eixos"],
      ],
      dicas: ["Monte uma tabela mês × região: `vendas.pivot_table(index='mes', columns='regiao', values='valor', aggfunc='sum')`.", "Com `fig, ax = plt.subplots()`, desenhe com `tabela.plot(ax=ax, marker='o')`: cada coluna vira uma linha com o nome da região.", "Complete com `ax.set_title`, `ax.set_xlabel`, `ax.set_ylabel` e `ax.legend(title='Região')`."],
      solucao: r`
import pandas as pd
import matplotlib.pyplot as plt
vendas = pd.read_csv("vendas.csv")

tabela = vendas.pivot_table(index="mes", columns="regiao", values="valor", aggfunc="sum") / 1000

fig, ax = plt.subplots(figsize=(8, 4))
tabela.plot(ax=ax, marker="o")            # uma linha por coluna (região)
ax.set_title("Vendas mensais por região, 1º semestre de 2024")
ax.set_xlabel("mês")
ax.set_ylabel("R$ mil")
ax.grid(alpha=0.3)
ax.legend(title="Região", ncol=2)
plt.tight_layout()
`,
    },
  ],
}));
