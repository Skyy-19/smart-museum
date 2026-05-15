"use client";

import { useEffect, useState } from "react";
import { getItems, getQuiz, addActivity } from "@/lib/api";
import Link from "next/link";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getRandomItems(items, count) {
  return shuffleArray(items).slice(0, count);
}

export default function GamePage() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("image");
  const [question, setQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [quizPool, setQuizPool] = useState([]);
  const [loading, setLoading] = useState(true);

  const maxRound = 5;

  useEffect(() => {
    async function load() {
      const data = await getItems();
      setItems(data || []);
      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      startGame(mode);
    }
  }, [items, mode]);

  async function startGame(gameMode) {
    setMode(gameMode);
    setScore(0);
    setRound(1);
    setSelected("");
    setResult("");

    if (gameMode === "quick") {
      await prepareQuickQuiz();
      return;
    }

    createQuestion(gameMode, 1, 0);
  }

  async function prepareQuickQuiz() {
    let allQuiz = [];

    for (const item of items) {
      const quiz = await getQuiz(item.slug);
      if (quiz && quiz.length > 0) {
        allQuiz = [
          ...allQuiz,
          ...quiz.map((q) => ({
            ...q,
            item_name: item.name,
            item_slug: item.slug,
          })),
        ];
      }
    }

    const shuffledQuiz = shuffleArray(allQuiz).slice(0, maxRound);
    setQuizPool(shuffledQuiz);

    if (shuffledQuiz.length > 0) {
      createQuickQuestion(shuffledQuiz[0]);
    } else {
      setQuestion(null);
      setOptions([]);
    }
  }

  function createQuestion(gameMode, currentRound = round, currentScore = score) {
    if (!items || items.length < 4) {
      setQuestion(null);
      setOptions([]);
      return;
    }

    const randomItems = getRandomItems(items, 4);
    const correctItem = randomItems[0];

    if (gameMode === "image") {
      setQuestion({
        type: "image",
        title: "Tebak nama koleksi dari gambar ini",
        image: correctItem.image_url || "/images/sample-collection.png",
        correct: correctItem.name,
        item_slug: correctItem.slug,
      });

      setOptions(shuffleArray(randomItems.map((item) => item.name)));
    }

    if (gameMode === "category") {
      const categories = [
        ...new Set(items.map((item) => item.category).filter(Boolean)),
      ];

      let categoryOptions = shuffleArray([
        correctItem.category || "Umum",
        ...categories.filter((cat) => cat !== correctItem.category),
      ]).slice(0, 4);

      while (categoryOptions.length < 4) {
        categoryOptions.push("Umum");
      }

      setQuestion({
        type: "category",
        title: `Apa kategori dari koleksi "${correctItem.name}"?`,
        image: correctItem.image_url || "/images/sample-collection.png",
        correct: correctItem.category || "Umum",
        item_slug: correctItem.slug,
      });

      setOptions(shuffleArray(categoryOptions));
    }

    setSelected("");
    setResult("");
  }

  function createQuickQuestion(quiz) {
    setQuestion({
      type: "quick",
      title: quiz.question,
      correct: quiz.correct_answer,
      item_slug: quiz.item_slug,
      item_name: quiz.item_name,
      optionMap: {
        A: quiz.option_a,
        B: quiz.option_b,
        C: quiz.option_c,
        D: quiz.option_d,
      },
    });

    setOptions(["A", "B", "C", "D"]);
    setSelected("");
    setResult("");
  }

  async function answer(option) {
    if (!question || selected) return;

    setSelected(option);

    const isCorrect = option === question.correct;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setResult("Benar");
    } else {
      setResult("Salah");
    }

    await addActivity(question.item_slug, "game", isCorrect ? 1 : 0);
  }

  function nextRound() {
    const next = round + 1;

    if (next > maxRound) {
      setRound(next);
      return;
    }

    setRound(next);

    if (mode === "quick") {
      createQuickQuestion(quizPool[next - 1]);
      return;
    }

    createQuestion(mode, next, score);
  }

  function optionClass(option) {
    if (!selected) return "option";

    if (option === question.correct) return "option ok";

    if (selected === option && option !== question.correct) return "option no";

    return "option";
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="panel">Memuat game museum...</div>
      </main>
    );
  }

  if (items.length < 4) {
    return (
      <main className="container section">
        <div className="sectionTitle">
          <span className="badge">🎮 Game Museum</span>
          <h1>Data Koleksi Belum Cukup</h1>
          <p>
            Game membutuhkan minimal 4 data koleksi agar pilihan jawabannya bisa
            dibuat.
          </p>
        </div>

        <div className="panel" style={{ textAlign: "center" }}>
          <p>
            Tambahkan minimal 4 koleksi melalui halaman admin atau Supabase.
          </p>

          <Link className="btn primary" href="/admin">
            Ke Admin
          </Link>
        </div>
      </main>
    );
  }

  const isFinished = round > maxRound;

  return (
    <main className="container section">
      <div className="sectionTitle">
        <span className="badge">🎮 Mini Game Museum</span>
        <h1>Game Edukasi Museum Bengkulu</h1>
        <p>
          Pilih mode permainan, jawab pertanyaan, dan kumpulkan skor dari
          koleksi museum Bengkulu.
        </p>
      </div>

      <div className="gameCard">
        <div className="filterBar">
          <button
            className={mode === "image" ? "filterActive" : ""}
            onClick={() => startGame("image")}
          >
            🖼️ Tebak Gambar
          </button>

          <button
            className={mode === "category" ? "filterActive" : ""}
            onClick={() => startGame("category")}
          >
            🏛️ Tebak Kategori
          </button>

          <button
            className={mode === "quick" ? "filterActive" : ""}
            onClick={() => startGame("quick")}
          >
            ⚡ Quiz Cepat
          </button>
        </div>
      </div>

      <div className="gameCard">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <div>
            <b>Mode</b>
            <p style={{ margin: 0, color: "#64748b" }}>
              {mode === "image" && "Tebak Koleksi dari Gambar"}
              {mode === "category" && "Tebak Kategori Koleksi"}
              {mode === "quick" && "Quiz Cepat Museum"}
            </p>
          </div>

          <div>
            <b>Ronde</b>
            <p style={{ margin: 0, color: "#2563eb" }}>
              {isFinished ? maxRound : round}/{maxRound}
            </p>
          </div>

          <div>
            <b>Skor</b>
            <p style={{ margin: 0, color: "#059669" }}>{score}</p>
          </div>
        </div>
      </div>

      {mode === "quick" && quizPool.length === 0 ? (
        <div className="panel" style={{ textAlign: "center" }}>
          <h2>Quiz Cepat Belum Bisa Dimainkan</h2>
          <p style={{ color: "#64748b" }}>
            Data quiz belum tersedia di Supabase. Mode Tebak Gambar dan Tebak
            Kategori tetap bisa dimainkan.
          </p>
        </div>
      ) : isFinished ? (
        <div className="panel" style={{ textAlign: "center" }}>
          <span className="badge">🏆 Selesai</span>
          <h1>Skor Akhir: {score}/{maxRound}</h1>

          <p style={{ color: "#64748b" }}>
            Skor permainan sudah dicatat ke halaman aktivitas jika kamu sedang
            login.
          </p>

          <div className="actions" style={{ justifyContent: "center" }}>
            <button className="btn primary" onClick={() => startGame(mode)}>
              Main Lagi
            </button>

            <Link className="btn" href="/activity">
              Lihat Aktivitas
            </Link>
          </div>
        </div>
      ) : (
        <div className="gameCard">
          {question?.image && (
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                marginBottom: 24,
                background: "#020617",
                maxHeight: 380,
              }}
            >
              <img
                src={question.image}
                alt="Gambar koleksi"
                style={{
                  width: "100%",
                  height: 360,
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          <span className="badge">Ronde {round}</span>

          <h2>{question?.title}</h2>

          {question?.item_name && (
            <p style={{ color: "#64748b" }}>
              Koleksi terkait: <b>{question.item_name}</b>
            </p>
          )}

          {options.map((option) => (
            <button
              key={option}
              className={optionClass(option)}
              onClick={() => answer(option)}
            >
              {mode === "quick"
                ? `${option}. ${question.optionMap[option]}`
                : option}
            </button>
          ))}

          {selected && (
            <div
              className="panel"
              style={{
                marginTop: 22,
                background: result === "Benar" ? "#ecfdf5" : "#fef2f2",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {result === "Benar" ? "✅ Benar!" : "❌ Salah!"}
              </h2>

              <p>
                Jawaban yang benar:{" "}
                <b>
                  {mode === "quick"
                    ? `${question.correct}. ${
                        question.optionMap[question.correct]
                      }`
                    : question.correct}
                </b>
              </p>

              <button className="btn primary" onClick={nextRound}>
                {round === maxRound ? "Lihat Skor" : "Lanjut"}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}