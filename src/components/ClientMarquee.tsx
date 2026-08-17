import Image from "next/image";
import Cutouts from "@/components/Cutouts";

type Logo = {
  name: string;
  file?: string;
  short?: string;
};

const logos: Logo[] = [
  {
    name: "World Health Organization",
    file: "/images/clients/who.png",
  },
  {
    name: "UNICEF",
    file: "/images/clients/unicef.png",
  },
  {
    name: "UNDP",
    file: "/images/clients/undp.png",
  },
  {
    name: "Pfizer",
    file: "/images/clients/pfizer.png",
  },
  {
    name: "USAID",
    file: "/images/clients/usaid.png",
  },
  {
    name: "Ministry of Health and Population",
    file: "/images/clients/MoHP.png",
  },
  {
    name: "GiZ",
    file: "/images/clients/GIZ.jpg",
  },
  {
    name: "International Vaccine Institute",
    file: "/images/clients/IVI.png",
  },
  {
    name: "BBC Media Action",
    file: "/images/clients/BBC.jpg",
  },
  {
    name: "Bournemouth University",
    file:
      "/images/clients/Shield_of_the_University_of_Bournemouth.svg.webp",
  },
  {
    name: "Plan International",
    file: "/images/clients/Plan_International.svg.webp",
  },
  {
    name: "JICA",
    file: "/images/clients/jica.svg.webp",
  },
  {
    name: "DFID",
    file: "/images/clients/DFID.jpg",
  },
  {
    name: "Helen Keller International",
    file:
      "/images/clients/Helen_Keller_International_logo.svg.webp",
  },
  {
    name: "DanChurchAid",
    file: "/images/clients/DCA_logo1.png",
  },
  {
    name: "NHSSP",
    file: "/images/clients/NHSSP.jpg",
  },
];

function Mark({ logo }: { logo: Logo }) {
  return (
    <div className="flex items-center justify-center w-44 h-20 mx-3 shrink-0">
      {logo.file ? (
        <Image
          src={logo.file}
          alt={logo.name}
          width={160}
          height={70}
          className="object-contain max-w-[150px] max-h-[60px]"
        />
      ) : (
        <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
          {logo.short}
        </span>
      )}
    </div>
  );
}

export default function ClientMarquee() {
  return (
    <section className="relative bg-snow py-10 overflow-hidden">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-6 mb-5">
        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-base-text">
          Trusted by
        </p>
      </div>

      {/* Logo Marquee */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 inset-y-0 w-24 z-10 bg-gradient-to-r from-snow to-transparent pointer-events-none" />

        {/* Right fade */}
        <div className="absolute right-0 inset-y-0 w-24 z-10 bg-gradient-to-l from-snow to-transparent pointer-events-none" />

        {/* Moving logos */}
        <div className="flex w-max animate-[marquee_52s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none">
          {[...logos, ...logos].map((logo, i) => (
            <Mark
              key={`${logo.name}-${i}`}
              logo={logo}
            />
          ))}
        </div>
      </div>
    </section>
  );
}