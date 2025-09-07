# My Shopify App

A Shopify app built with Remix, Polaris, and the Shopify Admin API.

## Features

- Product Management: View, create, and delete products
- Customer Management: View customer information and analytics
- Built with Shopify's latest tools and best practices
- Responsive design using Polaris components
- GraphQL API integration for data fetching

## Prerequisites

- Node.js 18+ installed
- A Shopify Partner account
- A development store for testing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then fill in your Shopify app credentials in the `.env` file.

### 3. Setup Database

The app uses SQLite with Prisma. Run the following to set up the database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the Development Server

To start the app in development mode:

```bash
npm run dev
```

This will:
- Start a local development server
- Create a tunnel for HTTPS access
- Open your app in the browser

### 5. Install on Development Store

When you run `npm run dev`, you'll be prompted to:
1. Log in to your Shopify Partner account
2. Select or create an app
3. Install it on your development store

## Project Structure

```
my-shopify-app/
├── app/                    # Remix app files
│   ├── routes/            # App routes and pages
│   │   ├── app._index.tsx # Main dashboard
│   │   ├── app.products.tsx # Products management
│   │   └── app.customers.tsx # Customer management
│   ├── shopify.server.ts  # Shopify API configuration
│   └── db.server.ts       # Database configuration
├── prisma/                # Database schema
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma` - Access Prisma CLI
- `npm run shopify` - Access Shopify CLI

## Key Technologies

- **Remix**: Full-stack web framework
- **Shopify Polaris**: Design system for Shopify apps
- **Prisma**: Database ORM
- **GraphQL**: API query language
- **TypeScript**: Type-safe JavaScript

## API Scopes

The app requests the following API scopes:
- `write_products`, `read_products` - Product management
- `write_customers`, `read_customers` - Customer access
- `write_orders`, `read_orders` - Order management

## Deployment

To deploy your app:

1. Build the app:
```bash
npm run build
```

2. Deploy using Shopify CLI:
```bash
npm run deploy
```

## Testing

To test your app:
1. Install it on a development store
2. Navigate through the different sections (Products, Customers)
3. Try creating products using the "Generate a product" button
4. Check that data loads correctly in each section

## Troubleshooting

### Authentication Issues
- Make sure you're logged in to the correct Shopify Partner account
- Verify your app credentials in the `.env` file

### Database Issues
- Run `npx prisma generate` to regenerate the Prisma client
- Run `npx prisma db push` to sync the database schema

### Development Server Issues
- Try clearing the `.cache` directory
- Restart the development server

## Next Steps

1. Customize the UI components in `app/routes/`
2. Add more features like order management
3. Implement webhooks for real-time updates
4. Add app extensions for additional functionality
5. Deploy to production

## Support

For more information:
- [Shopify App Development Docs](https://shopify.dev/apps)
- [Remix Documentation](https://remix.run/docs)
- [Polaris Components](https://polaris.shopify.com)
- [GraphQL Admin API Reference](https://shopify.dev/docs/api/admin-graphql)

## License

This app is built using Shopify's app template and follows Shopify's guidelines for app development.