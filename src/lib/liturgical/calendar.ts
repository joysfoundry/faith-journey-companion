/**
 * Liturgical calendar — names any calendar date the way the USCCB does:
 * the seasonal day ("Twentieth Sunday in Ordinary Time", "Thursday of the Third
 * Week of Lent") plus the saint/feast/solemnity that governs it, if any.
 *
 * Everything is COMPUTED from the date — no stored map, no seed to maintain, no
 * STORAGE_KEY bump. The only inputs are the year's movable days (all derived
 * from Easter via Computus) and a fixed-date sanctoral table (below).
 *
 * Scope: the General Roman Calendar as observed in the United States (USCCB).
 * US assumptions, since this ships to the family:
 *   - Epiphany on the Sunday between Jan 2–8.
 *   - Ascension transferred to the Seventh Sunday of Easter (USCCB majority).
 *   - Corpus Christi on the Sunday after Trinity Sunday.
 *
 * Precedence follows the Table of Liturgical Days: a Sunday of a strong season
 * or a solemnity outranks a saint's memorial; an obligatory memorial outranks a
 * plain weekday; optional memorials never replace the day but are named under it.
 */

export type LiturgicalRank =
  "solemnity" | "feast" | "memorial" | "optional_memorial" | "sunday" | "weekday";

export type LiturgicalSeason = "advent" | "christmas" | "ordinary" | "lent" | "triduum" | "easter";

export type LiturgicalColor = "green" | "violet" | "white" | "red" | "rose";

export interface LiturgicalDay {
  /** YYYY-MM-DD */
  date: string;
  /** Hero title — the governing celebration, or the seasonal day name. */
  title: string;
  /** The seasonal day name (e.g. "Saturday of the Twentieth Week in Ordinary Time"). */
  ferialTitle: string;
  /** Rank of the hero title. */
  rank: LiturgicalRank;
  /** "Solemnity" | "Feast" | "Memorial" — set only when the hero is a named celebration. */
  rankLabel?: string;
  season: LiturgicalSeason;
  color: LiturgicalColor;
  /** Optional memorials available this day (not chosen as hero) — often popes/saints. */
  optionalMemorials: string[];
}

/* --------------------------- date helpers (UTC) --------------------------- */
// Work entirely in UTC to stay free of the host timezone. Dates are the plain
// YYYY-MM-DD the rest of the app uses.

function d(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}
function fromISO(iso: string): Date {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, day!));
}
function addDays(date: Date, n: number): Date {
  const c = new Date(date.getTime());
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}
function dow(date: Date): number {
  return date.getUTCDay(); // 0 = Sunday
}
function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
/** The Sunday on or before `date` (the Sunday that begins its liturgical week). */
function sundayOnOrBefore(date: Date): Date {
  return addDays(date, -dow(date));
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const ORDINALS = [
  "",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
  "Thirteenth",
  "Fourteenth",
  "Fifteenth",
  "Sixteenth",
  "Seventeenth",
  "Eighteenth",
  "Nineteenth",
  "Twentieth",
  "Twenty-first",
  "Twenty-second",
  "Twenty-third",
  "Twenty-fourth",
  "Twenty-fifth",
  "Twenty-sixth",
  "Twenty-seventh",
  "Twenty-eighth",
  "Twenty-ninth",
  "Thirtieth",
  "Thirty-first",
  "Thirty-second",
  "Thirty-third",
  "Thirty-fourth",
] as const;

function ordinal(n: number): string {
  return ORDINALS[n] ?? `${n}th`;
}

/* --------------------------- movable-day anchors -------------------------- */

/** Gregorian Easter Sunday (Meeus/Jones/Butcher algorithm). */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const dd = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - dd - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return d(year, month, day);
}

interface YearAnchors {
  year: number;
  epiphany: Date; // US: Sunday between Jan 2–8
  baptism: Date; // Baptism of the Lord — ends Christmas, begins OT
  ashWednesday: Date;
  palmSunday: Date;
  holyThursday: Date;
  goodFriday: Date;
  easter: Date;
  divineMercy: Date; // 2nd Sunday of Easter
  ascension: Date; // US: 7th Sunday of Easter
  pentecost: Date;
  trinity: Date;
  corpusChristi: Date; // US: Sunday after Trinity
  sacredHeart: Date;
  immaculateHeart: Date;
  christTheKing: Date;
  advent1: Date; // First Sunday of Advent
}

function anchorsFor(year: number): YearAnchors {
  const easter = easterSunday(year);

  // Epiphany (US): the Sunday falling Jan 2–8.
  const jan1 = d(year, 1, 1);
  const jan1Dow = dow(jan1); // 0..6
  // Days from Jan 1 to the first Sunday on/after Jan 2.
  const offsetToSunday = jan1Dow === 0 ? 7 : 7 - jan1Dow; // Jan 1 Sunday -> Jan 8
  const epiphany = addDays(jan1, offsetToSunday);
  // Baptism of the Lord: Sunday after Epiphany, unless Epiphany is Jan 7/8 —
  // then it's the following Monday.
  const epiphanyDom = epiphany.getUTCDate();
  const baptism = epiphanyDom >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);

  // Advent 1 = 4th Sunday before Christmas.
  const christmas = d(year, 12, 25);
  const cDow = dow(christmas);
  const advent4 = addDays(christmas, cDow === 0 ? -7 : -cDow);
  const advent1 = addDays(advent4, -21);
  const christTheKing = addDays(advent1, -7);

  return {
    year,
    epiphany,
    baptism,
    ashWednesday: addDays(easter, -46),
    palmSunday: addDays(easter, -7),
    holyThursday: addDays(easter, -3),
    goodFriday: addDays(easter, -2),
    easter,
    divineMercy: addDays(easter, 7),
    ascension: addDays(easter, 42), // US: transferred to Sunday
    pentecost: addDays(easter, 49),
    trinity: addDays(easter, 56),
    corpusChristi: addDays(easter, 63), // US: Sunday after Trinity
    sacredHeart: addDays(easter, 68), // Friday after Corpus Christi (traditional)
    immaculateHeart: addDays(easter, 69),
    christTheKing,
    advent1,
  };
}

