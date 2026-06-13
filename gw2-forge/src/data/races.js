/* ════════════════════════════════════════════════════════════════════
   DONNÉES DE NOMMAGE — GUILD WARS 2
   Conventions canon : wiki.guildwars2.com/wiki/Character_creation
   Banques étendues : ~200 prénoms par race et par sexe (mélange de noms
   attestés dans le lore et de noms construits sur les mêmes racines
   linguistiques). Les "noms de famille" charr/norn restent en partie
   générés par combinaison (warband+rôle, patronymes), ce qui porte le
   champ des possibles à plusieurs dizaines de milliers de noms complets.
   ════════════════════════════════════════════════════════════════════ */

/* ─── CHARR ── prénom romain/grec + (warband + rôle) ───────────────── */
export const CHARR = {
  M: [
  "Rytlock", "Bangar", "Smodur", "Maximin", "Tiberius", "Cassius", "Decimus", "Aurelius", "Valerian", "Korro",
  "Magnus", "Octavian", "Crucius", "Varro", "Dominus", "Galien", "Severus", "Brutus", "Gaius", "Lucius",
  "Quintus", "Titus", "Antonius", "Felix", "Maximus", "Cato", "Nerus", "Drusus", "Hadrian", "Marcus",
  "Crassus", "Pyre", "Forgemaster", "Brimstone", "Aetius", "Cassian", "Romulus", "Remus", "Cyprian", "Darius",
  "Flavinus", "Bruto", "Julian", "Martian", "Cyrinus", "Julior", "Hadriar", "Nasicius", "Cornan", "Aurelon",
  "Quintor", "Aurelanus", "Nerior", "Tiberon", "Domitus", "Hadrion", "Felicus", "Tacitar", "Varror",
  "Severax", "Nerio", "Cyrius", "Lucanor", "Salluanus", "Flaviax", "Nasicax", "Romulinus", "Tacitian",
  "Pompericus", "Romular", "Nasico", "Cyriar", "Tacitanus", "Octavar", "Vespaus", "Lentuinus", "Domitar",
  "Quintius", "Cornon", "Vespao", "Rufar", "Martiaius", "Pompeus", "Valear", "Marcellinus", "Martiaericus",
  "Domiton", "Antonax", "Marcellar", "Crucian", "Julio", "Priscanus", "Caeliax", "Fabius", "Severius",
  "Pompeax", "Darianan", "Livion", "Darianax", "Salluo", "Titanus", "Valeor", "Antonus", "Romulax", "Cyrion",
  "Lucanius", "Juliar", "Cornor", "Horaericus", "Felico", "Antonericus", "Cassion", "Cyrian", "Lentuar",
  "Lentuericus", "Lucanan", "Hadrianus", "Nerian", "Brutax", "Crucinus", "Caelius", "Neriax", "Auguston",
  "Marcellericus", "Liviax", "Severon", "Catonax", "Rufius", "Titaninus", "Titanan", "Caderus", "Volusian",
  "Darianus", "Caeliar", "Varrax", "Crassius", "Corninus", "Tullion", "Tullianus", "Urbanius", "Rufan",
  "Fabian", "Fabion", "Brutar", "Pacatian", "Vespan", "Censorin", "Priscius", "Varranus", "Flavior",
  "Septimius", "Livio", "Catonanus", "Decinus", "Septimar", "Cassianus", "Felicax", "Crassinus", "Livior",
  "Valeus", "Magno", "Octavax", "Livius", "Vitelanus", "Augustanus", "Aproniar", "Octavus", "Valeius",
  "Magninus", "Augustan", "Galeron", "Juliax", "Priscar", "Fabiar", "Magnon", "Septiminus", "Vitelius",
  "Balbinus", "Carinus", "Brutius", "Cornus", "Nerius", "Nerion", "Brutanus", "Tiberinus", "Urbanax",
  "Drusan", "Rufon", "Julius", "Julion", "Drusinus", "Livian", "Florian", "Cyrianus", "Cyrio", "Varrian",
  "Gracchanus", "Aurelus", "Aurelian", "Aurelan"
],
  F: [
  "Almorra", "Reeva", "Mona", "Crecia", "Efut", "Kasha", "Livia", "Octavia", "Cassia", "Valeria", "Aurelia",
  "Drusa", "Vibia", "Marcia", "Sabina", "Tullia", "Lucilla", "Junia", "Flavia", "Cornelia", "Agrippina",
  "Faustina", "Calpurnia", "Domitia", "Servilia", "Antonia", "Claudia", "Portia", "Vipsania", "Aelia",
  "Maxima", "Seris", "Helena", "Drusilla", "Camilla", "Domita", "Prisca", "Deciora", "Flavilla", "Julina",
  "Martiaessa", "Marcellena", "Aurelina", "Hadriessa", "Horaora", "Lucania", "Aurelilla", "Tulliessa",
  "Darianora", "Priscena", "Cruciora", "Octavina", "Martia", "Lucanina", "Romulena", "Augustalia",
  "Marcellora", "Juliena", "Vitelia", "Tulliena", "Augustena", "Darianina", "Crucina", "Livilla", "Pompena",
  "Titana", "Dariana", "Hora", "Sallua", "Tacitessa", "Augusta", "Septimora", "Lucanena", "Crucilla",
  "Quintalia", "Titania", "Severilla", "Marcella", "Tullina", "Octavena", "Tiberalia", "Romulalia", "Neria",
  "Cassiena", "Caeliora", "Titanalia", "Gracchalia", "Magnora", "Nerina", "Vespa", "Severia", "Aurelessa",
  "Crassiena", "Varrina", "Galerora", "Vespaina", "Pompeora", "Tacita", "Livialia", "Cyrilla", "Fabialia",
  "Catona", "Brutina", "Corna", "Felicena", "Fabiora", "Severora", "Vitelena", "Urbana", "Antonilla",
  "Fabiena", "Gracchilla", "Pompeina", "Brutalia", "Galerena", "Salluora", "Tiberia", "Varria", "Octavilla",
  "Quintia", "Galeressa", "Antonalia", "Urbanora", "Catonalia", "Lentua", "Rufena", "Tacitena", "Rufora",
  "Tiberilla", "Felicessa", "Cyria", "Liviessa", "Rufina", "Bruta", "Gracchena", "Salluena", "Septimina",
  "Felicilla", "Hadria", "Brutilla", "Domitora", "Urbanilla", "Rufessa", "Magnessa", "Domitalia", "Quintessa",
  "Antonora", "Deciessa", "Vitelina", "Catonora", "Horaina", "Valena", "Varra", "Septimilla", "Lentuora",
  "Varrilla", "Crassina", "Decilla", "Romulilla", "Drusina", "Crassia", "Neriessa", "Priscilla", "Cassina",
  "Decia", "Cornia", "Decialia", "Liviena", "Brutena", "Magnena", "Vespaora", "Lentuilla", "Varralia",
  "Valeia", "Cornena", "Nerialia", "Valea", "Nasica", "Brutora", "Neriora", "Rufia", "Decina", "Martiaena",
  "Drusessa", "Hadriena", "Magnalia", "Caelia", "Fabina", "Magna", "Nasicessa", "Cyriora", "Valeora",
  "Drusora", "Fabia", "Rufa", "Cyrialia", "Drusia", "Aurela", "Aurelena", "Aurelora"
],
  warbands: [
  "Iron", "Blood", "Ash", "Flame", "Steel", "Stone", "Storm", "Char", "Grim", "War", "Doom", "Sharp", "Dark",
  "Bone", "Drake", "Fierce", "Sear", "Razor", "Gore", "Crag", "Frost", "Shadow", "Wreck", "Brim", "Sword",
  "Strike", "Claw", "Night", "Fang", "Pride", "Forge", "Hidden", "Eye", "Crimson", "Howl", "Blaze", "Ember",
  "Stalk", "Rend", "Maul"
],
  roles: [
  "blade", "shot", "claw", "fang", "maul", "soul", "shade", "shield", "ward", "bolt", "spark", "gear",
  "flame", "storm", "ember", "frost", "ash", "bone", "grave", "doom", "splitter", "cleaver", "breaker",
  "render", "stalker", "shiv", "hunt", "track", "snare", "mane", "tail", "scar", "stripe", "roar", "fury",
  "bane", "rend", "hide", "pelt", "heart", "mantle", "strider", "fist", "brand", "whisper", "creep", "snarl",
  "gnash", "horn", "wing"
],
};
export const LEGION_PREFIX = { "Légion de Fer": "Iron", "Légion de Sang": "Blood", "Légion des Cendres": "Ash", "Légion des Flammes": "Flame", "Warband libre": "_free" };
export const LEGION_LABEL = { Iron: "Légion de Fer", Blood: "Légion de Sang", Ash: "Légion des Cendres", Flame: "Légion des Flammes" };

