"""
minishell: um terminal (bash) simulado para o Level Code.

Roda no navegador (Pyodide) e também no Python comum, para testes.
Tudo acontece numa pasta temporária que faz o papel da raiz "/", com a
casa do usuário em /home/analista. O Git e o GitHub simulados ficam em
minigit.py, que é anexado a este arquivo pelo app.

Ponto de entrada: executar_sessao(codigo, setup, arquivos) -> Sessao.
"""
import os
import re
import io
import json
import fnmatch
import posixpath
import shutil
import tarfile
import zipfile
import datetime

USUARIO = "analista"
MAQUINA = "level"
CASA = "/home/" + USUARIO
AGORA = datetime.datetime(2024, 6, 3, 10, 0, 0)
DATA_LS = "jun  3 10:00"

PROCESSOS_BASE = [
    # pid, usuario, cpu, mem, comando
    (1, "root", 0.0, 0.3, "/sbin/init"),
    (412, "root", 0.0, 0.2, "/usr/sbin/sshd -D"),
    (688, "root", 0.1, 0.4, "/usr/sbin/cron -f"),
    (1021, USUARIO, 0.0, 0.5, "-bash"),
    (1187, USUARIO, 97.3, 12.4, "python3 relatorio_lento.py"),
    (1190, USUARIO, 0.2, 1.1, "postgres: analista vendas"),
]

AJUDA = {
    "ls": "ls — lista arquivos e pastas. Opções: -l (detalhes), -a (inclui ocultos), -h (tamanhos legíveis), -R (recursivo).",
    "cd": "cd — muda de pasta. cd .. sobe um nível, cd ~ (ou só cd) volta para casa, cd - volta para a anterior.",
    "pwd": "pwd — mostra a pasta atual.",
    "cat": "cat — mostra o conteúdo de arquivos. -n numera as linhas.",
    "grep": "grep — busca linhas que combinam com um padrão. -i ignora maiúsculas, -n mostra o número da linha, -v inverte, -c conta, -r busca em pastas.",
    "chmod": "chmod — muda permissões. Ex.: chmod u+x script.sh, chmod 644 arquivo.",
    "git": "git — controle de versão. Ex.: git status, git add, git commit -m, git log.",
}

COMANDOS_PATH = {
    "ls", "cat", "grep", "find", "sort", "uniq", "cut", "head", "tail", "wc", "echo", "mkdir", "rmdir",
    "rm", "cp", "mv", "touch", "chmod", "tar", "zip", "unzip", "du", "df", "ps", "kill", "sed", "awk",
    "tr", "date", "whoami", "hostname", "tree", "git", "gh", "bash", "sh", "printf", "seq", "basename",
    "dirname", "env", "sleep", "top", "pkill", "less", "more", "man", "which", "file", "stat", "diff",
}


class ErroShell(Exception):
    pass


class Sair(Exception):
    def __init__(self, codigo):
        self.codigo = codigo
        self.out = ""
        self.err = ""

    def antes(self, out, err):
        """Acrescenta a saída produzida antes do exit."""
        self.out = out + self.out
        self.err = err + self.err
        return self


# ---------------------------------------------------------------------------
# Análise léxica e sintática
# ---------------------------------------------------------------------------

OPERADORES = ["&&", "||", ">>", "2>>", "2>&1", "2>", "<<", ">", "<", "|", ";", "&", "\n"]
PALAVRAS_CHAVE = {"for", "in", "do", "done", "if", "then", "elif", "else", "fi", "while"}


class Palavra:
    """Uma palavra do shell, com pedaços marcados pelo tipo de aspas."""

    def __init__(self):
        self.partes = []  # (texto, tipo) tipo: 'n' sem aspas, 's' simples, 'd' duplas
        self.ini = 0
        self.fim = 0

    def literal(self):
        return "".join(t for t, _ in self.partes)

    def sem_aspas(self):
        return all(tp == "n" for _, tp in self.partes)

    def __repr__(self):
        return "Palavra(%r)" % self.literal()


class Op:
    def __init__(self, op, ini, fim):
        self.op = op
        self.ini = ini
        self.fim = fim

    def __repr__(self):
        return "Op(%r)" % self.op


def _ler_subst(src, i):
    """Lê $( ... ) ou $(( ... )) a partir de src[i] == '$'. Devolve (texto, novo_i)."""
    profundidade = 0
    j = i + 1
    aspa = None
    while j < len(src):
        c = src[j]
        if aspa:
            if c == aspa:
                aspa = None
        elif c in "'\"":
            aspa = c
        elif c == "(":
            profundidade += 1
        elif c == ")":
            profundidade -= 1
            if profundidade == 0:
                return src[i:j + 1], j + 1
        j += 1
    raise ErroShell("syntax error: parêntese de $( sem fechamento")


def tokenizar(src):
    tokens = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c in " \t":
            i += 1
            continue
        if c == "\\" and i + 1 < n and src[i + 1] == "\n":
            i += 2
            continue
        if c == "#":
            while i < n and src[i] != "\n":
                i += 1
            continue
        achou = None
        for op in OPERADORES:
            if src.startswith(op, i):
                achou = op
                break
        if achou:
            # "2>" só é operador se começar uma palavra
            tokens.append(Op(achou, i, i + len(achou)))
            i += len(achou)
            continue
        p = Palavra()
        p.ini = i
        while i < n:
            c = src[i]
            if c in " \t\n;|&<>":
                break
            if c == "'":
                j = src.find("'", i + 1)
                if j < 0:
                    raise ErroShell("unexpected EOF while looking for matching `''")
                p.partes.append((src[i + 1:j], "s"))
                i = j + 1
            elif c == '"':
                j = i + 1
                buf = ""
                while j < n and src[j] != '"':
                    if src[j] == "\\" and j + 1 < n and src[j + 1] in '"\\$':
                        buf += src[j + 1]
                        j += 2
                        continue
                    if src[j] == "$" and j + 1 < n and src[j + 1] == "(":
                        txt, j = _ler_subst(src, j)
                        buf += txt
                        continue
                    buf += src[j]
                    j += 1
                if j >= n:
                    raise ErroShell('unexpected EOF while looking for matching `"\'')
                p.partes.append((buf, "d"))
                i = j + 1
            elif c == "\\" and i + 1 < n:
                p.partes.append((src[i + 1], "s"))
                i += 2
            elif c == "$" and i + 1 < n and src[i + 1] == "(":
                txt, i = _ler_subst(src, i)
                p.partes.append((txt, "n"))
            else:
                j = i
                while j < n and src[j] not in " \t\n;|&<>'\"\\" and not (src[j] == "$" and j + 1 < n and src[j + 1] == "("):
                    j += 1
                if j == i:
                    j = i + 1
                p.partes.append((src[i:j], "n"))
                i = j
        p.fim = i
        tokens.append(p)
    return tokens


class Simples:
    def __init__(self):
        self.palavras = []
        self.redirs = []  # (op, Palavra)
        self.atribuicoes = []


class Pipeline:
    def __init__(self, cmds, fundo=False):
        self.cmds = cmds
        self.fundo = fundo


class EOu:
    def __init__(self):
        self.itens = []  # (op_anterior, pipeline)
        self.ini = 0
        self.fim = 0


class Para:
    def __init__(self, var, palavras, corpo):
        self.var = var
        self.palavras = palavras
        self.corpo = corpo


class Se:
    def __init__(self, ramos, senao):
        self.ramos = ramos  # [(cond_lista, corpo_lista)]
        self.senao = senao


class Enquanto:
    def __init__(self, cond, corpo):
        self.cond = cond
        self.corpo = corpo


class Analisador:
    def __init__(self, tokens):
        self.t = tokens
        self.i = 0

    def atual(self):
        return self.t[self.i] if self.i < len(self.t) else None

    def eh_op(self, *ops):
        a = self.atual()
        return isinstance(a, Op) and a.op in ops

    def eh_chave(self, *ks):
        a = self.atual()
        return isinstance(a, Palavra) and a.sem_aspas() and a.literal() in ks

    def pular_separadores(self):
        while self.eh_op(";", "\n"):
            self.i += 1

    def lista(self, ate=()):
        itens = []
        self.pular_separadores()
        while self.atual() is not None and not self.eh_chave(*ate):
            if self.eh_op(")"):
                break
            eo = self.e_ou()
            itens.append(eo)
            if self.eh_op("&"):
                eo.itens[-1][1].fundo = True
                eo.fim = self.atual().fim
                self.i += 1
            self.pular_separadores()
        return itens

    def e_ou(self):
        eo = EOu()
        ini_tok = self.atual()
        eo.ini = ini_tok.ini if ini_tok is not None else 0
        eo.itens.append((None, self.pipeline()))
        while self.eh_op("&&", "||"):
            op = self.atual().op
            self.i += 1
            self.pular_separadores()
            eo.itens.append((op, self.pipeline()))
        anterior = self.t[self.i - 1] if self.i > 0 else None
        eo.fim = anterior.fim if anterior is not None else eo.ini
        return eo

    def pipeline(self):
        cmds = [self.comando()]
        while self.eh_op("|"):
            self.i += 1
            self.pular_separadores()
            cmds.append(self.comando())
        return Pipeline(cmds)

    def esperar(self, chave):
        self.pular_separadores()
        if not self.eh_chave(chave):
            a = self.atual()
            raise ErroShell("syntax error near unexpected token `%s'" % (a.literal() if isinstance(a, Palavra) else (a.op if a else "fim do arquivo")))
        self.i += 1

    def comando(self):
        if self.eh_chave("for"):
            self.i += 1
            var = self.atual().literal()
            self.i += 1
            palavras = []
            if self.eh_chave("in"):
                self.i += 1
                while isinstance(self.atual(), Palavra) and not self.eh_chave("do"):
                    palavras.append(self.atual())
                    self.i += 1
            self.esperar("do")
            corpo = self.lista(ate=("done",))
            self.esperar("done")
            return Para(var, palavras, corpo)
        if self.eh_chave("if"):
            self.i += 1
            ramos = []
            cond = self.lista(ate=("then",))
            self.esperar("then")
            corpo = self.lista(ate=("elif", "else", "fi"))
            ramos.append((cond, corpo))
            senao = None
            while True:
                self.pular_separadores()
                if self.eh_chave("elif"):
                    self.i += 1
                    cond = self.lista(ate=("then",))
                    self.esperar("then")
                    corpo = self.lista(ate=("elif", "else", "fi"))
                    ramos.append((cond, corpo))
                elif self.eh_chave("else"):
                    self.i += 1
                    senao = self.lista(ate=("fi",))
                else:
                    break
            self.esperar("fi")
            return Se(ramos, senao)
        if self.eh_chave("while"):
            self.i += 1
            cond = self.lista(ate=("do",))
            self.esperar("do")
            corpo = self.lista(ate=("done",))
            self.esperar("done")
            return Enquanto(cond, corpo)
        s = Simples()
        while True:
            a = self.atual()
            if isinstance(a, Palavra):
                if not s.palavras and a.sem_aspas() and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", a.literal()):
                    s.atribuicoes.append(a)
                elif not s.palavras and not s.atribuicoes and a.sem_aspas() and a.literal() in ("then", "do", "done", "fi", "else", "elif"):
                    raise ErroShell("syntax error near unexpected token `%s'" % a.literal())
                else:
                    s.palavras.append(a)
                self.i += 1
            elif isinstance(a, Op) and a.op in (">", ">>", "<", "<<", "2>", "2>>", "2>&1"):
                self.i += 1
                if a.op == "2>&1":
                    s.redirs.append((a.op, None))
                    continue
                alvo = self.atual()
                if not isinstance(alvo, Palavra):
                    raise ErroShell("syntax error near unexpected token `newline'")
                s.redirs.append((a.op, alvo))
                self.i += 1
            else:
                break
        if not s.palavras and not s.atribuicoes and not s.redirs:
            a = self.atual()
            raise ErroShell("syntax error near unexpected token `%s'" % (a.op if isinstance(a, Op) else "newline"))
        return s


