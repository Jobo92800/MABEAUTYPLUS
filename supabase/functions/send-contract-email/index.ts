import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailPayload {
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  centerName: string;
  centerEmail: string;
  pdfBase64: string;
  signatureDate: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: EmailPayload = await req.json();
    const { clientEmail, clientFirstName, clientLastName, centerName, centerEmail, pdfBase64, signatureDate } = payload;

    const fileName = `Contrat_MAbeautyplus_${clientLastName}_${clientFirstName}_${signatureDate.replace(/\s/g, '_')}.pdf`;

    const resendPayload = {
      from: "MAbeautyplus <onboarding@resend.dev>",
      reply_to: centerEmail,
      to: [clientEmail],
      subject: `Votre contrat MAbeautyplus ${centerName} — signé le ${signatureDate}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: linear-gradient(135deg, #1a6b9a 0%, #1a4a7a 100%); padding: 32px 40px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 400; letter-spacing: 0.03em;">MAbeautyplus</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0 0; font-size: 14px;">Centre ${centerName}</p>
          </div>
          <div style="background: #ffffff; padding: 36px 40px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; margin: 0 0 16px 0;">Bonjour <strong>${clientFirstName} ${clientLastName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
              Nous vous confirmons la signature de votre contrat de prestation de services MAbeautyplus en date du <strong>${signatureDate}</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
              Votre contrat signé est joint à cet email en pièce jointe au format PDF. Nous vous recommandons de le conserver précieusement.
            </p>
            <div style="background: #f0f7ff; border-left: 4px solid #1a6b9a; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 0 0 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #1a4a7a; line-height: 1.5;">
                Pour toute question relative à votre programme, n'hésitez pas à contacter votre centre directement.
              </p>
            </div>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 8px 0;">À très bientôt,</p>
            <p style="font-size: 15px; font-weight: 700; margin: 0; color: #1a6b9a;">L'équipe MAbeautyplus ${centerName}</p>
          </div>
          <div style="background: #f9fafb; padding: 16px 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">MAbeautyplus — ${centerEmail}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resData = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: resData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
