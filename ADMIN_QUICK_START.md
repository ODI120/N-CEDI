# 🚀 ADMIN PORTAL QUICK START

## 5-Minute Setup

### Step 1: Update Environment Variables

```bash
# Open .env file and update:

# 1. Get Service Role Key from Supabase
#    Go to: https://app.supabase.com/project/[your-project]/settings/api
#    Copy "Service Role Key"
SUPABASE_SERVICE_ROLE_KEY=<paste-actual-key-here>

# 2. Generate a secure secret
ADMIN_INIT_SECRET=$(openssl rand -hex 32)
echo "ADMIN_INIT_SECRET=$ADMIN_INIT_SECRET"  # Save this somewhere safe!
```

### Step 2: Run Database Migrations

```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Using Supabase Dashboard
# Go to SQL Editor and run migrations in order:
# 1. migrations/001_initial_schema.sql
# 2. migrations/002_site_stats.sql
# 3. migrations/003_admin_rbac.sql
# 4. migrations/004_admin_users.sql
```

### Step 3: Create First Admin

```bash
# Using the setup wizard (easiest):
1. Navigate to: http://localhost:3000/admin/setup
2. Enter your email
3. Create a strong password
4. Paste the ADMIN_INIT_SECRET from Step 1
5. Click "Create Super Admin"

# OR using curl (for automation):
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ncedi.edu.ng",
    "temporaryPassword": "Temp123!@#Secure",
    "initSecret": "'$ADMIN_INIT_SECRET'"
  }'
```

### Step 4: First Login

```
1. Go to: http://localhost:3000/admin/login
2. Enter your email and temporary password
3. Click "Sign in"
4. YOU'RE IN! ✅
```

### Step 5: Change Password

```
1. In admin dashboard, go to profile (top right)
2. Change your temporary password to something secure
3. Keep this password somewhere safe!
```

### Step 6: Disable Initialization Endpoint (IMPORTANT!)

```bash
# Edit .env and set:
ADMIN_INIT_SECRET=

# Then redeploy
npm run build
npm run dev  # or deploy to production
```

---

## Common Issues & Solutions

### ❌ "Invalid initialization secret"
**Solution:** Copy the exact ADMIN_INIT_SECRET from your .env file

### ❌ "Admin users already exist"
**Solution:** Initialization endpoint only works once. Use admin dashboard to manage users instead.

### ❌ "No authenticated user – please sign in first"
**Solution:** 
1. Go to `/admin/login`
2. Sign in first
3. Then navigate to the page you want

### ❌ "Your account is authenticated, but not enrolled as an admin user"
**Solution:** Ask a super_admin to enroll you using the admin management API

### ❌ "Database connection error"
**Solution:**
1. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env
2. Verify Supabase project is active
3. Check internet connection

### ❌ "Service role key error"
**Solution:** 
1. Go to Supabase dashboard
2. Settings → API
3. Copy "Service Role Key" (NOT the anon key!)
4. Paste into SUPABASE_SERVICE_ROLE_KEY

---

## Next Steps

### Enroll More Admins

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "another@ncedi.edu.ng",
    "role": "editor"
  }'
```

### View All Admins

```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### Manage Content

1. Go to `/admin`
2. Click on the section you want to manage:
   - Inquiries - Contact form submissions
   - Site Stats - Key metrics
   - Programs - Educational programs

---

## Security Checklist

- [ ] Service role key is correct
- [ ] Initialization secret is set and saved safely
- [ ] First admin account is created
- [ ] Temporary password is changed
- [ ] Additional admins are enrolled with proper roles
- [ ] Initialization endpoint is disabled
- [ ] No admin_init_secret in version control

---

## Documentation

For detailed information, see:
- [ADMIN_PORTAL_SETUP.md](./ADMIN_PORTAL_SETUP.md) - Full setup & security guide
- [ADMIN_SECURITY_AUDIT.md](./ADMIN_SECURITY_AUDIT.md) - Security audit report

---

## Support

**Issue:** Can't login
**Solution:** See troubleshooting section above

**Issue:** Need to reset password
**Solution:** Contact super_admin to reset

**Issue:** Need emergency access
**Solution:** Contact system administrator

---

**Last Updated:** January 15, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for use
