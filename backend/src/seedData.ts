export interface SeedProduct {
  id: number;
  title: string;
  name: string;
  sku: string;
  price: number;
  salePrice: number;
  discountPrice: number;
  discountPercentage: number;
  description: string;
  category: string;
  subCategory: string;
  brand: string;
  rating: number;
  stock: number;
  warranty: string;
  thumbnail: string;
  image: string;
  images: string[];
  featured: boolean;
  trending: boolean;
  badge?: string;
  status?: string;
  active?: boolean;
  specifications: Record<string, any>;
}

export const SEED_PRODUCTS: SeedProduct[] = [
  // ════════════════════════════════════════════════════════════════
  // ── 1. MOBILE & TABLETS (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: "Apple iPhone 15 Pro Max (256GB, Titanium Black)",
    name: "Apple iPhone 15 Pro Max (256GB, Titanium Black)",
    sku: "SE-MOB-IPH15PM-256",
    price: 159900,
    salePrice: 149900,
    discountPrice: 149900,
    discountPercentage: 6,
    description: "Forged in aerospace-grade titanium with the groundbreaking A17 Pro chip, customizable Action button, and 5x Telephoto camera.",
    category: "Mobile & Tablets",
    subCategory: "Smartphones",
    brand: "Apple",
    rating: 4.9,
    stock: 25,
    warranty: "1 Year Manufacturer Comprehensive Warranty",
    thumbnail: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "Flagship",
    specifications: {
      "Display": "6.7-inch Super Retina XDR OLED (120Hz ProMotion)",
      "Processor": "Apple A17 Pro (3nm)",
      "RAM": "8 GB",
      "Storage": "256 GB NVMe",
      "Camera": "48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto",
      "Front Camera": "12MP TrueDepth with Photonic Engine",
      "Battery": "4,422 mAh (Up to 29 hours video playback)",
      "Charging": "20W Wired + 15W MagSafe Wireless",
      "Operating System": "iOS 17 (Upgradable to iOS 18)",
      "Network": "5G VoLTE Dual SIM (nano-SIM + eSIM)",
      "Build Material": "Grade 5 Titanium Frame with Ceramic Shield Front",
      "Warranty": "1 Year Apple India Warranty"
    }
  },
  {
    id: 2,
    title: "Belkin BoostCharge Pro 3-in-1 Wireless Charging Stand with MagSafe 15W",
    name: "Belkin BoostCharge Pro 3-in-1 Wireless Charging Stand with MagSafe 15W",
    sku: "SE-ACC-BELK3IN1-15W",
    price: 14999,
    salePrice: 12999,
    discountPrice: 12999,
    discountPercentage: 13,
    description: "Official MagSafe 15W fast wireless charging station for iPhone, Apple Watch Fast Charger, and dedicated AirPods wireless charging pad.",
    category: "Mobile & Tablets",
    subCategory: "Mobile Accessories",
    brand: "Belkin",
    rating: 4.8,
    stock: 35,
    warranty: "2 Years Official Manufacturer Replacement Warranty",
    thumbnail: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "Official MagSafe",
    specifications: {
      "Wireless Output": "15W MagSafe Fast Wireless + 5W Apple Watch + 5W Qi Pad",
      "Compatibility": "iPhone 12 through 16 Series, Apple Watch Ultra/Series, AirPods Pro",
      "Power Adapter": "40W Premium AC Power Supply Included",
      "Material": "Architectural Stainless Steel and Soft-touch Premium Silicone",
      "Warranty": "2 Years Official Belkin Warranty"
    }
  },
  {
    id: 3,
    title: "Nokia 5710 XpressAudio 4G Dual SIM with In-Built Earbuds",
    name: "Nokia 5710 XpressAudio 4G Dual SIM with In-Built Earbuds",
    sku: "SE-MOB-NOK5710-4G",
    price: 6499,
    salePrice: 4999,
    discountPrice: 4999,
    discountPercentage: 23,
    description: "Iconic slider phone with built-in wireless earbuds housed inside the phone, dedicated audio control buttons, crystal-clear 4G VoLTE, and weeks of standby time.",
    category: "Mobile & Tablets",
    subCategory: "Feature Phones",
    brand: "Nokia",
    rating: 4.6,
    stock: 40,
    warranty: "1 Year Official Brand Warranty on Phone & 6 Months for Earbuds",
    thumbnail: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Built-in Earbuds",
    specifications: {
      "Display": "2.4-inch QVGA Display with Dedicated Music Keys",
      "Audio": "Housed Wireless Earbuds with Touch Controls & FM Radio",
      "Network": "4G VoLTE Dual SIM Support",
      "Battery": "1,450 mAh Removable Battery (Up to 31 Days Standby)",
      "Storage": "MicroSD Expandable up to 32 GB for MP3 Music Library",
      "Warranty": "1 Year Nokia Brand Warranty"
    }
  },
  {
    id: 4,
    title: "Apple iPad Pro 11-inch M4 (256GB, Space Black)",
    name: "Apple iPad Pro 11-inch M4 (256GB, Space Black)",
    sku: "SE-TAB-IPADM4-256",
    price: 99900,
    salePrice: 94900,
    discountPrice: 94900,
    discountPercentage: 5,
    description: "Impossibly thin design with game-changing Apple M4 chip, groundbreaking Ultra Retina XDR OLED display, and Thunderbolt USB 4.",
    category: "Mobile & Tablets",
    subCategory: "iPads",
    brand: "Apple",
    rating: 4.9,
    stock: 18,
    warranty: "1 Year Apple Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "Ultra Thin OLED",
    specifications: {
      "Display": "11-inch Tandem OLED Ultra Retina XDR (1600 nits Peak)",
      "Processor": "Apple M4 (9-core CPU, 10-core GPU with Ray Tracing)",
      "RAM": "8 GB Unified Memory",
      "Storage": "256 GB SSD",
      "Camera": "12MP Wide 4K ProRes + LiDAR Scanner",
      "Accessories Support": "Apple Pencil Pro, Magic Keyboard M4",
      "Warranty": "1 Year Manufacturer Warranty"
    }
  },
  {
    id: 5,
    title: "Samsung Galaxy Tab S9 Ultra (256GB Wi-Fi, Graphite)",
    name: "Samsung Galaxy Tab S9 Ultra (256GB Wi-Fi, Graphite)",
    sku: "SE-TAB-S9U-256",
    price: 108999,
    salePrice: 99999,
    discountPrice: 99999,
    discountPercentage: 8,
    description: "Massive 14.6-inch Dynamic AMOLED 2X screen, IP68 water resistant S Pen included, Snapdragon 8 Gen 2 for Galaxy, and Quad AKG speakers.",
    category: "Mobile & Tablets",
    subCategory: "Tablets",
    brand: "Samsung",
    rating: 4.8,
    stock: 15,
    warranty: "1 Year Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "IP68 Water Resistant",
    specifications: {
      "Display": "14.6-inch Dynamic AMOLED 2X WQXGA+ (120Hz)",
      "Processor": "Qualcomm Snapdragon 8 Gen 2 (4nm)",
      "RAM": "12 GB RAM",
      "Storage": "256 GB (Expandable up to 1TB via microSD)",
      "Battery": "11,200 mAh (45W Fast Charging)",
      "Stylus": "Bundled IP68 Water-resistant S Pen",
      "Warranty": "1 Year Samsung Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 2. LAPTOPS & COMPUTERS (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: "Apple MacBook Pro 16-inch M3 Max (36GB RAM, 1TB SSD)",
    name: "Apple MacBook Pro 16-inch M3 Max (36GB RAM, 1TB SSD)",
    sku: "SE-LAP-MBP16-M3MAX",
    price: 349900,
    salePrice: 329900,
    discountPrice: 329900,
    discountPercentage: 6,
    description: "Extreme performance monster with 14-core CPU, 30-core GPU, Liquid Retina XDR display, up to 22 hours battery life.",
    category: "Laptops & Computers",
    subCategory: "Laptops",
    brand: "Apple",
    rating: 4.9,
    stock: 10,
    warranty: "1 Year Apple Manufacturer Warranty + AppleCare Eligible",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "M3 Max Powerhouse",
    specifications: {
      "Processor": "Apple M3 Max (14-core CPU, 30-core GPU)",
      "RAM": "36 GB Unified Memory",
      "Storage": "1 TB Superfast NVMe SSD",
      "Display Size": "16.2-inch Liquid Retina XDR (3456 x 2234, 120Hz ProMotion)",
      "Graphics Card": "30-core Apple GPU with Hardware Ray Tracing",
      "Battery": "100Wh Lithium-Polymer (Up to 22 hrs runtime)",
      "Operating System": "macOS Sonoma (Free upgrades)",
      "Ports": "3x Thunderbolt 4, HDMI 2.1, SDXC Slot, MagSafe 3",
      "Warranty": "1 Year Apple Limited Warranty"
    }
  },
  {
    id: 7,
    title: "ASUS ROG Strix SCAR 16 Gaming Laptop (RTX 4080, 32GB)",
    name: "ASUS ROG Strix SCAR 16 Gaming Laptop (RTX 4080, 32GB)",
    sku: "SE-LAP-ROGSTRIX-16",
    price: 289990,
    salePrice: 269990,
    discountPrice: 269990,
    discountPercentage: 7,
    description: "Dominate AAA titles with Intel Core i9-14900HX, NVIDIA GeForce RTX 4080 12GB (175W TGP), and ROG Nebula HDR 240Hz Mini-LED display.",
    category: "Laptops & Computers",
    subCategory: "Gaming Laptops",
    brand: "ASUS",
    rating: 4.8,
    stock: 12,
    warranty: "2 Years Onsite Brand Warranty + 1 Year ADP",
    thumbnail: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "240Hz Mini-LED",
    specifications: {
      "Processor": "Intel Core i9-14900HX (24 Cores, 32 Threads, 5.8 GHz)",
      "RAM": "32 GB DDR5 5600MHz (Expandable to 64GB)",
      "Storage": "2 TB PCIe 4.0 NVMe M.2 SSD",
      "Display Size": "16-inch QHD+ 240Hz 3ms Mini-LED ROG Nebula HDR (1100 nits)",
      "Graphics Card": "NVIDIA GeForce RTX 4080 12GB GDDR6 (175W Max TGP)",
      "Operating System": "Windows 11 Home + MS Office Home & Student 2021",
      "Cooling": "Conductonaut Extreme Liquid Metal + Tri-Fan Technology",
      "Warranty": "2 Years ASUS Onsite Warranty"
    }
  },
  {
    id: 8,
    title: "Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE)",
    name: "Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE)",
    sku: "SE-MON-DELL32-4K",
    price: 84999,
    salePrice: 76999,
    discountPrice: 76999,
    discountPercentage: 9,
    description: "Groundbreaking IPS Black technology with 2000:1 contrast ratio, 4K UHD clarity, 90W USB-C Power Delivery, and built-in RJ45 hub.",
    category: "Laptops & Computers",
    subCategory: "Monitors",
    brand: "Dell",
    rating: 4.8,
    stock: 20,
    warranty: "3 Years Advanced Exchange Service & Premium Panel Guarantee",
    thumbnail: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "IPS Black 4K",
    specifications: {
      "Display Size": "31.5-inch 4K UHD (3840 x 2160, 60Hz)",
      "Panel Type": "IPS Black Technology (2000:1 Contrast Ratio)",
      "Color Gamut": "98% DCI-P3, 100% sRGB, VESA DisplayHDR 400",
      "Connectivity": "USB-C (90W PD), DisplayPort 1.4, HDMI 2.0, RJ45 Ethernet, 5x USB-A",
      "Ergonomics": "Height Adjustable, Pivot, Tilt, Swivel",
      "Warranty": "3 Years Dell Replacement Guarantee"
    }
  },
  {
    id: 9,
    title: "Apple iMac 24-inch 4.5K Retina Display (M3 8-core, 16GB, 512GB)",
    name: "Apple iMac 24-inch 4.5K Retina Display (M3 8-core, 16GB, 512GB)",
    sku: "SE-AIO-IMACM3-512",
    price: 174900,
    salePrice: 159900,
    discountPrice: 159900,
    discountPercentage: 9,
    description: "The world's best all-in-one desktop computer with stunning 4.5K Retina display, Apple M3 performance, 1080p FaceTime HD camera, and six-speaker sound system.",
    category: "Laptops & Computers",
    subCategory: "All-in-One PCs",
    brand: "Apple",
    rating: 4.9,
    stock: 18,
    warranty: "1 Year Official Apple Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "All-in-One 4.5K",
    specifications: {
      "Display": "24-inch 4.5K Retina display (4480 x 2520, 500 nits, P3 Wide color)",
      "Processor": "Apple M3 chip (8-core CPU with 4 performance cores and 4 efficiency cores)",
      "Graphics": "10-core GPU with Hardware-accelerated Ray Tracing",
      "RAM": "16 GB Unified Memory",
      "Storage": "512 GB Superfast NVMe SSD",
      "Camera & Audio": "1080p FaceTime HD camera, Studio-quality three-mic array, Six-speaker system",
      "Peripherals": "Magic Keyboard with Touch ID and Magic Mouse included",
      "Operating System": "macOS Sonoma (Upgradable to macOS Sequoia)",
      "Warranty": "1 Year Official Apple India Warranty"
    }
  },
  {
    id: 10,
    title: "Apple Mac Studio (M2 Max 12-core, 32GB RAM, 512GB SSD)",
    name: "Apple Mac Studio (M2 Max 12-core, 32GB RAM, 512GB SSD)",
    sku: "SE-PC-MACSTUDIO-M2M",
    price: 209900,
    salePrice: 194900,
    discountPrice: 194900,
    discountPercentage: 7,
    description: "Pro studio powerhouse in an astonishingly compact footprint with M2 Max, extensive front and back connectivity, and silent thermal architecture.",
    category: "Laptops & Computers",
    subCategory: "Mini PCs",
    brand: "Apple",
    rating: 4.9,
    stock: 14,
    warranty: "1 Year Apple India Warranty",
    thumbnail: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Pro Studio",
    specifications: {
      "Processor": "Apple M2 Max (12-core CPU, 30-core GPU, 16-core Neural Engine)",
      "RAM": "32 GB Unified Memory (400GB/s bandwidth)",
      "Storage": "512 GB PCIe 4.0 SSD",
      "Ports": "4x Thunderbolt 4, 2x USB-A, HDMI, 10Gb Ethernet, SDXC Slot",
      "Dimensions": "19.7 cm x 19.7 cm x 9.5 cm",
      "Operating System": "macOS Sonoma",
      "Warranty": "1 Year Apple Limited Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 3. TVS & ENTERTAINMENT (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 11,
    title: "Sony Bravia XR 65-inch 4K OLED Google TV (A80L)",
    name: "Sony Bravia XR 65-inch 4K OLED Google TV (A80L)",
    sku: "SE-TV-SONYA80L-65",
    price: 249900,
    salePrice: 224900,
    discountPrice: 224900,
    discountPercentage: 10,
    description: "Cognitive Processor XR delivers pure OLED blacks, lifelike contrast, and Acoustic Surface Audio+ where sound comes directly from the screen.",
    category: "TVs & Entertainment",
    subCategory: "OLED TVs",
    brand: "Sony",
    rating: 4.9,
    stock: 14,
    warranty: "3 Years Comprehensive Sony Manufacturer Warranty + Free Wall Installation",
    thumbnail: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "Cognitive XR",
    specifications: {
      "Screen Size": "65 inches (164 cm)",
      "Resolution": "4K Ultra HD (3840 x 2160 pixels)",
      "Display Type": "Self-illuminating OLED (XR OLED Contrast Pro)",
      "Refresh Rate": "120 Hz (Native VRR + ALLM for PS5)",
      "Smart TV": "Google TV with Hands-free Voice Search",
      "HDMI Ports": "4 (2x HDMI 2.1 with 4K 120fps, eARC, ALLM)",
      "USB Ports": "2 (Side USB slots)",
      "Sound Output": "50W Acoustic Surface Audio+ with 3 Actuators & 2 Subwoofers",
      "Warranty": "3 Years Comprehensive Sony Warranty"
    }
  },
  {
    id: 12,
    title: "Samsung 65-inch Neo QLED 4K Smart TV (QN90C)",
    name: "Samsung 65-inch Neo QLED 4K Smart TV (QN90C)",
    sku: "SE-TV-SAMQN90C-65",
    price: 219990,
    salePrice: 194990,
    discountPrice: 194990,
    discountPercentage: 11,
    description: "Quantum Matrix Technology with Mini LEDs, Neural Quantum Processor 4K, Anti-Glare Screen, and Dolby Atmos 60W 4.2.2ch audio.",
    category: "TVs & Entertainment",
    subCategory: "QLED TVs",
    brand: "Samsung",
    rating: 4.8,
    stock: 16,
    warranty: "1 Year Comprehensive + 1 Year Additional on Panel",
    thumbnail: "https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1577979749830-f1d742b96791?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: false,
    badge: "Neo QLED 4K",
    specifications: {
      "Screen Size": "65 inches (163 cm)",
      "Resolution": "4K Ultra HD (3840 x 2160)",
      "Display Type": "Quantum Mini LED Neo QLED with Anti-Reflection",
      "Refresh Rate": "144 Hz Motion Xcelerator Turbo Pro",
      "Smart TV": "Tizen Smart Hub with Gaming Hub & SmartThings",
      "HDMI Ports": "4x HDMI 2.1 (4K@144Hz support)",
      "Sound Output": "60W 4.2.2 Channel Dolby Atmos with OTS+",
      "Warranty": "2 Years Total Samsung Brand Warranty"
    }
  },
  {
    id: 13,
    title: "Sony Bravia 55-inch 4K Ultra HD Smart LED Google TV (KD-55X74L)",
    name: "Sony Bravia 55-inch 4K Ultra HD Smart LED Google TV (KD-55X74L)",
    sku: "SE-TV-SONYX74L-55",
    price: 69900,
    salePrice: 57990,
    discountPrice: 57990,
    discountPercentage: 17,
    description: "Live color technology, X1 4K Processor, 20W Dolby Audio stereo speakers, Google TV with voice search, and Apple AirPlay integration.",
    category: "TVs & Entertainment",
    subCategory: "LED TVs",
    brand: "Sony",
    rating: 4.8,
    stock: 22,
    warranty: "2 Years Official Comprehensive Sony Warranty",
    thumbnail: "https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Bravia 4K LED",
    specifications: {
      "Screen Size": "55 inches (139 cm)",
      "Resolution": "4K Ultra HD (3840 x 2160)",
      "Display Type": "Direct LED with 4K X-Reality PRO",
      "Refresh Rate": "60 Hz Motionflow XR 100",
      "Smart TV": "Google TV with Watchlist and Chromecast Built-in",
      "HDMI Ports": "3x HDMI with ALLM & eARC",
      "Sound Output": "20W Open Baffle Stereo with Dolby Audio",
      "Warranty": "2 Years Sony India Warranty"
    }
  },
  {
    id: 14,
    title: "TCL 55-inch C755 QD-Mini LED 4K Google TV",
    name: "TCL 55-inch C755 QD-Mini LED 4K Google TV",
    sku: "SE-TV-TCLC755-55",
    price: 89990,
    salePrice: 69990,
    discountPrice: 69990,
    discountPercentage: 22,
    description: "500+ Local Dimming Zones, 1300 nits peak brightness, 144Hz VRR, AiPQ Processor 3.0, and ONKYO 2.1 Hi-Fi audio system.",
    category: "TVs & Entertainment",
    subCategory: "Smart TVs",
    brand: "TCL",
    rating: 4.7,
    stock: 25,
    warranty: "2 Years Comprehensive Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Value Mini-LED",
    specifications: {
      "Screen Size": "55 inches (139 cm)",
      "Resolution": "4K Ultra HD (3840 x 2160)",
      "Display Type": "QD-Mini LED with Quantum Dot Color",
      "Refresh Rate": "144 Hz VRR + DLG 240Hz",
      "Smart TV": "Google TV with Hands-free Voice Control",
      "Sound Output": "50W 2.1 Channel ONKYO Sound System with Subwoofer",
      "Warranty": "2 Years TCL Warranty"
    }
  },
  {
    id: 15,
    title: "Apple TV 4K (3rd Generation, 128GB Wi-Fi + Ethernet)",
    name: "Apple TV 4K (3rd Generation, 128GB Wi-Fi + Ethernet)",
    sku: "SE-ENT-APPLTV4K-128",
    price: 16900,
    salePrice: 15900,
    discountPrice: 15900,
    discountPercentage: 6,
    description: "A15 Bionic chip, Dolby Vision, HDR10+, Dolby Atmos cinematic sound, Thread networking, and Siri Remote with USB-C.",
    category: "TVs & Entertainment",
    subCategory: "Set Top Boxes",
    brand: "Apple",
    rating: 4.9,
    stock: 35,
    warranty: "1 Year Apple Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "A15 Bionic Streaming",
    specifications: {
      "Processor": "Apple A15 Bionic chip",
      "Storage": "128 GB Flash Storage",
      "Video Output": "4K 2160p at 60 fps with HDR10+ and Dolby Vision",
      "Audio": "Dolby Atmos 5.1/7.1 Surround Sound",
      "Networking": "Gigabit Ethernet, Wi-Fi 6 (802.11ax), Thread Radio",
      "Remote": "Siri Remote with Touch-enabled Clickpad & USB-C",
      "Warranty": "1 Year Apple India Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 4. AUDIO DEVICES (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 16,
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    sku: "SE-AUD-WH1000XM5",
    price: 34990,
    salePrice: 29990,
    discountPrice: 29990,
    discountPercentage: 14,
    description: "Industry-leading noise cancellation with dual V1 + QN1 processors, 8 microphones, 30 hours battery, and Hi-Res LDAC wireless audio.",
    category: "Audio Devices",
    subCategory: "Headphones",
    brand: "Sony",
    rating: 4.9,
    stock: 40,
    warranty: "1 Year Domestic Sony Warranty",
    thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "Industry Leading ANC",
    specifications: {
      "Driver Unit": "30mm Precision Engineered Carbon Fiber Driver",
      "Noise Cancellation": "Auto NC Optimizer with 8 Microphones & 2 Processors",
      "Battery Life": "30 Hours (NC On) / 40 Hours (NC Off) with Quick Charge",
      "Bluetooth Version": "Bluetooth 5.2 with Multipoint Connection",
      "Codecs Supported": "LDAC, AAC, SBC with DSEE Extreme Upscaling",
      "Weight": "250 grams (Ultra-comfortable soft-fit leather)",
      "Warranty": "1 Year Sony India Warranty"
    }
  },
  {
    id: 17,
    title: "JBL Bar 1300X 11.1.4 Channel Dolby Atmos Soundbar",
    name: "JBL Bar 1300X 11.1.4 Channel Dolby Atmos Soundbar",
    sku: "SE-AUD-JBL1300X",
    price: 149999,
    salePrice: 129999,
    discountPrice: 129999,
    discountPercentage: 13,
    description: "1170W total system power with detachable battery-powered wireless rear speakers, 12-inch wireless subwoofer, and DTS:X 3D surround sound.",
    category: "Audio Devices",
    subCategory: "Soundbars",
    brand: "JBL",
    rating: 4.9,
    stock: 15,
    warranty: "1 Year Harman Brand Comprehensive Warranty",
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: false,
    badge: "1170W Dolby Atmos",
    specifications: {
      "Total Power": "1170 Watts System Output",
      "Speaker Channels": "11.1.4 Channel Surround Setup",
      "Subwoofer": "12-inch Down-firing 300W Wireless Subwoofer",
      "Rear Speakers": "Truly Wireless Detachable Battery-Powered Surround Speakers",
      "Audio Formats": "Dolby Atmos, DTS:X, MultiBeam 3D Audio",
      "Connectivity": "3x HDMI In, 1x HDMI eARC Out, Wi-Fi 6, AirPlay 2, Alexa",
      "Warranty": "1 Year Harman International Warranty"
    }
  },
  {
    id: 18,
    title: "Apple AirPods Pro (2nd Generation with USB-C MagSafe)",
    name: "Apple AirPods Pro (2nd Generation with USB-C MagSafe)",
    sku: "SE-AUD-AIRPODSPRO2",
    price: 24900,
    salePrice: 21900,
    discountPrice: 21900,
    discountPercentage: 12,
    description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking, and IP54 dust resistance.",
    category: "Audio Devices",
    subCategory: "Wireless Earbuds",
    brand: "Apple",
    rating: 4.9,
    stock: 50,
    warranty: "1 Year Apple Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Adaptive Audio",
    specifications: {
      "Audio Chip": "Apple H2 Headphone Chip",
      "Charging Case": "MagSafe Case (USB-C) with Speaker & Lanyard Loop",
      "Battery Life": "Up to 6 hours listening (30 hours total with Case)",
      "Dust/Water Resistance": "IP54 rated (Earbuds and Case)",
      "Microphones": "Dual beamforming microphones + Inward-facing microphone",
      "Warranty": "1 Year Apple India Warranty"
    }
  },
  {
    id: 19,
    title: "Sony WI-1000XM2 Hi-Res Wireless Noise Cancelling Neckband Headphones",
    name: "Sony WI-1000XM2 Hi-Res Wireless Noise Cancelling Neckband Headphones",
    sku: "SE-AUD-SONYNECK-1000M2",
    price: 24990,
    salePrice: 19990,
    discountPrice: 19990,
    discountPercentage: 20,
    description: "Industry-leading noise cancellation powered by the HD Noise Cancelling Processor QN1, dual microphones, flexible silicone neckband, and Hi-Res Wireless Audio.",
    category: "Audio Devices",
    subCategory: "Neckbands",
    brand: "Sony",
    rating: 4.8,
    stock: 25,
    warranty: "1 Year Official Sony India Warranty",
    thumbnail: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Hi-Res Neckband",
    specifications: {
      "Noise Cancellation": "HD Noise Cancelling Processor QN1 with Dual Noise Sensor",
      "Driver Unit": "HD Hybrid Driver System (9mm dynamic + Balanced Armature)",
      "Battery Life": "Up to 10 hours with Noise Cancellation / 15 hours ANC Off",
      "Quick Charge": "10 minutes charge gives 80 minutes playback",
      "Audio Codecs": "LDAC, AAC, SBC (Hi-Res Audio Wireless Certified)",
      "Design": "Flexible silicone neckband with magnetic earbuds and carrying case",
      "Warranty": "1 Year Official Sony Warranty"
    }
  },
  {
    id: 20,
    title: "Marshall Emberton II Portable Bluetooth Speaker",
    name: "Marshall Emberton II Portable Bluetooth Speaker",
    sku: "SE-AUD-MARSHALLEMB2",
    price: 19999,
    salePrice: 16999,
    discountPrice: 16999,
    discountPercentage: 15,
    description: "Signature Marshall sound with True Stereophonic 360° multi-directional audio, 30+ hours portable playtime, and IP67 dust/water resistance.",
    category: "Audio Devices",
    subCategory: "Bluetooth Speakers",
    brand: "Marshall",
    rating: 4.8,
    stock: 30,
    warranty: "1 Year Marshall Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "30+ Hours Battery",
    specifications: {
      "Audio Output": "2x 10W Class D Amplifiers with Custom Drivers",
      "Frequency Range": "60 Hz – 20,000 Hz",
      "Battery Life": "30+ Hours Playtime (3 hours full recharge)",
      "Durability": "IP67 Dust and Water Resistance",
      "Bluetooth": "Bluetooth 5.1 with Stack Mode multi-speaker pairing",
      "Warranty": "1 Year Brand Replacement Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 5. SMART DEVICES (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 21,
    title: "Apple Watch Ultra 2 (Titanium GPS + Cellular, 49mm)",
    name: "Apple Watch Ultra 2 (Titanium GPS + Cellular, 49mm)",
    sku: "SE-SMT-AWU2-49",
    price: 89900,
    salePrice: 84900,
    discountPrice: 84900,
    discountPercentage: 6,
    description: "Rugged 49mm aerospace titanium case, brightest 3000-nit Always-On display, precision dual-frequency GPS, and up to 72 hours battery in Low Power Mode.",
    category: "Smart Devices",
    subCategory: "Smart Watches",
    brand: "Apple",
    rating: 4.9,
    stock: 20,
    warranty: "1 Year Apple Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "Titanium 3000 Nits",
    specifications: {
      "Case Size": "49mm Aerospace-grade Titanium with Sapphire Crystal",
      "Display": "3000 nits Always-On Retina OLED Display",
      "Processor": "S9 SiP with 64-bit dual-core and Double Tap Gesture",
      "Water Resistance": "100m Water Resistant with 40m Recreational Dive Gauge",
      "Sensors": "ECG, Blood Oxygen, Skin Temperature, Compass, Depth Gauge",
      "Battery Life": "36 Hours Normal Use / 72 Hours Low Power Mode",
      "Warranty": "1 Year Apple India Warranty"
    }
  },
  {
    id: 22,
    title: "Fitbit Charge 6 Advanced Health & Fitness Smart Band",
    name: "Fitbit Charge 6 Advanced Health & Fitness Smart Band",
    sku: "SE-SMT-FITCHG6-BLK",
    price: 14999,
    salePrice: 12999,
    discountPrice: 12999,
    discountPercentage: 13,
    description: "Deep Google integration with Google Maps, Google Wallet, 60% more accurate heart rate tracking, EDA Stress scan, and 7-day battery life.",
    category: "Smart Devices",
    subCategory: "Smart Bands",
    brand: "Fitbit",
    rating: 4.7,
    stock: 35,
    warranty: "1 Year Official Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Google Inside",
    specifications: {
      "Display": "Color AMOLED Touchscreen with Always-on Display Option",
      "Heart Rate": "Fitbit's Most Accurate Heart Rate Tracking Powered by Google AI",
      "Sensors": "Built-in GPS + GLONASS, ECG App, SpO2, EDA Stress Sensor",
      "Battery Life": "Up to 7 Days Battery Life (2 Hours Fast Recharge)",
      "Water Resistance": "Water Resistant to 50 meters (Swimproof)",
      "Smart Features": "Google Maps turn-by-turn, Google Wallet contactless pay, YouTube Music controls",
      "Warranty": "1 Year Official Fitbit Warranty"
    }
  },
  {
    id: 23,
    title: "Amazon Echo Show 8 (3rd Gen) HD Smart Display with Alexa",
    name: "Amazon Echo Show 8 (3rd Gen) HD Smart Display with Alexa",
    sku: "SE-SMT-ECHOSHOW8-G3",
    price: 15999,
    salePrice: 13499,
    discountPrice: 13499,
    discountPercentage: 15,
    description: "Spatial audio HD smart display with 13MP auto-framing camera, smart home hub with Zigbee, Thread, and Matter support, and hands-free Alexa voice commands.",
    category: "Smart Devices",
    subCategory: "Smart Home Devices",
    brand: "Amazon",
    rating: 4.8,
    stock: 28,
    warranty: "1 Year Amazon India Domestic Warranty",
    thumbnail: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Smart Hub Display",
    specifications: {
      "Screen": "8.0-inch HD Touchscreen Display with Adaptive Color (1280 x 800)",
      "Camera": "13 MP Camera with Auto-framing and Built-in Privacy Shutter",
      "Audio": "Spatial Audio with dual 2.0-inch full range neodymium drivers + passive radiator",
      "Smart Home Hub": "Built-in Zigbee, Thread, Bluetooth Low Energy, and Matter controller",
      "Voice Control": "Far-field voice recognition with Alexa Built-in",
      "Warranty": "1 Year Amazon Official Warranty"
    }
  },
  {
    id: 24,
    title: "Google Nest Cam (Outdoor or Indoor, Battery)",
    name: "Google Nest Cam (Outdoor or Indoor, Battery)",
    sku: "SE-SMT-NESTCAM-BAT",
    price: 19999,
    salePrice: 17999,
    discountPrice: 17999,
    discountPercentage: 10,
    description: "Smart wire-free security camera with intelligent alerts for people, animals, and vehicles, 1080p HDR video with night vision, and magnetic mount.",
    category: "Smart Devices",
    subCategory: "Smart Cameras",
    brand: "Google",
    rating: 4.7,
    stock: 25,
    warranty: "1 Year Google Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Smart Battery Cam",
    specifications: {
      "Video Resolution": "1080p Full HD at 30 fps with HDR and Night Vision",
      "Field of View": "130° Diagonal",
      "Power Source": "Built-in Rechargeable 6Ah Lithium-ion Battery",
      "Smart Intelligence": "On-device AI detects People, Animals, Vehicles, Packages",
      "Weather Resistance": "IP54 Weather-resistant for Year-Round Outdoors",
      "Audio": "High-quality Two-Way Talk with Noise Cancellation",
      "Warranty": "1 Year Google Warranty"
    }
  },
  {
    id: 25,
    title: "Philips Hue White & Color Ambiance Smart Bulb Starter Kit",
    name: "Philips Hue White & Color Ambiance Smart Bulb Starter Kit",
    sku: "SE-SMT-HUEKIT-RGB",
    price: 14999,
    salePrice: 12499,
    discountPrice: 12499,
    discountPercentage: 17,
    description: "Transform your home lighting with 16 million colors, includes 3 Smart E27 LED Bulbs, Hue Bridge, and Smart Dimmer Switch with music sync.",
    category: "Smart Devices",
    subCategory: "Smart Lights",
    brand: "Philips",
    rating: 4.8,
    stock: 30,
    warranty: "2 Years Signify Philips India Warranty",
    thumbnail: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "16M Colors Sync",
    specifications: {
      "Light Output": "1100 Lumens per bulb (75W Equivalent)",
      "Colors": "16 Million Colors + 50,000 Shades of White Light",
      "Included Hardware": "3x E27 Color Bulbs, 1x Hue Bridge Hub, 1x Smart Dimmer Switch",
      "Ecosystem Support": "Apple HomeKit, Google Assistant, Amazon Alexa, Spotify Sync",
      "Lifespan": "25,000 Hours (Approx. 25 Years at 3h/day)",
      "Warranty": "2 Years Philips Brand Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 6. COMPUTER ACCESSORIES (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 26,
    title: "Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD",
    name: "Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD",
    sku: "SE-ACC-SAM990PRO-2TB",
    price: 24999,
    salePrice: 19999,
    discountPrice: 19999,
    discountPercentage: 20,
    description: "Unrivaled sequential read/write speeds up to 7,450 / 6,900 MB/s, optimized power efficiency, Nickel-coated controller, and PS5 compatibility.",
    category: "Computer Accessories",
    subCategory: "SSD",
    brand: "Samsung",
    rating: 4.9,
    stock: 45,
    warranty: "5 Years Limited Manufacturer Warranty or 1200 TBW",
    thumbnail: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "7,450 MB/s Flagship",
    specifications: {
      "Capacity": "2,000 GB (2 TB)",
      "Form Factor": "M.2 (2280) PCIe Gen 4.0 x4, NVMe 2.0",
      "Sequential Read": "Up to 7,450 MB/s",
      "Sequential Write": "Up to 6,900 MB/s",
      "Cache Memory": "Samsung 2GB Low Power DDR4 SDRAM",
      "Endurance": "1,200 Terabytes Written (TBW)",
      "Warranty": "5 Years Brand Replacement Warranty"
    }
  },
  {
    id: 27,
    title: "Logitech MX Master 3S Wireless Performance Mouse",
    name: "Logitech MX Master 3S Wireless Performance Mouse",
    sku: "SE-ACC-MXM3S-GR",
    price: 10995,
    salePrice: 9495,
    discountPrice: 9495,
    discountPercentage: 14,
    description: "Quiet Click technology, 8,000 DPI track-on-glass sensor, MagSpeed electromagnetic scroll wheel (1,000 lines/sec), and Flow cross-computer control.",
    category: "Computer Accessories",
    subCategory: "Mouse",
    brand: "Logitech",
    rating: 4.9,
    stock: 50,
    warranty: "1 Year Limited Hardware Warranty",
    thumbnail: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "8K DPI Sensor",
    specifications: {
      "Sensor Technology": "Darkfield High Precision (8,000 DPI tracking)",
      "Scroll Wheel": "MagSpeed SmartShift Electromagnetic Wheel",
      "Click Sound": "Quiet Clicks (90% Less Click Noise)",
      "Battery": "Rechargeable Li-Po (500 mAh) - Up to 70 days on full charge",
      "Multi-Device": "Pair up to 3 devices via Logi Bolt or Bluetooth",
      "Warranty": "1 Year Logitech Brand Warranty"
    }
  },
  {
    id: 28,
    title: "Logitech MX Mechanical Wireless Illuminated Keyboard",
    name: "Logitech MX Mechanical Wireless Illuminated Keyboard",
    sku: "SE-ACC-MXMECH-KB",
    price: 17495,
    salePrice: 15495,
    discountPrice: 15495,
    discountPercentage: 11,
    description: "Low-profile tactile quiet mechanical switches, smart backlighting that activates upon hand proximity, dual-layout for Mac and Windows.",
    category: "Computer Accessories",
    subCategory: "Keyboards",
    brand: "Logitech",
    rating: 4.8,
    stock: 35,
    warranty: "1 Year Logitech Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Tactile Quiet",
    specifications: {
      "Key Switches": "Tactile Quiet Low-Profile Mechanical Switches",
      "Backlighting": "Smart Proximity-sensing Backlit Keys with 6 Lighting Effects",
      "Connectivity": "Bluetooth Low Energy + Logi Bolt USB Receiver",
      "Battery Life": "Up to 15 days (Backlit on) / Up to 10 months (Backlit off)",
      "Compatibility": "Windows, macOS, Linux, ChromeOS, iPadOS, Android",
      "Warranty": "1 Year Brand Hardware Warranty"
    }
  },
  {
    id: 29,
    title: "Logitech Brio 4K Ultra HD Pro Webcam with HDR",
    name: "Logitech Brio 4K Ultra HD Pro Webcam with HDR",
    sku: "SE-ACC-BRIO4K-CAM",
    price: 24995,
    salePrice: 18995,
    discountPrice: 18995,
    discountPercentage: 24,
    description: "Ultra 4K HD resolution at 30 fps, RightLight 3 with HDR, adjustable 65°/78°/90° field of view, Windows Hello facial recognition, and dual omni-directional mics.",
    category: "Computer Accessories",
    subCategory: "Webcams",
    brand: "Logitech",
    rating: 4.8,
    stock: 28,
    warranty: "3 Years Logitech Limited Hardware Warranty",
    thumbnail: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "4K HDR Pro",
    specifications: {
      "Resolution": "4K Ultra HD (3840x2160@30fps), 1080p (60fps)",
      "Field of View": "Adjustable 65°, 78°, and 90° diagonal FOV",
      "Lighting Technology": "RightLight 3 with High Dynamic Range (HDR)",
      "Security": "Infrared Sensor with Windows Hello Facial Recognition",
      "Microphones": "Dual integrated omnidirectional mics with noise cancellation",
      "Warranty": "3 Years Logitech Domestic Warranty"
    }
  },
  {
    id: 30,
    title: "HP Smart Tank 580 All-in-One Wi-Fi Color Inkjet Printer",
    name: "HP Smart Tank 580 All-in-One Wi-Fi Color Inkjet Printer",
    sku: "SE-ACC-HPSMART580",
    price: 18990,
    salePrice: 15490,
    discountPrice: 15490,
    discountPercentage: 18,
    description: "Print, Copy, Scan with smart self-healing Wi-Fi, up to 12,000 black or 6,000 color pages included in the box, and borderless photo printing.",
    category: "Computer Accessories",
    subCategory: "Printers",
    brand: "HP",
    rating: 4.7,
    stock: 20,
    warranty: "1 Year or 30,000 pages HP Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Ultra Low Cost",
    specifications: {
      "Functions": "Print, Copy, Scan, Wireless",
      "Print Speed": "Up to 12 ppm (Black) / Up to 5 ppm (Color)",
      "Print Resolution": "Up to 4800 x 1200 optimized dpi (Color)",
      "Connectivity": "Self-healing Dual-band Wi-Fi, Hi-Speed USB 2.0, Bluetooth LE",
      "Yield": "Up to 12,000 Black / 6,000 Color Pages Included",
      "Warranty": "1 Year HP Onsite Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 7. GAMING ZONE (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 31,
    title: "Sony PlayStation 5 Slim Console (1TB SSD, Disc Edition)",
    name: "Sony PlayStation 5 Slim Console (1TB SSD, Disc Edition)",
    sku: "SE-GAM-PS5SLIM-DISC",
    price: 54990,
    salePrice: 49990,
    discountPrice: 49990,
    discountPercentage: 9,
    description: "Next-gen gaming redefined: ultra-high speed 1TB custom SSD, ray tracing, 4K-TV gaming at 120Hz, Tempest 3D AudioTech, and DualSense haptic triggers.",
    category: "Gaming Zone",
    subCategory: "PlayStation",
    brand: "Sony",
    rating: 4.9,
    stock: 30,
    warranty: "1 Year Official Sony India Warranty",
    thumbnail: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "1TB SSD Slim",
    specifications: {
      "Storage": "1 TB Custom High-Speed NVMe SSD (5.5 GB/s Raw Read)",
      "GPU": "AMD Radeon RDNA 2-based graphics (10.3 TFLOPS)",
      "CPU": "Custom 8-core AMD Zen 2 (up to 3.5 GHz variable)",
      "Video Output": "HDMI 2.1 (4K 120Hz, 8K, VRR Supported)",
      "Audio": "Tempest 3D AudioTech",
      "Optical Drive": "Ultra HD Blu-ray Disc Drive Included",
      "Warranty": "1 Year Sony India Warranty"
    }
  },
  {
    id: 32,
    title: "Microsoft Xbox Series X 1TB Gaming Console",
    name: "Microsoft Xbox Series X 1TB Gaming Console",
    sku: "SE-GAM-XBOXSERX-1TB",
    price: 55990,
    salePrice: 49990,
    discountPrice: 49990,
    discountPercentage: 11,
    description: "The fastest, most powerful Xbox ever: 12 teraflops of raw graphic processing power, DirectX Raytracing, Quick Resume for multiple games, and true 4K gaming.",
    category: "Gaming Zone",
    subCategory: "Xbox",
    brand: "Microsoft",
    rating: 4.8,
    stock: 20,
    warranty: "1 Year Microsoft Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "12 Teraflops",
    specifications: {
      "Processor": "Custom 8-Core AMD Zen 2 CPU @ 3.8 GHz",
      "Graphics": "12 TFLOPS, 52 CUs @ 1.825 GHz Custom RDNA 2 GPU",
      "Memory": "16 GB GDDR6 with 320-bit wide bus",
      "Internal Storage": "1 TB Custom NVMe SSD",
      "Gaming Resolution": "True 4K Gaming up to 120 FPS, 8K Ready",
      "Warranty": "1 Year Microsoft India Warranty"
    }
  },
  {
    id: 33,
    title: "Nintendo Switch OLED Model (Mario Red Edition)",
    name: "Nintendo Switch OLED Model (Mario Red Edition)",
    sku: "SE-GAM-SWITCHOLED-MR",
    price: 34999,
    salePrice: 29999,
    discountPrice: 29999,
    discountPercentage: 14,
    description: "Vibrant 7-inch OLED screen with deep blacks, wide adjustable stand, wired LAN dock, 64GB internal storage, and iconic Mario Red finish.",
    category: "Gaming Zone",
    subCategory: "Gaming Consoles",
    brand: "Nintendo",
    rating: 4.8,
    stock: 22,
    warranty: "1 Year Comprehensive Seller Warranty",
    thumbnail: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "OLED Handheld",
    specifications: {
      "Screen": "7.0-inch Multi-touch Capacitive OLED Display",
      "Storage": "64 GB Internal (Expandable up to 2TB via microSD)",
      "Play Modes": "TV Mode, Tabletop Mode, Handheld Mode",
      "Battery Life": "Approx. 4.5 to 9 hours",
      "Audio": "Enhanced Onboard Stereo Speakers",
      "Warranty": "1 Year Warranty"
    }
  },
  {
    id: 34,
    title: "Sony DualSense Edge Wireless Controller for PS5",
    name: "Sony DualSense Edge Wireless Controller for PS5",
    sku: "SE-GAM-DUALSENSEEDGE",
    price: 18990,
    salePrice: 17490,
    discountPrice: 17490,
    discountPercentage: 8,
    description: "High-performance customizable controller: changeable stick modules, swappable back buttons, adjustable trigger stops, and custom profiles.",
    category: "Gaming Zone",
    subCategory: "Gaming Controllers",
    brand: "Sony",
    rating: 4.9,
    stock: 25,
    warranty: "1 Year Sony Official Warranty",
    thumbnail: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Pro Esports Grade",
    specifications: {
      "Stick Modules": "Removable and Replaceable Analog Stick Modules",
      "Trigger Stops": "Adjustable Travel Distance with Physical Sliders",
      "Back Buttons": "Two Swappable Sets of Back Buttons (Half-dome and Lever)",
      "Haptic Feedback": "Dynamic Dual Actuator Haptic Feedback + Adaptive Triggers",
      "Case Included": "Braided USB cable with lockable connector housing & Carry Case",
      "Warranty": "1 Year Sony India Warranty"
    }
  },
  {
    id: 35,
    title: "Meta Quest 3 512GB Breakthrough Mixed Reality VR Headset",
    name: "Meta Quest 3 512GB Breakthrough Mixed Reality VR Headset",
    sku: "SE-GAM-METAQUEST3-512",
    price: 64999,
    salePrice: 56999,
    discountPrice: 56999,
    discountPercentage: 12,
    description: "Transform your home into a virtual playground: 4K+ Infinite Display, Snapdragon XR2 Gen 2 chip with 2x graphic processing, and full-color Passthrough.",
    category: "Gaming Zone",
    subCategory: "VR Headsets",
    brand: "Meta",
    rating: 4.8,
    stock: 18,
    warranty: "1 Year Limited Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Mixed Reality 4K+",
    specifications: {
      "Display Resolution": "2064x2208 pixels per eye (4K+ Infinite Display)",
      "Processor": "Qualcomm Snapdragon XR2 Gen 2",
      "Storage": "512 GB High-Speed Flash",
      "Passthrough": "Dual RGB Color Cameras with Depth Projector",
      "Controllers": "Touch Plus Controllers with TruTouch Haptics (Ring-free)",
      "Audio": "Integrated Spatial Audio with 40% louder volume range",
      "Warranty": "1 Year Replacement Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 8. POWER & CHARGING (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 36,
    title: "Anker Prime 27,650mAh Power Bank (250W Total Output, 3-Port)",
    name: "Anker Prime 27,650mAh Power Bank (250W Total Output, 3-Port)",
    sku: "SE-PWR-ANKERPRIME-250",
    price: 19999,
    salePrice: 16999,
    discountPrice: 16999,
    discountPercentage: 15,
    description: "Flight-approved 99.54Wh capacity with 2x USB-C ports delivering up to 140W each, smart smart digital display app control, and 170W recharge.",
    category: "Power & Charging",
    subCategory: "Power Banks",
    brand: "Anker",
    rating: 4.9,
    stock: 30,
    warranty: "2 Years Anker Official Replacement Warranty",
    thumbnail: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "250W Ultra Output",
    specifications: {
      "Battery Capacity": "27,650 mAh (99.54 Wh Flight-approved TSA Compliant)",
      "Total Power Output": "250 Watts Simultaneous Max Output",
      "Single Port Max": "140W Max PD 3.1 (Charges MacBook Pro 16 to 50% in 28 mins)",
      "Ports": "2x USB-C (PD 3.1) + 1x USB-A (65W)",
      "Smart Display": "Real-time Power, Battery Health, Temperature & App Sync",
      "Warranty": "2 Years Anker India Warranty"
    }
  },
  {
    id: 37,
    title: "Anker 737 GaNPrime 120W 3-Port PPS Fast Wall Charger",
    name: "Anker 737 GaNPrime 120W 3-Port PPS Fast Wall Charger",
    sku: "SE-PWR-ANKER120W-GAN",
    price: 8999,
    salePrice: 6999,
    discountPrice: 6999,
    discountPercentage: 22,
    description: "GaNPrime architecture with PowerIQ 4.0 dynamic power distribution, ActiveShield 2.0 temperature monitoring, and 39% smaller size.",
    category: "Power & Charging",
    subCategory: "Fast Chargers",
    brand: "Anker",
    rating: 4.8,
    stock: 45,
    warranty: "2 Years Anker Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "GaNPrime 120W",
    specifications: {
      "Total Wattage": "120W Max Output",
      "Ports": "2x USB-C + 1x USB-A",
      "Technology": "GaNPrime (Gallium Nitride) with PowerIQ 4.0",
      "Safety": "ActiveShield 2.0 monitors temperature 3,000,000 times per day",
      "Compatibility": "Laptops, MacBooks, iPhones, Galaxy S24, Tablets",
      "Warranty": "2 Years Replacement Warranty"
    }
  },
  {
    id: 38,
    title: "Apple 70W USB-C Power Adapter Fast Charger",
    name: "Apple 70W USB-C Power Adapter Fast Charger",
    sku: "SE-PWR-APPL70W-USBC",
    price: 5900,
    salePrice: 5200,
    discountPrice: 5200,
    discountPercentage: 12,
    description: "Fast, efficient charging at home, in the office, or on the go. Compatible with MacBook Air 13 and 15-inch models with fast charge support.",
    category: "Power & Charging",
    subCategory: "Mobile Chargers",
    brand: "Apple",
    rating: 4.9,
    stock: 40,
    warranty: "1 Year Apple Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Official Apple",
    specifications: {
      "Output": "70W USB-C Power Delivery",
      "Compatibility": "MacBook Pro, MacBook Air, iPad Pro, iPhone 15 Series",
      "Safety": "Over-voltage and short circuit protection",
      "Warranty": "1 Year Apple India Warranty"
    }
  },
  {
    id: 39,
    title: "Belkin BoostCharge Braided Silicone USB-C to USB-C Cable (2m)",
    name: "Belkin BoostCharge Braided Silicone USB-C to USB-C Cable (2m)",
    sku: "SE-PWR-BELKIN2M-C2C",
    price: 2499,
    salePrice: 1999,
    discountPrice: 1999,
    discountPercentage: 20,
    description: "Ultra-durable double-braided silicone jacket tested to survive 25,000+ bends, supports up to 100W Power Delivery and tangle-free magnetic clip.",
    category: "Power & Charging",
    subCategory: "USB Cables",
    brand: "Belkin",
    rating: 4.8,
    stock: 60,
    warranty: "2 Years Belkin Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "100W PD 25K Bends",
    specifications: {
      "Length": "2 meters (6.6 feet)",
      "Power Delivery": "Supports up to 100W USB-PD Fast Charging",
      "Durability": "Double Braided Silicone Cable tested to 25,000+ bends",
      "Data Transfer": "USB 2.0 (480 Mbps)",
      "Warranty": "2 Years Belkin Domestic Warranty"
    }
  },
  {
    id: 40,
    title: "GM Modular 4-Way Spike Guard with Individual Switches",
    name: "GM Modular 4-Way Spike Guard with Individual Switches",
    sku: "SE-PWR-GM4WAY-SPIKE",
    price: 1290,
    salePrice: 990,
    discountPrice: 990,
    discountPercentage: 23,
    description: "Heavy-duty surge protector with 4 universal international sockets, individual LED indicators, thermal trip overload protector, and 2m pure copper cord.",
    category: "Power & Charging",
    subCategory: "Extension Boards",
    brand: "GM",
    rating: 4.7,
    stock: 50,
    warranty: "1 Year Brand Manufacturer Warranty",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Surge Protected",
    specifications: {
      "Sockets": "4 Universal International Sockets with Child Safety Shutters",
      "Power Rating": "10 Amps, 240V AC, 2400W Maximum",
      "Protection": "Surge / Spike Suppressor with Resettable Circuit Breaker",
      "Cable Length": "2 Meters Heavy Duty Copper Wire",
      "Warranty": "1 Year GM Brand Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 9. HOME APPLIANCES (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 41,
    title: "LG 1.5 Ton 5 Star Dual Inverter Split AC (AI Convertible 6-in-1)",
    name: "LG 1.5 Ton 5 Star Dual Inverter Split AC (AI Convertible 6-in-1)",
    sku: "SE-AC-LG15TON-5S",
    price: 78990,
    salePrice: 46990,
    discountPrice: 46990,
    discountPercentage: 40,
    description: "AI DUAL Inverter compressor predicts cooling needs, Ocean Black Protection 100% copper condenser, Viraat Mode, and 5 Star Energy Rating.",
    category: "Home Appliances",
    subCategory: "Air Conditioners",
    brand: "LG",
    rating: 4.8,
    stock: 20,
    warranty: "10 Years on Compressor + 5 Years on PCB + 1 Year Comprehensive",
    thumbnail: "https://images.unsplash.com/photo-1614633833026-0620959f6333?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1614633833026-0620959f6333?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1614633833026-0620959f6333?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "5 Star Dual Inverter",
    specifications: {
      "Capacity": "1.5 Ton (Ideal for rooms 111 to 150 sq.ft)",
      "Energy Rating": "5 Star BEE Rating (ISEER 5.20)",
      "Compressor": "Dual Rotary Inverter Compressor with AI 6-in-1 Modes",
      "Condenser Coil": "100% Grooved Copper with Ocean Black Anti-Corrosion Protection",
      "Cooling Capacity": "5,000 Watts (Max 5,800W in Viraat Mode)",
      "Power Consumption": "685.28 kWh Annual Electricity Units",
      "Refrigerant": "R32 Eco-friendly Green Gas (Zero Ozone Depletion)",
      "Warranty": "10 Years Compressor + 5 Years PCB + 1 Year Comprehensive"
    }
  },
  {
    id: 42,
    title: "Samsung 653L 3-Door Side-by-Side Inverter Refrigerator",
    name: "Samsung 653L 3-Door Side-by-Side Inverter Refrigerator",
    sku: "SE-REF-SAM653L-3D",
    price: 112900,
    salePrice: 84990,
    discountPrice: 84990,
    discountPercentage: 25,
    description: "Convertible 5-in-1 Smart Convertible mode, SpaceMax thin walls for massive interior storage, Digital Inverter with 20 years warranty.",
    category: "Home Appliances",
    subCategory: "Refrigerators",
    brand: "Samsung",
    rating: 4.8,
    stock: 12,
    warranty: "20 Years Warranty on Digital Inverter Compressor + 1 Year Comprehensive",
    thumbnail: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: false,
    badge: "SpaceMax 653L",
    specifications: {
      "Total Capacity": "653 Litres (Fresh Food: 409L, Freezer: 244L)",
      "Door Type": "3-Door Side by Side with Twin Cooling Plus",
      "Cooling Technology": "All-Around Cooling + Power Cool / Power Freeze",
      "Compressor Type": "Digital Inverter Compressor (Consumes 50% less energy)",
      "Deodorizer": "Built-in Activated Carbon Deodorizing Filter",
      "Defrost Type": "Frost Free Automatic Defrost",
      "Warranty": "20 Years Compressor Warranty + 1 Year Comprehensive"
    }
  },
  {
    id: 43,
    title: "Havells Adonia 25L Digital Storage Water Geyser",
    name: "Havells Adonia 25L Digital Storage Water Geyser",
    sku: "SE-GEY-HAV25L-SPIN",
    price: 24990,
    salePrice: 16990,
    discountPrice: 16990,
    discountPercentage: 32,
    description: "Feroglas tech ultra-thick steel tank, Incoloy 800 glass-coated heating element, smart digital temperature display, and 8-bar pressure rating.",
    category: "Home Appliances",
    subCategory: "Geysers",
    brand: "Havells",
    rating: 4.7,
    stock: 22,
    warranty: "7 Years on Inner Container + 4 Years on Heating Element + 2 Years Comprehensive",
    thumbnail: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Feroglas 7-Year Tank",
    specifications: {
      "Tank Capacity": "25 Litres Storage Geyser",
      "Power Consumption": "2,000 Watts Rapid Heating",
      "Tank Coating": "Feroglas Technology with Single Weld Line Design",
      "Heating Element": "Incoloy 800 Glass Coated Heating Element",
      "Working Pressure": "8 Bar (Suitable for high-rise buildings up to 35 floors)",
      "Safety": "Shock-safe Integrated ELCB + Multi-function Safety Valve",
      "Warranty": "7 Years on Tank + 4 Years Heating Element + 2 Years Comprehensive"
    }
  },
  {
    id: 44,
    title: "LG 8 Kg 5 Star AI Direct Drive Front Load Washing Machine",
    name: "LG 8 Kg 5 Star AI Direct Drive Front Load Washing Machine",
    sku: "SE-WSH-LG8KG-AI",
    price: 52990,
    salePrice: 38990,
    discountPrice: 38990,
    discountPercentage: 26,
    description: "AI Direct Drive detects fabric weight and softness, Steam Wash removes 99.9% allergens, TurboWash 59 mins, and 5 Star Energy Rating.",
    category: "Home Appliances",
    subCategory: "Washing Machines",
    brand: "LG",
    rating: 4.8,
    stock: 18,
    warranty: "10 Years on Motor + 2 Years Comprehensive LG Warranty",
    thumbnail: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "AI Direct Drive",
    specifications: {
      "Capacity": "8 Kg (Suitable for families of 3-5 members)",
      "Motor Type": "Inverter AI Direct Drive (1400 RPM Spin Speed)",
      "Wash Technology": "6 Motion Direct Drive + Steam Allergy Care",
      "Energy Rating": "5 Star BEE Rating (Energy and Water efficient)",
      "Connectivity": "Wi-Fi enabled with LG ThinQ App control",
      "Warranty": "10 Years Motor Warranty + 2 Years Comprehensive"
    }
  },
  {
    id: 45,
    title: "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner",
    name: "Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner",
    sku: "SE-VAC-DYSONV12",
    price: 55900,
    salePrice: 47900,
    discountPrice: 47900,
    discountPercentage: 14,
    description: "Laser reveals microscopic dust, piezo sensor continuously sizes and counts dust particles, Hyperdymium motor with 150AW powerful suction.",
    category: "Home Appliances",
    subCategory: "Vacuum Cleaners",
    brand: "Dyson",
    rating: 4.9,
    stock: 15,
    warranty: "2 Years Dyson Brand Warranty with Home Service",
    thumbnail: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Laser Detect 150AW",
    specifications: {
      "Suction Power": "150 Air Watts Dyson Hyperdymium Motor (125,000 RPM)",
      "Runtime": "Up to 60 Minutes Fade-free Run Time",
      "Filtration": "Whole-machine advanced filtration captures 99.99% particles as small as 0.3 microns",
      "Dust Bin Capacity": "0.35 Litres with Hygienic point-and-shoot emptying",
      "Weight": "2.2 Kg Lightweight Ergonomic Handheld",
      "Warranty": "2 Years Official Dyson India Warranty"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 10. KITCHEN APPLIANCES (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 46,
    title: "Philips HL7707/00 750W Food Processor Mixer Grinder",
    name: "Philips HL7707/00 750W Food Processor Mixer Grinder",
    sku: "SE-KIT-PHIL750W-FP",
    price: 11995,
    salePrice: 8995,
    discountPrice: 8995,
    discountPercentage: 25,
    description: "Motorised Power Chop technology with 750W motor, 4 jars including ChefPro bowl for slicing, shredding, kneading, and juicing.",
    category: "Kitchen Appliances",
    subCategory: "Mixer Grinder",
    brand: "Philips",
    rating: 4.7,
    stock: 25,
    warranty: "5 Years Warranty on Motor + 2 Years Comprehensive",
    thumbnail: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: false,
    badge: "ChefPro 750W",
    specifications: {
      "Motor Wattage": "750 Watts Pure Copper Motor",
      "Jars Included": "4 Jars (Wet Jar 1.5L, Multipurpose 1L, Chutney 0.5L, Food Processor 2.2L)",
      "Speeds": "3 Speed Settings with Incher Pulse Function",
      "Blades": "Rust-free Stainless Steel PowerChop Blades",
      "Warranty": "5 Years on Motor + 2 Years Product Warranty"
    }
  },
  {
    id: 47,
    title: "Philips HD9252/90 4.1L Digital Rapid Air Fryer",
    name: "Philips HD9252/90 4.1L Digital Rapid Air Fryer",
    sku: "SE-KIT-PHILAIRFRY-4L",
    price: 11995,
    salePrice: 8495,
    discountPrice: 8495,
    discountPercentage: 29,
    description: "Rapid Air Technology with unique starfish design fries with up to 90% less fat, touch screen with 7 preset cooking programs, and Keep Warm function.",
    category: "Kitchen Appliances",
    subCategory: "Air Fryers",
    brand: "Philips",
    rating: 4.8,
    stock: 35,
    warranty: "2 Years Philips Brand Domestic Warranty",
    thumbnail: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "90% Less Fat",
    specifications: {
      "Capacity": "4.1 Litres (0.8 Kg Fries Capacity)",
      "Power Rating": "1400 Watts Rapid Air Technology",
      "Controls": "Digital Touch Screen with 7 Pre-set Menus",
      "Temperature Range": "60°C – 200°C Adjustable",
      "Dishwasher Safe": "QuickClean non-stick basket and pan",
      "Warranty": "2 Years Worldwide Philips Warranty"
    }
  },
  {
    id: 48,
    title: "De'Longhi Dedica EC685 Manual Espresso Coffee Machine",
    name: "De'Longhi Dedica EC685 Manual Espresso Coffee Machine",
    sku: "SE-KIT-DELONGHI-EC685",
    price: 28990,
    salePrice: 22990,
    discountPrice: 22990,
    discountPercentage: 21,
    description: "Ultra-slim 15cm stainless steel design, professional 15-bar pump pressure, adjustable Cappuccino system frother, and flow stop function.",
    category: "Kitchen Appliances",
    subCategory: "Coffee Machines",
    brand: "De'Longhi",
    rating: 4.8,
    stock: 16,
    warranty: "1 Year De'Longhi Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "15-Bar Barista Pump",
    specifications: {
      "Pump Pressure": "15 Bar Professional Italian Pump",
      "Heating System": "Thermoblock System (Ready in 35 seconds)",
      "Water Tank Capacity": "1.1 Litres Removable Reservoir",
      "Milk Frother": "Adjustable Manual Cappuccino Frothing Wand",
      "Construction": "Full Premium Stainless Steel Metal Body (15cm wide)",
      "Warranty": "1 Year De'Longhi Warranty"
    }
  },
  {
    id: 49,
    title: "Morphy Richards AT-201 2-Slice Pop-up Bread Toaster",
    name: "Morphy Richards AT-201 2-Slice Pop-up Bread Toaster",
    sku: "SE-KIT-MRTOASTER-2S",
    price: 2495,
    salePrice: 1795,
    discountPrice: 1795,
    discountPercentage: 28,
    description: "650W 2-slice pop-up toaster with 7 variable browning settings, cool touch body, anti-skid feet, and removable crumb tray.",
    category: "Kitchen Appliances",
    subCategory: "Pop-up Toasters",
    brand: "Morphy Richards",
    rating: 4.6,
    stock: 40,
    warranty: "2 Years Brand Domestic Warranty",
    thumbnail: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Cool Touch Body",
    specifications: {
      "Power": "650 Watts Fast Heating",
      "Slices": "2 Slice Wide Slots with Auto-Centering",
      "Browning Controls": "7 Adjustable Heat Browning Settings",
      "Features": "Cancel Button, High-Lift Function for Small Breads",
      "Cleaning": "Slide-out Removable Crumb Tray",
      "Warranty": "2 Years Manufacturer Warranty"
    }
  },
  {
    id: 50,
    title: "Panasonic SR-WA18 4.4L Automatic Electric Rice Cooker",
    name: "Panasonic SR-WA18 4.4L Automatic Electric Rice Cooker",
    sku: "SE-KIT-PANARICE-4L",
    price: 3495,
    salePrice: 2695,
    discountPrice: 2695,
    discountPercentage: 23,
    description: "Cooks up to 1 Kg of raw rice, anodized aluminium cooking pan, auto cut-off safety feature, and automatic 5 hours keep-warm function.",
    category: "Kitchen Appliances",
    subCategory: "Rice Cookers",
    brand: "Panasonic",
    rating: 4.7,
    stock: 35,
    warranty: "2 Years on Product + 5 Years on Heater",
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "5-Year Heater Warranty",
    specifications: {
      "Total Volume": "4.4 Litres (Raw Capacity 1.8L / 1 Kg Rice)",
      "Power Rating": "660 Watts Heating Element",
      "Cooking Pan": "High-Grade Anodized Aluminium Cooking Pan",
      "Safety": "Thermal Cut-off and Micro Switch Protection",
      "Keep Warm": "Auto Keep-Warm for up to 5 Hours",
      "Warranty": "5 Years on Heater + 2 Years Comprehensive"
    }
  },

  // ════════════════════════════════════════════════════════════════
  // ── 11. CAMERAS & SECURITY (5 Products) ──
  // ════════════════════════════════════════════════════════════════
  {
    id: 51,
    title: "Sony Alpha 7 IV Full-Frame Mirrorless Camera Body",
    name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera Body",
    sku: "SE-CAM-SONYA7M4",
    price: 242990,
    salePrice: 209990,
    discountPrice: 209990,
    discountPercentage: 14,
    description: "33MP Exmor R CMOS sensor, BIONZ XR engine, 4K 60p 10-bit 4:2:2 recording, 759-point phase detection AF with Real-time Eye AF for Humans/Animals/Birds.",
    category: "Cameras & Security",
    subCategory: "Mirrorless Cameras",
    brand: "Sony",
    rating: 4.9,
    stock: 18,
    warranty: "2 Years Sony India Official Warranty",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
    ],
    featured: true,
    trending: true,
    badge: "33MP Full-Frame",
    specifications: {
      "Sensor": "33.0 Megapixel 35mm Full-Frame Back-Illuminated Exmor R CMOS",
      "Processor": "BIONZ XR Processing Engine (8x more processing power)",
      "Autofocus": "759 Phase-Detection Points (94% Frame Coverage)",
      "Video Recording": "4K 60p in Super 35mm, 4K 30p Full-Frame 10-bit 4:2:2 All-Intra",
      "Image Stabilization": "5-axis In-body Optical Image Stabilization (5.5-step)",
      "Viewfinder": "3.68M-dot OLED Quad-VGA Electronic Viewfinder",
      "Warranty": "2 Years Sony Brand Warranty"
    }
  },
  {
    id: 52,
    title: "Canon EOS 90D 32.5MP Digital SLR Camera with 18-135mm USM Lens",
    name: "Canon EOS 90D 32.5MP Digital SLR Camera with 18-135mm USM Lens",
    sku: "SE-CAM-CANON90D-18135",
    price: 134995,
    salePrice: 119995,
    discountPrice: 119995,
    discountPercentage: 11,
    description: "High-speed 10 fps continuous shooting, 32.5 Megapixel APS-C CMOS sensor, uncropped 4K 30p video, 45-point all cross-type AF, and optical viewfinder.",
    category: "Cameras & Security",
    subCategory: "DSLR Cameras",
    brand: "Canon",
    rating: 4.8,
    stock: 16,
    warranty: "2 Years Official Canon India Warranty",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "Pro DSLR 32.5MP",
    specifications: {
      "Sensor": "32.5 MP APS-C CMOS Sensor with DIGIC 8 Image Processor",
      "Optical Viewfinder": "100% Coverage with 45-point All Cross-type AF System",
      "Continuous Shooting": "Up to 10 fps high speed burst with Intelligent Tracking",
      "Video Resolution": "Uncropped 4K 30p and Full HD 120p High Frame Rate",
      "Autofocus": "Dual Pixel CMOS AF with 5,481 manually selectable AF positions",
      "Lens Kit": "EF-S 18-135mm f/3.5-5.6 IS USM Nano Ultrasonic Zoom Lens",
      "Battery Life": "Up to 1,300 shots per charge (LP-E6N Battery)",
      "Warranty": "2 Years Official Canon Warranty"
    }
  },
  {
    id: 53,
    title: "GoPro HERO12 Black Action Camera with 5.3K HDR Video",
    name: "GoPro HERO12 Black Action Camera with 5.3K HDR Video",
    sku: "SE-CAM-GOPRO12-BLK",
    price: 44990,
    salePrice: 37990,
    discountPrice: 37990,
    discountPercentage: 16,
    description: "Unbelievable 5.3K60 and 4K120 video, Emmy-winning HyperSmooth 6.0 video stabilization, 2x longer runtime with Enduro battery, and waterproof to 33ft.",
    category: "Cameras & Security",
    subCategory: "Action Cameras",
    brand: "GoPro",
    rating: 4.8,
    stock: 25,
    warranty: "1 Year Official GoPro Brand Replacement Warranty",
    thumbnail: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: true,
    badge: "5.3K HyperSmooth 6.0",
    specifications: {
      "Video Resolution": "5.3K at 60 fps, 4K at 120 fps, 2.7K at 240 fps",
      "Photo Resolution": "27 Megapixels with HDR",
      "Stabilization": "HyperSmooth 6.0 with 360° Horizon Lock",
      "Waterproofing": "Waterproof down to 10m (33ft) without housing",
      "Audio": "Bluetooth wireless microphone support for AirPods",
      "Battery": "1720 mAh Enduro Cold-Weather Rechargeable Battery",
      "Warranty": "1 Year GoPro Warranty"
    }
  },
  {
    id: 54,
    title: "TP-Link Tapo C320WS 2K QHD Outdoor Wi-Fi Security CCTV Camera",
    name: "TP-Link Tapo C320WS 2K QHD Outdoor Wi-Fi Security CCTV Camera",
    sku: "SE-SEC-TAPOC320WS",
    price: 4999,
    salePrice: 3499,
    discountPrice: 3499,
    discountPercentage: 30,
    description: "2K QHD (2560x1440) resolution, Full-color Night Vision with F1.6 starlight sensor, Motion Detection with customized sound alarm, and IP66 weatherproof.",
    category: "Cameras & Security",
    subCategory: "CCTV Cameras",
    brand: "TP-Link",
    rating: 4.7,
    stock: 40,
    warranty: "2 Years TP-Link Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "2K Color Night Vision",
    specifications: {
      "Resolution": "2K QHD (2560 x 1440 pixels)",
      "Night Vision": "Full-Color Starlight Sensor with Built-in Spotlights",
      "Weatherproofing": "IP66 Water and Dust Resistance (-20°C to 45°C)",
      "Storage": "Supports MicroSD Card up to 256GB + Tapo Cloud",
      "Smart Detection": "Motion Detection, Person Detection, Line-Crossing, Tampering",
      "Two-Way Audio": "Built-in Microphone and Loudspeaker for 2-way talk",
      "Warranty": "2 Years TP-Link Brand Warranty"
    }
  },
  {
    id: 55,
    title: "Eufy Video Doorbell 2K Dual Camera with HomeBase",
    name: "Eufy Video Doorbell 2K Dual Camera with HomeBase",
    sku: "SE-SEC-EUFYDOORBELL2K",
    price: 19999,
    salePrice: 16999,
    discountPrice: 16999,
    discountPercentage: 15,
    description: "Dual Camera technology (Front Facing 2K + Downward Facing 1080p for packages), Family Recognition AI, zero monthly subscription fees, and 6-month battery.",
    category: "Cameras & Security",
    subCategory: "Video Doorbells",
    brand: "Eufy",
    rating: 4.8,
    stock: 20,
    warranty: "1 Year Anker Eufy India Brand Warranty",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
    ],
    featured: false,
    trending: false,
    badge: "Dual Cam Delivery Guard",
    specifications: {
      "Camera Dual Setup": "Main 2K (2560x1920) + Bottom 1080p Package View",
      "Detection System": "Dual Motion Detection (Radar + PIR)",
      "Package Protection": "Delivery Guard AI notifies when packages arrive",
      "Local Storage": "16GB eMMC Local Storage on HomeBase (No Monthly Fees)",
      "Battery Life": "Up to 6 Months on a single charge",
      "Warranty": "1 Year Eufy Brand Warranty"
    }
  }
];
