# UI IMPLEMENTATION GUIDE

Owner: Product Designer + Frontend Engineer
Status: active
Ultima revisao: 2026-03-31
Proxima revisao sugerida: 2026-05-30

Guia pratico para transformar requisitos e layouts em componentes consistentes no frontend.

## 1) Padrao de implementacao

- Reutilizar componentes existentes antes de criar novos.
- Manter separacao entre estrutura visual e logica de dados.
- Evitar estilo inline; priorizar classes utilitarias e organizadas.
- Manter nomenclatura semantica e previsivel de componentes/props.

## 2) Mapeamento visual para codigo

### Tipografia e hierarquia
- Titulo de pagina: destaque claro (H1)
- Titulos de secao: H2/H3 coerente
- Texto auxiliar: menor contraste/tamanho sem perder legibilidade

### Espacamento
- usar escala consistente (4, 8, 12, 16, 20, 24, 32, 40, 48, 64)
- evitar margens aleatorias entre blocos

### Cores e estados
- seguir paleta definida em `DESIGN_SYSTEM.md`
- manter padrao para status de sucesso, alerta e erro

## 3) Estados obrigatorios por tela/componente

Sempre avaliar se o componente exige:
- `loading` (carregamento de dados)
- `empty` (sem dados)
- `error` (falha de carregamento ou envio)
- `success` (acao concluida)

Se existir acao do usuario, definir feedback visual claro para cada estado.

## 4) Responsividade minima

- Mobile first para componentes novos.
- Revisar quebra de layout em 3 faixas: mobile, tablet, desktop.
- Em listagens, priorizar legibilidade e acoes sem colisao visual.

## 5) Acessibilidade minima

- Foco visivel em elementos navegaveis por teclado.
- Labels associados a campos e mensagens de erro compreensiveis.
- Ordem de navegacao consistente em formularios e modais.
- Contraste adequado em textos e controles principais.

## 6) Checklist de PR para UI

- [ ] componente aderente ao `DESIGN_SYSTEM.md`
- [ ] estados `loading/empty/error/success` tratados quando aplicavel
- [ ] validado em mobile + desktop
- [ ] sem regressao visual evidente no fluxo impactado
