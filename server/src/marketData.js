// Sumber data marketplace gratis & publik (tanpa API key):
// - Tokopedia public GraphQL untuk produk nyata (nama, harga, rating, toko, URL)
// - Halaman produk Tokopedia untuk jumlah terjual / view nyata
// - Google Trends RSS Indonesia untuk sinyal tren pencarian
// Catatan: komisi affiliate TIDAK tersedia tanpa kredensial affiliate resmi.

const TOKO_GQL = 'https://gql.tokopedia.com/graphql/SearchProductV5Query';
const TRENDS_RSS = 'https://trends.google.com/trending/rss?geo=ID';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const KEYWORDS = ['serum vitamin c', 'niacinamide serum', 'sunscreen wajah', 'retinol serum'];
const BEAUTY_RE = /(serum|skincare|kecantikan|perawatan kulit|sunscreen|niacinamide|retinol|glowing|jerawat|acne|moisturizer|sodium ascorbate)/i;

const SEARCH_QUERY = `query SearchProductV5Query($params: String!) {
  searchProductV5(params: $params) {
    header { totalData responseCode keywordProcess }
    data { products {
      name url rating
      price { number text discountPercentage }
      shop { name tier city }
    } }
  }
}`;

let cached = null;
let cachedAt = 0;
let inFlight = null;
const TTL_MS = 30 * 60 * 1000;

