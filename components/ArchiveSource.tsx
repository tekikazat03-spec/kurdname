import { resolveSource } from "@/lib/source-links";

export default function ArchiveSource({ source }: { source: string }) {
  const link = resolveSource(source);

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 border-b border-white/10 pb-4 text-sm leading-7 text-[#aaa395] outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#a99f8b]"
    >
      <span className="break-words underline decoration-white/20 underline-offset-4 group-hover:decoration-[#a99f8b]">
        {link.label}
      </span>
      <span className="text-xs font-medium text-[#b8a98f]">
        {link.direct ? "Kaynağı ziyaret et ↗" : "Kaynağı internette ara ↗"}
      </span>
    </a>
  );
}
