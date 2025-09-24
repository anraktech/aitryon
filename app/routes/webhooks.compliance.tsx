import { type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Authenticate and validate the incoming webhook with HMAC verification
    const { topic, shop } = await authenticate.webhook(request);

    console.log(`Received compliance webhook: ${topic} for shop: ${shop}`);

    const payload = await request.json();

    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST":
        await handleCustomerDataRequest(payload);
        break;
      
      case "CUSTOMERS_REDACT":
        await handleCustomerRedact(payload);
        break;
      
      case "SHOP_REDACT":
        await handleShopRedact(payload);
        break;
      
      default:
        console.log(`Unhandled compliance webhook topic: ${topic}`);
    }

    return new Response("OK", { status: 200 });
    
  } catch (error) {
    console.error("Error processing compliance webhook:", error);
    // Always return 200 for compliance webhooks to avoid retry loops
    return new Response("OK", { status: 200 });
  }
}

// Handle customer data request (GDPR data access request)
async function handleCustomerDataRequest(payload: any) {
  console.log("Processing customer data request:", payload);
  
  const { shop_id, shop_domain, customer, orders_requested, data_request } = payload;
  
  // Log the data request for compliance tracking
  console.log(`Data request ${data_request.id} for customer ${customer.email} in shop ${shop_domain}`);
  
  // In a real implementation, you would:
  // 1. Query your database for all customer data related to the customer ID and orders
  // 2. Compile the data in a readable format 
  // 3. Send the data to the merchant via email or secure download
  
  // For now, we'll just log that we received the request
  console.log("Customer data request logged. Merchant should be contacted with customer data.");
}

// Handle customer data deletion request (GDPR erasure request)
async function handleCustomerRedact(payload: any) {
  console.log("Processing customer redact request:", payload);
  
  const { shop_id, shop_domain, customer, orders_to_redact } = payload;
  
  try {
    // Delete or anonymize customer data from our analytics table
    if (customer.email) {
      // In our case, we don't store customer emails directly in AITryOnAnalytics
      // But we should clean up any analytics data that could be tied to this customer
      console.log(`Redacting data for customer ${customer.email} in shop ${shop_domain}`);
      
      // If we had customer-specific data, we would delete it here:
      // await db.customerData.deleteMany({
      //   where: {
      //     shopDomain: shop_domain,
      //     customerId: customer.id.toString()
      //   }
      // });
    }
    
    console.log("Customer data redaction completed");
    
  } catch (error) {
    console.error("Error redacting customer data:", error);
    throw error;
  }
}

// Handle shop data deletion (app uninstall cleanup)
async function handleShopRedact(payload: any) {
  console.log("Processing shop redact request:", payload);
  
  const { shop_id, shop_domain } = payload;
  
  try {
    // Delete all shop-related data from our database
    console.log(`Redacting all data for shop ${shop_domain} (ID: ${shop_id})`);
    
    // Delete analytics data
    await db.aITryOnAnalytics.deleteMany({
      where: {
        shop: shop_domain
      }
    });
    
    // Delete shop settings
    await db.shopSettings.deleteMany({
      where: {
        shop: shop_domain
      }
    });
    
    // Delete sessions (if any remain)
    await db.session.deleteMany({
      where: {
        shop: shop_domain
      }
    });
    
    console.log(`Shop data redaction completed for ${shop_domain}`);
    
  } catch (error) {
    console.error("Error redacting shop data:", error);
    throw error;
  }
}