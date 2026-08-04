import { MapPin, Mail } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function TopBar() {
  return (
    <div className="bg-primary text-white text-xs md:text-sm rounded-b-3xl">
      <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} />
            Talchikhel, Lalitpur, Nepal
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <Mail size={14} />
            info@anweshan.org
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Follow us:</span>
          <div className="flex items-center gap-3">
            <FaFacebookF size={13} className="hover:opacity-70 cursor-pointer" />
            <FaLinkedinIn size={13} className="hover:opacity-70 cursor-pointer" />
            <FaInstagram size={13} className="hover:opacity-70 cursor-pointer" />
            <FaXTwitter size={13} className="hover:opacity-70 cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}