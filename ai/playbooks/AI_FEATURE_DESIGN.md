# AI Feature Design

Este playbook define como planejar e implementar novas funcionalidades no projeto.

O objetivo é garantir que novas features sejam criadas de forma consistente, segura e alinhada à arquitetura existente.

---

# 1. Entender o objetivo da feature

Antes de qualquer implementação, identificar:

- qual problema a funcionalidade resolve
- quem utilizará a funcionalidade
- qual o fluxo esperado do usuário

Perguntas importantes:

- qual é o resultado esperado?
- quais dados serão manipulados?
- qual parte do sistema será impactada?

---

# 2. Avaliar impacto arquitetural

Consultar:

/ai/CONTEXT/ARCHITECTURE.md  
/ai/CONTEXT/PROJECT_MAP.md  

Verificar:

- quais módulos serão afetados
- se novos serviços são necessários
- se haverá impacto na estrutura atual

Se houver impacto significativo, consultar o agente **architect**.

---

# 3. Definir divisão de responsabilidades

Separar responsabilidades entre camadas:

Frontend  
Backend  
Database  

Evitar misturar responsabilidades.

---

# 4. Avaliar segurança

Consultar:

/ai/ENGINEERING/SECURITY_BASELINE.md  

Verificar:

- validação de input
- controle de acesso
- manipulação de arquivos
- exposição de endpoints

---

# 5. Planejar estratégia de testes

Consultar:

/ai/ENGINEERING/TESTING_GUIDELINES.md  

Definir:

- casos de teste principais
- cenários de erro
- possíveis regressões

---

# 6. Planejar implementação

Sequência recomendada:

1 architect  
2 backend-engineer  
3 frontend-engineer  
4 test-engineer  
5 code-reviewer  

---

# 7. Critérios de conclusão

Uma feature é considerada pronta quando:

- atende ao objetivo definido
- segue padrões do projeto
- possui testes adequados
- passa por revisão de código