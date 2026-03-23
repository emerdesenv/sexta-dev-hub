# CODE STYLE

## Objetivo
Definir padrões mínimos de legibilidade, organização e consistência para frontend e backend.

## Quando usar
Aplicar este documento em toda criação, alteração e revisão de código.

## Convenções de nomenclatura
- variáveis e funções: `camelCase`
- classes e tipos: `PascalCase`
- constantes globais: `UPPER_SNAKE_CASE`
- arquivos: `kebab-case`
- componentes Vue: `PascalCase` no nome do componente e `kebab-case` no arquivo

## Estrutura e complexidade
- funções devem ter responsabilidade única
- preferir funções curtas e coesas; quando crescerem, extrair para helpers
- evitar condicionais profundamente aninhadas (preferir guard clauses)
- remover código morto e comentários obsoletos

## Frontend (Vue)
- priorizar Composition API
- separar apresentação, estado e integração com API
- evitar componentes monolíticos; extrair subcomponentes reutilizáveis
- não usar estilos inline, exceto casos pontuais e justificados
- garantir acessibilidade básica (labels, foco visível, semântica)

## Backend (Node/Express)
- manter separação em `routes`, `controllers`, `services` e `repositories`
- validação de entrada deve ocorrer antes da lógica de negócio
- nunca montar SQL por concatenação direta de strings com input do usuário
- respostas de erro devem seguir padrão consistente (código + mensagem + contexto mínimo)

## Comentários e documentação
- usar comentários apenas quando a intenção não for óbvia pelo código
- preferir nomes autoexplicativos para reduzir comentários
- atualizar documentação quando contratos públicos mudarem

## Critérios de conformidade
- sem erro de lint no escopo alterado
- sem duplicação evidente no escopo alterado
- nomenclatura e estrutura seguindo este documento
- mudanças arquiteturalmente relevantes alinhadas com `ai/context/ARCHITECTURE.md`

## Referências
- `/ai/governance/DELIVERY_CHECKLIST.md`
- `/ai/context/ARCHITECTURE.md`
- `/ai/docs/DOCUMENT_TEMPLATES.md`