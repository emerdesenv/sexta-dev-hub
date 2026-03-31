# TEST STRATEGY

Owner: Test Engineer
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Estrategia pratica de testes para reduzir regressao com velocidade.

## 1) Piramide de teste recomendada

- Unitario: regra de negocio, funcoes puras, validacoes, normalizadores
- Integracao: controllers, middleware, contratos de endpoint e acesso a dados
- E2E/smoke: fluxos criticos entre frontend + backend em cenarios chave

## 2) Obrigatoriedade por tipo de mudanca

### Endpoint novo ou alterado
- ao menos 1 teste de sucesso + 1 de erro
- validar autorizacao (401/403 quando aplicavel)
- atualizar OpenAPI no mesmo trabalho

### Regra de negocio alterada
- teste unitario para a nova regra
- teste de integracao para caminho principal impactado

### Mudanca de UI com impacto funcional
- validar estados: loading, erro, vazio, sucesso
- evidenciar comportamento em mobile e desktop

### Fix de bug
- adicionar teste que reproduz o bug antes da correcao (quando viavel)
- manter teste como regressao permanente

## 3) Fluxos criticos minimos por dominio

- Auth: login, refresh, logout, troca de senha, bloqueio por tentativas
- Community: criar topico, responder, denunciar, moderar
- Episodes/Gamification: concluir episodio, tentativas avaliativas, resgate de missao/recompensa
- Upload: arquivo valido, tipo invalido, tamanho invalido

## 4) Evidencia obrigatoria na entrega

- comandos executados (`npm test`, suites especificas, smoke manual)
- resultado resumido (passou/falhou, escopo coberto)
- risco residual de teste quando houver limitacao

## 5) Politica de nao aprovacao

Nao aprovar mudanca quando:
- altera comportamento sem teste correspondente
- quebra fluxo critico sem plano de mitigacao
- nao apresenta evidencia minima de validacao
