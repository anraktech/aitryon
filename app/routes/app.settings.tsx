import { useState, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  Text,
  Banner,
  Link,
  InlineStack,
  Box,
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { CheckIcon, AlertCircleIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const settings = await prisma.shopSettings.findUnique({
    where: { shop: session.shop },
  });
  
  const analytics = await prisma.aITryOnAnalytics.findFirst({
    where: { shop: session.shop },
  });
  
  return json({ 
    settings, 
    analytics,
    shop: session.shop 
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const openRouterKey = formData.get("openRouterKey") as string;
  
  await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    update: { openRouterKey },
    create: { 
      shop: session.shop, 
      openRouterKey 
    },
  });
  
  return json({ success: true });
};

export default function Settings() {
  const { settings, analytics, shop } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [apiKey, setApiKey] = useState(settings?.openRouterKey || "");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const isLoading = fetcher.state === "submitting";
  
  useEffect(() => {
    if (fetcher.data?.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [fetcher.data]);
  
  const handleSave = () => {
    fetcher.submit(
      { openRouterKey: apiKey },
      { method: "POST" }
    );
  };
  
  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };
  
  return (
    <Page>
      <TitleBar title="AI Try-On Settings">
        <button onClick={() => window.location.href = "/app"}>
          Back to Dashboard
        </button>
      </TitleBar>
      
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {showSuccess && (
              <Banner
                tone="success"
                icon={CheckIcon}
                onDismiss={() => setShowSuccess(false)}
              >
                Settings saved successfully!
              </Banner>
            )}
            
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingLg">
                    OpenRouter API Configuration
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Configure your OpenRouter API key to enable AI try-on features
                  </Text>
                </BlockStack>
                
                <BlockStack gap="400">
                  <Banner tone="critical" icon={AlertCircleIcon}>
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        ⚠️ IMPORTANT: You MUST recharge your OpenRouter account with at least $5 for the app to work!
                      </Text>
                      <Text as="p" variant="bodyMd">
                        Many users create API keys but forget to add credits. Without credits, all AI try-on requests will fail. 
                        After creating your API key, visit <Link url="https://openrouter.ai/credits" target="_blank">OpenRouter Credits</Link> to add at least $5.
                      </Text>
                    </BlockStack>
                  </Banner>
                  
                  <Banner tone="info">
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd">
                        To get your OpenRouter API key:
                      </Text>
                      <ol style={{ marginLeft: "20px", marginTop: "8px" }}>
                        <li>Visit <Link url="https://openrouter.ai" target="_blank">OpenRouter.ai</Link></li>
                        <li>Sign up or log in to your account</li>
                        <li>Navigate to API Keys section</li>
                        <li>Create a new API key</li>
                        <li><strong>Add at least $5 in credits</strong></li>
                        <li>Copy and paste the API key here</li>
                      </ol>
                    </BlockStack>
                  </Banner>
                  
                  <TextField
                    label="OpenRouter API Key"
                    type="password"
                    value={apiKey}
                    onChange={setApiKey}
                    placeholder="sk-or-v1-..."
                    helpText="Your API key will be securely stored and used for AI image generation. Remember: You must add at least $5 in credits to your OpenRouter account!"
                    autoComplete="off"
                  />
                  
                  {settings?.openRouterKey && (
                    <Box background="bg-surface-secondary" padding="300" borderRadius="200">
                      <InlineStack gap="200" align="center">
                        <Icon source={CheckIcon} tone="success" />
                        <Text as="span" variant="bodySm">
                          Current key: {maskApiKey(settings.openRouterKey)}
                        </Text>
                      </InlineStack>
                    </Box>
                  )}
                  
                  <InlineStack gap="300">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      loading={isLoading}
                      disabled={!apiKey || apiKey === settings?.openRouterKey}
                    >
                      Save API Key
                    </Button>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  AI Try-On Analytics
                </Text>
                
                <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Successful Generations
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="semibold" tone="success">
                        {analytics?.successful || 0}
                      </Text>
                    </InlineStack>
                    
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Failed Generations
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="semibold" tone="critical">
                        {analytics?.failed || 0}
                      </Text>
                    </InlineStack>
                    
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Success Rate
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="semibold">
                        {analytics && (analytics.successful + analytics.failed) > 0
                          ? `${Math.round((analytics.successful / (analytics.successful + analytics.failed)) * 100)}%`
                          : "N/A"}
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
                
                <Banner tone="warning" icon={AlertCircleIcon}>
                  <Text as="p" variant="bodyMd">
                    <strong>Credit Monitoring:</strong> Always ensure your OpenRouter account has sufficient credits (minimum $5 recommended). 
                    Failed generations often occur due to insufficient credits, not app issues. 
                    Visit your <Link url="https://openrouter.ai/credits" target="_blank">OpenRouter dashboard</Link> to check remaining credits.
                  </Text>
                </Banner>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Important Information
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" fontWeight="semibold" tone="critical">
                    • 🚨 CRITICAL: Add at least $5 in credits to your OpenRouter account or the app will NOT work
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Each AI try-on generation consumes OpenRouter credits (approximately $0.10-$0.20 per generation)
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Most support requests are due to insufficient credits, not app bugs
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Analytics are updated in real-time as customers use the feature
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Failed generations may occur due to insufficient credits, invalid images, or API limits
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}