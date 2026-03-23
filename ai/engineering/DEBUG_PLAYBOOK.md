# DEBUG PLAYBOOK

Guia de diagnóstico para problemas comuns.

Fluxo padrão de investigação:

1. descrever sintoma e impacto
2. reproduzir o erro com passos mínimos
3. levantar hipóteses
4. validar hipóteses com evidência (logs, status, resposta)
5. propor correção mínima
6. validar correção e risco de regressão

---

# Aplicação não inicia

Verificar:

- containers docker
- variáveis de ambiente
- logs
- comando de inicialização usado

---

# Erro de conexão com banco

Verificar:

- host
- porta
- credenciais
- container do banco

---

# Problema de CORS

Verificar:

- configuração no backend
- headers

---

# Problema de Proxy

Verificar:

- configuração do Traefik
- mapeamento de rotas
- status dos containers envolvidos

---

# Performance lenta

Verificar:

- queries
- logs
- uso de CPU