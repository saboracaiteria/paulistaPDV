@echo off
title Paulista PDV - Instalacao Rapida
color 0B
setlocal

echo.
echo  ========================================================
echo   PAULISTA PDV - INSTALACAO AUTOMATICA
echo  ========================================================
echo.
echo  Este script vai preparar o sistema para uso.
echo  Aguarde...
echo.

:: Verificar se Node.js esta instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [ERRO] Node.js nao encontrado!
    echo.
    echo  Baixe e instale o Node.js de: https://nodejs.org
    echo  Depois execute este script novamente.
    echo.
    pause
    exit /b
)

echo  [OK] Node.js encontrado
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo      Versao: %NODE_VER%
echo.

:: Entrar na pasta do projeto
cd /d "%~dp0"

:: Instalar dependencias
echo  [2/3] Instalando dependencias (pode demorar)...
call npm install --silent >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [AVISO] Tentando instalar novamente...
    call npm install
)
echo  [OK] Dependencias instaladas
echo.

:: Criar atalhos
echo  [3/3] Criando atalhos no Desktop...
call "%~dp0CRIAR_ATALHOS_DESKTOP.bat" >nul 2>&1
echo  [OK] Atalhos criados
echo.

echo  ========================================================
echo                 INSTALACAO CONCLUIDA!
echo  ========================================================
echo.
echo  Para iniciar o sistema:
echo    1. Clique em "Paulista PDV - Servidor" no Desktop
echo    2. Aguarde o sistema abrir no navegador
echo.
echo  Para acessar de outros PCs na rede:
echo    1. Execute "Paulista PDV - Cliente" no outro PC
echo    2. Informe o IP deste computador
echo.
pause
