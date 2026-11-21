# Tracker Pro

Painel próprio para acompanhar leads do WhatsApp, vendas, rastreamento e desempenho de campanhas.

## Stack
- Next.js 15 / React 19 / TypeScript
- Prisma 6 + PostgreSQL
- Zod para validação de payloads

## Recursos implementados
- Dashboard com faturamento aprovado, investimento cadastrado, lucro estimado, ROAS, vendas, leads e page views.
- Cadastro de produtos com persistência no PostgreSQL.
- Cadastro manual de gastos de anúncios e análise de ROAS por campanha.
- Histórico de vendas e funil de leads.
- Link de WhatsApp rastreável em `/go/whatsapp`, com UTMs, ad_id e fbclid.
- Script `/tracking.js` para page views e atribuição básica.
- Webhook universal `/api/webhooks/{provider}`.
- Endpoint preparado para eventos da Leona em `/api/webhooks/leona`.
- Login administrativo com sessão assinada e cookie httpOnly.

## Configuração
1. Copie `.env.example` para `.env`.
2. Configure `DATABASE_URL` com um PostgreSQL.
3. Defina `ADMIN_PASSWORD` com uma senha forte e `SESSION_SECRET` com um segredo aleatório longo (32+ caracteres).
4. Defina `WEBHOOK_SECRET` para autenticar webhooks.
5. Defina `NEXT_PUBLIC_TRACKING_ORIGIN` com a URL pública e `WHATSAPP_NUMBER` com DDI + DDD + número, somente dígitos.
6. Instale dependências: `npm install`.
7. Gere o cliente e sincronize o banco: `npm run db:generate && npm run db:push`.
8. Rode localmente: `npm run dev`; em produção: `npm run build && npm start`.

## Link para anúncios
Use o padrão:
`https://SEU-DOMINIO/go/whatsapp?utm_source=facebook&utm_medium=paid_social&utm_campaign=NOME_DA_CAMPANHA&utm_content=CRIATIVO_01&ad_id=ID_DO_ANUNCIO`

O visitante é registrado como lead e o redirecionamento abre o WhatsApp com uma referência única no texto. A referência precisa voltar no evento da Leona para associar a conversa à venda.

## Webhook Leona (contrato atual do Tracker Pro)
- URL: `https://SEU-DOMINIO/api/webhooks/leona`
- Método: POST
- Cabeçalho: `x-webhook-secret: SEU_WEBHOOK_SECRET`
- Evento aceito: `PAYMENT_CONFIRMED`
- Campos mínimos: `event_type`, `tracking_id`, `order_id`, `amount`
- Campos adicionais: `event_id`, `name`, `phone`, `payment_reference`, `product_name`, `source`, `campaign`

Exemplo de payload:
```json
{
  "event_type": "PAYMENT_CONFIRMED",
  "event_id": "evt_123",
  "tracking_id": "tp_abc123",
  "order_id": "pedido_123",
  "amount": 9.90,
  "product_name": "Guia de Portão Eletrônico",
  "name": "Cliente",
  "phone": "5599999999999"
}
```

Esse é o formato esperado pelo endpoint do Tracker Pro; ainda é necessário mapear os campos disponíveis na automação da Leona e testar um evento real. A confirmação baseada em comprovante deve ser tratada como aprovação da Leona, não como confirmação bancária independente.

## Integrações externas e limites
- Meta Ads Insights e Meta Conversions API ainda não estão conectadas. Exigem app, permissões e tokens da conta.
- O gasto de anúncios pode ser lançado manualmente em Campanhas; a análise agrupa pelo nome exato de `utm_campaign`.
- Cakto, Hotmart e Kiwify ainda não têm adaptadores nativos; o webhook universal recebe um formato normalizado.
- Sem PostgreSQL, o fallback em memória é apenas para desenvolvimento e perde dados quando o processo reinicia.
- Antes de publicar, configure HTTPS, banco persistente, credenciais fortes e política de privacidade/consentimento compatível com a LGPD.
