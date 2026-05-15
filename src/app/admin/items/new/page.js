"use client";

import { useEffect, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewItemPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
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
    async function checkAdmin() {
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

      setChecking(false);
    }

    checkAdmin();
  }, [router]);

  function createSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "name") {
      setForm({
        ...form,
        name: value,
        slug: createSlug(value),
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.slug || !form.description) {
      setMsg("Nama, slug, dan deskripsi wajib diisi.");
      return;
    }

    setSaving(true);
    setMsg("Menyimpan koleksi...");

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      image_url: form.image_url || "/images/sample-collection.png",
      category: form.category || "Umum",
      period: form.period || "-",
      year: form.year || "-",
      origin: form.origin || "Bengkulu",
      material: form.material || "-",
      condition: form.condition || "Baik",
      views: 0,
    };

    const { error } = await supabase.from("items").insert(payload);

    if (error) {
      setMsg("Gagal menyimpan: " + error.message);
      setSaving(false);
      return;
    }

    setMsg("Koleksi berhasil ditambahkan.");
    router.push("/admin");
  }

  if (checking) {
    return (
      <main className="container section">
        <div className="panel">Mengecek akses admin...</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="panel" style={{ maxWidth: 900, margin: "auto" }}>
        <span className="badge">Tambah Koleksi</span>

        <h1>Tambah Koleksi Museum</h1>

        <p style={{ color: "#64748b", lineHeight: 1.7 }}>
          Isi data koleksi museum dengan lengkap. Slug akan dibuat otomatis dari
          nama koleksi.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Nama Koleksi *</label>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Contoh: Teko Antik Bengkulu"
          />

          <br />
          <br />

          <label>Slug URL *</label>
          <input
            className="input"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="contoh: teko-antik-bengkulu"
          />

          <br />
          <br />

          <label>Deskripsi *</label>
          <textarea
            className="input"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={7}
            placeholder="Tulis deskripsi sejarah, fungsi, asal-usul, dan nilai budaya koleksi..."
          />

          <br />
          <br />

          <label>URL Gambar</label>
          <input
            className="input"
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="/images/collections/nama-gambar.jpg"
          />
          
          <div
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
            }}
          >
            <div>
              <label>Kategori</label>
              <input
                className="input"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Contoh: Seni Kriya"
              />
            </div>

            <div>
              <label>Periode</label>
              <input
                className="input"
                name="period"
                value={form.period}
                onChange={handleChange}
                placeholder="Contoh: Abad ke-19"
              />
            </div>

            <div>
              <label>Tahun</label>
              <input
                className="input"
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="Contoh: 1920-1960"
              />
            </div>

            <div>
              <label>Asal</label>
              <input
                className="input"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                placeholder="Contoh: Bengkulu"
              />
            </div>

            <div>
              <label>Material</label>
              <input
                className="input"
                name="material"
                value={form.material}
                onChange={handleChange}
                placeholder="Contoh: Logam, kayu, kain"
              />
            </div>

            <div>
              <label>Kondisi</label>
              <input
                className="input"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                placeholder="Contoh: Baik"
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Koleksi"}
            </button>

            <button
              className="btn"
              type="button"
              onClick={() => router.push("/admin")}
            >
              Kembali
            </button>
          </div>
        </form>

        {msg && <p style={{ marginTop: 18 }}>{msg}</p>}
      </div>
    </main>
  );
}