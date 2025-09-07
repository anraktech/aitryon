import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  DataTable,
  EmptyState,
  Badge,
  InlineStack,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const response = await admin.graphql(
    `#graphql
      query getCustomers {
        customers(first: 10) {
          edges {
            node {
              id
              displayName
              email
              phone
              ordersCount
              totalSpentV2 {
                amount
                currencyCode
              }
              createdAt
              state
            }
          }
        }
      }`,
  );
  
  const responseJson = await response.json();
  const customers = responseJson.data?.customers?.edges || [];
  
  return json({ customers });
};

export default function Customers() {
  const { customers } = useLoaderData<typeof loader>();
  
  const rows = customers.map((edge: any) => {
    const customer = edge.node;
    const totalSpent = customer.totalSpentV2;
    const createdDate = new Date(customer.createdAt).toLocaleDateString();
    
    return [
      customer.displayName || "Anonymous",
      customer.email || "-",
      customer.phone || "-",
      customer.ordersCount || 0,
      totalSpent ? `${totalSpent.currencyCode} ${totalSpent.amount}` : "-",
      <Badge tone={customer.state === "ENABLED" ? "success" : "warning"}>
        {customer.state}
      </Badge>,
      createdDate,
    ];
  });
  
  return (
    <Page>
      <TitleBar title="Customers Management">
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
                  Your Customers
                </Text>
                <Button variant="primary" disabled>
                  Export Customers
                </Button>
              </InlineStack>
              
              {customers.length === 0 ? (
                <EmptyState
                  heading="No customers yet"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Customers will appear here once they make a purchase.</p>
                </EmptyState>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "text", "numeric", "text", "text", "text"]}
                  headings={["Name", "Email", "Phone", "Orders", "Total Spent", "Status", "Created"]}
                  rows={rows}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Customer Insights
              </Text>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Total Customers
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {customers.length}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Active Customers
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {customers.filter((c: any) => c.node.state === "ENABLED").length}
                  </Text>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Avg. Orders per Customer
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {customers.length > 0 
                      ? (customers.reduce((sum: number, c: any) => sum + (c.node.ordersCount || 0), 0) / customers.length).toFixed(1)
                      : 0}
                  </Text>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}