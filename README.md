# Leiautes Para Devs ☕

Gerador de arquivos CNAB/RCB direto no navegador, feito por devs cansados de contar caractere no braço para devs cansados de contar caractere no braço.

Zero backend. Zero persistência. Zero telemetria bisbilhoteira. LGPD by design — seus dados não saem do navegador nem para tomar um café.

Ver [docs/PRD_Leiautes_Para_Devs.md](docs/PRD_Leiautes_Para_Devs.md) e [docs/HLD_Leiautes_Para_Devs.md](docs/HLD_Leiautes_Para_Devs.md).

## O problema 🩹

Você já teve que gerar um CNAB240 na mão às 23h47 de uma sexta-feira, contando espaço com o dedo indicador na tela? Pois é. Nós também.

O produto existe para que o próximo dev/QA/analista de implantação não precise abrir a spec da FEBRABAN, um bloco de notas e uma régua imaginária ao mesmo tempo. Preencha o formulário, veja o arquivo se montar em tempo real, baixe, cole no ambiente de teste e volte pra sua xícara antes que o café esfrie.

## Stack 🧱

Quasar 3 · Vue 3 (Composition API) · TypeScript · Vite · Pinia · Vue Router · SCSS · ESLint + Prettier.

Fontes obrigatórias: **JetBrains Mono** para tudo que é posicional (porque proporcional em arquivo fixed-width é crime inafiançável), Space Grotesk para display e Inter para UI.

## Scripts ⚙️

O clássico "funciona na minha máquina", agora com mais chance de funcionar na sua também:

```bash
npm install           # instala dependências (bom momento para um café)
npm run dev           # dev server em http://localhost:9000
npm run build         # build de produção (dist/spa)
npm run lint          # lint + format (o linter também tem sentimentos)
npm run lint:check    # apenas verifica, sem corrigir nada
npm run typecheck     # vue-tsc — porque `any` é uma fuga, não uma solução
```

## Estrutura 🗂️

```
src/
├── layouts/
│   └── MainLayout.vue        # shell Quasar (toolbar + router-view)
├── model/
│   └── cnab240/              # spec dos campos CNAB240 (a implementar) — ver ADR-008
├── stores/                   # Pinia (useConfigStore, useCnab240Store) — a implementar
├── utils/                    # validation.ts, masks.ts, serializer.ts — a implementar
├── pages/
│   ├── LandingPage.vue       # rota /
│   └── Cnab240Page.vue       # rota /cnab-240
├── router/
└── css/
    ├── app.scss              # importa tokens
    └── tokens.scss           # design tokens --lpd-* (dark + light)
```

Nada de spec de leiaute dentro de `src/layouts/` — esse diretório é sagrado para o Quasar. Spec de formato vai em `src/model/<leiaute>/`, sempre.

## Status ⏳

Em fase de design e scaffolding. O esqueleto Quasar existe; o motor CNAB240 e os formulários ainda são vaporware bem-intencionado. Se você chegou aqui procurando um binário pronto: volte em breve, prometemos que o café ainda vai estar quente.

Roadmap resumido (do PRD):

1. Fundação — design tokens e componentes base
2. Motor CNAB240 — spec data-driven, validação, serialização
3. UI completa — formulário + `FilePreviewModal` com download/cópia
4. Polimento — responsividade, acessibilidade, easter egg do "Erick"
5. Launch — Netlify + repo público

## Arquitetura em uma respirada 🫁

SPA de coluna única. O usuário preenche cards colapsáveis por seção (Header de Arquivo → Lotes → Segmentos → Trailers). Ao clicar em "Visualizar arquivo", o `FilePreviewModal` serializa o estado da store em linhas de exatos 240 caracteres, permite copiar (Clipboard API) ou baixar (Blob em ISO-8859-1 com CRLF, porque banco brasileiro não perdoa UTF-8).

Trailers são derivados via getters do Pinia — o usuário não digita contador, o Pinia digita por ele. Um humano a menos contando registros manualmente é um humano a mais tomando café.

Detalhes: [docs/HLD_Leiautes_Para_Devs.md](docs/HLD_Leiautes_Para_Devs.md).

## Design System 🎨

Dark-first, function-forward, monoespaçado até no botão de "sim". Todos os tokens vivem em `--lpd-*` — nada de hex hardcoded, sob pena de olhar torto na review.

Documento completo: [docs/design system/Design_System_Leiautes_Para_Devs.md](docs/design%20system/Design_System_Leiautes_Para_Devs.md).

## Acessibilidade ♿

WCAG 2.1 AA não é enfeite: contraste ≥ 4.5:1, anel de foco âmbar visível, touch targets ≥ 44×44px, `prefers-reduced-motion` respeitado e mensagens de erro amarradas aos campos via `aria-describedby`. Se sua ferramenta gera arquivo válido mas ninguém consegue usar, ela não gera arquivo nenhum.

## Privacidade 🔒

Nenhuma chamada de rede com dados do usuário. Nenhum `localStorage`, `sessionStorage` ou cookie. O único analytics é o Netlify Analytics (server-side, sem cookies, LGPD-friendly — ver [ADR-007](docs/adr/ADR-007-analytics-netlify-analytics.md)).

Traduzindo: você pode colar CPF de teste, valor de tarifa e nome de favorecido à vontade que ninguém vê nada. Nem nós. Nem o Google. Nem aquele estagiário que ficou de olho no seu monitor.

## Contribuindo 🤝

Antes de abrir um PR:

- Rode `npm run lint` e `npm run typecheck` (o CI vai rodar de qualquer jeito, adiante o inevitável)
- Se estiver mexendo em spec de leiaute, encoste no [ADR-003](docs/adr/ADR-003-spec-campos-constantes-typescript.md) e [ADR-008](docs/adr/ADR-008-spec-de-leiautes-em-src-model.md) antes
- Commits em português são bem-vindos; o produto é para o mercado brasileiro
- Bug report com arquivo gerado anexado vale duas xícaras de café virtuais

## Apoie este projeto ☕💛

Se essa ferramenta te salvou de contar caractere no braço às 2h da manhã, considere pagar um café pro mantenedor:

[![Doe pelo PayPal](https://img.shields.io/badge/PayPal-Donate-blue.svg)](https://www.paypal.com/donate/?hosted_button_id=8RE442ASFC2PS)

Também serve estrelinha no GitHub — é grátis, alegra o coração e ajuda outras pessoas a acharem o projeto.

## Licença 📜

MIT — ver [LICENSE](LICENSE). Use, forke, adapte, venda, mande print no LinkedIn. Só mantenha o aviso de copyright que o advogado agradece e o mantenedor também.
