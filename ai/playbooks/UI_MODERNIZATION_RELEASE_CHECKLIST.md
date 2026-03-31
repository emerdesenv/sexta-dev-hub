# UI Modernization Release Checklist

Checklist curto para PR/release das melhorias visuais (tema, ranking e consistência cross-page).

## 1) Visual e UX

- [ ] Tema `system`, `light` e `dark` com contraste legível nas telas principais.
- [ ] Estados visuais conferidos: `loading`, vazio, erro, sucesso e `hover/focus`.
- [ ] Ranking com pódio/top 3, busca e lista geral funcionando.
- [ ] Home e Community seguindo mesma linguagem de cards, badges e ações.

## 2) Responsividade

- [ ] Mobile (<= 767px): sem overflow horizontal e com navegação inferior utilizável.
- [ ] Tablet (>= 768px): grids e seções adaptados sem quebra visual.
- [ ] Desktop (>= 1024px): espaçamentos e hierarquia preservados.

## 3) Qualidade técnica

- [ ] Sem regressão de rota, API ou regra de negócio.
- [ ] Sem erro de lint no escopo alterado.
- [ ] Testes automatizados do frontend executados com sucesso.

## 4) Evidência mínima para PR

- [ ] Escopo validado registrado (telas/fluxos).
- [ ] Comandos executados registrados.
- [ ] Resultado (passou/falhou) registrado.
- [ ] Risco residual documentado quando não houver cobertura automatizada.
