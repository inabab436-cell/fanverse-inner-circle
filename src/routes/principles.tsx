import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/principles")({
  head: () => ({
    meta: [
      { title: "مبادئنا — عوالم" },
      { name: "description", content: "قواعد التفاعل الصحي في عوالم: بلا استغلال عاطفي، بلا مزايدات، وبلا شراء للقرب." },
      { property: "og:title", content: "مبادئنا — عوالم" },
      { property: "og:description", content: "كيف نبني مجتمع فانز صحي ومختلف." },
    ],
  }),
  component: Principles,
});

const items = [
  ["لا شيء يُشترى", "لا نقاط مدفوعة، لا رسائل خاصة مدفوعة مع الفنان، ولا مزادات على الاهتمام."],
  ["الإبداع هو العملة", "النقاط تأتي من الأعمال الفنية، الترجمة، ومساعدة الفانز الجدد."],
  ["تقدير بلا مقارنة", "لا نعرض أعداد الإعجابات للعامة. التقدير يصل لصاحبه فقط."],
  ["وقتك ثمين", "لا تمرير لا نهائي، وتذكير لطيف بالاستراحة بعد وقت طويل."],
  ["معًا أقوى", "مشاريع جماعية تحوّل الحب إلى أثر حقيقي: رسائل شكر ومبادرات خيرية."],
  ["احترام الجميع", "لا تنمر، لا تحريض بين جماهير الفنانين، ولا انتهاك لخصوصية أحد."],
];

function Principles() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">مبادئ <span className="text-brand">عوالم</span></h1>
      <p className="mt-2 text-muted-foreground">بنينا المنصة لتكون مكانًا تحبه، لا مكانًا يستهلكك.</p>
      <div className="mt-8 space-y-4">
        {items.map(([t, d], i) => (
          <div key={t} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-primary-foreground">{i + 1}</span>
            <div><h3 className="font-bold">{t}</h3><p className="text-sm text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
