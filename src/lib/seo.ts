export const siteUrl = "https://amanispanairobi.com";

export const siteName = "Amani Nails & Spa";

export const locale = "en_KE";

export const twitterHandle = "@amanispanairobi";

export const businessPhone = "+254700000000";
export const businessEmail = "hello@amanispanairobi.com";

export const businessAddress = {
  "@type": "PostalAddress" as const,
  streetAddress: "Westlands Business Park, Waiyaki Way",
  addressLocality: "Nairobi",
  addressRegion: "Nairobi County",
  postalCode: "00100",
  addressCountry: "KE",
};

export const businessGeo = {
  "@type": "GeoCoordinates" as const,
  latitude: -1.2611,
  longitude: 36.8033,
};

export const sameAs = [
  "https://instagram.com/amanispanairobi",
  "https://facebook.com/amanispanairobi",
  "https://tiktok.com/@amanispanairobi",
  "https://youtube.com/@amanispanairobi",
];

export const openingHours = [
  { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "08:00", closes: "20:00" },
  { dayOfWeek: "Sunday", opens: "10:00", closes: "18:00" },
];

export const nairobiKeywords = [
  "best nail salon Nairobi",
  "luxury spa Nairobi",
  "massage Nairobi",
  "pedicure Nairobi",
  "manicure Nairobi",
  "piercing Nairobi",
  "spa packages Nairobi",
  "beauty salon Westlands",
  "nail salon Westlands Nairobi",
  "Kenyan spa",
  "Nairobi beauty treatments",
  "gel nails Nairobi",
  "acrylic nails Nairobi",
  "deep tissue massage Nairobi",
  "hot stone massage Nairobi",
  "facial Nairobi",
  "body scrub Nairobi",
  "waxing Nairobi",
  "eyelash extensions Nairobi",
  "ear piercing Nairobi",
];

// ── Schema: Organization ───────────────────────────────────────────────────
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/og-image.webp`,
  image: `${siteUrl}/og-image.webp`,
  description:
    "Premium nail care, massage therapy, facials, and spa packages in Nairobi, Kenya. Where serenity meets sophistication.",
  address: businessAddress,
  geo: businessGeo,
  telephone: businessPhone,
  email: businessEmail,
  sameAs,
  areaServed: {
    "@type": "City",
    name: "Nairobi",
    sameAs: "https://en.wikipedia.org/wiki/Nairobi",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Beauty & Wellness Services",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Nail Services" },
      { "@type": "OfferCatalog", name: "Massage Therapy" },
      { "@type": "OfferCatalog", name: "Skincare & Facials" },
      { "@type": "OfferCatalog", name: "Body Treatments" },
      { "@type": "OfferCatalog", name: "Piercing" },
      { "@type": "OfferCatalog", name: "Spa Packages" },
    ],
  },
};

// ── Schema: WebSite ────────────────────────────────────────────────────────
export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ── Schema: LocalBusiness + BeautySalon + Spa ──────────────────────────────
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "BeautySalon", "HealthAndBeautyBusiness", "Spa"],
  name: siteName,
  image: `${siteUrl}/og-image.webp`,
  url: siteUrl,
  telephone: businessPhone,
  email: businessEmail,
  description:
    "Amani Nails & Spa is Nairobi's premier beauty and wellness destination offering manicure, pedicure, gel nails, acrylic nails, massage therapy, facials, body treatments, waxing, piercing, and spa packages in Westlands, Nairobi, Kenya.",
  address: businessAddress,
  geo: businessGeo,
  openingHoursSpecification: openingHours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    ...h,
  })),
  priceRange: "KES 800 – KES 15,000",
  sameAs,
  areaServed: [
    { "@type": "City", name: "Nairobi" },
    { "@type": "City", name: "Westlands" },
    { "@type": "AdministrativeArea", name: "Nairobi County" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    ratingCount: "280",
    reviewCount: "280",
  },
  hasMap: "https://maps.google.com/?q=Amani+Nails+and+Spa+Westlands+Nairobi",
  currenciesAccepted: "KES",
  paymentAccepted: ["Cash", "M-Pesa", "Credit Card", "Debit Card", "Bank Transfer"],
};

// ── Schema: Service (per service page) ─────────────────────────────────────
export const serviceSchema = (
  title: string,
  description: string,
  price: number,
  category: string,
  image?: string,
  duration?: number,
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: title,
  description,
  image: image ? `${siteUrl}${image}` : `${siteUrl}/og-image.webp`,
  provider: {
    "@type": ["LocalBusiness", "BeautySalon"],
    name: siteName,
    url: siteUrl,
    telephone: businessPhone,
    address: businessAddress,
    areaServed: `Nairobi, Kenya`,
  },
  areaServed: {
    "@type": "City",
    name: "Nairobi",
  },
  offers: {
    "@type": "Offer",
    price,
    priceCurrency: "KES",
    availability: "https://schema.org/InStock",
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    url: siteUrl,
  },
  ...(duration ? { duration: `PT${duration}M` } : {}),
  category,
});

// ── Schema: AggregateOffer / Menu ──────────────────────────────────────────
export const menuSchema = (
  items: { name: string; description: string; price: number; category: string }[],
) => ({
  "@context": "https://schema.org",
  "@type": "Menu",
  name: "Services Menu — Amani Nails & Spa",
  description: "Complete menu of premium beauty and wellness services in Nairobi, Kenya.",
  url: `${siteUrl}/services`,
  hasMenuItem: items.map((item) => ({
    "@type": "MenuItem",
    name: item.name,
    description: item.description,
    offers: {
      "@type": "Offer",
      price: item.price,
      priceCurrency: "KES",
    },
    suitableForDiet: "https://schema.org/HalalDiet", // if applicable
  })),
  provider: {
    "@type": ["LocalBusiness", "BeautySalon"],
    name: siteName,
  },
});

// ── Schema: Review ─────────────────────────────────────────────────────────
export const reviewSchema = (
  author: string,
  reviewBody: string,
  ratingValue: number,
  datePublished: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Review",
  itemReviewed: {
    "@type": ["LocalBusiness", "BeautySalon", "Spa"],
    name: siteName,
    url: siteUrl,
    image: `${siteUrl}/og-image.webp`,
    telephone: businessPhone,
    address: businessAddress,
    priceRange: "KES 800 – KES 15,000",
  },
  author: { "@type": "Person", name: author },
  reviewBody,
  reviewRating: {
    "@type": "Rating",
    ratingValue,
    bestRating: "5",
    worstRating: "1",
  },
  datePublished,
  publisher: { "@type": "Organization", name: siteName },
});

// ── Schema: BreadcrumbList ─────────────────────────────────────────────────
export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${siteUrl}${item.url}`,
  })),
});

