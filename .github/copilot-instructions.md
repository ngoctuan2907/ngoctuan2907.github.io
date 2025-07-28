# SG Home Eats - AI Coding Agent Instructions

## Project Overview
This is a **Singapore home-based cafe marketplace** built with Next.js 14, connecting food lovers with home chefs. The platform handles business profiles, menu management, orders, reviews, and analytics.

## Architecture & Data Flow

### Database-First Design
- **Core Entity**: `businesses` table with slug-based routing (`/cafe/[slug]`)
- **Multi-tenant**: Users can be `customer`, `business_owner`, or `admin` 
- **Relational Structure**: Businesses → Menu Categories → Menu Items, with separate tables for reviews, orders, analytics
- **Supabase Integration**: All database operations go through `/lib/database.ts` helper functions

### Key Patterns
- **API Routes**: Follow `/api/[resource]/route.ts` pattern with optional `[slug]/route.ts` for individual resources
- **Database Helpers**: Use functions like `getBusinesses()`, `getBusinessBySlug()` in `/lib/database.ts` rather than raw Supabase queries
- **Component Structure**: Shadcn/ui components in `/components/ui/` with CVA (class-variance-authority) patterns
- **Type Safety**: All database types defined in `/lib/database.ts` with TypeScript interfaces

## Development Workflow

### Database Changes
1. Modify SQL in `/scripts/01-create-tables.sql` 
2. Update TypeScript interfaces in `/lib/database.ts`
3. Add/update helper functions for new queries
4. Test with existing API routes

### New Features
1. **Business Logic**: Add helper functions to `/lib/database.ts`
2. **API Layer**: Create route handlers in `/app/api/[resource]/route.ts`
3. **UI Components**: Use existing shadcn/ui components or extend them
4. **Pages**: Follow app router structure in `/app/`

### Component Conventions
- **Styling**: Use `cn()` utility from `/lib/utils.ts` for conditional classes
- **Icons**: Lucide React icons are preferred
- **Forms**: React Hook Form with Zod validation (dependencies already installed)
- **State**: Built-in React state; no external state management

## Critical Integration Points

### Supabase Configuration
- Client initialization in `/lib/database.ts` 
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Row Level Security (RLS) patterns expected on tables

### Business Profile Flow
```typescript
// Always include related data for business pages
getBusinessBySlug(slug) // Fetches business + cuisines + hours + menu + reviews + images
createBusinessView(businessId) // Track analytics on page views
```

### API Response Patterns
```typescript
// Consistent error handling
return NextResponse.json({ error: "Description" }, { status: 500 })
// Success responses wrap data
return NextResponse.json({ businesses, orders, reviews })
```

### Menu & Order Management
- Menu items belong to categories within businesses
- Orders store item details at time of purchase (price snapshot)
- Order status workflow: pending → confirmed → preparing → ready → completed

## Singapore-Specific Context
- **Districts**: Toa Payoh, Tampines, Jurong West, Ang Mo Kio (see homepage for examples)
- **Cuisines**: Peranakan, Local, Western Fusion, Indian, Chinese
- **Price Ranges**: $ to $$$$ system
- **Operating Hours**: 7-day week structure (0=Sunday, 6=Saturday)

## Debugging & Testing
- **Database**: Use Supabase dashboard for direct table inspection
- **API Testing**: All routes return JSON and handle query parameters
- **Analytics**: Check `business_views` table for page tracking
- **Errors**: Console logging in API routes, check Network tab for API failures
- **Hydration**: Avoid inline styles with template literals; use className and CSS variables instead
- **Fonts**: Geist fonts configured via CSS variables (`--font-sans`, `--font-mono`) in Tailwind config
- **NOTE**: Do not need to run the `npm run dev` command to start the development server; it is already running in the environment.

## Key Files to Reference
- `/lib/database.ts` - All database types and helper functions
- `/scripts/01-create-tables.sql` - Complete database schema
- `/app/page.tsx` - Homepage component showing UI patterns
- `/app/api/businesses/route.ts` - API endpoint example
- `/components/ui/button.tsx` - Component pattern example
