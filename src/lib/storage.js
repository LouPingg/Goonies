// src/lib/storage.js
const KEY = "goonies";

// Seed initial (1 admin, allowlist/galerie/events vides)
const initial = {
  users: [
    {
      id: "admin-1",
      username: "admin",
      password: "goonies-admin",
      displayName: "Chef Goonies",
      avatarUrl: "https://picsum.photos/seed/chef/300/300",
      titles: ["Chef", "Fondateur"],
      role: "admin",
    },
  ],
  session: null,
  allowlist: [],
  gallery: [], // {id, dataUrl, caption, uploadedBy, createdAt}
  events: [], // {id, title, text, imageUrl, startAtUtc, expiresAt, createdBy}
};

// ------- State helpers -------
export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (!data) {
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    // migrations douces
    data.allowlist ||= [];
    data.gallery ||= [];
    data.events ||= [];
    data.users = (data.users || []).map((u) => ({
      role: u.role || "member",
      ...u,
    }));

    // prune auto des events expirés
    const now = Date.now();
    data.events = data.events.filter((ev) => ev.expiresAt > now);

    localStorage.setItem(KEY, JSON.stringify(data));
    return data;
  } catch {
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
}

export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

// ------- Users / Session -------
export function listMembers() {
  return load().users;
}
export function getUserById(id) {
  return load().users.find((u) => u.id === id) || null;
}
export function findUserByUsername(username) {
  return load().users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}
export function upsertUser(user) {
  const s = load();
  const i = s.users.findIndex((u) => u.id === user.id);
  if (i === -1) s.users.push(user);
  else s.users[i] = user;
  save(s);
  return user;
}
export function setSession(userId) {
  const s = load();
  s.session = { userId };
  save(s);
}
export function getSession() {
  return load().session;
}
export function clearSession() {
  const s = load();
  s.session = null;
  save(s);
}

// ------- Allowlist (admin) -------
export function listAllowlist() {
  return load().allowlist;
}
export function isAllowed(username) {
  const s = load();
  return s.allowlist.some((u) => u.toLowerCase() === username.toLowerCase());
}
export function allowUsername(username) {
  const s = load();
  const u = String(username || "").trim();
  if (!u) return s.allowlist;
  if (!isAllowed(u)) s.allowlist.push(u);
  save(s);
  return s.allowlist;
}
export function revokeUsername(username) {
  const s = load();
  s.allowlist = s.allowlist.filter(
    (n) => n.toLowerCase() !== String(username).toLowerCase()
  );
  save(s);
  return s.allowlist;
}

// ------- Galerie -------
export function listGallery() {
  const s = load();
  return [...s.gallery].sort((a, b) => b.createdAt - a.createdAt);
}
export function addImage({ dataUrl, caption, uploadedBy }) {
  const s = load();
  const img = {
    id: crypto.randomUUID(),
    dataUrl,
    caption: (caption || "").trim(),
    uploadedBy,
    createdAt: Date.now(),
  };
  s.gallery.push(img);
  save(s);
  return img;
}
export function removeImage(id) {
  const s = load();
  s.gallery = s.gallery.filter((g) => g.id !== id);
  save(s);
}
export function updateImage(id, patch) {
  const s = load();
  const i = s.gallery.findIndex((g) => g.id === id);
  if (i === -1) return null;
  s.gallery[i] = { ...s.gallery[i], ...patch };
  save(s);
  return s.gallery[i];
}

// ------- Events -------
export function listEvents() {
  const s = load();
  const now = Date.now();
  return [...s.events]
    .filter((ev) => ev.expiresAt > now)
    .sort((a, b) => b.startAtUtc - a.startAtUtc);
}

export function addEvent({
  title,
  text,
  imageUrl,
  hours,
  createdBy,
  startAtUtc,
}) {
  const s = load();
  const now = Date.now();
  const start = Number.isFinite(startAtUtc) ? startAtUtc : now;
  const durationH = Math.min(Math.max(Number(hours || 1), 1), 48); // 1..48

  const ev = {
    id: crypto.randomUUID(),
    title: String(title || "").trim(),
    text: String(text || "").trim(),
    imageUrl: String(imageUrl || "").trim(),
    startAtUtc: start,
    // "expiresAt" = fin d'affichage (mise en avant), pas l'heure de l'événement
    expiresAt: now + durationH * 3600 * 1000,
    createdBy,
  };
  s.events.push(ev);
  save(s);
  return ev;
}

export function removeEvent(id) {
  const s = load();
  s.events = s.events.filter((e) => e.id !== id);
  save(s);
}

export function getActiveFeaturedEvent() {
  const all = listEvents();
  return all[0] || null;
}
