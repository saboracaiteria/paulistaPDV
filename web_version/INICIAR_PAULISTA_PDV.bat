@echo off
if not DEFINED IS_MINIMIZED (
    set IS_MINIMIZED=1
    start "" /MIN "%~dpnx0" %*
    exit
)
setlocal
title Paulista PDV - Servidor

echo ========================================================
echo               PAULISTA PDV - INICIANDO
echo ========================================================
echo.
echo 1. Verificando pasta do projeto...
cd /d "%~dp0"

echo.
echo ========================================================
echo               SEU ENDERECO NA REDE
echo ========================================================
echo IP :
ipconfig | findstr /i "ipv4"
echo.
echo NOME DO COMPUTADOR: %COMPUTERNAME%
echo ========================================================
echo.
echo ANOTE O IP (ex: 192.168.0.X) OU O NOME (%COMPUTERNAME%)
echo PARA USAR NO OUTRO COMPUTADOR.
echo.

echo 2. Preparando inicializacao...
:: Agenda a abertura do navegador para 20 segundos (tempo para o servidor subir)
start "" /B cmd /c "timeout /t 20 >nul && start chrome --app=http://localhost:3000/dashboard/sales"

echo 3. Iniciando Servidor (Nao feche esta janela)...
echo.
echo O sistema estara pronto quando aparecer "Ready" abaixo.
echo O navegador abrira automaticamente apos 20 segundos.
echo.

:: Inicia o Next.js ouvindo em todas as interfaces de rede
npm run dev -- -H 0.0.0.0

pause
