# TODO — Edu Portal Enhancements

## Step 1: Theme toggle (light/dark/system)
- [ ] Add theme support (CSS + ThemeProvider + persistence in localStorage)
- [ ] Apply theme class to `html`/`body`
- [ ] Add Theme toggle UI (likely in Student/Teacher/Admin layouts/navbars)
- [ ] Ensure auth pages use theme-friendly colors

## Step 2: Auth validation enhancements (login + signup)
- [ ] Backend: validate email format in `/api/auth/login` and `/api/auth/signup`
- [ ] Backend: add password strength validation in `/api/auth/signup` (and align with frontend)
- [ ] Backend: add `confirmPassword` validation (requires UI + API change)
- [ ] Frontend: add `confirmPassword` field on signup page
- [ ] Frontend: add email format + password validation on login/signup pages

## Step 3: MongoDB env/documentation
- [ ] Verify env vars required: `MONGODB_URI`, `JWT_SECRET`, and optional `ADMIN_EMAIL`/`ADMIN_PASSWORD`
- [ ] Update README / add .env.local template if missing

## Step 4: Quick hardening UX
- [ ] Improve generic auth error messages to reduce enumeration
- [ ] Add consistent error display (keep existing behavior unless needed)

## Step 5: Run & verify
- [ ] `npm run dev` and manually test theme toggle + login/signup flows
- [ ] Verify protected routes still work
