export async function onRequestPost(context) {
  const { request, env } = context;

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const body = await request.json();
    const plan = body.plan;

    var PACKS = {
      'basico':    { nome: 'Teste 3 Dias',    preco: 790 },
      'vip':       { nome: 'Acesso 30 Dias',  preco: 1390 },
      'vitalicio': { nome: 'Acesso Vitalício', preco: 2990 }
    };

    var pack = PACKS[plan];
    if (!pack) {
      return new Response(JSON.stringify({ error: "Plano inválido: " + plan }), { status: 400, headers: cors });
    }

    if (!env.PUSHINPAY_TOKEN) {
      return new Response(JSON.stringify({ error: "PUSHINPAY_TOKEN não configurado" }), { status: 500, headers: cors });
    }

    var resp = await fetch("https://api.pushinpay.com.br/api/v1/pix/cashier/create", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.PUSHINPAY_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: pack.preco }),
    });

    var data = await resp.json();

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "Erro na PushinPay", details: data }), { status: resp.status, headers: cors });
    }

    return new Response(JSON.stringify({
      id: data.id,
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64
    }), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erro interno", message: err.message }), { status: 500, headers: cors });
  }
}
