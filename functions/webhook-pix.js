// Pages Function: /webhook-pix
// Rota: POST /webhook-pix
// Recebe notificações da PushinPay quando um PIX é pago.

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    console.log("Webhook recebido da PushinPay:", JSON.stringify(body));

    // A PushinPay envia algo como:
    // { "id": "uuid-da-transacao", "status": "paid", "value": 4990, ... }
    // status pode ser: "pending", "paid", "expired", etc.

    if (body.status === "paid") {
      // ===== AQUI VOCÊ PROCESSA O PAGAMENTO CONFIRMADO =====
      // Exemplos do que fazer:
      // - Ativar a conta do usuário no banco de dados
      // - Enviar email de confirmação
      // - Liberar acesso ao conteúdo
      // - Salvar em KV, D1, etc.
      console.log(`Pagamento confirmado! ID: ${body.id}, Valor: ${body.value}`);
    }

    // Sempre responder 200 para a PushinPay saber que recebemos
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
