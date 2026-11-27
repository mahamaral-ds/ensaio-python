"""
minigit: Git e GitHub (gh) simulados para o terminal do Level Code.

Implementa o subconjunto que um analista usa no dia a dia: init, status, add,
commit, log, diff, show, restore, reset, revert, stash, branch, switch,
checkout, merge (com conflitos), tag, remote, push, pull, fetch, clone,
e o gh para repositórios, pull requests e issues num "GitHub" em memória.

As mensagens seguem o Git de verdade (em inglês), para você reconhecê-las
quando usar o Git no seu computador.
"""
import os
import json
import hashlib
import difflib
import fnmatch
import posixpath
import datetime

GITHUB = {}  # url -> repositório remoto (reiniciado a cada execução)
RELOGIO = [0]  # ordem global dos commits na sessão (o "tempo" simulado)
GITHUB_USUARIO = "analista"
DATA_BASE = datetime.datetime(2024, 6, 3, 10, 0, 0)


def h(texto):
    return hashlib.sha1(texto.encode("utf-8")).hexdigest()


def url_de(nome):
    if nome.startswith("http") or nome.startswith("git@"):
        return nome
    if "/" not in nome:
        nome = GITHUB_USUARIO + "/" + nome
    return "https://github.com/%s.git" % nome


def nome_de_url(url):
    base = url.rstrip("/").split("/")[-1]
    return base[:-4] if base.endswith(".git") else base


class ErroGit(Exception):
    def __init__(self, msg, codigo=128):
        Exception.__init__(self, msg)
        self.codigo = codigo


# ---------------------------------------------------------------------------
# merge de três vias (linha a linha)
# ---------------------------------------------------------------------------

def mudancas(base, outro):
    sm = difflib.SequenceMatcher(None, base, outro, autojunk=False)
    return [(i1, i2, outro[j1:j2]) for tag, i1, i2, j1, j2 in sm.get_opcodes() if tag != "equal"]


def aplicar(base, muds, ini, fim):
    res = []
    p = ini
    for i1, i2, rep in muds:
        res += base[p:i1] + rep
        p = i2
    return res + base[p:fim]


def merge3(base, a, b, nome_a, nome_b):
    """Devolve (linhas, teve_conflito)."""
    ca, cb = mudancas(base, a), mudancas(base, b)
    saida = []
    pos = 0
    conflito = False
    ia = ib = 0
    while ia < len(ca) or ib < len(cb):
        prox_a = ca[ia][0] if ia < len(ca) else None
        prox_b = cb[ib][0] if ib < len(cb) else None
        if prox_b is None or (prox_a is not None and prox_a <= prox_b):
            ini, fim = ca[ia][0], ca[ia][1]
        else:
            ini, fim = cb[ib][0], cb[ib][1]
        grupo_a, grupo_b = [], []
        mudou = True
        while mudou:
            mudou = False
            while ia < len(ca) and ca[ia][0] <= fim and (ca[ia][0] < fim or ca[ia][0] == ini or ca[ia][1] == ca[ia][0] or fim == ini):
                if ca[ia][0] < ini:
                    ini = ca[ia][0]
                fim = max(fim, ca[ia][1])
                grupo_a.append(ca[ia])
                ia += 1
                mudou = True
            while ib < len(cb) and cb[ib][0] <= fim and (cb[ib][0] < fim or cb[ib][0] == ini or cb[ib][1] == cb[ib][0] or fim == ini):
                if cb[ib][0] < ini:
                    ini = cb[ib][0]
                fim = max(fim, cb[ib][1])
                grupo_b.append(cb[ib])
                ib += 1
                mudou = True
        saida += base[pos:ini]
        if grupo_a and grupo_b:
            va = aplicar(base, grupo_a, ini, fim)
            vb = aplicar(base, grupo_b, ini, fim)
            if va == vb:
                saida += va
            else:
                conflito = True
                saida += ["<<<<<<< %s\n" % nome_a] + _fim_nl(va) + ["=======\n"] + _fim_nl(vb) + [">>>>>>> %s\n" % nome_b]
        elif grupo_a:
            saida += aplicar(base, grupo_a, ini, fim)
        else:
            saida += aplicar(base, grupo_b, ini, fim)
        pos = fim
    saida += base[pos:]
    return saida, conflito


def _fim_nl(linhas):
    if linhas and not linhas[-1].endswith("\n"):
        return linhas[:-1] + [linhas[-1] + "\n"]
    return linhas


def linhas(texto):
    return texto.splitlines(True) if texto else []


# ---------------------------------------------------------------------------
# Repositório
# ---------------------------------------------------------------------------

