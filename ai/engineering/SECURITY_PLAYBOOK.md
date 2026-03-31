# SECURITY PLAYBOOK

Owner: Security Auditor
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Guia operacional para mudancas e incidentes de seguranca no projeto.

## 1) Controles por area

### Autenticacao e sessao
- exigir `JWT_SECRET` forte em producao
- tokens com expiracao curta + refresh rotativo/revogavel
- invalidar sessoes em eventos sensiveis (reset de senha, bloqueio de conta)

### Autorizacao
- validar permissao por papel e por recurso
- negar por padrao quando contexto de usuario nao estiver completo
- proteger rotas administrativas com middleware dedicado

### Input e persistencia
- validar payload com schema (zod equivalente)
- evitar interpolacao em query SQL
- normalizar e limitar campos de entrada

### Upload
- whitelist explicita de tipos aceitos
- validar assinatura/MIME real e tamanho maximo
- armazenar fora de caminho executavel e sem nome controlado pelo usuario

### Headers, cookies e CORS
- manter `helmet` ativo
- cookies de auth com `httpOnly`, `secure` em prod e `sameSite` adequado
- CORS com allowlist por ambiente

## 2) Logging e auditoria

- logar eventos de seguranca: login falho, bloqueio, reset de senha, mudanca de permissao, moderacao critica
- nunca logar senha, token bruto, cookie, segredo
- preferir IDs e contexto minimo (usuario, ip, rota, timestamp)

## 3) Vulnerabilidades e dependencias

- rodar auditoria de dependencias periodica (semanal)
- tratar vulnerabilidades high/critical com prioridade
- registrar excecoes justificadas com prazo de revisao

## 4) Checklist de release (seguranca)

- [ ] sem secrets hardcoded
- [ ] endpoints sensiveis com rate limit
- [ ] autorizacao validada nos fluxos alterados
- [ ] logs de auditoria adequados para o escopo alterado
- [ ] testes de abuso basico executados

## 5) Resposta a incidente

### T0 - Deteccao e triagem
- classificar severidade (baixa/media/alta/critica)
- identificar impacto: dados, disponibilidade, escopo de usuarios

### T1 - Contencao
- aplicar mitigacao rapida (bloqueio de rota, revogacao de token, rollback)
- preservar evidencias minimas para analise

### T2 - Correcao
- corrigir causa raiz
- adicionar teste de regressao e atualizar documentacao relevante

### T3 - Comunicacao e aprendizado
- comunicar status para stakeholders
- registrar pos-mortem curto com causa, impacto, acao corretiva e preventiva
