import {
  Film,
  FileText,
  Zap,
  Rocket,
  CheckCircle2,
  Clock,
  Sparkles,
  Crosshair,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
} from 'lucide-react'

/* ── Header live-status ticker (rotates every 4s) ───────────────────── */
export const TICKER = [
  { icon: CheckCircle2, text: 'AI Ad delivered for a UAE brand — 2 hours ago', color: 'text-jelly-deep' },
  { icon: Clock, text: 'Brand identity in progress — 3 slots open this week', color: 'text-amber-600' },
  { icon: Sparkles, text: 'Next premium web project slot opens Thursday', color: 'text-jelly-mid' },
]

/* ── "What We Make" service cards ───────────────────────────────────── */
export const SERVICES = [
  {
    id: '01',
    icon: Film,
    title: 'AI Video Ad',
    description:
      'Scroll-stopping video ads crafted with AI and creative expertise to captivate, engage, and convert across every platform.',
    cta: 'Brochure',
    /* Its own page, reached from the card's CTA. */
    slug: 'ai-video-ad',
    path: '/works',
    /* Poster still, shown until the loop below starts playing. */
    image: '/hero-still.webp',
    /* Sample reel, autoplayed on loop in the card. */
    video: '/adqube-hero.mp4',
    caption: ['Better engagement.', 'Stronger conversions.'],
    features: [
      { icon: Sparkles, label: 'AI-Powered Creativity' },
      { icon: Crosshair, label: 'Platform-Optimized Formats' },
      { icon: TrendingUp, label: 'High-Converting Results' },
    ],
    /* Shown in the modal behind "Learn More". */
    detail: {
      intro:
        'An AI-assisted pipeline for brands that need to test more ideas than a traditional production schedule allows. You send a brief; we come back with a finished ad — usually inside 48 hours, without a shoot, a crew, or a call.',
      sections: [
        {
          heading: 'How it works',
          body: 'We start from your product, your audience and one clear goal. Concepting, scripting, generation and grade all run through the same pipeline, so an idea reaches a watchable cut in hours rather than weeks. A human editor finishes every frame — the AI accelerates the work, it does not replace the judgement.',
        },
        {
          heading: 'What you get',
          body: 'A finished, sound-designed ad delivered in 9:16, 1:1 and 16:9, so one brief covers Reels, Stories, TikTok, YouTube and a web embed without recutting. One round of revisions is included in every project.',
        },
        {
          heading: 'Why it changes the maths',
          body: 'When a variant costs hours instead of weeks, testing stops being a luxury. Run several angles against each other, keep what performs, and let the numbers pick the winner instead of the loudest opinion in the room.',
        },
      ],
      deliverables: [
        'Finished ad in 9:16, 1:1 and 16:9',
        'Sound design and licensed music',
        'One revision round included',
        'Source files on request',
        'Typical turnaround: 48–72 hours',
        'No retainer, priced per project',
      ],
    },
  },
]

/* ── "How We Work" three-step process ───────────────────────────────── */
export const PROCESS = [
  {
    num: '01',
    icon: FileText,
    title: 'Brief in 15 minutes',
    description:
      'Fill a short intake form. Tell us your brand, goal, and any references. No calls required to get started.',
  },
  {
    num: '02',
    icon: Zap,
    title: 'We build in 48–72h',
    description:
      'Our AI-assisted studio produces your first draft. You review it async on a shared preview link — no scheduling needed.',
  },
  {
    num: '03',
    icon: Rocket,
    title: 'Revise, approve, ship',
    description:
      'One revision round included. Final files delivered in every format you need, ready to publish immediately.',
  },
]

export const PROCESS_TAGS = [
  '48–72h first delivery',
  'No calls required',
  'Async-friendly',
  '🌍 Worldwide clients',
  '1 revision included',
]

/* ── Jellycut vs Traditional Agency comparison table ────────────────── */
export const COMPARISON = [
  { label: 'Delivery time', agency: '2–6 weeks', jellycut: '48–72 hours' },
  { label: 'Pricing model', agency: '$5k+/mo retainer', jellycut: 'Per-project, no lock-in' },
  { label: 'Calls required', agency: 'Yes — many', jellycut: 'Never' },
  { label: 'AI-enhanced quality', agency: 'Rarely', jellycut: 'Always' },
  { label: 'Revision cost', agency: 'Extra charge', jellycut: '1 round included' },
  { label: 'Timezone flexibility', agency: 'Fixed hours', jellycut: 'Async across all zones' },
  { label: 'Onboarding time', agency: '1–2 weeks', jellycut: '15-min brief form' },
]

