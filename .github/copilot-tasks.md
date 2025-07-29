🔐 Authentication System Requirements - Milestone 1
Core Objectives
Build a secure, user-friendly authentication system that clearly distinguishes between Customer and Business Owner account types, enabling distinct feature workflows for each user role.

1. User Registration (Sign Up)
Account Type Selection
<input disabled="" type="checkbox"> Two-step registration flow: User first selects account type (Customer/Business Owner)
<input disabled="" type="checkbox"> Clear value proposition for each account type on selection screen
<input disabled="" type="checkbox"> Visual differentiation between account types (icons, colors, descriptions)
Registration Forms
<input disabled="" type="checkbox"> Customer Registration: Email, password, first name, last name, phone (optional)
<input disabled="" type="checkbox"> Business Owner Registration: Email, password, first name, last name, phone (required), intended business name (optional)
<input disabled="" type="checkbox"> Password requirements: Minimum 8 characters, mix of letters/numbers/symbols
<input disabled="" type="checkbox"> Email validation: Real-time format validation
<input disabled="" type="checkbox"> Phone validation: Singapore format (+65 XXXX XXXX)
Duplicate Account Handling
<input disabled="" type="checkbox"> Email existence check: Before form submission, check if email already exists
<input disabled="" type="checkbox"> Friendly prompt: If email exists, redirect to sign-in with "Already have an account?" message
<input disabled="" type="checkbox"> Account type mismatch: If user tries to register as different type with existing email, show appropriate message
2. Email Verification System
Supabase Email Confirmation
<input disabled="" type="checkbox"> Automatic email sending: Upon successful registration, trigger Supabase email confirmation
<input disabled="" type="checkbox"> Custom email templates: Branded emails for SG Home Eats with Singapore context
<input disabled="" type="checkbox"> Verification flow: Users must verify email before accessing protected features
Verification States
<input disabled="" type="checkbox"> Pending verification: User can sign in but sees verification banner/modal
<input disabled="" type="checkbox"> Verified state: Full access to features based on account type
<input disabled="" type="checkbox"> Resend verification: Option to resend confirmation email with rate limiting
3. Sign In System
Universal Sign In
<input disabled="" type="checkbox"> Single sign-in form: Works for both Customer and Business Owner accounts
<input disabled="" type="checkbox"> Account type detection: Automatically detect user type after successful authentication
<input disabled="" type="checkbox"> Role-based routing: Redirect to appropriate dashboard/homepage based on user type
Sign In Features
<input disabled="" type="checkbox"> Remember me: Persistent sessions using Supabase auth tokens
<input disabled="" type="checkbox"> Password reset: Email-based password recovery flow
<input disabled="" type="checkbox"> Error handling: Clear messages for invalid credentials, unverified accounts, etc.
4. Database Schema Updates
Enhanced Users Table
User Type Constraints
<input disabled="" type="checkbox"> Business owners: Phone number required, can create business profiles
<input disabled="" type="checkbox"> Customers: Phone optional, can place orders and write reviews
<input disabled="" type="checkbox"> Admin: System management access (future milestone)
5. Post-Authentication Flows
Customer Journey
<input disabled="" type="checkbox"> Welcome dashboard: Browse cafes, recent orders, favorite businesses
<input disabled="" type="checkbox"> Profile completion: Option to add phone, preferences, delivery addresses
Business Owner Journey
<input disabled="" type="checkbox"> Business listing prompt: Immediate CTA to "List Your Cafe" after verification
<input disabled="" type="checkbox"> Profile setup wizard: Guide through business registration process
<input disabled="" type="checkbox"> Dashboard access: Analytics, orders, menu management (future milestones)
6. Security & UX Requirements
Security Measures
<input disabled="" type="checkbox"> Rate limiting: Login attempts, email resend, password reset
<input disabled="" type="checkbox"> CSRF protection: Secure form submissions
<input disabled="" type="checkbox"> Session management: Proper token handling and expiration
User Experience
<input disabled="" type="checkbox"> Loading states: Spinners/skeletons during auth operations
<input disabled="" type="checkbox"> Form validation: Real-time feedback with clear error messages
<input disabled="" type="checkbox"> Mobile responsive: Touch-friendly forms and navigation
<input disabled="" type="checkbox"> Accessibility: ARIA labels, keyboard navigation, screen reader support
7. Integration Points
Supabase Auth Configuration
<input disabled="" type="checkbox"> Email templates: Custom HTML emails with SG Home Eats branding
<input disabled="" type="checkbox"> Redirect URLs: Proper handling of email confirmation redirects
<input disabled="" type="checkbox"> RLS policies: Row-level security for user data protection
Frontend Components
<input disabled="" type="checkbox"> Reusable auth forms: Sign up, sign in, password reset using shadcn/ui
<input disabled="" type="checkbox"> Auth guards: Route protection based on authentication and verification status
<input disabled="" type="checkbox"> Auth context: React context for user state management
8. Testing & Validation
Test Scenarios
<input disabled="" type="checkbox"> Happy path: Complete registration → verification → sign in flow
<input disabled="" type="checkbox"> Edge cases: Duplicate emails, unverified users, expired tokens
<input disabled="" type="checkbox"> Error scenarios: Network failures, invalid inputs, rate limiting
Acceptance Criteria
<input disabled="" type="checkbox"> Business owner can register, verify email, sign in, and immediately see "List Your Cafe" option
<input disabled="" type="checkbox"> Customer can register, verify email, sign in, and browse cafe marketplace
<input disabled="" type="checkbox"> Email conflicts are handled gracefully with helpful user guidance
<input disabled="" type="checkbox"> All forms are mobile-responsive and accessible