class Repo:
    def __init__(self, shell, raiz_real):
        self.shell = shell
        self.raiz = raiz_real  # pasta real do repositório (onde fica .git)
        self.arq = os.path.join(raiz_real, ".git", "ensaio.json")
        with open(self.arq, encoding="utf-8") as f:
            self.s = json.load(f)

    @staticmethod
    def criar(raiz_real, branch="main"):
        os.makedirs(os.path.join(raiz_real, ".git", "objects"), exist_ok=True)
        os.makedirs(os.path.join(raiz_real, ".git", "refs", "heads"), exist_ok=True)
        with open(os.path.join(raiz_real, ".git", "HEAD"), "w") as f:
            f.write("ref: refs/heads/%s\n" % branch)
        with open(os.path.join(raiz_real, ".git", "config"), "w") as f:
            f.write("[core]\n\trepositoryformatversion = 0\n")
        estado = {
            "head": branch, "detached": None, "branches": {}, "commits": {}, "blobs": {}, "index": {},
            "config": {"user.name": "Analista", "user.email": "analista@exemplo.com"},
            "remotes": {}, "remote_refs": {}, "upstream": {}, "tags": {}, "stash": [], "merge": None, "contador": 0,
        }
        with open(os.path.join(raiz_real, ".git", "ensaio.json"), "w", encoding="utf-8") as f:
            json.dump(estado, f)

    def salvar(self):
        with open(self.arq, "w", encoding="utf-8") as f:
            json.dump(self.s, f)
        with open(os.path.join(self.raiz, ".git", "HEAD"), "w") as f:
            f.write(("ref: refs/heads/%s\n" % self.s["head"]) if not self.s["detached"] else self.s["detached"] + "\n")

    # ----- objetos -----
    def guardar_blob(self, conteudo):
        k = h("blob " + conteudo)
        self.s["blobs"][k] = conteudo
        return k

    def blob(self, k):
        return self.s["blobs"].get(k, "")

    def commit(self, cid):
        return self.s["commits"][cid]

    def head_id(self):
        if self.s["detached"]:
            return self.s["detached"]
        return self.s["branches"].get(self.s["head"])

    def arvore(self, cid):
        return dict(self.commit(cid)["tree"]) if cid else {}

    def curto(self, cid):
        return cid[:7]

    # ----- árvore de trabalho -----
    def caminhos_trabalho(self):
        res = {}
        for dirpath, dirs, files in os.walk(self.raiz):
            dirs[:] = sorted(d for d in dirs if d != ".git")
            for f in sorted(files):
                real = os.path.join(dirpath, f)
                rel = os.path.relpath(real, self.raiz).replace(os.sep, "/")
                with open(real, "rb") as fh:
                    res[rel] = fh.read().decode("utf-8", errors="replace")
        return res

    def padroes_ignorados(self):
        p = os.path.join(self.raiz, ".gitignore")
        if not os.path.exists(p):
            return []
        with open(p, encoding="utf-8") as f:
            return [l.strip() for l in f if l.strip() and not l.strip().startswith("#")]

    def ignorado(self, caminho, padroes=None):
        padroes = self.padroes_ignorados() if padroes is None else padroes
        partes = caminho.split("/")
        resultado = False
        for pad in padroes:
            negar = pad.startswith("!")
            p = pad[1:] if negar else pad
            so_pasta = p.endswith("/")
            p = p.rstrip("/")
            ancorado = p.startswith("/") or "/" in p
            p = p.lstrip("/")
            bate = False
            if ancorado:
                if fnmatch.fnmatchcase(caminho, p) or fnmatch.fnmatchcase(caminho, p + "/*") or any(fnmatch.fnmatchcase("/".join(partes[:k]), p) for k in range(1, len(partes))):
                    bate = True
            else:
                alvos = partes[:-1] if so_pasta else partes
                if any(fnmatch.fnmatchcase(x, p) for x in alvos):
                    bate = True
            if bate:
                resultado = not negar
        return resultado

    def escrever_arquivo(self, rel, conteudo):
        r = os.path.join(self.raiz, rel)
        os.makedirs(os.path.dirname(r), exist_ok=True)
        with open(r, "w", encoding="utf-8", newline="") as f:
            f.write(conteudo)

    def apagar_arquivo(self, rel):
        r = os.path.join(self.raiz, rel)
        if os.path.exists(r):
            os.remove(r)
            pasta = os.path.dirname(r)
            while pasta != self.raiz and os.path.isdir(pasta) and not os.listdir(pasta):
                os.rmdir(pasta)
                pasta = os.path.dirname(pasta)

    def rel_do_shell(self, caminho_v):
        """Caminho do shell (virtual, relativo ao cwd) -> caminho relativo ao repositório."""
        real = self.shell.real(caminho_v)
        rel = os.path.relpath(real, self.raiz).replace(os.sep, "/")
        return "" if rel == "." else rel

    # ----- comparação -----
    def estado(self):
        head = self.arvore(self.head_id())
        idx = self.s["index"]
        wt = {p: self.guardar_blob_tmp(c) for p, c in self.caminhos_trabalho().items()}
        staged, unstaged, untracked = [], [], []
        for p in sorted(set(head) | set(idx)):
            if head.get(p) != idx.get(p):
                tipo = "new file" if p not in head else ("deleted" if p not in idx else "modified")
                staged.append((tipo, p))
        for p in sorted(idx):
            if p not in wt:
                unstaged.append(("deleted", p))
            elif wt[p] != idx[p]:
                unstaged.append(("modified", p))
        padroes = self.padroes_ignorados()
        for p in sorted(wt):
            if p not in idx and not self.ignorado(p, padroes):
                untracked.append(p)
        return staged, unstaged, untracked, wt

    def guardar_blob_tmp(self, conteudo):
        return h("blob " + conteudo)

    # ----- referências -----
    def resolver(self, ref):
        if ref is None:
            raise ErroGit("fatal: ambiguous argument")
        base, sufixo = ref, ""
        for i, c in enumerate(ref):
            if c in "~^":
                base, sufixo = ref[:i], ref[i:]
                break
        if base == "HEAD":
            cid = self.head_id()
        elif base in self.s["branches"]:
            cid = self.s["branches"][base]
        elif base in self.s["tags"]:
            cid = self.s["tags"][base]["commit"]
        elif base in self.s["remote_refs"]:
            cid = self.s["remote_refs"][base]
        elif "origin/" + base in self.s["remote_refs"] and False:
            cid = None
        else:
            cands = [c for c in self.s["commits"] if c.startswith(base)] if len(base) >= 4 else []
            if len(cands) == 1:
                cid = cands[0]
            else:
                raise ErroGit("fatal: ambiguous argument '%s': unknown revision or path not in the working tree." % ref)
        i = 0
        while i < len(sufixo):
            c = sufixo[i]
            i += 1
            n = ""
            while i < len(sufixo) and sufixo[i].isdigit():
                n += sufixo[i]
                i += 1
            n = int(n) if n else 1
            for _ in range(n if c == "~" else 1):
                if cid is None or not self.commit(cid)["parents"]:
                    raise ErroGit("fatal: ambiguous argument '%s': unknown revision or path not in the working tree." % ref)
                cid = self.commit(cid)["parents"][0 if c == "~" else n - 1]
        if cid is None:
            raise ErroGit("fatal: ambiguous argument '%s': unknown revision or path not in the working tree." % ref)
        return cid

    def ancestrais(self, cid):
        vistos = set()
        pilha = [cid] if cid else []
        while pilha:
            c = pilha.pop()
            if c in vistos:
                continue
            vistos.add(c)
            pilha.extend(self.commit(c)["parents"])
        return vistos

    def base_comum(self, a, b):
        anc_a = self.ancestrais(a)
        comuns = [c for c in self.ancestrais(b) if c in anc_a]
        if not comuns:
            return None
        return max(comuns, key=lambda c: self.commit(c)["n"])

    def novo_commit(self, arvore, pais, msg):
        RELOGIO[0] += 1
        self.s["contador"] = n = RELOGIO[0]
        autor = "%s <%s>" % (self.s["config"].get("user.name", "Analista"), self.s["config"].get("user.email", "analista@exemplo.com"))
        cid = h(json.dumps({"t": arvore, "p": pais, "m": msg, "n": n, "r": self.raiz[-6:]}, sort_keys=True))
        self.s["commits"][cid] = {"tree": arvore, "parents": pais, "msg": msg, "author": autor, "n": n,
                                   "date": (DATA_BASE + datetime.timedelta(minutes=5 * n)).strftime("%a %b %-d %H:%M:%S %Y -0300") if os.name != "nt" else (DATA_BASE + datetime.timedelta(minutes=5 * n)).strftime("%a %b %d %H:%M:%S %Y -0300")}
        return cid

    def mover_head(self, cid):
        if self.s["detached"]:
            self.s["detached"] = cid
        else:
            self.s["branches"][self.s["head"]] = cid

    def decoracoes(self, cid):
        decs = []
        if not self.s["detached"] and self.s["branches"].get(self.s["head"]) == cid:
            decs.append("HEAD -> " + self.s["head"])
        elif self.s["detached"] == cid:
            decs.append("HEAD")
        for b, c in sorted(self.s["branches"].items()):
            if c == cid and not (b == self.s["head"] and not self.s["detached"]):
                decs.append(b)
        for b, c in sorted(self.s["remote_refs"].items()):
            if c == cid:
                decs.append(b)
        for t, d in sorted(self.s["tags"].items()):
            if d["commit"] == cid:
                decs.append("tag: " + t)
        return decs

    def estatisticas(self, antes, depois):
        arquivos = 0
        ins = dele = 0
        criados = []
        for p in sorted(set(antes) | set(depois)):
            if antes.get(p) == depois.get(p):
                continue
            arquivos += 1
            a = linhas(self.blob(antes[p])) if p in antes else []
            b = linhas(self.blob(depois[p])) if p in depois else []
            if p not in antes:
                criados.append(p)
            for l in difflib.ndiff(a, b):
                if l.startswith("+ "):
                    ins += 1
                elif l.startswith("- "):
                    dele += 1
        partes = [" %d file%s changed" % (arquivos, "" if arquivos == 1 else "s")]
        if ins:
            partes.append(" %d insertion%s(+)" % (ins, "" if ins == 1 else "s"))
        if dele:
            partes.append(" %d deletion%s(-)" % (dele, "" if dele == 1 else "s"))
        texto = ",".join(partes) + "\n"
        for p in criados:
            texto += " create mode 100644 %s\n" % p
        return texto

    def diff_texto(self, antes, depois, caminhos=None):
        saida = []
        for p in sorted(set(antes) | set(depois)):
            if caminhos and not any(p == c or p.startswith(c.rstrip("/") + "/") or c in ("", ".") for c in caminhos):
                continue
            a_txt = antes.get(p)
            b_txt = depois.get(p)
            if a_txt == b_txt:
                continue
            saida.append("diff --git a/%s b/%s" % (p, p))
            if a_txt is None:
                saida.append("new file mode 100644")
            elif b_txt is None:
                saida.append("deleted file mode 100644")
            saida.append("index %s..%s %s" % (h("blob " + (a_txt or ""))[:7] if a_txt is not None else "0000000", h("blob " + (b_txt or ""))[:7] if b_txt is not None else "0000000", "100644"))
            ud = list(difflib.unified_diff(linhas(a_txt or ""), linhas(b_txt or ""), "a/" + p if a_txt is not None else "/dev/null", "b/" + p if b_txt is not None else "/dev/null", n=3))
            for l in ud:
                l = l.rstrip("\n")
                saida.append(l)
        return "\n".join(saida) + ("\n" if saida else "")

    def conteudos(self, arvore):
        return {p: self.blob(k) for p, k in arvore.items()}

    def checkout_arvore(self, alvo, atual):
        """Atualiza a árvore de trabalho e o índice da árvore atual para a árvore alvo."""
        for p in atual:
            if p not in alvo:
                self.apagar_arquivo(p)
        for p, k in alvo.items():
            if atual.get(p) != k or not os.path.exists(os.path.join(self.raiz, p)):
                self.escrever_arquivo(p, self.blob(k))
        self.s["index"] = dict(alvo)


def achar_repo(shell, caminho_v=None):
    v = shell.vcaminho(caminho_v or ".")
    while True:
        r = shell.real(v)
        if os.path.isdir(os.path.join(r, ".git")) and os.path.exists(os.path.join(r, ".git", "ensaio.json")):
            return Repo(shell, r)
        if v == "/":
            return None
        v = posixpath.dirname(v)


# ---------------------------------------------------------------------------
# Comandos git
# ---------------------------------------------------------------------------

def git(shell, args, entrada=""):
    if not args or args[0] in ("--help", "help"):
        return ("usage: git <command> [<args>]\n\nComandos comuns: init, status, add, commit, log, diff, restore, reset,\n"
                "branch, switch, merge, remote, push, pull, clone\n"), "", 1 if not args else 0
    if args[0] == "--version":
        return "git version 2.45.0 (simulado)\n", "", 0
    sub, resto = args[0], args[1:]
    try:
        if sub == "init":
            return git_init(shell, resto)
        if sub == "clone":
            return git_clone(shell, resto)
        if sub == "config":
            repo = achar_repo(shell)
            return git_config(shell, repo, resto)
        repo = achar_repo(shell)
        if repo is None:
            raise ErroGit("fatal: not a git repository (or any of the parent directories): .git")
        f = COMANDOS.get(sub)
        if f is None:
            raise ErroGit("git: '%s' is not a git command. See 'git --help'." % sub, 1)
        out, err, codigo = f(shell, repo, resto)
        repo.salvar()
        return out, err, codigo
    except ErroGit as e:
        return "", str(e) + "\n", e.codigo


def opcoes(resto, com_valor=("m",)):
    op, pos = {}, []
    i = 0
    while i < len(resto):
        a = resto[i]
        if a == "--":
            pos += [("--", x) for x in resto[i + 1:]]
            break
        if a.startswith("--"):
            if "=" in a:
                k, v = a[2:].split("=", 1)
                op[k] = v
            elif a[2:] in com_valor and i + 1 < len(resto):
                op[a[2:]] = resto[i + 1]
                i += 1
            else:
                op[a[2:]] = True
        elif a.startswith("-") and len(a) > 1:
            letras = a[1:]
            for j, l in enumerate(letras):
                if l in com_valor:
                    v = letras[j + 1:] or (resto[i + 1] if i + 1 < len(resto) else "")
                    if not letras[j + 1:]:
                        i += 1
                    op.setdefault(l, [])
                    if isinstance(op[l], list):
                        op[l].append(v)
                    break
                op[l] = True
        else:
            pos.append(a)
        i += 1
    pos = [x[1] if isinstance(x, tuple) else x for x in pos]
    return op, pos


def git_init(shell, resto):
    op, pos = opcoes(resto, com_valor=("b",))
    alvo = pos[0] if pos else "."
    r = shell.real(alvo)
    os.makedirs(r, exist_ok=True)
    ja = os.path.exists(os.path.join(r, ".git", "ensaio.json"))
    if not ja:
        branch = op.get("b", ["main"])[0] if isinstance(op.get("b"), list) else "main"
        Repo.criar(r, branch)
    v = shell.vcaminho(alvo)
    return ("%s Git repository in %s/.git/\n" % ("Reinitialized existing" if ja else "Initialized empty", v)), "", 0


def git_config(shell, repo, resto):
    op, pos = opcoes(resto)
    if op.get("list") or op.get("l"):
        if repo is None:
            return "user.name=Analista\nuser.email=analista@exemplo.com\n", "", 0
        return "".join("%s=%s\n" % kv for kv in sorted(repo.s["config"].items())), "", 0
    if not pos:
        return "", "usage: git config [<options>]\n", 129
    chave = pos[0]
    if repo is None:
        caminho = shell.real("~/.gitconfig")
        dados = {}
        if os.path.exists(caminho):
            with open(caminho, encoding="utf-8") as f:
                dados = json.load(f)
        if len(pos) == 1:
            v = dados.get(chave)
            return (v + "\n" if v else ""), "", 0 if v else 1
        dados[chave] = pos[1]
        with open(caminho, "w", encoding="utf-8") as f:
            json.dump(dados, f)
        return "", "", 0
    if len(pos) == 1:
        v = repo.s["config"].get(chave)
        return (v + "\n" if v else ""), "", 0 if v else 1
    repo.s["config"][chave] = pos[1]
    repo.salvar()
    return "", "", 0


