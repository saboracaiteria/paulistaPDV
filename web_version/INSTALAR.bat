@echo off
title Paulista PDV - Instalador Completo
color 0A
setlocal EnableDelayedExpansion

cls
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║         PAULISTA PDV - INSTALADOR AUTOMATICO               ║
echo  ║            Com Node.js Portatil Incluido                   ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Este instalador ira:
echo   - Copiar todos os arquivos para C:\PaulistaPDV
echo   - Configurar o Node.js portatil
echo   - Criar atalhos no Desktop
echo   - Configurar o sistema para uso imediato
echo.
echo  ════════════════════════════════════════════════════════════
echo.

:: Verificar privilegios de administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo  [INFO] Executando com privilegios de administrador
) else (
    echo  [AVISO] Nao esta executando como administrador
    echo          Pode haver problemas ao criar atalhos
)
echo.

:: Configuracoes
set "INSTALL_PATH=C:\PaulistaPDV"
set "SOURCE_PATH=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "LOG_FILE=%TEMP%\PaulistaPDV_Install.log"

:: Iniciar log
echo ========================================= > "%LOG_FILE%"
echo Instalacao Paulista PDV - %date% %time% >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

:: ========================================
:: ETAPA 1: Verificar Node.js Portatil
:: ========================================
echo  [1/6] Verificando Node.js portatil...
if not exist "%SOURCE_PATH%nodejs\node.exe" (
    echo.
    echo  ╔════════════════════════════════════════════════════════════╗
    echo  ║  ERRO CRITICO: Node.js portatil nao encontrado!            ║
    echo  ║                                                            ║
    echo  ║  Pasta esperada: %SOURCE_PATH%nodejs\         ║
    echo  ║                                                            ║
    echo  ║  O pacote de instalacao esta incompleto.                   ║
    echo  ║  Por favor, baixe novamente o arquivo ZIP completo.        ║
    echo  ║                                                            ║
    echo  ╚════════════════════════════════════════════════════════════╝
    echo.
    echo [ERRO] Node.js portatil nao encontrado >> "%LOG_FILE%"
    pause
    exit /b 1
)

:: Verificar versao do Node.js
"%SOURCE_PATH%nodejs\node.exe" --version > "%TEMP%\node_version.txt" 2>&1
set /p NODE_VERSION=<"%TEMP%\node_version.txt"
del "%TEMP%\node_version.txt" 2>nul
echo        [OK] Node.js %NODE_VERSION% detectado
echo [OK] Node.js %NODE_VERSION% detectado >> "%LOG_FILE%"
echo.

:: ========================================
:: ETAPA 2: Verificar Dependencias
:: ========================================
echo  [2/6] Verificando dependencias do projeto...
if not exist "%SOURCE_PATH%node_modules" (
    echo        [AVISO] node_modules nao encontrado
    echo        Dependencias precisarao ser instaladas apos a copia
    echo [AVISO] node_modules nao encontrado >> "%LOG_FILE%"
    set "NEED_NPM_INSTALL=1"
) else (
    echo        [OK] Dependencias incluidas no pacote
    echo [OK] Dependencias incluidas >> "%LOG_FILE%"
)
echo.

:: ========================================
:: ETAPA 3: Copiar Arquivos
:: ========================================
echo  [3/6] Instalando arquivos em %INSTALL_PATH%...

:: Verificar se ja existe instalacao
if exist "%INSTALL_PATH%" (
    echo.
    echo        Instalacao existente detectada!
    echo        Deseja atualizar a instalacao existente? (S/N)
    echo        AVISO: Arquivos serao sobrescritos!
    echo.
    set /p UPDATE=" > "
    if /i not "!UPDATE!"=="S" (
        echo.
        echo        Instalacao cancelada pelo usuario.
        echo [INFO] Instalacao cancelada pelo usuario >> "%LOG_FILE%"
        pause
        exit /b 0
    )
    echo.
    echo        [INFO] Atualizando instalacao existente...
    echo [INFO] Atualizando instalacao existente >> "%LOG_FILE%"
) else (
    if not exist "%INSTALL_PATH%" mkdir "%INSTALL_PATH%"
    echo [INFO] Nova instalacao em %INSTALL_PATH% >> "%LOG_FILE%"
)

