import Image from "next/image";
import Cutouts from "@/components/Cutouts";

/* Logos held locally in /public/images/clients are real marks sourced from
   Wikimedia Commons. Clients without an available logo file fall back to a
   styled wordmark so the rail stays visually even. */
type Logo = { name: string; file?: string; short?: string };

const logos: Logo[] = [
  { name: "World Health Organization", file: "/images/clients/who.png" },
  { name: "UNICEF", file: "/images/clients/unicef.png" },
  { name: "UNDP", file: "/images/clients/undp.png" },
  { name: "Pfizer", file: "/images/clients/pfizer.png" },
  { name: "USAID", file: "/images/clients/usaid.png" },
  { name: "Ministry of Health and Population", short: "MoHP" },
  { name: "GiZ", short: "GiZ" },
  { name: "International Vaccine Institute", short: "IVI" },
  { name: "BBC Media Action", short: "BBC Media Action" },
  { name: "Bournemouth University", short: "Bournemouth" },
  { name: "Plan International", short: "Plan" },
  { name: "JICA", short: "JICA" },
  { name: "DFID", short: "DFID" },
  { name: "Helen Keller International", short: "HKI" },
  { name: "DanChurchAid", short: "DCA" },
  { name: "NHSSP", short: "NHSSP" },
];

function Mark({ logo }: { logo: Logo }) {
  return (
    <div
      className="shrink-0 h-20 w-[190px] flex items-center justify-center px-6"
      title={logo.name}
    >
      {logo.file ? (
        <Image
          src={logo.file}
          alt={logo.name}
          width={160}
          height={56}
          className="max-h-12 w-auto object-contain opacity-60 grayscale transition-all duration-500 hover:opacity-100"
        />
      ) : (
        <span className="text-forest/55 text-base font-bold tracking-tight text-center leading-tight transition-colors duration-500 hover:text-forest">
          {logo.short}
        </span>
      )}
    </div>
  );
}

export default function ClientMarquee() {
  return (
    <section className="relative bg-snow py-12 overflow-hidden border-y border-forest/10">
      <Cutouts variant="marquee" />
      <p className="relative max-w-[1400px] mx-auto px-6 text-forest meta-label mb-8">
        Trusted by
      </p>

      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 inset-y-0 w-24 z-10 bg-gradient-to-r from-snow to-transparent pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 z-10 bg-gradient-to-l from-snow to-transparent pointer-events-none" />

        <div className="flex w-max animate-[marquee_52s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...logos, ...logos].map((logo, i) => (
            <Mark key={`${logo.name}-${i}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
