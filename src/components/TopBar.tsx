import { MapPin, Mail, Phone } from "lucide-react";
import SocialIcons from "@/components/SocialIcons";

export default function TopBar() {
  return (
    <div className="bg-mint text-forest text-sm border-b border-forest/10 text-md">
      <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-forest/85" />
            Talchikhel, Lalitpur, Nepal
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <Phone size={13} className="text-forest/85" />
            977-01-5526674
          </span>
          <span className="hidden lg:flex items-center gap-1.5">
            <Mail size={13} className="text-forest/85" />
            info@anweshan.org
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SocialIcons className="text-forest/85 hover:text-forest transition-colors" />
        </div>
      </div>
    </div>
  );
}
