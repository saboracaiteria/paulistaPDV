# 📦 Paulista PDV - Distribuição Completa

Este pacote contém o **Paulista PDV** com Node.js portátil incluído, pronto para distribuição e instalação em qualquer PC Windows.

---

## 🎯 Características

✅ **Instalação Automática** - Apenas extrair e executar  
✅ **Node.js Portátil** - Não precisa instalar Node.js  
✅ **Dependências Incluídas** - Tudo já vem configurado  
✅ **Atalhos Automáticos** - Criados no Desktop  
✅ **Acesso em Rede** - Suporte para múltiplos terminais  
✅ **Interface Amigável** - Scripts com feedback visual  

---

## 📋 Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `CRIAR_PACOTE_ZIP.bat` | Cria pacote ZIP para distribuição |
| `INSTALAR.bat` | Instala o sistema em C:\PaulistaPDV |
| `INICIAR_PAULISTA_PDV.bat` | Inicia o servidor do PDV |
| `ACESSAR_REMOTO.bat` | Conecta ao PDV pela rede |

---

## 🚀 Como Criar Pacote de Distribuição

### Para o Desenvolvedor/Administrador:

1. **Certifique-se** de que a pasta `nodejs` está presente com Node.js portátil
2. **Execute** `CRIAR_PACOTE_ZIP.bat`
3. **Aguarde** a criação do arquivo ZIP
4. O arquivo será salvo em sua **Área de Trabalho** com timestamp
5. **Distribua** este arquivo ZIP para outros PCs

**Nota:** O script automaticamente:
- Limpa arquivos temporários
- Verifica integridade
- Compacta otimizado
- Exibe tamanho final

---

## 💻 Como Instalar em Outro PC

### Para o Usuário Final:

1. **Copie** o arquivo ZIP para o PC de destino
2. **Extraia** todo o conteúdo para uma pasta temporária
3. **Execute** o arquivo `INSTALAR.bat`
4. **Aguarde** a instalação automática (1-3 minutos)
5. Use os **atalhos no Desktop** para iniciar

### O que o instalador faz:

✔ Copia arquivos para `C:\PaulistaPDV`  
✔ Configura Node.js portátil  
✔ Verifica dependências  
✔ Cria atalhos no Desktop  
✔ Gera log de instalação  

**Não é necessário** instalar Node.js, NPM ou qualquer outra dependência!

---

## 🖥️ Como Usar o Sistema

### Iniciar o PDV (Servidor):

1. **Clique** no atalho "Paulista PDV" no Desktop
2. **Aguarde** 20-30 segundos para o servidor iniciar
3. O navegador abrirá **automaticamente**
4. **Não feche** a janela do servidor!

### Conectar pela Rede (Cliente):

1. No **PC servidor**, anote o **IP** exibido na janela
   - Exemplo: `192.168.0.100`
2. No **PC cliente**, clique no atalho "Paulista PDV - Rede"
3. **Digite** o IP do servidor quando solicitado
4. O navegador conectará automaticamente

---

## 🌐 Configuração de Rede

### Para Acesso de Múltiplos Terminais:

#### No Servidor:
- Execute `INICIAR_PAULISTA_PDV.bat`
- Anote o **IP** exibido na tela
- Mantenha o servidor **rodando**

#### Nos Clientes:
- Execute `ACESSAR_REMOTO.bat`
- Digite o IP do servidor
- Pronto! O sistema abrirá no navegador

### Requisitos de Rede:
- ✅ Todos os PCs na **mesma rede** (WiFi ou Ethernet)
- ✅ **Firewall** liberado para porta 3000
- ✅ Servidor deve estar **ligado e rodando**

---

## 🔧 Solução de Problemas

### ❌ "Node.js portátil não encontrado"
**Problema:** Pasta `nodejs` ausente  
**Solução:** Baixe novamente o pacote completo

### ❌ "Não consegue conectar pela rede"
**Problema:** Firewall bloqueando porta 3000  
**Solução:** 
```
1. Vá em Painel de Controle > Firewall do Windows
2. Configurações Avançadas > Regras de Entrada
3. Nova Regra > Porta > TCP > 3000
4. Permitir conexão
```

### ❌ "Navegador não abre automaticamente"
**Problema:** Chrome/Edge não detectado  
**Solução:** Abra manualmente: `http://localhost:3000/dashboard/sales`

### ❌ "Dependências não instaladas"
**Problema:** node_modules ausente no pacote  
**Solução:** 
```
1. Abra cmd em C:\PaulistaPDV
2. Execute: nodejs\npm.cmd install
3. Aguarde conclusão
```

---

## 📊 Estrutura de Instalação

Após instalação, a estrutura será:

```
C:\PaulistaPDV\
├── nodejs\                    (Node.js portátil)
├── node_modules\              (Dependências)
├── app\                       (Aplicação Next.js)
├── components\                (Componentes React)
├── lib\                       (Bibliotecas)
├── public\                    (Arquivos públicos)
├── INICIAR_PAULISTA_PDV.bat  (Script de inicialização)
├── ACESSAR_REMOTO.bat        (Script de acesso remoto)
├── package.json              (Configurações do projeto)
└── paulista_pdv.log          (Log do sistema)
```

---

## 📝 Logs e Diagnóstico

### Logs Gerados:

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| `PaulistaPDV_Install.log` | `%TEMP%` | Log da instalação |
| `paulista_pdv.log` | `C:\PaulistaPDV` | Log do servidor |

### Como Verificar Logs:

```batch
# Log de Instalação
notepad %TEMP%\PaulistaPDV_Install.log

# Log do Servidor
notepad C:\PaulistaPDV\paulista_pdv.log
```

---

## 🔐 Requisitos do Sistema

### Mínimos:
- Windows 7 ou superior (64-bit recomendado)
- 2 GB RAM
- 500 MB espaço em disco
- Conexão de rede (para acesso remoto)

### Recomendados:
- Windows 10 ou superior
- 4 GB RAM ou mais
- SSD para melhor performance
- Rede Gigabit para múltiplos terminais

---

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique os **logs** de instalação e execução
2. Consulte a seção **Solução de Problemas** acima
3. Verifique se todos os **requisitos** estão atendidos

---

## 📌 Notas Importantes

⚠️ **O servidor deve estar sempre rodando** para que os clientes possam conectar  
⚠️ **Não feche a janela do servidor** durante o uso  
⚠️ **Use Ctrl+C** na janela do servidor para parar corretamente  
⚠️ **Backup regular** dos dados via Supabase

---

## ✅ Checklist de Distribuição

Antes de distribuir o pacote ZIP, verifique:

- [ ] Pasta `nodejs` presente e completa
- [ ] Pasta `node_modules` presente (opcional mas recomendado)
- [ ] Arquivo `.env.local` com credenciais do Supabase
- [ ] Scripts `.bat` funcionando corretamente
- [ ] Testado em pelo menos um PC limpo
- [ ] Versão e data no nome do arquivo ZIP

---

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Sistema:** Paulista PDV - Web Version
