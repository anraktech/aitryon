import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  DataTable,
  EmptyState,
  Badge,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              status
              totalInventory
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }`,
  );
  
  const responseJson = await response.json();
  const products = responseJson.data?.products?.edges || [];
  
  return json({ products });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "delete") {
    const productId = formData.get("productId");
    await admin.graphql(
      `#graphql
        mutation deleteProduct($id: ID!) {
          productDelete(input: { id: $id }) {
            deletedProductId
          }
        }`,
      {
        variables: { id: productId },
      },
    );
    return json({ success: true });
  }
  
  return json({ success: false });
};

export default function Products() {
  const { products } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const rows = products.map((edge: any) => {
    const product = edge.node;
    const price = product.priceRangeV2?.minVariantPrice;
    
    return [
      product.title,
      product.handle,
      <Badge tone={product.status === "ACTIVE" ? "success" : "info"}>
        {product.status}
      </Badge>,
      product.totalInventory || 0,
      price ? `${price.currencyCode} ${price.amount}` : "-",
      <Button
        size="slim"
        onClick={() => {
          if (window.confirm("Are you sure you want to delete this product?")) {
            fetcher.submit(
              { action: "delete", productId: product.id },
              { method: "POST" }
            );
          }
        }}
      >
        Delete
      </Button>,
    ];
  });
  
  return (
    <Page>
      <TitleBar title="Products Management">
        <button onClick={() => window.location.href = "/app"}>
          Back to Home
        </button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingLg">
                  Your Products
                </Text>
                <Button url="/app" variant="primary">
                  Create Product
                </Button>
              </InlineStack>
              
              {products.length === 0 ? (
                <EmptyState
                  heading="No products yet"
                  action={{ content: "Create Product", url: "/app" }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Start by creating your first product.</p>
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "numeric", "text", "text"]}
                  headings={["Title", "Handle", "Status", "Inventory", "Price", "Actions"]}
                  rows={rows}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}