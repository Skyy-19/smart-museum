"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ItemQRPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [qr, setQr] = useState("");
  const [loading, setLoading] = useState(true);

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

      if (error || !data) {
        setLoading(false);
        return;
      }

      setItem(data);

      const url = `${window.location.origin}/collections/${data.slug}`;

      const qrImage = await QRCode.toDataURL(url, {
        width: 420,
        margin: 2,
      });

      setQr(qrImage);
      setLoading(false);
    }

    checkAdminAndLoad();
  }, [id, router]);

  function downloadQR() {
    const link = document.createElement("a");
    link.href = qr;
    link.download = `qr-${item.slug}.png`;
    link.click();
  }

  function printQR() {
    window.print();
  }

  if (loading) {
    return (
      <main className="container section">
        <div className="panel">Membuat QR Code...</div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="container section">
        <div className="panel">Data koleksi tidak ditemukan.</div>
      </main>
    );
  }

  return (
    <main className="container section">
      <div className="panel qrPrintArea" style={{ maxWidth: 680, margin: "auto" }}>
        <div style={{ textAlign: "center" }}>
          <span className="badge">QR Code Koleksi</span>

          <h1>{item.name}</h1>

          <p style={{ color: "#64748b" }}>
            Scan QR ini untuk membuka halaman detail koleksi museum.
          </p>

          {qr && (
            <img
              src={qr}
              alt={`QR ${item.name}`}
              style={{
                width: 320,
                height: 320,
                margin: "24px auto",
                borderRadius: 18,
                border: "1px solid #e5e7eb",
                padding: 12,
                background: "white",
              }}
            />
          )}

          <h2 style={{ marginBottom: 4 }}>{item.name}</h2>

          <p style={{ color: "#64748b", marginTop: 0 }}>
            {item.category || "Koleksi Museum"} • {item.origin || "Bengkulu"}
          </p>

          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              wordBreak: "break-all",
              background: "#f8fafc",
              padding: 14,
              borderRadius: 14,
            }}
          >
            {typeof window !== "undefined"
              ? `${window.location.origin}/collections/${item.slug}`
              : ""}
          </p>
        </div>

        <div className="actions noPrint" style={{ justifyContent: "center" }}>
          <button className="btn primary" onClick={downloadQR}>
            Download QR
          </button>

          <button className="btn blue" onClick={printQR}>
            Print QR
          </button>

          <Link className="btn" href="/admin">
            Kembali
          </Link>
        </div>
      </div>
    </main>
  );
}