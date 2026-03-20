# AI_REFACTOR_PLAN.md

## Objetivo

Este documento define o plano de refatoração visual (UI/UX) da aplicação **Sexta Dev Hub**, garantindo que as melhorias sejam implementadas de forma incremental, segura e sem impactar a lógica de negócio existente.

O foco principal desta refatoração é:

* modernizar o layout
* melhorar a experiência do usuário
* padronizar componentes visuais
* melhorar a responsividade
* manter compatibilidade com o backend existente

---

# Regras Gerais da Refatoração

Durante qualquer alteração no projeto, a IA deve respeitar as seguintes diretrizes:

1. **Não alterar contratos da API backend.**
2. **Não modificar a lógica de negócio existente.**
3. **Preservar as rotas atuais da aplicação.**
4. **Evitar refatorações massivas sem justificativa.**
5. Implementar mudanças de forma **incremental e isolada**.

---

# Estratégia de Refatoração

A refatoração será realizada em **fases**, priorizando primeiro componentes reutilizáveis e depois páginas completas.

---

# Fase 1 — Estrutura de UI

Criar ou padronizar os seguintes componentes base:

components/ui/

* Button
* Card
* Badge
* Container
* SectionTitle
* Input
* Modal

Objetivo:

* criar base visual consistente
* evitar duplicação de código
* facilitar reutilização

---

# Fase 2 — Componentes de Layout

Criar ou melhorar os seguintes componentes:

components/layout/

* Header
* Navigation
* Footer
* PageContainer
* Sidebar (se aplicável)

Objetivo:

* melhorar navegação
* organizar estrutura visual das páginas
* garantir responsividade

---

# Fase 3 — Componentes de Conteúdo

Criar componentes específicos para o domínio da aplicação:

components/content/

* EpisodeCard
* ContentList
* ContentPlayer
* ContentBadge

Esses componentes devem suportar os tipos de conteúdo:

* PDF
* Áudio
* Vídeo

Cada card deve apresentar:

* título
* tipo de conteúdo
* data
* ação de acesso

---

# Fase 4 — Refatoração das Páginas

Após a criação dos componentes base, refatorar as páginas existentes.

Ordem de prioridade:

1. Home
2. Listagem de conteúdos
3. Página de conteúdo individual
4. Dashboard administrativo

---

# Página Home (Prioridade Alta)

A nova home deve conter:

* hero section com apresentação da plataforma
* destaque para conteúdos recentes
* listagem de conteúdos
* navegação clara
* layout responsivo

---

# Página de Conteúdos

A listagem deve incluir:

* cards de conteúdo
* filtro por tipo
* busca (se existir)
* paginação ou carregamento progressivo

---

# Página de Conteúdo

A página individual deve apresentar:

* título
* descrição
* player ou visualizador
* tipo de conteúdo
* data de publicação

---

# Diretrizes Visuais

A interface deve seguir os princípios:

* layout moderno e limpo
* boa hierarquia visual
* espaçamento consistente
* foco em legibilidade
* interface amigável para desktop e mobile

---

# Responsividade

A IA deve garantir que:

* layouts funcionem bem em mobile
* grids sejam adaptáveis
* cards se reorganizem em telas menores

---

# Reutilização de Código

Antes de criar novos componentes, a IA deve:

1. analisar componentes existentes
2. verificar se podem ser reutilizados
3. evitar duplicação de código

---

# Processo de Implementação

Para cada alteração:

1. analisar o código existente
2. identificar melhorias possíveis
3. implementar mudanças pequenas
4. explicar brevemente o que foi alterado

---

# Critérios de Aceitação

Uma refatoração é considerada válida quando:

* não quebra funcionalidades existentes
* melhora a organização do código
* melhora a interface visual
* mantém compatibilidade com backend

---

# Fluxo Esperado de Uso com IA

Ao solicitar mudanças, o agente deve:

1. ler `AI_CONTEXT.md`
2. seguir as regras de `AI_RULES.md`
3. utilizar este plano (`AI_REFACTOR_PLAN.md`)
4. propor mudanças incrementais
5. explicar as alterações realizadas

---

# Observação Final

Este plano tem como objetivo guiar a evolução do **Sexta Dev Hub** sem comprometer a estabilidade do sistema em produção.