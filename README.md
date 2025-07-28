# SG Home Eats - Singapore Home-Based Cafe Marketplace

A marketplace platform connecting food lovers with passionate home-based cafe and restaurant owners across Singapore.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Vercel account (for deployment)

### Environment Setup

1. **Clone and install dependencies:**
\`\`\`bash
git clone <your-repo>
cd sg-home-eats
npm install
\`\`\`

2. **Set up Supabase:**
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Create a `.env.local` file from `.env.example`

3. **Initialize database:**
\`\`\`bash
npm run db:setup
\`\`\`

4. **Start development server:**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your marketplace!

## 📊 Database Schema

### Core Tables
- **users** - Customer and business owner accounts
- **businesses** - Cafe/restaurant profiles
- **menu_items** - Food and drink offerings
- **reviews** - Customer feedback and ratings
- **orders** - Order management system
- **business_views** - Analytics tracking

### Key Features
- Multi-user authentication (customers + business owners)
- Business profile management
- Menu and pricing management
- Review and rating system
- Order processing
- Analytics dashboard
- Image upload support

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **File Storage:** Vercel Blob
- **Deployment:** Vercel
- **Payments:** Stripe (optional)

## 📱 API Endpoints

### Businesses
- `GET /api/businesses` - List all businesses with filters
- `GET /api/businesses/[slug]` - Get business details
- `GET /api/businesses/[slug]/analytics` - Business analytics

### Reviews
- `POST /api/reviews` - Create a new review

### Orders
- `POST /api/orders` - Create a new order

## 🚀 Deployment

### Deploy to Vercel

1. **Connect to Vercel:**
\`\`\`bash
npx vercel
\`\`\`

2. **Set environment variables in Vercel dashboard:**
   - All variables from `.env.example`
   - Production Supabase credentials

3. **Deploy:**
\`\`\`bash
npx vercel --prod
\`\`\`

### Database Migration

Run the database setup on production:
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_prod_url SUPABASE_SERVICE_ROLE_KEY=your_prod_key npm run db:setup
\`\`\`

## 💰 Monetization

### Revenue Streams
1. **Commission per order** (5-10%)
2. **Monthly subscriptions** ($29-99/month)
3. **Featured listings** ($50-200/month)
4. **Advertising** (sponsored placements)

### Cost Structure
- **Hosting:** ~$87-137/month initially
- **Scales with usage:** $150-500/month at scale
- **Break-even:** ~20 paying businesses

## 🔧 Development

### Adding New Features
1. Update database schema in `scripts/`
2. Add API routes in `app/api/`
3. Update types in `lib/database.ts`
4. Build UI components

### Testing
\`\`\`bash
npm run lint
npm run build
\`\`\`

## 📞 Support

For technical support or business inquiries:
- Email: support@sghomeeats.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**Made with ❤️ for Singapore's home food entrepreneurs**