:: Copiar todos os arquivos
echo        Copiando arquivos... (isso pode demorar)
xcopy "%SOURCE_PATH%*" "%INSTALL_PATH%\" /E /Y /Q /H /I >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo        [ERRO] Falha ao copiar arquivos
    echo [ERRO] Falha ao copiar arquivos >> "%LOG_FILE%"
    pause
    exit /b 1
)

echo        [OK] Arquivos copiados com sucesso
echo [OK] Arquivos copiados >> "%LOG_FILE%"
echo.

:: ========================================
:: ETAPA 4: Instalar Dependencias (se necessario)
:: ========================================
if defined NEED_NPM_INSTALL (
    echo  [4/6] Instalando dependencias NPM...
    echo        Isso pode levar varios minutos...
    echo.
    
    cd /d "%INSTALL_PATH%"
    "%INSTALL_PATH%\nodejs\npm.cmd" install --loglevel=error
    
    if %ERRORLEVEL% NEQ 0 (
        echo        [AVISO] Problemas ao instalar dependencias
        echo        O sistema pode nao funcionar corretamente
        echo [AVISO] Problemas ao instalar dependencias >> "%LOG_FILE%"
    ) else (
        echo        [OK] Dependencias instaladas
        echo [OK] Dependencias instaladas >> "%LOG_FILE%"
    )
    echo.
) else (
    echo  [4/6] Dependencias ja incluidas, pulando instalacao...
    echo.
)

:: ========================================
:: ETAPA 5: Criar Atalhos
:: ========================================
echo  [5/6] Criando atalhos no Desktop...

:: Atalho: Paulista PDV (Iniciar Sistema)
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\Paulista PDV.lnk'); $SC.TargetPath = '%INSTALL_PATH%\INICIAR_PAULISTA_PDV.bat'; $SC.WorkingDirectory = '%INSTALL_PATH%'; $SC.Description = 'Iniciar Paulista PDV - Sistema Completo'; $SC.IconLocation = 'shell32.dll,21'; $SC.Save()" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo        [OK] Atalho "Paulista PDV" criado
    echo [OK] Atalho Paulista PDV criado >> "%LOG_FILE%"
) else (
    echo        [AVISO] Falha ao criar atalho principal
    echo [AVISO] Falha ao criar atalho principal >> "%LOG_FILE%"
)

:: Atalho: Paulista PDV - Rede (Acesso Remoto)
if exist "%INSTALL_PATH%\ACESSAR_REMOTO.bat" (
    powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\Paulista PDV - Rede.lnk'); $SC.TargetPath = '%INSTALL_PATH%\ACESSAR_REMOTO.bat'; $SC.WorkingDirectory = '%INSTALL_PATH%'; $SC.Description = 'Conectar ao Paulista PDV pela Rede'; $SC.IconLocation = 'shell32.dll,15'; $SC.Save()" >nul 2>&1
    
    if %ERRORLEVEL% EQU 0 (
        echo        [OK] Atalho "Paulista PDV - Rede" criado
        echo [OK] Atalho Rede criado >> "%LOG_FILE%"
    )
)

echo.

:: ========================================
:: ETAPA 6: Verificacao Final
:: ========================================
echo  [6/6] Verificando instalacao...

set "INSTALL_OK=1"

:: Verificar Node.js
if exist "%INSTALL_PATH%\nodejs\node.exe" (
    echo        [OK] Node.js portatil instalado
    echo [OK] Node.js verificado >> "%LOG_FILE%"
) else (
    echo        [ERRO] Node.js portatil NAO encontrado
    echo [ERRO] Node.js nao encontrado >> "%LOG_FILE%"
    set "INSTALL_OK=0"
)

:: Verificar arquivos principais
if exist "%INSTALL_PATH%\package.json" (
    echo        [OK] Arquivos do projeto verificados
    echo [OK] package.json verificado >> "%LOG_FILE%"
) else (
    echo        [ERRO] Arquivos do projeto NAO encontrados
    echo [ERRO] package.json nao encontrado >> "%LOG_FILE%"
    set "INSTALL_OK=0"
)

