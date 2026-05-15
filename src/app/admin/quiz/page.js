"use client";

import { useEffect, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { getItems } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminQuizPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [items, setItems] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    item_slug: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
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

      const itemData = await getItems();
      setItems(itemData || []);

      const { data: quizData } = await supabase
        .from("quiz")
        .select("*")
        .order("created_at", { ascending: false });

      setQuiz(quizData || []);
      setChecking(false);
    }

    checkAdmin();
  }, [router]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function getItemName(slug) {
    const item = items.find((i) => i.slug === slug);
    return item?.name || slug;
  }

  async function loadQuiz() {
    const { data } = await supabase
      .from("quiz")
      .select("*")
      .order("created_at", { ascending: false });

    setQuiz(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !form.item_slug ||
      !form.question ||
      !form.option_a ||
      !form.option_b ||
      !form.option_c ||
      !form.option_d ||
      !form.correct_answer
    ) {
      setMsg("Semua field quiz wajib diisi.");
      return;
    }

    setSaving(true);
    setMsg("Menyimpan quiz...");

    const { error } = await supabase.from("quiz").insert({
      item_slug: form.item_slug,
      question: form.question,
      option_a: form.option_a,
      option_b: form.option_b,
      option_c: form.option_c,
      option_d: form.option_d,
      correct_answer: form.correct_answer,
    });

    if (error) {
      setMsg("Gagal menyimpan quiz: " + error.message);
      setSaving(false);
      return;
    }

    setForm({
      item_slug: "",
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "A",
    });

    setMsg("Quiz berhasil ditambahkan.");
    setSaving(false);
    loadQuiz();
  }

  async function handleDelete(id) {
    const yakin = confirm("Yakin ingin menghapus quiz ini?");
    if (!yakin) return;

    const { error } = await supabase.from("quiz").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus quiz: " + error.message);
      return;
    }

    setQuiz(quiz.filter((q) => q.id !== id));
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
      <div className="adminLayout">
        <aside className="sidebar">
          <h2>Admin Panel</h2>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/items/new">Tambah Koleksi</Link>
          <Link href="/admin/quiz">Kelola Quiz</Link>
          <Link href="/scan">Tes Scanner</Link>
          <Link href="/">Lihat Website</Link>
        </aside>

        <section>
          <span className="badge">Kelola Quiz</span>

          <h1>Quiz Koleksi Museum</h1>

          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Tambahkan soal quiz berdasarkan koleksi museum. Quiz ini akan muncul
            di halaman detail koleksi dan mode game Quiz Cepat.
          </p>

          <div className="panel">
            <h2>Tambah Quiz Baru</h2>

            <form onSubmit={handleSubmit}>
              <label>Pilih Koleksi</label>
              <select
                className="input"
                name="item_slug"
                value={form.item_slug}
                onChange={handleChange}
              >
                <option value="">-- Pilih Koleksi --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>

              <br />
              <br />

              <label>Pertanyaan</label>
              <textarea
                className="input"
                name="question"
                value={form.question}
                onChange={handleChange}
                rows={4}
                placeholder="Contoh: Apa fungsi utama benda ini?"
              />

              <br />
              <br />

              <div
                className="grid"
                style={{ gridTemplateColumns: "1fr 1fr", gap: 18 }}
              >
                <div>
                  <label>Opsi A</label>
                  <input
                    className="input"
                    name="option_a"
                    value={form.option_a}
                    onChange={handleChange}
                    placeholder="Pilihan A"
                  />
                </div>

                <div>
                  <label>Opsi B</label>
                  <input
                    className="input"
                    name="option_b"
                    value={form.option_b}
                    onChange={handleChange}
                    placeholder="Pilihan B"
                  />
                </div>

                <div>
                  <label>Opsi C</label>
                  <input
                    className="input"
                    name="option_c"
                    value={form.option_c}
                    onChange={handleChange}
                    placeholder="Pilihan C"
                  />
                </div>

                <div>
                  <label>Opsi D</label>
                  <input
                    className="input"
                    name="option_d"
                    value={form.option_d}
                    onChange={handleChange}
                    placeholder="Pilihan D"
                  />
                </div>
              </div>

              <br />

              <label>Jawaban Benar</label>
              <select
                className="input"
                name="correct_answer"
                value={form.correct_answer}
                onChange={handleChange}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>

              <div className="actions">
                <button className="btn primary" type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan Quiz"}
                </button>

                <Link className="btn" href="/admin">
                  Kembali
                </Link>
              </div>
            </form>

            {msg && <p style={{ marginTop: 18 }}>{msg}</p>}
          </div>

          <div className="panel" style={{ marginTop: 24 }}>
            <h2>Daftar Quiz</h2>

            {quiz.length === 0 ? (
              <p style={{ color: "#64748b" }}>
                Belum ada quiz. Tambahkan quiz dari form di atas.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Koleksi</th>
                      <th>Pertanyaan</th>
                      <th>Jawaban</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {quiz.map((q) => (
                      <tr key={q.id}>
                        <td>
                          <b>{getItemName(q.item_slug)}</b>
                          <br />
                          <span style={{ color: "#64748b", fontSize: 13 }}>
                            {q.item_slug}
                          </span>
                        </td>

                        <td>{q.question}</td>

                        <td>
                          <b>{q.correct_answer}</b>
                        </td>

                        <td>
                          <button
                            className="btn"
                            onClick={() => handleDelete(q.id)}
                            style={{
                              background: "#fee2e2",
                              color: "#991b1b",
                              borderColor: "#fecaca",
                            }}
                          >
                            Hapus
                          </button>
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