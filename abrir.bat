@echo off
REM Abre o Level Code no navegador usando um servidor local do Python.
cd /d "%~dp0"
echo Abrindo o Level Code em http://localhost:8000  (feche esta janela para encerrar)
start "" "http://localhost:8000/index.html"
python -m http.server 8000
