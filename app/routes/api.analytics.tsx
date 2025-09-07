import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    
    const analytics = await prisma.aITryOnAnalytics.findFirst({
      where: { shop: session.shop },
    });
    
    return json({ 
      successful: analytics?.successful || 0,
      failed: analytics?.failed || 0,
      shop: session.shop
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const body = await request.json();
    const { type, count = 1, source = 'product' } = body;
    
    let updateData: any = {};
    
    if (type === 'success' || type === 'homepage_success') {
      updateData.successful = { increment: count };
    } else if (type === 'failure' || type === 'homepage_failure') {
      updateData.failed = { increment: count };
    }
    
    await prisma.aITryOnAnalytics.upsert({
      where: { shop: session.shop },
      update: updateData,
      create: { 
        shop: session.shop,
        successful: type.includes('success') ? count : 0,
        failed: type.includes('failure') ? count : 0
      },
    });
    
    return json({ success: true });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return json({ error: 'Failed to update analytics' }, { status: 500 });
  }
};