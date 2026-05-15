"use client";

import { useEffect, useState } from "react";
import ItemCard from "@/components/ItemCard";
import { getUserBookmarks, removeBookmark } from "@/lib/api";
import { useRouter } from "next/navigation";
import { supabase, hasSupabase } from "@/lib/supabase";
import Link from "next/link";

export default function BookmarksPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function loadBookmarks() {
    if (!hasSupabase) {
      setMsg("Supabase belum tersambung.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?redirect=/bookmarks");
      return;
    }

    const data = await getUserBookmarks();
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function handleRemove(slug) {
    const yakin = confirm("Hapus koleksi ini dari bookmark?");
    if (!yakin) return;

    const result = await removeBookmark(slug);

    if (result.error) {
      alert(result.error);
      return;
    }

    setItems(items.filter((item) => item.slug !== slug));
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="panel">Memuat bookmark...</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="sectionTitle">
        <span className="badge">⭐ Bookmark</span>
        <h1>Koleksi Favorit Saya</h1>
        <p>
          Koleksi yang kamu simpan akan tampil di sini dan tersimpan ke akun
          Supabase.
        </p>
      </div>

      {msg && (
        <div className="panel" style={{ textAlign: "center" }}>
          <p>{msg}</p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="panel" style={{ textAlign: "center" }}>
          <h2>Belum ada bookmark</h2>
          <p style={{ color: "#64748b" }}>
            Buka halaman detail koleksi, lalu klik tombol Bookmark.
          </p>

          <Link className="btn primary" href="/#koleksi">
            Jelajahi Koleksi
          </Link>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id}>
              <ItemCard item={item} />

              <button
                className="btn"
                onClick={() => handleRemove(item.slug)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderColor: "#fecaca",
                }}
              >
                Hapus Bookmark
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}