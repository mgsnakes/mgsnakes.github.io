/* ===== storage ===== */
/* storage.js — couche d'accès localStorage centralisée.
 * Une seule responsabilité : lire/écrire/exporter/importer les données persistées.
 * Toutes les autres modules passent par ici, jamais par localStorage directement. */

const Storage = (() => {
  const PREFIX = 'muscu_';
  const KEYS = {
    log: PREFIX + 'log',          // tableau de séances
    settings: PREFIX + 'settings' // préférences (barre, formule, etc.)
  };

  function _read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      console.warn('Lecture localStorage échouée pour', key, e);
      return fallback;
    }
  }

  function _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Écriture localStorage échouée pour', key, e);
      return false;
    }
  }

  /* ---- Séances ---- */
  // Une séance : { id, date (ISO), name, exercises: [{name, sets, reps, weight, rpe, notes}] }
  function getSessions() {
    return _read(KEYS.log, []);
  }

  function saveSessions(sessions) {
    return _write(KEYS.log, sessions);
  }

  function addSession(session) {
    const sessions = getSessions();
    session.id = session.id || ('s_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    sessions.push(session);
    sessions.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    saveSessions(sessions);
    return session;
  }

  // Ajoute plusieurs séances (import). Déduplique par signature date+nom+nb exercices.
  function addSessions(newSessions) {
    const sessions = getSessions();
    const sig = s => `${s.date}|${s.name}|${(s.exercises || []).length}`;
    const existing = new Set(sessions.map(sig));
    let added = 0;
    for (const s of newSessions) {
      if (existing.has(sig(s))) continue;
      s.id = s.id || ('s_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
      sessions.push(s);
      existing.add(sig(s));
      added++;
    }
    sessions.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    saveSessions(sessions);
    return added;
  }

  function deleteSession(id) {
    const sessions = getSessions().filter(s => s.id !== id);
    saveSessions(sessions);
  }

  function clearSessions() {
    saveSessions([]);
  }

  /* ---- Réglages ---- */
  const DEFAULT_SETTINGS = {
    formula: 'epley',   // epley | brzycki
    barWeight: 20,      // kg
    plates: [25, 20, 15, 10, 5, 2.5, 1.25]
  };

  function getSettings() {
    return Object.assign({}, DEFAULT_SETTINGS, _read(KEYS.settings, {}));
  }

  function saveSettings(patch) {
    const merged = Object.assign(getSettings(), patch);
    _write(KEYS.settings, merged);
    return merged;
  }

  /* ---- Export / import global ---- */
  function exportAll() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions: getSessions(),
      settings: getSettings()
    };
  }

  function importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Données invalides');
    if (Array.isArray(data.sessions)) saveSessions(data.sessions);
    if (data.settings && typeof data.settings === 'object') _write(KEYS.settings, data.settings);
    return true;
  }

  function clearAll() {
    localStorage.removeItem(KEYS.log);
    localStorage.removeItem(KEYS.settings);
  }

  return {
    getSessions, saveSessions, addSession, addSessions, deleteSession, clearSessions,
    getSettings, saveSettings,
    exportAll, importAll, clearAll
  };
})();


/* ===== onerm ===== */
/* onerm.js — Estimateur de 1RM + tableau de montée en charge (%1RM).
 * Formules Epley et Brzycki. */

const OneRM = (() => {

  // Estime le 1RM à partir d'un poids et d'un nombre de reps.
  function estimate(weight, reps, formula = 'epley') {
    weight = Number(weight); reps = Number(reps);
    if (!weight || !reps || reps < 1) return null;
    if (reps === 1) return weight;
    if (formula === 'brzycki') {
      // Brzycki : 1RM = poids × 36 / (37 - reps). Valide jusqu'à ~10 reps.
      if (reps >= 37) return null;
      return weight * 36 / (37 - reps);
    }
    // Epley : 1RM = poids × (1 + reps/30)
    return weight * (1 + reps / 30);
  }

  // Reps indicatives attendues à chaque % du 1RM (approximation courante).
  const REPS_AT_PCT = {
    100: 1, 95: 2, 90: 4, 85: 6, 80: 8, 75: 10, 70: 12, 65: 16, 60: 20, 55: 24, 50: 30
  };

  // Construit le tableau de montée en charge de 50% à 100% par pas de 5%.
  function loadingTable(oneRM, step = 5) {
    oneRM = Number(oneRM);
    if (!oneRM) return [];
    const rows = [];
    for (let pct = 100; pct >= 50; pct -= step) {
      rows.push({
        pct,
        weight: round(oneRM * pct / 100),
        reps: REPS_AT_PCT[pct] || '—'
      });
    }
    return rows;
  }

  // Arrondi à 0,5 kg (incrément réaliste en salle).
  function round(x) {
    return Math.round(x * 2) / 2;
  }

  return { estimate, loadingTable, round };
})();


/* ===== progression ===== */
/* progression.js — Générateur de séries d'échauffement progressives.
 * À partir d'un work set cible (poids + reps), produit une montée en charge :
 * barre à vide → 40% → 60% → 80% → work set. */

const Progression = (() => {

  function warmup(workWeight, workReps, barWeight = 20) {
    workWeight = Number(workWeight);
    workReps = Number(workReps) || 8;
    barWeight = Number(barWeight) || 20;
    if (!workWeight) return [];

    const steps = [];

    // Barre à vide (seulement si la charge de travail dépasse la barre)
    if (workWeight > barWeight) {
      steps.push({ label: 'Barre à vide', weight: barWeight, reps: 10 });
    }

    const pcts = [
      { pct: 40, reps: 8 },
      { pct: 60, reps: 5 },
      { pct: 80, reps: 3 }
    ];

    for (const p of pcts) {
      const w = round(workWeight * p.pct / 100);
      // évite les doublons avec la barre à vide
      if (w > barWeight && w < workWeight) {
        steps.push({ label: p.pct + ' %', weight: w, reps: p.reps });
      }
    }

    steps.push({ label: 'Work set', weight: workWeight, reps: workReps, work: true });
    return steps;
  }

  function round(x) {
    return Math.round(x * 2) / 2; // pas de 0,5 kg
  }

  return { warmup };
})();


/* ===== converter ===== */
/* converter.js — Convertisseur lbs ↔ kg.
 * Utile pour les machines affichées en livres (Pec Deck, Seated Dip Machine). */

const Converter = (() => {
  const LB_PER_KG = 2.2046226218;

  function lbsToKg(lbs) {
    lbs = Number(lbs);
    if (isNaN(lbs)) return null;
    return lbs / LB_PER_KG;
  }

  function kgToLbs(kg) {
    kg = Number(kg);
    if (isNaN(kg)) return null;
    return kg * LB_PER_KG;
  }

  // Arrondi affichage : 1 décimale, et version "salle" arrondie à 0,5
  function round1(x) { return Math.round(x * 10) / 10; }
  function roundGym(x) { return Math.round(x * 2) / 2; }

  return { lbsToKg, kgToLbs, round1, roundGym };
})();


/* ===== plates ===== */
/* plates.js — Calculateur de disques.
 * Charge totale + poids de barre → disques à mettre de CHAQUE côté. */

const Plates = (() => {

  // Décompose le poids par côté en disques disponibles (greedy).
  function compute(totalWeight, barWeight, available) {
    totalWeight = Number(totalWeight);
    barWeight = Number(barWeight) || 20;
    available = (available && available.length ? available : [25, 20, 15, 10, 5, 2.5, 1.25])
      .slice().sort((a, b) => b - a);

    if (isNaN(totalWeight)) return { ok: false, reason: 'Charge invalide' };
    if (totalWeight < barWeight) return { ok: false, reason: 'Charge inférieure au poids de la barre' };

    let perSide = (totalWeight - barWeight) / 2;
    const result = [];
    let remainder = perSide;

    for (const plate of available) {
      let count = Math.floor(remainder / plate + 1e-9);
      if (count > 0) {
        result.push({ plate, count });
        remainder = +(remainder - count * plate).toFixed(4);
      }
    }

    return {
      ok: true,
      perSide,
      plates: result,
      leftover: remainder > 0.001 ? remainder : 0
    };
  }

  return { compute };
})();


/* ===== parsers ===== */
/* parsers.js — Lecture/parsing des logs de séances dans 3 formats.
 * Une fonction par format. Chacune renvoie :
 *   { sessions: [...], unrecognized: [...lignes brutes...], counts: {sessions, exercises} }
 *
 * Modèle de séance normalisé :
 *   { date: 'YYYY-MM-DD', name: 'Push A', exercises: [
 *       { name, sets, reps, weight, rpe, notes }
 *   ]}
 */

