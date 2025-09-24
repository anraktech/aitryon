import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
  ProgressBar,
  Icon,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
// import { ViewIcon, AnalyticsBarHorizontalIcon, SettingsIcon } from '@shopify/polaris-icons';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const shopify = useAppBridge();

  const goToProducts = () => {
    if (shopify && shopify.navigation) {
      shopify.navigation.navigate("shopify:admin/products");
    }
  };

  const goToStore = () => {
    window.open("https://tryitonbyanrak.myshopify.com", "_blank");
  };

  return (
    <Page>
      <TitleBar title="AI Try-On App" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  AI Try-On Extension Ready ✅
                </Text>
                <Text variant="bodyMd" as="p">
                  Your AI try-on buttons are now active on your store. Customers can upload photos and see virtual try-ons on product pages.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  🎯 Extension Status
                </Text>
                <List>
                  <List.Item>✅ Product page try-on button: Active</List.Item>
                  <List.Item>✅ Homepage personalization: Active</List.Item>
                  <List.Item>✅ Apple-style modal design: Active</List.Item>
                  <List.Item>✅ Camera functionality: Working</List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  ⚙️ API Key Setup
                </Text>
                <Text variant="bodyMd" as="p">
                  Add your OpenRouter API key to enable AI generation.
                </Text>
                <List type="number">
                  <List.Item>Go to <strong>Online Store → Themes</strong></List.Item>
                  <List.Item>Click <strong>Customize</strong> on your active theme</List.Item>
                  <List.Item>Find the <strong>AI Try-On button</strong> section</List.Item>
                  <List.Item>Paste your API key in the <strong>OpenRouter API Key</strong> field</List.Item>
                  <List.Item><strong>IMPORTANT: Add at least $5 in credits to your OpenRouter account!</strong></List.Item>
                  <List.Item>Click <strong>Save</strong></List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  🎥 Setup Guide & Support
                </Text>
                <Box padding="300" background="bg-surface-success">
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p" color="text-success">
                      <strong>📺 Must watch video - Easy setup steps (40 seconds):</strong>
                    </Text>
                    <Link url="https://www.youtube.com/watch?v=S5gpyYqQo-4" external target="_blank">
                      Watch Setup Video
                    </Link>
                  </BlockStack>
                </Box>
                <Box padding="300" background="bg-surface-info">
                  <Text variant="bodyMd" as="p" color="text-info">
                    <strong>💬 For any support contact:</strong> kapil@anrak.io
                  </Text>
                </Box>
                <Text variant="bodyMd" as="p">
                  Thank you for using AI Try-On by Anrak! 🙏
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  🔑 Need an API Key to Test?
                </Text>
                <Text variant="bodyMd" as="p">
                  Don't have an OpenRouter API key yet? We've got you covered! Get started with free credits to test our AI try-on features.
                </Text>
                
                <Box padding="400" background="bg-surface-success" borderRadius="300">
                  <BlockStack gap="300">
                    <InlineStack gap="200" align="center">
                      <Text as="span" variant="headingMd" color="text-success">
                        💰 $1 Free Credits
                      </Text>
                    </InlineStack>
                    <Text variant="bodyMd" as="p" color="text-success">
                      <strong>Get your API key + $1 in free credits to test the app!</strong>
                    </Text>
                    <Text variant="bodyMd" as="p" color="text-success">
                      That's enough for 70-100 generations. Perfect for fully testing all features!
                    </Text>
                  </BlockStack>
                </Box>
                
                <Box padding="300" background="bg-surface-info" borderRadius="200">
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p" color="text-info">
                      <strong>📧 Contact:</strong> kapil@anrak.io
                    </Text>
                    <Text variant="bodyMd" as="p" color="text-info">
                      You will receive an API key soon in your email.
                    </Text>
                  </BlockStack>
                </Box>
                
                <Text variant="bodySm" as="p" tone="subdued">
                  Perfect for testing before committing to your own OpenRouter account.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  📋 How to Get Your OpenRouter API Key
                </Text>
                <List type="number">
                  <List.Item>
                    <Link url="https://openrouter.ai/" external>
                      Visit OpenRouter.ai
                    </Link>
                    {" and create an account"}
                  </List.Item>
                  <List.Item>Go to the API Keys section in your dashboard</List.Item>
                  <List.Item>Click "Create Key" and give it a name (e.g. "Shopify AI Try-On")</List.Item>
                  <List.Item><strong>🚨 CRITICAL: Go to Credits section and add at least $5</strong></List.Item>
                  <List.Item>Copy the key that starts with "sk-or-v1-"</List.Item>
                  <List.Item>Paste it in the theme settings and save</List.Item>
                </List>
                <Box padding="300" background="bg-surface-critical">
                  <Text variant="bodyMd" as="p" color="text-critical">
                    🚨 <strong>CRITICAL:</strong> You MUST add at least $5 in credits to your OpenRouter account or the app will NOT work! Each try-on costs approximately $0.10-$0.20.
                  </Text>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  💡 Why Our AI Try-On App is Better & Cheaper
                </Text>
                <Text variant="bodyMd" as="p">
                  Compare our revolutionary approach to traditional AI try-on apps:
                </Text>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--p-color-bg-surface-secondary)', borderBottom: '2px solid var(--p-color-border)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Feature</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--p-color-text-success)' }}>Our AI Try-On App ✨</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: 'var(--p-color-text-subdued)' }}>Competitor Apps</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>💰 Annual Cost</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)', fontWeight: 'bold' }}>$25/year*</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-critical)' }}>$240-600/year</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)', backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🎮 Interactive Games</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Fashion Quiz & Games</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>❌ None</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🛡️ Legal Compliance</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Safe Dressing Room Backgrounds</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-critical)' }}>❌ User's Original Backgrounds</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)', backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🎯 Image Accuracy</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>⭐⭐⭐⭐⭐ Highest Quality</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>⭐⭐⭐ Standard Quality</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🔑 API Key Control</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Use Your Own Keys</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>❌ Locked to Their Service</td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>📊 Cost Transparency</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Pay Only What You Use</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>❌ Fixed High Monthly Fees</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <Box padding="400" background="bg-surface-success" borderRadius="300">
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd" color="text-success">
                      💡 The "Electricity Meter" Advantage
                    </Text>
                    <Text variant="bodyMd" as="p" color="text-success">
                      <strong>Think of us like an electricity meter vs. a hotel's all-inclusive package:</strong>
                    </Text>
                    <List>
                      <List.Item>🏨 <strong>Competitors:</strong> Like paying $50/night for a hotel regardless of usage - expensive and wasteful</List.Item>
                      <List.Item>⚡ <strong>Our App:</strong> Like having your own electricity meter - you pay only for what you actually use (~$0.10 per try-on)</List.Item>
                      <List.Item>💰 <strong>Result:</strong> Same 100 try-ons cost you $10 instead of their $50+ monthly fee</List.Item>
                    </List>
                    <Text variant="bodyMd" as="p" color="text-success">
                      *Based on OpenRouter pricing: ~$0.10 per generation. 250+ generations = $25/year vs competitors' $240-600/year
                    </Text>
                  </BlockStack>
                </Box>
                
                <Box padding="400" background="bg-surface-info" borderRadius="300">
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd" color="text-info">
                      🛡️ Legal & Compliance Advantage
                    </Text>
                    <Text variant="bodyMd" as="p" color="text-info">
                      <strong>We use safe dressing room backgrounds</strong> while competitors keep users' original backgrounds, which can be risky and inappropriate. Our controlled environment approach is safer and more professional for businesses.
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>


        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  🚀 Next Steps
                </Text>
                <InlineStack gap="300">
                  <Button onClick={goToProducts} variant="secondary">
                    Manage Products
                  </Button>
                  <Button onClick={goToStore} variant="plain">
                    View Your Store
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
