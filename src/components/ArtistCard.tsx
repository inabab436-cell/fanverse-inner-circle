import { Link } from "@tanstack/react-router";
import { artistImages } from "@/lib/community";

export type Artist = { id: string; slug: string; name: string; field: string; bio: string; image: string };

export function ArtistCard({ a }: { a: Artist }) {
  return (
    <Link
      to="/artists/$slug"
      params={{ slug: a.slug }}
      className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-transform hover:-translate-y-1"
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img src={artistImages[a.image]} alt={a.name} loading="lazy" width={768} height={960} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">{a.field}</span>
        <h3 className="mt-2 text-lg font-bold">عالم {a.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.bio}</p>
      </div>
    </Link>
  );
}
