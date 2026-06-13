/* ════════════════════════════════════════════════════════════════════
   GÉNÉRATEUR — logique pure, sans dépendance à React.
   ════════════════════════════════════════════════════════════════════ */
import {
  CHARR, NORN, ASURA, SYLVARI, HUMAN, HUMAN_ETHNIES, RACES,
  LEGION_LABEL,
} from "../data/races.js";

const rand = (a) => a[Math.floor(Math.random() * a.length)];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "douce" = sans lettres dures ; "dure" = au moins une.
const HARD = /[kxz]|gr|dr|rd|gn|rr|ck|th/i;
const matchSound = (n, s) => (s === "Toutes" ? true : s === "Dure" ? HARD.test(n) : !HARD.test(n));

function genCharr(sex, legionPref, sound) {
  for (let i = 0; i < 60; i++) {
    const first = rand(CHARR[sex]);
    let wb;
    if (legionPref === "_free") wb = rand(CHARR.warbands.filter((w) => !LEGION_LABEL[w]));
    else if (legionPref) wb = legionPref;
    else wb = rand(CHARR.warbands);
    const role = rand(CHARR.roles.filter((r) => r.toLowerCase() !== wb.toLowerCase()));
    const last = `${wb}${role}`;
    if (!matchSound(first + last, sound)) continue;
    const lg = LEGION_LABEL[wb];
    return {
      first, last,
      detail: lg ? `Warband « ${wb} » · ${lg}` : `Warband « ${wb} » (indépendante)`,
      meaning: `Prénom romain. Nom = warband « ${wb} »${lg ? ` (${lg})` : ""} + rôle « ${role} ».`,
    };
  }
  return null;
}

function genNorn(sex, sound) {
  for (let i = 0; i < 60; i++) {
    const first = rand(NORN[sex]);
    const roll = Math.random();
    let last, detail, meaning;
    if (roll < 0.5) {
      const p = rand(NORN.parents.filter((x) => x !== first));
      const suf = sex === "F" ? "sdottir" : "sson";
      last = p + suf;
      detail = `${sex === "F" ? "Matronyme" : "Patronyme"} · enfant de ${p}`;
      meaning = `Prénom nordique. « ${last} » = ${sex === "F" ? "fille" : "fils"} de ${p} (filiation non héréditaire).`;
    } else if (roll < 0.8) {
      last = rand(NORN.deeds);
      detail = "Surnom d'exploit";
      meaning = `Prénom nordique. « ${last} » est un surnom gagné par un haut fait.`;
    } else {
      last = rand(NORN.titles);
      detail = "Titre personnel";
      meaning = `Prénom nordique. « ${last} » est un titre adopté pour coller à sa légende.`;
    }
    if (!matchSound(first + last, sound)) continue;
    return { first, last, detail, meaning };
  }
  return null;
}

function genAsura(sex, sound) {
  for (let i = 0; i < 60; i++) {
    let name, dbl = null;
    // 50/50 : nom de la banque étendue, ou construction procédurale par syllabes.
    if (Math.random() < 0.5 && ASURA.names[sex].length) {
      name = rand(ASURA.names[sex]);
    } else {
      dbl = rand(ASURA.midDouble);
      name = rand(ASURA.onset).toLowerCase() + rand(ASURA.vowel) + dbl +
        (sex === "F" ? rand(ASURA.tailF) : rand(ASURA.tailM));
      name = cap(name);
    }
    if (!matchSound(name, sound)) continue;
    const hon = Math.random() > 0.5;
    const last = hon ? rand(ASURA.honorific) : "";
    return {
      first: name, last, lastIsLoose: true,
      detail: hon ? `Honorifique : ${last}` : "Nom unique (krewe non déclarée)",
      meaning: `Nom court asura${dbl ? ` à double consonne (« ${dbl} »)` : ""}, finale ${sex === "F" ? "vocalique (féminin)" : "consonantique (masculin)"}.${hon ? ` Honorifique : « ${last} ».` : ""}`,
    };
  }
  return null;
}

