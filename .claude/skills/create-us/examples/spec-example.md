---
us: US26
slug: us26-modo-noturno-automatico
priority: P2
status: Draft
date: 2026-08-30
---

# SPEC — Ativar modo noturno automaticamente conforme o horário do usuário

## Dados da SPEC

| Campo             | Valor                             |
| ----------------- | --------------------------------- |
| Número da US      | US26                              |
| Slug              | `us26-modo-noturno-automatico`    |
| Prioridade        | P2                                |
| Status            | Draft                             |
| Data de criação   | 2026-08-30                        |

---

## Contexto

O tema escuro é o padrão do produto e a US19 introduziu o toggle manual + detecção via `prefers-color-scheme`. Um perfil recorrente de usuário (dev/QA que trabalha em turnos ou home office) mantém o SO em tema único, mas gostaria que a ferramenta acompanhasse o horário do dia. Esta US resolve essa lacuna sem tocar na semântica atual do toggle nem introduzir persistência entre sessões — uma restrição arquitetural herdada da US19.

O objetivo é ergonômico: reduzir a fricção de trocar de tema à noite/manhã sem obrigar o usuário a mexer no SO. A funcionalidade é opt-in (desligada por padrão) para não surpreender quem já ajustou o tema manualmente.

---

## Escopo

### Incluso

- Controle na interface para ativar/desativar o modo noturno automático (opt-in)
- Alternância automática entre `data-theme="light"` e `data-theme="dark"` conforme janela horária local
- Sobreposição da alternância automática quando o usuário clica no toggle manual, respeitada até a próxima transição de janela
- Compatibilidade com `prefers-reduced-motion` (sem transição animada quando o usuário preferir)

### Excluído

- Configuração customizada da janela horária pelo usuário
- Persistência da preferência entre sessões
- Cálculo baseado em geolocalização (pôr do sol real)
- Transição gradual entre paletas
- Aplicação em `LandingLayout`

---

## Regras de Negócio

### RN01 — Estado inicial desativado

Ao carregar a página, o modo noturno automático inicia **sempre desativado**, coerente com a política de "nenhuma preferência persistida" da US19.

### RN02 — Janela horária padrão

Quando ativado, a alternância obedece:

- **06:00 até 17:59:59** (hora local) → `data-theme="light"`
- **18:00 até 05:59:59** (hora local) → `data-theme="dark"`

Os limites são inclusivos no início e exclusivos no fim (`[06:00, 18:00)` para claro; `[18:00, 06:00)` para escuro, considerando a virada de dia).

### RN03 — Aplicação imediata ao ativar

Ao ativar o modo noturno automático, o tema é imediatamente ajustado para o valor da janela horária corrente, mesmo que difira do tema atual.

### RN04 — Sobreposição manual respeitada até a próxima transição

Se o usuário clica no `ThemeToggle` manualmente enquanto o modo automático está ativo, o tema escolhido manualmente é preservado até que a **próxima transição de janela** aconteça (06:00 ou 18:00). Nesse momento, a alternância automática assume novamente.

### RN05 — Desativar não altera o tema atual

Ao desativar o modo noturno automático, o tema corrente é mantido. Nenhuma reversão é aplicada.

### RN06 — Sem chamadas de rede

O horário usado no cálculo vem exclusivamente do relógio local do dispositivo (`Date.now()`). Nenhuma requisição de rede é feita para determinar hora, fuso ou nascer/pôr do sol.

<!-- TODO: verify against FEBRABAN spec — não aplicável a esta US (feature de UX, não de leiaute) -->

---

## Use Cases

### UC01 — Usuário ativa o modo noturno automático durante o dia

- **Ator:** usuário
- **Precondição:** hora local = 14:00; tema atual = escuro (por escolha manual anterior); modo automático desativado
- **Fluxo principal:**
  1. Usuário clica no controle "Modo noturno automático" para ativá-lo
  2. Sistema calcula a janela corrente (14:00 → dia)
  3. Sistema aplica `data-theme="light"` imediatamente (RN03)
  4. Sistema agenda a próxima transição para 18:00
