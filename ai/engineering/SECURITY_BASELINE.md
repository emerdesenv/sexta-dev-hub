# SECURITY BASELINE

Owner: Security Auditor
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Este documento define práticas mínimas de segurança.

---

# Validação de Input

Todos os inputs devem ser validados.

Nunca confiar em dados do cliente.

---

# SQL Injection

Sempre usar:

- queries parametrizadas
- ORM ou query builder seguro

---

# Upload de Arquivos

Permitidos:

PDF
Áudio
Vídeo

Regras:

- validar extensão
- validar MIME type
- limitar tamanho
- armazenar fora da aplicação
- aplicar whitelist explícita de tipos aceitos

---

# Autenticação

Usar:

JWT ou sessão segura

Regras:

- tokens com expiração
- refresh token quando necessário

---

# Segredos

Nunca colocar secrets no código.

Usar:

.env
variáveis de ambiente
secret manager

---

# Dependências

Atualizar regularmente.

Evitar pacotes abandonados.

Controles mínimos adicionais:

- registrar logs de eventos de segurança relevantes
- aplicar rate limit em endpoints sensíveis quando aplicável
- revisar permissões de acesso para evitar exposição indevida de dados