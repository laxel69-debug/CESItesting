/**
 * ═══════════════════════════════════════════════════════════════
 *  ROLE-BASED ACCESS CONTROL (RBAC) — CONFIGURATION
 * ═══════════════════════════════════════════════════════════════
 *
 *  Access Levels:
 *    "full"     → Can create, read, update, delete
 *    "edit"     → Can read and update (but not create/delete)
 *    "view"     → Read-only (inputs disabled, buttons greyed)
 *    "hidden"   → Module/section completely hidden
 *
 *  Admin Sub-Roles:
 *    Stored in `user.permissions_level` from AdminProfile.
 *    Falls back to "admin" (full access) when not set.
 *
 *  BACKEND NOTE:
 *    The backend should return `permissions_level` in the user
 *    object from both /api/accounts/login/ and /api/accounts/me/.
 *    Valid values: "registrar", "treasurer", "secretary",
 *                  "auditor", "chairperson", "custodian"
 *    If empty/null → treated as full admin.
 * ═══════════════════════════════════════════════════════════════
 */

// ─── All recognized admin sub-roles ────────────────────
export const ADMIN_SUB_ROLES = [
  "admin",        // Full admin (default when permissions_level is empty)
  "registrar",
  "treasurer",
  "secretary",
  "auditor",
  "chairperson",
  "custodian",
];

// ─── Module keys (match sidebar menu IDs) ──────────────
export const MODULES = {
  DASHBOARD:           "dashboard",
  USERS:               "users",
  ENROLLMENT:          "enrollment",
  CLASSES:             "classes",
  SUBJECTS:            "subjects",
  ASSIGN_TEACHERS:     "assign-teachers",
  GRADES:              "grades",
  TUITION_MANAGEMENT:  "tuition_management",
  TRANSACTION_HISTORY: "transaction-history",
  PAYMENT_REMINDERS:   "payment-reminders",
  CMS:                 "cms",
  REPORTS:             "reports",
};

