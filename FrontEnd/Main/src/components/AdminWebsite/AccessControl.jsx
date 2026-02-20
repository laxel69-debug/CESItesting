/**
 * ═══════════════════════════════════════════════════════════════
 *  ACCESS CONTROL COMPONENTS
 * ═══════════════════════════════════════════════════════════════
 *
 *  <Can module="grades" level="edit">        → shows children only if user can edit grades
 *  <Can module="grades">                     → shows children if user can view grades (any non-hidden)
 *  <ReadOnlyWrap module="grades">            → wraps children in a read-only overlay if view-only
 *  <RBACBadge module="grades" />             → shows a small badge indicating access level
 *  <HideIfNoAccess module="grades">          → hides children if module is "hidden"
 *
 *  Usage example:
 *    <Can module="enrollment" level="full">
 *      <button onClick={handleCreate}>Create Student</button>
 *    </Can>
 */

import React from "react";
import { useRBAC } from "../Auth/RBACContext";

// ─── <Can> — conditional render ─────────────────────────
export function Can({ module, level, fallback = null, children }) {
  const { getAccess, canView, canEdit, canFull } = useRBAC();

  let allowed = false;

  if (!level || level === "view") {
    allowed = canView(module);
  } else if (level === "edit") {
    allowed = canEdit(module);
  } else if (level === "full") {
    allowed = canFull(module);
  } else {
    // Direct comparison: allow if actual level matches or is higher
    const hierarchy = { hidden: 0, view: 1, edit: 2, full: 3 };
    const actual = hierarchy[getAccess(module)] ?? 0;
    const required = hierarchy[level] ?? 0;
    allowed = actual >= required;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}

// ─── <HideIfNoAccess> — hides when module is "hidden" ──
export function HideIfNoAccess({ module, children }) {
  const { canView } = useRBAC();
  if (!canView(module)) return null;
  return <>{children}</>;
}

// ─── <ReadOnlyWrap> — visual read-only overlay ─────────
export function ReadOnlyWrap({ module, children, className = "" }) {
  const { isReadOnly: checkReadOnly, canView } = useRBAC();

  if (!canView(module)) return null;

  const readOnly = checkReadOnly(module);

  return (
    <div
      className={`rbac-wrap ${readOnly ? "rbac-readonly" : ""} ${className}`}
      data-rbac-access={readOnly ? "view" : "editable"}
    >
      {readOnly && (
        <div className="rbac-readonly-banner">
          <span className="rbac-lock-icon">🔒</span>
          <span>Read-Only Access</span>
        </div>
      )}
      {children}
    </div>
  );
}

// ─── <RBACBadge> — small access-level indicator ────────
export function RBACBadge({ module }) {
  const { getAccess } = useRBAC();
  const access = getAccess(module);

  if (access === "hidden") return null;

  const config = {
    full: { label: "Full Access", cls: "rbac-badge-full" },
    edit: { label: "Edit", cls: "rbac-badge-edit" },
    view: { label: "View Only", cls: "rbac-badge-view" },
  };

  const { label, cls } = config[access] || config.view;

  return <span className={`rbac-badge ${cls}`}>{label}</span>;
}

// ─── <RBACButton> — button that respects access level ──
export function RBACButton({
  module,
  requiredLevel = "edit",
  children,
  onClick,
  className = "",
  ...props
}) {
  const { getAccess } = useRBAC();
  const access = getAccess(module);
  const hierarchy = { hidden: 0, view: 1, edit: 2, full: 3 };
  const hasAccess = (hierarchy[access] ?? 0) >= (hierarchy[requiredLevel] ?? 0);

  if (access === "hidden") return null;

  return (
    <button
      className={`${className} ${!hasAccess ? "rbac-btn-disabled" : ""}`}
      onClick={hasAccess ? onClick : undefined}
      disabled={!hasAccess}
      title={!hasAccess ? "You don't have permission for this action" : undefined}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── <RBACInput> — input that becomes read-only ────────
export function RBACInput({
  module,
  requiredLevel = "edit",
  className = "",
  ...props
}) {
  const { getAccess } = useRBAC();
  const access = getAccess(module);
  const hierarchy = { hidden: 0, view: 1, edit: 2, full: 3 };
  const hasAccess = (hierarchy[access] ?? 0) >= (hierarchy[requiredLevel] ?? 0);

  if (access === "hidden") return null;

  return (
    <input
      className={`${className} ${!hasAccess ? "rbac-input-readonly" : ""}`}
      readOnly={!hasAccess}
      disabled={!hasAccess}
      tabIndex={!hasAccess ? -1 : undefined}
      {...props}
    />
  );
}
