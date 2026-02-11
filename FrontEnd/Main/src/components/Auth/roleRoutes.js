export const ROLE_HOME = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  PARENT_STUDENT: "/parent",
};

export function getRoleHome(role) {
  return ROLE_HOME[role] || "/unauthorized";
}
