# NTT Market - Home-Based Business Platform

A modern Next.js platform connecting customers with local home-based food businesses in Singapore. Built with TypeScript, Supabase, and shadcn/ui.

## 🚀 Features

### ✅ Completed Features

- **🔐 Authentication System**
  - Sign up/sign in with email/password
  - OAuth integration with Google/GitHub
  - Protected routes with middleware
  - Role-based access control (admin, business_owner, customer)
  - Session management and logout

- **🏠 Homepage & Navigation**
  - Dynamic statistics (cafes, reviews, orders)
  - Search functionality with navigation to browse page
  - Personalized navbar with user avatar and dropdown
  - Dynamic copyright year

- **🔍 Browse & Search**
  - Advanced filtering (location, cuisine, price, rating)
  - Search by business name or cuisine type
  - Responsive cafe cards with rating and price tier
  - Filter modal with multiple selection options

- **🏪 Cafe Profile Pages**
  - Detailed business information and menu
  - Add to cart functionality with quantity controls
  - Shopping cart with real-time total calculation
  - Order placement with customer information form
  - Review system with rating stars
  - Interactive features (save, share, call, Instagram)

- **📦 Order Management**
  - Complete order API with status tracking
  - Order success page with pickup details
  - Order history page (accessible from navbar)
  - Business order management dashboard

- **📊 Business Dashboard**
  - Analytics overview (views, orders, rating, revenue)
  - Recent orders and reviews management
  - Tabbed interface (Overview, Orders, Reviews, Analytics)
  - Quick action buttons for common tasks

- **🏪 Business Registration**
  - Multi-step business registration form
  - Image upload for business logos
  - Integration with Supabase Storage
  - Email verification and approval process

- **💳 Payment & Subscriptions**
  - Stripe checkout integration
  - Subscription management (Basic, Professional, Premium)
  - Webhook handling for payment confirmation
  - Multi-tenant subscription gating

- **🗃️ Database & Storage**
  - Complete Supabase integration
  - Multi-tenant architecture with RLS policies
  - Image storage with signed URLs
  - Database seeding scripts

- **🎨 UI/UX**
  - Responsive design with Tailwind CSS
  - shadcn/ui components for consistent styling
  - Toast notifications for user feedback
  - Loading states and error handling
  - Theme support (light/dark mode)

### 🔄 Future Enhancements

- **� Advanced Analytics**
  - Revenue tracking and reporting
  - Customer behavior analysis
  - Performance metrics dashboard

- **� Notifications**
  - Real-time order notifications
  - Email marketing integration
  - Push notification support

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Stripe (ready for integration)
- **Deployment**: Vercel

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── account/       # User account management
│   │   ├── ads/           # Advertisement system
│   │   ├── auth/          # Authentication endpoints
│   │   ├── businesses/    # Business management
│   │   ├── checkout/      # Order processing
│   │   ├── images/        # Image upload/management
│   │   ├── memberships/   # Subscription management
│   │   ├── orders/        # Order management
│   │   ├── reviews/       # Review system
│   │   ├── shops/         # Shop CRUD operations
│   │   ├── stakeholders/  # User role management
│   │   ├── stats/         # Site statistics
│   │   ├── stripe/        # Payment processing
│   │   └── vouchers/      # Voucher system
│   ├── browse/            # Browse cafes page
│   ├── cafe/[id]/         # Individual cafe pages
│   ├── business-dashboard/ # Business owner dashboard
│   ├── orders/            # Order management
│   ├── register-business/ # Business registration
│   ├── settings/          # User settings
│   └── ...
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── settings/         # Settings components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── auth/             # Authentication helpers
│   ├── http/             # HTTP utilities
│   ├── auth-context.tsx  # Authentication context
│   ├── database.ts       # Database helpers
│   ├── supabase-api.ts   # API client
│   ├── supabase-server.ts # Server client
│   ├── supabaseClient.ts # Browser client
│   └── utils.ts          # Utility functions
├── supabase/             # Database configuration
│   ├── migrations/       # Database migrations
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Sample data
└── styles/               # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ngoctuan2907.github.io
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Application Settings
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the database setup in your Supabase project:
   ```bash
   # Apply the schema and seed data
   # Copy and run supabase/schema.sql in your Supabase SQL editor
   # Copy and run supabase/seed.sql to populate with sample data
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a new Supabase project
2. Run `supabase/schema.sql` in your Supabase SQL editor to create tables
3. Run `supabase/seed.sql` to populate with sample data
4. Configure Row Level Security (RLS) policies as defined in the schema

## 📱 Usage

### For Customers

1. **Browse Cafes**: Use the search and filter options on the browse page
2. **Place Orders**: Visit a cafe page, add items to cart, and checkout
3. **Track Orders**: View order history and status in the Orders page
4. **Leave Reviews**: Rate and review cafes after your experience

### For Business Owners

1. **Dashboard**: Monitor your business performance and analytics
2. **Orders**: Manage incoming orders and update statuses
3. **Reviews**: Respond to customer feedback
4. **Profile**: Update your business information and menu

## 🔧 Development

### Key Commands

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm run seed-db      # Seed database with sample data
```

### Environment Variables

See `.env.example` for all required environment variables.

### API Endpoints

#### Authentication & Users
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication
- `GET /api/account/profile` - Get user profile
- `PUT /api/account/profile` - Update user profile

#### Business Management
- `GET /api/businesses` - List businesses
- `POST /api/businesses` - Create business
- `GET /api/shops` - List shops
- `POST /api/shops` - Create shop
- `GET /api/shops/[id]` - Get shop details
- `PUT /api/shops/[id]` - Update shop
- `DELETE /api/shops/[id]` - Delete shop

#### Orders & Payments
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

#### Content & Media
- `POST /api/images/sign` - Get signed upload URL
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `GET /api/ads` - List advertisements
- `GET /api/vouchers` - List vouchers

#### Analytics & Stats
- `GET /api/stats` - Site statistics
- `GET /api/stats/business/[id]` - Business analytics

#### Subscriptions
- `GET /api/memberships` - List user memberships
- `POST /api/memberships` - Create membership
- `GET /api/stakeholders` - List stakeholders

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

---

**Made with ❤️ for Singapore's home food entrepreneurs**
