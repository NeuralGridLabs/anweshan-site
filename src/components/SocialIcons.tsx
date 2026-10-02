import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa6";

import { socialLinks } from "@/lib/socials";

const icons: Record<string, typeof FaFacebookF> = {
  LinkedIn: FaLinkedinIn,
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
};

type SocialIconsProps = {
  className?: string;
  size?: number;
};

export default function SocialIcons({ className, size = 15 }: SocialIconsProps) {
  return (
    <>
      {socialLinks.map((social) => {
        const Icon = icons[social.label];
        if (!Icon) return null;

        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className={className}
          >
            <Icon size={size} />
          </a>
        );
      })}
    </>
  );
}
