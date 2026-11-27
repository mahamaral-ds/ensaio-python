Ensaio.modulo((r) => ({
  id: "l3",
  trilha: "linux",
  ordem: 3,
  titulo: "Permissões, processos e ambiente",
  resumo: "Ler e mudar permissões, variáveis de ambiente, encontrar e encerrar processos, compactar e restaurar backups.",
  arquivos: {
    "scripts/relatorio.sh": "#!/bin/bash\necho \"Relatório gerado em $(date +%Y-%m-%d)\"\n",
    "scripts/mostra_ambiente.sh": "#!/bin/bash\necho \"rodando em: $AMBIENTE\"\n",
    ".env": "DB_SENHA=super-secreta\nAPI_TOKEN=abc123\n",
    "segredo.txt": "folha 2024\n",
    "logs/app_2024-05.log": "2024-05-31 23:59:00 INFO fim do mês\n",
    "logs/app_2024-06.log": "2024-06-03 08:00:01 INFO Servidor iniciado\n",
    "relatorios/jan.csv": "mes;total\njan;182000\n",
    "relatorios/fev.csv": "mes;total\nfev;175000\n",
  },
  licoes: [
    {
      id: "permissoes",
      titulo: "Permissões",
      explicacao: [
        "No `ls -l`, o começo da linha mostra as permissões: `-rwxr-x---`. O primeiro caractere é o tipo (`-` arquivo, `d` pasta) e depois vêm três trios: **dono**, **grupo** e **outros**.",
        "Em cada trio: `r` ler, `w` escrever e `x` executar (numa pasta, `x` é poder entrar nela). `-` é a ausência da permissão.",
        "`chmod u+x script.sh` dá execução ao dono; `chmod go-r arquivo` tira a leitura do grupo e dos outros.",
        "Também se usa a forma numérica, somando r=4, w=2 e x=1 para cada trio: `chmod 755` (rwxr-xr-x, scripts), `644` (rw-r--r--, arquivos comuns), `600` (rw-------, segredos como senhas e chaves).",
        "`whoami` mostra o seu usuário. `sudo` executa um comando como administrador (root) depois de pedir a sua senha; use só quando for realmente necessário.",
      ],
      exemplo: r`
whoami
ls -l scripts
ls -l .env segredo.txt
chmod u+x scripts/relatorio.sh
ls -l scripts/relatorio.sh
./scripts/relatorio.sh
chmod 600 .env
ls -l .env
`,
      erro: {
        codigo: r`
./scripts/relatorio.sh
`,
        explicacao: "O script não tem permissão de execução (`-rw-r--r--`): `Permission denied`. Dê a permissão com `chmod +x scripts/relatorio.sh`, ou rode passando para o bash: `bash scripts/relatorio.sh`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Um arquivo tem as permissões `-rwxr-x---`. O que o **grupo** pode fazer?",
          opcoes: ["Ler, escrever e executar", "Ler e executar", "Nada", "Só ler"],
          resposta: 1,
          dicas: ["Separe em trios depois do primeiro caractere.", "rwx | r-x | ---.", "O segundo trio é o grupo."],
          comentario: "O dono tem tudo (rwx), o grupo lê e executa (r-x) e os outros não têm acesso (---). Em números: 750.",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "`segredo.txt` tem 11 bytes. Qual é a saída?",
          codigo: r`
chmod 600 segredo.txt
ls -l segredo.txt
`,
          opcoes: ["-rw------- 1 analista analista 11 jun  3 10:00 segredo.txt", "-rw-r--r-- 1 analista analista 11 jun  3 10:00 segredo.txt", "-rwx------ 1 analista analista 11 jun  3 10:00 segredo.txt", "drw------- 1 analista analista 11 jun  3 10:00 segredo.txt"],
          resposta: 0,
          dicas: ["6 = 4 + 2: leitura e escrita.", "0 = nenhuma permissão.", "Só o dono lê e escreve."],
          comentario: "600 é o padrão para arquivos com senhas: ninguém além de você consegue ler.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para tornar o script executável e rodá-lo.",
          codigo: r`
chmod ___ scripts/relatorio.sh
./scripts/relatorio.sh
`,
          respostas: [["+x", "u+x", "a+x", "755", "744", "700", "775"]],
          testes: [["assert 'Relatório gerado em 2024-06-03' in _out, _out", "O script deve rodar e mostrar a mensagem"]],
          dicas: ["Falta a permissão de execução.", "Na forma simbólica: acrescentar x.", "`+x` (ou `755`)."],
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "O arquivo `.env` guarda senhas. Deixe-o com leitura e escrita **só para o dono** e mostre as permissões dele com `ls -l`.",
          inicial: r`
`,
          testes: [
            ["assert permissoes('~/.env') == '-rw-------', permissoes('~/.env')", ".env deve ficar com -rw-------"],
            ["assert '.env' in _out", "Mostre o resultado com ls -l .env"],
          ],
          dicas: ["Na forma numérica, leitura + escrita é 6.", "Grupo e outros ficam com 0.", "`chmod 600 .env` e depois `ls -l .env`."],
          solucao: r`
chmod 600 .env    # rw------- : só o dono lê e escreve
ls -l .env
`,
          comentario: "E nunca coloque o `.env` num repositório Git: a trilha de Git mostra como ignorá-lo.",
        },
      ],
    },
    {
      id: "variaveis",
      titulo: "Variáveis de ambiente",
      explicacao: [
        "Variáveis guardam valores no terminal: `NOME=Ana` (sem espaços em volta do `=`) e depois `echo $NOME`.",
        "Aspas **duplas** expandem variáveis (`\"Olá, $NOME\"`); aspas **simples** mantêm o texto literal (`'Olá, $NOME'`).",
        "`export NOME=Ana` transforma a variável em **variável de ambiente**, visível também para os programas e scripts que você rodar. `env` lista todas.",
        "Algumas já vêm prontas: `$HOME` (pasta pessoal), `$USER` (usuário), `$PWD` (pasta atual) e `$PATH` (onde o terminal procura os comandos). `which comando` mostra onde ele está.",
        "Configurações como ambiente (`producao`), endereços de banco e chaves costumam chegar aos programas por variáveis de ambiente.",
      ],
      exemplo: r`
echo $HOME
echo "Usuário: $USER, pasta: $PWD"
NOME=Ana
echo "Olá, $NOME"
echo 'Olá, $NOME'
export AMBIENTE=homologacao
bash scripts/mostra_ambiente.sh
echo $PATH
which grep
`,
      erro: {
        codigo: r`
NOME = Ana
`,
        explicacao: "Com espaços, o terminal entende `NOME` como um comando, que não existe: `command not found`. Na atribuição, o `=` fica colado: `NOME=Ana`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
NOME=Ana
echo "Olá, $NOME"
echo 'Olá, $NOME'
`,
          opcoes: ["Olá, Ana\nOlá, $NOME", "Olá, Ana\nOlá, Ana", "Olá, $NOME\nOlá, $NOME", "Olá, $NOME\nOlá, Ana"],
          resposta: 0,
          dicas: ["Aspas duplas expandem variáveis.", "Aspas simples não.", "A segunda linha sai literal."],
          comentario: "Use aspas simples quando quiser o texto exatamente como está, por exemplo num padrão de awk.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve o `export`?",
          opcoes: ["Para salvar a variável num arquivo", "Para deixar a variável visível para os programas e scripts executados a partir do terminal", "Para apagar a variável", "Para mostrar o valor da variável"],
          resposta: 1,
          dicas: ["Sem export, a variável existe só no terminal atual.", "Um script roda num processo filho.", "O export passa a variável adiante."],
          comentario: "Variáveis sem export não chegam aos scripts que você executa.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "O script `scripts/mostra_ambiente.sh` mostra o valor de `$AMBIENTE`. Complete para que ele mostre `producao`.",
          codigo: r`
___ AMBIENTE=producao
bash scripts/mostra_ambiente.sh
`,
          respostas: [["export"]],
          testes: [["assert 'rodando em: producao' in _out, _out", "O script deve mostrar 'rodando em: producao'"]],
          dicas: ["Sem nada na frente, a variável não chega ao script.", "Ela precisa virar variável de ambiente.", "`export`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a variável `PASTA_DADOS` com o caminho da pasta de relatórios, usando `$HOME` (`$HOME/relatorios`). Depois, liste os arquivos dessa pasta usando a variável.",
          inicial: r`
`,
          testes: [
            ["assert var('PASTA_DADOS') == '/home/analista/relatorios', var('PASTA_DADOS')", "PASTA_DADOS deve valer /home/analista/relatorios"],
            ["assert 'jan.csv' in _out and '$PASTA_DADOS' in _src", "Liste a pasta usando $PASTA_DADOS"],
          ],
          dicas: ["`PASTA_DADOS=$HOME/relatorios`, sem espaços.", "Use a variável com `$` na frente.", "`ls $PASTA_DADOS`."],
          solucao: r`
PASTA_DADOS=$HOME/relatorios
ls $PASTA_DADOS
`,
          comentario: "Quando o caminho pode ter espaços, use aspas: `ls \"$PASTA_DADOS\"`.",
        },
      ],
    },
    {
      id: "processos",
      titulo: "Processos",
      explicacao: [
        "Todo programa em execução é um **processo**, com um número de identificação, o **PID**.",
        "`ps` mostra os processos do seu terminal; `ps aux` mostra todos os processos do sistema, com usuário, uso de CPU e memória. `top` mostra os que mais consomem, atualizando em tempo real.",
        "`kill PID` pede para o processo terminar. Se ele não responder, `kill -9 PID` força o encerramento. Você só pode encerrar os seus próprios processos.",
        "Um `&` no fim roda o comando em segundo plano (`sleep 300 &`), e o terminal continua livre. `jobs` lista o que está rodando assim.",
        "Combine com o grep: `ps aux | grep python` encontra rapidamente um processo pelo nome.",
      ],
      exemplo: r`
ps
ps aux
top
ps aux | grep python
sleep 300 &
jobs
`,
      erro: {
        codigo: r`
kill 1
`,
        explicacao: "O processo 1 pertence ao root (é o sistema): `Operation not permitted`. Você só pode encerrar os seus processos. Confira o usuário na primeira coluna do `ps aux`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "No `ps aux` deste terminal há três processos do usuário root. Qual é a saída?",
          codigo: r`
ps aux | grep -c root
`,
          opcoes: ["3", "1", "6", "root"],
          resposta: 0,
          dicas: ["O grep filtra as linhas com root.", "`-c` conta as linhas.", "São três."],
          comentario: "No Linux de verdade, a própria linha do `grep root` também aparece. Por isso se usa `grep [r]oot`, um truque que o grep não encontra em si mesmo.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Qual é a diferença entre `kill 1187` e `kill -9 1187`?",
          opcoes: ["Nenhuma", "O primeiro pede para o processo terminar (ele pode salvar e fechar); o -9 força o encerramento na hora", "O -9 encerra 9 processos", "O primeiro só pausa o processo"],
          resposta: 1,
          dicas: ["Os números são sinais enviados ao processo.", "O padrão é o sinal 15, um pedido educado.", "O 9 não pode ser ignorado."],
          comentario: "Tente o `kill` comum primeiro: ele dá ao programa a chance de fechar arquivos e conexões direito.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "O `ps aux` mostra o processo `python3 relatorio_lento.py` com PID 1187 usando 97% da CPU. Complete para encerrá-lo.",
          codigo: r`
kill ___
ps aux | grep python
`,
          respostas: [["1187"]],
          testes: [["assert 'python3 relatorio_lento.py' not in processos()", "O processo relatorio_lento.py deve ter sido encerrado"]],
          dicas: ["O kill recebe o PID.", "O PID está no enunciado.", "`1187`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Um processo seu está travando a máquina. Descubra qual é com `ps aux` ou `top`, encerre-o e mostre a lista de processos de novo para confirmar.",
          inicial: r`
`,
          testes: [
            ["assert 'python3 relatorio_lento.py' not in processos()", "O processo que consome a CPU deve ser encerrado"],
            ["assert ('ps' in _src or 'top' in _src) and 'kill' in _src", "Use ps (ou top) para investigar e kill para encerrar"],
            ["assert len(processos()) == 5, processos()", "Os outros processos não devem ser encerrados"],
          ],
          dicas: ["Rode `top` (ou `ps aux`) e procure a maior %CPU.", "É um script Python do usuário analista.", "`kill 1187` e depois `ps aux` de novo."],
          solucao: r`
top                 # o primeiro da lista é o que mais usa CPU
kill 1187           # PID do python3 relatorio_lento.py
ps aux              # confere que sumiu
`,
        },
      ],
    },
    {
      id: "compactar",
      titulo: "Compactar e restaurar",
      setup: r`
tar -czf backup.tar.gz relatorios
`,
      explicacao: [
        "`tar` junta arquivos e pastas num pacote só, e com `z` também compacta (`.tar.gz`). As letras dizem o que fazer: `c` criar, `x` extrair, `t` listar, `z` compactar com gzip, `v` mostrar os arquivos e `f` o nome do pacote (sempre por último, antes do nome).",
        "Criar: `tar -czf backup.tar.gz pasta`. Ver o conteúdo sem extrair: `tar -tzf backup.tar.gz`. Extrair: `tar -xzf backup.tar.gz` (com `-C destino` para escolher a pasta).",
        "`zip -r pacote.zip pasta` e `unzip pacote.zip` fazem o mesmo no formato zip, comum quando o arquivo vai para quem usa Windows.",
        "`du -sh pasta` mostra o espaço ocupado e `df -h` o espaço livre no disco.",
        "> Nesta lição, um `backup.tar.gz` com a pasta `relatorios` já foi criado para você.",
      ],
      exemplo: r`
tar -tzf backup.tar.gz
tar -czvf logs.tar.gz logs
du -sh logs logs.tar.gz
mkdir restaurado
tar -xzf backup.tar.gz -C restaurado
ls -R restaurado
df -h
`,
      erro: {
        codigo: r`
tar -czf relatorios backup2.tar.gz
`,
        explicacao: "O nome do pacote vem logo depois do `f`. Aqui, `relatorios` virou o nome do pacote e o tar tentou guardar `backup2.tar.gz`, que não existe. A ordem é `tar -czf pacote.tar.gz o_que_guardar`.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que faz `tar -xzf backup.tar.gz`?",
          opcoes: ["Cria o pacote backup.tar.gz", "Extrai o conteúdo do pacote compactado", "Lista o conteúdo sem extrair", "Apaga o pacote"],
          resposta: 1,
          dicas: ["`c` cria, `t` lista.", "`x` vem de *extract*.", "`z` diz que está compactado."],
          comentario: "Um jeito de lembrar: c de *create*, x de *extract* e t de *table* (listar).",
        },
        {
          tipo: "prever", nivel: 2,
          enunciado: "`backup.tar.gz` foi criado com `tar -czf backup.tar.gz relatorios`, e a pasta tem `jan.csv` e `fev.csv`. Qual é a saída?",
          codigo: r`
tar -tzf backup.tar.gz
`,
          opcoes: ["relatorios/\nrelatorios/fev.csv\nrelatorios/jan.csv", "fev.csv\njan.csv", "backup.tar.gz", "relatorios"],
          resposta: 0,
          dicas: ["`t` lista o conteúdo.", "A pasta entra no pacote junto com os arquivos.", "Os caminhos incluem `relatorios/`."],
          comentario: "Como o pacote guarda a pasta, ao extrair ela é recriada com os arquivos dentro.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para criar o pacote compactado `logs.tar.gz` com a pasta `logs`.",
          codigo: r`
tar -___ logs.tar.gz logs
tar -tzf logs.tar.gz
`,
          respostas: [["czf", "zcf", "czvf", "cvzf"]],
          testes: [["assert 'logs/app_2024-05.log' in executa('tar -tzf ~/logs.tar.gz')", "logs.tar.gz deve conter a pasta logs"]],
          dicas: ["Você quer criar, compactar e dar nome ao pacote.", "O `f` fica por último.", "`czf`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Restaure o backup: crie a pasta `~/restaurado` e extraia `backup.tar.gz` dentro dela.",
          inicial: r`
`,
          testes: [["assert existe('~/restaurado/relatorios/jan.csv') and existe('~/restaurado/relatorios/fev.csv')", "Os relatórios devem estar em ~/restaurado/relatorios"]],
          dicas: ["`mkdir restaurado`.", "Extrair é `tar -xzf`.", "`-C restaurado` escolhe a pasta de destino."],
          solucao: r`
mkdir restaurado
tar -xzf backup.tar.gz -C restaurado
ls -R restaurado
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "proteger",
      titulo: "Arrumar as permissões do projeto",
      enunciado: [
        "Uma auditoria pediu três ajustes de segurança:",
        "1. `.env` com leitura e escrita só para o dono;",
        "2. os scripts da pasta `scripts` executáveis por todos, mas editáveis só pelo dono (755);",
        "3. uma pasta `~/privado` em que só você entra (700), com o `segredo.txt` movido para dentro dela.",
      ],
      inicial: r`
`,
      testes: [
        ["assert permissoes('~/.env') == '-rw-------', permissoes('~/.env')", ".env deve ficar -rw-------"],
        ["assert permissoes('~/scripts/relatorio.sh') == '-rwxr-xr-x' and permissoes('~/scripts/mostra_ambiente.sh') == '-rwxr-xr-x'", "Os dois scripts devem ficar -rwxr-xr-x"],
        ["assert permissoes('~/privado') == 'drwx------' and existe('~/privado/segredo.txt') and not existe('~/segredo.txt')", "~/privado deve ser drwx------ e conter o segredo.txt"],
      ],
      dicas: ["São três `chmod`, um `mkdir` e um `mv`.", "Para os scripts, use curinga: `chmod 755 scripts/*.sh`.", "`mkdir privado`, `chmod 700 privado` e `mv segredo.txt privado/`."],
      solucao: r`
chmod 600 .env
chmod 755 scripts/*.sh
mkdir privado
chmod 700 privado
mv segredo.txt privado/
ls -la . privado scripts
`,
    },
    {
      id: "liberar",
      titulo: "Liberar a máquina e arquivar logs",
      enunciado: [
        "A máquina de relatórios está lenta e com pouco espaço. Encerre o processo seu que está consumindo a CPU. Depois, arquive o log de maio em `logs/antigos.tar.gz` e apague o arquivo original (`logs/app_2024-05.log`). O log de junho deve continuar onde está.",
      ],
      inicial: r`
`,
      testes: [
        ["assert 'python3 relatorio_lento.py' not in processos()", "O processo pesado deve ser encerrado"],
        ["assert 'app_2024-05.log' in executa('tar -tzf ~/logs/antigos.tar.gz')", "logs/antigos.tar.gz deve conter o log de maio"],
        ["assert not existe('~/logs/app_2024-05.log') and existe('~/logs/app_2024-06.log')", "O log de maio deve sair da pasta, e o de junho continuar"],
      ],
      dicas: ["Use `ps aux` ou `top` para achar o PID e `kill` para encerrar.", "Entre em `logs` antes de compactar, para o pacote não guardar o caminho inteiro: `cd logs`.", "`tar -czf antigos.tar.gz app_2024-05.log && rm app_2024-05.log`. O `&&` só apaga se o tar der certo."],
      solucao: r`
ps aux | grep python
kill 1187
cd logs
tar -czf antigos.tar.gz app_2024-05.log && rm app_2024-05.log
ls
`,
      comentario: "O `&&` é uma boa proteção: se a compactação falhar, o `rm` não roda e você não perde o log.",
    },
  ],
}));
