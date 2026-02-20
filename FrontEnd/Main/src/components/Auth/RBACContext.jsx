import { createContext, useContext, useMemo } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  resolveAdminSubRole,
  getAccessLevel,
  canView,
  canEdit,
  canFullAccess,
  isReadOnly,
  getSubRoleLabel,
} from "../../config/rbacConfig";

// ─── Context ───────────────────────────────────────────
const RBACContext = createContext(null);

// ─── Provider ──────────────────────────────────────────
export function RBACProvider({ children }) {
  const { user } = useAuth();

  const value = useMemo(() => {
    const subRole = resolveAdminSubRole(user);

    return {
      /** The resolved admin sub-role (e.g. "registrar", "treasurer") or null for non-admin */
      subRole,

      /** Human-readable label */
      subRoleLabel: subRole ? getSubRoleLabel(subRole) : null,

      /** Raw user object from auth */
      user,

      /** Get the access level string for a given module key */
      getAccess: (moduleKey) => (subRole ? getAccessLevel(subRole, moduleKey) : "hidden"),

      /** Boolean helpers scoped to the current user's role */
      canView:    (moduleKey) => (subRole ? canView(subRole, moduleKey) : false),
      canEdit:    (moduleKey) => (subRole ? canEdit(subRole, moduleKey) : false),
      canFull:    (moduleKey) => (subRole ? canFullAccess(subRole, moduleKey) : false),
      isReadOnly: (moduleKey) => (subRole ? isReadOnly(subRole, moduleKey) : true),
    };
  }, [user]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────
export function useRBAC() {
  const ctx = useContext(RBACContext);
  if (!ctx) throw new Error("useRBAC must be used inside <RBACProvider>");
  return ctx;
}

export default RBACContext;
