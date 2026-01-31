// src/data/bezne_ceny.ts

// Ceny jsou uvedeny za ZÁKLADNÍ JEDNOTKU, kterou uživatel obvykle myslí (1 ks, 1 kg, 1 balení).
// Algoritmus s tím bude počítat jako s "záchrannou sítí", když nenajde slevu.

export const BEZNE_CENY: Record<string, number> = {
  // --- PEČIVO ---
  'rohlík': 2.90,
  'houska': 3.50,
  'chléb': 44.90,        // Šumava 1.2kg
  'toustový chléb': 34.90,
  'bageta': 14.90,       // střední světlá
  'kaiserka': 4.90,
  'kobliha': 12.90,
  'vánočka': 89.90,

  // --- MLÉČNÉ VÝROBKY & VEJCE ---
  'mléko': 23.90,        // trvanlivé polotučné 1l
  'mléko čerstvé': 29.90,
  'mléko plnotučné': 28.90,
  'máslo': 64.90,        // 250g (bohužel, realita)
  'vejce': 5.90,         // cena za 1 ks (velikost M) - algoritmus násobí počtem
  'sýr': 29.90,          // 100g eidam plátky
  'eidam': 29.90,        // 100g
  'gouda': 32.90,        // 100g
  'hermelín': 36.90,     // 100g ks
  'mozzarella': 24.90,   // 100g ks
  'niva': 34.90,         // 100g
  'tvaroh': 26.90,       // vanička 250g
  'jogurt': 12.90,       // bílý 150g
  'jogurt ovocný': 14.90,
  'smetana': 21.90,      // na vaření 12%
  'zakysaná smetana': 24.90,
  'šlehačka': 32.90,     // 33% 200ml
  'pomazánkové máslo': 36.90,

  // --- MASO & UZENINY (ceny za 1 kg, pokud není uvedeno jinak) ---
  'kuřecí': 189.00,      // prsa
  'kuřecí prsa': 189.00,
  'kuře': 89.00,         // celé chlazené (cena za kg)
  'kuřecí stehna': 99.00,
  'vepřové': 149.00,     // plec/kýta
  'vepřová krkovice': 179.00,
  'mleté maso': 139.00,  // mix 500g balení
  'hovězí': 269.00,      // zadní
  'šunka': 34.90,        // 100g dušená výběrová
  'salám': 24.90,        // 100g vysočina
  'párky': 189.00,       // cena za kg (nebo cca 35 za balíček)
  'klobása': 249.00,     // za kg
  'slanina': 49.90,      // 100g anglická

  // --- RYBY ---
  'rybí prsty': 89.90,   // balení
  'losos': 590.00,       // filet za kg
  'tuňák': 59.90,        // konzerva

  // --- OVOCE (za 1 kg) ---
  'jablka': 34.90,
  'banány': 32.90,
  'pomeranče': 44.90,
  'mandarinky': 49.90,
  'citron': 59.90,
  'hrozny': 89.90,
  'hrušky': 49.90,
  'jahody': 99.00,       // vanička 500g (mimo sezónu)

  // --- ZELENINA (za 1 kg nebo ks) ---
  'brambory': 26.90,
  'cibule': 24.90,
  'mrkev': 22.90,
  'okurka': 21.90,       // ks hadovka
  'rajče': 79.90,        // kg
  'paprika': 89.90,      // kg
  'česnek': 149.00,      // kg (balení 3ks cca 30)
  'salát': 29.90,        // ks ledový
  'květák': 49.90,       // ks
  'brokolice': 39.90,    // ks 500g
  'žampiony': 59.90,     // vanička
  'zelí': 19.90,

  // --- TRVANLIVÉ ---
  'mouka': 21.90,        // hladká/polohrubá
  'cukr': 26.90,         // krupice/krystal
  'sůl': 9.90,
  'olej': 49.90,         // řepkový/slunečnicový 1l
  'olivový olej': 199.00,// 0.75l
  'ocet': 19.90,
  'těstoviny': 34.90,    // 500g (značkové)
  'špagety': 34.90,
  'rýže': 49.90,         // 1kg
  'čočka': 39.90,        // 500g
  'fazole': 39.90,       // plechovka
  'kečup': 59.90,        // jemný 500g
  'hořčice': 14.90,      // plnotučná kelímek
  'majonéza': 54.90,     // sklo
  'med': 189.00,         // 900g
  'ovesné vločky': 24.90,

  // --- NÁPOJE ---
  'voda': 14.90,         // 1.5l neperlivá/jemně
  'minerálka': 16.90,    // Mattoni/Magnesia
  'cola': 39.90,         // 2l (Coca Cola/Pepsi)
  'džus': 39.90,         // 1l 100% pomeranč
  'sirup': 69.90,        // Jupí 0.7l
  'káva': 149.00,        // 250g mletá standard
  'čaj': 39.90,          // ovocný/černý krabička
  'pivo': 19.90,         // lahvové 0.5l (průměr 10-11°)
  'plzeň': 32.90,        // 0.5l
  'víno': 119.00,        // 0.75l běžné jakostní

  // --- SLADKOSTI & SLANÉ ---
  'čokoláda': 34.90,     // 100g Milka/Orion
  'sušenky': 19.90,      // BeBe/Opavia
  'oplatky': 14.90,      // Fidorka/Tatranka
  'brambůrky': 39.90,    // Bohemia 140g
  'oříšky': 49.90,       // 100g solené

  // --- DROGERIE (lidé to píšou na seznam) ---
  'toaletní papír': 89.90, // balení 8 rolí
  'kapesníky': 29.90,      // box
  'zubní pasta': 59.90,    // Colgate/Signal
  'mýdlo': 24.90,          // tekuté náplň nebo kostka
  'sprchový gel': 69.90,   // 250ml
  'šampon': 89.90,
  'prací prášek': 399.00,  // menší balení nebo gel 20PD
  'jar': 49.90,            // na nádobí 900ml
  'houbičky': 19.90,       // balení
};