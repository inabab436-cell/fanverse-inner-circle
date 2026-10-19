import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";
import { artistImages, postKinds } from "@/lib/community";
import { Room } from "@/components/Room";
import { Polls } from "@/components/Polls";

export const Route = createFileRoute("/artists/$slug")({
  head: () => ({
    meta: [
      { title: "عالم الفنان — عوالم" },
      { name: "description", content: "منشورات المجتمع، التحديات، والمشاريع الجماعية في عالم الفنان." },
      { property: "og:title", content: "عالم الفنان — عوالم" },
      { property: "og:description", content: "انضم لمجتمع الفانز وشارك بإبداعك." },
    ],
  }),
  component: World,
});

const PAGE = 10;

function World() {
  const { slug } = Route.useParams();
  const { user } = useSession();
  const qc = useQueryClient();
  const [limit, setLimit] = useState(PAGE);
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<string>("thought");
  const [tab, setTab] = useState<"room" | "polls" | "posts" | "challenges" | "projects">("room");

  const { data } = useQuery({
    queryKey: ["world", slug, user?.id, limit],
    queryFn: async () => {
      const { data: artist } = await supabase.from("artists").select("*").eq("slug", slug).maybeSingle();
      if (!artist) return null;
      const [posts, challenges, projects, contribs, appr] = await Promise.all([
        supabase.from("posts").select("id, kind, content, created_at, user_id, profiles(display_name)").eq("artist_id", artist.id).order("created_at", { ascending: false }).limit(limit),
        supabase.from("challenges").select("*").eq("artist_id", artist.id),
        supabase.from("group_projects").select("*").eq("artist_id", artist.id),
        supabase.from("project_contributions").select("project_id, user_id"),
        user ? supabase.from("appreciations").select("post_id, user_id") : Promise.resolve({ data: [] as { post_id: string; user_id: string }[] }),
      ]);
      const { data: allPosts } = await supabase.from("posts").select("user_id, profiles(display_name)").eq("artist_id", artist.id);
      const tally: Record<string, { name: string; n: number }> = {};
      allPosts?.forEach((p) => {
        const name = (p.profiles as { display_name: string } | null)?.display_name ?? "فان";
        tally[p.user_id] = { name, n: (tally[p.user_id]?.n ?? 0) + 1 };
      });
      const top = Object.values(tally).sort((a, b) => b.n - a.n).slice(0, 5);
      let isArtist = false;
      if (user) {
        const { data: r } = await supabase.from("user_roles").select("id").eq("user_id", user.id).eq("role", "artist").eq("artist_id", artist.id).maybeSingle();
        isArtist = !!r;
      }
      return { isArtist, artist, posts: posts.data ?? [], challenges: challenges.data ?? [], projects: projects.data ?? [], contribs: contribs.data ?? [], appr: appr.data ?? [], top };
    },
  });

  if (data === null) return <div className="p-12 text-center">هذا العالم غير موجود.</div>;
  if (!data) return <div className="p-12 text-center text-muted-foreground">جارٍ فتح العالم...</div>;
  const { artist } = data;
  const refresh = () => qc.invalidateQueries({ queryKey: ["world", slug] });

  async function submit() {
    if (!user || !content.trim()) return;
    const { error } = await supabase.from("posts").insert({ artist_id: artist.id, user_id: user.id, kind, content: content.trim() });
    if (error) { toast.error("تعذّر النشر"); return; }
    const pts = postKinds.find((k) => k.value === kind)?.points;
    toast.success(`نُشر! +${pts} نقطة`);
    setContent("");
    refresh();
  }
  async function appreciate(postId: string) {
    if (!user) { toast("سجّل الدخول لتقدير المساهمات"); return; }
    const { error } = await supabase.from("appreciations").insert({ post_id: postId, user_id: user.id });
    if (!error) { toast.success("وصل تقديرك لصاحب المنشور 💗"); refresh(); }
  }
  async function join(projectId: string) {
    if (!user) { toast("سجّل الدخول للمشاركة"); return; }
    const { error } = await supabase.from("project_contributions").insert({ project_id: projectId, user_id: user.id });
    if (!error) { toast.success("انضممت للمشروع! +8 نقاط"); refresh(); }
  }

  const tabBtn = (t: typeof tab, label: string) => (
    <button onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{label}</button>
  );

  return (
    <div>
      <section className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 md:flex-row">
          <img src={artistImages[artist.image]} alt={artist.name} width={768} height={960} className="h-40 w-32 rounded-3xl object-cover shadow-soft" />
          <div className="text-center text-primary-foreground md:text-start">
            <p className="text-sm opacity-80">{artist.field}</p>
            <h1 className="text-4xl font-extrabold">عالم {artist.name}</h1>
            <p className="mt-2 max-w-xl opacity-90">{artist.bio}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap gap-2">
            {tabBtn("room", "💬 الغرفة الحيّة")}
            {tabBtn("polls", "🗳️ أسئلة وتصويت")}
            {tabBtn("posts", "📝 المساهمات")}
            {tabBtn("challenges", "التحديات")}
            {tabBtn("projects", "مشاريع جماعية")}
          </div>

          {tab === "room" && <div className="mt-6"><Room artistId={artist.id} artistName={artist.name} user={user} isArtist={data.isArtist} /></div>}
          {tab === "polls" && <div className="mt-6"><Polls artistId={artist.id} artistName={artist.name} user={user} isArtist={data.isArtist} /></div>}
          {tab === "posts" && (
            <div className="mt-6 space-y-4">
              {user ? (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap gap-2">
                    {postKinds.map((k) => (
                      <button key={k.value} onClick={() => setKind(k.value)} className={`rounded-full px-3 py-1 text-xs ${kind === k.value ? "bg-accent text-accent-foreground" : "bg-accent-soft text-accent"}`}>
                        {k.label} · {k.points}
                      </button>
                    ))}
                  </div>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={1000} rows={3} placeholder="شارك شيئًا يضيف للمجتمع..." className="mt-3 w-full resize-none rounded-xl border border-input bg-background p-3 text-sm outline-none focus:border-primary" />
                  <button onClick={submit} className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground">نشر</button>
                </div>
              ) : (
                <Link to="/auth" className="block rounded-2xl border border-dashed border-primary p-4 text-center text-primary">سجّل الدخول لتشارك في هذا العالم</Link>
              )}

              {data.posts.length === 0 && <p className="text-center text-muted-foreground">كن أول من يكتب هنا ✨</p>}
              {data.posts.map((p) => {
                const mine = p.user_id === user?.id;
                const received = data.appr.filter((a) => a.post_id === p.id).length;
                const given = data.appr.some((a) => a.post_id === p.id && a.user_id === user?.id);
                return (
                  <article key={p.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{(p.profiles as { display_name: string } | null)?.display_name}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{postKinds.find((k) => k.value === p.kind)?.label}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{p.content}</p>
                    <div className="mt-3 text-sm">
                      {mine ? (
                        <span className="text-accent">تلقيت {received} تقدير (يظهر لك فقط)</span>
                      ) : given ? (
                        <span className="text-muted-foreground">قدّرت هذا 💗</span>
                      ) : (
                        <button onClick={() => appreciate(p.id)} className="text-primary hover:text-accent">💗 تقدير</button>
                      )}
                    </div>
                  </article>
                );
              })}
              {data.posts.length >= limit && (
                <button onClick={() => setLimit(limit + PAGE)} className="w-full rounded-full border border-border py-2 text-sm text-muted-foreground">عرض المزيد</button>
              )}
            </div>
          )}

          {tab === "challenges" && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {data.challenges.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-bold text-primary">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <p className="mt-3 text-xs text-accent">ينتهي في {c.ends_at}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "projects" && (
            <div className="mt-6 space-y-4">
              {data.projects.map((pr) => {
                const n = data.contribs.filter((c) => c.project_id === pr.id).length;
                const joined = data.contribs.some((c) => c.project_id === pr.id && c.user_id === user?.id);
                return (
                  <div key={pr.id} className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="font-bold">{pr.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{pr.description}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-brand" style={{ width: `${Math.min(100, (n / pr.goal) * 100)}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{n} من {pr.goal} مشارك</span>
                      {joined ? <span className="text-accent">أنت مشارك ✓</span> : <button onClick={() => join(pr.id)} className="rounded-full bg-primary px-4 py-1 text-primary-foreground">شارك</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold">أبرز المساهمين</h3>
            <p className="text-xs text-muted-foreground">حسب عدد المساهمات، لا الإعجابات</p>
            <ol className="mt-3 space-y-2 text-sm">
              {data.top.length === 0 && <li className="text-muted-foreground">لا مساهمات بعد</li>}
              {data.top.map((t, i) => (
                <li key={i} className="flex justify-between"><span>{i + 1}. {t.name}</span><span className="text-accent">{t.n}</span></li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-accent-soft p-5 text-sm text-accent">
            هنا لا توجد رسائل مدفوعة ولا مزادات. الوصول للفنان متساوٍ للجميع.
          </div>
        </aside>
      </div>
    </div>
  );
}
