import { Section } from "@/components/index.js";

const LOCALES = ["en", "zh", "ja"];

const DICT = {
  en: {
    language: "English",
    greeting: "Hello, world!",
    desc: "Book your stay in seconds — no account required.",
    cta: "Book now",
  },
  zh: {
    language: "中文",
    greeting: "你好，世界！",
    desc: "几秒钟完成预订，无需注册账号。",
    cta: "立即预约",
  },
  ja: {
    language: "日本語",
    greeting: "こんにちは、世界！",
    desc: "アカウント登録なしで、数秒で予約できます。",
    cta: "今すぐ予約",
  },
};

// context key：模块级唯一。defaultValue 只是兜底，正常路径由页面根 Scope 提供
const LocaleCtx = Timeless.createContext("locale", ref("en"));

// 消费者：不接收 locale，只靠 use() 往上找最近的一层
function LocaleConsumer(props) {
  const locale_ = Timeless.use(LocaleCtx);
  return View({ class: "rounded-md border p-3 space-y-1" }, [
    View({ class: "flex items-center gap-2" }, [
      View(
        {
          class:
            "px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-medium",
        },
        [computed(locale_, (lc) => DICT[lc].language)],
      ),
      View({ class: "text-xs text-zinc-400" }, [props.slot]),
    ]),
    View({ class: "text-sm font-medium" }, [
      computed(locale_, (lc) => DICT[lc].greeting),
    ]),
    View({ class: "text-xs text-zinc-500" }, [
      computed(locale_, (lc) => DICT[lc].desc),
    ]),
    View(
      {
        class:
          "inline-block rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-xs",
      },
      [computed(locale_, (lc) => DICT[lc].cta)],
    ),
  ]);
}

// 切换器：同样靠 use() 拿到本层的 ref，直接写
function LocaleSwitcher() {
  const locale_ = Timeless.use(LocaleCtx);
  return View(
    { class: "flex gap-1" },
    LOCALES.map((lc) =>
      View(
        {
          class: classNames([
            "px-2 py-1 rounded text-xs cursor-pointer transition-colors",
            computed(locale_, (cur) =>
              cur === lc
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700",
            ),
          ]),
          onClick() {
            locale_.as(lc);
          },
        },
        [lc.toUpperCase()],
      ),
    ),
  );
}

// 一层 section：建自己的 ref，在 Scope 的 setup 里 provide
function LocaleSection(props) {
  const locale_ = ref(props.initial);
  const body = props.body;
  return Scope(
    // setup：写进新 owner
    () => Timeless.provide(LocaleCtx, locale_),
    // 子树在 owner 内求值
    () => [
      Section(props.title, [
        View({ class: "space-y-2" }, [
          LocaleSwitcher(),
          ...body(),
        ]),
      ]),
    ],
  );
}

export default function LocalePageView() {
  const view$ = new Timeless.vm.ScrollViewCore({});
  const pageLocale_ = ref("en");

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    // 页面根 Scope：parent = 页面自身的 lazy owner
    Scope(
      () => Timeless.provide(LocaleCtx, pageLocale_),
      () => [
        Flex({ direction: "col", gap: "32px" }, [
          View({ class: "space-y-2" }, [
            View({ class: "text-sm font-semibold text-zinc-500 uppercase tracking-wider" }, [
              "Context / Dependency Injection",
            ]),
            View({ class: "text-xs text-zinc-500 max-w-xl" }, [
              "每个 section 用 Scope + provide 建立自己的 locale，section 内的组件不接收任何 props，只靠 use() 往上找最近的一层。点击某个切换器只会改变它所在的那一层。",
            ]),
            View({ class: "space-y-2" }, [
              View({ class: "text-xs text-zinc-400" }, ["页面根层切换器"]),
              LocaleSwitcher(),
            ]),
            LocaleConsumer({ slot: "页面根层" }),
          ]),
          LocaleSection({
            title: "Section A（zh）",
            initial: "zh",
            body: () => [
              LocaleConsumer({ slot: "Section A / 普通组件" }),
              // 内层覆盖：在 A 的 children 里构造，parent 才是 A
              LocaleSection({
                title: "内层覆盖（en）",
                initial: "en",
                body: () => [LocaleConsumer({ slot: "Section A / 内层" })],
              }),
            ],
          }),
          LocaleSection({
            title: "Section B（ja）",
            initial: "ja",
            body: () => [LocaleConsumer({ slot: "Section B / 普通组件" })],
          }),
        ]),
      ],
    ),
  ]);
}