/* ------------------------------- sanctoral -------------------------------- */
// Fixed-date celebrations. `title` is the USCCB-style celebration name; the rank
// supplies the "Solemnity of / Feast of / Memorial of" framing at display time.
// `color: "red"` marks martyrs/apostles/Passion (default color follows season/rank).
// `lord: true` marks feasts OF THE LORD, which outrank a Sunday in Ordinary Time.

interface SanctoralEntry {
  month: number;
  day: number;
  rank: Exclude<LiturgicalRank, "sunday" | "weekday">;
  title: string;
  color?: LiturgicalColor;
  lord?: boolean;
}

// prettier-ignore
const SANCTORAL: SanctoralEntry[] = [
  // ---- January ----
  { month: 1, day: 1,  rank: "solemnity", title: "The Blessed Virgin Mary, the Mother of God" },
  { month: 1, day: 2,  rank: "memorial", title: "Saints Basil the Great and Gregory Nazianzen, Bishops and Doctors of the Church" },
  { month: 1, day: 3,  rank: "optional_memorial", title: "The Most Holy Name of Jesus" },
  { month: 1, day: 4,  rank: "memorial", title: "Saint Elizabeth Ann Seton" },
  { month: 1, day: 5,  rank: "memorial", title: "Saint John Neumann, Bishop" },
  { month: 1, day: 6,  rank: "optional_memorial", title: "Saint André Bessette, Religious" },
  { month: 1, day: 7,  rank: "optional_memorial", title: "Saint Raymond of Penyafort, Priest" },
  { month: 1, day: 13, rank: "optional_memorial", title: "Saint Hilary, Bishop and Doctor of the Church" },
  { month: 1, day: 17, rank: "memorial", title: "Saint Anthony, Abbot" },
  { month: 1, day: 20, rank: "optional_memorial", title: "Saint Fabian, Pope and Martyr", color: "red" },
  { month: 1, day: 21, rank: "memorial", title: "Saint Agnes, Virgin and Martyr", color: "red" },
  { month: 1, day: 22, rank: "optional_memorial", title: "Saint Vincent, Deacon and Martyr", color: "red" },
  { month: 1, day: 24, rank: "memorial", title: "Saint Francis de Sales, Bishop and Doctor of the Church" },
  { month: 1, day: 25, rank: "feast", title: "The Conversion of Saint Paul the Apostle" },
  { month: 1, day: 26, rank: "memorial", title: "Saints Timothy and Titus, Bishops" },
  { month: 1, day: 27, rank: "optional_memorial", title: "Saint Angela Merici, Virgin" },
  { month: 1, day: 28, rank: "memorial", title: "Saint Thomas Aquinas, Priest and Doctor of the Church" },
  { month: 1, day: 31, rank: "memorial", title: "Saint John Bosco, Priest" },
  // ---- February ----
  { month: 2, day: 2,  rank: "feast", title: "The Presentation of the Lord", lord: true },
  { month: 2, day: 3,  rank: "optional_memorial", title: "Saint Blaise, Bishop and Martyr", color: "red" },
  { month: 2, day: 5,  rank: "memorial", title: "Saint Agatha, Virgin and Martyr", color: "red" },
  { month: 2, day: 6,  rank: "memorial", title: "Saint Paul Miki and Companions, Martyrs", color: "red" },
  { month: 2, day: 8,  rank: "optional_memorial", title: "Saint Josephine Bakhita, Virgin" },
  { month: 2, day: 10, rank: "memorial", title: "Saint Scholastica, Virgin" },
  { month: 2, day: 11, rank: "optional_memorial", title: "Our Lady of Lourdes" },
  { month: 2, day: 14, rank: "memorial", title: "Saints Cyril, Monk, and Methodius, Bishop" },
  { month: 2, day: 17, rank: "optional_memorial", title: "The Seven Holy Founders of the Servite Order" },
  { month: 2, day: 21, rank: "optional_memorial", title: "Saint Peter Damian, Bishop and Doctor of the Church" },
  { month: 2, day: 22, rank: "feast", title: "The Chair of Saint Peter the Apostle" },
  { month: 2, day: 23, rank: "memorial", title: "Saint Polycarp, Bishop and Martyr", color: "red" },
  // ---- March ----
  { month: 3, day: 3,  rank: "optional_memorial", title: "Saint Katharine Drexel, Virgin" },
  { month: 3, day: 4,  rank: "optional_memorial", title: "Saint Casimir" },
  { month: 3, day: 7,  rank: "optional_memorial", title: "Saints Perpetua and Felicity, Martyrs", color: "red" },
  { month: 3, day: 8,  rank: "optional_memorial", title: "Saint John of God, Religious" },
  { month: 3, day: 9,  rank: "optional_memorial", title: "Saint Frances of Rome, Religious" },
  { month: 3, day: 17, rank: "optional_memorial", title: "Saint Patrick, Bishop" },
  { month: 3, day: 18, rank: "optional_memorial", title: "Saint Cyril of Jerusalem, Bishop and Doctor of the Church" },
  { month: 3, day: 19, rank: "solemnity", title: "Saint Joseph, Spouse of the Blessed Virgin Mary" },
  { month: 3, day: 23, rank: "optional_memorial", title: "Saint Turibius of Mogrovejo, Bishop" },
  { month: 3, day: 25, rank: "solemnity", title: "The Annunciation of the Lord", lord: true },
  // ---- April ----
  { month: 4, day: 2,  rank: "optional_memorial", title: "Saint Francis of Paola, Hermit" },
  { month: 4, day: 4,  rank: "optional_memorial", title: "Saint Isidore, Bishop and Doctor of the Church" },
  { month: 4, day: 5,  rank: "optional_memorial", title: "Saint Vincent Ferrer, Priest" },
  { month: 4, day: 7,  rank: "memorial", title: "Saint John Baptist de la Salle, Priest" },
  { month: 4, day: 11, rank: "memorial", title: "Saint Stanislaus, Bishop and Martyr", color: "red" },
  { month: 4, day: 13, rank: "optional_memorial", title: "Saint Martin I, Pope and Martyr", color: "red" },
  { month: 4, day: 21, rank: "optional_memorial", title: "Saint Anselm, Bishop and Doctor of the Church" },
  { month: 4, day: 23, rank: "optional_memorial", title: "Saint George, Martyr", color: "red" },
  { month: 4, day: 24, rank: "optional_memorial", title: "Saint Fidelis of Sigmaringen, Priest and Martyr", color: "red" },
  { month: 4, day: 25, rank: "feast", title: "Saint Mark the Evangelist", color: "red" },
  { month: 4, day: 28, rank: "optional_memorial", title: "Saint Peter Chanel, Priest and Martyr", color: "red" },
  { month: 4, day: 29, rank: "memorial", title: "Saint Catherine of Siena, Virgin and Doctor of the Church" },
  { month: 4, day: 30, rank: "optional_memorial", title: "Saint Pius V, Pope" },
  // ---- May ----
  { month: 5, day: 1,  rank: "optional_memorial", title: "Saint Joseph the Worker" },
  { month: 5, day: 2,  rank: "memorial", title: "Saint Athanasius, Bishop and Doctor of the Church" },
  { month: 5, day: 3,  rank: "feast", title: "Saints Philip and James, Apostles", color: "red" },
  { month: 5, day: 10, rank: "optional_memorial", title: "Saint Damien de Veuster, Priest" },
  { month: 5, day: 12, rank: "optional_memorial", title: "Saints Nereus and Achilleus, Martyrs", color: "red" },
  { month: 5, day: 13, rank: "optional_memorial", title: "Our Lady of Fatima" },
  { month: 5, day: 14, rank: "feast", title: "Saint Matthias the Apostle", color: "red" },
  { month: 5, day: 15, rank: "optional_memorial", title: "Saint Isidore the Farmer" },
  { month: 5, day: 18, rank: "optional_memorial", title: "Saint John I, Pope and Martyr", color: "red" },
  { month: 5, day: 20, rank: "optional_memorial", title: "Saint Bernardine of Siena, Priest" },
  { month: 5, day: 21, rank: "optional_memorial", title: "Saint Christopher Magallanes, Priest, and Companions, Martyrs", color: "red" },
  { month: 5, day: 22, rank: "optional_memorial", title: "Saint Rita of Cascia, Religious" },
  { month: 5, day: 25, rank: "optional_memorial", title: "Saint Bede the Venerable, Priest and Doctor of the Church" },
  { month: 5, day: 26, rank: "memorial", title: "Saint Philip Neri, Priest" },
  { month: 5, day: 27, rank: "optional_memorial", title: "Saint Augustine of Canterbury, Bishop" },
  { month: 5, day: 31, rank: "feast", title: "The Visitation of the Blessed Virgin Mary" },
  // ---- June ----
  { month: 6, day: 1,  rank: "memorial", title: "Saint Justin, Martyr", color: "red" },
  { month: 6, day: 2,  rank: "optional_memorial", title: "Saints Marcellinus and Peter, Martyrs", color: "red" },
  { month: 6, day: 3,  rank: "memorial", title: "Saint Charles Lwanga and Companions, Martyrs", color: "red" },
  { month: 6, day: 5,  rank: "memorial", title: "Saint Boniface, Bishop and Martyr", color: "red" },
  { month: 6, day: 6,  rank: "optional_memorial", title: "Saint Norbert, Bishop" },
  { month: 6, day: 9,  rank: "optional_memorial", title: "Saint Ephrem, Deacon and Doctor of the Church" },
  { month: 6, day: 11, rank: "memorial", title: "Saint Barnabas the Apostle", color: "red" },
  { month: 6, day: 13, rank: "memorial", title: "Saint Anthony of Padua, Priest and Doctor of the Church" },
  { month: 6, day: 19, rank: "optional_memorial", title: "Saint Romuald, Abbot" },
  { month: 6, day: 21, rank: "memorial", title: "Saint Aloysius Gonzaga, Religious" },
  { month: 6, day: 22, rank: "optional_memorial", title: "Saint Paulinus of Nola, Bishop" },
  { month: 6, day: 24, rank: "solemnity", title: "The Nativity of Saint John the Baptist" },
  { month: 6, day: 27, rank: "optional_memorial", title: "Saint Cyril of Alexandria, Bishop and Doctor of the Church" },
  { month: 6, day: 28, rank: "memorial", title: "Saint Irenaeus, Bishop and Martyr", color: "red" },
  { month: 6, day: 29, rank: "solemnity", title: "Saints Peter and Paul, Apostles", color: "red" },
  { month: 6, day: 30, rank: "optional_memorial", title: "The First Martyrs of the Holy Roman Church", color: "red" },
  // ---- July ----
  { month: 7, day: 1,  rank: "optional_memorial", title: "Saint Junípero Serra, Priest" },
  { month: 7, day: 3,  rank: "feast", title: "Saint Thomas the Apostle", color: "red" },
  { month: 7, day: 4,  rank: "optional_memorial", title: "Independence Day" },
  { month: 7, day: 5,  rank: "optional_memorial", title: "Saint Anthony Zaccaria, Priest" },
  { month: 7, day: 6,  rank: "optional_memorial", title: "Saint Maria Goretti, Virgin and Martyr", color: "red" },
  { month: 7, day: 9,  rank: "optional_memorial", title: "Saint Augustine Zhao Rong, Priest, and Companions, Martyrs", color: "red" },
  { month: 7, day: 11, rank: "memorial", title: "Saint Benedict, Abbot" },
  { month: 7, day: 13, rank: "optional_memorial", title: "Saint Henry" },
  { month: 7, day: 14, rank: "memorial", title: "Saint Kateri Tekakwitha, Virgin" },
  { month: 7, day: 15, rank: "memorial", title: "Saint Bonaventure, Bishop and Doctor of the Church" },
  { month: 7, day: 16, rank: "optional_memorial", title: "Our Lady of Mount Carmel" },
  { month: 7, day: 18, rank: "optional_memorial", title: "Saint Camillus de Lellis, Priest" },
  { month: 7, day: 20, rank: "optional_memorial", title: "Saint Apollinaris, Bishop and Martyr", color: "red" },
  { month: 7, day: 21, rank: "optional_memorial", title: "Saint Lawrence of Brindisi, Priest and Doctor of the Church" },
  { month: 7, day: 22, rank: "feast", title: "Saint Mary Magdalene" },
  { month: 7, day: 23, rank: "optional_memorial", title: "Saint Bridget of Sweden, Religious" },
  { month: 7, day: 24, rank: "optional_memorial", title: "Saint Sharbel Makhluf, Priest" },
  { month: 7, day: 25, rank: "feast", title: "Saint James the Apostle", color: "red" },
  { month: 7, day: 26, rank: "memorial", title: "Saints Joachim and Anne, Parents of the Blessed Virgin Mary" },
  { month: 7, day: 29, rank: "memorial", title: "Saints Martha, Mary and Lazarus" },
  { month: 7, day: 30, rank: "optional_memorial", title: "Saint Peter Chrysologus, Bishop and Doctor of the Church" },
  { month: 7, day: 31, rank: "memorial", title: "Saint Ignatius of Loyola, Priest" },
  // ---- August ----
  { month: 8, day: 1,  rank: "memorial", title: "Saint Alphonsus Liguori, Bishop and Doctor of the Church" },
  { month: 8, day: 2,  rank: "optional_memorial", title: "Saint Eusebius of Vercelli, Bishop" },
  { month: 8, day: 4,  rank: "memorial", title: "Saint John Vianney, Priest" },
  { month: 8, day: 5,  rank: "optional_memorial", title: "The Dedication of the Basilica of Saint Mary Major" },
  { month: 8, day: 6,  rank: "feast", title: "The Transfiguration of the Lord", lord: true },
  { month: 8, day: 7,  rank: "optional_memorial", title: "Saint Sixtus II, Pope, and Companions, Martyrs", color: "red" },
  { month: 8, day: 8,  rank: "memorial", title: "Saint Dominic, Priest" },
  { month: 8, day: 9,  rank: "optional_memorial", title: "Saint Teresa Benedicta of the Cross, Virgin and Martyr", color: "red" },
  { month: 8, day: 10, rank: "feast", title: "Saint Lawrence, Deacon and Martyr", color: "red" },
  { month: 8, day: 11, rank: "memorial", title: "Saint Clare, Virgin" },
  { month: 8, day: 12, rank: "optional_memorial", title: "Saint Jane Frances de Chantal, Religious" },
  { month: 8, day: 13, rank: "optional_memorial", title: "Saints Pontian, Pope, and Hippolytus, Priest, Martyrs", color: "red" },
  { month: 8, day: 14, rank: "memorial", title: "Saint Maximilian Kolbe, Priest and Martyr", color: "red" },
  { month: 8, day: 15, rank: "solemnity", title: "The Assumption of the Blessed Virgin Mary" },
  { month: 8, day: 16, rank: "optional_memorial", title: "Saint Stephen of Hungary" },
  { month: 8, day: 19, rank: "optional_memorial", title: "Saint John Eudes, Priest" },
  { month: 8, day: 20, rank: "memorial", title: "Saint Bernard, Abbot and Doctor of the Church" },
  { month: 8, day: 21, rank: "memorial", title: "Saint Pius X, Pope" },
  { month: 8, day: 22, rank: "memorial", title: "The Queenship of the Blessed Virgin Mary" },
  { month: 8, day: 23, rank: "optional_memorial", title: "Saint Rose of Lima, Virgin" },
  { month: 8, day: 24, rank: "feast", title: "Saint Bartholomew the Apostle", color: "red" },
  { month: 8, day: 25, rank: "optional_memorial", title: "Saint Louis" },
  { month: 8, day: 27, rank: "memorial", title: "Saint Monica" },
  { month: 8, day: 28, rank: "memorial", title: "Saint Augustine, Bishop and Doctor of the Church" },
  { month: 8, day: 29, rank: "memorial", title: "The Passion of Saint John the Baptist", color: "red" },
  // ---- September ----
  { month: 9, day: 3,  rank: "memorial", title: "Saint Gregory the Great, Pope and Doctor of the Church" },
  { month: 9, day: 8,  rank: "feast", title: "The Nativity of the Blessed Virgin Mary" },
  { month: 9, day: 9,  rank: "memorial", title: "Saint Peter Claver, Priest" },
  { month: 9, day: 12, rank: "optional_memorial", title: "The Most Holy Name of Mary" },
  { month: 9, day: 13, rank: "memorial", title: "Saint John Chrysostom, Bishop and Doctor of the Church" },
  { month: 9, day: 14, rank: "feast", title: "The Exaltation of the Holy Cross", lord: true, color: "red" },
  { month: 9, day: 15, rank: "memorial", title: "Our Lady of Sorrows" },
  { month: 9, day: 16, rank: "memorial", title: "Saints Cornelius, Pope, and Cyprian, Bishop, Martyrs", color: "red" },
  { month: 9, day: 17, rank: "optional_memorial", title: "Saint Robert Bellarmine, Bishop and Doctor of the Church" },
  { month: 9, day: 19, rank: "optional_memorial", title: "Saint Januarius, Bishop and Martyr", color: "red" },
  { month: 9, day: 20, rank: "memorial", title: "Saints Andrew Kim Taegŏn, Priest, and Paul Chŏng Hasang, and Companions, Martyrs", color: "red" },
  { month: 9, day: 21, rank: "feast", title: "Saint Matthew, Apostle and Evangelist", color: "red" },
  { month: 9, day: 23, rank: "memorial", title: "Saint Pius of Pietrelcina, Priest" },
  { month: 9, day: 26, rank: "optional_memorial", title: "Saints Cosmas and Damian, Martyrs", color: "red" },
  { month: 9, day: 27, rank: "memorial", title: "Saint Vincent de Paul, Priest" },
  { month: 9, day: 28, rank: "optional_memorial", title: "Saint Wenceslaus, Martyr", color: "red" },
  { month: 9, day: 29, rank: "feast", title: "Saints Michael, Gabriel and Raphael, Archangels" },
  { month: 9, day: 30, rank: "memorial", title: "Saint Jerome, Priest and Doctor of the Church" },
  // ---- October ----
  { month: 10, day: 1,  rank: "memorial", title: "Saint Thérèse of the Child Jesus, Virgin and Doctor of the Church" },
  { month: 10, day: 2,  rank: "memorial", title: "The Holy Guardian Angels" },
  { month: 10, day: 4,  rank: "memorial", title: "Saint Francis of Assisi" },
  { month: 10, day: 6,  rank: "optional_memorial", title: "Saint Bruno, Priest" },
  { month: 10, day: 7,  rank: "memorial", title: "Our Lady of the Rosary" },
  { month: 10, day: 9,  rank: "optional_memorial", title: "Saint Denis, Bishop, and Companions, Martyrs", color: "red" },
  { month: 10, day: 11, rank: "optional_memorial", title: "Saint John XXIII, Pope" },
  { month: 10, day: 14, rank: "optional_memorial", title: "Saint Callistus I, Pope and Martyr", color: "red" },
  { month: 10, day: 15, rank: "memorial", title: "Saint Teresa of Jesus, Virgin and Doctor of the Church" },
  { month: 10, day: 16, rank: "optional_memorial", title: "Saint Hedwig, Religious" },
  { month: 10, day: 17, rank: "memorial", title: "Saint Ignatius of Antioch, Bishop and Martyr", color: "red" },
  { month: 10, day: 18, rank: "feast", title: "Saint Luke the Evangelist", color: "red" },
  { month: 10, day: 19, rank: "memorial", title: "Saints John de Brébeuf and Isaac Jogues, Priests, and Companions, Martyrs", color: "red" },
  { month: 10, day: 20, rank: "optional_memorial", title: "Saint Paul of the Cross, Priest" },
  { month: 10, day: 22, rank: "optional_memorial", title: "Saint John Paul II, Pope" },
  { month: 10, day: 23, rank: "optional_memorial", title: "Saint John of Capistrano, Priest" },
  { month: 10, day: 24, rank: "optional_memorial", title: "Saint Anthony Mary Claret, Bishop" },
  { month: 10, day: 28, rank: "feast", title: "Saints Simon and Jude, Apostles", color: "red" },
  // ---- November ----
  { month: 11, day: 1,  rank: "solemnity", title: "All Saints" },
  { month: 11, day: 2,  rank: "feast", title: "The Commemoration of All the Faithful Departed (All Souls' Day)" },
  { month: 11, day: 3,  rank: "optional_memorial", title: "Saint Martin de Porres, Religious" },
  { month: 11, day: 4,  rank: "memorial", title: "Saint Charles Borromeo, Bishop" },
  { month: 11, day: 9,  rank: "feast", title: "The Dedication of the Lateran Basilica", lord: true },
  { month: 11, day: 10, rank: "memorial", title: "Saint Leo the Great, Pope and Doctor of the Church" },
  { month: 11, day: 11, rank: "memorial", title: "Saint Martin of Tours, Bishop" },
  { month: 11, day: 12, rank: "memorial", title: "Saint Josaphat, Bishop and Martyr", color: "red" },
  { month: 11, day: 13, rank: "memorial", title: "Saint Frances Xavier Cabrini, Virgin" },
  { month: 11, day: 15, rank: "optional_memorial", title: "Saint Albert the Great, Bishop and Doctor of the Church" },
  { month: 11, day: 16, rank: "optional_memorial", title: "Saint Margaret of Scotland" },
  { month: 11, day: 17, rank: "memorial", title: "Saint Elizabeth of Hungary, Religious" },
  { month: 11, day: 18, rank: "optional_memorial", title: "The Dedication of the Basilicas of Saints Peter and Paul, Apostles" },
  { month: 11, day: 21, rank: "memorial", title: "The Presentation of the Blessed Virgin Mary" },
  { month: 11, day: 22, rank: "memorial", title: "Saint Cecilia, Virgin and Martyr", color: "red" },
  { month: 11, day: 23, rank: "optional_memorial", title: "Saint Clement I, Pope and Martyr", color: "red" },
  { month: 11, day: 24, rank: "memorial", title: "Saint Andrew Dũng-Lạc, Priest, and Companions, Martyrs", color: "red" },
  { month: 11, day: 30, rank: "feast", title: "Saint Andrew the Apostle", color: "red" },
  // ---- December ----
  { month: 12, day: 3,  rank: "memorial", title: "Saint Francis Xavier, Priest" },
  { month: 12, day: 4,  rank: "optional_memorial", title: "Saint John Damascene, Priest and Doctor of the Church" },
  { month: 12, day: 6,  rank: "optional_memorial", title: "Saint Nicholas, Bishop" },
  { month: 12, day: 7,  rank: "memorial", title: "Saint Ambrose, Bishop and Doctor of the Church" },
  { month: 12, day: 8,  rank: "solemnity", title: "The Immaculate Conception of the Blessed Virgin Mary" },
  { month: 12, day: 9,  rank: "optional_memorial", title: "Saint Juan Diego Cuauhtlatoatzin" },
  { month: 12, day: 11, rank: "optional_memorial", title: "Saint Damasus I, Pope" },
  { month: 12, day: 12, rank: "feast", title: "Our Lady of Guadalupe" },
  { month: 12, day: 13, rank: "memorial", title: "Saint Lucy, Virgin and Martyr", color: "red" },
  { month: 12, day: 14, rank: "memorial", title: "Saint John of the Cross, Priest and Doctor of the Church" },
  { month: 12, day: 21, rank: "optional_memorial", title: "Saint Peter Canisius, Priest and Doctor of the Church" },
  { month: 12, day: 23, rank: "optional_memorial", title: "Saint John of Kanty, Priest" },
  { month: 12, day: 25, rank: "solemnity", title: "The Nativity of the Lord (Christmas)", lord: true },
  { month: 12, day: 26, rank: "feast", title: "Saint Stephen, the First Martyr", color: "red" },
  { month: 12, day: 27, rank: "feast", title: "Saint John, Apostle and Evangelist" },
  { month: 12, day: 28, rank: "feast", title: "The Holy Innocents, Martyrs", color: "red" },
  { month: 12, day: 29, rank: "optional_memorial", title: "Saint Thomas Becket, Bishop and Martyr", color: "red" },
  { month: 12, day: 31, rank: "optional_memorial", title: "Saint Sylvester I, Pope" },
];

