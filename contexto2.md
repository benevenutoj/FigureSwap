



# CONTEXT.md

## Visão Geral do Produto

Este projeto é uma plataforma web para troca de figurinhas repetidas do álbum da Copa do Mundo entre colecionadores.

A plataforma permite que usuários:

* Cadastrem seu deck inicial
* Gerenciem suas figurinhas possuídas e desejadas
* Busquem usuários que possuam cartas específicas
* Realizem ofertas de troca formais dentro da plataforma
* Entrem em contato via WhatsApp
* Confirmem trocas realizadas
* Mantenham inventário sincronizado automaticamente

A aplicação deve ser **mobile-first**, responsiva e preparada para produção.

---

## Objetivos do Produto

1. Centralizar o processo de troca de figurinhas em uma única plataforma
2. Maximizar liquidez de trocas entre usuários
3. Facilitar busca por cartas específicas
4. Permitir negociação flexível de ofertas
5. Criar confiança através de reputação e histórico
6. Monetizar matching inteligente e conveniência premium

---

## Natureza do Produto

Este sistema deve ser tratado como um:

```text
Marketplace Assistido de Trocas
```

E NÃO como um sistema de matching bilateral perfeito.

---

## Stack Tecnológica

### Frontend

* Next.js 15+ App Router
* TypeScript
* TailwindCSS
* shadcn/ui

### Backend

* Next.js Route Handlers / Server Actions

### Banco/Auth

* Supabase
* PostgreSQL
* Supabase Auth com Google OAuth

### Infra

* Vercel

---

## Regras de Cadastro / Onboarding

Todo usuário deve obrigatoriamente informar:

* Nome
* Estado (UF)
* Cidade
* WhatsApp
* Deck inicial

---

## Regras de Localização

### Estado/Cidade

* Cadastro deve usar picklists dependentes
* Todos os estados do Brasil
* Todas as cidades do Brasil

---

### Geolocalização Opcional

Se viável:

* Usuário pode compartilhar localização precisa
* Sistema deve armazenar latitude/longitude
* Distância em KM pode ser exibida entre usuários

Arquitetura deve estar preparada para isso.

---

## Regras de Inventário

Cada usuário mantém:

* Figurinhas possuídas
* Quantidade possuída
* Figurinhas desejadas

Modelo obrigatório:

* `owned_quantity`
* `reserved_quantity`
* `available_quantity`

Onde:

```text
available_quantity = owned_quantity - reserved_quantity
```

---

## Regras de Oferta de Troca

### Elegibilidade de Oferta

Usuário só pode ofertar para troca cartas com:

```text
owned_quantity >= 2
```

---

### Fluxo de Oferta

Usuário pode:

1. Buscar carta específica desejada
2. Ver quem possui essa carta
3. Selecionar cartas próprias para ofertar em troca
4. Enviar proposta mesmo sem matching perfeito bilateral

---

## Matching / Busca

### Matching Não Requer Reciprocidade Perfeita

O sistema NÃO deve exigir:

```text
"A tem algo que B quer E B tem algo que A quer"
```

como única forma de matching.

---

### Matching Deve Suportar

1. Busca por carta específica
2. Listagem de usuários que possuem a carta
3. Sugestão de possíveis ofertas compatíveis
4. Matching parcial / unilateral

---

### Ordenação de Matching

Resultados devem priorizar:

1. Usuários mais próximos
2. Premium users
3. Melhor reputação
4. Maior compatibilidade de troca

---

## Regras Premium / Monetização

### Matching Inteligente é Premium

Sistema avançado de matching deve ser exclusivo para premium.

---

### Free Users

Usuários gratuitos possuem:

* Busca manual de cartas
* Visualização de usuários com carta
* Limites operacionais básicos

---

### Venda de Packs de Figurinhas / Afiliados

A plataforma deve possuir uma área dedicada para compra de packs de figurinhas.

Objetivo

Monetizar através de redirecionamento afiliado para produtos no Mercado Livre.

Packs Disponíveis

Os packs devem representar múltiplos de envelopes de 7 figurinhas:

21 figurinhas
49 figurinhas
105 figurinhas
210 figurinhas
350 figurinhas

Comportamento Esperado

Usuário poderá:

Selecionar um pack desejado
Ser redirecionado para link específico de produto no Mercado Livre
Requisitos Técnicos
Links devem ser administráveis via painel admin
Cada pack deve possuir URL configurável
Sistema deve permitir futura alteração de preços/links sem deploy
Tracking de clique deve ser registrado para analytics
Regras de UX
Área deve ser apresentada como complemento ao fluxo principal
Não deve competir visualmente com a funcionalidade core de trocas
Pode haver destaque/desconto visual para usuários premium

---

### Sistema de Créditos / Re-roll

Novos usuários recebem:

```text
5 créditos de re-roll
```

---

### Referral Program

Para cada usuário indicado que:

1. Se cadastra
2. Completa perfil
3. Preenche deck inicial

Usuário ganha:

```text
+2 créditos de re-roll
```

---

## Regras de Trade

### Fluxo Formal

1. Usuário propõe troca
2. Usuário destino aceita/recusa
3. Negociação via WhatsApp
4. Trade marcada como agendada
5. Sistema reserva inventário
6. Usuário marca como realizada
7. Outro confirma
8. Sistema movimenta inventário
9. Libera avaliações

---

## Regras de Reserva

### Trigger

Reserva ocorre somente em:

```text
Trade Agendada
```

---

### Expiração

Reservas expiram em:

```text
48h
```

---

## Sistema de Reputação

Usuários podem avaliar apenas:

```text
Trades concluídas
```

---

## Premium Badge / Destaque Visual

Ao listar cartas/ofertas de usuários premium:

* Exibir badge premium
* Aplicar fundo/estilo diferenciado no card/listagem

---

## Painel Administrativo

Aplicação deve possuir painel admin interno protegido por role.

Admin pode:

* Alterar imagem/fundo de cartas
* Gerenciar catálogo base
* Gerenciar configurações de plataforma
* Gerenciar usuários se necessário

---

## Princípios de UX

### Mobile First

Uso principal esperado via celular.

---

### Transparência

Sempre exibir:

* Itens reservados
* Distância/localização
* Premium badges
* Status de trade
* Próxima ação esperada

---

## Restrições Técnicas

* Não usar matching O(n²)
* Não tratar inventário como CRUD simples
* Toda lógica crítica server-side
* Operações transacionais obrigatórias
* Implementação production-grade

---

## Objetivo Atual do Projeto

Entregar uma versão MVP:

```text
Hospedada
Funcional
Acessível via Web
Pronta para validação real com usuários
```

Priorizar sempre:

1. Time-to-market
2. Solidez arquitetural mínima necessária
3. Boa UX
4. Capacidade de iteração rápida
