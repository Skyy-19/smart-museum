"use client";

import { Suspense, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    if (!hasSupabase) {
      setMsg("Isi .env.local Supabase dulu.");
      return;
    }

    if (!email || !password) {
      setMsg("Email dan password wajib diisi.");
      return;
    }

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      const user = data?.user;
      let role = "user";

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        role = profile?.role || "user";
      }

      setMsg("Login berhasil.");

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
      return;
    }

    if (data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        role: "user",
      });
    }

    setMsg("Register berhasil. Silakan login.");
    setIsLogin(true);
  }

  return (
    <main className="container section">
      <div className="panel" style={{ maxWidth: 460, margin: "auto" }}>
        <h1>{isLogin ? "Login User/Admin" : "Register Akun"}</h1>

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button className="btn primary" onClick={handleAuth}>
          {isLogin ? "Login" : "Register"}
        </button>

        <button
          className="btn"
          style={{ marginLeft: 10 }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Buat Akun" : "Saya Sudah Punya Akun"}
        </button>

        <p style={{ marginTop: 16 }}>{msg}</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="container section">
          <div className="panel" style={{ maxWidth: 460, margin: "auto" }}>
            Memuat halaman login...
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}