function genSylvari(sex, sound) {
  for (let i = 0; i < 60; i++) {
    const first = rand(SYLVARI[sex]);
    if (!matchSound(first, sound)) continue;
    if (Math.random() > 0.55) {
      const c = rand(SYLVARI.cycles);
      const fr = { "of Dawn": "Aube", "of Noon": "Midi", "of Dusk": "Crépuscule", "of Night": "Nuit" }[c];
      return { first, last: c, lastIsLoose: true, detail: `Cycle d'éveil : ${fr}`, meaning: `Nom celte. « ${c} » = cycle d'éveil (${fr}).` };
    }
    return { first, last: "", detail: "Nom unique (sans nom de famille)", meaning: "Nom celte unique, sans nom de famille — usage le plus courant." };
  }
  return null;
}

function genHuman(sex, ethniePref, sound) {
  for (let i = 0; i < 60; i++) {
    const ethnie = ethniePref && ethniePref !== "Aléatoire" ? ethniePref : rand(HUMAN_ETHNIES);
    const e = HUMAN[ethnie];
    const first = rand(e[sex]);
    const last = rand(e.last);
    if (!matchSound(first + last, sound)) continue;
    const o = { Krytan: "européenne", Ascalonien: "nord-européenne", Canthan: "est-asiatique", Elonien: "arabo-moyen-orientale" }[ethnie];
    return { first, last, detail: `Ethnie : ${ethnie}`, meaning: `Prénom et nom de lignée ${o} (${ethnie}), même culture krytanaise.` };
  }
  return null;
}

function assemble(b, fmt) {
  if (fmt === "first") return b.first;
  if (fmt === "last") return !b.last || b.lastIsLoose ? b.first : b.last;
  return b.last ? `${b.first} ${b.last}` : b.first;
}

/** Génère un nom unique selon les options, ou null si la sonorité bloque tout. */
export function generateOne(o) {
  const r = o.race === "Aléatoire" ? rand(RACES) : o.race;
  const s = o.sex === "Aléatoire" ? rand(["M", "F"]) : o.sex;
  let b = null;
  if (r === "Charr") b = genCharr(s, o.legion, o.sound);
  else if (r === "Norn") b = genNorn(s, o.sound);
  else if (r === "Asura") b = genAsura(s, o.sound);
  else if (r === "Sylvari") b = genSylvari(s, o.sound);
  else b = genHuman(s, o.ethnie, o.sound);
  if (!b) return null;
  const full = assemble(b, o.format);
  // Filtres avancés optionnels
  if (o.initial && o.initial !== "Toutes" && full[0]?.toUpperCase() !== o.initial) return null;
  if (o.maxLen && full.length > o.maxLen) return null;
  if (o.minLen && full.length < o.minLen) return null;
  return {
    id: Math.random().toString(36).slice(2),
    full, detail: b.detail, meaning: b.meaning, race: r, sex: s,
  };
}

/** Génère un lot de `count` noms uniques. `avoid` = Set de noms déjà vus (anti-répétition). */
export function generateBatch(o, count, avoid) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < count * 30 && out.length < count; i++) {
    const n = generateOne(o);
    if (!n) continue;
    if (seen.has(n.full)) continue;
    if (avoid && avoid.has(n.full)) continue;
    seen.add(n.full);
    out.push(n);
  }
  // Repli : si l'anti-répétition assèche trop, on autorise les déjà-vus
  if (out.length < count) {
    for (let i = 0; i < count * 30 && out.length < count; i++) {
      const n = generateOne(o);
      if (!n || seen.has(n.full)) continue;
      seen.add(n.full); out.push(n);
    }
  }
  return out;
}

/* ════════════════ WARBAND CHARR COMPLÈTE ════════════════
   Une warband partage le même nom de warband ; chaque membre a un prénom
   romain et un rôle distinct. Le thème teinte les rôles (cohérence). */

