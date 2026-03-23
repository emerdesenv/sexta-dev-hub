# AI_RULES.md

## Objetivo

Este arquivo define as regras que agentes de IA (Cursor, copilotos, automações e ferramentas baseadas em LLM) devem seguir ao gerar, modificar ou sugerir código neste repositório.

O objetivo é manter consistência de arquitetura, legibilidade e segurança no projeto **Sexta Dev Hub**.

---

# Princípios Gerais

1. Priorizar **clareza e simplicidade** no código.
2. Evitar criar complexidade desnecessária.
3. Sempre preservar a **arquitetura existente do projeto**.
4. Não modificar contratos de API ou regras de negócio sem solicitação explícita.
5. Alterações devem ser **incrementais e controladas**.

Classificação de obrigatoriedade:

- **Obrigatório:** deve ser seguido em toda alteração.
- **Recomendado:** seguir quando aplicável ao escopo.

---

# Regras de Código

## Linguagem

* Código deve ser escrito em **inglês**.
* Comentários podem ser escritos em **português**.
* Nomes de variáveis, funções e arquivos devem seguir padrão em inglês.

Exemplo correto:

```javascript
const recentEpisodes = []
function loadContentList() {}
```

---

# Frontend

Stack:

* Vue.js
* Vite

### Diretrizes

1. Priorizar **componentização**.
2. Evitar componentes muito grandes.
3. Reutilizar componentes existentes sempre que possível.
4. Criar componentes reutilizáveis em `components/`.

### Estrutura esperada

```
src/
components/
pages/
router/
services/
assets/
```

### Boas práticas

* usar nomes descritivos
* separar lógica de apresentação
* evitar lógica complexa dentro de templates

Exemplo correto:

```vue
components/EpisodeCard.vue
```

---

# Backend

Stack:

* Node.js
* Express

### Arquitetura

Separar responsabilidades:

```
controllers/
services/
routes/
middlewares/
```

### Regras

* Controllers lidam com requisições HTTP
* Services lidam com regras de negócio
* Routes definem endpoints
* Evitar lógica de negócio dentro de controllers

---

# Banco de Dados

Banco principal:

MySQL

### Diretrizes

* Queries devem ser claras
* Evitar consultas complexas desnecessárias
* Manter consistência de nomes de tabelas

---

# UI / UX

Ao gerar interfaces:

Priorizar:

* layout limpo
* boa hierarquia visual
* responsividade
* componentes reutilizáveis

Evitar:

* CSS excessivo
* duplicação de estilos
* layout inconsistente

---

# Segurança

A IA **nunca deve**:

* expor chaves de API
* inserir credenciais no código
* gerar código inseguro

Sempre considerar:

* validação de entrada
* tratamento de erros
* proteção contra injeções

Critérios verificáveis:

- nenhuma credencial hardcoded em código/documentação
- toda entrada externa validada no backend
- tratamento explícito de erro para fluxos críticos

---

# Alterações no Projeto

Antes de gerar grandes mudanças, a IA deve:

1. analisar a estrutura atual do projeto
2. explicar o impacto das mudanças
3. propor um plano de implementação

---

# Fluxo de Desenvolvimento

1. Analisar código existente
2. Sugerir melhorias
3. Implementar mudanças pequenas
4. Explicar alterações realizadas

---

# Diretriz Especial para Refatoração de UI

Ao alterar layout ou componentes:

* não alterar integração com API
* não alterar estrutura de dados
* não alterar rotas existentes

Mudanças devem focar em:

* visual
* organização
* responsividade

---

# Comportamento Esperado da IA

A IA deve:

* explicar decisões técnicas
* evitar código desnecessário
* seguir as regras definidas neste arquivo
* manter consistência com o restante do projeto