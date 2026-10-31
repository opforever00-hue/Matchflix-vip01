export async function onRequestGet(context) {
  const { request, env, params } = context;

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const id = params.id;

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID não informado" }),
        { status: 400, headers: cors }
      );
    }

    const token = env.PUSHINPAY_TOKEN?.trim();
    if (!token) {
      return new Response(
        JSON.stringify({ error: "PUSHINPAY_TOKEN não configurado" }),
        { status: 500, headers: cors }
      );
    }

    const res = await fetch(`https://api.pushinpay.com.br/api/transactions/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      console.log("PushinPay status erro:", res.status, "body:", text);
      return new Response(
        JSON.stringify({ error: "Erro ao consultar", status: res.status, details: text }),
        { status: res.status, headers: cors }
      );
    }

    const data = JSON.parse(text);

    return new Response(
      JSON.stringify({
        id: data.id,
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
