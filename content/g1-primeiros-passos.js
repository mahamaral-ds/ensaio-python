Ensaio.modulo((r) => ({
  id: "g1",
  trilha: "git",
  ordem: 1,
  titulo: "Primeiros passos",
  resumo: "Repositório, área de preparação e commits: git init, status, add, commit, log, diff, .gitignore e configuração.",
  arquivos: {
    "projeto/README.md": "# Análise de vendas\n",
    "projeto/analise.py": "import pandas as pd\n\ndf = pd.read_csv('dados/vendas.csv')\nprint(df.head())\n",
    "projeto/dados/vendas.csv": "data;regiao;valor\n2024-06-01;Sul;120\n2024-06-01;Sudeste;890\n",
    "projeto/.env": "DB_SENHA=123\n",
  },
  licoes: [
    {
      id: "init-status",
      titulo: "Repositório e git status",
      explicacao: [
        "O **Git** guarda o histórico de um projeto em fotografias chamadas **commits**. Com ele, você vê o que mudou, volta a versões antigas e trabalha com outras pessoas sem sobrescrever o trabalho de ninguém.",
        "`git init` transforma uma pasta num **repositório**, criando a pasta oculta `.git`, onde o histórico fica guardado.",
        "Um arquivo passa por três lugares: a **pasta de trabalho** (onde você edita), a **área de preparação** ou *staging* (o que vai entrar no próximo commit) e o **histórico** (os commits).",
        "`git status` é o comando mais importante: ele diz em qual branch você está e em que estado cada arquivo se encontra. Na dúvida, rode `git status`.",
        "> As mensagens do Git aparecem em inglês, como no seu computador. *Untracked files* são arquivos que o Git ainda não acompanha.",
      ],
      exemplo: r`
cd projeto
git init
git status
ls -a
`,
      erro: {
        codigo: r`
git status
`,
        explicacao: "Você está na pasta pessoal, que não é um repositório: `fatal: not a git repository`. Entre na pasta do projeto (`cd projeto`) ou crie o repositório com `git init`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve a área de preparação (*staging*)?",
          opcoes: ["Para guardar cópias de segurança automáticas", "Para escolher quais mudanças vão entrar no próximo commit", "Para enviar arquivos ao GitHub", "Para apagar arquivos do histórico"],
          resposta: 1,
          dicas: ["Ela fica entre a pasta de trabalho e o histórico.", "Nem toda mudança precisa ir para o mesmo commit.", "É onde você monta o próximo commit."],
          comentario: "Com o staging, você pode editar cinco arquivos e fazer dois commits separados, cada um com um assunto.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "A pasta `projeto` tem `.env`, `README.md`, `analise.py` e a pasta `dados`. Qual é a saída? (`git status -s` mostra o status resumido, e `??` marca arquivos não acompanhados.)",
          codigo: r`
cd projeto
git init
git status -s
`,
          opcoes: ["Initialized empty Git repository in /home/analista/projeto/.git/\n?? .env\n?? README.md\n?? analise.py\n?? dados/", "Initialized empty Git repository in /home/analista/projeto/.git/\nnothing to commit, working tree clean", "Initialized empty Git repository in /home/analista/projeto/.git/\nA  .env\nA  README.md\nA  analise.py\nA  dados/", "?? .env\n?? README.md\n?? analise.py\n?? dados/vendas.csv"],
          resposta: 0,
          dicas: ["O init mostra uma mensagem de confirmação.", "Nenhum arquivo foi adicionado ainda.", "Uma pasta inteira não acompanhada aparece como `dados/`."],
          comentario: "Logo depois do `git init`, tudo está *untracked*: o Git vê os arquivos, mas ainda não os acompanha.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para criar um repositório Git na pasta do projeto.",
          codigo: r`
cd projeto
git ___
`,
          respostas: [["init"]],
          testes: [["repo('~/projeto')", "~/projeto deve ser um repositório Git"]],
          dicas: ["É o comando que inicia um repositório.", "Quatro letras.", "`init`."],
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "Transforme a pasta `projeto` num repositório Git e mostre o status dele.",
          inicial: r`
`,
          testes: [
            ["repo('~/projeto')", "~/projeto deve ser um repositório Git"],
            ["assert 'Untracked files' in _out, _out", "Mostre o git status"],
          ],
          dicas: ["Primeiro entre na pasta.", "Depois crie o repositório.", "`cd projeto`, `git init` e `git status`."],
          solucao: r`
cd projeto
git init
git status
`,
        },
      ],
    },
    {
      id: "add-commit",
      titulo: "git add e git commit",
      setup: r`
cd projeto
git init
`,
      explicacao: [
        "`git add arquivo` coloca a versão atual do arquivo na área de preparação. `git add .` adiciona tudo da pasta atual (respeitando o `.gitignore`).",
        "`git commit -m \"mensagem\"` grava um commit com o que está preparado. Cada commit tem um identificador (o *hash*), o autor, a data e a mensagem.",
        "Escreva mensagens que digam **o que** mudou e, se não for óbvio, **por quê**: `Adiciona gráfico de vendas por região` é muito melhor que `ajustes`.",
        "Faça commits pequenos, com um assunto cada. Fica mais fácil entender o histórico e desfazer só o que deu errado.",
        "> Nesta lição, o repositório já foi criado na pasta `projeto`, e você começa dentro dela.",
      ],
      exemplo: r`
git add README.md
git status
git commit -m "Adiciona README"
git add analise.py dados
git commit -m "Adiciona análise de vendas"
git log --oneline
git status
`,
      erro: {
        codigo: r`
git commit -m "Primeira versão"
`,
        explicacao: "Nada foi preparado com `git add`, então não há o que gravar: `nothing added to commit but untracked files present`. Primeiro `git add`, depois `git commit`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída? (no `status -s`, `A` marca um arquivo novo já preparado)",
          codigo: r`
git add README.md
git status -s
`,
          opcoes: ["A  README.md\n?? .env\n?? analise.py\n?? dados/", "?? README.md\n?? .env\n?? analise.py\n?? dados/", "A  README.md", "A  .env\nA  README.md\nA  analise.py\nA  dados/"],
          resposta: 0,
          dicas: ["Só o README foi adicionado.", "Ele aparece primeiro, como preparado.", "Os outros continuam não acompanhados."],
          comentario: "Os arquivos preparados aparecem antes dos não acompanhados.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual destas é a melhor mensagem de commit?",
          opcoes: ["`ajustes`", "`Adiciona filtro por região no relatório de vendas`", "`commit 3`", "`mudei umas coisas no arquivo analise.py e no readme também`"],
          resposta: 1,
          dicas: ["Pense em quem vai ler o histórico daqui a seis meses.", "A mensagem deve dizer o que mudou.", "Curta, no imperativo e específica."],
          comentario: "Convenção comum: verbo no imperativo (Adiciona, Corrige, Remove) e até uns 50 caracteres na primeira linha.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para preparar os dois arquivos e gravar o commit.",
          codigo: r`
git ___ README.md analise.py
git ___ -m "Primeira versão da análise"
`,
          respostas: [["add"], ["commit"]],
          testes: [["r = repo('~/projeto')\nassert r.mensagens() == ['Primeira versão da análise'], r.mensagens()\nassert set(r.arquivos()) == {'README.md', 'analise.py'}, r.arquivos()", "Deve haver um commit com README.md e analise.py"]],
          dicas: ["Primeiro preparar, depois gravar.", "Os dois comandos mais usados do Git.", "`add` e `commit`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Faça **dois commits** separados: primeiro só o `README.md`, com a mensagem `Adiciona README`; depois o `analise.py` e a pasta `dados`, com `Adiciona análise de vendas`. O `.env` **não** deve entrar em nenhum commit.",
          inicial: r`
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.mensagens() == ['Adiciona análise de vendas', 'Adiciona README'], r.mensagens()", "Devem existir os dois commits, nessa ordem"],
            ["r = repo('~/projeto')\nassert set(r.arquivos('HEAD~1')) == {'README.md'}, r.arquivos('HEAD~1')", "O primeiro commit deve ter só o README.md"],
            ["r = repo('~/projeto')\nassert set(r.arquivos()) == {'README.md', 'analise.py', 'dados/vendas.csv'}, r.arquivos()", "O segundo commit deve trazer analise.py e dados/vendas.csv, sem o .env"],
          ],
          dicas: ["Cada commit tem o seu `git add`.", "Não use `git add .`, senão o `.env` entra junto.", "`git add analise.py dados` adiciona o arquivo e a pasta."],
          solucao: r`
git add README.md
git commit -m "Adiciona README"
git add analise.py dados
git commit -m "Adiciona análise de vendas"
git log --oneline
`,
          comentario: "O `.env` continua como *untracked*. Na lição de `.gitignore`, você vê como fazer o Git ignorá-lo de vez.",
        },
      ],
    },
    {
      id: "log-diff",
      titulo: "git log e git diff",
      setup: r`
cd projeto
git init
git add README.md analise.py
git commit -m "Primeira versão"
echo "print(df.describe())" >> analise.py
`,
      explicacao: [
        "`git log` mostra o histórico, do commit mais recente para o mais antigo. `git log --oneline` mostra uma linha por commit, com o hash curto e a mensagem.",
        "`git diff` mostra o que mudou na pasta de trabalho e **ainda não foi preparado**. Linhas com `+` foram acrescentadas e linhas com `-` foram removidas.",
        "Depois do `git add`, as mudanças saem do `git diff` e passam a aparecer em `git diff --staged`, que mostra o que vai entrar no commit.",
        "`git show` mostra o último commit com as mudanças dele (`git show HEAD~1`, o anterior).",
        "> Nesta lição já existe um commit, e o `analise.py` tem uma linha nova ainda não preparada.",
      ],
      exemplo: r`
git log
git log --oneline
git diff
git add analise.py
git diff
git diff --staged
git commit -m "Inclui estatísticas descritivas"
git show
`,
      erro: {
        codigo: r`
git add analise.py
git diff
`,
        explicacao: "O `git diff` não mostra nada, mas a mudança não sumiu: ela já está na área de preparação. Para vê-la, use `git diff --staged`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre `git diff` e `git diff --staged`?",
          opcoes: ["Nenhuma", "`git diff` mostra o que ainda não foi preparado; `--staged` mostra o que já está preparado para o commit", "`--staged` mostra os commits antigos", "`git diff` mostra só arquivos novos"],
          resposta: 1,
          dicas: ["Lembre das três áreas do Git.", "Um compara a pasta de trabalho com a preparação.", "O outro compara a preparação com o último commit."],
          comentario: "Um bom hábito: rodar `git diff --staged` antes de cada commit, para conferir o que vai entrar.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "O repositório tem um único commit. Qual é a saída?",
          codigo: r`
git log --oneline | wc -l
`,
          opcoes: ["1", "0", "2", "Primeira versão"],
          resposta: 0,
          dicas: ["`--oneline` mostra uma linha por commit.", "`wc -l` conta as linhas.", "Quantos commits existem?"],
          comentario: "O Git combina bem com as ferramentas de terminal da trilha de Linux.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para ver a mudança que **já foi preparada**.",
          codigo: r`
git add analise.py
git diff ___
`,
          respostas: [["--staged", "--cached"]],
          testes: [["assert '+print(df.describe())' in _out, _out", "Deve aparecer a linha acrescentada em analise.py"]],
          dicas: ["Depois do add, o diff simples fica vazio.", "Existe uma opção para ver o que está preparado.", "`--staged`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Veja o que mudou com `git diff`, grave a mudança num commit com a mensagem `Inclui estatísticas descritivas` e mostre o histórico resumido.",
          inicial: r`
`,
          testes: [
            ["assert 'diff --git a/analise.py' in _out", "Mostre o git diff antes de fazer o commit"],
            ["assert repo('~/projeto').mensagens() == ['Inclui estatísticas descritivas', 'Primeira versão']", "Deve haver o novo commit em cima do primeiro"],
            ["assert '--oneline' in _src", "Mostre o histórico com git log --oneline"],
          ],
          dicas: ["Três passos: ver, gravar e conferir.", "Para gravar, primeiro `git add analise.py`.", "Depois `git commit -m \"...\"` e `git log --oneline`."],
          solucao: r`
git diff
git add analise.py
git commit -m "Inclui estatísticas descritivas"
git log --oneline
`,
          comentario: "`git commit -am \"...\"` prepara e grava de uma vez os arquivos já acompanhados. Arquivos novos ainda precisam de `git add`.",
        },
      ],
    },
    {
      id: "gitignore-config",
      titulo: ".gitignore e git config",
      setup: r`
cd projeto
git init
`,
      explicacao: [
        "O arquivo `.gitignore` lista o que o Git deve **ignorar**: senhas (`.env`), dados brutos ou pesados (`dados/`), arquivos gerados (`__pycache__/`, `*.log`), ambientes (`.venv/`).",
        "Cada linha é um padrão: `.env` (o arquivo), `*.log` (qualquer .log), `dados/` (a pasta inteira) e `!dados/LEIAME.md` (exceção: este, sim, entra).",
        "O `.gitignore` só vale para arquivos que **ainda não** são acompanhados. Se um arquivo já entrou num commit, tire-o do Git com `git rm --cached arquivo`.",
        "`git config user.name \"Seu Nome\"` e `git config user.email \"voce@empresa.com\"` definem quem assina os commits. No seu computador, use `--global` para valer em todos os repositórios.",
      ],
      exemplo: r`
echo ".env" > .gitignore
echo "__pycache__/" >> .gitignore
cat .gitignore
git status
git config user.name "Ana Souza"
git config user.email "ana@empresa.com"
git config user.name
`,
      erro: {
        codigo: r`
git add .
git commit -m "Primeira versão"
echo ".env" > .gitignore
git add .gitignore
git commit -m "Ignora .env"
git log --oneline
git show --stat HEAD~1
`,
        explicacao: "O `.env` entrou no primeiro commit, antes do `.gitignore` existir. Ignorar depois não o tira do histórico. Use `git rm --cached .env` e faça um commit. Se a senha já foi enviada ao GitHub, troque a senha: ela continua no histórico.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual destes **não** deveria ir para um repositório Git?",
          opcoes: ["O script de análise", "O README.md", "O arquivo `.env` com a senha do banco", "O `.gitignore`"],
          resposta: 2,
          dicas: ["Repositórios são compartilhados, às vezes publicamente.", "O que acontece se alguém ler esse arquivo?", "Segredos ficam fora do Git."],
          comentario: "Senhas e chaves vão para variáveis de ambiente ou para um gerenciador de segredos, nunca para o repositório.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
echo ".env" > .gitignore
git status -s
`,
          opcoes: ["?? .gitignore\n?? README.md\n?? analise.py\n?? dados/", "?? .env\n?? .gitignore\n?? README.md\n?? analise.py\n?? dados/", "?? README.md\n?? analise.py\n?? dados/", "nothing to commit"],
          resposta: 0,
          dicas: ["O `.env` passou a ser ignorado.", "O próprio `.gitignore` é um arquivo novo.", "Ele deve ser acompanhado."],
          comentario: "O `.gitignore` entra no repositório, para que todos que clonarem o projeto ignorem as mesmas coisas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para definir o seu nome como autor dos commits.",
          codigo: r`
git config user.___ "Ana Souza"
git config user.name
`,
          respostas: [["name"]],
          testes: [["assert repo('~/projeto').config('user.name') == 'Ana Souza'", "user.name deve ser Ana Souza"]],
          dicas: ["A chave tem duas partes: user e mais uma.", "Uma é o nome, a outra o e-mail.", "`name`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Configure o seu nome e e-mail no repositório, crie um `.gitignore` que ignore o `.env` e a pasta `dados/` (os dados brutos não vão para o Git) e faça um commit com todo o resto, com a mensagem `Estrutura inicial`.",
          inicial: r`
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.config('user.name') not in (None, 'Analista') and r.config('user.email') not in (None, 'analista@exemplo.com'), (r.config('user.name'), r.config('user.email'))", "Configure user.name e user.email com os seus dados"],
            ["r = repo('~/projeto')\nassert set(r.arquivos()) == {'.gitignore', 'README.md', 'analise.py'}, r.arquivos()", "O commit deve ter só .gitignore, README.md e analise.py"],
            ["assert repo('~/projeto').mensagens() == ['Estrutura inicial']", "A mensagem deve ser 'Estrutura inicial'"],
          ],
          dicas: ["Dois `git config` primeiro.", "Monte o `.gitignore` com `echo ... >` e `echo ... >>`.", "Com o `.gitignore` pronto, `git add .` já deixa de fora o que é ignorado."],
          solucao: r`
git config user.name "Ana Souza"
git config user.email "ana@empresa.com"
echo ".env" > .gitignore
echo "dados/" >> .gitignore
git add .
git status
git commit -m "Estrutura inicial"
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "primeiro-repo",
      titulo: "O primeiro repositório do relatório",
      enunciado: [
        "Comece um projeto novo do zero, versionado desde o primeiro dia. Crie a pasta `~/relatorio-vendas`, transforme-a num repositório e faça dois commits:",
        "1. um `README.md` com a linha `# Relatório de vendas`, com a mensagem `Adiciona README`;",
        "2. uma cópia de `~/projeto/analise.py` dentro do novo projeto, com a mensagem `Adiciona script de análise`.",
        "No fim, o status deve estar limpo.",
      ],
      inicial: r`
`,
      testes: [
        ["r = repo('~/relatorio-vendas')\nassert r.mensagens() == ['Adiciona script de análise', 'Adiciona README'], r.mensagens()", "Os dois commits devem existir, nessa ordem"],
        ["r = repo('~/relatorio-vendas')\na = r.arquivos()\nassert a.get('README.md') == '# Relatório de vendas\\n' and a.get('analise.py') == ler('~/projeto/analise.py'), a", "README.md e analise.py devem estar no último commit"],
        ["assert repo('~/relatorio-vendas').limpo()", "O status deve estar limpo (nada pendente)"],
      ],
      dicas: ["`mkdir relatorio-vendas`, `cd relatorio-vendas` e `git init`.", "O README sai de um `echo \"# Relatório de vendas\" > README.md`.", "Para a cópia, `cp ~/projeto/analise.py .` (o ponto é a pasta atual)."],
      solucao: r`
mkdir relatorio-vendas
cd relatorio-vendas
git init
echo "# Relatório de vendas" > README.md
git add README.md
git commit -m "Adiciona README"
cp ~/projeto/analise.py .
git add analise.py
git commit -m "Adiciona script de análise"
git status
`,
    },
    {
      id: "segredos",
      titulo: "Proteger segredos e dados",
      enunciado: [
        "No `projeto`, prepare o primeiro commit com estas regras: o `.env` nunca entra; os CSVs de `dados/` também não; mas a pasta `dados` deve ter um `LEIAME.md` explicando a origem dos dados, e esse arquivo **deve** entrar no Git.",
        "Crie `dados/LEIAME.md` (qualquer texto), o `.gitignore` adequado e faça o commit `Projeto inicial`. No fim, o status deve estar limpo.",
      ],
      inicial: r`
cd projeto
git init
`,
      testes: [
        ["r = repo('~/projeto')\nassert set(r.arquivos()) == {'.gitignore', 'README.md', 'analise.py', 'dados/LEIAME.md'}, r.arquivos()", "O commit deve ter .gitignore, README.md, analise.py e dados/LEIAME.md"],
        ["assert repo('~/projeto').limpo(), repo('~/projeto').status()", "O status deve ficar limpo: .env e os CSVs ignorados"],
        ["assert repo('~/projeto').mensagens() == ['Projeto inicial']", "A mensagem deve ser 'Projeto inicial'"],
      ],
      dicas: ["Ignore os CSVs com um padrão, não a pasta inteira: `dados/*.csv`.", "Ignorar `dados/` inteira esconderia também o LEIAME.", "`.gitignore` com `.env` e `dados/*.csv`, depois `git add .` e o commit."],
      solucao: r`
cd projeto
git init
echo "Dados exportados do sistema de vendas, atualizados toda segunda." > dados/LEIAME.md
echo ".env" > .gitignore
echo "dados/*.csv" >> .gitignore
git add .
git status
git commit -m "Projeto inicial"
`,
      comentario: "Outra forma: ignorar `dados/` e criar uma exceção com `!dados/LEIAME.md`. Mas o Git não olha dentro de uma pasta ignorada inteira, então o padrão `dados/*.csv` é mais simples e seguro.",
    },
  ],
}));
