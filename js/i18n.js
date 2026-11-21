/* Système de traduction FR -> EN pour Caravane d'Or.
   Les textes d'origine restent en français dans le code : on traduit les nœuds
   du DOM à l'affichage, ce qui évite de réécrire toute la logique du jeu. */
(function () {
  'use strict';

  var KEY = 'cd_lang';
  var lang = 'fr';
  var applying = false;
  var SKIP_IDS = { 'lang-toggle': true };

  // Traductions exactes (texte français -> texte anglais)
  var DICT_RAW = {
    // Menu et en-tête
    "camel Caravane d'Or": "camel Caravan of Gold",
    "Bâtissez une fortune de ville en ville avant la fin du voyage.": "Build a fortune town by town before the journey ends.",
    "Difficulté": "Difficulty",
    "Durée du voyage": "Journey length",
    "Attention": "Warning",
    " : vous devez gérer votre eau 💧 et votre nourriture 🍖.": " : you must manage your water 💧 and food 🍖.",
    "Si l'un tombe à 0 en route, la caravane périt dans le désert.": "If either drops to 0 on the road, the caravan perishes in the desert.",
    "🎓 Afficher le tutoriel guidé": "🎓 Show guided tutorial",
    "▶ Partir à l'aventure": "▶ Start your adventure",
    "📂 Charger une partie": "📂 Load game",
    "Facile": "Easy",
    "Difficile": "Hard",
    "Routes calmes, bandits rares et cléments": "Quiet roads, rare and lenient bandits",
    "Danger équilibré": "Balanced danger",
    "Routes très dangereuses, bandits cruels": "Very dangerous roads, cruel bandits",
    "Renom : ": "Renown: ",
    "Meilleur score : ": "Best score: ",
    " % d'or de départ": " % starting gold",
    "Richesse": "Wealth",
    "Jour": "Day",
    "Nouvelle carte": "New map",
    "Sauvegarder": "Save",
    "Charger": "Load",
    "Abandonner": "Give up",
    "Plein écran / 16:9": "Fullscreen / 16:9",
    "📜 Journal ": "📜 Log ",
    "Marché": "Market",
    "Ateliers": "Workshops",
    "Améliorations": "Upgrades",
    "Contrats": "Contracts",
    "Or disponible": "Gold available",
    "Or : ": "Gold: ",
    "🌐 Langue :": "🌐 Language:",
    "💾 Une sauvegarde existe. La charger ?": "💾 A saved game exists. Load it?",
    "Abandonner la partie en cours et recommencer ?": "Abandon the current game and start over?",
    "Abandonner la partie en cours ?": "Abandon the current game?",
    "Charger la sauvegarde ? La partie en cours sera perdue.": "Load the save? The current game will be lost.",

    // Phases
    "Aube": "Dawn", "Matin": "Morning", "Après-midi": "Afternoon",
    "Crépuscule": "Dusk", "Nuit": "Night", "Nuit profonde": "Deep night",

    // Marchandises
    "Nourriture": "Food", "Bois": "Wood", "Tissu": "Cloth", "Fer": "Iron",
    "Épices": "Spices", "Soie": "Silk", "Gemmes": "Gems", "Armes": "Weapons",
    "Artefact": "Artifact", "Pain": "Bread", "Festin": "Feast", "Tapis": "Carpet", "Bijou": "Jewel",

    // Biomes, tailles, événements
    "désert": "desert", "forêt": "forest", "côtière": "coastal", "montagne": "mountain",
    "plaine": "plain", "côte": "coast", "bourg": "town", "cité": "city", "métropole": "metropolis",
    "🎉 Festival": "🎉 Festival", "🌾 Famine": "🌾 Famine", "⚔️ Guerre": "⚔️ War", "☣️ Épidémie": "☣️ Plague",

    // Améliorations
    "Capacité": "Capacity", "+15 charges, +1 chameau de bât": "+15 cargo, +1 pack camel",
    "Vitesse": "Speed", "+15 % de vitesse": "+15% speed",
    "Gardes": "Guards", "+1 garde anti-bandits": "+1 guard against bandits",
    "Négociation": "Negotiation", "-4 % achat / +4 % vente": "-4% buy / +4% sell",
    "Éclaireurs": "Scouts", "révèle routes, villes, événements": "reveals roads, cities, events",

    // Carte
    "Carte des Routes Marchandes": "Map of the Trade Routes",

    // Journal — messages fixes
    "🛡️ Une bande de brigands est repoussée par vos gardes !": "🛡️ A band of brigands is driven off by your guards!",
    "🧭 Vous découvrez un raccourci ! (+15 % du trajet)": "🧭 You found a shortcut! (+15% of the trip)",
    "🧳 Vous croisez un marchand ambulant.": "🧳 You meet a traveling merchant.",
    "⛈️ Intempéries : vitesse -50 % pendant 3 jours": "⛈️ Bad weather: speed -50% for 3 days",
    "⚠️ Provisions faibles ! Achetez eau/nourriture ici.": "⚠️ Low supplies! Buy water/food here.",
    "🐫 Sous-caravane pillée.": "🐫 Sub-caravan plundered.",
    "⚠️ Erreur : ": "⚠️ Error: ",
    "💾 Partie sauvegardée.": "💾 Game saved.",
    "⚠️ Erreur de sauvegarde.": "⚠️ Save error.",
    "Aucune sauvegarde trouvée.": "No save found.",
    "📂 Partie chargée.": "📂 Game loaded.",
    "⚠️ Erreur de chargement.": "⚠️ Load error.",
    "📜 Contrat abandonné.": "📜 Contract abandoned.",
    "❌ Contrat expiré.": "❌ Contract expired.",
    "⚠️ 3 contrats actifs max.": "⚠️ Max 3 active contracts.",
    "Atelier nécessite un bourg ou plus": "Workshop requires a town or larger",
    "Pas assez d'or": "Not enough gold",
    "Pas assez de place": "Not enough space",

    // Écran de mort
    "MORT DE SOIF": "DIED OF THIRST", "MORT DE FAIM": "DIED OF HUNGER",
    "Plus une seule goutte d'eau dans les outres…": "Not a single drop of water left in the waterskins…",
    "Les chameaux titubent. Le soleil implacable dessèche les gorges. La caravane s'effondre dans les dunes.": "The camels stagger. The relentless sun dries the throats. The caravan collapses in the dunes.",
    "Les provisions sont vides depuis trop longtemps…": "The provisions have been empty for too long…",
    "Les bêtes refusent d'avancer. Les estomacs crient famine. La caravane s'arrête, puis s'éteint, à jamais.": "The beasts refuse to move. Stomachs cry out in hunger. The caravan stops, then fades away, forever.",
    "lieu inconnu": "unknown place", "Jour fatal : ": "Fatal day: ", "Ville la plus proche : ": "Nearest city: ",
    "Cargaison : ": "Cargo: ", "Distance parcourue : ": "Distance traveled: ", "Score final : ": "Final score: ",
    "🔄 Nouvelle caravane": "🔄 New caravan",

    // Écran de fin
    "Fin du voyage": "Journey's end", "Marchandises : ": "Merchandise: ", "Améliorations : ": "Upgrades: ",
    "Contrats livrés : ": "Contracts delivered: ", " / échoués : ": " / failed: ",
    "Objets fabriqués : ": "Items crafted: ", "Embuscades subies : ": "Ambushes suffered: ",
    " / repoussées : ": " / repelled: ", "Score : ": "Score: ", "Renom gagné : +": "Renown gained: +",
    "Meilleurs scores": "Best scores", "Nouvelle partie": "New game", "Menu principal": "Main menu",
    "🏳️ Partie abandonnée": "🏳️ Game abandoned", "Or amassé : ": "Gold amassed: ",

    // Marché / ravitaillement
    "🥤 Ravitaillement (indispensable en voyage)": "🥤 Supplies (essential for travel)",
    "Eau": "Water", "Max": "Max", "or/u": "gold/u", "or": "gold", "or ·": "gold ·", "or)": "gold)",
    "Consommation : 1 unité / 20 km · Voyage possible : ": "Consumption: 1 unit / 20 km · Travel range: ",
    "Bien": "Good", "Stock": "Stock", "Achat": "Buy", "Vente": "Sell", "Sac": "Bag", "Tout": "All",
    "Pachat": "Last buy", "Achat / Vente": "Buy / Sell",
    "Marché fermé.": "Market closed.",
    "⭐ Réputation : ": "⭐ Reputation: ", "Réputation : ": "Reputation: ",
    "Charge : ": "Load: ", "Reste à consommer : ": "Still needed: ",
    "✅ Provisions suffisantes": "✅ Enough supplies",
    "⚠️ Provisions INSUFFISANTES !": "⚠️ NOT ENOUGH SUPPLIES!",
    "⚠️ Ateliers disponibles uniquement à partir des bourgs.": "⚠️ Workshops available only in towns or larger.",
    "Transformez vos marchandises en produits de luxe.": "Turn your goods into luxury products.",
    "frais": "fee", "Vente ici : ~": "Sell here: ~", "marge +": "margin +", "marge ": "margin ",
    "🔨 Fabriquer": "🔨 Craft",

    // Contrats / quêtes
    "📜 Contrats de livraison": "📜 Delivery contracts", "📜 Livrer ": "📜 Deliver ", "Livrer": "Deliver",
    "Abandonner": "Abandon", "Accepter": "Accept", "Stock : ": "Stock: ",
    "(vous y êtes !)": "(you're here!)",

    // Améliorations / stats
    "niv. ": "lvl ", "Améliorer (": "Upgrade (", "Sous-caravanes": "Sub-caravans", "Recruter (": "Recruit (",
    "📊 Statistiques": "📊 Statistics", "Commerce": "Trade", "Transactions : ": "Transactions: ",
    "Profit net : ": "Net profit: ", "Provisions": "Supplies", "💧 Eau achetée : ": "💧 Water bought: ",
    "🍖 Nourriture achetée : ": "🍖 Food bought: ", "Morts par épuisement : ": "Deaths from exhaustion: ",
    "Voyage": "Journey", "Distance : ": "Distance: ", "Jours : ": "Days: ",

    // Infobulle
    "Produit : ": "Produces: ", "Demande : ": "Demand: ", "Ressources inconnues": "Unknown resources",
    "Voyager ▶": "Travel ▶", "Ville inconnue.": "Unknown city.",
    "Cliquez sur une ville pour l'inspecter, double-cliquez pour y aller.": "Click a city to inspect it, double-click to travel there.",
    "Prix d’achat": "Buy price", "Prix de vente": "Sell price",

    // Tutoriel
    "<b>L’EAU EST VITALE.</b> La caravane consomme 1 unité tous les 20 km. Si l’eau tombe à 0 en route, le voyage s’arrête… pour toujours.": "<b>WATER IS VITAL.</b> The caravan consumes 1 unit every 20 km. If water hits 0 on the road, the journey stops… forever.",
    "<b>LA NOURRITURE AUSSI.</b> Surveille ces deux jauges en haut de l’écran : eau 💧 et vivres 🍖 doivent toujours rester au-dessus de zéro.": "<b>FOOD TOO.</b> Watch the two gauges at the top of the screen: water 💧 and food 🍖 must always stay above zero.",
    "<b>VOTRE OR 💰</b> sert à acheter marchandises et provisions. Il est aussi affiché en permanence dans le panneau du marché.": "<b>YOUR GOLD 💰</b> buys goods and supplies. It is also always shown in the market panel.",
    "<b>RAVITAILLEZ-VOUS ICI.</b> Avant chaque départ, achetez assez d’eau et de nourriture pour la distance à parcourir (1 unité / 20 km).": "<b>STOCK UP HERE.</b> Before each departure, buy enough water and food for the distance ahead (1 unit / 20 km).",
    "<b>ACHETEZ BAS, VENDEZ HAUT.</b> Les flèches <span style=\"color:#1a7a1a\">▲ vertes</span> signalent un bon prix, les <span style=\"color:#c62828\">▼ rouges</span> un prix défavorable. Le prix d’achat est à gauche, celui de vente à droite.": "<b>BUY LOW, SELL HIGH.</b> <span style=\"color:#1a7a1a\">Green ▲ arrows</span> mean a good price, <span style=\"color:#c62828\">red ▼ arrows</span> an unfavorable one. Buy price is on the left, sell price on the right.",
    "<b>LES CONTRATS 📜</b> rapportent de l’or et de la réputation. Acceptez-en un, puis livrez la marchandise avant la date limite.": "<b>CONTRACTS 📜</b> earn gold and reputation. Accept one, then deliver the goods before the deadline.",
    "<b>PRÊT À PARTIR ?</b> Cliquez sur une ville de la carte puis sur « Voyager ▶ », ou double-cliquez directement dessus. Sur mobile, pincez deux doigts pour zoomer. Bon voyage, marchand !": "<b>READY TO GO?</b> Click a city on the map then \"Travel ▶\", or double-click it directly. On mobile, pinch two fingers to zoom. Safe travels, merchant!",
    "Passer": "Skip", "Suivant ▶": "Next ▶", "Étape ": "Step ", "Terminer ✓": "Finish ✓",

    // Tutoriel — morceaux de texte séparés par les balises HTML
    "L’EAU EST VITALE.": "WATER IS VITAL.",
    "La caravane consomme 1 unité tous les 20 km. Si l’eau tombe à 0 en route, le voyage s’arrête… pour toujours.": "The caravan consumes 1 unit every 20 km. If water hits 0 on the road, the journey stops… forever.",
    "LA NOURRITURE AUSSI.": "FOOD TOO.",
    "Surveille ces deux jauges en haut de l’écran : eau 💧 et vivres 🍖 doivent toujours rester au-dessus de zéro.": "Watch the two gauges at the top of the screen: water 💧 and food 🍖 must always stay above zero.",
    "VOTRE OR 💰": "YOUR GOLD 💰",
    "sert à acheter marchandises et provisions. Il est aussi affiché en permanence dans le panneau du marché.": "buys goods and supplies. It is also always shown in the market panel.",
    "RAVITAILLEZ-VOUS ICI.": "STOCK UP HERE.",
    "Avant chaque départ, achetez assez d’eau et de nourriture pour la distance à parcourir (1 unité / 20 km).": "Before each departure, buy enough water and food for the distance ahead (1 unit / 20 km).",
    "ACHETEZ BAS, VENDEZ HAUT.": "BUY LOW, SELL HIGH.",
    "Les flèches": "The arrows", "vertes": "green", "rouges": "red",
    "signalent un bon prix, les": "signal a good price, while",
    "un prix défavorable. Le prix d’achat est à gauche, celui de vente à droite.": "an unfavorable one. Buy price is on the left, sell price on the right.",
    "LES CONTRATS 📜": "CONTRACTS 📜",
    "rapportent de l’or et de la réputation. Acceptez-en un, puis livrez la marchandise avant la date limite.": "earn gold and reputation. Accept one, then deliver the goods before the deadline.",
    "PRÊT À PARTIR ?": "READY TO GO?",
    "Cliquez sur une ville de la carte puis sur « Voyager ▶ », ou double-cliquez directement dessus. Sur mobile, pincez deux doigts pour zoomer. Bon voyage, marchand !": "Click a city on the map then \"Travel ▶\", or double-click it directly. On mobile, pinch two fingers to zoom. Safe travels, merchant!",
    "🐪 En route vers ": "🐪 Traveling to ",
    "🔨 Ateliers": "🔨 Workshops", "📜 Contrats": "📜 Contracts", "📜 Journal": "📜 Log",

    // Fenêtres d'événements de route
    "Continuer ▶": "Continue ▶",
    "Brigands repoussés !": "Brigands driven off!",
    "Une bande de brigands a attaqué votre caravane, mais vos gardes les ont mis en fuite.": "A band of brigands attacked your caravan, but your guards drove them away.",
    "Aucune perte": "No losses",
    "Embuscade !": "Ambush!",
    "Une bande de brigands vous attaque sur la route. Vous perdez une partie de votre butin.": "A band of brigands attacks you on the road. You lose part of your loot.",
    "Raccourci découvert !": "Shortcut found!",
    "Un chemin plus court s’offre à vous : la caravane gagne du terrain sans consommer plus de provisions.": "A shorter path opens up: the caravan gains ground without using more supplies.",
    "Marchand ambulant": "Traveling merchant",
    "Un marchand ambulant vous propose sa marchandise à prix réduit.": "A traveling merchant offers his goods at a reduced price.",
    "Vous croisez un marchand ambulant, mais vous n’avez ni la place ni l’or nécessaire pour acheter.": "You meet a traveling merchant, but you have neither space nor enough gold to buy anything.",
    "Aucun échange": "No trade",
    "Intempéries": "Bad weather",
    "Une tempête de sable s’abat sur la caravane et ralentit votre marche.": "A sandstorm hits the caravan and slows your progress.",
    "Cache abandonnée !": "Abandoned cache!",
    "Vous trouvez une cache oubliée au bord de la route, pleine de pièces d’or.": "You find a forgotten cache by the roadside, full of gold coins.",
    "à": "to",
    "🌄 Aube": "🌄 Dawn", "🌅 Matin": "🌅 Morning", "☀️ Jour": "☀️ Day",
    "🌤️ Après-midi": "🌤️ Afternoon", "🌆 Crépuscule": "🌆 Dusk",
    "🌙 Nuit": "🌙 Night", "🌌 Nuit profonde": "🌌 Deep night",
    "· Ville la plus proche :": "· Nearest city:", "· Cargaison :": "· Cargo:"
  };

  // Les clés sont comparées au texte « nu » (sans espaces de début/fin).
  var DICT = {};
  Object.keys(DICT_RAW).forEach(function (k) { DICT[k.trim()] = DICT_RAW[k]; });

  // Motifs pour les textes dynamiques contenant des nombres / noms de villes.
  var PATTERNS = [
    { re: /^Votre caravane quitte (.+)\. Bonne route, marchand !$/, en: 'Your caravan leaves $1. Safe travels, merchant!' },
    { re: /^➡️ Départ vers (.+) \((\d+) km, (.+)\)$/, en: '➡️ Departing for $1 ($2 km, $3)' },
    { re: /^🗡️ Embuscade ! -(\d+) or, -(\d+) (.+)$/, en: '⚔️ Ambush! -$1 gold, -$2 $3' },
    { re: /^🗡️ Embuscade ! -(\d+) or$/, en: '⚔️ Ambush! -$1 gold' },
    { re: /^🧳 Marchand ambulant : (\d+)× (\S+) (.+) à (\d+) or\.$/, en: '🧳 Traveling merchant: $1× $2 $3 for $4 gold.' },
    { re: /^💎 Cache abandonnée : \+(\d+) or !$/, en: '💎 Abandoned cache: +$1 gold!' },
    { re: /^📍 Arrivée à (.+)$/, en: '📍 Arrived at $1' },
    { re: /^📜 Quête à (.+) : (\d+)× (.+) pour (\d+) or$/, en: '📜 Quest at $1: $2× $3 for $4 gold' },
    { re: /^Fin : (.+) à (.+)$/, en: 'End: $1 in $2' },
    { re: /^(🎉 Festival|🌾 Famine|⚔️ Guerre|☣️ Épidémie) à (.+) !$/, en: '$1 in $2!' },
    { re: /^🐫 Sous-caravane : \+(\d+) or$/, en: '🐫 Sub-caravan: +$1 gold' },
    { re: /^🐫 Sous-caravane recrutée : (.+) ↔ (.+)$/, en: '🐫 Sub-caravan recruited: $1 ↔ $2' },
    { re: /^📜 Quête accomplie à (.+) : \+(\d+) or$/, en: '📜 Quest completed in $1: +$2 gold' },
    { re: /^📜 Contrat accepté : (\d+)× (.+) à (.+) avant J(\d+)\.$/, en: '📜 Contract accepted: $1× $2 to $3 before D$4.' },
    { re: /^Abandonner \?\nPénalité : -(\d+) or et -(\d+) réputation\.$/, en: 'Abandon?\nPenalty: -$1 gold and -$2 reputation.' },
    { re: /^Achat de (\d+) eau pour (\d+) or\.$/, en: 'Bought $1 water for $2 gold.' },
    { re: /^Achat de (\d+) nourriture pour (\d+) or\.$/, en: 'Bought $1 food for $2 gold.' },
    { re: /^(🔨 .+) fabriqué \(frais (\d+) or\)\.$/, en: '$1 crafted (fee $2 gold).' },
    { re: /^✅ Contrat livré : \+(\d+) or, \+(\d+) rép\. !$/, en: '✅ Contract delivered: +$1 gold, +$2 rep.!' },
    { re: /^⚠️ Manque (.+)\.$/, en: '⚠️ Missing $1.' },
    { re: /^Manque (.+)$/, en: 'Missing $1' },
    { re: /^⚠️ Pas assez d'or\.$/, en: '⚠️ Not enough gold.' },
    { re: /^⚠️ Pas assez de place\.$/, en: '⚠️ Not enough space.' },
    { re: /^⚠️ Atelier nécessite un bourg ou plus\.$/, en: '⚠️ Workshop requires a town or larger.' },
    { re: /^⏳ Nouveau contrat dans (\d+) j$/, en: '⏳ New contract in $1 d' },
    { re: /^J(\d+) \((\d+)j\)$/, en: 'D$1 ($2d)' },
    { re: /^📜 Quête : (\d+)× (.+) → (\d+) or \(jusqu'au jour (\d+)\)$/, en: '📜 Quest: $1× $2 → $3 gold (until day $4)' },
    { re: /^💰 (\d+) or · ⭐ \+(\d+) rép\.$/, en: '💰 $1 gold · ⭐ +$2 rep.' },
    { re: /^([+-]?\d+) or$/, en: '$1 gold' },
    { re: /^(\d+) jours$/, en: '$1 days' },
    { re: /^💧 (\d+) or\/u · 🍖 (\d+) or\/u$/, en: '💧 $1 gold/u · 🍖 $2 gold/u' },
    { re: /^▶ (.+) \((\d+) j · ([\d.]+)💧 ⚠️\)$/, en: '▶ $1 ($2 d · $3💧 ⚠️)' },
    { re: /^▶ (.+) \((\d+) j · ([\d.]+)💧\)$/, en: '▶ $1 ($2 d · $3💧)' },
    { re: /^🐪 En route vers (.+)… \((\d+) % — (\d+) km\)$/, en: '🐪 Traveling to $1… ($2% — $3 km)' },
    { re: /^Transactions : (\d+)$/, en: 'Transactions: $1' },
    { re: /^💧 Eau achetée : (\d+)$/, en: '💧 Water bought: $1' },
    { re: /^🍖 Nourriture achetée : (\d+)$/, en: '🍖 Food bought: $1' },
    { re: /^Morts par épuisement : (\d+)$/, en: 'Deaths from exhaustion: $1' },
    { re: /^Distance : (\d+) km$/, en: 'Distance: $1 km' },
    { re: /^Jours : (\d+)\/(\d+)$/, en: 'Days: $1/$2' },
    { re: /^Renom : (\d+) \(\+(\d+) % d'or de départ\)$/, en: 'Renown: $1 (+$2% starting gold)' },
    { re: /^Meilleur score : (\d+)$/, en: 'Best score: $1' },
    { re: /^📜 Livrer (\d+)× (.+)$/, en: '📜 Deliver $1× $2' },
    { re: /^Stock : (\d+) \/ (\d+)$/, en: 'Stock: $1 / $2' },
    { re: /^marge ([+-]?\d+)$/, en: 'margin $1' },
    { re: /^Étape (\d+) \/ (\d+)$/, en: 'Step $1 / $2' },
    { re: /^J(\d+)$/, en: 'D$1' },
    { re: /^-(\d+) or$/, en: '-$1 gold' },
    { re: /^\+(\d+) or$/, en: '+$1 gold' },
    { re: /^\+(\d+)× (.+)$/, en: '+$1× $2' },
    { re: /^-(\d+) (.+)$/, en: '-$1 $2' }
  ];

  // Mots isolés (biens, libellés courts), appliqués en dernier.
  var WORDS = {
    'Nourriture': 'Food', 'Bois': 'Wood', 'Tissu': 'Cloth', 'Fer': 'Iron',
    'Épices': 'Spices', 'Soie': 'Silk', 'Gemmes': 'Gems', 'Armes': 'Weapons',
    'Artefact': 'Artifact', 'Pain': 'Bread', 'Festin': 'Feast', 'Tapis': 'Carpet', 'Bijou': 'Jewel',
    'désert': 'desert', 'forêt': 'forest', 'côtière': 'coastal', 'montagne': 'mountain',
    'plaine': 'plain', 'côte': 'coast', 'bourg': 'town', 'cité': 'city', 'métropole': 'metropolis',
    'réputation': 'reputation', 'rép.': 'rep.', 'or/u': 'gold/u'
  };

  function coreTranslate(core) {
    if (!core) return core;
    if (lang === 'fr') return core;
    var out = core;
    if (DICT[core]) {
      out = DICT[core];
    } else {
      for (var i = 0; i < PATTERNS.length; i++) {
        if (PATTERNS[i].re.test(core)) { out = core.replace(PATTERNS[i].re, PATTERNS[i].en); break; }
      }
    }
    // Applique ensuite les mots isolés (biens, biomes, tailles) au résultat.
    Object.keys(WORDS).forEach(function (fr) { out = out.split(fr).join(WORDS[fr]); });
    return out;
  }

  function translate(src) {
    if (!src || lang === 'fr') return src;
    var m = String(src).match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m) return src;
    return m[1] + coreTranslate(m[2]) + m[3];
  }

  function skipped(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el) {
      if (el.id && SKIP_IDS[el.id]) return true;
      el = el.parentElement;
    }
    return false;
  }

  function applyText(node) {
    if (node.nodeType !== 3 || skipped(node)) return;
    if (node.__i18nOrig === undefined) node.__i18nOrig = node.nodeValue;
    node.nodeValue = (lang === 'fr') ? node.__i18nOrig : translate(node.__i18nOrig);
  }

  var ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
  function applyElement(el) {
    if (el.nodeType !== 1 || skipped(el)) return;
    if (el.__i18nAttrs === undefined) {
      el.__i18nAttrs = {};
      ATTRS.forEach(function (a) { if (el.hasAttribute(a)) el.__i18nAttrs[a] = el.getAttribute(a); });
    }
    ATTRS.forEach(function (a) {
      if (el.__i18nAttrs[a] !== undefined) {
        el.setAttribute(a, (lang === 'fr') ? el.__i18nAttrs[a] : translate(el.__i18nAttrs[a]));
      }
    });
  }

  function applyNode(node) {
    if (!node) return;
    applyElement(node);
    if (node.nodeType === 3) applyText(node);
    if (node.querySelectorAll) {
      var all = node.querySelectorAll('*');
      for (var i = 0; i < all.length; i++) applyElement(all[i]);
    }
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    var t;
    while ((t = walker.nextNode())) applyText(t);
  }

  function applyAll() {
    applying = true;
    applyNode(document.body);
    applying = false;
  }

  function updateButton() {
    var b = document.getElementById('lang-toggle');
    if (!b) return;
    b.textContent = (lang === 'fr') ? 'English' : 'Français';
    b.__i18nOrig = b.textContent;
  }

  function setLang(l) {
    lang = (l === 'en') ? 'en' : 'fr';
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    document.title = (lang === 'fr') ? 'Caravane d\'Or' : 'Caravan of Gold';
    updateButton();
    applyAll();
    // Redessine les vues dynamiques avec la nouvelle langue.
    try { if (typeof menu === 'function') menu(); } catch (e) {}
    try { if (typeof ui === 'function' && typeof S !== 'undefined' && S) ui(); } catch (e) {}
    try { if (typeof draw === 'function') draw(); } catch (e) {}
  }

  window.toggleLanguage = function () { setLang(lang === 'fr' ? 'en' : 'fr'); };
  window.I18N = {
    setLang: setLang,
    getLang: function () { return lang; },
    translate: translate,
    apply: applyNode
  };

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    lang = (saved === 'en') ? 'en' : 'fr';
    document.documentElement.lang = lang;
    document.title = (lang === 'fr') ? 'Caravane d\'Or' : 'Caravan of Gold';
    updateButton();
    applyAll();

    var obs = new MutationObserver(function (mutations) {
      if (applying) return;
      var nodes = [];
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) nodes.push(added[j]);
      }
      if (!nodes.length) return;
      applying = true;
      for (var k = 0; k < nodes.length; k++) applyNode(nodes[k]);
      applying = false;
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
