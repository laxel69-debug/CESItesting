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

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD SECTION-LEVEL RBAC
// ═══════════════════════════════════════════════════════════════
//  Controls which *sections* inside the Dashboard page each
//  admin sub-role can see.  Keys used by <Dashboard /> to
//  conditionally render cards, charts, tables, and alert panels.
//
//  Access levels follow the same convention:
//    "full"   → section fully visible & interactive
//    "view"   → section visible but read-only / reduced detail
//    "hidden" → section not rendered at all
// ═══════════════════════════════════════════════════════════════

export const DASHBOARD_SECTION_KEYS = {
  KPI_STUDENTS:          "kpi_students",
  KPI_ATTENDANCE:        "kpi_attendance",
  KPI_STAFF:             "kpi_staff",
  KPI_FEES:              "kpi_fees",
  STUDENTS:              "students",
  STUDENTS_GRADES:       "students_grades",       // grade chart inside Students
  STUDENTS_ATTENDANCE:   "students_attendance",    // attendance trend inside Students
  STUDENTS_AT_RISK:      "students_at_risk",       // at-risk table inside Students
  STAFF:                 "staff",
  FINANCES:              "finances",
  ALERTS_ATTENDANCE:     "alerts_attendance",
  ALERTS_FEES:           "alerts_fees",
  ALERTS_ANNOUNCEMENTS:  "alerts_announcements",
  OPERATIONS:            "operations",
};

const DS = DASHBOARD_SECTION_KEYS;

