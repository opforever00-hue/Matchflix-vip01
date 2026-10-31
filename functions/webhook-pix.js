export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    console.log("Webhook recebido da PushinPay:", JSON.stringify(body));

    if (body.status === "paid") {
      console.log(`Pagamento confirmado! ID: ${body.id}, Valor: ${body.value}`);
    }

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
}
