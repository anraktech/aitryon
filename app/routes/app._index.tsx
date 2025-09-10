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
                    🚨 <strong>CRITICAL:</strong> You MUST add at least $5 in credits to your OpenRouter account or the app will NOT work! Each try-on costs approximately $0.01-0.05.
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
