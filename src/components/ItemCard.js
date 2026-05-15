"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";

export default function ItemCard({ item }) {
  const [showQr, setShowQr] = useState(false);
  const [qrImage, setQrImage] = useState("");

  async function openQr() {
    const url = `${window.location.origin}/collections/${item.slug}`;
    const qr = await QRCode.toDataURL(url);
    setQrImage(qr);
    setShowQr(true);
  }

  function closeQr() {
    setShowQr(false);
  }

  return (
    <>
      <div className="itemCard">
        <div className="itemImage">
          <img
            src={item.image_url || "/images/sample-collection.png"}
            alt={item.name}
          />

          <div className="itemOverlay"></div>

          {item.category && (
            <span className="itemCategory">{item.category}</span>
          )}

          <div className="itemTitle">
            <h2>{item.name}</h2>
            <p>
              {item.description
                ? item.description.slice(0, 95) + "..."
                : "Koleksi museum digital Bengkulu."}
            </p>
          </div>
        </div>

        <div className="itemBody">
          <div className="itemMeta">
            <span>
              <b>●</b> {item.period || item.year || "Tidak diketahui"}
            </span>

            <span>👁️ {item.views || 0} kali dilihat</span>
          </div>

          <p className="itemDesc">
            {item.description
              ? item.description.slice(0, 140) + "..."
              : "Belum ada deskripsi koleksi."}
          </p>

          <div className="itemOrigin">
            📍 {item.origin || "Bengkulu, Indonesia"}
          </div>

          <div className="itemActions">
            <div className="viewBadge">
              <span>👁️</span>
              <p>
                {item.views || 0} kali
                <br />
                dilihat
              </p>
            </div>

            <button className="qrBtn" onClick={openQr}>
              <span className="qrIcon">▦</span> QR
            </button>

            <Link className="detailBtn" href={`/collections/${item.slug}`}>
              Detail ›
            </Link>
          </div>
        </div>
      </div>

      {showQr && (
        <div className="qrModal">
          <div className="qrBox">
            <button className="qrClose" onClick={closeQr}>
              ×
            </button>

            <h1>QR Code - {item.name}</h1>

            {qrImage && <img src={qrImage} alt={`QR ${item.name}`} />}

            <p>
              Scan QR Code ini untuk membuka halaman detail koleksi di perangkat
              mobile.
            </p>

            <div className="qrLink">/collections/{item.slug}</div>

            <button className="btn primary" onClick={closeQr}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
