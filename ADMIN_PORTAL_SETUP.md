# Admin Portal Setup & Security Guide

> **PROJECT VALUE**: $100,000+  
> **SECURITY LEVEL**: Enterprise-Grade  
> **LAST UPDATED**: 2025-01-15

## Table of Contents

1. [Critical Prerequisites](#critical-prerequisites)
2. [Admin Initialization](#admin-initialization)
3. [Role Hierarchy](#role-hierarchy)
4. [Security Standards](#security-standards)
5. [Troubleshooting](#troubleshooting)

---

## Critical Prerequisites

### 1. Environment Configuration

**BEFORE you can login**, ensure these are set in `.env`:

```bash
# Required: Supabase service role key (from Supabase Dashboard)
# Settings → API → Under "Project API keys" find "Service Role Key"
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... # Actual key here

# Required: Admin initialization secret (generate new one)
ADMIN_INIT_SECRET=$(openssl rand -hex 32)  # Change to random value
```

**Never commit `.env` to version control!**

### 2. Database Migrations

Apply migrations in order:

```bash
# Via Supabase dashboard or CLI
supabase migration up
```

Verify migrations were successful:
- Table `admin_users` exists
- Role enum `admin_role` exists with values: super_admin, admin, editor, viewer
- RLS policies are enabled

---

## Admin Initialization

### Step 1: Create First Super Admin (One-time)

**IMPORTANT**: This endpoint is disabled once any admin exists for security.

```bash
curl -X POST http://localhost:3000/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ncedi.edu.ng",
    "temporaryPassword": "SecureTemp123!@#",
    "initSecret": "'$ADMIN_INIT_SECRET'"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Super admin user created successfully...",
  "user": {
    "id": "uuid-here",
    "email": "admin@ncedi.edu.ng",
    "role": "super_admin"
  }
}
```

### Step 2: First Login

1. Navigate to `https://ncedi.edu.ng/admin/login`
2. Enter your email and temporary password
3. **IMPORTANT**: Change password immediately after login

### Step 3: Disable Initialization Endpoint (Required)

After creating the first admin:

1. Set `ADMIN_INIT_SECRET` to empty string in `.env`
2. Redeploy the application
3. Verify endpoint returns 503 Service Unavailable

---

## Role Hierarchy

### Access Levels (Highest → Lowest)

```
┌─────────────────────────────────────────────────────────┐
│ SUPER_ADMIN                                             │
│ • Full system access                                    │
│ • Manage all admin users                               │
│ • Change roles, deactivate accounts                    │
│ • View audit logs                                      │
└─────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────┐
│ ADMIN                                                   │
│ • Content management (create, read, update)           │
│ • View admin users list                               │
│ • Cannot create/delete other admins                   │
│ • Limited audit access                                │
└─────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────┐
│ EDITOR                                                  │
│ • Create and edit content                             │
│ • Cannot delete content                               │
│ • View own profile only                               │
└─────────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────────┐
│ VIEWER                                                  │
│ • Read-only access                                    │
│ • View reports and dashboards                         │
│ • Cannot make any changes                             │
└─────────────────────────────────────────────────────────┘
```

---

## Security Standards

### Authentication

✅ **Implemented:**
- Supabase Auth (industry standard)
- Row-Level Security (RLS) on all admin tables
- Session-based authentication
- Secure password storage (bcrypt)

⚠️ **TODO - For $100k+ Production:**
- [ ] Two-Factor Authentication (2FA)
- [ ] IP whitelisting
- [ ] Brute-force protection with exponential backoff
- [ ] Password history & complexity requirements
- [ ] Automatic session timeout (30 min inactivity)
- [ ] Account lockout after failed attempts

### Authorization

✅ **Implemented:**
- Role-based access control (RBAC)
- RLS policies on all tables
- Middleware authentication checks
- User's can only read their own admin record

⚠️ **TODO - For $100k+ Production:**
- [ ] Attribute-based access control (ABAC)
- [ ] Fine-grained permission matrix
- [ ] Resource-level permissions
- [ ] Time-based access restrictions

### Audit & Logging

✅ **Implemented:**
- Admin activity logger middleware
- Server-side logging of all API calls
- User action tracking (email, timestamp)

⚠️ **TODO - For $100k+ Production:**
- [ ] Audit logs table in database
- [ ] Immutable log storage
- [ ] Real-time security alerts
- [ ] Export logs to external SIEM
- [ ] Daily security digest emails

### Data Protection

✅ **Implemented:**
- HTTPS only (via Vercel CDN)
- Secure headers
- CORS protection
- Service role key kept server-side only

⚠️ **TODO - For $100k+ Production:**
- [ ] End-to-end encryption for sensitive data
- [ ] Data at rest encryption
- [ ] PII masking in logs
- [ ] Regular security audits
- [ ] Penetration testing

---

## Admin Management API

### List All Admins

**Requires:** Editor role or higher

```bash
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### Enroll New Admin

**Requires:** Super Admin role

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@ncedi.edu.ng",
    "role": "editor",
    "temporaryPassword": "TempPass123!@#"
  }'
```

### Update Admin Role

**Requires:** Super Admin role

```bash
curl -X PATCH http://localhost:3000/api/admin/users/[user-id] \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

### Deactivate Admin

**Requires:** Super Admin role

```bash
curl -X DELETE http://localhost:3000/api/admin/users/[user-id] \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### "Your account is authenticated, but not enrolled as an admin user"

**Cause:** No admin_users record exists for your account

**Solution:**
1. Check `.env` has `ADMIN_INIT_SECRET` set
2. Run initialization endpoint again (if allowed)
3. Contact Super Admin to enroll you via API

### "No authenticated user – please sign in first" (Connection Test Page)

**Cause:** Session not established or expired

**Solution:**
1. Go to `/admin/login`
2. Sign in with your credentials
3. Then navigate to `/admin/connection-test`

### "Failed to save inquiry to database" (Contact Form)

**Cause:** Service role key invalid or database error

**Solution:**
1. Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env`
2. Check Supabase dashboard for errors
3. Verify `inquiries` table exists and has RLS disabled for service role

### Admin Portal Blank or Not Loading

**Cause:** Build configuration issue

**Solution:**
```bash
# Clear cache and rebuild
rm -rf .nuxt/ .output/
npm run build
npm run dev
```

---

## Best Practices

### Daily Security Checklist

- [ ] Review audit logs for unusual activity
- [ ] Check admin user list for unauthorized accounts
- [ ] Verify no failed login attempts from unusual IPs
- [ ] Ensure all inactive admins are deactivated
- [ ] Backup database daily

### Monthly Security Checklist

- [ ] Rotate service role keys (if rotation available)
- [ ] Review and update RLS policies
- [ ] Audit all role assignments
- [ ] Test disaster recovery procedures
- [ ] Update dependencies for security patches

### Quarterly Security Checklist

- [ ] Full penetration test
- [ ] Security audit by external firm
- [ ] Update security documentation
- [ ] Employee security training
- [ ] Review and update threat model

---

## Support & Escalation

**For Security Issues:**
Contact: security@ncedi.edu.ng

**For Admin Access Issues:**
Contact: admin-support@ncedi.edu.ng

**For Database Issues:**
Contact: dba@ncedi.edu.ng
