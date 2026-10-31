export async function onRequestGet(context) {
  const { env } = context;

  const headers = { "Content-Type": "application/json" };

  if (!env.PUSHINPAY_TOKEN) {
    return new Response(JSON.stringify({ error: "PUSHINPAY_TOKEN não configurado" }), { status: 500, headers });
  }

  try {
    var resp = await fetch("https://api.pushinpay.com.br/api/v1/pix/cashier/create", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.PUSHINPAY_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: 100 }),
    });

    var text = await resp.text();

    return new Response(JSON.stringify({
      status: resp.status,
      statusText: resp.statusText,
      responseHeaders: Object.fromEntries(resp.headers.entries()),
      body: text.substring(0, 2000),
      tokenPrefix: env.PUSHINPAY_TOKEN.substring(0, 10) + "..."
    }, null, 2), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }, null, 2), { status: 500, headers });
  }
}
