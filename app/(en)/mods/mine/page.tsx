import Link from "next/link";
import { format, getMessages } from "@/components/i18n";
import { getMods } from "@/components/mods-data";
import { https, nativePin, type ModProject } from "@/components/mods-logic";
import { MyMods, type OwnedProject } from "@/components/my-mods";
import { pageMetadata } from "@/components/site";

export const metadata = {
  ...pageMetadata({
    title: "Your mods on Horizon's registry",
    description: "The mods you submitted to Horizon's registry, their exact compatibility pins, and what waits for review.",
    path: "/mods/mine",
  }),
  robots: { index: false },
};

const runtimeText = getMessages("en").mods.runtime;

/** Native compatibility is an exact revision pair, never a historical hook-counter promise. */
function madeFor(v: ModProject["versions"][number]): string {
  const pin = nativePin(v.api);
  if (pin) return format(runtimeText.nativePin, pin);
  return v.api ? `Minecraft ${v.game}, ${format(runtimeText.api, { api: v.api })}` : `Minecraft ${v.game}`;
}

function owned(p: ModProject): OwnedProject {
  return {
    id: p.id,
    name: p.name,
    kind: p.kind,
    icon: https(p.icon),
    owners: p.owners ?? [],
    downloads: p.downloads ?? 0,
    versions: p.versions.map((v) => ({
      version: v.version,
      published: v.published ?? "",
      madeFor: madeFor(v),
      status: v.broken_on?.[0]
        ? { ok: false, text: format(runtimeText.broken, { horizon: v.broken_on[0].horizon, code: v.broken_on[0].code }) }
        : p.kind === "native-mod" ? { ok: true, text: runtimeText.nativeStatus } : null,
    })),
  };
}

export default async function MyModsPage() {
  const projects = ((await getMods()) ?? []).filter((p) => p.owners?.length).map(owned);
  return (
    <main className="mx-auto w-full max-w-4xl px-6 pt-32 pb-24 sm:pt-36 lg:px-10">
      <Link href="/mods" className="text-sm font-medium text-white/60 transition-colors hover:text-white">
        ← Every mod
      </Link>
      <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-white">Your mods</h1>
      <MyMods projects={projects} />
    </main>
  );
}
