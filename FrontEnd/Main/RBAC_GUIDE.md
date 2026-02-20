# Front-End Role-Based Access Control (RBAC) Guide

## Overview

This system implements **role-based access control** for the Admin dashboard using a single layout with **conditional rendering** based on each admin's sub-role. The admin account itself (`ADMIN` role) is untouched — sub-roles are controlled via `AdminProfile.permissions_level`.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  rbacConfig.js         (Permissions Matrix)      │
├─────────────────────────────────────────────────┤
│  RBACContext.jsx        (React Context + Hook)    │
├─────────────────────────────────────────────────┤
│  AccessControl.jsx      (UI Components)           │
│  ├── <Can>              Conditional render        │
│  ├── <ReadOnlyWrap>     Read-only overlay         │
│  ├── <RBACBadge>        Access level indicator    │
│  ├── <RBACButton>       Permission-aware button   │
│  ├── <RBACInput>        Permission-aware input    │
│  └── <HideIfNoAccess>   Hide when no access       │
├─────────────────────────────────────────────────┤
│  RBAC.css               (Visual styling)          │
├─────────────────────────────────────────────────┤
│  AdminDashboard.jsx     (Wraps with RBACProvider) │
│  Sidebar.jsx            (Filters menu items)      │
│  Header.jsx             (Shows access badge)      │
└─────────────────────────────────────────────────┘
```

---

## Files Created / Modified

### New Files
| File | Purpose |
|------|---------|
| `src/config/rbacConfig.js` | Central permissions matrix and helper functions |
| `src/components/Auth/RBACContext.jsx` | React context provider + `useRBAC()` hook |
| `src/components/AdminWebsite/AccessControl.jsx` | Reusable RBAC UI components |
| `src/components/AdminWebsiteCSS/RBAC.css` | Visual styles for read-only, badges, etc. |

### Modified Files
| File | Changes |
|------|---------|
| `AdminDashboard.jsx` | Wraps with `<RBACProvider>`, uses `<ReadOnlyWrap>` |
| `Sidebar.jsx` | Filters menu items based on role permissions |
| `Header.jsx` | Shows access level badge next to page title |
| `BackEnd/accounts/models.py` | Added `PERMISSION_LEVEL_CHOICES` to `AdminProfile` |
| `BackEnd/accounts/views.py` | Returns `permissions_level` in login & `/me` APIs |
| `BackEnd/accounts/admin.py` | Shows `permissions_level` dropdown in Django admin |

---

## Permissions Matrix

| Role | Dashboard | Users | Enrollment | Classes | Grades | Tuition | Transactions | Payments | CMS | Reports |
|------|-----------|-------|------------|---------|--------|---------|--------------|----------|-----|---------|
| **Admin** | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| **Registrar** | Full | View | Full | Full | Full | View | View | View | View | View |
| **Treasurer** | View | Hidden | View | View | Hidden | Full | Full | Full | Hidden | View |
| **Secretary** | View | Edit | Edit | View | Hidden | View | View | View | Full | Hidden |
| **Auditor** | View | Hidden | View | View | View | View | View | View | Hidden | View |
| **Chairperson** | View | Hidden | View | View | View | View | View | Hidden | Hidden | View |
| **Custodian** | View | Hidden | Hidden | Hidden | Hidden | Hidden | Hidden | Hidden | Hidden | Hidden |

### Access Levels
- **Full** → Create, Read, Update, Delete (all buttons/inputs active)
- **Edit** → Read + Update only (create/delete buttons disabled)
- **View** → Read-only (yellow banner, inputs disabled, buttons greyed out)
- **Hidden** → Module removed from sidebar and inaccessible

---

## How It Works

### 1. User Login Flow
```
Login → Backend returns { id, username, role, permissions_level }
                                                    ↓
                              Frontend stores in localStorage
                                                    ↓
                         RBACContext reads permissions_level
                                                    ↓
                    resolveAdminSubRole() maps to "registrar", etc.
                                                    ↓
                         All components use useRBAC() hook
```

### 2. Setting Up a Sub-Role (Backend)
1. Go to Django Admin → Users → select an ADMIN user
2. Scroll to **Admin RBAC Settings** section
3. Set `permissions_level` to one of: `registrar`, `treasurer`, `secretary`, `auditor`, `chairperson`, `custodian`
4. Leave blank for full admin access
5. Save

### 3. Frontend Detection
The `RBACContext` reads `user.permissions_level` from the auth context:
- If empty/null → defaults to `"admin"` (full access)
- If set → maps to the permissions matrix in `rbacConfig.js`

---

## Usage Examples

### Hide a section entirely based on access
```jsx
import { Can } from "./AccessControl";

