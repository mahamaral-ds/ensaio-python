Ensaio.modulo((r) => ({
  id: "l4",
  trilha: "linux",
  ordem: 4,
  titulo: "Scripts e automação",
  resumo: "Escrever scripts bash com argumentos, variáveis, condicionais e laços para automatizar tarefas repetitivas.",
  arquivos: {
    "dados/vendas_jan.csv": "data;valor\n2024-01-05;120\n2024-01-09;890\n",
    "dados/vendas_fev.csv": "data;valor\n2024-02-02;450\n2024-02-14;980\n2024-02-20;75\n",
    "dados/vendas_mar.csv": "data;valor\n2024-03-01;3200\n",
    "relatorios/jan.csv": "mes;total\njan;182000\n",
    "relatorios/fev.csv": "mes;total\nfev;175000\n",
  },
  licoes: [
    {
      id: "primeiro-script",
      titulo: "O primeiro script",
      explicacao: [
        "Um **script** é um arquivo de texto com comandos, um por linha, executados em sequência. Tudo o que você roda à mão pode virar um script.",
        "A primeira linha, `#!/bin/bash` (o *shebang*), diz qual programa interpreta o arquivo. Linhas começando com `#` são comentários.",
        "Para criar um arquivo com várias linhas direto no terminal, use um *heredoc*: `cat > script.sh << 'FIM'`, as linhas do script e, por fim, uma linha só com `FIM`.",
        "Rode com `bash script.sh` ou dê permissão (`chmod +x script.sh`) e rode com `./script.sh`.",
        "Argumentos chegam como `$1`, `$2`...; `$#` é a quantidade de argumentos e `$@` são todos eles.",
      ],
      exemplo: r`
cat > ola.sh << 'FIM'
#!/bin/bash
# cumprimenta quem foi passado como argumento
echo "Olá, $1! Você passou $# argumento(s)."
FIM
bash ola.sh Ana
chmod +x ola.sh
./ola.sh Bia Caio
cat ola.sh
`,
      erro: {
        codigo: r`
echo "echo Olá, $1" > ola.sh
cat ola.sh
`,
        explicacao: "Com aspas duplas, o `$1` foi expandido na hora de **criar** o arquivo (e estava vazio). O script ficou só com `echo Olá,`. Use aspas simples (`'echo Olá, $1'`) ou o heredoc com o delimitador entre aspas (`<< 'FIM'`), que guardam o texto literal.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Para que serve a linha `#!/bin/bash` no começo de um script?",
          opcoes: ["É um comentário qualquer", "Indica qual programa vai interpretar o script quando ele for executado com ./", "Dá permissão de execução", "Importa os comandos do bash"],
          resposta: 1,
          dicas: ["Ela é especial por estar na primeira linha.", "Tem o caminho de um programa.", "Esse programa é quem lê o restante do arquivo."],
          comentario: "Scripts Python começam com `#!/usr/bin/env python3` pelo mesmo motivo.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
cat > ola.sh << 'FIM'
echo "Olá, $1!"
FIM
bash ola.sh Ana
`,
          opcoes: ["Olá, Ana!", "Olá, $1!", "Olá, !", "Ana"],
          resposta: 0,
          dicas: ["O heredoc com 'FIM' guarda o texto literal.", "Na execução, $1 recebe o primeiro argumento.", "O argumento é Ana."],
          comentario: "O `$1` só é trocado quando o script roda, porque o heredoc com aspas guardou o texto literal.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para o script mostrar **quantos argumentos** recebeu.",
          codigo: r`
cat > conta.sh << 'FIM'
#!/bin/bash
echo "Você passou ___ argumentos"
FIM
bash conta.sh a b c
`,
          respostas: [["$#"]],
          testes: [["assert 'Você passou 3 argumentos' in _out, _out", "A saída deve ser 'Você passou 3 argumentos'"]],
          dicas: ["É uma variável especial.", "Tem só um símbolo depois do $.", "`$#`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie o script **executável** `saudacao.sh`, que recebe um nome e mostra `Bom dia, NOME! Hoje é AAAA-MM-DD.`, com a data vinda do comando `date +%Y-%m-%d`. Teste com `./saudacao.sh Ana`.",
          inicial: r`
cat > saudacao.sh << 'FIM'
#!/bin/bash

FIM
`,
          testes: [
            ["assert permissoes('~/saudacao.sh')[3] == 'x', permissoes('~/saudacao.sh')", "saudacao.sh deve ser executável"],
            ["assert executa('/home/analista/saudacao.sh Bia').strip() == 'Bom dia, Bia! Hoje é 2024-06-03.', executa('/home/analista/saudacao.sh Bia')", "Com o argumento Bia, deve mostrar 'Bom dia, Bia! Hoje é 2024-06-03.'"],
            ["assert 'date' in ler('~/saudacao.sh')", "A data deve vir do comando date"],
          ],
          dicas: ["Dentro do script: `echo \"Bom dia, $1! Hoje é $(date +%Y-%m-%d).\"`.", "`$(comando)` coloca a saída de um comando no meio do texto.", "Depois do heredoc: `chmod +x saudacao.sh` e `./saudacao.sh Ana`."],
          solucao: r`
cat > saudacao.sh << 'FIM'
#!/bin/bash
echo "Bom dia, $1! Hoje é $(date +%Y-%m-%d)."
FIM
chmod +x saudacao.sh
./saudacao.sh Ana
`,
        },
      ],
    },
    {
      id: "substituicao",
      titulo: "Variáveis, $(...) e contas",
      explicacao: [
        "`$(comando)` executa o comando e coloca a saída no lugar: `n=$(ls dados | wc -l)`. É assim que um script guarda resultados para usar depois.",
        "`$(( conta ))` faz contas com inteiros: `$(( n - 1 ))`, `$(( total * 2 ))`. Para decimais, use `awk` ou outra linguagem.",
        "Coloque variáveis entre **aspas duplas** quando o valor puder ter espaços: `touch \"$arquivo\"`. Sem aspas, o terminal quebra o valor em várias palavras.",
        "Um padrão muito usado em backups: `HOJE=$(date +%Y-%m-%d)` e depois `relatorio_$HOJE.csv`.",
      ],
      exemplo: r`
n=$(ls dados | wc -l)
echo "Há $n arquivos em dados"
linhas=$(wc -l < dados/vendas_fev.csv)
echo "Registros de fevereiro: $(( linhas - 1 ))"
HOJE=$(date +%Y-%m-%d)
echo "backup_$HOJE.tar.gz"
`,
      erro: {
        codigo: r`
arquivo="meu relatorio.txt"
touch $arquivo
ls
`,
        explicacao: "Sem aspas, o valor com espaço virou duas palavras, e o `touch` criou dois arquivos: `meu` e `relatorio.txt`. Use `touch \"$arquivo\"`. Melhor ainda, evite espaços em nomes de arquivo.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "A pasta `dados` tem 3 arquivos. Qual é a saída?",
          codigo: r`
n=$(ls dados | wc -l)
echo "Há $n arquivos"
`,
          opcoes: ["Há 3 arquivos", "Há $n arquivos", "Há $(ls dados | wc -l) arquivos", "3"],
          resposta: 0,
          dicas: ["`$(...)` roda o comando e guarda a saída.", "`ls dados | wc -l` conta os arquivos.", "As aspas duplas expandem `$n`."],
          comentario: "A substituição de comando é a ponte entre os comandos e as variáveis de um script.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que `total=$(( 120 + 80 ))` guarda em `total`?",
          opcoes: ["O texto 120 + 80", "200", "Um erro", "O comando 120"],
          resposta: 1,
          dicas: ["`$(( ))` faz contas.", "Com inteiros.", "120 + 80."],
          comentario: "Para contas com decimais, `awk 'BEGIN {print 10 / 3}'` resolve.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "`vendas_jan.csv` tem 3 linhas, incluindo o cabeçalho. Complete para mostrar a quantidade de **registros** (linhas sem o cabeçalho).",
          codigo: r`
linhas=$(wc -l < dados/vendas_jan.csv)
registros=$(( linhas ___ 1 ))
echo "$registros registros"
`,
          respostas: [["-"]],
          testes: [["assert _out.strip() == '2 registros', _out", "A saída deve ser '2 registros'"]],
          dicas: ["O cabeçalho não é um registro.", "Tire uma linha da contagem.", "`-`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Guarde a data de hoje (`date +%Y-%m-%d`) na variável `HOJE` e crie a pasta `~/backups/` com uma subpasta com o nome da data. Use a variável, sem digitar a data à mão.",
          inicial: r`
`,
          testes: [
            ["assert eh_pasta('~/backups/2024-06-03')", "A pasta ~/backups/2024-06-03 deve existir"],
            ["assert '$(date' in _src and '2024-06-03' not in _src", "Use $(date ...) e não digite a data"],
          ],
          dicas: ["`HOJE=$(date +%Y-%m-%d)`.", "O mkdir precisa criar as duas pastas.", "`mkdir -p backups/$HOJE`."],
          solucao: r`
HOJE=$(date +%Y-%m-%d)
mkdir -p backups/$HOJE
ls backups
`,
        },
      ],
    },
    {
      id: "condicionais",
      titulo: "Condicionais e códigos de saída",
      explicacao: [
        "Todo comando termina com um **código de saída**: `0` quer dizer sucesso e qualquer outro número quer dizer erro. Ele fica em `$?` logo depois do comando.",
        "`if comando; then ...; else ...; fi` decide pelo código de saída. O comando mais usado na condição é o teste `[ ... ]`, **com espaços dentro dos colchetes**.",
        "Testes úteis: `-f arquivo` (existe e é arquivo), `-d pasta`, `-z \"$x\"` (texto vazio), `\"$a\" = \"$b\"` (textos iguais), números com `-eq`, `-ne`, `-gt`, `-lt`, `-ge`, `-le`.",
        "Atalhos: `cmd1 && cmd2` roda o segundo só se o primeiro der certo; `cmd1 || cmd2`, só se der errado. Num script, `exit 1` encerra com erro.",
      ],
      exemplo: r`
ls dados
echo "código: $?"
ls pasta_que_nao_existe
echo "código: $?"
if [ -f dados/vendas_jan.csv ]; then echo "achei janeiro"; fi
x=15
if [ $x -gt 10 ]; then
  echo "maior que 10"
else
  echo "até 10"
fi
[ -d backups ] || echo "a pasta backups ainda não existe"
`,
      erro: {
        codigo: r`
x=15
if [$x -gt 10]; then echo "grande"; fi
`,
        explicacao: "Sem espaço depois do `[`, o terminal procura um comando chamado `[15`: `command not found`. O `[` é um comando e precisa de espaço dos dois lados: `[ $x -gt 10 ]`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
x=15
if [ $x -gt 10 ]; then echo "grande"; else echo "pequeno"; fi
`,
          opcoes: ["grande", "pequeno", "15", "Erro"],
          resposta: 0,
          dicas: ["`-gt` é *greater than*, maior que.", "15 é maior que 10?", "A condição é verdadeira."],
          comentario: "Para comparar números, use `-gt`, `-lt` e companhia. `>` e `<` dentro de `[ ]` comparam como texto (e o `>` ainda viraria um redirecionamento).",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Depois de um comando, `echo $?` mostra `0`. O que isso quer dizer?",
          opcoes: ["Que o comando não fez nada", "Que o comando terminou com sucesso", "Que houve 0 erros, mas também 0 resultados", "Que o comando ainda está rodando"],
          resposta: 1,
          dicas: ["No terminal, 0 não é falso.", "Zero é o código de sucesso.", "Qualquer outro número é erro."],
          comentario: "É o contrário de muitas linguagens, em que 0 é falso. No shell, 0 é \"deu certo\".",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para testar se o **arquivo** `relatorio.txt` existe.",
          codigo: r`
if [ ___ relatorio.txt ]; then
  echo "existe"
else
  echo "não existe"
fi
`,
          respostas: [["-f", "-e"]],
          testes: [["assert _out == 'não existe\\n', _out", "Como o arquivo não existe, deve aparecer 'não existe'"]],
          dicas: ["É um teste de arquivo.", "Uma opção de uma letra.", "`-f`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie o script `verifica.sh`, que recebe o caminho de um arquivo. Se o arquivo existir, mostre `OK: N linhas`. Se não existir, mostre `ERRO: arquivo não encontrado` e saia com código 1.",
          inicial: r`
cat > verifica.sh << 'FIM'
#!/bin/bash

FIM
`,
          testes: [
            ["assert executa('bash ~/verifica.sh ~/dados/vendas_jan.csv') == 'OK: 3 linhas\\n', executa('bash ~/verifica.sh ~/dados/vendas_jan.csv')", "Com um arquivo existente, deve mostrar 'OK: 3 linhas'"],
            ["s = executa('bash ~/verifica.sh nada.csv; echo \"codigo=$?\"')\nassert 'ERRO: arquivo não encontrado' in s and 'codigo=1' in s, s", "Com um arquivo inexistente, deve mostrar o erro e sair com código 1"],
          ],
          dicas: ["`if [ -f \"$1\" ]; then ... else ... fi`.", "Para só o número de linhas: `$(wc -l < \"$1\")`.", "No else: `echo \"ERRO: arquivo não encontrado\"` e `exit 1`."],
          solucao: r`
cat > verifica.sh << 'FIM'
#!/bin/bash
if [ -f "$1" ]; then
  echo "OK: $(wc -l < "$1") linhas"
else
  echo "ERRO: arquivo não encontrado"
  exit 1
fi
FIM
bash verifica.sh dados/vendas_jan.csv
bash verifica.sh nada.csv
echo "código de saída: $?"
`,
        },
      ],
    },
    {
      id: "lacos",
      titulo: "Laços e agendamento",
      explicacao: [
        "`for item in lista; do ...; done` repete os comandos para cada item. Com curingas, percorre arquivos: `for f in dados/*.csv; do ...; done`.",
        "`$(seq 1 5)` gera uma sequência de números para laços com contador. `while condicao; do ...; done` repete enquanto a condição for verdadeira.",
        "`basename caminho` tira as pastas do caminho (`dados/vendas_jan.csv` vira `vendas_jan.csv`), útil para montar nomes de saída.",
        "Para rodar um script sozinho, em horários fixos, o Linux tem o **cron**. Uma linha do `crontab -e` como `0 7 * * 1-5 /home/analista/resumo.sh` roda o script às 7h, de segunda a sexta. Os cinco campos são minuto, hora, dia do mês, mês e dia da semana.",
      ],
      exemplo: r`
for m in jan fev mar; do
  echo "relatorio_$m.csv"
done
for f in dados/*.csv; do
  echo "$(basename $f): $(wc -l < $f) linhas"
done
for i in $(seq 1 3); do echo "tentativa $i"; done
`,
      erro: {
        codigo: r`
for f in dados/*.csv
  echo $f
done
`,
        explicacao: "Faltou o `do` (e o `;` ou a quebra de linha antes dele). A estrutura completa é `for f in lista; do comandos; done`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
for m in jan fev mar; do echo "relatorio_$m.csv"; done
`,
          opcoes: ["relatorio_jan.csv\nrelatorio_fev.csv\nrelatorio_mar.csv", "relatorio_$m.csv", "relatorio_jan fev mar.csv", "jan\nfev\nmar"],
          resposta: 0,
          dicas: ["O corpo roda uma vez para cada item.", "A cada volta, `$m` vale um mês.", "Três linhas."],
          comentario: "O mesmo padrão gera nomes de arquivo para cada mês de um ano.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "No cron, quando roda a linha `0 7 * * 1-5 /home/analista/resumo.sh`?",
          opcoes: ["Todo dia às 0h07", "Às 7h, de segunda a sexta", "No dia 7 de cada mês", "A cada 7 minutos"],
          resposta: 1,
          dicas: ["Os campos são minuto, hora, dia do mês, mês e dia da semana.", "Minuto 0, hora 7.", "1-5 no último campo são os dias úteis."],
          comentario: "`*` quer dizer qualquer valor. Sites como o crontab.guru ajudam a montar e conferir essas linhas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete o laço que mostra o número de linhas de cada CSV da pasta `dados`.",
          codigo: r`
for f in dados/*.csv; ___
  wc -l < "$f"
___
`,
          respostas: [["do"], ["done"]],
          testes: [["assert _out == '4\\n3\\n2\\n', _out", "Devem aparecer as contagens 4, 3 e 2 (fev, jan, mar)"]],
          dicas: ["O corpo do laço começa com uma palavra-chave.", "E termina com outra.", "`do` e `done`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Para cada CSV em `dados`, mostre uma linha `arquivo;registros`, com o nome do arquivo (sem a pasta) e a quantidade de registros (linhas menos o cabeçalho).",
          inicial: r`
`,
          testes: [["assert _out == 'vendas_fev.csv;3\\nvendas_jan.csv;2\\nvendas_mar.csv;1\\n', _out", "A saída deve ser vendas_fev.csv;3, vendas_jan.csv;2 e vendas_mar.csv;1"]],
          dicas: ["Percorra com `for f in dados/*.csv; do ... done`.", "Conte com `linhas=$(wc -l < \"$f\")` e desconte o cabeçalho com `$(( linhas - 1 ))`.", "O nome sem a pasta: `$(basename \"$f\")`."],
          solucao: r`
for f in dados/*.csv; do
  linhas=$(wc -l < "$f")
  echo "$(basename "$f");$(( linhas - 1 ))"
done
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "resumo-csv",
      titulo: "Script de resumo dos CSVs",
      enunciado: [
        "Crie o script **executável** `resumo.sh`, que recebe uma pasta e gera, na pasta atual, o arquivo `resumo.csv` com o cabeçalho `arquivo;registros` e uma linha por CSV da pasta. No fim, ele mostra `Total: N registros`.",
        "Rode o script com `./resumo.sh dados`.",
      ],
      inicial: r`
cat > resumo.sh << 'FIM'
#!/bin/bash

FIM
`,
      testes: [
        ["assert permissoes('~/resumo.sh')[3] == 'x', permissoes('~/resumo.sh')", "resumo.sh deve ser executável"],
        ["executa('rm -f ~/resumo.csv; cd ~ && ./resumo.sh dados')\nassert ler('~/resumo.csv') == 'arquivo;registros\\nvendas_fev.csv;3\\nvendas_jan.csv;2\\nvendas_mar.csv;1\\n', ler('~/resumo.csv')", "resumo.csv deve ter o cabeçalho e uma linha por arquivo"],
        ["s = executa('cd ~ && ./resumo.sh dados')\nassert 'Total: 6 registros' in s, s", "O script deve mostrar 'Total: 6 registros'"],
      ],
      dicas: ["Comece gravando o cabeçalho com `echo \"arquivo;registros\" > resumo.csv` e um `total=0`.", "No laço sobre `\"$1\"/*.csv`, calcule os registros, acrescente a linha com `>>` e some: `total=$(( total + n ))`.", "Depois do `done`: `echo \"Total: $total registros\"`. Não esqueça do `chmod +x resumo.sh`."],
      solucao: r`
cat > resumo.sh << 'FIM'
#!/bin/bash
# uso: ./resumo.sh pasta
echo "arquivo;registros" > resumo.csv
total=0
for f in "$1"/*.csv; do
  n=$(( $(wc -l < "$f") - 1 ))
  echo "$(basename "$f");$n" >> resumo.csv
  total=$(( total + n ))
done
echo "Total: $total registros"
FIM
chmod +x resumo.sh
./resumo.sh dados
cat resumo.csv
`,
    },
    {
      id: "backup-script",
      titulo: "Script de backup com verificação",
      enunciado: [
        "Crie o script `backup.sh`, que recebe uma pasta. Se a pasta não existir, ele mostra `ERRO: pasta NOME não existe` e sai com código 1. Se existir, cria (se preciso) a pasta `~/backups` e grava nela `NOME_AAAA-MM-DD.tar.gz` com o conteúdo da pasta, usando a data de hoje. No fim, mostra `Backup criado: CAMINHO`.",
        "Teste com `bash backup.sh relatorios`.",
      ],
      inicial: r`
cat > backup.sh << 'FIM'
#!/bin/bash

FIM
`,
      testes: [
        ["executa('cd ~ && bash backup.sh relatorios')\nassert existe('~/backups/relatorios_2024-06-03.tar.gz')", "Com a pasta relatorios, deve criar ~/backups/relatorios_2024-06-03.tar.gz"],
        ["assert 'relatorios/jan.csv' in executa('tar -tzf ~/backups/relatorios_2024-06-03.tar.gz')", "O pacote deve conter os relatórios"],
        ["s = executa('cd ~ && bash backup.sh nada; echo \"codigo=$?\"')\nassert 'ERRO: pasta nada não existe' in s and 'codigo=1' in s, s", "Com uma pasta inexistente, deve mostrar o erro e sair com código 1"],
      ],
      dicas: ["Primeiro o teste: `if [ ! -d \"$1\" ]; then echo \"ERRO: pasta $1 não existe\"; exit 1; fi`.", "Monte o destino: `destino=~/backups/$(basename \"$1\")_$(date +%Y-%m-%d).tar.gz`, depois de um `mkdir -p ~/backups`.", "`tar -czf \"$destino\" \"$1\"` e `echo \"Backup criado: $destino\"`."],
      solucao: r`
cat > backup.sh << 'FIM'
#!/bin/bash
# uso: bash backup.sh pasta
if [ ! -d "$1" ]; then
  echo "ERRO: pasta $1 não existe"
  exit 1
fi
mkdir -p ~/backups
destino=~/backups/$(basename "$1")_$(date +%Y-%m-%d).tar.gz
tar -czf "$destino" "$1"
echo "Backup criado: $destino"
FIM
bash backup.sh relatorios
bash backup.sh nada
`,
      comentario: "Com uma linha no cron (`0 22 * * * /home/analista/backup.sh /home/analista/relatorios`), esse backup passa a rodar sozinho toda noite.",
    },
  ],
}));
