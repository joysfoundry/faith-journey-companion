/**
 * Layout for the guest "follow-along" routes (ACTS-94). A pure passthrough so the
 * two children can be siblings rather than one shadowing the other:
 *   - `/follow`            → the fragment link            (follow.index.tsx)
 *   - `/follow/$shareId`   → the short titled backend link (follow.$shareId.tsx)
 */
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/follow")({
  component: () => <Outlet />,
});
