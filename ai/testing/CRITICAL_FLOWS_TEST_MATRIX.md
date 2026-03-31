# CRITICAL FLOWS TEST MATRIX

Owner: Test Engineer
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Matriz objetiva de fluxos criticos para validacao funcional e regressao.

## 1) Auth

| Fluxo | Prioridade | Casos minimos |
|------|------|------|
| Login | Alta | sucesso, credencial invalida, usuario bloqueado |
| Refresh de sessao | Alta | sucesso, refresh expirado/invalido |
| Logout | Alta | sucesso com sessao ativa, logout sem cookie |
| Atualizar senha | Alta | senha atual valida, senha atual invalida, regra de senha |

## 2) Episodes

| Fluxo | Prioridade | Casos minimos |
|------|------|------|
| Listar episodios publicos | Alta | com filtros, sem filtros |
| Detalhe de episodio por slug | Alta | encontrado, nao encontrado |
| CRUD de episodio (professor) | Alta | sucesso, validacao, autorizacao |

## 3) Gamification

| Fluxo | Prioridade | Casos minimos |
|------|------|------|
| Concluir episodio | Alta | primeira conclusao, repeticao |
| Tentativa avaliativa | Alta | start/submit sucesso, limite atingido |
| Reset de tentativa | Media | sucesso com XP suficiente, falha sem XP |
| Resgate de missao/recompensa | Media | sucesso, ja resgatado, saldo insuficiente |

## 4) Events

| Fluxo | Prioridade | Casos minimos |
|------|------|------|
| Evento ativo | Media | sem evento, com evento |
| Claim de evento | Alta | elegivel, nao elegivel, claim duplicado |
| Admin itens/eventos | Media | criacao/listagem, validacao de payload |

## 5) Community

| Fluxo | Prioridade | Casos minimos |
|------|------|------|
| Criar topico | Alta | sucesso, bloqueio por moderacao, validacao |
| Responder topico | Alta | sucesso, topico fechado |
| Votar resposta | Media | votar, remover voto |
| Denunciar e revisar | Alta | denuncia criada, actioned/dismissed |
| Moderacao direta | Alta | hide/unhide com permissao correta |

## 6) Upload

| Fluxo | Prioridade | Casos minimos |
|------|------|------|
| Upload valido | Alta | arquivo aceito por tipo/tamanho |
| Upload invalido | Alta | tipo proibido, MIME/signature invalida, tamanho excedido |

## 7) Evidencia minima por entrega

- comando(s) executado(s)
- resumo de resultado
- fluxos cobertos desta matriz
- risco residual quando houver
