# Tracker Pro
Tracking de leads e vendas originadas em anúncios e fechadas pelo WhatsApp Business com Leona Flow.

## Fluxo
Meta Ads → link rastreável Tracker Pro → WhatsApp Business/Leona → Pix na chave própria → confirmação no Leona → webhook → venda no Tracker Pro.

## Implementado no repositório
- Dashboard e histórico de vendas.
- Cadastro de leads pelo redirecionador `/go/whatsapp`.
- Identificador único `tracking_id` incluído na mensagem pré-preenchida do WhatsApp.
- Captura de UTMs, `ad_id` e `fbclid` no lead.
- Tela de leads e status (novo, atendimento, aguardando Pix, pago, perdido).
- Endpoint para eventos da Leona em `POST /api/webhooks/leona`.
- Proteção por `x-webhook-secret` e deduplicação de vendas por pedido.
- PostgreSQL via Prisma; memória local somente para testes.

## Configuração
Node.js 20.9+ e PostgreSQL:
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```
Configure `DATABASE_URL`, `WEBHOOK_SECRET`, `NEXT_PUBLIC_TRACKING_ORIGIN` e `WHATSAPP_NUMBER` (DDI + DDD + número, somente dígitos).

## Link de anúncio
Use um link por campanha/anúncio:
```
https://SEU-DOMINIO.com/go/whatsapp?utm_source=facebook&utm_medium=paid_social&utm_campaign=campanha_x&utm_content=anuncio_01
```
O redirecionador cria um lead e abre o WhatsApp com a referência `tp_...` no texto. O cliente precisa enviar a mensagem para que a referência chegue à Leona. Se a pessoa apagar a referência, a atribuição individual pode se perder.

## Contrato de webhook para configurar na Leona
Endpoint: `https://SEU-DOMINIO.com/api/webhooks/leona`
Método: `POST`
Header: `x-webhook-secret: VALOR_DE_WEBHOOK_SECRET`
Content-Type: `application/json`

Quando o lead entrar em atendimento, a automação pode enviar:
```json
{"event_type":"LEAD_UPDATED","tracking_id":"tp_ID","name":"Nome do contato","phone":"5511999999999"}
```

Quando o bot gerar/solicitar o Pix:
```json
{"event_type":"PAYMENT_REQUESTED","tracking_id":"tp_ID","amount":9.90}
```

Somente depois de a Leona confirmar o pagamento:
```json
{"event_type":"PAYMENT_CONFIRMED","tracking_id":"tp_ID","order_id":"pedido_unico_123","amount":9.90,"payment_reference":"id_transacao_pix","product_name":"Nome do produto"}
```

Em caso de estorno:
```json
{"event_type":"PAYMENT_REFUNDED","tracking_id":"tp_ID","order_id":"pedido_unico_123","amount":9.90}
```

**Mapeamento:** substitua os exemplos pelos campos/variáveis que o construtor de fluxo da Leona realmente disponibilizar. O nome do campo da referência deve conter o `tracking_id` recebido na mensagem. O evento `PAYMENT_CONFIRMED` exige `tracking_id`, `order_id` único e `amount`. Não invente nomes de variáveis da Leona; valide no construtor ou com o suporte.

## Segurança e limitações
- A página pública do Leona Flow descreve webhooks, HTTP Request e ações após confirmação Pix. O endpoint deste projeto segue um contrato próprio; a configuração/mapeamento dentro da Leona ainda precisa ser feita e testada.
- O Tracker Pro não valida comprovantes por conta própria. Confie apenas no evento final da automação após sua regra de confirmação, e teste com pagamentos reais de baixo valor antes de usar em escala.
- Sem autenticação de painel, não exponha o dashboard publicamente em produção. Use HTTPS, autenticação, rate limiting e segredo forte.
- Dados em memória desaparecem ao reiniciar; configure PostgreSQL.
- Minimize dados pessoais e cumpra a LGPD.
