# Collection storybooks & Shop the Look

## For the owner

1. Open **Lookbook** in the website menu.
2. Click **Bay Breeze**, its book cover, or **Open the storybook**.
3. On a computer, read two pages together. On a phone, read one page at a time.
4. Use **Next / Previous**, choose a chapter, or swipe horizontally. Keyboard users can focus the book and use the left/right arrow keys.
5. Tap the small star-shaped markers on selected photographs to see the actual tee, current price, available sizes, and **Add to bag**. The bag opens without losing your place in the story.
6. **View the piece & full details** opens the existing product page. **Back to the library** returns to the collection books.

The first volume has eight pages: the feeling, the collection in the world, a closer look at the artwork, and the pieces. The river inspiration artwork is explicitly labelled as imagined, not a documentary photograph.

### Behind-the-scenes material

No genuine BTS files were supplied with this task. The BTS chapter is supported but hidden, rather than filled with invented sketches, factory footage, shoot stories or existing model photos disguised as making-of material.

To publish it, supply the original sketches, process photos, short films and any captions / context you want included. Confirm that the material is yours to publish. Films with speech or meaningful audio need captions; a transcript can be included too. The agent prepares that chapter for approval. There is no new admin website builder to learn, and product images are still manual uploads.

## Implementation notes

- `/lookbook`: collection library; clickable covers, titles, and chapter links.
- `/lookbook/[collection]`: dedicated reader. Unknown/unpublished collections return 404.
- `src/lib/lookbook.ts`: explicitly published collection registry and editorial pages, approved BTS data, public metadata projection and exact campaign product selection.
- `src/lib/lookbook-interactions.ts`: small client-safe coordinate / spread helpers; does not import the editorial registry at runtime.
- `CollectionReader`: desktop spreads at 1024px+, single pages below that; stable per-page hashes, browser back/forward, chapter navigation, keyboard/swipe support, reduced-motion handling, readable page numbers and progress. Page changes bring the book back into view.
- `ShoppableImage`: manually placed percentage coordinates on the **uncropped image**. The Lavender Dusk wearer is on the left of the duo photograph; Sunset Ember is on the right. Only tees are tagged, not other items in the photographs.
- Product data comes only from `getStoreProducts()` and `getBookProducts()`. No hardcoded catalogue prices, substitute garments, private supplier fields, or catalogue writes. If a tagged product is no longer public, its marker disappears while the photograph remains. If the entire collection is unavailable, the story still works and the shopping page explains availability.
- Available and sold-out exact variants come from the existing storefront catalogue. A size must be selected before adding; sold-out options / all-sold-out quick-add are disabled. Checkout retains server-side validation. Adding uses the existing shared cart, so it persists across reading and shopping.
- Popovers open on click / tap, not hover. Escape or Close restores the marker's focus; outside clicks and page changes dismiss the card. On mobile the card sits below the photograph rather than obscuring it, and hotspot coordinates stay anchored to the image.
- Without JavaScript, the server-rendered plain reading-order fallback remains available with collection shopping links. No autoplay or heavy flipbook dependencies.
- Only `getBookSummary(book)` and `getBookPages(book)` go to the reader. Unapproved BTS source URLs are excluded from its payload; do not pass the raw registry entry to a client component. Empty / unapproved BTS assets are not published. Approved BTS adds a chapter before the final collection spread; photo and native video rendering are supported.
- The lookbook archive is editorial, independent of homepage campaign switching or stock. New collection books are agent-prepared and explicitly published; do not invent future drops or launch times.
- Existing Bone/Kalam Ink surfaces and Ember accents are retained. The colour rethink remains on hold; borderless colour-accented గ branding, garment artwork, free shipping, existing prices and payment settings are untouched.
- No database migration or production catalogue edits are required. Old stored gallery content is retained; the new library supersedes its public `/lookbook` presentation.

## Verification

- Unit / rendering tests cover the real collection, image paths, correct garment mappings, catalogue filtering, unavailable products, required size choice, sold-out variants, current prices, free shipping, approved-only BTS (including captioned film metadata), private draft exclusion, page boundaries, reduced motion and the no-JavaScript fallback.
- Browser checks use a local read-only catalogue fixture, never real customer orders or supplier credentials. Check desktop/mobile chapter navigation, all eight pages at 1440 / 1024 / 768 / 390 / 360 / 320px, deep links, back/forward, resizing, exact variant cart addition, popover focus/Escape, marker positions after mobile expansion, swipe vs vertical gestures, keyboard, reduced motion, unknown collection 404 and JavaScript-disabled reading.
- Native BTS film playback must be verified when the owner's actual media/caption files are supplied. No fabricated film was published merely to demonstrate it.