/* ─── NORN ── prénom nordique + filiation / surnom / titre ─────────── */
export const NORN = {
  M: [
  "Bjorn", "Knut", "Magni", "Olaf", "Ragnar", "Sten", "Eivind", "Haldor", "Torvald", "Ulfgar", "Asgeir",
  "Leif", "Sigurd", "Halvar", "Brynjar", "Eirik", "Hakon", "Vidar", "Arne", "Einar", "Frode", "Gunnar",
  "Ivar", "Kjell", "Njal", "Roald", "Sven", "Trygve", "Vegard", "Borje", "Garm", "Hjalmar", "Bram", "Anluin",
  "Hrodulf", "Arnrik", "Ormgar", "Skaldwald", "Hrolfgar", "Halvgar", "Hrolfmund", "Valdrik", "Einstein",
  "Ormrik", "Veggrim", "Roalgeir", "Valddar", "Eingar", "Fenrrik", "Magnrik", "Thromhelm", "Hjalgeir",
  "Brynvar", "Olavthor", "Olavmund", "Svengeir", "Hakthor", "Gunnulf", "Ivardar", "Sigrulf", "Geirulf",
  "Svenmund", "Magndar", "Olavstein", "Olavnar", "Ragnmund", "Geirnar", "Bryngeir", "Vidstein", "Hjaldar",
  "Skaldgar", "Borgmund", "Bjorhelm", "Gunnrik", "Hrodgeir", "Leifmund", "Frodnar", "Veghelm", "Geirstein",
  "Ynggar", "Knutdar", "Bjornar", "Hakhelm", "Bryngar", "Tryggeir", "Haknar", "Hrodgrim", "Trygmund",
  "Roalrik", "Sigrdar", "Ivarrik", "Brynhelm", "Eivmund", "Frodulf", "Leifdar", "Arnwald", "Frodstein",
  "Sigrvar", "Ivarnar", "Eirdar", "Kjelthor", "Ragngeir", "Frodthor", "Grimnar", "Kjelvar", "Hjalvar",
  "Knutnar", "Thromthor", "Hrolfrik", "Asgwald", "Stendar", "Vidgrim", "Einhelm", "Kjelhelm", "Ulfvar",
  "Thromgrim", "Trygdar", "Knutwald", "Bjorulf", "Eivrik", "Vegvar", "Kjelwald", "Skaldvar", "Halvrik",
  "Ynghelm", "Asgrik", "Halvnar", "Ragnvar", "Trygthor", "Svenhelm", "Einwald", "Vegthor", "Haldgar",
  "Grimwald", "Vidulf", "Torvgeir", "Hjalwald", "Hrodhelm", "Knutulf", "Magnvar", "Roalmund", "Haldhelm",
  "Magnhelm", "Ragndar", "Halvwald", "Sigrrik", "Thromstein", "Haldwald", "Hrolfdar", "Borgulf", "Fenrwald",
  "Hakgrim", "Eivvar", "Vidgeir", "Vidthor", "Eivstein", "Ivarstein", "Eirulf", "Eirvar", "Arnhelm", "Asgnar",
  "Ormulf", "Asggar", "Gunngeir", "Eivthor", "Njaldar", "Eivhelm", "Yngrik", "Hakgeir", "Njalgrim", "Asgulf",
  "Hakgar", "Eivulf", "Roalthor", "Geirthor", "Ulfulf", "Eivgeir", "Asghelm", "Vegstein", "Einmund",
  "Svendar", "Ormgeir", "Valdmund", "Grimulf", "Eindar", "Arnulf", "Torvgar", "Stenrik", "Fenrhelm",
  "Veggeir", "Eirnar", "Eingeir", "Grimhelm", "Ormhelm", "Eirgeir", "Yngdar", "Valdulf", "Borgrik", "Yngwald",
  "Arnmund"
],
  F: [
  "Astrid", "Eir", "Ingrid", "Sigrun", "Solveig", "Thora", "Gaerta", "Freydis", "Hilde", "Runa", "Sif",
  "Yngvild", "Borghild", "Dagny", "Gudrun", "Ragnhild", "Saga", "Tove", "Aslaug", "Brenna", "Eira", "Frigga",
  "Gerd", "Helga", "Idunn", "Kari", "Liv", "Oddny", "Senja", "Tyra", "Vigdis", "Asta", "Greta", "Maela",
  "Veggerd", "Hjalwyn", "Ragnlin", "Ivarfrid", "Vegdis", "Roala", "Hrodfrid", "Bryndis", "Njallaug",
  "Valdveig", "Halvunn", "Ormlin", "Frodlaug", "Svendis", "Eivdis", "Olavhild", "Brynlaug", "Haklaug",
  "Sigra", "Gunnhild", "Eirrun", "Kjellin", "Ynggerd", "Einlaug", "Valdrun", "Hrodny", "Torvgerd", "Hrodgerd",
  "Leifveig", "Geira", "Haldveig", "Veghild", "Haldrun", "Ormlaug", "Njalhild", "Ragna", "Hakrun", "Stenveig",
  "Geirborg", "Vidlin", "Skaldlaug", "Torvlaug", "Geirdis", "Stenlaug", "Svenfrid", "Vidhild", "Magnlaug",
  "Brynwyn", "Hrodlin", "Stena", "Fenrwyn", "Viddis", "Eirunn", "Einlin", "Asgborg", "Haklin", "Ragnborg",
  "Grimborg", "Thromwyn", "Torvborg", "Fenrveig", "Sigrunn", "Grimdis", "Ivarlin", "Magnhild", "Tryggerd",
  "Hrolfgerd", "Vidveig", "Eivveig", "Trygveig", "Fenrhild", "Ragngerd", "Haldborg", "Brynunn", "Hjalborg",
  "Valdunn", "Thromrun", "Sigrborg", "Vegveig", "Grimveig", "Trygunn", "Halva", "Halvlaug", "Veglaug",
  "Fenra", "Yngny", "Knutny", "Geirwyn", "Ormgerd", "Roalunn", "Eivgerd", "Torvunn", "Eirhild", "Vegborg",
  "Svenlaug", "Vegwyn", "Borglin", "Arngerd", "Hrolflin", "Gunna", "Halvdis", "Sigrhild", "Einborg",
  "Eivfrid", "Bjorhild", "Ynga", "Valda", "Gunnrun", "Olavunn", "Grimwyn", "Hjaldis", "Stenhild", "Hrolfhild",
  "Yngunn", "Knuta", "Frodveig", "Einfrid", "Borgwyn", "Gunnborg", "Eivny", "Ulfwyn", "Froddis", "Hakhild",
  "Hrolfny", "Roallin", "Haka", "Knutfrid", "Asghild", "Halddis", "Ivarrun", "Arnunn", "Leifgerd", "Roaldis",
  "Einrun", "Arndis", "Bjorunn", "Throma", "Einwyn", "Leifwyn", "Asgrun", "Eirborg", "Olavfrid", "Eirfrid",
  "Eivlin", "Borgveig", "Ivarny", "Leifdis", "Vida", "Ulfdis", "Arnborg", "Knutwyn", "Ulfa", "Njalborg",
  "Magnrun", "Njalveig", "Bjorrun", "Frodhild", "Olavdis", "Asgdis", "Borgborg", "Trygrun", "Hjalhild",
  "Arna", "Magnny", "Skaldgerd", "Eirdis"
],
  parents: ["Eir", "Knut", "Olaf", "Ragnar", "Sten", "Asgeir", "Sigrun", "Astrid", "Thora", "Magni", "Bjorn", "Ulf", "Gunnar", "Hilde", "Svana", "Leif", "Ivar", "Runa", "Sven", "Tove", "Sigurd", "Halvar", "Brynjar", "Eirik", "Hakon", "Vidar", "Frode", "Yngvild", "Dagny", "Gudrun"],
  deeds: ["Cliffstrider", "Wolfborn", "Bearclaw", "Frosthammer", "Icebound", "Stormcaller", "Ravenwing", "Snowmane", "Trueshot", "Wyrmbane", "Drakeslayer", "Farwalker", "Whitebear", "Ironhowl", "Stonefist", "Mistwalker", "Frostmaul", "Skybreaker", "Thornheart", "Wildaxe", "Stormborn", "Grimmaw", "Direhowl", "Oakenshield"],
  titles: ["the Hunter", "the Bear", "the Bold", "the Sun Chaser", "the Wolfborn", "the Unbroken", "the Far-Strider", "the Skald", "the Raven", "the Snowblind", "the Bearclaw", "the Giant-Slayer", "the Wanderer", "the Stalwart", "the Frostborn", "the Wolf"],
};

