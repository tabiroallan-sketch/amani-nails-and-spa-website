import { createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { get } from "https";
import { pipeline } from "stream/promises";
import sharp from "sharp";
import path from "path";

const ASSETS_DIR = "assets/images";
const PUBLIC_DIR = "public/images";

const SIZES = [
  { width: 400, suffix: "400w" },
  { width: 800, suffix: "800w" },
  { width: 1200, suffix: "1200w" },
];

const IMAGE_MAP = {
  // === SERVICES ===
  "services/manicure": {
    url: "https://images.pexels.com/photos/7446914/pexels-photo-7446914.jpeg?auto=compress&cs=tinysrgb",
    alt: "Luxury manicure treatment with nail polish application at a professional salon",
    source: "Pexels / Gustavo Fring",
  },
  "services/pedicure": {
    url: "https://images.pexels.com/photos/17056221/pexels-photo-17056221.jpeg?auto=compress&cs=tinysrgb",
    alt: "Relaxing pedicure session with rose petals and warm water soak",
    source: "Pexels / Ron Lach",
  },
  "services/nail-art": {
    url: "https://images.pexels.com/photos/3997388/pexels-photo-3997388.jpeg?auto=compress&cs=tinysrgb",
    alt: "Intricate nail art design with hand-painted floral patterns",
    source: "Pexels / Karolina Grabowska",
  },
  "services/gel-polish": {
    url: "https://images.pexels.com/photos/22668324/pexels-photo-22668324.jpeg?auto=compress&cs=tinysrgb",
    alt: "High-shine gel polish application with UV lamp curing process",
    source: "Pexels / Ron Lach",
  },
  "services/gel-manicure": {
    url: "https://images.pexels.com/photos/34871655/pexels-photo-34871655.jpeg?auto=compress&cs=tinysrgb",
    alt: "Professional gel manicure with mirror finish and cuticle care",
    source: "Pexels / Ron Lach",
  },
  "services/acrylic-nails": {
    url: "https://images.pexels.com/photos/34835300/pexels-photo-34835300.jpeg?auto=compress&cs=tinysrgb",
    alt: "Custom acrylic nail extensions with almond shape and French tip design",
    source: "Pexels / Ron Lach",
  },
  "services/massages": {
    url: "https://images.pexels.com/photos/6560304/pexels-photo-6560304.jpeg?auto=compress&cs=tinysrgb",
    alt: "Therapeutic full-body massage in a serene spa treatment room",
    source: "Pexels / Anna Shvets",
  },
  "services/swedish-massage": {
    url: "https://images.pexels.com/photos/6628690/pexels-photo-6628690.jpeg?auto=compress&cs=tinysrgb",
    alt: "Gentle Swedish massage with long gliding strokes and aromatherapy oils",
    source: "Pexels / cottonbro studio",
  },
  "services/deep-tissue": {
    url: "https://images.pexels.com/photos/6560289/pexels-photo-6560289.jpeg?auto=compress&cs=tinysrgb",
    alt: "Deep tissue massage therapy targeting muscle tension and chronic pain relief",
    source: "Pexels / Anna Shvets",
  },
  "services/hot-stone-massage": {
    url: "https://images.pexels.com/photos/3881073/pexels-photo-3881073.jpeg?auto=compress&cs=tinysrgb",
    alt: "Hot stone massage with heated basalt stones placed on the back for deep relaxation",
    source: "Pexels / Andrea Piacquadio",
  },
  "services/facials": {
    url: "https://images.pexels.com/photos/8460604/pexels-photo-8460604.jpeg?auto=compress&cs=tinysrgb",
    alt: "Luxurious facial treatment with natural face mask and steam therapy",
    source: "Pexels / KoolShooters",
  },
  "services/body-scrubs": {
    url: "https://images.pexels.com/photos/6037892/pexels-photo-6037892.jpeg?auto=compress&cs=tinysrgb",
    alt: "Full-body exfoliation scrub treatment with natural sea salt ingredients",
    source: "Pexels / Anna Shvets",
  },
  "services/waxing": {
    url: "https://images.pexels.com/photos/7281284/pexels-photo-7281284.jpeg?auto=compress&cs=tinysrgb",
    alt: "Professional waxing service with gentle technique on sensitive skin",
    source: "Pexels / Ron Lach",
  },
  "services/eyebrow-shaping": {
    url: "https://images.pexels.com/photos/6135628/pexels-photo-6135628.jpeg?auto=compress&cs=tinysrgb",
    alt: "Precision eyebrow threading and shaping by a professional aesthetician",
    source: "Pexels / Albin Berlin",
  },
  "services/eyelash-extensions": {
    url: "https://images.pexels.com/photos/38194459/pexels-photo-38194459.jpeg?auto=compress&cs=tinysrgb",
    alt: "Semi-permanent eyelash extensions application for voluminous natural lashes",
    source: "Pexels / Rannvas stock",
  },
  "services/ear-piercing": {
    url: "https://images.pexels.com/photos/7400018/pexels-photo-7400018.jpeg?auto=compress&cs=tinysrgb",
    alt: "Professional ear piercing service with sterilised equipment and premium starter jewellery",
    source: "Pexels / Karolina Grabowska",
  },
  "services/nose-piercing": {
    url: "https://images.pexels.com/photos/6940580/pexels-photo-6940580.jpeg?auto=compress&cs=tinysrgb",
    alt: "Nostril piercing with precision placement and hypoallergenic gold jewellery",
    source: "Pexels / cottonbro studio",
  },
  "services/spa-packages": {
    url: "https://images.pexels.com/photos/13068379/pexels-photo-13068379.jpeg?auto=compress&cs=tinysrgb",
    alt: "Luxury spa package experience with candles, flowers, and premium wellness treatments",
    source: "Pexels / Ron Lach",
  },

  // === GALLERY ===
  "gallery/3d-nail-sculpting": {
    url: "https://images.pexels.com/photos/5659020/pexels-photo-5659020.jpeg?auto=compress&cs=tinysrgb",
    alt: "Sculpted 3D butterfly nail art with Swarovski crystal accents and chrome finish",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/acrylic-artistry": {
    url: "https://images.pexels.com/photos/34930129/pexels-photo-34930129.jpeg?auto=compress&cs=tinysrgb",
    alt: "Custom acrylic nails with ombre gradient and gold foil accent design",
    source: "Pexels / Ron Lach",
  },
  "gallery/acrylic-renewal-before": {
    url: "https://images.pexels.com/photos/6811732/pexels-photo-6811732.jpeg?auto=compress&cs=tinysrgb",
    alt: "Overgrown acrylic nails before professional renewal and reshaping treatment",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/acrylic-renewal-after": {
    url: "https://images.pexels.com/photos/6683012/pexels-photo-6683012.jpeg?auto=compress&cs=tinysrgb",
    alt: "Sleek modern almond-shaped acrylic nails after professional renewal service",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/aromatherapy-massage": {
    url: "https://images.pexels.com/photos/6724539/pexels-photo-6724539.jpeg?auto=compress&cs=tinysrgb",
    alt: "Essential oil aromatherapy massage with warm towels and calming herbal tea",
    source: "Pexels / Anna Shvets",
  },
  "gallery/candle-lit-relaxation": {
    url: "https://images.pexels.com/photos/19167421/pexels-photo-19167421.jpeg?auto=compress&cs=tinysrgb",
    alt: "Warm candlelit ambiance with glowing candles designed for deep relaxation and serenity",
    source: "Pexels / Ron Lach",
  },
  "gallery/deep-tissue-therapy": {
    url: "https://images.pexels.com/photos/5659056/pexels-photo-5659056.jpeg?auto=compress&cs=tinysrgb",
    alt: "Therapeutic deep tissue massage using elbow and forearm techniques in a tranquil room",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/floral-masterpiece": {
    url: "https://images.pexels.com/photos/32010584/pexels-photo-32010584.jpeg?auto=compress&cs=tinysrgb",
    alt: "Hand-painted 3D floral nail design with rose gold chrome detailing and gems",
    source: "Pexels / Ron Lach",
  },
  "gallery/gel-polish-marble": {
    url: "https://images.pexels.com/photos/19242408/pexels-photo-19242408.jpeg?auto=compress&cs=tinysrgb",
    alt: "White marble-effect gel polish with subtle gold veining on natural nails",
    source: "Pexels / Ron Lach",
  },
  "gallery/minimal-elegance": {
    url: "https://images.pexels.com/photos/34930139/pexels-photo-34930139.jpeg?auto=compress&cs=tinysrgb",
    alt: "Clean negative-space nail art with delicate gold line work on natural nails",
    source: "Pexels / Ron Lach",
  },
  "gallery/nail-transformation-before": {
    url: "https://images.pexels.com/photos/36376260/pexels-photo-36376260.jpeg?auto=compress&cs=tinysrgb",
    alt: "Brittle and damaged natural nails before complete restoration treatment",
    source: "Pexels / Ron Lach",
  },
  "gallery/nail-transformation-after": {
    url: "https://images.pexels.com/photos/19167421/pexels-photo-19167421.jpeg?auto=compress&cs=tinysrgb",
    alt: "Healthy elegant nails after complete restoration and professional nail care treatment",
    source: "Pexels / Ron Lach",
  },
  "gallery/pedicure-paradise": {
    url: "https://images.pexels.com/photos/8842693/pexels-photo-8842693.jpeg?auto=compress&cs=tinysrgb",
    alt: "Luxury spa pedicure with exfoliating scrub and champagne gold polish finish",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/salon-lounge": {
    url: "https://images.pexels.com/photos/33688471/pexels-photo-33688471.jpeg?auto=compress&cs=tinysrgb",
    alt: "Elegant salon waiting lounge with champagne bar and curated art pieces",
    source: "Pexels / Moose Photos",
  },
  "gallery/spa-suite": {
    url: "https://images.pexels.com/photos/7750120/pexels-photo-7750120.jpeg?auto=compress&cs=tinysrgb",
    alt: "Signature spa suite with ambient candlelight, plush towels, and calming neutral tones",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/treatment-room": {
    url: "https://images.pexels.com/photos/8015835/pexels-photo-8015835.jpeg?auto=compress&cs=tinysrgb",
    alt: "Private treatment room featuring heated therapy bed and soft ambient lighting",
    source: "Pexels / Karolina Grabowska",
  },

  // === INTERIORS (for homepage components) ===
  "gallery/interior-1": {
    url: "https://images.pexels.com/photos/7750099/pexels-photo-7750099.jpeg?auto=compress&cs=tinysrgb",
    alt: "Elegant nail atelier with modern manicure stations and designer lighting fixtures",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/interior-2": {
    url: "https://images.pexels.com/photos/7755679/pexels-photo-7755679.jpeg?auto=compress&cs=tinysrgb",
    alt: "Modern nail art station with organised polish displays and professional equipment",
    source: "Pexels / RDNE Stock project",
  },
  "gallery/interior-3": {
    url: "https://images.pexels.com/photos/7755219/pexels-photo-7755219.jpeg?auto=compress&cs=tinysrgb",
    alt: "Serene massage therapy room with heated treatment bed and tranquil decor",
    source: "Pexels / RDNE Stock project",
  },
  "gallery/interior-4": {
    url: "https://images.pexels.com/photos/7750104/pexels-photo-7750104.jpeg?auto=compress&cs=tinysrgb",
    alt: "Spa relaxation area with comfortable lounge seating and calming wall art",
    source: "Pexels / Karolina Grabowska",
  },
  "gallery/interior-5": {
    url: "https://images.pexels.com/photos/36328527/pexels-photo-36328527.jpeg?auto=compress&cs=tinysrgb",
    alt: "Elegant reception and welcome area with modern check-in desk",
    source: "Pexels / Ron Lach",
  },

  // === TEAM ===
  "team/esther": {
    url: "https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb",
    alt: "Esther Wanjiku — professional nail artist with CIDESCO certification and a decade of experience",
    source: "Pexels / Andrea Piacquadio",
  },
  "team/faith": {
    url: "https://images.pexels.com/photos/5876706/pexels-photo-5876706.jpeg?auto=compress&cs=tinysrgb",
    alt: "Faith Akinyi — aesthetician and waxing specialist providing gentle professional skincare treatments",
    source: "Pexels / Ron Lach",
  },
  "team/grace": {
    url: "https://images.pexels.com/photos/3779700/pexels-photo-3779700.jpeg?auto=compress&cs=tinysrgb",
    alt: "Grace Muthoni — senior massage therapist specialising in deep tissue and hot stone therapy",
    source: "Pexels / Andrea Piacquadio",
  },
  "team/james": {
    url: "https://images.pexels.com/photos/6971179/pexels-photo-6971179.jpeg?auto=compress&cs=tinysrgb",
    alt: "James Ochieng — spa director and lead therapist overseeing premium wellness experiences",
    source: "Pexels / Ron Lach",
  },

  // === BLOG ===
  "blog/bridal-guide": {
    url: "https://images.pexels.com/photos/10087594/pexels-photo-10087594.jpeg?auto=compress&cs=tinysrgb",
    alt: "Bridal spa preparation with rose petals, champagne, and luxury relaxation treatment",
    source: "Pexels / Ron Lach",
  },
  "blog/deep-tissue-signs": {
    url: "https://images.pexels.com/photos/3764550/pexels-photo-3764550.jpeg?auto=compress&cs=tinysrgb",
    alt: "Therapeutic deep tissue massage session relieving chronic tension and muscle pain",
    source: "Pexels / Andrea Piacquadio",
  },
  "blog/nail-care-humidity": {
    url: "https://images.pexels.com/photos/3997376/pexels-photo-3997376.jpeg?auto=compress&cs=tinysrgb",
    alt: "Professional nail care treatment with hydrating cuticle oil and polish application",
    source: "Pexels / Karolina Grabowska",
  },

  // === OG / SOCIAL ===
  "og-image": {
    url: "https://images.pexels.com/photos/7750099/pexels-photo-7750099.jpeg?auto=compress&cs=tinysrgb",
    alt: "Amani Nails & Spa — Nairobi's premier luxury beauty and wellness sanctuary",
    source: "Pexels / Karolina Grabowska",
  },
};

function downloadFile(url, dest, retries = 3) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    const req = get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        get(response.headers.location, (r2) => {
          pipeline(r2, file).then(resolve).catch(reject);
        });
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      pipeline(response, file).then(resolve).catch(reject);
    });
    req.on("error", (err) => {
      if (retries > 0) {
        console.log(`    ↻ Retrying... (${retries} left)`);
        setTimeout(() => downloadFile(url, dest, retries - 1).then(resolve).catch(reject), 2000);
      } else {
        reject(err);
      }
    });
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function processImage(relativePath, info, force) {
  const publicWebpPath = path.join(PUBLIC_DIR, `${relativePath}.webp`);
  const assetJpgPath = path.join(ASSETS_DIR, `${relativePath}.jpg`);

  if (!force && existsSync(publicWebpPath)) {
    console.log(`  ✓ ${relativePath}.webp already exists, skipping`);
    return;
  }

  const dir = path.dirname(assetJpgPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  console.log(`  ↓ Downloading ${relativePath}...`);
  try {
    await downloadFile(info.url, assetJpgPath);
    console.log(`  ✓ Downloaded to assets/`);

    const responsiveDir = path.join(PUBLIC_DIR, path.dirname(relativePath), path.basename(relativePath));
    if (!existsSync(responsiveDir)) {
      mkdirSync(responsiveDir, { recursive: true });
    }

    // Generate standard WebP
    const image = sharp(assetJpgPath);
    const metadata = await image.metadata();
    const outDir = path.dirname(publicWebpPath);
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    await image.webp({ quality: 85, effort: 6 }).toFile(publicWebpPath);
    console.log(`    ✓ Generated ${relativePath}.webp (${metadata.width}x${metadata.height})`);

    // Generate responsive sizes
    for (const size of SIZES) {
      if (metadata.width <= size.width) continue;
      const respPath = path.join(responsiveDir, `${size.suffix}.webp`);
      await sharp(assetJpgPath)
        .resize(size.width, null, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toFile(respPath);
      console.log(`    ✓ Generated ${relativePath}/${size.suffix}.webp`);
    }
  } catch (err) {
    console.error(`  ✗ Failed for ${relativePath}: ${err.message}`);
  }
}

async function main() {
  const force = process.argv.includes("--force");
  console.log("=== Amani Nails & Spa — Premium Image Replacement ===\n");
  console.log(`Source images: ${ASSETS_DIR}/`);
  console.log(`Output WebP:  ${PUBLIC_DIR}/\n`);

  let total = Object.keys(IMAGE_MAP).length;
  let done = 0;

  for (const [relativePath, info] of Object.entries(IMAGE_MAP)) {
    done++;
    console.log(`[${done}/${total}] ${relativePath}`);
    await processImage(relativePath, info, force);
  }

  // Generate image-map.txt
  const imageMapLines = ["# Amani Nails & Spa — Image Map", `# Generated: ${new Date().toISOString().split("T")[0]}`, `# Total: ${total} images`, "", "# Format: relative/path|alt|source"];
  for (const [relativePath, info] of Object.entries(IMAGE_MAP)) {
    imageMapLines.push(`${relativePath}.webp|${info.alt}|${info.source}`);
  }
  await writeFile("image-map.txt", imageMapLines.join("\n"));

  console.log("\n=== DONE ===\n");
  console.log("Image map written to image-map.txt");
}

main().catch(console.error);
