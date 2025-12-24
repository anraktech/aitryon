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
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

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
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingLg">
                    AI Try-On Extension Ready
                  </Text>
                  <Badge tone="success">Active</Badge>
                </InlineStack>
                <Text variant="bodyMd" as="p">
                  Your AI try-on feature is fully configured and ready to use! Customers can upload photos and see virtual try-ons on product pages.
                </Text>
                <Box padding="300" background="bg-surface-success" borderRadius="200">
                  <Text variant="bodyMd" as="p" tone="success">
                    <strong>No setup required!</strong> The AI is powered by Fal AI's Kling Kolors Virtual Try-On v1.5 model - one of the most advanced virtual try-on systems available.
                  </Text>
                </Box>
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
                  <List.Item>✅ Apple-style modal design: Active</List.Item>
                  <List.Item>✅ Camera functionality: Working</List.Item>
                  <List.Item>✅ AI Processing: Fal AI (Kling Kolors v1.5)</List.Item>
                </List>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  ⚙️ Quick Setup
                </Text>
                <Text variant="bodyMd" as="p">
                  Add the AI Try-On button to your product pages:
                </Text>
                <List type="number">
                  <List.Item>Go to <strong>Online Store → Themes</strong></List.Item>
                  <List.Item>Click <strong>Customize</strong> on your active theme</List.Item>
                  <List.Item>Navigate to a product page template</List.Item>
                  <List.Item>Add the <strong>AI Try-On Product</strong> block</List.Item>
                  <List.Item>Customize button style and click <strong>Save</strong></List.Item>
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
                    <Text variant="bodyMd" as="p" tone="success">
                      <strong>📺 Watch the easy setup video (40 seconds):</strong>
                    </Text>
                    <Link url="https://www.youtube.com/watch?v=S5gpyYqQo-4" external target="_blank">
                      Watch Setup Video
                    </Link>
                  </BlockStack>
                </Box>
                <Box padding="300" background="bg-surface-info">
                  <Text variant="bodyMd" as="p" tone="info">
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
                <Text as="h2" variant="headingLg">
                  💡 Why Our AI Try-On App is Better
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
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🤖 AI Technology</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)', fontWeight: 'bold' }}>Kling Kolors v1.5 (Latest)</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>Older Models</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)', backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>⚙️ Setup Required</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Zero Config</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>❌ API Keys Required</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🎮 Interactive Games</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Fashion Quiz & Games</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>❌ None</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--p-color-border)', backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🎯 Image Quality</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>⭐⭐⭐⭐⭐ Highest</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>⭐⭐⭐ Standard</td>
                      </tr>
                      <tr style={{ backgroundColor: 'var(--p-color-bg-surface-secondary)' }}>
                        <td style={{ padding: '12px', fontWeight: 'medium' }}>🛡️ Legal Compliance</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-success)' }}>✅ Safe Backgrounds</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--p-color-text-subdued)' }}>❌ User Backgrounds</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Box padding="400" background="bg-surface-info" borderRadius="300">
                  <BlockStack gap="200">
                    <Text as="h4" variant="headingMd" tone="info">
                      🛡️ Legal & Compliance Advantage
                    </Text>
                    <Text variant="bodyMd" as="p" tone="info">
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
