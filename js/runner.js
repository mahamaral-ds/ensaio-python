/*
 * Executa Python no navegador com Pyodide, dentro de um Web Worker.
 * O worker é criado a partir de um Blob, então funciona até abrindo o index.html direto do disco.
 * Se o código passar do tempo limite (laço infinito), o worker é encerrado e recriado.
 */
(function () {
  "use strict";

  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const TIMEOUT_MS = 12000;

  const HARNESS = String.raw`
import sys, io, json, traceback, ast, re, os, base64, inspect, builtins, warnings
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore", message=".*non-interactive.*")
warnings.filterwarnings("ignore", message=".*FigureCanvasAgg.*")

_DICAS = {
    "NameError": "Um nome foi usado antes de ser definido. Confira a grafia (Python diferencia maiúsculas de minúsculas) e se a variável foi criada antes desta linha.",
    "SyntaxError": "O Python não entendeu a estrutura do código. Procure parênteses, aspas ou dois-pontos faltando perto da linha indicada (às vezes o problema está na linha anterior).",
    "IndentationError": "A indentação (espaços no início da linha) está inconsistente. Use 4 espaços por nível e não misture com tabulação.",
    "TabError": "Mistura de tabulação e espaços na indentação. Use apenas espaços.",
    "TypeError": "Uma operação recebeu um tipo de dado inesperado, por exemplo somar texto com número ou chamar uma função com argumentos a mais ou a menos. Confira os tipos com type().",
    "ValueError": "O tipo está certo, mas o valor não serve, por exemplo int('abc').",
    "KeyError": "A chave não existe no dicionário (ou a coluna não existe no DataFrame). Confira o nome exato ou use .get().",
    "IndexError": "A posição pedida não existe. Índices começam em 0 e vão até len(...) - 1.",
    "ZeroDivisionError": "Divisão por zero. Verifique o divisor antes de dividir.",
    "AttributeError": "Esse objeto não tem o atributo ou método usado. Confira o tipo do objeto e a grafia do método.",
    "ModuleNotFoundError": "Módulo não encontrado. No navegador estão disponíveis a biblioteca padrão e pacotes como numpy, pandas e matplotlib.",
    "ImportError": "Não foi possível importar esse nome. Confira se ele existe no módulo indicado.",
    "FileNotFoundError": "Arquivo não encontrado. Confira o nome e a extensão; os arquivos disponíveis aparecem acima do editor.",
    "RecursionError": "A função chamou a si mesma vezes demais. Falta um caso base que pare a recursão?",
    "UnboundLocalError": "Uma variável local foi lida antes de receber valor. Se queria usar a variável de fora, passe-a como parâmetro.",
    "StopIteration": "O iterador acabou: não há mais itens para next().",
    "EOFError": "O código pediu mais input() do que as entradas disponíveis.",
    "AssertionError": "Um assert falhou: a condição testada é falsa.",
}

def _fmt_exc(e, filename):
    line = None
    if isinstance(e, SyntaxError) and e.filename == filename:
        line = e.lineno
    for fr in traceback.extract_tb(e.__traceback__):
        if fr.filename == filename:
            line = fr.lineno
    name = type(e).__name__
    tip = _DICAS.get(name, "")
    if not tip:
        for base in type(e).__mro__:
            if base.__name__ in _DICAS:
                tip = _DICAS[base.__name__]
                break
    return {"type": name, "message": str(e), "line": line, "tip": tip}

def _figs():
    if "matplotlib.pyplot" not in sys.modules:
        return []
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        f = plt.figure(n)
        b = io.BytesIO()
        f.savefig(b, format="png", dpi=96, bbox_inches="tight")
        out.append(base64.b64encode(b.getvalue()).decode())
    plt.close("all")
    return out

_ASYNC_RUN = re.compile(r"^(\s*)asyncio\.run\(", re.M)

async def _exec(src, ns, filename):
    src = _ASYNC_RUN.sub(r"\1await (", src)
    code = compile(src, filename, "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
    r = eval(code, ns)
    if inspect.iscoroutine(r):
        await r

_LAST_DIR = [None]

def _prepare_dir(files):
    """Cada execução roda numa pasta nova, só com os arquivos do exercício."""
    import tempfile, shutil, importlib
    old = _LAST_DIR[0]
    d = tempfile.mkdtemp(prefix="ensaio_")
    os.chdir(d)
    if old:
        if old in sys.path:
            sys.path.remove(old)
        shutil.rmtree(old, ignore_errors=True)
    sys.path.insert(0, d)
    _LAST_DIR[0] = d
    mods = []
    for name, content in files.items():
        p = os.path.join(d, name)
        os.makedirs(os.path.dirname(p) or d, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
        if name.endswith(".py"):
            m = name[:-3].replace("/", ".")
            if m.endswith(".__init__"):
                m = m[: -len(".__init__")]
            mods.append(m)
    for m in mods:
        for k in list(sys.modules):
            if k == m or k.startswith(m + "."):
                sys.modules.pop(k, None)
    importlib.invalidate_caches()

async def _rodar_testes(tests, ns, error):
    results = []
    old_out, old_err = sys.stdout, sys.stderr
    for t in tests:
        tcode, msg = t[0], t[1]
        if error is not None and not tcode.lstrip().startswith("#permite-erro"):
            results.append({"ok": False, "msg": msg, "detail": "o código parou com erro antes deste teste"})
            continue
        tb = io.StringIO()
        sys.stdout = sys.stderr = tb
        try:
            await _exec(tcode, ns, "<teste>")
            results.append({"ok": True, "msg": msg})
        except AssertionError as e:
            results.append({"ok": False, "msg": msg, "detail": str(e)})
        except BaseException as e:
            d = _fmt_exc(e, "<teste>")
            results.append({"ok": False, "msg": msg, "detail": d["type"] + ": " + d["message"]})
        finally:
            sys.stdout, sys.stderr = old_out, old_err
    return results

# ---------- SQL (SQLite) ----------

_SQL_DICAS = [
    ("no such column", "Essa coluna não existe. Confira a grafia e de qual tabela ela vem (o esquema do banco aparece acima do editor)."),
    ("no such table", "Essa tabela não existe. Confira o nome no esquema do banco."),
    ("ambiguous column name", "A coluna existe em mais de uma tabela da junção. Prefixe com o nome ou o apelido da tabela, como p.id."),
    ("misuse of aggregate", "Funções de agregação (SUM, COUNT, AVG...) não podem ir no WHERE. Para filtrar grupos, use HAVING."),
    ("incomplete input", "O comando terminou antes da hora: falta fechar um parêntese ou uma aspa, ou completar uma cláusula."),
    ("syntax error", "Erro de sintaxe perto do trecho indicado. Confira as vírgulas entre colunas, as aspas simples nos textos e a ordem das cláusulas: SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT."),
    ("unrecognized token", "Há um caractere que o SQL não entende. Textos usam aspas simples: 'SP'."),
    ("no such function", "Essa função não existe no SQLite. Para datas, use date(), strftime() e julianday()."),
    ("wrong number of arguments", "A função recebeu argumentos a mais ou a menos."),
    ("UNIQUE constraint failed", "Já existe uma linha com esse valor numa coluna que não aceita repetição (chave primária ou UNIQUE)."),
    ("NOT NULL constraint failed", "Uma coluna obrigatória (NOT NULL) ficou sem valor."),
    ("FOREIGN KEY constraint failed", "O valor não existe na tabela referenciada (chave estrangeira)."),
    ("CHECK constraint failed", "O valor viola uma regra CHECK da tabela."),
    ("already exists", "Já existe um objeto com esse nome. Use outro nome ou IF NOT EXISTS."),
    ("no transaction is active", "Não há transação aberta: comece com BEGIN."),
]

def _sql_split(sql):
    import sqlite3
    partes, buf = [], ""
    for ch in sql:
        buf += ch
        if ch == ";" and sqlite3.complete_statement(buf):
            partes.append(buf)
            buf = ""
    if buf.strip():
        partes.append(buf)

    def vazio(s):
        linhas = [l.strip() for l in s.splitlines()]
        linhas = [l for l in linhas if l and not l.startswith("--")]
        return not "".join(linhas).strip(";").strip()
    return [p for p in partes if not vazio(p)]

def _sql_novo(script):
    import sqlite3
    con = sqlite3.connect(":memory:", isolation_level=None)
    con.execute("PRAGMA foreign_keys = ON")
    if script:
        con.executescript(script)
    return con

def _sql_exec(con, sql):
    cols, rows, afetadas, n = None, None, 0, 0
    for st in _sql_split(sql):
        cur = con.execute(st)
        n += 1
        if cur.description is not None:
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
        elif cur.rowcount and cur.rowcount > 0:
            afetadas += cur.rowcount
    return cols, rows, afetadas, n

def _sql_fmt(v):
    if v is None:
        return "NULL"
    if isinstance(v, float):
        return str(round(v, 2))
    return str(v)

def _sql_norm(row):
    return tuple(round(v, 4) if isinstance(v, float) else v for v in row)

def _sql_chave(row):
    return tuple((0, float(v), "") if isinstance(v, (int, float)) else (1, 0.0, "" if v is None else str(v)) for v in row)

def _sql_igual(rows, cols, esperado, script, ordem=True):
    if rows is None:
        raise AssertionError("o seu código precisa terminar com um SELECT")
    cur = _sql_novo(script).execute(esperado)
    ecols = [d[0] for d in cur.description]
    erows = cur.fetchall()
    if len(cols) != len(ecols):
        raise AssertionError(f"esperava {len(ecols)} coluna(s) ({', '.join(ecols)}), veio {len(cols)} ({', '.join(cols)})")
    a = [_sql_norm(r) for r in rows]
    b = [_sql_norm(r) for r in erows]
    if not ordem:
        a = sorted(a, key=_sql_chave)
        b = sorted(b, key=_sql_chave)
    if len(a) != len(b):
        raise AssertionError(f"esperava {len(b)} linha(s), veio {len(a)}")
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            raise AssertionError(f"linha {i + 1}: esperava {y}, veio {x}")
    return True

def _sql_texto(cols, rows, afetadas, n):
    if cols is None:
        return f"Comando executado. Linhas afetadas: {afetadas}." if n else "Nenhum comando para executar."
    linhas = [" | ".join(cols)]
    for r in rows[:200]:
        linhas.append(" | ".join(_sql_fmt(v) for v in r))
    if not rows:
        linhas.append("(nenhuma linha)")
    if len(rows) > 200:
        linhas.append(f"... ({len(rows)} linhas no total)")
    return "\n".join(linhas)

async def _ensaio_sql(sql, script, tests_json):
    tests = json.loads(tests_json)
    error = None
    cols = rows = con = None
    afet = n = 0
    try:
        con = _sql_novo(script)
    except Exception as e:
        error = {"type": "Erro no banco do exercício", "message": str(e), "line": None, "tip": ""}
    if con is not None:
        try:
            cols, rows, afet, n = _sql_exec(con, sql)
        except Exception as e:
            msg = str(e)
            tip = next((t for k, t in _SQL_DICAS if k.lower() in msg.lower()), "")
            error = {"type": "Erro de SQL", "message": msg, "line": None, "tip": tip}
    out = "" if error else _sql_texto(cols, rows, afet, n)
    results = []
    if tests:
        ns = {
            "__builtins__": builtins, "_cols": cols, "_rows": rows, "_con": con, "_src": sql,
            "_out": out, "_afetadas": afet, "_erro": error["type"] if error else None,
            "mesmo_resultado": lambda q, ordem=True: _sql_igual(rows, cols, q, script, ordem),
            "consulta": lambda q: con.execute(q).fetchall(),
        }
        results = await _rodar_testes(tests, ns, error)
    tabela = None
    if cols is not None and not error:
        tabela = {"cols": cols, "rows": [[round(v, 4) if isinstance(v, float) else v for v in r] for r in rows[:200]], "total": len(rows)}
    return json.dumps({"out": out, "error": error, "tests": results, "figs": [], "table": tabela})

# ---------- terminal simulado (bash + git) ----------

_SH = [None]
_SH_DIR = [None]

async def _ensaio_shell(code, setup, files_json, tests_json, fonte):
    import tempfile, shutil
    if _SH[0] is None:
        g = {"__name__": "minishell"}
        exec(compile(fonte, "<terminal>", "exec"), g)
        _SH[0] = g
    sh = _SH[0]
    sh["GITHUB"].clear()
    sh["RELOGIO"][0] = 0
    if _SH_DIR[0]:
        shutil.rmtree(_SH_DIR[0], ignore_errors=True)
    raiz = tempfile.mkdtemp(prefix="ensaio_sh_")
    _SH_DIR[0] = raiz
    tests = json.loads(tests_json)
    try:
        s = sh["executar_sessao"](code, setup, json.loads(files_json), raiz)
    except BaseException as e:
        return json.dumps({"out": "", "error": {"type": "Erro no terminal simulado", "message": repr(e), "line": None,
                           "tip": "Isso é uma falha do simulador, não do seu comando. Tente escrever o comando de outro jeito."},
                           "tests": [], "figs": [], "terminal": []})
    trans = s.shell.transcricao
    out = "".join(t["out"] + t["err"] for t in trans)
    results = []
    if tests:
        ns = {
            "__builtins__": builtins, "_out": out, "_src": code, "_erros": "".join(t["err"] for t in trans),
            "_transcricao": trans, "ler": s.ler, "existe": s.existe, "eh_pasta": s.eh_pasta, "listar": s.listar,
            "permissoes": s.permissoes, "executa": s.executa, "cwd": s.cwd,
            "repo": lambda caminho=".": sh["RepoTeste"](s.shell, caminho),
            "github": lambda nome: sh["GitHubTeste"](nome),
            "var": lambda nome: s.shell.vars.get(nome),
            "processos": lambda: [p[4] for p in s.shell.processos],
        }
        results = await _rodar_testes(tests, ns, None)
    return json.dumps({"out": out, "error": None, "tests": results, "figs": [], "terminal": trans,
                       "setupErro": getattr(s, "erro_setup", None)})

async def _ensaio_run(code, tests_json, stdin_json, files_json):
    tests = json.loads(tests_json)
    feed = iter(json.loads(stdin_json))
    _prepare_dir(json.loads(files_json))
    buf = io.StringIO()

    def _input(prompt=""):
        buf.write(str(prompt))
        try:
            v = next(feed)
        except StopIteration:
            raise EOFError("O código pediu mais entradas do que as disponíveis no exercício.")
        buf.write(str(v) + "\n")
        return str(v)

    ns = {"__name__": "__main__", "__builtins__": builtins, "input": _input}
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = buf
    error = None
    try:
        await _exec(code, ns, "<seu código>")
    except SystemExit:
        pass
    except BaseException as e:
        error = _fmt_exc(e, "<seu código>")
    finally:
        sys.stdout, sys.stderr = old_out, old_err
    out = buf.getvalue()
    if len(out) > 20000:
        out = out[:20000] + "\n… (saída cortada)"
    results = []
    if tests:
        ns["_out"] = out
        ns["_src"] = code
        ns["_erro"] = error["type"] if error else None
        for _alias, _mod in (("np", "numpy"), ("pd", "pandas")):
            if _alias not in ns and _mod in sys.modules:
                ns[_alias] = sys.modules[_mod]
        results = await _rodar_testes(tests, ns, error)
    figs = []
    try:
        figs = _figs()
    except BaseException:
        pass
    return json.dumps({"out": out, "error": error, "tests": results, "figs": figs})
`;

  const WORKER_SRC = `
    importScripts(${JSON.stringify(PYODIDE_URL + "pyodide.js")});
    let py = null;
    const ready = (async () => {
      py = await loadPyodide({ indexURL: ${JSON.stringify(PYODIDE_URL)} });
      py.runPython(${JSON.stringify(HARNESS)});
      postMessage({ type: "ready" });
    })().catch((e) => postMessage({ type: "fatal", error: String(e) }));

    onmessage = async (ev) => {
      const { id, code, tests, stdin, files } = ev.data;
      try {
        await ready;
        if (ev.data.linguagem === "shell") {
          postMessage({ type: "started", id });
          const res = await py.globals.get("_ensaio_shell")(code, ev.data.setup || "", JSON.stringify(files || {}), JSON.stringify(tests || []), ev.data.fonte || "");
          postMessage({ type: "result", id, result: JSON.parse(res) });
          return;
        }
        if (ev.data.linguagem === "sql") {
          await py.loadPackage("sqlite3", {
            messageCallback: (m) => { if (/Loading/.test(m)) postMessage({ type: "status", id, text: m }); },
            errorCallback: () => {},
          });
          postMessage({ type: "started", id });
          const res = await py.globals.get("_ensaio_sql")(code, ev.data.banco || "", JSON.stringify(tests || []));
          postMessage({ type: "result", id, result: JSON.parse(res) });
          return;
        }
        const all = code + "\\n" + (tests || []).map((t) => t[0]).join("\\n") +
          "\\n" + Object.entries(files || {}).filter(([n]) => n.endsWith(".py")).map(([, c]) => c).join("\\n");
        await py.loadPackagesFromImports(all, {
          messageCallback: (m) => { if (/Loading/.test(m)) postMessage({ type: "status", id, text: m }); },
          errorCallback: () => {},
        });
        postMessage({ type: "started", id });
        const fn = py.globals.get("_ensaio_run");
        const res = await fn(code, JSON.stringify(tests || []), JSON.stringify(stdin || []), JSON.stringify(files || {}));
        postMessage({ type: "result", id, result: JSON.parse(res) });
      } catch (e) {
        postMessage({ type: "result", id, result: { out: "", error: { type: "Erro interno", message: String(e), tip: "" }, tests: [], figs: [] } });
      }
    };
  `;

  let worker = null;
  let readyPromise = null;
  let isReady = false;
  let seq = 0;
  const pending = {};
  const statusListeners = [];

  function setStatus(s) {
    statusListeners.forEach((fn) => fn(s));
  }

  function spawn() {
    isReady = false;
    const blob = new Blob([WORKER_SRC], { type: "text/javascript" });
    worker = new Worker(URL.createObjectURL(blob));
    readyPromise = new Promise((resolve, reject) => {
      worker.onmessage = (ev) => {
        const m = ev.data;
        if (m.type === "ready") {
          isReady = true;
          setStatus({ state: "pronto" });
          resolve();
        } else if (m.type === "fatal") {
          setStatus({ state: "falhou", text: m.error });
          reject(new Error(m.error));
        } else if (m.type === "status") {
          const p = pending[m.id];
          if (p && p.onStatus) p.onStatus(traduzStatus(m.text));
        } else if (m.type === "started") {
          const p = pending[m.id];
          if (p) {
            if (p.onStatus) p.onStatus("Executando…");
            p.timer = setTimeout(() => timeout(m.id), TIMEOUT_MS);
          }
        } else if (m.type === "result") {
          const p = pending[m.id];
          if (p) {
            clearTimeout(p.timer);
            delete pending[m.id];
            p.resolve(m.result);
          }
        }
      };
      worker.onerror = (e) => {
        setStatus({ state: "falhou", text: e.message });
        reject(new Error(e.message || "Falha no worker"));
      };
    });
    setStatus({ state: "carregando" });
    readyPromise.catch(() => {});
  }

  function traduzStatus(t) {
    const m = String(t).match(/Loading (.+)/);
    return m ? "Instalando pacotes: " + m[1].replace(/, /g, ", ") : t;
  }

  function timeout(id) {
    const p = pending[id];
    if (!p) return;
    delete pending[id];
    worker.terminate();
    Object.keys(pending).forEach((k) => {
      pending[k].resolve({ out: "", error: { type: "Interrompido", message: "Execução cancelada.", tip: "" }, tests: [], figs: [] });
      delete pending[k];
    });
    spawn();
    p.resolve({
      out: "",
      error: {
        type: "Tempo esgotado",
        message: "O código passou de " + TIMEOUT_MS / 1000 + " segundos e foi interrompido.",
        tip: "Provavelmente há um laço que nunca termina. Confira a condição do while e se a variável de controle muda a cada volta.",
      },
      tests: [],
      figs: [],
    });
  }

  function ensure() {
    if (!worker) spawn();
    return readyPromise;
  }

  let fonteShell = null;
  async function carregarShell() {
    if (fonteShell) return fonteShell;
    const partes = await Promise.all(["js/minishell.py", "js/minigit.py"].map((u) => fetch(u).then((r) => {
      if (!r.ok) throw new Error("não foi possível carregar " + u);
      return r.text();
    })));
    fonteShell = partes.join("\n\n");
    return fonteShell;
  }

  /* run({ code, tests, stdin, files, onStatus }) -> Promise<{ out, error, tests, figs }> */
  async function run(opts) {
    let fonte = "";
    if (opts.linguagem === "shell") {
      try {
        fonte = await carregarShell();
      } catch (e) {
        return { out: "", error: { type: "Terminal indisponível", message: String(e), tip: "Abra o app por um servidor (abrir.bat ou o site publicado), e não direto do arquivo." }, tests: [], figs: [] };
      }
    }
    if (!worker) spawn();
    const id = ++seq;
    if (!isReady && opts.onStatus) opts.onStatus("Preparando o Python no navegador (só demora na primeira vez)…");
    try {
      await readyPromise;
    } catch (e) {
      return {
        out: "",
        error: {
          type: "Python indisponível",
          message: "Não foi possível carregar o Pyodide.",
          tip: "Na primeira vez é preciso internet para baixar o Python (cerca de 10 MB). Depois ele fica guardado no navegador.",
        },
        tests: [],
        figs: [],
      };
    }
    return new Promise((resolve) => {
      pending[id] = { resolve, onStatus: opts.onStatus, timer: null };
      worker.postMessage({ id, code: opts.code || "", tests: opts.tests || [], stdin: opts.stdin || [], files: opts.files || {}, linguagem: opts.linguagem || "python", banco: opts.banco || "", setup: opts.setup || "", fonte });
    });
  }

  window.Runner = {
    run,
    warmup: () => { ensure(); },
    get ready() { return isReady; },
    onStatus: (fn) => statusListeners.push(fn),
  };
})();