:: Verificar dependencias
if exist "%INSTALL_PATH%\node_modules" (
    echo        [OK] Dependencias verificadas
    echo [OK] node_modules verificado >> "%LOG_FILE%"
) else (
    echo        [AVISO] Dependencias nao instaladas
    echo [AVISO] node_modules nao encontrado >> "%LOG_FILE%"
)

:: Verificar scripts de inicializacao
if exist "%INSTALL_PATH%\INICIAR_PAULISTA_PDV.bat" (
    echo        [OK] Scripts de inicializacao verificados
    echo [OK] Scripts verificados >> "%LOG_FILE%"
) else (
    echo        [ERRO] Scripts de inicializacao NAO encontrados
    echo [ERRO] Scripts nao encontrados >> "%LOG_FILE%"
    set "INSTALL_OK=0"
)

echo.
echo ========================================= >> "%LOG_FILE%"
echo Instalacao finalizada - %date% %time% >> "%LOG_FILE%"
echo ========================================= >> "%LOG_FILE%"

:: ========================================
:: RESULTADO FINAL
:: ========================================
if "%INSTALL_OK%"=="1" (
    echo  ╔════════════════════════════════════════════════════════════╗
    echo  ║              INSTALACAO CONCLUIDA COM SUCESSO!             ║
    echo  ╠════════════════════════════════════════════════════════════╣
    echo  ║                                                            ║
    echo  ║  Instalado em: C:\PaulistaPDV                              ║
    echo  ║                                                            ║
    echo  ║  ✓ NAO E NECESSARIO INSTALAR NADA MAIS!                    ║
    echo  ║    O Node.js portatil ja esta incluido e configurado       ║
    echo  ║                                                            ║
    echo  ║  Atalhos criados no Desktop:                               ║
    echo  ║    📱 Paulista PDV           - Iniciar o sistema           ║
    echo  ║    🌐 Paulista PDV - Rede    - Conectar pela rede          ║
    echo  ║                                                            ║
    echo  ║  COMO USAR:                                                ║
    echo  ║    1. Clique no atalho "Paulista PDV" no Desktop           ║
    echo  ║    2. Aguarde o sistema iniciar (20-30 segundos)           ║
    echo  ║    3. O navegador abrira automaticamente                   ║
    echo  ║                                                            ║
    echo  ║  ACESSO PELA REDE:                                         ║
    echo  ║    - Use o atalho "Paulista PDV - Rede" em outros PCs      ║
    echo  ║    - Informe o IP do servidor quando solicitado            ║
    echo  ║                                                            ║
    echo  ╚════════════════════════════════════════════════════════════╝
) else (
    echo  ╔════════════════════════════════════════════════════════════╗
    echo  ║           INSTALACAO CONCLUIDA COM AVISOS                  ║
    echo  ╠════════════════════════════════════════════════════════════╣
    echo  ║                                                            ║
    echo  ║  A instalacao foi concluida, mas houve alguns problemas.   ║
    echo  ║  Verifique o log em: %TEMP%\PaulistaPDV_Install.log        ║
    echo  ║                                                            ║
    echo  ║  O sistema pode nao funcionar corretamente.                ║
    echo  ║                                                            ║
    echo  ╚════════════════════════════════════════════════════════════╝
)

echo.
echo  Log da instalacao salvo em: %LOG_FILE%
echo.
echo  ════════════════════════════════════════════════════════════
echo.
echo  Deseja iniciar o Paulista PDV agora? (S/N)
set /p INICIAR=" > "

if /i "%INICIAR%"=="S" (
    echo.
    echo  Iniciando Paulista PDV...
    start "" "%INSTALL_PATH%\INICIAR_PAULISTA_PDV.bat"
    timeout /t 2 >nul
    exit
) else (
    echo.
    echo  Use o atalho "Paulista PDV" no Desktop para iniciar.
    echo.
    pause
)