_RX_HEREDOC = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][A-Za-z0-9_]*)\1")


def separar_heredocs(src):
    """Troca cada "<< FIM" por um marcador e guarda o corpo. Devolve (src, {marcador: (corpo, expandir, delim)})."""
    linhas_src = src.split("\n")
    saida = []
    docs = {}
    i = 0
    while i < len(linhas_src):
        linha = linhas_src[i]
        pendentes = []

        def troca(m):
            nome = "__HEREDOC_%d__" % (len(docs) + len(pendentes))
            pendentes.append((nome, m.group(2), m.group(1) == "", m.group(0).startswith("<<-")))
            return "<< " + nome
        linha = _RX_HEREDOC.sub(troca, linha)
        saida.append(linha)
        i += 1
        for nome, delim, expandir, tirar_tab in pendentes:
            corpo = []
            while i < len(linhas_src) and (linhas_src[i].lstrip("\t") if tirar_tab else linhas_src[i]).strip() != delim:
                corpo.append(linhas_src[i].lstrip("\t") if tirar_tab else linhas_src[i])
                i += 1
            i += 1  # pula a linha do delimitador
            docs[nome] = ("\n".join(corpo) + ("\n" if corpo else ""), expandir, delim)
    return "\n".join(saida), docs


def analisar(src):
    an = Analisador(tokenizar(src))
    lst = an.lista()
    if an.atual() is not None:
        a = an.atual()
        raise ErroShell("syntax error near unexpected token `%s'" % (a.literal() if isinstance(a, Palavra) else a.op))
    return lst


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def separar_opcoes(args, com_valor=()):
    """-la, -n 5, -n5, --nome, --nome=valor. Devolve (opcoes, posicionais)."""
    opcoes = {}
    pos = []
    i = 0
    fim_opcoes = False
    while i < len(args):
        a = args[i]
        if not fim_opcoes and "NUM" in com_valor and re.match(r"^-\d+$", a):
            opcoes["NUM"] = a[1:]
            i += 1
            continue
        if fim_opcoes or a == "-" or not a.startswith("-") or re.match(r"^-\d+(\.\d+)?$", a):
            pos.append(a)
            i += 1
            continue
        if a == "--":
            fim_opcoes = True
            i += 1
            continue
        if a.startswith("--"):
            if "=" in a:
                k, v = a[2:].split("=", 1)
                opcoes[k] = v
            elif a[2:] in com_valor and i + 1 < len(args):
                opcoes[a[2:]] = args[i + 1]
                i += 1
            else:
                opcoes[a[2:]] = True
            i += 1
            continue
        letras = a[1:]
        j = 0
        while j < len(letras):
            l = letras[j]
            if l in com_valor:
                resto = letras[j + 1:]
                if resto:
                    opcoes[l] = resto
                elif i + 1 < len(args):
                    opcoes[l] = args[i + 1]
                    i += 1
                else:
                    opcoes[l] = ""
                break
            opcoes[l] = True
            j += 1
        i += 1
    return opcoes, pos


def modo_texto(modo, eh_dir):
    s = "d" if eh_dir else "-"
    for k in (6, 3, 0):
        b = (modo >> k) & 7
        s += ("r" if b & 4 else "-") + ("w" if b & 2 else "-") + ("x" if b & 1 else "-")
    return s


def tamanho_humano(n):
    for unidade in ("", "K", "M", "G"):
        if n < 1024 or unidade == "G":
            if unidade == "":
                return str(n)
            return ("%.1f" % n).rstrip("0").rstrip(".") + unidade
        n /= 1024.0
    return str(n)


def faixa_campos(spec):
    campos = []
    for parte in spec.split(","):
        if "-" in parte:
            a, b = parte.split("-", 1)
            a = int(a) if a else 1
            b = int(b) if b else 9999
            campos.extend(range(a, b + 1))
        elif parte:
            campos.append(int(parte))
    return campos


# ---------------------------------------------------------------------------
# O shell
# ---------------------------------------------------------------------------

