import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone } from "lucide-react";
import SocialIcons from "@/components/SocialIcons";

const siteLinks = [
  { label: "About us", href: "/about" },
  { label: "Expertise", href: "/services" },
  { label: "Projects", href: "/projects" },
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
              A contemporary issue focused research organization committed to evidence based
              analysis of development challenges.
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
                Talchikhel, Lalitpur, Nepal
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="mt-0.5 shrink-0 text-mint" />
                977-01-5526674 / 977-9801210115
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="mt-0.5 shrink-0 text-mint" />
                info@anweshan.org
              </li>
            </ul>
          </address>
        </div>

        {/* Base */}
        <div className="mt-10 pt-6 border-t border-white/12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/40">
          <p>Copyrights &copy; {new Date().getFullYear()} All Rights Reserved by Anweshan Pvt. Ltd.</p>
          <div className="flex items-center gap-4">
            <SocialIcons
              size={13}
              className="text-white/40 hover:text-mint transition-colors"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}