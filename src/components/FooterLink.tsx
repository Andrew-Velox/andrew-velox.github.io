interface FooterLinkProps {
  icon: React.ReactNode;
  href: string;
  label: string;
  isAboutPage?: boolean;
}

export function FooterLink({ icon, href, label, isAboutPage = false }: FooterLinkProps) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
      aria-label={label}
      className={`transition-colors ${
        isAboutPage 
          ? 'text-gray hover:text-white dark:text-white/80 dark:hover:text-white' 
          : 'text-white/80 hover:text-white'
      }`}
    >
      {icon}
    </a>
  );
}
