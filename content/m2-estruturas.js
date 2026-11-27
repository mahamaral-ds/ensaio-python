Ensaio.modulo((r) => ({
  id: "m2",
  ordem: 2,
  titulo: "Estruturas de dados",
  resumo: "Listas, tuplas, dicionários, conjuntos, fatiamento e compreensões.",
  licoes: [
    {
      id: "listas",
      titulo: "Listas",
      explicacao: [
        "Uma **lista** guarda vários valores em ordem: `precos = [12.5, 8.0, 31.9]`. Pode misturar tipos, mas o comum é guardar itens do mesmo tipo.",
        "Acesse por índice (`precos[0]`, `precos[-1]`) e altere no lugar: `precos[1] = 9.5`. Listas são **mutáveis**.",
        "Para acrescentar no fim, use `precos.append(10.0)`. Os outros métodos ficam para a próxima lição.",
        "Funções que aceitam listas: `len`, `sum`, `min`, `max` e `sorted` (devolve uma nova lista ordenada).",
        "> Atribuir uma lista a outro nome não copia a lista: os dois nomes passam a apontar para o mesmo objeto. Para copiar, use `lista.copy()`.",
      ],
      exemplo: r`
precos = [12.5, 8.0, 31.9, 4.25]
print(precos[0], precos[-1], len(precos))
precos[1] = 9.5
precos.append(10.0)
print(precos)
print(sum(precos), min(precos), max(precos))
print(sorted(precos))
print(31.9 in precos)

pedidos = [["P01", 3], ["P02", 7]]
print(pedidos[1][0], pedidos[1][1])
`,
      erro: {
        codigo: r`
itens = ["a", "b", "c"]
print(itens[3])
`,
        explicacao: "Uma lista com 3 itens tem índices 0, 1 e 2. Pedir `itens[3]` gera `IndexError`. Use `itens[-1]` para o último ou confira com `len(itens)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
a = [1, 2, 3]
b = a
b[0] = 99
print(a)
`,
          opcoes: ["[1, 2, 3]", "[99, 2, 3]", "[99]", "Erro"],
          resposta: 1,
          dicas: ["`b = a` cria uma cópia ou um segundo nome para a mesma lista?", "Os dois nomes apontam para o mesmo objeto.", "Alterar por `b` altera o que `a` vê."],
          comentario: "`b = a` não copia: as duas variáveis apontam para a mesma lista. Para uma cópia independente, use `b = a.copy()` ou `b = a[:]`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual expressão devolve o último elemento de qualquer lista `x` que não esteja vazia?",
          opcoes: ["`x[len(x)]`", "`x[-1]`", "`x[last]`", "`x[0]`"],
          resposta: 1,
          dicas: ["`len(x)` é uma posição depois da última.", "Índices negativos contam a partir do fim.", "`-1` é o último."],
          comentario: "`x[-1]` é o último, `x[-2]` o penúltimo. `x[len(x)]` dá `IndexError`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete com as funções que calculam a soma e o maior valor da lista.",
          codigo: r`
vendas = [300, 120, 560, 90]
total = ___(vendas)
maior = ___(vendas)
print(total, maior)
`,
          respostas: [["sum"], ["max"]],
          testes: [["assert total == 1070 and maior == 560", "`total` deve ser 1070 e `maior` deve ser 560"]],
          dicas: ["São funções prontas do Python.", "Uma soma, a outra pega o máximo.", "`sum` e `max`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Cada linha de `vendas` tem as vendas de uma loja em dois meses. Crie `total_por_loja`, uma lista com a soma de cada linha (use `for` e `append`), e `total_geral`.",
          inicial: r`
vendas = [[10, 20], [30, 40], [50, 60]]
`,
          testes: [
            ["assert total_por_loja == [30, 70, 110]", "`total_por_loja` deve ser [30, 70, 110]"],
            ["assert total_geral == 210", "`total_geral` deve ser 210"],
          ],
          dicas: ["Comece com `total_por_loja = []`.", "Cada `linha` do laço é uma lista: some com `sum(linha)`.", "`total_geral` pode ser `sum(total_por_loja)`."],
          solucao: r`
vendas = [[10, 20], [30, 40], [50, 60]]
total_por_loja = []
for linha in vendas:              # cada linha é uma lista
    total_por_loja.append(sum(linha))
total_geral = sum(total_por_loja)
print(total_por_loja, total_geral)
`,
        },
      ],
    },
    {
      id: "metodos-lista",
      titulo: "Métodos de lista e ordenação",
      explicacao: [
        "Para incluir: `append(x)` no fim, `insert(i, x)` numa posição, `extend(outra)` para acrescentar vários itens.",
        "Para retirar: `pop()` tira e devolve o último (`pop(0)` o primeiro), `remove(x)` tira a **primeira** ocorrência de `x`.",
        "Para consultar: `index(x)` (posição) e `count(x)` (quantas vezes aparece).",
        "Para ordenar: `lista.sort()` altera a própria lista e devolve `None`; `sorted(lista)` devolve uma lista nova. Os dois aceitam `reverse=True` e `key=`, uma função que diz o que comparar: `sorted(nomes, key=str.lower)`.",
      ],
      exemplo: r`
fila = ["P01", "P02"]
fila.append("P03")
fila.insert(0, "URGENTE")
print(fila)
primeiro = fila.pop(0)
print(primeiro, fila)
fila.remove("P02")
print(fila)

valores = [40, 10, 30, 20]
valores.sort(reverse=True)
print(valores)
nomes = ["beta", "Alfa", "gama"]
print(sorted(nomes), sorted(nomes, key=str.lower))
print([3, 1, 3, 3].count(3))
`,
      erro: {
        codigo: r`
lista = [3, 1, 2]
ordenada = lista.sort()
print(ordenada)
`,
        explicacao: "`sort()` ordena a lista no lugar e devolve `None`, então `ordenada` fica `None`. Use `ordenada = sorted(lista)` para obter uma lista nova, ou chame `lista.sort()` sozinho e use `lista` depois.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
x = [5, 3, 8]
y = x.append(1)
print(x, y)
`,
          opcoes: ["[5, 3, 8, 1] None", "[5, 3, 8, 1] [5, 3, 8, 1]", "[5, 3, 8] [5, 3, 8, 1]", "Erro"],
          resposta: 0,
          dicas: ["`append` altera a lista ou cria uma nova?", "O que um método que altera no lugar costuma devolver?", "Métodos que alteram a lista devolvem `None`."],
          comentario: "`append` altera `x` e devolve `None`. É o mesmo comportamento de `sort`, `insert` e `remove`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre `lista.sort()` e `sorted(lista)`?",
          opcoes: ["Nenhuma", "`sort()` altera a lista e devolve `None`; `sorted()` devolve uma lista nova", "`sorted()` altera a lista original", "`sort()` só funciona com números"],
          resposta: 1,
          dicas: ["Um é método da lista, o outro é uma função.", "Um deles preserva a lista original.", "`sorted` aceita qualquer coleção e devolve uma lista nova."],
          comentario: "Use `sorted` quando quiser manter a ordem original intacta, por exemplo, para comparar antes e depois.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O código deveria tirar da fila **todos** os pedidos cancelados (`'CANC'`), mas sobram alguns. Corrija.",
          inicial: r`
fila = ["P1", "CANC", "CANC", "P2", "CANC"]
fila.remove("CANC")
print(fila)
`,
          testes: [["assert fila == ['P1', 'P2']", "`fila` deve terminar como ['P1', 'P2']"]],
          dicas: ["`remove` tira só a primeira ocorrência.", "Repita a remoção enquanto ainda houver `'CANC'` na lista.", "`while 'CANC' in fila: fila.remove('CANC')`, ou uma compreensão (lição 7)."],
          solucao: r`
fila = ["P1", "CANC", "CANC", "P2", "CANC"]
# remove() tira só a primeira ocorrência: repetimos enquanto houver
while "CANC" in fila:
    fila.remove("CANC")
print(fila)
`,
          comentario: "A forma mais idiomática é criar uma lista nova: `fila = [p for p in fila if p != 'CANC']`.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie `por_preco` com os produtos ordenados do mais caro para o mais barato, **sem alterar** `produtos`. Use `sorted(produtos, key=lambda p: p[1], reverse=True)`, em que `lambda p: p[1]` diz para comparar pelo preço. Depois crie `mais_baratos` com os **nomes** dos dois mais baratos, do mais barato para o mais caro.",
          inicial: r`
produtos = [["Caneta", 2.5], ["Pasta", 12.0], ["Clips", 0.8], ["Grampeador", 25.9]]
`,
          testes: [
            ["assert [p[0] for p in por_preco] == ['Grampeador', 'Pasta', 'Caneta', 'Clips']", "`por_preco` deve ir do mais caro ao mais barato"],
            ["assert mais_baratos == ['Clips', 'Caneta']", "`mais_baratos` deve ser ['Clips', 'Caneta']"],
            ["assert produtos[0][0] == 'Caneta'", "A lista `produtos` original não deve ser alterada"],
          ],
          dicas: ["Para `por_preco`, use exatamente o `sorted` do enunciado.", "Os dois mais baratos são os dois últimos de `por_preco`, mas na ordem inversa.", "Ou ordene de forma crescente e pegue os dois primeiros nomes: `crescente[0][0]`, `crescente[1][0]`."],
          solucao: r`
produtos = [["Caneta", 2.5], ["Pasta", 12.0], ["Clips", 0.8], ["Grampeador", 25.9]]

# key diz o que comparar: o preço, na posição 1
por_preco = sorted(produtos, key=lambda p: p[1], reverse=True)

crescente = sorted(produtos, key=lambda p: p[1])
mais_baratos = [crescente[0][0], crescente[1][0]]
print(por_preco)
print(mais_baratos)
`,
        },
      ],
    },
    {
      id: "tuplas",
      titulo: "Tuplas e desempacotamento",
      explicacao: [
        "Uma **tupla** é como uma lista que não pode ser alterada: `ponto = (10, 20)`. Use para registros de tamanho fixo, como `(nome, uf, valor)`.",
        "**Desempacotamento** distribui os itens em variáveis: `empresa, uf, valor = registro`. Funciona com qualquer sequência, inclusive listas e strings.",
        "Trocar valores fica numa linha: `a, b = b, a`. Com `*`, um nome recolhe o que sobrar: `primeiro, *resto = valores`.",
        "Tupla de um elemento precisa de vírgula: `(5,)`. Sem a vírgula, `(5)` é só o número 5 entre parênteses.",
        "`zip(a, b)` junta duas sequências em pares, ótimo para percorrer colunas lado a lado.",
      ],
      exemplo: r`
registro = ("Alfa", "SP", 1520.75)
empresa, uf, valor = registro
print(f"{empresa} ({uf}): {valor}")

a, b = 1, 2
a, b = b, a
print(a, b)

um = (5,)
print(type(um), type((5)))

nomes = ["Alfa", "Beta"]
valores = [100, 200]
for n, v in zip(nomes, valores):
    print(n, v)

primeiro, *resto = [1, 2, 3, 4]
print(primeiro, resto)
`,
      erro: {
        codigo: r`
t = (1, 2, 3)
t[0] = 9
`,
        explicacao: "Tuplas são imutáveis: `TypeError`. Se precisa alterar, converta (`lista = list(t)`) ou crie uma tupla nova: `t = (9,) + t[1:]`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
a, b, c = "xyz"
print(c, a)
`,
          opcoes: ["z x", "x z", "xyz", "Erro"],
          resposta: 0,
          dicas: ["Uma string é uma sequência.", "Cada caractere vai para uma variável.", "`a` = x, `b` = y, `c` = z."],
          comentario: "O desempacotamento funciona com qualquer sequência de tamanho certo.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual destes cria uma tupla com um único elemento?",
          opcoes: ["`(7)`", "`(7,)`", "`tuple(7)`", "`[7]`"],
          resposta: 1,
          dicas: ["Os parênteses sozinhos só agrupam.", "O que define a tupla é a vírgula.", "`tuple(7)` dá erro: 7 não é uma sequência."],
          comentario: "É a vírgula que cria a tupla: `x = 7,` também funciona.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete o desempacotamento para que `uf` receba o estado do cliente.",
          codigo: r`
cliente = ("Gama Logística", "RJ", 42)
nome, ___, pedidos = cliente
print(uf)
`,
          respostas: [["uf"]],
          testes: [["assert uf == 'RJ'", "`uf` deve ser 'RJ'"]],
          dicas: ["A ordem das variáveis segue a ordem da tupla.", "O segundo item é o estado.", "O nome que falta é `uf`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Use `zip` para combinar `meses` e `valores` numa lista de tuplas `pares`. Depois descubra `melhor_mes`, o mês com o maior valor.",
          inicial: r`
meses = ["jan", "fev", "mar"]
valores = [1200, 980, 1430]
`,
          testes: [
            ["assert pares == [('jan', 1200), ('fev', 980), ('mar', 1430)]", "`pares` deve ser [('jan', 1200), ('fev', 980), ('mar', 1430)]"],
            ["assert melhor_mes == 'mar'", "`melhor_mes` deve ser 'mar'"],
          ],
          dicas: ["`list(zip(meses, valores))` cria a lista de pares.", "Percorra os pares guardando o maior valor visto até agora.", "Alternativa: `max(pares, key=lambda p: p[1])[0]`."],
          solucao: r`
meses = ["jan", "fev", "mar"]
valores = [1200, 980, 1430]

pares = list(zip(meses, valores))

melhor_mes, melhor_valor = pares[0]
for mes, valor in pares:          # desempacota cada tupla
    if valor > melhor_valor:
        melhor_mes, melhor_valor = mes, valor
print(pares, melhor_mes)
`,
        },
      ],
    },
    {
      id: "dicionarios",
      titulo: "Dicionários",
      explicacao: [
        "Um **dicionário** associa chaves a valores: `estoque = {'caneta': 120, 'papel': 35}`. Buscar pela chave é muito rápido, mesmo com milhões de itens.",
        "Leia com `estoque['papel']` (dá erro se a chave não existir) ou com `estoque.get('papel', 0)` (devolve o padrão). Crie ou altere com `estoque['grampo'] = 15` e remova com `del estoque['grampo']`.",
        "Percorra com `.items()` (chave e valor), `.keys()` ou `.values()`.",
        "Padrão de contagem e soma por grupo: `contagem[uf] = contagem.get(uf, 0) + 1`. É a versão manual do `groupby` do pandas.",
      ],
      exemplo: r`
estoque = {"caneta": 120, "papel": 35, "clips": 400}
print(estoque["papel"])
print(estoque.get("grampo", 0))
estoque["grampo"] = 15
estoque["papel"] -= 5
print(estoque)

for item, qtd in estoque.items():
    print(f"{item:<8}{qtd:>5}")

contagem = {}
for uf in ["SP", "RJ", "SP", "MG", "SP"]:
    contagem[uf] = contagem.get(uf, 0) + 1
print(contagem)
`,
      erro: {
        codigo: r`
precos = {"caneta": 2.5}
print(precos["Caneta"])
`,
        explicacao: "As chaves diferenciam maiúsculas: `'Caneta'` não existe, então dá `KeyError`. Padronize as chaves (por exemplo, sempre minúsculas) ou use `.get()` quando a chave pode faltar.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
d = {"a": 1, "b": 2}
d["a"] = 10
d["c"] = 3
print(len(d), d["a"])
`,
          opcoes: ["3 10", "2 10", "3 1", "Erro"],
          resposta: 0,
          dicas: ["Atribuir a uma chave que já existe substitui o valor.", "Atribuir a uma chave nova cria um item.", "Ficam as chaves a, b e c."],
          comentario: "`d['a'] = 10` substitui; `d['c'] = 3` cria. O dicionário fica com 3 chaves.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual forma lê a chave `'frete'` de `pedido` e devolve 0 quando ela não existe?",
          opcoes: ["`pedido['frete'] or 0`", "`pedido.get('frete', 0)`", "`pedido.frete`", "`pedido['frete', 0]`"],
          resposta: 1,
          dicas: ["Uma das opções dá `KeyError` antes de chegar ao `or`.", "Existe um método feito para isso.", "`.get(chave, padrao)`."],
          comentario: "`.get` nunca dá `KeyError`. Sem o segundo argumento, devolve `None`.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O código deveria contar quantas compras cada fornecedor teve, mas dá erro na primeira volta. Corrija.",
          inicial: r`
compras = ["Alfa", "Beta", "Alfa", "Gama", "Alfa", "Beta"]
por_fornecedor = {}
for f in compras:
    por_fornecedor[f] += 1
print(por_fornecedor)
`,
          testes: [["assert por_fornecedor == {'Alfa': 3, 'Beta': 2, 'Gama': 1}", "A contagem deve ser {'Alfa': 3, 'Beta': 2, 'Gama': 1}"]],
          dicas: ["Rode e leia o erro: qual chave não existe?", "Na primeira vez que um fornecedor aparece, ele ainda não está no dicionário.", "`por_fornecedor[f] = por_fornecedor.get(f, 0) + 1`."],
          solucao: r`
compras = ["Alfa", "Beta", "Alfa", "Gama", "Alfa", "Beta"]
por_fornecedor = {}
for f in compras:
    # get devolve 0 quando o fornecedor aparece pela primeira vez
    por_fornecedor[f] = por_fornecedor.get(f, 0) + 1
print(por_fornecedor)
`,
          comentario: "A biblioteca padrão tem atalhos para isso: `collections.Counter(compras)` faz a contagem numa linha.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Cada pedido é uma tupla `(categoria, valor)`. Monte o dicionário `total_por_categoria` e descubra `categoria_top`, a de maior total.",
          inicial: r`
pedidos = [("papelaria", 120.0), ("limpeza", 80.5), ("papelaria", 45.0), ("ti", 900.0), ("limpeza", 19.5)]
`,
          testes: [
            ["assert total_por_categoria == {'papelaria': 165.0, 'limpeza': 100.0, 'ti': 900.0}", "`total_por_categoria` deve ser {'papelaria': 165.0, 'limpeza': 100.0, 'ti': 900.0}"],
            ["assert categoria_top == 'ti'", "`categoria_top` deve ser 'ti'"],
          ],
          dicas: ["Desempacote cada pedido no `for`: `for categoria, valor in pedidos:`.", "Some com o padrão `d[k] = d.get(k, 0) + valor`.", "Para a maior: `max(total_por_categoria, key=total_por_categoria.get)`."],
          solucao: r`
pedidos = [("papelaria", 120.0), ("limpeza", 80.5), ("papelaria", 45.0), ("ti", 900.0), ("limpeza", 19.5)]

total_por_categoria = {}
for categoria, valor in pedidos:
    total_por_categoria[categoria] = total_por_categoria.get(categoria, 0) + valor

# max sobre as chaves, comparando pelo valor de cada uma
categoria_top = max(total_por_categoria, key=total_por_categoria.get)
print(total_por_categoria, categoria_top)
`,
        },
      ],
    },
    {
      id: "conjuntos",
      titulo: "Conjuntos",
      explicacao: [
        "Um **conjunto** (`set`) guarda valores **sem repetição** e sem ordem: `{'SP', 'RJ'}`. Converter uma lista em conjunto remove os duplicados: `set(codigos)`.",
        "Testar se um valor pertence (`x in conjunto`) é muito rápido, bem mais que numa lista grande.",
        "Operações de conjunto respondem perguntas comuns de cruzamento de cadastros: `a | b` (união), `a & b` (interseção), `a - b` (o que está em `a` e não em `b`) e `a ^ b` (está em só um dos dois).",
        "> `{}` cria um dicionário vazio. Para um conjunto vazio, use `set()`.",
      ],
      exemplo: r`
compras_jan = {"Alfa", "Beta", "Gama"}
compras_fev = {"Beta", "Delta", "Gama"}
print(sorted(compras_jan | compras_fev))
print(sorted(compras_jan & compras_fev))
print(compras_jan - compras_fev)
print(sorted(compras_jan ^ compras_fev))

codigos = ["A1", "B2", "A1", "C3", "B2"]
unicos = set(codigos)
print(len(codigos), len(unicos))
unicos.add("D4")
print("D4" in unicos, sorted(unicos))
`,
      erro: {
        codigo: r`
vazio = {}
vazio.add(1)
`,
        explicacao: "`{}` é um dicionário vazio, que não tem `.add`: `AttributeError`. Para um conjunto vazio, escreva `vazio = set()`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
print(len({1, 2, 2, 3, 3, 3}))
`,
          opcoes: ["6", "3", "1", "Erro"],
          resposta: 1,
          dicas: ["Conjuntos aceitam repetição?", "Os valores repetidos são descartados.", "Sobram 1, 2 e 3."],
          comentario: "O conjunto fica `{1, 2, 3}`: três elementos.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "`jan` e `fev` são conjuntos de fornecedores. Qual expressão dá os que venderam em janeiro **e não** em fevereiro?",
          opcoes: ["`jan | fev`", "`jan & fev`", "`jan - fev`", "`fev - jan`"],
          resposta: 2,
          dicas: ["Você quer tirar de janeiro quem também está em fevereiro.", "É uma diferença.", "A ordem importa: quem vem primeiro é a base."],
          comentario: "`jan - fev`: começa com janeiro e retira quem aparece em fevereiro.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete com os operadores de interseção e de união.",
          codigo: r`
a = {"SP", "RJ", "MG"}
b = {"RJ", "BA"}
comuns = a ___ b
todos = a ___ b
print(comuns, todos)
`,
          respostas: [["&"], ["|"]],
          testes: [["assert comuns == {'RJ'} and todos == {'SP', 'RJ', 'MG', 'BA'}", "`comuns` deve ser {'RJ'} e `todos` deve ter os quatro estados"]],
          dicas: ["Os comuns estão nos dois.", "Todos estão em pelo menos um.", "`&` e `|`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Encontre `sem_cadastro`: uma **lista ordenada** com os CNPJs que aparecem em `notas`, mas não em `cadastro`. Crie também `qtd_unicos_notas` com quantos CNPJs diferentes aparecem nas notas.",
          inicial: r`
cadastro = ["11.111/0001-01", "22.222/0001-02", "33.333/0001-03"]
notas = ["22.222/0001-02", "44.444/0001-04", "11.111/0001-01", "44.444/0001-04", "55.555/0001-05"]
`,
          testes: [
            ["assert sem_cadastro == ['44.444/0001-04', '55.555/0001-05']", "`sem_cadastro` deve ser ['44.444/0001-04', '55.555/0001-05']"],
            ["assert isinstance(sem_cadastro, list)", "`sem_cadastro` deve ser uma lista"],
            ["assert qtd_unicos_notas == 4", "`qtd_unicos_notas` deve ser 4"],
          ],
          dicas: ["Converta as duas listas em conjuntos.", "A diferença `set(notas) - set(cadastro)` dá os CNPJs sem cadastro.", "`sorted(...)` transforma o conjunto numa lista ordenada."],
          solucao: r`
cadastro = ["11.111/0001-01", "22.222/0001-02", "33.333/0001-03"]
notas = ["22.222/0001-02", "44.444/0001-04", "11.111/0001-01", "44.444/0001-04", "55.555/0001-05"]

sem_cadastro = sorted(set(notas) - set(cadastro))   # diferença, depois ordena
qtd_unicos_notas = len(set(notas))                  # set remove repetidos
print(sem_cadastro, qtd_unicos_notas)
`,
        },
      ],
    },
    {
      id: "fatiamento",
      titulo: "Fatiamento",
      explicacao: [
        "Uma **fatia** pega um trecho de uma sequência: `seq[inicio:fim]`. O início entra e o fim não, como no `range`.",
        "Os limites podem ficar vazios: `seq[:3]` (os três primeiros), `seq[3:]` (do quarto em diante), `seq[-2:]` (os dois últimos).",
        "Um terceiro número é o passo: `seq[::2]` pega um sim, um não; `seq[::-1]` inverte.",
        "Funciona igual em listas, tuplas e strings. Fatiar uma lista cria uma lista nova: `copia = lista[:]`.",
      ],
      exemplo: r`
meses = ["jan", "fev", "mar", "abr", "mai", "jun"]
print(meses[0:3])
print(meses[:2], meses[4:])
print(meses[-2:])
print(meses[::2])
print(meses[::-1])

codigo = "NF-2024-00157"
print(codigo[3:7], codigo[-5:])

copia = meses[:]
copia[0] = "JAN"
print(meses[0], copia[0])
`,
      erro: {
        codigo: r`
texto = "abcdef"
print(texto[1:3])   # esperava "bcd"
`,
        explicacao: "O fim da fatia não entra: `[1:3]` pega as posições 1 e 2 (`'bc'`). Pense no fim como \"até antes de\". Para `'bcd'`, use `[1:4]`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
s = "analista"
print(s[2:5], s[-3:])
`,
          opcoes: ["ali sta", "nal sta", "ali ta", "alis sta"],
          resposta: 0,
          dicas: ["Numere as letras de `analista` a partir de 0.", "`[2:5]` pega as posições 2, 3 e 4.", "`[-3:]` são as três últimas."],
          comentario: "Posições 2, 3 e 4 formam `ali`; as três últimas letras são `sta`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual fatia pega os 3 **últimos** elementos de `x`?",
          opcoes: ["`x[3:]`", "`x[-3:]`", "`x[:-3]`", "`x[-3]`"],
          resposta: 1,
          dicas: ["Índices negativos contam do fim.", "Comece três posições antes do fim e vá até o final.", "Sem número depois dos dois-pontos, a fatia vai até o fim."],
          comentario: "`x[-3:]` são os três últimos. `x[:-3]` é tudo menos os três últimos, e `x[-3]` é um único elemento.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete as fatias para extrair o ano e o dia da data.",
          codigo: r`
data = "2024-11-27"
ano = data[___]
mes = data[5:7]
dia = data[___]
print(ano, mes, dia)
`,
          respostas: [[":4", "0:4"], ["8:", "8:10", "-2:"]],
          testes: [["assert ano == '2024' and dia == '27'", "`ano` deve ser '2024' e `dia` deve ser '27'"]],
          dicas: ["O ano ocupa as posições 0 a 3.", "O dia são os dois últimos caracteres.", "`:4` e `8:` (ou `-2:`)."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "`vendas` tem 14 dias de vendas. Com fatias, crie `primeira_semana` (7 primeiros dias), `ultima_semana` (7 últimos), `variacao` (soma da última menos soma da primeira) e `dias_alternados` (dias nas posições 0, 2, 4...).",
          inicial: r`
vendas = [100, 120, 90, 110, 130, 80, 95, 140, 150, 120, 160, 170, 130, 110]
`,
          testes: [
            ["assert primeira_semana == [100, 120, 90, 110, 130, 80, 95]", "`primeira_semana` deve ter os 7 primeiros dias"],
            ["assert ultima_semana == [140, 150, 120, 160, 170, 130, 110]", "`ultima_semana` deve ter os 7 últimos dias"],
            ["assert variacao == 255", "`variacao` deve ser 255"],
            ["assert dias_alternados == [100, 90, 130, 95, 150, 160, 130]", "`dias_alternados` deve ser [100, 90, 130, 95, 150, 160, 130]"],
          ],
          dicas: ["`vendas[:7]` e `vendas[-7:]`.", "Use `sum` em cada semana.", "Passo 2: `vendas[::2]`."],
          solucao: r`
vendas = [100, 120, 90, 110, 130, 80, 95, 140, 150, 120, 160, 170, 130, 110]

primeira_semana = vendas[:7]
ultima_semana = vendas[-7:]
variacao = sum(ultima_semana) - sum(primeira_semana)   # 980 - 725
dias_alternados = vendas[::2]                          # passo 2
print(variacao, dias_alternados)
`,
        },
      ],
    },
    {
      id: "compreensoes",
      titulo: "Compreensões",
      explicacao: [
        "Uma **compreensão de lista** cria uma lista nova numa linha: `[expressao for item in colecao]`. Por exemplo, `[p * 1.1 for p in precos]`.",
        "Para filtrar, ponha um `if` no final: `[p for p in precos if p > 20]`.",
        "Para escolher entre dois valores, use a expressão condicional **no começo**: `['alto' if p > 20 else 'baixo' for p in precos]`.",
        "Também existem para dicionários (`{k: v for ...}`) e conjuntos (`{x for ...}`). Sem colchetes, dentro de `sum()` ou `max()`, vira uma expressão geradora, que nem cria a lista.",
        "> Se a compreensão não couber numa linha legível, um `for` comum costuma ser mais claro.",
      ],
      exemplo: r`
precos = [10.0, 25.5, 8.0, 40.0]
com_imposto = [round(p * 1.1, 2) for p in precos]
print(com_imposto)
caros = [p for p in precos if p > 20]
print(caros)
rotulos = ["alto" if p > 20 else "baixo" for p in precos]
print(rotulos)

nomes = ["alfa", "beta", "gama"]
print({n: len(n) for n in nomes})
print({uf.upper() for uf in ["sp", "SP", "rj"]})
print(sum(p for p in precos if p < 30))
`,
      erro: {
        codigo: r`
precos = [10, 25]
x = [p for p in precos if p > 20 else 0]
`,
        explicacao: "`SyntaxError`: o `if` do final é só filtro e não aceita `else`. Para escolher entre valores, a expressão condicional vai no começo: `[p if p > 20 else 0 for p in precos]`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
print([x * 2 for x in range(5) if x % 2 == 0])
`,
          opcoes: ["[0, 4, 8]", "[0, 2, 4, 6, 8]", "[2, 6]", "[4, 8]"],
          resposta: 0,
          dicas: ["Primeiro o filtro: quais `x` de 0 a 4 são pares?", "Os pares são 0, 2 e 4.", "Depois multiplique cada um por 2."],
          comentario: "O filtro deixa 0, 2 e 4; dobrando, fica [0, 4, 8].",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "`precos` é um dicionário produto → preço. Qual compreensão cria um dicionário com cada preço com 10% de desconto?",
          opcoes: ["`[k: v * 0.9 for k, v in precos.items()]`", "`{k: v * 0.9 for k, v in precos.items()}`", "`{v * 0.9 for v in precos}`", "`dict(v * 0.9 for v in precos)`"],
          resposta: 1,
          dicas: ["Dicionários usam chaves `{}` e o par `chave: valor`.", "Você precisa da chave e do valor ao mesmo tempo.", "`.items()` entrega os pares."],
          comentario: "A terceira opção cria um *conjunto* de preços, sem os nomes.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "A ideia é criar `limpos` só com os e-mails não vazios, sem espaços e em minúsculas. A compreensão tem um erro. Corrija.",
          inicial: r`
emails = [" Ana@Empresa.com", "bia@empresa.com ", "", "CAIO@empresa.com"]
limpos = [e.strip().lower() for e in emails if e else ""]
print(limpos)
`,
          testes: [["assert limpos == ['ana@empresa.com', 'bia@empresa.com', 'caio@empresa.com']", "`limpos` deve ter os 3 e-mails padronizados, sem o vazio"]],
          dicas: ["O `if` no final de uma compreensão é um filtro.", "Filtro não leva `else`.", "Basta `... for e in emails if e`: texto vazio é falso."],
          solucao: r`
emails = [" Ana@Empresa.com", "bia@empresa.com ", "", "CAIO@empresa.com"]
# o if do final é filtro: só passa quem é verdadeiro (texto não vazio)
limpos = [e.strip().lower() for e in emails if e]
print(limpos)
`,
          comentario: "Um e-mail feito só de espaços passaria no filtro. Para cobrir esse caso, filtre por `e.strip()`.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Cada item é `(nome, preco, quantidade)`. Com compreensões, crie `totais` (dicionário nome → preço × quantidade), `acima_100` (lista dos nomes cujo total passa de 100, na ordem original) e `total_geral`.",
          inicial: r`
itens = [("caneta", 2.5, 40), ("pasta", 12.0, 5), ("clips", 0.8, 200), ("toner", 189.9, 2)]
`,
          testes: [
            ["assert set(totais) == {'caneta', 'pasta', 'clips', 'toner'}", "`totais` deve ter os 4 produtos"],
            ["assert abs(totais['toner'] - 379.8) < 0.01 and abs(totais['clips'] - 160) < 0.01", "Os totais estão incorretos (toner deve ser 379.8, clips 160)"],
            ["assert acima_100 == ['clips', 'toner']", "`acima_100` deve ser ['clips', 'toner'] (caneta dá exatamente 100)"],
            ["assert abs(total_geral - 699.8) < 0.01", "`total_geral` deve ser 699.8"],
          ],
          dicas: ["Desempacote dentro da compreensão: `for nome, preco, qtd in itens`.", "`acima_100` pode ser feita sobre `totais.items()` com um filtro.", "`total_geral = sum(totais.values())`."],
          solucao: r`
itens = [("caneta", 2.5, 40), ("pasta", 12.0, 5), ("clips", 0.8, 200), ("toner", 189.9, 2)]

totais = {nome: preco * qtd for nome, preco, qtd in itens}
acima_100 = [nome for nome, total in totais.items() if total > 100]
total_geral = sum(totais.values())
print(totais, acima_100, round(total_geral, 2))
`,
          comentario: "Dicionários mantêm a ordem de inserção, então `acima_100` sai na mesma ordem de `itens`.",
        },
      ],
    },
  ],
  desafios: [
    {
      id: "fornecedores-repetidos",
      titulo: "Fornecedores repetidos no cadastro",
      enunciado: [
        "O cadastro de fornecedores foi alimentado à mão por várias pessoas e tem nomes repetidos, com espaços e caixa diferentes.",
        "Normalize cada nome com `strip()` e `title()`. Depois crie `duplicados`, uma lista **ordenada** com os nomes normalizados que aparecem mais de uma vez, e `unicos`, com o número de fornecedores diferentes.",
      ],
      inicial: r`
cadastro = ["Alfa Embalagens", "beta insumos", "ALFA EMBALAGENS ", "Gama Logística",
            "Beta Insumos", "Delta Papéis", "  gama logística"]
`,
      testes: [
        ["assert duplicados == ['Alfa Embalagens', 'Beta Insumos', 'Gama Logística']", "`duplicados` deve ser ['Alfa Embalagens', 'Beta Insumos', 'Gama Logística']"],
        ["assert unicos == 4", "`unicos` deve ser 4"],
      ],
      dicas: ["Crie primeiro a lista `normalizados` com uma compreensão.", "Conte cada nome normalizado num dicionário (ou use `normalizados.count(nome)`).", "`duplicados = sorted(n for n, c in contagem.items() if c > 1)` e `unicos = len(set(normalizados))`."],
      solucao: r`
cadastro = ["Alfa Embalagens", "beta insumos", "ALFA EMBALAGENS ", "Gama Logística",
            "Beta Insumos", "Delta Papéis", "  gama logística"]

normalizados = [nome.strip().title() for nome in cadastro]

contagem = {}
for nome in normalizados:
    contagem[nome] = contagem.get(nome, 0) + 1

duplicados = sorted(n for n, c in contagem.items() if c > 1)
unicos = len(set(normalizados))
print(duplicados, unicos)
`,
    },
    {
      id: "total-categoria",
      titulo: "Gasto por categoria e participação",
      enunciado: [
        "Cada pedido é um dicionário com `categoria` e `valor`. Monte o relatório que a diretoria pediu:",
        "- `total_por_categoria`: dicionário categoria → soma dos valores;",
        "- `participacao`: dicionário categoria → percentual sobre o total geral, arredondado com 1 casa (`round(x, 1)`);",
        "- `ranking`: lista de categorias da maior para a menor em valor.",
        "Mostre o ranking com o valor e a participação de cada categoria.",
      ],
      inicial: r`
pedidos = [
    {"categoria": "papelaria", "valor": 320.0},
    {"categoria": "limpeza", "valor": 150.0},
    {"categoria": "ti", "valor": 1500.0},
    {"categoria": "papelaria", "valor": 180.0},
    {"categoria": "copa", "valor": 200.0},
    {"categoria": "limpeza", "valor": 250.0},
    {"categoria": "ti", "valor": 600.0},
]
`,
      testes: [
        ["assert total_por_categoria == {'papelaria': 500.0, 'limpeza': 400.0, 'ti': 2100.0, 'copa': 200.0}", "`total_por_categoria` incorreto"],
        ["assert all(abs(participacao[k] - v) <= 0.051 for k, v in {'ti': 65.6, 'papelaria': 15.6, 'limpeza': 12.5, 'copa': 6.25}.items())", "`participacao` deve ser ti ≈ 65.6, papelaria ≈ 15.6, limpeza = 12.5 e copa ≈ 6.2"],
        ["assert ranking == ['ti', 'papelaria', 'limpeza', 'copa']", "`ranking` deve ser ['ti', 'papelaria', 'limpeza', 'copa']"],
      ],
      dicas: ["Acesse os campos com `p['categoria']` e `p['valor']`.", "O total geral é `sum(total_por_categoria.values())`; a participação de cada um é `total / geral * 100`.", "`ranking = sorted(total_por_categoria, key=total_por_categoria.get, reverse=True)`."],
      solucao: r`
pedidos = [
    {"categoria": "papelaria", "valor": 320.0},
    {"categoria": "limpeza", "valor": 150.0},
    {"categoria": "ti", "valor": 1500.0},
    {"categoria": "papelaria", "valor": 180.0},
    {"categoria": "copa", "valor": 200.0},
    {"categoria": "limpeza", "valor": 250.0},
    {"categoria": "ti", "valor": 600.0},
]

total_por_categoria = {}
for p in pedidos:
    cat = p["categoria"]
    total_por_categoria[cat] = total_por_categoria.get(cat, 0) + p["valor"]

geral = sum(total_por_categoria.values())
participacao = {c: round(v / geral * 100, 1) for c, v in total_por_categoria.items()}
ranking = sorted(total_por_categoria, key=total_por_categoria.get, reverse=True)

for c in ranking:
    print(f"{c:<10} R$ {total_por_categoria[c]:>8.2f}  {participacao[c]:>5.1f}%")
`,
      comentario: "Este é exatamente o `df.groupby('categoria')['valor'].sum()` do pandas, feito à mão. No módulo 7 você vai ver a versão com DataFrame.",
    },
  ],
}));