// ─── Permissions matrix ────────────────────────────────
// Maps: role → module → access level
const PERMISSIONS = {
  // ── Full Admin ──────────────────────────────────────
  admin: {
    [MODULES.DASHBOARD]:           "full",
    [MODULES.USERS]:               "full",
    [MODULES.ENROLLMENT]:          "full",
    [MODULES.CLASSES]:             "full",
    [MODULES.SUBJECTS]:            "full",
    [MODULES.ASSIGN_TEACHERS]:     "full",
    [MODULES.GRADES]:              "full",
    [MODULES.TUITION_MANAGEMENT]:  "full",
    [MODULES.TRANSACTION_HISTORY]: "full",
    [MODULES.PAYMENT_REMINDERS]:   "full",
    [MODULES.CMS]:                 "full",
    [MODULES.REPORTS]:             "full",
  },

  // ── Registrar ───────────────────────────────────────
  // Academic: Full  |  Financial: View-only  |  Alerts: Read-only
  registrar: {
    [MODULES.DASHBOARD]:           "full",
    [MODULES.USERS]:               "view",
    [MODULES.ENROLLMENT]:          "full",
    [MODULES.CLASSES]:             "full",
    [MODULES.SUBJECTS]:            "full",
    [MODULES.ASSIGN_TEACHERS]:     "full",
    [MODULES.GRADES]:              "full",
    [MODULES.TUITION_MANAGEMENT]:  "view",
    [MODULES.TRANSACTION_HISTORY]: "view",
    [MODULES.PAYMENT_REMINDERS]:   "view",
    [MODULES.CMS]:                 "view",
    [MODULES.REPORTS]:             "view",
  },

  // ── Treasurer ───────────────────────────────────────
  // Academic: View-only  |  Financial: Full  |  Alerts: Hidden/Read-only
  treasurer: {
    [MODULES.DASHBOARD]:           "view",
    [MODULES.USERS]:               "hidden",
    [MODULES.ENROLLMENT]:          "view",
    [MODULES.CLASSES]:             "view",
    [MODULES.SUBJECTS]:            "hidden",
    [MODULES.ASSIGN_TEACHERS]:     "hidden",
    [MODULES.GRADES]:              "hidden",
    [MODULES.TUITION_MANAGEMENT]:  "full",
    [MODULES.TRANSACTION_HISTORY]: "full",
    [MODULES.PAYMENT_REMINDERS]:   "full",
    [MODULES.CMS]:                 "hidden",
    [MODULES.REPORTS]:             "view",
  },

  // ── Secretary ───────────────────────────────────────
  // Academic: Edit parent info, send notifications  |  Financial: View-only  |  Alerts: Show failed payments
  secretary: {
    [MODULES.DASHBOARD]:           "view",
    [MODULES.USERS]:               "edit",     // can edit parent contact info
    [MODULES.ENROLLMENT]:          "edit",     // can edit contact details
    [MODULES.CLASSES]:             "view",
    [MODULES.SUBJECTS]:            "hidden",
    [MODULES.ASSIGN_TEACHERS]:     "hidden",
    [MODULES.GRADES]:              "hidden",
    [MODULES.TUITION_MANAGEMENT]:  "view",
    [MODULES.TRANSACTION_HISTORY]: "view",
    [MODULES.PAYMENT_REMINDERS]:   "edit",     // can send payment reminders/notifications
    [MODULES.CMS]:                 "full",     // can send notifications
    [MODULES.REPORTS]:             "hidden",
  },

  // ── Auditor ─────────────────────────────────────────
  // Everything read-only
  auditor: {
    [MODULES.DASHBOARD]:           "view",
    [MODULES.USERS]:               "hidden",
    [MODULES.ENROLLMENT]:          "view",
    [MODULES.CLASSES]:             "view",
    [MODULES.SUBJECTS]:            "view",
    [MODULES.ASSIGN_TEACHERS]:     "hidden",
    [MODULES.GRADES]:              "view",
    [MODULES.TUITION_MANAGEMENT]:  "view",
    [MODULES.TRANSACTION_HISTORY]: "view",
    [MODULES.PAYMENT_REMINDERS]:   "view",
    [MODULES.CMS]:                 "hidden",
    [MODULES.REPORTS]:             "view",
  },

  // ── Chairperson ─────────────────────────────────────
  // Read-only aggregated dashboards & reports
  chairperson: {
    [MODULES.DASHBOARD]:           "view",
    [MODULES.USERS]:               "hidden",
    [MODULES.ENROLLMENT]:          "view",
    [MODULES.CLASSES]:             "view",
    [MODULES.SUBJECTS]:            "view",
    [MODULES.ASSIGN_TEACHERS]:     "hidden",
    [MODULES.GRADES]:              "view",
    [MODULES.TUITION_MANAGEMENT]:  "view",
    [MODULES.TRANSACTION_HISTORY]: "view",
    [MODULES.PAYMENT_REMINDERS]:   "hidden",
    [MODULES.CMS]:                 "hidden",
    [MODULES.REPORTS]:             "view",
  },

  // ── Custodian ───────────────────────────────────────
  // Everything hidden (no academic/financial/alerts access)
  custodian: {
    [MODULES.DASHBOARD]:           "view",   // basic dashboard only
    [MODULES.USERS]:               "hidden",
    [MODULES.ENROLLMENT]:          "hidden",
    [MODULES.CLASSES]:             "hidden",
    [MODULES.SUBJECTS]:            "hidden",
    [MODULES.ASSIGN_TEACHERS]:     "hidden",
    [MODULES.GRADES]:              "hidden",
    [MODULES.TUITION_MANAGEMENT]:  "hidden",
    [MODULES.TRANSACTION_HISTORY]: "hidden",
    [MODULES.PAYMENT_REMINDERS]:   "hidden",
    [MODULES.CMS]:                 "hidden",
    [MODULES.REPORTS]:             "hidden",
  },
};

export default PERMISSIONS;

// ─── Helper: resolve the effective admin sub-role ──────
export function resolveAdminSubRole(user) {
  if (!user || user.role !== "ADMIN") return null;
  const level = (user.permissions_level || "").toLowerCase().trim();
  if (!level || !ADMIN_SUB_ROLES.includes(level)) return "admin";
  return level;
}

// ─── Helper: get access level for a module ─────────────
export function getAccessLevel(subRole, moduleKey) {
  const rolePerms = PERMISSIONS[subRole];
  if (!rolePerms) return "hidden";
  return rolePerms[moduleKey] || "hidden";
}

// ─── Helper: check boolean permissions ─────────────────
export function canView(subRole, moduleKey) {
  const level = getAccessLevel(subRole, moduleKey);
  return level !== "hidden";
}

export function canEdit(subRole, moduleKey) {
  const level = getAccessLevel(subRole, moduleKey);
  return level === "full" || level === "edit";
}

export function canFullAccess(subRole, moduleKey) {
  return getAccessLevel(subRole, moduleKey) === "full";
}

export function isReadOnly(subRole, moduleKey) {
  return getAccessLevel(subRole, moduleKey) === "view";
}

// ─── Helper: human-readable label for sub-role ─────────
export const SUB_ROLE_LABELS = {
  admin:       "Administrator",
  registrar:   "Registrar",
  treasurer:   "Treasurer",
  secretary:   "Secretary",
  auditor:     "Auditor",
  chairperson: "Chairperson",
  custodian:   "Custodian",
};

export function getSubRoleLabel(subRole) {
  return SUB_ROLE_LABELS[subRole] || "Administrator";
}