// Palettes de rôles par thème. Les thèmes "légion" sont alignés sur les
// quatre Hautes Légions ; les autres sont des spécialités de warband.
const WARBAND_THEMES = {
  "Légion de Fer": { prefix: "Iron", roles: ["blade", "shield", "ward", "gear", "bolt", "hammer", "wall", "anvil", "forge", "rivet", "plate", "spark", "bulwark", "vise", "clamp"] },
  "Légion de Sang": { prefix: "Blood", roles: ["fang", "gore", "maul", "rend", "claw", "fury", "carver", "render", "ripper", "savage", "bane", "render", "slayer", "render", "butcher"] },
  "Légion des Cendres": { prefix: "Ash", roles: ["shade", "shadow", "stalker", "shiv", "creep", "whisper", "veil", "snare", "dagger", "silence", "phantom", "cinder", "smoke", "dusk"] },
  "Légion des Flammes": { prefix: "Flame", roles: ["flame", "ember", "ash", "pyre", "blaze", "scorch", "char", "cinder", "burn", "fury", "kindle", "smolder", "wrath", "brand"] },
  "Chasse": { prefix: null, roles: ["hunt", "track", "snare", "fang", "claw", "stalker", "mane", "pelt", "hide", "tail", "scar", "stripe", "tracker", "trap", "prowl"] },
  "Tempête": { prefix: null, roles: ["storm", "bolt", "spark", "frost", "thunder", "gale", "squall", "surge", "shock", "tempest", "rime", "sleet", "wind", "crash"] },
  "Ombre": { prefix: null, roles: ["shade", "shadow", "veil", "creep", "whisper", "silence", "dusk", "phantom", "shiv", "snare", "mist", "gloom", "stalker", "dagger"] },
  "Carnage": { prefix: null, roles: ["gore", "maul", "rend", "bane", "doom", "carver", "ripper", "savage", "butcher", "slayer", "render", "wreck", "ruin", "crush"] },
};
export const WARBAND_THEME_LIST = Object.keys(WARBAND_THEMES);
const WARBAND_RANKS = ["Tribun (primus)", "Légionnaire", "Légionnaire", "Soldat", "Soldat", "Soldat", "Soldat", "Soldat"];

export function generateWarband(o) {
  const size = o.size || 6;
  const legionPref = o.legion;

  // Choix du thème : explicite, sinon déduit de la légion, sinon aléatoire.
  let theme = o.theme && o.theme !== "Aléatoire" ? o.theme : null;
  if (!theme) {
    if (legionPref && LEGION_LABEL[legionPref]) theme = LEGION_LABEL[legionPref];
    else theme = rand(WARBAND_THEME_LIST);
  }
  const themeData = WARBAND_THEMES[theme] || null;

  // Nom de warband : imposé par le thème de légion, sinon selon la légion
  // demandée, sinon aléatoire.
  let wb;
  if (themeData && themeData.prefix) wb = themeData.prefix;
  else if (legionPref === "_free") wb = rand(CHARR.warbands.filter((w) => !LEGION_LABEL[w]));
  else if (legionPref) wb = legionPref;
  else wb = rand(CHARR.warbands);
  const legion = LEGION_LABEL[wb];

  // Pool de rôles : majoritairement le thème, un peu du pool général.
  const themeRoles = themeData ? themeData.roles : CHARR.roles;
  const pickRole = () =>
    (Math.random() < 0.78 ? rand(themeRoles) : rand(CHARR.roles)).toLowerCase();

  const usedRoles = new Set();
  const usedFirst = new Set();
  const members = [];
  for (let m = 0; m < size; m++) {
    const sex = rand(["M", "F"]);
    let first, role, guard = 0;
    do { first = rand(CHARR[sex]); } while (usedFirst.has(first) && guard++ < 30);
    guard = 0;
    do { role = pickRole(); }
    while ((usedRoles.has(role) || role === wb.toLowerCase()) && guard++ < 40);
    usedFirst.add(first); usedRoles.add(role);
    members.push({
      id: Math.random().toString(36).slice(2),
      full: `${first} ${wb}${role}`,
      rank: WARBAND_RANKS[m] || "Soldat",
      sex,
    });
  }
  return { warband: wb, legion, theme, members };
}

