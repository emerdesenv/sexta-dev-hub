# TASK TEMPLATES

Este arquivo define templates padrão para criação de tarefas dentro do projeto.

O objetivo é garantir que humanos e IA descrevam tarefas com clareza suficiente para execução correta.

Sempre que uma nova tarefa for criada, ela deve seguir um dos templates abaixo.

---

# 1. TEMPLATE — NOVA FUNCIONALIDADE

## Contexto
Explique o problema que será resolvido.

## Objetivo
Descreva claramente o resultado esperado da funcionalidade.

## Escopo
Liste o que faz parte da implementação.

Exemplo:
- nova rota
- novo componente
- nova tela
- integração com API

## Fora do Escopo
Liste o que **não deve ser implementado** nesta tarefa.

## Requisitos Funcionais
- requisito 1
- requisito 2
- requisito 3

## Requisitos Técnicos
- stack utilizada
- padrões que devem ser seguidos
- limitações técnicas

## Critérios de Aceite
A tarefa será considerada concluída quando:

- [ ] funcionalidade implementada
- [ ] sem erros no console
- [ ] responsivo
- [ ] código seguindo padrões do projeto

---

# 2. TEMPLATE — REFATORAÇÃO

## Contexto
Explique o problema atual no código.

## Objetivo da Refatoração
Descreva o que deve melhorar.

Exemplos:
- melhorar legibilidade
- remover duplicação
- reduzir complexidade

## Escopo
Arquivos ou módulos afetados.

## Critérios de Sucesso
- código mais simples
- sem alterar comportamento
- cobertura de testes preservada

---

# 3. TEMPLATE — CORREÇÃO DE BUG

## Descrição do Bug
Explique o comportamento incorreto.

## Passos para Reproduzir
1.
2.
3.

## Comportamento Atual
O que está acontecendo.

## Comportamento Esperado
O que deveria acontecer.

## Possível Causa
Se houver alguma suspeita.

## Critérios de Aceite

- [ ] bug corrigido
- [ ] fluxo funcionando
- [ ] sem regressões

---

# 4. TEMPLATE — MELHORIA DE PERFORMANCE

## Contexto
Explique onde ocorre lentidão.

## Objetivo
Reduzir tempo de resposta / carga.

## Métrica Atual
Exemplo:

tempo de carregamento: 3.5s

## Métrica Esperada
Exemplo:

tempo de carregamento: < 1.5s

## Estratégia
- cache
- otimização de queries
- lazy loading
- compressão

---

# 5. TEMPLATE — IMPLEMENTAÇÃO DE UI

## Contexto
Tela ou componente a ser criado.

## Referência
Link do Figma ou design.

## Componentes Necessários
- botão
- input
- card
- modal

## Requisitos de UI
- responsivo
- acessível
- consistente com DESIGN_SYSTEM.md

## Critérios de Aceite

- [ ] layout fiel ao design
- [ ] responsivo
- [ ] sem quebra de layout