/* ── Latest projects (the 3 shown on the homepage) ──────────────────── */
export const PROJECTS = [
  {
    id: 'p22',
    slug: 'filbey-neural-crunch',
    title: 'Case Study: Filbey – The Neural Crunch',
    category: 'AI Video Ads',
    icon: Film,
    description:
      'A 20-second "sensory assault" for Filbey, blending Neural Motion Synthesis with the "Midnight & Ember" aesthetic to redefine fast-food cinematography.',
    image: '/filbey_f8_burger.webp',
    youtubeId: 'p5-DrSYbFGA',
    color: 'from-[#0f0c08]/95 via-[#1a0f05]/80 to-[#0a0a0a]/60',
    timeline: '48 Hours',
    deliverables: [
      '20-second cinematic campaign',
      'Latent-space physics & sauce simulation',
      '8K neural upscaling pipeline',
      '"Midnight & Ember" colour grade',
    ],
    results:
      'A high-impact cinematic food ad built with neural motion synthesis — achieving "impossible" macro shots in 48 hours.',
  },
  {
    id: 'p20',
    slug: 'dior-chessboard-concept',
    title: 'Dior Concept Ad — "The Chessboard"',
    category: 'AI Video Ads',
    icon: Film,
    description:
      'A 15-second cinematic CGI concept contrasting a monumental marble chessboard with photoreal crimson macro detail.',
    image: '/dior_wide_chessboard.webp',
    youtubeId: 'ltb9V0oZppk',
    timeline: '48 Hours',
    color: 'from-[#141414]/90 via-[#261014]/50 to-[#0A120E]/40',
    deliverables: [
      '15-second CGI master edit',
      'Surreal mist & alabaster lighting',
      'High-fidelity 3D texture mapping',
      'Fashion-phonk sound design',
    ],
    results: 'A hyper-premium CGI proof-of-concept with extreme macro fidelity and aggressive speed-ramped editing.',
    disclaimer:
      'Speculative concept project created for portfolio purposes. Not an official Dior campaign, and not affiliated with, endorsed by, or commissioned by Christian Dior SE.',
  },
  {
    id: 'p19',
    slug: 'crimson-silver-heritage',
    title: 'Crimson & Silver Heritage',
    category: 'AI Video Ads',
    icon: Film,
    description:
      'A conceptual jewellery campaign built on chiaroscuro lighting, silhouette, and extreme macro texture.',
    image: '/crimson_heritage_cover.webp',
    youtubeId: 'dtTiZnu2EbQ',
    timeline: '48 Hours',
    color: 'from-[#0d0708]/95 via-[#23090e]/70 to-[#101114]/60',
    deliverables: [
      'Cinematic concept edit',
      'Chiaroscuro & silhouette lighting',
      'Extreme macro texturing & CGI',
      'Intimate interaction direction',
    ],
    results: 'An atmospheric, high-impact conceptual campaign that commands a premium market position.',
    disclaimer: 'Conceptual campaign created for portfolio purposes. Not commissioned by any jewellery brand.',
  },
]

/* ── Blog ───────────────────────────────────────────────────────────── */
export const BLOG_POSTS = [
  {
    id: 'b1',
    slug: 'first-three-seconds',
    title: 'The First Three Seconds Decide Everything',
    summary:
      'A viewer gives you about three seconds before the thumb moves. Every ad Ad Qube builds is designed backwards from that moment — here are the opening patterns that keep earning the next twenty.',
    date: 'August 12, 2026',
    readTime: '5 min read',
    tag: 'Strategy',
    image: '/blog/hook.webp',
  },
  {
    id: 'b2',
    slug: 'weeks-to-days',
    title: 'How AI Cut Ad Production From Weeks to Days',
    summary:
      'The bottleneck was never the idea — it was everything between the idea and the export. A stage-by-stage look at what the Ad Qube pipeline removes, and why a brief on Monday can be a finished ad by Wednesday.',
    date: 'July 29, 2026',
    readTime: '6 min read',
    tag: 'Production',
    image: '/blog/speed.webp',
  },
  {
    id: 'b3',
    slug: 'one-ad-is-a-guess',
    title: 'One Ad Is a Guess. Ten Is a Test.',
    summary:
      'Most brands run two creatives and call it a test. Ad Qube ships variation sets — multiple hooks, edits, and formats from one concept — so the numbers coming back actually tell you something.',
    date: 'July 15, 2026',
    readTime: '5 min read',
    tag: 'Testing',
    image: '/blog/testing.webp',
  },
  {
    id: 'b4',
    slug: 'what-makes-a-good-brief',
    title: 'What Makes a Good Video Ad Brief',
    summary:
      'You do not need a script or a storyboard to start with Ad Qube. You need a product, an audience, and one clear outcome — concept, messaging, and direction are our job from there.',
    date: 'June 30, 2026',
    readTime: '4 min read',
    tag: 'Process',
    image: '/blog/brief.webp',
  },
  {
    id: 'b5',
    slug: 'vertical-square-wide',
    title: 'Vertical, Square, Wide: Shipping Every Format',
    summary:
      'One edit is not one deliverable. Why 9:16, 1:1, and 16:9 each need their own framing decisions — and why every Ad Qube project ships all three from day one instead of billing you twice.',
    date: 'June 17, 2026',
    readTime: '4 min read',
    tag: 'Formats',
    image: '/blog/formats.webp',
  },
  {
    id: 'b6',
    slug: 'ai-is-a-tool-not-a-shortcut',
    title: 'AI Is a Production Tool, Not a Creative Shortcut',
    summary:
      'Models are good at making things. They are not good at knowing what is worth making. Ad Qube pairs AI production with human creative direction, and this is where that line actually falls.',
    date: 'June 3, 2026',
    readTime: '7 min read',
    tag: 'Craft',
    image: '/blog/craft.webp',
  },
]

