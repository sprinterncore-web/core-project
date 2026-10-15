# Sprintern Setup Checklist

## After running Cursor prompt:

### 1. Supabase Dashboard Steps (do these manually)

- [ ] Go to https://supabase.com/dashboard/project/adcbeqbfyppayebyqlmw
- [ ] SQL Editor → New query → paste contents of supabase/schema.sql → Run
- [ ] Authentication → Providers → Email → Enable
- [ ] Authentication → URL Configuration → add to Redirect URLs:
      http://localhost:3000/auth/callback
      https://yourdomain.com/auth/callback (when deployed)
- [ ] Authentication → Providers → Google → Enable
        (needs Google OAuth credentials from Google Cloud Console)

### 2. Test the connection

- [ ] npm run dev
- [ ] Open browser console on localhost:3000
- [ ] Should see: ✅ Supabase connected successfully
- [ ] Go to /auth/signup — form should render
- [ ] Create a test account
- [ ] Check Supabase Dashboard → Authentication → Users — user should appear
- [ ] Check Table Editor → profiles — profile row should auto-create

### 3. Push to GitHub after confirming everything works

git add .
git commit -m "feat: Next.js migration + Supabase auth + student signup + company booking"
git push origin main
