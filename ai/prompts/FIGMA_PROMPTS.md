# FIGMA_PROMPTS.md

## Objetivo

Este documento contém prompts padronizados para gerar interfaces no **Figma com IA** alinhadas ao design system e à arquitetura do projeto **Sexta Dev Hub**.

Os prompts aqui definidos devem gerar telas modernas, responsivas e consistentes com o sistema de design definido em `/ai/design/DESIGN_SYSTEM.md`.

---

# Contexto Base para Prompts

Sempre incluir o seguinte contexto ao gerar telas:

Projeto: Sexta Dev Hub

Descrição:
Plataforma educacional que centraliza conteúdos técnicos em formato de PDF, áudio e vídeo para estudantes e profissionais da área de tecnologia.

Estilo visual desejado:

* moderno
* limpo
* tecnológico
* educacional
* organizado
* responsivo

Diretrizes de interface:

* layout baseado em cards
* navegação clara
* boa hierarquia visual
* foco em leitura e aprendizado
* interface agradável para desktop e mobile

---

# Prompt Base (usar como referência)

Use este prompt com constraints explícitas:

- grid consistente (desktop/tablet/mobile)
- escala tipográfica definida
- spacing consistente entre seções e componentes
- estados de interação (hover, focus, disabled) para botões e inputs
- contraste adequado para leitura

Create a modern educational web platform interface called **Sexta Dev Hub**.

Purpose:
Centralize technical learning content in PDF, Audio and Video formats.

Audience:
Technology students and developers.

Design style:
Modern, clean, tech-oriented, educational and minimal.

UI principles:

* clear hierarchy
* card-based layout
* responsive design
* organized content sections
* easy navigation

Color palette:
Use a modern palette with blue as primary color and neutral backgrounds.

Content types must be visually identifiable:

* PDF
* Audio
* Video

---

# Tela 1 — Home Page

Prompt:

Create a homepage interface for **Sexta Dev Hub**, an educational platform for technical content.

The page should contain:

* Header with logo and navigation
* Hero section introducing the platform
* Highlight for the latest episode
* Section for recent content
* Card grid displaying PDF, Audio and Video materials
* Section explaining the platform purpose
* Footer with simple navigation

Design requirements:

* modern card-based layout
* clear typography hierarchy
* responsive grid layout
* visually distinguish different content types
* clean and minimal UI

---

# Tela 2 — Listagem de Conteúdos

Prompt:

Create a content listing page for **Sexta Dev Hub**.

The interface should include:

* page title
* search bar
* filters for content type (PDF, Audio, Video)
* responsive grid of content cards
* pagination or load more option

Each content card should display:

* title
* short description
* content type badge
* publish date
* action button

The design should prioritize clarity and readability.

---

# Tela 3 — Card de Conteúdo

Prompt:

Create a reusable content card component for **Sexta Dev Hub**.

The card should represent a piece of content that may be:

* PDF
* Audio
* Video

Each card must contain:

* title
* short description
* type badge
* publication date
* button to access the content

The card should:

* look modern and clean
* use subtle shadows
* have rounded corners
* support responsive layouts

---

# Tela 4 — Página de Conteúdo

Prompt:

Create a content detail page for **Sexta Dev Hub**.

This page should display a specific piece of content such as a PDF, audio or video.

The layout must include:

* title of the content
* description
* publication date
* type indicator
* embedded player or viewer
* navigation back to the content list
* related content suggestions

The layout should prioritize reading and content consumption.

---

# Tela 5 — Dashboard Administrativo

Prompt:

Create an admin dashboard interface for managing content on **Sexta Dev Hub**.

The dashboard should include:

* sidebar navigation
* main content area
* content management table
* button to add new content
* filters for content type
* simple statistics overview

Design style:

* clean and functional
* organized layout
* easy to manage content entries

---

# Tela 6 — Layout Mobile

Prompt:

Create a mobile-first layout for **Sexta Dev Hub**.

Requirements:

* responsive navigation
* stacked content cards
* readable typography
* touch-friendly buttons
* clear spacing between elements

The mobile experience must prioritize usability and readability.

---

# Diretrizes ao Usar Figma com IA

Ao gerar telas com IA no Figma:

1. Priorizar componentes reutilizáveis.
2. Evitar layouts complexos demais.
3. Manter hierarquia visual clara.
4. Usar grid consistente.
5. Pensar primeiro em leitura de conteúdo.

---

# Processo de Uso

Fluxo recomendado:

1. Escolher o prompt apropriado neste arquivo.
2. Ajustar conforme necessidade da tela.
3. Gerar layout no Figma com IA.
4. Refinar manualmente no Figma.
5. Converter layout em componentes Vue usando Cursor.

---

# Integração com o Projeto

Após gerar a interface no Figma:

* usar o layout como referência visual
* converter seções em componentes reutilizáveis
* seguir o `/ai/design/DESIGN_SYSTEM.md`
* respeitar `/ai/governance/AI_RULES.md`
* implementar mudanças de forma incremental

---

# Observação Final

Os prompts definidos neste arquivo são apenas o ponto de partida para gerar layouts.

A implementação final deve sempre respeitar a arquitetura do projeto e o sistema de design definido para o **Sexta Dev Hub**.