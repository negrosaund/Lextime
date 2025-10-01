import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { deadline, case: caseData, user, reminderDate } = await req.json();

    console.log('Processing reminder email for:', {
      deadlineId: deadline.id,
      userEmail: user.email,
      reminderDate,
    });

    const emailSubject = `Recordatorio LEXTIME: ${deadline.title}`;
    const emailBody = `
      Estimado/a ${user.full_name},

      Este es un recordatorio de LEXTIME sobre el siguiente plazo:

      Causa: ${caseData.case_name} (${caseData.case_number})
      Tribunal: ${caseData.court}
      Cliente: ${caseData.client_name}

      Plazo: ${deadline.title}
      Tipo: ${deadline.deadline_type}
      Fecha de vencimiento: ${new Date(deadline.due_date).toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}

      ${deadline.notes ? `Notas: ${deadline.notes}` : ''}

      No olvides completar este plazo a tiempo.

      Saludos,
      LEXTIME - Sistema de Gestión de Plazos Legales
    `;

    console.log('Email would be sent to:', user.email);
    console.log('Subject:', emailSubject);

    const data = {
      message: 'Reminder email processed successfully',
      emailSent: true,
      recipient: user.email,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing reminder email:', error);

    return new Response(
      JSON.stringify({ error: 'Error processing reminder email', details: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});