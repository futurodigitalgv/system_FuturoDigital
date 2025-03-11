@echo off
echo Iniciando o servidor...
start /min python servidor.py
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000" 