# ARCHITECTURE_DECISIONS.md

## Objetivo

Este documento registra decisões arquiteturais importantes tomadas durante o desenvolvimento da plataforma.

Seu propósito é:

* Documentar trade-offs técnicos
* Explicar racional de decisões estruturais
* Facilitar onboarding futuro
* Evitar rediscussões recorrentes
* Servir como referência histórica de arquitetura

---

# ADR-001 — Plataforma Construída como Marketplace Transacional

## Status

Aceito

## Contexto

Embora o produto aparente ser um CRUD de figurinhas, a lógica real envolve matching, propostas de troca, inventário mutável, reputação e reservas.

## Decisão

Arquitetar o sistema como marketplace transacional, não como CRUD simples.

## Consequências

### Positivas

* Estrutura preparada para regras complexas
* Melhor consistência de dados
* Escalabilidade funcional

### Negativas

* Maior complexidade inicial
* Mais esforço de implementação

---

# ADR-002 — Matching SQL-Based ao Invés de O(n²) em Memória

## Status

Aceito

## Contexto

Matching ingênuo comparando todos usuários entre si não escala.

## Decisão

Implementar matching via SQL/indexes/cache ao invés de loops em memória.

## Consequências

### Positivas

* Escalabilidade superior
* Menor uso de CPU da aplicação
* Melhor aproveitamento do banco relacional

### Negativas

* Queries mais complexas
* Maior cuidado com índices/performance

---

# ADR-003 — WhatsApp como Canal Externo de Negociação

## Status

Aceito

## Contexto

Usuários preferem negociar em canal familiar e instantâneo.

## Decisão

Utilizar WhatsApp como canal de comunicação externa, mantendo trade workflow interno.

## Consequências

### Positivas

* Menor complexidade de produto
* Redução de esforço de desenvolvimento
* Menor barreira de adoção

### Negativas

* Comunicação fora da plataforma
* Menor controle sobre conversão real das negociações

---

# ADR-004 — Reserva de Inventário Apenas em Trade Agendada

## Status

Aceito

## Contexto

Reservar estoque no momento do aceite gera fricção e bloqueio prematuro.

## Decisão

Reservar inventário somente quando trade for marcada como "Agendada".

## Consequências

### Positivas

* Melhor UX
* Menor bloqueio artificial de inventário
* Reserva mais alinhada à intenção real de troca

### Negativas

* Possibilidade de estoque mudar entre aceite e agendamento
* Necessidade de revalidação ao agendar

---

# ADR-005 — Expiração Automática de Reservas

## Status

Aceito

## Contexto

Reservas podem ficar presas indefinidamente se usuários abandonarem trade.

## Decisão

Reservas expiram automaticamente após 48h.

## Consequências

### Positivas

* Inventário retorna ao pool disponível
* Evita bloqueios permanentes

### Negativas

* Necessidade de jobs assíncronos/cron
* Edge cases de expiração durante negociação

---

# ADR-006 — Supabase como Backend Principal

## Status

Aceito

## Contexto

Necessidade de acelerar MVP sem sacrificar robustez.

## Decisão

Utilizar Supabase para:

* PostgreSQL
* Auth
* RLS
* Edge Functions
* Cron Jobs

## Consequências

### Positivas

* Time-to-market menor
* Infra simplificada
* Menor overhead operacional

### Negativas

* Dependência de vendor
* Algumas limitações de customização

---

# ADR-007 — Mobile-First como Estratégia de Design

## Status

Aceito

## Contexto

Uso esperado majoritariamente via celular durante trocas físicas / eventos / encontros.

## Decisão

Projetar toda UX priorizando mobile-first.

## Consequências

### Positivas

* Melhor aderência ao contexto real de uso
* Fluxos mais rápidos/simples

### Negativas

* Restrições de densidade de informação desktop-first

---

# ADR-008 — Sistema de Reputação Apenas Após Trade Confirmada

## Status

Aceito

## Contexto

Avaliações sem vínculo a trade concluída geram abuso/fraude.

## Decisão

Permitir reviews apenas após trade completed.

## Consequências

### Positivas

* Reputação mais confiável
* Redução de spam/fake reviews

### Negativas

* Menor volume de avaliações iniciais

---

# ADR-009 — Premium Não Bloqueia Core Matching

## Status

Aceito

## Contexto

Bloquear matching completo atrás de paywall reduz liquidez do marketplace.

## Decisão

Matching básico disponível gratuitamente.

Premium monetiza conveniência/volume, não acesso core.

## Consequências

### Positivas

* Melhor liquidez do marketplace
* Melhor ativação de usuários

### Negativas

* Menor monetização imediata por usuário

---

# ADR-010 — Inventário Modelado com Quantidades Mutáveis

## Status

Aceito

## Contexto

Inventário precisa suportar reservas e movimentações transacionais.

## Decisão

Modelar inventário com:

* owned_quantity
* reserved_quantity
* available_quantity derivado

## Consequências

### Positivas

* Controle preciso de estoque
* Suporte a reservas/trades concorrentes

### Negativas

* Maior complexidade de lógica transacional

---

# Template para Novas ADRs

---

# ADR-XXX — [Título da Decisão]

## Status

Proposto / Aceito / Rejeitado / Substituído

## Contexto

[Problema ou cenário que motivou a decisão]

## Decisão

[Decisão tomada]

## Consequências

### Positivas

* ...

### Negativas

* ...

---

## Observações Finais

Este documento deve ser atualizado sempre que uma decisão estrutural relevante for tomada.

Exemplos de futuras ADRs possíveis:

* Introdução de Redis para cache
* Migração de matching para background workers
* Implementação de chat interno
* Refatoração de billing real
* Estratégia de geolocalização por coordenadas