/* ─── ASURA ── nom court à double consonne (procédural + banque) ───── */
export const ASURA = {
  names: {
    M: [
    "Snaff", "Vekk", "Gixx", "Blish", "Gorr", "Klob", "Zinn", "Briizz", "Doxx", "Frizz", "Brakk", "Plonk",
    "Trell", "Skrritt", "Dunk", "Brizz", "Gneggid", "Truddax", "Grokki", "Froggu", "Vikk", "Drattix",
    "Grinnip", "Zwasson", "Plaffit", "Grokkog", "Quettut", "Kloffok", "Zwerra", "Vrepp", "Blolled", "Qummud",
    "Blitt", "Bloffok", "Kluddib", "Vakk", "Zwodd", "Krorrok", "Whabbob", "Trexxan", "Qusse", "Stoggut",
    "Trozzak", "Varrax", "Brillub", "Drappuk", "Quebbex", "Voggu", "Vabba", "Gennan", "Skillub", "Gumma",
    "Whoss", "Vrexx", "Zwoggen", "Zwuggu", "Gemmud", "Zwannid", "Drozzag", "Vriffeb", "Brobbox", "Drabbux",
    "Volluk", "Pliggab", "Triggid", "Snabbok", "Gnekket", "Vrammig", "Gnizza", "Qussak", "Klizzod", "Dremmun",
    "Kluxxud", "Zoffit", "Zizzix", "Skoffe", "Blerri", "Stukkep", "Snippab", "Kreppop", "Klollop", "Quosset",
    "Zwommab", "Zwittid", "Vessag", "Grille", "Gneddu", "Vreddo", "Frukkid", "Quoffid", "Bliss", "Freggix",
    "Gruffup", "Brommig", "Frulla", "Dretto", "Snottad", "Bretto", "Skabbax", "Blukkox", "Gnubben", "Blopped",
    "Vrokkox", "Quokkit", "Sniffu", "Brizzon", "Gribb", "Gredden", "Treddax", "Trimmut", "Klixx", "Zwaffa",
    "Brussob", "Breggid", "Droppax", "Snoxxap", "Zoppan", "Trimmu", "Bruppup", "Whorrin", "Zeppob", "Kronnib",
    "Plonnat", "Blimmep", "Stizzit", "Plurr", "Gnallek", "Skummox", "Klazzod", "Zweppu", "Plabb", "Pluddex",
    "Gnabbox", "Groffug", "Zweffi", "Bralla", "Quarret", "Krorren", "Dromm", "Snammag", "Stakkag", "Zwuffu",
    "Zissox", "Kluzzup", "Frubbat", "Brullun", "Pliggig", "Whaggak", "Vroddan", "Whirr", "Broxxod", "Vrussug",
    "Treffop", "Stollox", "Gorruk", "Stossin", "Fraxxen", "Plabbon", "Blukko", "Whenn", "Kruttit", "Pluxxot",
    "Krubbix", "Zaffek", "Zazzib", "Gruddax", "Vixxup", "Staddot", "Skutto", "Krassix", "Snobbid", "Skimmi",
    "Drubbod", "Plessex", "Plottob", "Krummip", "Zoppux", "Vexxu", "Snattak", "Grazz", "Stettix", "Trexx",
    "Zwuff", "Virr", "Quodd", "Plizz", "Gull", "Draxx", "Ploff", "Skamm", "Blokk", "Stamm", "Snazz", "Frodd",
    "Vebb", "Bleff", "Kratt", "Zizz", "Kroll", "Ploxx"
  ],
    F: [
    "Zojja", "Oola", "Kudu", "Doxa", "Phlunta", "Zinni", "Mella", "Brixa", "Gizzi", "Vimmi", "Tazzi",
    "Plonni", "Ketti", "Wixa", "Snazzi", "Ola", "Stossi", "Trubbie", "Gexxia", "Drilli", "Grunno", "Zwixxa",
    "Whilluo", "Kreggie", "Plizza", "Gessia", "Graggia", "Staxxuo", "Quffio", "Trallia", "Drappi", "Quabbia",
    "Gelli", "Sneffi", "Blerro", "Trinna", "Zozzi", "Blaffa", "Qubbi", "Stuggia", "Grossie", "Goffie",
    "Treddo", "Vimmio", "Zuxxa", "Valli", "Blisso", "Gullu", "Vrobbia", "Grissea", "Klessi", "Drunni",
    "Zixxo", "Quollo", "Vrussa", "Vrollie", "Frallo", "Skubbi", "Stonnia", "Briffa", "Vrebbua", "Skazzie",
    "Tranna", "Vreggo", "Vommo", "Kruxxoa", "Blexxia", "Drakko", "Viffa", "Froxxoa", "Trarri", "Whirri",
    "Whemmo", "Zasso", "Gegga", "Skokki", "Qurrua", "Snuxxua", "Venno", "Zwozza", "Snurria", "Zwozzi",
    "Zwilli", "Frigguo", "Groggoa", "Zanni", "Quittie", "Vrizzi", "Zoggi", "Zogga", "Frennia", "Zaxxo",
    "Krarria", "Snolla", "Bleffie", "Treddie", "Brubba", "Snilla", "Vemmi", "Snilli", "Trillie", "Vrobbuo",
    "Whaddo", "Stulli", "Brudda", "Zwemmia", "Zwuggi", "Zokkao", "Brenna", "Stiddie", "Trossia", "Droppo",
    "Brezzi", "Skiggo", "Drotti", "Vurra", "Krikko", "Sturra", "Whetta", "Kruddi", "Krigga", "Quolla",
    "Plikki", "Skixxo", "Vubboia", "Gexxa", "Snezzo", "Frossia", "Grennie", "Zwimmi", "Snagga", "Driggi",
    "Greffie", "Zullo", "Vagguo", "Vrakki", "Zelluia", "Verri", "Brudduo", "Gokki", "Snetta", "Grukki",
    "Quaddie", "Zakki", "Klaxxo", "Kloppie", "Quassa", "Stannea", "Gnirra", "Zebba", "Vrassi", "Vokkia",
    "Blurri", "Plotti", "Krimmi", "Whuffia", "Blotti", "Brixxi", "Vennaia", "Zwunnoa", "Skoggi", "Zaffia",
    "Zwezzoa", "Zaffo", "Drerruo", "Drimmo", "Skirro", "Frikka", "Stoddo", "Vazzi", "Klilla", "Fretta",
    "Stamma", "Bretta", "Zwoppa", "Skusso", "Vegga", "Vuppa", "Troggi", "Druddo", "Grirro", "Krexxo",
    "Wherra", "Whallo", "Pluxxo", "Gremma", "Whazza", "Skaxxi", "Snunno", "Drizzi", "Stebbo", "Klippo",
    "Greggo", "Snogga", "Frugga", "Druxxa", "Zakka", "Grassa", "Stoppi", "Snuffa"
  ],
  },
  onset: ["Z", "V", "G", "Bl", "Sn", "Kl", "Br", "Dr", "Pl", "Tr", "Fr", "Gr", "Kr", "St", "Qu", "Kn", "Sk", "Wl", "Zw", "Vr"],
  midDouble: ["kk", "zz", "ll", "ss", "xx", "dd", "bb", "pp", "gg", "tt", "mm", "nn", "ff", "rr"],
  vowel: ["a", "o", "i", "u", "e"],
  tailM: ["", "k", "x", "n", "ff", "b", "d", "p", "g", "z"],
  tailF: ["a", "i", "o", "ia", "ie"],
  honorific: ["the Astute", "the Didactic", "the Insufferable", "the Brilliant", "Synergetics", "the Empirical", "the Quantifiable", "the Methodical", "the Ingenious", "the Pragmatic", "the Theoretical", "the Exhaustive"],
};

