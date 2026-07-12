import type { Difficulty, ProgrammingLanguage, TextLanguage } from "../types/typing.types";

/**
 * Daftar kata contoh. Pada implementasi produksi, sumber data ini
 * sebaiknya dipindah ke database (tabel `TextSource`) agar admin
 * dapat mengelola konten lewat Admin Panel tanpa redeploy.
 */
const WORDS_ENGLISH_EASY = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so",
];

const WORDS_ENGLISH_MEDIUM = [
  "quality", "approach", "consider", "particular", "another", "example",
  "important", "however", "situation", "available", "although", "position",
  "environment", "relationship", "development", "government", "community",
  "difficult", "experience", "individual", "significant", "understand",
];

const WORDS_ENGLISH_HARD = [
  "juxtaposition", "ephemeral", "ubiquitous", "paradigm", "quintessential",
  "meticulous", "ambiguous", "unprecedented", "phenomenon", "reciprocal",
  "substantiate", "circumvent", "extrapolate", "idiosyncrasy", "conundrum",
];

const WORDS_ENGLISH_EXPERT = [
  "antidisestablishmentarianism", "incomprehensibility", "counterproductive",
  "disproportionately", "unconstitutionally", "overcapitalization",
  "electroencephalograph", "misappropriation", "interdisciplinary",
];

const WORDS_INDONESIA_EASY = [
  "yang", "dan", "di", "itu", "dengan", "untuk", "tidak", "ini", "dari", "dalam",
  "akan", "pada", "juga", "saya", "ke", "karena", "ada", "bisa", "oleh", "kita",
  "sudah", "atau", "saat", "harus", "banyak", "lebih", "kami", "dia", "hanya",
];

const WORDS_INDONESIA_MEDIUM = [
  "pemerintah", "masyarakat", "pendidikan", "kesehatan", "lingkungan",
  "perusahaan", "teknologi", "pembangunan", "kebijakan", "kesempatan",
  "perekonomian", "kesejahteraan", "keberlanjutan", "produktivitas",
];

const WORDS_INDONESIA_HARD = [
  "pertanggungjawaban", "keberagaman", "ketidakpastian", "kesinambungan",
  "interdisipliner", "restrukturisasi", "diversifikasi", "transformasi",
  "implementasi", "infrastruktur", "konsolidasi", "standardisasi",
];

const WORDS_INDONESIA_EXPERT = [
  "dekonstruksionisme", "ketidakberpihakan", "pertanggungjawabannya",
  "menyeimbangkangan", "internasionalisasi", "kesalahpahaman",
];

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "Life is what happens when you are busy making other plans.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
];

const CODE_SNIPPETS: Record<ProgrammingLanguage, string[]> = {
  javascript: [
    "const sum = (a, b) => a + b;",
    "function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }",
    "const users = await fetch('/api/users').then(res => res.json());",
  ],
  typescript: [
    "interface User { id: string; name: string; email: string; }",
    "function identity<T>(value: T): T { return value; }",
    "const parseResult = schema.safeParse(input);",
  ],
  python: [
    "def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)",
    "with open('file.txt') as f: data = f.read()",
    "class Animal: def __init__(self, name): self.name = name",
  ],
  java: [
    "public static void main(String[] args) { System.out.println('Hello'); }",
    "List<Integer> numbers = new ArrayList<>();",
  ],
  sql: [
    "SELECT id, name FROM users WHERE active = true ORDER BY created_at DESC;",
    "CREATE INDEX idx_users_email ON users(email);",
  ],
  html: [
    "<div class='container'><h1>Hello World</h1></div>",
  ],
  css: [
    ".card { border-radius: 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }",
  ],
};

function pickWordPool(language: TextLanguage, difficulty: Difficulty): string[] {
  const isIndonesian = language === "indonesia";
  const pools = isIndonesian
    ? {
        easy: WORDS_INDONESIA_EASY,
        medium: WORDS_INDONESIA_MEDIUM,
        hard: WORDS_INDONESIA_HARD,
        expert: WORDS_INDONESIA_EXPERT,
        custom: WORDS_INDONESIA_MEDIUM,
      }
    : {
        easy: WORDS_ENGLISH_EASY,
        medium: WORDS_ENGLISH_MEDIUM,
        hard: WORDS_ENGLISH_HARD,
        expert: WORDS_ENGLISH_EXPERT,
        custom: WORDS_ENGLISH_MEDIUM,
      };
  return pools[difficulty] ?? pools.medium;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

/**
 * Kapitalisasi huruf pertama kata.
 */
function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Menambahkan kombinasi huruf besar pada kata-kata secara acak.
 * Probabilitas kapitalisasi berbeda per difficulty:
 * - easy:   ~10% kata di-capitalize
 * - medium: ~20% kata di-capitalize
 * - hard:   ~35% kata di-capitalize (+ beberapa huruf besar acak di tengah)
 * - expert: ~50% kata di-capitalize (+ lebih banyak huruf besar acak di tengah)
 */
function applyUppercaseMix(words: string[], difficulty: Difficulty): string[] {
  const capitalizeRate =
    difficulty === "easy" ? 0.1 :
    difficulty === "medium" ? 0.2 :
    difficulty === "hard" ? 0.35 :
    0.5; // expert

  const midUpperRate =
    difficulty === "hard" ? 0.15 :
    difficulty === "expert" ? 0.25 :
    0;

  return words.map((word) => {
    let result = word;

    // Kapitalisasi huruf pertama
    if (Math.random() < capitalizeRate) {
      result = capitalize(result);
    }

    // Untuk hard & expert: acak huruf kapital di tengah kata
    if (midUpperRate > 0 && result.length > 2) {
      result = result
        .split("")
        .map((ch, i) => (i > 0 && /[a-z]/.test(ch) && Math.random() < midUpperRate ? ch.toUpperCase() : ch))
        .join("");
    }

    return result;
  });
}

/**
 * Menghasilkan teks untuk sesi tes berdasarkan konfigurasi.
 * `wordCount` dilebihkan supaya cukup untuk durasi test terpanjang (300s).
 */
export function generateTestText(
  language: TextLanguage,
  difficulty: Difficulty,
  programmingLanguage?: ProgrammingLanguage,
  customText?: string,
  wordCount = 200
): string {
  if (language === "custom" && customText) {
    return customText.trim();
  }

  if (language === "quotes") {
    return shuffle(QUOTES).join(" ");
  }

  if (language === "programming") {
    const lang = programmingLanguage ?? "javascript";
    return shuffle(CODE_SNIPPETS[lang]).join("\n");
  }

  const pool = pickWordPool(language, difficulty);
  const words: string[] = [];
  while (words.length < wordCount) {
    words.push(...shuffle(pool));
  }
  const sliced = words.slice(0, wordCount);
  const mixed = applyUppercaseMix(sliced, difficulty);
  return mixed.join(" ");
}
