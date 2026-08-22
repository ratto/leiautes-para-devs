# Leiautes Para Devs

Gerador de arquivos CNAB/RCB no navegador para testes de integração bancária. Zero backend, zero persistência, LGPD by design.

Ver [docs/PRD_Leiautes_Para_Devs.md](docs/PRD_Leiautes_Para_Devs.md) e [docs/HLD_Leiautes_Para_Devs.md](docs/HLD_Leiautes_Para_Devs.md).

## Stack

Quasar 3 · Vue 3 · TypeScript · Vite · Pinia · Vue Router · SCSS · ESLint + Prettier.

## Scripts

```bash
npm install           # instala dependências
npm run dev           # dev server (http://localhost:9000)
npm run build         # build de produção (dist/spa)
npm run lint          # lint + format
npm run lint:check    # apenas checa lint/format
```

## Estrutura

```
src/
├── layouts/
│   ├── MainLayout.vue    # shell Quasar (toolbar + router-view)
│   └── cnab240/          # spec de campos CNAB240 (a implementar)
├── stores/               # Pinia stores (a implementar)
├── utils/                # validation, masks, serializer (a implementar)
├── pages/
│   ├── LandingPage.vue   # rota /
│   └── Cnab240Page.vue   # rota /cnab-240
├── router/
└── css/
    ├── app.scss          # importa tokens
    └── tokens.scss       # design tokens --lpd-* (dark + light)
```

Design tokens em [docs/design system/Design_System_Leiautes_Para_Devs.md](docs/design%20system/Design_System_Leiautes_Para_Devs.md).
