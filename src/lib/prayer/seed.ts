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
];

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
          mystery_cycle: ["set-joyful", "set-sorrowful", "set-glorious"],
        },
      },
    ],
    template_items: [...rosaryItemsList, ...caroItemsList, ...novenaItems],
    sessions: [],
    session_items: [],
    intentions: [],
    novena_instances: [],
    import_drafts: [],
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
