# SECURITY BASELINE

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