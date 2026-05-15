"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getItems } from "@/lib/api";
import { supabase, hasSupabase } from "@/lib/supabase";

export default function Admin() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    async function checkAccess() {
      if (!hasSupabase) {
        router.push("/login");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setAdminEmail(user.email);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        router.push("/");
        return;
      }

      const data = await getItems();
      setItems(data || []);
      setLoading(false);
    }

    checkAccess();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function deleteItem(id, name, slug) {
    const yakin = confirm(
      `Yakin ingin menghapus koleksi "${name}"?\n\nData quiz, bookmark, dan aktivitas yang berhubungan juga akan dihapus.`,
    );

    if (!yakin) return;

    await supabase.from("quiz").delete().eq("item_slug", slug);
    await supabase.from("bookmarks").delete().eq("item_slug", slug);
    await supabase.from("user_activity").delete().eq("item_slug", slug);

    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
      alert("Gagal menghapus koleksi: " + error.message);
      return;
    }

    setItems(items.filter((item) => item.id !== id));
    alert("Koleksi dan data terkait berhasil dihapus.");
  }

  const totalViews = items.reduce((total, item) => {
    return total + (item.views || 0);
  }, 0);

  const totalCategory = new Set(
    items.map((item) => item.category).filter(Boolean),
  ).size;

  if (loading) {
    return (
      <main className="container section">
        <div className="panel">Mengecek akses admin...</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="adminLayout">
        <aside className="sidebar">
          <h2>Admin Panel</h2>

          <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>
            Login sebagai:
            <br />
            <b>{adminEmail}</b>
          </p>

          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/items/new">Tambah Koleksi</Link>
          <Link href="/admin/quiz">Kelola Quiz</Link>
          <Link href="/scan">Tes Scanner</Link>
          <Link href="/">Lihat Website</Link>

          <button
            className="btn"
            onClick={logout}
            style={{ marginTop: 14, width: "100%" }}
          >
            Logout
          </button>
        </aside>

        <section>
          <span className="badge">Dashboard Admin</span>

          <div
            className="actions"
            style={{
              justifyContent: "space-between",
              marginTop: 14,
              marginBottom: 24,
            }}
          >
            <div>
              <h1 style={{ marginBottom: 6 }}>Kelola Koleksi Museum</h1>
              <p style={{ color: "#64748b", margin: 0 }}>
                Tambah, edit, dan pantau data koleksi museum Bengkulu.
              </p>
            </div>

            <Link className="btn primary" href="/admin/items/new">
              + Tambah Koleksi
            </Link>
          </div>

          <div className="grid">
            <div className="panel">
              <h2>{items.length}</h2>
              <p>Total Koleksi</p>
            </div>

            <div className="panel">
              <h2>{totalCategory}</h2>
              <p>Total Kategori</p>
            </div>

            <div className="panel">
              <h2>{totalViews}</h2>
              <p>Total Dilihat</p>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 24 }}>
            <div
              className="actions"
              style={{ justifyContent: "space-between", marginBottom: 18 }}
            >
              <h2 style={{ margin: 0 }}>Data Koleksi</h2>

              <Link className="btn primary" href="/admin/items/new">
                + Tambah
              </Link>
            </div>

            {items.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "#64748b",
                  background: "#f8fafc",
                  borderRadius: 18,
                }}
              >
                Belum ada koleksi. Klik tombol tambah untuk memasukkan data.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Kategori</th>
                      <th>Asal</th>
                      <th>Dilihat</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <b>{i.name}</b>
                          <br />
                          <span style={{ color: "#64748b", fontSize: 13 }}>
                            /collections/{i.slug}
                          </span>
                        </td>

                        <td>{i.category || "-"}</td>

                        <td>{i.origin || "-"}</td>

                        <td>👁️ {i.views || 0}</td>

                        <td>
                          <div className="actions" style={{ marginTop: 0 }}>
                            <Link
                              className="btn"
                              href={`/collections/${i.slug}`}
                            >
                              Lihat
                            </Link>

                            <Link
                              className="btn blue"
                              href={`/admin/items/${i.id}/edit`}
                            >
                              Edit
                            </Link>

                            <Link
                              className="btn primary"
                              href={`/admin/items/${i.id}/qr`}
                            >
                              QR
                            </Link>

                            <button
                              className="btn"
                              onClick={() => deleteItem(i.id, i.name, i.slug)}
                              style={{
                                background: "#fee2e2",
                                color: "#991b1b",
                                borderColor: "#fecaca",
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
