@echo off
:: Minimizar janela automaticamente na primeira execucao
if not DEFINED IS_MINIMIZED (
    set IS_MINIMIZED=1
    start "" /MIN "%~dpnx0" %*
    exit
)

title Paulista PDV - Servidor
color 0E
setlocal EnableDelayedExpansion

cls
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║              PAULISTA PDV - INICIANDO SISTEMA              ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

:: Configuracoes
set "PROJECT_DIR=%~dp0"
set "NODE_PATH=%PROJECT_DIR%nodejs"
set "LOG_FILE=%PROJECT_DIR%paulista_pdv.log"

:: Adicionar Node.js portatil ao PATH
set "PATH=%NODE_PATH%;%PATH%"

:: Iniciar log
echo ========================================= > "%LOG_FILE%"
echo Paulista PDV - Inicio: %date% %time% >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: ========================================
:: VERIFICACOES INICIAIS
:: ========================================
echo  [1/5] Verificando ambiente...

:: Verificar pasta do projeto
cd /d "%PROJECT_DIR%" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo        [ERRO] Nao foi possivel acessar a pasta do projeto
    echo [ERRO] Pasta nao acessivel >> "%LOG_FILE%"
    pause
    exit /b 1
)
echo        [OK] Pasta do projeto: %PROJECT_DIR%
echo [OK] Pasta: %PROJECT_DIR% >> "%LOG_FILE%"

:: Verificar Node.js portatil
if not exist "%NODE_PATH%\node.exe" (
    echo.
    echo  ╔════════════════════════════════════════════════════════════╗
    echo  ║  ERRO CRITICO: Node.js portatil nao encontrado!            ║
    echo  ║                                                            ║
    echo  ║  Pasta esperada: %NODE_PATH%                  ║
    echo  ║                                                            ║
    echo  ║  Por favor, reinstale o sistema usando INSTALAR.bat        ║
    echo  ╚════════════════════════════════════════════════════════════╝
    echo.
    echo [ERRO] Node.js nao encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: Obter versao do Node.js
"%NODE_PATH%\node.exe" --version > "%TEMP%\node_ver.txt" 2>&1
set /p NODE_VER=<"%TEMP%\node_ver.txt"
del "%TEMP%\node_ver.txt" 2>nul
echo        [OK] Node.js %NODE_VER% portatil detectado
echo [OK] Node.js %NODE_VER% >> "%LOG_FILE%"

:: Verificar package.json
if not exist "%PROJECT_DIR%package.json" (
    echo        [ERRO] package.json nao encontrado
    echo [ERRO] package.json nao encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)
echo        [OK] Configuracao do projeto encontrada
echo.

:: ========================================
:: VERIFICAR DEPENDENCIAS
:: ========================================
echo  [2/5] Verificando dependencias...
if not exist "%PROJECT_DIR%node_modules" (
    echo        [AVISO] Dependencias nao instaladas
    echo        Instalando dependencias... (pode demorar)
    echo.
    echo [INFO] Instalando dependencias >> "%LOG_FILE%"
    
    "%NODE_PATH%\npm.cmd" install --loglevel=error >> "%LOG_FILE%" 2>&1
    
    if !ERRORLEVEL! NEQ 0 (
        echo        [ERRO] Falha ao instalar dependencias
        echo [ERRO] Falha ao instalar dependencias >> "%LOG_FILE%"
        pause
        exit /b 1
    )
    echo        [OK] Dependencias instaladas
) else (
    echo        [OK] Dependencias verificadas
)
echo [OK] Dependencias OK >> "%LOG_FILE%"
echo.

:: ========================================
:: OBTER INFORMACOES DE REDE
:: ========================================
echo  [3/5] Detectando configuracao de rede...
echo.
echo  ════════════════════════════════════════════════════════════
echo         INFORMACOES PARA ACESSO PELA REDE
echo  ════════════════════════════════════════════════════════════
echo.

:: Obter IP local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP=%%a"
    set "IP=!IP: =!"
    if not "!IP!"=="" (
        echo   📍 IP Local: !IP!
        echo [INFO] IP: !IP! >> "%LOG_FILE%"
    )
)

echo   💻 Nome do PC: %COMPUTERNAME%
echo.
echo   🌐 URL Local : http://localhost:3000
echo   🌐 URL Rede  : http://!IP!:3000
echo.
echo  ════════════════════════════════════════════════════════════
echo.
echo   📌 ANOTE O IP ACIMA para usar em outros computadores
echo      da mesma rede!
echo.
echo  ════════════════════════════════════════════════════════════
echo.
echo [INFO] Nome PC: %COMPUTERNAME% >> "%LOG_FILE%"

:: ========================================
:: PREPARAR ABERTURA DO NAVEGADOR
:: ========================================
echo  [4/5] Agendando abertura do navegador...

:: Tentar Chrome primeiro, depois Edge, depois navegador padrao
set "BROWSER_FOUND=0"
set "BROWSER_CMD="

:: Verificar Chrome
where chrome >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "BROWSER_CMD=chrome --app=http://localhost:3000/dashboard/sales"
    set "BROWSER_FOUND=1"
    echo        [OK] Chrome detectado
) else (
    :: Verificar Edge
    where msedge >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "BROWSER_CMD=msedge --app=http://localhost:3000/dashboard/sales"
        set "BROWSER_FOUND=1"
        echo        [OK] Edge detectado
    ) else (
        :: Usar navegador padrao
        set "BROWSER_CMD=start http://localhost:3000/dashboard/sales"
        echo        [OK] Navegador padrao sera usado
    )
)

:: Agendar abertura do navegador (20 segundos)
start "" /B cmd /c "timeout /t 20 >nul && !BROWSER_CMD!" 2>nul
echo        [OK] Navegador abrira em 20 segundos
echo [INFO] Navegador agendado >> "%LOG_FILE%"
echo.

:: ========================================
:: INICIAR SERVIDOR
:: ========================================
echo  [5/5] Iniciando servidor Next.js...
echo.
echo  ════════════════════════════════════════════════════════════
echo   ⚠ IMPORTANTE: NAO FECHE ESTA JANELA!
echo  
echo   O sistema esta iniciando...
echo   Aguarde a mensagem "Ready" aparecer abaixo.
echo   O navegador abrira automaticamente.
echo.
echo   Para PARAR o servidor: Pressione Ctrl+C ou feche esta janela
echo  ════════════════════════════════════════════════════════════
echo.
echo [INFO] Iniciando servidor >> "%LOG_FILE%"

:: Iniciar Next.js em modo desenvolvimento, escutando em todas as interfaces
"%NODE_PATH%\npx.cmd" next dev -H 0.0.0.0 -p 3000 2>&1 | "%NODE_PATH%\node.exe" -e "const readline = require('readline'); const rl = readline.createInterface({input: process.stdin}); rl.on('line', (line) => {console.log(line); if(line.includes('Ready')) console.log('\n  ✅ SERVIDOR PRONTO! O navegador deve abrir em breve...\n');});"

:: Se chegou aqui, o servidor foi encerrado
echo.
echo  ════════════════════════════════════════════════════════════
echo   Servidor encerrado.
echo  ════════════════════════════════════════════════════════════
echo.
echo [INFO] Servidor encerrado: %date% %time% >> "%LOG_FILE%"

pause