const SANCTORAL_BY_KEY = new Map<string, SanctoralEntry[]>();
for (const entry of SANCTORAL) {
  const key = `${entry.month}-${entry.day}`;
  const list = SANCTORAL_BY_KEY.get(key);
  if (list) list.push(entry);
  else SANCTORAL_BY_KEY.set(key, [entry]);
}

/* ------------------------- precedence + rank labels ----------------------- */

const RANK_PRECEDENCE: Record<Exclude<LiturgicalRank, "sunday" | "weekday">, number> = {
  solemnity: 80,
  feast: 50,
  memorial: 30,
  optional_memorial: 20,
};

const RANK_LABEL: Record<LiturgicalRank, string> = {
  solemnity: "Solemnity",
  feast: "Feast",
  memorial: "Memorial",
  optional_memorial: "Optional Memorial",
  sunday: "Sunday",
  weekday: "Weekday",
};

/* ------------------------------ temporal cycle ---------------------------- */
// The seasonal ("of time") layer: what the day is called before any saint. Also
// returns a precedence number so the sanctoral can be compared against it.

interface TemporalDay {
  season: LiturgicalSeason;
  title: string;
  precedence: number;
  isSunday: boolean;
  color: LiturgicalColor;
  /** True on the privileged weekdays where obligatory memorials drop to optional. */
  privilegedWeekday: boolean;
}