/* ════════════════ NOM DE GUILDE ════════════════
   Banques par thème + structures variées + tag paramétrable. */
const GUILD_ADJ = {
  Martial: ["Iron", "Steel", "Crimson", "Burning", "Shattered", "Bloodbound", "Vengeful", "Unbroken", "Relentless", "Savage", "Brazen", "Wrathful", "Hardened", "Battleborn", "Warforged", "Ironclad", "Merciless", "Dauntless", "Unyielding", "Fearless", "Stalwart", "Grim", "Bloodsworn", "Adamant", "Indomitable", "Vanguard", "Stormforged", "Bronze", "Scarred"],
  Mystique: ["Arcane", "Astral", "Ethereal", "Veiled", "Whispering", "Shrouded", "Mystic", "Phantom", "Spectral", "Eldritch", "Twilight", "Moonlit", "Starbound", "Dreaming", "Enchanted", "Unseen", "Fated", "Runic", "Celestial", "Voidtouched", "Glimmering", "Hallowed", "Wraithbound", "Sunken", "Echoing"],
  Noble: ["Radiant", "Golden", "Exalted", "Sovereign", "Imperial", "Eternal", "Resplendent", "Gilded", "Ascendant", "Valiant", "Honored", "Majestic", "Regal", "Glorious", "Luminous", "Crowned", "Illustrious", "Venerable", "Pristine", "Highborn"],
  Sombre: ["Black", "Ashen", "Cursed", "Forsaken", "Fallen", "Withered", "Hollow", "Bleak", "Dread", "Sinister", "Obsidian", "Nightfall", "Bloodred", "Doomed", "Rotting", "Plagued", "Mournful", "Vile", "Tainted", "Ravenous", "Umbral", "Funeral"],
  Nature: ["Verdant", "Thornbound", "Wildgrown", "Bloomfall", "Emerald", "Ancient", "Mossy", "Sylvan", "Rootbound", "Tidal", "Stormcalled", "Frostbitten", "Sunlit", "Earthen", "Bramblewood", "Grovekeeper", "Windswept", "Riverborn", "Wolfblood", "Bearhide"],
  "Érudit": ["Enlightened", "Inquisitive", "Empirical", "Theoretical", "Boundless", "Lucid", "Methodical", "Ingenious", "Calibrated", "Recursive", "Quantum", "Synthetic", "Analytical", "Astute", "Perpetual", "Infinite", "Precise", "Distilled"],
};
const GUILD_NOUN = {
  Martial: ["Vanguard", "Legion", "Phalanx", "Spears", "Blades", "Bastion", "Wardens", "Reckoning", "Crusade", "Onslaught", "Battalion", "Banner", "Shields", "Fangs", "Hammers", "Brigade", "Sentinels", "Warhost", "Conquest", "Bulwark", "Talons"],
  Mystique: ["Covenant", "Conclave", "Circle", "Veil", "Oracle", "Mysteries", "Enigma", "Coven", "Seers", "Whispers", "Communion", "Rite", "Aether", "Cabal", "Convergence", "Eclipse", "Vision", "Reverie", "Sanctum", "Spire"],
  Noble: ["Order", "Crown", "Court", "Dominion", "Sovereignty", "Throne", "Aegis", "Ascendancy", "Concord", "Realm", "Dynasty", "Standard", "Accord", "Heralds", "Regency", "Pact", "Lineage", "Banner"],
  Sombre: ["Shroud", "Grave", "Reckoning", "Requiem", "Doom", "Plague", "Ruin", "Wake", "Curse", "Abyss", "Maw", "Hollow", "Dirge", "Gallows", "Carrion", "Nightmare", "Tomb", "Famine", "Scourge"],
  Nature: ["Grove", "Roots", "Wilds", "Pack", "Thicket", "Bloom", "Tide", "Storm", "Hollow", "Den", "Warren", "Canopy", "Briar", "Verge", "Hunt", "Wardens", "Seedlings", "Glade"],
  "Érudit": ["Collective", "Initiative", "Synthesis", "Equation", "Theorem", "Inquiry", "Compendium", "Krewe", "Symposium", "Index", "Paradigm", "Construct", "Codex", "Hypothesis", "Apparatus"],
};
const GUILD_OF = ["of the Mists", "of Tyria", "of Ascalon", "of the Dragon", "of the Pact", "of Orr", "of the Eternal Alchemy", "of the Six", "of the Wilds", "of Dawn", "of the Deep", "of the Throne", "of Kryta", "of the Frost", "of Embers", "of the Forgotten", "of the Vigil", "of the Sunspear", "of the Pale Tree", "of Dusk", "of the Ley Lines", "of the Wyrm", "of the Stoneheart", "of the Mistwalkers"];
const GUILD_SINGLE = ["Aegis", "Nemesis", "Apex", "Vortex", "Requiem", "Solstice", "Equinox", "Paragon", "Vesper", "Oblivion", "Sovereign", "Wyrmfall", "Stormcrown", "Ironheart", "Doomsayer", "Voidcaller", "Sunreaver", "Frostmourn", "Bloodmoon", "Emberfall", "Nightshade", "Direwood", "Thornveil", "Grimward", "Ashfall", "Starfall", "Duskborne", "Wraithgate", "Bonereaper", "Stormveil"];
export const GUILD_THEMES = Object.keys(GUILD_ADJ);

