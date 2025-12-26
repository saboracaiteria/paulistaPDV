@echo off
title Criador de Atalhos - Paulista PDV
setlocal enabledelayedexpansion

echo ========================================================
echo         PAULISTA PDV - CRIAR ATALHOS NO DESKTOP
echo ========================================================
echo.

:: Pegar o caminho do desktop
set "DESKTOP=%USERPROFILE%\Desktop"
set "CURRENT_DIR=%~dp0"

echo Criando atalhos em: %DESKTOP%
echo.

:: Criar atalho do Servidor usando PowerShell
echo [1/2] Criando atalho "Paulista PDV - Servidor"...
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\Paulista PDV - Servidor.lnk'); $SC.TargetPath = '%CURRENT_DIR%INICIAR_PAULISTA_PDV.bat'; $SC.WorkingDirectory = '%CURRENT_DIR%'; $SC.Description = 'Inicia o servidor do Paulista PDV'; $SC.IconLocation = 'shell32.dll,21'; $SC.Save()"

if exist "%DESKTOP%\Paulista PDV - Servidor.lnk" (
    echo    [OK] Atalho do Servidor criado!
) else (
    echo    [ERRO] Falha ao criar atalho do Servidor
)

:: Criar atalho do Cliente usando PowerShell
echo [2/2] Criando atalho "Paulista PDV - Cliente"...
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%DESKTOP%\Paulista PDV - Cliente.lnk'); $SC.TargetPath = '%CURRENT_DIR%ACESSAR_REMOTO.bat'; $SC.WorkingDirectory = '%CURRENT_DIR%'; $SC.Description = 'Conecta ao Paulista PDV na rede'; $SC.IconLocation = 'shell32.dll,15'; $SC.Save()"

if exist "%DESKTOP%\Paulista PDV - Cliente.lnk" (
    echo    [OK] Atalho do Cliente criado!
) else (
    echo    [ERRO] Falha ao criar atalho do Cliente
)

echo.
echo ========================================================
echo                     CONCLUIDO!
echo ========================================================
echo.
echo Atalhos criados na sua area de trabalho:
echo  - Paulista PDV - Servidor (usar no PC principal)
echo  - Paulista PDV - Cliente  (usar nos outros PCs)
echo.
pause
