"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import {
  getItem,
  getItems,
  incrementItemViews,
  addBookmark,
  addActivity,
} from "@/lib/api";
import ItemCard from "@/components/ItemCard";

export default function Detail() {
  const params = useParams();
  const slug = params?.slug;

  const [item, setItem] = useState(null);
  const [qr, setQr] = useState("");
  const [related, setRelated] = useState([]);
  const hasCountedView = useRef(false);

  useEffect(() => {
    async function loadDetail() {
      if (!slug) return;

      const data = await getItem(slug);

      if (!data) {
        setItem(null);
        return;
      }

      let finalItem = data;

      if (!hasCountedView.current) {
        hasCountedView.current = true;

        const newViews = await incrementItemViews(data.slug);

        await addActivity(data.slug, "view", 0);

        if (newViews !== null) {
          finalItem = {
            ...data,
            views: newViews,
          };
        }
      }

      setItem(finalItem);

      const qrUrl = `${window.location.origin}/collections/${data.slug}`;
      const qrImage = await QRCode.toDataURL(qrUrl);
      setQr(qrImage);

      const allItems = await getItems();
      setRelated(allItems.filter((x) => x.slug !== data.slug).slice(0, 3));
    }

    loadDetail();
  }, [slug]);

  async function save() {
    const result = await addBookmark(item.slug);

    if (result.error) {
      alert(result.error);
      return;
    }

    alert("Disimpan ke bookmark");
  }

  if (!item) {
    return <div className="container section">Loading...</div>;
  }

  return (
    <>
      <section className="detailHero">
        <div className="container detailGrid">
          <div className="detailPhoto">
            <img
              src={item.image_url || "/images/sample-collection.png"}
              alt={item.name}
            />
          </div>

          <div>
            <span className="badge">{item.category}</span>

            <h1 style={{ fontSize: 46 }}>{item.name}</h1>

            <p style={{ fontSize: 18, lineHeight: 1.7 }}>
              {item.description}
            </p>

            <div className="infoGrid">
              <div className="infoBox">
                Periode
                <br />
                <b>{item.period || item.year || "-"}</b>
              </div>

              <div className="infoBox">
                Asal
                <br />
                <b>{item.origin || "-"}</b>
              </div>

              <div className="infoBox">
                Material
                <br />
                <b>{item.material || "-"}</b>
              </div>

              <div className="infoBox">
                Status
                <br />
                <b>{item.condition || "-"}</b>
              </div>

              <div className="infoBox">
                Dilihat
                <br />
                <b>👁️ {item.views || 0} kali</b>
              </div>
            </div>

            <div className="actions">
              <button className="btn primary" onClick={save}>
                ⭐ Bookmark
              </button>

              <Link className="btn" href={`/quiz/${item.slug}`}>
                🧠 Mulai Quiz
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="container section">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="panel">
            <h2>Deskripsi Koleksi</h2>

            <p style={{ lineHeight: 1.8, color: "#475569" }}>
              {item.description}
            </p>

            <h3>Nilai Edukasi</h3>

            <p>
              Koleksi ini membantu pengunjung memahami sejarah lokal, fungsi
              benda, material, dan konteks budaya masyarakat Bengkulu.
            </p>
          </div>

          <div className="panel" style={{ textAlign: "center" }}>
            <h2>QR Code Koleksi</h2>

            {qr && (
              <img
                src={qr}
                width="210"
                alt="QR"
                style={{ margin: "0 auto" }}
              />
            )}

            <p>
              QR ini berisi link halaman detail koleksi.
            </p>
          </div>
        </div>

        <h2 style={{ marginTop: 50 }}>Koleksi Terkait</h2>

        <div className="grid">
          {related.map((x) => (
            <ItemCard key={x.id} item={x} />
          ))}
        </div>
      </main>
    </>
  );
}