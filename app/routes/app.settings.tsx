import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Banner,
  InlineStack,
  Box,
  Icon,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { CheckCircleIcon, AlertCircleIcon } from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const analytics = await prisma.aITryOnAnalytics.findFirst({
    where: { shop: session.shop },
  });

  return json({
    analytics,
    shop: session.shop
  });
};

export default function Settings() {
  const { analytics, shop } = useLoaderData<typeof loader>();

  const totalGenerations = (analytics?.successful || 0) + (analytics?.failed || 0);
  const successRate = totalGenerations > 0
    ? Math.round((analytics?.successful || 0) / totalGenerations * 100)
    : 0;

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
            <Banner tone="success" icon={CheckCircleIcon}>
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  ✅ AI Try-On is fully configured and ready to use!
                </Text>
                <Text as="p" variant="bodyMd">
                  No setup required from store owners. Simply add the AI Try-On button to your product pages
                  using the Theme Editor and your customers can start trying on products virtually.
                </Text>
              </BlockStack>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    Service Status
                  </Text>
                  <Badge tone="success">Active</Badge>
                </InlineStack>

                <Box background="bg-surface-secondary" padding="400" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text as="span" variant="bodyMd">
                          AI Model
                        </Text>
                      </InlineStack>
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        ANRAK AI Virtual Try-On
                      </Text>
                    </InlineStack>

                    <InlineStack align="space-between">
                      <InlineStack gap="200" blockAlign="center">
                        <Icon source={CheckCircleIcon} tone="success" />
                        <Text as="span" variant="bodyMd">
                          Status
                        </Text>
                      </InlineStack>
                      <Text as="span" variant="bodyMd" fontWeight="semibold">
                        Active
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
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
                        Total Generations
                      </Text>
                      <Text as="span" variant="headingMd" fontWeight="semibold">
                        {totalGenerations}
                      </Text>
                    </InlineStack>

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
                        {successRate}%
                      </Text>
                    </InlineStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  How It Works
                </Text>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    1. <strong>Add the Button:</strong> Go to Theme Editor → Add "AI Try-On" block to your product pages
                  </Text>
                  <Text as="p" variant="bodyMd">
                    2. <strong>Customize Style:</strong> Adjust button color, text, and font to match your brand
                  </Text>
                  <Text as="p" variant="bodyMd">
                    3. <strong>Customer Experience:</strong> Customers upload their photo and see themselves in your products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    4. <strong>Powered by AI:</strong> Advanced virtual try-on technology creates realistic previews
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Need Help?
                </Text>
                <Text as="p" variant="bodyMd">
                  If you're experiencing issues with the AI Try-On feature, contact us at{" "}
                  <strong>support@anrak.io</strong>
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