def info_upstream(repo):
    b = repo.s["head"]
    up = repo.s["upstream"].get(b)
    if not up or repo.s["detached"]:
        return ""
    local = repo.head_id()
    remoto = repo.s["remote_refs"].get(up)
    if remoto is None:
        return "Your branch is based on '%s', but the upstream is gone.\n" % up
    a_local = repo.ancestrais(local)
    a_remoto = repo.ancestrais(remoto)
    frente = len(a_local - a_remoto)
    atras = len(a_remoto - a_local)
    if frente and atras:
        return "Your branch and '%s' have diverged,\nand have %d and %d different commits each, respectively.\n  (use \"git pull\" if you want to integrate the remote branch with yours)\n" % (up, frente, atras)
    if frente:
        return "Your branch is ahead of '%s' by %d commit%s.\n  (use \"git push\" to publish your local commits)\n" % (up, frente, "" if frente == 1 else "s")
    if atras:
        return "Your branch is behind '%s' by %d commit%s, and can be fast-forwarded.\n  (use \"git pull\" to update your local branch)\n" % (up, atras, "" if atras == 1 else "s")
    return "Your branch is up to date with '%s'.\n" % up


def git_status(shell, repo, resto):
    op, pos = opcoes(resto)
    staged, unstaged, untracked, wt = repo.estado()
    conflitos = repo.s["merge"]["conflitos"] if repo.s["merge"] else []
    if op.get("s") or op.get("short"):
        linhas_s = {}
        for tipo, p in staged:
            linhas_s.setdefault(p, [" ", " "])[0] = {"new file": "A", "modified": "M", "deleted": "D"}[tipo]
        for tipo, p in unstaged:
            linhas_s.setdefault(p, [" ", " "])[1] = {"modified": "M", "deleted": "D"}[tipo]
        saida = ""
        for p in sorted(linhas_s):
            if p in conflitos:
                saida += "UU %s\n" % p
            else:
                saida += "%s%s %s\n" % (linhas_s[p][0], linhas_s[p][1], p)
        for p in agrupar_untracked(repo, untracked):
            saida += "?? %s\n" % p
        return saida, "", 0
    saida = ""
    if repo.s["detached"]:
        saida += "HEAD detached at %s\n" % repo.curto(repo.s["detached"])
    else:
        saida += "On branch %s\n" % repo.s["head"]
    saida += info_upstream(repo)
    if repo.head_id() is None:
        saida += "\nNo commits yet\n"
    if repo.s["merge"]:
        if conflitos:
            saida += "You have unmerged paths.\n  (fix conflicts and run \"git commit\")\n  (use \"git merge --abort\" to abort the merge)\n"
        else:
            saida += "All conflicts fixed but you are still merging.\n  (use \"git commit\" to conclude merge)\n"
    staged_sem_conf = [(t, p) for t, p in staged if p not in conflitos]
    if staged_sem_conf:
        saida += "\nChanges to be committed:\n  (use \"git restore --staged <file>...\" to unstage)\n"
        for tipo, p in staged_sem_conf:
            saida += "\t%-12s%s\n" % (tipo + ":", p)
    if conflitos:
        saida += "\nUnmerged paths:\n  (use \"git add <file>...\" to mark resolution)\n"
        for p in conflitos:
            saida += "\tboth modified:   %s\n" % p
    unstaged_sem_conf = [(t, p) for t, p in unstaged if p not in conflitos]
    if unstaged_sem_conf:
        saida += "\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n  (use \"git restore <file>...\" to discard changes in working directory)\n"
        for tipo, p in unstaged_sem_conf:
            saida += "\t%-12s%s\n" % (tipo + ":", p)
    grupos = agrupar_untracked(repo, untracked)
    if grupos:
        saida += "\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n"
        for p in grupos:
            saida += "\t%s\n" % p
    if not staged and not unstaged and not grupos and not conflitos:
        if repo.head_id() is None:
            saida += "\nnothing to commit (create/copy files and use \"git add\" to track)\n"
        else:
            saida += "\nnothing to commit, working tree clean\n"
    elif not staged and not conflitos:
        if unstaged:
            saida += "\nno changes added to commit (use \"git add\" and/or \"git commit -a\")\n"
        else:
            saida += "\nnothing added to commit but untracked files present (use \"git add\" to track)\n"
    return saida, "", 0


def agrupar_untracked(repo, untracked):
    rastreados = set(repo.s["index"]) | set(repo.arvore(repo.head_id()))
    grupos = []
    vistos = set()
    for p in untracked:
        partes = p.split("/")
        escolhido = p
        for k in range(1, len(partes)):
            pasta = "/".join(partes[:k])
            if not any(t.startswith(pasta + "/") for t in rastreados):
                escolhido = pasta + "/"
                break
        if escolhido not in vistos:
            vistos.add(escolhido)
            grupos.append(escolhido)
    return grupos


def git_add(shell, repo, resto):
    op, pos = opcoes(resto)
    if op.get("A") or op.get("all"):
        pos = ["."] + pos
    if not pos:
        return "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?\n", "", 0
    wt = repo.caminhos_trabalho()
    padroes = repo.padroes_ignorados()
    err = ""
    for alvo in pos:
        rel = repo.rel_do_shell(alvo)
        casou = False
        for p, conteudo in wt.items():
            if rel == "" or p == rel or p.startswith(rel + "/") or fnmatch.fnmatchcase(p, rel):
                if p not in repo.s["index"] and repo.ignorado(p, padroes):
                    if p == rel:
                        return "", "The following paths are ignored by one of your .gitignore files:\n%s\nhint: Use -f if you really want to add them.\n" % p, 1
                    continue
                repo.s["index"][p] = repo.guardar_blob(conteudo)
                casou = True
        for p in list(repo.s["index"]):
            if (rel == "" or p == rel or p.startswith(rel + "/")) and p not in wt:
                del repo.s["index"][p]
                casou = True
        if repo.s["merge"]:
            repo.s["merge"]["conflitos"] = [c for c in repo.s["merge"]["conflitos"] if not (rel == "" or c == rel or c.startswith(rel + "/"))]
        if not casou and not any(p == rel or p.startswith(rel + "/") for p in repo.s["index"]):
            if rel and not os.path.exists(repo.shell.real(alvo)):
                return "", "fatal: pathspec '%s' did not match any files\n" % alvo, 128
    return "", err, 0


def git_rm(shell, repo, resto):
    op, pos = opcoes(resto)
    saida = ""
    for alvo in pos:
        rel = repo.rel_do_shell(alvo)
        achados = [p for p in repo.s["index"] if p == rel or p.startswith(rel + "/")]
        if not achados:
            return "", "fatal: pathspec '%s' did not match any files\n" % alvo, 128
        if any(p != rel for p in achados) and not op.get("r"):
            return "", "fatal: not removing '%s' recursively without -r\n" % alvo, 128
        for p in achados:
            del repo.s["index"][p]
            if not op.get("cached"):
                repo.apagar_arquivo(p)
            saida += "rm '%s'\n" % p
    return saida, "", 0


def git_mv(shell, repo, resto):
    op, pos = opcoes(resto)
    if len(pos) != 2:
        return "", "usage: git mv <source> <destination>\n", 128
    a, b = repo.rel_do_shell(pos[0]), repo.rel_do_shell(pos[1])
    if a not in repo.s["index"]:
        return "", "fatal: not under version control, source=%s, destination=%s\n" % (pos[0], pos[1]), 128
    if os.path.isdir(os.path.join(repo.raiz, b)):
        b = b + "/" + posixpath.basename(a)
    conteudo = repo.caminhos_trabalho().get(a, repo.blob(repo.s["index"][a]))
    repo.apagar_arquivo(a)
    repo.escrever_arquivo(b, conteudo)
    repo.s["index"][b] = repo.s["index"].pop(a)
    return "", "", 0


def git_commit(shell, repo, resto):
    op, pos = opcoes(resto)
    msgs = op.get("m") if isinstance(op.get("m"), list) else []
    if op.get("a") or op.get("all"):
        wt = repo.caminhos_trabalho()
        for p in list(repo.s["index"]):
            if p in wt:
                repo.s["index"][p] = repo.guardar_blob(wt[p])
            else:
                del repo.s["index"][p]
    merge = repo.s["merge"]
    if merge and merge["conflitos"]:
        return "", "error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.\n", 128
    if not msgs and not op.get("amend") and not merge:
        return "", "Aborting commit due to empty commit message.\n(no terminal simulado, use git commit -m \"mensagem\")\n", 1
    head = repo.head_id()
    arvore = dict(repo.s["index"])
    if op.get("amend"):
        if head is None:
            return "", "fatal: You have nothing to amend.\n", 128
        anterior = repo.commit(head)
        msg = "\n\n".join(msgs) if msgs else anterior["msg"]
        cid = repo.novo_commit(arvore, anterior["parents"], msg)
        repo.mover_head(cid)
        return "[%s %s] %s\n%s" % (repo.s["head"], repo.curto(cid), msg.splitlines()[0], repo.estatisticas(repo.arvore(anterior["parents"][0]) if anterior["parents"] else {}, arvore)), "", 0
    if arvore == repo.arvore(head) and not merge:
        out, _, _ = git_status(shell, repo, [])
        return out, "", 1
    msg = "\n\n".join(msgs) if msgs else merge["msg"]
    pais = ([head] if head else []) + ([merge["theirs"]] if merge else [])
    cid = repo.novo_commit(arvore, pais, msg)
    raiz = head is None
    repo.mover_head(cid)
    repo.s["merge"] = None
    nome = repo.s["head"] if not repo.s["detached"] else "detached HEAD"
    return "[%s%s %s] %s\n%s" % (nome, " (root-commit)" if raiz else "", repo.curto(cid), msg.splitlines()[0], repo.estatisticas(repo.arvore(head), arvore)), "", 0