// ── Schema: Article ────────────────────────────────────────────────────────
export const articleSchema = (
  title: string,
  description: string,
  date: string,
  author: string,
  image?: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  image: image ? `${siteUrl}${image}` : `${siteUrl}/og-image.webp`,
  author: { "@type": "Person", name: author },
  datePublished: date,
  dateModified: date,
  publisher: {
    "@type": "Organization",
    name: siteName,
    logo: { "@type": "ImageObject", url: `${siteUrl}/og-image.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": siteUrl },
});

// ── Schema: ImageGallery ───────────────────────────────────────────────────
export const imageGallerySchema = (images: { url: string; caption: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  url: `${siteUrl}/gallery`,
  image: images
    .filter((img) => img.url)
    .map((img) => ({
      "@type": "ImageObject",
      url: img.url.startsWith("http") ? img.url : `${siteUrl}${img.url}`,
      caption: img.caption,
      contentLocation: "Nairobi, Kenya",
    })),
});

// ── Schema: FAQPage ────────────────────────────────────────────────────────
export const faqSchema = (questions: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map((q) => ({
    "@type": "Question",
    name: q.question,
    acceptedAnswer: { "@type": "Answer", text: q.answer },
  })),
});

// ── Schema: Product (for gift certificates / packages) ─────────────────────
export const productSchema = (
  name: string,
  description: string,
  price: number,
  image?: string,
) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name,
  description,
  image: image ? `${siteUrl}${image}` : `${siteUrl}/og-image.webp`,
  offers: {
    "@type": "Offer",
    price,
    priceCurrency: "KES",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/pricing`,
  },
  category: "Beauty & Wellness",
});

// ── Schema: ImageObject ────────────────────────────────────────────────────
export const imageObjectSchema = (src: string, caption: string) => ({
  "@context": "https://schema.org",
  "@type": "ImageObject",
  contentUrl: src.startsWith("http") ? src : `${siteUrl}${src}`,
  caption,
  contentLocation: "Nairobi, Kenya",
  description: caption,
});

// ─── Open Graph helpers ────────────────────────────────────────────────────
export interface PageMeta {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
  noindex?: boolean;
  canonical?: string;
  publishedTime?: string;
  author?: string;
}
