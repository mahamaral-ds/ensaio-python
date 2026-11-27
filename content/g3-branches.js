Ensaio.modulo((r) => ({
  id: "g3",
  trilha: "git",
  ordem: 3,
  titulo: "Branches e merge",
  resumo: "Trabalhar em paralelo com branches, juntar com merge, resolver conflitos e marcar versões com tags.",
  arquivos: {
    "projeto/README.md": "# Análise de vendas\n",
    "projeto/analise.py": "import pandas as pd\n\ndf = pd.read_csv('dados/vendas.csv')\nprint(df.head())\n",
    "projeto/dados/vendas.csv": "data;regiao;valor\n2024-06-01;Sul;120\n2024-06-01;Sudeste;890\n",
    "projeto/.env": "DB_SENHA=123\n",
  },
  setup: r`
cd projeto
git init
git add README.md analise.py
git commit -m "Primeira versão"
`,
  licoes: [
    {
      id: "branch-switch",
      titulo: "Criar e trocar de branch",
      explicacao: [
        "Uma **branch** é uma linha de trabalho independente. Na prática, é só um nome que aponta para um commit e avança a cada commit novo.",
        "O repositório começa com a branch `main`. Para experimentar algo sem mexer na versão principal, crie outra: `git switch -c feature/grafico` cria e já entra nela.",
        "`git branch` lista as branches, com `*` na atual. `git switch main` volta para a main, e os arquivos da pasta mudam para refletir a branch escolhida.",
        "Use nomes descritivos, como `feature/grafico-regiao` e `correcao/valores-nulos`. Em comandos antigos e tutoriais, você vai ver `git checkout -b nome`, que faz o mesmo que `git switch -c`.",
        "> Neste módulo, o repositório já tem o commit `Primeira versão` na `main`, e você começa dentro de `~/projeto`.",
      ],
      exemplo: r`
git branch
git switch -c feature/grafico
echo "df.plot(kind='bar')" > grafico.py
git add grafico.py
git commit -m "Adiciona gráfico"
git log --oneline --all
git switch main
ls
git switch feature/grafico
ls
`,
      erro: {
        codigo: r`
git switch feature/nova
`,
        explicacao: "A branch ainda não existe: `fatal: invalid reference`. Para criar e entrar ao mesmo tempo, use `git switch -c feature/nova`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que é uma branch no Git?",
          opcoes: ["Uma cópia completa da pasta do projeto", "Um nome que aponta para um commit e acompanha os commits novos feitos nela", "Um backup automático no GitHub", "Um arquivo de configuração"],
          resposta: 1,
          dicas: ["Criar uma branch é instantâneo, mesmo em projetos enormes.", "Ela não duplica os arquivos.", "É um ponteiro para um commit."],
          comentario: "Por isso branches são baratas: crie uma para cada experimento.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
git switch -c teste
git branch
`,
          opcoes: ["Switched to a new branch 'teste'\n  main\n* teste", "Switched to a new branch 'teste'\n* main\n  teste", "* teste", "main\nteste"],
          resposta: 0,
          dicas: ["`-c` cria e já troca para a branch.", "O `*` marca a branch atual.", "A lista sai em ordem alfabética."],
          comentario: "A branch nova começa no mesmo commit em que você estava.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para criar a branch `feature/limpeza` e entrar nela.",
          codigo: r`
git switch ___ feature/limpeza
git branch
`,
          respostas: [["-c", "--create"]],
          testes: [["assert repo('~/projeto').branch == 'feature/limpeza'", "Você deve estar na branch feature/limpeza"]],
          dicas: ["Sozinho, o switch só troca para branches que já existem.", "Uma opção de uma letra cria a branch.", "`-c`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a branch `feature/grafico`, acrescente nela o arquivo `grafico.py` (com qualquer conteúdo) num commit `Adiciona gráfico` e volte para a `main`.",
          inicial: r`
`,
          testes: [
            ["r = repo('~/projeto')\nassert 'feature/grafico' in r.branches and r.mensagens('feature/grafico')[0] == 'Adiciona gráfico', r.branches", "A branch feature/grafico deve ter o commit 'Adiciona gráfico'"],
            ["assert repo('~/projeto').branch == 'main' and not existe('~/projeto/grafico.py')", "No fim, você deve estar na main, que ainda não tem o grafico.py"],
          ],
          dicas: ["`git switch -c feature/grafico`.", "Crie o arquivo com `echo ... > grafico.py`, depois `git add` e `git commit`.", "Termine com `git switch main` e confira com `ls`."],
          solucao: r`
git switch -c feature/grafico
echo "df.plot(kind='bar')" > grafico.py
git add grafico.py
git commit -m "Adiciona gráfico"
git switch main
ls
`,
        },
      ],
    },
    {
      id: "merge",
      titulo: "Juntar branches com merge",
      setup: r`
git switch -c feature/grafico
echo "df.plot(kind='bar')" > grafico.py
git add grafico.py
git commit -m "Adiciona gráfico"
git switch main
`,
      explicacao: [
        "`git merge outra-branch` traz para a branch **atual** os commits da outra. Primeiro vá para quem vai receber (`git switch main`) e depois rode o merge.",
        "Se a main não andou desde que a feature foi criada, o Git só avança o ponteiro: é um **fast-forward**, sem commit novo.",
        "Se as duas andaram, o Git cria um **commit de merge**, com dois pais, que junta os dois caminhos.",
        "Depois de juntar, apague a branch que já foi integrada: `git branch -d feature/grafico`. O `-d` recusa apagar uma branch que ainda não foi juntada, o que evita perder trabalho.",
        "> Nesta lição, a branch `feature/grafico` já existe, com o commit `Adiciona gráfico`, e você começa na `main`.",
      ],
      exemplo: r`
git log --oneline --all
git merge feature/grafico
git log --oneline
git branch -d feature/grafico
git branch
`,
      erro: {
        codigo: r`
git branch -d feature/grafico
`,
        explicacao: "A branch tem um commit que ainda não está na main: `not fully merged`. O Git impede que você perca esse trabalho. Faça o merge antes ou, se tiver certeza de que quer descartar, use `-D`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 2,
          enunciado: "O que é um merge *fast-forward*?",
          opcoes: ["Um merge que apaga a branch automaticamente", "Quando a branch de destino não andou, e o Git só avança o ponteiro dela, sem criar commit de merge", "Um merge que ignora conflitos", "Um merge feito direto no GitHub"],
          resposta: 1,
          dicas: ["*Fast-forward* é avançar a fita.", "Não há duas linhas de trabalho para juntar.", "A main simplesmente passa a apontar para o último commit da feature."],
          comentario: "Para forçar um commit de merge mesmo nesse caso (e deixar registrado que houve uma feature), use `git merge --no-ff`.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "A main tem 1 commit e a feature/grafico tem 1 commit a mais. Qual é a saída?",
          codigo: r`
git merge feature/grafico > /dev/null
git log --oneline | wc -l
`,
          opcoes: ["2", "3", "1", "0"],
          resposta: 0,
          dicas: ["A main não andou desde a criação da feature.", "O merge é um fast-forward.", "Não há commit de merge."],
          comentario: "Fast-forward: a main ganhou o commit da feature e nenhum commit extra.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para trazer o gráfico para a main.",
          codigo: r`
git ___ feature/grafico
ls
`,
          respostas: [["merge"]],
          testes: [["assert repo('~/projeto').mensagens()[0] == 'Adiciona gráfico' and existe('~/projeto/grafico.py')", "A main deve receber o commit e o arquivo grafico.py"]],
          dicas: ["Você já está na main.", "O comando junta outra branch na atual.", "`merge`."],
        },
        {
          tipo: "escrever", nivel: 2,
          setup: r`
echo "Fonte: sistema de vendas" >> README.md
git commit -am "Atualiza README"
`,
          enunciado: "Enquanto o gráfico era feito, a main também recebeu um commit (`Atualiza README`). Junte a `feature/grafico` na `main` (vai surgir um commit de merge) e apague a branch depois.",
          inicial: r`
git log --oneline --all
`,
          testes: [
            ["assert repo('~/projeto').eh_merge(), repo('~/projeto').mensagens()", "O último commit da main deve ser um commit de merge"],
            ["assert 'feature/grafico' not in repo('~/projeto').branches", "A branch feature/grafico deve ser apagada"],
            ["assert existe('~/projeto/grafico.py') and 'Fonte' in ler('~/projeto/README.md')", "A main deve ter o gráfico e o README atualizado"],
          ],
          dicas: ["Você já está na main.", "`git merge feature/grafico` cria o commit de merge.", "Depois, `git branch -d feature/grafico`."],
          solucao: r`
git merge feature/grafico
git log --oneline
git branch -d feature/grafico
`,
        },
      ],
    },
    {
      id: "conflitos",
      titulo: "Resolver conflitos",
      setup: r`
git switch -c ajuste-titulo
echo "# Análise de vendas 2024" > README.md
git commit -am "Ajusta título"
git switch main
echo "# Relatório de vendas" > README.md
git commit -am "Renomeia relatório"
`,
      explicacao: [
        "Um **conflito** acontece quando as duas branches mudaram as mesmas linhas de um arquivo. O Git não adivinha qual versão vale: ele marca o trecho e pede que você decida.",
        "No arquivo, o trecho fica assim: entre `<<<<<<< HEAD` e `=======` está a versão da sua branch atual; entre `=======` e `>>>>>>> outra-branch`, a versão da outra.",
        "Para resolver: edite o arquivo deixando o conteúdo final (sem as marcações), rode `git add arquivo` para marcar como resolvido e `git commit` para concluir o merge.",
        "Desistiu? `git merge --abort` volta tudo para antes do merge.",
        "> Nesta lição, a `main` e a `ajuste-titulo` mudaram a mesma linha do README. Para editar o arquivo aqui, reescreva-o com `echo ... > README.md`.",
      ],
      exemplo: r`
git merge ajuste-titulo
git status
cat README.md
echo "# Relatório de vendas 2024" > README.md
git add README.md
git commit -m "Junta ajuste do título"
git log --oneline
`,
      erro: {
        codigo: r`
git merge ajuste-titulo
git commit -m "Merge"
`,
        explicacao: "O conflito ainda não foi resolvido: `Committing is not possible because you have unmerged files`. Edite o arquivo, tire as marcações `<<<<<<<`, `=======` e `>>>>>>>` e rode `git add` antes do commit.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Num conflito, o que fica entre `<<<<<<< HEAD` e `=======`?",
          opcoes: ["A versão da outra branch", "A versão da branch em que você está (a que recebe o merge)", "A versão do último commit em comum", "Um comentário do Git"],
          resposta: 1,
          dicas: ["HEAD é onde você está.", "A outra branch aparece no fim da marcação.", "O primeiro bloco é o seu."],
          comentario: "Lembrete: HEAD é a sua versão, e o nome depois de `>>>>>>>` é a branch que está chegando.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "A main mudou o título para `# Relatório de vendas` e a ajuste-titulo, para `# Análise de vendas 2024`. Qual é a saída?",
          codigo: r`
git merge ajuste-titulo > /dev/null
cat README.md
`,
          opcoes: ["<<<<<<< HEAD\n# Relatório de vendas\n=======\n# Análise de vendas 2024\n>>>>>>> ajuste-titulo", "# Relatório de vendas", "# Análise de vendas 2024", "<<<<<<< ajuste-titulo\n# Análise de vendas 2024\n=======\n# Relatório de vendas\n>>>>>>> HEAD"],
          resposta: 0,
          dicas: ["As duas mudaram a mesma linha.", "O Git coloca as duas versões no arquivo.", "Primeiro a sua (HEAD), depois a da outra branch."],
          comentario: "Enquanto o conflito não é resolvido, o arquivo fica com as marcações.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "O conflito foi resolvido editando o arquivo. Complete para marcar como resolvido e concluir o merge.",
          codigo: r`
git merge ajuste-titulo
echo "# Relatório de vendas 2024" > README.md
git ___ README.md
git commit -m "Resolve conflito do título"
`,
          respostas: [["add"]],
          testes: [["r = repo('~/projeto')\nassert r.eh_merge() and not r.em_merge, r.mensagens()", "O merge deve ser concluído com um commit de merge"]],
          dicas: ["É o mesmo comando de preparar arquivos.", "Ele marca o conflito como resolvido.", "`add`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Junte a branch `ajuste-titulo` na `main` e resolva o conflito deixando o título como `# Relatório de vendas 2024`. Conclua o merge com um commit.",
          inicial: r`
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.arquivos()['README.md'] == '# Relatório de vendas 2024\\n', r.arquivos()['README.md']", "O README final deve ser '# Relatório de vendas 2024', sem marcações"],
            ["r = repo('~/projeto')\nassert r.eh_merge() and not r.em_merge, r.mensagens()", "O merge deve estar concluído"],
          ],
          dicas: ["`git merge ajuste-titulo` mostra o conflito.", "Reescreva o arquivo com o título final: `echo \"# Relatório de vendas 2024\" > README.md`.", "`git add README.md` e `git commit -m \"...\"`."],
          solucao: r`
git merge ajuste-titulo
cat README.md
echo "# Relatório de vendas 2024" > README.md
git add README.md
git commit -m "Resolve conflito do título"
git log --oneline
`,
        },
      ],
    },
    {
      id: "fluxo-tags",
      titulo: "Fluxo de trabalho e tags",
      explicacao: [
        "Um fluxo comum em times de dados: a `main` sempre funciona; cada mudança nasce numa branch (`feature/...`), recebe commits e volta para a main por merge (no GitHub, por pull request, no próximo módulo).",
        "Uma **tag** marca um commit importante com um nome fixo, como a versão entregue de um relatório: `git tag v1.0`. `git tag` lista as tags; `git log --oneline` mostra onde elas estão.",
        "Versões costumam seguir o padrão `vMAIOR.MENOR.CORREÇÃO`: `v1.2.0` para uma funcionalidade nova, `v1.2.1` para uma correção.",
        "Você também vai ouvir falar de **rebase**: em vez de criar um commit de merge, ele \"replanta\" os commits da sua branch em cima da main, deixando o histórico em linha reta. Ele reescreve o histórico, então só deve ser usado em branches que ninguém mais está usando. Este terminal simulado não implementa o rebase.",
      ],
      exemplo: r`
git switch -c feature/filtro
echo "df = df[df['valor'] > 100]" >> analise.py
git commit -am "Filtra vendas acima de 100"
git switch main
git merge --no-ff feature/filtro
git tag v1.0
git log --oneline
git tag
`,
      erro: {
        codigo: r`
git tag v1.0
git tag v1.0
`,
        explicacao: "Uma tag aponta sempre para o mesmo commit, e o nome não pode se repetir: `tag 'v1.0' already exists`. Para uma nova entrega, crie a próxima versão (`v1.1`).",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Qual é a principal diferença entre `merge` e `rebase`?",
          opcoes: ["Não há diferença", "O merge preserva o histórico e cria um commit de junção; o rebase reescreve os commits da branch para ficarem em linha reta sobre a outra", "O rebase apaga a branch", "O merge só funciona no GitHub"],
          resposta: 1,
          dicas: ["Um deles reescreve commits.", "O outro acrescenta um commit.", "Por reescrever, o rebase é perigoso em branches compartilhadas."],
          comentario: "Regra prática: rebase só na sua branch local, antes de publicar; merge para integrar o que já é compartilhado.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Um relatório na versão `v2.3.1` ganhou uma funcionalidade nova, sem quebrar nada. Qual deve ser a próxima versão?",
          opcoes: ["`v2.3.2`", "`v2.4.0`", "`v3.0.0`", "`v2.3.1-novo`"],
          resposta: 1,
          dicas: ["O padrão é MAIOR.MENOR.CORREÇÃO.", "Funcionalidade nova compatível sobe o MENOR.", "E zera a CORREÇÃO."],
          comentario: "Correção sobe o último número (v2.3.2); uma mudança que quebra quem usa sobe o primeiro (v3.0.0).",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para marcar o commit atual como a versão `v1.0`.",
          codigo: r`
git tag ___
git tag
`,
          respostas: [["v1.0"]],
          testes: [["assert repo('~/projeto').tags == ['v1.0']", "Deve existir a tag v1.0"]],
          dicas: ["O comando já está escrito.", "Falta o nome da versão.", "`v1.0`."],
        },
        {
          tipo: "escrever", nivel: 3,
          enunciado: "Faça o fluxo completo de uma melhoria: crie a branch `feature/filtro-regiao`, acrescente ao `analise.py` a linha `df = df[df['regiao'] == 'Sul']` num commit `Filtra por região`, volte para a `main`, junte com `--no-ff` (para registrar o merge), marque a versão `v1.1` e apague a branch.",
          inicial: r`
`,
          testes: [
            ["r = repo('~/projeto')\nassert r.eh_merge() and r.mensagens()[0] == \"Merge branch 'feature/filtro-regiao'\", r.mensagens()", "A main deve terminar com o commit de merge da feature"],
            ["r = repo('~/projeto')\nassert 'v1.1' in r.tags and \"regiao\" in r.arquivos('v1.1')['analise.py']", "A tag v1.1 deve apontar para a versão com o filtro"],
            ["assert 'feature/filtro-regiao' not in repo('~/projeto').branches and repo('~/projeto').branch == 'main'", "A branch deve ser apagada, e você deve estar na main"],
          ],
          dicas: ["`git switch -c feature/filtro-regiao` e depois a linha com `echo \"...\" >> analise.py`.", "`git commit -am \"Filtra por região\"`, `git switch main` e `git merge --no-ff feature/filtro-regiao`.", "Por fim, `git tag v1.1` e `git branch -d feature/filtro-regiao`."],
          solucao: r`
git switch -c feature/filtro-regiao
echo "df = df[df['regiao'] == 'Sul']" >> analise.py
git commit -am "Filtra por região"
git switch main
git merge --no-ff feature/filtro-regiao
git tag v1.1
git branch -d feature/filtro-regiao
git log --oneline
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "duas-features",
      titulo: "Duas features em paralelo",
      enunciado: [
        "Duas melhorias vão ser feitas ao mesmo tempo, a partir da `main`:",
        "- na branch `feature/mapa`, o arquivo `mapa.py` num commit `Adiciona mapa`;",
        "- na branch `feature/tabela`, o arquivo `tabela.py` num commit `Adiciona tabela`.",
        "As duas branches devem sair da `main` original, sem uma conter a outra. Depois, junte as duas na `main`: a primeira será um fast-forward e a segunda, um commit de merge.",
      ],
      inicial: r`
`,
      testes: [
        ["r = repo('~/projeto')\nassert 'Adiciona mapa' not in r.mensagens('feature/tabela') and 'Adiciona tabela' not in r.mensagens('feature/mapa'), (r.mensagens('feature/mapa'), r.mensagens('feature/tabela'))", "Cada branch deve ter só a sua feature (as duas saem da main original)"],
        ["r = repo('~/projeto')\nassert r.branch == 'main' and r.eh_merge() and {'mapa.py', 'tabela.py'} <= set(r.arquivos())", "A main deve ter os dois arquivos e terminar com um commit de merge"],
      ],
      dicas: ["Volte para a `main` antes de criar a segunda branch.", "`git switch -c feature/mapa`, crie o arquivo e faça o commit; `git switch main`; repita para a tabela.", "Na main: `git merge feature/mapa` e depois `git merge feature/tabela`."],
      solucao: r`
git switch -c feature/mapa
echo "mapa()" > mapa.py
git add mapa.py
git commit -m "Adiciona mapa"
git switch main
git switch -c feature/tabela
echo "tabela()" > tabela.py
git add tabela.py
git commit -m "Adiciona tabela"
git switch main
git merge feature/mapa        # fast-forward
git merge feature/tabela      # commit de merge
git log --oneline --all
`,
    },
    {
      id: "conflito-config",
      titulo: "Conflito no arquivo de configuração",
      setup: r`
echo "regiao=Sul" > config.ini
echo "prazo=30" >> config.ini
echo "moeda=BRL" >> config.ini
git add config.ini
git commit -m "Adiciona config"
git switch -c ajuste-prazo
sed -i 's/prazo=30/prazo=45/' config.ini
git commit -am "Aumenta prazo para 45"
git switch main
sed -i 's/prazo=30/prazo=60/' config.ini
sed -i 's/moeda=BRL/moeda=USD/' config.ini
git commit -am "Prazo 60 e moeda em dólar"
`,
      enunciado: [
        "Na `main`, alguém mudou o `config.ini` para `prazo=60` e `moeda=USD`. Na branch `ajuste-prazo`, o prazo virou `45`. Depois de conversar com o time, ficou decidido: o prazo certo é **45** e a moeda é **USD**.",
        "Junte a `ajuste-prazo` na `main` e resolva o conflito para que o arquivo final tenha exatamente as linhas `regiao=Sul`, `prazo=45` e `moeda=USD`.",
      ],
      inicial: r`
cat config.ini
`,
      testes: [
        ["r = repo('~/projeto')\nassert r.arquivos()['config.ini'] == 'regiao=Sul\\nprazo=45\\nmoeda=USD\\n', r.arquivos()['config.ini']", "O config.ini final deve ter regiao=Sul, prazo=45 e moeda=USD"],
        ["r = repo('~/projeto')\nassert r.eh_merge() and not r.em_merge", "O merge deve estar concluído"],
      ],
      dicas: ["`git merge ajuste-prazo` e `cat config.ini` para ver o conflito.", "Reescreva o arquivo inteiro com as três linhas finais (`echo ... >` e `echo ... >>`).", "Depois `git add config.ini` e `git commit -m \"...\"`."],
      solucao: r`
git merge ajuste-prazo
cat config.ini
echo "regiao=Sul" > config.ini
echo "prazo=45" >> config.ini
echo "moeda=USD" >> config.ini
git add config.ini
git commit -m "Junta ajuste de prazo"
cat config.ini
`,
      comentario: "As mudanças de prazo e de moeda ficaram em linhas vizinhas, e o Git trata mudanças vizinhas como um único trecho em conflito. Se estivessem distantes no arquivo, ele juntaria a moeda sozinho e só o prazo ficaria em conflito.",
    },
  ],
}));
