import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center bg-bone">
      <div className="container-gamana text-center">
        <p className="label text-muted">404</p>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,7vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.05em]">
          Off the route
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-pretty text-[0.95rem] leading-relaxed text-muted">
          This page does not exist. It may have moved, or it may never have
          been here.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-kalam px-7 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-bone transition-transform hover:scale-[1.02]"
          >
            Back home
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-line px-7 py-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] transition-colors hover:border-graphite/40"
          >
            Shop the drop
          </Link>
        </div>
      </div>
    </section>
  );
}
