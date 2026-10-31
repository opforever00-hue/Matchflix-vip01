export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get("content-type") || "";
    let body;

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = Object.fromEntries(formData);
    }

    const id = body.id || body.transaction_id || body.pix_id;

    if (id) {
      const token = env.PUSHINPAY_TOKEN?.trim();
      if (token) {
        try {
          const res = await fetch(`https://api.pushinpay.com.br/api/transactions/${id}`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
            },
          });
          const data = await res.json();

          if (data.status === "paid") {
            console.log(`Pagamento confirmado! ID: ${id}`);
          }
        } catch (e) {
          console.log("Erro ao revalidar status:", e.message);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro no webhook:", err);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
