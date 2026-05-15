import { supabase, hasSupabase } from "./supabase";
import { demoItems, demoQuiz } from "./demo-data";

export async function getItems() {
  if (!hasSupabase) return demoItems;

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  return error ? demoItems : data;
}

export async function getItem(slug) {
  if (!hasSupabase) return demoItems.find((i) => i.slug === slug);

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("slug", slug)
    .single();

  return error ? demoItems.find((i) => i.slug === slug) : data;
}

export async function incrementItemViews(slug) {
  if (!hasSupabase) return null;

  const { data: item, error } = await supabase
    .from("items")
    .select("views")
    .eq("slug", slug)
    .single();

  if (error) return null;

  const newViews = (item?.views || 0) + 1;

  await supabase.from("items").update({ views: newViews }).eq("slug", slug);

  return newViews;
}

export async function getQuiz(slug) {
  if (!hasSupabase) return demoQuiz.filter((q) => q.item_slug === slug);

  const { data, error } = await supabase
    .from("quiz")
    .select("*")
    .eq("item_slug", slug);

  return error ? [] : data;
}

export async function addBookmark(itemSlug) {
  if (!hasSupabase) return { error: "Supabase belum aktif" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Silakan login dulu untuk menyimpan bookmark" };
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("item_slug", itemSlug)
    .maybeSingle();

  if (existing) {
    return { error: "Koleksi ini sudah ada di bookmark" };
  }

  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    item_slug: itemSlug,
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function getUserBookmarks() {
  if (!hasSupabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];

  const items = await getItems();

  return bookmarks
    .map((bookmark) => items.find((item) => item.slug === bookmark.item_slug))
    .filter(Boolean);
}

export async function removeBookmark(itemSlug) {
  if (!hasSupabase) return { error: "Supabase belum aktif" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Silakan login dulu" };
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", user.id)
    .eq("item_slug", itemSlug);

  if (error) return { error: error.message };

  return { success: true };
}

export async function addActivity(itemSlug, activityType = "view", score = 0) {
  if (!hasSupabase) {
    console.log("Activity gagal: Supabase belum aktif");
    return { error: "Supabase belum aktif" };
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.log("Activity session error:", sessionError.message);
    return { error: sessionError.message };
  }

  const user = session?.user;

  if (!user) {
    console.log("Activity gagal: user belum login");
    return { error: "User belum login" };
  }

  const payload = {
    user_id: user.id,
    item_slug: itemSlug,
    activity_type: activityType,
    score,
  };

  console.log("Mencoba simpan activity:", payload);

  const { error } = await supabase.from("user_activity").insert(payload);

  if (error) {
    console.log("Activity insert error:", error.message);
    return { error: error.message };
  }

  console.log("Activity berhasil masuk:", itemSlug, activityType, score);

  return { success: true };
}

export async function getUserActivity() {
  if (!hasSupabase) return [];

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Get activity error:", error.message);
    return [];
  }

  return data || [];
}