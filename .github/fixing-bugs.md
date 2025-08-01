## 📋 Prompt Instruction for Claude AI: Diagnose Supabase Auth Bug in Vercel Deployment

### 🧩 Context

We are deploying a Next.js + Supabase application to Vercel. Authentication works locally, but **fails in production** (on Vercel) with this error message:

```
[AuthApiError]: Invalid login credentials
status: 400,
code: 'invalid_credentials',
__isAuthError: true
```

The frontend uses Supabase for user `signUp` and `signIn` flows. Supabase project is confirmed to be correct and environment variables are set in Vercel. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present.

### 🔍 Known Vercel Logs:

From Vercel logs:

```ts
/api/auth/signin 401
Sign in error: eI [AuthApiError]: Invalid login credentials
```

Also observed:

```ts
/api/auth/signup
Error creating user profile: {}
```

### 🔐 Supabase Auth Settings:

* Project: `mdknfufyrljmdtkmrarf`
* Project URL: `https://mdknfufyrljmdtkmrarf.supabase.co`
* anon key is correctly set in Vercel
* Confirmation email is enabled (default setting)

### 🔧 Code Implementation (for Claude to review)

#### `/api/auth/signup.ts`

```ts
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: 'https://v0-singapore-cafe-websites.vercel.app/auth/callback',
  }
});

if (error) {
  console.error('[SIGNUP ERROR]', error.message);
  return new Response('Signup error', { status: 500 });
}

const { error: profileErr } = await supabase
  .from('user_profiles')
  .insert({ id: data.user?.id, email });

if (profileErr) {
  console.error('[PROFILE INSERT ERROR]', profileErr.message);
  return new Response('Profile creation error', { status: 500 });
}
```

#### `/api/auth/signin.ts`

```ts
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  console.error('[SIGNIN ERROR]', error.message);
  return new Response('Signin failed', { status: 401 });
}

return new Response(JSON.stringify(data), { status: 200 });
```

### ✅ What Claude Should Do

1. Analyze the sign-up and sign-in code to detect possible causes of `invalid_credentials` error.
2. Correlate with Supabase behavior:

   * Is email confirmation required?
   * Is email confirmation missing in the signup flow?
3. Check if environment variables might be mismatched.
4. Explain how `confirmed_at` affects sign-in.
5. Propose fixes if any logic is incorrect.

### 🤖 Output Expected from Claude

Claude should:

* Highlight bugs or edge cases (e.g. email not confirmed)
* Explain whether current Supabase logic matches best practices
* If Vercel logs hint at any other cause, describe it clearly
* Suggest improved version of `signup` or `signin` if needed

---

You are now Claude AI, acting as a **senior code reviewer and debugging assistant**. You are reviewing this bug report and code submission for production debugging purposes.
