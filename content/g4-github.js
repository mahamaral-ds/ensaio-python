Ensaio.modulo((r) => {
  // repositório no GitHub simulado, com o seu clone em ~/projeto
  const repoClonado = (nome) => r`
mkdir base
cp modelo/* base/
cd base
git init
git add .
git commit -m "Primeira versão"
gh repo create ` + nome + r` --public --source=. --push
cd ~
rm -rf base
git clone https://github.com/analista/` + nome + r`.git projeto
cd projeto
`;

  return {
    id: "g4",
    trilha: "git",
    ordem: 4,
    titulo: "GitHub e colaboração",
    resumo: "Repositórios remotos, push, clone e pull, pull requests, issues e boas práticas para trabalhar em equipe.",
    arquivos: {
      "modelo/README.md": "# Análise de vendas\n",
      "modelo/analise.py": "import pandas as pd\n\ndf = pd.read_csv('dados/vendas.csv')\nprint(df.head())\n",
    },
    licoes: [
      {
        id: "remote-push",
        titulo: "Repositório remoto e git push",
        setup: r`
mkdir projeto
cp modelo/* projeto/
cd projeto
git init
git add .
git commit -m "Primeira versão"
gh repo create analise-vendas --public
`,
        explicacao: [
          "O **GitHub** guarda uma cópia do repositório na nuvem, o **remoto**. Ele serve de backup, de vitrine e de ponto de encontro do time.",
          "`git remote add origin URL` liga o repositório local ao remoto. `origin` é o nome padrão do remoto principal, e `git remote -v` mostra os remotos configurados.",
          "`git push -u origin main` envia a branch `main` e grava a ligação entre as duas (o *upstream*). Daí em diante, basta `git push`.",
          "O `git status` passa a dizer se você está à frente (*ahead*) ou atrás (*behind*) do remoto.",
          "> No Level Code, o GitHub é simulado: os comandos e as mensagens são os mesmos, mas nada sai do navegador. Nesta lição, o repositório `analise-vendas` já foi criado no GitHub (vazio) e o projeto local tem um commit.",
        ],
        exemplo: r`
git remote add origin https://github.com/analista/analise-vendas.git
git remote -v
git push -u origin main
git status
echo "Fonte: ERP" >> README.md
git commit -am "Documenta fonte"
git status
git push
git log --oneline
`,
        erro: {
          codigo: r`
git push
`,
          explicacao: "O repositório local ainda não sabe para onde enviar: `No configured push destination`. Primeiro ligue o remoto com `git remote add origin URL` e depois rode `git push -u origin main`.",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "O que é `origin` em `git push origin main`?",
            opcoes: ["O primeiro commit do projeto", "O nome dado ao repositório remoto (por padrão, o de onde você clonou ou o que você ligou primeiro)", "A branch principal", "Uma palavra reservada que não pode mudar"],
            resposta: 1,
            dicas: ["`main` é a branch.", "`origin` aparece no `git remote -v`.", "É só um apelido para a URL do remoto."],
            comentario: "Dá para ter vários remotos, por exemplo `origin` (o seu) e `upstream` (o projeto original de um fork).",
          },
          {
            tipo: "prever", nivel: 1,
            enunciado: "Qual é a saída?",
            codigo: r`
git remote add origin https://github.com/analista/analise-vendas.git
git remote -v
`,
            opcoes: ["origin\thttps://github.com/analista/analise-vendas.git (fetch)\norigin\thttps://github.com/analista/analise-vendas.git (push)", "origin", "https://github.com/analista/analise-vendas.git", "(nada)"],
            resposta: 0,
            dicas: ["`-v` mostra os detalhes.", "Cada remoto aparece em duas linhas.", "Uma para buscar (fetch) e outra para enviar (push)."],
            comentario: "Normalmente as duas URLs são iguais.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete para enviar a `main` e já gravar a ligação com o remoto.",
            codigo: r`
git remote add origin https://github.com/analista/analise-vendas.git
git push ___ origin main
`,
            respostas: [["-u", "--set-upstream"]],
            testes: [["assert github('analise-vendas').mensagens() == ['Primeira versão'] and repo('~/projeto').upstream == 'origin/main'", "O commit deve chegar ao GitHub, com o upstream configurado"]],
            dicas: ["A opção grava o *upstream*.", "Depois dela, basta `git push`.", "`-u`."],
          },
          {
            tipo: "escrever", nivel: 2,
            enunciado: "Ligue o projeto ao repositório `https://github.com/analista/analise-vendas.git`, envie a `main` com upstream, faça mais um commit (acrescente qualquer linha ao README, com a mensagem `Documenta fonte`) e envie de novo, agora só com `git push`.",
            inicial: r`
`,
            testes: [
              ["assert github('analise-vendas').mensagens() == ['Documenta fonte', 'Primeira versão'], github('analise-vendas').mensagens()", "O GitHub deve ter os dois commits"],
              ["assert repo('~/projeto').upstream == 'origin/main'", "A main local deve ter upstream origin/main"],
            ],
            dicas: ["`git remote add origin URL` e `git push -u origin main`.", "Depois `echo ... >> README.md` e `git commit -am \"Documenta fonte\"`.", "Termine com `git push`."],
            solucao: r`
git remote add origin https://github.com/analista/analise-vendas.git
git push -u origin main
echo "Fonte: ERP" >> README.md
git commit -am "Documenta fonte"
git push
git status
`,
          },
        ],
      },
      {
        id: "clone-pull",
        titulo: "git clone, fetch e pull",
        setup: r`
mkdir base
cp modelo/* base/
cd base
git init
git add .
git commit -m "Início"
gh repo create equipe --public --source=. --push
cd ~
rm -rf base
git clone https://github.com/analista/equipe.git projeto
git clone https://github.com/analista/equipe.git colega
cd colega
echo "id;valor" > dados.csv
git add dados.csv
git commit -m "Colega adiciona dados"
git push
cd ~
`,
        explicacao: [
          "`git clone URL pasta` baixa um repositório inteiro, com todo o histórico, e já deixa o `origin` configurado.",
          "`git fetch` baixa as novidades do remoto **sem mexer** nos seus arquivos: depois dele, o `git status` diz se você está atrás. `git pull` faz o fetch e já junta as novidades na sua branch.",
          "Se alguém enviou commits antes de você, o seu `git push` é **recusado** (*rejected*). Não é um erro grave: rode `git pull` para trazer o trabalho do colega e depois `git push`.",
          "Hábito de equipe: `git pull` antes de começar a trabalhar e antes de enviar.",
          "> Nesta lição, o repositório `equipe` está no GitHub. Você tem um clone em `~/projeto`, e um colega, em `~/colega`, já enviou um commit novo que você ainda não tem. Você começa na pasta pessoal.",
        ],
        exemplo: r`
cd projeto
git status
git fetch
git status
git pull
ls
git log --oneline
`,
        erro: {
          codigo: r`
cd projeto
echo "meu trabalho" > notas.txt
git add notas.txt
git commit -m "Adiciona notas"
git push
`,
          explicacao: "O colega enviou um commit que você não tem, então o push foi recusado (`fetch first`). O Git protege o trabalho dele. Rode `git pull` (que junta os dois trabalhos) e depois `git push`.",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Qual é a diferença entre `git fetch` e `git pull`?",
            opcoes: ["Nenhuma", "O fetch só baixa as novidades do remoto; o pull baixa e junta na sua branch", "O fetch envia commits", "O pull apaga as mudanças locais"],
            resposta: 1,
            dicas: ["Um deles não mexe nos seus arquivos.", "O outro faz um merge.", "pull = fetch + merge."],
            comentario: "O fetch é útil para olhar o que chegou (`git log --oneline origin/main`) antes de juntar.",
          },
          {
            tipo: "prever", nivel: 1,
            enunciado: "O seu clone tem `README.md` e `analise.py`; o colega enviou um `dados.csv`. Qual é a saída?",
            codigo: r`
cd projeto
git pull > /dev/null 2>&1
ls
`,
            opcoes: ["analise.py  dados.csv  README.md", "analise.py  README.md", "dados.csv", "README.md  analise.py  dados.csv"],
            resposta: 0,
            dicas: ["O pull traz o commit do colega.", "O arquivo dele aparece na sua pasta.", "O `ls` ordena alfabeticamente, sem diferenciar maiúsculas."],
            comentario: "Depois do pull, a sua pasta tem tudo o que está no GitHub.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete para baixar uma cópia do repositório `equipe` na pasta `meu-clone`.",
            codigo: r`
git ___ https://github.com/analista/equipe.git meu-clone
ls meu-clone
`,
            respostas: [["clone"]],
            testes: [["assert existe('~/meu-clone/README.md') and existe('~/meu-clone/dados.csv')", "meu-clone deve ter os arquivos do GitHub, inclusive o dados.csv do colega"]],
            dicas: ["É o comando que copia um repositório remoto.", "Ele cria a pasta para você.", "`clone`."],
          },
          {
            tipo: "escrever", nivel: 2,
            enunciado: "No seu clone (`~/projeto`), crie o arquivo `notas.txt` num commit `Adiciona notas` e envie para o GitHub. Atenção: o colega já enviou um commit que você não tem.",
            inicial: r`
cd projeto
`,
            testes: [
              ["m = github('equipe').mensagens()\nassert 'Adiciona notas' in m and 'Colega adiciona dados' in m, m", "O GitHub deve ter o seu commit e o do colega"],
              ["assert repo('~/projeto').mensagens() == github('equipe').mensagens()", "O seu clone deve estar sincronizado com o GitHub"],
            ],
            dicas: ["Faça o commit normalmente.", "O primeiro push será recusado: leia a mensagem.", "`git pull` e depois `git push` de novo."],
            solucao: r`
cd projeto
echo "Reunião com o time às 10h" > notas.txt
git add notas.txt
git commit -m "Adiciona notas"
git push            # recusado: o colega enviou antes
git pull            # junta o trabalho dele com o seu
git push
git log --oneline
`,
            comentario: "Rodar `git pull` antes de começar a trabalhar evita boa parte desses encontros.",
          },
        ],
      },
      {
        id: "pull-requests",
        titulo: "Pull requests",
        setup: repoClonado("analise-vendas"),
        explicacao: [
          "Um **pull request** (PR) é um pedido para juntar uma branch em outra, feito no GitHub. Ele mostra as mudanças, recebe comentários e revisão do time e, aprovado, é juntado (*merge*).",
          "O fluxo: criar uma branch, fazer commits, enviá-la (`git push -u origin nome-da-branch`), abrir o PR e, depois do merge, atualizar a main local com `git pull`.",
          "Pela linha de comando, com o **GitHub CLI** (`gh`): `gh pr create --title \"...\" --body \"...\"` abre o PR, `gh pr list` lista, `gh pr view 1` mostra e `gh pr merge 1 --merge --delete-branch` junta e apaga a branch remota.",
          "Um bom PR é pequeno, tem um título claro e uma descrição que explica o que mudou, por que e como testar.",
          "> Nesta lição, o repositório `analise-vendas` está no GitHub e você começa no seu clone, em `~/projeto`.",
        ],
        exemplo: r`
git switch -c feature/grafico
echo "df.plot(kind='bar')" > grafico.py
git add grafico.py
git commit -m "Adiciona gráfico de barras"
git push -u origin feature/grafico
gh pr create --title "Adiciona gráfico de barras" --body "Gráfico do total por região."
gh pr list
gh pr view 1
gh pr merge 1 --merge --delete-branch
git switch main
git pull
git log --oneline
`,
        erro: {
          codigo: r`
gh pr create --title "Teste" --body "Descrição"
`,
          explicacao: "Você está na `main`, e não há nada nela que já não esteja no GitHub: `No commits between main and main`. Um PR sempre parte de uma branch com commits novos, já enviada ao remoto.",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Para que serve um pull request?",
            opcoes: ["Para baixar as mudanças do remoto (como o git pull)", "Para propor a junção de uma branch, com espaço para revisão e discussão antes do merge", "Para apagar uma branch", "Para criar um repositório"],
            resposta: 1,
            dicas: ["Apesar do nome, não é o mesmo que `git pull`.", "Ele acontece no GitHub.", "É um pedido de revisão e de merge."],
            comentario: "O nome vem de pedir que o mantenedor \"puxe\" (pull) as suas mudanças.",
          },
          {
            tipo: "prever", nivel: 2,
            enunciado: "Você criou uma branch, mas ainda não a enviou ao GitHub. Qual é a saída?",
            codigo: r`
git switch -c melhoria > /dev/null
gh pr create --title "Teste" --body "Descrição"
`,
            opcoes: ["aborted: you must first push the current branch to a remote, or use the --head flag", "https://github.com/analista/analise-vendas/pull/1", "Switched to a new branch 'melhoria'", "(nada)"],
            resposta: 0,
            dicas: ["O GitHub só conhece o que foi enviado.", "A branch existe só no seu computador.", "O gh avisa que falta o push."],
            comentario: "Antes de abrir o PR: `git push -u origin melhoria`.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete para abrir o pull request da branch já enviada.",
            codigo: r`
git switch -c feature/grafico
echo "df.plot()" > grafico.py
git add grafico.py
git commit -m "Adiciona gráfico"
git push -u origin feature/grafico
gh pr ___ --title "Adiciona gráfico" --body "Gráfico de vendas por mês"
`,
            respostas: [["create"]],
            testes: [["p = github('analise-vendas').prs\nassert len(p) == 1 and p[0]['titulo'] == 'Adiciona gráfico' and p[0]['estado'] == 'OPEN', p", "Deve existir um PR aberto chamado 'Adiciona gráfico'"]],
            dicas: ["`gh pr` seguido da ação.", "Você quer criar o PR.", "`create`."],
          },
          {
            tipo: "escrever", nivel: 3,
            enunciado: "Faça o fluxo completo: crie a branch `feature/resumo`, acrescente o arquivo `resumo.md` num commit `Adiciona resumo`, envie a branch, abra um PR com o título `Adiciona resumo` (e uma descrição), junte o PR com `--merge --delete-branch`, volte para a `main` e atualize-a.",
            inicial: r`
`,
            testes: [
              ["g = github('analise-vendas')\nassert g.prs and g.prs[0]['estado'] == 'MERGED' and g.prs[0]['titulo'] == 'Adiciona resumo', g.prs", "O PR 'Adiciona resumo' deve estar juntado (MERGED)"],
              ["g = github('analise-vendas')\nassert g.mensagens()[0].startswith('Merge pull request #1') and 'feature/resumo' not in g.branches, (g.mensagens(), g.branches)", "A main do GitHub deve ter o merge do PR, e a branch remota deve ser apagada"],
              ["r = repo('~/projeto')\nassert r.branch == 'main' and existe('~/projeto/resumo.md') and r.mensagens() == github('analise-vendas').mensagens()", "A sua main local deve estar atualizada com o GitHub"],
            ],
            dicas: ["Branch, arquivo, add, commit e `git push -u origin feature/resumo`.", "`gh pr create --title \"Adiciona resumo\" --body \"...\"` e `gh pr merge 1 --merge --delete-branch`.", "Por fim, `git switch main` e `git pull`."],
            solucao: r`
git switch -c feature/resumo
echo "# Resumo das vendas" > resumo.md
git add resumo.md
git commit -m "Adiciona resumo"
git push -u origin feature/resumo
gh pr create --title "Adiciona resumo" --body "Resumo mensal para a diretoria."
gh pr merge 1 --merge --delete-branch
git switch main
git pull
git log --oneline
`,
          },
        ],
      },
      {
        id: "boas-praticas",
        titulo: "Issues e boas práticas",
        setup: repoClonado("analise-vendas"),
        explicacao: [
          "**Issues** registram tarefas, bugs e ideias do projeto: `gh issue create --title \"...\" --body \"...\"`, `gh issue list` e `gh issue close 1`. Uma mensagem de commit ou de PR com `fecha #1` liga a mudança à issue.",
          "Boas práticas que fazem diferença:",
          "- commits pequenos, com mensagens claras no imperativo (`Corrige total por região`);",
          "- uma branch por assunto, integrada por pull request, e a `main` sempre funcionando;",
          "- `git pull` antes de começar e antes de enviar;",
          "- um `README.md` que explique o que o projeto faz, como rodar e de onde vêm os dados;",
          "- **nunca** subir senhas, tokens ou dados pessoais. Use `.gitignore` e variáveis de ambiente. Se um segredo vazar, **troque-o imediatamente**: apagar o commit não basta, porque ele já foi copiado.",
          "> Nesta lição, você começa no clone `~/projeto` do repositório `analise-vendas`.",
        ],
        exemplo: r`
gh issue create --title "Gráfico com eixo errado" --body "O eixo y deveria estar em milhares."
gh issue list
echo "O eixo y está em milhares de reais." >> README.md
git commit -am "Documenta unidade do gráfico (fecha #1)"
git push
gh issue close 1
gh issue list
`,
        erro: {
          codigo: r`
echo "API_TOKEN=ghp_exemplo123" > .env
git add .
git commit -m "Configuração"
git push
`,
          explicacao: "O token foi junto para o GitHub. Mesmo apagando o arquivo num commit seguinte, ele continua no histórico e pode já ter sido copiado. O certo é revogar o token na hora e gerar outro; depois, colocar `.env` no `.gitignore`. Prevenir é bem mais fácil: crie o `.gitignore` antes do primeiro commit.",
        },
        exercicios: [
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Você percebeu que enviou ao GitHub um arquivo com a senha do banco. O que fazer **primeiro**?",
            opcoes: ["Apagar o arquivo e fazer um novo commit", "Trocar a senha (revogar a credencial) imediatamente", "Tornar o repositório privado e esquecer o assunto", "Fazer `git revert` do commit"],
            resposta: 1,
            dicas: ["O histórico já guarda a senha.", "Alguém pode tê-la copiado.", "Só uma senha nova está segura."],
            comentario: "Depois de trocar a senha, limpe o repositório e configure o `.gitignore` para não repetir o erro.",
          },
          {
            tipo: "multipla", nivel: 1,
            enunciado: "Qual destas práticas ajuda mais o time a revisar o seu trabalho?",
            opcoes: ["Um único commit grande no fim da semana", "Pull requests pequenos, com título e descrição claros", "Trabalhar direto na main para ir mais rápido", "Commits com a mensagem `ajustes`"],
            resposta: 1,
            dicas: ["Pense em quem vai ler as mudanças.", "Revisar 30 linhas é muito mais fácil que revisar 3.000.", "E a descrição explica o porquê."],
            comentario: "PRs pequenos são revisados mais rápido e com mais atenção.",
          },
          {
            tipo: "completar", nivel: 1,
            enunciado: "Complete para registrar um bug como issue.",
            codigo: r`
gh issue ___ --title "Gráfico com eixo errado" --body "O eixo y está em milhares"
gh issue list
`,
            respostas: [["create"]],
            testes: [["i = github('analise-vendas').issues\nassert len(i) == 1 and i[0]['titulo'] == 'Gráfico com eixo errado', i", "Deve existir a issue 'Gráfico com eixo errado'"]],
            dicas: ["Mesmo padrão do `gh pr`.", "Você quer criar.", "`create`."],
          },
          {
            tipo: "escrever", nivel: 2,
            enunciado: "Registre a issue `Documentar colunas do CSV`. Depois, acrescente ao README uma seção que comece com a linha `## Colunas`, faça o commit `Documenta colunas do CSV (fecha #1)`, envie para o GitHub e feche a issue.",
            inicial: r`
`,
            testes: [
              ["i = github('analise-vendas').issues\nassert i and i[0]['titulo'] == 'Documentar colunas do CSV' and i[0]['estado'] == 'CLOSED', i", "A issue deve existir e estar fechada"],
              ["g = github('analise-vendas')\nassert '#1' in g.mensagens()[0] and '## Colunas' in g.arquivos()['README.md'], (g.mensagens(), g.arquivos().get('README.md'))", "O GitHub deve ter o commit que cita #1, com a seção no README"],
            ],
            dicas: ["`gh issue create --title \"Documentar colunas do CSV\" --body \"...\"`.", "Use `echo \"## Colunas\" >> README.md` (e mais linhas, se quiser) e depois o commit.", "`git push` e `gh issue close 1`."],
            solucao: r`
gh issue create --title "Documentar colunas do CSV" --body "Explicar data, regiao e valor."
echo "" >> README.md
echo "## Colunas" >> README.md
echo "- data: dia da venda" >> README.md
echo "- regiao: região do vendedor" >> README.md
echo "- valor: total em reais" >> README.md
git commit -am "Documenta colunas do CSV (fecha #1)"
git push
gh issue close 1
`,
            comentario: "No GitHub de verdade, `fecha #1` (ou `closes #1`) numa mensagem que chega à main fecha a issue sozinha.",
          },
        ],
      },
    ],
    desafios: [
      {
        id: "fluxo-pr",
        titulo: "Fluxo completo de pull request",
        setup: repoClonado("analise-vendas"),
        enunciado: [
          "A diretoria pediu um relatório mensal. Entregue pelo fluxo de equipe: branch `feature/relatorio-mensal` com o arquivo `relatorio.md`, enviada ao GitHub, um PR com o título `Relatório mensal` juntado na main (e a branch remota apagada), a main local atualizada e a branch local apagada.",
        ],
        inicial: r`
`,
        testes: [
          ["g = github('analise-vendas')\nassert g.prs and g.prs[0]['titulo'] == 'Relatório mensal' and g.prs[0]['estado'] == 'MERGED' and 'feature/relatorio-mensal' not in g.branches", "O PR 'Relatório mensal' deve estar juntado, com a branch remota apagada"],
          ["r = repo('~/projeto')\nassert r.branch == 'main' and 'feature/relatorio-mensal' not in r.branches and existe('~/projeto/relatorio.md')", "Localmente: na main, com o relatório e sem a branch da feature"],
          ["assert repo('~/projeto').mensagens() == github('analise-vendas').mensagens()", "A main local deve estar igual à do GitHub"],
        ],
        dicas: ["Siga o fluxo da lição de pull requests.", "Depois do `gh pr merge 1 --merge --delete-branch`, rode `git switch main` e `git pull`.", "Apague a branch local com `git branch -d feature/relatorio-mensal`, que funciona porque ela já foi juntada."],
        solucao: r`
git switch -c feature/relatorio-mensal
echo "# Relatório mensal de vendas" > relatorio.md
git add relatorio.md
git commit -m "Adiciona relatório mensal"
git push -u origin feature/relatorio-mensal
gh pr create --title "Relatório mensal" --body "Resumo de vendas do mês para a diretoria."
gh pr merge 1 --merge --delete-branch
git switch main
git pull
git branch -d feature/relatorio-mensal
git log --oneline
`,
      },
      {
        id: "colega-conflito",
        titulo: "Colaborando com o colega",
        setup: r`
mkdir base
cp modelo/* base/
cd base
git init
git add .
git commit -m "Início"
gh repo create equipe --public --source=. --push
cd ~
rm -rf base
git clone https://github.com/analista/equipe.git projeto
git clone https://github.com/analista/equipe.git colega
cd colega
echo "# Análise de vendas (time comercial)" > README.md
git commit -am "Indica o time responsável"
git push
cd ~/projeto
`,
        enunciado: [
          "Você e um colega mudaram o título do README ao mesmo tempo. Ele já enviou `# Análise de vendas (time comercial)`. Você quer `# Análise de vendas 2024`.",
          "Mude o título, faça o commit e envie. Quando surgir o conflito, combine as duas ideias no título final `# Análise de vendas 2024 (time comercial)`, conclua o merge e envie.",
        ],
        inicial: r`
`,
        testes: [
          ["assert github('equipe').arquivos()['README.md'] == '# Análise de vendas 2024 (time comercial)\\n', github('equipe').arquivos()['README.md']", "O README no GitHub deve ter o título combinado"],
          ["r = repo('~/projeto')\nassert r.eh_merge() and not r.em_merge and r.mensagens() == github('equipe').mensagens()", "O merge deve estar concluído e enviado"],
        ],
        dicas: ["Commit, `git push` (recusado) e `git pull` (conflito).", "Reescreva o README com o título combinado: `echo \"# Análise de vendas 2024 (time comercial)\" > README.md`.", "`git add README.md`, `git commit -m \"...\"` e `git push`."],
        solucao: r`
echo "# Análise de vendas 2024" > README.md
git commit -am "Atualiza ano no título"
git push                 # recusado
git pull                 # conflito no README
cat README.md
echo "# Análise de vendas 2024 (time comercial)" > README.md
git add README.md
git commit -m "Junta título com o do colega"
git push
`,
      },
    ],
  };
});
