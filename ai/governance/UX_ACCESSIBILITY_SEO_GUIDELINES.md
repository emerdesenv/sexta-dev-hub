# UX, Acessibilidade e SEO

Owner: Product + Frontend + Tech Lead  
Status: active  
Ultima revisao: 2026-04-02  
Proxima revisao sugerida: 2026-06-02

## Objetivo

Definir um baseline permanente de qualidade para experiencia de estudante, acessibilidade e SEO em toda entrega de frontend.

## Aplicabilidade

- obrigatório para novas telas, refactors visuais e ajustes de layout/conteudo
- obrigatório em PRs que alteram componentes, paginas publicas, metadados, navegacao ou copy

## UX para estudantes (baseline)

- priorizar legibilidade em leitura prolongada (evitar contraste agressivo e excesso de brilho)
- manter hierarquia visual clara: titulo, contexto, CTA principal e proximo passo
- limitar ruido visual: gradientes e sombras devem ser sutis e funcionais
- usar linguagem objetiva e instrucional, com microcopys orientadas a acao

## Acessibilidade (WCAG 2.2 AA)

- contraste minimo AA:
  - texto normal: 4.5:1
  - texto grande (>= 24px regular ou 18.66px bold): 3:1
  - componentes de UI e bordas informativas: 3:1
- interacoes com teclado: foco visivel obrigatorio em elementos interativos
- semantica: usar tags corretas (`button`, `nav`, `main`, `h1...h6`, `label`, `input`)
- imagens com `alt` descritivo quando relevantes para entendimento
- nao depender apenas de cor para indicar estado (erro, sucesso, alerta)
- mensagens de erro devem ser claras e, quando aplicavel, associadas ao campo

## SEO tecnico e semantico

- cada pagina publica deve ter `title` e `meta description` coerentes com a intencao da rota
- garantir apenas um `h1` principal por pagina e estrutura semantica consistente
- links devem ter texto significativo (evitar "clique aqui")
- manter performance de carregamento em nivel saudavel (Core Web Vitals como referencia)
- evitar conteudo duplicado entre paginas publicas sem diferenciacao de intencao

## Checklist minimo de PR (obrigatorio)

- [ ] contraste e foco validados para os estados principais (default, hover, focus, disabled)
- [ ] navegacao por teclado validada no fluxo principal da tela
- [ ] semantica de headings e elementos interativos revisada
- [ ] `title` e `meta description` revisados nas rotas publicas impactadas
- [ ] evidencias registradas no PR (comandos, resultado e risco residual)

## Evidencia recomendada

- testes manuais reproduziveis dos fluxos alterados
- captura visual antes/depois para mudancas de UI relevantes
- quando possivel, validacao por Lighthouse/Axe (ou equivalente)

## Referencias internas

- `README.md`
- `ai/governance/CODE_STYLE.md`
- `ai/engineering/TEST_STRATEGY.md`
- `ai/testing/CRITICAL_FLOWS_TEST_MATRIX.md`
