import Image from "next/image";
import Cutouts from "@/components/Cutouts";
import Counter from "@/components/Counter";
import Reveal from "@/components/Reveal";

type Tone = "ink" | "teal" | "primary" | "sand" | "clay";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  lead?: string;
  meta?: { label: string; value: string }[];
  tone?: Tone;
  image?: string;
  imageAlt?: string;
};

const tones: Record<Tone, { bg: string; text: string; sub: string; rule: string; eyebrow: string; bar: string }> = {
  ink:     { bg: "bg-sage",   text: "text-forest",    sub: "text-forest/70", rule: "border-forest/15", eyebrow: "text-forest",         bar: "bg-forest" },
  teal:    { bg: "bg-cream",  text: "text-forest",    sub: "text-forest/70", rule: "border-forest/15", eyebrow: "text-forest",         bar: "bg-forest" },
  primary: { bg: "bg-ivory",  text: "text-forest",    sub: "text-forest/70", rule: "border-forest/15", eyebrow: "text-forest",         bar: "bg-forest" },
  sand:    { bg: "bg-mint",   text: "text-forest",    sub: "text-forest/80", rule: "border-forest/20", eyebrow: "text-forest",      bar: "bg-forest" },
  clay:    { bg: "bg-neon",   text: "text-forest",    sub: "text-forest/80", rule: "border-forest/20", eyebrow: "text-forest",        bar: "bg-forest" },
};

export default function PageHeader({
  eyebrow,
  title,
  lead,
  meta,
  tone = "ink",
  image,
  imageAlt = "",
}: PageHeaderProps) {
  const t = tones[tone];
  const words = title.split(" ");

  return (
    <header className={`relative ${t.bg} ${t.text} overflow-hidden`}>
      {image && (
        <>
          <div className="absolute inset-0">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover kenburns"
            />
          </div>
          <div
            className={`absolute inset-0 ${
              tone === "sand" ? "bg-mint/85" : "bg-sage/85"
            }`}
          />
        </>
      )}

      {!image && <Cutouts variant="header" />}

      <div className="relative max-w-[1400px] mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <p className={`${t.eyebrow} eyebrow text-base mb-8`}>{eyebrow}</p>

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
            <Reveal delay={220} className="md:col-span-4 md:pt-6">
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