/* ─── SYLVARI ── nom celte unique + cycle d'éveil optionnel ────────── */
export const SYLVARI = {
  M: [
  "Caithe", "Faolan", "Riannoc", "Aengus", "Cadeyrn", "Niall", "Eoghan", "Bran", "Lugh", "Cael", "Dagda",
  "Eamon", "Ronan", "Tiernan", "Cormac", "Aedan", "Lir", "Oisin", "Conall", "Diarmaid", "Fergus", "Gwydion",
  "Idris", "Math", "Pryderi", "Taliesin", "Cian", "Donnan", "Ewyn", "Maddoc", "Trahearne", "Malomedies",
  "Canach", "Brennan", "Cathal", "Talad", "Caelan", "Breaidh", "Owainad", "Dryswel", "Eiran", "Gwawlys",
  "Rhysad", "Niach", "Rhysaidh", "Ronnoc", "Eirad", "Dagaidh", "Wynad", "Llewad", "Morach", "Gwawlwel",
  "Connys", "Fergoc", "Eogad", "Caduin", "Lirach", "Eilach", "Niawel", "Oisaidh", "Faead", "Talion", "Morad",
  "Gaeloc", "Drysach", "Ulaoc", "Aedion", "Maelach", "Niaoc", "Faewel", "Saelys", "Ronnaidh", "Maboc",
  "Aedwyn", "Lugys", "Maelwel", "Drysad", "Faeyn", "Ronnion", "Oisys", "Seirion", "Mabaidh", "Brynuin",
  "Gwawloc", "Ceiwel", "Caeryn", "Fergyn", "Pwyllad", "Llewach", "Meredad", "Taloc", "Maelad", "Aeraidh",
  "Tieruin", "Tieryn", "Connaidh", "Seirys", "Oisuin", "Coroc", "Faolwyn", "Rhysoc", "Gaelach", "Aerion",
  "Seirach", "Pwylloc", "Lirion", "Eogan", "Bread", "Tegwion", "Talarn", "Pwyllarn", "Seiran", "Rhysyn",
  "Corach", "Pwyllyn", "Caelach", "Niad", "Saelach", "Eilion", "Eilwel", "Eogaidh", "Dagan", "Gwawlaidh",
  "Tierwyn", "Ronnad", "Branuin", "Aerys", "Aerach", "Llewoc", "Wynyn", "Aerwyn", "Tegwach", "Idrach",
  "Saeloc", "Ceian", "Eirach", "Gwynwel", "Dagwyn", "Tierys", "Talyn", "Gwynwyn", "Maelwyn", "Cadad",
  "Tegwwyn", "Connach", "Llewarn", "Drysyn", "Fergach", "Brynion", "Idraidh", "Ceiys", "Eilaidh", "Branad",
  "Corwel", "Fergaidh", "Luguin", "Aedoc", "Faolion", "Meredwel", "Faoloc", "Breion", "Eogwel", "Liruin",
  "Eirarn", "Darach", "Lugwyn", "Idryn", "Owainys", "Caeloc", "Cadarn", "Aerwel", "Gaeluin", "Connwyn",
  "Ceiuin", "Lugaidh", "Morwyn", "Tegwys", "Wynoc", "Caelarn", "Caeraidh", "Mabys", "Ulays", "Saelwyn",
  "Cadaidh", "Dagys", "Cadyn", "Brynyn", "Oiswel", "Ceiyn", "Coran", "Lirwel", "Cadan", "Idran", "Lugarn",
  "Lugach", "Owainwyn", "Aeduin", "Aedad", "Owainuin", "Ulach"
],
  F: [
  "Niamh", "Wynne", "Aife", "Brigid", "Eilonwy", "Rhiannon", "Saoirse", "Ceridwen", "Liadan", "Maeve",
  "Sorcha", "Aoife", "Branwen", "Deirdre", "Fiala", "Cliodhna", "Ysolde", "Enid", "Arianrhod", "Blodwen",
  "Eirian", "Gwenllian", "Morwen", "Nia", "Olwen", "Seren", "Tegan", "Ailbhe", "Caoimhe", "Orla", "Kahedins",
  "Dagonet", "Rhonwen", "Eluned", "Cadonn", "Caelaith", "Nialin", "Oisira", "Darwedd", "Caelwen", "Talwyn",
  "Wynys", "Tiera", "Tierwyn", "Coronn", "Cadlin", "Corys", "Daglys", "Seirira", "Eirwyn", "Eilwen",
  "Talaith", "Aeraith", "Gwynwen", "Branira", "Brynlin", "Eogwyn", "Nianey", "Branlys", "Maelonn", "Darwyn",
  "Eoglys", "Darlys", "Lugwedd", "Tieraith", "Eoglin", "Llewa", "Branys", "Eilwyn", "Gwawllin", "Seira",
  "Cadney", "Ceilin", "Eira", "Eoga", "Ceiys", "Tierlin", "Ronned", "Caerwyn", "Meredwyn", "Oiswedd",
  "Cadwedd", "Fergney", "Gwynaith", "Aerwyn", "Rhysaith", "Connwyn", "Llewira", "Maellys", "Oisney", "Ceia",
  "Gaelwen", "Ulaney", "Owainwen", "Idrys", "Faeira", "Maelney", "Faea", "Caerney", "Cada", "Meredira",
  "Morwyn", "Eogonn", "Seired", "Llewaith", "Ulawedd", "Seirney", "Gwyned", "Pwyllys", "Tegwira", "Wynlys",
  "Ronnwyn", "Owainira", "Ronnlin", "Eogwen", "Saelwedd", "Faolney", "Owainwyn", "Maelwen", "Tegwaith",
  "Caered", "Brana", "Gwawlwyn", "Eilaith", "Llewonn", "Cadaith", "Rhyslys", "Darwen", "Mora", "Dryswedd",
  "Aerney", "Rhysney", "Meredwen", "Lugonn", "Rhyswedd", "Idrwyn", "Eoged", "Bryna", "Ulaira", "Saelwyn",
  "Ulalin", "Caela", "Ulawen", "Lugaith", "Pwyllira", "Darney", "Saelys", "Brynys", "Tegwa", "Pwylled",
  "Tegwys", "Taled", "Brynwen", "Connlin", "Mabwen", "Aeronn", "Gwynlys", "Ronnwedd", "Faoled", "Dagwedd",
  "Dagwyn", "Eogwedd", "Eirwedd", "Pwyllonn", "Mabney", "Aerys", "Niawyn", "Faelin", "Connlys", "Drysonn",
  "Saellys", "Lugwen", "Wynlin", "Fergwyn", "Lironn", "Luga", "Morys", "Oisaith", "Gwawlney", "Ceiwyn",
  "Caelonn", "Aerlys", "Lirlys", "Eirlys", "Liraith", "Eiraith", "Drysed", "Breira", "Wynira", "Tala",
  "Niaed", "Gaelwyn", "Ferged", "Eirney", "Lired", "Drysney", "Faolwen", "Owainwedd", "Caeronn", "Niaonn"
],
  cycles: ["of Dawn", "of Noon", "of Dusk", "of Night"],
};