/* ── Blog article bodies, keyed by slug ─────────────────────────────── */
export const BLOG_CONTENT = {
  'first-three-seconds': [
    {
      type: 'p',
      text: 'Paid social is not a captive medium. Nobody opened the app to watch your ad, and nothing about the format obliges them to stay. The average viewer decides whether to keep watching in roughly the time it takes to read this sentence — and once the thumb moves, no amount of craft further down the timeline gets a second chance.',
    },
    {
      type: 'p',
      text: 'That reality changes what a video ad actually is. It is not a thirty-second story with a strong opening. It is a three-second argument with twenty-seven seconds of supporting evidence attached.',
    },
    { type: 'h2', text: 'What the opening has to accomplish' },
    {
      type: 'p',
      text: 'A hook is doing three jobs simultaneously, and dropping any one of them costs you the view:',
    },
    {
      type: 'ul',
      items: [
        'Interrupt the scroll — visually distinct enough from surrounding content that the eye stops on it.',
        'Signal relevance — the viewer needs to sense within a beat that this concerns them specifically.',
        'Open a loop — pose something the next few seconds will resolve, so continuing feels like the natural choice.',
      ],
    },
    { type: 'h2', text: 'Four openings that consistently earn the next twenty seconds' },
    {
      type: 'p',
      text: 'These are not templates so much as structural patterns. The execution changes completely by product and audience, but the underlying shape recurs across almost everything that performs.',
    },
    {
      type: 'ul',
      items: [
        'The in-progress shot. Open mid-action rather than at the beginning. The viewer arrives feeling they have caught something already underway and stays to work out what.',
        'The stated problem. Name the frustration in the first line, precisely enough that the right person recognises themselves in it immediately.',
        'The visual anomaly. Something in frame that does not resolve on first read — an unexpected scale, texture, or juxtaposition that requires a second look.',
        'The direct claim. State the outcome up front and spend the rest of the ad earning it. Works best when the claim is specific and slightly surprising.',
      ],
    },
    { type: 'h2', text: 'What reliably kills a hook' },
    {
      type: 'p',
      text: 'Logo-first openings are the most common and most expensive mistake. A brand mark communicates nothing to someone who does not yet know or care about the brand, and it burns the one moment where attention was still available. Slow establishing shots have the same problem: cinematic in a context where the viewer has already committed, fatal in a feed.',
    },
    {
      type: 'quote',
      text: 'Ambiguity in the opening frame is not intrigue. It reads as irrelevance, and irrelevance is scrolled past.',
    },
    { type: 'h2', text: 'How we approach it' },
    {
      type: 'p',
      text: 'Every Ad Qube project is built backwards from the opening. We settle the first three seconds before touching the rest of the edit, because everything downstream is only worth producing if that opening holds. And because AI-assisted production makes additional cuts cheap, we generally deliver several hook variants against the same body — the hook is the highest-leverage variable in the whole ad, so it is the one most worth testing properly.',
    },
  ],

  'weeks-to-days': [
    {
      type: 'p',
      text: 'When a brand is quoted six weeks for a video ad, almost none of that time is spent thinking of the idea. The concept usually arrives in the first day or two. What consumes the remaining five and a half weeks is coordination, scheduling, and the mechanical work of turning an approved idea into finished frames.',
    },
    {
      type: 'p',
      text: 'This matters because it means the timeline was never really about creative difficulty. It was about logistics — and logistics is precisely what AI-assisted production compresses.',
    },
    { type: 'h2', text: 'Where the weeks actually went' },
    {
      type: 'p',
      text: 'A conventional production timeline breaks down roughly like this, and the proportions are remarkably consistent across projects:',
    },
    {
      type: 'ul',
      items: [
        'Briefing and alignment — several calls, a deck, and a round of written feedback before anything is made.',
        'Pre-production — casting, location scouting, scheduling, equipment hire, and the calendar arithmetic of getting people in one place.',
        'The shoot — often a single day, occasionally two. The shortest phase by a wide margin.',
        'Post-production — editing, colour, sound, revisions, and then re-exporting everything for each platform.',
      ],
    },
    {
      type: 'p',
      text: 'The shoot is the part everyone pictures when they think about making an ad, and it is typically under five percent of the elapsed time.',
    },
    { type: 'h2', text: 'What an AI-assisted pipeline removes' },
    {
      type: 'p',
      text: 'The gains are not evenly distributed. Some stages collapse almost entirely; others barely move. Being honest about which is which is the difference between a realistic promise and an overpromise.',
    },
    {
      type: 'ul',
      items: [
        'Pre-production largely disappears. No scheduling, no location, no crew calendar to reconcile. This is where most of the six weeks lived, and it is the single biggest saving.',
        'Concepting accelerates rather than vanishes. We can visualise several directions in the time it previously took to storyboard one, which means the decision is made against real frames instead of descriptions.',
        'Variation cost approaches zero. Producing a second, fifth, or tenth cut is no longer a proportional increase in effort, which changes what is worth testing.',
        'Revisions tighten. A change that meant a reshoot now means a regeneration, so the feedback loop runs in hours rather than weeks.',
      ],
    },
    { type: 'h2', text: 'What it does not remove' },
    {
      type: 'p',
      text: 'Judgement does not compress. Deciding what the ad should say, who it is for, which of six directions is actually the strongest, and when something is finished — that work takes as long as it ever did, and it is the work that determines whether the ad performs.',
    },
    {
      type: 'quote',
      text: 'Faster production only helps if the thinking behind it was sound. Speed multiplies the quality of the decision, in whichever direction that decision went.',
    },
    {
      type: 'p',
      text: 'This is why Ad Qube quotes 48 to 72 hours for a first draft rather than promising something same-day. The production is genuinely that fast now. The deliberate part — deciding what is worth producing — is what the remaining time is for.',
    },
  ],

  'one-ad-is-a-guess': [
    {
      type: 'p',
      text: 'A familiar pattern: a brand commissions one hero video, runs it, and watches the numbers. Performance is mediocre. The conclusion drawn is that video does not work for them, or that the agency underdelivered. Neither is necessarily true — the more likely explanation is that a single creative simply cannot tell you anything.',
    },
    { type: 'h2', text: 'Why one or two creatives tell you nothing' },
    {
      type: 'p',
      text: 'When an ad underperforms, there are at minimum four candidate explanations, and a single creative cannot distinguish between them:',
    },
    {
      type: 'ul',
      items: [
        'The hook failed and almost nobody saw the rest.',
        'The hook worked but the middle lost people before the offer landed.',
        'The creative was fine and the targeting was wrong.',
        'The creative and targeting were fine and the offer itself is the problem.',
      ],
    },
    {
      type: 'p',
      text: 'One ad returns one number. Diagnosis requires contrast — you need variants that differ along one axis at a time, so the comparison isolates the variable.',
    },
    { type: 'h2', text: 'What a real variation set looks like' },
    {
      type: 'p',
      text: 'A useful set is not ten unrelated ads. It is one strong concept, varied deliberately, so that differences in performance are attributable to something specific.',
    },
    {
      type: 'ul',
      items: [
        'Three to four distinct hooks against an identical body — isolates the opening as a variable.',
        'Two edit lengths, typically a short cut and an extended one — reveals whether attention or information is the constraint.',
        'Two closing calls to action — separates interest from intent.',
        'Every combination exported in each required aspect ratio, so platform is never an accidental confound.',
      ],
    },
    {
      type: 'p',
      text: 'Under traditional production economics this was unreasonable — each variant carried close to the full cost of the original. That constraint is what produced the one-hero-video habit in the first place. It no longer applies.',
    },
    { type: 'h2', text: 'Reading the results' },
    {
      type: 'p',
      text: 'Watch retention curves rather than headline view counts. A steep drop in the first three seconds is a hook problem. A drop around the two-thirds mark usually means the middle is not earning its length. A healthy curve with weak conversion points away from the creative entirely and toward the offer or the landing experience.',
    },
    {
      type: 'quote',
      text: 'One ad is a bet on your own taste. Ten is a question you are actually asking the market.',
    },
    {
      type: 'p',
      text: 'Ad Qube ships variation sets by default rather than as an upsell, because a single deliverable leaves you no better informed than you were before you spent the money.',
    },
  ],

  'what-makes-a-good-brief': [
    {
      type: 'p',
      text: 'Most people approaching a video ad for the first time assume they need to arrive with something close to a finished plan — a script, a shot list, some sense of the visual treatment. That assumption is the single most common reason projects stall before they begin. It is not what we need, and producing it is genuinely our job rather than yours.',
    },
    { type: 'h2', text: 'The three things we actually need' },
    {
      type: 'p',
      text: 'A brief that lets us start work is usually three short answers. Fifteen minutes of thinking, not an afternoon of drafting.',
    },
    {
      type: 'ul',
      items: [
        'What you are selling. The product or service, and specifically what makes it worth choosing over the obvious alternative.',
        'Who it is for. Not a demographic bracket — a recognisable person with a particular frustration your product resolves.',
        'What the ad should achieve. A single outcome: sales, qualified leads, or awareness. One, not three.',
      ],
    },
    {
      type: 'p',
      text: 'From those three answers we can build a concept, write the script, choose a visual direction, and produce a first draft. Everything else is useful context rather than a prerequisite.',
    },
    { type: 'h2', text: 'What genuinely helps, if you have it' },
    {
      type: 'ul',
      items: [
        'Two or three reference ads you admire — including, ideally, a note on what specifically you like about each.',
        'Existing brand assets: logo, fonts, palette, product photography.',
        'Anything you have already run, and how it performed. Knowing what failed is often more directive than knowing what worked.',
        'Hard constraints — claims you cannot legally make, competitors you must not resemble, regulatory language you must include.',
      ],
    },
    { type: 'h2', text: 'What you can safely skip' },
    {
      type: 'p',
      text: 'Scripts, storyboards, shot lists, timing breakdowns, and music selections. Not because your instincts are unwelcome, but because arriving with a locked treatment narrows the solution space before anyone has tested whether it is the right one. The strongest work usually comes from a clear problem and an open approach.',
    },
    {
      type: 'quote',
      text: 'Tell us the outcome you need and the constraints you are working within. The route between those two points is what you are hiring us for.',
    },
    {
      type: 'p',
      text: 'The Ad Qube intake form is built around exactly this — three questions, no call required, and a first draft back within 48 to 72 hours.',
    },
  ],

  'vertical-square-wide': [
    {
      type: 'p',
      text: 'A common misunderstanding is that delivering an ad in multiple aspect ratios is an export setting — one finished edit, three checkboxes, done. In practice a centre-crop of a wide edit is almost always a worse ad than something framed for its destination from the start, and the difference shows up directly in retention.',
    },
    { type: 'h2', text: '9:16 — vertical' },
    {
      type: 'p',
      text: 'Reels, TikTok, Stories, Shorts. This is where most paid social spend lands, and it is the least forgiving format. The frame is tall and narrow, so wide compositions have nowhere to go. Subjects need to sit centre and close. Text has vertical room to work with but very little horizontal room, and the bottom fifth of frame is frequently obscured by platform UI, so nothing important can live there.',
    },
    { type: 'h2', text: '1:1 — square' },
    {
      type: 'p',
      text: 'Feed placements across Meta. Square is the diplomatic option: it takes more feed height than landscape, avoids the aggressive cropping vertical demands, and survives being repurposed better than either. When budget only allows one ratio, this is usually the one that loses the least.',
    },
    { type: 'h2', text: '16:9 — wide' },
    {
      type: 'p',
      text: 'YouTube pre-roll, website embeds, connected TV, presentations. The only format where a genuinely cinematic composition is viable, and the only one where a viewer might be watching with sound on and full attention. Wide edits can afford a slower build — the scroll pressure that governs vertical simply is not present.',
    },
    { type: 'h2', text: 'Why we export all three up front' },
    {
      type: 'p',
      text: 'Producing every ratio in the same pass costs marginally more than producing one. Coming back weeks later to reformat costs a second production cycle, because the framing decisions have to be revisited shot by shot with the original context gone.',
    },
    {
      type: 'ul',
      items: [
        'Framing is decided per ratio while the edit is still open and every element is still adjustable.',
        'Safe zones for platform UI are respected natively rather than patched afterwards.',
        'Text and graphics are laid out per format instead of scaled down until they fit.',
        'You can move spend between platforms without waiting on new assets.',
      ],
    },
    {
      type: 'quote',
      text: 'One edit is not one deliverable. Treating it that way is how brands end up paying twice for the same ad.',
    },
    {
      type: 'p',
      text: 'Every Ad Qube project ships in all three ratios as standard — not as an add-on line item.',
    },
  ],

  'ai-is-a-tool-not-a-shortcut': [
    {
      type: 'p',
      text: 'The interesting question about AI in advertising was never whether the output is good enough. It plainly is, and improving quickly. The more useful question is which parts of the work it actually replaces — because the brands getting real results are noticeably not the ones who assumed the answer was all of it.',
    },
    { type: 'h2', text: 'What models are genuinely good at' },
    {
      type: 'p',
      text: 'Production, in the literal sense. Turning a decided idea into finished frames.',
    },
    {
      type: 'ul',
      items: [
        'Generating a specified visual to a consistent standard, repeatedly.',
        'Producing variations of something that already works, at negligible marginal cost.',
        'Handling the mechanical middle of post-production — cleanup, upscaling, matching, versioning.',
        'Compressing the distance between an approved concept and a viewable draft from weeks to hours.',
      ],
    },
    { type: 'h2', text: 'What they are conspicuously bad at' },
    {
      type: 'p',
      text: 'Knowing what is worth making. A model has no view on whether your audience is tired of a particular claim, whether a competitor ran something similar last quarter, or whether the frustration you are naming is the one your customers actually feel. It will execute a mediocre idea with exactly the same fluency as a strong one, and it will never volunteer that the brief itself is the problem.',
    },
    {
      type: 'quote',
      text: 'AI removed the cost of making things. It did not remove the cost of being wrong about what to make — if anything it raised it, by making it cheaper to be wrong at scale.',
    },
    { type: 'h2', text: 'Where human direction enters' },
    {
      type: 'p',
      text: 'At the two ends, and they are the ends that determine performance. At the start: deciding the strategic position, the specific claim, the audience, and the emotional register. At the finish: judging whether what came back is genuinely good, or merely competent — a distinction models are unreliable at making about their own output.',
    },
    {
      type: 'p',
      text: 'The middle, the part that used to consume five of the six weeks, is where AI does its work. That is a substantial change to the economics of advertising, and it is not the same thing as removing the need for creative judgement.',
    },
    {
      type: 'p',
      text: 'It is how Ad Qube is structured deliberately: AI carries the production load, humans own the strategy and the final call on whether something ships.',
    },
  ],
}

