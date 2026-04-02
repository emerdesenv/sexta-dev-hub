# Regras de negócio do produto (referência)

Owner: Product + Architect
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-04-30

Documento voltado a **regras funcionais** (“o que o produto permite ou exige”), complementando a documentação **técnica** em `/ai/context/` e `/ai/governance/`.

**Manutenção:** ao alterar fluxos de autenticação, comunidade, gamificação ou cadastro, atualize este arquivo para a IA e o time continuarem alinhados à intenção do produto.

---

## Papéis

- **Professor:** acesso administrativo e pedagógico (ex.: alunos, moderação ampliada na comunidade, métricas onde existirem). Pode **gerar nova senha** para um aluno que esqueceu a senha: a API define senha temporária segura, revoga sessões de refresh do aluno e devolve a senha **uma vez** para o professor repassar ao aluno por canal adequado.
- **Aluno:** acesso ao conteúdo e às funcionalidades de aluno (episódios, gamificação, comunidade como participante).

---

## Autenticação e sessão

- **Login:** identificação por usuário e senha; JWT/cookies conforme implementação atual.
- **Conta inativa ou bloqueada:** não autentica (comportamento unificado de “credenciais inválidas” na API pública).
- **Conta com exclusão solicitada (soft delete):** usuário não deve conseguir login; registro é mantido até purge configurado; nome de usuário original pode ser liberado via renomeação técnica no backend.

---

## Cadastro de aluno

- **Formato de usuário:** validação de padrão tipo `nome.sobrenome` (letras minúsculas e ponto); detalhes exatos estão no schema da API.
- **Código de convite:** se configurado no ambiente (`STUDENT_INVITE_CODE`), o cadastro exige o código correto.
- **Aprovação:** se `STUDENT_REQUIRE_APPROVAL` estiver ativo, o aluno nasce **inativo** até um professor **ativar** a conta; enquanto inativo, não autentica.
- **Após cadastro (UX):** a API responde com `message` e `requiresApproval`; a tela de aluno exibe um painel de confirmação (título + texto retornado pelo backend + usuário cadastrado). Com aprovação obrigatória, o aluno permanece na aba **Entrar** com usuário pré-preenchido; a orientação principal vem da `message` da API, sem lista extensa de passos na interface.

---

## Comunidade (tópicos e respostas)

### Visibilidade e listagem

- **Listar tópicos:** pode ser acessado sem login (conteúdo e filtros conforme API); tópicos **ocultos** não aparecem para quem não é professor.
- **Abrir detalhe de um tópico:** mesma lógica de tópico oculto (professor pode ver).

### Criação e edição

- **Criar tópico:** **obrigatório estar autenticado.**
- **Editar tópico:** autor do tópico **ou** professor.
- **Anonimato:** tópico pode ser publicado como anônimo para outros alunos; professor pode ver identificação conforme regras da API.

### Respostas

- **Criar resposta:** **obrigatório estar autenticado.**
- **Tópico arquivado ou oculto:** não aceita novas respostas.
- **Autor do tópico removeu a conta (soft delete):** **não** é permitido enviar novas respostas; conteúdo existente pode permanecer visível conforme moderação.
- **Moderação:** professor pode ocultar/reexibir tópico ou resposta; fluxo de denúncias conforme telas e API.

### Autor removido (UX e professor)

- Em listagens e detalhes, autores com conta removida são exibidos com rótulo do tipo **“Usuário removido”** (não exibir username técnico de exclusão para o usuário final).
- **Professor:** pode listar tópicos cuja autoria é de **usuário removido** (aba/lista dedicada na interface).
- **Professor:** pode **excluir permanentemente** um tópico **somente** quando o autor do tópico está removido (exclusão em cascata de respostas e dados associados na API).

---

## Gamificação e ranking

- **Progresso e recompensas:** vinculados ao usuário autenticado conforme endpoints de gamificação.
- **Ranking público:** posições consideram apenas usuários **não removidos** (conta ativa no sentido de não estar em soft delete na modelagem atual).

---

## Moderadores e limites operacionais

- **Taxas (rate limit):** criação de tópicos, respostas, denúncias e votos podem ter limites por janela de tempo (ver variáveis de ambiente e rotas).
- **Conteúdo:** textos podem ser bloqueados por moderação automática (níveis de severidade); mensagens de retorno orientam o usuário.

---

## Radar de Vagas Tech

- **Objetivo do produto:** conectar aprendizado e empregabilidade, exibindo vagas relevantes para estudantes sem operação manual de cadastro por professor.
- **Origem das vagas:** as vagas devem ser consumidas de API(s) externa(s) no backend e disponibilizadas no site via cache interno.
- **Sem publicação manual por professor:** professores não criam/editam vagas; o fluxo principal e de listagem é automatizado por sincronização.
- **Atualização periódica:** sincronização padrão a cada 1 hora, com possibilidade de reprocessamento sob demanda por operação técnica.
- **Segmentações estratégicas iniciais:** `junior`, `remota`, `ads`, `por stack` (ex.: `node`, `vue`, `java`).
- **Escopo de responsabilidade:** backend normaliza e classifica vagas; frontend consome filtros prontos e exibe contexto de fonte e link de candidatura.
- **Conformidade de fonte externa:** toda integração deve respeitar termos de uso, limites de taxa e política de redistribuição da plataforma de origem.

---

## Como usar este documento com IA

- Inclua nas tarefas: *“Respeitar `/ai/product/BUSINESS_RULES.md`”*.
- Para novas features, acrescente uma subseção aqui **antes** ou **junto** da implementação, para não depender só do código como especificação.
