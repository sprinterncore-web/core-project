# Sprintern Setup Checklist

## Local dev

- App runs on **http://localhost:3002** (`npm run dev` uses port 3002).

### Admin login (master panel)

- URL: **http://localhost:3002/admin/login**
- Email: **sprinterncore@gmail.com**
- Password: **QWERTYUI8**

To apply that password in Supabase (one-time):

1. Supabase Dashboard → **Settings → API** → copy **service_role** key.
2. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your_key_here` (never commit).
3. Run: `npm run set-admin-password`

Or reset manually: **Authentication → Users** → user → **Reset password** → set to `QWERTYUI8`.

## After running Cursor prompt:

### 1. Supabase Dashboard Steps (do these manually)

- [ ] Go to https://supabase.com/dashboard/project/adcbeqbfyppayebyqlmw
- [ ] SQL Editor → New query → paste contents of supabase/schema.sql → Run
- [ ] Authentication → Providers → Email → Enable
- [ ] Authentication → URL Configuration → add to Redirect URLs:
      http://localhost:3002/auth/callback
      http://localhost:3002/admin/login
      https://yourdomain.com/auth/callback (when deployed)
- [ ] Authentication → Providers → Google → Enable
        (needs Google OAuth credentials from Google Cloud Console)

### 2. Test the connection

- [ ] npm run dev
- [ ] Open browser console on localhost:3002
- [ ] Should see: ✅ Supabase connected successfully
- [ ] Go to /auth/signup — form should render
- [ ] Create a test account
- [ ] Check Supabase Dashboard → Authentication → Users — user should appear
- [ ] Check Table Editor → profiles — profile row should auto-create

### 3. Push to GitHub after confirming everything works

git add .
git commit -m "feat: Next.js migration + Supabase auth + student signup + company booking"
git push origin main
