# Lookbook collection stories & Shop the Look

## What visitors see

- `/lookbook` is a visual collection index, not a shelf of books.
- `/lookbook/bay-breeze` opens a continuous collection story with no page turns.
- On wide screens, the large **Shop the Look** photograph sits in the centre and stays in view as visitors scroll. Story text and smaller supporting photographs flow down on both sides.
- On phones and tablets, the featured photograph is shown prominently in the normal reading flow, followed by the story in a single column.
- The Bay Breeze story is limited to the Sunset Ember (orange) and Lavender Dusk pieces; Violet Hour is not shown in this lookbook. The wider shop catalogue remains unchanged.
- Two product markers sit on the orange and lavender shirts in the owner-supplied transparent cutout. Tapping a marker shows the current public product name, price, available sizes, add-to-bag and full product page. Product cards are also listed below the story.
- If a product is unavailable or the catalogue is empty, its marker is hidden and the story remains readable. Prices and stock are never invented.
- The Godavari landscape used for inspiration is clearly described as imagined, not documentary photography.

## Behind-the-scenes material

The owner has not supplied original making-of photos or film yet, so no behind-the-scenes section is displayed. To add it later, supply genuine approved process photos or video and the correct caption. Video with speech or meaningful audio also needs captions; include a transcript when available. Never describe campaign/model images as documentary footage or invent production claims.

## Technical maintenance notes

- `src/lib/lookbook.ts` is the explicitly published collection/story registry, approved BTS filter, public summary, and explicit per-story product selection. Bay Breeze selects only `godavari-tee-sunset` and `godavari-tee-lavender`; it does not inherit Violet Hour from the wider campaign.
- `src/components/lookbook/collection-story.tsx` renders the story as normal scrollable content with a sticky central shopping image on wide screens.
- `src/components/lookbook/shoppable-image.tsx` renders product markers at percentage coordinates on the uncropped transparent `bay-breeze-couple-cutout.png`. Lavender Dusk is the left shirt; Sunset Ember is on the right. The individual, owner-supplied colorway cutouts support the story below. Never tag accessories that are not sold.
- A marker is hidden unless its exact product is present in the active public catalogue. The Orange/Sunset item must be active before its pin and product card can appear; do not substitute another colorway or invent a listing. Quick add still requires an available, explicitly selected variant and uses the existing shared cart.
- Product cards use current public names, images, prices and stock. Supplier fields and unpublished BTS URLs are not sent to visitors.
- Story text and product links are server-rendered and remain available without JavaScript. Only interactive product markers require JavaScript.
- The overall brand palette, existing products and prices, shipping policy, payment configuration and garment artwork are unchanged. No database migration or catalogue write is required.

## Verification

Test desktop, tablet and mobile layouts; verify the central feature stays centred while side stories scroll; check product marker positions, variant selection and cart behavior; and confirm reduced-motion preferences and no-JavaScript reading. Use a local read-only catalogue fixture for browser checks. Do not submit real orders or fulfilment requests. Native video playback can only be verified after approved original media is supplied.
