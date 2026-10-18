import React, { Fragment } from "react";
import { BRAND_NAME } from "@/lib/brand-name";

/** One shared lockup for navigation, footers, copy and admin. */
export function BrandName({ onDark = false, className = "" }: { onDark?: boolean; className?: string }) {
  return <span className={`brand-name${onDark ? " brand-name-on-dark" : ""} ${className}`} aria-label={BRAND_NAME}>
    <span className="brand-initial" lang="te" aria-hidden="true">గ</span><span className="brand-latin" aria-hidden="true">MANA</span>
  </span>;
}

/** Colour the Telugu initial in sentences too, including previously saved content. */
export function BrandText({ children, onDark = false }: { children?: string; onDark?: boolean }) {
  return <>{(children ?? "").split(/(\bGAMANA\b|గMANA)/g).map((part, i) => part === "GAMANA" || part === BRAND_NAME ? <BrandName key={i} onDark={onDark} /> : <Fragment key={i}>{part}</Fragment>)}</>;
}
