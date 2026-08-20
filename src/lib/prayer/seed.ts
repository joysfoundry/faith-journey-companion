import type {
  Database,
  ExpressionType,
  Mystery,
  MysteryContent,
  PrayerType,
  TemplateItem,
} from "./types";

const now = "2024-01-01T00:00:00.000Z";

function prayer(
  id: string,
  title: string,
  prayerType: PrayerType,
  body: string,
  tags: string[] = [],
  sourceId = "src-tradition",
  expressionType: ExpressionType = "vocal",
) {
  return {
    prayer: {
      id,
      title,
      prayer_type: prayerType,
      expression_type: expressionType,
      tags,
      favorite: ["our-father", "hail-mary", "glory-be"].includes(id),
      default_version_id: `${id}-v1`,
      source_id: sourceId,
      created_at: now,
    },
    version: {
      id: `${id}-v1`,
      prayer_id: id,
      label: "Traditional",
      body,
      language: "en",
      source_id: sourceId,
      created_at: now,
    },
  };
}

const base = [
  prayer(
    "apostles-creed",
    "Apostles' Creed",
    "liturgical",
    `I believe in God, the Father Almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord; Who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell; the third day He rose again from the dead; He ascended into heaven, is seated at the right hand of God, the Father Almighty; from thence He shall come to judge the living and the dead.

I believe in the Holy Spirit, the Holy Catholic Church, the communion of Saints, the forgiveness of sins, the resurrection of the body and life everlasting. Amen.`,
    ["rosary", "creed"],
  ),
  prayer(
    "our-father",
    "Our Father",
    "liturgical",
    `Our Father, who art in heaven; hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven.

Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us, and lead us not into temptation; but deliver us from evil. Amen.`,
    ["rosary", "core"],
  ),
  prayer(
    "hail-mary",
    "Hail Mary",
    "traditional_expression",
    `Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus.

Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,
    ["rosary", "marian"],
  ),
  prayer(
    "glory-be",
    "Glory Be",
    "liturgical",
    `Glory be to the Father, and to the Son, and to the Holy Spirit.

As it was in the beginning, is now, and ever shall be, world without end. Amen.`,
    ["rosary"],
  ),
  prayer(
    "fatima-prayer",
    "Fatima Prayer",
    "devotional",
    `O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in need of Thy mercy.`,
    ["rosary", "fatima"],
  ),
  prayer(
    "hail-holy-queen",
    "Hail, Holy Queen",
    "devotional",
    `Hail, Holy Queen, Mother of Mercy; hail our life, our sweetness and our hope! To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears.

Turn then, most gracious advocate, your eyes of mercy towards us; and after this our exile, show to us the blessed fruit of your womb, Jesus. O clement, O loving, O sweet Virgin Mary!`,
    ["rosary", "closing"],
  ),
  prayer(
    "prayer-for-peace",
    "Prayer for Peace",
    "devotional",
    `Lord Jesus Christ, Son of the Father, send now Your Spirit over the earth. Let the Holy Spirit live in the hearts of all nations, that they may be preserved from degeneration, disaster and war. May the Lady of All Nations, who once was Mary, be our Advocate. Amen.`,
    ["family", "peace"],
    "src-caro-booklet",
  ),
  prayer(
    "sign-of-the-cross",
    "Sign of the Cross",
    "traditional_expression",
    `In the name of the Father, and of the Son, and of the Holy Spirit. Amen.`,
    ["rosary"],
  ),
  prayer(
    "st-michael-prayer",
    "Prayer to St. Michael the Archangel",
    "devotional",
    `St. Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, thrust into Hell Satan and all the other evil spirits who prowl about the world seeking the ruin of souls. Amen.`,
    ["st michael", "protection", "archangel"],
  ),
];

// Chaplet of St. Michael — nine salutations to the nine choirs of angels.
// Declarative salutations use the generic `custom` component; the V/R lines use
// `salutation`. No chaplet-specific engine — the compiler expands it like any
// other devotion. (Source: private revelation to Antonia d'Astonac, approved 1851.)
const MICHAEL_CHOIRS: Array<[string, string]> = [
  ["Seraphim", "may the Lord make us worthy to burn with the fire of perfect charity."],
  ["Cherubim", "may the Lord grant us the grace to leave the ways of sin and run in the paths of Christian perfection."],
  ["Thrones", "may the Lord infuse into our hearts a true and sincere spirit of humility."],
  ["Dominations", "may the Lord give us grace to govern our senses and overcome unruly passions."],
  ["Virtues", "may the Lord preserve us from evil and from falling into temptation."],
  ["Powers", "may the Lord protect our souls against the snares and temptations of the devil."],
  ["Principalities", "may God fill our souls with the spirit of true obedience."],
  ["Archangels", "may the Lord give us perseverance in faith and in all good works, that we may attain the glory of Heaven."],
  ["Angels", "may the Lord grant us to be protected by them in this mortal life and conducted hereafter to eternal glory."],
];

function chapletItems(): TemplateItem[] {
  const items: TemplateItem[] = [];
  let p = 0;
  const add = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    items.push(ti("tpl-chaplet-michael", p++, partial));

  add({ kind: "salutation", label: "Opening", versicle: "O God, come to my assistance.", response: "O Lord, make haste to help me." });
  add({ kind: "prayer", prayer_id: "glory-be" });
  MICHAEL_CHOIRS.forEach(([choir, petition], i) => {
    add({
      kind: "custom",
      label: `${["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth"][i]} Salutation — Choir of ${choir}`,
      body: `By the intercession of St. Michael and the celestial Choir of ${choir}, ${petition} Amen.`,
    });
    add({ kind: "prayer", prayer_id: "our-father" });
    add({ kind: "prayer", prayer_id: "hail-mary", repetition_count: 3 });
  });
  add({ kind: "custom", label: "Four Our Fathers", body: "Pray one Our Father in honor of each: St. Michael, St. Gabriel, St. Raphael, and our Guardian Angel." });
  add({ kind: "prayer", prayer_id: "our-father", repetition_count: 4 });
  add({
    kind: "custom",
    label: "Closing Prayer",
    body: `O glorious prince St. Michael, chief and commander of the heavenly hosts, guardian of souls, vanquisher of rebel spirits, servant in the house of the Divine King, and our admirable conductor: deliver us from all evil, who turn to you with confidence, and enable us by your gracious protection to serve God more faithfully every day.`,
  });
  add({ kind: "salutation", label: "Versicle", versicle: "Pray for us, O glorious St. Michael, Prince of the Church of Jesus Christ,", response: "That we may be made worthy of His promises." });
  add({
    kind: "custom",
    label: "Let us pray",
    body: `Almighty and Everlasting God, who by a prodigy of goodness and a merciful desire for the salvation of all, has appointed the most glorious Archangel St. Michael Prince of Your Church: make us worthy, we ask You, to be delivered from all our enemies, that none of them may harass us at the hour of death, but that we may be conducted by him into Your Presence. This we ask through the merits of Jesus Christ Our Lord. Amen.`,
  });
  return items;
}
const chapletItemsList = chapletItems();

const mysteryData: Array<{
  set: string;
  weekdays: number[];
  items: Array<[string, string, string]>;
}> = [
  {
    set: "Joyful",
    weekdays: [1, 6],
    items: [
      ["The Annunciation", "The angel Gabriel announces that Mary will bear the Son of God.", "Mary hears an impossible word and answers with trust: 'Be it done unto me according to thy word.' Ask for the grace of humble, unhesitating yes."],
      ["The Visitation", "Mary carries Christ to Elizabeth.", "Mary rises and goes in haste to serve. Christ within her leaps in another's heart. Ask for the grace of charity that moves quickly."],
      ["The Nativity", "Christ is born in Bethlehem.", "The Word becomes small enough to be held. Ask for the grace of poverty of spirit and wonder."],
      ["The Presentation", "Jesus is presented in the Temple.", "Simeon holds the promise and foretells the sword. Ask for the grace of obedience and of offering what we love most."],
      ["The Finding in the Temple", "Jesus is found among the teachers.", "Three days of searching end in the Father's house. Ask for the grace of perseverance when God seems hidden."],
    ],
  },
  {
    set: "Sorrowful",
    weekdays: [2, 5],
    items: [
      ["The Agony in the Garden", "Jesus prays in Gethsemane.", "He sees every sin and every sorrow and still says, 'Not my will but Thine.' Ask for the grace of surrender."],
      ["The Scourging at the Pillar", "Jesus is scourged.", "Innocence bears what guilt deserved. Ask for the grace of purity and self-restraint."],
      ["The Crowning with Thorns", "Jesus is crowned with thorns.", "The King is mocked. Ask for the grace of moral courage when faith is ridiculed."],
      ["The Carrying of the Cross", "Jesus carries His cross to Calvary.", "He falls, He rises, He goes on. Ask for the grace of patience under the daily weight."],
      ["The Crucifixion", "Jesus dies on the Cross.", "From the Cross He gives us His Mother and His pardon. Ask for the grace of final perseverance."],
    ],
  },
  {
    set: "Glorious",
    weekdays: [3, 7],
    items: [
      ["The Resurrection", "Christ rises from the dead.", "The stone is rolled away from every tomb we live in. Ask for the grace of living faith."],
      ["The Ascension", "Christ ascends into heaven.", "Our humanity is carried into the life of God. Ask for the grace of hope."],
      ["The Descent of the Holy Spirit", "The Spirit comes upon the Apostles.", "Fear becomes proclamation. Ask for the grace of the Holy Spirit's gifts."],
      ["The Assumption", "Mary is assumed into heaven.", "The first disciple arrives home whole. Ask for the grace of a holy death."],
      ["The Coronation of Mary", "Mary is crowned Queen of Heaven and Earth.", "She reigns by having served. Ask for the grace of trust in her intercession."],
    ],
  },
  {
    set: "Luminous",
    weekdays: [4],
    items: [
      ["The Baptism in the Jordan", "Jesus is baptized by John.", "The Father names His Beloved. Ask for the grace of fidelity to your baptism."],
      ["The Wedding at Cana", "Water is changed into wine.", "'Do whatever He tells you.' Ask for the grace of listening to Mary's counsel."],
      ["The Proclamation of the Kingdom", "Jesus calls to conversion.", "The Kingdom is near, and mercy is offered. Ask for the grace of repentance."],
      ["The Transfiguration", "Christ is transfigured on the mountain.", "Glory shines through the ordinary face of a friend. Ask for the grace of contemplation."],
      ["The Institution of the Eucharist", "Christ gives His Body and Blood.", "He stays. Ask for the grace of eucharistic love."],
    ],
  },
];

const mystery_sets = mysteryData.map((m, i) => ({
  id: `set-${m.set.toLowerCase()}`,
  name: `${m.set} Mysteries`,
  default_weekdays: m.weekdays,
  position: i,
}));

const mysteries: Mystery[] = [];
const mystery_contents: MysteryContent[] = [];
mysteryData.forEach((set) => {
  set.items.forEach(([title, short, full], idx) => {
    const id = `${set.set.toLowerCase()}-${idx + 1}`;
    mysteries.push({
      id,
      mystery_set_id: `set-${set.set.toLowerCase()}`,
      title,
      position: idx,
    });
    mystery_contents.push(
      { id: `${id}-short`, mystery_id: id, variant: "short_description", body: short },
      { id: `${id}-full`, mystery_id: id, variant: "full_meditation", body: full },
    );
  });
});

function ti(
  templateId: string,
  position: number,
  partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] },
): TemplateItem {
  return {
    id: `${templateId}-i${position}`,
    template_id: templateId,
    position,
    repetition_count: 1,
    optional: false,
    ...partial,
  } as TemplateItem;
}

/** Rosary structure: compact. Repetitions are shorthand expanded at session time. */
function rosaryItems(templateId: string, extras: { fatima: boolean; peace: boolean }) {
  const items: TemplateItem[] = [];
  let p = 0;
  const add = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    items.push(ti(templateId, p++, partial));

  add({ kind: "prayer", prayer_id: "sign-of-the-cross" });
  add({ kind: "prayer", prayer_id: "apostles-creed" });
  add({ kind: "prayer", prayer_id: "our-father" });
  add({ kind: "prayer", prayer_id: "hail-mary", repetition_count: 3 });
  add({ kind: "prayer", prayer_id: "glory-be" });
  for (let d = 1; d <= 5; d++) {
    add({ kind: "mystery_placeholder", mystery_ordinal: d, label: `Decade ${d}` });
    add({ kind: "prayer", prayer_id: "our-father" });
    add({ kind: "prayer", prayer_id: "hail-mary", repetition_count: 10 });
    add({ kind: "prayer", prayer_id: "glory-be" });
    if (extras.fatima) add({ kind: "prayer", prayer_id: "fatima-prayer" });
    if (extras.peace) add({ kind: "prayer", prayer_id: "prayer-for-peace" });
  }
  add({ kind: "prayer", prayer_id: "hail-holy-queen" });
  add({ kind: "prayer", prayer_id: "sign-of-the-cross" });
  return items;
}

const rosaryItemsList = rosaryItems("tpl-rosary", { fatima: true, peace: false });
const caroItemsList = rosaryItems("tpl-caro-rosary", { fatima: true, peace: true });

const novenaItems: TemplateItem[] = rosaryItems("tpl-54-novena", {
  fatima: true,
  peace: false,
}).map((item) => ({ ...item, template_id: "tpl-54-novena" }));
// Phase-specific closing prayers for the 54-day novena.
novenaItems.push(
  ti("tpl-54-novena", novenaItems.length, {
    kind: "prayer",
    prayer_id: "novena-petition",
    condition_tag: "petition",
  }),
  ti("tpl-54-novena", novenaItems.length + 1, {
    kind: "prayer",
    prayer_id: "novena-thanksgiving",
    condition_tag: "thanksgiving",
  }),
);

const novenaPrayers = [
  prayer(
    "novena-petition",
    "54-Day Novena — Petition Prayer",
    "devotional",
    `Hail, Queen of the Most Holy Rosary, my Mother Mary, hail! At thy feet I humbly kneel to offer thee a Crown of Roses — snow-white buds to remind thee of thy joys, each bud recalling to thee a holy mystery.

Sweet Mother, in petition I offer this Rosary, and I beg of thee to obtain for me the favor I ask, if it be the will of God.`,
    ["novena", "petition"],
    "src-54-day-pdf",
  ),
  prayer(
    "novena-thanksgiving",
    "54-Day Novena — Thanksgiving Prayer",
    "devotional",
    `Hail, Queen of the Most Holy Rosary, my Mother Mary, hail! At thy feet I gratefully kneel to offer thee a Crown of Roses in thanksgiving for the graces given.

Sweet Mother, I offer this Rosary in thanksgiving, whatever the answer to my petition may have been, trusting in thy care.`,
    ["novena", "thanksgiving"],
    "src-54-day-pdf",
  ),
];

// Pray with the Pope — a minimal, generic external-link devotion (no pre-added
// prayers). Starting it simply opens the selected/default source.
const popeItems: TemplateItem[] = [
  ti("tpl-pray-with-pope", 0, {
    kind: "external_link",
    label: "Pray with the Pope",
    external_options: [
      { label: "Click to Pray — Pope's Worldwide Prayer Network", url: "https://clicktopray.org/", is_default: true },
      { label: "Vatican News — Pope's Monthly Intention", url: "https://www.vaticannews.va/en/pope/prayer-intentions.html" },
    ],
  }),
];

// Scriptural Rosary — Luminous Mysteries. A distinct Scripture passage before
// each Hail Mary, using the generic `scripture` component (Douay–Rheims, public
// domain). Fixed to the Luminous set (like the USCCB Scriptural Rosary).
const LUMINOUS_SCRIPTURE: Array<{
  title: string;
  description: string;
  scripture: Array<[string, string]>;
}> = [
  {
    title: "The Baptism of the Lord in the Jordan",
    description: "The heavens open and the Father proclaims Jesus His beloved Son.",
    scripture: [
      ["Mt 3:13", "Then cometh Jesus from Galilee to the Jordan, unto John, to be baptized by him."],
      ["Mt 3:14", "But John stayed him, saying: I ought to be baptized by thee, and comest thou to me?"],
      ["Mt 3:15", "Suffer it to be so now; for so it becometh us to fulfil all justice."],
      ["Mt 3:16", "Jesus being baptized, forthwith came out of the water."],
      ["Mt 3:16", "And lo, the heavens were opened to him."],
      ["Mt 3:16", "He saw the Spirit of God descending as a dove, and coming upon him."],
      ["Mt 3:17", "And behold a voice from heaven, saying:"],
      ["Mt 3:17", "This is my beloved Son, in whom I am well pleased."],
      ["Jn 1:29", "Behold the Lamb of God, behold him who taketh away the sin of the world."],
      ["Jn 1:34", "And I saw, and I gave testimony, that this is the Son of God."],
    ],
  },
  {
    title: "The Wedding at Cana",
    description: "At Mary's word, Jesus works the first of his signs and his disciples believe.",
    scripture: [
      ["Jn 2:1", "There was a marriage in Cana of Galilee; and the mother of Jesus was there."],
      ["Jn 2:2", "And Jesus also was invited, and his disciples, to the marriage."],
      ["Jn 2:3", "The wine failing, the mother of Jesus saith to him: They have no wine."],
      ["Jn 2:4", "Jesus saith to her: Woman, my hour is not yet come."],
      ["Jn 2:5", "His mother saith to the waiters: Whatsoever he shall say to you, do ye."],
      ["Jn 2:6", "Now there were set there six waterpots of stone."],
      ["Jn 2:7", "Jesus saith to them: Fill the waterpots with water. And they filled them up to the brim."],
      ["Jn 2:8", "Draw out now, and carry to the chief steward of the feast."],
      ["Jn 2:9", "The steward tasted the water made wine, and knew not whence it was."],
      ["Jn 2:11", "This beginning of miracles did Jesus; and his disciples believed in him."],
    ],
  },
  {
    title: "The Proclamation of the Kingdom",
    description: "Jesus calls all to conversion and proclaims the Kingdom of God at hand.",
    scripture: [
      ["Mk 1:14", "Jesus came into Galilee, preaching the gospel of the kingdom of God."],
      ["Mk 1:15", "The time is accomplished, and the kingdom of God is at hand."],
      ["Mk 1:15", "Do penance, and believe the gospel."],
      ["Mt 5:3", "Blessed are the poor in spirit, for theirs is the kingdom of heaven."],
      ["Mt 5:7", "Blessed are the merciful, for they shall obtain mercy."],
      ["Mt 5:8", "Blessed are the clean of heart, for they shall see God."],
      ["Lk 15:7", "There shall be joy in heaven upon one sinner that doth penance."],
      ["Mt 11:28", "Come to me, all you that labour and are burdened, and I will refresh you."],
      ["Mk 2:5", "And Jesus said: Son, thy sins are forgiven thee."],
      ["Jn 20:23", "Whose sins you shall forgive, they are forgiven them."],
    ],
  },
  {
    title: "The Transfiguration",
    description: "On the mountain the glory of Christ shines, and the Father says: Hear ye him.",
    scripture: [
      ["Mt 17:1", "Jesus taketh Peter and James and John, and bringeth them up into a high mountain."],
      ["Mt 17:2", "And he was transfigured before them."],
      ["Mt 17:2", "And his face did shine as the sun."],
      ["Mt 17:2", "And his garments became white as snow."],
      ["Mt 17:3", "And behold there appeared to them Moses and Elias talking with him."],
      ["Mt 17:4", "Lord, it is good for us to be here."],
      ["Mt 17:5", "And lo, a bright cloud overshadowed them."],
      ["Mt 17:5", "This is my beloved Son, in whom I am well pleased; hear ye him."],
      ["Mt 17:6", "And the disciples hearing, fell upon their face, and were very much afraid."],
      ["Mt 17:7", "And Jesus came and touched them, and said: Arise, and fear not."],
    ],
  },
  {
    title: "The Institution of the Eucharist",
    description: "At the Last Supper Jesus gives his Body and Blood as the bread of life.",
    scripture: [
      ["Lk 22:14", "And when the hour was come, he sat down, and the twelve apostles with him."],
      ["Lk 22:15", "With desire I have desired to eat this pasch with you."],
      ["Mt 26:26", "Jesus took bread, and blessed, and broke."],
      ["Mt 26:26", "And gave to his disciples, and said: Take ye and eat. This is my body."],
      ["Mt 26:27", "And taking the chalice, he gave thanks, and gave to them."],
      ["Mt 26:28", "This is my blood of the new testament, which shall be shed for many."],
      ["Lk 22:19", "Do this for a commemoration of me."],
      ["Jn 6:51", "I am the living bread which came down from heaven."],
      ["Jn 6:52", "The bread that I will give is my flesh, for the life of the world."],
      ["1 Cor 11:26", "As often as you shall eat this bread, you shall shew the death of the Lord."],
    ],
  },
];

function scripturalRosaryItems(): TemplateItem[] {
  const items: TemplateItem[] = [];
  let p = 0;
  const add = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    items.push(ti("tpl-scriptural-rosary", p++, partial));

  add({ kind: "prayer", prayer_id: "sign-of-the-cross" });
  add({ kind: "prayer", prayer_id: "apostles-creed" });
  add({ kind: "prayer", prayer_id: "our-father" });
  add({ kind: "prayer", prayer_id: "hail-mary", repetition_count: 3 });
  add({ kind: "prayer", prayer_id: "glory-be" });
  LUMINOUS_SCRIPTURE.forEach((m, di) => {
    // A real mystery placeholder so praying shows "First Luminous Mystery" +
    // title + description (the set is pinned to Luminous on the template).
    add({ kind: "mystery_placeholder", mystery_ordinal: di + 1, label: m.title });
    add({ kind: "prayer", prayer_id: "our-father" });
    for (const [ref, text] of m.scripture) {
      add({ kind: "scripture", reference: ref, body: text });
      add({ kind: "prayer", prayer_id: "hail-mary" });
    }
    add({ kind: "prayer", prayer_id: "glory-be" });
    add({ kind: "prayer", prayer_id: "fatima-prayer" });
  });
  add({ kind: "prayer", prayer_id: "hail-holy-queen" });
  // Single-line closing salutation (no response), per §9A.
  add({ kind: "custom", label: "Closing", body: "Lord Jesus, help us to persevere in living out our baptismal promises." });
  return items;
}
const scripturalRosaryItemsList = scripturalRosaryItems();

const allPrayers = [...base, ...novenaPrayers];

export function createSeedDatabase(): Database {
  return {
    sources: [
      {
        id: "src-tradition",
        source_type: "manual",
        name: "Traditional Catholic prayers",
        created_at: now,
      },
      {
        id: "src-caro-booklet",
        source_type: "document",
        name: "Caro Family Rosary Booklet",
        file_reference: "Caro_Family_Rosary_Booklet.md",
        created_at: now,
      },
      {
        id: "src-54-day-pdf",
        source_type: "pdf",
        name: "Fifty Four Day Novena",
        file_reference: "Fifty_Four_Day_Novena.pdf",
        created_at: now,
      },
      {
        id: "src-michael-chaplet",
        source_type: "manual",
        name: "Chaplet of St. Michael (private revelation, approved 1851)",
        attribution: "Antonia d'Astonac",
        created_at: now,
      },
      {
        id: "src-usccb",
        source_type: "web",
        name: "USCCB",
        url: "https://www.usccb.org/prayers",
        attribution: "United States Conference of Catholic Bishops",
        created_at: now,
      },
    ],
    prayers: allPrayers.map((p) => p.prayer),
    prayer_versions: allPrayers.map((p) => p.version),
    mystery_sets,
    mysteries,
    mystery_contents,
    templates: [
      {
        id: "tpl-rosary",
        name: "The Holy Rosary",
        description: "Five decades with the mysteries of the day.",
        kind: "rosary",
        mystery_presentation: "title_and_description",
        mystery_count: 5,
        built_in: true,
        created_at: now,
      },
      {
        id: "tpl-caro-rosary",
        name: "Caro Family Rosary",
        description:
          "The family rosary, including the Fatima Prayer and the Prayer for Peace after each decade.",
        kind: "rosary",
        mystery_presentation: "title_and_description",
        mystery_count: 5,
        source_id: "src-caro-booklet",
        built_in: true,
        created_at: now,
      },
      {
        id: "tpl-54-novena",
        name: "54-Day Rosary Novena",
        description:
          "27 days of petition followed by 27 days of thanksgiving, with a rotating mystery cycle.",
        kind: "novena",
        mystery_presentation: "title_and_description",
        mystery_count: 5,
        source_id: "src-54-day-pdf",
        built_in: true,
        created_at: now,
        novena: {
          duration_days: 54,
          phases: [
            {
              id: "phase-petition",
              name: "Petition",
              start_day: 1,
              end_day: 27,
              condition_tag: "petition",
              note: "Offered in petition for the intention.",
            },
            {
              id: "phase-thanksgiving",
              name: "Thanksgiving",
              start_day: 28,
              end_day: 54,
              condition_tag: "thanksgiving",
              note: "Offered in thanksgiving, whatever the answer.",
            },
          ],
          mystery_cycle: ["set-joyful", "set-sorrowful", "set-glorious", "set-luminous"],
        },
      },
      {
        id: "tpl-pray-with-pope",
        name: "Pray with the Pope",
        description:
          "Opens the Pope's monthly prayer intention. Add your own prayers around it when you build a session.",
        kind: "standard",
        mystery_presentation: "title_only",
        mystery_count: 0,
        built_in: true,
        created_at: now,
      },
      {
        id: "tpl-chaplet-michael",
        name: "Chaplet of St. Michael",
        description:
          "Nine salutations to the nine choirs of angels, each with an Our Father and three Hail Marys, and the closing prayers.",
        kind: "standard",
        mystery_presentation: "title_only",
        mystery_count: 0,
        source_id: "src-michael-chaplet",
        built_in: true,
        created_at: now,
      },
      {
        id: "tpl-scriptural-rosary",
        name: "Scriptural Rosary — Luminous Mysteries",
        description:
          "A distinct Scripture passage before each Hail Mary. Pray straight through, meditating on the Word.",
        kind: "rosary",
        mystery_presentation: "title_and_description",
        mystery_count: 5,
        fixed_mystery_set_id: "set-luminous",
        source_id: "src-usccb",
        built_in: true,
        created_at: now,
      },
    ],
    template_items: [
      ...rosaryItemsList,
      ...caroItemsList,
      ...novenaItems,
      ...popeItems,
      ...chapletItemsList,
      ...scripturalRosaryItemsList,
    ],
    sessions: [],
    session_items: [],
    intentions: [],
    novena_instances: [],
    import_drafts: [],
    reflections: [],
    mass_experiences: [],
    learning_items: [
      {
        id: "learn-devout-life",
        title: "Introduction to the Devout Life",
        content_type: "book",
        creator: "St. Francis de Sales",
        source: "TAN Books",
        status: "in_progress",
        created_at: now,
      },
      {
        id: "learn-bible-in-a-year",
        title: "The Bible in a Year",
        content_type: "podcast",
        creator: "Fr. Mike Schmitz",
        url: "https://ascensionpress.com/pages/bibleinayear",
        status: "in_progress",
        created_at: now,
      },
    ],
    how_tos: [
      {
        id: "howto-rosary",
        title: "How to Pray the Rosary",
        summary:
          "The traditional order of the Rosary. This page is instruction only — tap Start Prayer for the full text of every prayer.",
        template_id: "tpl-rosary",
        steps: [
          "Make the Sign of the Cross and say the Apostles' Creed.",
          "Say one Our Father.",
          "Say three Hail Marys for faith, hope, and charity.",
          "Say one Glory Be.",
          "Announce the first mystery, then say one Our Father.",
          "Say ten Hail Marys while meditating on the mystery.",
          "Say one Glory Be, then the Fatima Prayer.",
          "Repeat for the remaining four decades.",
          "Close with the Hail, Holy Queen and the Sign of the Cross.",
        ].map((text, i) => ({
          id: `howto-rosary-s${i}`,
          how_to_id: "howto-rosary",
          position: i,
          text,
        })),
      },
      {
        id: "howto-novena",
        title: "How to Pray a Novena",
        summary:
          "A novena is a devotion prayed over a set number of days. Duration and daily structure vary by novena.",
        template_id: "tpl-54-novena",
        source_id: "src-54-day-pdf",
        steps: [
          "Choose your intention before you begin.",
          "Pray each day without interruption for the full duration.",
          "For the 54-Day Rosary Novena, pray a full Rosary each day.",
          "Days 1 through 27 are prayed in petition.",
          "Days 28 through 54 are prayed in thanksgiving.",
          "Rotate the mysteries: Joyful, Sorrowful, then Glorious, repeating in that order.",
        ].map((text, i) => ({
          id: `howto-novena-s${i}`,
          how_to_id: "howto-novena",
          position: i,
          text,
        })),
      },
    ],
  };
}
