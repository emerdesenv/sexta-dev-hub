# AGENT_ROLES.md

## Objetivo

Este documento define papéis especializados para agentes de IA utilizados no desenvolvimento do projeto **Sexta Dev Hub**.

Cada agente possui responsabilidades específicas e deve atuar respeitando:

* AI_CONTEXT.md
* AI_RULES.md
* PROJECT_MAP.md
* DESIGN_SYSTEM.md
* AI_REFACTOR_PLAN.md

Os agentes devem colaborar para melhorar a qualidade do código e acelerar o desenvolvimento sem comprometer a arquitetura existente.

---

# UI Agent

## Responsabilidade

Responsável pela interface do usuário.

Deve focar em:

* layout
* organização visual
* experiência do usuário
* responsividade
* componentização

## Diretrizes

* seguir o `DESIGN_SYSTEM.md`
* reutilizar componentes existentes
* evitar estilos duplicados
* manter layout limpo e organizado

## Tarefas típicas

* criar componentes Vue
* refatorar layout
* melhorar responsividade
* converter layouts do Figma em código

---

# Frontend Architecture Agent

## Responsabilidade

Responsável por manter a arquitetura do frontend organizada e escalável.

## Diretrizes

* separar componentes reutilizáveis
* manter lógica fora de templates
* evitar componentes muito grandes
* organizar estrutura de pastas

## Tarefas típicas

* reorganizar componentes
* sugerir melhorias estruturais
* revisar organização do frontend

---

# Backend Agent

## Responsabilidade

Responsável pela API e lógica de negócio.

## Diretrizes

* manter separação entre routes, controllers e services
* evitar lógica de negócio em controllers
* manter endpoints simples e claros

## Tarefas típicas

* criar novos endpoints
* revisar lógica de serviços
* melhorar organização da API
* validar dados de entrada

---

# Database Agent

## Responsabilidade

Responsável pela estrutura e integridade do banco de dados.

## Diretrizes

* manter consistência de tabelas
* evitar queries complexas desnecessárias
* garantir integridade de dados

## Tarefas típicas

* revisar queries
* sugerir melhorias de performance
* revisar estrutura de tabelas

---

# DevOps Agent

## Responsabilidade

Responsável pela infraestrutura e deploy.

## Diretrizes

* manter containers organizados
* revisar configurações Docker
* garantir segurança básica de deploy

## Tarefas típicas

* revisar Dockerfiles
* revisar docker-compose
* analisar variáveis de ambiente
* preparar deploy

---

# Code Review Agent

## Responsabilidade

Revisar código gerado por humanos ou IA.

## Diretrizes

* verificar consistência com `AI_RULES.md`
* verificar legibilidade
* detectar possíveis bugs
* sugerir melhorias

## Tarefas típicas

* revisar pull requests
* identificar código duplicado
* sugerir refatorações

---

# Security Agent

## Responsabilidade

Garantir segurança básica da aplicação.

## Diretrizes

* nunca expor credenciais
* validar entradas do usuário
* prevenir vulnerabilidades comuns

## Tarefas típicas

* revisar endpoints
* revisar manipulação de dados
* verificar possíveis vulnerabilidades

---

# Refactor Agent

## Responsabilidade

Realizar melhorias estruturais no código sem alterar comportamento.

## Diretrizes

* manter compatibilidade
* evitar mudanças grandes sem justificativa
* explicar impacto das alterações

## Tarefas típicas

* simplificar código
* reduzir duplicação
* melhorar organização

---

# Workflow Entre Agentes

Fluxo recomendado ao trabalhar com IA:

1. UI Agent cria layout ou componentes
2. Frontend Architecture Agent organiza estrutura
3. Backend Agent cria ou ajusta APIs
4. Database Agent valida estrutura de dados
5. DevOps Agent revisa deploy
6. Code Review Agent revisa alterações
7. Security Agent valida segurança

---

# Uso no Cursor

Exemplo de uso:

Act as the **UI Agent** defined in AGENT_ROLES.md and refactor the homepage layout.

Ou:

Act as the **Code Review Agent** and analyze this file.

Ou:

Act as the **DevOps Agent** and review the Docker configuration.

---

# Objetivo Final

Utilizar agentes especializados para:

* melhorar qualidade do código
* acelerar desenvolvimento
* manter arquitetura consistente
* evitar erros comuns de geração automática de código
