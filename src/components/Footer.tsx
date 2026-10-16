import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import SocialIcons from "@/components/SocialIcons";

const siteLinks = [
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "CRO", href: "/cro" },
  { label: "Projects", href: "/projects" },
  { label: "Clients", href: "/clients" },
  { label: "Team", href: "/team" },
  { label: "Career", href: "/career" },
];

export default function Footer() {
  return (
    <footer className="bg-forest text-ivory border-t border-forest/30">
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-14">

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-10">
          <div className="md:col-span-5">
            <Image
              src="/images/logo-light.png"
              alt="Anweshan logo"
              width={150}
              height={50}
              className="object-contain mb-4"
            />
            <p className="text-ivory/55 body-md max-w-sm">
              Anweshan is a Nepal-based public health research and consulting firm specialising in research, health analytics, policy advisory and evidence-informed solutions.
            </p>
          </div>

          <nav className="md:col-span-3">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-md text-white/60">
              {siteLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="md:col-span-4 not-italic">
            <ul className="space-y-2.5 text-md text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-mint" />
                Talchhikhel, Lalitpur, Nepal
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-mint" />
                01-5526674 / 977-9801210115
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 shrink-0 text-mint" />
                info@anweshan.org
              </li>
            </ul>
          </address>
        </div>

        {/* Base */}
<div className="mt-10 pt-6 border-t border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/60">
  <p>© 2026 Anweshan Pvt. Ltd. All rights reserved.</p>
  <div className="flex items-center gap-4">
    <SocialIcons
      size={13}
      className="text-white/60 hover:text-mint transition-colors"
    />
  </div>
</div>
      </div>
    </footer>
  );
}