/** Critères : { theme: "Aléatoire"|nom, structure: "any"|"two"|"of"|"single", tagLen: 0|2|3|4, initial } */
export function generateGuild(o = {}) {
  const theme = o.theme && o.theme !== "Aléatoire" ? o.theme : rand(GUILD_THEMES);
  let structure = o.structure || "any";
  if (structure === "any") structure = rand(["two", "two", "of", "single"]); // pondère "two"

  let name;
  if (structure === "single") {
    name = rand(GUILD_SINGLE);
    if (Math.random() > 0.6) name += " " + rand(GUILD_OF);
  } else {
    const adj = rand(GUILD_ADJ[theme]);
    const noun = rand(GUILD_NOUN[theme]);
    name = `${adj} ${noun}`;
    if (structure === "of") name += " " + rand(GUILD_OF);
  }

  // tag : longueur demandée (0 = aléatoire 2-4), à partir des initiales/lettres du nom
  const letters = name.replace(/^(the |of )/i, "").replace(/[^a-zA-Z]/g, "");
  const words = name.replace(/of the | of | the /gi, " ").split(/\s+/).filter(Boolean);
  const tagLen = o.tagLen && o.tagLen > 0 ? o.tagLen : 2 + Math.floor(Math.random() * 3);
  let tag;
  if (words.length >= tagLen) tag = words.slice(0, tagLen).map((w) => w[0]).join("").toUpperCase();
  else tag = letters.slice(0, tagLen).toUpperCase();
  tag = tag.padEnd(2, letters[1]?.toUpperCase() || "X").slice(0, tagLen);

  return { id: Math.random().toString(36).slice(2), name, tag: `[${tag}]`, theme, structure };
}

export function generateGuilds(count, o = {}) {
  const out = []; const seen = new Set();
  for (let i = 0; i < count * 30 && out.length < count; i++) {
    const g = generateGuild(o);
    if (o.initial && o.initial !== "Toutes" && g.name[0]?.toUpperCase() !== o.initial) continue;
    if (seen.has(g.name)) continue;
    seen.add(g.name); out.push(g);
  }
  return out;
}