/* ─── HUMAIN ── prénom + nom d'une même ethnie krytanaise ──────────── */
export const HUMAN = {
  Krytan: { M: [
    "Logan", "Marius", "Lucan", "Tobin", "Andrew", "Bryce", "Devon", "Garrick", "Joran", "Kellach",
    "Roderick", "Tervan", "Aldous", "Corbin", "Edric", "Galen", "Hadwin", "Jorah", "Leofric", "Merrick",
    "Osric", "Perrin", "Quillan", "Roland", "Tomas", "Warin", "Alden", "Brennan", "Caden", "Dunstan", "Emory",
    "Fenwick", "Godwin", "Harlan", "Ivo", "Jasper", "Kenrick", "Lowell", "Magnus", "Nolan", "Oswin", "Pellan",
    "Reynard", "Sefton", "Tristan", "Ulric", "Vance", "Weston", "Cedric", "Damon"
  ], F: [
    "Anise", "Serena", "Bianca", "Rosa", "Carenza", "Valentina", "Althea", "Demetra", "Kasmeer", "Lyssa",
    "Marjory", "Petra", "Adela", "Beatrix", "Celestine", "Delia", "Elowen", "Fiora", "Gisela", "Hester",
    "Isolde", "Jocelyn", "Katriana", "Linnea", "Mirelle", "Noralin", "Odette", "Philippa", "Rowena",
    "Sabella", "Tamsin", "Verena", "Wilona", "Yvaine", "Aldith", "Brigida", "Cordia", "Damaris", "Esme",
    "Faye", "Gwenore", "Henrietta", "Ilse", "Jonet", "Lettice", "Mabel", "Nesta", "Orabel", "Perdita",
    "Rosalind"
  ], last: [
    "Thackeray", "Salviano", "Delano", "Marchetti", "Vasco", "Renaldi", "Corvo", "Bellamy", "Severo",
    "Castellan", "Greycloud", "Veradi", "Lanaster", "Quinn", "Ashworth", "Blackbriar", "Carrington",
    "Dunmere", "Easton", "Falkner", "Goodwin", "Hartley", "Ironwood", "Jennings", "Kentmere", "Larkspur",
    "Merryweather", "Northcott", "Oakhurst", "Pemberton", "Ravensworth", "Stoneoak", "Thornwood", "Underhill",
    "Vexley", "Whitlock", "Yarrow", "Ackerly", "Brightwater", "Caldwell", "Denholm", "Eastgate", "Fairwind",
    "Grimsby", "Holloway", "Lindquist", "Marsden", "Pennington", "Ridley", "Sheridan"
  ] },
  Ascalonien: { M: [
    "Edmund", "Gareth", "Aldous", "Wystan", "Godric", "Roderic", "Ewald", "Cuthbert", "Aldric", "Bernhard",
    "Adelbern", "Rurik", "Osric", "Wilbur", "Aric", "Baldric", "Conrad", "Dietrich", "Eberhard", "Friedhelm",
    "Gunther", "Helmar", "Ingmar", "Lothar", "Manfred", "Norbert", "Otto", "Reinald", "Sigmund", "Theobald",
    "Ulfred", "Volker", "Werner", "Aldwin", "Berthold", "Egon", "Frydrich", "Gisbert", "Hartmut", "Leonhard",
    "Meinhard", "Reinhold", "Siegbert", "Waldemar", "Wolfram", "Anselm", "Burkhard", "Detlef", "Erhard",
    "Gottfried"
  ], F: [
    "Gwen", "Edith", "Mathilde", "Audra", "Rowena", "Hilde", "Wilhelmina", "Brenna", "Adela", "Cordelia",
    "Gwendolyn", "Maribel", "Ottilie", "Saidra", "Elsbeth", "Adelheid", "Bertha", "Clotilde", "Dagmar",
    "Ermengarde", "Frieda", "Gertrude", "Hedwig", "Irmgard", "Kunigunde", "Liesel", "Mechtild", "Notburga",
    "Oda", "Roswitha", "Sieglinde", "Theodora", "Ute", "Walburga", "Adelina", "Brunhilde", "Edeltraud",
    "Gisela", "Hildegard", "Imke", "Kreszenz", "Leonore", "Mareike", "Reinhild", "Sigrun", "Trudel", "Wenda",
    "Ymma", "Adelgund", "Berengaria"
  ], last: [
    "Ashford", "Stoneborn", "Greywall", "Thornbury", "Eddings", "Holdfast", "Marriner", "Wenslow", "Langmar",
    "Stoutmantle", "Beetlestone", "Hawthorne", "Eisenberg", "Falkenrath", "Grimwald", "Hochberg",
    "Königsmark", "Lindenholm", "Morgenstern", "Nordheim", "Ostermann", "Rabenstein", "Steinhardt",
    "Tannenberg", "Waldhaus", "Adlersfeld", "Brandeis", "Drachenfels", "Eichhorn", "Frosthaven", "Greifenau",
    "Habicht", "Jagerhorn", "Kaltenbrun", "Lowenstein", "Wolfsheim", "Barrowdale", "Coldridge", "Duskmoor",
    "Fellhaven", "Hartstone", "Ironvale", "Mournwall", "Oakenshield", "Ravenholt", "Stormgard", "Westmarch",
    "Wintermere", "Blackmoor", "Highcastle"
  ] },
  Canthan: { M: [
    "Zhu", "Kaijun", "Shiro", "Liao", "Quan", "Jian", "Tahmu", "Ang", "Cho", "Fei", "Hong", "Jun", "Lao",
    "Ming", "Shen", "Wei", "Bao", "Chang", "Deng", "Feng", "Guo", "Han", "Jiang", "Kang", "Lin", "Meng",
    "Peng", "Qiang", "Ren", "Song", "Tao", "Xu", "Yang", "Zhao", "Akio", "Daichi", "Haru", "Kenji", "Ryo",
    "Sora", "Takeshi", "Yuki", "Daiki", "Hiroshi", "Kaito", "Makoto", "Renji", "Satoru", "Tatsuo", "Yori"
  ], F: [
    "Mei", "Lien", "Suun", "Akina", "Hana", "Xiu", "Joon", "Rui", "Aya", "Min", "Chun", "Hua", "Lin", "Mai",
    "Ning", "Suki", "Bai", "Cai", "Dan", "Fang", "Hui", "Jia", "Lan", "Ping", "Qing", "Shan", "Ting", "Wen",
    "Xia", "Yan", "Zhen", "Emi", "Hina", "Kaori", "Mio", "Nori", "Rei", "Saki", "Yua", "Akemi", "Chiyo",
    "Haruka", "Kimiko", "Megumi", "Sakura", "Tomoko", "Yoshie", "Asuka", "Keiko", "Yuki"
  ], last: [
    "Hong", "Kaineng", "Saito", "Aetherblade", "Tahmu", "Won", "Shing", "Zhang", "Li", "Chen", "Yamada",
    "Wujin", "Soja", "Bao", "Cao", "Du", "Feng", "Guan", "Huang", "Jin", "Kwan", "Luo", "Mao", "Pan", "Qin",
    "Shu", "Tang", "Wu", "Xie", "Yao", "Zhou", "Fujimoto", "Hayashi", "Ishikawa", "Kobayashi", "Matsuda",
    "Nakamura", "Okada", "Sasaki", "Takahashi", "Watanabe", "Yoshida", "Aoki", "Fukuda", "Hashimoto", "Inoue",
    "Kuroda", "Morita", "Nishimura", "Ono"
  ] },
  Elonien: { M: [
    "Zahir", "Rashid", "Jamal", "Faraj", "Kasib", "Amir", "Bashir", "Hakim", "Idris", "Karim", "Nadir",
    "Omar", "Tariq", "Yusuf", "Hassan", "Malik", "Anwar", "Bilal", "Dakarai", "Emin", "Faisal", "Ghassan",
    "Habib", "Imran", "Jabari", "Kamal", "Latif", "Mansur", "Nasir", "Qasim", "Rami", "Samir", "Tahir",
    "Walid", "Yahya", "Zaki", "Adom", "Chiumbo", "Dawit", "Hamadi", "Jelani", "Kofi", "Mosi", "Nuru", "Obi",
    "Sefu", "Tau", "Useni", "Zuberi", "Khalil"
  ], F: [
    "Nadijeh", "Hayda", "Layla", "Amara", "Saida", "Zayna", "Nahla", "Yara", "Aisha", "Dalia", "Farida",
    "Habiba", "Jamila", "Karima", "Nuria", "Zahra", "Amani", "Basma", "Fatima", "Ghada", "Halima", "Iman",
    "Jamilah", "Kamila", "Latifa", "Maryam", "Nadia", "Rania", "Salma", "Yasmin", "Zara", "Abebi", "Chioma",
    "Dalila", "Eshe", "Hasina", "Imani", "Kesi", "Makeda", "Nia", "Oni", "Subira", "Thema", "Zalika", "Asha",
    "Binta", "Femi", "Halle", "Jaha", "Sanaa"
  ], last: [
    "al-Dahir", "Sunspear", "Mahnkelon", "al-Hassan", "al-Rashid", "al-Karim", "Bahar", "Vabbi", "Kourna",
    "Istani", "Heket", "al-Nasir", "al-Farid", "al-Zahra", "ben-Yusuf", "ibn-Malik", "al-Sayed", "al-Hakim",
    "al-Mansur", "al-Tariq", "Darashan", "Elona", "Gandara", "Jahai", "Kodash", "Marga", "Nundu", "Pojj",
    "Resplendent", "Turai", "Yahnur", "Zehtuka", "Abara", "Champawat", "Fahranur", "Ghorvar", "Joko",
    "Kahandara", "Loar", "Morah", "Nadeso", "Olafund", "Qadim", "Rojan", "Sahil", "Tehbhin", "Utkesh",
    "Varajar", "Wurmscar", "Zalamander"
  ] },
};
export const HUMAN_ETHNIES = Object.keys(HUMAN);

