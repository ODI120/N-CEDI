# DEVELOPER REFERENCE CARD
**N-CEDI Admin Portal** | Quick API Reference

## Authentication Flow

```
User Signup/Signin
    ↓
Supabase Auth (handles credentials)
    ↓
Session token created
    ↓
Check admin_users table via RLS
    ↓
If admin_users.is_active = true → Access granted ✅
If admin_users.is_active = false → Access denied ❌
If NO admin_users record → Redirect to setup
```

---

## API Endpoints

### 1️⃣ Initialize First Admin (One-Time)

```bash
POST /api/admin/init

Headers:
  Content-Type: application/json

Body:
{
  "email": "admin@ncedi.edu.ng",
  "temporaryPassword": "Temp123!@#",
  "initSecret": "your-init-secret-from-.env"
}

Response (201):
{
  "success": true,
  "message": "Super admin user created successfully...",
  "user": {
    "id": "uuid",
    "email": "admin@ncedi.edu.ng",
    "role": "super_admin"
  }
}

Errors:
- 401: Invalid initSecret
- 403: Admin users already exist
- 400: Invalid email/password format
- 500: Database error
```

### 2️⃣ List All Admins

```bash
GET /api/admin/users

Headers:
  Authorization: Bearer $ACCESS_TOKEN

Query Params:
  (none)

Response (200):
{
  "success": true,
  "data": [
    {
      "user_id": "uuid1",
      "email": "admin@ncedi.edu.ng",
      "role": "super_admin",
      "is_active": true,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    ...
  ]
}

Errors:
- 401: Not authenticated
- 403: Insufficient permissions (need editor+)
- 500: Database error
```

### 3️⃣ Create New Admin

```bash
POST /api/admin/users

Headers:
  Authorization: Bearer $ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "email": "newadmin@ncedi.edu.ng",
  "role": "editor",  // Can be: super_admin, admin, editor, viewer
  "temporaryPassword": "Optional-temp-pass"  // Auto-generated if omitted
}

Response (201):
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "user_id": "uuid",
    "email": "newadmin@ncedi.edu.ng",
    "role": "editor",
    "temporary_password": "GeneratedPass123!@#"
  }
}

Errors:
- 401: Not authenticated
- 403: Need super_admin role
- 400: Invalid email/role
- 409: User already exists
- 500: Database error
```

### 4️⃣ Update Admin

```bash
PATCH /api/admin/users/[user-id]

Headers:
  Authorization: Bearer $ACCESS_TOKEN
  Content-Type: application/json

Body:
{
  "role": "admin",      // Change role (super_admin only)
  "is_active": true     // Activate/deactivate (super_admin only)
}

Response (200):
{
  "success": true,
  "message": "Admin user updated successfully",
  "user": {
    "user_id": "uuid",
    "role": "admin",
    "is_active": true,
    "updated_at": "2025-01-15T10:30:00Z"
  }
}

Errors:
- 401: Not authenticated
- 403: Need super_admin for role changes
- 400: No updates provided
- 404: User not found
- 500: Database error
```

### 5️⃣ Deactivate Admin

```bash
DELETE /api/admin/users/[user-id]

Headers:
  Authorization: Bearer $ACCESS_TOKEN

Response (200):
{
  "success": true,
  "message": "Admin user deactivated successfully"
}

Errors:
- 401: Not authenticated
- 403: Need super_admin role
- 400: Cannot deactivate self
- 404: User not found
- 500: Database error
```

---

## Database Schema

### admin_users Table

```sql
CREATE TABLE public.admin_users (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id),
  role          admin_role NOT NULL DEFAULT 'viewer',
    -- Values: super_admin | admin | editor | viewer
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamp with time zone DEFAULT now(),
  updated_at    timestamp with time zone DEFAULT now()
);

-- RLS Policies:
-- 1. Users can read their own record
-- 2. Users can update their own record (non-destructive)
-- 3. Editors+ can read all records
-- 4. Admins can manage all records
```

### Role Enum

```sql
CREATE TYPE public.admin_role AS ENUM (
  'super_admin',  -- Full system access
  'admin',        -- Content management + admin view
  'editor',       -- Create/edit content
  'viewer'        -- Read-only
);
```