/* ── About page ─────────────────────────────────────────────────────── */
export const ABOUT_STATS = [
  { value: '48h', label: 'Typical first draft' },
  { value: '3', label: 'Aspect ratios per ad' },
  { value: '100%', label: 'Async — no calls required' },
  { value: '1', label: 'Revision round included' },
]

export const ABOUT_VALUES = [
  {
    title: 'Great Ads Start With Great Ideas',
    body: "AI can generate visuals quickly, but technology alone doesn't make an ad effective. Strong concepts, clear messaging, and creative storytelling come first.",
  },
  {
    title: 'Speed Creates More Opportunities',
    body: 'When production becomes faster, brands can explore more ideas. Instead of spending months producing one campaign, teams can create, test, learn, and iterate much faster.',
  },
  {
    title: 'More Creative Means Better Learning',
    body: "One concept shouldn't have to carry an entire campaign. Different hooks, stories, visuals, and formats give brands more opportunities to discover what works.",
  },
  {
    title: 'AI Should Amplify Creativity',
    body: "We don't see AI as a replacement for creativity. We see it as a creative engine — helping teams explore more possibilities, produce faster, and turn ambitious ideas into reality.",
  },
]

export const ABOUT_TIMELINE = [
  {
    step: '01',
    title: 'Creative First',
    body: 'AI is a tool, but great advertising starts with a great idea. We use AI to push creative possibilities further — not to replace creative thinking.',
  },
  {
    step: '02',
    title: 'Speed Matters',
    body: 'Advertising moves fast. We help brands go from idea to high-quality video ads in days, not weeks or months.',
  },
  {
    step: '03',
    title: 'Built to Perform',
    body: 'Beautiful videos are only part of the job. Every creative should have a purpose — to capture attention, communicate clearly, and drive results.',
  },
  {
    step: '04',
    title: 'Always Experimenting',
    body: 'The best ad is rarely the first idea. We test concepts, visuals, hooks, and formats to discover what connects with audiences.',
  },
]