// Only shows for users with edit or full access to enrollment
<Can module="enrollment" level="edit">
  <button onClick={handleCreate}>Add Student</button>
</Can>
```

### Wrap content in read-only overlay
```jsx
import { ReadOnlyWrap } from "./AccessControl";

// Automatically shows yellow "Read-Only Access" banner
// and disables all interactive elements if user has view-only access
<ReadOnlyWrap module="grades">
  <GradesTable />
</ReadOnlyWrap>
```

### Permission-aware button
```jsx
import { RBACButton } from "./AccessControl";

// Auto-disabled + greyed out if user lacks edit access
<RBACButton module="enrollment" requiredLevel="edit" onClick={handleSave}>
  Save Changes
</RBACButton>
```

### Permission-aware input
```jsx
import { RBACInput } from "./AccessControl";

// Auto read-only if user lacks edit access
<RBACInput
  module="users"
  requiredLevel="edit"
  value={contactNumber}
  onChange={(e) => setContactNumber(e.target.value)}
/>
```

### Check access in code
```jsx
import { useRBAC } from "../Auth/RBACContext";

function MyComponent() {
  const { canEdit, canFull, isReadOnly, getAccess } = useRBAC();

  if (canEdit("enrollment")) {
    // show edit form
  }

  const access = getAccess("grades"); // "full" | "edit" | "view" | "hidden"
}
```

### Show access level badge
```jsx
import { RBACBadge } from "./AccessControl";

<RBACBadge module="grades" />
// Renders: [Full Access] or [View Only] or [Edit] badge
```

---

## Visual Design

### Read-Only Modules
- **Yellow banner** at top: "🔒 Read-Only Access"
- All buttons, inputs, selects → `opacity: 0.55`, `cursor: not-allowed`
- Data tables and text remain fully readable

### Disabled Buttons
- Greyed out with `opacity: 0.45` + `grayscale(30%)`
- `pointer-events: none` + tooltip "You don't have permission"

### Sidebar
- Hidden modules don't appear at all
- Role-specific color accent on left border (blue for registrar, yellow for treasurer, etc.)
- Role indicator with pulsing dot in user card

### Header
- Access level badge (green/blue/yellow) next to page title

---

## Backend Integration Notes

### What the backend needs to do:
1. **Already done**: `AdminProfile.permissions_level` has choices dropdown
2. **Already done**: Login API returns `permissions_level`
3. **Already done**: `/me` API returns `permissions_level`

### For production-grade security:
The frontend RBAC is for **UX only**. The backend should **also** check permissions on each API endpoint. Example middleware:

```python
# accounts/permissions.py (suggestion for future)
from rest_framework.permissions import BasePermission

class HasAdminSubRole(BasePermission):
    """
    Check admin sub-role permissions on the backend.
    Usage: permission_classes = [IsAuthenticated, HasAdminSubRole('registrar', 'admin')]
    """
    def __init__(self, *allowed_roles):
        self.allowed_roles = allowed_roles

    def has_permission(self, request, view):
        user = request.user
        if user.role != "ADMIN":
            return False
        try:
            level = user.admin_profile.permissions_level or "admin"
        except:
            level = "admin"
        return level in self.allowed_roles or "admin" in self.allowed_roles
```

---

## Testing Sub-Roles

### Quick way to test in Django shell:
```python
from accounts.models import User, AdminProfile

user = User.objects.get(username="your_admin_user")
profile, _ = AdminProfile.objects.get_or_create(user=user)
profile.permissions_level = "registrar"  # or "treasurer", "secretary", etc.
profile.save()
```

### Quick way to test in frontend (dev only):
Temporarily override in `RBACContext.jsx`:
```jsx
// For testing — force a specific sub-role:
const subRole = "treasurer";  // instead of resolveAdminSubRole(user)
```

---

## Adding New Modules

1. Add a new key to `MODULES` in `rbacConfig.js`
2. Add access levels for each role in the `PERMISSIONS` object
3. Add the sidebar menu item (it will auto-filter based on RBAC)
4. Use `<ReadOnlyWrap module="new-module">` in the content area

## Adding New Roles

1. Add the role string to `ADMIN_SUB_ROLES` array
2. Add a full permissions entry in the `PERMISSIONS` object
3. Add to `SUB_ROLE_LABELS` for display name
4. Add to `AdminProfile.PERMISSION_LEVEL_CHOICES` in the backend
5. Add CSS color for `.rbac-role-dot.role-newrole` and `.as-sidebar[data-role="newrole"]`