/* ─── Métadonnées d'affichage ─────────────────────────────────────── */
export const RACES_META = [
  { id: "Humain",  color: "#d8a64a", glyph: "✶", home: "Kryta",      motto: "Héritiers des royaumes déchus" },
  { id: "Charr",   color: "#c0563a", glyph: "⚔", home: "Cité Noire", motto: "Forgés par la guerre" },
  { id: "Norn",    color: "#5fa0c0", glyph: "❄", home: "Hoelbrak",   motto: "Bâtisseurs de légendes" },
  { id: "Asura",   color: "#9d7ad0", glyph: "◈", home: "Rata Sum",   motto: "La magnificence concentrée" },
  { id: "Sylvari", color: "#6fae54", glyph: "❧", home: "Bosquet",    motto: "Rêveurs nés de l'Arbre" },
];
export const RACE_COLOR = Object.fromEntries(RACES_META.map((r) => [r.id, r.color]));
export const RACE_GLYPH = Object.fromEntries(RACES_META.map((r) => [r.id, r.glyph]));
export const RACES = RACES_META.map((r) => r.id);

/* ─── Traditions (panneau dépliable) ──────────────────────────────── */
export const CONVENTIONS = {
  Charr: "Prénom romain/latin, puis nom de famille en deux parties : la warband et le rôle qu'on y tient. Les préfixes Iron, Blood, Ash et Flame indiquent l'appartenance à cette légion.",
  Norn: "Prénom nordique. Surnom au choix : filiation dynamique (-sson / -sdottir, non héréditaire), surnom gagné par un exploit, ou titre personnel lié à sa légende.",
  Asura: "Nom unique, court (1–2 syllabes), avec une double consonne. Les noms masculins finissent sur une consonne, les féminins plutôt sur i ou a. Honorifique de prestige optionnel.",
  Sylvari: "Nom celte / gallois / irlandais, le plus souvent sans nom de famille. Beaucoup ajoutent leur cycle d'éveil (Aube, Midi, Crépuscule, Nuit) comme second nom.",
  Humain: "Humains = mosaïque d'ethnies réelles. Prénom et nom sont tirés de la même culture : Krytan (européen), Ascalonien (nord-européen), Canthan (est-asiatique), Elonien (arabo-moyen-oriental).",
};
