import { cn } from "@/lib/utils";

/**
 * Infinite horizontal ticker. The content is duplicated once and the track is
 * translated by -50%, so the loop is seamless.
 */
export function Marquee({
  items,
  className,
  separator = "•",
  slow = false,
  reverse = false,
}: {
  items: readonly string[];
  className?: string;
  separator?: string;
  slow?: boolean;
  reverse?: boolean;
}) {
  const track = [...items, ...items];
  return (
    <div className={cn("mask-fade-x overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max items-center",
          slow ? "animate-marquee-slow" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {track.map((item, i) => (
          <span key={`${item}-${i}`} className="flex shrink-0 items-center">
            <span className="px-6 md:px-9">{item}</span>
            <span className="text-ember" aria-hidden="true">
              {separator}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
