Ensaio.modulo((r) => {
  // Arquivo grande e determinístico para o desafio de geradores
  const linhas = ["id;uf;valor"];
  for (let i = 1; i <= 5000; i++) {
    const uf = ["SP", "RJ", "MG", "BA"][i % 4];
    const v = i % 500 === 0 ? "NA" : (((i * 37) % 1000) + 0.5).toFixed(2);
    linhas.push(i + ";" + uf + ";" + v);
  }

  return {
    id: "m6",
    ordem: 6,
    titulo: "Python intermediário e avançado",
    resumo: "Iteradores, geradores, decoradores, gerenciadores de contexto, type hints, testes e PEP 8.",
    arquivos: {
      "vendas_grandes.csv": linhas.join("\n") + "\n",
      // pytest simplificado, para os testes rodarem no navegador
      "pytest.py": r`
"""Versão simplificada do pytest usada no Level Code (no navegador).

No seu computador, instale o pytest de verdade (pip install pytest)
e rode o comando pytest no terminal: ele encontra os arquivos test_*.py sozinho.
"""
import inspect
import math
import re


class _Raises:
    def __init__(self, exc, match=None):
        self.exc = exc
        self.match = match
        self.value = None

    def __enter__(self):
        return self

    def __exit__(self, tipo, valor, tb):
        if tipo is None:
            raise AssertionError(f"DID NOT RAISE {self.exc.__name__}")
        if not issubclass(tipo, self.exc):
            return False
        self.value = valor
        if self.match is not None and not re.search(self.match, str(valor)):
            raise AssertionError(f"mensagem {str(valor)!r} não combina com {self.match!r}")
        return True


def raises(exc, match=None):
    return _Raises(exc, match)


class approx:
    def __init__(self, esperado, rel=1e-6, abs=1e-12):
        self.esperado, self.rel, self.abs_tol = esperado, rel, abs

    def __eq__(self, outro):
        return math.isclose(outro, self.esperado, rel_tol=self.rel, abs_tol=self.abs_tol)

    def __repr__(self):
        return f"approx({self.esperado})"


class _Mark:
    @staticmethod
    def parametrize(nomes, valores):
        nomes = [n.strip() for n in nomes.split(",")]

        def deco(f):
            f._parametros = (nomes, list(valores))
            return f
        return deco


mark = _Mark()


def main(*_args, **_kwargs):
    g = inspect.currentframe().f_back.f_globals
    testes = [(n, f) for n, f in list(g.items()) if n.startswith("test") and callable(f)]
    ok = falhas = 0
    for nome, f in testes:
        casos = [{}]
        if hasattr(f, "_parametros"):
            nomes, valores = f._parametros
            casos = [dict(zip(nomes, v if isinstance(v, tuple) else (v,))) for v in valores]
        for kw in casos:
            rotulo = nome + (f"[{'-'.join(map(str, kw.values()))}]" if kw else "")
            try:
                f(**kw)
                ok += 1
                print(f"PASSOU  {rotulo}")
            except AssertionError as e:
                falhas += 1
                print(f"FALHOU  {rotulo}: {e or 'assert falhou'}")
            except Exception as e:
                falhas += 1
                print(f"ERRO    {rotulo}: {type(e).__name__}: {e}")
    print(f"== {ok} passaram, {falhas} falharam ==")
    return 1 if falhas else 0
`.trim() + "\n",
    },
    licoes: [
      {
        id: "iteradores",
        titulo: "Iteradores",
        explicacao: [
          "Um **iterável** é algo que pode ser percorrido com `for`: listas, strings, dicionários, arquivos. `iter(iteravel)` devolve um **iterador**, que entrega um item por vez com `next()`.",
          "Quando acabam os itens, `next()` levanta `StopIteration`, e é assim que o `for` sabe que terminou. `next(it, padrao)` devolve o padrão em vez de levantar o erro.",
          "Iteradores **se esgotam**: depois de percorridos, ficam vazios. `map`, `filter`, `zip`, arquivos e geradores são iteradores.",
          "Uma classe vira iterador implementando `__iter__` (devolve `self`) e `__next__`. O módulo `itertools` traz iteradores prontos: `islice`, `chain`, `count`, `groupby`.",
        ],
        exemplo: r`
numeros = [10, 20, 30]
it = iter(numeros)
print(next(it), next(it), next(it))
print(next(it, "acabou"))

class Contagem:
    def __init__(self, fim):
        self.atual = 0
        self.fim = fim
    def __iter__(self):
        return self
    def __next__(self):
        if self.atual >= self.fim:
            raise StopIteration
        self.atual += 1
        return self.atual

for n in Contagem(3):
    print(n)

import itertools
print(list(itertools.islice(itertools.count(100, 5), 4)))
print(list(itertools.chain([1, 2], [3])))
`,
        erro: {
          codigo: r`
dados = map(int, ["1", "2", "3"])
print(sum(dados))
print(sum(dados))   # esperava 6 de novo
`,
          explicacao: "`map` devolve um iterador, e a primeira soma o esgotou. A segunda percorre um iterador vazio e dá 0. Se precisar usar mais de uma vez, guarde numa lista: `dados = list(map(...))`.",
        },
        exercicios: [
          {
            tipo: "prever", nivel: 1,
            enunciado: "Qual é a saída?",
            codigo: r`
it = iter("ab")
print(next(it))
print(next(it))
print(next(it, "fim"))
`,
            opcoes: ["a\nb\nfim", "a\nb\nErro", "a\nb\nb", "ab\nfim"],
            resposta: 0,
            dicas: ["Uma string é iterável, caractere por caractere.", "Depois de `b`, não há mais itens.", "Com o segundo argumento, `next` não levanta erro."],
            comentario: "`next(it, 'fim')` devolve o padrão quando o iterador está esgotado.",
          },
          {
            tipo: "multipla", nivel: 2,
            enunciado: "Qual é a diferença entre um *iterável* e um *iterador*?",
            opcoes: ["Nenhuma", "O iterável gera iteradores com `iter()`; o iterador entrega os itens com `next()` e se esgota", "Iterador é sempre uma lista", "Iterável só existe em classes"],
            resposta: 1,
            dicas: ["Uma lista pode ser percorrida várias vezes.", "Um `map` só pode ser percorrido uma vez.", "Toda vez que você faz `for x in lista`, o Python cria um iterador novo."],
            comentario: "A lista é um iterável: cada `for` pede um iterador novo. O `map` já é o próprio iterador, por isso se esgota.",
          },
          {
            tipo: "completar", nivel: 2,
            enunciado: "Complete os nomes dos métodos para que `Regressiva` seja um iterador.",
            codigo: r`
class Regressiva:
    def __init__(self, inicio):
        self.n = inicio
    def ___(self):
        return self
    def ___(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

print(list(Regressiva(3)))
`,
            respostas: [["__iter__"], ["__next__"]],
            testes: [["assert list(Regressiva(3)) == [3, 2, 1]", "`list(Regressiva(3))` deve ser [3, 2, 1]"]],
            dicas: ["Um método é chamado por `iter()`, o outro por `next()`.", "Os dois têm dois sublinhados de cada lado.", "`__iter__` e `__next__`."],
          },
          {
            tipo: "escrever", nivel: 2,
            enunciado: "Escreva `primeiro_acima(valores, limite)`, que devolve o primeiro valor maior que o limite, ou `None` se não houver. Use `next()` com uma expressão geradora e um valor padrão, sem laço `for` explícito no corpo.",
            inicial: r`
def primeiro_acima(valores, limite):
    pass
`,
            testes: [
              ["assert primeiro_acima([10, 50, 30, 80], 40) == 50", "`primeiro_acima([10, 50, 30, 80], 40)` deve ser 50"],
              ["assert primeiro_acima([1, 2], 5) is None and primeiro_acima([], 0) is None", "Sem valor acima do limite, devolve None"],
              ["assert 'next(' in _src", "Use `next()`"],
            ],
            dicas: ["Uma expressão geradora: `(v for v in valores if v > limite)`.", "`next` pega o primeiro item que ela produz.", "`return next((v for v in valores if v > limite), None)`."],
            solucao: r`
def primeiro_acima(valores, limite):
    # o gerador para no primeiro valor encontrado: não percorre o resto
    return next((v for v in valores if v > limite), None)

print(primeiro_acima([10, 50, 30, 80], 40))
`,
          },
        ],
      },
      {
        id: "geradores",
        titulo: "Geradores",
        explicacao: [
          "Uma função com `yield` é um **gerador**. Ao ser chamada, ela não executa o corpo: devolve um iterador. A cada `next()`, roda até o próximo `yield`, entrega o valor e **pausa** ali.",
          "Geradores produzem os valores sob demanda (*lazy*). Dá para processar um arquivo de vários GB linha a linha, com memória constante.",
          "Encadeie geradores como etapas de uma linha de produção: ler → limpar → converter → somar. Cada etapa pega um item da anterior quando precisa.",
          "Expressões geradoras, `(x for x in ...)`, são a versão curta. `yield from outro` repassa todos os itens de outro iterável.",
        ],
        exemplo: r`
def pares_ate(n):
    for i in range(0, n + 1, 2):
        yield i

print(list(pares_ate(10)))

def linhas_uteis(texto):
    for linha in texto.splitlines():
        linha = linha.strip()
        if linha and not linha.startswith("#"):
            yield linha

dados = """
# cabeçalho
10
20

30
"""
numeros = (int(x) for x in linhas_uteis(dados))
print(sum(numeros))

g = pares_ate(4)
print(next(g), next(g), next(g))

import sys
print(sys.getsizeof([x for x in range(100000)]), "bytes (lista)")
print(sys.getsizeof(x for x in range(100000)), "bytes (gerador)")
`,
        erro: {
          codigo: r`
def pares_ate(n):
    for i in range(0, n + 1, 2):
        yield i

print(pares_ate(4))
`,
          explicacao: "Chamar a função geradora não produz os valores: devolve um objeto gerador. Para ver os valores, percorra com `for` ou converta com `list(pares_ate(4))`.",
        },
        exercicios: [
          {
            tipo: "prever", nivel: 2,
            enunciado: "Qual é a saída?",
            codigo: r`
def g():
    yield 1
    yield 2
    return
    yield 3

print(list(g()))
`,
            opcoes: ["[1, 2]", "[1, 2, 3]", "[]", "Erro"],
            resposta: 0,
            dicas: ["`return` dentro de um gerador encerra a geração.", "O que vem depois do `return` nunca roda.", "Ficam os dois primeiros valores."],
            comentario: "O `return` termina o gerador; para quem percorre, isso aparece como `StopIteration`.",
          },
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Qual é a vantagem de um gerador para processar um arquivo de 5 GB linha a linha?",
            opcoes: ["É mais rápido para qualquer tarefa", "Produz uma linha por vez, sem carregar o arquivo inteiro na memória", "Permite voltar a linhas anteriores", "Ordena as linhas automaticamente"],
            resposta: 1,
            dicas: ["Pense em memória, não em velocidade.", "Os valores são produzidos sob demanda.", "Só uma linha fica na memória por vez."],
            comentario: "O próprio objeto de arquivo já é um iterador de linhas, e geradores mantêm essa vantagem nas etapas seguintes.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete o gerador de soma acumulada.",
            codigo: r`
def acumulado(valores):
    total = 0
    for v in valores:
        total += v
        ___ total

print(list(acumulado([10, 5, 20])))
`,
            respostas: [["yield"]],
            testes: [["assert list(acumulado([10, 5, 20])) == [10, 15, 35]", "`list(acumulado([10, 5, 20]))` deve ser [10, 15, 35]"]],
            dicas: ["A função não usa `return`.", "A cada volta, ela entrega o total parcial.", "`yield total`."],
            comentario: "`itertools.accumulate` faz o mesmo e está pronto na biblioteca padrão.",
          },
          {
            tipo: "escrever", nivel: 2,
            enunciado: "Escreva o gerador `em_lotes(itens, tamanho)`, que entrega listas com até `tamanho` itens. Ele deve funcionar com qualquer iterável, inclusive `range`. Lotes assim são úteis para enviar dados a uma API em partes.",
            inicial: r`
def em_lotes(itens, tamanho):
    pass
`,
            testes: [
              ["assert list(em_lotes(range(7), 3)) == [[0, 1, 2], [3, 4, 5], [6]]", "`em_lotes(range(7), 3)` deve dar [[0, 1, 2], [3, 4, 5], [6]]"],
              ["assert list(em_lotes([], 2)) == []", "Uma entrada vazia não gera lotes"],
              ["import inspect\nassert inspect.isgeneratorfunction(em_lotes)", "`em_lotes` deve ser um gerador (usar `yield`)"],
            ],
            dicas: ["Vá juntando itens numa lista `lote`.", "Quando `len(lote) == tamanho`, faça `yield lote` e comece outra lista.", "No fim, se sobrou algo em `lote`, entregue também."],
            solucao: r`
def em_lotes(itens, tamanho):
    lote = []
    for item in itens:
        lote.append(item)
        if len(lote) == tamanho:
            yield lote
            lote = []          # começa um lote novo
    if lote:                   # sobra final
        yield lote

for lote in em_lotes(range(7), 3):
    print(lote)
`,
            comentario: "No Python 3.12 existe `itertools.batched(itens, tamanho)`, que entrega tuplas.",
          },
        ],
      },
      {
        id: "decoradores",
        titulo: "Decoradores",
        explicacao: [
          "Funções são objetos: podem ser passadas como argumento e devolvidas por outras funções.",
          "Um **decorador** recebe uma função e devolve outra, que a envolve (o *wrapper*). `@registrar` acima de `def soma` é o mesmo que `soma = registrar(soma)`.",
          "O wrapper costuma aceitar `*args, **kwargs`, chamar a função original e **devolver o resultado**.",
          "Use `@functools.wraps(func)` no wrapper para preservar o nome e a docstring da função original.",
          "Usos comuns: medir tempo, registrar chamadas, repetir em caso de falha, guardar em cache (`functools.lru_cache`).",
        ],
        exemplo: r`
import functools, time

def registrar(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"chamando {func.__name__}{args}")
        resultado = func(*args, **kwargs)
        print(f"{func.__name__} devolveu {resultado}")
        return resultado
    return wrapper

@registrar
def soma(a, b):
    return a + b

soma(2, 3)

def cronometrar(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        inicio = time.perf_counter()
        r = func(*args, **kwargs)
        print(f"{func.__name__}: {time.perf_counter() - inicio:.4f}s")
        return r
    return wrapper

@cronometrar
def soma_grande(n):
    return sum(range(n))

soma_grande(1_000_000)
print(soma.__name__)
`,
        erro: {
          codigo: r`
def log(func):
    def wrapper(*args):
        print("chamando", func.__name__)
        func(*args)
    return wrapper

@log
def dobro(x):
    return x * 2

print(dobro(5))
`,
          explicacao: "O wrapper chama `func(*args)`, mas não devolve o resultado, então a função decorada passa a devolver `None`. Escreva `return func(*args)`.",
        },
        exercicios: [
          {
            tipo: "prever", nivel: 2,
            enunciado: "Qual é a saída?",
            codigo: r`
def exclama(f):
    def w(texto):
        return f(texto) + "!"
    return w

@exclama
def grita(texto):
    return texto.upper()

print(grita("oi"))
`,
            opcoes: ["OI!", "oi!", "OI", "Erro"],
            resposta: 0,
            dicas: ["`grita` agora é o `w`.", "`w` chama a `grita` original e acrescenta algo.", "A original devolve em maiúsculas."],
            comentario: "`grita('oi')` → `w('oi')` → `'OI' + '!'`.",
          },
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Escrever `@decorador` acima de `def f(): ...` é o mesmo que…",
            opcoes: ["`f = decorador`", "`f = decorador(f)`", "`decorador = f(decorador)`", "`f(decorador)`"],
            resposta: 1,
            dicas: ["O decorador recebe a função.", "O nome `f` passa a apontar para o que o decorador devolve.", "`f = decorador(f)`."],
            comentario: "O `@` é só um atalho de sintaxe para reatribuir o nome.",
          },
          {
            tipo: "corrigir", nivel: 2,
            enunciado: "O decorador deveria contar quantas vezes a função foi chamada (em `preco.chamadas`) sem mudar o resultado. Ele tem três problemas. Corrija.",
            inicial: r`
import functools

def contar_chamadas(func):
    @functools.wraps(func)
    def wrapper():
        wrapper.chamadas += 1
        return func()
    wrapper.chamadas = 0

@contar_chamadas
def preco(produto, qtd):
    return 2.5 * qtd

preco("caneta", 2)
preco("caneta", 4)
print(preco.chamadas)
`,
            testes: [
              ["assert preco.chamadas == 2", "Depois de duas chamadas, `preco.chamadas` deve ser 2"],
              ["assert preco('x', 1) == 2.5", "O resultado da função não pode mudar"],
              ["assert preco.__name__ == 'preco'", "O nome da função deve ser preservado"],
            ],
            dicas: ["O decorador precisa devolver alguma coisa no fim.", "O wrapper precisa aceitar os argumentos da função original.", "`def wrapper(*args, **kwargs)`, `return func(*args, **kwargs)` e `return wrapper` no final do decorador."],
            solucao: r`
import functools

def contar_chamadas(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):            # aceita qualquer assinatura
        wrapper.chamadas += 1
        return func(*args, **kwargs)         # repassa os argumentos
    wrapper.chamadas = 0
    return wrapper                           # o decorador devolve o wrapper

@contar_chamadas
def preco(produto, qtd):
    return 2.5 * qtd

preco("caneta", 2)
preco("caneta", 4)
print(preco.chamadas)
`,
          },
          {
            tipo: "escrever", nivel: 3,
            enunciado: "Escreva o decorador `tentar_novamente`, que chama a função até 3 vezes enquanto ela levantar `ConnectionError`. Se falhar nas 3, relance o erro. Outros tipos de erro não devem gerar nova tentativa. É útil para chamadas a APIs instáveis.",
            inicial: r`
import functools

def tentar_novamente(func):
    pass
`,
            testes: [
              [r`
estado = {"n": 0}
@tentar_novamente
def instavel():
    estado["n"] += 1
    if estado["n"] < 3:
        raise ConnectionError("falhou")
    return "ok"
assert instavel() == "ok", "deveria ter funcionado na terceira tentativa"
assert estado["n"] == 3
`, "Uma função que falha duas vezes deve funcionar na terceira"],
              [r`
estado = {"n": 0}
@tentar_novamente
def sempre_falha():
    estado["n"] += 1
    raise ConnectionError("fora do ar")
try:
    sempre_falha()
    assert False, "deveria relançar o ConnectionError"
except ConnectionError:
    pass
assert estado["n"] == 3, f"foram {estado['n']} tentativas"
`, "Depois de 3 falhas, o ConnectionError deve ser relançado"],
              [r`
estado = {"n": 0}
@tentar_novamente
def erro_de_dado():
    estado["n"] += 1
    raise ValueError("dado ruim")
try:
    erro_de_dado()
except ValueError:
    pass
assert estado["n"] == 1, "outros erros não devem gerar nova tentativa"
`, "Erros que não são ConnectionError não são repetidos"],
            ],
            dicas: ["Dentro do wrapper, um `for tentativa in range(3):` com `try`.", "No `try`, `return func(*args, **kwargs)`: se funcionou, sai na hora.", "No `except ConnectionError:`, relance com `raise` se for a última tentativa (`tentativa == 2`)."],
            solucao: r`
import functools

def tentar_novamente(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        for tentativa in range(3):
            try:
                return func(*args, **kwargs)
            except ConnectionError:
                if tentativa == 2:     # última tentativa: desiste
                    raise
                print(f"tentativa {tentativa + 1} falhou, repetindo...")
    return wrapper
`,
            comentario: "Na prática, espere um pouco entre as tentativas (`time.sleep`), de preferência com intervalos crescentes. Bibliotecas como `tenacity` fazem isso por você.",
          },
        ],
      },
      {
        id: "contexto",
        titulo: "Gerenciadores de contexto",
        explicacao: [
          "O `with` garante que uma preparação e uma limpeza aconteçam juntas: abrir e fechar arquivo, conectar e desconectar, começar e terminar uma transação.",
          "Uma classe vira gerenciador de contexto com `__enter__` (roda na entrada; o que ele devolve vai para o `as`) e `__exit__(tipo, valor, tb)` (roda na saída, mesmo com erro).",
          "Se `__exit__` devolver `True`, a exceção que aconteceu dentro do bloco é suprimida. Normalmente devolva `False` ou nada.",
          "Com `@contextlib.contextmanager`, um gerador com um único `yield` faz o mesmo: o que vem antes do `yield` é a entrada, e o `finally` depois dele é a saída.",
        ],
        exemplo: r`
from contextlib import contextmanager, suppress
import time

class Cronometro:
    def __enter__(self):
        self.inicio = time.perf_counter()
        return self
    def __exit__(self, tipo, valor, tb):
        self.duracao = time.perf_counter() - self.inicio
        print(f"levou {self.duracao:.4f}s")
        return False   # não esconde erros

with Cronometro():
    total = sum(range(500_000))

@contextmanager
def etapa(nome):
    print(f"[início] {nome}")
    try:
        yield
    finally:
        print(f"[fim] {nome}")

with etapa("carga de dados"):
    print("processando...")

with suppress(FileNotFoundError):
    open("nao_existe.txt")
print("seguiu em frente")
`,
        erro: {
          codigo: r`
from contextlib import contextmanager

@contextmanager
def conexao():
    print("abrindo")
    yield
    print("fechando")

with conexao():
    1 / 0
`,
          explicacao: "O erro dentro do `with` sobe a partir do `yield`, e o `print('fechando')` nunca roda: a conexão ficaria aberta. Envolva o `yield` em `try/finally` para a limpeza acontecer sempre.",
        },
        exercicios: [
          {
            tipo: "prever", nivel: 1,
            enunciado: "Qual é a saída?",
            codigo: r`
class Ctx:
    def __enter__(self):
        print("entra")
        return 42
    def __exit__(self, *args):
        print("sai")

with Ctx() as x:
    print(x)
`,
            opcoes: ["entra\n42\nsai", "42\nentra\nsai", "entra\nsai\n42", "entra\nNone\nsai"],
            resposta: 0,
            dicas: ["`__enter__` roda antes do bloco.", "O `as x` recebe o que `__enter__` devolveu.", "`__exit__` roda ao sair do bloco."],
            comentario: "`as` recebe o retorno de `__enter__`, não o objeto `Ctx` (a não ser que `__enter__` devolva `self`).",
          },
          {
            tipo: "multipla", nivel: 2,
            enunciado: "Em `__exit__(self, tipo, valor, tb)`, o que acontece se o método devolver `True`?",
            opcoes: ["O bloco é executado de novo", "A exceção que aconteceu dentro do `with` é suprimida", "O arquivo é salvo", "Nada muda"],
            resposta: 1,
            dicas: ["`tipo`, `valor` e `tb` descrevem uma possível exceção.", "O valor devolvido decide o destino dela.", "`True` quer dizer \"já tratei\"."],
            comentario: "É assim que `contextlib.suppress` funciona. Use com cuidado: esconder erros dificulta achar bugs.",
          },
          {
            tipo: "completar", nivel: 2,
            enunciado: "Complete o gerenciador que troca a moeda da configuração só durante o bloco `with`.",
            codigo: r`
from contextlib import contextmanager

@contextmanager
def moeda_temporaria(config, nova):
    antiga = config["moeda"]
    config["moeda"] = nova
    try:
        ___
    finally:
        config["moeda"] = ___

cfg = {"moeda": "BRL"}
with moeda_temporaria(cfg, "USD"):
    print(cfg["moeda"])
print(cfg["moeda"])
`,
            respostas: [["yield"], ["antiga"]],
            testes: [["assert _out.strip() == 'USD\\nBRL'", "A saída deve ser USD e depois BRL"]],
            dicas: ["Um gerenciador feito com gerador pausa em algum ponto.", "No `finally`, restaure o valor guardado.", "`yield` e `antiga`."],
          },
          {
            tipo: "escrever", nivel: 3,
            enunciado: "Crie a classe `Transacao(lista)`. No `with`, ela entrega uma **cópia** de trabalho da lista. Se o bloco terminar sem erro, o conteúdo da lista original é substituído pela cópia. Se der erro, as mudanças são descartadas e o erro continua subindo.",
            inicial: r`
class Transacao:
    pass
`,
            testes: [
              ["dados = [1, 2]\nwith Transacao(dados) as t:\n    t.append(3)\nassert dados == [1, 2, 3], dados", "Sem erro, as mudanças são aplicadas à lista original"],
              [r`
dados = [1, 2]
try:
    with Transacao(dados) as t:
        t.append(99)
        raise ValueError("falhou no meio")
except ValueError:
    pass
else:
    assert False, "o ValueError não pode ser suprimido"
assert dados == [1, 2], f"as mudanças deveriam ter sido descartadas: {dados}"
`, "Com erro, as mudanças são descartadas e o erro sobe"],
            ],
            dicas: ["Em `__enter__`, crie `self.copia = list(self.original)` e devolva a cópia.", "Em `__exit__`, `tipo is None` quer dizer que não houve erro.", "Para alterar a lista original no lugar: `self.original[:] = self.copia`. Devolva `False`."],
            solucao: r`
class Transacao:
    def __init__(self, lista):
        self.original = lista

    def __enter__(self):
        self.copia = list(self.original)     # trabalha numa cópia
        return self.copia

    def __exit__(self, tipo, valor, tb):
        if tipo is None:                     # terminou sem erro: confirma
            self.original[:] = self.copia    # substitui o conteúdo no lugar
        return False                         # não suprime erros

dados = [1, 2]
with Transacao(dados) as t:
    t.append(3)
print(dados)
`,
            comentario: "Bancos de dados funcionam assim: `with conexao:` no `sqlite3` faz *commit* no sucesso e *rollback* no erro.",
          },
        ],
      },
      {
        id: "type-hints",
        titulo: "Type hints",
        explicacao: [
          "**Anotações de tipo** documentam o que uma função espera e devolve: `def preco_medio(precos: list[float]) -> float:`.",
          "Tipos compostos: `list[int]`, `dict[str, float]`, `tuple[str, int]`. Um valor que pode faltar é `float | None` (ou `Optional[float]`, do módulo `typing`).",
          "O Python **não verifica** os tipos ao rodar. Quem verifica são ferramentas como `mypy` e `pyright`, e os editores, que usam as anotações para autocompletar e apontar erros antes de executar.",
          "Em projetos de dados, anotar as funções de limpeza e transformação deixa o código mais fácil de manter e de revisar.",
        ],
        exemplo: r`
from typing import Optional

def preco_medio(precos: list[float]) -> float:
    return sum(precos) / len(precos)

def buscar(estoque: dict[str, int], produto: str) -> Optional[int]:
    return estoque.get(produto)

def formatar(valor: float, moeda: str = "R$") -> str:
    return f"{moeda} {valor:.2f}"

print(preco_medio([10.0, 20.0]))
print(buscar({"caneta": 5}, "lapis"))
print(formatar(3.5))
print(formatar.__annotations__)
print(formatar(7))   # um int também funciona: os tipos não são verificados
`,
        erro: {
          codigo: r`
def dobro(x: int) -> int:
    return x * 2

print(dobro("ab"))
`,
          explicacao: "Não dá erro: o Python ignora as anotações e devolve `'abab'`. Para pegar esse tipo de engano, rode um verificador como o `mypy`, que apontaria que `str` não é `int`.",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "O que acontece ao chamar `f('a')`, sendo `def f(x: int) -> int`?",
            opcoes: ["Um `TypeError` imediato", "O Python executa normalmente; as anotações não são verificadas em tempo de execução", "O valor é convertido para `int`", "Erro de sintaxe"],
            resposta: 1,
            dicas: ["Lembre do erro comum desta lição.", "Anotações são informação, não regras.", "Quem verifica é uma ferramenta externa."],
            comentario: "Pode ou não dar erro dentro da função, dependendo do que ela faz com o valor, mas as anotações em si nunca bloqueiam a chamada.",
          },
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Qual anotação descreve \"um dicionário de nome de produto para lista de preços\"?",
            opcoes: ["`dict[str, list[float]]`", "`dict(str, list)`", "`list[str, float]`", "`{str: [float]}`"],
            resposta: 0,
            dicas: ["Tipos genéricos usam colchetes.", "Primeiro o tipo da chave, depois o do valor.", "O valor é uma lista de floats."],
            comentario: "`dict[chave, valor]` e `list[item]` funcionam desde o Python 3.9.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete a anotação do retorno e a linha final.",
            codigo: r`
def total_por_uf(vendas: list[tuple[str, float]]) -> ___[str, float]:
    totais: dict[str, float] = {}
    for uf, valor in vendas:
        totais[uf] = totais.get(uf, 0.0) + valor
    ___ totais

print(total_por_uf([("SP", 10.0), ("SP", 5.0), ("RJ", 1.0)]))
`,
            respostas: [["dict"], ["return"]],
            testes: [
              ["assert total_por_uf([('SP', 10.0), ('SP', 5.0), ('RJ', 1.0)]) == {'SP': 15.0, 'RJ': 1.0}", "Os totais devem ser {'SP': 15.0, 'RJ': 1.0}"],
              ["assert total_por_uf.__annotations__['return'] == dict[str, float]", "O retorno deve estar anotado como dict[str, float]"],
            ],
            dicas: ["A função devolve um dicionário.", "A última linha entrega o resultado.", "`dict` e `return`."],
          },
          {
            tipo: "escrever", nivel: 2,
            enunciado: "Escreva `parse_valor(texto: str) -> float | None`, com essas anotações, que converte valores no formato brasileiro (`'1.234,56'` → 1234.56). Devolva `None` quando não for possível converter. Espaços nas pontas devem ser ignorados.",
            inicial: r`
def parse_valor(texto):
    pass
`,
            testes: [
              ["assert parse_valor('1.234,56') == 1234.56 and parse_valor(' 10 ') == 10.0", "Conversões: '1.234,56' → 1234.56 e ' 10 ' → 10.0"],
              ["assert parse_valor('abc') is None and parse_valor('') is None", "Textos inválidos devolvem None"],
              ["a = parse_valor.__annotations__\nassert a.get('texto') is str, 'anote o parâmetro texto como str'\nassert 'None' in str(a.get('return')) or 'Optional' in str(a.get('return')), 'anote o retorno como float | None'", "As anotações devem ser `texto: str` e `-> float | None`"],
            ],
            dicas: ["Comece pela assinatura: `def parse_valor(texto: str) -> float | None:`.", "Use `strip`, tire os pontos de milhar e troque a vírgula por ponto.", "Envolva o `float(...)` num `try/except ValueError: return None`."],
            solucao: r`
def parse_valor(texto: str) -> float | None:
    """Converte '1.234,56' em 1234.56; devolve None se não der."""
    limpo = texto.strip().replace(".", "").replace(",", ".")
    try:
        return float(limpo)
    except ValueError:
        return None

print(parse_valor("1.234,56"), parse_valor("abc"))
`,
          },
        ],
      },
      {
        id: "pytest",
        titulo: "Testes com pytest",
        explicacao: [
          "Testes automatizados verificam que o código faz o que deveria, agora e depois de cada mudança. Com o **pytest**, um teste é só uma função que começa com `test` e usa `assert`.",
          "O pytest procura arquivos `test_*.py`, executa cada função de teste e mostra quais passaram e quais falharam.",
          "`with pytest.raises(ValueError):` verifica que um erro é levantado. `@pytest.mark.parametrize` roda o mesmo teste com várias entradas. `pytest.approx` compara floats com tolerância.",
          "Teste as **bordas**: o limite exato de uma faixa, lista vazia, valor zero, texto inválido. É onde os bugs se escondem.",
          "> No Level Code, `pytest.main()` roda uma versão simplificada do pytest. No seu computador, instale com `pip install pytest` e rode `pytest` no terminal.",
        ],
        exemplo: r`
import pytest

def desconto(valor, pct):
    if not 0 <= pct <= 1:
        raise ValueError("pct fora de 0..1")
    return round(valor * (1 - pct), 2)

def test_desconto_simples():
    assert desconto(100, 0.1) == 90

def test_sem_desconto():
    assert desconto(50, 0) == 50

def test_pct_invalido():
    with pytest.raises(ValueError):
        desconto(100, 1.5)

@pytest.mark.parametrize("valor, pct, esperado", [(200, 0.5, 100), (10, 0.25, 7.5)])
def test_varios(valor, pct, esperado):
    assert desconto(valor, pct) == esperado

pytest.main()
`,
        erro: {
          codigo: r`
import pytest

def soma(a, b):
    return a - b          # bug

def test_soma():
    soma(2, 2) == 4       # faltou o assert

pytest.main()
`,
          explicacao: "Sem `assert`, a comparação é calculada e descartada, e o teste passa mesmo com o bug. Todo teste precisa de pelo menos um `assert` (ou um `pytest.raises`).",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Como o pytest encontra os testes?",
            opcoes: ["Pela ordem alfabética dos arquivos", "Procura funções que começam com `test` em arquivos `test_*.py`", "Procura funções decoradas com `@test`", "Só roda o que estiver no `if __name__ == '__main__'`"],
            resposta: 1,
            dicas: ["É uma convenção de nomes.", "Vale para o nome do arquivo e o da função.", "O prefixo `test`."],
            comentario: "Por isso nomes como `test_desconto_limite_superior` são comuns: o nome explica o que falhou.",
          },
          {
            tipo: "multipla", nivel: 2,
            enunciado: "Quantos destes testes passam?",
            codigo: r`
import pytest

def test_a():
    assert 1 + 1 == 2

def test_b():
    assert "a" * 2 == "aa"

def test_c():
    with pytest.raises(ZeroDivisionError):
        1 / 1
`,
            opcoes: ["1", "2", "3", "Nenhum"],
            resposta: 1,
            dicas: ["Os dois primeiros são verdadeiros?", "`pytest.raises` falha quando o erro **não** acontece.", "`1 / 1` não levanta erro."],
            comentario: "`test_c` falha com `DID NOT RAISE ZeroDivisionError`: o bloco precisava levantar o erro.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete os dois testes.",
            codigo: r`
import pytest

def parse_qtd(texto):
    return int(texto)

def test_parse_valido():
    ___ parse_qtd("12") == 12

def test_parse_invalido():
    with pytest.___(ValueError):
        parse_qtd("doze")

pytest.main()
`,
            respostas: [["assert"], ["raises"]],
            testes: [["test_parse_valido()\ntest_parse_invalido()\nassert '2 passaram, 0 falharam' in _out", "Os dois testes devem passar"]],
            dicas: ["O primeiro verifica uma condição.", "O segundo verifica que um erro é levantado.", "`assert` e `raises`."],
          },
          {
            tipo: "escrever", nivel: 3,
            enunciado: "Desta vez, você escreve os **testes**. `classificar(valor)` devolve `'A'` para 1000 ou mais, `'B'` de 500 a 999,99 e `'C'` abaixo de 500. Escreva pelo menos 3 funções `test_...` que passem com esta implementação. O verificador vai trocar `classificar` por versões com bugs nos limites e espera que seus testes peguem todas.",
            inicial: r`
import pytest

def classificar(valor):
    if valor >= 1000:
        return "A"
    if valor >= 500:
        return "B"
    return "C"

# escreva seus testes abaixo


pytest.main()
`,
            testes: [
              ["testes = [f for n, f in list(globals().items()) if n.startswith('test') and callable(f)]\nassert len(testes) >= 3, f'encontrei {len(testes)} testes'", "Escreva pelo menos 3 funções de teste"],
              ["for t in [f for n, f in list(globals().items()) if n.startswith('test') and callable(f)]:\n    t()", "Todos os seus testes passam com a implementação correta"],
              [r`
original = classificar
mutantes = {
    "1000 virou B (usa > em vez de >=)": lambda v: "A" if v > 1000 else "B" if v >= 500 else "C",
    "500 virou C (usa > em vez de >=)": lambda v: "A" if v >= 1000 else "B" if v > 500 else "C",
    "nunca devolve C": lambda v: "A" if v >= 1000 else "B",
}
testes = [f for n, f in list(globals().items()) if n.startswith("test") and callable(f)]
escaparam = []
for nome, mutante in mutantes.items():
    globals()["classificar"] = mutante
    pegou = False
    for t in testes:
        try:
            t()
        except AssertionError:
            pegou = True
    if not pegou:
        escaparam.append(nome)
globals()["classificar"] = original
assert not escaparam, "bugs que seus testes não pegaram: " + "; ".join(escaparam)
`, "Seus testes pegam os bugs nos limites (1000, 500) e o caso abaixo de 500"],
            ],
            dicas: ["Teste exatamente os limites: `classificar(1000)` e `classificar(500)`.", "Inclua um valor bem abaixo, como `classificar(10)`, e um logo abaixo de um limite, como `classificar(999.99)`.", "Exemplo: `def test_limite_a(): assert classificar(1000) == 'A'`."],
            solucao: r`
import pytest

def classificar(valor):
    if valor >= 1000:
        return "A"
    if valor >= 500:
        return "B"
    return "C"

def test_limite_a():
    assert classificar(1000) == "A"        # borda exata

def test_faixa_b():
    assert classificar(500) == "B"         # borda exata
    assert classificar(999.99) == "B"      # logo abaixo de A

def test_faixa_c():
    assert classificar(499.99) == "C"
    assert classificar(0) == "C"

pytest.main()
`,
            comentario: "Trocar o código por versões com bugs para ver se os testes percebem se chama *teste de mutação*. Ferramentas como `mutmut` fazem isso automaticamente.",
          },
        ],
      },
      {
        id: "pep8",
        titulo: "Boas práticas e PEP 8",
        explicacao: [
          "A **PEP 8** é o guia de estilo do Python. Seguir o guia faz seu código parecer com o de qualquer outra pessoa, e isso facilita a leitura.",
          "- Nomes: `snake_case` para variáveis e funções, `CamelCase` para classes, `MAIUSCULAS` para constantes.",
          "- 4 espaços por nível de indentação, linhas de até 79 caracteres (ou 88, com o `black`), espaços em volta de `=` e de operadores.",
          "- Imports no topo, um por linha: primeiro a biblioteca padrão, depois pacotes de terceiros, depois os seus módulos.",
          "- Compare com `None` usando `is None`; teste listas vazias com `if lista:`; prefira `enumerate` e `zip` a `range(len(...))`; capture exceções específicas.",
          "Ferramentas fazem isso por você: `ruff` aponta problemas e `black` formata o código automaticamente.",
        ],
        exemplo: r`
# Antes: funciona, mas é difícil de ler
def CalcTot(L,d=0):
  t=0
  for i in range(len(L)):
    t=t+L[i]
  if d!=None: t=t-t*d
  return t

# Depois, seguindo a PEP 8
DESCONTO_PADRAO = 0.0

def calcular_total(valores, desconto=DESCONTO_PADRAO):
    """Soma os valores e aplica o desconto (fração de 0 a 1)."""
    total = sum(valores)
    if desconto is not None:
        total -= total * desconto
    return total

print(CalcTot([10, 20], 0.1), calcular_total([10, 20], 0.1))
`,
        erro: {
          codigo: r`
codigo = "".join(["NF", "-", "001"])
print(codigo == "NF-001")
print(codigo is "NF-001")
`,
          explicacao: "`is` compara se é **o mesmo objeto**, não se o valor é igual. Dois textos iguais podem ser objetos diferentes, e aí `is` dá `False`. Use `==` para valores e reserve `is` para `None`, `True` e `False`.",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Qual nome de função segue a PEP 8?",
            opcoes: ["`CalcularTotal`", "`calcular_total`", "`calcularTotal`", "`CALCULAR_TOTAL`"],
            resposta: 1,
            dicas: ["`CamelCase` é para classes.", "Maiúsculas são para constantes.", "Funções usam `snake_case`."],
            comentario: "`calcularTotal` (camelCase) é o padrão do JavaScript e do Java, não do Python.",
          },
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Qual é a forma recomendada de testar se `x` é `None`?",
            opcoes: ["`x == None`", "`x is None`", "`not x`", "`x = None`"],
            resposta: 1,
            dicas: ["`None` é um objeto único.", "`not x` também é verdadeiro para 0 e para texto vazio.", "Compare a identidade."],
            comentario: "`x is None` é exato. `not x` confundiria `None` com 0, `''` e `[]`.",
          },
          {
            tipo: "corrigir", nivel: 2,
            enunciado: "A função funciona, mas não segue a PEP 8. Reescreva como `media_ponderada(valores, pesos=None)`: indentação de 4 espaços, `is None` e `zip` no lugar de `range(len(...))`. Sem pesos, todos os pesos valem 1.",
            inicial: r`
def MediaPond(V,P=None):
  if P==None: P=[1]*len(V)
  s=0
  for i in range(len(V)):
    s=s+V[i]*P[i]
  return s/sum(P)
`,
            testes: [
              ["assert media_ponderada([10, 20], [1, 3]) == 17.5 and media_ponderada([4, 6]) == 5", "`media_ponderada` deve calcular certo (17.5 e 5)"],
              ["assert 'MediaPond' not in _src", "Renomeie a função para `media_ponderada`"],
              ["assert 'range(len' not in _src", "Use `zip` em vez de `range(len(...))`"],
              ["assert '== None' not in _src and '==None' not in _src", "Compare com `is None`"],
              ["assert all((len(l) - len(l.lstrip(' '))) % 4 == 0 for l in _src.splitlines()), 'há linhas com indentação que não é múltipla de 4'", "Use indentação de 4 espaços"],
            ],
            dicas: ["Comece pelo nome e pelos parâmetros: `def media_ponderada(valores, pesos=None):`.", "`if pesos is None: pesos = [1] * len(valores)`.", "`total = sum(v * p for v, p in zip(valores, pesos))` e `return total / sum(pesos)`."],
            solucao: r`
def media_ponderada(valores, pesos=None):
    """Média de valores com pesos; sem pesos, todos valem 1."""
    if pesos is None:
        pesos = [1] * len(valores)
    total = sum(v * p for v, p in zip(valores, pesos))
    return total / sum(pesos)

print(media_ponderada([10, 20], [1, 3]))
`,
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete com o nome da constante, seguindo a PEP 8 (o mesmo nome usado no padrão do parâmetro).",
            codigo: r`
___ = 0.18   # alíquota padrão

def preco_final(preco, aliquota=ALIQUOTA_PADRAO):
    return round(preco * (1 + aliquota), 2)

print(preco_final(100))
`,
            respostas: [["ALIQUOTA_PADRAO"]],
            testes: [["assert preco_final(100) == 118.0", "`preco_final(100)` deve ser 118.0"]],
            dicas: ["Constantes ficam em maiúsculas.", "O nome já aparece no código.", "`ALIQUOTA_PADRAO`."],
          },
        ],
      },
    ],
    desafios: [
      {
        id: "arquivo-grande",
        titulo: "Processar um arquivo grande com geradores",
        enunciado: [
          "O arquivo `vendas_grandes.csv` tem 5000 linhas (`id;uf;valor`), e algumas têm o valor `NA`. Monte uma linha de processamento com **geradores**, sem guardar o arquivo inteiro numa lista:",
          "- `ler_registros(caminho)`: gerador que entrega dicionários `{'id': int, 'uf': str, 'valor': float}`, pulando o cabeçalho e as linhas inválidas;",
          "- `filtrar_uf(registros, uf)`: gerador que entrega só os registros da UF pedida;",
          "- `total_uf(caminho, uf)`: devolve a soma dos valores da UF, arredondada em 2 casas, usando os dois geradores.",
        ],
        inicial: r`
def ler_registros(caminho):
    pass

def filtrar_uf(registros, uf):
    pass

def total_uf(caminho, uf):
    pass
`,
        testes: [
          ["import inspect\nassert inspect.isgeneratorfunction(ler_registros) and inspect.isgeneratorfunction(filtrar_uf)", "`ler_registros` e `filtrar_uf` devem ser geradores"],
          ["primeiro = next(ler_registros('vendas_grandes.csv'))\nassert primeiro == {'id': 1, 'uf': 'RJ', 'valor': 37.5}, primeiro", "O primeiro registro deve ser {'id': 1, 'uf': 'RJ', 'valor': 37.5}"],
          ["n = sum(1 for _ in ler_registros('vendas_grandes.csv'))\nassert n == 4990, f'{n} registros (as 10 linhas com NA devem ser puladas)'", "Devem sobrar 4990 registros válidos"],
          ["esperado = round(sum((i * 37 % 1000) + 0.5 for i in range(1, 5001) if i % 4 == 0 and i % 500 != 0), 2)\nassert total_uf('vendas_grandes.csv', 'SP') == esperado, (total_uf('vendas_grandes.csv', 'SP'), esperado)", "`total_uf(..., 'SP')` deve somar os valores válidos de SP"],
        ],
        dicas: ["Em `ler_registros`, abra o arquivo, chame `next(f)` uma vez para pular o cabeçalho e percorra as linhas com `for`.", "Dentro do laço, use `try/except ValueError` em volta de `float(valor)` e `continue` nas linhas ruins.", "`filtrar_uf` é uma linha: `yield from (r for r in registros if r['uf'] == uf)`. `total_uf` soma com uma expressão geradora."],
        solucao: r`
def ler_registros(caminho):
    with open(caminho, encoding="utf-8") as f:
        next(f)                                  # pula o cabeçalho
        for linha in f:                          # o arquivo já é um iterador
            id_, uf, valor = linha.strip().split(";")
            try:
                yield {"id": int(id_), "uf": uf, "valor": float(valor)}
            except ValueError:                   # 'NA' e afins
                continue

def filtrar_uf(registros, uf):
    yield from (r for r in registros if r["uf"] == uf)

def total_uf(caminho, uf):
    registros = filtrar_uf(ler_registros(caminho), uf)
    return round(sum(r["valor"] for r in registros), 2)

for uf in ("SP", "RJ", "MG", "BA"):
    print(uf, total_uf("vendas_grandes.csv", uf))
`,
        comentario: "Nada aqui cria uma lista com as 5000 linhas: cada registro passa pelas etapas e é descartado. Com arquivos realmente grandes no pandas, o equivalente é `pd.read_csv(..., chunksize=100_000)`.",
      },
      {
        id: "decorador-testado",
        titulo: "Decorador de tempo, com testes",
        enunciado: [
          "Escreva o decorador `medir`, que guarda a duração de cada chamada (em segundos, com `time.perf_counter`) na lista `funcao_decorada.tempos`, devolve o resultado original e preserva o nome e a docstring.",
          "Depois, escreva **pelo menos dois testes** (`test_...`) para o seu decorador e rode `pytest.main()`.",
        ],
        inicial: r`
import functools
import time
import pytest

def medir(func):
    pass

# seus testes aqui


pytest.main()
`,
        testes: [
          [r`
@medir
def lenta(n):
    """Docstring."""
    return sum(range(n))
assert lenta(1000) == 499500, "o resultado original deve ser devolvido"
lenta(10)
assert lenta.__name__ == "lenta" and lenta.__doc__ == "Docstring.", "use functools.wraps"
assert len(lenta.tempos) == 2 and all(isinstance(t, float) and t >= 0 for t in lenta.tempos), lenta.tempos
`, "`medir` devolve o resultado, preserva o nome e a docstring e registra um tempo por chamada"],
          [r`
@medir
def a():
    pass
@medir
def b():
    pass
a(); a(); b()
assert len(a.tempos) == 2 and len(b.tempos) == 1, "cada função decorada tem a sua própria lista"
`, "Cada função decorada tem a sua própria lista de tempos"],
          ["testes = [f for n, f in list(globals().items()) if n.startswith('test') and callable(f)]\nassert len(testes) >= 2, f'encontrei {len(testes)} testes'\nfor t in testes:\n    t()", "Seus testes existem (pelo menos 2) e passam"],
        ],
        dicas: ["O padrão é o mesmo do `cronometrar` da lição, mas guardando em vez de imprimir.", "Crie `wrapper.tempos = []` dentro de `medir`, antes de `return wrapper`; no wrapper, faça `wrapper.tempos.append(fim - inicio)`.", "Testes possíveis: o nome é preservado; depois de 3 chamadas há 3 tempos; o resultado é o mesmo da função original."],
        solucao: r`
import functools
import time
import pytest

def medir(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        inicio = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:                       # registra mesmo se der erro
            wrapper.tempos.append(time.perf_counter() - inicio)
    wrapper.tempos = []                # uma lista por função decorada
    return wrapper

def test_preserva_nome_e_resultado():
    @medir
    def dobro(x):
        return 2 * x
    assert dobro(4) == 8
    assert dobro.__name__ == "dobro"

def test_registra_um_tempo_por_chamada():
    @medir
    def nada():
        pass
    for _ in range(3):
        nada()
    assert len(nada.tempos) == 3
    assert all(t >= 0 for t in nada.tempos)

pytest.main()
`,
      },
    ],
  };
});