class Shell:
    def __init__(self, raiz, pai=None):
        self.raiz = raiz  # pasta real que faz o papel de "/"
        if pai is None:
            self.vars = {"HOME": CASA, "USER": USUARIO, "SHELL": "/bin/bash", "PATH": "/usr/local/bin:/usr/bin:/bin",
                         "LANG": "pt_BR.UTF-8", "PWD": CASA}
            self.exportadas = {"HOME", "USER", "SHELL", "PATH", "LANG", "PWD"}
            self.cwd = CASA
            self.anterior = CASA
            self.processos = [list(p) for p in PROCESSOS_BASE]
            self.prox_pid = 2001
        else:
            self.vars = {k: v for k, v in pai.vars.items() if k in pai.exportadas}
            self.exportadas = set(pai.exportadas)
            self.cwd = pai.cwd
            self.anterior = pai.anterior
            self.processos = pai.processos
            self.prox_pid = pai.prox_pid
        self.modos = pai.modos if pai is not None else {}
        self.heredocs = pai.heredocs if pai is not None else {}
        self.tela = True        # a saída do comando atual vai para a tela?
        self.capturando = 0     # dentro de $( ... )
        self.posicionais = []
        self.ultimo_codigo = 0
        self.transcricao = []
        self.git = None  # definido por minigit

    # ---------- permissões (guardadas pelo simulador) ----------
    def _chave(self, r):
        return os.path.normcase(os.path.abspath(r))

    def modo(self, r):
        return self.modos.get(self._chave(r), 0o755 if os.path.isdir(r) else 0o644)

    def definir_modo(self, r, m):
        self.modos[self._chave(r)] = m

    def mover_modos(self, ro, rd):
        a, b = self._chave(ro), self._chave(rd)
        for k in list(self.modos):
            if k == a or k.startswith(a + os.sep):
                self.modos[b + k[len(a):]] = self.modos.pop(k)

    def apagar_modos(self, r):
        a = self._chave(r)
        for k in list(self.modos):
            if k == a or k.startswith(a + os.sep):
                del self.modos[k]

    # ---------- caminhos ----------
    def vcaminho(self, p):
        if p is None or p == "":
            return self.cwd
        if p == "~" or p.startswith("~/"):
            p = CASA + p[1:]
        if not p.startswith("/"):
            p = posixpath.join(self.cwd, p)
        p = posixpath.normpath(p)
        if p.startswith("//"):
            p = p[1:]
        return p

    def real(self, p):
        v = self.vcaminho(p)
        return os.path.join(self.raiz, v.lstrip("/"))

    def virtual_de_real(self, real):
        rel = os.path.relpath(real, self.raiz).replace(os.sep, "/")
        return "/" if rel == "." else "/" + rel

    def mostrar_caminho(self, v):
        if v == CASA:
            return "~"
        if v.startswith(CASA + "/"):
            return "~" + v[len(CASA):]
        return v

    def ler(self, p):
        r = self.real(p)
        if os.path.isdir(r):
            raise ErroShell("%s: Is a directory" % p)
        if not os.path.exists(r):
            raise ErroShell("%s: No such file or directory" % p)
        with open(r, "rb") as f:
            return f.read().decode("utf-8", errors="replace")

    def escrever(self, p, texto, acrescentar=False):
        r = self.real(p)
        pasta = os.path.dirname(r)
        if not os.path.isdir(pasta):
            raise ErroShell("%s: No such file or directory" % p)
        if os.path.isdir(r):
            raise ErroShell("%s: Is a directory" % p)
        with open(r, "a" if acrescentar else "w", encoding="utf-8", newline="") as f:
            f.write(texto)

    # ---------- expansão ----------
    def expandir_vars(self, texto, tipo):
        if tipo == "s":
            return texto
        saida = ""
        i = 0
        while i < len(texto):
            c = texto[i]
            if c == "$" and i + 1 < len(texto):
                if texto.startswith("$((", i):
                    fim = texto.find("))", i)
                    expr = texto[i + 3:fim]
                    saida += str(self.aritmetica(expr))
                    i = fim + 2
                    continue
                if texto[i + 1] == "(":
                    profundidade = 0
                    j = i + 1
                    while j < len(texto):
                        if texto[j] == "(":
                            profundidade += 1
                        elif texto[j] == ")":
                            profundidade -= 1
                            if profundidade == 0:
                                break
                        j += 1
                    sub = texto[i + 2:j]
                    self.capturando += 1
                    try:
                        out, _err, _c = self.executar_texto(sub, capturar=True)
                    finally:
                        self.capturando -= 1
                    saida += out.rstrip("\n")
                    i = j + 1
                    continue
                if texto[i + 1] == "{":
                    j = texto.find("}", i)
                    nome = texto[i + 2:j]
                    saida += self.valor_var(nome)
                    i = j + 1
                    continue
                m = re.match(r"[A-Za-z_][A-Za-z0-9_]*|[0-9#?@*$]", texto[i + 1:])
                if m:
                    saida += self.valor_var(m.group(0))
                    i += 1 + len(m.group(0))
                    continue
            saida += c
            i += 1
        return saida

    def valor_var(self, nome):
        if nome == "?":
            return str(self.ultimo_codigo)
        if nome == "#":
            return str(len(self.posicionais))
        if nome in ("@", "*"):
            return " ".join(self.posicionais)
        if nome == "$":
            return "1021"
        if nome.isdigit():
            k = int(nome)
            if k == 0:
                return "bash"
            return self.posicionais[k - 1] if k - 1 < len(self.posicionais) else ""
        if nome == "PWD":
            return self.cwd
        if nome == "RANDOM":
            return "4242"
        return self.vars.get(nome, "")

    def aritmetica(self, expr):
        expr = self.expandir_vars(expr, "d")
        expr = re.sub(r"[A-Za-z_][A-Za-z0-9_]*", lambda m: self.vars.get(m.group(0), "0") or "0", expr)
        if not re.match(r"^[\d\s+\-*/%()<>=!]+$", expr):
            raise ErroShell("erro de sintaxe na expressão aritmética: %s" % expr)
        expr = expr.replace("/", "//")
        try:
            return int(eval(expr, {"__builtins__": {}}))
        except Exception:
            raise ErroShell("erro na expressão aritmética: %s" % expr)

    def expandir_palavra(self, palavra, glob=True):
        texto = ""
        tem_glob = False
        divisivel = False
        for t, tp in palavra.partes:
            if tp == "n":
                if "$" in t:
                    divisivel = True
                if re.search(r"[*?\[]", t):
                    tem_glob = True
            texto += self.expandir_vars(t, tp)
        if palavra.partes and palavra.partes[0][1] == "n" and (texto == "~" or texto.startswith("~/")):
            texto = CASA + texto[1:]
        if tem_glob and glob:
            achados = self.glob(texto)
            if achados:
                return achados
        if divisivel and all(tp == "n" for _, tp in palavra.partes):
            return texto.split()
        return [texto]

    def glob(self, padrao):
        absoluto = padrao.startswith("/")
        partes = [p for p in padrao.split("/") if p != ""]
        bases = ["/"] if absoluto else [""]
        for k, parte in enumerate(partes):
            novos = []
            for b in bases:
                pasta_v = self.vcaminho(b if b else ".")
                pasta_r = self.real(pasta_v)
                if re.search(r"[*?\[]", parte):
                    if not os.path.isdir(pasta_r):
                        continue
                    for nome in sorted(os.listdir(pasta_r), key=str.lower):
                        if nome.startswith(".") and not parte.startswith("."):
                            continue
                        if fnmatch.fnmatchcase(nome, parte):
                            novos.append(posixpath.join(b, nome) if b else nome)
                else:
                    cand = posixpath.join(b, parte) if b else parte
                    if os.path.exists(self.real(cand)) or k < len(partes) - 1:
                        novos.append(cand)
            bases = novos
        return [b for b in bases if os.path.exists(self.real(b))]

    # ---------- execução ----------
    def executar_texto(self, src, capturar=False, registrar=False):
        """Executa um texto. Com registrar=True, guarda a transcrição por comando."""
        src, docs = separar_heredocs(src)
        self.heredocs.update(docs)
        try:
            arvore = analisar(src)
        except ErroShell as e:
            msg = "bash: " + str(e) + "\n"
            if registrar:
                self.transcricao.append({"cwd": self.mostrar_caminho(self.cwd), "cmd": src.strip(), "out": "", "err": msg})
            self.ultimo_codigo = 2
            return "", msg, 2
        out_total, err_total = "", ""
        for eo in arvore:
            cwd_antes = self.mostrar_caminho(self.cwd)
            try:
                out, err, codigo = self.executar_e_ou(eo, "")
            except Sair as s:
                self.ultimo_codigo = s.codigo
                if registrar:
                    self.transcricao.append({"cwd": cwd_antes, "cmd": src[eo.ini:eo.fim].strip(), "out": s.out, "err": s.err})
                    s.out = s.err = ""
                raise s.antes(out_total, err_total)
            out_total += out
            err_total += err
            if registrar:
                txt = src[eo.ini:eo.fim].strip()
                for nome, (corpo, _exp, delim) in docs.items():
                    if nome in txt:
                        txt = txt.replace(nome, delim) + "\n" + corpo + delim
                self.transcricao.append({"cwd": cwd_antes, "cmd": txt, "out": out, "err": err, "codigo": codigo})
        return out_total, err_total, self.ultimo_codigo

    def executar_lista(self, lista, entrada=""):
        out, err = "", ""
        for eo in lista:
            try:
                o, e, _c = self.executar_e_ou(eo, entrada)
            except Sair as s:
                raise s.antes(out, err)
            out += o
            err += e
        return out, err, self.ultimo_codigo

    def executar_e_ou(self, eo, entrada):
        out, err = "", ""
        codigo = 0
        for op, pl in eo.itens:
            if op == "&&" and codigo != 0:
                continue
            if op == "||" and codigo == 0:
                continue
            try:
                o, e, codigo = self.executar_pipeline(pl, entrada)
            except Sair as s:
                raise s.antes(out, err)
            out += o
            err += e
            self.ultimo_codigo = codigo
        return out, err, codigo

    def executar_pipeline(self, pl, entrada):
        if pl.fundo:
            pid = self.prox_pid
            self.prox_pid += 1
            nome = " ".join(p.literal() for p in pl.cmds[0].palavras) if isinstance(pl.cmds[0], Simples) else "bash"
            self.processos.append([pid, USUARIO, 0.0, 0.1, nome])
            return "[1] %d\n" % pid, "", 0
        dados = entrada
        err_total = ""
        codigo = 0
        tela_antes = self.tela
        for k, cmd in enumerate(pl.cmds):
            ultimo = k == len(pl.cmds) - 1
            self.tela = tela_antes and ultimo and not self.capturando
            out, err, codigo = self.executar_comando(cmd, dados)
            err_total += err
            dados = out
        self.tela = tela_antes
        return dados, err_total, codigo

    def executar_comando(self, cmd, entrada):
        if isinstance(cmd, Para):
            out, err = "", ""
            valores = []
            for p in cmd.palavras:
                valores.extend(self.expandir_palavra(p))
            codigo = 0
            for v in valores:
                self.vars[cmd.var] = v
                try:
                    o, e, codigo = self.executar_lista(cmd.corpo, entrada)
                except Sair as s:
                    raise s.antes(out, err)
                out += o
                err += e
            return out, err, codigo
        if isinstance(cmd, Se):
            out, err = "", ""
            try:
                for cond, corpo in cmd.ramos:
                    o, e, c = self.executar_lista(cond, entrada)
                    out += o
                    err += e
                    if c == 0:
                        o, e, c = self.executar_lista(corpo, entrada)
                        return out + o, err + e, c
                if cmd.senao is not None:
                    o, e, c = self.executar_lista(cmd.senao, entrada)
                    return out + o, err + e, c
            except Sair as s:
                raise s.antes(out, err)
            return out, err, 0
        if isinstance(cmd, Enquanto):
            out, err = "", ""
            voltas = 0
            codigo = 0
            while True:
                o, e, c = self.executar_lista(cmd.cond, entrada)
                out += o
                err += e
                if c != 0:
                    break
                voltas += 1
                if voltas > 1000:
                    err += "bash: laço interrompido depois de 1000 voltas\n"
                    break
                o, e, codigo = self.executar_lista(cmd.corpo, entrada)
                out += o
                err += e
            return out, err, codigo
        return self.executar_simples(cmd, entrada)

    def executar_simples(self, cmd, entrada):
        try:
            for a in cmd.atribuicoes:
                txt = a.literal()
                nome = txt.split("=", 1)[0]
                valor_partes = Palavra()
                primeira = True
                for t, tp in a.partes:
                    if primeira:
                        t = t.split("=", 1)[1]
                        primeira = False
                    valor_partes.partes.append((t, tp))
                valor = "".join(self.expandir_vars(t, tp) for t, tp in valor_partes.partes)
                if valor_partes.partes and valor_partes.partes[0][1] == "n" and (valor == "~" or valor.startswith("~/")):
                    valor = CASA + valor[1:]
                if not cmd.palavras:
                    self.vars[nome] = valor
            args = []
            for p in cmd.palavras:
                args.extend(self.expandir_palavra(p))
            # redirecionamentos de entrada
            for op, alvo in cmd.redirs:
                if op == "<":
                    entrada = self.ler(self.expandir_palavra(alvo, glob=False)[0])
                elif op == "<<":
                    corpo, expandir, _d = self.heredocs.get(alvo.literal(), ("", False, ""))
                    entrada = self.expandir_vars(corpo, "d") if expandir else corpo
            tela_antes = self.tela
            if any(op in (">", ">>") for op, _ in cmd.redirs):
                self.tela = False
            # como no bash, ">" esvazia o arquivo antes de o comando rodar
            for op, alvo in cmd.redirs:
                if op in (">", "2>"):
                    destino = self.expandir_palavra(alvo, glob=False)[0]
                    if destino != "/dev/null" and os.path.isfile(self.real(destino)):
                        self.escrever(destino, "")
            if not args:
                self.tela = tela_antes
                return "", "", 0
            try:
                out, err, codigo = self.chamar(args, entrada)
            finally:
                self.tela = tela_antes
        except ErroShell as e:
            nome = cmd.palavras[0].literal() if cmd.palavras else "bash"
            out, err, codigo = "", "%s: %s\n" % (nome, e), 1
        # redirecionamentos de saída
        juntar_err = any(op == "2>&1" for op, _ in cmd.redirs)
        if juntar_err:
            out, err = out + err, ""
        for op, alvo in cmd.redirs:
            if op in (">", ">>", "2>", "2>>"):
                destino = self.expandir_palavra(alvo, glob=False)[0]
                conteudo = err if op.startswith("2") else out
                if destino == "/dev/null":
                    pass
                else:
                    try:
                        self.escrever(destino, conteudo, acrescentar=op.endswith(">>"))
                    except ErroShell as e:
                        err += "bash: %s\n" % e
                        codigo = 1
                if op.startswith("2"):
                    err = ""
                else:
                    out = ""
        self.ultimo_codigo = codigo
        return out, err, codigo

    def chamar(self, args, entrada):
        nome = args[0]
        if nome in ("bash", "sh", "source", ".") or nome.startswith("./") or (nome.startswith("/") and nome.endswith(".sh")):
            return self.rodar_script(args, entrada)
        metodo = getattr(self, "c_" + nome.replace("-", "_").replace("[", "teste"), None)
        if nome == "[":
            metodo = self.c_teste
        if metodo is None:
            return "", "%s: command not found\n" % nome, 127
        return metodo(args[1:], entrada)

    def rodar_script(self, args, entrada):
        nome = args[0]
        if nome in ("bash", "sh", "source", "."):
            if len(args) < 2:
                return "", "", 0
            caminho, resto = args[1], args[2:]
        else:
            caminho, resto = nome, args[1:]
            r = self.real(caminho)
            if not os.path.exists(r):
                return "", "bash: %s: No such file or directory\n" % caminho, 127
            if not (self.modo(r) & 0o100):
                return "", "bash: %s: Permission denied\n" % caminho, 126
        try:
            texto = self.ler(caminho)
        except ErroShell as e:
            return "", "bash: %s\n" % e, 127
        if nome in ("source", "."):
            sub = self
            guard = self.posicionais
            sub.posicionais = resto
        else:
            sub = Shell(self.raiz, pai=self)
            sub.git = self.git
            sub.posicionais = resto
        try:
            out, err, codigo = sub.executar_texto(texto)
        except Sair as s:
            out, err, codigo = s.out, s.err, s.codigo
        if sub is not self:
            self.prox_pid = sub.prox_pid
        return out, err, codigo

    # ---------- comandos: navegação ----------
    def c_pwd(self, a, e):
        return self.cwd + "\n", "", 0

    def c_cd(self, a, e):
        if not a:
            destino = CASA
        elif a[0] == "-":
            destino = self.anterior
        else:
            destino = self.vcaminho(a[0])
        r = self.real(destino)
        if not os.path.exists(r):
            return "", "bash: cd: %s: No such file or directory\n" % (a[0] if a else destino), 1
        if not os.path.isdir(r):
            return "", "bash: cd: %s: Not a directory\n" % a[0], 1
        self.anterior = self.cwd
        self.cwd = destino
        self.vars["PWD"] = destino
        return (destino + "\n" if a and a[0] == "-" else ""), "", 0

    def c_ls(self, a, e):
        op, pos = separar_opcoes(a)
        longo = op.get("l")
        todos = op.get("a")
        quase = op.get("A")
        humano = op.get("h")
        recursivo = op.get("R")
        alvos = pos or ["."]
        saidas = []
        erros = ""
        arquivos_soltos = [p for p in alvos if os.path.isfile(self.real(p))]
        pastas = [p for p in alvos if os.path.isdir(self.real(p))]
        for p in alvos:
            if not os.path.exists(self.real(p)):
                erros += "ls: cannot access '%s': No such file or directory\n" % p

        def entrada_longa(r, nome):
            eh_dir = os.path.isdir(r)
            tam = 4096 if eh_dir else os.path.getsize(r)
            return (modo_texto(self.modo(r), eh_dir), 2 if eh_dir else 1, tam, nome)

        def formatar(itens, base_real):
            if longo:
                linhas = []
                dados = [entrada_longa(os.path.join(base_real, n) if base_real else self.real(n), n) for n in itens]
                largura = max([len(tamanho_humano(d[2]) if humano else str(d[2])) for d in dados] + [1])
                for modo, links, tam, nome in dados:
                    t = tamanho_humano(tam) if humano else str(tam)
                    linhas.append("%s %d %s %s %s %s %s" % (modo, links, USUARIO, USUARIO, t.rjust(largura), DATA_LS, nome))
                return linhas
            if not itens:
                return []
            return ["  ".join(itens)] if (self.tela and not op.get("1")) else list(itens)

        def listar(pv):
            r = self.real(pv)
            nomes = sorted(os.listdir(r), key=lambda s: s.lower().lstrip("."))
            if not todos and not quase:
                nomes = [n for n in nomes if not n.startswith(".")]
            elif quase and not todos:
                pass
            if todos:
                nomes = [".", ".."] + nomes
            return nomes, r

        blocos = []
        if arquivos_soltos:
            blocos.append((None, formatar(arquivos_soltos, None)))
        fila = list(pastas)
        while fila:
            pv = fila.pop(0)
            nomes, r = listar(pv)
            linhas = []
            if longo:
                total = sum(-(-os.path.getsize(os.path.join(r, n)) // 4096) * 4 for n in nomes if os.path.isfile(os.path.join(r, n)))
                total += 4 * sum(1 for n in nomes if os.path.isdir(os.path.join(r, n)))
                linhas.append("total %d" % total)
            linhas += formatar(nomes, r)
            blocos.append((pv, linhas))
            if recursivo:
                subs = [posixpath.join(pv, n) for n in nomes if n not in (".", "..") and os.path.isdir(os.path.join(r, n))]
                fila = subs + fila
        varias = len(blocos) > 1 or recursivo
        texto = []
        for k, (titulo, linhas) in enumerate(blocos):
            if varias and titulo is not None:
                if texto:
                    texto.append("")
                texto.append(titulo + ":")
            texto += linhas
        saida = "\n".join(texto)
        return (saida + "\n" if saida else ""), erros, 1 if erros else 0

    def c_tree(self, a, e):
        op, pos = separar_opcoes(a)
        raiz_v = pos[0] if pos else "."
        r = self.real(raiz_v)
        if not os.path.isdir(r):
            return "", "%s [error opening dir]\n" % raiz_v, 2
        linhas = [raiz_v]
        cont = {"d": 0, "f": 0}

        def andar(real, prefixo):
            nomes = sorted([n for n in os.listdir(real) if op.get("a") or not n.startswith(".")], key=str.lower)
            for k, n in enumerate(nomes):
                ultimo = k == len(nomes) - 1
                linhas.append(prefixo + ("└── " if ultimo else "├── ") + n)
                cr = os.path.join(real, n)
                if os.path.isdir(cr):
                    cont["d"] += 1
                    andar(cr, prefixo + ("    " if ultimo else "│   "))
                else:
                    cont["f"] += 1
        andar(r, "")
        linhas.append("")
        linhas.append("%d director%s, %d file%s" % (cont["d"], "y" if cont["d"] == 1 else "ies", cont["f"], "" if cont["f"] == 1 else "s"))
        return "\n".join(linhas) + "\n", "", 0

    # ---------- comandos: arquivos ----------
    def c_mkdir(self, a, e):
        op, pos = separar_opcoes(a)
        err = ""
        for p in pos:
            r = self.real(p)
            if os.path.exists(r):
                if not op.get("p"):
                    err += "mkdir: cannot create directory '%s': File exists\n" % p
                continue
            if op.get("p"):
                os.makedirs(r)
            else:
                if not os.path.isdir(os.path.dirname(r)):
                    err += "mkdir: cannot create directory '%s': No such file or directory\n" % p
                    continue
                os.mkdir(r)
        return "", err, 1 if err else 0

    def c_rmdir(self, a, e):
        err = ""
        for p in a:
            r = self.real(p)
            if not os.path.isdir(r):
                err += "rmdir: failed to remove '%s': No such file or directory\n" % p
            elif os.listdir(r):
                err += "rmdir: failed to remove '%s': Directory not empty\n" % p
            else:
                os.rmdir(r)
        return "", err, 1 if err else 0

    def c_touch(self, a, e):
        err = ""
        for p in a:
            r = self.real(p)
            if not os.path.exists(r):
                try:
                    self.escrever(p, "")
                except ErroShell:
                    err += "touch: cannot touch '%s': No such file or directory\n" % p
        return "", err, 1 if err else 0

    def c_rm(self, a, e):
        op, pos = separar_opcoes(a)
        rec = op.get("r") or op.get("R") or op.get("recursive")
        forcar = op.get("f") or op.get("force")
        err = ""
        for p in pos:
            r = self.real(p)
            v = self.vcaminho(p)
            if v in ("/", CASA):
                err += "rm: it is dangerous to operate recursively on '%s'\n" % p
                continue
            if not os.path.exists(r):
                if not forcar:
                    err += "rm: cannot remove '%s': No such file or directory\n" % p
                continue
            if os.path.isdir(r):
                if not rec:
                    err += "rm: cannot remove '%s': Is a directory\n" % p
                    continue
                shutil.rmtree(r)
            else:
                os.remove(r)
            self.apagar_modos(r)
        return "", err, 1 if err else 0

    def c_cp(self, a, e):
        op, pos = separar_opcoes(a)
        rec = op.get("r") or op.get("R")
        if len(pos) < 2:
            return "", "cp: missing destination file operand\n", 1
        origens, destino = pos[:-1], pos[-1]
        rd = self.real(destino)
        err = ""
        if len(origens) > 1 and not os.path.isdir(rd):
            return "", "cp: target '%s' is not a directory\n" % destino, 1
        for o in origens:
            ro = self.real(o)
            if not os.path.exists(ro):
                err += "cp: cannot stat '%s': No such file or directory\n" % o
                continue
            alvo = os.path.join(rd, os.path.basename(ro)) if os.path.isdir(rd) else rd
            if os.path.isdir(ro):
                if not rec:
                    err += "cp: -r not specified; omitting directory '%s'\n" % o
                    continue
                shutil.copytree(ro, alvo, dirs_exist_ok=True)
            else:
                if not os.path.isdir(os.path.dirname(alvo)):
                    err += "cp: cannot create regular file '%s': No such file or directory\n" % destino
                    continue
                shutil.copyfile(ro, alvo)
                self.definir_modo(alvo, self.modo(ro))
        return "", err, 1 if err else 0

    def c_mv(self, a, e):
        op, pos = separar_opcoes(a)
        if len(pos) < 2:
            return "", "mv: missing destination file operand\n", 1
        origens, destino = pos[:-1], pos[-1]
        rd = self.real(destino)
        err = ""
        if len(origens) > 1 and not os.path.isdir(rd):
            return "", "mv: target '%s' is not a directory\n" % destino, 1
        for o in origens:
            ro = self.real(o)
            if not os.path.exists(ro):
                err += "mv: cannot stat '%s': No such file or directory\n" % o
                continue
            alvo = os.path.join(rd, os.path.basename(ro)) if os.path.isdir(rd) else rd
            if not os.path.isdir(os.path.dirname(alvo)):
                err += "mv: cannot move '%s' to '%s': No such file or directory\n" % (o, destino)
                continue
            if os.path.isfile(alvo) and os.path.isfile(ro):
                os.remove(alvo)
            shutil.move(ro, alvo)
            self.mover_modos(ro, alvo)
        return "", err, 1 if err else 0

    def c_chmod(self, a, e):
        op, pos = separar_opcoes([x for x in a if not re.match(r"^[ugoa]*[+\-=][rwx]+$", x)])
        modos = [x for x in a if re.match(r"^[ugoa]*[+\-=][rwx]+(,[ugoa]*[+\-=][rwx]+)*$", x)]
        if modos:
            modo_txt = modos[0]
            arquivos = [x for x in a if x != modo_txt and not x.startswith("-")]
        else:
            if not pos:
                return "", "chmod: missing operand\n", 1
            modo_txt, arquivos = pos[0], pos[1:]
        err = ""
        for p in arquivos:
            r = self.real(p)
            if not os.path.exists(r):
                err += "chmod: cannot access '%s': No such file or directory\n" % p
                continue
            atual = self.modo(r)
            if re.match(r"^[0-7]{3,4}$", modo_txt):
                novo = int(modo_txt, 8) & 0o777
            else:
                novo = atual
                for parte in modo_txt.split(","):
                    m = re.match(r"^([ugoa]*)([+\-=])([rwx]+)$", parte)
                    if not m:
                        return "", "chmod: invalid mode: '%s'\n" % modo_txt, 1
                    quem = m.group(1) or "a"
                    bits = 0
                    for l in m.group(3):
                        bits |= {"r": 4, "w": 2, "x": 1}[l]
                    mascara = 0
                    for q in quem:
                        for sh in {"u": [6], "g": [3], "o": [0], "a": [6, 3, 0]}[q]:
                            mascara |= bits << sh
                    if m.group(2) == "+":
                        novo |= mascara
                    elif m.group(2) == "-":
                        novo &= ~mascara
                    else:
                        limpar = 0
                        for q in quem:
                            for sh in {"u": [6], "g": [3], "o": [0], "a": [6, 3, 0]}[q]:
                                limpar |= 7 << sh
                        novo = (novo & ~limpar) | mascara
            self.definir_modo(r, novo)
        return "", err, 1 if err else 0

    # ---------- comandos: leitura ----------
    def _entradas(self, arquivos, entrada, nome):
        """Lista de (nome, texto). Sem arquivos, usa a entrada padrão."""
        if not arquivos:
            return [(None, entrada)], ""
        res, err = [], ""
        for p in arquivos:
            try:
                res.append((p, self.ler(p)))
            except ErroShell as ex:
                err += "%s: %s\n" % (nome, ex)
        return res, err

    def c_cat(self, a, e):
        op, pos = separar_opcoes(a)
        textos, err = self._entradas(pos, e, "cat")
        saida = "".join(t for _, t in textos)
        if op.get("n"):
            linhas = saida.split("\n")
            fim_nl = saida.endswith("\n")
            if fim_nl:
                linhas = linhas[:-1]
            saida = "\n".join("%6d\t%s" % (k + 1, l) for k, l in enumerate(linhas)) + ("\n" if fim_nl else "")
        return saida, err, 1 if err else 0

    c_less = c_cat
    c_more = c_cat

    def _cabeca_cauda(self, a, e, cauda):
        op, pos = separar_opcoes(a, com_valor=("n", "NUM"))
        n_txt = str(op.get("n", op.get("NUM", "10")))
        do_inicio = n_txt.startswith("+")
        n = int(n_txt.lstrip("+"))
        textos, err = self._entradas(pos, e, "tail" if cauda else "head")
        saidas = []
        for k, (nome, t) in enumerate(textos):
            linhas = t.splitlines(True)
            if cauda:
                pedaco = linhas[n - 1:] if do_inicio else (linhas[-n:] if n else [])
            else:
                pedaco = linhas[:n]
            bloco = "".join(pedaco)
            if bloco and not bloco.endswith("\n"):
                bloco += "\n"
            if len(textos) > 1:
                bloco = ("\n" if k else "") + "==> %s <==\n" % nome + bloco
            saidas.append(bloco)
        return "".join(saidas), err, 1 if err else 0

    def c_head(self, a, e):
        return self._cabeca_cauda(a, e, False)

    def c_tail(self, a, e):
        return self._cabeca_cauda(a, e, True)

    def c_wc(self, a, e):
        op, pos = separar_opcoes(a)
        textos, err = self._entradas(pos, e, "wc")
        escolhidos = [k for k in ("l", "w", "c") if op.get(k)] or ["l", "w", "c"]
        linhas = []
        totais = {"l": 0, "w": 0, "c": 0}
        dados = []
        for nome, t in textos:
            v = {"l": t.count("\n"), "w": len(t.split()), "c": len(t.encode("utf-8"))}
            for k in totais:
                totais[k] += v[k]
            dados.append((nome, v))
        if len(dados) > 1:
            dados.append(("total", totais))
        largura = max(len(str(v[k])) for _, v in dados for k in escolhidos) if (len(dados) > 1 or len(escolhidos) > 1) else 0
        for nome, v in dados:
            nums = " ".join(str(v[k]).rjust(largura) for k in escolhidos)
            linhas.append(nums + (" " + nome if nome else ""))
        return "\n".join(linhas) + "\n", err, 1 if err else 0

    def c_echo(self, a, e):
        nova_linha = True
        escapes = False
        while a and a[0] in ("-n", "-e", "-ne", "-en"):
            if "n" in a[0]:
                nova_linha = False
            if "e" in a[0]:
                escapes = True
            a = a[1:]
        texto = " ".join(a)
        if escapes:
            texto = texto.replace("\\n", "\n").replace("\\t", "\t")
        return texto + ("\n" if nova_linha else ""), "", 0

    def c_printf(self, a, e):
        if not a:
            return "", "printf: usage: printf format [arguments]\n", 2
        fmt = a[0].replace("\\n", "\n").replace("\\t", "\t")
        args = a[1:]
        convs = re.findall(r"%[-0-9.]*[sdf]", fmt)
        if not convs:
            return fmt, "", 0
        saida = ""
        while True:
            pedaco = args[:len(convs)]
            args = args[len(convs):]
            valores = []
            for c, v in zip(convs, pedaco + [""] * (len(convs) - len(pedaco))):
                if c.endswith("d"):
                    valores.append(int(float(v or 0)))
                elif c.endswith("f"):
                    valores.append(float(v or 0))
                else:
                    valores.append(v)
            saida += fmt % tuple(valores)
            if not args:
                break
        return saida, "", 0

    def c_grep(self, a, e):
        op, pos = separar_opcoes(a, com_valor=("e",))
        if "e" in op:
            padrao = op["e"]
        elif pos:
            padrao, pos = pos[0], pos[1:]
        else:
            return "", "Usage: grep [OPTION]... PATTERNS [FILE]...\n", 2
        flags = re.IGNORECASE if op.get("i") else 0
        rx = padrao
        if not op.get("E"):
            rx = rx.replace("\\|", "|").replace("\\(", "(").replace("\\)", ")")
        if op.get("w"):
            rx = r"\b(?:" + rx + r")\b"
        if op.get("F"):
            rx = re.escape(padrao)
        try:
            cre = re.compile(rx, flags)
        except re.error:
            return "", "grep: padrão inválido: %s\n" % padrao, 2
        alvos = []
        err = ""
        if op.get("r") or op.get("R"):
            for p in (pos or ["."]):
                rp = self.real(p)
                if os.path.isdir(rp):
                    for dirpath, dirs, files in os.walk(rp):
                        dirs[:] = sorted(d for d in dirs if d != ".git")
                        for f in sorted(files):
                            alvos.append(self.relativo_para_exibir(os.path.join(dirpath, f), p))
                else:
                    alvos.append(p)
            mostrar_nome = True
        else:
            alvos = pos
            mostrar_nome = len(pos) > 1
        if op.get("h"):
            mostrar_nome = False
        textos, err2 = self._entradas(alvos, e, "grep")
        err += err2
        saida = []
        achou = False
        for nome, t in textos:
            contagem = 0
            for k, linha in enumerate(t.splitlines()):
                bate = bool(cre.search(linha))
                if op.get("v"):
                    bate = not bate
                if not bate:
                    continue
                achou = True
                contagem += 1
                if op.get("c") or op.get("l"):
                    continue
                prefixo = (nome + ":" if mostrar_nome and nome else "") + (str(k + 1) + ":" if op.get("n") else "")
                if op.get("o") and not op.get("v"):
                    for m in cre.finditer(linha):
                        saida.append(prefixo + m.group(0))
                else:
                    saida.append(prefixo + linha)
            if op.get("c"):
                saida.append((nome + ":" if mostrar_nome and nome else "") + str(contagem))
            elif op.get("l") and contagem:
                saida.append(nome or "(standard input)")
        return ("\n".join(saida) + "\n" if saida else ""), err, (0 if achou else 1) if not err else 2

    def relativo_para_exibir(self, real, base):
        v = self.virtual_de_real(real)
        bv = self.vcaminho(base)
        rel = posixpath.relpath(v, bv)
        return posixpath.join(base, rel) if base not in (".",) else rel

    def c_find(self, a, e):
        caminhos = []
        i = 0
        while i < len(a) and not a[i].startswith("-"):
            caminhos.append(a[i])
            i += 1
        caminhos = caminhos or ["."]
        nome = iname = tipo = None
        maxdepth = None
        while i < len(a):
            if a[i] == "-name" and i + 1 < len(a):
                nome = a[i + 1]
                i += 2
            elif a[i] == "-iname" and i + 1 < len(a):
                iname = a[i + 1]
                i += 2
            elif a[i] == "-type" and i + 1 < len(a):
                tipo = a[i + 1]
                i += 2
            elif a[i] == "-maxdepth" and i + 1 < len(a):
                maxdepth = int(a[i + 1])
                i += 2
            else:
                return "", "find: unknown predicate '%s'\n" % a[i], 1
        saida = []
        err = ""
        for base in caminhos:
            rb = self.real(base)
            if not os.path.exists(rb):
                err += "find: '%s': No such file or directory\n" % base
                continue

            def ok(caminho_v, real, profundidade):
                n = posixpath.basename(caminho_v) if caminho_v not in (".", "/") else caminho_v
                if nome and not fnmatch.fnmatchcase(n, nome):
                    return False
                if iname and not fnmatch.fnmatch(n.lower(), iname.lower()):
                    return False
                if tipo == "f" and not os.path.isfile(real):
                    return False
                if tipo == "d" and not os.path.isdir(real):
                    return False
                return True

            def andar(real, exib, prof):
                if ok(exib, real, prof):
                    saida.append(exib)
                if os.path.isdir(real) and (maxdepth is None or prof < maxdepth):
                    for n in sorted(os.listdir(real), key=str.lower):
                        andar(os.path.join(real, n), posixpath.join(exib, n), prof + 1)
            andar(rb, base.rstrip("/") if base != "/" else "/", 0)
        return ("\n".join(saida) + "\n" if saida else ""), err, 1 if err else 0

    def c_sort(self, a, e):
        op, pos = separar_opcoes(a, com_valor=("k", "t"))
        textos, err = self._entradas(pos, e, "sort")
        linhas = []
        for _, t in textos:
            linhas += t.splitlines()
        sep = op.get("t")
        chave_campo = None
        if "k" in op:
            chave_campo = int(str(op["k"]).split(",")[0].rstrip("nr"))
            if "n" in str(op["k"]):
                op["n"] = True
            if "r" in str(op["k"]).split(",")[0][1:]:
                op["r"] = True

        def campo(l):
            if chave_campo is None:
                return l
            partes = l.split(sep) if sep else l.split()
            return partes[chave_campo - 1] if chave_campo - 1 < len(partes) else ""

        def chave(l):
            v = campo(l)
            if op.get("n"):
                m = re.match(r"^\s*(-?\d+(\.\d+)?)", v)
                return (float(m.group(1)) if m else 0.0, l)
            if op.get("f"):
                return (v.lower(), l)
            return (v, l)
        linhas.sort(key=chave, reverse=bool(op.get("r")))
        if op.get("u"):
            vistos, unicas = set(), []
            for l in linhas:
                if l not in vistos:
                    vistos.add(l)
                    unicas.append(l)
            linhas = unicas
        return ("\n".join(linhas) + "\n" if linhas else ""), err, 0

    def c_uniq(self, a, e):
        op, pos = separar_opcoes(a)
        textos, err = self._entradas(pos[:1], e, "uniq")
        linhas = textos[0][1].splitlines() if textos else []
        grupos = []
        for l in linhas:
            if grupos and grupos[-1][0] == l:
                grupos[-1][1] += 1
            else:
                grupos.append([l, 1])
        if op.get("d"):
            grupos = [g for g in grupos if g[1] > 1]
        if op.get("u"):
            grupos = [g for g in grupos if g[1] == 1]
        if op.get("c"):
            saida = ["%7d %s" % (n, l) for l, n in grupos]
        else:
            saida = [l for l, _ in grupos]
        return ("\n".join(saida) + "\n" if saida else ""), err, 0

    def c_cut(self, a, e):
        op, pos = separar_opcoes(a, com_valor=("d", "f", "c"))
        textos, err = self._entradas(pos, e, "cut")
        saida = []
        for _, t in textos:
            for l in t.splitlines():
                if "c" in op:
                    cs = faixa_campos(op["c"])
                    saida.append("".join(l[k - 1] for k in cs if k - 1 < len(l)))
                elif "f" in op:
                    sep = op.get("d", "\t")
                    partes = l.split(sep)
                    if len(partes) == 1:
                        saida.append(l)
                        continue
                    fs = faixa_campos(op["f"])
                    saida.append(sep.join(partes[k - 1] for k in fs if k - 1 < len(partes)))
                else:
                    return "", "cut: you must specify a list of bytes, characters, or fields\n", 1
        return ("\n".join(saida) + "\n" if saida else ""), err, 0

    def c_tr(self, a, e):
        op, pos = separar_opcoes(a)

        def expandir(s):
            s = s.replace("[:lower:]", "a-z").replace("[:upper:]", "A-Z").replace("[:digit:]", "0-9").replace("[:space:]", " \t\n")
            res = ""
            i = 0
            while i < len(s):
                if i + 2 < len(s) and s[i + 1] == "-":
                    res += "".join(chr(c) for c in range(ord(s[i]), ord(s[i + 2]) + 1))
                    i += 3
                else:
                    res += s[i].replace("\\n", "\n")
                    i += 1
            return res.replace("\\n", "\n")
        if op.get("d"):
            apagar = expandir(pos[0].replace("\\n", "\n"))
            return "".join(c for c in e if c not in apagar), "", 0
        if op.get("s") and len(pos) == 1:
            chars = expandir(pos[0])
            return re.sub("([" + re.escape(chars) + "])\\1+", r"\1", e), "", 0
        if len(pos) < 2:
            return "", "tr: missing operand\n", 1
        de, para = expandir(pos[0].replace("\\n", "\n")), expandir(pos[1].replace("\\n", "\n"))
        para = para + para[-1:] * (len(de) - len(para))
        return e.translate(str.maketrans(de, para[:len(de)])), "", 0

    def c_sed(self, a, e):
        op, pos = separar_opcoes(a, com_valor=("e",))
        if "e" in op:
            programa = op["e"]
        elif pos:
            programa = pos.pop(0)
        else:
            return "", "Usage: sed [OPTION]... {script} [input-file]...\n", 1
        cmds = self._sed_analisar(programa)

        def aplicar(texto):
            linhas = texto.split("\n")
            fim_nl = texto.endswith("\n")
            if fim_nl:
                linhas = linhas[:-1]
            saida = []
            total = len(linhas)
            for num, l in enumerate(linhas, start=1):
                apagar = False
                extra = 0
                for ini_e, fim_e, rx_e, cmd, dados in cmds:
                    if ini_e is not None:
                        f = total if fim_e == "$" else (int(fim_e) if fim_e else ini_e)
                        ini_n = total if ini_e == "$" else ini_e
                        if not (ini_n <= num <= f):
                            continue
                    if rx_e is not None and not re.search(rx_e, l):
                        continue
                    if cmd == "d":
                        apagar = True
                        break
                    if cmd == "p":
                        extra += 1
                    elif cmd == "s":
                        busca, troca, bandeiras = dados
                        l = re.sub(busca, troca, l, count=0 if "g" in bandeiras else 1,
                                   flags=re.IGNORECASE if ("I" in bandeiras or "i" in bandeiras) else 0)
                        if "p" in bandeiras:
                            extra += 1
                if apagar:
                    continue
                if not op.get("n"):
                    saida.append(l)
                saida.extend([l] * extra)
            return "\n".join(saida) + ("\n" if saida else "")
        if op.get("i"):
            for arq in pos:
                self.escrever(arq, aplicar(self.ler(arq)))
            return "", "", 0
        textos, err = self._entradas(pos, e, "sed")
        return "".join(aplicar(t) for _, t in textos), err, 0

    def _sed_analisar(self, prog):
        cmds = []
        i = 0
        n = len(prog)
        while i < n:
            while i < n and prog[i] in " ;\n\t":
                i += 1
            if i >= n:
                break
            ini_e = fim_e = rx_e = None
            m = re.match(r"(\d+|\$)(?:,(\d+|\$))?", prog[i:])
            if m:
                ini_e = int(m.group(1)) if m.group(1) != "$" else "$"
                fim_e = m.group(2)
                i += m.end()
            elif prog[i] == "/":
                j = prog.index("/", i + 1)
                rx_e = prog[i + 1:j].replace("\\(", "(").replace("\\)", ")")
                i = j + 1
            if i >= n:
                raise ErroShell("-e expression #1: missing command")
            c = prog[i]
            i += 1
            if c in "dp":
                cmds.append((ini_e, fim_e, rx_e, c, None))
            elif c == "s":
                d = prog[i]
                i += 1
                partes = []
                buf = ""
                while i < n and len(partes) < 2:
                    if prog[i] == "\\" and i + 1 < n and prog[i + 1] == d:
                        buf += d
                        i += 2
                        continue
                    if prog[i] == d:
                        partes.append(buf)
                        buf = ""
                        i += 1
                        continue
                    buf += prog[i]
                    i += 1
                if len(partes) < 2:
                    raise ErroShell("-e expression #1: unterminated `s' command")
                bandeiras = ""
                while i < n and prog[i] not in ";\n ":
                    bandeiras += prog[i]
                    i += 1
                busca = partes[0].replace("\\(", "(").replace("\\)", ")").replace("\\+", "+").replace("\\?", "?")
                troca = re.sub(r"\\(\d)", r"\\\1", partes[1].replace("\\", "\\\\").replace("\\\\\\\\", "\\\\")).replace("&", r"\g<0>")
                troca = re.sub(r"\\\\(\d)", r"\\\1", troca)
                cmds.append((ini_e, fim_e, rx_e, "s", (busca, troca, bandeiras)))
            else:
                raise ErroShell("-e expression #1: unknown command: `%s'" % c)
        return cmds

    def c_awk(self, a, e):
        op, pos = separar_opcoes(a, com_valor=("F", "v"))
        if not pos:
            return "", "usage: awk [-F fs] 'program' [file ...]\n", 2
        programa, arquivos = pos[0], pos[1:]
        sep = op.get("F")
        if sep == "\\t":
            sep = "\t"
        textos, err = self._entradas(arquivos, e, "awk")
        try:
            saida = Awk(programa, sep).rodar("".join(t for _, t in textos))
        except ErroShell as ex:
            return "", "awk: %s\n" % ex, 2
        return saida, err, 0

    def c_seq(self, a, e):
        nums = [int(x) for x in a]
        if len(nums) == 1:
            r = range(1, nums[0] + 1)
        elif len(nums) == 2:
            r = range(nums[0], nums[1] + 1)
        else:
            r = range(nums[0], nums[2] + 1, nums[1])
        return "".join("%d\n" % k for k in r), "", 0

    def c_basename(self, a, e):
        if not a:
            return "", "basename: missing operand\n", 1
        b = posixpath.basename(a[0].rstrip("/"))
        if len(a) > 1 and b.endswith(a[1]):
            b = b[: -len(a[1])]
        return b + "\n", "", 0

    def c_dirname(self, a, e):
        return (posixpath.dirname(a[0].rstrip("/")) or ".") + "\n", "", 0

    def c_diff(self, a, e):
        import difflib
        op, pos = separar_opcoes(a)
        if len(pos) != 2:
            return "", "diff: missing operand\n", 2
        x, y = self.ler(pos[0]).splitlines(True), self.ler(pos[1]).splitlines(True)
        if x == y:
            return "", "", 0
        linhas = list(difflib.unified_diff(x, y, pos[0], pos[1]))
        return "".join(l if l.endswith("\n") else l + "\n" for l in linhas), "", 1

    def c_file(self, a, e):
        saida = []
        for p in a:
            r = self.real(p)
            if os.path.isdir(r):
                saida.append("%s: directory" % p)
            elif p.endswith(".sh"):
                saida.append("%s: Bourne-Again shell script, ASCII text executable" % p)
            elif p.endswith((".gz", ".tgz")):
                saida.append("%s: gzip compressed data" % p)
            elif p.endswith(".zip"):
                saida.append("%s: Zip archive data" % p)
            elif p.endswith(".csv"):
                saida.append("%s: CSV text" % p)
            else:
                saida.append("%s: UTF-8 Unicode text" % p)
        return "\n".join(saida) + "\n", "", 0

    def c_stat(self, a, e):
        saida = []
        for p in a:
            r = self.real(p)
            if not os.path.exists(r):
                return "", "stat: cannot statx '%s': No such file or directory\n" % p, 1
            m = self.modo(r)
            saida.append("  File: %s\n  Size: %d\nAccess: (0%o/%s)  Uid: (1000/ %s)" % (p, os.path.getsize(r), m, modo_texto(m, os.path.isdir(r)), USUARIO))
        return "\n".join(saida) + "\n", "", 0

    # ---------- comandos: ambiente ----------
    def c_whoami(self, a, e):
        return USUARIO + "\n", "", 0

    def c_hostname(self, a, e):
        return MAQUINA + "\n", "", 0

    def c_date(self, a, e):
        if a and a[0].startswith("+"):
            return AGORA.strftime(a[0][1:]) + "\n", "", 0
        return "seg jun  3 10:00:00 -03 2024\n", "", 0

    def c_export(self, a, e):
        for x in a:
            if "=" in x:
                k, v = x.split("=", 1)
                self.vars[k] = v
                self.exportadas.add(k)
            else:
                self.exportadas.add(x)
        return "", "", 0

    def c_unset(self, a, e):
        for x in a:
            self.vars.pop(x, None)
            self.exportadas.discard(x)
        return "", "", 0

    def c_env(self, a, e):
        linhas = ["%s=%s" % (k, self.valor_var(k)) for k in sorted(self.exportadas) if k in self.vars or k == "PWD"]
        return "\n".join(linhas) + "\n", "", 0

    c_printenv = c_env

    def c_which(self, a, e):
        saida, codigo = [], 0
        for x in a:
            if x in COMANDOS_PATH:
                saida.append("/usr/bin/" + x)
            else:
                codigo = 1
        return ("\n".join(saida) + "\n" if saida else ""), "", codigo

    def c_man(self, a, e):
        if not a:
            return "", "What manual page do you want?\n", 1
        txt = AJUDA.get(a[0], "%s — manual não disponível neste terminal simulado. Tente %s --help no Linux de verdade." % (a[0], a[0]))
        return txt + "\n", "", 0

    def c_clear(self, a, e):
        return "", "", 0

    def c_true(self, a, e):
        return "", "", 0

    def c_false(self, a, e):
        return "", "", 1

    def c_sleep(self, a, e):
        return "", "", 0

    def c_exit(self, a, e):
        s = Sair(int(a[0]) if a else self.ultimo_codigo)
        raise s

    def c_history(self, a, e):
        return "", "", 0

    def c_sudo(self, a, e):
        return "", "[sudo] senha para %s: \nsudo: neste terminal simulado não há permissão de administrador. No Linux de verdade, sudo executa o comando como root depois de pedir a sua senha.\n" % USUARIO, 1

    def c_nano(self, a, e):
        return "", "editores interativos (nano, vim) não funcionam neste terminal simulado. Use echo \"texto\" > arquivo ou echo \"texto\" >> arquivo.\n", 1

    c_vim = c_nano
    c_vi = c_nano

    def c_curl(self, a, e):
        return "", "curl: (6) sem acesso à rede neste terminal simulado\n", 6

    c_wget = c_curl

    def c_python3(self, a, e):
        return "", "python3: para rodar Python, use a trilha de Python do Level Code\n", 1

    c_python = c_python3

    def c_teste(self, a, e):
        if a and a[-1] == "]":
            a = a[:-1]
        return "", "", 0 if self.avaliar_teste(a) else 1

    c_test = c_teste

    def avaliar_teste(self, a):
        if not a:
            return False
        if a[0] == "!":
            return not self.avaliar_teste(a[1:])
        if len(a) == 1:
            return a[0] != ""
        if len(a) == 2:
            op, x = a
            r = self.real(x) if op in ("-f", "-d", "-e", "-s", "-x", "-r", "-w") else None
            if op == "-f":
                return os.path.isfile(r)
            if op == "-d":
                return os.path.isdir(r)
            if op == "-e":
                return os.path.exists(r)
            if op == "-s":
                return os.path.isfile(r) and os.path.getsize(r) > 0
            if op == "-x":
                return os.path.exists(r) and bool(self.modo(r) & 0o100)
            if op in ("-r", "-w"):
                return os.path.exists(r)
            if op == "-z":
                return x == ""
            if op == "-n":
                return x != ""
            raise ErroShell("%s: unary operator expected" % op)
        if len(a) >= 3:
            x, op, y = a[0], a[1], a[2]
            if op in ("=", "=="):
                return x == y
            if op == "!=":
                return x != y
            nums = {"-eq": "==", "-ne": "!=", "-gt": ">", "-lt": "<", "-ge": ">=", "-le": "<="}
            if op in nums:
                try:
                    xi, yi = int(x), int(y)
                except ValueError:
                    raise ErroShell("%s: integer expression expected" % (x if not x.lstrip("-").isdigit() else y))
                return eval("%d %s %d" % (xi, nums[op], yi))
            raise ErroShell("%s: binary operator expected" % op)
        return False

    # ---------- comandos: processos ----------
    def c_ps(self, a, e):
        if a and ("aux" in a[0] or "-e" in a[0] or "-ef" in a[0]):
            linhas = ["USER         PID %CPU %MEM COMMAND"]
            for pid, user, cpu, mem, cmd in self.processos:
                linhas.append("%-10s %5d %4.1f %4.1f %s" % (user, pid, cpu, mem, cmd))
            return "\n".join(linhas) + "\n", "", 0
        linhas = ["    PID TTY          TIME CMD", "   1021 pts/0    00:00:00 bash"]
        for pid, user, cpu, mem, cmd in self.processos:
            if user == USUARIO and pid != 1021 and pid >= 2000:
                linhas.append("%7d pts/0    00:00:00 %s" % (pid, cmd.split()[0]))
        linhas.append("%7d pts/0    00:00:00 ps" % self.prox_pid)
        return "\n".join(linhas) + "\n", "", 0

    def c_top(self, a, e):
        linhas = ["top - 10:00:00 up 3 days,  2 users,  load average: 1.02, 0.98, 0.95",
                  "    PID USER      %CPU %MEM COMMAND"]
        for pid, user, cpu, mem, cmd in sorted(self.processos, key=lambda p: -p[2]):
            linhas.append("%7d %-9s %4.1f %4.1f %s" % (pid, user, cpu, mem, cmd.split()[0]))
        return "\n".join(linhas) + "\n", "", 0

    def c_kill(self, a, e):
        sinal = "15"
        alvos = []
        for x in a:
            if x.startswith("-"):
                sinal = x[1:]
            else:
                alvos.append(x)
        err = ""
        for x in alvos:
            try:
                pid = int(x)
            except ValueError:
                err += "bash: kill: %s: arguments must be process or job IDs\n" % x
                continue
            alvo = [p for p in self.processos if p[0] == pid]
            if not alvo:
                err += "bash: kill: (%d) - No such process\n" % pid
            elif alvo[0][1] != USUARIO:
                err += "bash: kill: (%d) - Operation not permitted\n" % pid
            else:
                self.processos.remove(alvo[0])
        return "", err, 1 if err else 0

    def c_pkill(self, a, e):
        nome = [x for x in a if not x.startswith("-")]
        if not nome:
            return "", "pkill: no matching criteria specified\n", 2
        antes = len(self.processos)
        self.processos[:] = [p for p in self.processos if not (p[1] == USUARIO and nome[0] in p[4])]
        return "", "", 0 if len(self.processos) < antes else 1

    def c_jobs(self, a, e):
        linhas = []
        for k, p in enumerate([p for p in self.processos if p[0] >= 2000], start=1):
            linhas.append("[%d]   Running                 %s &" % (k, p[4]))
        return ("\n".join(linhas) + "\n" if linhas else ""), "", 0

    # ---------- comandos: compactação e disco ----------
    def c_tar(self, a, e):
        if a and not a[0].startswith("-"):
            a = ["-" + a[0]] + a[1:]
        op, pos = separar_opcoes(a, com_valor=("f", "C"))
        arquivo = op.get("f")
        if not arquivo:
            return "", "tar: Refusing to read archive contents from terminal (missing -f option?)\n", 2
        modo = "w:gz" if op.get("z") else "w"
        saida = []
        if op.get("c"):
            with tarfile.open(self.real(arquivo), modo) as t:
                for p in pos:
                    r = self.real(p)
                    if not os.path.exists(r):
                        return "", "tar: %s: Cannot stat: No such file or directory\n" % p, 2
                    t.add(r, arcname=p.rstrip("/"))
                    if op.get("v"):
                        if os.path.isdir(r):
                            for dirpath, dirs, files in os.walk(r):
                                dirs.sort()
                                rel = os.path.relpath(dirpath, os.path.dirname(r)).replace(os.sep, "/")
                                saida.append(rel + "/")
                                for f in sorted(files):
                                    saida.append(rel + "/" + f)
                        else:
                            saida.append(p)
        elif op.get("t") or op.get("x"):
            r = self.real(arquivo)
            if not os.path.exists(r):
                return "", "tar: %s: Cannot open: No such file or directory\n" % arquivo, 2
            with tarfile.open(r, "r:*") as t:
                nomes = [m.name + ("/" if m.isdir() else "") for m in t.getmembers()]
                if op.get("x"):
                    destino = self.real(op.get("C", "."))
                    t.extractall(destino)
                    if op.get("v"):
                        saida = nomes
                else:
                    saida = nomes
        else:
            return "", "tar: You must specify one of the '-Acdtrux' options\n", 2
        return ("\n".join(saida) + "\n" if saida else ""), "", 0

    def c_zip(self, a, e):
        op, pos = separar_opcoes(a)
        if len(pos) < 2:
            return "", "zip error: Nothing to do!\n", 12
        destino = pos[0] if pos[0].endswith(".zip") else pos[0] + ".zip"
        saida = []
        with zipfile.ZipFile(self.real(destino), "w") as z:
            for p in pos[1:]:
                r = self.real(p)
                if os.path.isdir(r):
                    for dirpath, dirs, files in os.walk(r):
                        dirs.sort()
                        rel = os.path.relpath(dirpath, os.path.dirname(r)).replace(os.sep, "/")
                        saida.append("  adding: %s/ (stored 0%%)" % rel)
                        for f in sorted(files):
                            z.write(os.path.join(dirpath, f), rel + "/" + f)
                            saida.append("  adding: %s/%s (deflated 40%%)" % (rel, f))
                elif os.path.exists(r):
                    z.write(r, p)
                    saida.append("  adding: %s (deflated 40%%)" % p)
        return "\n".join(saida) + "\n", "", 0

    def c_unzip(self, a, e):
        op, pos = separar_opcoes(a, com_valor=("d",))
        if not pos:
            return "", "unzip: falta o arquivo\n", 1
        r = self.real(pos[0])
        if not os.path.exists(r):
            return "", "unzip:  cannot find or open %s\n" % pos[0], 9
        destino = self.real(op.get("d", "."))
        os.makedirs(destino, exist_ok=True)
        with zipfile.ZipFile(r) as z:
            if op.get("l"):
                return "\n".join(z.namelist()) + "\n", "", 0
            z.extractall(destino)
            saida = ["Archive:  " + pos[0]] + ["  inflating: " + n for n in z.namelist() if not n.endswith("/")]
        return "\n".join(saida) + "\n", "", 0

    def c_du(self, a, e):
        op, pos = separar_opcoes(a)
        saida = []

        def tamanho(r):
            if os.path.isfile(r):
                return os.path.getsize(r)
            total = 0
            for dirpath, dirs, files in os.walk(r):
                for f in files:
                    total += os.path.getsize(os.path.join(dirpath, f))
            return total
        for p in (pos or ["."]):
            r = self.real(p)
            if not os.path.exists(r):
                return "", "du: cannot access '%s': No such file or directory\n" % p, 1
            t = tamanho(r)
            kb = max(4, -(-t // 4096) * 4)
            txt = tamanho_humano(kb * 1024) if op.get("h") else str(kb)
            if op.get("h") and "." not in txt and txt[-1].isalpha():
                txt = txt[:-1] + ".0" + txt[-1]
            saida.append("%s\t%s" % (txt, p))
        return "\n".join(saida) + "\n", "", 0

    def c_df(self, a, e):
        return ("Filesystem      Size  Used Avail Use% Mounted on\n"
                "/dev/sda1        50G   21G   27G  44% /\n"
                "tmpfs           2.0G     0  2.0G   0% /tmp\n"), "", 0

    # gancho para git/gh (definidos em minigit.py)
    def c_git(self, a, e):
        f = globals().get("git")
        return f(self, a, e) if f else ("", "git: não disponível\n", 127)

    def c_gh(self, a, e):
        f = globals().get("gh")
        return f(self, a, e) if f else ("", "gh: não disponível\n", 127)


# ---------------------------------------------------------------------------
# awk (subconjunto)
# ---------------------------------------------------------------------------

class Awk:
    """Subconjunto de awk: BEGIN/END, padrões, print, atribuições, +=, NR, NF, $n."""

    def __init__(self, programa, sep):
        self.sep = sep
        self.blocos = self.analisar(programa)
        self.vars = {}

    def analisar(self, prog):
        blocos = []
        i = 0
        prog = prog.strip()
        while i < len(prog):
            while i < len(prog) and prog[i] in " \t\n;":
                i += 1
            if i >= len(prog):
                break
            j = prog.find("{", i)
            if j < 0:
                padrao = prog[i:].strip()
                blocos.append((padrao, "print"))
                break
            padrao = prog[i:j].strip()
            prof = 0
            k = j
            aspa = False
            while k < len(prog):
                if prog[k] == '"':
                    aspa = not aspa
                elif not aspa and prog[k] == "{":
                    prof += 1
                elif not aspa and prog[k] == "}":
                    prof -= 1
                    if prof == 0:
                        break
                k += 1
            if k >= len(prog):
                raise ErroShell("syntax error: falta }")
            blocos.append((padrao, prog[j + 1:k]))
            i = k + 1
        return blocos

    def expr_py(self, expr):
        """Traduz uma expressão awk para Python."""
        tokens = re.findall(r'"(?:[^"\\]|\\.)*"|\$\d+|\$NF|\$\(\w+\)|\d+\.\d+|\d+|[A-Za-z_]\w*|==|!=|>=|<=|&&|\|\||!~|~|[-+*/%<>()!,]', expr)
        py = []
        for t in tokens:
            if t.startswith('"'):
                py.append(t)
            elif t == "$NF":
                py.append("_c(NF)")
            elif t.startswith("$("):
                py.append("_c(%s)" % self.expr_py(t[2:-1]))
            elif t.startswith("$"):
                py.append("_c(%s)" % t[1:])
            elif re.match(r"^\d", t):
                py.append(t)
            elif t in ("NR", "NF"):
                py.append(t)
            elif t == "&&":
                py.append(" and ")
            elif t == "||":
                py.append(" or ")
            elif t == "!":
                py.append(" not ")
            elif t == "~":
                py.append(" _casa ")
            elif t == "length":
                py.append("_len")
            elif t == "toupper":
                py.append("_up")
            elif t == "tolower":
                py.append("_low")
            elif re.match(r"^[A-Za-z_]", t):
                py.append("_v(%r)" % t)
            else:
                py.append(t)
        return " ".join(py)

    def rodar(self, texto):
        saida = []
        linhas = texto.splitlines()

        def num(x):
            if isinstance(x, (int, float)):
                return x
            m = re.match(r"^\s*(-?\d+(\.\d+)?)", str(x))
            if not m:
                return 0
            v = float(m.group(1))
            return int(v) if v.is_integer() and "." not in m.group(1) else v

        def fmt(x):
            if isinstance(x, float):
                return ("%.6g" % x)
            return str(x)

        estado = {"campos": [], "NR": 0}

        class Casa:
            def __init__(self, s):
                self.s = s

        def ambiente():
            campos = estado["campos"]
            return {
                "_c": lambda k: (" ".join(campos) if self.sep is None else (self.sep or " ").join(campos)) if k == 0 else (campos[k - 1] if 0 < k <= len(campos) else ""),
                "_v": lambda nome: self.vars.get(nome, ""),
                "NR": estado["NR"], "NF": len(campos),
                "_len": lambda s="": len(str(s)), "_up": lambda s: str(s).upper(), "_low": lambda s: str(s).lower(),
            }

        def avaliar(expr):
            if not expr.strip():
                return ""
            py = self.expr_py(expr)
            # comparações numéricas quando os dois lados parecem números
            env = ambiente()
            try:
                v = eval(py, {"__builtins__": {}}, env)
            except TypeError:
                py2 = re.sub(r"(_c\(\w+\)|_v\('\w+'\))", r"_n(\1)", py)
                env["_n"] = num
                v = eval(py2, {"__builtins__": {}}, env)
            return v

        def condicao(padrao):
            if padrao.startswith("/") and padrao.endswith("/"):
                return re.search(padrao[1:-1], " ".join(estado["campos"]) if self.sep is None else (self.sep).join(estado["campos"])) is not None
            py = self.expr_py(padrao)
            py = re.sub(r"(_c\(\w+\)|_v\('\w+'\)|NR|NF)", r"_n(\1)", py)
            py = re.sub(r'_n\((_c\(\w+\))\)\s*(==|!=)\s*(".*?")', r"\1 \2 \3", py)
            py = re.sub(r'(_n\((_c\(\w+\))\))\s*_casa\s*(".*?")', r"_re(\3, \2)", py)
            env = ambiente()
            env["_n"] = num
            env["_re"] = lambda p, s: re.search(p, s) is not None
            return bool(eval(py, {"__builtins__": {}}, env))

        def executar(acao):
            for instr in self.dividir(acao):
                instr = instr.strip()
                if not instr:
                    continue
                if instr == "print" or instr.startswith("print ") or instr.startswith("print("):
                    resto = instr[5:].strip()
                    if not resto:
                        saida.append(ambiente()["_c"](0))
                        continue
                    partes = self.dividir_virgulas(resto)
                    valores = []
                    for p in partes:
                        sub = re.findall(r'"(?:[^"\\]|\\.)*"|[^"\s]+', p.strip())
                        if len(sub) > 1 and not any(op in p for op in "+-*/"):
                            valores.append("".join(fmt(self.valor(avaliar(s))) for s in sub))
                        else:
                            valores.append(fmt(self.valor(avaliar(p))))
                    saida.append(" ".join(valores))
                    continue
                if instr.startswith("printf"):
                    resto = instr[6:].strip().strip("()")
                    partes = self.dividir_virgulas(resto)
                    f = avaliar(partes[0]).replace("\\n", "\n")
                    vals = [self.valor(avaliar(p)) for p in partes[1:]]
                    vals = [num(v) if re.search(r"%[-0-9.]*[df]", f) else v for v in vals]
                    try:
                        saida.append(("\0" + (f % tuple(vals))))
                    except TypeError:
                        saida.append("\0" + f)
                    continue
                m = re.match(r"^([A-Za-z_]\w*)\s*(\+\+|--)$", instr)
                if m:
                    self.vars[m.group(1)] = num(self.vars.get(m.group(1), 0)) + (1 if m.group(2) == "++" else -1)
                    continue
                m = re.match(r"^([A-Za-z_]\w*)\s*([+\-*/]?=)\s*(.+)$", instr)
                if m:
                    nome, op, expr = m.groups()
                    v = avaliar(expr) if op == "=" else num(avaliar(re.sub(r"(\$\d+|\$NF)", r"\1", expr)) if not re.search(r"[$A-Za-z]", expr) else self.num_expr(expr, ambiente, num))
                    if op == "=":
                        self.vars[nome] = v
                    else:
                        atual = num(self.vars.get(nome, 0))
                        v = num(v)
                        self.vars[nome] = {"+=": atual + v, "-=": atual - v, "*=": atual * v, "/=": atual / v if v else 0}[op]
                    continue
                raise ErroShell("instrução não suportada neste awk simplificado: %s" % instr)

        for padrao, acao in self.blocos:
            if padrao == "BEGIN":
                executar(acao)
        for k, l in enumerate(linhas, start=1):
            estado["NR"] = k
            estado["campos"] = l.split() if self.sep is None else l.split(self.sep)
            for padrao, acao in self.blocos:
                if padrao in ("BEGIN", "END"):
                    continue
                if not padrao or condicao(padrao):
                    executar(acao)
        estado["campos"] = []
        for padrao, acao in self.blocos:
            if padrao == "END":
                executar(acao)
        texto = ""
        for s in saida:
            texto += s[1:] if s.startswith("\0") else s + "\n"
        return texto

    def num_expr(self, expr, ambiente, num):
        py = self.expr_py(expr)
        py = re.sub(r"(_c\(\w+\)|_v\('\w+'\)|NR|NF)", r"_n(\1)", py)
        env = ambiente()
        env["_n"] = num
        return eval(py, {"__builtins__": {}}, env)

    def valor(self, v):
        if isinstance(v, float) and v.is_integer():
            return int(v)
        return v

    def dividir(self, acao):
        partes, buf, aspa = [], "", False
        for c in acao:
            if c == '"':
                aspa = not aspa
            if c in ";\n" and not aspa:
                partes.append(buf)
                buf = ""
            else:
                buf += c
        partes.append(buf)
        return partes

    def dividir_virgulas(self, s):
        partes, buf, aspa, prof = [], "", False, 0
        for c in s:
            if c == '"':
                aspa = not aspa
            if not aspa and c == "(":
                prof += 1
            if not aspa and c == ")":
                prof -= 1
            if c == "," and not aspa and prof == 0:
                partes.append(buf)
                buf = ""
            else:
                buf += c
        partes.append(buf)
        return partes


# ---------------------------------------------------------------------------
# Sessão: monta o ambiente, roda o código e oferece ajudantes para os testes
# ---------------------------------------------------------------------------

class Sessao:
    def __init__(self, raiz):
        self.raiz = raiz
        for p in ("home/" + USUARIO, "tmp", "etc", "var/log", "usr/bin"):
            os.makedirs(os.path.join(raiz, p), exist_ok=True)
        with open(os.path.join(raiz, "etc", "hostname"), "w") as f:
            f.write(MAQUINA + "\n")
        with open(os.path.join(raiz, "etc", "os-release"), "w") as f:
            f.write('NAME="Ubuntu"\nVERSION="24.04 LTS (simulado)"\n')
        self.shell = Shell(raiz)
        instalar_git(self.shell)

    def escrever_arquivos(self, arquivos):
        for nome, conteudo in (arquivos or {}).items():
            v = nome if nome.startswith("/") else posixpath.join(CASA, nome)
            r = os.path.join(self.raiz, v.lstrip("/"))
            os.makedirs(os.path.dirname(r), exist_ok=True)
            with open(r, "w", encoding="utf-8", newline="") as f:
                f.write(conteudo)

    def preparar(self, setup):
        if setup and setup.strip():
            self.shell.executar_texto(setup, registrar=True)
            falhas = [t for t in self.shell.transcricao if t.get("codigo")]
            if falhas:
                self.erro_setup = "".join("$ %s\n%s" % (t["cmd"], t["err"] or t["out"]) for t in falhas)
            self.shell.transcricao = []
            self.shell.ultimo_codigo = 0

    def rodar(self, codigo):
        try:
            self.shell.executar_texto(codigo, registrar=True)
        except Sair:
            pass
        return self.shell.transcricao

    # ----- ajudantes para os testes -----
    def ler(self, p):
        return self.shell.ler(p)

    def existe(self, p):
        return os.path.exists(self.shell.real(p))

    def eh_pasta(self, p):
        return os.path.isdir(self.shell.real(p))

    def listar(self, p="."):
        r = self.shell.real(p)
        return sorted(os.listdir(r)) if os.path.isdir(r) else []

    def permissoes(self, p):
        r = self.shell.real(p)
        return modo_texto(self.shell.modo(r), os.path.isdir(r))

    def executa(self, cmd):
        out, err, c = self.shell.executar_texto(cmd)
        return out + err

    def cwd(self):
        return self.shell.cwd


def instalar_git(shell):
    """Substituída por minigit.py quando ele é carregado."""
    return None


def executar_sessao(codigo, setup="", arquivos=None, raiz=None):
    import tempfile
    raiz = raiz or tempfile.mkdtemp(prefix="ensaio_sh_")
    s = Sessao(raiz)
    s.escrever_arquivos(arquivos)
    s.preparar(setup)
    s.rodar(codigo)
    return s
