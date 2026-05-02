# CONTEXT.md

## Visão Geral do Produto

Este projeto é uma plataforma web para troca de figurinhas repetidas do álbum da Copa do Mundo entre colecionadores.

A plataforma permite que usuários:

* Cadastrem quais figurinhas possuem
* Cadastrem quais figurinhas ainda precisam
* Encontrem colecionadores compatíveis para troca
* Proponham trocas formais dentro da plataforma
* Gerenciem e confirmem trocas realizadas
* Mantenham seu álbum/inventário atualizado automaticamente

A aplicação deve ser **mobile-first**, responsiva e preparada para produção.

---

## Objetivos do Produto

1. Centralizar o processo de troca de figurinhas em uma única plataforma
2. Facilitar o matching entre colecionadores compatíveis
3. Reduzir a dependência de grupos desorganizados de WhatsApp/Facebook
4. Criar confiança entre usuários através de reputação e histórico
5. Automatizar e manter consistência do inventário dos usuários

---

## Público-Alvo

Colecionadores que desejam completar o álbum da Copa do Mundo de forma mais eficiente.

---

## Stack Tecnológica

### Frontend

* Next.js 15+ App Router
* TypeScript
* TailwindCSS
* shadcn/ui

### Backend

* Next.js Route Handlers / Server Actions

### Banco de Dados / Auth

* Supabase
* PostgreSQL
* Supabase Auth com Google OAuth

### Jobs / Processamento Assíncrono

* Supabase Cron / Edge Functions

### Deploy / Infra

* Vercel

### Monitoramento / Analytics

* Sentry
* PostHog

---

## Princípios de Arquitetura

### Tratar como Marketplace, Não CRUD

Este projeto **NÃO** deve ser tratado como um CRUD simples.

O sistema deve ser arquitetado como um marketplace transacional contendo:

* Matching engine
* Sistema de reservas de inventário
* Fluxo formal de trocas
* Sistema de reputação
* Proteções anti-abuso

---

## Restrições de Performance

### Matching Engine

* NUNCA usar matching O(n²) em memória
* Matching deve ser feito via SQL otimizado / índices
* Preferir estratégias de cache/pré-processamento quando necessário

### Inventário

* Operações de inventário devem ser transacionais (ACID)
* Evitar race conditions / double spending de inventário

---

## Requisitos Obrigatórios de Perfil

Todo usuário deve obrigatoriamente informar:

* Nome
* Estado (UF)
* Cidade
* WhatsApp

Essas informações são obrigatórias porque:

* Matching depende de proximidade geográfica
* Usuários entram em contato via WhatsApp

---

## Regras de Inventário

Cada usuário mantém:

* Figurinhas possuídas
* Quantidade possuída
* Figurinhas desejadas

O modelo de inventário deve suportar:

* `owned_quantity`
* `reserved_quantity`
* `available_quantity = owned_quantity - reserved_quantity`

---

## Lógica de Matching

Existe match quando:

* Usuário A possui figurinha repetida que Usuário B deseja
* E Usuário B possui figurinha repetida que Usuário A deseja

Matching deve suportar filtros por:

* Estado
* Cidade

A arquitetura deve estar preparada para suportar filtragem por distância futuramente.

---

## Fluxo de Trocas

### Fluxo Formal de Trade

1. Usuário A propõe troca para Usuário B
2. Usuário B aceita ou rejeita
3. Usuários negociam externamente via WhatsApp
4. Um usuário marca troca como **Agendada**
5. Sistema reserva inventário de ambos
6. Um usuário marca troca como **Realizada**
7. Outro usuário confirma
8. Sistema movimenta inventário
9. Avaliação é liberada

---

## Regras de Reserva de Inventário

### Momento da Reserva

Reserva ocorre SOMENTE quando a troca é marcada como **Agendada**

### Comportamento da Reserva

* Figurinhas reservadas ficam indisponíveis para outras trocas
* Reserva expira automaticamente após 48h se não concluída
* Reservas expiradas liberam inventário automaticamente

---

## Status de Troca

### Status Internos de Backend

* `pending`
* `accepted`
* `rejected`
* `scheduled`
* `awaiting_confirmation`
* `completed`
* `cancelled`
* `expired`

### Frontend

Os status devem ser traduzidos para labels amigáveis ao usuário.

---

## Modelo de Monetização

### Plano Gratuito

* Matching básico
* Visualização de matches
* Limite diário de contatos via WhatsApp
* Limite mensal de propostas de troca

### Plano Premium

* Contatos ilimitados
* Propostas ilimitadas
* Relatórios automáticos de matching
* Badge premium
* Destaque no ranking

---

## Segurança / Anti-Abuso

Implementar obrigatoriamente:

* Rate limiting
* Proteção anti-spam
* Proteção contra scraping de WhatsApp
* Auth guards
* RLS Policies no Supabase
* Controle de limites por plano

---

## Princípios de UX

### Mobile First

Uso principal esperado em dispositivos móveis.

### Baixa Fricção

Fluxos devem minimizar quantidade de passos.

### Transparência

Sempre exibir claramente:

* Inventário reservado
* Expiração de reserva
* Status da troca
* Confirmações pendentes

---

## Diretrizes de Código

### Gerais

* Tipagem forte em toda aplicação
* Validação server-side obrigatória
* Validação client-side para UX
* Tratar loading/error/empty states
* Lógica de negócio crítica sempre server-side

### Qualidade

* Arquitetura modular
* Componentes reutilizáveis
* Separação clara de responsabilidades
* Estrutura de pastas escalável
* Código production-grade

---

## Expectativas Durante Implementação

Ao implementar novas features:

1. Explicar brevemente decisões arquiteturais
2. Priorizar robustez sobre atalhos
3. Justificar trade-offs quando necessário
4. Manter consistência com arquitetura existente
5. Evitar refactors desnecessários de código estável

---

## Restrições Importantes

* Não simplificar excessivamente a lógica de marketplace
* Não implementar matching ingênuo
* Não quebrar consistência transacional
* Não tratar inventário como dado estático
* Não expor dados sensíveis indevidamente

---

## Objetivo Final do Projeto

Construir este MVP como se pudesse ir para produção real.

Priorizar sempre:

1. Arquitetura correta
2. Consistência de dados
3. Escalabilidade
4. Boa experiência de usuário
5. Manutenibilidade
