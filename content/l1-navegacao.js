Ensaio.modulo((r) => ({
  id: "l1",
  trilha: "linux",
  ordem: 1,
  titulo: "Navegação e arquivos",
  resumo: "Onde estou, o que tem aqui e como criar, copiar, mover, apagar e encontrar arquivos.",
  arquivos: {
    "documentos/relatorio_jan.csv": "mes;total\njan;182000\n",
    "documentos/relatorio_fev.csv": "mes;total\nfev;175000\n",
    "documentos/apresentacao.pptx": "(apresentação simulada)\n",
    "downloads/planilha_final_v3.xlsx": "(planilha simulada)\n",
    "downloads/contrato.pdf": "(pdf simulado)\n",
    "downloads/manual.pdf": "(pdf simulado)\n",
    "downloads/dados_brutos.csv": "id;valor\n1;10\n2;20\n3;35\n",
    "downloads/.cache": "arquivo temporário\n",
    "notas.txt": "Reunião segunda às 10h\nEnviar relatório até sexta\nRevisar contrato\nLigar para o fornecedor\n",
  },
  licoes: [
    {
      id: "navegar",
      titulo: "pwd, ls e cd",
      explicacao: [
        "O **terminal** é uma forma de conversar com o computador por texto: você digita um comando, aperta Enter e vê a resposta. Em servidores, na nuvem e em ferramentas de dados ele é o caminho mais direto.",
        "`pwd` mostra a pasta atual. `ls` lista o que tem nela: `ls -l` mostra os detalhes (permissões, tamanho, data) e `ls -a` inclui os arquivos ocultos, que começam com ponto.",
        "`cd pasta` entra numa pasta, `cd ..` sobe um nível e `cd` sozinho (ou `cd ~`) volta para a pasta pessoal (`/home/analista`). `cd -` volta para a pasta anterior.",
        "Caminho **absoluto** começa na raiz `/` (`/home/analista/notas.txt`). Caminho **relativo** parte da pasta atual (`documentos/relatorio_jan.csv`). O `~` é um atalho para a sua pasta pessoal.",
        "> No Level Code, cada execução começa num terminal novo, na sua pasta pessoal, com os arquivos do módulo. Abra o painel de ambiente inicial para ver o que existe.",
      ],
      exemplo: r`
pwd
ls
ls -l documentos
ls -a downloads
cd documentos
pwd
cd ..
pwd
`,
      erro: {
        codigo: r`
cd Documentos
`,
        explicacao: "No Linux, maiúsculas e minúsculas são diferentes: `Documentos` e `documentos` são pastas distintas. A mensagem `No such file or directory` quase sempre é um nome digitado diferente. Dica: aperte Tab no terminal de verdade para completar nomes.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual destes é um caminho **absoluto**?",
          opcoes: ["`documentos/relatorio.csv`", "`../notas.txt`", "`/home/analista/notas.txt`", "`./downloads`"],
          resposta: 2,
          dicas: ["Um caminho absoluto não depende da pasta atual.", "Ele começa na raiz do sistema.", "A raiz é a barra `/`."],
          comentario: "Caminhos absolutos começam com `/`. Os outros são relativos à pasta em que você está.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Você está na pasta pessoal (`/home/analista`). Qual é a saída?",
          codigo: r`
cd documentos
pwd
`,
          opcoes: ["/home/analista/documentos", "documentos", "/documentos", "/home/analista"],
          resposta: 0,
          dicas: ["`cd` não mostra nada quando dá certo.", "`pwd` mostra o caminho completo.", "A pasta documentos fica dentro de /home/analista."],
          comentario: "`pwd` sempre mostra o caminho absoluto da pasta atual.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para entrar na pasta de downloads e listar o que tem nela.",
          codigo: r`
cd ___
ls
`,
          respostas: [["downloads", "~/downloads", "/home/analista/downloads", "downloads/"]],
          testes: [["assert cwd() == '/home/analista/downloads', cwd()", "No fim, a pasta atual deve ser ~/downloads"]],
          dicas: ["O comando de mudar de pasta já está escrito.", "Falta o nome da pasta.", "`downloads`."],
        },
        {
          tipo: "escrever", nivel: 1,
          enunciado: "Entre na pasta `documentos`, liste os arquivos dela **com detalhes** (formato longo) e depois volte para a pasta pessoal.",
          inicial: r`
# seus comandos aqui
`,
          testes: [
            ["assert 'relatorio_jan.csv' in _out and 'analista' in _out", "A listagem detalhada de documentos deve aparecer"],
            ["assert '-l' in _src", "Use `ls -l`"],
            ["assert cwd() == '/home/analista', cwd()", "No fim, você deve estar de volta à pasta pessoal"],
          ],
          dicas: ["São três comandos, um por linha.", "O formato longo é `ls -l`.", "Para voltar: `cd ..` ou só `cd`."],
          solucao: r`
cd documentos   # entra na pasta
ls -l           # lista com detalhes
cd ~            # volta para a pasta pessoal (cd sozinho também funciona)
`,
        },
      ],
    },
    {
      id: "organizar",
      titulo: "Criar, copiar, mover e apagar",
      explicacao: [
        "`mkdir pasta` cria uma pasta; `mkdir -p a/b/c` cria o caminho inteiro de uma vez. `touch arquivo` cria um arquivo vazio.",
        "`cp origem destino` copia (para pastas, `cp -r`). `mv origem destino` move, e também serve para **renomear**: `mv velho.txt novo.txt`.",
        "`rm arquivo` apaga e `rm -r pasta` apaga uma pasta com tudo dentro. `rmdir` só apaga pastas vazias.",
        "> No terminal **não existe lixeira**: o que o `rm` apaga não volta. Confira com `ls` antes de apagar, principalmente com `-r`.",
      ],
      exemplo: r`
mkdir -p projetos/vendas/2024
touch projetos/vendas/2024/resumo.txt
cp notas.txt projetos/
mv projetos/notas.txt projetos/anotacoes.txt
ls -R projetos
rm -r projetos
ls
`,
      erro: {
        codigo: r`
rmdir documentos
`,
        explicacao: "`rmdir` só remove pastas vazias: `Directory not empty`. Para apagar uma pasta com conteúdo, use `rm -r`, com cuidado, porque não há volta.",
      },
      exercicios: [
        {
          tipo: "multipla", nivel: 1,
          enunciado: "O que acontece com um arquivo apagado com `rm`?",
          opcoes: ["Vai para a lixeira", "É apagado de vez; não há lixeira no terminal", "Fica oculto, com um ponto no nome", "Só é apagado depois de reiniciar"],
          resposta: 1,
          dicas: ["O terminal não tem a lixeira do explorador de arquivos.", "Não existe desfazer.", "Por isso vale conferir com `ls` antes."],
          comentario: "Existem opções como `rm -i` (pergunta antes de apagar cada arquivo), mas o mais seguro é conferir antes.",
        },
        {
          tipo: "prever", nivel: 1,
          enunciado: "Qual é a saída?",
          codigo: r`
mkdir teste
touch teste/b.txt teste/a.txt
ls teste
`,
          opcoes: ["a.txt  b.txt", "b.txt  a.txt", "teste", "(nada)"],
          resposta: 0,
          dicas: ["`touch` cria os dois arquivos.", "`ls` mostra os nomes em ordem alfabética.", "a vem antes de b."],
          comentario: "O `ls` ordena os nomes, independentemente da ordem em que foram criados.",
        },
        {
          tipo: "corrigir", nivel: 1,
          enunciado: "O comando deveria criar a pasta `relatorios/2024/junho` (com as pastas intermediárias), mas dá erro. Corrija.",
          inicial: r`
mkdir relatorios/2024/junho
`,
          testes: [["assert eh_pasta('~/relatorios/2024/junho')", "A pasta ~/relatorios/2024/junho deve existir"]],
          dicas: ["Leia o erro: a pasta `relatorios` ainda não existe.", "O mkdir pode criar o caminho inteiro.", "Use a opção `-p`."],
          solucao: r`
mkdir -p relatorios/2024/junho   # -p cria as pastas que faltarem no caminho
`,
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a pasta `~/downloads/pdfs`, **mova** os dois PDFs de `downloads` para ela e **copie** `downloads/dados_brutos.csv` para a pasta `documentos`.",
          inicial: r`
`,
          testes: [
            ["assert existe('~/downloads/pdfs/contrato.pdf') and existe('~/downloads/pdfs/manual.pdf')", "Os dois PDFs devem estar em ~/downloads/pdfs"],
            ["assert not existe('~/downloads/contrato.pdf') and not existe('~/downloads/manual.pdf')", "Os PDFs não devem continuar soltos em downloads (é para mover)"],
            ["assert existe('~/documentos/dados_brutos.csv') and existe('~/downloads/dados_brutos.csv')", "dados_brutos.csv deve estar nas duas pastas (é para copiar)"],
          ],
          dicas: ["Primeiro `mkdir`, depois `mv` e por último `cp`.", "O `mv` aceita vários arquivos antes da pasta de destino.", "`mv downloads/contrato.pdf downloads/manual.pdf downloads/pdfs/`."],
          solucao: r`
mkdir downloads/pdfs
mv downloads/contrato.pdf downloads/manual.pdf downloads/pdfs/
cp downloads/dados_brutos.csv documentos/
`,
        },
      ],
    },
    {
      id: "conteudo",
      titulo: "Ver o conteúdo: cat, head, tail e wc",
      explicacao: [
        "`cat arquivo` mostra o arquivo inteiro; `cat -n` numera as linhas.",
        "`head` mostra o começo (10 linhas, ou `head -n 3`) e `tail` mostra o fim (`tail -n 3`). `tail -n +2` mostra a partir da linha 2, útil para pular o cabeçalho de um CSV.",
        "`wc -l arquivo` conta as linhas (`-w` palavras, `-c` bytes). Num CSV, o número de registros é o total de linhas menos 1, por causa do cabeçalho.",
        "Em arquivos grandes, `less arquivo` abre uma visualização com rolagem no terminal de verdade. Neste simulador, ele funciona como `cat`.",
      ],
      exemplo: r`
cat notas.txt
cat -n notas.txt
head -n 2 notas.txt
tail -n 1 notas.txt
wc -l notas.txt downloads/dados_brutos.csv
tail -n +2 downloads/dados_brutos.csv
`,
      erro: {
        codigo: r`
cat documentos
`,
        explicacao: "`cat` lê arquivos, não pastas: `Is a directory`. Para ver o que tem numa pasta, use `ls documentos`.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "O arquivo `notas.txt` tem 4 linhas. Qual é a saída?",
          codigo: r`
wc -l notas.txt
`,
          opcoes: ["4 notas.txt", "4", "notas.txt 4", "5 notas.txt"],
          resposta: 0,
          dicas: ["`wc -l` conta as linhas.", "Com um arquivo, ele mostra a contagem e o nome.", "Primeiro o número, depois o nome."],
          comentario: "Para só o número, sem o nome: `wc -l < notas.txt`.",
        },
        {
          tipo: "multipla", nivel: 1,
          enunciado: "Qual comando mostra só as **2 últimas** linhas de `app.log`?",
          opcoes: ["`head -n 2 app.log`", "`tail -n 2 app.log`", "`cat -2 app.log`", "`wc -l 2 app.log`"],
          resposta: 1,
          dicas: ["*Head* é cabeça, *tail* é cauda.", "As últimas linhas ficam no fim.", "`-n` diz quantas linhas."],
          comentario: "`tail -f app.log` acompanha o arquivo em tempo real, mostrando as linhas novas de um log enquanto elas são escritas.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para mostrar só as **2 primeiras** linhas de `notas.txt`.",
          codigo: r`
head -n ___ notas.txt
`,
          respostas: [["2"]],
          testes: [["assert _out == 'Reunião segunda às 10h\\nEnviar relatório até sexta\\n', _out", "Devem aparecer só as duas primeiras linhas"]],
          dicas: ["`-n` recebe a quantidade de linhas.", "Você quer duas.", "`2`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Mostre a **última linha** de `notas.txt` e, em seguida, **quantas linhas** tem `downloads/dados_brutos.csv`.",
          inicial: r`
`,
          testes: [
            ["assert 'Ligar para o fornecedor' in _out and 'Reunião' not in _out", "Deve aparecer só a última linha de notas.txt"],
            ["import re\nassert re.search(r'(^|\\s)4(\\s|$)', _out), _out", "Deve aparecer a contagem de linhas de dados_brutos.csv (4)"],
          ],
          dicas: ["São dois comandos.", "A última linha: `tail -n 1`.", "A contagem: `wc -l downloads/dados_brutos.csv`."],
          solucao: r`
tail -n 1 notas.txt
wc -l downloads/dados_brutos.csv
`,
          comentario: "O CSV tem 4 linhas: o cabeçalho e 3 registros.",
        },
      ],
    },
    {
      id: "curingas",
      titulo: "Curingas e find",
      explicacao: [
        "**Curingas** escolhem vários arquivos pelo padrão do nome: `*` vale qualquer sequência (`*.csv` são todos os CSV) e `?` vale exatamente um caractere (`relatorio_???.csv`).",
        "Quem expande o curinga é o próprio terminal, antes de rodar o comando: `ls *.csv` vira `ls a.csv b.csv`. Por isso eles funcionam com qualquer comando: `cp`, `mv`, `rm`, `wc`...",
        "`find` procura em todas as subpastas: `find ~ -name \"*.pdf\"` (por nome), `find . -type d` (só pastas), `find . -type f -name \"*.csv\"` (só arquivos CSV).",
        "Ponha o padrão do `find` entre aspas, para o terminal não expandir o curinga antes da hora.",
      ],
      exemplo: r`
ls documentos/*.csv
ls downloads/*.pdf
find ~ -name "*.csv"
find . -type d
wc -l documentos/relatorio_???.csv
`,
      erro: {
        codigo: r`
ls *.docx
`,
        explicacao: "Se nenhum arquivo combina com o padrão, o terminal passa o texto `*.docx` literalmente, e o `ls` reclama: `cannot access '*.docx'`. Confira a extensão e a pasta em que você está.",
      },
      exercicios: [
        {
          tipo: "prever", nivel: 1,
          enunciado: "A pasta `documentos` tem `relatorio_jan.csv`, `relatorio_fev.csv` e `apresentacao.pptx`. Qual é a saída?",
          codigo: r`
ls documentos/*.csv
`,
          opcoes: ["documentos/relatorio_fev.csv  documentos/relatorio_jan.csv", "relatorio_jan.csv  relatorio_fev.csv", "documentos/apresentacao.pptx", "documentos/relatorio_jan.csv"],
          resposta: 0,
          dicas: ["O curinga é expandido com o caminho que você escreveu.", "Só os .csv entram.", "Em ordem alfabética: fev antes de jan."],
          comentario: "O padrão vira a lista de caminhos completos, em ordem alfabética.",
        },
        {
          tipo: "multipla", nivel: 2,
          enunciado: "Qual padrão combina com `relatorio_jan.csv` e `relatorio_fev.csv`, mas **não** com `relatorio_2024_06.csv`?",
          opcoes: ["`relatorio_*.csv`", "`relatorio_???.csv`", "`*.csv`", "`relatorio_?.csv`"],
          resposta: 1,
          dicas: ["`*` aceita qualquer tamanho.", "`?` vale exatamente um caractere.", "jan e fev têm três letras."],
          comentario: "`???` exige exatamente três caracteres naquela posição.",
        },
        {
          tipo: "completar", nivel: 1,
          enunciado: "Complete para encontrar **todos os PDFs** dentro da sua pasta pessoal, em qualquer subpasta.",
          codigo: r`
find ~ -name "___"
`,
          respostas: [["*.pdf"]],
          testes: [["assert '/home/analista/downloads/contrato.pdf' in _out and '/home/analista/downloads/manual.pdf' in _out", "Devem aparecer os dois PDFs de downloads"]],
          dicas: ["É um padrão com curinga.", "Qualquer nome que termine em .pdf.", "`*.pdf`."],
        },
        {
          tipo: "escrever", nivel: 2,
          enunciado: "Crie a pasta `~/csv` e copie para ela **todos** os arquivos `.csv` de `documentos` e de `downloads`, usando curingas.",
          inicial: r`
`,
          testes: [
            ["assert listar('~/csv') == ['dados_brutos.csv', 'relatorio_fev.csv', 'relatorio_jan.csv'], listar('~/csv')", "~/csv deve ter os 3 arquivos CSV"],
            ["assert '*' in _src", "Use curingas (*)"],
          ],
          dicas: ["`mkdir csv`.", "O `cp` aceita vários arquivos antes do destino.", "`cp documentos/*.csv downloads/*.csv csv/`."],
          solucao: r`
mkdir csv
cp documentos/*.csv downloads/*.csv csv/   # o terminal expande os curingas
ls csv
`,
        },
      ],
    },
  ],
  desafios: [
    {
      id: "organizar-downloads",
      titulo: "Organizar a pasta de downloads",
      enunciado: [
        "A pasta `downloads` virou uma bagunça. Dentro dela, crie as pastas `pdfs`, `planilhas` e `csv`. Mova cada arquivo para a pasta do seu tipo (.pdf, .xlsx e .csv) e apague o arquivo oculto `.cache`.",
        "No fim, `downloads` deve ter só as três pastas.",
      ],
      inicial: r`
cd downloads
`,
      testes: [
        ["assert listar('~/downloads') == ['csv', 'pdfs', 'planilhas'], listar('~/downloads')", "downloads deve ter só as pastas csv, pdfs e planilhas"],
        ["assert listar('~/downloads/pdfs') == ['contrato.pdf', 'manual.pdf'] and listar('~/downloads/planilhas') == ['planilha_final_v3.xlsx'] and listar('~/downloads/csv') == ['dados_brutos.csv']", "Cada arquivo deve estar na pasta do seu tipo"],
      ],
      dicas: ["`mkdir pdfs planilhas csv` cria as três de uma vez.", "Use curingas para mover: `mv *.pdf pdfs/`.", "O oculto não entra no curinga `*`: apague com `rm .cache`. Confira com `ls -a`."],
      solucao: r`
cd downloads
mkdir pdfs planilhas csv
mv *.pdf pdfs/
mv *.xlsx planilhas/
mv *.csv csv/
rm .cache            # ocultos não entram no *
ls -a
`,
    },
    {
      id: "pasta-do-mes",
      titulo: "Pasta de arquivo do mês",
      enunciado: [
        "Todo mês você guarda os relatórios numa pasta de arquivo. Crie `~/arquivo/2024-06`, copie para ela os relatórios CSV de `documentos` e gere, dentro dela, o arquivo `indice.txt` com a lista dos relatórios copiados (use `ls` com redirecionamento: `ls ... > indice.txt`).",
      ],
      inicial: r`
`,
      testes: [
        ["assert existe('~/arquivo/2024-06/relatorio_jan.csv') and existe('~/arquivo/2024-06/relatorio_fev.csv')", "Os dois relatórios devem estar em ~/arquivo/2024-06"],
        ["t = ler('~/arquivo/2024-06/indice.txt')\nassert 'relatorio_jan.csv' in t and 'relatorio_fev.csv' in t, t", "indice.txt deve listar os relatórios"],
      ],
      dicas: ["`mkdir -p arquivo/2024-06`.", "`cp documentos/*.csv arquivo/2024-06/`.", "`ls arquivo/2024-06/*.csv > arquivo/2024-06/indice.txt`, ou entre na pasta e rode `ls *.csv > indice.txt`."],
      solucao: r`
mkdir -p arquivo/2024-06
cp documentos/*.csv arquivo/2024-06/
cd arquivo/2024-06
ls *.csv > indice.txt     # > grava a saída num arquivo (próximo módulo)
cat indice.txt
`,
      comentario: "Com `$(date +%Y-%m)` no lugar de `2024-06`, o mesmo comando serve para qualquer mês. Isso aparece no módulo de scripts.",
    },
  ],
}));