- **Postcondição:** tema claro exibido; modo automático ativo

### UC02 — Transição automática ao anoitecer

- **Ator:** relógio do dispositivo
- **Precondição:** modo automático ativo; hora atinge 18:00
- **Fluxo principal:**
  1. Sistema detecta a transição de janela
  2. Sistema aplica `data-theme="dark"`
  3. Sistema agenda a próxima transição para 06:00 do dia seguinte
- **Postcondição:** tema escuro exibido

### UC03 — Sobreposição manual durante modo automático

- **Ator:** usuário
- **Precondição:** modo automático ativo; hora = 20:00; tema atual = escuro (aplicado pelo modo automático às 18:00)
- **Fluxo principal:**
  1. Usuário clica no `ThemeToggle` para tema claro
  2. Sistema aplica `data-theme="light"` imediatamente
  3. Sistema **não cancela** o modo automático, mas registra que a próxima transição só assume tema automaticamente novamente às 06:00
- **Postcondição:** tema claro mantido até 06:00; a transição das 06:00 (que ainda seria "claro") não gera efeito visual, mas restaura o comportamento automático

### UC04 — Recarregar a página com modo automático anterior

- **Ator:** usuário
- **Precondição:** modo automático estava ativo na sessão anterior; usuário recarrega a página
- **Fluxo principal:**
  1. Sistema inicia com modo automático desativado (RN01)
  2. Tema inicial segue a lógica da US19 (prefers-color-scheme, fallback dark)
- **Postcondição:** usuário precisa reativar manualmente o modo automático se desejar

---

## Critérios de Aceitação

### CA01 — Controle visível no header

**Dado que** o usuário está em qualquer rota do App (`/cnab-240`, `/rcb-001`, `/cnab-400`)
**Quando** o `AppHeader` é renderizado
**Então** existe um controle adjacente ao `ThemeToggle` para ativar/desativar o modo noturno automático, com `aria-label` descritivo e touch target ≥ 44×44px

### CA02 — Aplicação imediata ao ativar

**Dado que** o modo automático está desativado e a hora local é 20:00
**Quando** o usuário ativa o modo
**Então** o `data-theme` é alterado para `dark` imediatamente (mesmo que já estivesse `dark`)

### CA03 — Transição automática de janela

**Dado que** o modo automático está ativo
**Quando** o relógio local atinge 06:00 ou 18:00
**Então** o `data-theme` é alterado para `light` ou `dark`, respectivamente, sem intervenção do usuário

### CA04 — Sobreposição manual

**Dado que** o modo automático está ativo e o tema atual é escuro (janela noturna)
**Quando** o usuário clica no `ThemeToggle` para tema claro
**Então** o tema muda para claro e assim permanece até a próxima transição de janela (06:00)

### CA05 — Sem persistência

**Dado que** o modo automático estava ativo em uma sessão
**Quando** o usuário recarrega a página
**Então** o modo automático inicia desativado

### CA06 — Sem chamadas de rede

**Dado que** o modo automático está ativo
**Quando** qualquer transição automática ocorre
**Então** nenhuma requisição de rede é feita (verificável pelo DevTools → Network)

### CA07 — Respeito a prefers-reduced-motion

**Dado que** `prefers-reduced-motion: reduce` está ativo
**Quando** uma transição automática ocorre
**Então** o `data-theme` muda instantaneamente, sem animação CSS

---

## Custo da IA

| Métrica           | Valor           |
| ----------------- | --------------- |
| Tokens de entrada | ~8.500          |
| Tokens de saída   | ~2.100          |
| Custo (USD)       | ~$0,29          |
| Custo (BRL)       | ~R$1,60         |
| Modelo            | claude-opus-4-7 |

> Valores aproximados, apenas para a fase de geração do SPEC (a partir da leitura da HLD e primeira entrevista).
