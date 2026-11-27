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

  /* run({ code, tests, stdin, files, onStatus }) -> Promise<{ out, error, tests, figs }> */
  async function run(opts) {
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
      worker.postMessage({ id, code: opts.code || "", tests: opts.tests || [], stdin: opts.stdin || [], files: opts.files || {} });
    });
  }

  window.Runner = {
    run,
    warmup: () => { ensure(); },
    get ready() { return isReady; },
    onStatus: (fn) => statusListeners.push(fn),
  };
})();
