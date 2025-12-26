@echo off
title Paulista PDV - Exportar para Outro PC
color 0E
setlocal

echo.
echo  ========================================================
echo   PAULISTA PDV - PREPARAR COPIA PARA OUTRO PC
echo  ========================================================
echo.

set "EXPORT_FOLDER=%USERPROFILE%\Desktop\PaulistaPDV_Instalador"

echo  Copiando arquivos para: %EXPORT_FOLDER%
echo.

:: Criar pasta de exportacao
if exist "%EXPORT_FOLDER%" rmdir /s /q "%EXPORT_FOLDER%"
mkdir "%EXPORT_FOLDER%"

:: Copiar arquivos essenciais (excluindo node_modules e .next)
echo  Copiando arquivos do projeto...
xcopy "%~dp0*.*" "%EXPORT_FOLDER%\" /E /Y /Q /EXCLUDE:%~dp0exclude.txt 2>nul

:: Criar arquivo de exclusao temporario
echo node_modules> "%~dp0exclude.txt"
echo .next>> "%~dp0exclude.txt"
echo .git>> "%~dp0exclude.txt"

:: Copiar novamente com exclusoes
xcopy "%~dp0*.*" "%EXPORT_FOLDER%\" /E /Y /Q /EXCLUDE:"%~dp0exclude.txt" >nul 2>&1

:: Remover arquivo temporario
del "%~dp0exclude.txt" 2>nul

echo.
echo  ========================================================
echo                    EXPORTACAO CONCLUIDA!
echo  ========================================================
echo.
echo  Pasta criada no Desktop: PaulistaPDV_Instalador
echo.
echo  Para instalar em outro PC:
echo    1. Copie a pasta para o outro PC (pendrive, rede, etc)
echo    2. No outro PC, execute INSTALAR.bat
echo.
pause
