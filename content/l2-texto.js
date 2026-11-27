Ensaio.modulo((r) => ({
  id: "l2",
  trilha: "linux",
  ordem: 2,
  titulo: "Texto e dados no terminal",
  resumo: "Redirecionamentos, pipes, grep, sort, uniq, cut, awk e sed para analisar CSVs e logs sem abrir planilha.",
  arquivos: {
    "vendas.csv": r`
data;regiao;vendedor;produto;valor
2024-06-01;Sul;Bruno;Caneta;120
2024-06-01;Sudeste;Ana;Papel A4;890
2024-06-02;Nordeste;Carla;Toner;1450
2024-06-02;Sul;Bruno;Grampeador;95
2024-06-03;Sudeste;Ana;Caneta;210
2024-06-03;Sudeste;Diego;Monitor;3200
2024-06-04;Nordeste;Carla;Papel A4;640
2024-06-04;Sul;Elisa;Toner;1310
2024-06-05;Sudeste;Ana;Mouse;450
2024-06-05;Centro-Oeste;Fábio;Caneta;75
2024-06-06;Sul;Bruno;Papel A4;520
2024-06-06;Sudeste;Diego;Toner;1600
`.trim() + "\n",
    "app.log": r`
2024-06-03 08:00:01 INFO [api] Servidor iniciado
2024-06-03 08:05:12 INFO [vendas] Importação iniciada
2024-06-03 08:05:40 WARN [vendas] Linha 18 com valor vazio
2024-06-03 08:06:02 ERROR [pagamentos] Timeout ao consultar banco
2024-06-03 08:10:33 INFO [api] Requisição /relatorios 200
2024-06-03 08:12:45 ERROR [vendas] Arquivo vendas_junho.csv não encontrado
2024-06-03 08:15:00 INFO [agenda] Rotina diária executada
2024-06-03 08:20:18 ERROR [pagamentos] Timeout ao consultar banco
2024-06-03 08:21:07 WARN [api] Resposta lenta: 3200 ms
2024-06-03 08:30:55 ERROR [pagamentos] Cartão recusado pelo emissor
2024-06-03 08:31:10 INFO [vendas] Importação concluída
2024-06-03 08:45:00 ERROR [api] Falha de autenticação para usuário bia
`.trim() + "\n",
    "clientes.txt": r`
Mercado Bom Preço
Farmácia Saúde
Padaria Central
Mercado Bom Preço
Papelaria Estrela
Farmácia Saúde
Mercado Bom Preço
`.trim() + "\n",
  },
  licoes: [
    {
      id: "redirecionar",
      titulo: "Redirecionamentos",
      explicacao: [
        "Por padrão, a saída de um comando aparece na tela. Com **redirecionamento**, ela vai para um arquivo: `>` cria ou **substitui** o arquivo, e `>>` **acrescenta** no fim.",
        "`<` faz o comando ler de um arquivo: `wc -l < vendas.csv` mostra só o número, sem o nome.",
        "Mensagens de erro saem por outro canal, a saída de erro. `2> erros.txt` grava só os erros; `2> /dev/null` os descarta; `> tudo.txt 2>&1` junta os dois.",
        "`echo \"texto\"` escreve um texto, e é muito usado com `>` e `>>` para montar arquivos de relatório.",
      ],
      exemplo: r`
echo "Relatório do dia" > relatorio.txt
grep ERROR app.log >> relatorio.txt
cat relatorio.txt
wc -l < vendas.csv
ls arquivo_que_nao_existe 2> /dev/null
echo "terminou"
`,
      erro: {
        codigo: r`
sort vendas.csv > vendas.csv
wc -l vendas.csv
`,
        explicacao: "O `>` esvazia o arquivo **antes** de o comando rodar. O `sort` lê um arquivo já vazio e os dados se perdem. Nunca leia e grave no mesmo arquivo: grave num arquivo novo (`sort vendas.csv > ordenado.csv`) e depois renomeie, se quiser.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
echo "a" > f.txt
echo "b" > f.txt
cat f.txt
`,
          opcoes: ["b", "a\nb", "a", "(nada)"],
          resposta: 0,
          dicas: ["O `>` cria ou substitui.", "O segundo echo substitui o conteúdo.", "Para acumular, seria `>>`."],
          comentario: "Com `>>` no segundo comando, o arquivo teria as duas linhas.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual é a diferença entre `>` e `>>`?",
          opcoes: ["Nenhuma", "`>` substitui o conteúdo do arquivo; `>>` acrescenta no fim", "`>>` substitui; `>` acrescenta", "`>>` grava só os erros"],
          resposta: 1,
          dicas: ["Pense num arquivo de log que cresce todo dia.", "Um deles apaga o que havia antes.", "O duplo acrescenta."],
          comentario: "Para registrar a execução de uma rotina todo dia, use `>>`, senão cada dia apaga o anterior.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para gravar as linhas de erro do log no arquivo `erros.txt`.",
          codigo: r`
grep ERROR app.log ___ erros.txt
`,
          respostas: [[">"]],
          testes: [["assert ler('~/erros.txt') == executa('grep ERROR ~/app.log'), ler('~/erros.txt')", "erros.txt deve conter as 5 linhas de ERROR"]],
          dicas: ["A saída deve ir para um arquivo.", "O arquivo ainda não existe.", "`>`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Monte o arquivo `relatorio.txt` com duas linhas: na primeira, o texto `Relatório de vendas`; na segunda, só o **número de linhas** de `vendas.csv` (sem o nome do arquivo).",
          inicial: r`
`,
          testes: [["assert ler('~/relatorio.txt') == 'Relatório de vendas\\n13\\n', repr(ler('~/relatorio.txt'))", "relatorio.txt deve ter 'Relatório de vendas' e, na linha de baixo, 13"]],
          dicas: ["A primeira linha vem de um `echo ... > relatorio.txt`.", "A segunda deve ser acrescentada com `>>`.", "Para só o número: `wc -l < vendas.csv >> relatorio.txt`."],
          solucao: r`
echo "Relatório de vendas" > relatorio.txt
wc -l < vendas.csv >> relatorio.txt    # < lê o arquivo sem mostrar o nome
cat relatorio.txt
`,
        },
      ],
    },
    {
      id: "pipes",
      titulo: "Pipes: sort, uniq e companhia",
      explicacao: [
        "O **pipe** `|` liga a saída de um comando à entrada do próximo. É como montar uma linha de produção com ferramentas pequenas: `cat clientes.txt | sort | uniq`.",
        "`sort` ordena linhas (`-n` numérico, `-r` decrescente, `-t ';' -k 5` pela 5ª coluna separada por ponto e vírgula).",
        "`uniq` remove repetições **seguidas**, por isso vem sempre depois de um `sort`. `uniq -c` conta quantas vezes cada linha aparece.",
        "A combinação `sort | uniq -c | sort -rn` é o \"tabela dinâmica\" do terminal: conta e ordena do mais frequente para o menos frequente. Termine com `head` para ver o topo.",
      ],
      exemplo: r`
cat clientes.txt | sort
sort clientes.txt | uniq
sort clientes.txt | uniq -c | sort -rn
tail -n +2 vendas.csv | sort -t ';' -k 5 -n | tail -n 3
`,
      erro: {
        codigo: r`
uniq -c clientes.txt
`,
        explicacao: "Sem ordenar antes, o `uniq` só junta repetições vizinhas, e a contagem sai errada: \"Mercado Bom Preço\" aparece em três linhas separadas. Ordene primeiro: `sort clientes.txt | uniq -c`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "`clientes.txt` tem 7 linhas, mas só 4 clientes diferentes. Qual é a saída?",
          codigo: r`
sort clientes.txt | uniq | wc -l
`,
          opcoes: ["4", "7", "3", "1"],
          resposta: 0,
          dicas: ["Ordena, tira repetições e conta.", "Sobram os clientes diferentes.", "São quatro."],
          comentario: "`sort -u clientes.txt | wc -l` dá o mesmo resultado.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Por que o `sort` vem antes do `uniq`?",
          opcoes: ["Porque o uniq só funciona com números", "Porque o uniq só remove repetições que estejam em linhas vizinhas", "Porque o sort apaga as repetições", "Não precisa; a ordem tanto faz"],
          resposta: 1,
          dicas: ["Lembre do erro comum da lição.", "O uniq compara cada linha com a anterior.", "Ordenar coloca as iguais juntas."],
          comentario: "Ordenar deixa as linhas iguais lado a lado, e aí o uniq consegue juntá-las.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para contar quantas vendas cada vendedor fez (o vendedor é a 3ª coluna).",
          codigo: r`
cut -d ';' -f 3 vendas.csv | tail -n +2 | sort | uniq ___
`,
          respostas: [["-c"]],
          testes: [["assert _out == executa(\"cut -d ';' -f 3 ~/vendas.csv | tail -n +2 | sort | uniq -c\"), _out", "Deve aparecer a contagem de vendas por vendedor"]],
          dicas: ["Falta a opção que conta.", "É uma letra só.", "`-c`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Mostre os **3 vendedores com mais vendas** (número de linhas em `vendas.csv`), do maior para o menor, no formato do `uniq -c`.",
          inicial: r`
`,
          testes: [["assert _out == executa(\"cut -d ';' -f 3 ~/vendas.csv | tail -n +2 | sort | uniq -c | sort -rn | head -n 3\"), _out", "Devem aparecer os 3 vendedores com mais vendas, com a contagem"]],
          dicas: ["Comece pelo pipeline do exercício anterior.", "Depois ordene pela contagem, do maior para o menor: `sort -rn`.", "Termine com `head -n 3`."],
          solucao: r`
cut -d ';' -f 3 vendas.csv |   # só a coluna do vendedor
  tail -n +2 |                 # tira o cabeçalho
  sort | uniq -c |             # conta por vendedor
  sort -rn |                   # maior contagem primeiro
  head -n 3                    # só o top 3
`,
          comentario: "Um pipe no fim da linha permite continuar o comando na linha de baixo, o que deixa pipelines longos legíveis.",
        },
      ],
    },
    {
      id: "grep",
      titulo: "Buscar com grep",
      explicacao: [
        "`grep padrao arquivo` mostra as linhas que contêm o padrão. É a ferramenta número um para investigar logs.",
        "Opções do dia a dia: `-i` ignora maiúsculas, `-n` mostra o número da linha, `-v` inverte (linhas que **não** têm o padrão), `-c` conta, `-r` busca em todas as subpastas e `-l` mostra só os nomes dos arquivos.",
        "O padrão é uma **expressão regular**: `^` é o começo da linha, `$` o fim e `.` qualquer caractere. Com `-E`, vale `|` para \"ou\": `grep -E \"WARN|ERROR\"`.",
        "Use aspas no padrão quando ele tiver espaços ou caracteres especiais.",
      ],
      exemplo: r`
grep ERROR app.log
grep -c ERROR app.log
grep -n "pagamentos" app.log
grep -v INFO app.log
grep -i "timeout" app.log
grep -E "WARN|ERROR" app.log | wc -l
grep "^2024-06-03 08:0" app.log
`,
      erro: {
        codigo: r`
grep Erro app.log
echo "linhas encontradas: $?"
`,
        explicacao: "Nenhuma linha tem `Erro` com essa grafia, e o grep não mostra nada. O código de saída `1` (em `$?`) indica que não encontrou. Confira maiúsculas ou use `-i`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "O log tem 5 linhas de `ERROR`. Qual é a saída?",
          codigo: r`
grep -c ERROR app.log
`,
          opcoes: ["5", "12", "ERROR", "0"],
          resposta: 0,
          dicas: ["`-c` conta linhas.", "Só as que têm ERROR.", "São cinco."],
          comentario: "É o mesmo que `grep ERROR app.log | wc -l`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual comando mostra as linhas do log que **não** são `INFO`?",
          opcoes: ["`grep INFO app.log`", "`grep -v INFO app.log`", "`grep -c INFO app.log`", "`grep -n INFO app.log`"],
          resposta: 1,
          dicas: ["Você quer inverter a busca.", "A opção vem de *invert*.", "`-v`."],
          comentario: "`grep -v` é ótimo para tirar o ruído de um log antes de ler.",
        },
        {
          tipo: "corrigir", nivel: 1,
          enunciado: "O comando deveria mostrar as linhas que falam de **timeout** (no log, a palavra aparece como `Timeout`), mas não mostra nada. Corrija sem mudar a palavra buscada.",
          inicial: r`
grep timeout app.log
`,
          testes: [["assert _out == executa('grep -i timeout ~/app.log') and _out, _out", "Devem aparecer as 2 linhas com Timeout"]],
          dicas: ["A diferença está numa letra maiúscula.", "Existe uma opção que ignora maiúsculas.", "`grep -i timeout app.log`."],
          solucao: r`
grep -i timeout app.log   # -i ignora maiúsculas e minúsculas
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Mostre as linhas do log que são `WARN` **ou** `ERROR`, com o **número da linha** na frente.",
          inicial: r`
`,
          testes: [["assert _out == executa('grep -nE \"WARN|ERROR\" ~/app.log'), _out", "Devem aparecer as 7 linhas de WARN e ERROR, numeradas"]],
          dicas: ["Você precisa de duas opções do grep.", "Uma para o número da linha e outra para usar `|`.", "`grep -nE \"WARN|ERROR\" app.log`."],
          solucao: r`
grep -nE "WARN|ERROR" app.log   # -n numera, -E permite o | (ou)
`,
        },
      ],
    },
    {
      id: "cut-awk-sed",
      titulo: "Colunas e transformações: cut, awk e sed",
      explicacao: [
        "`cut -d ';' -f 2,5 vendas.csv` recorta colunas de um arquivo delimitado (`-d` é o separador, `-f` as colunas).",
        "`awk` trata cada linha como um registro com campos `$1`, `$2`... `-F ';'` define o separador. Com ele dá para filtrar e somar: `awk -F ';' '$2 == \"Sul\" {s += $5} END {print s}' vendas.csv`.",
        "No awk, `NR` é o número da linha (então `NR > 1` pula o cabeçalho) e `END {...}` roda no fim, depois de ler tudo.",
        "`sed 's/antigo/novo/g'` substitui texto em cada linha (o `g` troca todas as ocorrências da linha, não só a primeira). `sed -i` altera o próprio arquivo.",
        "> Este terminal tem um awk simplificado: `print`, filtros, somas com `+=`, `NR`, `NF` e `END`. No Linux de verdade, o awk é uma linguagem completa.",
      ],
      exemplo: r`
cut -d ';' -f 2,5 vendas.csv | head -n 4
awk -F ';' 'NR > 1 {print $3, $5}' vendas.csv | head -n 3
awk -F ';' 'NR > 1 {s += $5} END {print "total:", s}' vendas.csv
awk -F ';' '$5 > 1000 {print $4, $5}' vendas.csv
sed 's/;/,/g' vendas.csv | head -n 2
`,
      erro: {
        codigo: r`
cut -f 2 vendas.csv | head -n 2
`,
        explicacao: "Sem `-d`, o `cut` usa tabulação como separador. Como não há tabulações no arquivo, cada linha sai inteira. Informe o separador: `cut -d ';' -f 2`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "As três primeiras linhas de `vendas.csv` são o cabeçalho, uma venda do Sul e uma do Sudeste. Qual é a saída?",
          codigo: r`
cut -d ';' -f 2 vendas.csv | head -n 3
`,
          opcoes: ["regiao\nSul\nSudeste", "Sul\nSudeste\nNordeste", "data\n2024-06-01\n2024-06-01", "regiao;vendedor\nSul;Bruno\nSudeste;Ana"],
          resposta: 0,
          dicas: ["A coluna 2 é a região.", "O cabeçalho também é uma linha.", "head -n 3 pega as três primeiras."],
          comentario: "Para pular o cabeçalho, acrescente `tail -n +2` antes do head.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que o `g` faz em `sed 's/;/,/g'`?",
          opcoes: ["Grava no arquivo", "Troca todas as ocorrências da linha, não só a primeira", "Ignora maiúsculas", "Trata o padrão como expressão regular"],
          resposta: 1,
          dicas: ["Sem ele, o sed troca só a primeira ocorrência de cada linha.", "Cada linha do CSV tem vários `;`.", "`g` de *global*."],
          comentario: "Sem o `g`, só o primeiro ponto e vírgula de cada linha viraria vírgula.",
        },
        {
          tipo: "completar", nivel: 2,
          enunciado: "Complete para somar a coluna de **valor** (a 5ª) de todas as vendas, sem o cabeçalho.",
          codigo: r`
awk -F ';' 'NR > 1 {s += $___} END {print s}' vendas.csv
`,
          respostas: [["5"]],
          testes: [["assert _out.strip() == '10560', _out", "O total vendido deve ser 10560"]],
          dicas: ["Os campos são numerados a partir de 1.", "data, regiao, vendedor, produto, valor.", "`5`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Mostre o **total vendido na região Sul**, só o número, usando `awk`.",
          inicial: r`
`,
          testes: [
            ["assert _out.strip() == '2045', _out", "O total do Sul deve ser 2045"],
            ["assert 'awk' in _src", "Use awk"],
          ],
          dicas: ["Filtre as linhas em que a coluna 2 é \"Sul\".", "Some a coluna 5 com `+=`.", "`awk -F ';' '$2 == \"Sul\" {s += $5} END {print s}' vendas.csv`."],
          solucao: r`
awk -F ';' '$2 == "Sul" {s += $5} END {print s}' vendas.csv
`,
          comentario: "Para todas as regiões de uma vez, o awk de verdade usa vetores: `{s[$2] += $5} END {for (r in s) print r, s[r]}`. Fica para quando você usar o terminal do seu computador.",
        },
      ],
    },
  ],
  desafios: [
    {
      id: "erros-por-modulo",
      titulo: "Relatório de erros por módulo",
      enunciado: [
        "O time de sistemas quer saber quais módulos mais deram erro. Cada linha de erro do `app.log` traz o módulo entre colchetes, como `[pagamentos]`, na 4ª palavra.",
        "Grave em `erros_por_modulo.txt` a contagem de erros por módulo, do mais frequente para o menos frequente, no formato do `uniq -c`.",
      ],
      inicial: r`
`,
      testes: [["assert ler('~/erros_por_modulo.txt') == executa(\"grep ERROR ~/app.log | cut -d ' ' -f 4 | sort | uniq -c | sort -rn\"), ler('~/erros_por_modulo.txt')", "erros_por_modulo.txt deve ter a contagem por módulo, do maior para o menor ([pagamentos] com 3)"]],
      dicas: ["Comece filtrando só as linhas de ERROR.", "O módulo é a 4ª palavra: `cut -d ' ' -f 4`.", "Termine com `sort | uniq -c | sort -rn > erros_por_modulo.txt`."],
      solucao: r`
grep ERROR app.log |
  cut -d ' ' -f 4 |       # [pagamentos], [vendas]...
  sort | uniq -c |
  sort -rn > erros_por_modulo.txt
cat erros_por_modulo.txt
`,
    },
    {
      id: "csv-sudeste",
      titulo: "Extrair as vendas do Sudeste",
      enunciado: [
        "Um sistema antigo só aceita arquivos separados por **vírgula** e **sem cabeçalho**. Gere `vendas_sudeste.csv` só com as vendas da região Sudeste, no formato que o sistema aceita, e mostre quantas linhas ele tem.",
      ],
      inicial: r`
`,
      testes: [
        ["assert ler('~/vendas_sudeste.csv') == executa(\"grep ';Sudeste;' ~/vendas.csv | sed 's/;/,/g'\"), ler('~/vendas_sudeste.csv')", "vendas_sudeste.csv deve ter as 5 vendas do Sudeste, separadas por vírgula, sem cabeçalho"],
        ["import re\nassert re.search(r'(^|\\s)5(\\s|$)', _out), _out", "Mostre a contagem de linhas do arquivo (5)"],
      ],
      dicas: ["Filtre com `grep ';Sudeste;' vendas.csv`: os `;` evitam pegar outro texto que contenha Sudeste.", "Troque os separadores com `sed 's/;/,/g'` e grave com `>`.", "Conte com `wc -l vendas_sudeste.csv`."],
      solucao: r`
grep ';Sudeste;' vendas.csv | sed 's/;/,/g' > vendas_sudeste.csv
wc -l vendas_sudeste.csv
`,
      comentario: "Como o cabeçalho não contém `;Sudeste;`, ele já fica de fora pelo próprio filtro.",
    },
  ],
}));
