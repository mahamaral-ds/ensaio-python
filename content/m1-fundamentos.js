Ensaio.modulo((r) => ({
  id: "m1",
  ordem: 1,
  titulo: "Fundamentos",
  resumo: "Variáveis, tipos, operadores, entrada e saída, strings, condicionais e laços.",
  licoes: [
    {
      id: "variaveis",
      titulo: "Variáveis e atribuição",
      explicacao: [
        "Uma **variável** é um nome que aponta para um valor guardado na memória. Ela passa a existir no momento em que você atribui um valor com `=`.",
        "O nome fica à esquerda e o valor à direita: `total = 150`. Ler em voz alta ajuda: *total recebe 150*.",
        "Dá para reatribuir quantas vezes quiser. O nome passa a apontar para o novo valor; quem copiou o valor antigo antes continua com ele.",
        "Regras de nome: letras, números e `_`, sem começar com número. Por convenção (PEP 8), use `snake_case`: `valor_total`, `qtd_itens`.",
        "> Python diferencia maiúsculas de minúsculas: `Total` e `total` são variáveis diferentes.",
      ],
      exemplo: r`
fornecedor = "Alfa Embalagens"
quantidade = 120
preco_unitario = 3.5

total = quantidade * preco_unitario
print(fornecedor, "->", total)

quantidade = 150  # reatribuição
print("Nova quantidade:", quantidade)
print("O total não mudou:", total)
`,
      erro: {
        codigo: r`
valor_pedido = 980
print(valor_pedio)
`,
        explicacao: "Um nome digitado errado vira `NameError`: para o Python, `valor_pedio` nunca foi criado. Confira a grafia letra por letra e lembre que maiúsculas contam.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual destes nomes de variável é válido **e** segue a convenção do Python?",
          opcoes: ["`2_trimestre`", "`valor total`", "`valor_total`", "`valor-total`"],
          resposta: 2,
          dicas: ["Pense primeiro no que o Python aceitaria sem erro.", "Espaços e hífens não são permitidos em nomes, e nomes não podem começar com número.", "A convenção `snake_case` usa underline entre as palavras."],
          comentario: "Nomes não podem começar com número nem ter espaço ou hífen (o hífen seria lido como subtração). `valor_total` é válido e segue o `snake_case`.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "O que este código mostra?",
          codigo: r`
a = 10
b = a
a = 25
print(a, b)
`,
          opcoes: ["25 25", "25 10", "10 25", "10 10"],
          resposta: 1,
          dicas: ["Acompanhe linha por linha qual valor cada nome tem.", "Na linha `b = a`, quanto vale `a`?", "Reatribuir `a` depois não altera `b`."],
          comentario: "`b = a` faz `b` apontar para o valor 10 daquele momento. Quando `a` passa a valer 25, `b` continua com 10.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para **trocar** os valores de `x` e `y` usando uma variável auxiliar.",
          codigo: r`
x = 5
y = 8
aux = ___
x = y
y = ___
print(x, y)
`,
          respostas: [["x"], ["aux"]],
          testes: [["assert x == 8 and y == 5", "`x` deve terminar com 8 e `y` com 5"]],
          dicas: ["Antes de sobrescrever `x`, é preciso guardar o valor dele.", "`aux` recebe o valor original de `x`.", "No fim, `y` recebe o que ficou guardado em `aux`."],
          comentario: "Em Python também dá para trocar sem auxiliar: `x, y = y, x`. Você vai ver isso na lição de tuplas.",
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "Crie a variável `produto` com o texto `'Caneta'`, `quantidade` com `40` e `preco` com `2.5`. Depois crie `total` com quantidade vezes preço e mostre `total` com `print`.",
          inicial: r`
# escreva seu código aqui
`,
          testes: [
            ["assert produto == 'Caneta'", "`produto` deve ser 'Caneta'"],
            ["assert quantidade == 40", "`quantidade` deve ser 40"],
            ["assert preco == 2.5", "`preco` deve ser 2.5"],
            ["assert total == 100", "`total` deve ser 100.0 (40 × 2.5)"],
            ["assert '100' in _out", "O valor de `total` deve aparecer na saída"],
          ],
          dicas: ["Textos ficam entre aspas; números, não.", "A multiplicação usa `*`.", "Algo como `total = quantidade * preco` e depois `print(total)`."],
          solucao: r`
produto = "Caneta"      # texto entre aspas
quantidade = 40         # inteiro
preco = 2.5             # decimal usa ponto, não vírgula
total = quantidade * preco
print(total)            # 100.0
`,
        },
      ],
    },
    {
      id: "tipos",
      titulo: "Tipos e conversão",
      explicacao: [
        "Todo valor tem um **tipo**. Os básicos são `int` (inteiro), `float` (decimal), `str` (texto) e `bool` (`True` ou `False`). A função `type()` mostra o tipo de um valor.",
        "Dados de planilhas e sistemas costumam chegar como texto. Para fazer contas, converta: `int('37')`, `float('4.75')`. Para juntar com texto, converta para `str`.",
        "O Python usa ponto como separador decimal. Um valor no formato brasileiro, como `'1.234,56'`, precisa ser tratado antes de virar `float`.",
        "- `int('3.5')` dá erro: o texto precisa ser um inteiro.",
        "- `int(3.9)` corta a parte decimal e dá 3 (não arredonda).",
        "- `bool(0)`, `bool('')` e `bool([])` são `False`; quase todo o resto é `True`.",
      ],
      exemplo: r`
qtd = 12
preco = 4.75
nome = "Papel A4"
ativo = True
print(type(qtd), type(preco), type(nome), type(ativo))

texto = "37"
print(int(texto) + 3)

valor_br = "1234,56"
print(float(valor_br.replace(",", ".")))
print(str(qtd) + " unidades")
print(int(3.9), round(3.9))
`,
      erro: {
        codigo: r`
total = 150
print("Total: " + total)
`,
        explicacao: "Não dá para somar texto com número: é um `TypeError`. Converta com `str(total)` ou, melhor ainda, use uma f-string: `f'Total: {total}'`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é o tipo do resultado de `8 / 2`?",
          opcoes: ["`int`", "`float`", "`str`", "Depende dos números"],
          resposta: 1,
          dicas: ["Experimente mentalmente: o resultado é 4 ou 4.0?", "Em Python 3, a divisão com uma barra sempre tem o mesmo tipo de resultado.", "Para divisão inteira existe outro operador, `//`."],
          comentario: "A divisão `/` sempre devolve `float` em Python 3: `8 / 2` é `4.0`. Para obter inteiro, use `//`.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "O que este código mostra?",
          codigo: r`
x = "5"
y = 2
print(x * y)
print(int(x) * y)
`,
          opcoes: ["10\n10", "55\n10", "Erro na primeira linha do print", "55\n55"],
          resposta: 1,
          dicas: ["Qual é o tipo de `x`?", "Multiplicar um texto por um inteiro é permitido, mas não faz conta.", "`'ab' * 3` resulta em `'ababab'`."],
          comentario: "Texto vezes inteiro repete o texto: `'5' * 2` é `'55'`. Depois da conversão, `int('5') * 2` é 10.",
        },
        {
          tipo: "corrigir", nivel: 1,
          enunciado: "Os dois valores vieram de uma planilha como texto. O código deveria guardar a **soma numérica** em `soma`. Corrija.",
          inicial: r`
a = "120"
b = "80"
soma = a + b
print(soma)
`,
          testes: [
            ["assert soma == 200", "`soma` deve ser o número 200, e não o texto '12080'"],
            ["assert isinstance(soma, int)", "`soma` deve ser do tipo int"],
          ],
          dicas: ["Rode o código: o que aparece na saída?", "Somar dois textos os junta. É preciso converter antes de somar.", "Use `int(a) + int(b)`."],
          solucao: r`
a = "120"
b = "80"
soma = int(a) + int(b)   # converte cada texto antes de somar
print(soma)              # 200
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "A variável `valor_texto` contém `'2.345,90'` no formato brasileiro. Converta para `float` e guarde em `valor` (deve ficar 2345.9). Remova o ponto de milhar e troque a vírgula por ponto.",
          inicial: r`
valor_texto = "2.345,90"
`,
          testes: [
            ["assert isinstance(valor, float)", "`valor` deve ser float"],
            ["assert abs(valor - 2345.9) < 1e-9", "`valor` deve ser 2345.9"],
          ],
          dicas: ["O método `.replace(antigo, novo)` troca trechos de um texto.", "A ordem importa: primeiro tire o ponto, depois troque a vírgula.", "`valor_texto.replace('.', '').replace(',', '.')` e depois `float(...)`."],
          solucao: r`
valor_texto = "2.345,90"
# 1) tira o ponto de milhar   -> "2345,90"
# 2) troca vírgula por ponto  -> "2345.90"
valor = float(valor_texto.replace(".", "").replace(",", "."))
print(valor)
`,
          comentario: "Se você trocar a vírgula primeiro, vai ficar `'2.345.90'`, que não é um número válido. No pandas, `read_csv(..., decimal=',', thousands='.')` faz isso por você.",
        },
      ],
    },
    {
      id: "operadores",
      titulo: "Operadores",
      explicacao: [
        "Aritméticos: `+`, `-`, `*`, `/` (divisão), `//` (divisão inteira), `%` (resto) e `**` (potência).",
        "Comparação: `==`, `!=`, `>`, `<`, `>=`, `<=`. Sempre devolvem `True` ou `False`.",
        "Lógicos: `and` (os dois precisam ser verdadeiros), `or` (basta um) e `not` (inverte).",
        "Atribuição composta encurta atualizações: `estoque -= 5` é o mesmo que `estoque = estoque - 5`.",
        "Precedência: `**` primeiro, depois `*`, `/`, `//`, `%`, depois `+` e `-`. Use parênteses quando houver dúvida; eles também deixam o código mais claro.",
      ],
      exemplo: r`
caixas = 17 // 5   # divisão inteira
sobra = 17 % 5     # resto
print(caixas, sobra)
print(2 ** 10)
print(10 / 4, 10 // 4)

estoque = 30
estoque -= 12
print(estoque)

print(estoque > 10 and estoque < 50)
print(not estoque == 18)
`,
      erro: {
        codigo: r`
print(0.1 + 0.2 == 0.3)
print(0.1 + 0.2)
`,
        explicacao: "Números decimais são guardados em binário, e alguns valores não têm representação exata. Por isso `0.1 + 0.2` não é exatamente `0.3`. Para comparar decimais, use `round(a, 2) == round(b, 2)` ou `math.isclose(a, b)`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
print(2 + 3 * 4 ** 2)
`,
          opcoes: ["50", "400", "110", "196"],
          resposta: 0,
          dicas: ["Qual operador vem primeiro na precedência?", "Calcule `4 ** 2` antes de tudo.", "Depois `3 * 16`, e por último a soma."],
          comentario: "`4 ** 2` = 16, depois `3 * 16` = 48, depois `2 + 48` = 50.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Uma remessa tem 47 itens e cada caixa leva 6. Qual expressão dá o número de caixas **cheias**?",
          opcoes: ["`47 / 6`", "`47 // 6`", "`47 % 6`", "`round(47 / 6)`"],
          resposta: 1,
          dicas: ["Você quer um número inteiro de caixas.", "Arredondar pode dar uma caixa a mais do que as cheias.", "A divisão inteira descarta a parte que não completa uma caixa."],
          comentario: "`47 // 6` é 7 caixas cheias. `47 % 6` é a sobra (5 itens). `round(47 / 6)` daria 8.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para que o frete seja grátis quando o valor passa de 200 **ou** o cliente é VIP.",
          codigo: r`
valor = 180
vip = True
frete_gratis = valor ___ 200 ___ vip
print(frete_gratis)
`,
          respostas: [[">"], ["or"]],
          testes: [["assert frete_gratis is True", "Com `vip = True`, o frete deve ser grátis"]],
          dicas: ["Primeiro compare o valor com 200.", "Basta uma das duas condições ser verdadeira.", "`valor > 200 or vip`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Com `total_itens = 250` e `por_caixa = 12`, calcule `caixas_cheias`, `sobra` (itens que não completam uma caixa) e `caixas_necessarias` (uma caixa a mais se sobrar algum item).",
          inicial: r`
total_itens = 250
por_caixa = 12
`,
          testes: [
            ["assert caixas_cheias == 20", "`caixas_cheias` deve ser 20"],
            ["assert sobra == 10", "`sobra` deve ser 10"],
            ["assert caixas_necessarias == 21", "`caixas_necessarias` deve ser 21"],
          ],
          dicas: ["Use `//` e `%`.", "Para as necessárias, pense: se a sobra for maior que zero, soma 1.", "Um truque sem `if`: `(total_itens + por_caixa - 1) // por_caixa`."],
          solucao: r`
total_itens = 250
por_caixa = 12

caixas_cheias = total_itens // por_caixa   # 20
sobra = total_itens % por_caixa            # 10

# divisão "para cima": somar (por_caixa - 1) antes de dividir
caixas_necessarias = (total_itens + por_caixa - 1) // por_caixa   # 21
print(caixas_cheias, sobra, caixas_necessarias)
`,
          comentario: "Outra forma é `math.ceil(total_itens / por_caixa)`. Você também poderia usar um `if`, que aparece na lição de condicionais.",
        },
      ],
    },
    {
      id: "entrada-saida",
      titulo: "Entrada, saída e f-strings",
      explicacao: [
        "`print()` mostra valores. Aceita vários argumentos, separados por espaço. Os parâmetros `sep` e `end` mudam o separador e o final da linha.",
        "`input('mensagem')` lê o que a pessoa digita e **sempre devolve texto**. Para fazer contas, converta: `int(input(...))`.",
        "**f-strings** colocam valores dentro do texto: `f'Total: {total}'`. Depois de `:` vem a formatação: `{valor:.2f}` (2 casas), `{valor:,.2f}` (milhar), `{n:03d}` (zeros à esquerda), `{nome:>10}` (alinhado à direita).",
        "> No Ensaio, os exercícios com `input()` recebem entradas simuladas, mostradas acima do editor.",
      ],
      entrada: ["Ana", "30"],
      exemplo: r`
nome = input("Seu nome: ")
idade = int(input("Sua idade: "))
print(f"Olá, {nome}! Em 5 anos você terá {idade + 5} anos.")

preco = 1234.5
print(f"Preço: R$ {preco:.2f}")
print(f"Com milhar: {preco:,.2f}")
print("a", "b", "c", sep=" | ")
print("sem quebra", end="... ")
print("continua")
`,
      erro: {
        codigo: r`
idade = input("Idade: ")
print(idade + 1)
`,
        explicacao: "`input()` devolve texto, mesmo que a pessoa digite um número. `'30' + 1` é um `TypeError`. Converta logo na leitura: `idade = int(input('Idade: '))`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que `input()` devolve quando a pessoa digita `42`?",
          opcoes: ["O inteiro 42", "O texto `'42'`", "O float 42.0", "Depende do que foi digitado"],
          resposta: 1,
          dicas: ["O teclado produz caracteres.", "`input` não tenta adivinhar o tipo.", "É sempre `str`."],
          comentario: "`input()` sempre devolve `str`. A conversão é responsabilidade sua.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
valor = 7.456
print(f"{valor:.1f}|{valor:.0f}|{10:03d}")
`,
          opcoes: ["7.5|7|010", "7.4|7|10", "7.46|7.0|010", "7.5|8|010"],
          resposta: 0,
          dicas: ["`.1f` arredonda para 1 casa decimal.", "`.0f` arredonda para zero casas: 7.456 fica 7.", "`03d` completa com zeros até 3 dígitos."],
          comentario: "`.1f` → 7.5; `.0f` → 7; `03d` → 010.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a f-string para mostrar exatamente `Pedido 15: R$ 89.90`.",
          codigo: r`
numero = 15
valor = 89.9
print(f"Pedido {___}: R$ {valor:___}")
`,
          respostas: [["numero"], [".2f"]],
          testes: [["assert _out.strip() == 'Pedido 15: R$ 89.90'", "A saída deve ser exatamente `Pedido 15: R$ 89.90`"]],
          dicas: ["A primeira lacuna é o nome de uma variável.", "A segunda é uma formatação com casas decimais.", "Duas casas decimais: `.2f`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Leia com `input()` o nome de um produto, a quantidade (inteiro) e o preço unitário (float), nessa ordem. Mostre o total no formato `Caderno x3 = R$ 37.50`.",
          entrada: ["Caderno", "3", "12.5"],
          inicial: r`
# leia os três valores com input() e mostre o resultado
`,
          testes: [
            ["assert 'Caderno x3 = R$ 37.50' in _out", "A saída deve conter `Caderno x3 = R$ 37.50`"],
          ],
          dicas: ["São três chamadas de `input()`.", "Converta a quantidade com `int()` e o preço com `float()`.", "`print(f'{produto} x{qtd} = R$ {qtd * preco:.2f}')`."],
          solucao: r`
produto = input("Produto: ")
qtd = int(input("Quantidade: "))      # texto -> inteiro
preco = float(input("Preço: "))       # texto -> decimal
print(f"{produto} x{qtd} = R$ {qtd * preco:.2f}")
`,
        },
      ],
    },
    {
      id: "strings",
      titulo: "Strings e seus métodos",
      explicacao: [
        "Uma string é uma sequência de caracteres. Cada caractere tem uma posição (índice) que começa em 0; índices negativos contam do fim: `s[-1]` é o último.",
        "`len(s)` dá o tamanho. O operador `in` testa se um trecho está contido: `'NF' in codigo`.",
        "Métodos úteis para limpar dados: `strip()` (tira espaços das pontas), `upper()`, `lower()`, `title()`, `replace(a, b)`, `split(sep)` (quebra em lista), `sep.join(lista)` (junta), `startswith()` e `endswith()`.",
        "Strings são **imutáveis**: os métodos devolvem uma nova string. Para manter o resultado, atribua: `nome = nome.strip()`.",
      ],
      exemplo: r`
codigo = "  nf-2024-00157  "
limpo = codigo.strip().upper()
print(limpo)
print(len(limpo), limpo[0], limpo[-1])
print(limpo.split("-"))
print(limpo.startswith("NF"))
print("2024" in limpo)

partes = ["Alfa", "Beta", "Gama"]
print(", ".join(partes))
print(limpo.replace("-", "/"))
`,
      erro: {
        codigo: r`
nome = "fornecedor"
nome[0] = "F"
`,
        explicacao: "Strings não podem ser alteradas no lugar (`TypeError`). Crie uma nova: `nome = 'F' + nome[1:]` ou `nome = nome.capitalize()`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
s = "Python"
print(s[1], s[-2], len(s))
`,
          opcoes: ["y o 6", "P n 6", "y n 5", "P o 6"],
          resposta: 0,
          dicas: ["O índice 0 é `P`.", "`-1` é o último caractere, `-2` é o penúltimo.", "Conte os caracteres de `Python`."],
          comentario: "`s[1]` é `y`, `s[-2]` é `o` e `len(s)` é 6.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual expressão transforma `'a;b;c'` na lista `['a', 'b', 'c']`?",
          opcoes: ["`';'.join('a;b;c')`", "`'a;b;c'.split(';')`", "`'a;b;c'.strip(';')`", "`list('a;b;c')`"],
          resposta: 1,
          dicas: ["Você quer quebrar o texto em pedaços.", "`join` faz o caminho inverso.", "`list('abc')` separa cada caractere, inclusive os `;`."],
          comentario: "`split(';')` quebra o texto em cada `;`. É o primeiro passo para ler linhas de um CSV na mão.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "Este código deveria padronizar o nome do fornecedor: sem espaços nas pontas e com a primeira letra de cada palavra maiúscula (`'Beta Insumos Ltda'`). Corrija.",
          inicial: r`
bruto = "   beta INSUMOS ltda "
nome = bruto.title
nome.strip()
print(nome)
`,
          testes: [["assert nome == 'Beta Insumos Ltda'", "`nome` deve ser 'Beta Insumos Ltda'"]],
          dicas: ["Rode e veja o que é mostrado: `title` foi chamado?", "Métodos precisam de parênteses. E o resultado de `strip()` está sendo guardado?", "Encadeie: `bruto.strip().title()`."],
          solucao: r`
bruto = "   beta INSUMOS ltda "
# métodos precisam de () e o resultado precisa ser guardado
nome = bruto.strip().title()
print(nome)
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Dada a linha `registro = 'Alfa Embalagens;SP;1520.75'`, separe os campos e crie `empresa`, `uf` e `valor` (este como `float`).",
          inicial: r`
registro = "Alfa Embalagens;SP;1520.75"
`,
          testes: [
            ["assert empresa == 'Alfa Embalagens'", "`empresa` deve ser 'Alfa Embalagens'"],
            ["assert uf == 'SP'", "`uf` deve ser 'SP'"],
            ["assert valor == 1520.75 and isinstance(valor, float)", "`valor` deve ser o float 1520.75"],
          ],
          dicas: ["Use `split` com o separador certo.", "O resultado é uma lista; acesse as posições 0, 1 e 2.", "`partes = registro.split(';')` e `valor = float(partes[2])`."],
          solucao: r`
registro = "Alfa Embalagens;SP;1520.75"
partes = registro.split(";")     # ['Alfa Embalagens', 'SP', '1520.75']
empresa = partes[0]
uf = partes[1]
valor = float(partes[2])         # texto -> número
print(empresa, uf, valor)
`,
          comentario: "Com desempacotamento (lição de tuplas) fica numa linha: `empresa, uf, valor = registro.split(';')`.",
        },
      ],
    },
    {
      id: "condicionais",
      titulo: "Condicionais",
      explicacao: [
        "`if` executa um bloco só quando a condição é verdadeira. `elif` testa outra condição se as anteriores falharam, e `else` cobre todo o resto.",
        "O bloco é definido pela **indentação** (4 espaços). A linha do `if` termina com `:`.",
        "As condições são testadas de cima para baixo e só o primeiro bloco verdadeiro roda. Coloque as condições mais restritivas primeiro.",
        "Expressão condicional, para casos curtos: `status = 'ok' if valor < 800 else 'revisar'`.",
        "Valores vazios ou zero contam como falsos: `if not observacao:` testa se o texto está vazio.",
      ],
      exemplo: r`
valor = 750

if valor >= 1000:
    faixa = "A"
elif valor >= 500:
    faixa = "B"
else:
    faixa = "C"
print("Faixa:", faixa)

status = "aprovado" if valor < 800 else "revisar"
print(status)

observacao = ""
if not observacao:
    print("Sem observação")
`,
      erro: {
        codigo: r`
valor = 1200
if valor > 500:
    print("médio")
elif valor > 1000:
    print("alto")
`,
        explicacao: "Não dá erro, mas o resultado está errado: 1200 é maior que 500, então o primeiro bloco roda e o `elif` nunca é testado. Teste a condição mais restritiva (`> 1000`) primeiro.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
x = 0
if x:
    print("verdadeiro")
else:
    print("falso")
`,
          opcoes: ["verdadeiro", "falso", "0", "Erro: falta uma comparação"],
          resposta: 1,
          dicas: ["Um número sozinho pode ser usado como condição.", "Qual é o valor de `bool(0)`?", "Zero conta como falso."],
          comentario: "`if x:` é o mesmo que `if bool(x):`. Zero, texto vazio e listas vazias são falsos.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para classificar a nota: 9 ou mais é `A`, 7 ou mais é `B`, e o resto é `C`.",
          codigo: r`
nota = 7.5
if nota >= 9:
    conceito = "A"
___ nota >= 7:
    conceito = "B"
___:
    conceito = "C"
print(conceito)
`,
          respostas: [["elif"], ["else"]],
          testes: [["assert conceito == 'B'", "Com nota 7.5, o conceito deve ser 'B'"]],
          dicas: ["A segunda linha testa outra condição.", "A última não testa nada: pega todo o resto.", "`elif` e `else`."],
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O código deveria avisar `Repor estoque` e marcar `alerta = True` quando o estoque estiver abaixo do mínimo. Corrija os erros de sintaxe e de indentação.",
          inicial: r`
estoque = 3
minimo = 5
if estoque < minimo
print("Repor estoque")
alerta = True
else:
    alerta = False
`,
          testes: [
            ["assert alerta is True", "`alerta` deve ser True"],
            ["assert 'Repor estoque' in _out", "A mensagem `Repor estoque` deve aparecer"],
          ],
          dicas: ["Rode: o erro aponta a primeira linha com problema.", "A linha do `if` precisa terminar com `:`.", "As duas linhas do bloco do `if` precisam de 4 espaços à esquerda."],
          solucao: r`
estoque = 3
minimo = 5
if estoque < minimo:          # dois-pontos no fim
    print("Repor estoque")    # bloco indentado com 4 espaços
    alerta = True
else:
    alerta = False
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Calcule o `desconto` em reais conforme o `valor` do pedido: até 500 (inclusive), sem desconto; acima de 500 até 2000 (inclusive), 5%; acima de 2000, 10%. **Mantenha a primeira linha `valor = 2500`**: os testes trocam esse número por outros.",
          inicial: r`
valor = 2500
`,
          testes: [
            [r`
casos = [(300, 0), (500, 0), (1000, 50), (2000, 100), (2500, 250)]
for v, esperado in casos:
    ns = {}
    exec(_src.replace("valor = 2500", f"valor = {v}", 1), ns)
    assert abs(ns["desconto"] - esperado) < 0.01, f"para valor={v}, desconto deveria ser {esperado}, mas deu {ns['desconto']}"
`, "O desconto está certo para 300, 500, 1000, 2000 e 2500"],
          ],
          dicas: ["Use `if`, `elif` e `else`.", "Comece pela faixa mais alta: `if valor > 2000:`.", "Na faixa do meio, `desconto = valor * 0.05`; sem desconto, `desconto = 0`."],
          solucao: r`
valor = 2500

if valor > 2000:              # faixa mais restritiva primeiro
    desconto = valor * 0.10
elif valor > 500:             # aqui já sabemos que valor <= 2000
    desconto = valor * 0.05
else:
    desconto = 0
print(desconto)
`,
        },
      ],
    },
    {
      id: "while",
      titulo: "Laço while",
      explicacao: [
        "`while condicao:` repete o bloco enquanto a condição for verdadeira. Use quando você não sabe de antemão quantas voltas serão necessárias.",
        "Algo dentro do laço precisa mudar a condição, senão ele nunca termina (laço infinito). No Ensaio, o código é interrompido depois de alguns segundos.",
        "`break` sai do laço na hora. `continue` pula para a próxima volta.",
        "Padrão comum: o **acumulador**, uma variável que começa em 0 e vai somando a cada volta.",
      ],
      exemplo: r`
saldo = 1000
mes = 0
while saldo > 0:
    saldo -= 275
    mes += 1
    print(f"Mês {mes}: saldo {saldo}")
print("Meses até zerar:", mes)

tentativas = 0
while True:
    tentativas += 1
    if tentativas == 3:
        break
print("Parou na tentativa", tentativas)
`,
      erro: {
        codigo: r`
i = 0
while i < 5:
    print(i)
`,
        explicacao: "Faltou `i += 1` dentro do laço: `i` fica 0 para sempre e o laço não acaba. Sempre pergunte: o que faz a condição ficar falsa? (Se executar, o Ensaio vai interromper depois de alguns segundos.)",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
n = 1
while n < 20:
    n = n * 3
print(n)
`,
          opcoes: ["9", "27", "20", "81"],
          resposta: 1,
          dicas: ["Acompanhe os valores de `n`: 1, 3, ...", "A condição é testada antes de cada volta.", "Quando `n` vale 9, a condição ainda é verdadeira."],
          comentario: "1 → 3 → 9 → 27. Com 27, `27 < 20` é falso e o laço para.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que `continue` faz dentro de um laço?",
          opcoes: ["Encerra o laço", "Pula o restante desta volta e vai para a próxima", "Repete a volta atual", "Pausa o programa"],
          resposta: 1,
          dicas: ["Não é o mesmo que `break`.", "O laço continua existindo depois do `continue`.", "O que está abaixo do `continue` naquela volta é ignorado."],
          comentario: "`continue` pula o resto do bloco nesta volta; `break` encerra o laço inteiro.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para somar os números de 1 a 100.",
          codigo: r`
total = 0
n = 1
while n ___ 100:
    total += n
    n ___ 1
print(total)
`,
          respostas: [["<="], ["+="]],
          testes: [["assert total == 5050", "`total` deve ser 5050"]],
          dicas: ["O 100 também precisa entrar na soma.", "`n` precisa aumentar a cada volta.", "`<=` e `+=`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Um investimento começa com `capital = 1000` e rende 1% ao mês (multiplique por 1.01 a cada mês). Use `while` para descobrir quantos meses são necessários para o capital **passar** de 1500. Guarde em `meses`.",
          inicial: r`
capital = 1000
meses = 0
`,
          testes: [
            ["assert meses == 41", "`meses` deve ser 41"],
            ["assert 'while' in _src", "Use um laço `while`"],
          ],
          dicas: ["A condição é: enquanto o capital for menor ou igual a 1500.", "Dentro do laço, atualize o capital e conte um mês.", "`capital *= 1.01` e `meses += 1`."],
          solucao: r`
capital = 1000
meses = 0
while capital <= 1500:     # ainda não passou de 1500
    capital *= 1.01        # rende 1%
    meses += 1             # conta o mês
print(meses, round(capital, 2))
`,
        },
      ],
    },
    {
      id: "for",
      titulo: "Laço for e range",
      explicacao: [
        "`for item in colecao:` percorre cada elemento de uma lista, string ou outra coleção. Use quando você tem os itens em mãos.",
        "`range(fim)` gera 0, 1, ..., fim − 1. `range(inicio, fim, passo)` permite escolher o início e o passo. O fim **nunca** entra.",
        "`enumerate(colecao, start=1)` dá a posição e o valor ao mesmo tempo, sem contador manual.",
        "Laços dentro de laços são permitidos. O de dentro roda inteiro a cada volta do de fora.",
      ],
      exemplo: r`
valores = [120.0, 89.9, 45.5, 300.0]
total = 0
for v in valores:
    total += v
print("Total:", total)

for i in range(1, 6):
    print(i, end=" ")
print()

for posicao, v in enumerate(valores, start=1):
    print(f"Item {posicao}: {v}")

for letra in "SQL":
    print(letra)
`,
      erro: {
        codigo: r`
# queria mostrar de 1 a 10
for i in range(1, 10):
    print(i)
`,
        explicacao: "O fim do `range` não entra: `range(1, 10)` vai até 9. Para incluir o 10, use `range(1, 11)`. Esse erro de uma posição a mais ou a menos é muito comum.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
print(list(range(2, 11, 3)))
`,
          opcoes: ["[2, 5, 8]", "[2, 5, 8, 11]", "[3, 6, 9]", "[2, 4, 6, 8, 10]"],
          resposta: 0,
          dicas: ["Comece em 2 e some 3 a cada passo.", "O fim (11) não entra.", "2, 5, 8 e o próximo seria 11."],
          comentario: "Começa em 2 e soma 3: 2, 5, 8. O 11 é o fim e não entra.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Quantas vezes o corpo de `for i in range(5, 0, -1):` executa?",
          opcoes: ["4", "5", "6", "Nenhuma"],
          resposta: 1,
          dicas: ["O passo negativo conta para trás.", "Liste os valores: 5, 4, ...", "O 0 é o fim e não entra."],
          comentario: "Os valores são 5, 4, 3, 2, 1: cinco voltas.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O código deveria contar quantos preços estão **acima de 100**. Ele sempre termina com 1. Corrija.",
          inicial: r`
precos = [99.9, 150.0, 100.0, 230.5, 80.0]
acima = 0
for p in precos:
    if p > 100:
        acima = 1
print(acima)
`,
          testes: [["assert acima == 2", "`acima` deve ser 2 (150.0 e 230.5)"]],
          dicas: ["Um contador precisa somar, não sobrescrever.", "O que acontece com `acima` a cada preço acima de 100?", "Troque `acima = 1` por `acima += 1`."],
          solucao: r`
precos = [99.9, 150.0, 100.0, 230.5, 80.0]
acima = 0
for p in precos:
    if p > 100:       # 100.0 não entra: é igual, não maior
        acima += 1    # soma 1 em vez de sobrescrever
print(acima)
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Com `vendas = [1200, 850, 430, 1990, 760]`, use `for` para calcular `total`, `maior` (sem usar `max`) e `media`.",
          inicial: r`
vendas = [1200, 850, 430, 1990, 760]
`,
          testes: [
            ["assert total == 5230", "`total` deve ser 5230"],
            ["assert maior == 1990", "`maior` deve ser 1990"],
            ["assert media == 1046", "`media` deve ser 1046"],
            ["assert 'max(' not in _src", "Não use a função `max`"],
          ],
          dicas: ["Comece com `total = 0` e `maior = vendas[0]`.", "A cada venda, some no total e compare com o maior até agora.", "A média é `total / len(vendas)`."],
          solucao: r`
vendas = [1200, 850, 430, 1990, 760]
total = 0
maior = vendas[0]          # começa com o primeiro valor
for v in vendas:
    total += v
    if v > maior:          # achou um maior: atualiza
        maior = v
media = total / len(vendas)
print(total, maior, media)
`,
          comentario: "Na prática você usaria `sum(vendas)`, `max(vendas)` e `statistics.mean(vendas)`. Fazer na mão uma vez ajuda a entender o padrão do acumulador.",
        },
      ],
    },
  ],
  desafios: [
    {
      id: "faixas-desconto",
      titulo: "Faixas de desconto do mês",
      enunciado: [
        "O time de compras quer saber o impacto da política de descontos nos pedidos do mês. Regras: até 500 (inclusive) sem desconto; acima de 500 até 2000 (inclusive), 5%; acima de 2000, 10%.",
        "Calcule `total_bruto` (soma dos pedidos), `total_desconto` (soma dos descontos), `total_liquido` (bruto menos desconto) e `com_desconto` (quantos pedidos tiveram algum desconto). Mostre um resumo com duas casas decimais.",
      ],
      inicial: r`
pedidos = [320.0, 1250.0, 2800.0, 90.0, 610.0, 2000.0]
`,
      testes: [
        ["assert abs(total_bruto - 7070.0) < 0.01", "`total_bruto` deve ser 7070.00"],
        ["assert abs(total_desconto - 473.0) < 0.01", "`total_desconto` deve ser 473.00 (62,50 + 280 + 30,50 + 100)"],
        ["assert abs(total_liquido - 6597.0) < 0.01", "`total_liquido` deve ser 6597.00"],
        ["assert com_desconto == 4", "`com_desconto` deve ser 4"],
        ["assert '6597.00' in _out or '6,597.00' in _out", "O resumo deve mostrar o total líquido com duas casas (6597.00)"],
      ],
      dicas: ["Percorra os pedidos com `for` e calcule o desconto de cada um com `if/elif/else`.", "Mantenha três acumuladores (bruto, desconto, contador) e atualize-os dentro do laço.", "Conte o pedido em `com_desconto` só quando o desconto for maior que zero; no fim, `total_liquido = total_bruto - total_desconto`."],
      solucao: r`
pedidos = [320.0, 1250.0, 2800.0, 90.0, 610.0, 2000.0]

total_bruto = 0
total_desconto = 0
com_desconto = 0

for valor in pedidos:
    if valor > 2000:
        desconto = valor * 0.10
    elif valor > 500:
        desconto = valor * 0.05
    else:
        desconto = 0

    total_bruto += valor
    total_desconto += desconto
    if desconto > 0:
        com_desconto += 1

total_liquido = total_bruto - total_desconto
print(f"Bruto:    R$ {total_bruto:.2f}")
print(f"Desconto: R$ {total_desconto:.2f} em {com_desconto} pedidos")
print(f"Líquido:  R$ {total_liquido:.2f}")
`,
    },
    {
      id: "codigos-nf",
      titulo: "Validar códigos de nota fiscal",
      enunciado: [
        "Os códigos de nota fiscal chegam de vários sistemas, com espaços e caixa misturada. Um código válido, depois de tirar espaços e passar para maiúsculas, tem o formato `NF-AAAA-NNNNN`: o prefixo `NF`, um ano com 4 dígitos e um número com 5 dígitos, separados por hífen.",
        "Conte em `validos` e `invalidos` quantos códigos de cada tipo existem e mostre cada código válido já normalizado, um por linha. O método `.isdigit()` diz se um texto tem só dígitos.",
      ],
      inicial: r`
codigos = ["NF-2024-00157", "nf-2024-158", "NF-2023-00012", "NF2024-00099", " nf-2024-00200 "]
`,
      testes: [
        ["assert validos == 3", "`validos` deve ser 3"],
        ["assert invalidos == 2", "`invalidos` deve ser 2"],
        ["assert 'NF-2024-00200' in _out", "O código ' nf-2024-00200 ' deve aparecer normalizado como NF-2024-00200"],
        ["assert 'NF-2024-158' not in _out and 'NF2024-00099' not in _out", "Códigos inválidos não devem ser mostrados"],
      ],
      dicas: ["Normalize cada código com `strip()` e `upper()` antes de testar.", "`codigo.split('-')` deve dar exatamente 3 partes; confira o tamanho de cada parte com `len`.", "Válido quando: `len(partes) == 3`, `partes[0] == 'NF'`, `len(partes[1]) == 4 and partes[1].isdigit()` e o mesmo para a terceira parte com 5 dígitos."],
      solucao: r`
codigos = ["NF-2024-00157", "nf-2024-158", "NF-2023-00012", "NF2024-00099", " nf-2024-00200 "]

validos = 0
invalidos = 0
for bruto in codigos:
    codigo = bruto.strip().upper()       # normaliza
    partes = codigo.split("-")
    ok = (
        len(partes) == 3
        and partes[0] == "NF"
        and len(partes[1]) == 4 and partes[1].isdigit()
        and len(partes[2]) == 5 and partes[2].isdigit()
    )
    if ok:
        validos += 1
        print(codigo)
    else:
        invalidos += 1

print("Válidos:", validos, "| Inválidos:", invalidos)
`,
      comentario: "Quando chegar ao módulo de organização do código, vale transformar essa regra numa função `valida_nf(codigo)`. Expressões regulares (`re`) também resolvem isso numa linha.",
    },
  ],
}));
