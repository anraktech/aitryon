import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Fal AI Configuration
const FAL_API_KEY = "384bc934-d134-49d4-b21a-ecb53da57f97:65965dd6bc331a5ed556047ba323f80c";
const FAL_MODEL = "fal-ai/kling/v1-5/kolors-virtual-try-on";

// CORS headers for app proxy requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight requests
export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return json(
    {
      status: "ok",
      service: "AI Try-On API",
      model: FAL_MODEL,
      provider: "Fal AI"
    },
    { headers: corsHeaders }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST requests
  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json();
    const { userPhotoUrl, productImageUrl } = body;

    // Validate required fields
    if (!userPhotoUrl || !productImageUrl) {
      return json(
        {
          error: "Missing required fields: userPhotoUrl and productImageUrl are required"
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("Processing try-on request:", {
      userPhotoUrl: userPhotoUrl.substring(0, 50) + "...",
      productImageUrl: productImageUrl.substring(0, 50) + "..."
    });

    // Call Fal AI API directly using fetch
    // Using the queue endpoint for async processing
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
      console.error("Fal AI queue submission failed:", falResponse.status, errorText);
      return json(
        {
          error: "Failed to submit to AI service",
          details: errorText
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const queueResult = await falResponse.json();
    console.log("Queue submission result:", queueResult);

    // Get the request_id from the queue response
    const requestId = queueResult.request_id;

    if (!requestId) {
      console.error("No request_id in queue response:", queueResult);
      return json(
        {
          error: "Failed to get request ID from AI service"
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Poll for result
    let result = null;
    let attempts = 0;
    const maxAttempts = 90; // 90 attempts * 2 seconds = 3 minutes max wait

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

      const statusResponse = await fetch(
        `https://queue.fal.run/${FAL_MODEL}/requests/${requestId}/status`,
        {
          headers: {
            "Authorization": `Key ${FAL_API_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error("Status check failed:", statusResponse.status);
        attempts++;
        continue;
      }

      const status = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}: Status =`, status.status);

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
          result = await resultResponse.json();
          console.log("Got result:", JSON.stringify(result).substring(0, 200));
          break;
        }
      } else if (status.status === "FAILED") {
        console.error("Fal AI processing failed:", status);
        return json(
          {
            error: "AI processing failed",
            details: status.error || "Unknown error"
          },
          { status: 500, headers: corsHeaders }
        );
      }

      attempts++;
    }

    if (!result) {
      return json(
        {
          error: "AI processing timed out. Please try again."
        },
        { status: 504, headers: corsHeaders }
      );
    }

    // Extract the image URL from the result
    // Fal AI returns: { image: { url: "...", width: ..., height: ... } }
    const imageUrl = result.image?.url;

    if (!imageUrl) {
      console.error("No image URL in result:", result);
      return json(
        {
          error: "No image generated",
          details: "The AI service did not return an image"
        },
        { status: 500, headers: corsHeaders }
      );
    }

    console.log("Successfully generated image:", imageUrl);

    return json(
      {
        success: true,
        imageUrl: imageUrl,
        image: result.image
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error("Try-on API error:", error);
    return json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers: corsHeaders }
    );
  }
};