async function getText(url, headers, timeout = 30000, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} dari ${new URL(url).hostname}`);
  return res.text();
}

function searchParams(keyword) {
  return new URLSearchParams({
    device: 'desktop',
    enter_method: 'normal_search',
    l_name: 'sre',
    navsource: '',
    ob: '8', // 8 = produk terlaris
    page: '1',
    q: keyword,
    pmin: '',
    pmax: '',
    related: 'true',
    rows: '8',
    safe_search: 'false',
    scheme: 'https',
    show_adult: 'false',
    source: 'search',
    srp_component_id: '02.01.00.00',
    st: 'product',
    start: '0',
    topads_bucket: 'true',
    unique_id: Math.random().toString(36).slice(2),
    variants: '',
  }).toString();
}

async function searchProducts(keyword) {
  const body = JSON.stringify({
    operationName: 'SearchProductV5Query',
    query: SEARCH_QUERY,
    variables: { params: searchParams(keyword) },
  });
  const text = await getText(TOKO_GQL, {
    'User-Agent': UA,
    Accept: '*/*',
    'Accept-Language': 'id-ID,id;q=0.9,en;q=0.7',
    'Content-Type': 'application/json',
    Origin: 'https://www.tokopedia.com',
    Referer: 'https://www.tokopedia.com/',
    'X-Source': 'tokopedia-lite',
    'X-Version': '1.0',
  }, 30000, { method: 'POST', body });
  if (!text.trim()) throw new Error('Respons Tokopedia kosong (body 0 byte)');
  const json = JSON.parse(text);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  const result = json.data?.searchProductV5;
  if (!result) throw new Error('Respons Tokopedia tidak berisi data produk');
  return (result.data?.products || []).map((p) => ({
    name: String(p.name || '').replace(/\s+/g, ' ').trim(),
    url: p.url || '',
    price: Number(p.price?.number || 0),
    priceText: p.price?.text || '',
    discount: Number(p.price?.discountPercentage || 0),
    rating: p.rating ? Number(p.rating) : null,
    shop: p.shop?.name || '',
    shopTier: p.shop?.tier || null,
    city: p.shop?.city || '',
    keyword,
  }));
}

function parseApolloCache(html) {
  const start = html.indexOf('window.__cache');
  if (start < 0) return null;
  const open = html.indexOf('{', start);
  if (open < 0) return null;
  let brace = 0;
  let end = -1;
  for (let i = open; i < html.length; i++) {
    const ch = html[i];
    if (ch === '{') brace++;
    else if (ch === '}') {
      brace--;
      if (brace === 0) { end = i; break; }
    } else if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      while (i < html.length && html[i] !== quote) {
        if (html[i] === '\\') i++;
        i++;
      }
    }
  }
  if (end < 0) return null;
  try { return JSON.parse(html.slice(open, end + 1)); } catch { return null; }
}

async function enrichProduct(product) {
  try {
    const url = String(product.url || '').split('?')[0];
    if (!url) return product;
    const html = await getText(url, {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.7',
    });
    const cacheObj = parseApolloCache(html);
    const key = cacheObj && Object.keys(cacheObj).find((k) => /^pdpBasicInfo\d+$/.test(k));
    if (!key) return product;
    const stats = cacheObj[`$${key}.stats`] || {};
    const tx = cacheObj[`$${key}.txStats`] || {};
    const sold = Number(tx.countSold || 0);
    return {
      ...product,
      sold,
      soldText: tx.itemSoldFmt || (sold ? `${sold} terjual` : ''),
      views: Number(stats.countView || 0),
      reviews: Number(stats.countReview || 0),
      detailUrl: url,
    };
  } catch {
    return { ...product, sold: null, soldText: '', views: null, reviews: null };
  }
}

function tag(title) {
  return String(title || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
}

async function fetchTrends() {
  try {
    const xml = await getText(TRENDS_RSS, { 'User-Agent': UA }, 20000);
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    const trends = items.map((item) => {
      const title = tag((item.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
      const traffic = tag((item.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/) || [])[1]);
      const published = tag((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]);
      return { title, traffic, published, beautyRelated: BEAUTY_RE.test(title) };
    }).filter((t) => t.title);
    return trends.sort((a, b) => Number(b.beautyRelated) - Number(a.beautyRelated)).slice(0, 8);
  } catch {
    return [];
  }
}

async function buildSnapshot() {
  const errors = [];
  const found = new Map();
  for (const keyword of KEYWORDS) {
    try {
      const items = await searchProducts(keyword);
      items.forEach((p) => { if (p.name && p.url && !found.has(p.url.split('?')[0])) found.set(p.url.split('?')[0], p); });
    } catch (err) {
      errors.push(`${keyword}: ${err.message}`);
    }
  }

  const ranked = [...found.values()]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.price - a.price)
    .slice(0, 8);
  const products = [];
  for (let i = 0; i < ranked.length; i += 4) {
    const batch = ranked.slice(i, i + 4);
    products.push(...await Promise.all(batch.map(enrichProduct)));
  }
  products.sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0));
  const trends = await fetchTrends();

  return {
    available: products.length > 0,
    fetchedAt: new Date().toISOString(),
    source: {
      products: 'Tokopedia public web data (tanpa login/API key)',
      trends: 'Google Trends RSS Indonesia (tanpa API key)',
      commission: 'Tidak tersedia — memerlukan kredensial affiliate resmi (Shopee/TikTok/network)',
    },
    products,
    trends,
    commission: {
      available: false,
      note: 'Komisi affiliate belum tersedia. Angka komisi tidak diarang; perlu API affiliate atau file export milikmu.',
    },
    errors,
  };
}

export async function getMarketSnapshot({ force = false } = {}) {
  const fresh = cached && Date.now() - cachedAt < TTL_MS;
  if (fresh && !force) return cached;
  if (inFlight) return inFlight;
  inFlight = buildSnapshot()
    .then((snapshot) => {
      cached = snapshot;
      cachedAt = Date.now();
      return snapshot;
    })
    .finally(() => { inFlight = null; });
  return inFlight;
}

export function marketBrief(snapshot) {
  if (!snapshot?.available) return 'DATA PASAR REAL-TIME BELUM TERSEDIA. Jangan mengarang produk, harga, komisi, atau angka penjualan. Nyatakan dengan jujur bahwa data belum tersedia.';
  const products = snapshot.products.slice(0, 8).map((p, i) => [
    `${i + 1}. ${p.name}`,
    `   Harga: ${p.priceText || p.price} | Rating: ${p.rating ?? 'n/a'} | Terjual: ${p.soldText || 'tidak diketahui'} | Ulasan: ${p.reviews ?? 0}`,
    `   Toko: ${p.shop} (${p.city}) | ${p.url}`,
  ].join('\n')).join('\n');
  const trends = snapshot.trends.map((t) => `- ${t.title} (trafik ${t.traffic || 'n/a'}${t.beautyRelated ? ', terkait kecantikan' : ', tren umum'})`).join('\n');
  return `DATA PASAR NYATA (sumber: ${snapshot.source.products}; diambil ${snapshot.fetchedAt}):
${products}

TREN PENCARIAN INDONESIA (${snapshot.source.trends}):
${trends || '- tidak tersedia'}

KOMISI AFFILIATE: ${snapshot.commission.note}
ATURAN WAJIB:
- Pilih produk/topik utama HANYA dari daftar produk nyata di atas.
- Cantumkan nama produk persis, URL sumber, harga, rating, dan jumlah terjual apa adanya.
- DILARANG mengarang/mengestimasi angka komisi atau penjualan. Jika komisi tidak diketahui, tulis "komisi belum tersedia (perlu API affiliate)".
- Sebutkan sumber data dan waktu pengambilan di Ringkasan.`;
}

export function __resetMarketCache() {
  cached = null;
  cachedAt = 0;
}
