"use client";

import { useEffect, useRef, useState } from "react";

export default function Scan() {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  const [status, setStatus] = useState("Kamera belum dibuka");
  const [loading, setLoading] = useState(false);

  async function start() {
    try {
      if (isRunningRef.current) {
        setStatus("Scanner sudah aktif");
        return;
      }

      setLoading(true);
      setStatus("Membuka kamera...");

      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 260,
            height: 260,
          },
        },
        async (text) => {
          setStatus("QR terbaca, membuka detail...");

          try {
            if (scannerRef.current && isRunningRef.current) {
              await scannerRef.current.stop();
              await scannerRef.current.clear();
              isRunningRef.current = false;
            }
          } catch (err) {
            console.log("Scanner stop error:", err);
          }

          window.location.href = text.includes("http")
            ? text
            : `/collections/${text}`;
        },
        () => {}
      );

      isRunningRef.current = true;
      setStatus("Scanner aktif. Arahkan kamera ke QR Code.");
    } catch (error) {
      console.log(error);
      setStatus(
        "Gagal membuka kamera. Pastikan browser mengizinkan akses kamera."
      );
    } finally {
      setLoading(false);
    }
  }

  async function stop() {
    try {
      if (!scannerRef.current || !isRunningRef.current) {
        setStatus("Scanner belum aktif");
        return;
      }

      setLoading(true);
      setStatus("Menutup kamera...");

      await scannerRef.current.stop();
      await scannerRef.current.clear();

      isRunningRef.current = false;
      scannerRef.current = null;

      setStatus("Scanner ditutup");
    } catch (error) {
      console.log(error);
      setStatus("Gagal menutup scanner");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => {
      async function cleanup() {
        try {
          if (scannerRef.current && isRunningRef.current) {
            await scannerRef.current.stop();
            await scannerRef.current.clear();
          }
        } catch (error) {
          console.log("Cleanup scanner error:", error);
        }
      }

      cleanup();
    };
  }, []);

  return (
    <main className="container section">
      <div className="sectionTitle">
        <span className="badge">📷 Smart Museum Scanner</span>
        <h1>Scan QR Museum</h1>
        <p>
          Arahkan kamera ke QR Code pada benda museum. Sistem akan membuka
          halaman detail koleksi secara otomatis.
        </p>
      </div>

      <div className="scannerBox">
        <div className="scanFrame">
          <div
            id="reader"
            style={{
              minHeight: 380,
              borderRadius: 24,
              overflow: "hidden",
            }}
          ></div>
        </div>

        <p style={{ textAlign: "center", color: "#059669", fontWeight: 800 }}>
          ● {status}
        </p>

        <div className="actions" style={{ justifyContent: "center" }}>
          <button
            className="btn blue"
            onClick={start}
            disabled={loading || isRunningRef.current}
          >
            {loading ? "Memproses..." : "Buka Kamera"}
          </button>

          <button className="btn" onClick={stop} disabled={loading}>
            Tutup Kamera
          </button>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 700, margin: "auto" }}>
        <h2>📌 Cara Menggunakan</h2>
        <p>
          1. Klik tombol Buka Kamera.
          <br />
          2. Izinkan akses kamera browser.
          <br />
          3. Arahkan kamera ke QR Code koleksi.
          <br />
          4. Website otomatis membuka halaman detail benda.
        </p>
      </div>
    </main>
  );
}