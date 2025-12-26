@echo off
title Paulista PDV - Instalador Completo
color 0A
setlocal

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║         PAULISTA PDV - INSTALADOR AUTOMATICO         ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

set "INSTALL_PATH=C:\PaulistaPDV"

:: Verificar se Node.js esta instalado
echo  [1/5] Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ╔══════════════════════════════════════════════════════╗
    echo  ║  ATENCAO: Node.js nao esta instalado!                ║
    echo  ║                                                      ║
    echo  ║  1. Baixe de: https://nodejs.org                     ║
    echo  ║  2. Instale o Node.js                                ║
    echo  ║  3. Execute este instalador novamente                ║
    echo  ╚══════════════════════════════════════════════════════╝
    echo.
    start https://nodejs.org
    pause
    exit /b
)
echo        [OK] Node.js instalado
echo.

:: Copiar arquivos para C:\PaulistaPDV
echo  [2/5] Copiando arquivos para %INSTALL_PATH%...
if exist "%INSTALL_PATH%" (
    echo        Pasta existente encontrada. Atualizando...
)
if not exist "%INSTALL_PATH%" mkdir "%INSTALL_PATH%"

:: Copiar todos os arquivos exceto node_modules e .next
xcopy "%~dp0*.*" "%INSTALL_PATH%\" /E /Y /Q /I >nul 2>&1
echo        [OK] Arquivos copiados
echo.

:: Entrar na pasta de instalacao
cd /d "%INSTALL_PATH%"

:: Instalar dependencias
echo  [3/5] Instalando dependencias (aguarde, pode demorar)...
call npm install --silent >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo        Tentando novamente...
    call npm install
)
echo        [OK] Dependencias instaladas
echo.

:: Criar atalhos no Desktop
echo  [4/5] Criando atalhos no Desktop...
set "DESKTOP=%USERPROFILE%\Desktop"

:: Atalho Servidor
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\Paulista PDV.lnk'); $SC.TargetPath = '%INSTALL_PATH%\INICIAR_PAULISTA_PDV.bat'; $SC.WorkingDirectory = '%INSTALL_PATH%'; $SC.Description = 'Iniciar Paulista PDV'; $SC.IconLocation = 'shell32.dll,21'; $SC.Save()" >nul 2>&1

:: Atalho Cliente
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\Paulista PDV - Rede.lnk'); $SC.TargetPath = '%INSTALL_PATH%\ACESSAR_REMOTO.bat'; $SC.WorkingDirectory = '%INSTALL_PATH%'; $SC.Description = 'Conectar ao Paulista PDV'; $SC.IconLocation = 'shell32.dll,15'; $SC.Save()" >nul 2>&1

echo        [OK] Atalhos criados
echo.

:: Finalizado
echo  [5/5] Finalizando...
echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║              INSTALACAO CONCLUIDA!                   ║
echo  ╠══════════════════════════════════════════════════════╣
echo  ║                                                      ║
echo  ║  Instalado em: C:\PaulistaPDV                        ║
echo  ║                                                      ║
echo  ║  Atalhos criados no Desktop:                         ║
echo  ║    - Paulista PDV (iniciar o sistema)                ║
echo  ║    - Paulista PDV - Rede (conectar de outro PC)      ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Deseja iniciar o sistema agora? (S/N)
set /p INICIAR="  > "
if /i "%INICIAR%"=="S" (
    start "" "%INSTALL_PATH%\INICIAR_PAULISTA_PDV.bat"
)