function temporalDay(date: Date, a: YearAnchors): TemporalDay {
  const weekday = WEEKDAY_NAMES[dow(date)]!;
  const isSunday = dow(date) === 0;

  // ---- Triduum + Holy Week ----
  if (diffDays(date, a.easter) === 0)
    return {
      season: "triduum",
      title: "Easter Sunday of the Resurrection of the Lord",
      precedence: 100,
      isSunday,
      color: "white",
      privilegedWeekday: false,
    };
  if (diffDays(date, a.holyThursday) === 0)
    return {
      season: "triduum",
      title: "Holy Thursday",
      precedence: 100,
      isSunday: false,
      color: "white",
      privilegedWeekday: true,
    };
  if (diffDays(date, a.goodFriday) === 0)
    return {
      season: "triduum",
      title: "Good Friday of the Passion of the Lord",
      precedence: 100,
      isSunday: false,
      color: "red",
      privilegedWeekday: true,
    };
  if (diffDays(date, addDays(a.easter, -1)) === 0)
    return {
      season: "triduum",
      title: "Holy Saturday",
      precedence: 100,
      isSunday: false,
      color: "white",
      privilegedWeekday: true,
    };

  // ---- Easter Time (Easter → Pentecost) ----
  if (date > a.easter && date <= a.pentecost) {
    if (diffDays(date, a.pentecost) === 0)
      return {
        season: "easter",
        title: "Pentecost Sunday",
        precedence: 95,
        isSunday: true,
        color: "red",
        privilegedWeekday: false,
      };
    if (diffDays(date, a.ascension) === 0)
      return {
        season: "easter",
        title: "The Ascension of the Lord",
        precedence: 95,
        isSunday,
        color: "white",
        privilegedWeekday: false,
      };
    const weeksIn = diffDays(a.easter, sundayOnOrBefore(date)) / 7; // 0-based Sunday index
    const withinOctave = date <= addDays(a.easter, 7);
    if (withinOctave) {
      if (diffDays(date, a.divineMercy) === 0)
        return {
          season: "easter",
          title: "Second Sunday of Easter (Divine Mercy Sunday)",
          precedence: 90,
          isSunday: true,
          color: "white",
          privilegedWeekday: false,
        };
      return {
        season: "easter",
        title: `${weekday} within the Octave of Easter`,
        precedence: 90,
        isSunday: false,
        color: "white",
        privilegedWeekday: true,
      };
    }
    const easterWeekNum = weeksIn + 1; // Sunday index 1 => "Second Sunday of Easter"
    if (isSunday)
      return {
        season: "easter",
        title: `${ordinal(easterWeekNum)} Sunday of Easter`,
        precedence: 60,
        isSunday: true,
        color: "white",
        privilegedWeekday: false,
      };
    return {
      season: "easter",
      title: `${weekday} of the ${ordinal(easterWeekNum)} Week of Easter`,
      precedence: 10,
      isSunday: false,
      color: "white",
      privilegedWeekday: false,
    };
  }

  // ---- Lent (Ash Wednesday → Holy Saturday) ----
  if (date >= a.ashWednesday && date < a.palmSunday) {
    if (diffDays(date, a.ashWednesday) === 0)
      return {
        season: "lent",
        title: "Ash Wednesday",
        precedence: 90,
        isSunday: false,
        color: "violet",
        privilegedWeekday: true,
      };
    if (date < addDays(a.ashWednesday, 4)) {
      // Thursday/Friday/Saturday after Ash Wednesday
      return {
        season: "lent",
        title: `${weekday} after Ash Wednesday`,
        precedence: 25,
        isSunday: false,
        color: "violet",
        privilegedWeekday: true,
      };
    }
    // Lenten weeks are numbered from the First Sunday of Lent.
    const lent1 = addDays(a.ashWednesday, 4); // the Sunday after the Ash-Wed days
    const weekNum = Math.floor(diffDays(lent1, sundayOnOrBefore(date)) / 7) + 1;
    const laetare = weekNum === 4;
    const color: LiturgicalColor = laetare && isSunday ? "rose" : "violet";
    if (isSunday)
      return {
        season: "lent",
        title: `${ordinal(weekNum)} Sunday of Lent`,
        precedence: 90,
        isSunday: true,
        color,
        privilegedWeekday: false,
      };
    return {
      season: "lent",
      title: `${weekday} of the ${ordinal(weekNum)} Week of Lent`,
      precedence: 25,
      isSunday: false,
      color: "violet",
      privilegedWeekday: true,
    };
  }
  // Holy Week (Palm Sunday → Wednesday; Thu–Sat handled above as Triduum)
  if (date >= a.palmSunday && date < a.holyThursday) {
    if (diffDays(date, a.palmSunday) === 0)
      return {
        season: "lent",
        title: "Palm Sunday of the Passion of the Lord",
        precedence: 90,
        isSunday: true,
        color: "red",
        privilegedWeekday: false,
      };
    return {
      season: "lent",
      title: `${weekday} of Holy Week`,
      precedence: 90,
      isSunday: false,
      color: "violet",
      privilegedWeekday: true,
    };
  }

  // ---- Advent ----
  if (date >= a.advent1 && date < d(a.year, 12, 25)) {
    const weekNum = Math.floor(diffDays(a.advent1, sundayOnOrBefore(date)) / 7) + 1;
    const gaudete = weekNum === 3;
    const lateAdvent = date >= d(a.year, 12, 17); // Dec 17–24: the O-Antiphon days
    const color: LiturgicalColor = gaudete && isSunday ? "rose" : "violet";
    if (isSunday)
      return {
        season: "advent",
        title: `${ordinal(weekNum)} Sunday of Advent`,
        precedence: 90,
        isSunday: true,
        color,
        privilegedWeekday: false,
      };
    return {
      season: "advent",
      title: `${weekday} of the ${ordinal(weekNum)} Week of Advent`,
      precedence: lateAdvent ? 25 : 13,
      isSunday: false,
      color: "violet",
      privilegedWeekday: lateAdvent,
    };
  }

  // ---- Christmas Time (Dec 25 → Baptism of the Lord) ----
  const christmas = d(a.year, 12, 25);
  const isChristmasSideDec = date >= christmas; // late December
  const isChristmasSideJan = date <= a.baptism && date < a.ashWednesday && date.getUTCMonth() === 0;
  if (isChristmasSideDec || isChristmasSideJan) {
    if (diffDays(date, a.baptism) === 0)
      return {
        season: "christmas",
        title: "The Baptism of the Lord",
        precedence: 70,
        isSunday,
        color: "white",
        privilegedWeekday: false,
      };
    // Holy Family — Sunday within the octave, or Dec 30 if no Sunday falls there.
    const holyFamily = holyFamilySunday(a);
    if (diffDays(date, holyFamily) === 0)
      return {
        season: "christmas",
        title: "The Holy Family of Jesus, Mary and Joseph",
        precedence: 70,
        isSunday,
        color: "white",
        privilegedWeekday: false,
      };
    if (date > christmas && date < d(a.year, 12, 32)) {
      // Days of the Christmas octave that aren't a fixed feast → "N day..."; the
      // feasts (Stephen, John, Innocents) are supplied by the sanctoral.
      return {
        season: "christmas",
        title: `${weekday} — Christmas Weekday`,
        precedence: 13,
        isSunday: false,
        color: "white",
        privilegedWeekday: true,
      };
    }
    if (isSunday)
      return {
        season: "christmas",
        title: "Sunday after the Nativity",
        precedence: 60,
        isSunday: true,
        color: "white",
        privilegedWeekday: false,
      };
    return {
      season: "christmas",
      title: `${weekday} — Christmas Weekday`,
      precedence: 13,
      isSunday: false,
      color: "white",
      privilegedWeekday: false,
    };
  }

  // ---- Ordinary Time: movable solemnities that replace the day ----
  if (diffDays(date, a.trinity) === 0)
    return {
      season: "ordinary",
      title: "The Most Holy Trinity",
      precedence: 80,
      isSunday: true,
      color: "white",
      privilegedWeekday: false,
    };
  if (diffDays(date, a.corpusChristi) === 0)
    return {
      season: "ordinary",
      title: "The Most Holy Body and Blood of Christ (Corpus Christi)",
      precedence: 80,
      isSunday: true,
      color: "white",
      privilegedWeekday: false,
    };
  if (diffDays(date, a.sacredHeart) === 0)
    return {
      season: "ordinary",
      title: "The Most Sacred Heart of Jesus",
      precedence: 80,
      isSunday: false,
      color: "white",
      privilegedWeekday: false,
    };
  if (diffDays(date, a.immaculateHeart) === 0)
    return {
      season: "ordinary",
      title: "The Immaculate Heart of the Blessed Virgin Mary",
      precedence: 30,
      isSunday: false,
      color: "white",
      privilegedWeekday: false,
    };
  if (diffDays(date, a.christTheKing) === 0)
    return {
      season: "ordinary",
      title: "Our Lord Jesus Christ, King of the Universe",
      precedence: 80,
      isSunday: true,
      color: "white",
      privilegedWeekday: false,
    };

  // ---- Ordinary Time ----
  const otWeek = ordinaryTimeWeek(date, a);
  if (isSunday)
    return {
      season: "ordinary",
      title: `${ordinal(otWeek)} Sunday in Ordinary Time`,
      precedence: 60,
      isSunday: true,
      color: "green",
      privilegedWeekday: false,
    };
  return {
    season: "ordinary",
    title: `${weekday} of the ${ordinal(otWeek)} Week in Ordinary Time`,
    precedence: 10,
    isSunday: false,
    color: "green",
    privilegedWeekday: false,
  };
}

