# AI DEVELOPMENT KIT

Este projeto utiliza um conjunto de documentos estruturados para orientar o uso de Inteligência Artificial no desenvolvimento de software.

O objetivo é permitir que ferramentas como Cursor, Copilot ou outros agentes entendam corretamente:

- arquitetura
- padrões
- contexto do projeto
- decisões técnicas
- workflows de desenvolvimento

---

# Estrutura do AI Development Kit

## Contexto do Projeto

`/ai/context/AI_CONTEXT.md`

Contém:
- visão geral
- objetivos do sistema
- stack tecnológica
- princípios do projeto

---

## Regras para IA

`/ai/governance/AI_RULES.md`

Define como a IA deve se comportar ao modificar o projeto.

Inclui:

- regras de código
- limitações
- boas práticas
- padrões obrigatórios

---

## Arquitetura

`/ai/context/ARCHITECTURE.md`

Documenta:

- arquitetura do sistema
- comunicação entre serviços
- fluxos principais
- padrões estruturais

---

## Mapeamento do Projeto

`/ai/context/PROJECT_MAP.md`

Descreve:

- estrutura de diretórios
- responsabilidades de cada pasta
- organização do código

---

## Design System

`/ai/design/DESIGN_SYSTEM.md`

Define padrões visuais:

- cores
- tipografia
- componentes
- espaçamento

---

## Integração com Figma

`/ai/prompts/FIGMA_PROMPTS.md`

Prompts que ajudam a IA a transformar designs em código.

---

## Workflows de Desenvolvimento

`/ai/workflows/CURSOR_WORKFLOWS.md`

Fluxos recomendados para trabalhar com IA no Cursor.

Exemplo:

- criar feature
- revisar código
- refatorar módulo
- gerar componentes

---

## Papéis de Agentes

`/ai/agents/README.md`

Define especializações da IA:

- arquiteto
- revisor
- implementador
- designer
- debugger

---

## Templates de Tarefas

`/ai/prompts/TASK_TEMPLATES.md`

Modelos padronizados para criação de tarefas.

## Templates de Documentação

`/ai/docs/DOCUMENT_TEMPLATES.md`

Padrão único de seções para contexto, governança, workflows, playbooks, agentes e prompts.

---

## Plano de Refatoração

`/ai/playbooks/AI_REFACTOR_GUIDE.md`

Guia para melhorias estruturais do projeto.

---

# Como a IA deve trabalhar neste projeto

Antes de gerar ou alterar código, a IA deve:

1. Ler `/ai/context/AI_CONTEXT.md`  
2. Ler `/ai/governance/AI_RULES.md`  
3. Entender `/ai/context/PROJECT_MAP.md`  
4. Seguir padrões definidos em `/ai/design/DESIGN_SYSTEM.md`  
5. Respeitar decisões arquiteturais em `/ai/context/ARCHITECTURE.md`  

---

# Princípios de Desenvolvimento

Este projeto segue alguns princípios fundamentais:

- simplicidade
- legibilidade
- modularidade
- escalabilidade
- segurança

---

# Boas práticas

Sempre que possível a IA deve:

- evitar duplicação de código
- criar componentes reutilizáveis
- escrever código claro
- seguir estrutura do projeto
- documentar decisões importantes

---

# Importante

A IA não deve:

- alterar arquitetura sem justificativa
- adicionar dependências desnecessárias
- quebrar padrões definidos
- modificar arquivos fora do escopo da tarefa

---

# Objetivo final

Criar um ambiente onde humanos e IA colaboram de forma produtiva no desenvolvimento do software.