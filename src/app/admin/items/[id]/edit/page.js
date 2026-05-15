"use client";

import { useEffect, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditItemPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    category: "",
    period: "",
    year: "",
    origin: "",
    material: "",
    condition: "",
  });

  useEffect(() => {
    async function checkAdminAndLoad() {
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMsg("Data koleksi tidak ditemukan.");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || "",
        slug: data.slug || "",
        description: data.description || "",
        image_url: data.image_url || "",
        category: data.category || "",
        period: data.period || "",
        year: data.year || "",
        origin: data.origin || "",
        material: data.material || "",
        condition: data.condition || "",
      });

      setLoading(false);
    }

    checkAdminAndLoad();
  }, [id, router]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setMsg("Menyimpan perubahan...");

    const { error } = await supabase
      .from("items")
      .update(form)
      .eq("id", id);

    if (error) {
      setMsg("Gagal update: " + error.message);
      return;
    }

    setMsg("Koleksi berhasil diperbarui.");
    router.push("/admin");
  }

  async function handleDelete() {
    const yakin = confirm("Yakin ingin menghapus koleksi ini?");

    if (!yakin) return;

    const { error } = await supabase.from("items").delete().eq("id", id);

    if (error) {
      setMsg("Gagal hapus: " + error.message);
      return;
    }

    router.push("/admin");
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="panel">Memuat data koleksi...</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="panel" style={{ maxWidth: 850, margin: "auto" }}>
        <span className="badge">Edit Koleksi</span>

        <h1>Edit Data Museum</h1>

        <p style={{ color: "#64748b" }}>
          Ubah informasi koleksi museum yang sudah tersimpan di database.
        </p>

        <form onSubmit={handleUpdate}>
          <label>Nama Koleksi</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Contoh: Teko Antik"
          />

          <br />
          <br />

          <label>Slug URL</label>
          <input
            className="input"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="contoh: teko-antik"
          />

          <br />
          <br />

          <label>Deskripsi</label>
          <textarea
            className="input"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Masukkan deskripsi koleksi..."
          />

          <br />
          <br />

          <label>URL Gambar</label>
          <input
            className="input"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://...supabase.co/storage/v1/object/public/collections/nama-gambar.jpg"
          />

          <br />
          <br />

          <label>Kategori</label>
          <input
            className="input"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Contoh: Teknologi & Komunikasi"
          />

          <br />
          <br />

          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <div>
              <label>Periode</label>
              <input
                className="input"
                name="period"
                value={form.period}
                onChange={handleChange}
                placeholder="Contoh: Pertengahan Abad ke-20"
              />
            </div>

            <div>
              <label>Tahun</label>
              <input
                className="input"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Contoh: Tidak diketahui"
              />
            </div>

            <div>
              <label>Asal</label>
              <input
                className="input"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="Contoh: Koleksi Bengkulu, Indonesia"
              />
            </div>

            <div>
              <label>Material</label>
              <input
                className="input"
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="Contoh: Bakelit, logam, dan kabel"
              />
            </div>

            <div>
              <label>Kondisi</label>
              <input
                className="input"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                placeholder="Contoh: Cukup Baik - terdapat bekas pemakaian"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn primary" type="submit">
              Simpan Perubahan
            </button>

            <button
              className="btn"
              type="button"
              onClick={() => router.push("/admin")}
            >
              Kembali
            </button>

            <button
              className="btn"
              type="button"
              onClick={handleDelete}
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                borderColor: "#fecaca",
              }}
            >
              Hapus
            </button>
          </div>
        </form>

        {msg && <p style={{ marginTop: 18 }}>{msg}</p>}
      </div>
    </main>
  );
}