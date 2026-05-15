"use client";
import { useEffect, useMemo, useState } from "react";
import { getItems } from "@/lib/api";
import ItemCard from "@/components/ItemCard";

export default function Home() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("newest");
  const [slide, setSlide] = useState(0);

  const heroSlides = items.length > 0 ? items.slice(0, 3) : [];
  const active = heroSlides[slide] || null;
  const heroFallback =
    "https://wmjgrmlcitjcwsdofzea.supabase.co/storage/v1/object/public/collections/telepon-putar-antik.jpg";

  useEffect(() => {
    getItems().then(setItems);
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;

    const t = setInterval(() => {
      setSlide((s) => (s + 1) % heroSlides.length);
    }, 3500);

    return () => clearInterval(t);
  }, [heroSlides.length]);

  const categories = useMemo(
    () => ["Semua", ...new Set(items.map((i) => i.category).filter(Boolean))],
    [items],
  );

  const filtered = items
    .filter((i) => {
      const text = `${i.name || ""} ${i.category || ""} ${i.origin || ""}`;
      const matchSearch = text.toLowerCase().includes(q.toLowerCase());
      const matchCategory = category === "Semua" || i.category === category;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sort === "az") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sort === "za") {
        return (b.name || "").localeCompare(a.name || "");
      }

      if (sort === "views") {
        return (b.views || 0) - (a.views || 0);
      }

      if (sort === "oldest") {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }

      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  return (
    <>
      <section className="hero">
        <div className="container heroInner">
          <div>
            <span className="badge">🏛️ Smart Museum Bengkulu</span>
            <h1>Jelajahi Warisan Budaya Bengkulu Secara Digital</h1>
            <p>
              Temukan warisan sejarah dan budaya Bengkulu dalam pengalaman
              digital yang interaktif, mulai dari scan QR Code, membaca detail
              koleksi, menyimpan favorit, hingga mengikuti kuis dan game
              edukatif.
            </p>
            <div className="actions">
              <a className="btn primary" href="/scan">
                📷 Mulai Scan QR
              </a>
              <a className="btn ghost" href="#koleksi">
                Lihat Koleksi
              </a>
              <a className="btn ghost" href="/game">
                Main Game
              </a>
            </div>
            <div className="heroStats">
              <div className="heroStat">
                <b>{items.length || 12}</b>
                <br />
                Koleksi Digital
              </div>
              <div className="heroStat">
                <b>QR</b>
                <br />
                Scan Interaktif
              </div>
              <div className="heroStat">
                <b>Quiz</b>
                <br />
                Edukasi Museum
              </div>
            </div>
          </div>

          <div className="heroPreview">
            <div className="previewImage">
              <img
                src={active?.image_url || heroFallback}
                alt={active?.name || "Museum Bengkulu"}
              />
            </div>
            <div className="previewShade" />
            {heroSlides.length > 1 && (
              <div className="previewArrows">
                <button
                  onClick={() =>
                    setSlide(
                      (slide - 1 + heroSlides.length) % heroSlides.length,
                    )
                  }
                >
                  ‹
                </button>

                <button
                  onClick={() => setSlide((slide + 1) % heroSlides.length)}
                >
                  ›
                </button>
              </div>
            )}
            <div className="previewCard">
              <h2>{active?.name || "Galeri Museum Bengkulu"}</h2>
              <p>
                {active?.short_description ||
                  "Koleksi budaya Bengkulu ditampilkan dalam pengalaman digital yang interaktif, ringan, dan mudah digunakan."}
              </p>
            </div>
            {heroSlides.length > 1 && (
              <div className="previewDots">
                {heroSlides.map((_, index) => (
                  <span
                    key={index}
                    className={slide === index ? "active" : ""}
                    onClick={() => setSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="collectionSearch" id="koleksi">
        <div className="container">
          <div className="sectionTitle">
            <span className="badge">🔎 Eksplorasi Koleksi</span>
            <h1>Koleksi Budaya Bengkulu</h1>
            <p>Cari koleksi berdasarkan nama, kategori, atau asal.</p>
          </div>
          <div className="searchBoxModern">
            <span>🔍</span>
            <input
              placeholder="Cari koleksi budaya, contoh: keris, gong, televisi..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button>Cari</button>
          </div>
          <div className="filterBar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={category === cat ? "filterActive" : ""}
                onClick={() => setCategory(cat)}
              >
                🏛️ {cat}{" "}
                <b>
                  {cat === "Semua"
                    ? items.length
                    : items.filter((i) => i.category === cat).length}
                </b>
              </button>
            ))}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="views">Paling Dilihat</option>
              <option value="az">Nama A-Z</option>
              <option value="za">Nama Z-A</option>
            </select>
            <button
              onClick={() => {
                setQ("");
                setCategory("Semua");
                setSort("newest");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <main className="section container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 26,
            flexWrap: "wrap",
          }}
        >
          <p style={{ color: "#64748b", margin: 0 }}>
            Menampilkan <b style={{ color: "#059669" }}>{filtered.length}</b>{" "}
            dari {items.length} koleksi.
          </p>
          <a href="/game" className="btn blue">
            🎮 Main Game Edukasi
          </a>
        </div>
        <div className="grid">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>
    </>
  );
}