export const DASHBOARD_PERMISSIONS = {
  // ── Full Admin (Principal) — sees everything ─────────
  admin: {
    [DS.KPI_STUDENTS]:         "full",
    [DS.KPI_ATTENDANCE]:       "full",
    [DS.KPI_STAFF]:            "full",
    [DS.KPI_FEES]:             "full",
    [DS.STUDENTS]:             "full",
    [DS.STUDENTS_GRADES]:      "full",
    [DS.STUDENTS_ATTENDANCE]:  "full",
    [DS.STUDENTS_AT_RISK]:     "full",
    [DS.STAFF]:                "full",
    [DS.FINANCES]:             "full",
    [DS.ALERTS_ATTENDANCE]:    "full",
    [DS.ALERTS_FEES]:          "full",
    [DS.ALERTS_ANNOUNCEMENTS]: "full",
    [DS.OPERATIONS]:           "full",
  },

  // ── Registrar — academic focus, no finances ──────────
  registrar: {
    [DS.KPI_STUDENTS]:         "full",
    [DS.KPI_ATTENDANCE]:       "full",
    [DS.KPI_STAFF]:            "full",
    [DS.KPI_FEES]:             "hidden",
    [DS.STUDENTS]:             "full",
    [DS.STUDENTS_GRADES]:      "full",
    [DS.STUDENTS_ATTENDANCE]:  "full",
    [DS.STUDENTS_AT_RISK]:     "full",
    [DS.STAFF]:                "full",
    [DS.FINANCES]:             "hidden",
    [DS.ALERTS_ATTENDANCE]:    "full",
    [DS.ALERTS_FEES]:          "hidden",
    [DS.ALERTS_ANNOUNCEMENTS]: "full",
    [DS.OPERATIONS]:           "hidden",
  },

  // ── Treasurer — financial focus, read-only academic ──
  treasurer: {
    [DS.KPI_STUDENTS]:         "hidden",
    [DS.KPI_ATTENDANCE]:       "hidden",
    [DS.KPI_STAFF]:            "hidden",
    [DS.KPI_FEES]:             "full",
    [DS.STUDENTS]:             "view",
    [DS.STUDENTS_GRADES]:      "hidden",     // no grades access
    [DS.STUDENTS_ATTENDANCE]:  "hidden",
    [DS.STUDENTS_AT_RISK]:     "hidden",
    [DS.STAFF]:                "hidden",
    [DS.FINANCES]:             "full",
    [DS.ALERTS_ATTENDANCE]:    "hidden",
    [DS.ALERTS_FEES]:          "full",
    [DS.ALERTS_ANNOUNCEMENTS]: "full",
    [DS.OPERATIONS]:           "hidden",
  },

  // ── Secretary — limited academic read-only ───────────
  secretary: {
    [DS.KPI_STUDENTS]:         "view",
    [DS.KPI_ATTENDANCE]:       "view",
    [DS.KPI_STAFF]:            "hidden",
    [DS.KPI_FEES]:             "hidden",
    [DS.STUDENTS]:             "view",
    [DS.STUDENTS_GRADES]:      "hidden",
    [DS.STUDENTS_ATTENDANCE]:  "view",
    [DS.STUDENTS_AT_RISK]:     "view",
    [DS.STAFF]:                "hidden",
    [DS.FINANCES]:             "hidden",
    [DS.ALERTS_ATTENDANCE]:    "view",
    [DS.ALERTS_FEES]:          "hidden",
    [DS.ALERTS_ANNOUNCEMENTS]: "full",
    [DS.OPERATIONS]:           "hidden",
  },

  // ── Auditor — everything read-only, no grades ───────
  auditor: {
    [DS.KPI_STUDENTS]:         "view",
    [DS.KPI_ATTENDANCE]:       "view",
    [DS.KPI_STAFF]:            "view",
    [DS.KPI_FEES]:             "view",
    [DS.STUDENTS]:             "view",
    [DS.STUDENTS_GRADES]:      "hidden",     // no grades
    [DS.STUDENTS_ATTENDANCE]:  "view",
    [DS.STUDENTS_AT_RISK]:     "view",
    [DS.STAFF]:                "view",
    [DS.FINANCES]:             "view",
    [DS.ALERTS_ATTENDANCE]:    "view",
    [DS.ALERTS_FEES]:          "view",
    [DS.ALERTS_ANNOUNCEMENTS]: "view",
    [DS.OPERATIONS]:           "hidden",
  },

  // ── Chairperson — read-only overview ─────────────────
  chairperson: {
    [DS.KPI_STUDENTS]:         "view",
    [DS.KPI_ATTENDANCE]:       "view",
    [DS.KPI_STAFF]:            "view",
    [DS.KPI_FEES]:             "view",
    [DS.STUDENTS]:             "view",
    [DS.STUDENTS_GRADES]:      "view",
    [DS.STUDENTS_ATTENDANCE]:  "view",
    [DS.STUDENTS_AT_RISK]:     "view",
    [DS.STAFF]:                "view",
    [DS.FINANCES]:             "view",
    [DS.ALERTS_ATTENDANCE]:    "view",
    [DS.ALERTS_FEES]:          "view",
    [DS.ALERTS_ANNOUNCEMENTS]: "view",
    [DS.OPERATIONS]:           "hidden",
  },

  // ── Custodian — operations only, minimal dashboard ───
  custodian: {
    [DS.KPI_STUDENTS]:         "hidden",
    [DS.KPI_ATTENDANCE]:       "hidden",
    [DS.KPI_STAFF]:            "hidden",
    [DS.KPI_FEES]:             "hidden",
    [DS.STUDENTS]:             "hidden",
    [DS.STUDENTS_GRADES]:      "hidden",
    [DS.STUDENTS_ATTENDANCE]:  "hidden",
    [DS.STUDENTS_AT_RISK]:     "hidden",
    [DS.STAFF]:                "hidden",
    [DS.FINANCES]:             "hidden",
    [DS.ALERTS_ATTENDANCE]:    "hidden",
    [DS.ALERTS_FEES]:          "hidden",
    [DS.ALERTS_ANNOUNCEMENTS]: "view",
    [DS.OPERATIONS]:           "full",
  },
};

// ─── Helper: get dashboard section access ──────────────
export function getDashboardSectionAccess(subRole, sectionKey) {
  const rolePerms = DASHBOARD_PERMISSIONS[subRole];
  if (!rolePerms) return "hidden";
  return rolePerms[sectionKey] || "hidden";
}

export function canViewDashboardSection(subRole, sectionKey) {
  return getDashboardSectionAccess(subRole, sectionKey) !== "hidden";
}

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