/* ── Contact page ───────────────────────────────────────────────────── */
export const CONTACT_METHODS = [
  { icon: Phone, label: 'Phone', value: '+91 7560-856-994', href: 'tel:+917560856994' },
  { icon: Mail, label: 'Email', value: 'adqubestudio@gmail.com', href: 'mailto:adqubestudio@gmail.com' },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Kochi, Kerala',
    href: 'https://www.google.com/maps/place/Golden+Qube+Digital/@9.9889287,76.3178052,17z/data=!3m1!4b1!4m6!3m5!1s0x3b080d60d74f041b:0xc533ed7f1120336f!8m2!3d9.9889287!4d76.3178052!16s%2Fg%2F11y46nj11h!18m1!1e1',
  },
]

export const CONTACT_FAQS = [
  { q: 'How soon will I hear back?', a: 'Within 24 hours, every working day. Usually much sooner.' },
  { q: 'Do I need a script ready?', a: 'No. A product and a goal is enough for us to start a concept.' },
  { q: 'Do you require a call?', a: 'Never. Everything runs async unless you specifically want to talk.' },
]

/* ── "The Transformation Reel" before/after sliders ─────────────────── */
export const TRANSFORMATIONS = [
  {
    id: 1,
    title: 'Dior Chessboard CGI',
    description: 'Untextured 3D clay render → fully lit, cinematic CGI product shot.',
    tag: '3D Animation',
    before: '/dior_chessboard_clay.webp',
    beforeLabel: 'Clay Render',
    after: '/dior_chessboard_final.webp',
    afterLabel: 'Final CGI',
  },
  {
    id: 2,
    title: "Filbey's Food Campaign",
    description: 'Storyboard concept frame → live-action food photography composite.',
    tag: 'AI Video Ad',
    before: '/filbey_storyboard.webp',
    beforeLabel: 'Storyboard',
    after: '/filbey_detail.webp',
    afterLabel: 'Final Shot',
  },
  {
    id: 3,
    title: 'Mapto Brand Identity',
    description: 'Raw brand strategy document → polished app identity mockup.',
    tag: 'Brand Identity',
    before: '/mapto_brand_aim.webp',
    beforeLabel: 'Strategy Brief',
    after: '/mapto_mockup.webp',
    afterLabel: 'Final Brand',
  },
]

