import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

// Fal AI Configuration
const FAL_API_KEY = "384bc934-d134-49d4-b21a-ecb53da57f97:65965dd6bc331a5ed556047ba323f80c";
const FAL_MODEL = "fal-ai/kling/v1-5/kolors-virtual-try-on";

// CORS headers for app proxy requests
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Content-Type": "application/json",
};

// Helper to create JSON response with CORS headers
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

// Handle GET requests - health check OR status polling
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const requestId = url.searchParams.get("request_id");

  // Handle OPTIONS for CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // If request_id is provided, check status
  if (requestId) {
    console.log("[TRYON] Checking status for request:", requestId);

    try {
      const statusResponse = await fetch(
        `https://queue.fal.run/${FAL_MODEL}/requests/${requestId}/status`,
        {
          headers: {
            "Authorization": `Key ${FAL_API_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        return jsonResponse({
          status: "error",
          error: "Failed to check status"
        }, 500);
      }

      const status = await statusResponse.json();
      console.log("[TRYON] Status response:", status);

      if (status.status === "COMPLETED") {
        // Fetch the result
        const resultResponse = await fetch(
          `https://queue.fal.run/${FAL_MODEL}/requests/${requestId}`,
          {
            headers: {
              "Authorization": `Key ${FAL_API_KEY}`,
            },
          }
        );

        if (resultResponse.ok) {
          const result = await resultResponse.json();
          const imageUrl = result.image?.url;

          if (imageUrl) {
            return jsonResponse({
              status: "completed",
              success: true,
              imageUrl: imageUrl,
              image: result.image
            });
          }
        }

        return jsonResponse({
          status: "error",
          error: "Failed to get result"
        }, 500);
      } else if (status.status === "FAILED") {
        return jsonResponse({
          status: "failed",
          error: status.error || "Processing failed"
        }, 500);
      } else {
        // Still processing (IN_QUEUE or IN_PROGRESS)
        return jsonResponse({
          status: "processing",
          queue_position: status.queue_position
        });
      }
    } catch (error) {
      console.error("[TRYON] Status check error:", error);
      return jsonResponse({
        status: "error",
        error: "Status check failed"
      }, 500);
    }
  }

  // Default health check response
  return jsonResponse({
    status: "ok",
    service: "AI Try-On API",
    model: FAL_MODEL,
    provider: "Fal AI",
  });
};

// Handle POST requests - submit job and return immediately
export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("[TRYON] Action called, method:", request.method);

  // Handle OPTIONS for CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Parse the request body
    let body: { userPhotoUrl?: string; productImageUrl?: string };

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = {
        userPhotoUrl: formData.get("userPhotoUrl")?.toString(),
        productImageUrl: formData.get("productImageUrl")?.toString(),
      };
    } else {
      try {
        const text = await request.text();
        body = JSON.parse(text);
      } catch {
        return jsonResponse({ error: "Invalid request body" }, 400);
      }
    }

    const { userPhotoUrl, productImageUrl } = body;

    // Validate required fields
    if (!userPhotoUrl || !productImageUrl) {
      return jsonResponse({
        error: "Missing required fields: userPhotoUrl and productImageUrl are required"
      }, 400);
    }

    console.log("[TRYON] Submitting job with:", {
      userPhotoUrl: userPhotoUrl.substring(0, 50) + "...",
      productImageUrl: productImageUrl.substring(0, 50) + "..."
    });

    // Submit to Fal AI queue and return immediately
    const falResponse = await fetch(`https://queue.fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        human_image_url: userPhotoUrl,
        garment_image_url: productImageUrl,
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error("[TRYON] Fal AI queue submission failed:", falResponse.status, errorText);
      return jsonResponse({
        error: "Failed to submit to AI service",
        details: errorText
      }, 500);
    }

    const queueResult = await falResponse.json();
    console.log("[TRYON] Queue submission result:", queueResult);

    const requestId = queueResult.request_id;

    if (!requestId) {
      return jsonResponse({
        error: "Failed to get request ID from AI service"
      }, 500);
    }

    // Return immediately with the request_id for polling
    return jsonResponse({
      status: "submitted",
      request_id: requestId,
      message: "Job submitted successfully. Poll for status using request_id."
    });

  } catch (error) {
    console.error("[TRYON] API error:", error);
    return jsonResponse({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
};
