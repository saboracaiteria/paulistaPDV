@echo off
title Criando Pacote de Distribuicao - Paulista PDV
color 0A
setlocal EnableDelayedExpansion

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║       PAULISTA PDV - CRIAR PACOTE DE DISTRIBUICAO          ║
echo  ║              Com Node.js Portatil Incluido                 ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

:: Configuracoes
set "SOURCE_DIR=%~dp0"
set "OUTPUT_DIR=%USERPROFILE%\Desktop"
set "TIMESTAMP=%date:~-4%-%date:~3,2%-%date:~0,2%_%time:~0,2%%time:~3,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "ZIP_NAME=PaulistaPDV_Instalador_v1.0_%TIMESTAMP%.zip"
set "TEMP_BUILD=%TEMP%\PaulistaPDV_Build"

:: Verificar Node.js portatil
echo  [VERIFICACAO] Checando Node.js portatil...
if not exist "%SOURCE_DIR%nodejs\node.exe" (
    echo.
    echo  ╔════════════════════════════════════════════════════════════╗
    echo  ║  ERRO: Node.js portatil nao encontrado!                    ║
    echo  ║                                                            ║
    echo  ║  Pasta esperada: %SOURCE_DIR%nodejs\         ║
    echo  ║                                                            ║
    echo  ║  O pacote NAO incluira o Node.js portatil.                 ║
    echo  ║  Deseja continuar mesmo assim? (S/N)                       ║
    echo  ╚════════════════════════════════════════════════════════════╝
    echo.
    set /p CONTINUAR=" > "
    if /i not "!CONTINUAR!"=="S" exit /b
    set "NODE_WARNING=1"
) else (
    echo        [OK] Node.js portatil encontrado
)
echo.

:: Verificar node_modules
echo  [VERIFICACAO] Checando dependencias...
if not exist "%SOURCE_DIR%node_modules" (
    echo        [AVISO] node_modules nao encontrado
    echo        Dependencias precisarao ser instaladas no destino
    set "DEPS_WARNING=1"
) else (
    echo        [OK] Dependencias encontradas
)
echo.

:: Criar pasta temporaria para build
echo  [1/6] Preparando ambiente de build...
if exist "%TEMP_BUILD%" rd /s /q "%TEMP_BUILD%" 2>nul
mkdir "%TEMP_BUILD%"
echo        [OK] Ambiente preparado
echo.

:: Limpar arquivos desnecessarios no source
echo  [2/6] Limpando arquivos temporarios do projeto...
if exist "%SOURCE_DIR%.next\cache" (
    rd /s /q "%SOURCE_DIR%.next\cache" 2>nul
    echo        [OK] Cache do Next.js limpo
)
if exist "%SOURCE_DIR%parsing_log.txt" del /q "%SOURCE_DIR%parsing_log.txt" 2>nul
if exist "%SOURCE_DIR%test-tsx.ts" del /q "%SOURCE_DIR%test-tsx.ts" 2>nul
if exist "%SOURCE_DIR%node-portable.zip" del /q "%SOURCE_DIR%node-portable.zip" 2>nul

:: Limpar logs antigos
for %%F in ("%SOURCE_DIR%*.log") do del /q "%%F" 2>nul
echo        [OK] Arquivos temporarios removidos
echo.

:: Copiar arquivos para temp build (excluindo arquivos desnecessarios)
echo  [3/6] Copiando arquivos essenciais...
echo        Isso pode levar alguns minutos...

xcopy "%SOURCE_DIR%*" "%TEMP_BUILD%\" /E /Y /Q /EXCLUDE:"%~f0.exclude" 2>nul

:: Criar arquivo de exclusao temporario
(
echo .git
echo .gitignore
echo .vscode
echo *.log
echo *.tmp
) > "%TEMP%\exclude_list.txt"

echo        [OK] Arquivos copiados para build temporario
echo.

