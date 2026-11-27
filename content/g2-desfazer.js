Ensaio.modulo((r) => ({
  id: "g2",
  trilha: "git",
  ordem: 2,
  titulo: "Desfazer e consertar",
  resumo: "Descartar mudanças, corrigir o último commit, voltar no histórico, reverter com segurança e guardar trabalho com stash.",
  arquivos: {
    "projeto/README.md": "# Análise de vendas\n",
    "projeto/analise.py": "import pandas as pd\n\ndf = pd.read_csv('dados/vendas.csv')\nprint(df.head())\n",
    "projeto/dados/vendas.csv": "data;regiao;valor\n2024-06-01;Sul;120\n2024-06-01;Sudeste;890\n",
    "projeto/.env": "DB_SENHA=123\n",
  },
  // em todas as lições: repositório com dois commits, e você começa dentro de ~/projeto
  setup: r`
cd projeto
git init
git add README.md analise.py
git commit -m "Primeira versão"
echo "print(df.describe())" >> analise.py
git commit -am "Inclui estatísticas"
`,
  licoes: [
    {
      id: "restore",
      titulo: "Descartar mudanças com git restore",
      explicacao: [
        "`git restore arquivo` descarta as mudanças da pasta de trabalho e volta o arquivo para a versão preparada (ou a do último commit).",
        "`git restore --staged arquivo` tira o arquivo da área de preparação, sem perder a edição: é o \"desfazer\" do `git add`.",
        "O próprio `git status` sugere esses comandos: leia as dicas entre parênteses que ele mostra.",
        "> Neste módulo, o repositório já tem dois commits (`Primeira versão` e `Inclui estatísticas`), e você começa dentro de `~/projeto`.",
      ],
      exemplo: r`
echo "linha acidental" >> analise.py
git status
git restore analise.py
git status
git add .env
git status -s
git restore --staged .env
git status -s
`,
      erro: {
        codigo: r`
echo "trabalho de duas horas" >> analise.py
git restore analise.py
cat analise.py
`,
        explicacao: "`git restore` descarta a edição **de vez**: o que não foi commitado não fica guardado em lugar nenhum. Antes de restaurar, confira com `git diff`. Se quiser guardar para depois, use `git stash` (lição 4).",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Você deu `git add` num arquivo por engano, mas quer manter a edição. O que usar?",
          opcoes: ["`git restore arquivo`", "`git restore --staged arquivo`", "`git rm arquivo`", "`git reset --hard`"],
          resposta: 1,
          dicas: ["Você quer só tirar da área de preparação.", "A edição deve continuar na pasta.", "Existe uma opção que mexe só no staging."],
          comentario: "`git restore` sem opção descartaria a edição, e `git reset --hard` descartaria tudo.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "No último commit, o `README.md` tem a linha `# Análise de vendas`. Qual é a saída?",
          codigo: r`
echo "x" > README.md
git restore README.md
cat README.md
`,
          opcoes: ["# Análise de vendas", "x", "# Análise de vendas\nx", "(arquivo vazio)"],
          resposta: 0,
          dicas: ["O echo substituiu o conteúdo.", "O restore volta para a versão guardada.", "Ou seja, a do último commit."],
          comentario: "O arquivo voltou exatamente para a versão do commit.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para tirar o README da área de preparação, **sem** perder a edição.",
          codigo: r`
echo "teste" >> README.md
git add README.md
git restore ___ README.md
git status -s
`,
          respostas: [["--staged", "-S"]],
          testes: [["s = repo('~/projeto').status()\nassert s['staged'] == [] and s['modificados'] == ['README.md'], s", "README.md deve sair do stage e continuar modificado"]],
          dicas: ["A opção mexe só na área de preparação.", "O mesmo nome usado no `git diff`.", "`--staged`."],
        },
        {
          tipo: "escrever", nivel: 2,
          setup: r`
echo "linha com erro" >> analise.py
git add .env
`,
          enunciado: "Você editou o `analise.py` por engano e ainda colocou o `.env` na área de preparação. Desfaça as duas coisas: tire o `.env` do stage (o arquivo continua existindo) e descarte a edição do `analise.py`.",
          inicial: r`
git status
`,
          testes: [
            ["assert repo('~/projeto').staged == [], repo('~/projeto').staged", "Nada deve ficar na área de preparação"],
            ["assert ler('~/projeto/analise.py') == repo('~/projeto').arquivos()['analise.py']", "analise.py deve voltar a ser igual ao do último commit"],
            ["assert existe('~/projeto/.env')", "O .env deve continuar existindo na pasta"],
          ],
          dicas: ["Comece pelo `git status` para ver o estado.", "Para o `.env`: `git restore --staged .env`.", "Para o analise.py: `git restore analise.py`."],
          solucao: r`
git status
git restore --staged .env
git restore analise.py
git status
`,
        },
      ],
    },
    {
      id: "amend-reset",
      titulo: "Corrigir commits: amend e reset",
      explicacao: [
        "`git commit --amend -m \"nova mensagem\"` **refaz o último commit**: troca a mensagem e inclui o que estiver preparado. Ótimo para um arquivo esquecido ou um erro de digitação.",
        "`git reset` move a branch para um commit anterior. `HEAD~1` é o commit anterior ao atual, `HEAD~2` o de antes, e assim por diante:",
        "- `git reset --soft HEAD~1`: desfaz o commit e deixa as mudanças **preparadas**;",
        "- `git reset HEAD~1` (o padrão, `--mixed`): desfaz o commit e deixa as mudanças **na pasta**, fora do stage;",
        "- `git reset --hard HEAD~1`: desfaz o commit **e apaga** as mudanças. Use com muito cuidado.",
        "> Amend e reset **reescrevem o histórico**. Use só em commits que ainda não foram enviados para o GitHub. Para desfazer algo já compartilhado, use `git revert` (próxima lição).",
      ],
      exemplo: r`
git log --oneline
git commit --amend -m "Inclui estatísticas descritivas"
git log --oneline
git reset --soft HEAD~1
git status
git commit -m "Inclui estatísticas (de novo)"
git log --oneline
`,
      erro: {
        codigo: r`
echo "análise nova, sem commit" >> analise.py
git reset --hard HEAD~1
cat analise.py
`,
        explicacao: "O `--hard` voltou o commit **e apagou** a edição que não tinha commit, sem pedir confirmação. Antes de um reset `--hard`, rode `git status` e faça commit ou `git stash` do que quiser manter.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Depois de `git reset --soft HEAD~1`, onde ficam as mudanças do commit desfeito?",
          opcoes: ["Apagadas", "Na área de preparação, prontas para um novo commit", "Só na pasta, fora do stage", "No GitHub"],
          resposta: 1,
          dicas: ["*Soft* é o mais suave dos três.", "Nada é perdido.", "As mudanças ficam como estavam logo antes do commit."],
          comentario: "Soft: preparadas. Mixed (padrão): na pasta. Hard: apagadas.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "O repositório tem 2 commits, e `.env` e `dados/` não são acompanhados. Qual é a saída? (`M` na primeira coluna do `status -s` é uma modificação preparada.)",
          codigo: r`
git reset --soft HEAD~1
git log --oneline | wc -l
git status -s
`,
          opcoes: ["1\nM  analise.py\n?? .env\n?? dados/", "2\n?? .env\n?? dados/", "1\n M analise.py\n?? .env\n?? dados/", "1\n?? .env\n?? dados/"],
          resposta: 0,
          dicas: ["O último commit saiu do histórico.", "Com --soft, a mudança dele fica preparada.", "Preparado aparece na primeira coluna: `M ` seguido do nome."],
          comentario: "Com `git reset HEAD~1` (mixed), a linha seria ` M analise.py`, com o M na segunda coluna.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para corrigir a mensagem do último commit.",
          codigo: r`
git commit --___ -m "Inclui estatísticas descritivas"
git log --oneline
`,
          respostas: [["amend"]],
          testes: [["assert repo('~/projeto').mensagens() == ['Inclui estatísticas descritivas', 'Primeira versão'], repo('~/projeto').mensagens()", "O último commit deve ter a nova mensagem, sem criar um commit a mais"]],
          dicas: ["A opção refaz o último commit.", "Em inglês, emendar.", "`amend`."],
        },
        {
          tipo: "escrever", nivel: 2,
          setup: r`
echo "SENHA=123" > config.txt
git add config.txt
git commit -m "Adiciona config"
`,
          enunciado: "O último commit (`Adiciona config`) incluiu um `config.txt` com senha. Ele ainda não foi enviado a ninguém. Desfaça esse commit mantendo o `config.txt` na pasta, mas fora do Git; acrescente `config.txt` ao `.gitignore` e faça o commit `Ignora config.txt`.",
          inicial: r`
git log --oneline
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.mensagens() == ['Ignora config.txt', 'Inclui estatísticas', 'Primeira versão'], r.mensagens()", "O commit 'Adiciona config' deve sumir, e o 'Ignora config.txt' ficar no topo"],
            ["r = repo('~/projeto')\nassert 'config.txt' not in r.arquivos() and 'config.txt' in r.arquivos()['.gitignore']", "config.txt não deve estar no Git, e deve constar no .gitignore"],
            ["assert existe('~/projeto/config.txt')", "config.txt deve continuar na pasta"],
          ],
          dicas: ["Um reset sem `--hard` mantém o arquivo na pasta.", "`git reset HEAD~1` desfaz o commit e deixa o config.txt como arquivo não acompanhado.", "Depois: `echo \"config.txt\" >> .gitignore`, `git add .gitignore` e o commit."],
          solucao: r`
git reset HEAD~1                 # desfaz o commit; config.txt fica na pasta
echo "config.txt" >> .gitignore
git add .gitignore
git commit -m "Ignora config.txt"
git status
`,
        },
      ],
    },
    {
      id: "revert",
      titulo: "Reverter com segurança: git revert",
      explicacao: [
        "`git revert commit` cria um **commit novo** que desfaz as mudanças de um commit antigo. O histórico não é reescrito: o erro continua registrado, junto com a correção.",
        "É a forma certa de desfazer algo que **já foi compartilhado** (enviado ao GitHub, usado por colegas), porque não muda os commits que outras pessoas já têm.",
        "Dá para reverter qualquer commit, não só o último: `git revert HEAD~2` desfaz o antepenúltimo e mantém os que vieram depois.",
        "Comparando: o reset **apaga** o commit da história (bom só para commits locais); o revert **acrescenta** um commit de correção (bom para o que já foi publicado).",
      ],
      exemplo: r`
git log --oneline
git revert HEAD
git log --oneline
cat analise.py
`,
      erro: {
        codigo: r`
echo "edição em andamento" >> analise.py
git revert HEAD
`,
        explicacao: "O revert precisa de uma pasta limpa para aplicar a correção. Faça o commit ou um `git stash` das edições em andamento e tente de novo.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Um commit com um bug já foi enviado ao GitHub, e os colegas já baixaram. Como desfazer?",
          opcoes: ["`git reset --hard HEAD~1` e enviar de novo", "`git revert` no commit com o bug, e enviar o novo commit", "Apagar o repositório e criar outro", "`git commit --amend`"],
          resposta: 1,
          dicas: ["Os colegas já têm aquele commit.", "Reescrever o histórico deixaria o repositório deles diferente do seu.", "O revert desfaz com um commit novo."],
          comentario: "Reset e amend em commits compartilhados obrigam todos a lidar com históricos divergentes. O revert evita isso.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "O repositório tem 2 commits. Qual é a saída?",
          codigo: r`
git revert HEAD > /dev/null
git log --oneline | wc -l
`,
          opcoes: ["3", "1", "2", "0"],
          resposta: 0,
          dicas: ["O revert não apaga o commit.", "Ele cria um commit novo.", "2 + 1."],
          comentario: "O histórico passa a ter o commit original e o commit que o desfaz.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para desfazer o último commit **sem** reescrever o histórico.",
          codigo: r`
git ___ HEAD
git log --oneline
`,
          respostas: [["revert"]],
          testes: [["r = repo('~/projeto')\nassert r.mensagens()[0] == 'Revert \"Inclui estatísticas\"' and len(r.mensagens()) == 3, r.mensagens()\nassert r.arquivos()['analise.py'] == r.arquivos('HEAD~2')['analise.py']", "Deve haver um commit de revert, e o analise.py deve voltar ao da primeira versão"]],
          dicas: ["Não é reset.", "É o comando que cria um commit de desfazer.", "`revert`."],
        },
        {
          tipo: "escrever", nivel: 2,
          setup: r`
echo "Separador: ponto e vírgula" >> README.md
git commit -am "Documenta separador"
`,
          enunciado: "O commit `Inclui estatísticas` (o **penúltimo**) causou problemas, mas o último (`Documenta separador`) está certo. Desfaça só o penúltimo, mantendo o último e sem reescrever o histórico.",
          inicial: r`
git log --oneline
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.mensagens()[0] == 'Revert \"Inclui estatísticas\"' and len(r.mensagens()) == 4, r.mensagens()", "Deve haver um commit de revert do 'Inclui estatísticas', sem apagar commits"],
            ["a = repo('~/projeto').arquivos()\nassert 'Separador' in a['README.md'] and 'describe' not in a['analise.py'], a", "O README continua com o separador e o analise.py perde a linha de estatísticas"],
          ],
          dicas: ["Encontre o commit no `git log --oneline`.", "O penúltimo é `HEAD~1`.", "`git revert HEAD~1`."],
          solucao: r`
git log --oneline
git revert HEAD~1      # desfaz só o penúltimo commit
git log --oneline
`,
        },
      ],
    },
    {
      id: "stash",
      titulo: "Guardar trabalho com git stash",
      explicacao: [
        "`git stash` guarda as mudanças em andamento (dos arquivos acompanhados) numa gaveta e deixa a pasta limpa, como no último commit.",
        "É útil quando surge algo urgente no meio de um trabalho, ou quando um comando (como `git switch` ou `git pull`) reclama de mudanças locais.",
        "`git stash list` mostra o que está guardado, `git stash pop` traz de volta e remove da gaveta, e `git stash apply` traz de volta mantendo uma cópia guardada.",
        "> Arquivos novos (não acompanhados) não entram no stash por padrão. No Git de verdade, `git stash -u` os inclui.",
      ],
      exemplo: r`
echo "# ideia em andamento" >> analise.py
git status -s
git stash
git status -s
git stash list
git stash pop
git status -s
`,
      erro: {
        codigo: r`
git stash pop
`,
        explicacao: "A gaveta está vazia: `No stash entries found`. Confira com `git stash list` antes de tentar recuperar.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Você está no meio de uma mudança e precisa corrigir algo urgente, num commit separado. O que fazer primeiro?",
          opcoes: ["`git reset --hard`", "`git stash`, para guardar o trabalho e limpar a pasta", "Apagar os arquivos alterados", "Fazer um commit com tudo misturado"],
          resposta: 1,
          dicas: ["Você não quer perder o trabalho em andamento.", "Mas também não quer misturá-lo com a correção.", "Guarde temporariamente."],
          comentario: "Depois da correção, `git stash pop` traz o trabalho de volta.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "O `.env` e a pasta `dados/` não são acompanhados pelo Git. Qual é a saída?",
          codigo: r`
echo "rascunho" >> README.md
git stash > /dev/null
git status -s
git stash list | wc -l
`,
          opcoes: ["?? .env\n?? dados/\n1", " M README.md\n?? .env\n?? dados/\n1", "?? .env\n?? dados/\n0", "1"],
          resposta: 0,
          dicas: ["O stash guarda a mudança do README.", "Os não acompanhados continuam aparecendo.", "Há uma entrada na gaveta."],
          comentario: "O README voltou a ficar igual ao do commit, e a edição está guardada em `stash@{0}`.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para trazer de volta o trabalho guardado.",
          codigo: r`
echo "rascunho" >> README.md
git stash
git stash ___
cat README.md
`,
          respostas: [["pop", "apply"]],
          testes: [["assert 'rascunho' in ler('~/projeto/README.md')", "A edição do README deve voltar"]],
          dicas: ["É o comando que tira da gaveta.", "O nome lembra estourar uma bolha.", "`pop`."],
        },
        {
          tipo: "escrever", nivel: 2,
          setup: r`
echo "# ideia em andamento" >> analise.py
`,
          enunciado: "Você está editando o `analise.py` (a edição ainda não está pronta) quando pedem, com urgência, para acrescentar a linha `Contato: dados@empresa.com` ao `README.md`. Guarde o trabalho em andamento, faça a correção num commit `Adiciona contato` e depois traga o trabalho de volta.",
          inicial: r`
git status
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.mensagens()[0] == 'Adiciona contato' and 'Contato: dados@empresa.com' in r.arquivos()['README.md']", "Deve haver o commit 'Adiciona contato' com a linha no README"],
            ["assert 'ideia em andamento' not in repo('~/projeto').arquivos()['analise.py']", "A edição do analise.py não pode entrar nesse commit"],
            ["assert 'ideia em andamento' in ler('~/projeto/analise.py') and repo('~/projeto').stash == []", "A edição deve voltar para a pasta, e a gaveta deve ficar vazia"],
          ],
          dicas: ["`git stash` primeiro.", "Depois `echo \"Contato: dados@empresa.com\" >> README.md` e o commit.", "Por fim, `git stash pop`."],
          solucao: r`
git stash
echo "Contato: dados@empresa.com" >> README.md
git commit -am "Adiciona contato"
git stash pop
git status
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "consertar-commit",
      titulo: "Consertar um commit apressado",
      setup: r`
echo "import matplotlib.pyplot as plt" > grafico.py
echo "Gráfico de barras por região" > legenda.txt
git add grafico.py
git commit -m "wip"
`,
      enunciado: [
        "Você fez um commit apressado: a mensagem ficou `wip` e o arquivo `legenda.txt` ficou de fora. Como ainda não enviou a ninguém, conserte **o mesmo commit**: inclua o `legenda.txt` e troque a mensagem para `Adiciona gráfico de vendas`. O histórico deve continuar com três commits.",
      ],
      inicial: r`
git log --oneline
git status
`,
      testes: [
        ["r = repo('~/projeto')\nassert r.mensagens() == ['Adiciona gráfico de vendas', 'Inclui estatísticas', 'Primeira versão'], r.mensagens()", "O histórico deve ter três commits, com a mensagem corrigida no topo"],
        ["a = repo('~/projeto').arquivos()\nassert 'grafico.py' in a and 'legenda.txt' in a, sorted(a)", "O commit deve incluir grafico.py e legenda.txt"],
      ],
      dicas: ["Primeiro prepare o arquivo esquecido.", "`git add legenda.txt`.", "Depois `git commit --amend -m \"Adiciona gráfico de vendas\"`."],
      solucao: r`
git add legenda.txt
git commit --amend -m "Adiciona gráfico de vendas"
git log --oneline
`,
    },
    {
      id: "reverter-publicado",
      titulo: "Desfazer um erro que já foi publicado",
      setup: r`
echo "import pandas as pd" > analise.py
git commit -am "Remove leitura do CSV"
echo "Responsável: time de dados" >> README.md
git commit -am "Atualiza README"
`,
      enunciado: [
        "O commit `Remove leitura do CSV` quebrou o relatório, e o histórico **já foi compartilhado** com o time. O commit seguinte (`Atualiza README`) está correto e deve continuar.",
        "Desfaça o commit problemático do jeito seguro para histórico compartilhado, deixando o `analise.py` como estava antes dele.",
      ],
      inicial: r`
git log --oneline
`,
      testes: [
        ["r = repo('~/projeto')\nassert r.mensagens()[0] == 'Revert \"Remove leitura do CSV\"' and len(r.mensagens()) == 5, r.mensagens()", "Deve haver um commit de revert, sem apagar commits (5 no total)"],
        ["r = repo('~/projeto')\na = r.arquivos()\nassert a['analise.py'] == r.arquivos('HEAD~3')['analise.py'] and 'Responsável' in a['README.md']", "O analise.py volta ao estado anterior, e o README continua atualizado"],
      ],
      dicas: ["Para histórico compartilhado, use revert, não reset.", "O commit problemático é o penúltimo.", "`git revert HEAD~1`."],
      solucao: r`
git log --oneline
git revert HEAD~1
git log --oneline
cat analise.py
`,
    },
  ],
}));
