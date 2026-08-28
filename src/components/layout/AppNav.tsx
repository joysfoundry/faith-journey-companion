import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BottomNav } from "./BottomNav";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { SideNav } from "./SideNav";

/**
 * Primary navigation chrome: a left rail on md+, and on mobile a bottom tab bar
 * whose Menu button opens the full menu as a drawer. Each surface is
 * breakpoint-gated, so only one shows at a time.
 */
export function AppNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close the drawer whenever navigation lands on a new route.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <SideNav />
      <BottomNav onMenuClick={() => setMenuOpen(true)} />
      <MobileNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