:: Verificar tamanho estimado
echo  [4/6] Calculando tamanho do pacote...
set "TOTAL_SIZE=0"
for /r "%TEMP_BUILD%" %%F in (*) do (
    set /a "TOTAL_SIZE+=%%~zF"
)
set /a "SIZE_MB=!TOTAL_SIZE! / 1048576"
echo        Tamanho estimado: !SIZE_MB! MB
echo.

:: Criar arquivo ZIP
echo  [5/6] Criando arquivo ZIP...
echo        Comprimindo... Aguarde...
echo.

powershell -Command ^
  "try { ^
    $ProgressPreference = 'SilentlyContinue'; ^
    $source = '%TEMP_BUILD%'; ^
    $dest = '%OUTPUT_DIR%\%ZIP_NAME%'; ^
    if (Test-Path $dest) { Remove-Item $dest -Force }; ^
    Write-Host '        Compactando arquivos...' -ForegroundColor Cyan; ^
    Compress-Archive -Path $source\* -DestinationPath $dest -CompressionLevel Optimal -Force; ^
    $size = (Get-Item $dest).Length / 1MB; ^
    Write-Host ('        [OK] ZIP criado! Tamanho: {0:N2} MB' -f $size) -ForegroundColor Green; ^
  } catch { ^
    Write-Host ('        [ERRO] Falha: ' + $_.Exception.Message) -ForegroundColor Red; ^
    exit 1; ^
  }"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ╔════════════════════════════════════════════════════════════╗
    echo  ║  ERRO: Falha ao criar o arquivo ZIP                        ║
    echo  ╚════════════════════════════════════════════════════════════╝
    rd /s /q "%TEMP_BUILD%" 2>nul
    pause
    exit /b
)
echo.

:: Limpar pasta temporaria
echo  [6/6] Finalizando...
rd /s /q "%TEMP_BUILD%" 2>nul
echo        [OK] Limpeza concluida
echo.

:: Mostrar informacoes do arquivo gerado
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║              PACOTE CRIADO COM SUCESSO!                    ║
echo  ╠════════════════════════════════════════════════════════════╣
echo  ║                                                            ║
for %%A in ("%OUTPUT_DIR%\%ZIP_NAME%") do (
    set "FILE_SIZE=%%~zA"
    set /a "SIZE_MB=!FILE_SIZE! / 1048576"
    echo  ║  Arquivo: %ZIP_NAME:~0,48%
    echo  ║  Local  : %OUTPUT_DIR:~0,48%
    echo  ║  Tamanho: !SIZE_MB! MB
)
echo  ║                                                            ║
echo  ╠════════════════════════════════════════════════════════════╣
echo  ║  INSTRUCOES PARA INSTALACAO EM OUTRO PC:                   ║
echo  ║                                                            ║
echo  ║  1. Copie o arquivo ZIP para o outro computador            ║
echo  ║  2. Extraia TODO o conteudo para uma pasta                 ║
echo  ║  3. Execute o arquivo INSTALAR.bat                         ║
echo  ║  4. Aguarde a instalacao automatica                        ║
echo  ║  5. Use os atalhos criados no Desktop                      ║
echo  ║                                                            ║

if defined NODE_WARNING (
    echo  ║  ⚠ AVISO: Node.js portatil NAO incluido!                   ║
    echo  ║     Sera necessario instalar Node.js no PC destino         ║
    echo  ║                                                            ║
)

if defined DEPS_WARNING (
    echo  ║  ⚠ AVISO: Dependencias NPM NAO incluidas!                  ║
    echo  ║     Sera necessario executar 'npm install' no destino      ║
    echo  ║                                                            ║
)

if not defined NODE_WARNING if not defined DEPS_WARNING (
    echo  ║  ✓ NAO E NECESSARIO INSTALAR NADA!                         ║
    echo  ║    Node.js e dependencias ja incluidos                     ║
    echo  ║                                                            ║
)

echo  ╚════════════════════════════════════════════════════════════╝
echo.

:: Abrir pasta com o arquivo
echo  Abrindo pasta com o arquivo...
explorer /select,"%OUTPUT_DIR%\%ZIP_NAME%"

echo.
echo  Pressione qualquer tecla para sair...
pause >nul