/** Sunday within the Christmas octave (Holy Family); Dec 30 if none falls there. */
function holyFamilySunday(a: YearAnchors): Date {
  const christmas = d(a.year, 12, 25);
  for (let i = 1; i <= 6; i++) {
    const day = addDays(christmas, i); // Dec 26–31
    if (dow(day) === 0) return day;
  }
  return d(a.year, 12, 30); // Christmas is a Sunday → Holy Family on Dec 30
}

/**
 * Ordinary Time week number. Part 1 counts forward from the Baptism of the Lord;
 * part 2 (after Pentecost) counts backward from Christ the King (34th Sunday) so
 * the interrupted numbering resumes correctly.
 */
function ordinaryTimeWeek(date: Date, a: YearAnchors): number {
  if (date <= a.pentecost) {
    // Part 1: weekdays after Baptism are the "First Week"; the next Sunday is the
    // "Second Sunday". weekNum = whole weeks since Baptism's Sunday, + 1.
    return Math.floor(diffDays(sundayOnOrBefore(a.baptism), sundayOnOrBefore(date)) / 7) + 1;
  }
  // Part 2: Christ the King's Sunday is week 34; step back one week per Sunday.
  const weeksToCTK = Math.round(diffDays(sundayOnOrBefore(date), a.christTheKing) / 7);
  return 34 - weeksToCTK;
}

