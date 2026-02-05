

# Password Reset & Admin Management Implementation

## Overview
This plan adds two key features:
1. **Forgot Password** - Allow users to reset their password via email from the login page
2. **Admin Role Management** - A section for existing admins to assign/remove admin roles for team members

---

## Feature 1: Forgot Password

### What We'll Build
- Add "Passwort vergessen?" link on the login page
- Create a password reset request form (email input)
- Create a password reset confirmation page to set new password
- Use Supabase's built-in `resetPasswordForEmail` feature

### Files to Modify/Create

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Login.tsx` | MODIFY | Add "Forgot Password" link and modal/toggle state |
| `src/pages/ResetPassword.tsx` | CREATE | Page for entering new password after clicking email link |
| `src/contexts/AuthContext.tsx` | MODIFY | Add `resetPassword` function using Supabase |
| `src/App.tsx` | MODIFY | Add route for `/reset-password` page |

### User Flow
```
1. User clicks "Passwort vergessen?" on login page
2. Form appears asking for email address
3. User enters email, clicks "Reset senden"
4. Supabase sends password reset email
5. User clicks link in email → redirected to /reset-password?token=...
6. User enters new password, confirms
7. Password updated, redirected to login
```

---

## Feature 2: Admin Role Management

### What We'll Build
- Add "Team-Rollen" (Team Roles) section to the Team Portal
- Table showing all users with their current role status
- Toggle to grant/revoke admin role
- Only existing admins can access this (already protected by AdminRoute)

### Files to Modify/Create

| File | Action | Description |
|------|--------|-------------|
| `src/pages/TeamCustomerList.tsx` | MODIFY | Add "Admin-Verwaltung" tab or section |
| `src/components/team/AdminRoleManager.tsx` | CREATE | Component for managing admin roles |

### UI Design
```
┌─────────────────────────────────────────────────────────────────┐
│  Admin-Verwaltung                                               │
│  ━━━━━━━━━━━━━━━━━                                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Name              │ E-Mail               │ Admin-Rolle  │   │
│  ├───────────────────┼──────────────────────┼──────────────┤   │
│  │ Julian Elsässer   │ julian@example.com   │   [✓]        │   │
│  │ Max Mustermann    │ max@example.com      │   [ ]        │   │
│  │ Simon Rolfes      │ simon@example.com    │   [ ]        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [✓] = Admin (can edit team section)                           │
│  [ ] = Regular user (customer access only)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Database Operations
- **Grant admin**: `INSERT INTO user_roles (user_id, role) VALUES (uuid, 'admin')`
- **Revoke admin**: `DELETE FROM user_roles WHERE user_id = uuid AND role = 'admin'`
- Existing RLS policies already allow admins to manage roles

---

## Technical Implementation Details

### Password Reset (AuthContext)

```typescript
// New function to add to AuthContext
const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error };
};

// New function to update password after reset
const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { error };
};
```

### Admin Role Toggle Logic

```typescript
// Grant admin role
const grantAdmin = async (userId: string) => {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: 'admin' });
  return { error };
};

// Revoke admin role
const revokeAdmin = async (userId: string) => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'admin');
  return { error };
};
```

---

## Implementation Order

1. **AuthContext Updates**
   - Add `resetPassword` and `updatePassword` functions
   - Export them in context type

2. **Login Page Modifications**
   - Add "Passwort vergessen?" link below password field
   - Add toggle state to show reset form
   - Implement email submission for password reset

3. **Create ResetPassword Page**
   - New page at `/reset-password`
   - Form for new password + confirmation
   - Handle token from URL
   - Call `updatePassword` on submit

4. **Update App.tsx Routes**
   - Add `/reset-password` route (public, not protected)

5. **Create AdminRoleManager Component**
   - Fetch all profiles
   - For each, check if they have admin role
   - Display toggle switch
   - Handle grant/revoke with confirmation

6. **Add to Team Portal**
   - Add new section/tab in TeamCustomerList
   - Include AdminRoleManager component

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/contexts/AuthContext.tsx` | MODIFY - Add resetPassword, updatePassword |
| `src/pages/Login.tsx` | MODIFY - Add forgot password UI |
| `src/pages/ResetPassword.tsx` | CREATE - New password entry page |
| `src/App.tsx` | MODIFY - Add /reset-password route |
| `src/components/team/AdminRoleManager.tsx` | CREATE - Role management UI |
| `src/pages/TeamCustomerList.tsx` | MODIFY - Add Admin section |

---

## Security Considerations

1. **Password Reset**
   - Uses Supabase's secure token-based reset flow
   - Token expires after configurable time
   - Redirect URL is validated by Supabase

2. **Admin Management**
   - Only accessible via AdminRoute (already implemented)
   - Uses existing RLS policies on user_roles table
   - Admins cannot remove their own admin role (prevents lockout)
   - Confirmation dialog before role changes

