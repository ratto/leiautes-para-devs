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
npm install                # instala dependências (bom momento para um café)
npm run dev                # dev server em http://localhost:9000
npm run build              # build de produção (dist/spa)
npm run lint               # lint + format (o linter também tem sentimentos)
npm run lint:check         # apenas verifica, sem corrigir nada
npm run typecheck          # vue-tsc — porque `any` é uma fuga, não uma solução

# Testes
npm run test:unit          # Vitest — testes unitários
npm run test:unit:watch    # Vitest em modo watch
npm run test:unit:coverage # Vitest com relatório de cobertura
npm run test:e2e           # Playwright — testes E2E
npm run test:e2e:ui        # Playwright com UI interativa
npm run test:e2e:chrome    # Playwright apenas no Chromium
npm run test:e2e:debug     # Playwright em modo debug
```

## Estrutura 🗂️

```
src/
├── layouts/
│   ├── MainLayout.vue              # shell Quasar para a ferramenta (toolbar + router-view)
│   └── LandingLayout.vue           # layout da landing page com AppHeader fixo
├── components/
│   ├── AppHeader.vue               # cabeçalho com LeiauteSelector, ThemeToggle e PrivacyBadge
│   ├── AppFooter.vue               # rodapé com créditos e link GitHub
│   ├── LeiauteSelector.vue         # chips de seleção RCB001/CNAB240/CNAB400
│   ├── TipoArquivoToggle.vue       # toggle remessa/retorno
│   ├── ThemeToggle.vue             # alternância dark/light (US19)
│   ├── PrivacyBadge.vue            # badge LGPD persistente (US20)
│   └── landing/
│       ├── HeroSection.vue         # hero com tagline e PrivacyBadge acima da dobra
│       ├── LeiauteCard.vue         # card individual de leiaute no carrossel
│       ├── LeiauteCarousel.vue     # carrossel scroll-snap de leiautes disponíveis
│       ├── ComoFuncionaSection.vue # seção "como funciona"
│       └── PorqueEssaFerramentaSection.vue
├── constants/
│   └── leiautes.ts                 # fonte de verdade dos leiautes (rota, nome, status)
├── model/
│   ├── common/                     # tipos compartilhados entre leiautes
│   └── cnab240/                    # spec dos campos CNAB240 — ver ADR-008
├── stores/
│   └── config-store.ts             # Pinia: leiaute selecionado, tema, tipo de arquivo
├── pages/
│   ├── LandingPage.vue             # rota /
│   ├── Cnab240Page.vue             # rota /cnab-240
│   └── LeiautePlaceholderPage.vue  # rota para leiautes ainda não implementados
├── router/
└── css/
    ├── app.scss                    # importa tokens
    └── tokens.scss                 # design tokens --lpd-* (dark + light)

test/
├── vitest/unit/                   # testes unitários de componentes, stores e constants
└── playwright/e2e/                # testes E2E por US (us01-*.spec.ts, us19-*.spec.ts…)
```

Nada de spec de leiaute dentro de `src/layouts/` — esse diretório é sagrado para o Quasar. Spec de formato vai em `src/model/<leiaute>/`, sempre.

## Status ⏳

Em desenvolvimento ativo. A fundação está no ar — landing page, design tokens, alternância de tema, badge de privacidade e seleção de leiaute implementados e testados (155 testes passando). O motor CNAB240 e os formulários de campos estão em fila.

Roadmap resumido (do PRD):

1. ~~Fundação — design tokens e componentes base~~ ✅ (US01, US19, US20, US21 entregues)
2. Motor CNAB240 — spec data-driven, validação, serialização
3. UI completa — formulário + `FilePreviewModal` com download/cópia
4. Polimento — responsividade, acessibilidade, easter egg do "Erick"
5. Launch — Netlify + repo público

## Arquitetura em uma respirada 💨

SPA de coluna única. O usuário preenche cards colapsáveis por seção (Header de Arquivo → Lotes → Segmentos → Trailers). Ao clicar em "Visualizar arquivo", o `FilePreviewModal` serializa o estado da store em linhas de exatos 240 caracteres, permite copiar (Clipboard API) ou baixar (Blob em ISO-8859-1 com CRLF, porque banco brasileiro não perdoa UTF-8).

Trailers são derivados de propriedaes computadas — o usuário não digita contador, a aplicação já preenche para você. Um humano a menos contando registros manualmente é um humano a mais tomando café.

Detalhes: [docs/HLD_Leiautes_Para_Devs.md](docs/HLD_Leiautes_Para_Devs.md).

## Design System 🎨

Dark-first, function-forward, monoespaçado até no botão de "sim". Todos os tokens vivem em `--lpd-*` — nada de hex hardcoded, sob pena de olhar torto na review.

Documento completo: [docs/design system/Design_System_Leiautes_Para_Devs.md](docs/design%20system/Design_System_Leiautes_Para_Devs.md).

## Acessibilidade ♿

WCAG 2.1 AA não é enfeite: contraste ≥ 4.5:1, anel de foco âmbar visível, touch targets ≥ 44×44px, `prefers-reduced-motion` respeitado e mensagens de erro amarradas aos campos via `aria-describedby`. Se sua ferramenta gera arquivo válido mas ninguém consegue usar, ela não gera arquivo nenhum.

## Privacidade 🔒

O produto **não tem backend**. Não existe servidor de aplicação, API própria ou banco de dados guardando o que você digita — tudo roda 100% no seu navegador (SPA estática servida pela Netlify). Essa é a garantia primária, e ela vem da arquitetura, não de uma política escrita num Termo de Uso.

Na prática, nenhuma requisição de rede carrega dados de formulário: valores de campos, segmentos preenchidos ou o conteúdo do arquivo CNAB/RCB gerado nunca saem da máquina do usuário, nem para servidor próprio nem para analytics de terceiros. O único analytics do produto é o Netlify Analytics (server-side, sem cookies, sem JS de tracking no cliente — ver [ADR-007](docs/adr/ADR-007-analytics-netlify-analytics.md)); ele mede tráfego de infraestrutura, não conteúdo digitado. Também não há `localStorage`, `sessionStorage` ou cookies guardando dados de formulário. O componente `PrivacyBadge` (US20) comunica essa garantia de forma persistente na UI, mas a garantia de verdade está em não existir rota de rede para vazar isso — enforcement nesta fase é por disciplina de código, não por CSP restritivo automatizado.

Traduzindo: você pode colar CPF de teste, valor de tarifa e nome de favorecido à vontade que ninguém vê nada. Nem nós. Nem o Google. Nem aquele estagiário que ficou de olho no seu monitor. E se você for contribuir com um PR: **não introduza libs de tracking com payload** (SDKs de analytics client-side, error trackers que enviam contexto de formulário, chat widgets com telemetria etc.) — revise o `package.json` do seu PR pensando nisso antes de pedir review.

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