/* -------------------------------- resolver -------------------------------- */

/** The liturgical identity of a single date. */
export function getLiturgicalDay(dateISO: string): LiturgicalDay {
  const date = fromISO(dateISO);
  const a = anchorsFor(date.getUTCFullYear());
  const temporal = temporalDay(date, a);

  const sanctoral = SANCTORAL_BY_KEY.get(`${date.getUTCMonth() + 1}-${date.getUTCDate()}`) ?? [];

  // Split the sanctoral into celebrations that can be the hero (obligatory, and
  // able to outrank the day) vs. optional memorials (always just named under it).
  const optionalMemorials: string[] = [];
  let winner: SanctoralEntry | null = null;
  let winnerPrec = -1;

  for (const entry of sanctoral) {
    const prec = RANK_PRECEDENCE[entry.rank] + (entry.lord ? 20 : 0); // feasts/solemnities OF THE LORD sit above their peers
    const isOptional = entry.rank === "optional_memorial";
    // On privileged weekdays (Lent, late Advent, octaves) an obligatory memorial
    // is reduced to an optional commemoration.
    const demoted = entry.rank === "memorial" && temporal.privilegedWeekday;
    if (isOptional || demoted) {
      optionalMemorials.push(entry.title);
      continue;
    }
    if (prec > winnerPrec) {
      if (winner) optionalMemorials.push(winner.title);
      winner = entry;
      winnerPrec = prec;
    } else {
      optionalMemorials.push(entry.title);
    }
  }

  // Does the winning saint/feast outrank the seasonal day?
  if (winner && winnerPrec > temporal.precedence) {
    const color: LiturgicalColor = winner.color ?? (winner.lord ? temporal.color : "white");
    return {
      date: dateISO,
      title: winner.title,
      ferialTitle: temporal.title,
      rank: winner.rank,
      rankLabel: RANK_LABEL[winner.rank],
      season: temporal.season,
      color,
      optionalMemorials,
    };
  }

  // Seasonal day wins. A demoted obligatory memorial is still worth naming.
  if (winner) optionalMemorials.unshift(winner.title);
  return {
    date: dateISO,
    title: temporal.title,
    ferialTitle: temporal.title,
    rank: temporal.isSunday ? "sunday" : "weekday",
    season: temporal.season,
    color: temporal.color,
    optionalMemorials,
  };
}
