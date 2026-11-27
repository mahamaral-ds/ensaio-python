Ensaio.modulo((r) => ({
  id: "m3",
  ordem: 3,
  titulo: "Funções",
  resumo: "Definição e retorno, parâmetros, escopo, *args e **kwargs, lambdas e recursão.",
  licoes: [
    {
      id: "definicao",
      titulo: "Definir funções e retornar valores",
      explicacao: [
        "Uma **função** dá nome a um bloco de código reutilizável: `def nome(parametros):` e o corpo indentado.",
        "`return` devolve um valor para quem chamou e **encerra** a função na hora. Sem `return`, a função devolve `None`.",
        "Para devolver vários valores, retorne uma tupla: `return menor, maior`. Quem chama desempacota: `a, b = resumo(dados)`.",
        "Uma *docstring* (texto entre aspas triplas logo abaixo do `def`) documenta o que a função faz. Ela aparece em `help(funcao)`.",
        "> `print` mostra um valor na tela; `return` entrega o valor ao código. Funções de cálculo devem usar `return`.",
      ],
      exemplo: r`
def preco_com_imposto(preco, aliquota):
    """Devolve o preço acrescido do imposto."""
    return preco * (1 + aliquota)

print(preco_com_imposto(100, 0.18))
valor = preco_com_imposto(250, 0.12)
print(round(valor, 2))

def resumo(valores):
    return min(valores), max(valores), sum(valores) / len(valores)

menor, maior, media = resumo([10, 40, 25])
print(menor, maior, media)

def sem_retorno():
    print("só mostra")

x = sem_retorno()
print(x)
`,
      erro: {
        codigo: r`
def dobro(n):
    print(n * 2)

total = dobro(5) + 1
`,
        explicacao: "A função mostra 10, mas devolve `None`. Depois, `None + 1` gera `TypeError`. Troque `print` por `return n * 2`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
def f(x):
    if x > 0:
        return "positivo"
    return "não positivo"
    print("fim")

print(f(3), f(0))
`,
          opcoes: ["positivo não positivo", "positivo\nfim não positivo", "positivo positivo", "Erro"],
          resposta: 0,
          dicas: ["O que acontece com a função quando ela chega a um `return`?", "O `print('fim')` vem depois do segundo `return`.", "Ele nunca é executado."],
          comentario: "`return` encerra a função. O `print('fim')` é código morto.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que uma função sem `return` devolve?",
          opcoes: ["`0`", "Uma string vazia", "`None`", "Dá erro ao chamar"],
          resposta: 2,
          dicas: ["Ela devolve algo, sim.", "É um valor especial que representa ausência de valor.", "O mesmo que `append` e `sort` devolvem."],
          comentario: "Toda função devolve algo; sem `return`, devolve `None`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a definição da função que calcula a margem (lucro dividido pelo preço de venda).",
          codigo: r`
___ margem(preco_venda, custo):
    lucro = preco_venda - custo
    ___ lucro / preco_venda

print(margem(200, 150))
`,
          respostas: [["def"], ["return"]],
          testes: [
            ["assert margem(200, 150) == 0.25", "`margem(200, 150)` deve ser 0.25"],
            ["assert abs(margem(80, 60) - 0.25) < 1e-9", "`margem(80, 60)` deve ser 0.25"],
          ],
          dicas: ["A palavra que começa uma função.", "A palavra que devolve o resultado.", "`def` e `return`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Escreva `classificar_estoque(qtd, minimo)`, que devolve `'crítico'` quando `qtd` for menor que a metade do mínimo, `'baixo'` quando for menor que o mínimo e `'ok'` nos demais casos.",
          inicial: r`
def classificar_estoque(qtd, minimo):
    pass
`,
          testes: [
            ["assert classificar_estoque(2, 10) == 'crítico'", "`classificar_estoque(2, 10)` deve ser 'crítico'"],
            ["assert classificar_estoque(5, 10) == 'baixo'", "`classificar_estoque(5, 10)` deve ser 'baixo' (5 não é menor que a metade)"],
            ["assert classificar_estoque(10, 10) == 'ok'", "`classificar_estoque(10, 10)` deve ser 'ok'"],
            ["assert classificar_estoque(0, 1) == 'crítico'", "`classificar_estoque(0, 1)` deve ser 'crítico'"],
          ],
          dicas: ["Comece pelo caso mais restritivo.", "`if qtd < minimo / 2: return 'crítico'`.", "Depois `if qtd < minimo: return 'baixo'` e, no fim, `return 'ok'`."],
          solucao: r`
def classificar_estoque(qtd, minimo):
    """Classifica o nível de estoque em relação ao mínimo."""
    if qtd < minimo / 2:
        return "crítico"
    if qtd < minimo:       # não precisa de elif: o return já saiu da função
        return "baixo"
    return "ok"
`,
        },
      ],
    },
    {
      id: "parametros",
      titulo: "Parâmetros: padrão e nomeados",
      explicacao: [
        "Parâmetros podem ter **valor padrão**: `def preco_final(preco, desconto=0.0)`. Se quem chama não informar, o padrão é usado.",
        "Na chamada, argumentos podem ser **nomeados**: `preco_final(100, frete=15)`. Isso deixa claro o que cada valor significa e permite pular os do meio.",
        "Regra: os argumentos posicionais vêm antes dos nomeados, e os parâmetros com padrão vêm depois dos obrigatórios.",
        "> Nunca use lista ou dicionário como valor padrão (`lista=[]`): o mesmo objeto é reaproveitado entre chamadas. Use `None` e crie dentro da função.",
      ],
      exemplo: r`
def saudacao(nome, cumprimento="Olá", pontuacao="!"):
    return f"{cumprimento}, {nome}{pontuacao}"

print(saudacao("Ana"))
print(saudacao("Bia", "Bom dia"))
print(saudacao("Caio", pontuacao="."))

def preco_final(preco, desconto=0.0, frete=0.0):
    return round(preco * (1 - desconto) + frete, 2)

print(preco_final(100))
print(preco_final(100, frete=15))
print(preco_final(frete=10, preco=200, desconto=0.1))
`,
      erro: {
        codigo: r`
def adiciona(item, lista=[]):
    lista.append(item)
    return lista

print(adiciona("a"))
print(adiciona("b"))   # esperava ['b']
`,
        explicacao: "O valor padrão é criado uma única vez, quando a função é definida. A mesma lista acumula os itens entre as chamadas. Use `lista=None` e, dentro da função, `if lista is None: lista = []`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
def f(a, b=2, c=3):
    return a + b * c

print(f(1), f(1, c=10), f(1, 0))
`,
          opcoes: ["7 21 1", "7 13 1", "9 21 3", "Erro"],
          resposta: 0,
          dicas: ["Em `f(1)`, b e c usam os padrões.", "Em `f(1, c=10)`, só c muda.", "Em `f(1, 0)`, o 0 vai para b."],
          comentario: "f(1) = 1 + 2×3 = 7; f(1, c=10) = 1 + 2×10 = 21; f(1, 0) = 1 + 0×3 = 1.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Com `def frete(peso, uf='SP', expresso=False)`, qual chamada dá erro?",
          opcoes: ["`frete(2)`", "`frete(2, expresso=True)`", "`frete(uf='RJ', 2)`", "`frete(peso=2, uf='MG')`"],
          resposta: 2,
          dicas: ["Todas informam o peso de alguma forma.", "Repare na ordem entre argumentos posicionais e nomeados.", "Um argumento posicional não pode vir depois de um nomeado."],
          comentario: "`frete(uf='RJ', 2)` é um `SyntaxError`: posicional depois de nomeado.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "Cada chamada de `registrar` deveria começar um log novo, a não ser que um log seja passado. Hoje os eventos se acumulam entre as chamadas. Corrija.",
          inicial: r`
def registrar(evento, log=[]):
    log.append(evento)
    return log

a = registrar("login")
b = registrar("compra")
print(a, b)
`,
          testes: [
            ["assert registrar('x') == ['x']", "`registrar('x')` deve devolver ['x']"],
            ["assert registrar('y') == ['y']", "Uma segunda chamada também deve começar do zero"],
            ["assert registrar('z', ['w']) == ['w', 'z']", "Se um log for passado, o evento entra no fim dele"],
          ],
          dicas: ["O problema está no valor padrão `log=[]`.", "Use `None` como padrão.", "`def registrar(evento, log=None):` e depois `if log is None: log = []`."],
          solucao: r`
def registrar(evento, log=None):
    if log is None:      # cria uma lista nova a cada chamada
        log = []
    log.append(evento)
    return log

a = registrar("login")
b = registrar("compra")
print(a, b)              # ['login'] ['compra']
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Escreva `formatar_moeda(valor, simbolo='R$', casas=2)`, que devolve um texto como `'R$ 1234.50'`. Exemplos: `formatar_moeda(10, simbolo='US$')` → `'US$ 10.00'`; `formatar_moeda(1234.5, casas=0)` → `'R$ 1234'`.",
          inicial: r`
def formatar_moeda(valor, simbolo="R$", casas=2):
    pass
`,
          testes: [
            ["assert formatar_moeda(1234.5) == 'R$ 1234.50'", "`formatar_moeda(1234.5)` deve ser 'R$ 1234.50'"],
            ["assert formatar_moeda(10, simbolo='US$') == 'US$ 10.00'", "`formatar_moeda(10, simbolo='US$')` deve ser 'US$ 10.00'"],
            ["assert formatar_moeda(1234.5, casas=0) == 'R$ 1234'", "`formatar_moeda(1234.5, casas=0)` deve ser 'R$ 1234'"],
          ],
          dicas: ["Use uma f-string com o símbolo, um espaço e o valor formatado.", "A quantidade de casas também pode ir dentro da formatação.", "`f'{simbolo} {valor:.{casas}f}'`."],
          solucao: r`
def formatar_moeda(valor, simbolo="R$", casas=2):
    # a formatação aceita uma variável dentro dela: .{casas}f
    return f"{simbolo} {valor:.{casas}f}"

print(formatar_moeda(1234.5))
print(formatar_moeda(10, simbolo="US$"))
`,
          comentario: "1234.5 com zero casas vira 1234, porque o Python arredonda para o par mais próximo quando o valor está exatamente no meio.",
        },
      ],
    },
    {
      id: "escopo",
      titulo: "Escopo de variáveis",
      explicacao: [
        "Variáveis criadas dentro de uma função são **locais**: existem só durante a chamada e não são vistas de fora.",
        "Uma função consegue **ler** variáveis globais (definidas fora de qualquer função). Mas, se ela **atribui** a um nome, esse nome passa a ser local na função inteira.",
        "Por isso, ler e atribuir o mesmo nome global dentro da função dá `UnboundLocalError`.",
        "A saída limpa é passar os valores como parâmetros e devolver o resultado. `global` existe, mas espalha efeitos colaterais e dificulta testar.",
        "`nonlocal` permite alterar a variável de uma função externa dentro de uma função aninhada. Aparece em decoradores e fábricas de funções.",
      ],
      exemplo: r`
taxa = 0.05  # global

def com_taxa(valor):
    return valor * (1 + taxa)   # só lê a global: tudo bem

def calcula():
    resultado = 10              # local
    return resultado

print(com_taxa(100))
print(calcula())
# print(resultado)  -> NameError: só existe dentro da função

def incrementa(c):
    return c + 1

contador = 0
contador = incrementa(contador)
print(contador)
`,
      erro: {
        codigo: r`
total = 0

def soma(v):
    total = total + v
    return total

soma(5)
`,
        explicacao: "Como a função atribui a `total`, o Python trata `total` como local. Na hora de ler `total + v`, a local ainda não tem valor: `UnboundLocalError`. Passe `total` como parâmetro e devolva o novo valor.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
x = 10

def f():
    x = 5
    return x

print(f(), x)
`,
          opcoes: ["5 10", "5 5", "10 10", "Erro"],
          resposta: 0,
          dicas: ["O `x = 5` dentro da função cria uma variável nova ou altera a de fora?", "É uma variável local.", "O `x` global continua com 10."],
          comentario: "O `x` de dentro é local e some quando a função termina.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Por que `total = total + v` dentro de uma função dá `UnboundLocalError` quando `total` é global?",
          opcoes: ["Porque variáveis globais nunca podem ser lidas em funções", "Porque a atribuição torna `total` local na função inteira, e ele é lido antes de receber valor", "Porque falta `return`", "Porque `v` não foi definido"],
          resposta: 1,
          dicas: ["Ler uma global, sozinho, funciona.", "O Python decide o escopo de cada nome olhando a função toda.", "Se há atribuição, o nome é local desde a primeira linha."],
          comentario: "O escopo é decidido em tempo de compilação: qualquer atribuição a `total` na função faz dele local.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "`debitar` deveria receber o saldo e o valor como **parâmetros** e devolver o novo saldo, sem depender da variável global. Corrija.",
          inicial: r`
saldo = 1000

def debitar(valor):
    saldo = saldo - valor
    return saldo

saldo = debitar(200)
print(saldo)
`,
          testes: [
            ["assert saldo == 800", "`saldo` deve terminar em 800"],
            ["assert debitar(500, 100) == 400", "`debitar(500, 100)` deve devolver 400: receba o saldo como parâmetro"],
          ],
          dicas: ["A função precisa de dois parâmetros.", "`def debitar(saldo, valor):`.", "Na chamada: `saldo = debitar(saldo, 200)`."],
          solucao: r`
saldo = 1000

def debitar(saldo, valor):     # tudo o que a função usa chega por parâmetro
    return saldo - valor

saldo = debitar(saldo, 200)
print(saldo)
`,
          comentario: "Funções que só dependem dos parâmetros (funções puras) são fáceis de testar: a mesma entrada sempre dá a mesma saída.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para que `proximo` consiga alterar o `n` da função de fora.",
          codigo: r`
def criar_contador():
    n = 0
    def proximo():
        ___ n
        n += 1
        return n
    return proximo

c = criar_contador()
c()
c()
print(c())
`,
          respostas: [["nonlocal"]],
          testes: [
            ["c2 = criar_contador()\nassert c2() == 1 and c2() == 2", "Um contador novo deve devolver 1 e depois 2"],
            ["assert _out.strip() == '3'", "A saída deve ser 3"],
          ],
          dicas: ["Não é `global`: `n` não é global.", "`n` pertence à função de fora, `criar_contador`.", "`nonlocal n`."],
          comentario: "Cada contador criado guarda o seu próprio `n`. Esse mecanismo se chama *closure*.",
        },
      ],
    },
    {
      id: "args-kwargs",
      titulo: "*args e **kwargs",
      explicacao: [
        "`*args` recebe qualquer quantidade de argumentos posicionais numa **tupla**. `**kwargs` recebe argumentos nomeados extras num **dicionário**. Os nomes `args` e `kwargs` são convenção; o que importa são os asteriscos.",
        "Ordem na definição: parâmetros normais, `*args`, parâmetros com padrão e `**kwargs`.",
        "Na chamada, os asteriscos fazem o caminho inverso: `f(*lista)` espalha a lista em argumentos e `f(**dicionario)` espalha o dicionário em argumentos nomeados.",
        "É muito comum em funções que repassam opções, como `df.plot(**opcoes)` e decoradores.",
      ],
      exemplo: r`
def soma_tudo(*valores):
    print("recebi:", valores)
    return sum(valores)

print(soma_tudo(1, 2, 3))
print(soma_tudo())

def cadastro(nome, **dados):
    print(nome, dados)

cadastro("Alfa", uf="SP", ativo=True)

numeros = [4, 5, 6]
print(soma_tudo(*numeros))
config = {"sep": " | ", "end": "\n"}
print("a", "b", **config)
`,
      erro: {
        codigo: r`
def media(*valores):
    return sum(valores) / len(valores)

print(media([7, 8, 9]))
`,
        explicacao: "A lista inteira virou um único argumento: `valores` é `([7, 8, 9],)`, e `sum` tenta somar 0 com uma lista (`TypeError`). Espalhe na chamada com `media(*[7, 8, 9])` ou defina a função para receber uma lista.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
def f(a, *b, **c):
    print(a, b, c)

f(1, 2, 3, x=4)
`,
          opcoes: ["1 (2, 3) {'x': 4}", "1 [2, 3] {'x': 4}", "(1, 2, 3) {'x': 4}", "Erro"],
          resposta: 0,
          dicas: ["O primeiro argumento vai para `a`.", "Os posicionais que sobram vão para `b`, numa tupla.", "Os nomeados vão para `c`, num dicionário."],
          comentario: "`a` = 1, `b` = (2, 3) e `c` = {'x': 4}.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é o tipo de `args` dentro de `def f(*args)`?",
          opcoes: ["`list`", "`tuple`", "`dict`", "`set`"],
          resposta: 1,
          dicas: ["Os argumentos não podem ser alterados depois de recebidos.", "É uma sequência imutável.", "Uma tupla."],
          comentario: "`*args` é sempre uma tupla; `**kwargs`, sempre um dicionário.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para que a função aceite vários números e para que a chamada espalhe a lista.",
          codigo: r`
def maior_de(___numeros):
    return max(numeros)

valores = [3, 9, 4]
print(maior_de(___valores))
`,
          respostas: [["*"], ["*"]],
          testes: [
            ["assert maior_de(3, 9, 4) == 9 and maior_de(1) == 1", "`maior_de(3, 9, 4)` deve ser 9 e `maior_de(1)` deve ser 1"],
            ["assert _out.strip() == '9'", "A saída deve ser 9"],
          ],
          dicas: ["Um símbolo na definição para receber vários argumentos.", "O mesmo símbolo na chamada para espalhar a lista.", "`*` nos dois lugares."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Escreva `montar_url(base, *partes, **params)`, que junta a base e as partes com `/` e acrescenta os parâmetros como `?chave=valor&chave=valor`, na ordem recebida. Sem parâmetros, não coloque `?`. Exemplo: `montar_url('https://api.ficticia.com', 'v1', 'pedidos', status='aberto', pagina=2)` → `'https://api.ficticia.com/v1/pedidos?status=aberto&pagina=2'`.",
          inicial: r`
def montar_url(base, *partes, **params):
    pass
`,
          testes: [
            ["assert montar_url('https://api.ficticia.com', 'v1', 'pedidos', status='aberto', pagina=2) == 'https://api.ficticia.com/v1/pedidos?status=aberto&pagina=2'", "Exemplo do enunciado"],
            ["assert montar_url('https://x.com', 'a') == 'https://x.com/a'", "Sem parâmetros, não deve haver `?`"],
            ["assert montar_url('https://x.com') == 'https://x.com'", "Só a base deve devolver a própria base"],
          ],
          dicas: ["`'/'.join([base, *partes])` junta tudo com barras.", "Para os parâmetros, monte `'chave=valor'` para cada item de `params.items()`.", "Junte com `'&'.join(...)` e só acrescente `'?' + ...` se `params` não estiver vazio."],
          solucao: r`
def montar_url(base, *partes, **params):
    url = "/".join([base, *partes])          # espalha as partes na lista
    if params:                               # dicionário vazio é falso
        consulta = "&".join(f"{k}={v}" for k, v in params.items())
        url += "?" + consulta
    return url

print(montar_url("https://api.ficticia.com", "v1", "pedidos", status="aberto", pagina=2))
`,
          comentario: "Na vida real, use `urllib.parse.urlencode(params)`, que também trata espaços e acentos.",
        },
      ],
    },
    {
      id: "lambda",
      titulo: "Funções lambda, sorted, map e filter",
      explicacao: [
        "`lambda parametros: expressao` cria uma função pequena, sem nome e de uma linha só. O resultado da expressão é devolvido automaticamente.",
        "O uso mais comum é como **chave de ordenação**: `sorted(produtos, key=lambda p: p[1])`. Também vale para `min`, `max` e `list.sort`.",
        "`map(f, colecao)` aplica `f` a cada item; `filter(f, colecao)` mantém os itens em que `f` devolve verdadeiro. Os dois devolvem iteradores: use `list(...)` para ver o resultado.",
        "Em geral, uma compreensão é mais legível que `map` e `filter`. Se a lambda precisar de nome ou de mais de uma linha, use `def`.",
      ],
      exemplo: r`
produtos = [("caneta", 2.5), ("toner", 189.9), ("clips", 0.8)]
print(sorted(produtos, key=lambda p: p[1]))
print(max(produtos, key=lambda p: p[1]))

precos = [10, 20, 30]
print(list(map(lambda p: p * 1.1, precos)))
print(list(filter(lambda p: p > 15, precos)))

nomes = ["beta", "Alfa", "gama"]
print(sorted(nomes, key=str.lower))

pedidos = [{"id": 1, "valor": 300}, {"id": 2, "valor": 120}]
print(sorted(pedidos, key=lambda p: p["valor"]))
`,
      erro: {
        codigo: r`
produtos = [("caneta", 2.5), ("toner", 189.9)]
print(sorted(produtos, key=p[1]))
`,
        explicacao: "`key` precisa receber uma **função**, não um valor. `p[1]` é avaliado na hora e `p` não existe (`NameError`). Escreva `key=lambda p: p[1]`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
f = lambda x, y=2: x ** y
print(f(3), f(2, 3))
`,
          opcoes: ["9 8", "6 6", "9 6", "Erro"],
          resposta: 0,
          dicas: ["Lambdas aceitam valores padrão como qualquer função.", "`f(3)` é 3 ao quadrado.", "`f(2, 3)` é 2 ao cubo."],
          comentario: "3² = 9 e 2³ = 8.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "`pedidos` é uma lista de dicionários com a chave `'data'` no formato `'AAAA-MM-DD'`. Qual expressão ordena do mais recente para o mais antigo?",
          opcoes: ["`sorted(pedidos, key='data', reverse=True)`", "`sorted(pedidos, key=lambda p: p['data'], reverse=True)`", "`pedidos.sort('data')`", "`sorted(lambda p: p['data'], pedidos)`"],
          resposta: 1,
          dicas: ["`key` recebe uma função.", "Datas em `AAAA-MM-DD` ordenam bem como texto.", "Mais recente primeiro: `reverse=True`."],
          comentario: "O formato ISO (`AAAA-MM-DD`) tem a vantagem de que a ordem alfabética é igual à ordem cronológica.",
        },
        {
          tipo: "corrigir", nivel: 1,
          enunciado: "O ranking deveria ir do maior para o menor **valor vendido**, mas está saindo em outra ordem. Corrija.",
          inicial: r`
vendedores = [("Ana", 15000), ("Bruno", 22000), ("Carla", 18000)]
ranking = sorted(vendedores, key=lambda v: v[0], reverse=True)
print(ranking[0])
`,
          testes: [["assert [v[0] for v in ranking] == ['Bruno', 'Carla', 'Ana']", "O ranking deve ser Bruno, Carla, Ana"]],
          dicas: ["Por qual campo a lista está sendo ordenada?", "`v[0]` é o nome.", "Ordene por `v[1]`."],
          solucao: r`
vendedores = [("Ana", 15000), ("Bruno", 22000), ("Carla", 18000)]
ranking = sorted(vendedores, key=lambda v: v[1], reverse=True)   # pelo valor
print(ranking[0])
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie `disponiveis`, a lista de **nomes** dos produtos com estoque maior que zero, ordenada pelo preço (mais barato primeiro). Crie também `valor_estoque`, a soma de preço × estoque de todos os produtos.",
          inicial: r`
produtos = [
    {"nome": "caneta", "preco": 2.5, "estoque": 0},
    {"nome": "pasta", "preco": 12.0, "estoque": 8},
    {"nome": "toner", "preco": 189.9, "estoque": 3},
    {"nome": "clips", "preco": 0.8, "estoque": 150},
]
`,
          testes: [
            ["assert disponiveis == ['clips', 'pasta', 'toner']", "`disponiveis` deve ser ['clips', 'pasta', 'toner']"],
            ["assert abs(valor_estoque - 785.7) < 0.01", "`valor_estoque` deve ser 785.7"],
          ],
          dicas: ["Filtre os que têm estoque: `filter(lambda p: p['estoque'] > 0, produtos)` ou uma compreensão.", "Ordene com `key=lambda p: p['preco']` e depois pegue só os nomes.", "`valor_estoque = sum(p['preco'] * p['estoque'] for p in produtos)`."],
          solucao: r`
produtos = [
    {"nome": "caneta", "preco": 2.5, "estoque": 0},
    {"nome": "pasta", "preco": 12.0, "estoque": 8},
    {"nome": "toner", "preco": 189.9, "estoque": 3},
    {"nome": "clips", "preco": 0.8, "estoque": 150},
]

com_estoque = filter(lambda p: p["estoque"] > 0, produtos)
ordenados = sorted(com_estoque, key=lambda p: p["preco"])
disponiveis = [p["nome"] for p in ordenados]

valor_estoque = sum(p["preco"] * p["estoque"] for p in produtos)
print(disponiveis, round(valor_estoque, 2))
`,
        },
      ],
    },
    {
      id: "recursao",
      titulo: "Recursão",
      explicacao: [
        "Uma função **recursiva** chama a si mesma para resolver uma versão menor do mesmo problema.",
        "Ela sempre tem duas partes: o **caso base**, que responde direto e para as chamadas, e o **caso recursivo**, que reduz o problema e chama a função de novo.",
        "Recursão combina com estruturas aninhadas: pastas dentro de pastas, categorias dentro de categorias, JSON com vários níveis.",
        "O Python limita a profundidade (cerca de 1000 chamadas). Para repetições simples, um laço costuma ser melhor.",
      ],
      exemplo: r`
def fatorial(n):
    if n <= 1:                    # caso base
        return 1
    return n * fatorial(n - 1)    # caso recursivo

print(fatorial(5))

def soma_aninhada(itens):
    total = 0
    for x in itens:
        if isinstance(x, list):
            total += soma_aninhada(x)   # resolve a sublista do mesmo jeito
        else:
            total += x
    return total

print(soma_aninhada([1, [2, 3], [4, [5, 6]]]))
`,
      erro: {
        codigo: r`
def regressiva(n):
    print(n)
    regressiva(n - 1)

regressiva(3)
`,
        explicacao: "Sem caso base, a função chama a si mesma até estourar o limite: `RecursionError`. Acrescente `if n == 0: return` antes da chamada recursiva.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
def f(n):
    if n == 0:
        return 0
    return n + f(n - 1)

print(f(4))
`,
          opcoes: ["10", "4", "24", "Erro"],
          resposta: 0,
          dicas: ["Expanda: f(4) = 4 + f(3).", "f(3) = 3 + f(2), e assim por diante.", "4 + 3 + 2 + 1 + 0."],
          comentario: "f(4) = 4 + 3 + 2 + 1 + 0 = 10.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que é indispensável em toda função recursiva?",
          opcoes: ["Um laço `for`", "Um caso base que para as chamadas", "Uma variável global", "Pelo menos dois parâmetros"],
          resposta: 1,
          dicas: ["O que impede a função de chamar a si mesma para sempre?", "É uma condição que responde sem nova chamada.", "Caso base."],
          comentario: "Sem caso base, a recursão não termina.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete a potência recursiva: `base ** exp = base × base ** (exp − 1)`.",
          codigo: r`
def potencia(base, exp):
    if exp == ___:
        return 1
    return base * potencia(base, ___)

print(potencia(2, 10))
`,
          respostas: [["0"], ["exp - 1", "exp-1"]],
          testes: [["assert potencia(2, 10) == 1024 and potencia(5, 0) == 1 and potencia(3, 3) == 27", "`potencia` deve calcular 2¹⁰ = 1024, 5⁰ = 1 e 3³ = 27"]],
          dicas: ["Qualquer número elevado a zero dá 1.", "A cada chamada, o expoente diminui.", "`0` e `exp - 1`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Os centros de custo formam uma árvore: cada valor é um número (gasto direto) ou outro dicionário (subcentros). Escreva `total_gasto(arvore)`, que soma todos os gastos em qualquer profundidade.",
          inicial: r`
arvore = {
    "administrativo": {"rh": 12000, "financeiro": {"contas_pagar": 8000, "tesouraria": 5000}},
    "operacoes": {"compras": 15000, "logistica": 22000},
    "ti": 30000,
}

def total_gasto(arvore):
    pass
`,
          testes: [
            ["assert total_gasto(arvore) == 92000", "`total_gasto(arvore)` deve ser 92000"],
            ["assert total_gasto(arvore['administrativo']) == 25000", "O administrativo deve somar 25000"],
            ["assert total_gasto({'a': 1}) == 1 and total_gasto({}) == 0", "Casos pequenos: {'a': 1} → 1 e {} → 0"],
          ],
          dicas: ["Percorra os valores com `arvore.values()`.", "Se o valor for um dicionário (`isinstance(v, dict)`), some o resultado de `total_gasto(v)`.", "Senão, some o próprio valor. Um dicionário vazio deve dar 0 sem nenhum caso especial."],
          solucao: r`
arvore = {
    "administrativo": {"rh": 12000, "financeiro": {"contas_pagar": 8000, "tesouraria": 5000}},
    "operacoes": {"compras": 15000, "logistica": 22000},
    "ti": 30000,
}

def total_gasto(arvore):
    total = 0
    for valor in arvore.values():
        if isinstance(valor, dict):
            total += total_gasto(valor)   # subárvore: mesmo problema, menor
        else:
            total += valor                # folha: gasto direto
    return total                          # dicionário vazio cai aqui com 0

print(total_gasto(arvore))
`,
          comentario: "O caso base aqui é implícito: quando não há mais dicionários dentro, nenhuma chamada nova é feita.",
        },
      ],
    },
  ],
  desafios: [
    {
      id: "limpeza-texto",
      titulo: "Kit de funções de limpeza",
      enunciado: [
        "Monte funções reutilizáveis para padronizar o cadastro de fornecedores:",
        "- `limpar_nome(texto)`: tira espaços das pontas, reduz espaços repetidos a um só e aplica `title()`;",
        "- `limpar_cnpj(texto)`: mantém só os dígitos e devolve o texto com 14 dígitos, ou `None` se não tiver exatamente 14;",
        "- `normalizar_registro(reg)`: recebe um dicionário com `nome`, `cnpj` e outros campos, e devolve um **novo** dicionário com `nome` e `cnpj` limpos e os outros campos intactos, sem alterar o original.",
      ],
      inicial: r`
def limpar_nome(texto):
    pass

def limpar_cnpj(texto):
    pass

def normalizar_registro(reg):
    pass
`,
      testes: [
        ["assert limpar_nome('  alfa   EMBALAGENS  ltda ') == 'Alfa Embalagens Ltda'", "`limpar_nome` deve tirar espaços extras e aplicar title()"],
        ["assert limpar_cnpj('11.111.111/0001-01') == '11111111000101'", "`limpar_cnpj` deve manter só os dígitos"],
        ["assert limpar_cnpj('123') is None and limpar_cnpj('') is None", "`limpar_cnpj` deve devolver None quando não houver 14 dígitos"],
        [r`
original = {"nome": " beta  insumos", "cnpj": "22.222.222/0001-02", "uf": "sp"}
novo = normalizar_registro(original)
assert novo == {"nome": "Beta Insumos", "cnpj": "22222222000102", "uf": "sp"}, f"recebido: {novo}"
assert original["nome"] == " beta  insumos", "o dicionário original foi alterado"
`, "`normalizar_registro` devolve um dicionário novo e limpo, sem alterar o original"],
      ],
      dicas: ["`' '.join(texto.split())` reduz qualquer sequência de espaços a um espaço só.", "Para o CNPJ: `''.join(c for c in texto if c.isdigit())`.", "Em `normalizar_registro`, copie com `novo = dict(reg)` (ou `reg.copy()`) e só então substitua `nome` e `cnpj`."],
      solucao: r`
def limpar_nome(texto):
    """Remove espaços extras e padroniza maiúsculas."""
    return " ".join(texto.split()).title()

def limpar_cnpj(texto):
    """Devolve só os 14 dígitos do CNPJ, ou None se for inválido."""
    digitos = "".join(c for c in texto if c.isdigit())
    return digitos if len(digitos) == 14 else None

def normalizar_registro(reg):
    novo = dict(reg)                       # cópia rasa: não mexe no original
    novo["nome"] = limpar_nome(reg["nome"])
    novo["cnpj"] = limpar_cnpj(reg["cnpj"])
    return novo

print(normalizar_registro({"nome": " beta  insumos", "cnpj": "22.222.222/0001-02", "uf": "sp"}))
`,
    },
    {
      id: "ranking-fornecedores",
      titulo: "Ranking configurável de fornecedores",
      enunciado: [
        "Cada fornecedor é uma tupla `(nome, nota_qualidade, prazo_medio_dias)`. Escreva `ranking(fornecedores, top=3, nota_minima=0)`, que devolve a lista de **nomes** ordenada pela maior nota. Em caso de empate na nota, vence o menor prazo.",
        "Considere apenas os fornecedores com nota maior ou igual a `nota_minima` e devolva no máximo `top` nomes.",
      ],
      inicial: r`
fornecedores = [
    ("Alfa", 9.1, 12),
    ("Beta", 8.7, 7),
    ("Gama", 9.1, 5),
    ("Delta", 7.9, 3),
    ("Épsilon", 8.7, 10),
]

def ranking(fornecedores, top=3, nota_minima=0):
    pass
`,
      testes: [
        ["assert ranking(fornecedores) == ['Gama', 'Alfa', 'Beta']", "`ranking(fornecedores)` deve ser ['Gama', 'Alfa', 'Beta']"],
        ["assert ranking(fornecedores, top=5) == ['Gama', 'Alfa', 'Beta', 'Épsilon', 'Delta']", "Com `top=5`, devolve todos na ordem"],
        ["assert ranking(fornecedores, top=10, nota_minima=8.8) == ['Gama', 'Alfa']", "Com `nota_minima=8.8`, sobram Gama e Alfa"],
        ["assert ranking([]) == []", "Lista vazia devolve lista vazia"],
      ],
      dicas: ["Filtre primeiro: `[f for f in fornecedores if f[1] >= nota_minima]`.", "A chave pode devolver uma tupla: o Python compara item a item. Use `-f[1]` para inverter só a nota.", "`key=lambda f: (-f[1], f[2])`, depois fatie com `[:top]` e pegue os nomes."],
      solucao: r`
fornecedores = [
    ("Alfa", 9.1, 12),
    ("Beta", 8.7, 7),
    ("Gama", 9.1, 5),
    ("Delta", 7.9, 3),
    ("Épsilon", 8.7, 10),
]

def ranking(fornecedores, top=3, nota_minima=0):
    elegiveis = [f for f in fornecedores if f[1] >= nota_minima]
    # tupla como chave: primeiro a nota (negativa = decrescente), depois o prazo
    ordenados = sorted(elegiveis, key=lambda f: (-f[1], f[2]))
    return [nome for nome, _, _ in ordenados[:top]]

print(ranking(fornecedores))
print(ranking(fornecedores, top=10, nota_minima=8.8))
`,
      comentario: "O truque de devolver uma tupla na chave resolve ordenações com vários critérios. No pandas, o equivalente é `sort_values(['nota', 'prazo'], ascending=[False, True])`.",
    },
  ],
}));
