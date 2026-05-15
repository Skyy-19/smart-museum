"use client";

import { useEffect, useState } from "react";
import { getUserActivity, getItems } from "@/lib/api";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ActivityPage() {
  const router = useRouter();

  const [activities, setActivities] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!hasSupabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user) {
        router.push("/login?redirect=/activity");
        return;
      }

      const activityData = await getUserActivity();
      const itemData = await getItems();

      setActivities(activityData || []);
      setItems(itemData || []);
      setLoading(false);
    }

    load();
  }, [router]);

  function getItemName(slug) {
    const item = items.find((i) => i.slug === slug);
    return item?.name || slug || "-";
  }

  function getActivityLabel(type) {
    if (type === "view") return "Melihat koleksi";
    if (type === "scan") return "Scan QR";
    if (type === "quiz") return "Mengerjakan quiz";
    if (type === "game") return "Main game";
    return "Aktivitas";
  }

  function getActivityIcon(type) {
    if (type === "view") return "👁️";
    if (type === "scan") return "📷";
    if (type === "quiz") return "🧠";
    if (type === "game") return "🎮";
    return "📌";
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="panel">Memuat aktivitas...</div>
      </main>
    );
  }

  const totalView = activities.filter((a) => a.activity_type === "view").length;
  const totalQuiz = activities.filter((a) => a.activity_type === "quiz").length;
  const totalGame = activities.filter((a) => a.activity_type === "game").length;

  return (
    <main className="container section">
      <div className="sectionTitle">
        <span className="badge">📊 Aktivitas Saya</span>
        <h1>Riwayat Eksplorasi Museum</h1>
        <p>
          Semua aktivitas kamu saat melihat koleksi, scan QR, mengerjakan quiz,
          dan memainkan game akan tampil di sini.
        </p>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>{activities.length}</h2>
          <p>Total Aktivitas</p>
        </div>

        <div className="panel">
          <h2>{totalView}</h2>
          <p>Koleksi Dilihat</p>
        </div>

        <div className="panel">
          <h2>{totalQuiz}</h2>
          <p>Quiz Dikerjakan</p>
        </div>

        <div className="panel">
          <h2>{totalGame}</h2>
          <p>Game Dimainkan</p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 28 }}>
        <h2>Riwayat Terbaru</h2>

        {activities.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <h3>Belum ada aktivitas</h3>
            <p style={{ color: "#64748b" }}>
              Coba buka detail koleksi, scan QR, main game, atau kerjakan quiz.
            </p>

            <Link className="btn primary" href="/#koleksi">
              Mulai Eksplorasi
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Aktivitas</th>
                  <th>Koleksi</th>
                  <th>Skor</th>
                  <th>Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {getActivityIcon(a.activity_type)}{" "}
                      {getActivityLabel(a.activity_type)}
                    </td>

                    <td>
                      <b>{getItemName(a.item_slug)}</b>
                      <br />
                      <span style={{ color: "#64748b", fontSize: 13 }}>
                        {a.item_slug}
                      </span>
                    </td>

                    <td>{a.score || 0}</td>

                    <td>{new Date(a.created_at).toLocaleString("id-ID")}</td>

                    <td>
                      <Link
                        className="btn"
                        href={`/collections/${a.item_slug}`}
                      >
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
