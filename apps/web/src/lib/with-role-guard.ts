import { redirect } from "next/navigation";

/**
 * Server-side role guard for Next.js 14 layouts and pages.
 * Ensures the user is authenticated and has the required role.
 */
export async function withRoleGuard(allowedRoles: string | string[]): Promise<void> {
  const { createClient } = await import("./supabase-server");
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const roles = (user.app_metadata?.roles || 
                 (user.app_metadata?.role ? [user.app_metadata.role] : [])) as string[];

  // super_admin always has access
  const isSuperAdmin = roles.includes("super_admin");
  const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRequiredRole = roles.some(r => rolesToCheck.includes(r));

  if (!isSuperAdmin && !hasRequiredRole) {
    redirect("/unauthorized");
  }
}
