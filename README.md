# Tracker Pro
MVP de tracking para vendas originadas em anúncios e fechadas pelo WhatsApp Business.

## Fluxo previsto
Meta Ads → link rastreável do Tracker Pro → WhatsApp Business/Leona → Pix na chave própria → confirmação confiável → venda registrada.

## Funcionalidades incluídas
- Dashboard e histórico de vendas.
- Cadastro de leads via redirecionador /go/whatsapp.
- Identificador tracking_id enviado no texto inicial da conversa.
- UTMs guardadas no lead.
- Tela de leads e status.
- Endpoint genérico POST /api/webhooks/leona para receber atualizações da Leona ou de uma automação intermediária.
- Webhook protegido por x-webhook-secret.
- PostgreSQL via Prisma; modo memória apenas para testes locais.

## Configuração
Node.js 20.9+ e PostgreSQL:
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```
Variáveis: DATABASE_URL, WEBHOOK_SECRET, NEXT_PUBLIC_TRACKING_ORIGIN e WHATSAPP_NUMBER (número com DDI e DDD, somente dígitos, sem +).

## Link de anúncio
Use:
`https://SEU-DOMINIO.com/go/whatsapp?utm_source=facebook&utm_medium=paid_social&utm_campaign=nome_da_campanha`
O link cria um lead e redireciona para wa.me com uma referência TP no texto. Use um link diferente por campanha/conjunto/anúncio e acrescente utm_content ou ad_id.

## Webhook de eventos da Leona
POST `/api/webhooks/leona`
Header `x-webhook-secret: SEU_SEGREDO`

Evento de atualização de lead:
```json
{"event_type":"LEAD_UPDATED","tracking_id":"tp_ID","name":"Cliente","phone":"5511999999999"}
```
Pagamento confirmado (somente após confirmação real do Pix):
```json
{"event_type":"PAYMENT_CONFIRMED","tracking_id":"tp_ID","order_id":"pedido_123","amount":9.90,"payment_reference":"e2e_id","product_name":"Produto"}
```
Estorno:
```json
{"event_type":"PAYMENT_REFUNDED","tracking_id":"tp_ID","order_id":"pedido_123","amount":9.90}
```

## Importante sobre Pix e Leona
A chave Pix/QR Code própria não envia confirmação automaticamente ao Tracker Pro. Para marcar PAID automaticamente, a Leona precisa disponibilizar webhook/API que informe o pagamento confirmado, ou deve existir integração com o banco/provedor que recebeu o Pix. O endpoint acima é o contrato de entrada; ainda é necessário configurar o envio no painel da Leona ou implementar um adaptador específico quando a documentação real estiver disponível. Não marque como pago com base em mensagem do comprador ou comprovante enviado por imagem.

## Limitações e segurança
- O formato genérico não significa integração nativa já validada com a Leona. O evento precisa ser mapeado e testado com a documentação real da ferramenta.
- Link de WhatsApp rastreia clique e referência incluída no texto, mas não prova que a conversa foi iniciada ou que o contato veio daquele anúncio. O lead só pode ser conciliado se a referência chegar à automação.
- Sem login, não exponha o painel publicamente em produção. Use HTTPS, autenticação, rate limiting, logs e segredo forte.
- Dados em memória desaparecem ao reiniciar; configure PostgreSQL.
- Trate dados pessoais com minimização, transparência e base legal adequada conforme LGPD.
