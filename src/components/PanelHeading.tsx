// No 'use client' on purpose: this is a plain presentational component, so the server
// can render it directly. (Passing an icon component as a prop *into* a client
// component isn't allowed — functions can't cross the server→client boundary.)
export default function PanelHeading({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
      <Icon className="h-4 w-4 text-white/80" aria-hidden />
      <h3 className="text-sm font-semibold text-white">{children}</h3>
    </div>
  );
}
