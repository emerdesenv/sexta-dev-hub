# DESIGN_SYSTEM.md

## Objetivo

Este documento define o sistema de design do projeto **Sexta Dev Hub** para orientar o desenvolvimento de interfaces consistentes, modernas e reutilizáveis.

Ele deve ser utilizado por desenvolvedores e agentes de IA ao criar, alterar ou refatorar componentes do frontend.

---

# Identidade do Produto

## Nome
Sexta Dev Hub

## Propósito
Plataforma educacional para centralizar conteúdos técnicos em formato de PDF, áudio e vídeo.

## Percepção desejada
A interface deve transmitir:

- tecnologia
- clareza
- organização
- modernidade
- ambiente educacional
- facilidade de navegação

---

# Princípios Visuais

1. Interface limpa e objetiva
2. Boa hierarquia visual
3. Componentes reutilizáveis
4. Espaçamento consistente
5. Navegação simples
6. Responsividade obrigatória
7. Destaque claro para os tipos de conteúdo

---

# Estilo Geral

## Direção visual
A aplicação deve ter um visual:

- moderno
- profissional
- tecnológico
- educacional
- amigável
- organizado

## Evitar
- excesso de informação visual
- poluição de cores
- sombras exageradas
- bordas muito pesadas
- componentes inconsistentes
- excesso de estilos inline

---

# Cores

## Paleta principal sugerida

### Primária
- Azul principal: `#2563EB`
- Azul escuro: `#1E40AF`

### Secundária
- Ciano suave: `#06B6D4`
- Verde de apoio: `#10B981`

### Neutras
- Fundo principal: `#F8FAFC`
- Fundo secundário: `#EEF2F7`
- Branco: `#FFFFFF`
- Texto principal: `#0F172A`
- Texto secundário: `#475569`
- Borda suave: `#E2E8F0`

## Cores por tipo de conteúdo

### PDF
- Fundo/badge: `#DBEAFE`
- Texto/ícone: `#1D4ED8`

### Áudio
- Fundo/badge: `#DCFCE7`
- Texto/ícone: `#15803D`

### Vídeo
- Fundo/badge: `#FEE2E2`
- Texto/ícone: `#DC2626`

---

# Tipografia

## Estilo
Tipografia simples, moderna e altamente legível.

## Hierarquia sugerida

### Título principal (H1)
- tamanho: 32px a 40px
- peso: 700

### Título de seção (H2)
- tamanho: 24px a 28px
- peso: 600

### Subtítulo (H3)
- tamanho: 18px a 22px
- peso: 600

### Texto padrão
- tamanho: 16px
- peso: 400

### Texto auxiliar
- tamanho: 14px
- peso: 400

### Texto pequeno / legenda
- tamanho: 12px
- peso: 400 ou 500

---

# Espaçamento

Usar espaçamento consistente com base em escala.

## Escala sugerida
- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px
- 48px
- 64px

## Regras
- evitar margens aleatórias
- manter consistência entre cards, seções e formulários
- preferir padding interno confortável

---

# Bordas e Cantos

## Padrão sugerido
- borda suave: `1px solid #E2E8F0`
- raio pequeno: `8px`
- raio médio: `12px`
- raio grande: `16px`

## Diretriz
Cards e blocos principais devem ter cantos suaves e modernos.

---

# Sombras

Usar sombras leves e discretas.

## Diretriz
Sombras devem servir apenas para separação visual, nunca como elemento principal do design.

---

# Layout

## Estrutura geral
A interface deve ser organizada em blocos bem definidos:

- header
- hero section
- seções de conteúdo
- listagens em grid
- rodapé

## Containers
O conteúdo deve ter largura controlada e alinhamento consistente.

## Grids
Priorizar:
- grid com 2 a 4 colunas em desktop
- 1 coluna em mobile
- adaptação progressiva em tablet

---

# Responsividade

## Regras obrigatórias
Todos os componentes devem funcionar bem em:

- desktop
- tablet
- mobile

## Diretrizes
- evitar overflow horizontal
- reorganizar grids em telas menores
- ajustar paddings em mobile
- botões e áreas clicáveis devem ser confortáveis em touch

---

# Componentes Base

## Button

### Variações
- primary
- secondary
- ghost

### Regras
- tamanho consistente
- estados visuais claros
- boa área de clique
- texto curto e direto

---

## Card

### Uso
Exibir conteúdos, resumos, destaques e blocos informativos.

### Estrutura sugerida
- título
- descrição curta
- badge do tipo
- data
- ação principal

### Regras
- layout limpo
- espaçamento interno consistente
- destaque visual sem exagero

---

## Badge

### Uso
Indicar tipo de conteúdo, status ou categoria.

### Tipos principais
- PDF
- Áudio
- Vídeo

### Regras
- pequeno
- legível
- cor consistente por tipo

---

## Input

### Regras
- borda suave
- altura confortável
- foco visível
- label clara quando aplicável

---

## SectionTitle

### Uso
Títulos de blocos e seções da página.

### Estrutura sugerida
- título
- subtítulo opcional
- ação opcional à direita

---

# Componentes de Layout

## Header
Deve conter:
- logo/nome do projeto
- navegação principal
- acesso rápido às áreas principais

## Footer
Deve ser simples, limpo e discreto.

## PageContainer
Responsável por manter largura máxima e padding consistente.

---

# Componentes de Domínio

## EpisodeCard
Componente principal para exibir conteúdos.

### Deve conter
- título
- breve descrição
- tipo de mídia
- data
- botão de acesso

### Regras
- deve funcionar bem em grid
- deve ser reutilizável
- deve ter variação visual leve conforme tipo de conteúdo

---

## ContentList
Lista de conteúdos em formato de grid ou lista.

### Regras
- responsiva
- organizada
- permitir filtros quando necessário

---

## ContentPlayer
Componente usado para renderizar PDF, áudio ou vídeo.

### Regras
- adaptar a interface ao tipo de conteúdo
- manter consistência visual com o restante do projeto

---

# Estados Visuais

A IA deve prever componentes com estados claros para:

- loading
- vazio
- erro
- sucesso
- hover
- foco
- desabilitado

---

# Regras para a IA ao Gerar Componentes

1. Sempre reutilizar componentes existentes quando possível.
2. Criar novos componentes apenas quando houver necessidade clara.
3. Manter consistência com este design system.
4. Evitar estilos inline.
5. Priorizar classes organizadas e fáceis de manter.
6. Garantir responsividade.
7. Não alterar regras de negócio ao modificar UI.
8. Separar estrutura visual da lógica sempre que possível.

---

# Convenções de Nomes

## Componentes
Usar PascalCase:

- EpisodeCard.vue
- ContentList.vue
- SectionTitle.vue

## Props e variáveis
Usar camelCase:

- contentType
- publishDate
- recentEpisodes

---

# Integração com Figma

Ao converter layouts do Figma para código:

1. preservar a hierarquia visual
2. adaptar para componentes reutilizáveis
3. não copiar estrutura de forma literal se houver duplicação desnecessária
4. converter blocos visuais em componentes
5. manter consistência com este design system

---

# Objetivo Final

O frontend do Sexta Dev Hub deve evoluir para uma interface:

- moderna
- consistente
- escalável
- reutilizável
- agradável para estudantes e profissionais