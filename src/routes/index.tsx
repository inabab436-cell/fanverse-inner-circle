import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import hero from "@/assets/hero.jpg";
import { artistsQuery } from "@/lib/queries";
import { ArtistCard } from "@/components/ArtistCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "عوالم — عالم خاص لكل فنان وجمهوره" },
      { name: "description", content: "منصة تجمع الفانز في عوالم خاصة بفنانيهم: نقاط عادلة، مشاريع جماعية، وتفاعل صحي بلا استغلال." },
      { property: "og:title", content: "عوالم — عالم خاص لكل فنان وجمهوره" },
      { property: "og:description", content: "مجتمعات فانز مختلفة: إبداع، تعاون، وبلا مزايدات." },
    ],
  }),
  component: Index,
});

const features = [
  { t: "نقاط لا تُشترى", d: "تكسبها بالإبداع والمساعدة فقط، لا بالدفع ولا بالتمرير." },
  { t: "تقدير هادئ", d: "لا عدّاد إعجابات علني، التقدير يصل لصاحبه وحده." },
  { t: "مشاريع جماعية", d: "نصنع معًا رسائل شكر ومبادرات خيرية باسم المجتمع." },
  { t: "وقت صحي", d: "تذكير لطيف بالاستراحة، ولا تمرير لا نهائي." },
];

function Index() {
  const { data: artists } = useQuery(artistsQuery);
  return (
    <div>
      <section className="relative overflow-hidden">
        <img src={hero} alt="جمهور يحتفل" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 md:pt-48">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-6xl">
            لكل فنان <span className="text-brand">عالم</span>،<br />ولكل فان مكان.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            مجتمع يجمعك بمن يحبون نفس الفنان، مبني على الإبداع والتعاون — لا على المقارنة ولا الاستغلال.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/artists" className="rounded-full bg-brand px-6 py-3 font-semibold text-primary-foreground shadow-soft">استكشف العوالم</Link>
            <Link to="/principles" className="rounded-full border border-primary px-6 py-3 font-semibold text-primary">مبادئنا</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.t} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold text-primary">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-extrabold">العوالم المفتوحة الآن</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {artists?.map((a) => <ArtistCard key={a.id} a={a} />)}
        </div>
      </section>
    </div>
  );
}
