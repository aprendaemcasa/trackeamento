# Tracker Pro

MVP próprio de tracking de visitas e vendas.

## Implementado
- Dashboard de vendas e page views.
- Script JS com UTMs e page views.
- API POST /api/tracking.
- Webhook universal POST /api/webhooks/:provider.
- Validação com x-webhook-secret.
- Idempotência por provedor + pedido.
- Persistência PostgreSQL com Prisma; memória temporária se DATABASE_URL não estiver definida.

## Rodar
Node.js 20.9+ e PostgreSQL:

    npm install
    cp .env.example .env
    # Configure DATABASE_URL e WEBHOOK_SECRET
    npx prisma generate
    npx prisma db push
    npm run dev

Acesse http://localhost:3000.

## Instalar tracking
    <script defer src="https://SEU-DOMINIO.com/tracking.js" data-endpoint="https://SEU-DOMINIO.com/api/tracking"></script>

Captura utm_source, utm_medium, utm_campaign, utm_content, fbclid, URL, referenciador e ID aleatório local. Configure consentimento e transparência LGPD antes de ativar tracking.

## Webhook universal
POST https://SEU-DOMINIO.com/api/webhooks/cakto
Header x-webhook-secret: seu segredo

    {"event_id":"evt_123","order_id":"pedido_123","product_name":"Guia de Portão","amount":9.90,"currency":"BRL","status":"APPROVED","customer_email":"cliente@example.com","source":"facebook","campaign":"campanha_novembro","ad_id":"anuncio_03"}

Status aceitos: APPROVED, PENDING, REFUNDED, CHARGEBACK, CANCELED.

## Ainda não integrado
O endpoint aceita payload normalizado, não é integração nativa validada de Cakto/Hotmart/Kiwify. Cada adapter precisa mapear o schema e validar a assinatura oficial do provedor. Meta Ads e Conversions API ainda não estão conectadas. O painel não inventa gasto ou ROAS sem dados de anúncios.

## Segurança / limitações
- Não há login nesta entrega: mantenha deployment privado/protegido.
- Configure segredo forte, HTTPS, rate limiting, logs e retentativas antes da produção.
- Não exponha tokens no navegador.
- Valores usam Float neste protótipo; migrar para Decimal antes de operação financeira.
- Sem DATABASE_URL, dados de teste em memória desaparecem ao reiniciar.
