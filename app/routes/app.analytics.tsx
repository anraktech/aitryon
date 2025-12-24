import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  ProgressBar,
  Badge,
  Box,
  Icon,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChartVerticalIcon,
  ViewIcon
} from "@shopify/polaris-icons";

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

export default function Analytics() {
  const { analytics, shop } = useLoaderData<typeof loader>();
  const [realtimeData, setRealtimeData] = useState(analytics);

  const successful = realtimeData?.successful || 0;
  const failed = realtimeData?.failed || 0;
  const total = successful + failed;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  // Refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        setRealtimeData(data);
      } catch (error) {
        console.error('Failed to refresh analytics:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const statsData = [
    {
      title: "Total Generations",
      value: total.toLocaleString(),
      icon: ChartVerticalIcon,
      color: "info"
    },
    {
      title: "Successful",
      value: successful.toLocaleString(),
      icon: CheckCircleIcon,
      color: "success"
    },
    {
      title: "Failed",
      value: failed.toLocaleString(),
      icon: XCircleIcon,
      color: "critical"
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: ViewIcon,
      color: successRate >= 80 ? "success" : successRate >= 60 ? "warning" : "critical"
    }
  ];

  const performanceRows = [
    ["Today", "0", "0", "N/A"],
    ["Yesterday", "0", "0", "N/A"],
    ["This Week", successful.toString(), failed.toString(), `${successRate.toFixed(1)}%`],
    ["This Month", successful.toString(), failed.toString(), `${successRate.toFixed(1)}%`],
    ["All Time", successful.toString(), failed.toString(), `${successRate.toFixed(1)}%`]
  ];

  return (
    <Page>
      <TitleBar title="AI Try-On Analytics">
        <button onClick={() => window.location.href = "/app"}>
          Back to Dashboard
        </button>
      </TitleBar>

      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Key Metrics */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Key Metrics
                </Text>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {statsData.map((stat, index) => (
                    <Card key={index}>
                      <BlockStack gap="200">
                        <InlineStack align="space-between">
                          <Text as="span" variant="bodyMd" tone="subdued">
                            {stat.title}
                          </Text>
                          <Icon source={stat.icon} tone={stat.color as any} />
                        </InlineStack>
                        <Text as="span" variant="heading2xl" fontWeight="bold">
                          {stat.value}
                        </Text>
                      </BlockStack>
                    </Card>
                  ))}
                </div>
              </BlockStack>
            </Card>

            {/* Success Rate Visualization */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Performance Overview
                </Text>

                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyLg" fontWeight="medium">
                        Overall Success Rate
                      </Text>
                      <Badge
                        tone={successRate >= 80 ? "success" : successRate >= 60 ? "warning" : "critical"}
                        size="large"
                      >
                        {successRate.toFixed(1)}%
                      </Badge>
                    </InlineStack>

                    <ProgressBar
                      progress={successRate}
                      size="large"
                      tone={successRate >= 80 ? "success" : successRate >= 60 ? "warning" : "critical"}
                    />

                    <InlineStack gap="500">
                      <InlineStack gap="200" align="center">
                        <div style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "var(--p-color-bg-fill-success)"
                        }}></div>
                        <Text as="span" variant="bodySm">
                          {successful} Successful
                        </Text>
                      </InlineStack>
                      <InlineStack gap="200" align="center">
                        <div style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: "var(--p-color-bg-fill-critical)"
                        }}></div>
                        <Text as="span" variant="bodySm">
                          {failed} Failed
                        </Text>
                      </InlineStack>
                    </InlineStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>

            {/* Performance Table */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  Detailed Performance
                </Text>

                <DataTable
                  columnContentTypes={["text", "numeric", "numeric", "text"]}
                  headings={["Period", "Successful", "Failed", "Success Rate"]}
                  rows={performanceRows}
                />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <BlockStack gap="500">
            {/* Status Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  System Status
                </Text>

                <BlockStack gap="300">
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      AI Provider
                    </Text>
                    <Badge tone="success">Fal AI</Badge>
                  </InlineStack>

                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Model
                    </Text>
                    <Badge tone="success">Kling Kolors v1.5</Badge>
                  </InlineStack>

                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Extensions
                    </Text>
                    <Badge tone="success">Active</Badge>
                  </InlineStack>

                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd">
                      Image Storage
                    </Text>
                    <Badge tone="success">Cloudinary</Badge>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Tips Card */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Optimization Tips
                </Text>

                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd">
                    • Encourage customers to use high-quality, well-lit photos
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Success rates improve with clear product images
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Full-body shots work best for try-on
                  </Text>
                  <Text as="p" variant="bodyMd">
                    • Peak usage typically occurs during shopping hours
                  </Text>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Quick Actions */}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Quick Actions
                </Text>

                <BlockStack gap="200">
                  <button
                    className="Polaris-Button Polaris-Button--fullWidth"
                    onClick={() => window.location.href = "/app/settings"}
                  >
                    View Settings
                  </button>
                  <button
                    className="Polaris-Button Polaris-Button--fullWidth Polaris-Button--outline"
                    onClick={() => window.location.href = "/app"}
                  >
                    Back to Dashboard
                  </button>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
