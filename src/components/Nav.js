"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, hasSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");

  useEffect(() => {
    async function loadUser() {
      if (!hasSupabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", currentUser.id)
          .single();

        setRole(profile?.role || "user");
      }
    }

    loadUser();

    if (!hasSupabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (hasSupabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setRole("user");
    setOpen(false);
    router.push("/");
  }

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <header className="nav">
        <div className="container navin">
          <Link className="brand" href="/" onClick={closeMenu}>
            <span className="brandIcon">🏛️</span>
            <span>Smart Museum</span>
          </Link>

          <nav className="links desktopLinks">
            <Link href="/">Home</Link>
            <Link href="/#koleksi">Koleksi</Link>
            <Link href="/scan">Scan QR</Link>
            <Link href="/game">Game</Link>

            {user && <Link href="/bookmarks">Bookmark</Link>}
            {user && <Link href="/activity">Aktivitas</Link>}
            {user && role === "admin" && <Link href="/admin">Admin</Link>}

            {user ? (
              <button className="logoutBtn" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link className="loginBtn" href="/login">
                Login
              </Link>
            )}
          </nav>

          <button
            className="mobileMenuBtn"
            onClick={() => setOpen(true)}
            aria-label="Buka menu"
          >
            ☰
          </button>
        </div>
      </header>

      {open && (
        <div className="mobileMenuOverlay">
          <div className="mobileMenu">
            <div className="mobileMenuTop">
              <Link className="mobileBrand" href="/" onClick={closeMenu}>
                🏛️ Smart Museum
              </Link>

              <button className="mobileClose" onClick={closeMenu}>
                ×
              </button>
            </div>

            <div className="mobileMenuLinks">
              <Link href="/" onClick={closeMenu}>
                <span>🏠</span>
                Home
              </Link>

              <Link href="/#koleksi" onClick={closeMenu}>
                <span>🖼️</span>
                Koleksi
              </Link>

              <Link href="/scan" onClick={closeMenu}>
                <span>📷</span>
                Scan QR
              </Link>

              <Link href="/game" onClick={closeMenu}>
                <span>🎮</span>
                Game
              </Link>

              {user && (
                <Link href="/bookmarks" onClick={closeMenu}>
                  <span>⭐</span>
                  Bookmark
                </Link>
              )}

              {user && (
                <Link href="/activity" onClick={closeMenu}>
                  <span>📊</span>
                  Aktivitas
                </Link>
              )}

              {user && role === "admin" && (
                <Link href="/admin" onClick={closeMenu}>
                  <span>⚙️</span>
                  Admin
                </Link>
              )}

              <div className="mobileMenuDivider"></div>

              {user ? (
                <button className="mobileLogout" onClick={logout}>
                  <span>🚪</span>
                  Logout
                </button>
              ) : (
                <Link className="mobileLogin" href="/login" onClick={closeMenu}>
                  <span>➡️</span>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}