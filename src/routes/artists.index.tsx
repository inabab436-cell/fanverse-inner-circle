import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { artistsQuery } from "@/lib/queries";
import { ArtistCard } from "@/components/ArtistCard";

export const Route = createFileRoute("/artists/")({
  head: () => ({
    meta: [
      { title: "الفنانون — عوالم" },
      { name: "description", content: "اختر الفنان الذي تحبه وادخل عالمه الخاص مع باقي الفانز." },
      { property: "og:title", content: "الفنانون — عوالم" },
      { property: "og:description", content: "استكشف عوالم الفنانين على المنصة." },
    ],
  }),
  component: ArtistsPage,
});

function ArtistsPage() {
  const { data } = useQuery(artistsQuery);
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">استكشف <span className="text-brand">العوالم</span></h1>
      <p className="mt-2 text-muted-foreground">كل عالم مجتمع مستقل بتحدياته ومشاريعه.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((a) => <ArtistCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
