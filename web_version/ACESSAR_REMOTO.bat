@echo off
setlocal
title Paulista PDV - Terminal Cliente

echo ========================================================
echo               PAULISTA PDV - ACESSO REMOTO
echo ========================================================
echo.
echo.
:: Verifica se ja existe uma configuracao salva
if exist CONFIG_IP.txt (
    set /p SERVER_IP=<CONFIG_IP.txt
    echo Encontrado configuracao anterior: %SERVER_IP%
    echo Para alterar, apague o arquivo CONFIG_IP.txt
    goto :INICIAR
)

echo Digite o IP ou o NOME do computador Servidor.
echo (Isso sera salvo para as proximas vezes)
echo Exemplo: 192.168.0.15 ou CAIXA-01
echo.
set /p SERVER_IP="Digite o Endereco do Servidor: "

:: Salva para a proxima vez
echo %SERVER_IP%>CONFIG_IP.txt

:INICIAR
echo.
echo Conectando a %SERVER_IP%:3000 ...

start chrome --app=http://%SERVER_IP%:3000/dashboard/sales

echo.
echo Se o sistema nao abrir, verifique:
echo 1. Se o servidor esta ligado e rodando
echo 2. Se o IP esta correto
echo 3. Se o Firewall do servidor nao esta bloqueando
echo.
pause