def percorrer(repo, inicios):
    vistos = set()
    pilha = [c for c in inicios if c]
    todos = []
    while pilha:
        c = pilha.pop()
        if c in vistos:
            continue
        vistos.add(c)
        todos.append(c)
        pilha.extend(repo.commit(c)["parents"])
    return sorted(todos, key=lambda c: -repo.commit(c)["n"])


def git_log(shell, repo, resto):
    op, pos = opcoes(resto, com_valor=("n",))
    limite = None
    if "n" in op:
        limite = int(op["n"][0])
    for x in list(op):
        if x.isdigit():
            limite = int(x)
    caminhos = []
    refs = []
    for p in pos:
        try:
            refs.append(repo.resolver(p))
        except ErroGit:
            caminhos.append(repo.rel_do_shell(p))
    if op.get("all"):
        refs = list(repo.s["branches"].values()) + list(repo.s["remote_refs"].values())
    if not refs:
        if repo.head_id() is None:
            return "", "fatal: your current branch '%s' does not have any commits yet\n" % repo.s["head"], 128
        refs = [repo.head_id()]
    commits = percorrer(repo, refs)
    if caminhos:
        def toca(c):
            pai = repo.commit(c)["parents"][0] if repo.commit(c)["parents"] else None
            a, b = repo.arvore(pai), repo.arvore(c)
            return any(a.get(p) != b.get(p) for p in set(a) | set(b) if any(p == x or p.startswith(x + "/") for x in caminhos))
        commits = [c for c in commits if toca(c)]
    if limite is not None:
        commits = commits[:limite]
    saida = []
    for c in commits:
        d = repo.commit(c)
        decs = repo.decoracoes(c)
        dec = (" (" + ", ".join(decs) + ")") if decs else ""
        if op.get("oneline"):
            prefixo = "* " if op.get("graph") else ""
            saida.append("%s%s%s %s" % (prefixo, repo.curto(c), dec, d["msg"].splitlines()[0]))
        else:
            bloco = "commit %s%s\n" % (c, dec)
            if len(d["parents"]) > 1:
                bloco += "Merge: %s\n" % " ".join(repo.curto(p) for p in d["parents"])
            bloco += "Author: %s\nDate:   %s\n\n" % (d["author"], d["date"])
            bloco += "".join("    %s\n" % l for l in d["msg"].splitlines())
            saida.append(bloco)
    if op.get("oneline"):
        return "\n".join(saida) + ("\n" if saida else ""), "", 0
    return "\n".join(saida), "", 0


def git_show(shell, repo, resto):
    op, pos = opcoes(resto)
    cid = repo.resolver(pos[0] if pos else "HEAD")
    d = repo.commit(cid)
    decs = repo.decoracoes(cid)
    saida = "commit %s%s\nAuthor: %s\nDate:   %s\n\n" % (cid, (" (" + ", ".join(decs) + ")") if decs else "", d["author"], d["date"])
    saida += "".join("    %s\n" % l for l in d["msg"].splitlines()) + "\n"
    pai = d["parents"][0] if d["parents"] else None
    if op.get("stat"):
        saida += repo.estatisticas(repo.arvore(pai), d["tree"])
    else:
        saida += repo.diff_texto(repo.conteudos(repo.arvore(pai)), repo.conteudos(d["tree"]))
    return saida, "", 0


def git_diff(shell, repo, resto):
    op, pos = opcoes(resto)
    refs, caminhos = [], []
    for p in pos:
        try:
            refs.append(repo.resolver(p))
        except ErroGit:
            caminhos.append(repo.rel_do_shell(p))
    wt = repo.caminhos_trabalho()
    indice = repo.conteudos(repo.s["index"])
    if op.get("staged") or op.get("cached"):
        antes = repo.conteudos(repo.arvore(refs[0] if refs else repo.head_id()))
        depois = indice
    elif len(refs) == 2:
        antes, depois = repo.conteudos(repo.arvore(refs[0])), repo.conteudos(repo.arvore(refs[1]))
    elif len(refs) == 1:
        antes = repo.conteudos(repo.arvore(refs[0]))
        depois = {p: wt.get(p) for p in set(antes) | set(repo.s["index"]) if p in wt}
    else:
        antes = indice
        depois = {p: wt[p] for p in indice if p in wt}
    if op.get("stat"):
        a = {p: repo.guardar_blob(c) for p, c in antes.items()}
        b = {p: repo.guardar_blob(c) for p, c in depois.items()}
        return repo.estatisticas(a, b), "", 0
    if op.get("name-only"):
        nomes = [p for p in sorted(set(antes) | set(depois)) if antes.get(p) != depois.get(p)]
        return "".join(n + "\n" for n in nomes), "", 0
    return repo.diff_texto(antes, depois, caminhos), "", 0


def git_restore(shell, repo, resto):
    op, pos = opcoes(resto, com_valor=("source",))
    if not pos:
        return "", "fatal: you must specify path(s) to restore\n", 128
    head = repo.arvore(repo.head_id())
    for alvo in pos:
        rel = repo.rel_do_shell(alvo)
        if op.get("staged") or op.get("S"):
            achou = False
            for p in sorted(set(head) | set(repo.s["index"])):
                if rel == "" or p == rel or p.startswith(rel + "/"):
                    achou = True
                    if p in head:
                        repo.s["index"][p] = head[p]
                    else:
                        repo.s["index"].pop(p, None)
            if not achou:
                return "", "error: pathspec '%s' did not match any file(s) known to git\n" % alvo, 1
        else:
            fonte = repo.arvore(repo.resolver(op["source"])) if "source" in op else repo.s["index"]
            achados = [p for p in fonte if rel == "" or p == rel or p.startswith(rel + "/")]
            if not achados:
                return "", "error: pathspec '%s' did not match any file(s) known to git\n" % alvo, 1
            for p in achados:
                repo.escrever_arquivo(p, repo.blob(fonte[p]))
    return "", "", 0


def git_reset(shell, repo, resto):
    op, pos = opcoes(resto)
    modo = "hard" if op.get("hard") else ("soft" if op.get("soft") else "mixed")
    alvo_ref = None
    caminhos = []
    for p in pos:
        try:
            alvo_ref = repo.resolver(p)
        except ErroGit:
            caminhos.append(p)
    head = repo.arvore(repo.head_id())
    if caminhos:
        for alvo in caminhos:
            rel = repo.rel_do_shell(alvo)
            for p in sorted(set(head) | set(repo.s["index"])):
                if p == rel or p.startswith(rel + "/"):
                    if p in head:
                        repo.s["index"][p] = head[p]
                    else:
                        repo.s["index"].pop(p, None)
        return "", "", 0
    alvo = alvo_ref or repo.head_id()
    arvore_alvo = repo.arvore(alvo)
    atual = dict(repo.s["index"])
    repo.mover_head(alvo)
    repo.s["merge"] = None
    if modo == "soft":
        return "", "", 0
    if modo == "mixed":
        repo.s["index"] = dict(arvore_alvo)
        _, unstaged, _, _ = repo.estado()
        if unstaged:
            return "Unstaged changes after reset:\n" + "".join("%s\t%s\n" % ("M" if t == "modified" else "D", p) for t, p in unstaged), "", 0
        return "", "", 0
    rastreados = set(atual) | set(head)
    for p in rastreados:
        if p not in arvore_alvo:
            repo.apagar_arquivo(p)
    for p, k in arvore_alvo.items():
        repo.escrever_arquivo(p, repo.blob(k))
    repo.s["index"] = dict(arvore_alvo)
    return "HEAD is now at %s %s\n" % (repo.curto(alvo), repo.commit(alvo)["msg"].splitlines()[0]), "", 0


def mesclar_arvores(repo, base, nossa, deles, nome_nossa, nome_deles):
    """Merge de três árvores. Devolve (arvore, conteudos_conflito: {path: texto})."""
    resultado = {}
    conflitos = {}
    for p in sorted(set(base) | set(nossa) | set(deles)):
        b, n, d = base.get(p), nossa.get(p), deles.get(p)
        if n == d:
            if n is not None:
                resultado[p] = n
        elif n == b:
            if d is not None:
                resultado[p] = d
        elif d == b:
            if n is not None:
                resultado[p] = n
        else:
            tb = linhas(repo.blob(b)) if b else []
            tn = linhas(repo.blob(n)) if n else []
            td = linhas(repo.blob(d)) if d else []
            mesclado, conflito = merge3(tb, tn, td, nome_nossa, nome_deles)
            texto = "".join(mesclado)
            if conflito or n is None or d is None:
                conflitos[p] = texto
            else:
                resultado[p] = repo.guardar_blob(texto)
    return resultado, conflitos


def alteracoes_locais(repo):
    staged, unstaged, _, _ = repo.estado()
    return sorted(set(p for _, p in staged) | set(p for _, p in unstaged))


def integrar(repo, deles_id, nome_deles, msg):
    """Faz merge de deles_id no HEAD. Devolve (saida, err, codigo)."""
    nossa_id = repo.head_id()
    if deles_id in repo.ancestrais(nossa_id):
        return "Already up to date.\n", "", 0
    locais = alteracoes_locais(repo)
    if nossa_id is None or nossa_id in repo.ancestrais(deles_id):
        alvo = repo.arvore(deles_id)
        atual = repo.arvore(nossa_id)
        bloqueados = [p for p in locais if alvo.get(p) != atual.get(p)]
        if bloqueados:
            return "", "error: Your local changes to the following files would be overwritten by merge:\n" + "".join("\t%s\n" % p for p in bloqueados) + "Please commit your changes or stash them before you merge.\nAborting\n", 1
        repo.checkout_arvore(alvo, atual)
        repo.mover_head(deles_id)
        return "Updating %s..%s\nFast-forward\n%s" % (repo.curto(nossa_id) if nossa_id else "0000000", repo.curto(deles_id), repo.estatisticas(atual, alvo)), "", 0
    if locais:
        return "", "error: Your local changes to the following files would be overwritten by merge:\n" + "".join("\t%s\n" % p for p in locais) + "Please commit your changes or stash them before you merge.\nAborting\n", 1
    base_id = repo.base_comum(nossa_id, deles_id)
    base, nossa, deles = repo.arvore(base_id), repo.arvore(nossa_id), repo.arvore(deles_id)
    arvore, conflitos = mesclar_arvores(repo, base, nossa, deles, "HEAD", nome_deles)
    saida = ""
    for p in sorted(set(arvore) | set(conflitos)):
        if p in conflitos or (nossa.get(p) != deles.get(p) and nossa.get(p) is not None and deles.get(p) is not None and base.get(p) not in (nossa.get(p), deles.get(p))):
            saida += "Auto-merging %s\n" % p
    for p in conflitos:
        saida += "CONFLICT (content): Merge conflict in %s\n" % p
    repo.checkout_arvore(arvore, nossa)
    if conflitos:
        for p, texto in conflitos.items():
            repo.escrever_arquivo(p, texto)
            if p in nossa:
                repo.s["index"][p] = nossa[p]
        repo.s["merge"] = {"theirs": deles_id, "msg": msg, "conflitos": sorted(conflitos)}
        return saida + "Automatic merge failed; fix conflicts and then commit the result.\n", "", 1
    cid = repo.novo_commit(arvore, [nossa_id, deles_id], msg)
    repo.mover_head(cid)
    return saida + "Merge made by the 'ort' strategy.\n" + repo.estatisticas(nossa, arvore), "", 0