---

## Middleware & Plugins

### Admin Route Middleware (`admin.global.ts`)

Runs on every `/admin/*` route:

```typescript
1. Allow /admin/login without auth
2. Check if user is authenticated
   ↓
   YES → Check admin_users table
   NO → Redirect to login

3. Check admin_users.is_active = true
   ↓
   YES → Allow access ✅
   NO → Redirect to /admin/login?reason=not_admin
```

### Audit Logger Middleware (`admin-activity-logger.ts`)

Logs all `/api/admin/*` requests:

```typescript
{
  user_id: "uuid",
  email: "admin@ncedi.edu.ng",
  action: "POST",
  resource: "/api/admin/users",
  status: 201,
  ip_address: "192.168.1.1",
  timestamp: "2025-01-15T10:00:00Z",
  duration_ms: 250
}
```

---

## Environment Variables

### Required

```bash
# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # CRITICAL: Server-side only!

# Admin Initialization
ADMIN_INIT_SECRET=random-hex-string  # Generate with: openssl rand -hex 32
```

### Optional

```bash
# If set in runtimeConfig
NUXT_ADMIN_INIT_SECRET=...
```

---

## RLS Policies Explained

### Policy: "Admin users can read own row"
```sql
FOR SELECT
USING (auth.uid() = user_id)

-- Allows: User can see their own admin_users record
-- Use case: Display current role in UI
```

### Policy: "Users can update own"
```sql
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)

-- Allows: User can edit their own record (but not change role)
-- Use case: Update profile info
```

### Policy: "Admins can manage admin records"
```sql
FOR UPDATE
USING (public.is_admin('editor'))
WITH CHECK (public.is_admin('editor'))

-- Allows: Editors+ can update any admin record
-- Use case: Admin dashboard operations
```

---

## Debugging

### Check User's Admin Status

```sql
SELECT user_id, role, is_active
FROM public.admin_users
WHERE user_id = 'user-uuid-here';

-- If no result: User not enrolled as admin
-- If is_active = false: User deactivated
-- If role = 'viewer': User has limited access
```

### View Audit Logs (Server)

```bash
# Check server logs for ADMIN_AUDIT entries:
grep "ADMIN_AUDIT" server.log

# Output example:
[ADMIN_AUDIT] {"user_id":"abc123","email":"admin@ncedi.edu.ng","action":"POST",...}
```

### Test Admin API Locally

```bash
# 1. Get auth token (after login)
TOKEN=$(get-from-browser-storage-or-session)

# 2. Test API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/users
```

---

## Error Handling

### Common Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 401 | Not authenticated | No session | Login at `/admin/login` |
| 403 | Insufficient permissions | Wrong role | Ask admin to upgrade role |
| 400 | Invalid email format | Bad input | Validate before API call |
| 409 | User already exists | Duplicate email | Use different email |
| 500 | Database error | Server issue | Check Supabase status |
| 503 | Service unavailable | Init disabled | Admin already exists |

### Error Response Format

```json
{
  "statusCode": 401,
  "statusMessage": "Authentication required."
}
```

---

## Security Notes

✅ **Do's:**
- Store tokens securely (httpOnly cookies)
- Validate all inputs server-side
- Check role before sensitive operations
- Log all admin actions
- Rotate service role keys regularly
- Use HTTPS always

❌ **Don'ts:**
- Expose service role key to client
- Trust client-side role checks
- Commit .env to version control
- Log user passwords/sensitive data
- Use hardcoded secrets
- Allow SQL injection via inputs

---

## Performance Optimization

### Caching Strategy

```typescript
// Cache admin users list (5 minutes)
const { data, pending, refresh } = useAsyncData(
  'admin-users',
  () => fetchAdmins(),
  { watch: [route], ttl: 300 }
)

// Invalidate on changes
const createAdmin = async () => {
  await api.createAdmin(...)
  await refresh()  // Refetch list
}
```

### Pagination (if needed)

```bash
GET /api/admin/users?page=1&limit=50
```

---

## Status & Versions

**API Version:** 1.0  
**Last Updated:** 2025-01-15  
**Status:** ✅ Production Ready  
**Stability:** Stable