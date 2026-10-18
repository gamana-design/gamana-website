import {PageRenderer} from "@/components/site-content/page-renderer";
import {getSitePage} from "@/lib/site-content";
export const dynamic="force-dynamic";
export default async function HomePage(){const page=await getSitePage("home");return page?<PageRenderer page={page}/>:<main className="min-h-[50vh] bg-kalam px-6 py-24 text-center text-bone"><h1 className="font-display text-3xl">Your homepage is ready to build</h1><p className="mx-auto mt-3 max-w-lg text-bone/60">Open Admin → Pages → Import current site into Supabase to migrate the starter homepage and store content.</p></main>}