def git_merge(shell, repo, resto):
    op, pos = opcoes(resto)
    if op.get("abort"):
        if not repo.s["merge"]:
            return "", "fatal: There is no merge to abort (MERGE_HEAD missing).\n", 128
        arvore = repo.arvore(repo.head_id())
        repo.checkout_arvore(arvore, dict(arvore, **{p: "x" for p in repo.s["merge"]["conflitos"]}))
        repo.s["merge"] = None
        return "", "", 0
    if repo.s["merge"]:
        return "", "error: Merging is not possible because you have unmerged files.\n", 128
    if not pos:
        return "", "fatal: No remote for the current branch.\n", 128
    alvo = pos[0]
    deles = repo.resolver(alvo)
    msg = "Merge branch '%s'" % alvo if alvo in repo.s["branches"] else "Merge commit '%s'" % alvo
    if alvo in repo.s["remote_refs"]:
        msg = "Merge remote-tracking branch '%s'" % alvo
    if op.get("m"):
        msg = op["m"][0]
    if op.get("no-ff") and repo.head_id() in repo.ancestrais(deles) and deles != repo.head_id():
        nossa = repo.head_id()
        arvore = repo.arvore(deles)
        repo.checkout_arvore(arvore, repo.arvore(nossa))
        cid = repo.novo_commit(arvore, [nossa, deles], msg)
        repo.mover_head(cid)
        return "Merge made by the 'ort' strategy.\n" + repo.estatisticas(repo.arvore(nossa), arvore), "", 0
    return integrar(repo, deles, alvo, msg)


def git_revert(shell, repo, resto):
    op, pos = opcoes(resto)
    if not pos:
        return "", "usage: git revert <commit>\n", 128
    cid = repo.resolver(pos[0])
    d = repo.commit(cid)
    if not d["parents"]:
        return "", "error: não é possível reverter o primeiro commit neste simulador\n", 1
    if alteracoes_locais(repo):
        return "", "error: your local changes would be overwritten by revert.\nhint: commit your changes or stash them to proceed.\nfatal: revert failed\n", 128
    base = repo.arvore(cid)
    nossa = repo.arvore(repo.head_id())
    deles = repo.arvore(d["parents"][0])
    arvore, conflitos = mesclar_arvores(repo, base, nossa, deles, "HEAD", "parent of %s (%s)" % (repo.curto(cid), d["msg"].splitlines()[0]))
    if conflitos:
        return "", "error: could not revert %s... %s\n(este simulador não resolve conflitos de revert; desfaça manualmente)\n" % (repo.curto(cid), d["msg"].splitlines()[0]), 1
    repo.checkout_arvore(arvore, nossa)
    msg = 'Revert "%s"\n\nThis reverts commit %s.' % (d["msg"].splitlines()[0], cid)
    novo = repo.novo_commit(arvore, [repo.head_id()], msg)
    repo.mover_head(novo)
    return "[%s %s] %s\n%s" % (repo.s["head"], repo.curto(novo), msg.splitlines()[0], repo.estatisticas(nossa, arvore)), "", 0


def git_stash(shell, repo, resto):
    acao = resto[0] if resto and not resto[0].startswith("-") else "push"
    op, pos = opcoes(resto[1:] if resto and not resto[0].startswith("-") else resto)
    head_id = repo.head_id()
    if acao == "push" or acao == "save":
        locais = alteracoes_locais(repo)
        if not locais:
            return "No local changes to save\n", "", 0
        wt = repo.caminhos_trabalho()
        rastreados = set(repo.s["index"]) | set(repo.arvore(head_id))
        salvo = {"index": dict(repo.s["index"]), "wt": {p: wt[p] for p in rastreados if p in wt}, "apagados": [p for p in rastreados if p not in wt],
                 "base": head_id, "branch": repo.s["head"],
                 "msg": (op.get("m")[0] if op.get("m") else "WIP on %s: %s %s" % (repo.s["head"], repo.curto(head_id), repo.commit(head_id)["msg"].splitlines()[0]))}
        repo.s["stash"].insert(0, salvo)
        arvore = repo.arvore(head_id)
        repo.checkout_arvore(arvore, dict(arvore, **{p: "x" for p in locais}))
        return "Saved working directory and index state %s\n" % salvo["msg"], "", 0
    if acao == "list":
        return "".join("stash@{%d}: %s\n" % (k, s["msg"]) for k, s in enumerate(repo.s["stash"])), "", 0
    if acao in ("pop", "apply"):
        if not repo.s["stash"]:
            return "", "No stash entries found.\n", 1
        s = repo.s["stash"][0]
        for p, conteudo in s["wt"].items():
            repo.escrever_arquivo(p, conteudo)
        for p in s["apagados"]:
            repo.apagar_arquivo(p)
        if acao == "pop":
            repo.s["stash"].pop(0)
        out, _, _ = git_status(shell, repo, [])
        if acao == "pop":
            out += "Dropped refs/stash@{0} (%s)\n" % h(json.dumps(s, sort_keys=True))
        return out, "", 0
    if acao == "drop":
        if not repo.s["stash"]:
            return "", "No stash entries found.\n", 1
        repo.s["stash"].pop(0)
        return "Dropped refs/stash@{0}\n", "", 0
    if acao == "clear":
        repo.s["stash"] = []
        return "", "", 0
    return "", "error: unknown subcommand: %s\n" % acao, 129


def git_branch(shell, repo, resto):
    op, pos = opcoes(resto)
    if op.get("d") or op.get("D") or op.get("delete"):
        saida = ""
        for b in pos:
            if b not in repo.s["branches"]:
                return "", "error: branch '%s' not found.\n" % b, 1
            if b == repo.s["head"] and not repo.s["detached"]:
                return "", "error: Cannot delete branch '%s' checked out at '%s'\n" % (b, repo.shell.virtual_de_real(repo.raiz)), 1
            if op.get("d") and repo.s["branches"][b] not in repo.ancestrais(repo.head_id()):
                return "", "error: The branch '%s' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D %s'.\n" % (b, b), 1
            saida += "Deleted branch %s (was %s).\n" % (b, repo.curto(repo.s["branches"][b]))
            del repo.s["branches"][b]
        return saida, "", 0
    if op.get("m"):
        velho, novo = (pos if len(pos) == 2 else [repo.s["head"]] + pos)
        repo.s["branches"][novo] = repo.s["branches"].pop(velho)
        if repo.s["head"] == velho:
            repo.s["head"] = novo
        return "", "", 0
    if pos:
        nome = pos[0]
        if nome in repo.s["branches"]:
            return "", "fatal: a branch named '%s' already exists\n" % nome, 128
        if repo.head_id() is None:
            return "", "fatal: not a valid object name: '%s'\n" % repo.s["head"], 128
        repo.s["branches"][nome] = repo.resolver(pos[1]) if len(pos) > 1 else repo.head_id()
        return "", "", 0
    saida = ""
    nomes = sorted(repo.s["branches"])
    if repo.s["head"] not in nomes and not repo.s["detached"]:
        nomes = sorted(nomes + [repo.s["head"]]) if repo.head_id() else nomes
    if repo.s["detached"]:
        saida += "* (HEAD detached at %s)\n" % repo.curto(repo.s["detached"])
    for b in nomes:
        atual = b == repo.s["head"] and not repo.s["detached"]
        linha = ("* " if atual else "  ") + b
        if op.get("v") and b in repo.s["branches"]:
            linha += " %s %s" % (repo.curto(repo.s["branches"][b]), repo.commit(repo.s["branches"][b])["msg"].splitlines()[0])
        saida += linha + "\n"
    if op.get("a") or op.get("r"):
        if op.get("r"):
            saida = ""
        for r in sorted(repo.s["remote_refs"]):
            saida += "  remotes/%s\n" % r if not op.get("r") else "  %s\n" % r
    return saida, "", 0


def trocar_branch(repo, nome, criar=False, inicio=None):
    if criar:
        if nome in repo.s["branches"]:
            return "", "fatal: a branch named '%s' already exists\n" % nome, 128
        base = repo.resolver(inicio) if inicio else repo.head_id()
        if base is None:
            repo.s["head"] = nome
            repo.s["detached"] = None
            return "Switched to a new branch '%s'\n" % nome, "", 0
        repo.s["branches"][nome] = base
        if inicio and inicio in repo.s["remote_refs"]:
            repo.s["upstream"][nome] = inicio
        destino = base
    else:
        if nome not in repo.s["branches"]:
            remoto = "origin/" + nome
            if remoto in repo.s["remote_refs"]:
                repo.s["branches"][nome] = repo.s["remote_refs"][remoto]
                repo.s["upstream"][nome] = remoto
                extra = "branch '%s' set up to track '%s'.\n" % (nome, remoto)
                out, err, c = trocar_branch(repo, nome)
                return extra + out, err, c
            return "", "fatal: invalid reference: %s\n" % nome, 128
        if nome == repo.s["head"] and not repo.s["detached"]:
            return "", "Already on '%s'\n" % nome, 0
        destino = repo.s["branches"][nome]
    atual = repo.arvore(repo.head_id())
    alvo = repo.arvore(destino)
    locais = alteracoes_locais(repo)
    bloqueados = [p for p in locais if alvo.get(p) != atual.get(p)]
    if bloqueados:
        return "", "error: Your local changes to the following files would be overwritten by checkout:\n" + "".join("\t%s\n" % p for p in bloqueados) + "Please commit your changes or stash them before you switch branches.\nAborting\n", 1
    wt = repo.caminhos_trabalho()
    indice_antigo = dict(repo.s["index"])
    for p in atual:
        if p not in alvo and p not in locais:
            repo.apagar_arquivo(p)
    for p, k in alvo.items():
        if p not in locais and atual.get(p) != k:
            repo.escrever_arquivo(p, repo.blob(k))
    novo_indice = dict(alvo)
    for p in locais:
        if p in indice_antigo:
            novo_indice[p] = indice_antigo[p]
        else:
            novo_indice.pop(p, None)
    repo.s["index"] = novo_indice
    repo.s["head"] = nome
    repo.s["detached"] = None
    saida = "Switched to %sbranch '%s'\n" % ("a new " if criar else "", nome)
    for p in locais:
        saida = "M\t%s\n" % p + saida
    return saida + info_upstream(repo), "", 0


