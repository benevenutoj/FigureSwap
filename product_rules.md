# PRODUCT_RULES.md

## Objetivo

Este documento centraliza todas as regras de negócio do produto.

Seu propósito é:

* Servir como fonte única de verdade para regras funcionais
* Facilitar implementação consistente entre frontend/backend
* Reduzir ambiguidades de produto
* Apoiar futuras refatorações e expansão de features

---

# 1. Regras de Cadastro e Perfil

## 1.1 Cadastro Obrigatório de Perfil

Todo usuário deve possuir perfil completo para utilizar a plataforma.

Campos obrigatórios:

* Nome
* Estado (UF)
* Cidade
* WhatsApp válido

---

## 1.2 Onboarding Obrigatório

Após primeiro login:

* Se perfil incompleto → usuário deve concluir onboarding antes de acessar plataforma

---

# 2. Regras de Inventário

## 2.1 Controle de Quantidade

Cada figurinha no deck deve possuir:

* `owned_quantity`
* `reserved_quantity`
* `available_quantity`

Onde:

```text id="1rjwe7"
available_quantity = owned_quantity - reserved_quantity
```

---

## 2.2 Wanted List

Usuário pode marcar figurinhas desejadas independentemente de possuir ou não a figurinha.

---

## 2.3 Restrições

* Quantidades não podem ser negativas
* reserved_quantity nunca pode exceder owned_quantity
* available_quantity nunca pode ser negativa

---

# 3. Regras de Matching

## 3.1 Critério de Match

Existe match quando:

1. Usuário A possui figurinha repetida que Usuário B deseja
2. Usuário B possui figurinha repetida que Usuário A deseja

---

## 3.2 Filtros Permitidos

Matching deve suportar:

* Estado
* Cidade

---

## 3.3 Ordenação Recomendada

Matches podem ser ordenados por:

1. Maior score de compatibilidade
2. Maior reputação
3. Maior proximidade (futuro)

---

# 4. Regras de Propostas de Troca

## 4.1 Criação de Trade

Usuário pode propor troca contendo:

* Itens ofertados
* Itens solicitados

---

## 4.2 Validação Inicial

Sistema deve validar:

* Estoque disponível suficiente
* Usuário não pode propor troca para si mesmo
* Usuário deve estar dentro dos limites do plano

---

## 4.3 Estados Possíveis da Proposta

* Pendente
* Aceita
* Rejeitada
* Cancelada

---

# 5. Regras de Reserva de Inventário

## 5.1 Momento da Reserva

Reserva ocorre SOMENTE quando trade for marcada como:

```text id="h6wo7u"
Agendada
```

---

## 5.2 Comportamento

Ao reservar:

* reserved_quantity é incrementado
* available_quantity é reduzido implicitamente

---

## 5.3 Expiração

Reserva expira automaticamente após:

```text id="hn0hx8"
48 horas
```

---

## 5.4 Expiração de Reserva

Ao expirar:

* reserved_quantity deve ser decrementado
* Trade marcada como expirada/cancelada

---

# 6. Regras de Conclusão de Trade

## 6.1 Confirmação de Troca

Fluxo:

1. Usuário A marca como realizada
2. Usuário B confirma realização

---

## 6.2 Após Dupla Confirmação

Sistema deve:

1. Debitar itens enviados
2. Adicionar itens recebidos
3. Zerar reservas correspondentes
4. Marcar trade como concluída
5. Liberar avaliações

---

# 7. Regras de Avaliação / Reputação

## 7.1 Elegibilidade

Usuário só pode avaliar:

* Trades concluídas

---

## 7.2 Limites

* Uma avaliação por usuário por trade

---

## 7.3 Estrutura Recomendada

Avaliação contém:

* Nota (1–5)
* Comentário opcional

---

# 8. Regras de Plano Gratuito

## 8.1 Limites Gratuitos

Usuário gratuito possui:

* Limite diário de contatos via WhatsApp
* Limite mensal de propostas de troca

---

## 8.2 Matching

Usuário gratuito pode:

* Visualizar matches
* Criar trades dentro dos limites

---

# 9. Regras de Plano Premium

## 9.1 Benefícios Premium

Usuário premium possui:

* Contatos ilimitados
* Propostas ilimitadas
* Relatórios automáticos de matching
* Badge premium
* Destaque no ranking

---

# 10. Regras de Ranking

## 10.1 Ranking de Maiores Trocadores

Ordenado por:

```text id="66hxln"
Quantidade de trades concluídas
```

---

## 10.2 Ranking de Melhor Reputação

Ordenado por:

```text id="fdjlwm"
Nota média de avaliação
```

Com mínimo de trades para elegibilidade.

---

# 11. Regras de Segurança / Anti-Abuso

## 11.1 Proteções Necessárias

Implementar:

* Rate limiting
* Proteção contra spam de propostas
* Proteção contra scraping de WhatsApp

---

## 11.2 Restrições de Uso

Usuário pode ser bloqueado/suspenso se:

* Abusar do sistema de propostas
* Receber múltiplas denúncias
* Tentar fraudar reputação

---

# 12. Regras de UX / Interface

## 12.1 Transparência Obrigatória

Interface deve mostrar claramente:

* Itens reservados
* Expiração de reservas
* Status atual da trade
* Próxima ação esperada do usuário

---

## 12.2 Labels Amigáveis

Status internos de backend NÃO devem ser exibidos diretamente.

Exemplo:

| Backend               | Frontend               |
| --------------------- | ---------------------- |
| pending               | Proposta enviada       |
| accepted              | Aceita                 |
| scheduled             | Agendada               |
| awaiting_confirmation | Aguardando confirmação |
| completed             | Concluída              |
| expired               | Expirada               |

---

# 13. Edge Cases Obrigatórios

## 13.1 Estoque Alterado Antes da Reserva

Se estoque ficar insuficiente antes de agendar:

* Impedir agendamento
* Solicitar revisão da proposta

---

## 13.2 Reserva Expirada Durante Negociação

* Liberar inventário automaticamente
* Notificar usuários

---

## 13.3 Usuário Some Após Trade Agendada

* Reserva expira automaticamente
* Trade é encerrada

---

# Observações Finais

Este documento deve ser atualizado sempre que novas regras de negócio forem adicionadas ou alteradas.

Nenhuma regra de negócio relevante deve existir apenas no código sem estar refletida aqui.
