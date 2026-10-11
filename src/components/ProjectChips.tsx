import { categoryShort } from "@/lib/categories";
import { sectorShort } from "@/lib/sectors";

/* --------------------------------------------------------------------------
    Project chips: the sector + service pair, shown on every project card.

    One component for all four card types (the /projects library, the home
    featured rail, hub assignment cards and "More from") so the pair can never
    drift between them, and so the "max two, one line, never wrapping" rule is
    enforced in one place.

    Sizing is deliberate: cards must not get taller, so this is a single
    `flex-nowrap` row with `overflow-hidden` and truncated chips. A card too
    narrow for both chips clips the tail with an ellipsis rather than wrapping
    onto a second line and pushing the footer down.

    Sector chips come first because sector is the coarser question ("which field
    of work") and the service chip qualifies it.
   ----------------------------------------------------------------------- */

type Props = {
  /** Sector VALUES from SECTORS. Only the first is shown. */
  sectors?: string[];
  /** Primary service value. */
  category?: string;
};

export default function ProjectChips({ sectors, category }: Props) {
  const firstSector = (sectors ?? []).find(
    (v) => typeof v === "string" && sectorShort(v) !== "",
  );

  const sectorChip = firstSector ? sectorShort(firstSector) : "";
  const serviceChip = category ? categoryShort(category) : "";

  /* Neither present: render nothing at all rather than an empty row, so a
     project with no classification leaves no gap. */
  if (!sectorChip && !serviceChip) return null;

  return (
    <ul className="flex flex-nowrap items-center gap-2 min-w-0 overflow-hidden">
      {/* Sector reads as the stronger classification, so it is the solid chip
          and the service chip is the quieter one behind it. */}
      {sectorChip && (
        <li className="min-w-0 truncate shrink-0 rounded-full bg-forest px-3 py-1 text-xs font-semibold text-ivory">
          {sectorChip}
        </li>
      )}

      {serviceChip && (
        <li className="min-w-0 truncate rounded-full bg-gold/25 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-forest/90">
          {serviceChip}
        </li>
      )}
    </ul>
  );
}