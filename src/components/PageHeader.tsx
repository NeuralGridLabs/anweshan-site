import Image from "next/image";
import Cutouts from "@/components/Cutouts";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";

type Tone = "ink" | "teal" | "primary" | "sand" | "clay";

type PageHeaderProps = {
  /** Optional: a page may have a bare title with no label above it. */
  eyebrow?: string;
  title: string;
  lead?: string;
  meta?: { label: string; value: string }[];
  tone?: Tone;
  image?: string;
  imageAlt?: string;
  /**
   * Opt-in scrim for the colour wash laid over the header photo. Omitted, the
   * wash is the heavy /85 the tone implies, which is right for an arbitrary
   * stock photo but all but erases a picture that was chosen deliberately.
   * A page with its own photograph can pass a lighter wash and still get the
   * photo under the text rather than in place of it.
   */
  scrim?: string;
  /**
   * Opt-in fit for the photo, overriding the default `object-cover kenburns`.
   * The default assumes decorative stock that may be cropped and zoomed
   * freely. A photograph of people is neither: cropping it takes heads, and
   * the slow zoom takes another bite out of every edge as it plays. A page
   * with a photo that has to stay legible passes its own fit here.
   */
  imageClassName?: string;
  /**
   * Opt-in floor for the header's height, as a Tailwind class. A header whose
   * natural height is far wider than the photo's shape has to crop it to fit,
   * and a photo of people cannot afford that. Giving the box a floor close to
   * the photo's own aspect leaves it room to be shown whole.
   */
  minHeight?: string;
  /**
   * Opt-in stacked header: title on its own full-width row with the lead
   * paragraph beneath it at a wide-but-readable measure, instead of the
   * default two-column grid that puts the lead in a narrow side column.
   * Off by default so the other pages keep their side-by-side header.
   */
  stacked?: boolean;
  /**
   * Suppress both the photo and the decorative cutouts, leaving a flat solid
   * background in the tone colour. Off by default, so every other page keeps
   * its current treatment.
   */
  plain?: boolean;
};

const tones: Record<Tone, { bg: string; text: string; sub: string; rule: string; eyebrow: string; bar: string }> = {
  ink:     { bg: "bg-sage",   text: "text-forest",    sub: "text-forest/85", rule: "border-forest/15", eyebrow: "text-forest",         bar: "bg-forest" },
  teal:    { bg: "bg-cream",  text: "text-forest",    sub: "text-forest/85", rule: "border-forest/15", eyebrow: "text-forest",         bar: "bg-forest" },
  primary: { bg: "bg-ivory",  text: "text-forest",    sub: "text-forest/85", rule: "border-forest/15", eyebrow: "text-forest",         bar: "bg-forest" },
  sand:    { bg: "bg-mint",   text: "text-forest",    sub: "text-forest/85", rule: "border-forest/20", eyebrow: "text-forest",      bar: "bg-forest" },
  clay:    { bg: "bg-neon",   text: "text-forest",    sub: "text-forest/85", rule: "border-forest/20", eyebrow: "text-forest",        bar: "bg-forest" },
};

export default function PageHeader({
  eyebrow,
  title,
  lead,
  meta,
  tone = "ink",
  image,
  imageAlt = "",
  scrim,
  imageClassName = "object-cover kenburns",
  minHeight,
  stacked = false,
  plain = false,
}: PageHeaderProps) {
  const t = tones[tone];
  const words = title.split(" ");

  /* A plain header has no photo, and the colour scrim that makes text legible
     over one is what turns a solid background muddy — so both go. */
  const headerImage = plain ? undefined : image;

  /* The wash sits between the photo and the copy: the photo stays under it and
     the heading always wins on contrast. */
  const scrimClass = scrim ?? (tone === "sand" ? "bg-mint/85" : "bg-sage/85");

  return (
    <header className={`relative ${t.bg} ${t.text} overflow-hidden ${minHeight ?? ""}`}>
      {headerImage && (
        <>
          <div className="absolute inset-0">
            <Image
              src={headerImage}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className={imageClassName}
            />
          </div>
          <div className={`absolute inset-0 ${scrimClass}`} />
        </>
      )}

      {!headerImage && <Cutouts variant="header" />}

      <div className="relative max-w-[1400px] mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className={stacked ? "md:col-span-12" : "md:col-span-8"}>
            {eyebrow && (
              <p className={`${t.eyebrow} eyebrow text-base mb-8`}>{eyebrow}</p>
            )}

            <h1 className="rise h1-page">
              {words.map((word, i) => (
                <span key={i} style={{ animationDelay: `${i * 55}ms` }}>
                  {word}
                  {i < words.length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </h1>
          </div>

          {lead && (
            /* Stacked: sits under the title at a wide measure. max-w-5xl gives
               the paragraph room to run without the lines going so long they
               are tiring to track back, while still stopping well short of the
               full container width. */
            <Reveal
              delay={220}
              className={
                stacked ? "md:col-span-12 md:pt-4 max-w-5xl" : "md:col-span-4 md:pt-6"
              }
            >
              <p className={`${t.sub} body-lg`}>{lead}</p>
            </Reveal>
          )}
        </div>

        {meta && (
          <Reveal delay={320}>
            <dl className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 md:mt-24 pt-10 border-t ${t.rule}`}>
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className={`${t.sub} eyebrow text-base mb-3`}>
                    {item.label}
                  </dt>
                  <dd className="text-3xl md:text-5xl font-bold tracking-tight tabular-nums">
                    <Counter value={item.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </header>
  );
}
