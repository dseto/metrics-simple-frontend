# 🐳 Deployment - Metrics Simple Frontend

Documentação de deploy, Docker e infraestrutura.

---

## 📋 Documentos Disponíveis

### 🚀 [DOCKER_SETUP.md](DOCKER_SETUP.md)
**Guia de setup Docker**
- Instalação do Docker
- Configuração inicial
- Comandos básicos
- Ideal para: primeira vez usando Docker

### 📖 [DOCKER_README.md](DOCKER_README.md)
**Documentação completa Docker**
- Docker Compose
- Multi-stage builds
- Nginx configuration
- Troubleshooting
- Ideal para: uso avançado

### ✅ [DOCKER_VALIDATION_REPORT.md](DOCKER_VALIDATION_REPORT.md)
**Relatório de validação**
- Testes executados
- Resultados de validação
- Issues conhecidas
- Ideal para: QA e troubleshooting

---

## 🎯 Fluxo de Deploy

### 1️⃣ Desenvolvimento Local
```bash
npm start
# http://localhost:4200
```

### 2️⃣ Build de Produção
```bash
npm run build
# Gera dist/
```

### 3️⃣ Docker Local
```bash
docker build -t metrics-simple:latest .
docker run -p 8080:80 metrics-simple:latest
# http://localhost:8080
```

### 4️⃣ Docker com Runtime Config
```bash
docker build -f Dockerfile.runtime -t metrics-simple:runtime .
docker run -p 8080:80 \
  -e API_BASE_URL=https://api.prod.com/api/v1 \
  metrics-simple:runtime
```



---

## 🔧 Configuração Runtime

Para injetar configurações no deploy:

1. **Build time configs**: Use [environments](../configuration/ENVIRONMENTS.md)
2. **Runtime configs**: Use [runtime config](../configuration/RUNTIME-CONFIG.md)
3. **Docker**: Variáveis de ambiente via `-e` ou compose

---

## 📦 Artefatos de Deploy

### Build Outputs
- `dist/metrics-simple/browser/` - Build de produção
- `dist/metrics-simple/browser/assets/config.json` - Config runtime

### Docker Images
- `metrics-simple:latest` - Imagem padrão
- `metrics-simple:runtime` - Com runtime config injection
- `metrics-simple:v{version}` - Tagged releases

---

## 🆘 Troubleshooting

### Build falha
→ Consulte [DOCKER_VALIDATION_REPORT.md](DOCKER_VALIDATION_REPORT.md)

### Container não inicia
→ Verifique logs: `docker logs <container-id>`

### Configuração não carregada
→ Leia seção troubleshooting em [RUNTIME-CONFIG.md](../configuration/RUNTIME-CONFIG.md)

### Portas em uso
→ Mude porta: `docker run -p 8081:80 ...`

---

## 🔗 Links Relacionados

- [Runtime Config](../configuration/RUNTIME-CONFIG.md)
- [Environment Config](../configuration/ENVIRONMENT-CONFIG.md)
- [Tech Stack](../development/TECH_STACK.md)
- [Dockerfile.runtime](../../Dockerfile.runtime)