/* ── "Find Your Perfect Service" 3-question quiz ────────────────────── */
export const QUIZ_STEPS = [
  {
    id: 'promote',
    question: 'What are you looking to promote?',
    hint: 'This sets the creative direction',
    options: [
      { text: 'Product', icon: '📦', value: 'product', sub: 'Product AI Video Ad' },
      { text: 'Service', icon: '🛠️', value: 'service', sub: 'Service AI Video Ad' },
      { text: 'Brand', icon: '✨', value: 'brand', sub: 'Brand Story AI Video Ad' },
    ],
  },
  {
    id: 'goal',
    question: "What's your main goal?",
    hint: 'We build the hook and edit around this',
    options: [
      { text: 'Increase Sales', icon: '📈', value: 'sales', sub: 'Sales-Focused AI Video Ad' },
      { text: 'Generate Leads', icon: '🎯', value: 'leads', sub: 'Lead Generation AI Video Ad' },
      { text: 'Build Awareness', icon: '📣', value: 'awareness', sub: 'Brand Awareness AI Video Ad' },
    ],
  },
  {
    id: 'platform',
    question: 'Where will you use the video?',
    hint: 'Decides the aspect ratios we deliver',
    options: [
      { text: 'Instagram & Facebook', icon: '📱', value: 'social', sub: 'Social Media AI Video Ad' },
      { text: 'YouTube', icon: '▶️', value: 'youtube', sub: 'YouTube AI Video Ad' },
      { text: 'Website', icon: '🌐', value: 'website', sub: 'Website AI Video Ad' },
    ],
  },
]

