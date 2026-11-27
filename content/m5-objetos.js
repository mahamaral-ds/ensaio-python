Ensaio.modulo((r) => ({
  id: "m5",
  ordem: 5,
  titulo: "Orientação a objetos",
  resumo: "Classes, atributos e métodos, herança, métodos especiais e dataclasses.",
  licoes: [
    {
      id: "classes",
      titulo: "Classes e instâncias",
      explicacao: [
        "Uma **classe** é um molde que junta dados e comportamento. Cada objeto criado a partir dela é uma **instância**: `caneta = Produto('Caneta', 2.5)`.",
        "`__init__` é chamado ao criar a instância e prepara os **atributos**: `self.nome = nome`.",
        "`self` é a própria instância. Todo método recebe `self` como primeiro parâmetro, mas na chamada você não o passa: `caneta.metodo()`.",
        "Cada instância tem os seus próprios atributos. Alterar `toner.preco` não muda `caneta.preco`.",
        "> Por convenção, nomes de classe usam `CamelCase`: `Produto`, `PedidoDeCompra`.",
      ],
      exemplo: r`
class Produto:
    def __init__(self, nome, preco):
        self.nome = nome
        self.preco = preco

caneta = Produto("Caneta", 2.5)
toner = Produto("Toner", 189.9)
print(caneta.nome, caneta.preco)
print(toner.nome, toner.preco)

toner.preco = 179.9
print(toner.preco, caneta.preco)
print(isinstance(caneta, Produto), type(caneta).__name__)
`,
      erro: {
        codigo: r`
class Contador:
    def __init__(self):
        self.n = 0

    def incrementa():
        self.n += 1

c = Contador()
c.incrementa()
`,
        explicacao: "Faltou o `self` em `incrementa`. O Python passa a instância automaticamente como primeiro argumento, e a função não tem onde recebê-la: `TypeError ... takes 0 positional arguments but 1 was given`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que é `self` dentro de um método?",
          opcoes: ["Uma palavra reservada que cria a classe", "A própria instância sobre a qual o método foi chamado", "Uma variável global", "O nome da classe"],
          resposta: 1,
          dicas: ["Em `caneta.metodo()`, quem é passado automaticamente?", "Não é a classe, é o objeto.", "`self` é a instância."],
          comentario: "`caneta.metodo()` equivale a `Produto.metodo(caneta)`. `self` é apenas o nome convencional do primeiro parâmetro.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
class Caixa:
    def __init__(self, itens):
        self.itens = itens

a = Caixa(3)
b = Caixa(5)
a.itens += 1
print(a.itens, b.itens)
`,
          opcoes: ["4 5", "4 6", "3 5", "Erro"],
          resposta: 0,
          dicas: ["`a` e `b` são instâncias diferentes.", "Alterar um atributo de `a` mexe em `b`?", "Cada instância guarda os seus próprios atributos."],
          comentario: "Os atributos são de cada instância: só `a.itens` muda.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete a classe para que o código funcione.",
          codigo: r`
class Fornecedor:
    def ___(self, nome, uf):
        ___.nome = nome
        self.uf = uf

f = Fornecedor("Alfa", "SP")
print(f.nome, f.uf)
`,
          respostas: [["__init__"], ["self"]],
          testes: [["assert f.nome == 'Alfa' and f.uf == 'SP'", "`f.nome` deve ser 'Alfa' e `f.uf` deve ser 'SP'"]],
          dicas: ["O método chamado na criação do objeto tem dois sublinhados de cada lado.", "Os atributos pertencem à instância.", "`__init__` e `self`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a classe `Pedido` com os atributos `numero`, `cliente` e `itens`. `itens` é opcional e começa como uma lista vazia **diferente para cada pedido**. Lembre do cuidado com o valor padrão mutável.",
          inicial: r`
class Pedido:
    pass
`,
          testes: [
            ["p = Pedido(1, 'Ana')\nassert p.numero == 1 and p.cliente == 'Ana' and p.itens == []", "`Pedido(1, 'Ana')` deve ter numero 1, cliente 'Ana' e itens []"],
            ["p1 = Pedido(1, 'Ana'); p2 = Pedido(2, 'Bia')\np1.itens.append('caneta')\nassert p2.itens == [], 'os pedidos estão compartilhando a mesma lista'", "Cada pedido deve ter a sua própria lista de itens"],
            ["assert Pedido(3, 'Caio', ['a']).itens == ['a']", "Deve aceitar uma lista de itens inicial"],
          ],
          dicas: ["`def __init__(self, numero, cliente, itens=None):`.", "Se `itens` for `None`, crie uma lista nova.", "`self.itens = itens if itens is not None else []`."],
          solucao: r`
class Pedido:
    def __init__(self, numero, cliente, itens=None):
        self.numero = numero
        self.cliente = cliente
        # lista nova a cada instância (nunca use itens=[] como padrão)
        self.itens = itens if itens is not None else []

p = Pedido(1, "Ana")
p.itens.append("caneta")
print(p.numero, p.cliente, p.itens)
`,
        },
      ],
    },
    {
      id: "metodos",
      titulo: "Métodos, atributos de classe e propriedades",
      explicacao: [
        "**Métodos** são funções da classe que trabalham com os atributos da instância via `self`: `conta.depositar(50)`.",
        "Um **atributo de classe** é definido no corpo da classe, fora de métodos, e é compartilhado por todas as instâncias. Serve para constantes e configurações.",
        "`@property` transforma um método num atributo calculado: `conta.negativo`, sem parênteses. O valor é recalculado a cada acesso.",
        "Métodos podem validar regras e levantar exceções, protegendo o estado do objeto.",
      ],
      exemplo: r`
class Conta:
    taxa_saque = 2.0        # atributo de classe

    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

    def depositar(self, valor):
        self.saldo += valor

    def sacar(self, valor):
        total = valor + self.taxa_saque
        if total > self.saldo:
            raise ValueError("saldo insuficiente")
        self.saldo -= total

    @property
    def negativo(self):
        return self.saldo < 0

c = Conta("Ana", 100)
c.depositar(50)
c.sacar(30)
print(c.saldo, c.negativo)
print(Conta.taxa_saque)
`,
      erro: {
        codigo: r`
class Carrinho:
    def __init__(self):
        self.itens = []

    def total(self):
        return len(self.itens)

c = Carrinho()
print(c.total)
`,
        explicacao: "Sem parênteses, `c.total` é o próprio método, e o `print` mostra algo como `<bound method ...>`. Para executar, chame `c.total()`. Se a ideia é acessar sem parênteses, decore com `@property`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
class Contador:
    total = 0

    def __init__(self):
        Contador.total += 1

a = Contador()
b = Contador()
c = Contador()
print(Contador.total)
`,
          opcoes: ["1", "3", "0", "Erro"],
          resposta: 1,
          dicas: ["`total` pertence à classe, não a cada instância.", "Cada criação soma 1 no mesmo atributo.", "Foram criadas três instâncias."],
          comentario: "O atributo de classe é um só para todas as instâncias. Três criações, total 3.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve `@property`?",
          opcoes: ["Torna o atributo privado", "Permite acessar um método como se fosse um atributo, sem parênteses", "Cria um atributo de classe", "Impede a herança"],
          resposta: 1,
          dicas: ["Pense em `conta.negativo` no exemplo.", "O valor é calculado na hora.", "É um atributo calculado."],
          comentario: "Use para valores derivados de outros atributos, como `total` ou `idade`.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O método `entrada` deveria somar a quantidade ao estoque do produto, mas dá erro. Corrija.",
          inicial: r`
class Estoque:
    def __init__(self):
        self.itens = {}

    def entrada(self, produto, qtd):
        itens[produto] = itens.get(produto, 0) + qtd

    def saldo(self, produto):
        return self.itens.get(produto, 0)

e = Estoque()
e.entrada("caneta", 10)
e.entrada("caneta", 5)
print(e.saldo("caneta"))
`,
          testes: [
            ["assert e.saldo('caneta') == 15", "O saldo de caneta deve ser 15"],
            ["assert Estoque().saldo('x') == 0", "Um produto sem entradas deve ter saldo 0"],
          ],
          dicas: ["Leia o erro: qual nome não está definido?", "Dentro do método, os atributos são acessados por `self`.", "Troque `itens` por `self.itens`."],
          solucao: r`
class Estoque:
    def __init__(self):
        self.itens = {}

    def entrada(self, produto, qtd):
        # atributos da instância sempre via self
        self.itens[produto] = self.itens.get(produto, 0) + qtd

    def saldo(self, produto):
        return self.itens.get(produto, 0)

e = Estoque()
e.entrada("caneta", 10)
e.entrada("caneta", 5)
print(e.saldo("caneta"))
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a classe `Carrinho` com o método `adicionar(nome, preco, qtd=1)`, o método `total()` (soma de preço × quantidade) e a propriedade `quantidade_itens` (soma das quantidades).",
          inicial: r`
class Carrinho:
    pass
`,
          testes: [
            ["c = Carrinho()\nc.adicionar('caneta', 2.5, 4)\nc.adicionar('pasta', 12.0)\nassert c.total() == 22.0, c.total()", "`total()` deve somar preço × quantidade (22.0)"],
            ["c = Carrinho()\nc.adicionar('caneta', 2.5, 4)\nc.adicionar('pasta', 12.0)\nassert c.quantidade_itens == 5", "`quantidade_itens` deve ser 5, acessado sem parênteses"],
            ["assert Carrinho().total() == 0 and Carrinho().quantidade_itens == 0", "Um carrinho vazio tem total 0 e 0 itens"],
          ],
          dicas: ["No `__init__`, crie `self.itens = []`.", "Em `adicionar`, guarde uma tupla `(nome, preco, qtd)`.", "Decore `quantidade_itens` com `@property` e some `qtd` de cada item."],
          solucao: r`
class Carrinho:
    def __init__(self):
        self.itens = []

    def adicionar(self, nome, preco, qtd=1):
        self.itens.append((nome, preco, qtd))

    def total(self):
        return sum(preco * qtd for _, preco, qtd in self.itens)

    @property
    def quantidade_itens(self):
        return sum(qtd for _, _, qtd in self.itens)

c = Carrinho()
c.adicionar("caneta", 2.5, 4)
c.adicionar("pasta", 12.0)
print(c.total(), c.quantidade_itens)
`,
        },
      ],
    },
    {
      id: "heranca",
      titulo: "Herança",
      explicacao: [
        "**Herança** cria uma classe a partir de outra: `class Gerente(Funcionario):`. A classe filha recebe todos os atributos e métodos da classe mãe.",
        "A filha pode **sobrescrever** métodos, definindo de novo com o mesmo nome. `super()` acessa a versão da mãe: `super().__init__(nome, salario)`.",
        "Código que trabalha com a classe mãe funciona com qualquer filha. Isso é **polimorfismo**: cada objeto responde ao mesmo método do seu jeito.",
        "Use herança para relações do tipo \"é um\" (um gerente é um funcionário). Para \"tem um\", prefira guardar o outro objeto como atributo.",
      ],
      exemplo: r`
class Funcionario:
    def __init__(self, nome, salario):
        self.nome = nome
        self.salario = salario

    def bonus(self):
        return self.salario * 0.05

class Gerente(Funcionario):
    def __init__(self, nome, salario, equipe):
        super().__init__(nome, salario)
        self.equipe = equipe

    def bonus(self):
        return self.salario * 0.10 + 100 * len(self.equipe)

time = [Funcionario("Ana", 5000), Gerente("Bia", 9000, ["Ana", "Caio"])]
for f in time:
    print(f.nome, type(f).__name__, f.bonus())
print(isinstance(time[1], Funcionario))
`,
      erro: {
        codigo: r`
class Base:
    def __init__(self, nome):
        self.nome = nome

class Filha(Base):
    def __init__(self, nome, extra):
        self.extra = extra

f = Filha("x", 1)
print(f.nome)
`,
        explicacao: "O `__init__` da filha substituiu o da mãe e não chamou `super().__init__(nome)`. Por isso `self.nome` nunca foi criado: `AttributeError`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
class A:
    def fala(self):
        return "A"

class B(A):
    def fala(self):
        return "B" + super().fala()

print(B().fala(), A().fala())
`,
          opcoes: ["BA A", "B A", "AB A", "BA BA"],
          resposta: 0,
          dicas: ["`B` sobrescreve `fala`, mas chama a versão de `A`.", "A ordem da concatenação é `'B' + ...`.", "`A().fala()` não muda."],
          comentario: "`B().fala()` devolve 'B' + 'A'. Já `A().fala()` continua 'A'.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "`class Gerente(Funcionario):` significa que…",
          opcoes: ["`Funcionario` herda de `Gerente`", "`Gerente` herda os atributos e métodos de `Funcionario`", "As duas classes são independentes", "`Gerente` substitui `Funcionario` no programa"],
          resposta: 1,
          dicas: ["Entre parênteses fica a classe mãe.", "Quem herda é a classe que está sendo definida.", "Gerente é um tipo de Funcionário."],
          comentario: "A classe entre parênteses é a mãe (ou base).",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete a classe filha.",
          codigo: r`
class Produto:
    def __init__(self, nome, preco):
        self.nome = nome
        self.preco = preco

class ProdutoImportado(Produto):
    def __init__(self, nome, preco, imposto):
        ___().__init__(nome, preco)
        self.imposto = imposto

    def preco_final(self):
        return self.preco * (1 + self.___)

print(ProdutoImportado("Chip", 100, 0.6).preco_final())
`,
          respostas: [["super"], ["imposto"]],
          testes: [["p = ProdutoImportado('Chip', 100, 0.6)\nassert p.nome == 'Chip' and abs(p.preco_final() - 160) < 1e-9", "`ProdutoImportado('Chip', 100, 0.6)` deve ter nome 'Chip' e preço final 160"]],
          dicas: ["Para chamar o `__init__` da mãe.", "O segundo é um atributo criado no `__init__` da filha.", "`super` e `imposto`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Crie a hierarquia de fretes: a classe base `Frete` recebe `peso` e tem `custo()`, que levanta `NotImplementedError`. `FretePadrao` custa 10 + 2 por kg; `FreteExpresso` custa o dobro do padrão; `FreteGratis` custa 0. Escreva também `custo_total(fretes)`, que soma o custo de uma lista de fretes.",
          inicial: r`
class Frete:
    def __init__(self, peso):
        self.peso = peso

    def custo(self):
        raise NotImplementedError
`,
          testes: [
            ["assert FretePadrao(5).custo() == 20", "`FretePadrao(5).custo()` deve ser 20"],
            ["assert FreteExpresso(5).custo() == 40", "`FreteExpresso(5).custo()` deve ser 40"],
            ["assert FreteGratis(100).custo() == 0", "`FreteGratis(100).custo()` deve ser 0"],
            ["assert all(isinstance(c(1), Frete) for c in (FretePadrao, FreteExpresso, FreteGratis))", "Todas as classes devem herdar de Frete"],
            ["assert custo_total([FretePadrao(5), FreteExpresso(5), FreteGratis(9)]) == 60", "`custo_total` deve somar 20 + 40 + 0 = 60"],
          ],
          dicas: ["Cada filha sobrescreve `custo`.", "`FreteExpresso` pode herdar de `FretePadrao` e devolver `super().custo() * 2`.", "`custo_total` não precisa saber o tipo: `sum(f.custo() for f in fretes)`."],
          solucao: r`
class Frete:
    def __init__(self, peso):
        self.peso = peso

    def custo(self):
        raise NotImplementedError

class FretePadrao(Frete):
    def custo(self):
        return 10 + 2 * self.peso

class FreteExpresso(FretePadrao):        # reaproveita o cálculo do padrão
    def custo(self):
        return super().custo() * 2

class FreteGratis(Frete):
    def custo(self):
        return 0

def custo_total(fretes):
    # polimorfismo: cada frete sabe calcular o próprio custo
    return sum(f.custo() for f in fretes)

print(custo_total([FretePadrao(5), FreteExpresso(5), FreteGratis(9)]))
`,
        },
      ],
    },
    {
      id: "metodos-especiais",
      titulo: "Métodos especiais",
      explicacao: [
        "Métodos com dois sublinhados dos dois lados (*dunder*) integram seus objetos à linguagem.",
        "- `__repr__`: representação técnica, usada no console e dentro de listas. `__str__`: texto amigável, usado por `print` e `str()`.",
        "- `__eq__`: o que `==` significa. Sem ele, dois objetos só são iguais se forem o mesmo objeto.",
        "- `__lt__` (`<`): permite usar `sorted` e `min`. `__add__` (`+`), `__len__` (`len`), `__contains__` (`in`).",
        "Esses métodos devem **devolver** valores (`__repr__` devolve uma string), e não imprimir.",
      ],
      exemplo: r`
class Dinheiro:
    def __init__(self, valor):
        self.valor = round(valor, 2)

    def __repr__(self):
        return f"Dinheiro({self.valor})"

    def __str__(self):
        return f"R$ {self.valor:.2f}"

    def __add__(self, outro):
        return Dinheiro(self.valor + outro.valor)

    def __eq__(self, outro):
        return self.valor == outro.valor

    def __lt__(self, outro):
        return self.valor < outro.valor

a, b = Dinheiro(10.5), Dinheiro(4.25)
print(a + b)
print([a, b])
print(a == Dinheiro(10.5), sorted([a, b]))
`,
      erro: {
        codigo: r`
class Ponto:
    def __init__(self, x, y):
        self.x, self.y = x, y

print(Ponto(1, 2) == Ponto(1, 2))
`,
        explicacao: "Sem `__eq__`, o `==` compara a identidade (se é o mesmo objeto na memória), por isso dá `False`. Defina `__eq__` comparando os atributos, ou use uma dataclass, que gera isso para você.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual método especial `print(obj)` usa?",
          opcoes: ["Sempre `__repr__`", "`__str__`, e `__repr__` quando não houver `__str__`", "`__print__`", "`__init__`"],
          resposta: 1,
          dicas: ["`print` quer uma versão amigável.", "Existe um método de reserva.", "`__str__` primeiro, `__repr__` como reserva."],
          comentario: "Se você só puder escrever um, escreva `__repr__`: ele serve para os dois casos.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
class Lote:
    def __init__(self, itens):
        self.itens = itens

    def __len__(self):
        return len(self.itens)

    def __contains__(self, x):
        return x in self.itens

l = Lote(["a", "b", "c"])
print(len(l), "b" in l, "z" in l)
`,
          opcoes: ["3 True False", "3 False False", "Erro", "1 True False"],
          resposta: 0,
          dicas: ["`len(l)` chama `__len__`.", "`x in l` chama `__contains__`.", "Os dois repassam para a lista interna."],
          comentario: "`__len__` e `__contains__` fazem o objeto se comportar como uma coleção.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "Dois produtos devem ser considerados iguais quando têm o mesmo **código**, e `repr` deve devolver `Produto('P1')`. O código atual tem dois erros. Corrija.",
          inicial: r`
class Produto:
    def __init__(self, codigo, nome):
        self.codigo = codigo
        self.nome = nome

    def __repr__(self):
        print(f"Produto({self.codigo})")

    def __eq__(self, outro):
        return self.nome == outro.nome

a = Produto("P1", "Caneta azul")
b = Produto("P1", "caneta azul")
print(a == b, repr(a))
`,
          testes: [
            ["assert Produto('P1', 'x') == Produto('P1', 'y')", "Produtos com o mesmo código devem ser iguais"],
            ["assert Produto('P1', 'x') != Produto('P2', 'x')", "Produtos com códigos diferentes não são iguais, mesmo com o mesmo nome"],
            ["assert repr(Produto('P1', 'x')) == \"Produto('P1')\"", "`repr` deve devolver Produto('P1')"],
          ],
          dicas: ["`__repr__` precisa devolver uma string, não imprimir.", "Use `!r` para pôr as aspas: `f'Produto({self.codigo!r})'`.", "`__eq__` deve comparar `self.codigo == outro.codigo`."],
          solucao: r`
class Produto:
    def __init__(self, codigo, nome):
        self.codigo = codigo
        self.nome = nome

    def __repr__(self):
        return f"Produto({self.codigo!r})"     # devolve, não imprime

    def __eq__(self, outro):
        return self.codigo == outro.codigo      # identidade pelo código

a = Produto("P1", "Caneta azul")
b = Produto("P1", "caneta azul")
print(a == b, repr(a))
`,
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Crie a classe `Quantia(valor, moeda)`. `str` deve dar `'BRL 10.00'`. `+` soma quantias da mesma moeda e levanta `ValueError` para moedas diferentes. `==` compara valor e moeda. `<` compara os valores, para permitir `sorted`.",
          inicial: r`
class Quantia:
    pass
`,
          testes: [
            ["assert str(Quantia(10, 'BRL')) == 'BRL 10.00'", "`str(Quantia(10, 'BRL'))` deve ser 'BRL 10.00'"],
            ["assert Quantia(10, 'BRL') + Quantia(5.5, 'BRL') == Quantia(15.5, 'BRL')", "A soma de quantias da mesma moeda deve funcionar"],
            [r`
try:
    Quantia(1, "BRL") + Quantia(1, "USD")
    assert False, "deveria levantar ValueError"
except ValueError:
    pass
`, "Somar moedas diferentes deve levantar ValueError"],
            ["assert Quantia(1, 'BRL') != Quantia(1, 'USD')", "Moedas diferentes não são iguais"],
            ["assert [q.valor for q in sorted([Quantia(30, 'BRL'), Quantia(5, 'BRL'), Quantia(12, 'BRL')])] == [5, 12, 30]", "`sorted` deve ordenar pelo valor"],
          ],
          dicas: ["São cinco métodos: `__init__`, `__str__`, `__add__`, `__eq__` e `__lt__`.", "Em `__add__`, compare as moedas primeiro e devolva uma **nova** `Quantia`.", "`__eq__`: `return self.valor == outro.valor and self.moeda == outro.moeda`."],
          solucao: r`
class Quantia:
    def __init__(self, valor, moeda):
        self.valor = valor
        self.moeda = moeda

    def __str__(self):
        return f"{self.moeda} {self.valor:.2f}"

    def __repr__(self):
        return f"Quantia({self.valor!r}, {self.moeda!r})"

    def __add__(self, outro):
        if self.moeda != outro.moeda:
            raise ValueError(f"moedas diferentes: {self.moeda} e {outro.moeda}")
        return Quantia(self.valor + outro.valor, self.moeda)

    def __eq__(self, outro):
        return self.valor == outro.valor and self.moeda == outro.moeda

    def __lt__(self, outro):
        return self.valor < outro.valor

print(Quantia(10, "BRL") + Quantia(5.5, "BRL"))
`,
          comentario: "Para dinheiro de verdade, use `decimal.Decimal` em vez de `float`, para evitar erros de arredondamento.",
        },
      ],
    },
    {
      id: "dataclasses",
      titulo: "Dataclasses",
      explicacao: [
        "Para classes que são principalmente **dados**, `@dataclass` escreve o código repetitivo: gera `__init__`, `__repr__` e `__eq__` a partir dos campos anotados.",
        "Campos com valor padrão vêm depois dos obrigatórios. Para listas e dicionários, use `field(default_factory=list)`.",
        "Opções úteis: `@dataclass(frozen=True)` (imutável), `@dataclass(order=True)` (gera `<`, `>` etc., comparando os campos na ordem em que foram declarados).",
        "`__post_init__` roda logo depois do `__init__` gerado. É o lugar para validar ou calcular campos.",
        "> As anotações de tipo (`preco: float`) documentam, mas o Python não as verifica em tempo de execução.",
      ],
      exemplo: r`
from dataclasses import dataclass, field

@dataclass
class Item:
    produto: str
    preco: float
    qtd: int = 1

    @property
    def total(self):
        return self.preco * self.qtd

@dataclass
class Pedido:
    numero: int
    itens: list = field(default_factory=list)

    def total(self):
        return sum(i.total for i in self.itens)

p = Pedido(101)
p.itens.append(Item("Caneta", 2.5, 40))
p.itens.append(Item("Pasta", 12.0))
print(p)
print(p.total())
print(Item("Clips", 0.8) == Item("Clips", 0.8))
`,
      erro: {
        codigo: r`
from dataclasses import dataclass

@dataclass
class Lote:
    codigo: str
    itens: list = []
`,
        explicacao: "A dataclass recusa listas como padrão (`ValueError: mutable default`), justamente para evitar o problema da lista compartilhada. Use `itens: list = field(default_factory=list)`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que `@dataclass` gera automaticamente?",
          opcoes: ["Só o `__init__`", "`__init__`, `__repr__` e `__eq__` a partir dos campos", "Uma tabela num banco de dados", "Validação dos tipos em tempo de execução"],
          resposta: 1,
          dicas: ["Rode o exemplo e veja como `print(p)` aparece.", "Compare duas instâncias com `==`.", "Os tipos não são verificados."],
          comentario: "As anotações de tipo servem como documentação e para ferramentas como o mypy. Em tempo de execução, nada é verificado.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
from dataclasses import dataclass

@dataclass(frozen=True)
class Cnpj:
    numero: str

a = Cnpj("11")
b = Cnpj("11")
print(a == b, a)
`,
          opcoes: ["True Cnpj(numero='11')", "False Cnpj(numero='11')", "True <__main__.Cnpj object>", "Erro"],
          resposta: 0,
          dicas: ["A dataclass gera o `__eq__`.", "E também o `__repr__`.", "`frozen` só impede alterações."],
          comentario: "Dataclasses comparam campo a campo e mostram os campos no `repr`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para que cada lote tenha a sua própria lista de itens.",
          codigo: r`
from dataclasses import dataclass, ___

@dataclass
class Lote:
    codigo: str
    itens: list = field(___=list)

a = Lote("A")
a.itens.append(1)
print(Lote("B").itens)
`,
          respostas: [["field"], ["default_factory"]],
          testes: [["a = Lote('A'); b = Lote('B')\na.itens.append(1)\nassert b.itens == []", "Cada lote deve ter a sua própria lista"]],
          dicas: ["A função usada no padrão também precisa ser importada.", "O parâmetro recebe uma função que cria o valor.", "`field` e `default_factory`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie `@dataclass(order=True) class Fornecedor` com os campos `nota` (float), `nome` (str) e `prazo` (int, padrão 30), nessa ordem. Em `__post_init__`, levante `ValueError` se a nota estiver fora do intervalo de 0 a 10.",
          inicial: r`
from dataclasses import dataclass
`,
          testes: [
            ["assert sorted([Fornecedor(9.0, 'B'), Fornecedor(8.5, 'A')])[0].nome == 'A'", "Com `order=True`, a ordenação usa a nota primeiro"],
            ["assert Fornecedor(7, 'C').prazo == 30", "`prazo` deve ter padrão 30"],
            ["assert \"nome='A'\" in repr(Fornecedor(8.5, 'A'))", "Deve ser uma dataclass (repr com os campos)"],
            [r`
for nota in (11, -1):
    try:
        Fornecedor(nota, "X")
        assert False, f"nota {nota} deveria levantar ValueError"
    except ValueError:
        pass
`, "Notas fora de 0 a 10 devem levantar ValueError"],
          ],
          dicas: ["A ordem dos campos define a ordenação: `nota` vem primeiro.", "`def __post_init__(self):` dentro da classe.", "`if not 0 <= self.nota <= 10: raise ValueError(...)`."],
          solucao: r`
from dataclasses import dataclass

@dataclass(order=True)
class Fornecedor:
    nota: float          # primeiro campo: é o critério de ordenação
    nome: str
    prazo: int = 30

    def __post_init__(self):
        if not 0 <= self.nota <= 10:
            raise ValueError(f"nota fora do intervalo: {self.nota}")

print(sorted([Fornecedor(9.0, "B"), Fornecedor(8.5, "A")]))
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "pedido-validado",
      titulo: "Pedido com validação",
      enunciado: [
        "Modele um pedido de compra que protege as próprias regras:",
        "- `Item`: dataclass com `produto` (str), `preco` (float) e `qtd` (int);",
        "- `Pedido(numero)`: `adicionar(item)` levanta `ValueError` se o preço ou a quantidade não forem positivos;",
        "- `aplicar_desconto(pct)` aceita de 0 (exclusive) a 0.3 (inclusive) e levanta `ValueError` fora disso;",
        "- a propriedade `total` devolve a soma dos itens já com o desconto, arredondada em 2 casas; `len(pedido)` é o número de itens;",
        "- `str(pedido)` devolve `Pedido 101: 2 itens, R$ 112.00`.",
      ],
      inicial: r`
from dataclasses import dataclass
`,
      testes: [
        ["p = Pedido(101)\np.adicionar(Item('caneta', 2.5, 40))\np.adicionar(Item('pasta', 12.0, 1))\nassert p.total == 112.0 and len(p) == 2", "Um pedido com caneta (2.5 × 40) e pasta (12 × 1) deve ter total 112.0 e 2 itens"],
        ["p = Pedido(101)\np.adicionar(Item('caneta', 2.5, 40))\np.adicionar(Item('pasta', 12.0, 1))\nassert str(p) == 'Pedido 101: 2 itens, R$ 112.00', str(p)", "`str` deve ser 'Pedido 101: 2 itens, R$ 112.00'"],
        ["p = Pedido(1)\np.adicionar(Item('x', 100.0, 1))\np.aplicar_desconto(0.1)\nassert p.total == 90.0", "Com 10% de desconto, um pedido de 100 fica 90.0"],
        [r`
p = Pedido(1)
erros = 0
for item in (Item("a", 0, 1), Item("b", 10, 0), Item("c", -5, 2)):
    try:
        p.adicionar(item)
    except ValueError:
        erros += 1
for pct in (0, 0.5, -0.1):
    try:
        p.aplicar_desconto(pct)
    except ValueError:
        erros += 1
assert erros == 6, f"só {erros} de 6 casos inválidos levantaram ValueError"
assert len(p) == 0
`, "Preço ou quantidade não positivos e descontos fora de (0, 0.3] devem levantar ValueError"],
      ],
      dicas: ["`Item` é uma dataclass simples; `Pedido` pode ser uma classe comum com `self.itens = []` e `self.desconto = 0`.", "Valide em `adicionar` antes de fazer o `append`; em `aplicar_desconto`, teste `0 < pct <= 0.3`.", "`total` é uma `@property`: `round(sum(i.preco * i.qtd for i in self.itens) * (1 - self.desconto), 2)`."],
      solucao: r`
from dataclasses import dataclass

@dataclass
class Item:
    produto: str
    preco: float
    qtd: int

class Pedido:
    def __init__(self, numero):
        self.numero = numero
        self.itens = []
        self.desconto = 0.0

    def adicionar(self, item):
        if item.preco <= 0 or item.qtd <= 0:
            raise ValueError(f"item inválido: {item}")
        self.itens.append(item)

    def aplicar_desconto(self, pct):
        if not 0 < pct <= 0.3:
            raise ValueError("o desconto deve estar entre 0 e 30%")
        self.desconto = pct

    @property
    def total(self):
        bruto = sum(i.preco * i.qtd for i in self.itens)
        return round(bruto * (1 - self.desconto), 2)

    def __len__(self):
        return len(self.itens)

    def __str__(self):
        return f"Pedido {self.numero}: {len(self)} itens, R$ {self.total:.2f}"

p = Pedido(101)
p.adicionar(Item("caneta", 2.5, 40))
p.adicionar(Item("pasta", 12.0, 1))
print(p)
`,
    },
    {
      id: "hierarquia-impostos",
      titulo: "Hierarquia de produtos e impostos",
      enunciado: [
        "Monte uma hierarquia em que cada tipo de produto calcula o próprio imposto:",
        "- `Produto(nome, preco)`: `imposto()` devolve 0;",
        "- `ProdutoNacional`: 10% do preço;",
        "- `ProdutoImportado`: o imposto do nacional mais 60% de imposto de importação (total de 70%). Use `super()`;",
        "- `Servico`: 5% do preço (ISS).",
        "Escreva também `resumo_impostos(produtos)`, que devolve um dicionário nome da classe → total de imposto, com valores arredondados em 2 casas.",
      ],
      inicial: r`
class Produto:
    def __init__(self, nome, preco):
        self.nome = nome
        self.preco = preco

    def imposto(self):
        return 0
`,
      testes: [
        ["assert ProdutoNacional('a', 100).imposto() == 10 and Servico('s', 200).imposto() == 10", "Nacional: 10%; Serviço: 5%"],
        ["assert abs(ProdutoImportado('chip', 100).imposto() - 70) < 1e-9", "Importado: 70% (10% + 60%)"],
        ["assert issubclass(ProdutoImportado, ProdutoNacional) and issubclass(Servico, Produto)", "ProdutoImportado deve herdar de ProdutoNacional, e Servico de Produto"],
        [r`
itens = [ProdutoNacional("papel", 50), ProdutoImportado("toner", 300), ProdutoNacional("caneta", 30),
         Servico("manutenção", 400), Produto("doação", 80)]
r = resumo_impostos(itens)
assert r == {"ProdutoNacional": 8.0, "ProdutoImportado": 210.0, "Servico": 20.0, "Produto": 0}, r
`, "`resumo_impostos` deve agrupar pelo nome da classe"],
      ],
      dicas: ["Cada classe sobrescreve `imposto()`; `ProdutoImportado` herda de `ProdutoNacional`.", "`super().imposto() + self.preco * 0.60`.", "O nome da classe de um objeto é `type(p).__name__`. Some num dicionário com `.get(nome, 0)`."],
      solucao: r`
class Produto:
    def __init__(self, nome, preco):
        self.nome = nome
        self.preco = preco

    def imposto(self):
        return 0

class ProdutoNacional(Produto):
    def imposto(self):
        return self.preco * 0.10

class ProdutoImportado(ProdutoNacional):
    def imposto(self):
        return super().imposto() + self.preco * 0.60   # nacional + importação

class Servico(Produto):
    def imposto(self):
        return self.preco * 0.05

def resumo_impostos(produtos):
    resumo = {}
    for p in produtos:
        nome = type(p).__name__
        resumo[nome] = resumo.get(nome, 0) + p.imposto()
    return {k: round(v, 2) for k, v in resumo.items()}

itens = [ProdutoNacional("papel", 50), ProdutoImportado("toner", 300), Servico("manutenção", 400)]
print(resumo_impostos(itens))
`,
    },
  ],
}));