def git_switch(shell, repo, resto):
    op, pos = opcoes(resto, com_valor=("c", "b"))
    if op.get("c"):
        return trocar_branch(repo, op["c"][0], criar=True, inicio=pos[0] if pos else None)
    if op.get("create"):
        return trocar_branch(repo, pos[0], criar=True, inicio=pos[1] if len(pos) > 1 else None)
    if not pos:
        return "", "fatal: missing branch or commit argument\n", 128
    if pos[0] == "-":
        return "", "fatal: não suportado neste simulador; informe o nome da branch\n", 128
    return trocar_branch(repo, pos[0])


def git_checkout(shell, repo, resto):
    if "--" in resto:
        k = resto.index("--")
        return git_restore(shell, repo, resto[k + 1:])
    op, pos = opcoes(resto, com_valor=("b",))
    if op.get("b"):
        return trocar_branch(repo, op["b"][0], criar=True, inicio=pos[0] if pos else None)
    if not pos:
        return "", "", 0
    alvo = pos[0]
    if alvo in repo.s["branches"] or ("origin/" + alvo) in repo.s["remote_refs"]:
        return trocar_branch(repo, alvo)
    try:
        cid = repo.resolver(alvo)
    except ErroGit:
        return git_restore(shell, repo, pos)
    if os.path.exists(repo.shell.real(alvo)) and not alvo.startswith("HEAD"):
        return git_restore(shell, repo, pos)
    locais = alteracoes_locais(repo)
    if locais:
        return "", "error: Your local changes to the following files would be overwritten by checkout:\n" + "".join("\t%s\n" % p for p in locais) + "Aborting\n", 1
    repo.checkout_arvore(repo.arvore(cid), repo.arvore(repo.head_id()))
    repo.s["detached"] = cid
    return ("Note: switching to '%s'.\n\nYou are in 'detached HEAD' state. You can look around, make experimental\nchanges and commit them, and you can discard any commits you make in this\nstate without impacting any branches by switching back to a branch.\n\nHEAD is now at %s %s\n" % (alvo, repo.curto(cid), repo.commit(cid)["msg"].splitlines()[0])), "", 0


def git_tag(shell, repo, resto):
    op, pos = opcoes(resto)
    if op.get("d"):
        for t in pos:
            if t not in repo.s["tags"]:
                return "", "error: tag '%s' not found.\n" % t, 1
            del repo.s["tags"][t]
        return "".join("Deleted tag '%s'\n" % t for t in pos), "", 0
    if not pos:
        return "".join(t + "\n" for t in sorted(repo.s["tags"])), "", 0
    nome = pos[0]
    if nome in repo.s["tags"]:
        return "", "fatal: tag '%s' already exists\n" % nome, 128
    cid = repo.resolver(pos[1]) if len(pos) > 1 else repo.head_id()
    if cid is None:
        return "", "fatal: Failed to resolve 'HEAD' as a valid ref.\n", 128
    repo.s["tags"][nome] = {"commit": cid, "msg": op["m"][0] if op.get("m") else None}
    return "", "", 0


def git_remote(shell, repo, resto):
    op, pos = opcoes(resto)
    if not pos:
        if op.get("v"):
            return "".join("%s\t%s (fetch)\n%s\t%s (push)\n" % (n, u, n, u) for n, u in sorted(repo.s["remotes"].items())), "", 0
        return "".join(n + "\n" for n in sorted(repo.s["remotes"])), "", 0
    acao = pos[0]
    if acao == "add":
        nome, url = pos[1], pos[2]
        if nome in repo.s["remotes"]:
            return "", "error: remote %s already exists.\n" % nome, 3
        repo.s["remotes"][nome] = url
        return "", "", 0
    if acao in ("remove", "rm"):
        nome = pos[1]
        if nome not in repo.s["remotes"]:
            return "", "error: No such remote: '%s'\n" % nome, 2
        del repo.s["remotes"][nome]
        for r in list(repo.s["remote_refs"]):
            if r.startswith(nome + "/"):
                del repo.s["remote_refs"][r]
        return "", "", 0
    if acao == "set-url":
        repo.s["remotes"][pos[1]] = pos[2]
        return "", "", 0
    if acao == "get-url":
        return repo.s["remotes"].get(pos[1], "") + "\n", "", 0
    return "", "error: Unknown subcommand: %s\n" % acao, 129


# ----- remoto -----

def remoto(url):
    r = GITHUB.get(url)
    if r is None:
        raise ErroGit("remote: Repository not found.\nfatal: repository '%s' not found" % url)
    return r


def novo_remoto(url):
    GITHUB[url] = {"branches": {}, "commits": {}, "blobs": {}, "tags": {}, "prs": [], "issues": [], "padrao": "main"}
    return GITHUB[url]


def copiar_objetos(origem, destino, cid):
    pilha = [cid]
    while pilha:
        c = pilha.pop()
        if c is None or c in destino["commits"]:
            continue
        d = origem["commits"][c]
        destino["commits"][c] = json.loads(json.dumps(d))
        for k in d["tree"].values():
            destino["blobs"][k] = origem["blobs"][k]
        pilha.extend(d["parents"])


def eh_ancestral(estado, a, b):
    """a é ancestral de b?"""
    if a is None:
        return True
    pilha, vistos = [b], set()
    while pilha:
        c = pilha.pop()
        if c is None or c in vistos:
            continue
        if c == a:
            return True
        vistos.add(c)
        pilha.extend(estado["commits"][c]["parents"])
    return False


def git_push(shell, repo, resto):
    op, pos = opcoes(resto)
    nome_remoto = pos[0] if pos else None
    branch = pos[1] if len(pos) > 1 else None
    atual = repo.s["head"]
    if nome_remoto is None:
        up = repo.s["upstream"].get(atual)
        if not up:
            if not repo.s["remotes"]:
                return "", "fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>\n\nand then push using the remote name\n\n    git push <name>\n", 128
            return "", "fatal: The current branch %s has no upstream branch.\nTo push the current branch and set the remote as upstream, use\n\n    git push --set-upstream origin %s\n\n" % (atual, atual), 128
        nome_remoto, branch = up.split("/", 1)
    if nome_remoto not in repo.s["remotes"]:
        return "", "fatal: '%s' does not appear to be a git repository\nfatal: Could not read from remote repository.\n" % nome_remoto, 128
    url = repo.s["remotes"][nome_remoto]
    rem = remoto(url)
    saida = "To %s\n" % url
    if op.get("tags"):
        for t, d in repo.s["tags"].items():
            if t not in rem["tags"]:
                copiar_objetos(repo.s, rem, d["commit"])
                rem["tags"][t] = d["commit"]
                saida += " * [new tag]         %s -> %s\n" % (t, t)
        return "", saida, 0
    branch = branch or atual
    if ":" in branch:
        return "", "fatal: refspec com ':' não é suportado neste simulador\n", 128
    if op.get("delete") or op.get("d"):
        rem["branches"].pop(branch, None)
        repo.s["remote_refs"].pop(nome_remoto + "/" + branch, None)
        return "", saida + " - [deleted]         %s\n" % branch, 0
    if branch not in repo.s["branches"]:
        return "", "error: src refspec %s does not match any\nerror: failed to push some refs to '%s'\n" % (branch, url), 1
    local = repo.s["branches"][branch]
    antigo = rem["branches"].get(branch)
    forcar = op.get("force") or op.get("f") or op.get("force-with-lease")
    if antigo == local:
        msg_ok = "Everything up-to-date\n"
        if op.get("u") or op.get("set-upstream"):
            repo.s["upstream"][branch] = nome_remoto + "/" + branch
        return "", msg_ok, 0
    if antigo is not None and not forcar and not eh_ancestral(repo.s, antigo, local) and antigo not in repo.s["commits"]:
        return "", saida + " ! [rejected]        %s -> %s (fetch first)\nerror: failed to push some refs to '%s'\nhint: Updates were rejected because the remote contains work that you do not\nhint: have locally. This is usually caused by another repository pushing to\nhint: the same ref. If you want to integrate the remote changes, use\nhint: 'git pull' before pushing again.\n" % (branch, branch, url), 1
    if antigo is not None and not forcar and not eh_ancestral(repo.s, antigo, local):
        return "", saida + " ! [rejected]        %s -> %s (non-fast-forward)\nerror: failed to push some refs to '%s'\nhint: Updates were rejected because the tip of your current branch is behind\nhint: its remote counterpart. If you want to integrate the remote changes,\nhint: use 'git pull' before pushing again.\n" % (branch, branch, url), 1
    copiar_objetos(repo.s, rem, local)
    rem["branches"][branch] = local
    if not rem.get("padrao_definido"):
        rem["padrao"] = branch if branch in ("main", "master") or len(rem["branches"]) == 1 else rem["padrao"]
        rem["padrao_definido"] = True
    repo.s["remote_refs"][nome_remoto + "/" + branch] = local
    if antigo is None:
        saida += " * [new branch]      %s -> %s\n" % (branch, branch)
    elif forcar and not eh_ancestral(repo.s, antigo, local):
        saida += " + %s...%s %s -> %s (forced update)\n" % (antigo[:7], local[:7], branch, branch)
    else:
        saida += "   %s..%s  %s -> %s\n" % (antigo[:7], local[:7], branch, branch)
    if op.get("u") or op.get("set-upstream"):
        repo.s["upstream"][branch] = nome_remoto + "/" + branch
        saida += "branch '%s' set up to track '%s/%s'.\n" % (branch, nome_remoto, branch)
    return "", saida, 0


