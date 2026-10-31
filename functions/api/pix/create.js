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
    const amount = parseFloat(body.amount);

    if (!amount || amount < 0.5) {
      return new Response(
        JSON.stringify({ error: "Valor inválido. Mínimo R$ 0,50." }),
        { status: 400, headers: cors }
      );
    }

    const valueInCents = Math.round(amount * 100);

    const token = env.PUSHINPAY_TOKEN?.trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "PUSHINPAY_TOKEN não configurado" }),
        { status: 500, headers: cors }
      );
    }

    const origin = new URL(request.url).origin;

    const res = await fetch("https://api.pushinpay.com.br/api/pix/cashIn", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value: valueInCents,
        webhook_url: `${origin}/api/pix/webhook`,
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.log("PushinPay erro status:", res.status, "body:", text);
      return new Response(
        JSON.stringify({ error: "Erro na PushinPay", status: res.status, details: text }),
        { status: res.status, headers: cors }
      );
    }

    const data = JSON.parse(text);

    let qrCodeBase64 = data.qr_code_base64 || "";
    if (qrCodeBase64 && !qrCodeBase64.startsWith("data:image")) {
      qrCodeBase64 = "data:image/png;base64," + qrCodeBase64;
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        qr_code: data.qr_code,
        qr_code_base64: qrCodeBase64,
        status: data.status,
      }),
      { status: 200, headers: cors }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erro interno", message: err.message }),
      { status: 500, headers: cors }
    );
  }
}
