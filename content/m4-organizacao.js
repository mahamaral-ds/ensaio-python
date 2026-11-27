Ensaio.modulo((r) => ({
  id: "m4",
  ordem: 4,
  titulo: "Organização do código",
  resumo: "Módulos, pacotes, tratamento de erros e leitura e escrita de arquivos.",
  // Arquivos disponíveis em todas as lições e exercícios deste módulo
  arquivos: {
    "calculos.py": r`
"""Funções de cálculo usadas nos exemplos."""

ALIQUOTA_PADRAO = 0.18


def com_imposto(valor, aliquota=ALIQUOTA_PADRAO):
    return valor * (1 + aliquota)


def desconto(valor, pct):
    return valor * (1 - pct)
`.trim() + "\n",
    "financeiro/__init__.py": r`
"""Pacote financeiro fictício."""
VERSAO = "1.0"
`.trim() + "\n",
    "financeiro/impostos.py": r`
ALIQUOTAS = {"SP": 0.18, "RJ": 0.20, "MG": 0.18}


def icms(valor, uf):
    """ICMS fictício: alíquota por UF, 17% para as demais."""
    aliquota = ALIQUOTAS.get(uf, 0.17)
    return round(valor * aliquota, 2)
`.trim() + "\n",
    "financeiro/conversao.py": r`
def brl_para_float(texto):
    """Converte '1.234,56' em 1234.56."""
    return float(texto.replace(".", "").replace(",", "."))
`.trim() + "\n",
    "pedidos.csv": r`
id;fornecedor;valor;data
1;Alfa Embalagens;1520,75;2024-03-01
2;Beta Insumos;890,00;2024-03-02
3;Gama Logística;;2024-03-02
4;Alfa Embalagens;abc;2024-03-03
5;Delta Papéis;2300,10;2024-03-05
6;Beta Insumos;410,50
`.trim() + "\n",
    "config.json": r`
{"empresa": "Comercial Fictícia", "moeda": "BRL", "limite_aprovacao": 5000}
`.trim() + "\n",
  },
  licoes: [
    {
      id: "modulos",
      titulo: "Módulos e import",
      explicacao: [
        "Um **módulo** é um arquivo `.py`. Com `import`, você usa as funções e variáveis dele em outro código.",
        "Formas de importar: `import math` (use `math.sqrt`), `from math import sqrt` (use `sqrt` direto) e `import statistics as st` (apelido).",
        "A biblioteca padrão já traz muita coisa: `math`, `statistics`, `datetime`, `random`, `csv`, `json`, `pathlib`, `collections` e outros.",
        "Seus próprios arquivos funcionam do mesmo jeito. Nesta lição existe um `calculos.py` com `com_imposto`, `desconto` e `ALIQUOTA_PADRAO`.",
        "> Evite `from modulo import *`: fica difícil saber de onde veio cada nome.",
      ],
      exemplo: r`
import math
import statistics as st
from datetime import date, timedelta

print(math.sqrt(144), math.ceil(7.2))
print(st.mean([10, 20, 60]), st.median([10, 20, 60]))
inicio = date(2024, 3, 1)
print(inicio + timedelta(days=30))

import calculos            # o arquivo calculos.py
print(calculos.com_imposto(100))
from calculos import desconto
print(desconto(200, 0.1))
`,
      erro: {
        codigo: r`
import Math
`,
        explicacao: "Nomes de módulos diferenciam maiúsculas: o certo é `math`. `ModuleNotFoundError` também aparece quando o arquivo não está na mesma pasta ou o pacote não está instalado.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual linha permite chamar `sqrt(16)` diretamente, sem prefixo?",
          opcoes: ["`import math`", "`from math import sqrt`", "`import sqrt from math`", "`include math.sqrt`"],
          resposta: 1,
          dicas: ["Com `import math`, você escreve `math.sqrt`.", "Existe uma forma que traz só um nome para o seu código.", "`from ... import ...`."],
          comentario: "`from math import sqrt` traz o nome `sqrt` para o seu código. A terceira opção é sintaxe de JavaScript.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "O arquivo `calculos.py` define `ALIQUOTA_PADRAO = 0.18` e `com_imposto(valor, aliquota=ALIQUOTA_PADRAO)`, que devolve `valor * (1 + aliquota)`. Qual é a saída?",
          codigo: r`
import calculos as c
print(c.ALIQUOTA_PADRAO, round(c.com_imposto(50), 2))
`,
          opcoes: ["0.18 59.0", "18 59", "0.18 50", "Erro: módulo não encontrado"],
          resposta: 0,
          dicas: ["`as c` só cria um apelido.", "O valor padrão da alíquota é 0.18.", "50 × 1.18."],
          comentario: "Com o apelido, `c.com_imposto(50)` é 50 × 1.18 = 59.0.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete os imports para que o código funcione.",
          codigo: r`
from statistics import ___
from math import ___
vendas = [120, 80, 100, 95]
print(mean(vendas), floor(mean(vendas)))
`,
          respostas: [["mean"], ["floor"]],
          testes: [["assert _out.strip() == '98.75 98'", "A saída deve ser `98.75 98`"]],
          dicas: ["Veja quais nomes são usados sem prefixo no `print`.", "A média vem de `statistics`.", "O arredondamento para baixo vem de `math`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Uma nota foi emitida em `emissao = '2024-03-15'` com prazo de 28 dias. Use `datetime` para criar `vencimento` como texto no mesmo formato e `dia_semana` com o nome do dia, usando a lista `dias` e o método `.weekday()` (segunda = 0).",
          inicial: r`
emissao = "2024-03-15"
dias = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]
`,
          testes: [
            ["assert vencimento == '2024-04-12'", "`vencimento` deve ser '2024-04-12'"],
            ["assert dia_semana == 'sexta'", "`dia_semana` deve ser 'sexta'"],
          ],
          dicas: ["`from datetime import date, timedelta`.", "`date.fromisoformat(emissao)` converte o texto em data; some `timedelta(days=28)`.", "`.isoformat()` volta para texto, e `dias[data.weekday()]` dá o nome."],
          solucao: r`
from datetime import date, timedelta

emissao = "2024-03-15"
dias = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]

data_venc = date.fromisoformat(emissao) + timedelta(days=28)
vencimento = data_venc.isoformat()          # de volta para "AAAA-MM-DD"
dia_semana = dias[data_venc.weekday()]      # segunda = 0
print(vencimento, dia_semana)
`,
        },
      ],
    },
    {
      id: "pacotes",
      titulo: "Pacotes e __name__",
      explicacao: [
        "Um **pacote** é uma pasta com módulos e um arquivo `__init__.py`. Ele organiza projetos maiores: `financeiro/impostos.py`, `financeiro/conversao.py`.",
        "Importe com pontos: `from financeiro.impostos import icms`. Dentro do próprio pacote, use imports relativos: `from .conversao import brl_para_float`.",
        "O `__init__.py` roda quando o pacote é importado. Ele pode ficar vazio ou expor os nomes principais.",
        "Todo módulo tem a variável `__name__`. Ela vale `'__main__'` quando o arquivo é executado diretamente e o nome do módulo quando ele é importado. Por isso, scripts terminam com `if __name__ == '__main__': main()`.",
      ],
      exemplo: r`
from financeiro.impostos import icms
from financeiro import conversao
import financeiro

print(financeiro.VERSAO)
print(icms(1000, "RJ"))
print(conversao.brl_para_float("1.234,56"))

def main():
    print("rodando como script, __name__ =", __name__)

if __name__ == "__main__":
    main()
`,
      erro: {
        codigo: r`
from financeiro import icms
`,
        explicacao: "`icms` está em `financeiro/impostos.py`, e o `__init__.py` do pacote não o expõe: `ImportError`. Importe do módulo certo (`from financeiro.impostos import icms`) ou acrescente `from .impostos import icms` no `__init__.py`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve o bloco `if __name__ == '__main__':`?",
          opcoes: ["Transforma o arquivo em pacote", "Executa o bloco só quando o arquivo é rodado diretamente, e não quando é importado", "Define a função principal, que é obrigatória", "Importa o módulo principal"],
          resposta: 1,
          dicas: ["`__name__` muda conforme o arquivo é usado.", "Ao importar, `__name__` é o nome do módulo.", "Ao executar, é `'__main__'`."],
          comentario: "Assim um mesmo arquivo serve como biblioteca (importado) e como script (executado).",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Dentro de `financeiro/impostos.py`, qual import relativo traz `brl_para_float` de `financeiro/conversao.py`?",
          opcoes: ["`from conversao import brl_para_float`", "`from .conversao import brl_para_float`", "`import ..conversao`", "`from financeiro/conversao import brl_para_float`"],
          resposta: 1,
          dicas: ["Imports relativos começam com ponto.", "Um ponto quer dizer \"este pacote\".", "Barras não são usadas em imports."],
          comentario: "`.` é o pacote atual e `..` é o pacote acima.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Em `financeiro/impostos.py`, `icms(valor, uf)` usa as alíquotas `{'SP': 0.18, 'RJ': 0.20, 'MG': 0.18}`, 17% para as demais UFs, e arredonda para 2 casas. Qual é a saída?",
          codigo: r`
from financeiro.impostos import icms
print(icms(100, "SP"), icms(100, "AM"))
`,
          opcoes: ["18.0 17.0", "18.0 Erro", "0.18 0.17", "18 17"],
          resposta: 0,
          dicas: ["AM não está no dicionário.", "`.get(uf, 0.17)` cobre esse caso.", "`round` devolve float."],
          comentario: "SP usa 18% e AM cai no padrão de 17%. O resultado é float: 18.0 e 17.0.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para importar `brl_para_float` do módulo `conversao` do pacote `financeiro`.",
          codigo: r`
___ financeiro.conversao ___ brl_para_float
print(brl_para_float("2.500,00"))
`,
          respostas: [["from"], ["import"]],
          testes: [["assert _out.strip() == '2500.0'", "A saída deve ser 2500.0"]],
          dicas: ["É a forma que traz um nome específico.", "`from pacote.modulo import nome`.", "`from` e `import`."],
        },
      ],
    },
    {
      id: "excecoes",
      titulo: "Tratamento de erros",
      explicacao: [
        "`try` envolve o código que pode falhar; `except TipoDeErro` trata a falha. O programa continua em vez de parar.",
        "Capture **erros específicos** (`ValueError`, `KeyError`, `FileNotFoundError`). `except Exception as e` dá acesso à mensagem em `e`.",
        "`else` roda quando não houve erro; `finally` roda sempre, com ou sem erro (fechar conexões, registrar fim).",
        "Em dados reais, `try/except` dentro do laço permite pular registros ruins e contar quantos foram descartados.",
      ],
      exemplo: r`
valores = ["10", "abc", "7,5", "", "3"]
total = 0
for v in valores:
    try:
        total += float(v.replace(",", "."))
    except ValueError:
        print(f"Ignorado: {v!r}")
print("Total:", total)

def divide(a, b):
    try:
        resultado = a / b
    except ZeroDivisionError:
        return None
    else:
        return round(resultado, 2)
    finally:
        print("divide terminou")

print(divide(10, 4), divide(1, 0))
`,
      erro: {
        codigo: r`
dados = {"valor": 10}
try:
    print(dados["valr"] * 2)
except:
    print("valor inválido")
`,
        explicacao: "O `except` sem tipo capturou um `KeyError` causado por um erro de digitação (`valr`) e o transformou numa mensagem enganosa. Capture só os erros que você espera: `except (ValueError, TypeError):`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
try:
    x = int("12a")
    print("convertido")
except ValueError:
    print("inválido")
finally:
    print("fim")
`,
          opcoes: ["inválido\nfim", "convertido\nfim", "inválido", "fim"],
          resposta: 0,
          dicas: ["`int('12a')` funciona?", "Quando dá erro, o resto do `try` é pulado.", "O `finally` sempre roda."],
          comentario: "O erro acontece no `int`, então `convertido` nunca aparece. O `finally` roda de qualquer jeito.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que evitar `except:` sem indicar o tipo de erro?",
          opcoes: ["Porque é mais lento", "Porque captura qualquer erro, até nomes digitados errado, e esconde bugs", "Porque não funciona em Python 3", "Porque obriga a usar `finally`"],
          resposta: 1,
          dicas: ["Pense no exemplo de erro comum desta lição.", "Ele captura até erros que você não previu.", "Bugs viram mensagens silenciosas."],
          comentario: "Ele também captura `KeyboardInterrupt` (Ctrl+C). Prefira tipos específicos ou, no mínimo, `except Exception`.",
        },
        {
          tipo: "corrigir", nivel: 2,
          enunciado: "`para_numero` deveria devolver `None` quando o texto não puder ser convertido, em vez de interromper o programa. Corrija.",
          inicial: r`
def para_numero(texto):
    return float(texto.replace(",", "."))

valores = ["10,5", "n/d", "3", ""]
numeros = [para_numero(v) for v in valores]
print(numeros)
`,
          testes: [
            ["assert para_numero('10,5') == 10.5", "`para_numero('10,5')` deve ser 10.5"],
            ["assert para_numero('n/d') is None and para_numero('') is None", "Textos inválidos devem devolver None"],
            ["assert numeros == [10.5, None, 3.0, None]", "`numeros` deve ser [10.5, None, 3.0, None]"],
          ],
          dicas: ["Que erro `float('n/d')` gera?", "Envolva a conversão num `try`.", "`except ValueError: return None`."],
          solucao: r`
def para_numero(texto):
    try:
        return float(texto.replace(",", "."))
    except ValueError:          # só o erro esperado
        return None

valores = ["10,5", "n/d", "3", ""]
numeros = [para_numero(v) for v in valores]
print(numeros)
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Escreva `media_segura(valores)`, que devolve a média dos itens numéricos, pula os itens que não forem números (capture `TypeError` ao somar) e devolve `None` quando não sobrar nenhum número (capture `ZeroDivisionError`).",
          inicial: r`
def media_segura(valores):
    pass
`,
          testes: [
            ["assert media_segura([10, 20]) == 15", "`media_segura([10, 20])` deve ser 15"],
            ["assert media_segura([10, 'x', None, 30]) == 20", "Itens não numéricos devem ser ignorados"],
            ["assert media_segura([]) is None and media_segura(['a']) is None", "Sem números, deve devolver None"],
            ["assert 'try' in _src and 'except' in _src", "Use try/except"],
          ],
          dicas: ["Mantenha `total` e `n`; some cada item dentro de um `try`.", "Se `total += v` der `TypeError`, use `continue`.", "No fim, tente `return total / n` e capture `ZeroDivisionError`."],
          solucao: r`
def media_segura(valores):
    total = 0
    n = 0
    for v in valores:
        try:
            total += v          # 'x' ou None geram TypeError
        except TypeError:
            continue
        n += 1
    try:
        return total / n
    except ZeroDivisionError:   # nenhum número válido
        return None

print(media_segura([10, "x", None, 30]))
`,
          comentario: "Para dados de verdade, filtrar com `isinstance(v, (int, float))` é mais explícito. Aqui o objetivo era praticar exceções.",
        },
      ],
    },
    {
      id: "raise",
      titulo: "Levantar erros e exceções próprias",
      explicacao: [
        "`raise ValueError('mensagem')` interrompe a função e avisa quem chamou que algo está errado. É melhor que devolver um valor estranho em silêncio.",
        "Escreva mensagens que ajudem: o que estava errado e qual valor foi recebido.",
        "Para regras de negócio, crie **exceções próprias** herdando de `Exception`: `class PedidoInvalido(Exception): pass`. Quem chama pode tratar esse caso separado dos outros erros.",
        "`raise` sozinho, dentro de um `except`, relança o erro depois de registrar algo.",
      ],
      exemplo: r`
class PedidoInvalido(Exception):
    """Erro de regra de negócio em pedidos."""

def validar_pedido(qtd, valor):
    if qtd <= 0:
        raise ValueError(f"quantidade deve ser positiva, recebi {qtd}")
    if valor > 5000:
        raise PedidoInvalido("acima do limite de aprovação")
    return True

for qtd, valor in [(2, 300), (0, 100), (1, 9000)]:
    try:
        validar_pedido(qtd, valor)
        print("ok:", qtd, valor)
    except ValueError as e:
        print("dado inválido:", e)
    except PedidoInvalido as e:
        print("bloqueado:", e)
`,
      erro: {
        codigo: r`
raise "valor inválido"
`,
        explicacao: "Só é possível levantar objetos de exceção, não textos: `TypeError`. Use `raise ValueError('valor inválido')`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual linha interrompe a função com um erro claro quando `idade` é negativa?",
          opcoes: ["`return 'erro'`", "`raise ValueError('idade negativa')`", "`print('idade negativa')`", "`except ValueError`"],
          resposta: 1,
          dicas: ["Devolver texto ou mostrar mensagem não interrompe quem chamou.", "`except` trata erros, não cria.", "Quem cria o erro é o `raise`."],
          comentario: "`raise` interrompe a execução e o erro sobe até alguém tratá-lo.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "Qual é a saída?",
          codigo: r`
class LimiteExcedido(Exception):
    pass

def aprovar(valor):
    if valor > 1000:
        raise LimiteExcedido(valor)
    return "aprovado"

try:
    print(aprovar(500))
    print(aprovar(1500))
except LimiteExcedido as e:
    print("bloqueado", e)
`,
          opcoes: ["aprovado\nbloqueado 1500", "aprovado\naprovado", "bloqueado 1500", "aprovado\nbloqueado"],
          resposta: 0,
          dicas: ["A primeira chamada passa normalmente.", "A segunda levanta o erro antes do `print`.", "`str(e)` mostra o argumento passado ao erro."],
          comentario: "O primeiro `print` roda; no segundo, o erro sobe até o `except`, que mostra o valor guardado na exceção.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para levantar o erro e para tratá-lo.",
          codigo: r`
def sacar(saldo, valor):
    if valor > saldo:
        ___ ValueError("saldo insuficiente")
    return saldo - valor

try:
    sacar(100, 300)
___ ValueError as e:
    print(e)
`,
          respostas: [["raise"], ["except"]],
          testes: [
            ["assert _out.strip() == 'saldo insuficiente'", "A saída deve ser `saldo insuficiente`"],
            ["assert sacar(100, 30) == 70", "`sacar(100, 30)` deve devolver 70"],
          ],
          dicas: ["Uma palavra cria o erro, a outra o trata.", "A primeira vai dentro da função.", "`raise` e `except`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Crie a exceção `CNPJInvalido` (herdando de `Exception`) e a função `validar_cnpj(texto)`, que devolve só os dígitos quando houver exatamente 14. Caso contrário, levante `CNPJInvalido` com uma mensagem que contenha o texto recebido.",
          inicial: r`
# crie a exceção e a função
`,
          testes: [
            ["assert issubclass(CNPJInvalido, Exception)", "`CNPJInvalido` deve herdar de Exception"],
            ["assert validar_cnpj('11.111.111/0001-01') == '11111111000101'", "Um CNPJ com 14 dígitos deve devolver só os dígitos"],
            [r`
try:
    validar_cnpj("123")
    assert False, "deveria levantar CNPJInvalido"
except CNPJInvalido as e:
    assert "123" in str(e), "a mensagem deve conter o texto recebido"
`, "Um CNPJ curto deve levantar CNPJInvalido com o texto na mensagem"],
          ],
          dicas: ["`class CNPJInvalido(Exception): pass`.", "Extraia os dígitos com `''.join(c for c in texto if c.isdigit())`.", "`if len(digitos) != 14: raise CNPJInvalido(f'CNPJ inválido: {texto}')`."],
          solucao: r`
class CNPJInvalido(Exception):
    """CNPJ sem os 14 dígitos esperados."""

def validar_cnpj(texto):
    digitos = "".join(c for c in texto if c.isdigit())
    if len(digitos) != 14:
        raise CNPJInvalido(f"CNPJ inválido: {texto!r}")
    return digitos

print(validar_cnpj("11.111.111/0001-01"))
`,
        },
      ],
    },
    {
      id: "arquivos",
      titulo: "Ler e escrever arquivos",
      explicacao: [
        "`open(caminho, modo, encoding='utf-8')` abre um arquivo. Modos: `'r'` (ler, padrão), `'w'` (escrever do zero, apaga o conteúdo) e `'a'` (acrescentar no fim).",
        "Use sempre `with open(...) as f:`. O arquivo é fechado automaticamente, mesmo que dê erro.",
        "Para texto: `f.read()`, `f.readlines()` ou `for linha in f`. Para escrever: `f.write(texto)`, que não põe a quebra de linha sozinho.",
        "Para CSV, use o módulo `csv`: `csv.DictReader(f, delimiter=';')` entrega cada linha como dicionário. Para JSON, `json.load(f)` lê e `json.dump(obj, f)` grava.",
        "> Neste módulo existem os arquivos `pedidos.csv` e `config.json`. Abra a lista de arquivos nos exercícios para ver o conteúdo.",
      ],
      exemplo: r`
with open("notas.txt", "w", encoding="utf-8") as f:
    f.write("primeira linha\n")
    f.write("segunda linha\n")

with open("notas.txt", encoding="utf-8") as f:
    for linha in f:
        print(linha.strip())

import csv
with open("pedidos.csv", encoding="utf-8") as f:
    for linha in csv.DictReader(f, delimiter=";"):
        print(linha["id"], linha["fornecedor"], linha["valor"])

import json
with open("config.json", encoding="utf-8") as f:
    config = json.load(f)
print(config["limite_aprovacao"])
`,
      erro: {
        codigo: r`
with open("pedido.csv", encoding="utf-8") as f:
    print(f.read())
`,
        explicacao: "O arquivo se chama `pedidos.csv`, com s: `FileNotFoundError`. Confira nome, extensão e pasta. `pathlib.Path('pedidos.csv').exists()` ajuda a testar antes de abrir.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que usar `with open(...) as f:`?",
          opcoes: ["É a única forma de abrir arquivos", "Garante que o arquivo seja fechado, mesmo se der erro", "Deixa a leitura mais rápida", "Converte o arquivo para UTF-8"],
          resposta: 1,
          dicas: ["Dá para abrir sem `with`, mas aí é preciso lembrar de fechar.", "O que acontece se der erro no meio da leitura?", "O `with` fecha o arquivo ao sair do bloco."],
          comentario: "O `with` é um gerenciador de contexto, assunto do módulo 6.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
with open("teste.txt", "w", encoding="utf-8") as f:
    f.write("a\n")
with open("teste.txt", "a", encoding="utf-8") as f:
    f.write("b\n")
with open("teste.txt", encoding="utf-8") as f:
    print(len(f.readlines()))
`,
          opcoes: ["1", "2", "3", "Erro"],
          resposta: 1,
          dicas: ["O modo `'w'` começa o arquivo do zero.", "O modo `'a'` acrescenta no fim.", "Ficam as linhas `a` e `b`."],
          comentario: "`'w'` cria o arquivo com `a`, `'a'` acrescenta `b`: duas linhas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para gravar o dicionário em JSON e depois lê-lo de volta.",
          codigo: r`
import json
resumo = {"pedidos": 5, "total": 5121.35}
with open("resumo.json", "___", encoding="utf-8") as f:
    json.___(resumo, f)
with open("resumo.json", encoding="utf-8") as f:
    print(json.load(f)["total"])
`,
          respostas: [["w"], ["dump"]],
          testes: [["assert _out.strip() == '5121.35'", "A saída deve ser 5121.35"]],
          dicas: ["O primeiro é o modo de escrita.", "`load` lê; qual função grava?", "`'w'` e `dump`."],
          comentario: "`json.dumps` (com s) devolve um texto em vez de gravar num arquivo.",
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Leia o `limite_aprovacao` de `config.json` e grave `aprovacao.txt` com uma linha por valor da lista `valores`, no formato `1200.00;ok`. Use `aprovar` em vez de `ok` quando o valor passar do limite.",
          inicial: r`
valores = [1200, 7300, 4999.9, 5000.01]
`,
          testes: [
            [r`
with open("aprovacao.txt", encoding="utf-8") as f:
    linhas = f.read().splitlines()
assert linhas == ["1200.00;ok", "7300.00;aprovar", "4999.90;ok", "5000.01;aprovar"], f"conteúdo: {linhas}"
`, "`aprovacao.txt` deve ter 4 linhas: 1200.00;ok, 7300.00;aprovar, 4999.90;ok e 5000.01;aprovar"],
            ["assert 'config.json' in _src", "Leia o limite de `config.json`, sem digitar o número no código"],
          ],
          dicas: ["`json.load` dá um dicionário; o limite está em `config['limite_aprovacao']`.", "Abra `aprovacao.txt` com `'w'` e escreva uma linha por valor.", "`f.write(f'{v:.2f};{status}\\n')`."],
          solucao: r`
import json

valores = [1200, 7300, 4999.9, 5000.01]

with open("config.json", encoding="utf-8") as f:
    limite = json.load(f)["limite_aprovacao"]

with open("aprovacao.txt", "w", encoding="utf-8") as f:
    for v in valores:
        status = "aprovar" if v > limite else "ok"
        f.write(f"{v:.2f};{status}\n")      # write não põe a quebra sozinho

print(open("aprovacao.txt", encoding="utf-8").read())
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "importar-pedidos",
      titulo: "Importar pedidos com linhas ruins",
      enunciado: [
        "O arquivo `pedidos.csv` (separado por `;`, com vírgula decimal) veio de um sistema antigo e tem linhas com problemas: valor vazio, valor que não é número e linha incompleta.",
        "Escreva `importar(caminho)`, que devolve duas coisas: a lista `validos`, com dicionários `{'id': int, 'fornecedor': str, 'valor': float, 'data': str}`, e a lista `rejeitadas`, com os ids (int) das linhas descartadas. Uma linha é válida quando o valor pode ser convertido e a data está presente.",
        "Depois, chame `validos, rejeitadas = importar('pedidos.csv')`, calcule `total` e mostre um resumo.",
      ],
      inicial: r`
import csv

def importar(caminho):
    validos = []
    rejeitadas = []
    # seu código aqui
    return validos, rejeitadas
`,
      testes: [
        ["v, rj = importar('pedidos.csv')\nassert [p['id'] for p in v] == [1, 2, 5], f\"ids válidos: {[p['id'] for p in v]}\"", "Os pedidos válidos são os ids 1, 2 e 5"],
        ["v, rj = importar('pedidos.csv')\nassert rj == [3, 4, 6], f'rejeitadas: {rj}'", "As linhas rejeitadas são os ids 3, 4 e 6"],
        ["v, _ = importar('pedidos.csv')\nassert v[0] == {'id': 1, 'fornecedor': 'Alfa Embalagens', 'valor': 1520.75, 'data': '2024-03-01'}, v[0]", "Cada pedido válido tem id int, valor float e data"],
        ["assert abs(total - 4710.85) < 0.01", "`total` deve ser 4710.85"],
      ],
      dicas: ["Use `csv.DictReader(f, delimiter=';')` e um `try` para cada linha.", "Se a data faltar, `linha['data']` é `None`. Levante um `ValueError` você mesmo nesse caso, para cair no mesmo `except`.", "Converta o valor com `float(linha['valor'].replace(',', '.'))`. No `except`, acrescente `int(linha['id'])` em `rejeitadas`."],
      solucao: r`
import csv

def importar(caminho):
    validos = []
    rejeitadas = []
    with open(caminho, encoding="utf-8") as f:
        for linha in csv.DictReader(f, delimiter=";"):
            try:
                if not linha["data"]:                 # None ou vazio
                    raise ValueError("sem data")
                valor = float(linha["valor"].replace(",", "."))
            except (ValueError, AttributeError):
                rejeitadas.append(int(linha["id"]))
                continue
            validos.append({
                "id": int(linha["id"]),
                "fornecedor": linha["fornecedor"],
                "valor": valor,
                "data": linha["data"],
            })
    return validos, rejeitadas

validos, rejeitadas = importar("pedidos.csv")
total = sum(p["valor"] for p in validos)
print(f"{len(validos)} válidos, total R$ {total:.2f}; rejeitadas: {rejeitadas}")
`,
      comentario: "No pandas, `pd.read_csv('pedidos.csv', sep=';', decimal=',')` faz a leitura, e `pd.to_numeric(..., errors='coerce')` transforma valores ruins em NaN para você filtrar.",
    },
    {
      id: "exportar-resumo",
      titulo: "Exportar o resumo em JSON",
      enunciado: [
        "Com os pedidos já validados, grave o arquivo `resumo.json` para outro sistema consumir. Ele deve ter as chaves `qtd_pedidos`, `total` (arredondado em 2 casas) e `por_fornecedor` (dicionário fornecedor → total).",
        "Grave com `indent=2` e `ensure_ascii=False`, para que os acentos fiquem legíveis no arquivo.",
      ],
      inicial: r`
import json

validos = [
    {"fornecedor": "Alfa Embalagens", "valor": 1520.75},
    {"fornecedor": "Beta Insumos", "valor": 890.0},
    {"fornecedor": "Gama Logística", "valor": 640.0},
    {"fornecedor": "Alfa Embalagens", "valor": 310.25},
    {"fornecedor": "Gama Logística", "valor": 1200.0},
]
`,
      testes: [
        ["dados = json.load(open('resumo.json', encoding='utf-8'))\nassert dados['qtd_pedidos'] == 5 and dados['total'] == 4561.0, dados", "`qtd_pedidos` deve ser 5 e `total` deve ser 4561.0"],
        ["dados = json.load(open('resumo.json', encoding='utf-8'))\nassert dados['por_fornecedor'] == {'Alfa Embalagens': 1831.0, 'Beta Insumos': 890.0, 'Gama Logística': 1840.0}, dados['por_fornecedor']", "`por_fornecedor` deve somar os valores de cada fornecedor"],
        ["txt = open('resumo.json', encoding='utf-8').read()\nassert 'Logística' in txt, 'o acento virou código \\\\u: use ensure_ascii=False'", "Os acentos devem aparecer no arquivo (`ensure_ascii=False`)"],
        ["txt = open('resumo.json', encoding='utf-8').read()\nassert '\\n  ' in txt, 'use indent=2'", "O arquivo deve estar indentado (`indent=2`)"],
      ],
      dicas: ["Some por fornecedor com o padrão `d[k] = d.get(k, 0) + valor`.", "Monte um dicionário `resumo` com as três chaves.", "`json.dump(resumo, f, indent=2, ensure_ascii=False)` com o arquivo aberto em `'w'` e `encoding='utf-8'`."],
      solucao: r`
import json

validos = [
    {"fornecedor": "Alfa Embalagens", "valor": 1520.75},
    {"fornecedor": "Beta Insumos", "valor": 890.0},
    {"fornecedor": "Gama Logística", "valor": 640.0},
    {"fornecedor": "Alfa Embalagens", "valor": 310.25},
    {"fornecedor": "Gama Logística", "valor": 1200.0},
]

por_fornecedor = {}
for p in validos:
    por_fornecedor[p["fornecedor"]] = por_fornecedor.get(p["fornecedor"], 0) + p["valor"]

resumo = {
    "qtd_pedidos": len(validos),
    "total": round(sum(p["valor"] for p in validos), 2),
    "por_fornecedor": por_fornecedor,
}

with open("resumo.json", "w", encoding="utf-8") as f:
    json.dump(resumo, f, indent=2, ensure_ascii=False)

print(open("resumo.json", encoding="utf-8").read())
`,
    },
  ],
}));
