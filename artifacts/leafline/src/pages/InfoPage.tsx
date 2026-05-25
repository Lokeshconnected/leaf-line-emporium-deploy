import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Briefcase, MessageCircle, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import NotFound from "@/pages/not-found";

interface InfoPageProps {
  params: {
    section: string;
    slug: string;
  };
}

type PageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  icon: "learn" | "company" | "legal";
  highlights: string[];
  notes: string[];
  ctaLabel: string;
  ctaHref: string;
};

const pageContent: Record<string, PageContent> = {
  "learn/plant-care-guides": {
    eyebrow: "Learn",
    title: "Plant Care Guides",
    intro: "Get practical guidance on watering, light, humidity, and placement so your plants stay healthy in real homes.",
    icon: "learn",
    highlights: ["Water only when the soil and plant type suggest it.", "Match light levels to the plant's natural preference.", "Use humidity and placement to prevent stress."],
    notes: ["Use the Smart Selector and Shop filters to choose lower-maintenance plants first.", "Each plant detail page includes care instructions and best placement guidance."],
    ctaLabel: "Browse Plant Collection",
    ctaHref: "/shop",
  },
  "learn/blog": {
    eyebrow: "Learn",
    title: "Leafline Journal",
    intro: "A curated space for plant styling ideas, care routines, seasonal refreshes, and practical advice for modern homes.",
    icon: "learn",
    highlights: ["How to style corners with statement plants.", "Beginner routines for watering and repotting.", "Pet-safe recommendations for apartments and shared homes."],
    notes: ["This page acts as a live content hub for your demo and can later evolve into a full article system.", "Right now it helps convert a dead footer link into a polished, presentable destination."],
    ctaLabel: "Open AI Plant Care",
    ctaHref: "/assistant",
  },
  "learn/faqs": {
    eyebrow: "Learn",
    title: "Frequently Asked Questions",
    intro: "Quick answers for common shopping, delivery, and care questions so visitors can move forward confidently.",
    icon: "learn",
    highlights: ["Plant details include difficulty, watering frequency, and placement guidance.", "Authenticated users can manage orders, donations, wishlist, and AI chat.", "Checkout, orders, and donations are designed to work as part of the full user flow."],
    notes: ["If someone is unsure what to buy, direct them to the homepage Smart Selector.", "If they need plant-specific advice, the AI assistant is the fastest next step."],
    ctaLabel: "Explore Smart Selector",
    ctaHref: "/",
  },
  "learn/plant-doctor": {
    eyebrow: "Learn",
    title: "Plant Doctor",
    intro: "A guided path for diagnosing yellow leaves, brown tips, drooping stems, and other common symptoms.",
    icon: "learn",
    highlights: ["Start with light, water, and humidity before changing too many variables.", "Use plant detail pages to compare care requirements with your current routine.", "The AI assistant can help troubleshoot symptoms in a conversational way."],
    notes: ["This route gives the footer link a real destination while complementing your assistant feature.", "It also gives you a strong talking point during the presentation."],
    ctaLabel: "Ask Leafy",
    ctaHref: "/assistant",
  },
  "learn/community": {
    eyebrow: "Learn",
    title: "Leafline Community",
    intro: "A space for plant lovers to discover inspiration, compare care experiences, and stay connected to new arrivals.",
    icon: "learn",
    highlights: ["See what other plant lovers gravitate toward.", "Use reviews and curated collections as inspiration.", "Join updates through the newsletter in the footer."],
    notes: ["For the demo, this page acts as a polished community hub rather than a dead-end placeholder.", "It also pairs well with the reviews section on the homepage."],
    ctaLabel: "Return Home",
    ctaHref: "/",
  },
  "company/about-us": {
    eyebrow: "Company",
    title: "About LEAFLINE",
    intro: "LEAFLINE is built around making plant discovery feel intentional, beautiful, and easy to understand for everyday users.",
    icon: "company",
    highlights: ["Curated catalog with meaningful filters and care information.", "AI-guided support for plant care and product discovery.", "A polished storefront designed for discovery, care, and gifting."],
    notes: ["This page is intentionally presentation-ready and explains the product story clearly.", "It turns a static footer item into a useful project overview."],
    ctaLabel: "Explore Collection",
    ctaHref: "/shop",
  },
  "company/careers": {
    eyebrow: "Company",
    title: "Careers",
    intro: "We’re building a plant experience that blends curation, education, and thoughtful commerce.",
    icon: "company",
    highlights: ["Botanical curation", "Customer education", "Modern product design and experience thinking"],
    notes: ["For now this is a careers overview rather than an applicant portal.", "It keeps the route functional and on-brand without introducing risky backend work."],
    ctaLabel: "See Why LEAFLINE",
    ctaHref: "/",
  },
  "company/press": {
    eyebrow: "Company",
    title: "Press",
    intro: "A media-facing summary of LEAFLINE’s concept, strengths, and customer experience.",
    icon: "company",
    highlights: ["Premium plant curation", "Care-focused shopping experience", "AI assistant for discovery and troubleshooting"],
    notes: ["This works well for a panel presentation because it frames the product succinctly.", "You can use it as a project elevator pitch if someone asks for a summary."],
    ctaLabel: "Read Product Overview",
    ctaHref: "/company/about-us",
  },
  "company/partners": {
    eyebrow: "Company",
    title: "Partners",
    intro: "LEAFLINE is designed to support collaborations across design, gifting, events, and green space styling.",
    icon: "company",
    highlights: ["Interior styling partnerships", "Gifting and curated plant sets", "Plant sourcing for hospitality and shared spaces"],
    notes: ["This is intentionally lightweight but real, so the link works during your demo.", "It can grow into a richer partner workflow later."],
    ctaLabel: "Contact the Team",
    ctaHref: "/",
  },
  "company/sustainability": {
    eyebrow: "Company",
    title: "Sustainability",
    intro: "The experience emphasizes durable choices, thoughtful packaging, and long-term plant success rather than disposable buying.",
    icon: "company",
    highlights: ["Care guidance to help plants thrive longer.", "Curated selection over noisy overload.", "Packaging and presentation designed with longevity in mind."],
    notes: ["This gives your footer a credible sustainability destination without inventing unverifiable claims.", "It is phrased carefully to stay honest."],
    ctaLabel: "Browse Bestsellers",
    ctaHref: "/shop",
  },
  "legal/privacy-policy": {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro: "This demo experience stores some preferences locally in your browser to support a smoother shopping and browsing journey.",
    icon: "legal",
    highlights: ["Authentication and cart flows are part of the product experience.", "Some forms use local browser storage for demo-safe persistence.", "Plant browsing and discovery features operate without requiring personal data by default."],
    notes: ["This page is informational for the demo and not legal advice.", "It replaces a dead footer link with a clear, functioning page."],
    ctaLabel: "Return Home",
    ctaHref: "/",
  },
  "legal/terms-of-service": {
    eyebrow: "Legal",
    title: "Terms of Service",
    intro: "These demo terms describe how visitors interact with LEAFLINE’s catalog, assistant, and shopping experience.",
    icon: "legal",
    highlights: ["Use the site respectfully and lawfully.", "Product details and care guidance are provided for informational and shopping support purposes.", "Orders, wishlist, donations, and assistant features depend on the available application flow."],
    notes: ["This page exists to make the route work during your presentation.", "It is intentionally simple and honest."],
    ctaLabel: "Open Shop",
    ctaHref: "/shop",
  },
  "legal/cookies": {
    eyebrow: "Legal",
    title: "Cookies",
    intro: "LEAFLINE uses browser-side storage and session behavior to support cart state, preferences, and smoother interactions.",
    icon: "legal",
    highlights: ["Some data is stored locally for demo continuity.", "Navigation and UI preferences may persist between visits.", "This improves the experience without changing your working backend."],
    notes: ["This is a demo-friendly explanation page, not a legal compliance framework.", "It replaces a broken footer destination with a useful one."],
    ctaLabel: "Continue Exploring",
    ctaHref: "/",
  },
};