def git_fetch(shell, repo, resto):
    op, pos = opcoes(resto)
    nome_remoto = pos[0] if pos else ("origin" if "origin" in repo.s["remotes"] else (sorted(repo.s["remotes"]) or [None])[0])
    if nome_remoto is None:
        return "", "fatal: No remote repository specified.\n", 128
    url = repo.s["remotes"][nome_remoto]
    rem = remoto(url)
    saida = ""
    for b, cid in sorted(rem["branches"].items()):
        ref = nome_remoto + "/" + b
        antigo = repo.s["remote_refs"].get(ref)
        if antigo == cid:
            continue
        copiar_objetos(rem, repo.s, cid)
        repo.s["remote_refs"][ref] = cid
        if antigo is None:
            saida += " * [new branch]      %s -> %s\n" % (b, ref)
        else:
            saida += "   %s..%s  %s -> %s\n" % (antigo[:7], cid[:7], b, ref)
    for ref in list(repo.s["remote_refs"]):
        if ref.startswith(nome_remoto + "/") and ref.split("/", 1)[1] not in rem["branches"] and (op.get("prune") or op.get("p")):
            del repo.s["remote_refs"][ref]
    for t, cid in rem["tags"].items():
        if t not in repo.s["tags"]:
            copiar_objetos(rem, repo.s, cid)
            repo.s["tags"][t] = {"commit": cid, "msg": None}
            saida += " * [new tag]         %s -> %s\n" % (t, t)
    if saida:
        saida = "From %s\n" % url.replace(".git", "") + saida
    return "", saida, 0


def git_pull(shell, repo, resto):
    op, pos = opcoes(resto)
    atual = repo.s["head"]
    if pos:
        nome_remoto = pos[0]
        branch = pos[1] if len(pos) > 1 else atual
    else:
        up = repo.s["upstream"].get(atual)
        if not up:
            return "", "There is no tracking information for the current branch.\nPlease specify which branch you want to merge with.\n\n    git pull <remote> <branch>\n\nIf you wish to set tracking information for this branch you can do so with:\n\n    git branch --set-upstream-to=origin/%s %s\n" % (atual, atual), 1
        nome_remoto, branch = up.split("/", 1)
    _, err_fetch, codigo = git_fetch(shell, repo, [nome_remoto])
    if codigo:
        return "", err_fetch, codigo
    ref = nome_remoto + "/" + branch
    if ref not in repo.s["remote_refs"]:
        return "", err_fetch + "fatal: couldn't find remote ref %s\n" % branch, 1
    out, err, c = integrar(repo, repo.s["remote_refs"][ref], ref, "Merge branch '%s' of %s" % (branch, repo.s["remotes"][nome_remoto].replace(".git", "")))
    return out, err_fetch + err, c


def git_clone(shell, resto):
    op, pos = opcoes(resto)
    if not pos:
        return "", "fatal: You must specify a repository to clone.\n", 129
    url = url_de(pos[0])
    pasta = pos[1] if len(pos) > 1 else nome_de_url(url)
    r = shell.real(pasta)
    if os.path.exists(r) and os.listdir(r):
        return "", "fatal: destination path '%s' already exists and is not an empty directory.\n" % pasta, 128
    try:
        rem = remoto(url)
    except ErroGit as e:
        return "", "Cloning into '%s'...\n%s\n" % (pasta, e), 128
    os.makedirs(r, exist_ok=True)
    Repo.criar(r, rem["padrao"])
    repo = Repo(shell, r)
    repo.s["remotes"]["origin"] = url
    for b, cid in rem["branches"].items():
        copiar_objetos(rem, repo.s, cid)
        repo.s["remote_refs"]["origin/" + b] = cid
    for t, cid in rem["tags"].items():
        copiar_objetos(rem, repo.s, cid)
        repo.s["tags"][t] = {"commit": cid, "msg": None}
    padrao = rem["padrao"]
    if padrao in rem["branches"]:
        cid = rem["branches"][padrao]
        repo.s["branches"][padrao] = cid
        repo.s["upstream"][padrao] = "origin/" + padrao
        repo.checkout_arvore(repo.arvore(cid), {})
    repo.salvar()
    err = "Cloning into '%s'...\n" % pasta
    if not rem["branches"]:
        err += "warning: You appear to have cloned an empty repository.\n"
    return "", err, 0


COMANDOS = {
    "status": git_status, "add": git_add, "rm": git_rm, "mv": git_mv, "commit": git_commit, "log": git_log,
    "show": git_show, "diff": git_diff, "restore": git_restore, "reset": git_reset, "revert": git_revert,
    "stash": git_stash, "branch": git_branch, "switch": git_switch, "checkout": git_checkout, "merge": git_merge,
    "tag": git_tag, "remote": git_remote, "push": git_push, "pull": git_pull, "fetch": git_fetch,
}


# ---------------------------------------------------------------------------
# gh (GitHub CLI simulado)
# ---------------------------------------------------------------------------

def gh(shell, args, entrada=""):
    if not args:
        return "Work seamlessly with GitHub from the command line.\n\nUSAGE\n  gh <command> <subcommand> [flags]\n\nComandos: repo, pr, issue, auth\n", "", 0
    try:
        grupo, resto = args[0], args[1:]
        if grupo == "auth":
            return "", "github.com\n  ✓ Logged in to github.com account %s (simulado)\n" % GITHUB_USUARIO, 0
        if grupo == "repo":
            return gh_repo(shell, resto)
        if grupo == "pr":
            return gh_pr(shell, resto)
        if grupo == "issue":
            return gh_issue(shell, resto)
        return "", "unknown command \"%s\" for \"gh\"\n" % grupo, 1
    except ErroGit as e:
        return "", str(e) + "\n", 1


def repo_remoto_atual(shell):
    repo = achar_repo(shell)
    if repo is None:
        raise ErroGit("failed to run git: fatal: not a git repository (or any of the parent directories): .git")
    if "origin" not in repo.s["remotes"]:
        raise ErroGit("no git remotes found")
    url = repo.s["remotes"]["origin"]
    return repo, url, remoto(url)


def gh_repo(shell, resto):
    acao = resto[0] if resto else ""
    op, pos = opcoes(resto[1:], com_valor=("source", "remote", "description"))
    if acao == "create":
        if not pos:
            raise ErroGit("nome do repositório obrigatório: gh repo create <nome> --public")
        nome = pos[0]
        url = url_de(nome)
        if url in GITHUB:
            raise ErroGit("GraphQL: Name already exists on this account (createRepository)")
        novo_remoto(url)
        GITHUB[url]["visibilidade"] = "private" if op.get("private") else "public"
        saida = "✓ Created repository %s/%s on GitHub\n  https://github.com/%s/%s\n" % (GITHUB_USUARIO, nome_de_url(url), GITHUB_USUARIO, nome_de_url(url))
        if op.get("source"):
            repo = achar_repo(shell, op["source"])
            if repo is None:
                raise ErroGit("current directory is not a git repository")
            nome_remoto = op.get("remote", "origin")
            repo.s["remotes"][nome_remoto] = url
            repo.salvar()
            saida += "✓ Added remote %s\n" % url
            if op.get("push"):
                _, err, c = git_push(shell, repo, ["-u", nome_remoto, repo.s["head"]])
                repo.salvar()
                if c:
                    return saida, err, c
                saida += "✓ Pushed commits to %s\n" % url
        return saida, "", 0
    if acao == "view":
        repo, url, rem = repo_remoto_atual(shell)
        return "%s/%s\n%s\nbranches: %s\n" % (GITHUB_USUARIO, nome_de_url(url), url, ", ".join(sorted(rem["branches"]))), "", 0
    if acao == "clone":
        return git_clone(shell, pos)
    if acao == "list":
        return "".join("%s/%s\t%s\n" % (GITHUB_USUARIO, nome_de_url(u), r.get("visibilidade", "public")) for u, r in sorted(GITHUB.items())), "", 0
    raise ErroGit("unknown command \"%s\" for \"gh repo\"" % acao)


