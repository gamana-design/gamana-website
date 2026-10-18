import React, { Fragment } from "react";
import { BRAND_NAME, BRAND_INITIAL_COLOR } from "@/lib/brand-name";
import { BRAND_GLYPH_PATH, BRAND_GLYPH_VIEWBOX } from "@/lib/brand-glyph";

/** Standalone brand symbol. The outlined glyph does not depend on font loading. */
export function BrandGlyph({ onDark = false, className = "", size = 32 }: { onDark?: boolean; className?: string; size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox={BRAND_GLYPH_VIEWBOX} width={size} height={size} role="img" aria-label={`${BRAND_NAME} symbol — గ`} className={className}>
    {onDark && <rect width="512" height="512" fill="#F5EDDA" />}
    <path fill={BRAND_INITIAL_COLOR} d={BRAND_GLYPH_PATH} />
  </svg>;
}

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
