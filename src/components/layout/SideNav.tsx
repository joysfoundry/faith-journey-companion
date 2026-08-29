import { Brand } from "./Brand";
import { NavSections } from "./NavSections";

/** Desktop primary nav — a fixed left rail. Hidden below md (see BottomNav). */
export function SideNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border/70 bg-parchment/95 backdrop-blur md:flex"
    >
      <div className="px-5 py-5">
        <Brand tagline />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 pb-6">
        <NavSections />
      </div>
    </nav>
  );
}
