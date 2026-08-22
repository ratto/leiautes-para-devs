# ADR-006: Deploy como SPA estático no Netlify sem funções serverless

**Status:** Aceito
**Data:** 2026-08-22
**Decisores:** Pedro Ratto

---

## Contexto

A aplicação não possui backend, banco de dados, autenticação ou qualquer lógica server-side. Todo o processamento ocorre no browser do usuário (LGPD by design, conforme ADR-001 e requisito P0 do PRD).

O produto precisa de uma plataforma de hospedagem que:

- Sirva o SPA estático gerado por `quasar build` (`dist/spa/`)
- Ofereça HTTPS por padrão
- Tenha plano gratuito adequado para um projeto open source com tráfego inicial baixo
- Permita deploy contínuo a partir do repositório GitHub
- Não introduza complexidade operacional desnecessária para um time pequeno

---

## Decisão

O SPA estático é hospedado no Netlify Free Tier. O deploy é feito via integração com GitHub (push para a branch principal dispara build e deploy automático). Nenhuma função serverless, edge function ou middleware é utilizado. O Netlify Analytics é habilitado para coleta de pageviews sem cookies (ver ADR-007).

---

## Opções Consideradas

### Opção A: Netlify (escolhida)

| Dimensão                 | Avaliação                                         |
| ------------------------ | ------------------------------------------------- |
| Custo                    | Gratuito para SPAs estáticos com tráfego moderado |
| HTTPS                    | Automático via Let's Encrypt                      |
| Deploy contínuo          | Integração nativa com GitHub                      |
| CDN                      | CDN global incluída no plano gratuito             |
| Complexidade operacional | Baixa — zero configuração de servidor             |
| Analytics integrado      | Netlify Analytics disponível (ver ADR-007)        |

**Prós:**

- Deploy em menos de 5 minutos a partir do repositório GitHub
- HTTPS, CDN e preview deployments incluídos no plano gratuito
- Sem necessidade de gerenciar infraestrutura
- Amplamente conhecido na comunidade frontend brasileira (facilita contribuições)

**Contras:**

- Plano gratuito tem limites de banda (100 GB/mês) e build minutes (300 min/mês)
- Netlify Analytics é pago separadamente (ver ADR-007)

---

### Opção B: GitHub Pages (descartada)

| Dimensão                 | Avaliação                                                    |
| ------------------------ | ------------------------------------------------------------ |
| Custo                    | Gratuito para repositórios públicos                          |
| HTTPS                    | Automático para domínios `github.io` e domínios customizados |
| Deploy contínuo          | Via GitHub Actions                                           |
| CDN                      | Limitado (Fastly, sem configuração granular)                 |
| Complexidade operacional | Baixa, mas requer configuração de GitHub Actions             |
| Analytics integrado      | Nenhum                                                       |

**Prós:**

- Completamente gratuito para repositórios públicos
- Integração nativa com o repositório GitHub sem serviço externo

**Contras:**

- GitHub Pages não suporta SPA routing nativamente (requer workaround com `404.html`)
- Sem analytics integrado; requer solução separada
- Menos flexível para configuração de headers HTTP (ex: `Cache-Control`, `X-Frame-Options`)
- O workaround de roteamento SPA (`404.html`) é frágil e dificulta futuras extensões de rota

---

### Opção C: Vercel (descartada)

| Dimensão                 | Avaliação                                        |
| ------------------------ | ------------------------------------------------ |
| Custo                    | Gratuito para projetos pessoais                  |
| HTTPS                    | Automático                                       |
| Deploy contínuo          | Integração nativa com GitHub                     |
| CDN                      | CDN global de alta performance                   |
| Complexidade operacional | Baixa                                            |
| Analytics integrado      | Vercel Analytics (freemium, com coleta de dados) |

**Por que descartada:** Vercel é tecnicamente equivalente ao Netlify para este caso de uso. A escolha do Netlify foi feita por preferência do time e pela disponibilidade do Netlify Analytics como solução de analytics sem cookies (ver ADR-007). Não há vantagem técnica que justifique migração entre as duas plataformas.

---

## Análise de Trade-offs

Para um SPA sem backend, o trade-off de plataforma de hospedagem é essencialmente entre **simplicidade operacional** e **flexibilidade**. Todas as opções avaliadas oferecem deploy simples e HTTPS gratuito.

O diferencial do Netlify neste contexto é o suporte nativo a SPA routing (via `_redirects` ou `netlify.toml`) sem workarounds, e a disponibilidade do Netlify Analytics como solução de observabilidade alinhada com a decisão de ADR-007. GitHub Pages perde pelo problema de roteamento SPA; Vercel é equivalente mas não oferece vantagem adicional.

Os limites do plano gratuito do Netlify (100 GB/mês de banda, 300 min/mês de build) são mais do que suficientes para o tráfego esperado nos primeiros 90 dias (meta de 500 visitantes únicos).

---

## Consequências

O que fica mais fácil:

- Deploy automático a cada push na branch principal sem configuração adicional
- HTTPS, CDN e SPA routing funcionam sem configuração de servidor
- Preview deployments automáticos para pull requests facilitam revisão de UI
- Nenhuma infraestrutura para gerenciar ou monitorar

O que fica mais difícil:

- Se o tráfego crescer além de 100 GB/mês de banda, será necessário migrar para plano pago ou alternativa
- Dependência de serviço externo (Netlify) para disponibilidade da aplicação

O que precisará ser revisitado:

- Avaliar migração para plano pago ou alternativa self-hosted se o tráfego ultrapassar os limites do plano gratuito
- Se o projeto ganhar patrocinadores ou receita, considerar domínio customizado (requer plano Netlify Pro ou configuração de DNS externo)

---

## Itens de Ação

1. - [ ] Criar conta no Netlify e conectar ao repositório GitHub do projeto
2. - [ ] Configurar `netlify.toml` com comando de build (`quasar build`) e diretório de publicação (`dist/spa`)
3. - [ ] Adicionar regra de redirect para SPA routing (`/* /index.html 200`) no `netlify.toml`
4. - [ ] Habilitar HTTPS automático e verificar deploy inicial antes do lançamento público
