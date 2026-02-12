@echo off
title Paulista PDV - Acesso Remoto
color 0B
setlocal EnableDelayedExpansion

cls
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║         PAULISTA PDV - CONECTAR PELA REDE                  ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Este script permite conectar ao Paulista PDV que esta
echo  rodando em outro computador da mesma rede.
echo.
echo  ════════════════════════════════════════════════════════════
echo.

:: Configuracoes
set "DEFAULT_PORT=3000"
set "BROWSER_FOUND=0"
set "SERVER_IP="

:: ========================================
:: SOLICITAR IP DO SERVIDOR
:: ========================================
echo  COMO OBTER O IP DO SERVIDOR:
echo  ════════════════════════════════════════════════════════════
echo.
echo  1. No computador que esta rodando o servidor,
echo     verifique a janela do "Paulista PDV - Servidor"
echo.
echo  2. Procure pela linha que mostra o IP local
echo     Exemplo: 192.168.0.100
echo.
echo  3. Digite esse IP abaixo (ou o nome do computador)
echo.
echo  ════════════════════════════════════════════════════════════
echo.

:ASK_IP
echo  Digite o IP ou nome do servidor:
echo  (Pressione Enter para usar 'localhost' se estiver neste PC)
echo.
set /p SERVER_IP=" > "

:: Se vazio, usar localhost
if "!SERVER_IP!"=="" (
    set "SERVER_IP=localhost"
    echo.
    echo  [INFO] Usando localhost - Conectando ao servidor local
)

echo.
echo  Porta do servidor (pressione Enter para usar %DEFAULT_PORT%):
set /p SERVER_PORT=" > "

if "!SERVER_PORT!"=="" (
    set "SERVER_PORT=%DEFAULT_PORT%"
)

:: Construir URL
set "SERVER_URL=http://!SERVER_IP!:!SERVER_PORT!/dashboard/sales"

echo.
echo  ════════════════════════════════════════════════════════════
echo  Conectando a: !SERVER_URL!
echo  ════════════════════════════════════════════════════════════
echo.

:: ========================================
:: TESTAR CONEXAO
:: ========================================
echo  [1/3] Testando conexao com o servidor...

:: Usar PowerShell para testar a conexao HTTP
powershell -Command "$ProgressPreference = 'SilentlyContinue'; try { $response = Invoke-WebRequest -Uri 'http://!SERVER_IP!:!SERVER_PORT!/' -TimeoutSec 5 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo        [ERRO] Nao foi possivel conectar ao servidor
    echo.
    echo  ════════════════════════════════════════════════════════════
    echo  POSSIVEIS PROBLEMAS:
    echo  ════════════════════════════════════════════════════════════
    echo.
    echo  ❌ O servidor nao esta rodando
    echo     Solucao: Inicie o servidor no outro PC
    echo.
    echo  ❌ O IP esta incorreto
    echo     Solucao: Verifique o IP no servidor
    echo.
    echo  ❌ Os computadores nao estao na mesma rede
    echo     Solucao: Conecte ambos a mesma rede WiFi/Ethernet
    echo.
    echo  ❌ Firewall bloqueando a conexao
    echo     Solucao: Libere a porta !SERVER_PORT! no firewall
    echo.
    echo  ════════════════════════════════════════════════════════════
    echo.
    echo  Deseja tentar outro IP? (S/N)
    set /p RETRY=" > "
    if /i "!RETRY!"=="S" (
        echo.
        goto ASK_IP
    )
    echo.
    echo  Fechando...
    timeout /t 3 >nul
    exit /b 1
)

echo        [OK] Servidor encontrado e respondendo
echo.

:: ========================================
:: DETECTAR NAVEGADOR
:: ========================================
echo  [2/3] Detectando navegador...

:: Tentar Chrome
where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "BROWSER_CMD=chrome --app=!SERVER_URL!"
    set "BROWSER_NAME=Chrome"
    set "BROWSER_FOUND=1"
    echo        [OK] Chrome detectado
    goto OPEN_BROWSER
)

:: Tentar Edge
where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "BROWSER_CMD=msedge --app=!SERVER_URL!"
    set "BROWSER_NAME=Edge"
    set "BROWSER_FOUND=1"
    echo        [OK] Edge detectado
    goto OPEN_BROWSER
)

:: Usar navegador padrao
set "BROWSER_CMD=start !SERVER_URL!"
set "BROWSER_NAME=Navegador Padrao"
echo        [OK] Usando navegador padrao

:OPEN_BROWSER
echo.

:: ========================================
:: ABRIR NAVEGADOR
:: ========================================
echo  [3/3] Abrindo navegador...
echo        Navegador: !BROWSER_NAME!
echo        URL: !SERVER_URL!
echo.

start "" !BROWSER_CMD!

if %ERRORLEVEL% EQU 0 (
    echo        [OK] Navegador aberto com sucesso!
    echo.
    echo  ════════════════════════════════════════════════════════════
    echo  ✅ CONEXAO ESTABELECIDA COM SUCESSO!
    echo  ════════════════════════════════════════════════════════════
    echo.
    echo  O Paulista PDV deve abrir no navegador em instantes.
    echo.
    echo  Se o navegador nao abrir, acesse manualmente:
    echo  !SERVER_URL!
    echo.
    echo  ════════════════════════════════════════════════════════════
) else (
    echo        [ERRO] Falha ao abrir navegador
    echo.
    echo  Tente abrir manualmente no navegador:
    echo  !SERVER_URL!
    echo.
)

echo.
echo  Pressione qualquer tecla para fechar...
pause >nul
