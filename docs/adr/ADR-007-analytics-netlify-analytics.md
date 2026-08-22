# ADR-007: Analytics via Netlify Analytics (sem cookies, LGPD-friendly)

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

O PRD define métricas de adoção para os primeiros 90 dias: visitantes únicos, downloads de arquivo gerado, estrelas e forks no GitHub. Para mensurar visitantes únicos e downloads, é necessária uma solução de analytics.

Restrições inegociáveis:

- **LGPD by design:** nenhum dado pessoal do usuário pode ser coletado ou transmitido para terceiros
- **Sem cookies:** o produto não deve usar cookies de rastreamento; o badge de privacidade ("Seus dados nunca saem do seu navegador") deve ser honesto
- **Custo zero no MVP:** o projeto é open source e independente, sem receita

O PRD originalmente citou o Plausible como solução gratuita, mas o Plausible cloud tem custo. A opção self-hosted do Plausible é gratuita, mas exige infraestrutura própria para hospedar — custo operacional incompatível com o MVP.

---

## Decisão

Analytics de pageviews e referrers são coletados via **Netlify Analytics**, incluído no plano gratuito do Netlify (ver ADR-006). Nenhum script de analytics é injetado no HTML do cliente; a coleta é feita server-side pelo Netlify a partir dos logs de acesso. Eventos customizados (ex: download de arquivo) não são rastreados na solução atual — as métricas de download serão estimadas a partir dos dados de estrelas e forks do GitHub como proxy de engajamento.

---

## Opções Consideradas

### Opção A: Netlify Analytics (escolhida)

| Dimensão             | Avaliação                                           |
| -------------------- | --------------------------------------------------- |
| Custo                | Incluído no plano gratuito do Netlify               |
| Cookies              | Nenhum — coleta server-side via logs                |
| Dados pessoais       | Nenhum — sem IP persistido, sem fingerprinting      |
| LGPD                 | Compatível                                          |
| Eventos customizados | Não suportado                                       |
| Integração           | Zero configuração — habilitado no painel do Netlify |

**Prós:**

- Zero custo adicional (já está incluso no plano Netlify escolhido na ADR-006)
- Sem script no cliente — nenhum impacto em performance ou privacidade
- Compatível com LGPD sem necessidade de banner de consentimento de cookies
- Zero configuração de código

**Contras:**

- Sem rastreamento de eventos customizados (downloads, cópias)
- Métricas limitadas a pageviews, visitantes únicos e referrers
- Dados disponíveis apenas no painel do Netlify, sem exportação

---

### Opção B: Plausible cloud (descartada)

| Dimensão             | Avaliação                    |
| -------------------- | ---------------------------- |
| Custo                | Pago (a partir de USD 9/mês) |
| Cookies              | Nenhum                       |
| Dados pessoais       | Nenhum                       |
| LGPD                 | Compatível                   |
| Eventos customizados | Suportado                    |
| Integração           | Script leve no cliente       |

**Por que descartada:** Tem custo mensal incompatível com o MVP de projeto open source sem receita. O PRD incorretamente indicou o Plausible como gratuito; a verificação confirmou que apenas o self-hosting é gratuito.

---

### Opção C: Plausible self-hosted (descartada)

| Dimensão             | Avaliação                                           |
| -------------------- | --------------------------------------------------- |
| Custo                | Gratuito (open source), mas requer servidor próprio |
| Cookies              | Nenhum                                              |
| Dados pessoais       | Nenhum                                              |
| LGPD                 | Compatível                                          |
| Eventos customizados | Suportado                                           |
| Integração           | Script no cliente + servidor Plausible próprio      |

**Por que descartada:** Requer provisionar, manter e monitorar um servidor adicional (VPS, Docker etc.), introduzindo custo operacional e complexidade que contradizem o princípio de zero infraestrutura do MVP. O ganho de eventos customizados não justifica esse overhead para a fase atual.

---

### Opção D: Umami self-hosted (descartada)

Alternativa open source ao Plausible com suporte a eventos customizados e self-hosting.

**Por que descartada:** Mesmos problemas da Opção C: exige infraestrutura própria. Avaliação idêntica em termos de custo-benefício para o MVP.

---

### Opção E: Sem analytics (considerada, não escolhida)

Métricas de adoção monitoradas exclusivamente via GitHub (estrelas, forks, tráfego do repositório).

**Por que não escolhida:** GitHub Insights oferece dados de tráfego do repositório, mas não de uso da aplicação web. Sem nenhuma métrica de visitantes únicos no app, fica impossível medir se usuários chegam ao produto e saem sem interagir com o repositório — cenário provável para QAs e analistas de implantação que não têm conta no GitHub.

A Opção A (Netlify Analytics) adiciona pageviews com zero custo e zero configuração, tornando a Opção E desnecessariamente cega.

---

## Análise de Trade-offs

O trade-off central é entre **profundidade de métricas** e **custo/complexidade**. A solução ideal para o produto seria rastrear eventos customizados (downloads, cópias, troca de modo) além de pageviews — isso permitiria medir as métricas de sucesso definidas no PRD com precisão. No entanto, todas as soluções com eventos customizados têm custo monetário (Plausible cloud) ou operacional (self-hosting).

Para o MVP, pageviews e referrers via Netlify Analytics são suficientes para validar adoção inicial. Estrelas e forks do GitHub servem como proxy para engajamento de desenvolvedores. A decisão pode ser revisada assim que o projeto tiver tráfego ou patrocínio que justifique infraestrutura adicional.

---

## Consequências

O que fica mais fácil:

- Zero configuração de código: analytics habilitado no painel do Netlify sem tocar no frontend
- Nenhum script de terceiros no cliente: sem impacto em performance, sem necessidade de banner de cookies
- Conformidade com LGPD garantida por arquitetura (coleta server-side, sem dados pessoais)

O que fica mais difícil:

- Impossível rastrear downloads e cópias como eventos individuais
- Métricas de sucesso do PRD (200 downloads) precisam ser estimadas por proxy ou medidas manualmente
- Dados disponíveis apenas no painel do Netlify, sem API de exportação no plano gratuito

O que precisará ser revisitado:

- Se o projeto receber patrocínio ou tiver necessidade de métricas mais granulares, avaliar migração para Plausible self-hosted ou cloud
- Se o Netlify mudar os termos do plano gratuito e remover o Analytics, avaliar Umami self-hosted como alternativa de menor custo operacional

---

## Itens de Ação

1. - [ ] Habilitar Netlify Analytics no painel do projeto após o primeiro deploy (ADR-006)
2. - [ ] Documentar no README que o projeto usa Netlify Analytics server-side, sem cookies, em conformidade com LGPD
3. - [ ] Registrar no backlog a adição de eventos customizados de download/cópia como item de fast follow pós-MVP, condicionado a disponibilidade de solução gratuita
