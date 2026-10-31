export async function onRequestGet(context) {
  const { request, env } = context;

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
    var url = new URL(request.url);
    var id = url.searchParams.get("id");
    var plan = url.searchParams.get("plan");

    if (!id) {
      return new Response(JSON.stringify({ paid: false }), { status: 200, headers: cors });
    }

    if (!env.PUSHINPAY_TOKEN) {
      return new Response(JSON.stringify({ paid: false, error: "Token não configurado" }), { status: 200, headers: cors });
    }

    // Consultar status na PushinPay
    var resp = await fetch("https://api.pushinpay.com.br/api/v1/pix/cashier/" + id, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + env.PUSHINPAY_TOKEN,
        "Content-Type": "application/json",
      },
    });

    var data = await resp.json();

    // Status "paid" = pagamento confirmado
    var isPaid = (data.status === "paid");

    if (!isPaid) {
      return new Response(JSON.stringify({ paid: false }), { status: 200, headers: cors });
    }

    // ===== PAGAMENTO CONFIRMADO — RETORNAR O CONTEÚDO =====
    // Personalize com seus links e vídeos
    var CONTENT = {
      'basico': {
        nome: 'Teste 3 Dias',
        groupLink: '', // coloque aqui o link do grupo VIP (opcional)
        content: [
          {
            titulo: 'Conteúdo Exclusivo',
            videos: [
              // 'https://exemplo.com/video1.mp4',
              // 'https://exemplo.com/video2.mp4',
            ]
          }
        ]
      },
      'vip': {
        nome: 'Acesso 30 Dias',
        groupLink: '', // coloque aqui o link do grupo VIP
        content: [
          {
            titulo: 'Conteúdo Exclusivo',
            videos: [
              // 'https://exemplo.com/video1.mp4',
              // 'https://exemplo.com/video2.mp4',
            ]
          }
        ]
      },
      'vitalicio': {
        nome: 'Acesso Vitalício',
        groupLink: '', // coloque aqui o link do grupo VIP
        content: [
          {
            titulo: 'Conteúdo Vitalício',
            videos: [
              // 'https://exemplo.com/video1.mp4',
              // 'https://exemplo.com/video2.mp4',
            ]
          }
        ]
      }
    };

    var pack = CONTENT[plan] || CONTENT['vip'];

    return new Response(JSON.stringify({
      paid: true,
      nome: pack.nome,
      groupLink: pack.groupLink,
      content: pack.content,
      plan: plan
    }), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ paid: false, error: err.message }), { status: 200, headers: cors });
  }
}
