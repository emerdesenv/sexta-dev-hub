# AI Setup Guide

Este documento explica como configurar e utilizar o AI Engineering Framework dentro de um projeto.

O objetivo é garantir que ferramentas de IA compreendam corretamente o contexto, as regras e a arquitetura do sistema.

---

# 1. Estrutura do Framework

A pasta `/ai` contém toda a configuração necessária para orientar o comportamento da IA.

Principais áreas:

CONTEXT  
Define visão do projeto e arquitetura.

GOVERNANCE  
Define regras e padrões obrigatórios.

ENGINEERING  
Define boas práticas técnicas e operacionais.

PROMPTS  
Biblioteca de prompts reutilizáveis.

WORKFLOWS  
Define como agentes trabalham juntos.

PLAYBOOKS  
Guias para tarefas comuns de engenharia.

agents  
Papéis especializados da IA.

---

# 2. Ferramentas compatíveis

Este framework funciona melhor com:

- Cursor
- ChatGPT
- GitHub Copilot
- Claude
- outras IAs capazes de ler arquivos do projeto

---

# 3. Como ativar o contexto da IA

Antes de iniciar tarefas complexas, peça para a IA considerar o contexto do projeto.

Exemplo:

Use `/ai/ACTIVATE_PROJECT_CONTEXT.md` antes de responder.

Isso instrui a IA a consultar os arquivos principais do framework.

---

# 4. Como usar agentes

Os agentes estão localizados em:

`/ai/agents`

Cada agente representa um papel técnico específico.

Exemplos:

- architect
- backend-engineer
- frontend-engineer
- debugger
- code-reviewer
- security-auditor
- test-engineer

---

# 5. Ativando um agente

Exemplo:

Atue como `/ai/agents/backend-engineer.md`.

Isso fará com que a IA responda considerando o papel de especialista em backend.

---

# 6. Usando o roteador de tarefas

Para tarefas mais complexas, utilize o router.

Exemplo:

Use `/ai/workflows/AI_TASK_ROUTER.md` para classificar esta tarefa.

Isso ajuda a identificar quais agentes devem participar.

---

# 7. Usando o orquestrador

Para tarefas multidisciplinares, utilize o orquestrador.

Exemplo:

Use `/ai/workflows/AI_AGENT_ORCHESTRATOR.md`.

Ele coordena vários agentes em sequência.

---

# 8. Boas práticas

Sempre que possível:

- ative o contexto do projeto
- utilize agentes especializados
- siga os playbooks disponíveis
- valide mudanças com revisão e testes

---

# 9. Objetivo do framework

Este framework foi criado para:

- melhorar qualidade de código
- padronizar decisões técnicas
- reduzir respostas genéricas da IA
- simular colaboração de um time de engenharia