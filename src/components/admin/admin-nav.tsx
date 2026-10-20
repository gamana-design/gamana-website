"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  ["/admin/products", "Products"],
  ["/admin/products/new", "Add product"],
  ["/admin/password", "Change password"],
];

export function AdminNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(([href, label]) => {
        const active =
          href === "/admin/products/new"
            ? path === href
            : path.startsWith(href) && path !== "/admin/products/new";
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-xs ${active ? "bg-bone text-kalam" : "text-bone/60 hover:bg-bone/10"}`}
          >
            {label}
          </Link>
        );
      })}
      <button
        onClick={async () => {
          await fetch("/api/admin/logout", { method: "POST" });
          router.replace("/admin/login");
          router.refresh();
        }}
        className="ml-auto rounded-full border border-bone/15 px-4 py-2 text-xs text-bone/65"
      >
        Sign out
      </button>
    </div>
  );
}
