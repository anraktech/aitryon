import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("=== WEBHOOK TEST ENDPOINT HIT ===");
  console.log("Method:", request.method);
  console.log("URL:", request.url);
  console.log("Headers:", Object.fromEntries(request.headers.entries()));
  
  try {
    const body = await request.text();
    console.log("Body:", body);
    
    return new Response("TEST OK", { 
      status: 200,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  } catch (error) {
    console.error("Error in webhook test:", error);
    return new Response("ERROR", { status: 500 });
  }
};