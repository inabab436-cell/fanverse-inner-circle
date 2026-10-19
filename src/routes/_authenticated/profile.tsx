import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { badgesFor, levelFor } from "@/lib/community";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "ملفي — عوالم" },
      { name: "description", content: "مستواك ونقاطك وشاراتك في عوالم." },
      { property: "og:title", content: "ملفي — عوالم" },
      { property: "og:description", content: "تقدمك في المجتمع." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const id = u.user!.id;
      const [p, posts, projects] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("posts").select("id, kind, content, artists(name, slug)").eq("user_id", id).order("created_at", { ascending: false }),
        supabase.from("project_contributions").select("project_id").eq("user_id", id),
      ]);
      return { profile: p.data, posts: posts.data ?? [], projects: projects.data?.length ?? 0 };
    },
  });
  if (!data?.profile) return <div className="p-12 text-center text-muted-foreground">جارٍ التحميل...</div>;
  const { profile, posts } = data;
  const lvl = levelFor(profile.points);
  const count = (k: string) => posts.filter((p) => p.kind === k).length;
  const badges = badgesFor({ posts: posts.length, art: count("art"), translation: count("translation"), help: count("help"), projects: data.projects });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-3xl bg-brand p-8 text-primary-foreground shadow-soft">
        <p className="text-sm opacity-80">المستوى {lvl.index}</p>
        <h1 className="text-3xl font-extrabold">{profile.display_name}</h1>
        <p className="mt-1 text-lg">{lvl.name} · {profile.points} نقطة</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/30">
          <div className="h-full bg-background" style={{ width: `${lvl.progress}%` }} />
        </div>
        {lvl.next && <p className="mt-2 text-xs opacity-80">{lvl.next.min - profile.points} نقطة للوصول إلى «{lvl.next.name}»</p>}
      </div>

      <h2 className="mt-10 text-xl font-bold">الشارات</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {badges.length === 0 && <p className="text-sm text-muted-foreground">شارك بأول مساهمة لتحصل على شارتك الأولى.</p>}
        {badges.map((b) => <span key={b} className="rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent">🏅 {b}</span>)}
      </div>

      <h2 className="mt-10 text-xl font-bold">مساهماتي</h2>
      <div className="mt-3 space-y-3">
        {posts.length === 0 && <Link to="/artists" className="text-primary">ابدأ من أحد العوالم ←</Link>}
        {posts.map((p) => {
          const a = p.artists as { name: string; slug: string } | null;
          return (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              {a && <Link to="/artists/$slug" params={{ slug: a.slug }} className="text-xs text-accent">عالم {a.name}</Link>}
              <p className="mt-1 text-sm">{p.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
