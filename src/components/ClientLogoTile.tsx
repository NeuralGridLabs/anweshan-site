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
function initialsOf(raw: string): string {
  /* Editors can leave anything in a name field, so never assume a string. */
  const name = typeof raw === "string" ? raw : "";
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
  className = "h-44 w-full",
}: ClientLogoTileProps) {
  const logoUrl = sanityImageUrl(logo);
  /* alt must be a string. A hand-edited name field can hold anything, and an
     object here is enough to take the page down. */
  const safeName = typeof name === "string" && name.trim() !== "" ? name : "Client";
  const safeShortName =
    typeof shortName === "string" && shortName.trim() !== "" ? shortName.trim() : "";

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-white ${className}`}
    >
      {logoUrl ? (
        /* Generous but bounded: the mark takes roughly two thirds of the tile,
           which is what makes it read as full-size rather than as an icon. */
        <Image
          src={logoUrl}
          alt={safeName}
          width={520}
          height={400}
          className="max-h-[86%] max-w-[86%] w-auto object-contain p-3"
        />
      ) : (
        /* No logo: a monogram keeps the card looking deliberate rather than
           broken, which matters most on a client's own page. Sized up to match
           the presence of a real mark, so the card never looks half-empty. */
        <div className="flex h-full w-full items-center justify-center bg-sage">
          <span className="text-forest text-3xl md:text-4xl font-bold tracking-tight">
            {safeShortName ? safeShortName.toUpperCase() : initialsOf(safeName)}
          </span>
        </div>
      )}
    </div>
  );
}