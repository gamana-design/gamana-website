import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "../src/components/site-footer";

test("footer ends with an accessible admin login link and decorative sign-in icon", () => {
  const markup = renderToStaticMarkup(createElement(SiteFooter));
  const links = [...markup.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map(m => m[0]);
  const last = links.at(-1)!;
  assert.match(last, /href="\/admin\/login"/);
  assert.match(last, /Admin login/);
  assert.match(last, /<svg[^>]*aria-hidden="true"/);
  assert.match(last, /min-h-11/);
  assert.match(last, /focus-visible:outline/);
  assert.ok(markup.indexOf('footer-bottom') < markup.indexOf('href="/admin/login"'));
});
