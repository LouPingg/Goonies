const KEY = "goonies";

// ⚠️ Prototype: on "seed" un compte admin par défaut au tout premier lancement.
// Identifiants par défaut: username=admin, password=goonies-admin (à changer ensuite)
const initial = {
  users: [
    {
      id: "admin-1",
      username: "AiChris",
      password: "Chrisosaure",
      displayName: "Chef Goonies",
      avatarUrl: "https://picsum.photos/seed/chef/300/300",
      titles: ["Chef", "Fondateur"],
      role: "admin",
    },
  ],
  session: null,
  allowlist: [], // ex: ["Mikey", "OneEyedWilly"]
};

export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (!data) {
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    // migration légère si ancien format
    data.allowlist ||= [];
    data.users = (data.users || []).map((u) => ({ role: "member", ...u }));
    return data;
  } catch {
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
}
export function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

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

/* -------- Allowlist (admin only) -------- */
export function listAllowlist() {
  return load().allowlist;
}
export function isAllowed(username) {
  const s = load();
  return s.allowlist.some((u) => u.toLowerCase() === username.toLowerCase());
}
export function allowUsername(username) {
  const s = load();
  const u = username.trim();
  if (!u) return s.allowlist;
  if (!isAllowed(u)) s.allowlist.push(u);
  save(s);
  return s.allowlist;
}
export function revokeUsername(username) {
  const s = load();
  s.allowlist = s.allowlist.filter(
    (n) => n.toLowerCase() !== username.toLowerCase()
  );
  save(s);
  return s.allowlist;
}