const Parsers = (() => {

  /* ---------- Utilitaires ---------- */

  // Normalise une date détectée en ISO YYYY-MM-DD. Gère JJ/MM/AAAA, AAAA-MM-JJ, etc.
  function normalizeDate(raw) {
    if (!raw) return null;
    raw = raw.trim();
    let m;
    // AAAA-MM-JJ ou AAAA/MM/JJ
    if ((m = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/))) {
      return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
    }
    // JJ/MM/AAAA ou JJ-MM-AAAA
    if ((m = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/))) {
      return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    }
    // JJ/MM/AA
    if ((m = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/))) {
      return `20${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    }
    return raw; // laissé tel quel si non reconnu
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  // "4 x 6" / "4x6" / "4×6" → { sets:4, reps:6 }. Tolère "12" seul (reps).
  function parseSetsReps(raw) {
    if (raw == null) return { sets: null, reps: null };
    raw = String(raw).toLowerCase().replace(/×/g, 'x').trim();
    let m = raw.match(/(\d+)\s*x\s*(\d+)/);
    if (m) return { sets: +m[1], reps: +m[2] };
    m = raw.match(/^(\d+)$/);
    if (m) return { sets: null, reps: +m[1] };
    return { sets: null, reps: null };
  }

  function num(x) {
    if (x == null) return null;
    const n = parseFloat(String(x).replace(',', '.').replace(/[^\d.\-]/g, ''));
    return isNaN(n) ? null : n;
  }

  function counts(sessions) {
    return {
      sessions: sessions.length,
      exercises: sessions.reduce((a, s) => a + (s.exercises ? s.exercises.length : 0), 0)
    };
  }

  /* ---------- 1) TEXTE (format Lift Log) ----------
   * En-tête de séance : [DATE] — Nom de séance   (le tiret peut être — ou -)
   * Lignes exercice   : Exercice | Sets x Reps | Poids | RPE | Notes
   * Ignore : lignes vides, séparateurs (----), en-têtes de colonnes, blocs template. */
  function parseText(text) {
    const lines = String(text).split(/\r?\n/);
    const sessions = [];
    const unrecognized = [];
    let current = null;

    // Détecte une ligne d'en-tête de séance : commence par une date.
    const headerRe = /^\s*\[?(\d{1,4}[-/]\d{1,2}[-/]\d{2,4})\]?\s*[—–-]+\s*(.+?)\s*$/;

    for (let rawLine of lines) {
      const line = rawLine.replace(/\u00a0/g, ' ').trimEnd();
      const trimmed = line.trim();

      if (!trimmed) continue;                                  // ligne vide
      if (/^[-=_*\s]+$/.test(trimmed)) continue;               // séparateur ---- / ====
      // En-tête de colonnes type "Exercise | Sets x Reps | Weight | RPE | Notes"
      if (/exercice|exercise/i.test(trimmed) && /\|/.test(trimmed) &&
          /(rpe|poids|weight|reps)/i.test(trimmed)) continue;
      // Lignes de template / méta connues
      if (/^(week\s|bloc|block|session notes|notes? de séance|format|how to|athlete|log start)/i.test(trimmed)) continue;
      if (/\[(exercise name|exercice|name|other)\]/i.test(trimmed)) continue;

      // En-tête de séance ?
      const h = trimmed.match(headerRe);
      if (h) {
        if (current && current.exercises.length) sessions.push(current);
        current = { date: normalizeDate(h[1]), name: h[2].trim(), exercises: [] };
        continue;
      }

      // Ligne d'exercice : doit contenir des "|"
      if (trimmed.includes('|')) {
        const cells = trimmed.split('|').map(c => c.trim());
        // au moins nom + (sets x reps | poids)
        const name = cells[0];
        if (!name) { unrecognized.push(rawLine); continue; }
        // ignore les lignes de gabarit ([Exercise name])
        if (/^\[.*\]$/.test(name)) continue;

        const sr = parseSetsReps(cells[1]);
        const ex = {
          name,
          sets: sr.sets,
          reps: sr.reps,
          weight: num(cells[2]),
          rpe: num(cells[3]),
          notes: cells[4] || ''
        };
        if (!current) {
          // exercice sans séance : on crée une séance "sans date"
          current = { date: null, name: 'Séance importée', exercises: [] };
        }
        // au moins une donnée chiffrée sinon non reconnu
        if (ex.reps == null && ex.weight == null && ex.sets == null) {
          unrecognized.push(rawLine);
        } else {
          current.exercises.push(ex);
        }
        continue;
      }

      // Rien ne matche
      unrecognized.push(rawLine);
    }

    if (current && current.exercises.length) sessions.push(current);
    return { sessions, unrecognized, counts: counts(sessions) };
  }

  /* ---------- 2) CSV (export type Hevy) ----------
   * Mapping de colonnes flexible : on cherche les colonnes par mots-clés.
   * Regroupe les lignes par (date + titre de séance) en séances. */
  function parseCSV(text) {
    const rows = csvToRows(String(text));
    const unrecognized = [];
    if (!rows.length) return { sessions: [], unrecognized, counts: { sessions: 0, exercises: 0 } };

    const header = rows[0].map(h => h.toLowerCase().trim());
    const idx = mapColumns(header);

    // Si aucune colonne exercice trouvée → fichier non reconnu
    if (idx.exercise === -1) {
      return { sessions: [], unrecognized: rows.map(r => r.join(',')),
               counts: { sessions: 0, exercises: 0 } };
    }

    const groups = new Map(); // clé séance → session
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.every(c => !c || !c.trim())) continue; // ligne vide
      const exName = get(r, idx.exercise);
      if (!exName) { unrecognized.push(r.join(',')); continue; }

      const date = normalizeDate(get(r, idx.date) || '');
      const title = get(r, idx.title) || 'Séance';
      const key = `${date || '??'}|${title}`;

      if (!groups.has(key)) groups.set(key, { date, name: title, exercises: [] });
      groups.get(key).exercises.push({
        name: exName,
        sets: num(get(r, idx.sets)),
        reps: num(get(r, idx.reps)),
        weight: num(get(r, idx.weight)),
        rpe: num(get(r, idx.rpe)),
        notes: get(r, idx.notes) || ''
      });
    }

    const sessions = [...groups.values()];
    // collapse des séries identiques en compte de sets (Hevy = 1 ligne / série)
    for (const s of sessions) collapseSets(s);
    sessions.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return { sessions, unrecognized, counts: counts(sessions) };
  }

  // Regroupe les séries identiques (Hevy logue une ligne par série) :
  // mêmes nom+reps+poids consécutifs → un exercice avec sets = nb de lignes.
  function collapseSets(session) {
    const out = [];
    for (const ex of session.exercises) {
      const last = out[out.length - 1];
      if (last && last.name === ex.name && last.reps === ex.reps &&
          last.weight === ex.weight && last.rpe === ex.rpe &&
          (ex.sets == null || ex.sets === 1)) {
        last.sets = (last.sets || 1) + 1;
      } else {
        out.push(Object.assign({}, ex, { sets: ex.sets || 1 }));
      }
    }
    session.exercises = out;
  }

  function mapColumns(header) {
    const find = (...keys) => header.findIndex(h => keys.some(k => h.includes(k)));
    return {
      date: find('date', 'start_time', 'début'),
      title: find('title', 'workout', 'séance', 'nom de séance', 'workout_name'),
      exercise: find('exercise', 'exercice', 'exercise_title', 'exercise name'),
      sets: find('set_order', 'sets', 'séries', 'set'),
      reps: find('reps', 'rep', 'répétitions'),
      weight: find('weight_kg', 'weight', 'poids', 'charge', 'kg'),
      rpe: find('rpe', 'rir'),
      notes: find('notes', 'note', 'remarque')
    };
  }

  function get(row, i) { return (i >= 0 && i < row.length) ? row[i].trim() : ''; }

  // Parseur CSV minimal mais robuste (guillemets, virgules échappées, ; ou ,).
  function csvToRows(text) {
    // détecte le séparateur dominant sur la 1ère ligne
    const firstLine = text.split(/\r?\n/)[0] || '';
    const sep = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === sep) { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (c === '\r') { /* ignore */ }
        else field += c;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.length);
  }

  /* ---------- 3) JSON (format structuré) ----------
   * Accepte :
   *   { sessions: [ {date, name, exercises:[...]} ] }
   *   ou directement un tableau de séances. */
  function parseJSON(text) {
    let data;
    try {
      data = typeof text === 'string' ? JSON.parse(text) : text;
    } catch (e) {
      return { sessions: [], unrecognized: ['JSON invalide : ' + e.message],
               counts: { sessions: 0, exercises: 0 } };
    }
    let raw = Array.isArray(data) ? data : (data.sessions || []);
    const unrecognized = [];
    const sessions = [];
    for (const s of raw) {
      if (!s || !Array.isArray(s.exercises)) { unrecognized.push(JSON.stringify(s)); continue; }
      sessions.push({
        date: normalizeDate(s.date || ''),
        name: s.name || s.title || 'Séance',
        exercises: s.exercises.map(e => ({
          name: e.name || e.exercise || '?',
          sets: num(e.sets),
          reps: num(e.reps),
          weight: num(e.weight ?? e.weight_kg ?? e.poids),
          rpe: num(e.rpe),
          notes: e.notes || ''
        }))
      });
    }
    sessions.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    return { sessions, unrecognized, counts: counts(sessions) };
  }

  /* ---------- Détection auto du format ---------- */
  function autoDetect(text) {
    const t = String(text).trim();
    if (!t) return 'text';
    if (t[0] === '{' || t[0] === '[') return 'json';
    // CSV : 1ère ligne avec séparateurs et mots-clés de colonnes
    const first = t.split(/\r?\n/)[0].toLowerCase();
    if ((first.includes(',') || first.includes(';')) &&
        /(exercise|exercice|reps|weight|poids|date|title)/.test(first)) return 'csv';
    return 'text';
  }

  function parse(text, format) {
    format = format || autoDetect(text);
    if (format === 'json') return parseJSON(text);
    if (format === 'csv') return parseCSV(text);
    return parseText(text);
  }

  return { parseText, parseCSV, parseJSON, parse, autoDetect, normalizeDate };
})();


/* ===== volume ===== */
/* volume.js — Calcul du volume (tonnage = sets × reps × poids).
 * Par séance, par exercice, et agrégation hebdomadaire. */

const Volume = (() => {

  function exerciseTonnage(ex) {
    const sets = Number(ex.sets) || 1;
    const reps = Number(ex.reps) || 0;
    const weight = Number(ex.weight) || 0;
    return sets * reps * weight;
  }

  function sessionTonnage(session) {
    return (session.exercises || []).reduce((a, e) => a + exerciseTonnage(e), 0);
  }

  // Numéro de semaine ISO (année-Wnn) à partir d'une date ISO.
  function isoWeekKey(dateStr) {
    if (!dateStr) return 'sans-date';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d)) return 'sans-date';
    const target = new Date(d.valueOf());
    const dayNr = (d.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const week = 1 + Math.ceil((firstThursday - target) / 604800000);
    return `${d.getFullYear()}-S${String(week).padStart(2, '0')}`;
  }

  // Volume hebdomadaire total sur toutes les séances.
  function weeklyVolume(sessions) {
    const map = new Map();
    for (const s of sessions) {
      const key = isoWeekKey(s.date);
      map.set(key, (map.get(key) || 0) + sessionTonnage(s));
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, tonnage]) => ({ week, tonnage: Math.round(tonnage) }));
  }

  // Volume par séance (chronologique).
  function perSession(sessions) {
    return sessions
      .slice()
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      .map(s => ({ date: s.date, name: s.name, tonnage: Math.round(sessionTonnage(s)) }));
  }

  return { exerciseTonnage, sessionTonnage, weeklyVolume, perSession, isoWeekKey };
})();


/* ===== pr ===== */
/* pr.js — Tracker de records (PR) automatique.
 * Détecte, par exercice : meilleure charge, meilleur volume sur une série,
 * et meilleur 1RM estimé. Marque chaque set qui bat un record. */

const PR = (() => {

  // Aplatit toutes les séances en une liste de "sets" datés.
  function flattenSets(sessions) {
    const sets = [];
    for (const s of sessions) {
      for (const ex of (s.exercises || [])) {
        sets.push({
          date: s.date,
          session: s.name,
          name: ex.name,
          reps: Number(ex.reps) || 0,
          weight: Number(ex.weight) || 0,
          rpe: ex.rpe
        });
      }
    }
    return sets.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  // Records courants par exercice.
  function records(sessions) {
    const sets = flattenSets(sessions);
    const byEx = new Map();

    for (const s of sets) {
      if (!s.name) continue;
      if (!byEx.has(s.name)) {
        byEx.set(s.name, {
          name: s.name,
          maxWeight: { weight: 0, date: null },
          maxEst1RM: { value: 0, date: null, weight: 0, reps: 0 },
          maxSetVolume: { value: 0, date: null }
        });
      }
      const rec = byEx.get(s.name);

      if (s.weight > rec.maxWeight.weight) {
        rec.maxWeight = { weight: s.weight, date: s.date };
      }
      const est = OneRM.estimate(s.weight, s.reps, Storage.getSettings().formula);
      if (est && est > rec.maxEst1RM.value) {
        rec.maxEst1RM = { value: OneRM.round(est), date: s.date, weight: s.weight, reps: s.reps };
      }
      const vol = s.weight * s.reps;
      if (vol > rec.maxSetVolume.value) {
        rec.maxSetVolume = { value: Math.round(vol), date: s.date };
      }
    }
    return [...byEx.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Liste chronologique des sets qui ont battu un record de charge (pour mise en évidence).
  function prTimeline(sessions, exerciseName) {
    const sets = flattenSets(sessions).filter(s => s.name === exerciseName);
    let best = 0;
    const hits = [];
    for (const s of sets) {
      if (s.weight > best) {
        best = s.weight;
        hits.push({ date: s.date, weight: s.weight, reps: s.reps });
      }
    }
    return hits;
  }

  return { records, prTimeline, flattenSets };
})();


/* ===== tdee ===== */
/* tdee.js — Calculateur de TDEE (Mifflin-St Jeor) + déficit cible.
 * Reco déficit léger pour recomposition corporelle. */

const TDEE = (() => {

  const ACTIVITY = {
    sedentary:   { mult: 1.2,   label: 'Sédentaire (peu/pas de sport)' },
    light:       { mult: 1.375, label: 'Léger (1-3 séances/sem)' },
    moderate:    { mult: 1.55,  label: 'Modéré (3-5 séances/sem)' },
    active:      { mult: 1.725, label: 'Actif (6-7 séances/sem)' },
    very_active: { mult: 1.9,   label: 'Très actif (travail physique + sport)' }
  };

  // BMR Mifflin-St Jeor. sex: 'male' | 'female'.
  function bmr({ sex, weight, height, age }) {
    weight = Number(weight); height = Number(height); age = Number(age);
    if (!weight || !height || !age) return null;
    const base = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'female' ? base - 161 : base + 5;
  }

  function compute({ sex, weight, height, age, activity }) {
    const b = bmr({ sex, weight, height, age });
    if (b == null) return null;
    const act = ACTIVITY[activity] || ACTIVITY.moderate;
    const maintenance = b * act.mult;

    // Déficit léger recommandé pour recomp : ~15 % (≈ 300-500 kcal selon gabarit).
    const lightDeficit = maintenance * 0.85;
    const moderateDeficit = maintenance * 0.80;

    return {
      bmr: Math.round(b),
      maintenance: Math.round(maintenance),
      lightDeficit: Math.round(lightDeficit),
      moderateDeficit: Math.round(moderateDeficit),
      recommendation: Math.round(lightDeficit),
      // protéines recommandées : ~2 g/kg en déficit pour préserver le muscle
      proteinG: Math.round(weight * 2)
    };
  }

  return { compute, bmr, ACTIVITY };
})();


/* ===== rpe ===== */
/* rpe.js — Conversion RPE ↔ RIR + estimation de charge à un RPE cible.
 * Basé sur la table RPE/% (Helms/RTS) reps-en-réserve. */

const RPE = (() => {

  // Table RPE → % du 1RM selon le nombre de reps effectuées.
  // Lignes = reps (1..12), colonnes = RPE (10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6).
  const RPE_COLS = [10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6];
  const TABLE = {
    1:  [100, 97.8, 95.5, 93.9, 92.2, 90.7, 89.2, 87.8, 86.3],
    2:  [95.5, 93.9, 92.2, 90.7, 89.2, 87.8, 86.3, 85, 83.7],
    3:  [92.2, 90.7, 89.2, 87.8, 86.3, 85, 83.7, 82.4, 81.1],
    4:  [89.2, 87.8, 86.3, 85, 83.7, 82.4, 81.1, 79.9, 78.6],
    5:  [86.3, 85, 83.7, 82.4, 81.1, 79.9, 78.6, 77.4, 76.2],
    6:  [83.7, 82.4, 81.1, 79.9, 78.6, 77.4, 76.2, 75.1, 73.9],
    7:  [81.1, 79.9, 78.6, 77.4, 76.2, 75.1, 73.9, 72.3, 70.7],
    8:  [78.6, 77.4, 76.2, 75.1, 73.9, 72.3, 70.7, 69.4, 68],
    9:  [76.2, 75.1, 73.9, 72.3, 70.7, 69.4, 68, 66.7, 65.3],
    10: [73.9, 72.3, 70.7, 69.4, 68, 66.7, 65.3, 64, 62.6],
    11: [70.7, 69.4, 68, 66.7, 65.3, 64, 62.6, 61.3, 60],
    12: [68, 66.7, 65.3, 64, 62.6, 61.3, 60, 58.7, 57.4]
  };

  function rpeToRir(rpe) {
    rpe = Number(rpe);
    if (isNaN(rpe)) return null;
    return Math.max(0, 10 - rpe);
  }
  function rirToRpe(rir) {
    rir = Number(rir);
    if (isNaN(rir)) return null;
    return Math.max(0, 10 - rir);
  }

  function pctFor(reps, rpe) {
    reps = Math.round(Number(reps));
    if (reps < 1) return null;
    if (reps > 12) reps = 12;
    const colIdx = RPE_COLS.indexOf(Number(rpe));
    if (colIdx === -1) return null;
    return TABLE[reps][colIdx];
  }

  // Estime la charge à un RPE/reps cible à partir d'un set de référence (poids, reps, rpe).
  function targetLoad(refWeight, refReps, refRpe, targetReps, targetRpe) {
    const pctRef = pctFor(refReps, refRpe);
    const pctTarget = pctFor(targetReps, targetRpe);
    if (!pctRef || !pctTarget) return null;
    // 1RM implicite via la référence, puis charge cible
    const implied1RM = Number(refWeight) / (pctRef / 100);
    const load = implied1RM * (pctTarget / 100);
    return Math.round(load * 2) / 2; // pas de 0,5 kg
  }

  return { rpeToRir, rirToRpe, pctFor, targetLoad, RPE_COLS };
})();

/* exercise-db.js — Base d'exercices + moteur de détection.
 * Rattache les noms libres des logs aux exercices canoniques via alias + similarité. */
const ExerciseDB = (() => {
  const GROUPS = ["quads", "posterior", "hips", "chest", "shoulders", "back_horizontal", "back_vertical", "arms", "core", "calves"];
  const EXERCISES = [{"id": "back_squat", "group": "quads", "fr": "Squat barre", "aliases": ["barbell back squat", "back squat", "squat", "squat barre"]}, {"id": "squat_machine", "group": "quads", "fr": "Squat machine", "aliases": ["squat machine", "machine squat", "panatta squat"]}, {"id": "front_squat", "group": "quads", "fr": "Front squat", "aliases": ["front squat", "barbell front squat", "squat avant"]}, {"id": "safety_bar_squat", "group": "quads", "fr": "Safety bar squat", "aliases": ["safety bar squat", "ssb squat"]}, {"id": "hack_squat", "group": "quads", "fr": "Hack squat", "aliases": ["hack squat", "hack squat machine", "watson hack"]}, {"id": "leg_press", "group": "quads", "fr": "Presse à cuisses", "aliases": ["leg press", "presse", "presse cuisses", "hammer leg press"]}, {"id": "bulgarian_split", "group": "quads", "fr": "Fentes bulgares", "aliases": ["bulgarian split squat", "split squat bulgare", "fente bulgare"]}, {"id": "lunges", "group": "quads", "fr": "Fentes", "aliases": ["lunges", "lunge", "fentes", "fente"]}, {"id": "step_ups", "group": "quads", "fr": "Step ups", "aliases": ["step ups", "step up", "montées banc"]}, {"id": "goblet_squat", "group": "quads", "fr": "Goblet squat", "aliases": ["goblet squat"]}, {"id": "leg_extension", "group": "quads", "fr": "Leg extension", "aliases": ["leg extension", "extension jambes", "leg ext"]}, {"id": "pendulum_squat", "group": "quads", "fr": "Pendulum squat", "aliases": ["pendulum squat", "atlantis pendulum", "squat pendulaire"]}, {"id": "deadlift", "group": "posterior", "fr": "Soulevé de terre", "aliases": ["deadlift", "conventional deadlift", "soulevé de terre", "sdt"]}, {"id": "sumo_deadlift", "group": "posterior", "fr": "Soulevé sumo", "aliases": ["sumo deadlift", "sdt sumo"]}, {"id": "rdl_smith", "group": "posterior", "fr": "RDL Smith", "aliases": ["romanian deadlift smith", "rdl smith", "romanian deadlift (smith)", "soulevé roumain smith"]}, {"id": "rdl_barbell", "group": "posterior", "fr": "RDL barre", "aliases": ["romanian deadlift barbell", "rdl barbell", "romanian deadlift (barbell)", "soulevé roumain"]}, {"id": "rdl_machine", "group": "posterior", "fr": "RDL machine", "aliases": ["romanian deadlift machine", "rdl machine", "romanian deadlift (machine)", "panatta rdl"]}, {"id": "stiff_leg_dl", "group": "posterior", "fr": "Stiff leg deadlift", "aliases": ["stiff leg deadlift", "jambes tendues"]}, {"id": "hip_thrust", "group": "posterior", "fr": "Hip thrust", "aliases": ["hip thrust", "hip thrust barbell", "hip thrust machine", "nautilus hip thrust"]}, {"id": "glute_bridge", "group": "posterior", "fr": "Glute bridge", "aliases": ["glute bridge", "pont fessier"]}, {"id": "leg_curl_lying", "group": "posterior", "fr": "Leg curl allongé", "aliases": ["leg curl lying", "lying leg curl", "leg curl allongé"]}, {"id": "leg_curl_seated", "group": "posterior", "fr": "Leg curl assis", "aliases": ["leg curl seated", "seated leg curl", "leg curl assis", "leg curl"]}, {"id": "nordic_curl", "group": "posterior", "fr": "Nordic curl", "aliases": ["nordic curl", "nordique"]}, {"id": "good_morning", "group": "posterior", "fr": "Good morning", "aliases": ["good morning"]}, {"id": "pull_through", "group": "posterior", "fr": "Cable pull through", "aliases": ["cable pull through", "pull through"]}, {"id": "back_extension", "group": "posterior", "fr": "Back extension", "aliases": ["back extension", "extension lombaire", "booty builder back", "hyperextension"]}, {"id": "hip_adduction", "group": "hips", "fr": "Adduction hanches", "aliases": ["hip adduction", "adduction", "adducteurs"]}, {"id": "hip_abduction", "group": "hips", "fr": "Abduction hanches", "aliases": ["hip abduction", "abduction", "abducteurs"]}, {"id": "bench_press", "group": "chest", "fr": "Développé couché", "aliases": ["barbell bench press", "bench press", "développé couché", "dc"]}, {"id": "db_bench", "group": "chest", "fr": "Développé haltères", "aliases": ["dumbbell bench press", "db bench", "développé haltères"]}, {"id": "bench_machine", "group": "chest", "fr": "Développé machine", "aliases": ["bench press machine", "machine chest press", "développé machine", "chest press"]}, {"id": "incline_bb", "group": "chest", "fr": "Incliné barre", "aliases": ["incline barbell press", "incline bench press", "développé incliné", "incliné barre"]}, {"id": "incline_db", "group": "chest", "fr": "Incliné haltères", "aliases": ["incline dumbbell press", "incliné haltères"]}, {"id": "incline_machine", "group": "chest", "fr": "Incliné machine", "aliases": ["incline bench press machine", "incline machine", "incliné machine"]}, {"id": "decline_press", "group": "chest", "fr": "Décliné", "aliases": ["decline press", "décliné"]}, {"id": "cable_fly", "group": "chest", "fr": "Écarté poulie", "aliases": ["cable fly", "écarté poulie", "écarté câble"]}, {"id": "db_fly", "group": "chest", "fr": "Écarté haltères", "aliases": ["dumbbell fly", "écarté haltères"]}, {"id": "pec_deck", "group": "chest", "fr": "Pec deck", "aliases": ["pec deck", "pec dec", "butterfly", "peck deck", "papillon"]}, {"id": "ohp", "group": "shoulders", "fr": "Développé militaire", "aliases": ["barbell ohp", "overhead press", "développé militaire", "ohp"]}, {"id": "db_ohp", "group": "shoulders", "fr": "Développé épaules haltères", "aliases": ["dumbbell ohp", "db shoulder press", "développé épaules haltères"]}, {"id": "arnold_press", "group": "shoulders", "fr": "Arnold press", "aliases": ["arnold press"]}, {"id": "machine_press_shoulder", "group": "shoulders", "fr": "Développé épaules machine", "aliases": ["seated machine press", "seated shoulder press", "machine shoulder press", "développé épaules machine"]}, {"id": "landmine_press", "group": "shoulders", "fr": "Landmine press", "aliases": ["landmine press"]}, {"id": "lateral_db", "group": "shoulders", "fr": "Élévations latérales haltères", "aliases": ["lateral raise db", "lateral raise (db)", "élévations latérales", "élévation latérale haltères"]}, {"id": "lateral_cable", "group": "shoulders", "fr": "Élévations latérales poulie", "aliases": ["lateral raise cable", "lateral raise (cable)", "élévations latérales poulie"]}, {"id": "lateral_machine", "group": "shoulders", "fr": "Élévations latérales machine", "aliases": ["lateral raise machine", "lateral raise (machine)", "élévations latérales machine"]}, {"id": "rear_delt_db", "group": "shoulders", "fr": "Oiseau haltères", "aliases": ["rear delt fly db", "oiseau haltères"]}, {"id": "rear_delt_machine", "group": "shoulders", "fr": "Oiseau machine", "aliases": ["rear delt fly machine", "rear delt fly (machine)", "oiseau machine", "reverse pec deck"]}, {"id": "face_pull", "group": "shoulders", "fr": "Face pull", "aliases": ["face pull", "tirage visage"]}, {"id": "bb_row", "group": "back_horizontal", "fr": "Rowing barre", "aliases": ["barbell bent over row", "bent over row", "rowing barre", "rowing"]}, {"id": "db_row", "group": "back_horizontal", "fr": "Rowing haltère", "aliases": ["dumbbell row", "rowing haltère"]}, {"id": "cable_row", "group": "back_horizontal", "fr": "Rowing poulie assis", "aliases": ["cable row seated", "seated cable row", "rowing poulie", "tirage horizontal"]}, {"id": "machine_row", "group": "back_horizontal", "fr": "Rowing machine", "aliases": ["machine row", "rowing machine"]}, {"id": "chest_supported_row", "group": "back_horizontal", "fr": "Rowing buste appuyé", "aliases": ["chest supported row", "rowing buste appuyé"]}, {"id": "csr_uni", "group": "back_horizontal", "fr": "Rowing buste appuyé unilatéral", "aliases": ["chest supported row unilateral", "rowing unilatéral"]}, {"id": "tbar_row", "group": "back_horizontal", "fr": "T-bar row", "aliases": ["chest supported t-bar row", "t-bar row", "tbar row"]}, {"id": "meadows_row", "group": "back_horizontal", "fr": "Meadows row", "aliases": ["meadows row"]}, {"id": "pendlay_row", "group": "back_horizontal", "fr": "Pendlay row", "aliases": ["pendlay row"]}, {"id": "pull_up", "group": "back_vertical", "fr": "Tractions", "aliases": ["pull up", "pull-up", "tractions", "traction"]}, {"id": "weighted_pull_up", "group": "back_vertical", "fr": "Tractions lestées", "aliases": ["weighted pull up", "tractions lestées"]}, {"id": "chin_up", "group": "back_vertical", "fr": "Tractions supination", "aliases": ["chin up", "tractions supination"]}, {"id": "lat_pulldown", "group": "back_vertical", "fr": "Tirage vertical", "aliases": ["lat pulldown", "lat pulldown bar", "lat pulldown machine", "lat pulldown (machine)", "tirage vertical", "tirage nuque"]}, {"id": "lat_pulldown_neutral", "group": "back_vertical", "fr": "Tirage vertical prise neutre", "aliases": ["lat pulldown neutral", "tirage prise neutre"]}, {"id": "single_arm_pulldown", "group": "back_vertical", "fr": "Tirage vertical unilatéral", "aliases": ["single arm pulldown", "tirage unilatéral"]}, {"id": "straight_arm_pulldown", "group": "back_vertical", "fr": "Pull over poulie bras tendus", "aliases": ["straight arm pulldown", "bras tendus poulie"]}, {"id": "pullover_cable", "group": "back_vertical", "fr": "Pull over poulie", "aliases": ["pullover cable", "pull over poulie"]}, {"id": "pullover_machine", "group": "back_vertical", "fr": "Pull over machine", "aliases": ["pullover machine", "pull over machine"]}, {"id": "iso_pulldown", "group": "back_vertical", "fr": "Tirage iso-latéral", "aliases": ["iso-lateral front pulldown", "iso lateral pulldown", "tirage iso"]}, {"id": "iso_pulldown_uni", "group": "back_vertical", "fr": "Tirage iso-latéral unilatéral", "aliases": ["iso-lateral front pulldown unilateral", "iso lateral unilatéral"]}, {"id": "barbell_curl", "group": "arms", "fr": "Curl barre", "aliases": ["barbell curl", "curl barre"]}, {"id": "db_curl", "group": "arms", "fr": "Curl haltères", "aliases": ["dumbbell curl", "curl haltères"]}, {"id": "incline_db_curl", "group": "arms", "fr": "Curl incliné", "aliases": ["incline dumbbell curl", "curl incliné"]}, {"id": "incline_hammer", "group": "arms", "fr": "Curl marteau incliné", "aliases": ["incline hammer curl", "marteau incliné"]}, {"id": "cable_curl", "group": "arms", "fr": "Curl poulie", "aliases": ["cable curl", "curl poulie"]}, {"id": "hammer_curl", "group": "arms", "fr": "Curl marteau", "aliases": ["hammer curl", "curl marteau"]}, {"id": "preacher_curl", "group": "arms", "fr": "Curl pupitre", "aliases": ["preacher curl", "curl pupitre", "larry scott"]}, {"id": "close_grip_bench", "group": "arms", "fr": "Développé serré", "aliases": ["close grip bench press", "développé serré"]}, {"id": "tricep_pushdown", "group": "arms", "fr": "Extension triceps poulie", "aliases": ["tricep pushdown", "tricep pushdown cable", "extension triceps poulie", "pushdown"]}, {"id": "oh_tricep_cable", "group": "arms", "fr": "Extension triceps nuque poulie", "aliases": ["overhead tricep extension cable", "triceps nuque poulie"]}, {"id": "oh_tricep_machine", "group": "arms", "fr": "Extension triceps machine", "aliases": ["overhead tricep extension machine", "triceps machine"]}, {"id": "skull_crushers", "group": "arms", "fr": "Barre au front", "aliases": ["skull crushers", "barre au front"]}, {"id": "dips", "group": "arms", "fr": "Dips", "aliases": ["dips", "dips tricep", "dip", "seated dip machine"]}, {"id": "plank", "group": "core", "fr": "Gainage", "aliases": ["plank", "gainage", "planche"]}, {"id": "cable_crunch", "group": "core", "fr": "Crunch poulie", "aliases": ["cable crunch", "crunch poulie"]}, {"id": "hanging_leg_raise", "group": "core", "fr": "Relevé de jambes suspendu", "aliases": ["hanging leg raise", "relevé jambes suspendu", "leg raise"]}, {"id": "ab_wheel", "group": "core", "fr": "Roue abdominale", "aliases": ["ab wheel", "roue abdominale"]}, {"id": "pallof_press", "group": "core", "fr": "Pallof press", "aliases": ["pallof press"]}, {"id": "landmine_rotation", "group": "core", "fr": "Rotation landmine", "aliases": ["landmine rotation", "rotation landmine"]}, {"id": "decline_crunch", "group": "core", "fr": "Crunch décliné", "aliases": ["decline crunch", "crunch décliné", "crunch machine"]}, {"id": "standing_calf", "group": "calves", "fr": "Mollets debout", "aliases": ["standing calf raise", "mollets debout"]}, {"id": "seated_calf", "group": "calves", "fr": "Mollets assis", "aliases": ["seated calf raise", "mollets assis"]}, {"id": "leg_press_calf", "group": "calves", "fr": "Mollets à la presse", "aliases": ["leg press calf raise", "mollets presse"]}, {"id": "horizontal_calf", "group": "calves", "fr": "Mollets horizontaux", "aliases": ["horizontal calf raise", "mollets horizontaux"]}];

  // index alias -> id (normalisés)
  const aliasIndex = new Map();
  for (const ex of EXERCISES) {
    for (const a of ex.aliases) aliasIndex.set(norm(a), ex.id);
    aliasIndex.set(norm(ex.fr), ex.id);
  }

  function norm(s){
    return String(s||'').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')   // enlève accents
      .replace(/[()\[\].,/-]/g,' ')
      .replace(/\s+/g,' ').trim();
  }

  // distance de similarité simple (Dice sur bigrammes de mots+lettres)
  function bigrams(s){ const t=s.replace(/\s/g,''); const b=[]; for(let i=0;i<t.length-1;i++) b.push(t.slice(i,i+2)); return b; }
  function dice(a,b){
    const A=bigrams(a),B=bigrams(b); if(!A.length||!B.length) return a===b?1:0;
    const m=new Map(); for(const g of A) m.set(g,(m.get(g)||0)+1);
    let inter=0; for(const g of B){ const c=m.get(g); if(c>0){inter++; m.set(g,c-1);} }
    return 2*inter/(A.length+B.length);
  }

  // rattache un nom libre -> {id, name, group, score, exact}
  function match(rawName){
    const n = norm(rawName);
    if(!n) return null;
    if(aliasIndex.has(n)) { const id=aliasIndex.get(n); return res(id,1,true); }
    // sinon, meilleure similarité parmi tous les alias
    let best=null, bestScore=0;
    for(const ex of EXERCISES){
      for(const a of [ex.fr, ...ex.aliases]){
        const s=dice(n, norm(a));
        if(s>bestScore){ bestScore=s; best=ex.id; }
      }
    }
    if(bestScore>=0.62) return res(best,bestScore,false);
    return null; // non reconnu
  }
  function res(id,score,exact){
    const ex=EXERCISES.find(e=>e.id===id);
    return {id, name:ex.fr, group:ex.group, score:Math.round(score*100)/100, exact};
  }

  function byId(id){ return EXERCISES.find(e=>e.id===id)||null; }
  function byGroup(){
    const map={}; for(const g of GROUPS) map[g]=[];
    for(const ex of EXERCISES) map[ex.group].push(ex);
    return map;
  }
  function groups(){ return GROUPS.slice(); }
  function all(){ return EXERCISES.slice(); }

  return { match, byId, byGroup, groups, all, norm };
})();


/* i18n.js — Traductions UI (9 langues) + moteur d'application. */
const I18N = (() => {
  const LANGS = [
    {code:"fr",name:"Français",flag:"🇫🇷",rtl:false},
    {code:"en",name:"English",flag:"🇬🇧",rtl:false},
    {code:"es",name:"Español",flag:"🇪🇸",rtl:false},
    {code:"de",name:"Deutsch",flag:"🇩🇪",rtl:false},
    {code:"pt",name:"Português",flag:"🇵🇹",rtl:false},
    {code:"it",name:"Italiano",flag:"🇮🇹",rtl:false},
    {code:"nl",name:"Nederlands",flag:"🇳🇱",rtl:false},
    {code:"ar",name:"العربية",flag:"🇸🇦",rtl:true},
    {code:"zh",name:"中文",flag:"🇨🇳",rtl:false}
  ];
  const DICT = {"fr": {"macro.title": "Macros & micronutriments", "macro.kcal": "Calories cibles", "macro.weight": "Poids · kg", "macro.goal": "Objectif", "macro.g_recomp": "Recomposition", "macro.g_cut": "Sèche", "macro.g_bulk": "Prise de masse", "macro.g_keto": "Low-carb / keto", "macro.protein": "Protéines", "macro.carbs": "Glucides", "macro.fats": "Lipides", "macro.total": "Total", "macro.fiber": "Fibres", "macro.water": "Eau", "macro.micros": "Micronutriments (AJR)", "macro.micro_note": "Valeurs de référence adultes — indicatives, à ajuster selon profil.", "macro.fill": "Renseigne calories et poids", "m.roadmap": "Programme", "road.eyebrow": "Programme", "road.week": "Semaine", "road.starts_in": "Démarre dans", "road.days": "jours", "road.completed": "Programme terminé ✓", "settings.program": "Programme — date de début", "nav.home": "Accueil", "nav.calc": "Calcul", "nav.session": "Séance", "nav.progress": "Progrès", "nav.nutrition": "Nutrition", "nav.catalog": "Catalogue", "m.onerm": "1RM & table", "m.warmup": "Échauffement", "m.conv": "lbs ↔ kg", "m.plates": "Disques", "m.rpe": "RPE & charge", "m.timer": "Timer de repos", "m.import": "Importer des logs", "m.log": "Mes séances", "m.volume": "Volume", "m.pr": "Records", "m.charts": "Courbes", "dash.ready": "Prêt à", "dash.load": "charger", "dash.sub_empty": "Importe tes logs pour réveiller ton tableau de bord.", "dash.ring": "tonnage / semaine (kg)", "st.sessions": "séances", "st.records": "records", "st.exercises": "exercices suivis", "dash.recent": "Dernières séances", "dash.cta_import": "Importer mes logs", "dash.cta_rest": "Démarrer un repos", "dash.no_session": "Aucune séance pour l'instant.", "b.generate": "Générer", "b.calculate": "Calculer", "b.preview": "Prévisualiser", "b.import": "Importer", "b.save": "Enregistrer", "b.estimate": "Estimer la charge", "cat.title": "Catalogue d'exercices", "cat.tap": "Touche un exercice pour voir ta progression", "cat.logged": "dans tes logs", "prog.title": "Progression", "prog.best": "Meilleure charge", "prog.e1rm": "1RM estimé", "prog.sessions_count": "séances enregistrées", "prog.no_data": "Aucune donnée pour cet exercice.", "muscle_group": "Groupe musculaire", "g.quads": "Quadriceps", "g.posterior": "Chaîne postérieure", "g.hips": "Hanches", "g.chest": "Pectoraux", "g.shoulders": "Épaules", "g.back_horizontal": "Dos (horizontal)", "g.back_vertical": "Dos (vertical)", "g.arms": "Bras", "g.core": "Abdominaux", "g.calves": "Mollets", "settings.lang": "Langue", "settings.theme": "Ambiance"}, "en": {"macro.title": "Macros & micronutrients", "macro.kcal": "Target calories", "macro.weight": "Weight · kg", "macro.goal": "Goal", "macro.g_recomp": "Recomposition", "macro.g_cut": "Cut", "macro.g_bulk": "Bulk", "macro.g_keto": "Low-carb / keto", "macro.protein": "Protein", "macro.carbs": "Carbs", "macro.fats": "Fats", "macro.total": "Total", "macro.fiber": "Fiber", "macro.water": "Water", "macro.micros": "Micronutrients (RDA)", "macro.micro_note": "Adult reference values — indicative, adjust to your profile.", "macro.fill": "Enter calories and weight", "m.roadmap": "Program", "road.eyebrow": "Program", "road.week": "Week", "road.starts_in": "Starts in", "road.days": "days", "road.completed": "Program completed ✓", "settings.program": "Program — start date", "nav.home": "Home", "nav.calc": "Calc", "nav.session": "Session", "nav.progress": "Progress", "nav.nutrition": "Nutrition", "nav.catalog": "Catalog", "m.onerm": "1RM & table", "m.warmup": "Warm-up", "m.conv": "lbs ↔ kg", "m.plates": "Plates", "m.rpe": "RPE & load", "m.timer": "Rest timer", "m.import": "Import logs", "m.log": "My sessions", "m.volume": "Volume", "m.pr": "Records", "m.charts": "Charts", "dash.ready": "Ready to", "dash.load": "load", "dash.sub_empty": "Import your logs to wake up your dashboard.", "dash.ring": "tonnage / week (kg)", "st.sessions": "sessions", "st.records": "records", "st.exercises": "tracked exercises", "dash.recent": "Recent sessions", "dash.cta_import": "Import my logs", "dash.cta_rest": "Start a rest", "dash.no_session": "No sessions yet.", "b.generate": "Generate", "b.calculate": "Calculate", "b.preview": "Preview", "b.import": "Import", "b.save": "Save", "b.estimate": "Estimate load", "cat.title": "Exercise catalog", "cat.tap": "Tap an exercise to see your progress", "cat.logged": "in your logs", "prog.title": "Progression", "prog.best": "Best load", "prog.e1rm": "Est. 1RM", "prog.sessions_count": "logged sessions", "prog.no_data": "No data for this exercise.", "muscle_group": "Muscle group", "g.quads": "Quads", "g.posterior": "Posterior chain", "g.hips": "Hips", "g.chest": "Chest", "g.shoulders": "Shoulders", "g.back_horizontal": "Back (horizontal)", "g.back_vertical": "Back (vertical)", "g.arms": "Arms", "g.core": "Core", "g.calves": "Calves", "settings.lang": "Language", "settings.theme": "Theme"}, "es": {"macro.title": "Macros y micronutrientes", "macro.kcal": "Calorías objetivo", "macro.weight": "Peso · kg", "macro.goal": "Objetivo", "macro.g_recomp": "Recomposición", "macro.g_cut": "Definición", "macro.g_bulk": "Volumen", "macro.g_keto": "Low-carb / keto", "macro.protein": "Proteínas", "macro.carbs": "Carbohidratos", "macro.fats": "Grasas", "macro.total": "Total", "macro.fiber": "Fibra", "macro.water": "Agua", "macro.micros": "Micronutrientes (CDR)", "macro.micro_note": "Valores de referencia adultos — orientativos.", "macro.fill": "Introduce calorías y peso", "m.roadmap": "Programa", "road.eyebrow": "Programa", "road.week": "Semana", "road.starts_in": "Empieza en", "road.days": "días", "road.completed": "Programa completado ✓", "settings.program": "Programa — fecha inicio", "nav.home": "Inicio", "nav.calc": "Cálculo", "nav.session": "Sesión", "nav.progress": "Progreso", "nav.nutrition": "Nutrición", "nav.catalog": "Catálogo", "m.onerm": "1RM y tabla", "m.warmup": "Calentamiento", "m.conv": "lbs ↔ kg", "m.plates": "Discos", "m.rpe": "RPE y carga", "m.timer": "Temporizador", "m.import": "Importar logs", "m.log": "Mis sesiones", "m.volume": "Volumen", "m.pr": "Récords", "m.charts": "Gráficos", "dash.ready": "Listo para", "dash.load": "cargar", "dash.sub_empty": "Importa tus logs para activar tu panel.", "dash.ring": "tonelaje / semana (kg)", "st.sessions": "sesiones", "st.records": "récords", "st.exercises": "ejercicios", "dash.recent": "Últimas sesiones", "dash.cta_import": "Importar logs", "dash.cta_rest": "Iniciar descanso", "dash.no_session": "Sin sesiones aún.", "b.generate": "Generar", "b.calculate": "Calcular", "b.preview": "Previsualizar", "b.import": "Importar", "b.save": "Guardar", "b.estimate": "Estimar carga", "cat.title": "Catálogo de ejercicios", "cat.tap": "Toca un ejercicio para ver tu progreso", "cat.logged": "en tus logs", "prog.title": "Progresión", "prog.best": "Mejor carga", "prog.e1rm": "1RM est.", "prog.sessions_count": "sesiones", "prog.no_data": "Sin datos.", "muscle_group": "Grupo muscular", "g.quads": "Cuádriceps", "g.posterior": "Cadena posterior", "g.hips": "Caderas", "g.chest": "Pecho", "g.shoulders": "Hombros", "g.back_horizontal": "Espalda (horiz.)", "g.back_vertical": "Espalda (vert.)", "g.arms": "Brazos", "g.core": "Core", "g.calves": "Pantorrillas", "settings.lang": "Idioma", "settings.theme": "Tema"}, "de": {"macro.title": "Makros & Mikronährstoffe", "macro.kcal": "Zielkalorien", "macro.weight": "Gewicht · kg", "macro.goal": "Ziel", "macro.g_recomp": "Rekomposition", "macro.g_cut": "Diät", "macro.g_bulk": "Massephase", "macro.g_keto": "Low-Carb / Keto", "macro.protein": "Protein", "macro.carbs": "Kohlenhydrate", "macro.fats": "Fette", "macro.total": "Gesamt", "macro.fiber": "Ballaststoffe", "macro.water": "Wasser", "macro.micros": "Mikronährstoffe (RDA)", "macro.micro_note": "Referenzwerte für Erwachsene — Richtwerte.", "macro.fill": "Kalorien und Gewicht eingeben", "m.roadmap": "Programm", "road.eyebrow": "Programm", "road.week": "Woche", "road.starts_in": "Beginnt in", "road.days": "Tagen", "road.completed": "Programm abgeschlossen ✓", "settings.program": "Programm — Startdatum", "nav.home": "Start", "nav.calc": "Rechnen", "nav.session": "Training", "nav.progress": "Fortschritt", "nav.nutrition": "Ernährung", "nav.catalog": "Katalog", "m.onerm": "1RM & Tabelle", "m.warmup": "Aufwärmen", "m.conv": "lbs ↔ kg", "m.plates": "Scheiben", "m.rpe": "RPE & Last", "m.timer": "Pausentimer", "m.import": "Logs importieren", "m.log": "Meine Sessions", "m.volume": "Volumen", "m.pr": "Rekorde", "m.charts": "Diagramme", "dash.ready": "Bereit zum", "dash.load": "laden", "dash.sub_empty": "Importiere deine Logs für dein Dashboard.", "dash.ring": "Tonnage / Woche (kg)", "st.sessions": "Sessions", "st.records": "Rekorde", "st.exercises": "Übungen", "dash.recent": "Letzte Sessions", "dash.cta_import": "Logs importieren", "dash.cta_rest": "Pause starten", "dash.no_session": "Noch keine Sessions.", "b.generate": "Erzeugen", "b.calculate": "Berechnen", "b.preview": "Vorschau", "b.import": "Importieren", "b.save": "Speichern", "b.estimate": "Last schätzen", "cat.title": "Übungskatalog", "cat.tap": "Übung tippen für Fortschritt", "cat.logged": "in deinen Logs", "prog.title": "Fortschritt", "prog.best": "Beste Last", "prog.e1rm": "Gesch. 1RM", "prog.sessions_count": "Sessions", "prog.no_data": "Keine Daten.", "muscle_group": "Muskelgruppe", "g.quads": "Quadrizeps", "g.posterior": "Hintere Kette", "g.hips": "Hüften", "g.chest": "Brust", "g.shoulders": "Schultern", "g.back_horizontal": "Rücken (horiz.)", "g.back_vertical": "Rücken (vert.)", "g.arms": "Arme", "g.core": "Core", "g.calves": "Waden", "settings.lang": "Sprache", "settings.theme": "Thema"}, "pt": {"macro.title": "Macros e micronutrientes", "macro.kcal": "Calorias alvo", "macro.weight": "Peso · kg", "macro.goal": "Objetivo", "macro.g_recomp": "Recomposição", "macro.g_cut": "Cutting", "macro.g_bulk": "Volume", "macro.g_keto": "Low-carb / keto", "macro.protein": "Proteínas", "macro.carbs": "Carboidratos", "macro.fats": "Gorduras", "macro.total": "Total", "macro.fiber": "Fibras", "macro.water": "Água", "macro.micros": "Micronutrientes (DDR)", "macro.micro_note": "Valores de referência adultos — indicativos.", "macro.fill": "Insira calorias e peso", "m.roadmap": "Programa", "road.eyebrow": "Programa", "road.week": "Semana", "road.starts_in": "Começa em", "road.days": "dias", "road.completed": "Programa concluído ✓", "settings.program": "Programa — data início", "nav.home": "Início", "nav.calc": "Cálculo", "nav.session": "Sessão", "nav.progress": "Progresso", "nav.nutrition": "Nutrição", "nav.catalog": "Catálogo", "m.onerm": "1RM e tabela", "m.warmup": "Aquecimento", "m.conv": "lbs ↔ kg", "m.plates": "Discos", "m.rpe": "RPE e carga", "m.timer": "Temporizador", "m.import": "Importar logs", "m.log": "Minhas sessões", "m.volume": "Volume", "m.pr": "Recordes", "m.charts": "Gráficos", "dash.ready": "Pronto para", "dash.load": "carregar", "dash.sub_empty": "Importe seus logs para ativar o painel.", "dash.ring": "tonelagem / semana (kg)", "st.sessions": "sessões", "st.records": "recordes", "st.exercises": "exercícios", "dash.recent": "Últimas sessões", "dash.cta_import": "Importar logs", "dash.cta_rest": "Iniciar descanso", "dash.no_session": "Nenhuma sessão ainda.", "b.generate": "Gerar", "b.calculate": "Calcular", "b.preview": "Pré-visualizar", "b.import": "Importar", "b.save": "Salvar", "b.estimate": "Estimar carga", "cat.title": "Catálogo de exercícios", "cat.tap": "Toque para ver progresso", "cat.logged": "nos seus logs", "prog.title": "Progressão", "prog.best": "Melhor carga", "prog.e1rm": "1RM est.", "prog.sessions_count": "sessões", "prog.no_data": "Sem dados.", "muscle_group": "Grupo muscular", "g.quads": "Quadríceps", "g.posterior": "Cadeia posterior", "g.hips": "Quadris", "g.chest": "Peito", "g.shoulders": "Ombros", "g.back_horizontal": "Costas (horiz.)", "g.back_vertical": "Costas (vert.)", "g.arms": "Braços", "g.core": "Core", "g.calves": "Panturrilhas", "settings.lang": "Idioma", "settings.theme": "Tema"}, "it": {"macro.title": "Macro e micronutrienti", "macro.kcal": "Calorie obiettivo", "macro.weight": "Peso · kg", "macro.goal": "Obiettivo", "macro.g_recomp": "Ricomposizione", "macro.g_cut": "Definizione", "macro.g_bulk": "Massa", "macro.g_keto": "Low-carb / keto", "macro.protein": "Proteine", "macro.carbs": "Carboidrati", "macro.fats": "Grassi", "macro.total": "Totale", "macro.fiber": "Fibre", "macro.water": "Acqua", "macro.micros": "Micronutrienti (RDA)", "macro.micro_note": "Valori di riferimento adulti — indicativi.", "macro.fill": "Inserisci calorie e peso", "m.roadmap": "Programma", "road.eyebrow": "Programma", "road.week": "Settimana", "road.starts_in": "Inizia tra", "road.days": "giorni", "road.completed": "Programma completato ✓", "settings.program": "Programma — data inizio", "nav.home": "Home", "nav.calc": "Calcolo", "nav.session": "Sessione", "nav.progress": "Progressi", "nav.nutrition": "Nutrizione", "nav.catalog": "Catalogo", "m.onerm": "1RM e tabella", "m.warmup": "Riscaldamento", "m.conv": "lbs ↔ kg", "m.plates": "Dischi", "m.rpe": "RPE e carico", "m.timer": "Timer riposo", "m.import": "Importa log", "m.log": "Le mie sessioni", "m.volume": "Volume", "m.pr": "Record", "m.charts": "Grafici", "dash.ready": "Pronto a", "dash.load": "caricare", "dash.sub_empty": "Importa i log per attivare la dashboard.", "dash.ring": "tonnellaggio / settimana (kg)", "st.sessions": "sessioni", "st.records": "record", "st.exercises": "esercizi", "dash.recent": "Ultime sessioni", "dash.cta_import": "Importa log", "dash.cta_rest": "Avvia riposo", "dash.no_session": "Nessuna sessione.", "b.generate": "Genera", "b.calculate": "Calcola", "b.preview": "Anteprima", "b.import": "Importa", "b.save": "Salva", "b.estimate": "Stima carico", "cat.title": "Catalogo esercizi", "cat.tap": "Tocca per i progressi", "cat.logged": "nei tuoi log", "prog.title": "Progressione", "prog.best": "Miglior carico", "prog.e1rm": "1RM stim.", "prog.sessions_count": "sessioni", "prog.no_data": "Nessun dato.", "muscle_group": "Gruppo muscolare", "g.quads": "Quadricipiti", "g.posterior": "Catena posteriore", "g.hips": "Anche", "g.chest": "Petto", "g.shoulders": "Spalle", "g.back_horizontal": "Schiena (oriz.)", "g.back_vertical": "Schiena (vert.)", "g.arms": "Braccia", "g.core": "Core", "g.calves": "Polpacci", "settings.lang": "Lingua", "settings.theme": "Tema"}, "nl": {"macro.title": "Macro's & micronutriënten", "macro.kcal": "Doelcalorieën", "macro.weight": "Gewicht · kg", "macro.goal": "Doel", "macro.g_recomp": "Recompositie", "macro.g_cut": "Cut", "macro.g_bulk": "Bulk", "macro.g_keto": "Low-carb / keto", "macro.protein": "Eiwitten", "macro.carbs": "Koolhydraten", "macro.fats": "Vetten", "macro.total": "Totaal", "macro.fiber": "Vezels", "macro.water": "Water", "macro.micros": "Micronutriënten (ADH)", "macro.micro_note": "Referentiewaarden volwassenen — indicatief.", "macro.fill": "Voer calorieën en gewicht in", "m.roadmap": "Programma", "road.eyebrow": "Programma", "road.week": "Week", "road.starts_in": "Begint over", "road.days": "dagen", "road.completed": "Programma voltooid ✓", "settings.program": "Programma — startdatum", "nav.home": "Start", "nav.calc": "Bereken", "nav.session": "Sessie", "nav.progress": "Voortgang", "nav.nutrition": "Voeding", "nav.catalog": "Catalogus", "m.onerm": "1RM & tabel", "m.warmup": "Opwarming", "m.conv": "lbs ↔ kg", "m.plates": "Schijven", "m.rpe": "RPE & last", "m.timer": "Rusttimer", "m.import": "Logs importeren", "m.log": "Mijn sessies", "m.volume": "Volume", "m.pr": "Records", "m.charts": "Grafieken", "dash.ready": "Klaar om te", "dash.load": "laden", "dash.sub_empty": "Importeer je logs voor je dashboard.", "dash.ring": "tonnage / week (kg)", "st.sessions": "sessies", "st.records": "records", "st.exercises": "oefeningen", "dash.recent": "Recente sessies", "dash.cta_import": "Logs importeren", "dash.cta_rest": "Rust starten", "dash.no_session": "Nog geen sessies.", "b.generate": "Genereren", "b.calculate": "Berekenen", "b.preview": "Voorbeeld", "b.import": "Importeren", "b.save": "Opslaan", "b.estimate": "Last schatten", "cat.title": "Oefeningcatalogus", "cat.tap": "Tik voor voortgang", "cat.logged": "in je logs", "prog.title": "Voortgang", "prog.best": "Beste last", "prog.e1rm": "Gesch. 1RM", "prog.sessions_count": "sessies", "prog.no_data": "Geen data.", "muscle_group": "Spiergroep", "g.quads": "Quadriceps", "g.posterior": "Achterste keten", "g.hips": "Heupen", "g.chest": "Borst", "g.shoulders": "Schouders", "g.back_horizontal": "Rug (horiz.)", "g.back_vertical": "Rug (vert.)", "g.arms": "Armen", "g.core": "Core", "g.calves": "Kuiten", "settings.lang": "Taal", "settings.theme": "Thema"}, "ar": {"macro.title": "الماكرو والمغذيات الدقيقة", "macro.kcal": "السعرات المستهدفة", "macro.weight": "الوزن · كغ", "macro.goal": "الهدف", "macro.g_recomp": "إعادة التكوين", "macro.g_cut": "تنشيف", "macro.g_bulk": "تضخيم", "macro.g_keto": "قليل الكربوهيدرات", "macro.protein": "البروتين", "macro.carbs": "الكربوهيدرات", "macro.fats": "الدهون", "macro.total": "الإجمالي", "macro.fiber": "الألياف", "macro.water": "الماء", "macro.micros": "المغذيات الدقيقة", "macro.micro_note": "قيم مرجعية للبالغين — استرشادية.", "macro.fill": "أدخل السعرات والوزن", "m.roadmap": "البرنامج", "road.eyebrow": "البرنامج", "road.week": "أسبوع", "road.starts_in": "يبدأ خلال", "road.days": "يوم", "road.completed": "اكتمل البرنامج ✓", "settings.program": "البرنامج — تاريخ البدء", "nav.home": "الرئيسية", "nav.calc": "حساب", "nav.session": "جلسة", "nav.progress": "تقدم", "nav.nutrition": "تغذية", "nav.catalog": "فهرس", "m.onerm": "1RM والجدول", "m.warmup": "إحماء", "m.conv": "رطل ↔ كغ", "m.plates": "أقراص", "m.rpe": "RPE والحمل", "m.timer": "مؤقت الراحة", "m.import": "استيراد السجلات", "m.log": "جلساتي", "m.volume": "الحجم", "m.pr": "الأرقام", "m.charts": "الرسوم", "dash.ready": "جاهز", "dash.load": "التحميل", "dash.sub_empty": "استورد سجلاتك لتفعيل لوحتك.", "dash.ring": "الحمولة / أسبوع (كغ)", "st.sessions": "جلسات", "st.records": "أرقام", "st.exercises": "تمارين", "dash.recent": "آخر الجلسات", "dash.cta_import": "استيراد السجلات", "dash.cta_rest": "ابدأ راحة", "dash.no_session": "لا جلسات بعد.", "b.generate": "توليد", "b.calculate": "احسب", "b.preview": "معاينة", "b.import": "استيراد", "b.save": "حفظ", "b.estimate": "تقدير الحمل", "cat.title": "فهرس التمارين", "cat.tap": "اضغط لرؤية تقدمك", "cat.logged": "في سجلاتك", "prog.title": "التقدم", "prog.best": "أفضل حمل", "prog.e1rm": "1RM مقدر", "prog.sessions_count": "جلسات", "prog.no_data": "لا بيانات.", "muscle_group": "المجموعة العضلية", "g.quads": "الرباعية", "g.posterior": "السلسلة الخلفية", "g.hips": "الورك", "g.chest": "الصدر", "g.shoulders": "الأكتاف", "g.back_horizontal": "الظهر (أفقي)", "g.back_vertical": "الظهر (عمودي)", "g.arms": "الذراعين", "g.core": "الجذع", "g.calves": "السمانة", "settings.lang": "اللغة", "settings.theme": "المظهر"}, "zh": {"macro.title": "宏量与微量营养素", "macro.kcal": "目标热量", "macro.weight": "体重 · 公斤", "macro.goal": "目标", "macro.g_recomp": "身体重塑", "macro.g_cut": "减脂", "macro.g_bulk": "增肌", "macro.g_keto": "低碳/生酮", "macro.protein": "蛋白质", "macro.carbs": "碳水", "macro.fats": "脂肪", "macro.total": "总计", "macro.fiber": "纤维", "macro.water": "水", "macro.micros": "微量营养素(每日推荐)", "macro.micro_note": "成人参考值 — 仅供参考。", "macro.fill": "请输入热量和体重", "m.roadmap": "计划", "road.eyebrow": "计划", "road.week": "第", "road.starts_in": "开始于", "road.days": "天", "road.completed": "计划已完成 ✓", "settings.program": "计划开始日期", "nav.home": "主页", "nav.calc": "计算", "nav.session": "训练", "nav.progress": "进度", "nav.nutrition": "营养", "nav.catalog": "目录", "m.onerm": "1RM和表格", "m.warmup": "热身", "m.conv": "磅 ↔ 公斤", "m.plates": "杠铃片", "m.rpe": "RPE和负荷", "m.timer": "休息计时", "m.import": "导入记录", "m.log": "我的训练", "m.volume": "容量", "m.pr": "记录", "m.charts": "图表", "dash.ready": "准备", "dash.load": "加载", "dash.sub_empty": "导入记录以激活仪表板。", "dash.ring": "吨位/周 (公斤)", "st.sessions": "训练", "st.records": "记录", "st.exercises": "练习", "dash.recent": "最近训练", "dash.cta_import": "导入记录", "dash.cta_rest": "开始休息", "dash.no_session": "暂无训练。", "b.generate": "生成", "b.calculate": "计算", "b.preview": "预览", "b.import": "导入", "b.save": "保存", "b.estimate": "估算负荷", "cat.title": "练习目录", "cat.tap": "点击查看进度", "cat.logged": "在你的记录中", "prog.title": "进度", "prog.best": "最佳负荷", "prog.e1rm": "估计1RM", "prog.sessions_count": "次训练", "prog.no_data": "无数据。", "muscle_group": "肌群", "g.quads": "股四头肌", "g.posterior": "后链", "g.hips": "髋部", "g.chest": "胸部", "g.shoulders": "肩部", "g.back_horizontal": "背部(水平)", "g.back_vertical": "背部(垂直)", "g.arms": "手臂", "g.core": "核心", "g.calves": "小腿", "settings.lang": "语言", "settings.theme": "主题"}};

  let current = getLang();
  function getLang(){
    try { const s=localStorage.getItem('forge_lang'); if(s) return s; } catch(e){}
    const nav=(navigator.language||'fr').slice(0,2);
    return DICT[nav] ? nav : 'fr';
  }
  function setLang(code){
    if(!DICT[code]) code='fr';
    current=code;
    try { localStorage.setItem('forge_lang',code); } catch(e){}
    const meta = LANGS.find(l=>l.code===code);
    document.documentElement.lang=code;
    document.documentElement.dir = meta && meta.rtl ? 'rtl' : 'ltr';
    apply();
  }
  function t(key){
    return (DICT[current] && DICT[current][key]) || (DICT.fr[key]) || key;
  }
  // applique les traductions à tous les [data-i18n] et [data-i18n-html]
  function apply(){
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el=>{
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.dispatchEvent(new CustomEvent('lang-changed'));
  }
  return { LANGS, getLang, setLang, t, apply, current:()=>current };
})();


/* ============================================================
   FORGE UI — couche interface & animations.
   ============================================================ */
(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    applyTheme(getTheme());
    setupLangSelector();
    I18N.setLang(I18N.getLang());   // applique les traductions
    initDust();
    setupTabs();
    setupDash();
    setupOneRM();
    setupWarmup();
    setupConv();
    setupPlates();
    setupTimer();
    setupRPE();
    setupTDEE();
    setupMacros();
    setupImport();
    setupLog();
    setupDrawer();
    setupRipple();

    const f = Storage.getSettings().formula;
    $('#orm-f').value = f; $('#set-f').value = f;

    document.addEventListener('data-changed', refreshData);
    refreshData();
    // état initial : Accueil actif
    const dashCat = document.querySelector('.cat[data-view="dash"]');
    if(dashCat) dashCat.classList.add('active');
    // anime le dashboard au 1er chargement
    requestAnimationFrame(()=> animateDash());
  }

  /* ---------- Langue ---------- */
  function setupLangSelector(){
    const sel = $('#set-lang');
    if(sel){
      sel.innerHTML = I18N.LANGS.map(l=>`<option value="${l.code}">${l.flag} ${l.name}</option>`).join('');
      sel.value = I18N.getLang();
      sel.addEventListener('change', ()=>{ I18N.setLang(sel.value); rebuildDynamic(); toast(I18N.LANGS.find(l=>l.code===sel.value).name); });
    }
    // quand la langue change, on régénère les contenus dynamiques (catalogue, dash, etc.)
    document.addEventListener('lang-changed', rebuildDynamic);
  }
  function rebuildDynamic(){
    renderCatalog();
    if($('#view-roadmap').classList.contains('active')) renderRoadmap();
    if($('#view-dash').classList.contains('active')) animateDash();
    if($('#view-progress').classList.contains('active') && currentExId) openProgress(currentExId);
  }

  /* ---------- Détection des exercices dans les logs ---------- */
  // retourne Map(exId -> {ex, sessions:[{date,weight,reps,sets,e1rm}]}) trié par date
  function detectedExercises(){
    const map = new Map();
    const formula = Storage.getSettings().formula;
    for(const s of Storage.getSessions()){
      for(const e of (s.exercises||[])){
        const m = ExerciseDB.match(e.name);
        if(!m) continue;
        if(!map.has(m.id)) map.set(m.id, {id:m.id, name:m.name, group:m.group, sessions:[]});
        const w=+e.weight||0, reps=+e.reps||0, sets=+e.sets||1;
        map.get(m.id).sessions.push({date:s.date, weight:w, reps, sets, e1rm:OneRM.estimate(w,reps,formula)||0, raw:e.name});
      }
    }
    for(const v of map.values()) v.sessions.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    return map;
  }

  /* ---------- Catalogue ---------- */
  function renderCatalog(){
    const box = $('#catalog-body'); if(!box) return;
    const detected = detectedExercises();
    const byGroup = ExerciseDB.byGroup();
    let html = '';
    for(const g of ExerciseDB.groups()){
      const exs = byGroup[g];
      const loggedCount = exs.filter(e=>detected.has(e.id)).length;
      html += `<div class="cat-group">
        <div class="cat-group-head"><span class="cgh-name">${I18N.t('g.'+g)}</span><span class="cgh-count">${loggedCount}/${exs.length}</span></div>
        <div class="cat-items">`;
      for(const ex of exs){
        const d = detected.get(ex.id);
        const logged = !!d;
        html += `<button class="cat-item${logged?' logged':''}" data-ex="${ex.id}">
          <span class="ci-dot"></span>
          <span class="ci-name">${esc(ex.fr)}</span>
          ${logged?`<span class="ci-badge">${d.sessions.length}</span>`:''}
        </button>`;
      }
      html += `</div></div>`;
    }
    box.innerHTML = html;
    box.querySelectorAll('.cat-item').forEach(b=> b.addEventListener('click', ()=> openProgress(b.dataset.ex)));
  }

  /* ---------- Progression (fiche exercice) ---------- */
  let currentExId = null;
  function openProgress(exId){
    currentExId = exId;
    const ex = ExerciseDB.byId(exId);
    const detected = detectedExercises();
    const data = detected.get(exId);
    $('#prog-name').textContent = ex ? ex.fr : '—';
    const body = $('#prog-body');

    if(!data || !data.sessions.length){
      body.innerHTML = `<div class="empty-state"><div class="es-icon">○</div><p>${I18N.t('prog.no_data')}</p></div>`;
      goto('progress'); return;
    }
    // records
    const maxW = Math.max(...data.sessions.map(s=>s.weight));
    const maxE = Math.max(...data.sessions.map(s=>s.e1rm));
    const nSess = new Set(data.sessions.map(s=>s.date)).size;
    body.innerHTML = `
      <div class="prog-stats">
        <div class="pstat"><div class="ps-num">${maxW}<span class="ps-u">kg</span></div><div class="ps-cap">${I18N.t('prog.best')}</div></div>
        <div class="pstat"><div class="ps-num">${Math.round(maxE)}<span class="ps-u">kg</span></div><div class="ps-cap">${I18N.t('prog.e1rm')}</div></div>
        <div class="pstat"><div class="ps-num">${nSess}</div><div class="ps-cap">${I18N.t('prog.sessions_count')}</div></div>
      </div>
      <div class="card"><div class="card-glow"></div>
        <div class="chart-wrap"><canvas id="prog-canvas"></canvas></div>
      </div>
      <div class="card"><div class="card-glow"></div>
        <div class="tw"><table id="prog-table"></table></div>
      </div>`;
    // table historique
    const rows = data.sessions.slice().reverse().map(s=>
      `<tr><td>${s.date||'—'}</td><td>${s.sets}×${s.reps}</td><td>${s.weight} kg</td><td>${Math.round(s.e1rm)} kg</td></tr>`).join('');
    $('#prog-table').innerHTML = `<thead><tr><th>Date</th><th>Séries</th><th>${I18N.t('prog.best')}</th><th>${I18N.t('prog.e1rm')}</th></tr></thead><tbody>${rows}</tbody>`;
    goto('progress');
    // graphe (charge max par date)
    setTimeout(()=> drawProgChart(data), 60);
  }
  let progChart=null;
  function drawProgChart(data){
    if(typeof Chart==='undefined') return;
    const byDate=new Map();
    for(const s of data.sessions){ if(!s.date)continue; byDate.set(s.date, Math.max(byDate.get(s.date)||0, s.weight)); }
    const pts=[...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    const cv=$('#prog-canvas'); if(!cv)return;
    const rgb=accentRGB();
    if(progChart)progChart.destroy();
    progChart=new Chart(cv.getContext('2d'),{
      type:'line',
      data:{labels:pts.map(p=>p[0]),datasets:[{data:pts.map(p=>p[1]),
        borderColor:`rgb(${rgb.r},${rgb.g},${rgb.b})`,
        backgroundColor:(c)=>{const g=c.chart.ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},.28)`);g.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0)`);return g;},
        borderWidth:2.5,pointRadius:3,pointBackgroundColor:`rgb(${rgb.r},${rgb.g},${rgb.b})`,tension:.3,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:reduced?0:800},
        plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:'#8a8780',font:{family:'Geist Mono'}},grid:{color:'rgba(255,255,255,.04)'}},
        y:{ticks:{color:'#8a8780',font:{family:'Geist Mono'}},grid:{color:'rgba(255,255,255,.04)'}}}}
    });
  }

  /* ---------- Roadmap (programme 12 semaines) ---------- */
  function renderRoadmap(){
    const st = programState();
    const body = $('#road-body');
    $('#road-title').textContent = st.program.name;

    // bandeau d'état global
    const statusTxt = st.status==='upcoming'
      ? `${I18N.t('road.starts_in')} ${-st.daysSince} ${I18N.t('road.days')}`
      : st.status==='done'
      ? I18N.t('road.completed')
      : `${I18N.t('road.week')} ${st.currentWeek}/${st.totalWeeks}`;
    const pctTxt = Math.round(st.pct*100);

    let html = `
      <div class="road-hero card">
        <div class="card-glow"></div>
        <div class="road-hero-top">
          <div>
            <div class="road-status">${statusTxt}</div>
            <div class="road-dates">${fmtDate(st.start)} → ${fmtDate(weekDates(st.start, st.totalWeeks).end)}</div>
          </div>
          <div class="road-pct">${pctTxt}<span>%</span></div>
        </div>
        <div class="road-bar"><div class="road-bar-fill" style="width:0%" data-w="${pctTxt}"></div></div>
      </div>
      <div class="road-timeline">`;

    for(const b of st.program.blocks){
      const blockStart = weekDates(st.start, b.weeks[0]).start;
      const blockEnd = weekDates(st.start, b.weeks[b.weeks.length-1]).end;
      // état du bloc
      const lastWeek = b.weeks[b.weeks.length-1];
      const firstWeek = b.weeks[0];
      let bstate = 'upcoming';
      if(st.status!=='upcoming'){
        if(st.currentWeek > lastWeek) bstate='done';
        else if(st.currentWeek >= firstWeek) bstate='current';
      }
      html += `
        <div class="road-block ${bstate}">
          <div class="road-node"><span class="road-node-dot"></span></div>
          <div class="road-block-card">
            <div class="rb-head">
              <span class="rb-name">${esc(b.name)}</span>
              <span class="rb-weeks">S${firstWeek}${b.weeks.length>1?'–'+lastWeek:''}</span>
            </div>
            <div class="rb-dates">${fmtDate(blockStart)} → ${fmtDate(blockEnd)}</div>
            <div class="rb-rpe">${esc(b.rpe)}</div>
            <div class="rb-focus">${esc(b.focus)}</div>
            <div class="rb-milestone"><span class="rb-ms-icon">◆</span>${esc(b.milestone)}</div>
            ${bstate==='current'?renderWeekDots(b, st):''}
          </div>
        </div>`;
    }
    html += `</div>`;
    body.innerHTML = html;

    // anime la barre de progression
    requestAnimationFrame(()=>{ const f=$('.road-bar-fill'); if(f) setTimeout(()=>{ f.style.width = f.dataset.w+'%'; }, 80); });
  }
  function renderWeekDots(block, st){
    return `<div class="rb-weeks-track">` + block.weeks.map(w=>{
      let cls = w < st.currentWeek ? 'done' : w===st.currentWeek ? 'now' : '';
      return `<span class="wk-dot ${cls}" title="S${w}">${w}</span>`;
    }).join('') + `</div>`;
  }
  /* ---------- Thème / ambiance ---------- */
  function getTheme(){
    try { return localStorage.getItem('forge_theme') || 'forge'; } catch(e){ return 'forge'; }
  }
  function applyTheme(name){
    if(name && name !== 'forge') document.documentElement.setAttribute('data-theme', name);
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('forge_theme', name); } catch(e){}
    // synchronise la barre de statut mobile
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta){ const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(); if(bg) meta.content = bg; }
    // met à jour l'état actif des swatches
    document.querySelectorAll('.theme-swatch').forEach(s=> s.classList.toggle('active', s.dataset.themePick===name));
  }

  /* ---------- Poussière en suspension (canvas) ---------- */
  function initDust(){
    if (reduced) return;
    const c = $('#dust'), ctx = c.getContext('2d');
    let w,h,parts;
    function resize(){
      w = c.width = innerWidth * devicePixelRatio;
      h = c.height = innerHeight * devicePixelRatio;
      const n = Math.min(70, Math.floor(innerWidth/12));
      parts = Array.from({length:n}, ()=>({
        x: Math.random()*w, y: Math.random()*h,
        r: (Math.random()*1.6+0.4)*devicePixelRatio,
        vx: (Math.random()-.5)*0.12*devicePixelRatio,
        vy: (Math.random()-.5)*0.12*devicePixelRatio - 0.04*devicePixelRatio,
        a: Math.random()*0.5+0.1
      }));
    }
    resize(); addEventListener('resize', resize);
    (function loop(){
      ctx.clearRect(0,0,w,h);
      for(const p of parts){
        p.x+=p.vx; p.y+=p.vy;
        if(p.y<-10) p.y=h+10; if(p.x<-10) p.x=w+10; if(p.x>w+10) p.x=-10;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.28);
        ctx.fillStyle = dustColor(p.a*0.5);
        ctx.fill();
      }
      requestAnimationFrame(loop);
    })();
  }
  // couleur de poussière dérivée de l'accent courant
  function accentRGB(){
    const c = getComputedStyle(document.documentElement).getPropertyValue('--amber').trim();
    return hexToRgb(c) || {r:232,g:176,b:75};
  }
  function dustColor(a){ const {r,g,b}=accentRGB(); return `rgba(${r},${g},${b},${a})`; }
  function hexToRgb(h){ const m=h.replace('#','').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i); return m?{r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)}:null; }

  /* ---------- Count-up animation ---------- */
  function countUp(el, target, dur=1100, suffix=''){
    target = Number(target)||0;
    if (reduced){ el.textContent = format(target)+suffix; return; }
    const start = performance.now();
    const from = 0;
    function step(now){
      const t = Math.min(1,(now-start)/dur);
      const eased = 1-Math.pow(1-t,3);
      el.textContent = format(Math.round(from+(target-from)*eased))+suffix;
      if(t<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function format(n){ return n.toLocaleString('fr-FR'); }

  /* ---------- Ring fill ---------- */
  function fillRing(el, pct, circumference){
    const offset = circumference*(1-Math.max(0,Math.min(1,pct)));
    requestAnimationFrame(()=>{ el.style.strokeDashoffset = offset; });
  }

  /* ---------- Navigation ---------- */
  // map outil -> catégorie, pour surligner la bonne catégorie
  const VIEW_CAT = {
    onerm:'calcul', warmup:'calcul', conv:'calcul', plates:'calcul', rpe:'calcul',
    timer:'seance', import:'seance', log:'seance', roadmap:'seance',
    catalog:'progres', volume:'progres', pr:'progres', charts:'progres', progress:'progres'
  };

  /* ---------- Programme 12 semaines (roadmap) ---------- */
  const DEFAULT_PROGRAM = {
    startDate: "2026-06-15",
    name: "Recomposition 12 semaines",
    blocks: [
      {id:"b1",name:"Bloc 1",weeks:[1,2,3,4],rpe:"RPE 8 · isolations RPE 7",focus:"Mise en route — volume contrôlé, technique",milestone:"Établir les charges de travail sur tout le cycle PPL"},
      {id:"b2",name:"Bloc 2",weeks:[5,6,7,8],rpe:"RPE 8–9 · isolations RPE 7–8",focus:"Intensification — rest-pause introduit",milestone:"Progresser les charges, intégrer le rest-pause"},
      {id:"b3",name:"Bloc 3",weeks:[9,10,11],rpe:"RPE 9 · isolations RPE 8",focus:"Pic d'intensité — drop sets",milestone:"Charges maximales contrôlées, drop sets"},
      {id:"deload",name:"Deload",weeks:[12],rpe:"Intensité réduite",focus:"Récupération — assimilation",milestone:"Récupérer, planifier le prochain cycle"}
    ]
  };
  function getProgram(){
    try { const s=localStorage.getItem('forge_program'); if(s) return JSON.parse(s); } catch(e){}
    return DEFAULT_PROGRAM;
  }
  function saveProgram(p){ try{ localStorage.setItem('forge_program', JSON.stringify(p)); }catch(e){} }

  function programState(){
    const p = getProgram();
    const start = new Date(p.startDate+'T00:00:00');
    const totalWeeks = Math.max(...p.blocks.flatMap(b=>b.weeks));
    const now = new Date();
    const dayMs = 86400000;
    const daysSince = Math.floor((now - start)/dayMs);
    let currentWeek = Math.floor(daysSince/7) + 1;
    let status = 'active';
    if(daysSince < 0) status = 'upcoming';
    else if(currentWeek > totalWeeks) { status = 'done'; currentWeek = totalWeeks; }
    const pct = status==='upcoming' ? 0 : status==='done' ? 1 : Math.min(1, daysSince/(totalWeeks*7));
    return { program:p, start, totalWeeks, currentWeek, status, pct, daysSince };
  }
  function weekDates(start, weekNum){
    const ws = new Date(start.getTime() + (weekNum-1)*7*86400000);
    const we = new Date(ws.getTime() + 6*86400000);
    return { start: ws, end: we };
  }
  function fmtDate(d){
    return d.toLocaleDateString(I18N.current()==='fr'?'fr-FR':undefined, {day:'2-digit',month:'short'});
  }

  function setupTabs(){
    // sort les menus et le scrim hors de .nav (contexte d'empilement) → directement dans body
    $$('.menu').forEach(m=> document.body.appendChild(m));
    const scrim = $('#nav-scrim'); if(scrim) document.body.appendChild(scrim);
    // catégories à action directe (Accueil, Nutrition) : naviguent direct
    $$('.cat[data-view]').forEach(c=> c.addEventListener('click', ()=>{ closeMenus(); goto(c.dataset.view); }));
    // catégories à menu : ouvrent/ferment le déroulant
    $$('.cat[data-cat]').forEach(c=> c.addEventListener('click', e=>{
      e.stopPropagation();
      const open = c.classList.contains('open');
      closeMenus();
      if(!open) openMenu(c.dataset.cat, c);
    }));
    // items des menus : naviguent
    $$('.menu-item').forEach(it=> it.addEventListener('click', ()=>{ closeMenus(); goto(it.dataset.view); }));
    // fermeture au tap dehors / Échap
    $('#nav-scrim').addEventListener('click', closeMenus);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenus(); });
    $$('[data-goto]').forEach(b=> b.addEventListener('click', ()=> goto(b.dataset.goto)));
  }

  function openMenu(cat, btn){
    const menu = $(`.menu[data-menu="${cat}"]`);
    if(!menu) return;
    // positionne le menu (fixed) sous le bouton, clampé à l'écran
    const r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + 'px';
    // d'abord à gauche du bouton, puis on corrige si ça déborde à droite
    menu.style.left = r.left + 'px';
    menu.classList.add('open');
    const mw = menu.getBoundingClientRect().width;
    let left = r.left;
    if(left + mw > window.innerWidth - 12) left = window.innerWidth - 12 - mw;
    if(left < 12) left = 12;
    menu.style.left = left + 'px';
    btn.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    $('#nav-scrim').classList.add('show');
  }
  function closeMenus(){
    $$('.menu.open').forEach(m=> m.classList.remove('open'));
    $$('.cat.open').forEach(c=>{ c.classList.remove('open'); c.setAttribute('aria-expanded','false'); });
    $('#nav-scrim').classList.remove('show');
  }

  function goto(view){
    // surlignage : catégorie directe OU catégorie parente de l'outil
    $$('.cat[data-view]').forEach(c=> c.classList.toggle('active', c.dataset.view===view));
    const parentCat = VIEW_CAT[view];
    $$('.cat[data-cat]').forEach(c=> c.classList.toggle('active', c.dataset.cat===parentCat));
    // item actif dans les menus
    $$('.menu-item').forEach(it=> it.classList.toggle('active', it.dataset.view===view));

    $$('.view').forEach(v=> v.classList.remove('active'));
    const el = $('#view-'+view);
    if(el){ el.classList.add('active'); }
    if(!reduced && el){ el.querySelectorAll(':scope > *').forEach(c=>{ c.style.animation='none'; c.offsetHeight; c.style.animation=''; }); }
    if(['volume','pr','charts','log','catalog'].includes(view)) refreshData();
    if(view==='roadmap') renderRoadmap();
    if(view==='dash') animateDash();
    if(view==='charts') drawChart();
    window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
  }

  /* ---------- Dashboard ---------- */
  function setupDash(){ /* câblé via data-goto + refresh */ }
  function animateDash(){
    const sessions = Storage.getSessions();
    const week = Volume.weeklyVolume(sessions);
    const lastWeek = week.length ? week[week.length-1].tonnage : 0;
    const recs = PR.records(sessions);
    const exNames = Charts.exerciseNames ? Charts.exerciseNames(sessions) : exerciseNamesFallback(sessions);

    // ring : tonnage de la dernière semaine, plafonné visuellement à 40000 pour le remplissage
    const ringNum = $('#dash-ring-num');
    countUp(ringNum, lastWeek, 1300);
    const pct = Math.min(1, lastWeek/40000) || (lastWeek>0?0.06:0);
    fillRing($('#dash-ring'), lastWeek>0?Math.max(0.06,pct):0, 552.9);

    countUp($('#st-sessions'), sessions.length, 900);
    countUp($('#st-prs'), recs.length, 1000);
    countUp($('#st-ex'), exNames.length, 1100);

    // sub line contextuelle
    const sub = $('#dash-sub');
    if(sessions.length===0) sub.textContent = I18N.t('dash.sub_empty');
    else sub.textContent = `${sessions.length} ${I18N.t('st.sessions')} · ${format(lastWeek)} kg`;

    // dernières séances
    const recent = sessions.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,4);
    const box = $('#dash-recent');
    if(!recent.length){
      box.innerHTML = `<div class="empty-state"><div class="es-icon">○</div><p>${I18N.t('dash.no_session')}</p></div>`;
    } else {
      box.innerHTML = recent.map(s=>`
        <div class="mini-session">
          <div><div class="ms-name">${esc(s.name||'Séance')}</div><div class="ms-date">${s.date||'sans date'}</div></div>
          <div class="ms-ton">${format(Math.round(Volume.sessionTonnage(s)))} kg</div>
        </div>`).join('');
    }
  }
  function exerciseNamesFallback(sessions){
    const set=new Set(); for(const s of sessions) for(const e of (s.exercises||[])) if(e.name) set.add(e.name);
    return [...set];
  }

  /* ---------- 1RM ---------- */
  function setupOneRM(){
    const calc=()=>{
      const est = OneRM.estimate($('#orm-w').value,$('#orm-r').value,$('#orm-f').value);
      const out = $('#orm-out');
      if(est==null){ out.className='result empty'; out.innerHTML='<span>Saisis un poids et des reps</span>'; return; }
      out.className='result';
      out.innerHTML=`<span>1RM estimé</span><span class="big">${OneRM.round(est)} kg</span>`;
      if(!$('#orm-1rm').value) $('#orm-1rm').value = OneRM.round(est);
    };
    ['#orm-w','#orm-r','#orm-f'].forEach(s=>$(s).addEventListener('input',calc));
    $('#orm-table-btn').addEventListener('click',()=>{
      const rows=OneRM.loadingTable($('#orm-1rm').value), t=$('#orm-table');
      t.innerHTML = rows.length
        ? `<thead><tr><th>%</th><th>Charge</th><th>Reps</th></tr></thead><tbody>`+
          rows.map(r=>`<tr><td>${r.pct}%</td><td>${r.weight} kg</td><td>${r.reps}</td></tr>`).join('')+`</tbody>`
        : '';
    });
  }

  /* ---------- Warm-up ---------- */
  function setupWarmup(){
    $('#wu-btn').addEventListener('click',()=>{
      const steps=Progression.warmup($('#wu-w').value,$('#wu-r').value,$('#wu-bar').value), t=$('#wu-table');
      t.innerHTML = steps.length
        ? `<thead><tr><th>Série</th><th>Charge</th><th>Reps</th></tr></thead><tbody>`+
          steps.map(s=>`<tr${s.work?' class="hi"':''}><td>${s.label}</td><td>${s.weight} kg</td><td>${s.reps}</td></tr>`).join('')+`</tbody>`
        : '';
    });
  }

  /* ---------- Converter ---------- */
  function setupConv(){
    const lbs=$('#cv-lbs'), kg=$('#cv-kg'); let lock=false;
    lbs.addEventListener('input',()=>{ if(lock)return; lock=true; const v=Converter.lbsToKg(lbs.value); kg.value=v==null?'':Converter.round1(v); lock=false; });
    kg.addEventListener('input',()=>{ if(lock)return; lock=true; const v=Converter.kgToLbs(kg.value); lbs.value=v==null?'':Converter.round1(v); lock=false; });
  }

  /* ---------- Plates ---------- */
  function setupPlates(){
    $('#pl-bar').value = Storage.getSettings().barWeight;
    $('#pl-btn').addEventListener('click',()=>{
      const av=$('#pl-av').value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
      const res=Plates.compute($('#pl-total').value,$('#pl-bar').value,av), out=$('#pl-out');
      if(!res.ok){ out.innerHTML=`<div class="result empty" style="margin-top:16px"><span>${res.reason}</span></div>`; return; }
      Storage.saveSettings({barWeight:parseFloat($('#pl-bar').value)||20});
      // visuel symétrique : disques | barre | disques
      const side = res.plates.flatMap(p=>Array(p.count).fill(p.plate));
      const plateEl = (v,i)=>{ const big=18+v*1.1; return `<span class="plate" style="width:${Math.min(34,18+v*0.7)}px;height:${Math.min(74,38+v*1.3)}px;font-size:${v<5?9:11}px;animation-delay:${i*60}ms">${v}</span>`; };
      const left = side.map((v,i)=>plateEl(v,i)).join('');
      const right = side.slice().reverse().map((v,i)=>plateEl(v,side.length-1-i)).join('');
      out.innerHTML = `
        <div class="result" style="margin-top:16px"><span>Par côté</span><span class="big">${res.perSide} kg</span></div>
        <div class="plate-vis">${left}<span class="plate-bar"></span>${right||'<span class="muted">barre seule</span>'}</div>
        <p class="muted" style="text-align:center;font-family:'Geist Mono',monospace;font-size:12px">${res.plates.map(p=>`${p.count}×${p.plate}`).join('  ·  ')||'—'}</p>
        ${res.leftover?`<p class="status"><span class="warn">Reste ${res.leftover} kg/côté non couvert</span></p>`:''}`;
    });
  }

  /* ---------- Timer ---------- */
  let tmTotal=90, tmRem=90, tmId=null, tmRunning=false;
  const TM_CIRC=578;
  function setupTimer(){
    tmRender();
    $$('#tm-presets .chip').forEach(c=> c.addEventListener('click',()=>{
      $$('#tm-presets .chip').forEach(x=>x.classList.remove('active')); c.classList.add('active');
      tmStop(); tmTotal=tmRem=+c.dataset.sec; tmRender();
    }));
    $('#tm-start').addEventListener('click', tmStart);
    $('#tm-pause').addEventListener('click', tmStop);
    $('#tm-reset').addEventListener('click', ()=>{ tmStop(); tmRem=tmTotal; tmRender(); });
  }
  function tmStart(){
    if(tmRunning||tmRem<=0) return; tmRunning=true;
    tmId=setInterval(()=>{
      tmRem--; if(tmRem<=0){ tmRem=0; tmStop(); tmBeep(); $('#tm-num').classList.add('pulse'); setTimeout(()=>$('#tm-num').classList.remove('pulse'),3000); }
      tmRender();
    },1000);
  }
  function tmStop(){ tmRunning=false; if(tmId)clearInterval(tmId); tmId=null; }
  function tmRender(){
    const m=Math.floor(tmRem/60), s=tmRem%60;
    $('#tm-num').textContent = `${m}:${String(s).padStart(2,'0')}`;
    fillRing($('#tm-ring'), tmTotal? tmRem/tmTotal : 0, TM_CIRC);
  }
  function tmBeep(){
    try{ const ctx=new(AudioContext||webkitAudioContext)(); let t=ctx.currentTime;
      for(let i=0;i<3;i++){ const o=ctx.createOscillator(),g=ctx.createGain();
        o.frequency.value=880; o.type='sine';
        g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.4,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.18);
        o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+.2); t+=.28; }
    }catch(e){}
  }

  /* ---------- RPE ---------- */
  function setupRPE(){
    const rpe=$('#rpe-in'),rir=$('#rir-in'); let lock=false;
    rpe.addEventListener('input',()=>{ if(lock)return; lock=true; const v=RPE.rpeToRir(rpe.value); rir.value=v==null?'':v; lock=false; });
    rir.addEventListener('input',()=>{ if(lock)return; lock=true; const v=RPE.rirToRpe(rir.value); rpe.value=v==null?'':v; lock=false; });
    $('#rpe-btn').addEventListener('click',()=>{
      const load=RPE.targetLoad($('#rpe-rw').value,$('#rpe-rr').value,$('#rpe-rrpe').value,$('#rpe-tr').value,$('#rpe-trpe').value);
      const out=$('#rpe-out');
      if(load==null){ out.className='result empty'; out.innerHTML='<span>Vérifie les valeurs (RPE 6–10, reps ≤ 12)</span>'; }
      else { out.className='result'; out.innerHTML=`<span>Charge cible</span><span class="big">${load} kg</span>`; }
    });
  }

  /* ---------- TDEE ---------- */
  function setupTDEE(){
    $('#td-btn').addEventListener('click',()=>{
      const r=TDEE.compute({sex:$('#td-sex').value,weight:$('#td-w').value,height:$('#td-h').value,age:$('#td-age').value,activity:$('#td-act').value});
      const out=$('#td-out');
      if(!r){ out.innerHTML=`<div class="result empty"><span>Remplis tous les champs</span></div>`; return; }
      out.innerHTML=`
        <div class="tdee-line"><span class="lbl">Métabolisme de base</span><span class="v">${format(r.bmr)}</span></div>
        <div class="tdee-line"><span class="lbl">Maintien</span><span class="v">${format(r.maintenance)}</span></div>
        <div class="tdee-line hi"><span class="lbl">Déficit léger · recomp</span><span class="v">${format(r.lightDeficit)}</span></div>
        <div class="tdee-line"><span class="lbl">Déficit modéré</span><span class="v">${format(r.moderateDeficit)}</span></div>
        <div class="tdee-line"><span class="lbl">Protéines / jour</span><span class="v">${r.proteinG} g</span></div>`;
      $$('#td-out .tdee-line').forEach((l,i)=>{ l.style.animation='none'; l.style.opacity=0; setTimeout(()=>{ l.style.animation=`rise .4s var(--ease-out) forwards`; },i*70); });
      // pré-remplit le calculateur de macros
      if(!$('#mc-kcal').value) $('#mc-kcal').value = r.recommendation;
      if(!$('#mc-w').value && $('#td-w').value) $('#mc-w').value = $('#td-w').value;
    });
  }

  /* ---------- Macros & micronutriments ---------- */
  // répartition des macros selon l'objectif. Protéines en g/kg, lipides en g/kg, glucides = reste.
  const MACRO_GOALS = {
    recomp: { protPerKg: 2.0, fatPerKg: 0.9 },
    cut:    { protPerKg: 2.2, fatPerKg: 0.8 },
    bulk:   { protPerKg: 1.8, fatPerKg: 1.0 },
    keto:   { protPerKg: 2.0, fatPerKg: 1.6 }   // glucides plafonnés ensuite
  };
  function computeMacros(kcal, weight, goal){
    kcal = Number(kcal); weight = Number(weight);
    if(!kcal || !weight) return null;
    const g = MACRO_GOALS[goal] || MACRO_GOALS.recomp;
    let prot = Math.round(weight * g.protPerKg);          // g
    let fat  = Math.round(weight * g.fatPerKg);            // g
    let protKcal = prot*4, fatKcal = fat*9;
    let carbKcal = kcal - protKcal - fatKcal;
    let carb = Math.round(carbKcal/4);
    // keto : plafonne les glucides à ~30 g et réinjecte le surplus en lipides
    if(goal==='keto' && carb > 30){
      const excessKcal = (carb-30)*4; carb = 30;
      fat += Math.round(excessKcal/9);
    }
    if(carb < 0){ carb = 0; } // sécurité si kcal trop bas
    // recalcule les kcal réelles
    const realKcal = prot*4 + carb*4 + fat*9;
    return {
      kcal: realKcal, prot, carb, fat,
      pPct: Math.round(prot*4/realKcal*100),
      cPct: Math.round(carb*4/realKcal*100),
      fPct: Math.round(fat*9/realKcal*100),
      fiber: Math.round(realKcal/1000*14),   // ~14 g / 1000 kcal
      water: (weight*0.035).toFixed(1)        // L/jour, ~35 ml/kg
    };
  }
  // valeurs de référence micronutriments (AJR adulte, repère générique)
  const MICROS = [
    {k:'Vitamine C', v:'90 mg'}, {k:'Vitamine D', v:'15 µg'}, {k:'Vitamine B12', v:'2,4 µg'},
    {k:'Calcium', v:'1000 mg'}, {k:'Fer', v:'8–18 mg'}, {k:'Magnésium', v:'400 mg'},
    {k:'Potassium', v:'3500 mg'}, {k:'Zinc', v:'11 mg'}, {k:'Sodium', v:'< 2300 mg'},
    {k:'Oméga-3 (EPA+DHA)', v:'250–500 mg'}
  ];
  function setupMacros(){
    $('#mc-btn').addEventListener('click', ()=>{
      const m = computeMacros($('#mc-kcal').value, $('#mc-w').value, $('#mc-goal').value);
      const out = $('#mc-out');
      if(!m){ out.innerHTML=`<div class="result empty" style="margin-top:14px"><span>${I18N.t('macro.fill')||'Renseigne calories et poids'}</span></div>`; return; }
      out.innerHTML = `
        <div class="macro-bar">
          <div class="mb-seg mb-prot" style="width:${m.pPct}%"></div>
          <div class="mb-seg mb-carb" style="width:${m.cPct}%"></div>
          <div class="mb-seg mb-fat" style="width:${m.fPct}%"></div>
        </div>
        <div class="macro-grid">
          <div class="macro-card mc-prot"><div class="mc-g">${m.prot}<span>g</span></div><div class="mc-l">${I18N.t('macro.protein')}</div><div class="mc-pct">${m.pPct}%</div></div>
          <div class="macro-card mc-carb"><div class="mc-g">${m.carb}<span>g</span></div><div class="mc-l">${I18N.t('macro.carbs')}</div><div class="mc-pct">${m.cPct}%</div></div>
          <div class="macro-card mc-fat"><div class="mc-g">${m.fat}<span>g</span></div><div class="mc-l">${I18N.t('macro.fats')}</div><div class="mc-pct">${m.fPct}%</div></div>
        </div>
        <div class="macro-extra">
          <div class="me-line"><span>${I18N.t('macro.total')}</span><span class="v">${format(m.kcal)} kcal</span></div>
          <div class="me-line"><span>${I18N.t('macro.fiber')}</span><span class="v">${m.fiber} g</span></div>
          <div class="me-line"><span>${I18N.t('macro.water')}</span><span class="v">${m.water} L</span></div>
        </div>
        <details class="micro-details"><summary>${I18N.t('macro.micros')}</summary>
          <div class="micro-grid">
            ${MICROS.map(mi=>`<div class="micro-item"><span class="mi-k">${mi.k}</span><span class="mi-v">${mi.v}</span></div>`).join('')}
          </div>
          <p class="hint" style="margin-top:10px">${I18N.t('macro.micro_note')}</p>
        </details>`;
      // anime les barres
      requestAnimationFrame(()=>{ $$('#mc-out .mb-seg').forEach(s=>{ const w=s.style.width; s.style.width='0'; setTimeout(()=>s.style.width=w,40); }); });
    });
  }

  /* ---------- Import ---------- */
  let lastImport=null;
  function setupImport(){
    const text=$('#im-text'), recap=$('#im-recap'), status=$('#im-status'), drop=$('#im-drop'), file=$('#im-file');
    const fmt=()=>$('#im-fmt').value;
    const doPreview=()=>{
      if(!text.value.trim()){ recap.innerHTML=''; lastImport=null; return; }
      const f = fmt()==='auto'?Parsers.autoDetect(text.value):fmt();
      let res; try{ res=Parsers.parse(text.value,f); }catch(e){ status.innerHTML=`<span class="err">Erreur : ${esc(e.message)}</span>`; return; }
      lastImport=res;
      const c=res.counts;
      let html=`<div class="recap"><p style="margin-bottom:10px">
        <span class="badge ok">${c.sessions} séance(s)</span>
        <span class="badge ok">${c.exercises} exo(s)</span>
        ${res.unrecognized.length?`<span class="badge warn">${res.unrecognized.length} ignorée(s)</span>`:''}
        <span class="badge">${f.toUpperCase()}</span></p>`;
      if(res.sessions.length){
        html+=`<ul class="preview-list">`+res.sessions.slice(0,6).map(s=>`<li><span class="pl-name">${esc(s.name)}</span> <span class="muted">${s.date||'sans date'} · ${s.exercises.length} ex.</span></li>`).join('');
        if(res.sessions.length>6) html+=`<li class="muted">+${res.sessions.length-6} autres</li>`;
        html+=`</ul>`;
      }
      if(res.unrecognized.length) html+=`<details><summary>Lignes ignorées</summary><div class="unrecognized">${esc(res.unrecognized.slice(0,25).join('\n'))}</div></details>`;
      html+=`</div>`; recap.innerHTML=html;
    };
    $('#im-prev').addEventListener('click',doPreview);
    text.addEventListener('input',()=>{ if(text.value.length>40) doPreview(); });
    $('#im-conf').addEventListener('click',()=>{
      if(!text.value.trim()){ status.innerHTML='<span class="err">Rien à importer.</span>'; return; }
      doPreview();
      if(!lastImport||!lastImport.sessions.length){ status.innerHTML='<span class="err">Aucune séance détectée.</span>'; return; }
      const added=Storage.addSessions(lastImport.sessions);
      status.innerHTML= added>0?`<span class="ok">✓ ${added} séance(s) importée(s)</span>`:`<span class="warn">Déjà présentes.</span>`;
      if(added>0) toast(`${added} séance(s) ajoutée(s)`);
      document.dispatchEvent(new CustomEvent('data-changed'));
    });
    // drop zone
    drop.addEventListener('click',()=>file.click());
    drop.addEventListener('dragover',e=>{ e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave',()=>drop.classList.remove('over'));
    drop.addEventListener('drop',e=>{ e.preventDefault(); drop.classList.remove('over'); if(e.dataTransfer.files[0]) readF(e.dataTransfer.files[0]); });
    file.addEventListener('change',e=>{ if(e.target.files[0]) readF(e.target.files[0]); });
    function readF(f){
      if($('#im-fmt').value==='auto'){ if(/\.csv$/i.test(f.name))$('#im-fmt').value='csv'; else if(/\.json$/i.test(f.name))$('#im-fmt').value='json'; else $('#im-fmt').value='text'; }
      const r=new FileReader(); r.onload=()=>{ text.value=r.result; doPreview(); }; r.readAsText(f);
    }
  }

  /* ---------- Log ---------- */
  function setupLog(){
    addExRow();
    $('#lg-add').addEventListener('click',addExRow);
    $('#lg-save').addEventListener('click',()=>{
      const ex=$$('#lg-ex .ex-row').map(r=>({
        name:r.querySelector('.e-name').value.trim(),
        sets:numN(r.querySelector('.e-sets').value), reps:numN(r.querySelector('.e-reps').value),
        weight:numN(r.querySelector('.e-w').value), rpe:numN(r.querySelector('.e-rpe').value),
        notes:r.querySelector('.e-notes').value.trim()
      })).filter(e=>e.name&&(e.reps||e.weight));
      if(!ex.length){ toast('Ajoute au moins un exercice'); return; }
      Storage.addSession({date:$('#lg-date').value,name:$('#lg-name').value||'Séance',exercises:ex});
      $('#lg-name').value=''; $('#lg-ex').innerHTML=''; addExRow();
      toast('Séance enregistrée');
      document.dispatchEvent(new CustomEvent('data-changed'));
    });
    renderLog();
  }
  function addExRow(){
    const d=document.createElement('div'); d.className='ex-row';
    d.innerHTML=`<div class="ex-row-head"><span class="ex-row-tag">Exercice</span><button type="button" class="ex-row-del" aria-label="Supprimer cette ligne">✕</button></div>
      <div class="row"><div class="field" style="flex:2 1 140px"><label>Exercice</label><input class="e-name" placeholder="Développé couché"></div>
      <div class="field"><label>Séries</label><input class="e-sets" type="number" inputmode="numeric" placeholder="4"></div>
      <div class="field"><label>Reps</label><input class="e-reps" type="number" inputmode="numeric" placeholder="8"></div></div>
      <div class="row"><div class="field"><label>Charge</label><input class="e-w" type="number" inputmode="decimal" placeholder="100"></div>
      <div class="field"><label>RPE</label><input class="e-rpe" type="number" inputmode="decimal" step="0.5" placeholder="8"></div>
      <div class="field" style="flex:2 1 140px"><label>Notes</label><input class="e-notes"></div></div>`;
    d.querySelector('.ex-row-del').addEventListener('click', ()=>{
      const rows = $$('#lg-ex .ex-row');
      if(rows.length <= 1){ // ne pas supprimer la dernière : on la vide
        d.querySelectorAll('input').forEach(i=> i.value='');
      } else {
        d.remove();
      }
    });
    $('#lg-ex').appendChild(d);
  }
  function renderLog(){
    const sessions=Storage.getSessions().slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    const box=$('#lg-list');
    if(!sessions.length){ box.innerHTML=`<div class="empty-state"><div class="es-icon">○</div><p>Aucune séance. Importe tes logs ou ajoute-en une.</p></div>`; return; }
    box.innerHTML=sessions.map(s=>{
      const ton=Math.round(Volume.sessionTonnage(s));
      const rows=(s.exercises||[]).map(e=>`<tr><td>${esc(e.name)}</td><td>${e.sets??'—'}×${e.reps??'—'}</td><td>${e.weight!=null?e.weight+' kg':'—'}</td><td>${e.rpe??'—'}</td></tr>`).join('');
      return `<div class="session-card"><div class="sc-head"><div><span class="sc-name">${esc(s.name||'Séance')}</span><span class="sc-date">${s.date||'sans date'}</span></div>
        <div style="display:flex;align-items:center;gap:10px"><span class="sc-ton">${format(ton)} kg</span><button class="sc-del" data-id="${s.id}">✕</button></div></div>
        <div class="tw"><table><thead><tr><th>Exercice</th><th>Séries</th><th>Charge</th><th>RPE</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
    }).join('');
    box.querySelectorAll('.sc-del').forEach(b=> b.addEventListener('click',()=>{
      if(confirm('Supprimer cette séance ?')){ Storage.deleteSession(b.dataset.id); document.dispatchEvent(new CustomEvent('data-changed')); }
    }));
  }

  /* ---------- Drawer ---------- */
  function setupDrawer(){
    const dr=$('#drawer');
    // date de début du programme
    const ps = $('#set-program-start');
    if(ps){
      ps.value = getProgram().startDate;
      ps.addEventListener('change', ()=>{
        if(!ps.value) return;
        const p = getProgram(); p.startDate = ps.value; saveProgram(p);
        if($('#view-roadmap').classList.contains('active')) renderRoadmap();
        toast('Programme mis à jour');
      });
    }
    // swatches d'ambiance
    $$('.theme-swatch').forEach(sw=> sw.addEventListener('click',()=>{
      applyTheme(sw.dataset.themePick);
      if(chart && $('#view-charts').classList.contains('active')) drawChart();
      toast('Ambiance : '+sw.textContent.trim());
    }));
    $('#gear').addEventListener('click',()=>dr.hidden=false);
    $('#d-close').addEventListener('click',()=>dr.hidden=true);
    $('#drawer-scrim').addEventListener('click',()=>dr.hidden=true);
    $('#set-f').addEventListener('change',e=>{ Storage.saveSettings({formula:e.target.value}); $('#orm-f').value=e.target.value; document.dispatchEvent(new CustomEvent('data-changed')); });
    $('#d-export').addEventListener('click',()=>{
      const blob=new Blob([JSON.stringify(Storage.exportAll(),null,2)],{type:'application/json'});
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`forge-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href);
      toast('Export téléchargé');
    });
    $('#d-import').addEventListener('change',e=>{
      const f=e.target.files[0]; if(!f)return; const r=new FileReader();
      r.onload=()=>{ try{ Storage.importAll(JSON.parse(r.result)); document.dispatchEvent(new CustomEvent('data-changed')); toast('Données importées'); dr.hidden=true; }catch(err){ toast('JSON invalide'); } };
      r.readAsText(f);
    });
    $('#d-clear').addEventListener('click',()=>{ if(confirm('Tout effacer ? Irréversible.')){ Storage.clearAll(); document.dispatchEvent(new CustomEvent('data-changed')); toast('Données effacées'); dr.hidden=true; } });
  }

  /* ---------- Ripple sur boutons ---------- */
  function setupRipple(){
    document.addEventListener('pointerdown',e=>{
      const b=e.target.closest('.btn'); if(!b)return;
      const r=b.getBoundingClientRect();
      b.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
      b.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
    });
  }

  /* ---------- Data views ---------- */
  function refreshData(){
    renderLog(); renderVolume(); renderPR(); renderChartCtrl(); renderCatalog();
    if($('#view-dash').classList.contains('active')) animateDash();
  }
  function renderVolume(){
    const s=Storage.getSessions();
    const wk=Volume.weeklyVolume(s), wt=$('#vol-week');
    wt.innerHTML= wk.length?`<thead><tr><th>Semaine</th><th>Tonnage</th></tr></thead><tbody>`+wk.map(w=>`<tr><td>${w.week}</td><td>${format(w.tonnage)} kg</td></tr>`).join('')+`</tbody>`:`<tbody><tr><td class="muted">Aucune donnée</td></tr></tbody>`;
    const per=Volume.perSession(s), st=$('#vol-sess');
    st.innerHTML= per.length?`<thead><tr><th>Date</th><th>Séance</th><th>Tonnage</th></tr></thead><tbody>`+per.map(p=>`<tr><td>${p.date||'—'}</td><td>${esc(p.name)}</td><td>${format(p.tonnage)} kg</td></tr>`).join('')+`</tbody>`:`<tbody><tr><td class="muted">Aucune donnée</td></tr></tbody>`;
  }
  function renderPR(){
    const recs=PR.records(Storage.getSessions()), t=$('#pr-table');
    t.innerHTML= recs.length?`<thead><tr><th>Exercice</th><th>Charge</th><th>1RM est.</th><th>Vol/série</th></tr></thead><tbody>`+
      recs.map(r=>`<tr class="hi"><td>${esc(r.name)}</td><td>${r.maxWeight.weight||'—'} kg</td><td>${r.maxEst1RM.value||'—'} kg</td><td>${r.maxSetVolume.value?format(r.maxSetVolume.value)+' kg':'—'}</td></tr>`).join('')+`</tbody>`
      :`<tbody><tr><td class="muted">Aucun record. Importe des séances.</td></tr></tbody>`;
  }
  let chart=null;
  function renderChartCtrl(){
    const s=Storage.getSessions(), sel=$('#ch-ex');
    const names=exerciseNamesFallback(s).sort((a,b)=>a.localeCompare(b));
    const prev=sel.value;
    sel.innerHTML=names.map(n=>`<option>${esc(n)}</option>`).join('');
    if(names.includes(prev)) sel.value=prev;
    sel.onchange=drawChart; $('#ch-metric').onchange=drawChart;
    if($('#view-charts').classList.contains('active')) drawChart();
  }
  function drawChart(){
    const s=Storage.getSessions(), names=exerciseNamesFallback(s);
    const empty=$('#ch-empty');
    if(!names.length || typeof Chart==='undefined'){ empty.innerHTML=`<div class="empty-state"><div class="es-icon">◠</div><p>${names.length?'Graphiques indisponibles.':'Importe des séances pour voir tes courbes.'}</p></div>`; if(chart){chart.destroy();chart=null;} return; }
    empty.innerHTML='';
    const ex=$('#ch-ex').value, metric=$('#ch-metric').value, formula=Storage.getSettings().formula;
    const byDate=new Map();
    for(const ss of s){ if(!ss.date)continue; for(const e of (ss.exercises||[])){ if(e.name!==ex)continue;
      const w=+e.weight||0,reps=+e.reps||0,sets=+e.sets||1;
      let v = metric==='volume'?w*reps*sets : metric==='e1rm'?(OneRM.estimate(w,reps,formula)||0):w;
      byDate.set(ss.date, metric==='volume'?(byDate.get(ss.date)||0)+v:Math.max(byDate.get(ss.date)||0,v));
    }}
    const pts=[...byDate.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    if(chart)chart.destroy();
    chart=new Chart($('#ch-canvas').getContext('2d'),{
      type:'line',
      data:{labels:pts.map(p=>p[0]),datasets:[{data:pts.map(p=>Math.round(p[1]*10)/10),
        borderColor:getComputedStyle(document.documentElement).getPropertyValue('--amber').trim()||'#e8b04b',backgroundColor:(c)=>{const rgb=accentRGB();const g=c.chart.ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},.28)`);g.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0)`);return g;},
        borderWidth:2.5,pointRadius:3,pointBackgroundColor:'#e8b04b',pointBorderColor:'#0a0b0d',tension:.3,fill:true}]},
      options:{responsive:true,maintainAspectRatio:false,animation:{duration:reduced?0:900,easing:'easeOutCubic'},
        plugins:{legend:{display:false}},
        scales:{x:{ticks:{color:'#8a8780',font:{family:'Geist Mono'}},grid:{color:'rgba(255,255,255,.04)'}},
        y:{ticks:{color:'#8a8780',font:{family:'Geist Mono'}},grid:{color:'rgba(255,255,255,.04)'},beginAtZero:false}}}
    });
  }

  /* ---------- Helpers ---------- */
  let toastTimer=null;
  function toast(msg){
    const t=$('#toast'); t.textContent=msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2600);
  }
  function numN(v){ if(v===''||v==null)return null; const n=parseFloat(String(v).replace(',','.')); return isNaN(n)?null:n; }
  function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // expose pour Charts fallback éventuel
  window.Charts = window.Charts || { exerciseNames: exerciseNamesFallback };
})();
