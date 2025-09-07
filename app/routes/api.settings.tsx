import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    
    const settings = await prisma.shopSettings.findUnique({
      where: { shop: session.shop },
    });
    
    return json({ 
      openRouterKey: settings?.openRouterKey || null,
      shop: session.shop
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
};