interface FooterLinkProps {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export function FooterLink({ icon, href, label }: FooterLinkProps) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      aria-label={label}
      className="text-white/80 hover:text-white transition-colors"
    >
      {icon}
    </a>
  );
}