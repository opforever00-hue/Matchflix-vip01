export async function onRequestGet(context) {
  const { env } = context;
  const headers = { "Content-Type": "application/json" };

  if (!env.PUSHINPAY_TOKEN) {
    return new Response(JSON.stringify({ error: "Token não configurado" }), { status: 500, headers });
  }

  var endpoints = [
    "https://api.pushinpay.com.br/api/v1/pix/cashier/create",
    "https://api.pushinpay.com.br/api/v1/pix/charge",
    "https://api.pushinpay.com.br/api/v1/pix/qrcode",
    "https://api.pushinpay.com.br/api/v1/pix/cob",
    "https://api.pushinpay.com.br/api/v1/pix",
    "https://api.pushinpay.com.br/api/v1/charges",
    "https://api.pushinpay.com.br/api/v1/charges/pix",
    "https://api.pushinpay.com.br/api/pix/cashier/create",
    "https://api.pushinpay.com.br/api/pix/charge",
    "https://api.pushinpay.com.br/api/v1/pix/payment"
  ];

  var results = [];

  for (var i = 0; i < endpoints.length; i++) {
    try {
      var resp = await fetch(endpoints[i], {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.PUSHINPAY_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: 100 }),
      });

      var text = await resp.text();
      results.push({
        url: endpoints[i],
        status: resp.status,
        body: text.substring(0, 300)
      });
    } catch (err) {
      results.push({
        url: endpoints[i],
        error: err.message
      });
    }
  }

  return new Response(JSON.stringify(results, null, 2), { status: 200, headers });
}