/* Keyed on promote_goal — the platform answer never changes the recommendation,
   it only changes the formats we ship (see PLATFORM_DELIVERY below). */
export const QUIZ_RESULTS = {
  product_sales: {
    title: 'Product Sales AI Video Ad',
    tag: 'Highest ROI',
    desc: 'Scroll-stopping product creative built to drive direct purchases.',
  },
  product_leads: {
    title: 'Product Lead AI Video Ad',
    tag: 'Lead Engine',
    desc: 'Product-led creative that captures intent and pushes viewers into your funnel.',
  },
  product_awareness: {
    title: 'Product Awareness AI Video Ad',
    tag: 'Reach First',
    desc: 'Cinematic product storytelling built for reach and recall, not just clicks.',
  },
  service_sales: {
    title: 'Service Sales AI Video Ad',
    tag: 'Conversion Focus',
    desc: 'Service creative that turns interest into booked business, fast.',
  },
  service_leads: {
    title: 'Service Lead Generation AI Video Ad',
    tag: 'Lead Engine',
    desc: 'Lead-generation creative built around the exact problem your service solves.',
  },
  service_awareness: {
    title: 'Service Brand Awareness AI Video Ad',
    tag: 'Authority Play',
    desc: 'Positioning-led creative that makes your service the obvious choice.',
  },
  brand_sales: {
    title: 'Brand Conversion AI Video Ad',
    tag: 'Conversion Focus',
    desc: 'Brand-led creative engineered to turn attention into revenue.',
  },
  brand_leads: {
    title: 'Brand Lead Generation AI Video Ad',
    tag: 'Lead Engine',
    desc: 'Brand storytelling that builds trust and captures qualified leads.',
  },
  brand_awareness: {
    title: 'Brand Awareness AI Video Ad',
    tag: 'Reach First',
    desc: 'Cinematic brand storytelling built for maximum reach and recall.',
  },
}

