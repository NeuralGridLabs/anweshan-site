import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import NavLinks from "@/components/NavLinks";

export default function Navbar() {
  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Anweshan logo"
            width={200}
            height={48}
            className="object-contain"
          />
        </Link>
        <NavLinks />
        <Link
          href="/contact"
          className="hidden md:flex items-center gap-2 rounded-full bg-accent text-accent-dark text-sm font-medium px-5 py-2.5 hover:bg-accent-dark hover:text-white transition-colors"
        >
          <Phone size={14} />
          Get in touch
        </Link>
      </nav>
    </header>
  );
}