Ensaio.modulo((r) => ({
  id: "m8",
  ordem: 8,
  titulo: "Tópicos avançados",
  resumo: "Desempenho, otimização, programação assíncrona, consumo de APIs e organização de projetos.",
  arquivos: {
    // API fictícia: imita a interface do requests, sem rede
    "api_ficticia.py": r`
"""API fictícia para estudar no navegador.

Imita a interface da biblioteca requests: get(url, params=...) devolve uma
resposta com status_code, ok, json() e raise_for_status(). aget() é a versão
assíncrona, com um atraso que simula a rede.
"""
import asyncio
import json
from urllib.parse import parse_qs, urlparse

BASE = "https://api.ficticia.com.br"

_FORNECEDORES = [
    {"id": 1, "nome": "Alfa Embalagens", "uf": "SP", "ativo": True},
    {"id": 2, "nome": "Beta Insumos", "uf": "SP", "ativo": True},
    {"id": 3, "nome": "Gama Logística", "uf": "RJ", "ativo": False},
    {"id": 4, "nome": "Delta Papéis", "uf": "MG", "ativo": True},
]
_PEDIDOS = [
    {"id": 100 + i, "fornecedor_id": (i % 4) + 1, "valor": float(150 + (i * 73) % 900)}
    for i in range(1, 26)
]
_COTACOES = {"USD": 5.12, "EUR": 5.54, "ARS": 0.0058}
_instavel = {"n": 0}


class HTTPError(Exception):
    pass


class Resposta:
    def __init__(self, status_code, dados):
        self.status_code = status_code
        self.text = json.dumps(dados, ensure_ascii=False)

    @property
    def ok(self):
        return 200 <= self.status_code < 300

    def json(self):
        return json.loads(self.text)

    def raise_for_status(self):
        if not self.ok:
            raise HTTPError(f"{self.status_code}: {self.json().get('erro', 'erro')}")

    def __repr__(self):
        return f"<Resposta [{self.status_code}]>"


def _rota(url, params):
    partes = urlparse(url)
    caminho = partes.path.rstrip("/")
    params = dict(params or {})
    params.update({k: v[0] for k, v in parse_qs(partes.query).items()})
    if caminho == "/fornecedores":
        dados = _FORNECEDORES
        if "uf" in params:
            dados = [f for f in dados if f["uf"] == params["uf"]]
        return 200, dados
    if caminho.startswith("/fornecedores/"):
        try:
            fid = int(caminho.split("/")[-1])
        except ValueError:
            return 400, {"erro": "id inválido"}
        for f in _FORNECEDORES:
            if f["id"] == fid:
                return 200, f
        return 404, {"erro": "fornecedor não encontrado"}
    if caminho == "/pedidos":
        pagina = int(params.get("pagina", 1))
        tamanho = 10
        inicio = (pagina - 1) * tamanho
        itens = _PEDIDOS[inicio:inicio + tamanho]
        proxima = pagina + 1 if inicio + tamanho < len(_PEDIDOS) else None
        return 200, {"pagina": pagina, "itens": itens, "proxima": proxima}
    if caminho.startswith("/cotacao/"):
        moeda = caminho.split("/")[-1].upper()
        if moeda in _COTACOES:
            return 200, {"moeda": moeda, "valor_brl": _COTACOES[moeda]}
        return 404, {"erro": f"moeda {moeda} não encontrada"}
    if caminho == "/instavel":
        _instavel["n"] += 1
        if _instavel["n"] % 3:
            return 503, {"erro": "serviço indisponível"}
        return 200, {"status": "ok", "tentativa": _instavel["n"]}
    return 404, {"erro": "rota não encontrada"}


def get(url, params=None, timeout=None):
    status, dados = _rota(url, params)
    return Resposta(status, dados)


async def aget(url, params=None, atraso=0.3):
    await asyncio.sleep(atraso)   # simula a espera da rede
    return get(url, params)
`.trim() + "\n",
    "config.json": r`
{"limite_alerta": 8000, "moeda": "BRL"}
`.trim() + "\n",
  },
  licoes: [
    {
      id: "desempenho",
      titulo: "Medir desempenho",
      explicacao: [
        "Regra de ouro: **meça antes de otimizar**. A intuição sobre onde está a lentidão costuma errar.",
        "`time.perf_counter()` mede um trecho uma vez. Para comparar alternativas, use `timeit.timeit(funcao, number=N)`, que repete muitas vezes e reduz o ruído.",
        "Para descobrir *qual parte* de um programa grande é lenta, use um perfilador: `python -m cProfile -s cumtime script.py`, ou `%prun` e `%timeit` no Jupyter.",
        "Os ganhos grandes costumam vir de: funções prontas (`sum`, `sorted`, métodos do pandas), a estrutura de dados certa (`set` e `dict` para buscas) e evitar trabalho repetido.",
        "> No navegador, o Python roda em WebAssembly e é mais lento que no computador. As proporções entre as alternativas, porém, se mantêm.",
      ],
      exemplo: r`
import time, timeit

def soma_laco(n):
    total = 0
    for i in range(n):
        total += i
    return total

def soma_builtin(n):
    return sum(range(n))

inicio = time.perf_counter()
soma_laco(1_000_000)
print(f"laço: {time.perf_counter() - inicio:.4f}s")

t1 = timeit.timeit(lambda: soma_laco(100_000), number=20)
t2 = timeit.timeit(lambda: soma_builtin(100_000), number=20)
print(f"laço {t1:.3f}s × builtin {t2:.3f}s → {t1 / t2:.1f}x")

lista = list(range(100_000))
conjunto = set(lista)
print("busca na lista:", timeit.timeit(lambda: 99_999 in lista, number=200))
print("busca no set:  ", timeit.timeit(lambda: 99_999 in conjunto, number=200))
`,
      erro: {
        codigo: r`
import time
inicio = time.perf_counter()
x = sum(range(10))
print(time.perf_counter() - inicio)
`,
        explicacao: "Medir uma operação minúscula uma única vez dá um número dominado pelo ruído (e diferente a cada execução). Para comparar, repita muitas vezes com `timeit` e compare as alternativas nas mesmas condições.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Antes de otimizar um código lento, qual é o primeiro passo?",
          opcoes: ["Reescrever tudo em C", "Medir para descobrir onde o tempo é gasto", "Trocar todos os laços por compreensões", "Usar mais threads"],
          resposta: 1,
          dicas: ["Como saber se a otimização valeu a pena?", "E qual trecho otimizar?", "Medir."],
          comentario: "É comum que um único trecho responda pela maior parte do tempo. Otimizar o resto não muda quase nada.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual operação costuma ser muito mais rápida num `set` do que numa `list` grande?",
          opcoes: ["Acessar o item na posição 0", "Testar se um valor está contido (`x in colecao`)", "Ordenar", "Percorrer todos os itens"],
          resposta: 1,
          dicas: ["Rode o exemplo da lição.", "Na lista, `in` compara item por item.", "O `set` usa uma tabela hash: a busca não depende do tamanho."],
          comentario: "Na lista, a busca cresce com o tamanho (O(n)); no `set` e no `dict`, é praticamente constante (O(1)).",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para medir 100 execuções da ordenação.",
          codigo: r`
import timeit
tempo = timeit.___(lambda: sorted(range(1000)), ___=100)
print(tempo > 0)
`,
          respostas: [["timeit"], ["number"]],
          testes: [["assert _out.strip() == 'True'", "O código deve medir e mostrar True"]],
          dicas: ["A função tem o mesmo nome do módulo.", "O parâmetro diz quantas vezes repetir.", "`timeit` e `number`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Escreva `comparar(f, g, *args, repeticoes=20)`, que mede `f(*args)` e `g(*args)` com `timeit.timeit` e devolve quantas vezes `g` é mais rápida que `f` (tempo de `f` ÷ tempo de `g`).",
          inicial: r`
import timeit

def comparar(f, g, *args, repeticoes=20):
    pass
`,
          testes: [
            [r`
def lento(n):
    t = 0
    for i in range(n):
        t += i
    return t
def rapido(n):
    return sum(range(n))
x = comparar(lento, rapido, 20000)
assert isinstance(x, float), "devolva um float"
assert x > 1, f"o laço deveria ser mais lento que sum (razão {x:.2f})"
`, "`comparar(lento, rapido, 20000)` deve devolver uma razão maior que 1"],
            ["assert 'timeit' in _src", "Use o módulo timeit"],
          ],
          dicas: ["`timeit.timeit(lambda: f(*args), number=repeticoes)`.", "Faça o mesmo para `g`.", "Devolva `tempo_f / tempo_g`."],
          solucao: r`
import timeit

def comparar(f, g, *args, repeticoes=20):
    tempo_f = timeit.timeit(lambda: f(*args), number=repeticoes)
    tempo_g = timeit.timeit(lambda: g(*args), number=repeticoes)
    return tempo_f / tempo_g     # > 1 quer dizer que g é mais rápida

def lento(n):
    t = 0
    for i in range(n):
        t += i
    return t

print(f"{comparar(lento, lambda n: sum(range(n)), 20000):.1f}x")
`,
        },
      ],
    },
    {
      id: "otimizacao",
      titulo: "Otimizar na prática",
      explicacao: [
        "**Estrutura certa**: para buscar por chave, use `dict` (ou `set`), não percorra listas. Montar um dicionário uma vez e consultar muitas vezes transforma O(n × m) em O(n + m).",
        "**Vetorize no pandas**: operações de coluna (`df['a'] * df['b']`, `np.where`, `groupby`, `merge`) rodam em código compilado. `iterrows` e `apply(axis=1)` passam linha por linha pelo Python e costumam ser dezenas de vezes mais lentos.",
        "**Evite trabalho repetido**: tire do laço o que não muda dentro dele e guarde resultados caros com `functools.lru_cache`.",
        "**Monte tabelas de uma vez**: junte as linhas numa lista e crie o DataFrame no final. Acrescentar linha por linha é lento, e `DataFrame.append` nem existe mais no pandas 2.",
      ],
      exemplo: r`
import timeit
import numpy as np
import pandas as pd
from functools import lru_cache

precos = {f"P{i}": i * 1.5 for i in range(10_000)}
lista = list(precos.items())

def busca_lista(cod):
    for c, p in lista:
        if c == cod:
            return p

print("lista:", timeit.timeit(lambda: busca_lista("P9999"), number=50))
print("dict: ", timeit.timeit(lambda: precos["P9999"], number=50))

df = pd.DataFrame({"qtd": np.arange(20_000) % 50, "preco": np.linspace(1, 100, 20_000)})
def com_apply():
    return df.apply(lambda l: l["qtd"] * l["preco"], axis=1)
def vetorizado():
    return df["qtd"] * df["preco"]
print(f"apply:      {timeit.timeit(com_apply, number=1):.3f}s")
print(f"vetorizado: {timeit.timeit(vetorizado, number=1):.4f}s")

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(80))
`,
      erro: {
        codigo: r`
import pandas as pd
df = pd.DataFrame({"x": [1]})
for i in range(3):
    df = df.append({"x": i}, ignore_index=True)
`,
        explicacao: "`DataFrame.append` foi removido no pandas 2.0: `AttributeError`. Além disso, crescer uma tabela linha a linha copia tudo a cada volta. Junte as linhas numa lista e crie o DataFrame uma vez, ou use `pd.concat` uma única vez no final.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
from functools import lru_cache

chamadas = 0

@lru_cache(maxsize=None)
def cotacao(moeda):
    global chamadas
    chamadas += 1
    return {"USD": 5.1, "EUR": 5.5}[moeda]

for m in ["USD", "EUR", "USD", "USD", "EUR"]:
    cotacao(m)
print(chamadas)
`,
          opcoes: ["5", "2", "3", "1"],
          resposta: 1,
          dicas: ["O cache guarda o resultado de cada argumento.", "Repetições não executam o corpo da função.", "Há só duas moedas diferentes."],
          comentario: "O corpo da função só roda na primeira vez de cada moeda. Útil para consultas caras que se repetem, como cotações e cadastros.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "No pandas, qual é geralmente a forma mais rápida de criar `df['total']` como qtd × preço?",
          opcoes: ["Um `for` com `iterrows()`", "`df.apply(..., axis=1)`", "`df['qtd'] * df['preco']`", "Uma compreensão de lista com `df.loc`"],
          resposta: 2,
          dicas: ["Rode o exemplo e compare os tempos.", "As outras opções passam linha por linha pelo Python.", "A operação de coluna é vetorizada."],
          comentario: "A diferença costuma ser de dezenas a centenas de vezes em tabelas grandes.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "O código usa `DataFrame.append`, que não existe no pandas 2. Reescreva para juntar as linhas numa lista e criar o DataFrame uma única vez.",
          inicial: r`
import pandas as pd
linhas = [("Alfa", 120.0), ("Beta", 80.0), ("Gama", 45.5)]
df = pd.DataFrame(columns=["fornecedor", "valor"])
for nome, valor in linhas:
    df = df.append({"fornecedor": nome, "valor": valor}, ignore_index=True)
print(df)
`,
          testes: [
            ["assert df.shape == (3, 2) and list(df.columns) == ['fornecedor', 'valor']", "`df` deve ter 3 linhas e as colunas fornecedor e valor"],
            ["assert df['valor'].sum() == 245.5", "A soma dos valores deve ser 245.5"],
            ["assert 'df.append' not in _src and 'df = df.append' not in _src", "Não use `DataFrame.append`"],
          ],
          dicas: ["Os dados já estão numa lista de tuplas.", "`pd.DataFrame(lista, columns=[...])` cria a tabela de uma vez.", "`df = pd.DataFrame(linhas, columns=['fornecedor', 'valor'])`."],
          solucao: r`
import pandas as pd
linhas = [("Alfa", 120.0), ("Beta", 80.0), ("Gama", 45.5)]
# monta a tabela de uma vez a partir da lista
df = pd.DataFrame(linhas, columns=["fornecedor", "valor"])
print(df)
`,
          comentario: "Se as linhas forem produzidas num laço, acumule em `registros.append({...})` (o `append` da lista é rápido) e no fim faça `pd.DataFrame(registros)`.",
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Escreva `mapear_categorias(codigos, tabela)`. `tabela` é uma lista de tuplas `(codigo, categoria)`. A função devolve a lista de categorias de cada código, ou `'sem categoria'` quando o código não estiver na tabela. Os testes usam 20 mil códigos e uma tabela de 5 mil itens, e exigem rapidez.",
          inicial: r`
def mapear_categorias(codigos, tabela):
    resultado = []
    for c in codigos:
        cat = "sem categoria"
        for codigo, categoria in tabela:
            if codigo == c:
                cat = categoria
        resultado.append(cat)
    return resultado
`,
          testes: [
            ["assert mapear_categorias(['A', 'X', 'B'], [('A', 'ti'), ('B', 'frete')]) == ['ti', 'sem categoria', 'frete']", "Exemplo pequeno: ['ti', 'sem categoria', 'frete']"],
            [r`
import time
tabela = [(f"P{i}", f"cat{i % 7}") for i in range(5000)]
codigos = [f"P{(i * 7) % 6000}" for i in range(20000)]
inicio = time.perf_counter()
r = mapear_categorias(codigos, tabela)
dur = time.perf_counter() - inicio
assert len(r) == 20000 and r[0] == "cat0" and r.count("sem categoria") == sum(1 for c in codigos if int(c[1:]) >= 5000)
assert dur < 1.0, f"levou {dur:.2f}s: monte um dicionário em vez de percorrer a tabela para cada código"
`, "Com 20 mil códigos e 5 mil itens na tabela, deve levar menos de 1 segundo"],
          ],
          dicas: ["O código inicial percorre a tabela inteira para cada código: 100 milhões de comparações.", "Monte um dicionário uma vez: `mapa = dict(tabela)`.", "Depois, `[mapa.get(c, 'sem categoria') for c in codigos]`."],
          solucao: r`
def mapear_categorias(codigos, tabela):
    mapa = dict(tabela)    # monta o índice uma vez: O(m)
    # cada consulta no dicionário é praticamente instantânea: O(n)
    return [mapa.get(c, "sem categoria") for c in codigos]

print(mapear_categorias(["A", "X", "B"], [("A", "ti"), ("B", "frete")]))
`,
          comentario: "No pandas, a mesma ideia é um `merge` ou `serie.map(dicionario)`.",
        },
      ],
    },
    {
      id: "async",
      titulo: "Programação assíncrona",
      explicacao: [
        "Boa parte do tempo de um script de dados é **espera**: resposta de API, banco, download. Com `asyncio`, enquanto uma tarefa espera, outra avança.",
        "`async def` define uma *corrotina*. Dentro dela, `await` marca um ponto de espera onde o controle pode passar para outra tarefa.",
        "`asyncio.gather(c1, c2, c3)` roda várias corrotinas ao mesmo tempo e devolve os resultados **na ordem em que foram passadas**.",
        "O ganho aparece em tarefas de I/O (entrada e saída). Em cálculo pesado de CPU, `asyncio` não acelera nada: aí entram `multiprocessing` ou a vetorização.",
        "> Num script, o ponto de entrada é `asyncio.run(main())`, e no Level Code isso funciona normalmente. No Jupyter, que já tem um laço de eventos rodando, use `await main()` direto na célula.",
      ],
      exemplo: r`
import asyncio, time

async def baixar(nome, segundos):
    print(f"início {nome}")
    await asyncio.sleep(segundos)      # simula a espera da rede
    print(f"fim {nome}")
    return f"{nome}: ok"

async def main():
    inicio = time.perf_counter()
    resultados = await asyncio.gather(
        baixar("fornecedores", 0.6),
        baixar("pedidos", 0.4),
        baixar("cotações", 0.2),
    )
    print(resultados)
    print(f"total: {time.perf_counter() - inicio:.1f}s (e não 1.2s)")

asyncio.run(main())
`,
      erro: {
        codigo: r`
import asyncio

async def dobro(x):
    await asyncio.sleep(0.1)
    return x * 2

async def main():
    r = dobro(5)
    print(r + 1)

asyncio.run(main())
`,
        explicacao: "Sem `await`, `dobro(5)` só cria a corrotina e não a executa. Somar uma corrotina com 1 dá `TypeError`. Escreva `r = await dobro(5)`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Quando `asyncio` traz ganho de tempo?",
          opcoes: ["Em cálculos pesados de CPU, como multiplicar matrizes", "Quando o programa passa muito tempo esperando (rede, disco, APIs)", "Sempre, em qualquer código", "Só em computadores com mais de 8 núcleos"],
          resposta: 1,
          dicas: ["`asyncio` não cria mais processadores.", "Ele aproveita o tempo ocioso.", "O tempo ocioso aparece quando há espera por I/O."],
          comentario: "Por padrão, o `asyncio` roda tudo numa única thread: ele reorganiza as esperas, não divide o cálculo.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
import asyncio

async def tarefa(nome, t):
    await asyncio.sleep(t)
    print(nome)

async def main():
    await asyncio.gather(tarefa("A", 0.3), tarefa("B", 0.1), tarefa("C", 0.2))

asyncio.run(main())
`,
          opcoes: ["A\nB\nC", "B\nC\nA", "C\nB\nA", "A\nC\nB"],
          resposta: 1,
          dicas: ["As três esperas começam juntas.", "Quem espera menos termina primeiro.", "B (0.1 s), C (0.2 s), A (0.3 s)."],
          comentario: "Os `print` saem na ordem de término. Já os *resultados* do `gather` viriam na ordem dos argumentos.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para buscar as duas cotações ao mesmo tempo.",
          codigo: r`
import asyncio

async def cotacao(moeda):
    await asyncio.sleep(0.1)
    return {"USD": 5.12, "EUR": 5.54}[moeda]

async def main():
    usd, eur = ___ asyncio.___(cotacao("USD"), cotacao("EUR"))
    print(usd, eur)

asyncio.run(main())
`,
          respostas: [["await"], ["gather"]],
          testes: [["assert _out.strip() == '5.12 5.54'", "A saída deve ser 5.12 5.54"]],
          dicas: ["É preciso esperar o resultado.", "A função que junta várias corrotinas.", "`await` e `gather`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "`buscar(id)` demora 0,3 s. Escreva `async def buscar_todos(ids)`, que busca todos os ids **ao mesmo tempo** e devolve a lista de resultados na ordem dos ids. Com 5 ids, deve levar bem menos que 1,5 s.",
          inicial: r`
import asyncio

async def buscar(id_):
    await asyncio.sleep(0.3)   # simula a rede
    return id_ * 10

async def buscar_todos(ids):
    pass
`,
          testes: [
            [r`
import time
inicio = time.perf_counter()
r = await buscar_todos([1, 2, 3, 4, 5])
dur = time.perf_counter() - inicio
assert r == [10, 20, 30, 40, 50], r
assert dur < 1.0, f"levou {dur:.2f}s: as buscas não estão acontecendo ao mesmo tempo"
`, "Os 5 resultados vêm na ordem certa, em menos de 1 segundo"],
            ["assert await buscar_todos([]) == []", "Uma lista vazia devolve lista vazia"],
          ],
          dicas: ["Monte as corrotinas sem esperar: `[buscar(i) for i in ids]`.", "Passe todas para o `gather` com `*`.", "`return list(await asyncio.gather(*(buscar(i) for i in ids)))`."],
          solucao: r`
import asyncio

async def buscar(id_):
    await asyncio.sleep(0.3)
    return id_ * 10

async def buscar_todos(ids):
    tarefas = [buscar(i) for i in ids]           # cria, ainda sem esperar
    return list(await asyncio.gather(*tarefas))  # espera todas juntas

async def main():
    print(await buscar_todos([1, 2, 3, 4, 5]))

asyncio.run(main())
`,
          comentario: "Com centenas de chamadas, limite a concorrência com `asyncio.Semaphore(10)` para não sobrecarregar a API.",
        },
      ],
    },
    {
      id: "apis",
      titulo: "Consumo de APIs",
      explicacao: [
        "Uma **API web** responde a requisições HTTP, geralmente com JSON. Com a biblioteca `requests`: `r = requests.get(url, params={...}, timeout=10)`, depois `r.status_code` e `r.json()`.",
        "Códigos de status: **2xx** sucesso (200 OK); **4xx** erro do cliente (400 requisição inválida, 401/403 sem permissão, 404 não encontrado, 429 excesso de requisições); **5xx** erro do servidor (500, 503).",
        "Sempre trate erros: `r.raise_for_status()` levanta uma exceção para os status 4xx e 5xx. Use `timeout` e repita as tentativas quando o erro for temporário (5xx, 429).",
        "APIs costumam **paginar**: devolvem uma página por vez e indicam a próxima. Percorra até não haver mais páginas. `pd.DataFrame(lista)` ou `pd.json_normalize` transformam o JSON em tabela.",
        "> No navegador, o Level Code usa o módulo `api_ficticia`, que tem a mesma interface do `requests`, com dados fictícios e sem rede. No seu computador, troque por `import requests`. Credenciais vão em variáveis de ambiente, nunca no código.",
      ],
      exemplo: r`
import api_ficticia as api   # mesma interface do requests
import pandas as pd

r = api.get(f"{api.BASE}/fornecedores", params={"uf": "SP"})
print(r, r.status_code, r.ok)
print(r.json())

r = api.get(f"{api.BASE}/cotacao/usd")
print(r.json()["valor_brl"])

r = api.get(f"{api.BASE}/fornecedores/99")
print(r.status_code, r.json())

pagina = api.get(f"{api.BASE}/pedidos", params={"pagina": 1}).json()
print(pagina["pagina"], len(pagina["itens"]), pagina["proxima"])
print(pd.DataFrame(pagina["itens"]).head())
`,
      erro: {
        codigo: r`
import api_ficticia as api
r = api.get(f"{api.BASE}/cotacao/xyz")
print(r.json()["valor_brl"])
`,
        explicacao: "A moeda não existe, e a API respondeu 404 com `{'erro': ...}`. Como o status não foi conferido, o código quebrou adiante com um `KeyError` confuso. Chame `r.raise_for_status()` antes de usar `r.json()`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que significa o código de status 404?",
          opcoes: ["Sucesso", "Recurso não encontrado", "Erro interno do servidor", "Requisição sem permissão"],
          resposta: 1,
          dicas: ["É da família 4xx: erro do cliente.", "Aparece quando o endereço ou o id não existe.", "*Not Found*."],
          comentario: "403 é sem permissão, 500 é erro interno e 200 é sucesso.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "A API fictícia tem 4 fornecedores; o de id 3 está inativo. Qual é a saída?",
          codigo: r`
import api_ficticia as api
r = api.get(f"{api.BASE}/fornecedores")
dados = r.json()
print(r.status_code, len(dados), sum(f["ativo"] for f in dados))
`,
          opcoes: ["200 4 3", "200 3 3", "404 0 0", "200 4 4"],
          resposta: 0,
          dicas: ["A rota existe.", "Sem filtro, vêm todos.", "`True` conta como 1 na soma."],
          comentario: "`sum` sobre booleanos conta os verdadeiros: 3 fornecedores ativos.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para verificar o status e ler o JSON da cotação do euro.",
          codigo: r`
import api_ficticia as api
r = api.get(f"{api.BASE}/cotacao/eur")
r.___()
valor = r.___()["valor_brl"]
print(valor)
`,
          respostas: [["raise_for_status"], ["json"]],
          testes: [["assert _out.strip() == '5.54'", "A saída deve ser 5.54"]],
          dicas: ["O primeiro levanta um erro se o status não for 2xx.", "O segundo converte o corpo da resposta.", "`raise_for_status` e `json`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "A rota `/pedidos` é paginada: cada resposta traz `itens` e `proxima` (o número da próxima página, ou `None` na última). Escreva `todos_pedidos()`, que percorre as páginas e devolve a lista com todos os itens. Depois, crie `df` com esses itens e `total_por_fornecedor`, uma Series com a soma de `valor` por `fornecedor_id`.",
          inicial: r`
import api_ficticia as api
import pandas as pd

def todos_pedidos():
    pass
`,
          testes: [
            ["p = todos_pedidos()\nassert len(p) == 25 and [x['id'] for x in p] == list(range(101, 126)), len(p)", "`todos_pedidos()` deve trazer os 25 pedidos (ids 101 a 125)"],
            ["assert isinstance(df, pd.DataFrame) and len(df) == 25", "`df` deve ser um DataFrame com 25 linhas"],
            ["esperado = pd.DataFrame(api._PEDIDOS).groupby('fornecedor_id')['valor'].sum()\nassert total_por_fornecedor.to_dict() == esperado.to_dict(), total_por_fornecedor.to_dict()", "`total_por_fornecedor` deve somar o valor por fornecedor_id"],
          ],
          dicas: ["Comece com `pagina = 1` e `itens = []`; repita enquanto `pagina` não for `None`.", "A cada volta: `dados = api.get(f'{api.BASE}/pedidos', params={'pagina': pagina}).json()`, depois `itens.extend(dados['itens'])` e `pagina = dados['proxima']`.", "No fim: `df = pd.DataFrame(todos_pedidos())` e `df.groupby('fornecedor_id')['valor'].sum()`."],
          solucao: r`
import api_ficticia as api
import pandas as pd

def todos_pedidos():
    itens = []
    pagina = 1
    while pagina is not None:                  # a última página traz proxima = None
        r = api.get(f"{api.BASE}/pedidos", params={"pagina": pagina})
        r.raise_for_status()
        dados = r.json()
        itens.extend(dados["itens"])
        pagina = dados["proxima"]
    return itens

df = pd.DataFrame(todos_pedidos())
total_por_fornecedor = df.groupby("fornecedor_id")["valor"].sum()
print(total_por_fornecedor)
`,
        },
      ],
    },
    {
      id: "projetos",
      titulo: "Organização de projetos",
      explicacao: [
        "Quando um notebook vira algo que roda toda semana, vale transformá-lo num **projeto**. Os ingredientes básicos:",
        "- **Ambiente virtual** por projeto (`python -m venv .venv`), para isolar as versões das bibliotecas. Dependências listadas no `pyproject.toml` (ou num `requirements.txt`).",
        "- **Estrutura**: o código em `src/nome_do_pacote/`, testes em `tests/`, notebooks de exploração em `notebooks/` e dados fora do Git (no `.gitignore`).",
        "- **Funções pequenas e testáveis** (ler, limpar, transformar, exportar) em vez de um script único de 500 linhas.",
        "- **Configuração fora do código** (arquivo JSON ou TOML, variáveis de ambiente) e **logging** em vez de `print`, com níveis (`DEBUG`, `INFO`, `WARNING`, `ERROR`) e data e hora em cada mensagem.",
        "- **Ferramentas**: Git para versionar, `ruff` e `black` para estilo, `pytest` para testes.",
      ],
      exemplo: r`
import json
import logging
import os

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s", force=True)
log = logging.getLogger("relatorio_compras")

PADRAO = {"arquivo": "compras.csv", "moeda": "BRL", "limite_alerta": 5000}

def carregar_config(caminho="config.json"):
    config = dict(PADRAO)
    if os.path.exists(caminho):
        with open(caminho, encoding="utf-8") as f:
            config.update(json.load(f))
        log.info("configuração lida de %s", caminho)
    else:
        log.warning("%s não encontrado; usando os padrões", caminho)
    return config

cfg = carregar_config()
log.debug("isto não aparece no nível INFO")
log.info("limite de alerta: %s", cfg["limite_alerta"])

print("""
projeto_compras/
├── pyproject.toml
├── README.md
├── .gitignore          # .venv/, dados/, __pycache__/
├── src/compras/
│   ├── __init__.py
│   ├── leitura.py
│   ├── limpeza.py
│   └── relatorio.py
├── tests/
│   └── test_limpeza.py
├── notebooks/
└── dados/
""")
`,
      erro: {
        codigo: r`
with open("C:/Users/ana/Desktop/compras_final_v3.csv", encoding="utf-8") as f:
    print(f.readline())
`,
        explicacao: "Um caminho absoluto da máquina de uma pessoa só funciona naquela máquina: `FileNotFoundError` em qualquer outro lugar. Use caminhos relativos ao projeto (`pathlib.Path(__file__).parent / 'dados'`) e deixe o caminho num arquivo de configuração.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve um ambiente virtual (`python -m venv .venv`)?",
          opcoes: ["Deixar o Python mais rápido", "Isolar as bibliotecas e as versões de cada projeto", "Rodar o código na nuvem", "Substituir o Git"],
          resposta: 1,
          dicas: ["Pense em dois projetos que precisam de versões diferentes do pandas.", "Cada ambiente tem a sua pasta de pacotes.", "Isolamento."],
          comentario: "Ative com `.venv\\Scripts\\activate` (Windows) ou `source .venv/bin/activate` (Linux/macOS) antes do `pip install`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual arquivo descreve o projeto e suas dependências no padrão atual do Python?",
          opcoes: ["`setup.cfg`, que é obrigatório", "`pyproject.toml`", "`main.py`", "`.gitignore`"],
          resposta: 1,
          dicas: ["É um arquivo TOML.", "Ferramentas como pip, uv, poetry e ruff leem esse arquivo.", "`pyproject.toml`."],
          comentario: "Ele também guarda as configurações das ferramentas: `[tool.ruff]`, `[tool.pytest.ini_options]` e outras.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para registrar mensagens de nível INFO para cima.",
          codigo: r`
import logging
logging.basicConfig(level=logging.___, format="%(levelname)s %(message)s", force=True)
log = logging.getLogger(__name__)
log.___("processadas %d linhas", 120)
log.debug("detalhe")
`,
          respostas: [["INFO"], ["info"]],
          testes: [["assert 'INFO processadas 120 linhas' in _out and 'detalhe' not in _out", "Deve aparecer `INFO processadas 120 linhas`, e o debug não"]],
          dicas: ["O nível é uma constante em maiúsculas.", "O método tem o mesmo nome do nível, em minúsculas.", "`INFO` e `info`."],
          comentario: "Passar os valores como argumentos (`%d`, `%s`) em vez de usar f-string evita montar a mensagem quando o nível está desligado.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Escreva `carregar_config(caminho, padrao)`, que devolve um **novo** dicionário: o `padrao` atualizado com o conteúdo do JSON em `caminho`. Se o arquivo não existir, registre um aviso com `logging.warning` e devolva uma cópia do padrão. Nunca altere `padrao`. (Existe um `config.json` neste módulo.)",
          inicial: r`
import json
import logging
import os

def carregar_config(caminho, padrao):
    pass
`,
          testes: [
            ["p = {'limite_alerta': 5000, 'moeda': 'USD', 'arquivo': 'compras.csv'}\nr = carregar_config('config.json', p)\nassert r == {'limite_alerta': 8000, 'moeda': 'BRL', 'arquivo': 'compras.csv'}, r\nassert p['moeda'] == 'USD', 'o dicionário padrao foi alterado'", "Com o arquivo existente, mistura o padrão com o JSON sem alterar o padrão"],
            [r`
import logging
registros = []
class H(logging.Handler):
    def emit(self, rec):
        registros.append(rec)
h = H()
logging.getLogger().addHandler(h)
try:
    p = {"a": 1}
    r = carregar_config("nao_existe.json", p)
finally:
    logging.getLogger().removeHandler(h)
assert r == {"a": 1} and r is not p, "devolva uma cópia do padrão"
assert any(x.levelno == logging.WARNING for x in registros), "registre um aviso com logging.warning"
`, "Sem o arquivo, devolve uma cópia do padrão e registra um aviso"],
          ],
          dicas: ["Comece com `config = dict(padrao)`: isso já é uma cópia.", "`if os.path.exists(caminho):` leia com `json.load` e faça `config.update(...)`.", "No `else`, `logging.warning('... %s', caminho)`."],
          solucao: r`
import json
import logging
import os

log = logging.getLogger(__name__)

def carregar_config(caminho, padrao):
    config = dict(padrao)                      # cópia: padrao fica intacto
    if os.path.exists(caminho):
        with open(caminho, encoding="utf-8") as f:
            config.update(json.load(f))
    else:
        log.warning("arquivo de configuração %s não encontrado; usando padrões", caminho)
    return config

print(carregar_config("config.json", {"limite_alerta": 5000, "arquivo": "compras.csv"}))
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "relatorio-lento",
      titulo: "Otimizar um relatório lento",
      enunciado: [
        "Um colega escreveu `relatorio_lento`, que soma o gasto por categoria de fornecedor. Ele funciona, mas usa `iterrows` em dois laços aninhados e levaria minutos com 20 mil pedidos.",
        "Escreva `relatorio_rapido(pedidos, forn)` com o **mesmo resultado** (uma Series categoria → total, com o índice ordenado e valores arredondados em 2 casas), usando `merge` e `groupby`. Ela precisa processar os 20 mil pedidos em menos de 1 segundo. Não rode a versão lenta com a base inteira.",
      ],
      inicial: r`
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
n = 20_000
pedidos = pd.DataFrame({
    "fornecedor_id": rng.integers(1, 51, n),
    "qtd": rng.integers(1, 101, n),
    "preco": rng.uniform(1, 500, n).round(2),
})
categorias = ["embalagem", "limpeza", "frete", "papelaria", "ti"]
forn = pd.DataFrame({"id": range(1, 51), "categoria": [categorias[i % 5] for i in range(50)]})

def relatorio_lento(pedidos, forn):
    totais = {}
    for _, linha in pedidos.iterrows():
        for _, f in forn.iterrows():
            if f["id"] == linha["fornecedor_id"]:
                cat = f["categoria"]
        totais[cat] = totais.get(cat, 0) + linha["qtd"] * linha["preco"]
    return pd.Series(totais).sort_index().round(2)

def relatorio_rapido(pedidos, forn):
    pass
`,
      testes: [
        [r`
amostra = pedidos.head(150)
esperado = relatorio_lento(amostra, forn)
obtido = relatorio_rapido(amostra, forn)
assert isinstance(obtido, pd.Series), "devolva uma Series"
assert obtido.index.tolist() == esperado.index.tolist(), obtido.index.tolist()
assert np.allclose(obtido.values, esperado.values, atol=0.02), (obtido.values, esperado.values)
`, "Numa amostra de 150 pedidos, o resultado é igual ao da versão lenta"],
        [r`
import time
inicio = time.perf_counter()
r = relatorio_rapido(pedidos, forn)
dur = time.perf_counter() - inicio
assert len(r) == 5, r
assert dur < 1.0, f"levou {dur:.2f}s"
`, "Com os 20 mil pedidos, leva menos de 1 segundo"],
        ["assert 'iterrows' not in _src.split('def relatorio_rapido')[1], 'não use iterrows na versão rápida'", "A versão rápida não usa iterrows"],
      ],
      dicas: ["Junte os pedidos com as categorias: `pedidos.merge(forn, left_on='fornecedor_id', right_on='id')`.", "Calcule a coluna `total = qtd * preco` de forma vetorizada.", "`groupby('categoria')['total'].sum().sort_index().round(2)`."],
      solucao: r`
import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
n = 20_000
pedidos = pd.DataFrame({
    "fornecedor_id": rng.integers(1, 51, n),
    "qtd": rng.integers(1, 101, n),
    "preco": rng.uniform(1, 500, n).round(2),
})
categorias = ["embalagem", "limpeza", "frete", "papelaria", "ti"]
forn = pd.DataFrame({"id": range(1, 51), "categoria": [categorias[i % 5] for i in range(50)]})

def relatorio_lento(pedidos, forn):
    totais = {}
    for _, linha in pedidos.iterrows():
        for _, f in forn.iterrows():
            if f["id"] == linha["fornecedor_id"]:
                cat = f["categoria"]
        totais[cat] = totais.get(cat, 0) + linha["qtd"] * linha["preco"]
    return pd.Series(totais).sort_index().round(2)

def relatorio_rapido(pedidos, forn):
    j = pedidos.merge(forn, left_on="fornecedor_id", right_on="id", how="left")
    j["total"] = j["qtd"] * j["preco"]                 # vetorizado
    return j.groupby("categoria")["total"].sum().sort_index().round(2)

print(relatorio_rapido(pedidos, forn))
`,
      comentario: "O ganho vem de duas trocas: o laço interno de busca virou um `merge` (busca por chave) e o laço externo virou uma operação de coluna mais um `groupby`.",
    },
    {
      id: "coleta-assincrona",
      titulo: "Coleta assíncrona de uma API",
      enunciado: [
        "`api_ficticia.aget(url)` é a versão assíncrona do `get` e demora 0,3 s por chamada. Escreva `async def coletar_fornecedores(ids)`, que busca `/fornecedores/{id}` para todos os ids **ao mesmo tempo** e devolve uma tupla `(encontrados, erros)`: `encontrados` é a lista dos dicionários das respostas com status 200, na ordem dos ids; `erros` é a lista dos ids que não deram 200.",
        "Com 6 ids, deve levar menos de 1 segundo, em vez dos 1,8 s de buscar um de cada vez. Depois, monte um DataFrame só com os fornecedores ativos.",
      ],
      inicial: r`
import asyncio
import api_ficticia as api
import pandas as pd

async def coletar_fornecedores(ids):
    pass
`,
      testes: [
        [r`
import time
inicio = time.perf_counter()
encontrados, erros = await coletar_fornecedores([1, 2, 3, 4, 99, 7])
dur = time.perf_counter() - inicio
assert [f["id"] for f in encontrados] == [1, 2, 3, 4], encontrados
assert erros == [99, 7], erros
assert dur < 1.0, f"levou {dur:.2f}s: as chamadas não estão acontecendo ao mesmo tempo"
`, "Encontra os ids 1 a 4, aponta 99 e 7 como erro e leva menos de 1 segundo"],
        ["e, err = await coletar_fornecedores([])\nassert e == [] and err == []", "Sem ids, devolve duas listas vazias"],
      ],
      dicas: ["Crie as corrotinas: `[api.aget(f'{api.BASE}/fornecedores/{i}') for i in ids]` e espere todas com `asyncio.gather(*...)`.", "O `gather` devolve as respostas na mesma ordem dos ids: percorra com `zip(ids, respostas)`.", "Se `r.status_code == 200`, acrescente `r.json()` em `encontrados`; senão, o id em `erros`."],
      solucao: r`
import asyncio
import api_ficticia as api
import pandas as pd

async def coletar_fornecedores(ids):
    tarefas = [api.aget(f"{api.BASE}/fornecedores/{i}") for i in ids]
    respostas = await asyncio.gather(*tarefas)        # todas ao mesmo tempo
    encontrados, erros = [], []
    for id_, r in zip(ids, respostas):                # mesma ordem dos ids
        if r.status_code == 200:
            encontrados.append(r.json())
        else:
            erros.append(id_)
    return encontrados, erros

async def main():
    encontrados, erros = await coletar_fornecedores([1, 2, 3, 4, 99, 7])
    df = pd.DataFrame(encontrados)
    print(df[df["ativo"]])
    print("não encontrados:", erros)

asyncio.run(main())
`,
      comentario: "Numa API de verdade, use `httpx.AsyncClient` ou `aiohttp` para as chamadas assíncronas, e limite quantas ficam em andamento ao mesmo tempo com `asyncio.Semaphore`.",
    },
  ],
}));