function getIcon(icon: PageContent["icon"]) {
  if (icon === "learn") return <BookOpen className="h-6 w-6" />;
  if (icon === "company") return <Briefcase className="h-6 w-6" />;
  return <ShieldCheck className="h-6 w-6" />;
}

export default function InfoPage({ params }: InfoPageProps) {
  const [, navigate] = useLocation();
  const key = `${params.section}/${params.slug}`;
  const content = pageContent[key];

  if (!content) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <button
          onClick={() => navigate("/")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm"
        >
          <div className="bg-[linear-gradient(135deg,rgba(27,94,57,0.08),rgba(255,248,230,0.92),rgba(205,238,220,0.55))] p-8 lg:p-12">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-border bg-background/75 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {getIcon(content.icon)}
              {content.eyebrow}
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-foreground lg:text-5xl">
              {content.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {content.intro}
            </p>
          </div>

          <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
            <div>
              <h2 className="mb-4 text-lg font-bold text-foreground">Highlights</h2>
              <div className="space-y-3">
                {content.highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground/85">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-foreground">Notes</h2>
              <div className="space-y-3">
                {content.notes.map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-accent/40 p-4 text-sm leading-relaxed text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>

              <Link href={content.ctaHref}>
                <div className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:translate-x-1">
                  {content.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 rounded-[1.5rem] border border-border bg-accent/30 p-6 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
            <MessageCircle className="h-4 w-4 text-primary" />
            Presentation-friendly detail
          </div>
          These pages were added to turn placeholder navigation into working routes without disturbing the existing commerce, auth, or AI flows.
        </div>
      </div>
    </div>
  );
}
