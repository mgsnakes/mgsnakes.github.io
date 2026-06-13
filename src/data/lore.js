/* Fiches encyclopédiques par race : lore, convention, exemples canon. */
export const RACE_LORE = {
  Humain: {
    color: "#d8a64a", glyph: "✶", home: "Kryta",
    tagline: "Héritiers des royaumes déchus",
    intro:
      "Jadis maîtres de la Tyrie, les humains ont vu leurs royaumes s'effondrer les uns après les autres — Ascalon ravagée, Orr engloutie, l'Élona asservie. Kryta demeure leur dernier grand bastion. Leur diversité de noms reflète ces origines éclatées : un humain peut descendre d'une lignée krytanaise, ascalonienne, canthienne ou élonienne.",
    convention:
      "Prénom et nom proviennent d'une même culture. Les Krytans portent des noms européens (souvent anglophones) ; les Ascaloniens, des noms nord-européens et germaniques ; les Canthans, des noms est-asiatiques ; les Eloniens, des noms arabes, hébreux ou persans.",
    examples: ["Logan Thackeray", "Anise", "Kasmeer Meade", "Marjory Delaqua", "Jennah", "Caudecus Beetlestone"],
  },
  Charr: {
    color: "#c0563a", glyph: "⚔", home: "Cité Noire",
    tagline: "Forgés par la guerre",
    intro:
      "Société martiale et industrielle, les charrs vivent et meurent pour leur warband — l'unité de combat qui remplace la famille de sang. Quatre Hautes Légions structurent leur civilisation : Fer, Sang, Cendres et Flammes (cette dernière en marge depuis sa défaite). Le nom d'un charr dit d'où il vient et ce qu'il fait.",
    convention:
      "Prénom romain ou grec, puis nom de famille en deux parties : le nom de la warband (ex. « Fierce ») et un mot descriptif lié au rôle (ex. « shot »). Les préfixes Iron, Blood et Ash signalent l'appartenance à la légion correspondante.",
    examples: ["Rytlock Brimstone", "Almorra Soulkeeper", "Smodur the Unflinching", "Bangar Ruinbringer", "Crecia Stoneglow"],
  },
  Norn: {
    color: "#5fa0c0", glyph: "❄", home: "Hoelbrak",
    tagline: "Bâtisseurs de légendes",
    intro:
      "Géants des Pics Glacés capables de prendre forme animale, les norns vénèrent les Esprits de la Nature et placent l'exploit personnel au-dessus de tout. Chaque norn cherche à inscrire son nom dans la légende — et son nom même raconte souvent déjà une histoire.",
    convention:
      "Prénom nordique ou viking. Le nom de famille relève soit de la vénération des ancêtres (filiation en -sson / -sdottir, ou -kin), soit d'un surnom descriptif gagné par un haut fait (« Cliffstrider », « the Hunter »).",
    examples: ["Eir Stegalkin", "Braham Eirsson", "Knut Whitebear", "Borje the Sun Chaser", "Jora"],
  },
  Asura: {
    color: "#9d7ad0", glyph: "◈", home: "Rata Sum",
    tagline: "La magnificence concentrée",
    intro:
      "Petits, brillants et insupportablement sûrs d'eux, les asuras manient l'Alchimie Éternelle et la technologie magique mieux que quiconque. Ils s'organisent en krewes de recherche et ne doutent jamais de leur supériorité intellectuelle.",
    convention:
      "Nom unique, court (une ou deux syllabes), comportant souvent une paire de lettres doublées. Les noms féminins tendent à finir par une voyelle, les masculins par une consonne. Un nom supplémentaire — intitulé de poste, krewe ou honorifique — précède parfois le nom personnel.",
    examples: ["Zojja", "Snaff", "Vekk", "Gixx", "Taimi", "Oola"],
  },
  Sylvari: {
    color: "#6fae54", glyph: "❧", home: "Bosquet",
    tagline: "Rêveurs nés de l'Arbre",
    intro:
      "Les plus jeunes des peuples : nés de l'Arbre Pâle, les sylvaris émergent adultes du Rêve des Rêves, porteurs d'une sagesse onirique et d'une curiosité d'enfant. Leur cycle d'éveil — Aube, Midi, Crépuscule ou Nuit — colore leur tempérament.",
    convention:
      "Nom celte, gallois ou irlandais, le plus souvent sans nom de famille. Beaucoup ajoutent leur cycle d'éveil comme second nom (« of Dusk »). Certains adoptent un schéma proche des asuras : un titre suivi d'un nom personnel.",
    examples: ["Caithe", "Trahearne", "Niamh", "Canach", "Aife", "Riannoc"],
  },
};
export const LORE_RACES = Object.keys(RACE_LORE);