def gh_pr(shell, resto):
    acao = resto[0] if resto else ""
    op, pos = opcoes(resto[1:], com_valor=("title", "body", "base", "head", "t", "b", "B", "H"))
    repo, url, rem = repo_remoto_atual(shell)
    def val(*nomes):
        for n in nomes:
            if n in op:
                v = op[n]
                return v[0] if isinstance(v, list) else v
        return None
    if acao == "create":
        titulo = val("title", "t")
        corpo = val("body", "b") or ""
        base = val("base", "B") or rem["padrao"]
        cabeca = val("head", "H") or repo.s["head"]
        if not titulo:
            raise ErroGit("must provide `--title` and `--body` (or `--fill`) when not running interactively")
        if cabeca not in rem["branches"]:
            raise ErroGit("aborted: you must first push the current branch to a remote, or use the --head flag")
        if base not in rem["branches"]:
            raise ErroGit("base branch '%s' not found" % base)
        if rem["branches"][cabeca] == rem["branches"][base] or eh_ancestral(rem, rem["branches"][cabeca], rem["branches"][base]):
            raise ErroGit("pull request create failed: GraphQL: No commits between %s and %s" % (base, cabeca))
        num = len(rem["prs"]) + len(rem["issues"]) + 1
        rem["prs"].append({"numero": num, "titulo": titulo, "corpo": corpo, "base": base, "head": cabeca, "estado": "OPEN", "comentarios": []})
        return "https://github.com/%s/%s/pull/%d\n" % (GITHUB_USUARIO, nome_de_url(url), num), "\nCreating pull request for %s into %s in %s/%s\n\n" % (cabeca, base, GITHUB_USUARIO, nome_de_url(url)), 0
    if acao == "list":
        estado = "OPEN" if not op.get("state") else str(op.get("state")).upper()
        prs = [p for p in rem["prs"] if estado == "ALL" or p["estado"] == estado]
        if not prs:
            return "", "no open pull requests in %s/%s\n" % (GITHUB_USUARIO, nome_de_url(url)), 0
        return "".join("#%d\t%s\t%s\t%s\n" % (p["numero"], p["titulo"], p["head"], p["estado"]) for p in prs), "", 0
    pr = None
    if pos:
        num = int(pos[0].lstrip("#"))
        pr = next((p for p in rem["prs"] if p["numero"] == num), None)
        if pr is None:
            raise ErroGit("GraphQL: Could not resolve to a PullRequest with the number of %d." % num)
    if acao == "view":
        if pr is None:
            raise ErroGit("informe o número do PR: gh pr view 1")
        txt = "%s #%d\n%s • %s quer juntar commits de %s em %s\n\n%s\n" % (pr["titulo"], pr["numero"], pr["estado"], GITHUB_USUARIO, pr["head"], pr["base"], pr["corpo"] or "Sem descrição.")
        for c in pr["comentarios"]:
            txt += "\n%s comentou:\n  %s\n" % (c["autor"], c["texto"])
        return txt, "", 0
    if acao == "comment":
        corpo = val("body", "b")
        pr["comentarios"].append({"autor": GITHUB_USUARIO, "texto": corpo or ""})
        return "https://github.com/%s/%s/pull/%d#issuecomment-1\n" % (GITHUB_USUARIO, nome_de_url(url), pr["numero"]), "", 0
    if acao == "merge":
        if pr is None:
            raise ErroGit("informe o número do PR: gh pr merge 1 --merge")
        if pr["estado"] != "OPEN":
            raise ErroGit("Pull request #%d was already merged or closed" % pr["numero"])
        base_id = rem["branches"][pr["base"]]
        cab_id = rem["branches"][pr["head"]]
        if op.get("squash"):
            estilo = "squash"
        elif op.get("rebase"):
            estilo = "rebase"
        else:
            estilo = "merge"
        if eh_ancestral(rem, base_id, cab_id) and estilo != "merge":
            novo = cab_id
        else:
            tmp = Repo.__new__(Repo)
            tmp.s = rem
            base_c = None
            anc_base = set()
            pilha = [base_id]
            while pilha:
                c = pilha.pop()
                if c in anc_base:
                    continue
                anc_base.add(c)
                pilha.extend(rem["commits"][c]["parents"])
            pilha, vistos = [cab_id], set()
            candidatos = []
            while pilha:
                c = pilha.pop()
                if c in vistos:
                    continue
                vistos.add(c)
                if c in anc_base:
                    candidatos.append(c)
                    continue
                pilha.extend(rem["commits"][c]["parents"])
            base_c = max(candidatos, key=lambda c: rem["commits"][c]["n"]) if candidatos else None
            arv_base = rem["commits"][base_c]["tree"] if base_c else {}
            tmp.s = {"blobs": rem["blobs"]}
            arvore, conflitos = mesclar_arvores(tmp, arv_base, rem["commits"][base_id]["tree"], rem["commits"][cab_id]["tree"], pr["base"], pr["head"])
            if conflitos:
                raise ErroGit("X Pull request #%d is not mergeable: the merge commit cannot be cleanly created." % pr["numero"])
            RELOGIO[0] += 1
            n = RELOGIO[0]
            msg = "Merge pull request #%d from %s/%s\n\n%s" % (pr["numero"], GITHUB_USUARIO, pr["head"], pr["titulo"])
            pais = [base_id] if estilo == "squash" else [base_id, cab_id]
            if estilo == "squash":
                msg = "%s (#%d)" % (pr["titulo"], pr["numero"])
            novo = h(json.dumps({"t": arvore, "p": pais, "m": msg, "n": n}, sort_keys=True))
            rem["commits"][novo] = {"tree": arvore, "parents": pais, "msg": msg, "author": "%s <%s@users.noreply.github.com>" % (GITHUB_USUARIO, GITHUB_USUARIO), "n": n,
                                    "date": (DATA_BASE + datetime.timedelta(minutes=5 * n)).strftime("%a %b %d %H:%M:%S %Y -0300")}
        rem["branches"][pr["base"]] = novo
        pr["estado"] = "MERGED"
        saida = "✓ Merged pull request #%d (%s)\n" % (pr["numero"], pr["titulo"])
        if op.get("delete-branch") or op.get("d"):
            rem["branches"].pop(pr["head"], None)
            saida += "✓ Deleted branch %s\n" % pr["head"]
        return "", saida, 0
    if acao == "close":
        pr["estado"] = "CLOSED"
        return "", "✓ Closed pull request #%d (%s)\n" % (pr["numero"], pr["titulo"]), 0
    if acao == "checkout":
        return trocar_branch(repo, pr["head"])
    raise ErroGit("unknown command \"%s\" for \"gh pr\"" % acao)


def gh_issue(shell, resto):
    acao = resto[0] if resto else ""
    op, pos = opcoes(resto[1:], com_valor=("title", "body", "t", "b", "label", "l", "assignee", "a"))
    repo, url, rem = repo_remoto_atual(shell)

    def val(*nomes):
        for n in nomes:
            if n in op:
                v = op[n]
                return v[0] if isinstance(v, list) else v
        return None
    if acao == "create":
        titulo = val("title", "t")
        if not titulo:
            raise ErroGit("must provide `--title` and `--body` when not running interactively")
        num = len(rem["prs"]) + len(rem["issues"]) + 1
        rem["issues"].append({"numero": num, "titulo": titulo, "corpo": val("body", "b") or "", "estado": "OPEN", "rotulo": val("label", "l")})
        return "https://github.com/%s/%s/issues/%d\n" % (GITHUB_USUARIO, nome_de_url(url), num), "\nCreating issue in %s/%s\n\n" % (GITHUB_USUARIO, nome_de_url(url)), 0
    if acao == "list":
        abertas = [i for i in rem["issues"] if i["estado"] == "OPEN"]
        if not abertas:
            return "", "no open issues in %s/%s\n" % (GITHUB_USUARIO, nome_de_url(url)), 0
        return "".join("#%d\t%s\t%s\n" % (i["numero"], i["titulo"], i["rotulo"] or "") for i in abertas), "", 0
    if acao in ("close", "view"):
        num = int(pos[0].lstrip("#"))
        it = next((i for i in rem["issues"] if i["numero"] == num), None)
        if it is None:
            raise ErroGit("GraphQL: Could not resolve to an issue with the number of %d." % num)
        if acao == "view":
            return "%s #%d\n%s\n\n%s\n" % (it["titulo"], it["numero"], it["estado"], it["corpo"]), "", 0
        it["estado"] = "CLOSED"
        return "", "✓ Closed issue #%d (%s)\n" % (num, it["titulo"]), 0
    raise ErroGit("unknown command \"%s\" for \"gh issue\"" % acao)


# ---------------------------------------------------------------------------
# Integração com o shell e ajudantes para os testes
# ---------------------------------------------------------------------------

class RepoTeste:
    """Visão de um repositório para os testes dos exercícios."""

    def __init__(self, shell, caminho="."):
        self.shell = shell
        self.repo = achar_repo(shell, caminho)
        if self.repo is None:
            raise AssertionError("não há repositório Git em %s (faltou git init?)" % shell.vcaminho(caminho))

    @property
    def branch(self):
        return None if self.repo.s["detached"] else self.repo.s["head"]

    @property
    def branches(self):
        return sorted(self.repo.s["branches"])

    def commits(self, ref="HEAD"):
        try:
            cid = self.repo.resolver(ref)
        except ErroGit:
            return []
        return [self.repo.commit(c) for c in percorrer(self.repo, [cid])]

    def mensagens(self, ref="HEAD"):
        return [c["msg"].splitlines()[0] for c in self.commits(ref)]

    def arquivos(self, ref="HEAD"):
        try:
            cid = self.repo.resolver(ref)
        except ErroGit:
            return {}
        return self.repo.conteudos(self.repo.arvore(cid))

    def status(self):
        staged, unstaged, untracked, _ = self.repo.estado()
        return {"staged": [p for _, p in staged], "modificados": [p for _, p in unstaged], "novos": untracked}

    def limpo(self):
        s = self.status()
        return not (s["staged"] or s["modificados"] or s["novos"])

    @property
    def staged(self):
        return self.status()["staged"]

    @property
    def remotos(self):
        return dict(self.repo.s["remotes"])

    @property
    def tags(self):
        return sorted(self.repo.s["tags"])

    @property
    def upstream(self):
        return self.repo.s["upstream"].get(self.repo.s["head"])

    @property
    def em_merge(self):
        return self.repo.s["merge"] is not None

    @property
    def conflitos(self):
        return list(self.repo.s["merge"]["conflitos"]) if self.repo.s["merge"] else []

    @property
    def stash(self):
        return [s["msg"] for s in self.repo.s["stash"]]

    def eh_merge(self, ref="HEAD"):
        return len(self.repo.commit(self.repo.resolver(ref))["parents"]) > 1

    def config(self, chave):
        return self.repo.s["config"].get(chave)


class GitHubTeste:
    def __init__(self, nome):
        self.url = url_de(nome)
        if self.url not in GITHUB:
            raise AssertionError("o repositório %s não existe no GitHub simulado" % self.url)
        self.r = GITHUB[self.url]

    @property
    def branches(self):
        return sorted(self.r["branches"])

    def mensagens(self, branch=None):
        branch = branch or self.r["padrao"]
        cid = self.r["branches"].get(branch)
        if cid is None:
            return []
        vistos, pilha, todos = set(), [cid], []
        while pilha:
            c = pilha.pop()
            if c in vistos:
                continue
            vistos.add(c)
            todos.append(c)
            pilha.extend(self.r["commits"][c]["parents"])
        todos.sort(key=lambda c: -self.r["commits"][c]["n"])
        return [self.r["commits"][c]["msg"].splitlines()[0] for c in todos]

    def arquivos(self, branch=None):
        branch = branch or self.r["padrao"]
        cid = self.r["branches"].get(branch)
        if cid is None:
            return {}
        return {p: self.r["blobs"][k] for p, k in self.r["commits"][cid]["tree"].items()}

    @property
    def prs(self):
        return self.r["prs"]

    @property
    def issues(self):
        return self.r["issues"]

    @property
    def tags(self):
        return sorted(self.r["tags"])
