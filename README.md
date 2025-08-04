# NTT Market - Home-Based Business Platform

A modern Next.js platform connecting customers with local home-based food businesses in Singapore. Built with TypeScript, Supabase, and shadcn/ui.

## 🚀 Features

### ✅ Completed Features

- **🔐 Authentication System**
  - Sign up/sign in with email/password
  - Protected routes with middleware
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
  - Mock checkout API with order creation
  - Order success page with pickup details
  - Order history page (accessible from navbar)

- **📊 Business Dashboard**
  - Analytics overview (views, orders, rating, revenue)
  - Recent orders and reviews management
  - Tabbed interface (Overview, Orders, Reviews, Analytics)
  - Quick action buttons for common tasks

- **🎨 UI/UX**
  - Responsive design with Tailwind CSS
  - shadcn/ui components for consistent styling
  - Toast notifications for user feedback
  - Loading states and error handling

### 🔄 In Progress / TODO

- **💳 Payment Integration**
  - Stripe checkout (API structure ready)
  - Real payment processing
  - Webhook handling for order confirmation

- **💾 Database Integration**
  - Real Supabase data integration
  - Database seeding script (created, needs env vars)
  - Dynamic cafe and menu data

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
│   │   ├── checkout/      # Order processing
│   │   ├── stats/         # Site statistics
│   │   └── ...
│   ├── browse/            # Browse cafes page
│   ├── cafe/[id]/         # Individual cafe pages
│   ├── business-dashboard/ # Business owner dashboard
│   ├── orders/            # Order management
│   └── ...
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── auth-context.tsx   # Authentication context
│   ├── database.ts        # Database types
│   ├── supabaseClient.ts  # Supabase client
│   └── utils.ts           # Utility functions
├── scripts/               # Database scripts
│   ├── 01-create-tables.sql
│   ├── 02-seed-data.sql
│   └── seed-database.ts
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
   
   Fill in your Supabase credentials in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**
   
   Run the SQL scripts in your Supabase SQL editor:
   ```bash
   # Run in order:
   scripts/01-create-tables.sql
   scripts/02-seed-data.sql
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open the application**
   
   Visit [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in `/scripts/` to create tables
3. Optionally run the seeding script to populate with sample data:
   ```bash
   pnpm run seed-db
   ```

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

- `GET /api/stats` - Site statistics
- `POST /api/checkout` - Process orders
- `GET /api/businesses` - Business listings
- `GET /api/orders` - Order management

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
