// ─────────────────────────────────────────────────────────────────────────────
// ANITA BISTROT — MENU (unica fonte di verità)
// Cambia un prezzo o un nome QUI e rigenera con:  npm run build
// Non serve toccare il layout: la formattazione "€ X,00" avviene al render.
//
// Come si scrive una voce:  it("Nome", prezzo, { opzioni })
//   prezzo   → numero (usa il punto: 8.5 diventa "€ 8,50")
//   opzioni  → { desc, allergens, tags, priceFrom, available }
//     desc       "descrizione sotto al nome"
//     allergens  ["g","l","p","n","u","s","c"]  (vedi legend qui sotto)
//     tags       ["novita","special","piccante","veg"]  → badge colorati
//     priceFrom  true  → mostra "da € X,00"
//     available  false → nasconde la voce senza cancellarla
//     deliverable true/false → forza se la voce è ordinabile a domicilio
//                 (di default: cibo/soft/dessert sì, alcolici no)
//
// Un gruppo con  compact:true  è una lista fitta (solo nome + prezzo), resa in
// 2 colonne su desktop. Senza compact, ogni voce ha la sua riga con descrizione.
// ─────────────────────────────────────────────────────────────────────────────

const it = (name, price, extra = {}) => ({ name, price, ...extra });

export const menu = {
  legend: {
    g: "Glutine",
    l: "Lattosio",
    p: "Pesce",
    n: "Frutta a guscio",
    u: "Uova",
    s: "Soia",
    c: "Crostacei",
  },
  disclaimer:
    "Per informazioni su allergeni e intolleranze chiedi al personale. Alcuni prodotti possono variare in base alla stagionalità.",

  sections: [
    // ── COLAZIONE ────────────────────────────────────────────────────────────
    {
      id: "colazione",
      title: "Colazione",
      theme: "cream",
      groups: [
        {
          title: "Breakfast",
          items: [
            it("Cornetto vuoto", 1.3, { allergens: ["g", "l"] }),
            it("Cornetto crema e amarene", 1.5, { allergens: ["g", "l", "u"] }),
            it("Cornetto integrale ai frutti rossi", 1.5, { allergens: ["g", "l"] }),
            it("Cornetto cereali al miele", 1.5, { allergens: ["g", "l", "n"] }),
            it("Cornetto special", 1.8, { allergens: ["g", "l"] }),
            it("Conchiglia con crema al latte", 1.8, { allergens: ["g", "l", "u"] }),
            it("Fagottino al cioccolato", 1.8, { allergens: ["g", "l"] }),
            it("Mini cornetto vuoto", 1.0, { allergens: ["g", "l"] }),
            it("Treccia noci e acero", 1.5, { allergens: ["g", "l", "n"] }),
          ],
        },
      ],
    },

    // ── BRUNCH ───────────────────────────────────────────────────────────────
    {
      id: "brunch",
      title: "Brunch",
      theme: "cream",
      groups: [
        {
          title: "Brunch",
          items: [
            it("Roll", 5.0, {
              desc: "Crudo, rucola, scaglie / Pomodoro, cotto e provola / varianti a scelta",
              allergens: ["g", "l"],
            }),
            it("Club Sandwich", 5.0, {
              desc: "Varianti a scelta, da comporre al momento",
              allergens: ["g", "l", "u"],
              priceFrom: true,
            }),
            it("Avocado toast", 8.0, {
              desc: "Avocado, salmone affumicato e uovo in camicia",
              allergens: ["g", "p", "u"],
              tags: ["special"],
            }),
            it("Macedonia", 6.0, { desc: "Tagliata di frutta di stagione" }),
            it("Pancake", 4.5, {
              desc: "Con sciroppo d'acero e frutta di stagione",
              allergens: ["g", "l", "u"],
            }),
          ],
        },
      ],
    },

    // ── CAFFETTERIA ──────────────────────────────────────────────────────────
    {
      id: "caffetteria",
      title: "Caffetteria",
      theme: "cream",
      groups: [
        {
          title: "Signature Coffee — metodo espresso",
          items: [
            it("FM1", 1.5, { desc: "60% arabica, 40% robusta — deciso, dolce, cremoso" }),
            it("FM2", 1.5, { desc: "70% arabica, 30% robusta — dolce, equilibrato, corposo" }),
            it("Cold Brew", 4.0, { desc: "100% arabica — Fratelli Milano" }),
            it("Espresso Leccese", 3.0, {
              desc: "Doppio espresso, linfa di mandorle leccese, ghiaccio",
              allergens: ["n"],
            }),
            it("Caffè Anita", 3.0, {
              desc: "Gelato alla vaniglia e caffè",
              allergens: ["l"],
              tags: ["special"],
            }),
            it("Caffè pistacchio", 4.0, { allergens: ["l", "n"] }),
            it("Caffè Tiramisù", 4.0, { allergens: ["l", "g", "u"] }),
            it("Crema caffè home made", 5.0, { allergens: ["l"] }),
            it("Caffè Kinder", 6.0, { allergens: ["l", "g"] }),
            it("Caffè Nutella", 4.0, { allergens: ["l", "n"] }),
            it("Caffè Black/white", 4.0, { allergens: ["l"] }),
          ],
        },
        {
          title: "Cappuccini",
          items: [
            it("Cappuccino", 2.0, { allergens: ["l"] }),
            it("Cappuccino soia", 3.0, { allergens: ["s"] }),
            it("Cappuccino latte alle mandorle", 3.0, { allergens: ["n"] }),
          ],
        },
        {
          title: "Cioccolate, tisane, infusi",
          items: [
            it("Cioccolata calda", 3.5, {
              desc: "al latte / extra fondente / bianco",
              allergens: ["l"],
            }),
            it("Cioccolata calda pistacchio", 4.0, { allergens: ["l", "n"] }),
            it("Tisana classica", 2.5),
            it("Infuso frutti di bosco", 3.0),
            it("Infuso profumi d'Oriente", 3.0),
            it("Thè nero", 3.5),
          ],
        },
      ],
    },

    // ── RISTORANTE ───────────────────────────────────────────────────────────
    {
      id: "ristorante",
      title: "Ristorante",
      theme: "forest",
      groups: [
        {
          title: "Sfizi e antipasti",
          items: [
            it("Nuggets di pollo 8pz", 6.0, { tags: ["novita"], allergens: ["g"] }),
            it("Alette di pollo 5pz", 6.0, { tags: ["novita"] }),
            it("Gamberi in tempura 3pz", 9.0, {
              desc: "con salsa teriyaki",
              tags: ["novita"],
              allergens: ["g", "c", "s"],
            }),
            it("Carpaccio di black angus", 16.0, {
              desc: "servito in base alla stagionalità dei prodotti",
              tags: ["novita"],
            }),
            it("Banditos 5pz", 7.0, {
              desc: "con panatura di Panko Viola",
              tags: ["novita"],
              allergens: ["g"],
            }),
            it("Bao bun 3pz", 10.0, {
              desc: "pulled pork homemade, cheddar, cipolla croccante e peperoncino in fili",
              tags: ["novita", "piccante"],
              allergens: ["g", "l"],
            }),
            it("Pop corn di pollo", 5.0, { tags: ["novita"], allergens: ["g"] }),
            it("Emmental Gold 3pz", 6.0, { tags: ["novita"], allergens: ["g", "l"] }),
            it("Arrosticini 4pz", 7.5, { desc: "carne bovina", tags: ["novita"] }),
            it("Patatine cross", 5.0),
            it("Tagliere Anita", 25.0, {
              desc: "consigliato per due persone",
              tags: ["special"],
              allergens: ["l", "g"],
            }),
            it("Patatine stick", 5.0),
            it("Chicken duble stick 3pz", 7.5, { allergens: ["g"] }),
            it("Percorso di bruschette 3pz", 7.5, { allergens: ["g"] }),
          ],
        },
        {
          title: "Aperitivo / Apericena",
          items: [
            it("Finger food 5pz", 4.0, {
              desc: "fantasia dello chef a seconda delle stagioni",
            }),
            it("Aperitivo della casa", 8.0, {
              desc: "rosticceria e cucinato fatto da noi",
              tags: ["special"],
            }),
            it("Aperitivo della casa x2", 12.0, {
              desc: "rosticceria e cucinato fatto da noi",
              tags: ["special"],
            }),
          ],
        },
        {
          title: "Primi — menu del giorno",
          note: "Servizio di tavola calda con menu del giorno: due primi a scelta, secondo e contorni.",
          items: [
            it("Bauletti ripieni", 13.0, {
              desc: "con porcini e taleggio su crema di porcini e salvia croccante",
              tags: ["novita"],
              allergens: ["g", "l"],
            }),
            it("Gnocchetti alla nerano", 12.0, {
              desc: "zucchine croccanti, caciocavallo e basilico cristallizzato",
              tags: ["novita"],
              allergens: ["g", "l"],
            }),
          ],
        },
        {
          title: "Secondi",
          items: [
            it("Entrecôte di Angus Argentino", 21.0, {
              desc: "circa 300gr — consigliata con rucola, scaglie di Parmigiano e pomodorini datterino",
              tags: ["special"],
              allergens: ["l"],
            }),
            it("Guancialino di manzo", 15.0, {
              desc: "su crema di patate arrosto e rosmarino",
              tags: ["novita"],
            }),
            it("Baccalà pastellato", 13.0, {
              desc: "con scarole e polvere di olive nere",
              tags: ["novita"],
              allergens: ["g", "p"],
            }),
            it("Cotoletta di pollo", 6.0, {
              desc: "in panatura croccante homemade",
              allergens: ["g", "u"],
            }),
            it("Hamburger di Scottona 220gr", 6.5),
            it("Salsiccia a punta di coltello", 5.0),
          ],
        },
        {
          title: "Le nostre insalate",
          items: [
            it("Caesar Salad", 8.0, {
              desc: "iceberg, pollo arrostito, scaglie di grana, salsa caesar, crostini homemade",
              allergens: ["g", "l", "u"],
            }),
            it("Burger Salad", 10.0, {
              desc: "iceberg, hamburger, rucola, pomodorini, scaglie di grana",
              allergens: ["l"],
            }),
            it("Italian Salad", 9.0, {
              desc: "iceberg, fiordilatte, carote, mais, pomodori, tonno e olive",
              allergens: ["p", "l"],
            }),
          ],
        },
        {
          title: "I nostri saltimbocca a km0",
          items: [
            it("La-Riccia", 7.0, {
              desc: "porchetta, provola, patate al forno",
              allergens: ["g", "l"],
            }),
            it("Il Siciliano", 8.0, {
              desc: "hamburger di scottona, provola, melanzane a funghetto",
              allergens: ["g", "l"],
            }),
            it("Il Norvegese in Grecia", 9.0, {
              desc: "salmone affumicato, rucola, zucchine grigliate, salsa yogurt",
              allergens: ["g", "l", "p"],
            }),
            it("O' paesan", 8.0, {
              desc: "salsiccia, provola, friarielli e fili di peperoncino",
              tags: ["novita", "piccante"],
              allergens: ["g", "l"],
            }),
          ],
        },
        {
          title: "Dessert",
          note: "Per altri dessert chiedi in sala.",
          items: [
            it("Crostiera", 6.0, { tags: ["novita"], allergens: ["g", "l", "u", "n"] }),
          ],
        },
      ],
    },

    // ── COCKTAIL ─────────────────────────────────────────────────────────────
    {
      id: "cocktail",
      title: "Cocktail",
      theme: "purple",
      groups: [
        {
          title: "Signature Anita — pre dinner",
          items: [
            it("Il tributo di Anita", 12.0, {
              desc: "Gin Tribute 4 cl, Mezcal Tribute 1 cl, Tribute tonic lemonade & oliva",
              tags: ["special"],
            }),
            it("Mediterraneo", 9.0, {
              desc: "Italicus 4.5 cl, Gin 2 cl, sour 1.5 cl, top Tassoni",
            }),
            it("L'Isola che non c'è", 9.0, {
              desc: "Rum Captain Morgan 3.5 cl, St. Germain 1.5 cl, lime 2 cl, zucchero 1.5 cl, menta",
            }),
            it("Anita and famous", 10.0, {
              desc: "Mezcal, succo di limone, Strega, aperitivo 900",
            }),
            it("Stregotto", 9.0, { desc: "Bitter 900 3 cl, Strega 3 cl, chinotto Neri" }),
            it("Kir Royal Anita", 7.0, {
              desc: "vino bianco della casa o prosecco, crème de cassis",
            }),
          ],
        },
        {
          title: "Analcolici",
          items: [
            it("Ginger Anita", 6.0, { desc: "lime, arancia, passion fruit, menta, ginger" }),
            it("Hugo Anita", 6.0, { desc: "sciroppo ai fiori di sambuco, menta, ginger ale" }),
            it("Virgin colada", 6.0, { desc: "ananas, lime, cocco" }),
            it("Virgin paloma", 6.0, {
              desc: "sciroppo ai fiori di sambuco, arancia, pompelmo rosa",
            }),
            it("Gin Tonic 0.0", 8.0, { desc: "analcolico" }),
          ],
        },
        {
          title: "Cocktail list",
          note: "Se non diversamente indicato, € 8,00.",
          compact: true,
          items: [
            it("Naked and famous", 8.0),
            it("Mojito", 8.0),
            it("Pornostar Martini", 8.0),
            it("Old Cuban", 8.0),
            it("Black Russian", 8.0),
            it("Espresso Martini", 8.0),
            it("White Russian", 8.0),
            it("Gin Fizz", 8.0),
            it("Daiquiri", 8.0),
            it("Mai Tai", 8.0),
            it("Old Fashioned", 8.0),
            it("Manhattan", 8.0),
            it("Boulevardier", 8.0),
            it("Margarita", 8.0),
            it("Tommy's Margarita", 8.0),
            it("Moscow Mule", 8.0),
            it("Piña Colada", 8.0),
            it("Fernandito", 8.0),
            it("Bramble", 8.0),
            it("Paloma", 8.0),
            it("Paper Plane", 10.0),
            it("Dry Martini", 10.0),
            it("Last Word", 10.0),
            it("Grasshopper", 10.0),
          ],
        },
        {
          title: "Spritz list",
          note: "Ogni spritz € 8,00.",
          compact: true,
          items: [
            it("Passion", 8.0),
            it("Hugo", 8.0),
            it("Limoncello", 8.0),
            it("Anita", 8.0),
            it("Strega", 8.0),
            it("Gamondi", 8.0),
            it("Rucolino", 8.0),
            it("Venturo", 8.0),
            it("Select", 8.0),
          ],
        },
      ],
    },

    // ── VINI ─────────────────────────────────────────────────────────────────
    {
      id: "vini",
      title: "Vini",
      theme: "purple",
      groups: [
        {
          title: "Champagne & Bollicine",
          compact: true,
          items: [
            it("Veuve Clicquot", 100),
            it("Veuve Clicquot Rosé", 150),
            it("Moët & Chandon N.I.R Nectar Impérial Rosé", 250),
            it("Moët & Chandon Impérial", 120),
            it("Moët & Chandon Ice Impérial", 150),
            it("Giorgi 1870 Gran Cuvée Storica", 40),
            it("Cuvée Eleonora Giorgi Extra Dry", 40),
            it("Cuvée Eleonora Giorgi Extra Dry Rosé", 50),
            it("Annamaria Clementi Franciacorta 2011 Ca' del Bosco", 250),
            it("Armand de Brignac Brut Gold", 400),
            it("Armand de Brignac Brut Rosé", 750),
            it("Armand de Brignac Brut Green", 500),
            it("Gran Cuvée Bellavista Alma Brut Franciacorta", 70),
            it("Ca' del Bosco", 80),
            it("Nicolas Feuillatte Réserve Exclusive", 100),
            it("Ferrari Brut", 50),
            it("Giorgi Blanc de Noir Metodo Classico", 50),
            it("Giorgi Top Zero", 70),
          ],
        },
        {
          title: "Rossi",
          compact: true,
          items: [
            it("Giordano Eventus", 20),
            it("Giordano Montepulciano d'Abruzzo", 25),
            it("Aglianico Guerriero", 20),
            it("Primitivo di Manduria Talò San Marzano", 28),
            it("Masciarelli Montepulciano d'Abruzzo", 30),
            it("Primitivo Quota 29", 25),
            it("Doraluna Rosato Frizzante", 25),
            it("Giorgi La Burghera Frizzante", 20),
            it("Tramonti Costa d'Amalfi", 25),
            it("Jungano 2019 IGP Paestum Aglianico", 35),
            it("Raggiante Mediterraneo", 25),
            it("Donnafugata La Bella Sedàra Sicilia", 25),
            it("Zenato Valpolicella Classico Superiore 2019", 30),
            it("Sangue di Giuda dell'Oltrepò Pavese", 20),
            it("Lacryma Christi del Vesuvio Tenuta Basile", 30),
            it("Primitivo Moio 57 Tenuta Moio", 30),
            it("Furore Marisa Cuomo", 55),
            it("Ravello L'Oro dei Dei — Cantine Sammarco", 45),
            it("Aglianico del Sannio Riserva — Terre Stregate", 45),
            it("Costa d'Amalfi Terre Saracene — Cantine Sammarco", 45),
            it("Amarone Valpolicella — Casa d'Ambra", 75),
            it("Barolo 2018 — Custoditur", 60),
            it("Getis Reale Tramonti Rosato", 50),
            it("Ravello Costa d'Amalfi", 40),
            it("Brunello di Montalcino — Piccini", 70),
            it("Cardamone Reale Tramonti", 50),
            it("Chianti Riserva 2019 — Piccini", 35),
            it("Tramonti Costa d'Amalfi — Apicella", 35),
            it("Primitivo ICE — Masso Antico", 30),
          ],
        },
        {
          title: "Bianchi",
          compact: true,
          items: [
            it("Greco di Tufo I Tufi", 25),
            it("Gewürztraminer Südtirol Colterenzio", 30),
            it("Chardonnay I Mastri", 25),
            it("Chardonnay Elena Walch", 28),
            it("Stefano Antonucci Passerina", 25),
            it("Muzic Collio Chardonnay", 25),
            it("Carpettone DOP Tenuta Basile", 35),
            it("Furore Marisa", 55),
            it("Ravello L'Oro degli Dei — Cantina Sammarco", 45),
            it("Colli Santa Marina Tramonti — Cantine Apicella", 40),
            it("Costa d'Amalfi Terre Saracene — Cantina Sammarco", 45),
            it("Ravello Costa d'Amalfi — Cantina Sammarco", 40),
            it("Fiano Sannio — Feudo Ducale", 25),
            it("Falanghina Sannio — Feudo Ducale", 25),
          ],
        },
      ],
    },

    // ── DISTILLATI ───────────────────────────────────────────────────────────
    {
      id: "distillati",
      title: "Distillati",
      theme: "purple",
      groups: [
        {
          title: "Gin list",
          compact: true,
          items: [
            it("Le Tribute", 12),
            it("Vesuvius", 10),
            it("1861", 10),
            it("Corricella", 12),
            it("Corricella Tangerine", 12),
            it("Adamus", 12),
            it("Alkkemist", 12),
            it("Roku", 9),
            it("Gin Mare", 10),
            it("Gin Mare Capri", 10),
            it("Portofino", 12),
            it("Monkey 47", 12),
            it("Hendrick's", 10),
            it("Malfy", 10),
            it("Malfy pompelmo rosa", 10),
            it("Malfy arancia rossa", 10),
            it("Gin del Professore Crocodile", 9),
            it("Gin del Professore Madame", 11),
            it("Gin del Professore Monsieur", 11),
            it("Bulldog", 10),
            it("Tanqueray Sevilla", 12),
            it("Tanqueray Ten", 10),
            it("Brockmans", 13),
            it("London N.3", 12),
            it("Sharish", 10),
            it("Bombay Dry", 9),
            it("Bombay Sapphire", 9),
            it("Nordés", 9),
            it("The Botanist", 10),
            it("Sabatini", 11),
            it("Engine", 12),
            it("Gin Arte", 12),
            it("Beefeater 25", 10),
            it("Gin alla camomilla", 13),
            it("Holly Water", 13),
          ],
        },
        {
          title: "Amari & Liquori",
          note: "Ogni voce € 5,00.",
          compact: true,
          items: [
            it("Jefferson", 5),
            it("Petrus", 5),
            it("Fernet-Branca", 5),
            it("Cynar", 5),
            it("Amaro del Capo", 5),
            it("Jägermeister", 5),
            it("Unicum", 5),
            it("Fernet-Branca Menta", 5),
            it("Amaro al Luppolo", 5),
            it("Montenegro", 5),
            it("Amaro Silano", 5),
            it("Limoncello", 5),
            it("Meloncello", 5),
            it("Mirto", 5),
            it("China Martini", 5),
            it("Baileys", 5, { allergens: ["l"] }),
            it("Bonheur liquore agli agrumi", 5),
            it("Rucolino", 5),
            it("Crema di Gelsi Neri", 5),
            it("Crema di Tequila Rosé", 5),
          ],
        },
        {
          title: "Rum",
          compact: true,
          items: [
            it("Havana 7", 5),
            it("Pampero Blanco", 5),
            it("Zacapa XO", 12),
            it("Diplomático", 8),
            it("Captain Morgan", 6),
            it("Zacapa 23", 8),
            it("Don Papa", 10),
            it("Dictador", 10),
          ],
        },
        {
          title: "Whiskey",
          compact: true,
          items: [
            it("Jack Daniel's Classic", 4),
            it("Glen Grant", 6),
            it("Bulleit Bourbon", 6),
            it("Bulleit Rye", 6),
            it("Oban 14", 7),
            it("Lagavulin 16", 10),
            it("Nikka", 10),
            it("Woodford Reserve", 6),
            it("Talisker 10", 7),
            it("Jameson", 5),
            it("Gouden Carolus Sherry", 7),
            it("The Tottori", 10),
          ],
        },
      ],
    },

    // ── SOFT & BIRRE ─────────────────────────────────────────────────────────
    {
      id: "soft-birre",
      title: "Soft & Birre",
      theme: "cream",
      groups: [
        {
          title: "Soft drink",
          compact: true,
          items: [
            it("Acqua", 1.5),
            it("Acqua vetro", 2.0),
            it("Coca-Cola", 2.5),
            it("Coca-Cola Zero", 2.5),
            it("Thè limone", 3.0),
            it("Thè pesca", 3.0),
            it("Red Bull", 3.5),
            it("Crodino", 3.0),
            it("Bitter bianco", 2.5),
            it("Bitter rosso", 2.5),
            it("Fanta", 2.5),
            it("London ginger beer", 3.5),
            it("London ginger ale", 3.5),
            it("Tribute lemon", 4.0),
            it("Tribute lemon olive", 4.0),
            it("Tribute tonic", 4.0),
            it("Schweppes Tonica", 3.0),
            it("Tassoni", 3.0),
            it("San Pellegrino rosso", 3.5),
            it("San Pellegrino bianco", 3.5),
            it("Chinotto", 3.0),
            it("Schweppes Pompelmo", 3.0),
            it("Red Bull dragon fruit", 4.0),
            it("Red Bull juneberry", 4.0),
            it("Red Bull zero", 4.0),
            it("Red Bull anguria", 4.0),
            it("Red Bull albicocca e fragola", 4.0),
          ],
        },
        {
          title: "Birre",
          compact: true,
          items: [
            it("Leffe Blonde", 4.0, { allergens: ["g"] }),
            it("Ceres", 3.5, { allergens: ["g"] }),
            it("Corona", 3.0, { allergens: ["g"] }),
            it("Heineken", 2.5, { allergens: ["g"] }),
            it("Tennent's", 3.0, { allergens: ["g"] }),
            it("Ichnusa Non Filtrata", 3.0, { allergens: ["g"] }),
            it("Desperados", 3.0, { allergens: ["g"] }),
            it("Leffe Rouge", 5.0, { allergens: ["g"] }),
          ],
        },
      ],
    },
  ],
};
