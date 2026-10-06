import Image from "next/image";

import { sanityImageUrl } from "@/lib/image";
import type { SanityImage } from "@/lib/types";

/* The logo tile used on a client card and on a client's own page.

   Deliberately not a client component: it has no state, so it renders inside
   the interactive grid as well as inside server-rendered pages. */

/* Words that carry no identity, so "Ministry of Health" reads "MH" not "MOH". */
const STOP_WORDS = new Set([
  "of",
  "the",
  "and",
  "for",
  "in",
  "on",
  "at",
  "to",
  "a",
  "an",
  "de",
  "van",
]);

/** Up to three initials from the significant words of a name. */
function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  const significant = words.filter(
    (word) => !STOP_WORDS.has(word.toLowerCase().replace(/[^a-z]/g, "")),
  );
  const source = significant.length > 0 ? significant : words;

  const letters = source
    .slice(0, 3)
    .map((word) => word.replace(/[^A-Za-z]/g, "").charAt(0))
    .filter(Boolean);

  return letters.join("").toUpperCase() || "?";
}

type ClientLogoTileProps = {
  logo?: SanityImage | null;
  name: string;
  shortName?: string | null;
  /** Caller controls the box, so the page header can use a larger tile. */
  className?: string;
};

export default function ClientLogoTile({
  logo,
  name,
  shortName,
  className = "h-24 w-full",
}: ClientLogoTileProps) {
  const logoUrl = sanityImageUrl(logo);

  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-forest/10 ${className}`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={160}
          height={80}
          className="max-h-[70%] w-auto max-w-[70%] object-contain p-4"
        />
      ) : (
        /* No logo: a monogram keeps the card looking deliberate rather than
           broken, which matters most on a client's own page. */
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-sage">
          <span className="text-forest text-2xl font-bold tracking-tight">
            {shortName?.trim() ? shortName.trim().toUpperCase() : initialsOf(name)}
          </span>
        </div>
      )}
    </div>
  );
}