const PLATFORM_DELIVERY = {
  social: 'Delivered 9:16 vertical and 1:1 square, cut for Reels and Feed.',
  youtube: 'Delivered 16:9 landscape, with the hook built into the first five seconds.',
  website: 'Delivered 16:9 and square, muted-autoplay safe for hero embeds.',
}

export const quizResultFor = (answers) => {
  const match = QUIZ_RESULTS[`${answers.promote}_${answers.goal}`]
  if (!match) {
    return {
      title: 'Custom AI Video Ad',
      tag: 'Bespoke',
      desc: "Let's talk. We'll outline exactly what creative you need to hit your goal this quarter.",
    }
  }
  const delivery = PLATFORM_DELIVERY[answers.platform]
  return { ...match, desc: delivery ? `${match.desc} ${delivery}` : match.desc }
}

/* ── Project estimator pricing ──────────────────────────────────────── */
export const ESTIMATOR_SERVICES = [
  { id: 'video', label: 'AI Video Ad', basePrice: 1500 },
  { id: 'brand', label: 'Brand Identity', basePrice: 3500 },
  { id: 'web', label: 'Cinematic Website', basePrice: 5000 },
  { id: 'app', label: 'Vibe-Coded Web App', basePrice: 8500 },
]

export const ESTIMATOR_SCOPES = {
  video: [
    { id: 'single', label: 'Single Video (3 Formats)', multiplier: 1 },
    { id: 'pack', label: '3-Video Campaign', multiplier: 2.5 },
  ],
  brand: [
    { id: 'lite', label: 'Logo + Colors', multiplier: 1 },
    { id: 'full', label: 'Full Brand Guidelines', multiplier: 1.5 },
  ],
  web: [
    { id: 'landing', label: 'Landing Page', multiplier: 1 },
    { id: 'multi', label: 'Multi-Page CMS Site', multiplier: 1.8 },
  ],
  app: [
    { id: 'mvp', label: 'Core MVP', multiplier: 1 },
    { id: 'scale', label: 'Full Production Build', multiplier: 1.6 },
  ],
}

/* ── FAQ ────────────────────────────────────────────────────────────── */
export const FAQS = [
  {
    q: 'What kind of video ads can you create?',
    a: 'We create video ads for social media, paid advertising campaigns, product launches, websites, and other digital platforms.',
  },
  {
    q: 'How does AI help with video ad creation?',
    a: 'AI helps us speed up ideation, scripting, visuals, production, editing, and variations — allowing us to turn concepts into polished ads much faster.',
  },
  {
    q: 'Do I need to provide a complete idea or script?',
    a: 'No. You can provide a product, goal, or simple brief, and our team can help develop the concept, messaging, and creative direction.',
  },
  {
    q: 'Can you create ads for different platforms?',
    a: 'Yes. We can create and adapt video ads for platforms such as Instagram, Facebook, YouTube, TikTok, and other digital advertising channels.',
  },
  {
    q: 'How long does it take to create a video ad?',
    a: 'Production time depends on the concept and requirements, but our AI-powered workflow allows us to deliver video ads significantly faster than traditional production.',
  },
  {
    q: 'Can you create multiple versions of the same ad?',
    a: 'Yes. We can create different hooks, visuals, messages, formats, and variations so you can test what works best with your audience.',
  },
  {
    q: 'Is AI-generated content actually high quality?',
    a: 'Yes. AI is a production tool, not a replacement for creative thinking. We combine AI with creative strategy, storytelling, and human direction to produce polished advertising content.',
  },
  {
    q: 'Can Ad Qube work with my existing brand guidelines?',
    a: 'Absolutely. We can work with your brand identity, visual style, messaging, products, and existing creative assets to keep your ads consistent.',
  },
]

/* ── Footer ─────────────────────────────────────────────────────────── */
export const FOOTER_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Works', path: '/works' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

export const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  { label: 'X', icon: Twitter, href: 'https://x.com' },
]

/* ── Footer country badges ──────────────────────────────────────────── */
export const COUNTRIES = [
  { flag: '🇮🇳', label: 'India' },
  { flag: '🇺🇸', label: 'United States' },
  { flag: '🇬🇧', label: 'United Kingdom' },
  { flag: '🇦🇪', label: 'UAE' },
  { flag: '🇦🇺', label: 'Australia' },
  { flag: '🇨🇦', label: 'Canada' },
]

/* Shared easing curve used across every scroll animation */
export const EASE = [0.16, 1, 0.3, 1]
