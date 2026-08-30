---
us: US26
slug: us26-modo-noturno-automatico
epic: EP07 — Experiência Geral
priority: P2
status: Draft
date: 2026-08-30
author: Pedro Ratto
---

# US26 — Ativar modo noturno automaticamente conforme o horário do usuário

**Como** usuário que trabalha em turnos diferentes,
**quero** que a ferramenta alterne automaticamente entre tema claro e tema escuro conforme a hora local do meu dispositivo,
**para que** eu não precise trocar manualmente o tema toda vez que o meu ambiente de trabalho muda de luz natural.

---

## Metadados

- **Slug:** `us26-modo-noturno-automatico`
- **Status:** Draft
- **Prioridade:** P2
- **Épico:** EP07 — Experiência Geral
- **Dependências:** US19 (Alternar entre tema escuro e claro)

---

## Descrição

Complementa a US19, que hoje escolhe o tema inicial via `prefers-color-scheme` do sistema operacional. Muitos usuários mantêm o SO em um único tema o dia inteiro por preferência pessoal, mas gostariam que a ferramenta acompanhasse a **hora do dia** — escuro à noite, claro durante o dia — sem depender da configuração global do SO.

O usuário deve poder ligar/desligar o comportamento automático via um controle discreto (ex.: item no menu do toggle de tema). Quando ativo, a preferência por horário sobrepõe a preferência do SO, mas nunca a escolha manual imediata do usuário (se ele clicou no toggle depois da última alternância automática, aquele estado é respeitado até a próxima transição de janela horária).

A alternância padrão sugerida é:
- **06:00–18:00** → tema claro
- **18:00–06:00** → tema escuro

Os horários devem ser configuráveis em uma versão futura, mas o MVP desta US usa a janela fixa acima.

Coerente com a decisão de US19, **nenhuma preferência persiste entre sessões** — o comportamento automático precisa ser reativado a cada nova visita.

---

## Critérios de Aceitação

- [ ] Existe um controle na interface (posicionado próximo ao `ThemeToggle` no `AppHeader`) que ativa/desativa o modo noturno automático
- [ ] Quando ativo, o tema alterna para claro às 06:00 e para escuro às 18:00 (hora local do dispositivo)
- [ ] Quando ativo, ao carregar a página o tema inicial é escolhido conforme a janela horária corrente
- [ ] Uma alternância manual pelo `ThemeToggle` durante uma janela horária respeita a escolha do usuário até a próxima transição (ex.: usuário à noite clica para tema claro; permanece claro até 06:00, quando volta a alternar)
- [ ] A alternância automática respeita `prefers-reduced-motion` (sem transição animada quando o usuário preferir)
- [ ] O controle tem `aria-label` descritivo e touch target ≥ 44×44px em mobile
- [ ] O modo noturno automático **não persiste entre sessões** — inicia sempre desativado
- [ ] Nenhum dado é enviado a servidor externo para determinar o horário — o cálculo usa apenas `Date.now()` no cliente

---

## Fora de Escopo

- Configuração customizada da janela horária pelo usuário (adiada para US futura)
- Persistência da preferência entre sessões (mantém a decisão arquitetural da US19)
- Uso da localização geográfica para calcular pôr do sol real
- Alternância suave/gradual entre paletas (transições intermediárias)
- Aplicação da regra em `LandingLayout` — a US é escopo apenas de rotas do App

---

## Notas

- Depende de US19 estar implementada (composable `useTheme()` já expõe `themeAtivo`, `toggleTheme()` e `init()`).
- Assumir que o composable `useTheme()` ganhará um novo método público `setAutoNight(enabled: boolean)` — a interface exata será decidida no PLAN.
- Considerar se a checagem periódica é feita via `setInterval` (1 min) ou via `setTimeout` recalculado a cada transição. Decisão técnica no PLAN.

---

## Custo da IA

| Métrica            | Valor           |
| ------------------ | --------------- |
| Tokens de entrada  | ~4.200          |
| Tokens de saída    | ~950            |
| Custo (USD)        | ~$0,14          |
| Custo (BRL)        | ~R$0,77         |
| Modelo             | claude-opus-4-7 |

> Valores aproximados, apenas para esta fase de geração da User Story.
