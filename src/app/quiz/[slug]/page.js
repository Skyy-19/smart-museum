"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getItem, getQuiz, addActivity } from "@/lib/api";
import Link from "next/link";

export default function QuizPage() {
  const params = useParams();
  const slug = params?.slug;

  const [item, setItem] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      const itemData = await getItem(slug);
      const quizData = await getQuiz(slug);

      setItem(itemData);
      setQuiz(quizData || []);
    }

    load();
  }, [slug]);

  function chooseAnswer(questionId, answer) {
    if (finished) return;

    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  }

  async function finishQuiz() {
    let total = 0;

    quiz.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        total += 1;
      }
    });

    setScore(total);
    setFinished(true);

    if (!saved && slug) {
      await addActivity(slug, "quiz", total);
      setSaved(true);
    }
  }

  function getOptionClass(question, option) {
    if (!finished) return "option";

    if (option === question.correct_answer) {
      return "option ok";
    }

    if (answers[question.id] === option && option !== question.correct_answer) {
      return "option no";
    }

    return "option";
  }

  if (!item) {
    return (
      <main className="container section">
        <div className="panel">Memuat quiz...</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="sectionTitle">
        <span className="badge">🧠 Quiz Museum</span>
        <h1>Quiz: {item.name}</h1>
        <p>
          Jawab pertanyaan berdasarkan informasi koleksi museum. Skor akan
          tersimpan di aktivitas akun kamu.
        </p>
      </div>

      {quiz.length === 0 ? (
        <div className="panel" style={{ textAlign: "center" }}>
          <h2>Quiz belum tersedia</h2>
          <p style={{ color: "#64748b" }}>
            Admin belum menambahkan soal quiz untuk koleksi ini.
          </p>

          <Link className="btn primary" href={`/collections/${slug}`}>
            Kembali ke Detail
          </Link>
        </div>
      ) : (
        <>
          <div className="gameCard">
            <div className="actions" style={{ justifyContent: "space-between" }}>
              <div>
                <b>Total Soal</b>
                <p style={{ margin: 0, color: "#64748b" }}>
                  {quiz.length} pertanyaan
                </p>
              </div>

              <div>
                <b>Status</b>
                <p style={{ margin: 0, color: finished ? "#059669" : "#64748b" }}>
                  {finished ? "Selesai" : "Sedang dikerjakan"}
                </p>
              </div>

              <div>
                <b>Skor</b>
                <p style={{ margin: 0, color: "#2563eb" }}>
                  {finished ? `${score}/${quiz.length}` : "-"}
                </p>
              </div>
            </div>
          </div>

          {quiz.map((q, index) => (
            <div className="gameCard" key={q.id}>
              <span className="badge">Soal {index + 1}</span>

              <h2>{q.question}</h2>

              <button
                className={getOptionClass(q, "A")}
                onClick={() => chooseAnswer(q.id, "A")}
              >
                A. {q.option_a}
              </button>

              <button
                className={getOptionClass(q, "B")}
                onClick={() => chooseAnswer(q.id, "B")}
              >
                B. {q.option_b}
              </button>

              <button
                className={getOptionClass(q, "C")}
                onClick={() => chooseAnswer(q.id, "C")}
              >
                C. {q.option_c}
              </button>

              <button
                className={getOptionClass(q, "D")}
                onClick={() => chooseAnswer(q.id, "D")}
              >
                D. {q.option_d}
              </button>

              {finished && (
                <p style={{ color: "#64748b" }}>
                  Jawaban benar: <b>{q.correct_answer}</b>
                </p>
              )}
            </div>
          ))}

          <div className="panel" style={{ textAlign: "center" }}>
            {!finished ? (
              <button
                className="btn primary"
                onClick={finishQuiz}
                disabled={Object.keys(answers).length < quiz.length}
              >
                Selesaikan Quiz
              </button>
            ) : (
              <>
                <h2>
                  Skor Kamu: {score}/{quiz.length}
                </h2>

                <p style={{ color: "#64748b" }}>
                  Skor quiz sudah tersimpan ke halaman aktivitas.
                </p>

                <div className="actions" style={{ justifyContent: "center" }}>
                  <Link className="btn primary" href="/activity">
                    Lihat Aktivitas
                  </Link>

                  <Link className="btn" href={`/collections/${slug}`}>
                    Kembali ke Detail
                  </Link>
                </div>
              </>
            )}

            {!finished && Object.keys(answers).length < quiz.length && (
              <p style={{ color: "#64748b" }}>
                Jawab semua soal dulu sebelum menyelesaikan quiz.
              </p>
            )}
          </div>
        </>
      )}
    </main>
  );
}