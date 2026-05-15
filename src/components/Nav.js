"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!hasSupabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user || null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(profile?.role || "user");
      }
    }

    loadUser();

    if (!hasSupabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function logout() {
    if (!hasSupabase) return;

    await supabase.auth.signOut();
    setUser(null);
    setRole("");
    router.push("/login");
  }

  return (
    <nav className="nav">
      <div className="container navin">
        <Link href="/" className="brand">
          <span>🏛️</span>
          Smart Museum
        </Link>

        <div className="links">
          <Link href="/">Home</Link>
          <Link href="/#koleksi">Koleksi</Link>
          <Link href="/scan">Scan QR</Link>
          <Link href="/game">Game</Link>

          {user && <Link href="/bookmarks">Bookmark</Link>}
          {user && <Link href="/activity">Aktivitas</Link>}
          {role === "admin" && <Link href="/admin">Admin</Link>}

          {!user ? (
            <Link className="active" href="/login">
              Login
            </Link>
          ) : (
            <button className="btn primary" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}