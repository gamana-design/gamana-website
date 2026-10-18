/** Long-form bodies for the journal. Plain paragraphs and pull quotes. */

export interface JournalBlock {
  type: "p" | "h" | "quote";
  text: string;
}

export const journalBodies: Record<string, JournalBlock[]> = {
  "godavari-notes": [
    {
      type: "p",
      text: "Before we drew anything, we drove to the river. Not for the photographs — for the reference. GAMANA's first graphic started as two hours on a sandbank watching the light move across the water.",
    },
    {
      type: "p",
      text: "The thing that surprised us was how little the river looked like the stock images of it. There was no grand monument, no postcard angle. There was texture: the way the wet sand holds a darker band, the way the surface goes flat and silver just before it turns, the low bank sitting under a sky that refuses to pick one colour.",
    },
    { type: "h", text: "Drawing from the source" },
    {
      type: "p",
      text: "The rule we set ourselves early was simple: no generic cultural imagery. Nothing that could be dropped onto any garment in any market. If the design could not survive a conversation with someone who actually lives along that river, it would not ship.",
    },
    {
      type: "quote",
      text: "Our culture is part of our identity, not just a design trend.",
    },
    {
      type: "p",
      text: "So the artwork on the Godavari Tee is not a literal picture of the river. It is the thing we noticed while standing there — the band, the horizon, the way the light breaks. Rendered as a graphic that you could wear without explaining it, and that would still mean something to the people who know what it came from. It ships in three colourways — Sunset Ember, Lavender Dusk and Violet Hour — because the river is never the same hour twice.",
    },
    { type: "h", text: "What we learned" },
    {
      type: "p",
      text: "Research takes longer than drawing. It does not scale the way a trend cycle does, and it does not need to. That is the point. We would rather make one piece that carries its meaning than ten that borrow theirs.",
    },
    {
      type: "p",
      text: "If you are in Hyderabad, go and look. Then tell us what we missed — we are still working on it.",
    },
  ],
  "two-lines-one-mindset": [
    {
      type: "p",
      text: "There was a version of this plan where URBAN and CORE launched separately, on separate timelines, to separate audiences. We decided against it, and the reason is simpler than strategy: the person wearing a graphic tee to the market on a Sunday is the same person wearing a performance layer to the gym on a Tuesday.",
    },
    { type: "h", text: "Why one brand" },
    {
      type: "p",
      text: "Most people do not have a streetwear self and a fitness self. They have one life, and it moves between places. Buying from three different brands for three different needs is not loyalty — it is friction.",
    },
    {
      type: "quote",
      text: "Two lines. One mindset.",
    },
    {
      type: "p",
      text: "URBAN and CORE share the same standard: the same print quality, the same fit checks, the same finishing. What changes is the cut, the fabric and the hour of the day it is built for. URBAN is relaxed and culture-led. CORE is breathable and movement-first.",
    },
    { type: "h", text: "Where it goes next" },
    {
      type: "p",
      text: "The long-term plan is to keep the two lines close enough that they can be worn together, and clear enough that they never get confused. From gym to street, without changing who you are.",
    },
  ],
  "from-gym-to-street": [
    {
      type: "p",
      text: "The hardest product decision we made was not a colour or a graphic. It was a single t-shirt that had to work in a warm-up, through a session, and on the walk home — without looking like it belonged to a locker room.",
    },
    { type: "h", text: "Fabric first" },
    {
      type: "p",
      text: "CORE pieces start with a quick-dry knit at 140 GSM. Light enough to move in, matte enough not to look shiny under a camera, and it dries fast enough that a piece thrown over a chair after a session is wearable again by evening.",
    },
    {
      type: "p",
      text: "We tested flatlock seams on every seam that crosses a shoulder or sits under a pack strap, because that is where a training top usually announces itself. Flatlock is invisible, but it is the difference between a shirt you forget you are wearing and one you keep adjusting.",
    },
    { type: "h", text: "The styling problem" },
    {
      type: "p",
      text: "Performance fabric has a reputation, and most of it is deserved. But it is also fixable with cut. A slightly longer hem, a shoulder line that is not aggressively athletic, and a colour palette that is not fluorescent will move a technical piece straight into everyday wear.",
    },
    {
      type: "quote",
      text: "From gym to street, without changing who you are.",
    },
    {
      type: "p",
      text: "We are not trying to build gym clothes. We are trying to build everyday performance wear — pieces designed for movement that happen to be good enough to wear for the rest of the day.",
    },
  ],
  "made-of-home": [
    {
      type: "p",
      text: "GAMANA means movement. The word is Telugu, and it is the reason the brand feels like it already existed before we built it.",
    },
    { type: "h", text: "Translation" },
    {
      type: "p",
      text: "A brand identity is a translation problem. You have something specific — a landscape, a rhythm, a way of moving through a city — and you have to render it for someone who will never see the original. Do it badly and you get a costume. Do it well and you get something that travels.",
    },
    {
      type: "quote",
      text: "Made of home. Made to roam.",
    },
    {
      type: "p",
      text: "That line is the whole brief. Home is not a place we are stuck in; it is the material we make things from. What leaves with you is the print, the weight, the fit, the cut — the parts that survive translation.",
    },
    { type: "h", text: "The visual system" },
    {
      type: "p",
      text: "The palette is not a mood board — it is the clothes. Kalam Ink for the ground, Godavari Ember for the one loud note, Lavender Dusk and Violet Hour for the same river a different hour later, and a warm paper Bone underneath everything. The wordmark itself is brush-lettered in magenta, teal, violet and gold, because a brand that moves should not look like it was set in a spreadsheet.",
    },
    {
      type: "p",
      text: "Type is Space Grotesk, tight and upright, because the brand should look like it is moving even when it is standing still. And the line under the wordmark is the one we keep coming back to: rooted in origin, made to move.",
    },
  ],
};
