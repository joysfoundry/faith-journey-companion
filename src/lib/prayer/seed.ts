import type {
  Database,
  ExpressionType,
  Mystery,
  MysteryContent,
  PrayerType,
  SongSegment,
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

/**
 * A song: a sung prayer whose wording carries ordered verse/chorus segments.
 * `body` is the joined full text (for whole-song rendering and search); the
 * segments let a devotion place specific verses and the chorus independently.
 */
function song(
  id: string,
  title: string,
  segments: SongSegment[],
  tags: string[] = [],
  sourceId = "src-caro-rosary",
) {
  const body = [...segments]
    .sort((a, b) => a.ordinal - b.ordinal)
    .map((s) => s.body)
    .join("\n\n");
  return {
    prayer: {
      id,
      title,
      prayer_type: "devotional" as PrayerType,
      expression_type: "song" as ExpressionType,
      tags,
      favorite: false,
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
      segments,
      created_at: now,
    },
  };
}

const seg = (
  ordinal: number,
  kind: SongSegment["kind"],
  label: string,
  body: string,
): SongSegment => ({
  ordinal,
  kind,
  label,
  body,
});

const songs = [
  song(
    "immaculate-mary",
    "Immaculate Mary",
    [
      seg(
        1,
        "verse",
        "Verse 1",
        `Immaculate Mary, your praises we sing;
You reign now in splendor with Jesus our King.
Ave, ave, ave, Maria! Ave, ave, Maria!`,
      ),
      seg(
        2,
        "verse",
        "Verse 2",
        `In heaven, the blessed your glory proclaim;
On earth we, your children, invoke your sweet name.
Ave, ave, ave, Maria! Ave, ave, Maria!`,
      ),
      seg(
        3,
        "verse",
        "Verse 3",
        `We pray for the Church, our true Mother on earth,
And beg you to watch o'er the land of our birth.
Ave, ave, ave, Maria! Ave, ave, Maria!`,
      ),
    ],
    ["marian", "hymn", "closing"],
  ),
  song(
    "hail-holy-queen-enthroned",
    "Hail, Holy Queen Enthroned Above",
    [
      seg(
        1,
        "verse",
        "Verse 1",
        `Hail, holy Queen enthroned above, O Maria.
Hail, Queen of mercy and of love, O Maria.
Triumph, all ye cherubim, Sing with us, ye seraphim,
Heaven and earth resound the hymn:
Salve, salve, salve Regina!`,
      ),
      seg(
        2,
        "verse",
        "Verse 2",
        `The cause of joy to men below, O Maria.
The spring through which all graces flow, O Maria.
Angels, all your praises bring, Earth and heaven, with us sing,
All creation echoing:
Salve, salve, salve Regina!`,
      ),
    ],
    ["marian", "hymn", "closing"],
  ),
  song(
    "fatima-hymn",
    "Fatima Hymn",
    [
      seg(
        1,
        "verse",
        "Verse I",
        `The Thirteenth of May
In the Cova D'Iria
Appeared, Oh so brilliant
The Virgin Maria.`,
      ),
      seg(
        2,
        "verse",
        "Verse II",
        `The Virgin Maria
Encircled with light
Our own dearest Mother
And Heaven's delight.`,
      ),
      seg(
        3,
        "verse",
        "Verse III",
        `To three little shepherds
Our Lady appeared
The light of her grace
To her Son soul endeared.`,
      ),
      seg(
        4,
        "verse",
        "Verse IV",
        `To save all poor souls
Who had wandered astray
With sweet words of comfort
She asked us to pray.`,
      ),
      seg(
        5,
        "chorus",
        "Chorus",
        `Ave, Ave, Ave Maria
Ave, Ave, Ave Maria`,
      ),
    ],
    ["marian", "hymn", "fatima"],
  ),
];

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
  prayer(
    "guardian-angel",
    "Prayer to Your Guardian Angel",
    "devotional",
    `Angel of God, my guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.`,
    ["angel", "protection"],
    "src-usccb",
  ),
  prayer(
    "morning-offering",
    "Morning Offering",
    "devotional",
    `O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day in union with the Holy Sacrifice of the Mass throughout the world. I offer them for all the intentions of Your Sacred Heart: the salvation of souls, reparation for sin, and the reunion of all Christians. I offer them for the intentions of our bishops and of all Apostles of Prayer, and in particular for those recommended by our Holy Father this month. Amen.`,
    ["morning", "offering"],
    "src-usccb",
  ),
  prayer(
    "act-of-contrition",
    "Act of Contrition",
    "devotional",
    `O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.`,
    ["contrition", "penance"],
    "src-usccb",
  ),
  prayer(
    "memorare",
    "Memorare",
    "devotional",
    `Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thy intercession was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother; to thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.`,
    ["marian", "intercession"],
    "src-usccb",
  ),
  prayer(
    "anima-christi",
    "Anima Christi",
    "devotional",
    `Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within thy wounds hide me. Suffer me not to be separated from thee. From the malicious enemy defend me. In the hour of my death call me, and bid me come unto thee, that with thy saints I may praise thee for ever and ever. Amen.`,
    ["eucharistic", "meditation"],
    "src-usccb",
  ),
  prayer(
    "divine-praises",
    "Divine Praises",
    "devotional",
    `Blessed be God.
Blessed be His Holy Name.
Blessed be Jesus Christ, true God and true Man.
Blessed be the Name of Jesus.
Blessed be His Most Sacred Heart.
Blessed be His Most Precious Blood.
Blessed be Jesus in the Most Holy Sacrament of the Altar.
Blessed be the Holy Spirit, the Paraclete.
Blessed be the great Mother of God, Mary most Holy.
Blessed be her Holy and Immaculate Conception.
Blessed be her Glorious Assumption.
Blessed be the Name of Mary, Virgin and Mother.
Blessed be Saint Joseph, her most chaste spouse.
Blessed be God in His Angels and in His Saints.`,
    ["praise", "benediction"],
    "src-usccb",
  ),
  prayer(
    "prayer-before-crucifix",
    "Prayer to Our Lord Jesus Christ Crucified",
    "devotional",
    `Behold, O good and most sweet Jesus, I cast myself upon my knees in Thy sight, and with the most fervent desire of my soul I pray and beseech Thee to impress upon my heart lively sentiments of faith, hope, and charity, with true contrition for my sins and a firm purpose of amendment; while with deep affection and grief of soul I ponder within myself and mentally contemplate Thy five most precious wounds, having before my eyes that which David spoke in prophecy of Thee: "They have pierced my hands and my feet; they have numbered all my bones." Amen.`,
    ["crucifix", "passion"],
    "src-usccb",
  ),
  prayer(
    "nicene-creed",
    "Nicene Creed",
    "liturgical",
    `I believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible. And in one Lord Jesus Christ, the only-begotten Son of God, born of the Father before all ages. God of God, Light of Light, true God of true God, begotten, not made, being of one substance with the Father, by whom all things were made. Who for us men and for our salvation came down from heaven, and was incarnate by the Holy Spirit of the Virgin Mary, and was made man. He was crucified also for us under Pontius Pilate, suffered, and was buried. And on the third day He rose again, according to the Scriptures, and ascended into heaven, and sitteth at the right hand of the Father. And He shall come again in glory to judge the living and the dead, and of His kingdom there shall be no end.

And in the Holy Spirit, the Lord and Giver of Life, who proceedeth from the Father and the Son, who together with the Father and the Son is adored and glorified, who spoke by the prophets. And in one holy, catholic, and apostolic Church. I confess one Baptism for the remission of sins. And I look for the resurrection of the dead, and the life of the world to come. Amen.`,
    ["creed", "liturgy"],
    "src-usccb",
  ),
  prayer(
    "angelus",
    "The Angelus",
    "devotional",
    `V. The Angel of the Lord declared unto Mary,
R. And she conceived of the Holy Spirit.
Hail Mary, full of grace…

V. Behold the handmaid of the Lord,
R. Be it done unto me according to thy word.
Hail Mary, full of grace…

V. And the Word was made flesh,
R. And dwelt among us.
Hail Mary, full of grace…

V. Pray for us, O holy Mother of God,
R. That we may be made worthy of the promises of Christ.

Let us pray. Pour forth, we beseech Thee, O Lord, Thy grace into our hearts, that we to whom the Incarnation of Christ Thy Son was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen.`,
    ["marian", "incarnation"],
    "src-usccb",
  ),
  prayer(
    "regina-caeli",
    "Regina Caeli",
    "devotional",
    `Queen of Heaven, rejoice, alleluia.
For He whom you did merit to bear, alleluia,
Has risen, as He said, alleluia.
Pray for us to God, alleluia.

V. Rejoice and be glad, O Virgin Mary, alleluia.
R. For the Lord has truly risen, alleluia.

Let us pray. O God, who gave joy to the world through the resurrection of Thy Son, our Lord Jesus Christ, grant, we beseech Thee, that through the intercession of the Virgin Mary, His Mother, we may obtain the joys of everlasting life. Through the same Christ our Lord. Amen.`,
    ["marian", "easter"],
    "src-usccb",
  ),
  prayer(
    "act-of-faith-hope-love",
    "Act of Faith, Hope, and Love",
    "devotional",
    `Act of Faith
O my God, I firmly believe that Thou art one God in three Divine Persons, Father, Son, and Holy Spirit. I believe that Thy Divine Son became man and died for our sins, and that He will come to judge the living and the dead. I believe these and all the truths which the Holy Catholic Church teaches, because Thou hast revealed them, who canst neither deceive nor be deceived. Amen.

Act of Hope
O my God, relying on Thy almighty power and infinite mercy and promises, I hope to obtain pardon of my sins, the help of Thy grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen.

Act of Love
O my God, I love Thee above all things, with my whole heart and soul, because Thou art all good and worthy of all love. I love my neighbor as myself for the love of Thee. I forgive all who have injured me, and ask pardon of all whom I have injured. Amen.`,
    ["theological-virtues"],
    "src-usccb",
  ),
  prayer(
    "o-sacrum-convivium",
    "O Sacrum Convivium",
    "liturgical",
    `O sacred banquet, in which Christ is received, the memory of His Passion is renewed, the mind is filled with grace, and a pledge of future glory is given to us. Alleluia.

V. Thou hast given them bread from heaven.
R. Having within it all sweetness.`,
    ["eucharistic"],
    "src-usccb",
  ),
  prayer(
    "tantum-ergo",
    "Tantum Ergo",
    "liturgical",
    `Down in adoration falling, lo! the sacred Host we hail;
Lo! o'er ancient forms departing, newer rites of grace prevail;
Faith for all defects supplying, where the feeble senses fail.

To the everlasting Father, and the Son who reigns on high,
With the Holy Spirit proceeding forth from each eternally,
Be salvation, honor, blessing, might and endless majesty. Amen.

V. Thou hast given them bread from heaven.
R. Having within it all sweetness.

Let us pray. O God, who under a wonderful Sacrament hast left us a memorial of Thy Passion: grant us, we beseech Thee, so to venerate the sacred mysteries of Thy Body and Blood, that we may ever feel within us the fruit of Thy Redemption. Who livest and reignest for ever and ever. Amen.`,
    ["eucharistic", "hymn"],
    "src-usccb",
  ),
  prayer(
    "family-prayer",
    "Family Prayer",
    "devotional",
    `Father, we thank You for Your love and Your many blessings, especially the precious gift of each other. Help us to show our gratitude by loving each other as You love us. Make us understanding and patient with one another; quick to admit our failings and ask forgiveness. Generous in sharing the joy and strength we can give each other.

Father, give our family lively faith and the courage to share it with those around us. Direct us to the state in life You plan for each of us, and help us to use Your gifts to serve You. We entrust our family to Your Fatherly care.

Preserve us from the corruption of the modern world and help us draw closer daily to You and to each other, until we come to share with You the joys of Heaven.

Jesus, Mary and Joseph, help us to be a holy family. Amen.

V. Our Lady of Fatima;
R. Pray for us

V. Most Sacred Heart of Jesus;
R. Pray for us

V. St. Joseph;
R. Pray for us`,
    ["family", "holy family", "gratitude"],
    "src-caro-rosary",
  ),
  prayer(
    "consecration-family-sacred-heart",
    "Act of Consecration of the Family to the Sacred Heart",
    "devotional",
    `O Sacred Heart of Jesus, who made known to St. Margaret Mary your ardent desire to reign over Christian families, behold us assembled here today to proclaim your absolute dominion over our home. From now on we intend to lead a life like yours, so that amongst us may flourish the virtues for which you promised peace on earth, and for this end we will banish from our midst the spirit of the world which you abhor so much.

You will reign over our understanding by the simplicity of our faith. You will reign over our hearts by an ardent love for you; and may the flame of this love be kept burning in our hearts by the frequent reception of the Holy Eucharist.

Deign, O Divine Heart, to preside over our meetings, to bless our undertakings, both spiritual and temporal, to banish all worry and care, to sanctify our joys, and soothe our sorrows. If any of us should ever have the misfortune to grieve Your Sacred Heart, remind him of your goodness and mercy towards the repentant sinner.

Lastly, when the hour of separation will sound, and death will plunge our home into mourning, then shall we all, and every one of us, be resigned to your eternal decrees, and seek consolation in the thought that we shall one day be reunited in Heaven, where we shall sing the praises and blessings of Your Sacred Heart for all eternity.

May the Immaculate Heart of Mary, and the glorious Patriarch St. Joseph, offer you this, our Consecration, and remind us of the same all the days of our life.

Glory to the Divine Heart of Jesus, our King and our Father.`,
    ["family", "consecration", "sacred heart"],
    "src-caro-rosary",
  ),
  prayer(
    "family-consecration-immaculate-heart",
    "Family Consecration to the Immaculate Heart of Mary",
    "traditional_expression",
    `O Immaculate Heart of Mary, Mother of the Heart of Jesus, Mother and Queen of our household, that we may fulfill your ardent desire, we consecrate ourselves to you, and we ask you to reign over our family.

Reign over each one of us, and teach us how to make the Sacred Heart of Your Divine Son reign and triumph in us and around us, as He has reigned and triumphed in you.

Reign over us, O Beloved Mother, so that we may be yours both in prosperity and in adversity, in joy and in sorrow, in health and in sickness, in life and in death. O most compassionate Heart of Mary, Queen of Virgins, watch over our souls and our hearts and preserve them from the flood of pride, impurity, and paganism of which you have complained so bitterly.

We desire to make amends for the numerous crimes committed against Jesus and you. We call upon our home, upon the homes of this country, and upon those of the entire world, the peace of Christ in justice and charity.

Thus we promise to imitate your virtues, by a practical Christian Life, and by frequent and fervent Holy Communion, regardless of human respect. We come with confidence to you, O Throne of Grace and Mother of Fair Love; inflame us with the same divine fire which has inflamed your own Immaculate Heart.

Kindle in our hearts and homes, the love of purity, an ardent passion for souls, and desire for the holiness of family life. We accept now, all the sacrifices that the Christian life will impose on us and we offer them to the Heart of Jesus, by your Immaculate Heart, in a spirit of reparation and of penance. Amen.

To the Sacred Hearts of Jesus and Mary:
be love, honor, and glory forever and ever!
Amen.`,
    ["family", "consecration", "immaculate heart", "marian"],
    "src-caro-rosary",
  ),
];

// Chaplet of St. Michael — nine salutations to the nine choirs of angels.
// Declarative salutations use the generic `custom` component; the V/R lines use
// `salutation`. No chaplet-specific engine — the compiler expands it like any
// other devotion. (Source: private revelation to Antonia d'Astonac, approved 1851.)
const MICHAEL_CHOIRS: Array<[string, string]> = [
  ["Seraphim", "may the Lord make us worthy to burn with the fire of perfect charity."],
  [
    "Cherubim",
    "may the Lord grant us the grace to leave the ways of sin and run in the paths of Christian perfection.",
  ],
  ["Thrones", "may the Lord infuse into our hearts a true and sincere spirit of humility."],
  ["Dominations", "may the Lord give us grace to govern our senses and overcome unruly passions."],
  ["Virtues", "may the Lord preserve us from evil and from falling into temptation."],
  ["Powers", "may the Lord protect our souls against the snares and temptations of the devil."],
  ["Principalities", "may God fill our souls with the spirit of true obedience."],
  [
    "Archangels",
    "may the Lord give us perseverance in faith and in all good works, that we may attain the glory of Heaven.",
  ],
  [
    "Angels",
    "may the Lord grant us to be protected by them in this mortal life and conducted hereafter to eternal glory.",
  ],
];

function chapletItems(): TemplateItem[] {
  const items: TemplateItem[] = [];
  let p = 0;
  const add = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    items.push(ti("tpl-chaplet-michael", p++, partial));

  add({
    kind: "salutation",
    label: "Opening",
    versicle: "O God, come to my assistance.",
    response: "O Lord, make haste to help me.",
  });
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
  add({
    kind: "custom",
    label: "Four Our Fathers",
    body: "Pray one Our Father in honor of each: St. Michael, St. Gabriel, St. Raphael, and our Guardian Angel.",
  });
  add({ kind: "prayer", prayer_id: "our-father", repetition_count: 4 });
  add({
    kind: "custom",
    label: "Closing Prayer",
    body: `O glorious prince St. Michael, chief and commander of the heavenly hosts, guardian of souls, vanquisher of rebel spirits, servant in the house of the Divine King, and our admirable conductor: deliver us from all evil, who turn to you with confidence, and enable us by your gracious protection to serve God more faithfully every day.`,
  });
  add({
    kind: "salutation",
    label: "Versicle",
    versicle: "Pray for us, O glorious St. Michael, Prince of the Church of Jesus Christ,",
    response: "That we may be made worthy of His promises.",
  });
  add({
    kind: "custom",
    label: "Let us pray",
    body: `Almighty and Everlasting God, who by a prodigy of goodness and a merciful desire for the salvation of all, has appointed the most glorious Archangel St. Michael Prince of Your Church: make us worthy, we ask You, to be delivered from all our enemies, that none of them may harass us at the hour of death, but that we may be conducted by him into Your Presence. This we ask through the merits of Jesus Christ Our Lord. Amen.`,
  });
  return items;
}
const chapletItemsList = chapletItems();

/**
 * A litany is a string of salutations: each invocation (the "call") is answered
 * by a shared refrain (the "response"). We model each litany as a devotion built
 * from `salutation` items — the call is the item label (rendered as the heading),
 * the refrain is the body. Fixed formulae (Kyrie, Lamb of God, the closing
 * collect) are grouped `custom` blocks. One salutation = one prayable step.
 */
type LitanyLine = readonly [call: string, response: string];
type LitanySection =
  { kind: "block"; lines: readonly LitanyLine[] } | { kind: "text"; label: string; body: string };

function litanyItems(templateId: string, sections: readonly LitanySection[]): TemplateItem[] {
  const items: TemplateItem[] = [];
  let p = 0;
  const add = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    items.push(ti(templateId, p++, partial));
  for (const section of sections) {
    if (section.kind === "text") {
      add({ kind: "custom", label: section.label, body: section.body });
      continue;
    }
    for (const [call, response] of section.lines) {
      add({ kind: "salutation", label: call, salutation_vr: false, body: response });
    }
  }
  return items;
}

const LAMB_OF_GOD = (mercy: string): LitanySection => ({
  kind: "block",
  lines: [
    ["Lamb of God, who takest away the sins of the world,", "spare us, O Lord."],
    ["Lamb of God, who takest away the sins of the world,", "graciously hear us, O Lord."],
    ["Lamb of God, who takest away the sins of the world,", mercy],
  ],
});

// Litany of Humility — Cardinal Rafael Merry del Val (d. 1930), public domain.
const litanyHumilityItems = litanyItems("tpl-litany-humility", [
  { kind: "block", lines: [["O Jesus, meek and humble of Heart,", "Hear me."]] },
  {
    kind: "block",
    lines: [
      "From the desire of being esteemed,",
      "From the desire of being loved,",
      "From the desire of being extolled,",
      "From the desire of being honored,",
      "From the desire of being praised,",
      "From the desire of being preferred to others,",
      "From the desire of being consulted,",
      "From the desire of being approved,",
      "From the fear of being humiliated,",
      "From the fear of being despised,",
      "From the fear of suffering rebukes,",
      "From the fear of being calumniated,",
      "From the fear of being forgotten,",
      "From the fear of being ridiculed,",
      "From the fear of being wronged,",
      "From the fear of being suspected,",
    ].map((call): LitanyLine => [call, "Deliver me, Jesus."]),
  },
  {
    kind: "block",
    lines: [
      "That others may be loved more than I,",
      "That others may be esteemed more than I,",
      "That, in the opinion of the world, others may increase and I may decrease,",
      "That others may be chosen and I set aside,",
      "That others may be praised and I unnoticed,",
      "That others may be preferred to me in everything,",
      "That others may become holier than I, provided that I may become as holy as I should,",
    ].map((call): LitanyLine => [call, "Jesus, grant me the grace to desire it."]),
  },
]);

// Litany of the Sacred Heart of Jesus — approved for public use by Leo XIII, 1899.
const litanySacredHeartItems = litanyItems("tpl-litany-sacred-heart", [
  {
    kind: "text",
    label: "Kyrie",
    body: "Lord, have mercy on us.\nChrist, have mercy on us.\nLord, have mercy on us.\nChrist, hear us.\nChrist, graciously hear us.",
  },
  {
    kind: "block",
    lines: [
      ["God the Father of Heaven,", "have mercy on us."],
      ["God the Son, Redeemer of the world,", "have mercy on us."],
      ["God the Holy Spirit,", "have mercy on us."],
      ["Holy Trinity, one God,", "have mercy on us."],
      ...[
        "Son of the Eternal Father,",
        "formed by the Holy Spirit in the womb of the Virgin Mother,",
        "substantially united to the Word of God,",
        "of infinite majesty,",
        "holy temple of God,",
        "tabernacle of the Most High,",
        "house of God and gate of Heaven,",
        "burning furnace of charity,",
        "vessel of justice and love,",
        "full of goodness and love,",
        "abyss of all virtues,",
        "most worthy of all praise,",
        "king and center of all hearts,",
        "in whom are all the treasures of wisdom and knowledge,",
        "in whom dwells all the fullness of the Divinity,",
        "in whom the Father is well pleased,",
        "of whose fullness we have all received,",
        "desire of the everlasting hills,",
        "patient and abounding in mercy,",
        "rich unto all who call upon Thee,",
        "fountain of life and holiness,",
        "atonement for our sins,",
        "filled with reproaches,",
        "bruised for our offenses,",
        "made obedient unto death,",
        "pierced with a lance,",
        "source of all consolation,",
        "our life and resurrection,",
        "our peace and reconciliation,",
        "victim for our sins,",
        "salvation of those who hope in Thee,",
        "hope of those who die in Thee,",
        "delight of all the Saints,",
      ].map((title): LitanyLine => [`Heart of Jesus, ${title}`, "have mercy on us."]),
    ],
  },
  LAMB_OF_GOD("have mercy on us."),
  {
    kind: "block",
    lines: [["Jesus, meek and humble of Heart,", "Make our hearts like unto Thine."]],
  },
  {
    kind: "text",
    label: "Let us pray",
    body: "Almighty and eternal God, look upon the Heart of Thy most beloved Son, and upon the praises and satisfaction He offers Thee in the name of sinners; and being appeased, grant pardon to those who seek Thy mercy, in the name of the same Jesus Christ Thy Son, who liveth and reigneth with Thee, in the unity of the Holy Spirit, world without end. Amen.",
  },
]);

// Litany of the Immaculate Heart of Mary — traditional, public domain.
const litanyImmaculateHeartItems = litanyItems("tpl-litany-immaculate-heart", [
  {
    kind: "text",
    label: "Kyrie",
    body: "Lord, have mercy on us.\nChrist, have mercy on us.\nLord, have mercy on us.\nChrist, hear us.\nChrist, graciously hear us.",
  },
  {
    kind: "block",
    lines: [
      ["God the Father of Heaven,", "have mercy on us."],
      ["God the Son, Redeemer of the world,", "have mercy on us."],
      ["God the Holy Spirit,", "have mercy on us."],
      ["Holy Trinity, one God,", "have mercy on us."],
      ...[
        "",
        "like unto the Heart of God,",
        "united to the Heart of Jesus,",
        "instrument of the Holy Spirit,",
        "sanctuary of the Divine Trinity,",
        "tabernacle of God Incarnate,",
        "immaculate from thy creation,",
        "full of grace,",
        "blessed among all hearts,",
        "throne of glory,",
        "most humble,",
        "holocaust of Divine Love,",
        "fastened to the Cross with Jesus Crucified,",
        "comfort of the afflicted,",
        "refuge of sinners,",
        "hope of the agonizing,",
        "seat of mercy,",
      ].map((title): LitanyLine => [
        title ? `Heart of Mary, ${title}` : "Heart of Mary,",
        "pray for us.",
      ]),
    ],
  },
  LAMB_OF_GOD("have mercy on us."),
  {
    kind: "block",
    lines: [
      [
        "Immaculate Mary, meek and humble of heart,",
        "make our hearts like unto the Heart of Jesus.",
      ],
    ],
  },
  {
    kind: "text",
    label: "Let us pray",
    body: "O most merciful God, who, for the salvation of sinners and the refuge of the miserable, wast pleased that the most pure Heart of Mary should be most like in charity and pity to the Divine Heart of Thy Son, Jesus Christ: grant that we who commemorate this sweet and loving Heart may, by the merits and intercession of the same Blessed Virgin, merit to be found like unto the Heart of Jesus, through the same Christ our Lord. Amen.",
  },
]);

const mysteryData: Array<{
  set: string;
  weekdays: number[];
  items: Array<[string, string, string]>;
}> = [
  {
    set: "Joyful",
    weekdays: [1, 6],
    items: [
      [
        "The Annunciation",
        "The angel Gabriel announces that Mary will bear the Son of God.",
        "Mary hears an impossible word and answers with trust: 'Be it done unto me according to thy word.' Ask for the grace of humble, unhesitating yes.",
      ],
      [
        "The Visitation",
        "Mary carries Christ to Elizabeth.",
        "Mary rises and goes in haste to serve. Christ within her leaps in another's heart. Ask for the grace of charity that moves quickly.",
      ],
      [
        "The Nativity",
        "Christ is born in Bethlehem.",
        "The Word becomes small enough to be held. Ask for the grace of poverty of spirit and wonder.",
      ],
      [
        "The Presentation",
        "Jesus is presented in the Temple.",
        "Simeon holds the promise and foretells the sword. Ask for the grace of obedience and of offering what we love most.",
      ],
      [
        "The Finding in the Temple",
        "Jesus is found among the teachers.",
        "Three days of searching end in the Father's house. Ask for the grace of perseverance when God seems hidden.",
      ],
    ],
  },
  {
    set: "Sorrowful",
    weekdays: [2, 5],
    items: [
      [
        "The Agony in the Garden",
        "Jesus prays in Gethsemane.",
        "He sees every sin and every sorrow and still says, 'Not my will but Thine.' Ask for the grace of surrender.",
      ],
      [
        "The Scourging at the Pillar",
        "Jesus is scourged.",
        "Innocence bears what guilt deserved. Ask for the grace of purity and self-restraint.",
      ],
      [
        "The Crowning with Thorns",
        "Jesus is crowned with thorns.",
        "The King is mocked. Ask for the grace of moral courage when faith is ridiculed.",
      ],
      [
        "The Carrying of the Cross",
        "Jesus carries His cross to Calvary.",
        "He falls, He rises, He goes on. Ask for the grace of patience under the daily weight.",
      ],
      [
        "The Crucifixion",
        "Jesus dies on the Cross.",
        "From the Cross He gives us His Mother and His pardon. Ask for the grace of final perseverance.",
      ],
    ],
  },
  {
    set: "Glorious",
    weekdays: [3, 7],
    items: [
      [
        "The Resurrection",
        "Christ rises from the dead.",
        "The stone is rolled away from every tomb we live in. Ask for the grace of living faith.",
      ],
      [
        "The Ascension",
        "Christ ascends into heaven.",
        "Our humanity is carried into the life of God. Ask for the grace of hope.",
      ],
      [
        "The Descent of the Holy Spirit",
        "The Spirit comes upon the Apostles.",
        "Fear becomes proclamation. Ask for the grace of the Holy Spirit's gifts.",
      ],
      [
        "The Assumption",
        "Mary is assumed into heaven.",
        "The first disciple arrives home whole. Ask for the grace of a holy death.",
      ],
      [
        "The Coronation of Mary",
        "Mary is crowned Queen of Heaven and Earth.",
        "She reigns by having served. Ask for the grace of trust in her intercession.",
      ],
    ],
  },
  {
    set: "Luminous",
    weekdays: [4],
    items: [
      [
        "The Baptism in the Jordan",
        "Jesus is baptized by John.",
        "The Father names His Beloved. Ask for the grace of fidelity to your baptism.",
      ],
      [
        "The Wedding at Cana",
        "Water is changed into wine.",
        "'Do whatever He tells you.' Ask for the grace of listening to Mary's counsel.",
      ],
      [
        "The Proclamation of the Kingdom",
        "Jesus calls to conversion.",
        "The Kingdom is near, and mercy is offered. Ask for the grace of repentance.",
      ],
      [
        "The Transfiguration",
        "Christ is transfigured on the mountain.",
        "Glory shines through the ordinary face of a friend. Ask for the grace of contemplation.",
      ],
      [
        "The Institution of the Eucharist",
        "Christ gives His Body and Blood.",
        "He stays. Ask for the grace of eucharistic love.",
      ],
    ],
  },
];

const mystery_sets = mysteryData.map((m, i) => ({
  id: `set-${m.set.toLowerCase()}`,
  name: `${m.set} Mysteries`,
  default_weekdays: m.weekdays,
  position: i,
}));

// AUTO-GENERATED from Mysteries 1.md (USCCB) & Mysteries 2.md (Ascension). Regen; do not hand-edit.
const usccbBodies: Record<string, Array<{ ref: string; text: string; fruit: string }>> = {
  joyful: [
    {
      ref: `Luke 1:26-27`,
      fruit: `Humility`,
      text: `In the sixth month, the angel Gabriel was sent from God to a town of Galilee called Nazareth, to a virgin betrothed to a man named Joseph, of the house of David, and the virgin’s name was Mary.`,
    },
    {
      ref: `Luke 1:39-42`,
      fruit: `Love of Neighbor`,
      text: `During those days Mary set out and traveled to the hill country in haste to a town of Judah, where she entered the house of Zechariah and greeted Elizabeth. When Elizabeth heard Mary’s greeting, the infant leaped in her womb, and Elizabeth, filled with the holy Spirit, cried out in a loud voice and said, 'Most blessed are you among women, and blessed is the fruit of your womb.'`,
    },
    {
      ref: `Luke 2:1-7`,
      fruit: `Poverty`,
      text: `In those days a decree went out from Caesar Augustus that the whole world should be enrolled. This was the first enrollment, when Quirinius was governor of Syria. So all went to be enrolled, each to his own town. And Joseph too went up from Galilee from the town of Nazareth to Judea, to the city of David that is called Bethlehem, because he was of the house and family of David, to be enrolled with Mary, his betrothed, who was with child. While they were there, the time came for her to have her child, and she gave birth to her firstborn son. She wrapped him in swaddling clothes and laid him in a manger, because there was no room for them in the inn.`,
    },
    {
      ref: `Luke 2:21-24`,
      fruit: `Purity of Heart and Body`,
      text: `When eight days were completed for his circumcision, he was named Jesus, the name given him by the angel before he was conceived in the womb. "When the days were completed for their purification according to the law of Moses, they took him up to Jerusalem to present him to the Lord, just as it is written in the law of the Lord, 'Every male that opens the womb shall be consecrated to the Lord,' and to offer the sacrifice of 'a pair of turtledoves or two young pigeons,' in accordance with the dictate in the law of the Lord.`,
    },
    {
      ref: `Luke 2:41-47`,
      fruit: `Devotion to Jesus`,
      text: `Each year his parents went to Jerusalem for the feast of Passover, and when he was twelve years old, they went up according to festival custom. After they had completed its days, as they were returning, the boy Jesus remained behind in Jerusalem, but his parents did not know it. Thinking that he was in the caravan, they journeyed for a day and looked for him among their relatives and acquaintances, but not finding him, they returned to Jerusalem to look for him. After three days they found him in the temple, sitting in the midst of the teachers, listening to them and asking them questions, and all who heard him were astounded at his understanding and his answers.`,
    },
  ],
  sorrowful: [
    {
      ref: `Matthew 26:36-39`,
      fruit: `Obedience to God’s Will`,
      text: `Then Jesus came with them to a place called Gethsemane, and he said to his disciples, 'Sit here while I go over there and pray.' He took along Peter and the two sons of Zebedee, and began to feel sorrow and distress. Then he said to them, 'My soul is sorrowful even to death. Remain here and keep watch with me.' He advanced a little and fell prostrate in prayer, saying, 'My Father, if it is possible, let this cup pass from me; yet, not as I will, but as you will.'`,
    },
    {
      ref: `Matthew 27:26`,
      fruit: `Mortification`,
      text: `Then he released Barabbas to them, but after he had Jesus scourged, he handed him over to be crucified.`,
    },
    {
      ref: `Matthew 27:27-29`,
      fruit: `Courage`,
      text: `Then the soldiers of the governor took Jesus inside the praetorium and gathered the whole cohort around him. They stripped off his clothes and threw a scarlet military cloak about him. Weaving a crown out of thorns, they placed it on his head, and a reed in his right hand. And kneeling before him, they mocked him, saying, 'Hail, King of the Jews!'`,
    },
    {
      ref: `Mark 15:21-22`,
      fruit: `Patience`,
      text: `They pressed into service a passer-by, Simon, a Cyrenian, who was coming in from the country, the father of Alexander and Rufus, to carry his cross. They brought him to the place of Golgotha (which is translated Place of the Skull).`,
    },
    {
      ref: `Luke 23:33-46`,
      fruit: `Sorrow for our Sins`,
      text: `When they came to the place called the Skull, they crucified him and the criminals there, one on his right, the other on his left. [Then Jesus said, 'Father, forgive them, they know not what they do.'] They divided his garments by casting lots. The people stood by and watched; the rulers, meanwhile, sneered at him and said, 'He saved others, let him save himself if he is the chosen one, the Messiah of God.' Even the soldiers jeered at him. As they approached to offer him wine they called out, 'If you are King of the Jews, save yourself.' Above him there was an inscription that read, 'This is the King of the Jews.' Now one of the criminals hanging there reviled Jesus, saying, 'Are you not the Messiah? Save yourself and us.' The other, however, rebuking him, said in reply, 'Have you no fear of God, for you are subject to the same condemnation? And indeed, we have been condemned justly, for the sentence we received corresponds to our crimes, but this man has done nothing criminal.' Then he said, 'Jesus, remember me when you come into your kingdom.' He replied to him, 'Amen, I say to you, today you will be with me in Paradise.' "It was now about noon and darkness came over the whole land until three in the afternoon because of an eclipse of the sun. Then the veil of the temple was torn down the middle. Jesus cried out in a loud voice, 'Father, into your hands I commend my spirit'; and when he had said this he breathed his last.`,
    },
  ],
  glorious: [
    {
      ref: `Luke 24:1-5`,
      fruit: `Faith`,
      text: `But at daybreak on the first day of the week they took the spices they had prepared and went to the tomb.They found the stone rolled away from the tomb; but when they entered, they did not find the body of the Lord Jesus. While they were puzzling over this, behold, two men in dazzling garments appeared to them. They were terrified and bowed their faces to the ground. They said to them, 'Why do you seek the living one among the dead? He is not here, but he has been raised.'`,
    },
    {
      ref: `Mark 16:19`,
      fruit: `Hope`,
      text: `So then the Lord Jesus, after he spoke to them, was taken up into heaven and took his seat at the right hand of God.`,
    },
    {
      ref: `Acts 2:1-4`,
      fruit: `Wisdom`,
      text: `When the time for Pentecost was fulfilled, they were all in one place together. And suddenly there came from the sky a noise like a strong driving wind, and it filled the entire house in which they were. Then there appeared to them tongues as of fire, which parted and came to rest on each one of them. And they were all filled with the holy Spirit and began to speak in different tongues, as the Spirit enabled them to proclaim.`,
    },
    {
      ref: `Luke 1:48-49`,
      fruit: `Devotion to Mary`,
      text: `Behold, from now on will all ages call me blessed. The Mighty One has done great things for me, and holy is his name.`,
    },
    {
      ref: `Revelation 12:1`,
      fruit: `Grace of a happy death`,
      text: `A great sign appeared in the sky, a woman clothed with the sun, with the moon under her feet, and on her head a crown of twelve stars.`,
    },
  ],
  luminous: [
    {
      ref: `Matthew 3:16-17`,
      fruit: `Openness to the Holy Spirit`,
      text: `After Jesus was baptized, he came up from the water and behold, the heavens were opened [for him], and he saw the Spirit of God descending like a dove [and] coming upon him. And a voice came from the heavens, saying, 'This is my beloved Son, with whom I am well pleased.'`,
    },
    {
      ref: `John 2:1-5`,
      fruit: `To Jesus through Mary`,
      text: `On the third day there was a wedding in Cana in Galilee, and the mother of Jesus was there. Jesus and his disciples were also invited to the wedding. When the wine ran short, the mother of Jesus said to him, 'They have no wine.' [And] Jesus said to her, 'Woman, how does your concern affect me? My hour has not yet come.' His mother said to the servers, 'Do whatever he tells you.'`,
    },
    {
      ref: `Mark 1:15`,
      fruit: `Conversion`,
      text: `'This is the time of fulfillment. The kingdom of God is at hand. Repent, and believe in the gospel.'`,
    },
    {
      ref: `Matthew 17:1-2`,
      fruit: `Desire for holiness`,
      text: `After six days Jesus took Peter, James, and John his brother, and led them up a high mountain by themselves. And he was transfigured before them; his face shone like the sun and his clothes became white as light.`,
    },
    {
      ref: `Matthew 26:26`,
      fruit: `Adoration`,
      text: `While they were eating, Jesus took bread, said the blessing, broke it, and giving it to his disciples said, 'Take and eat; this is my body.'`,
    },
  ],
};
const ascensionBodies: Record<string, Array<{ fruit: string; body: string }>> = {
  joyful: [
    {
      fruit: `Fruit of Humility`,
      body: `Mary said yes. God was asking a great amount of her. She could face disapproval. Joseph could abandon her. She might not be believed. Mary risked a lot because she had faith in God’s goodness. I imagine her kneeling in wonderment at the angel Gabriel, his hands encompassing hers, his forehead pressed against hers as he tells her of God’s great plan. She whispers “yes” knowing that her life is forever changed and possibly going to be much harder. She allows God’s will to be done and with that fiat the salvation of the world is set in motion. I pray that I can put God’s will before my own.`,
    },
    {
      fruit: `Love of Neighbor`,
      body: `Newly pregnant, Mary walks several days to visit her cousin Elizabeth. Elizabeth greets her with great joy and Mary exclaims her Magnificat. While knowing that all will call her blessed, she spends several months serving Elizabeth. I imagine her performing the tasks of life so that Elizabeth, in her third trimester when the physical burden of pregnancy is greatest, can rest. Despite her own possible exhaustion and morning sickness, she serves her cousin. I imagine them at the end of the day sitting together and sharing their feelings about these two miraculous babies. I pray that I can serve as Mary did.`,
    },
    {
      fruit: `Poverty of Spirit`,
      body: `Mary and Joseph are far from home and she is about to give birth. They find nowhere to stay. Rather than panicking, they rely on God who leads them to a safe, warm place for his son’s birth. I imagine their worry but also their sense of calm. They know God cares for them and he will not abandon them on this holy journey. As the angels announce Jesus’ birth and the shepherds come to pay him homage, Mary and Joseph are surrounded by God’s love. I pray for the grace to depend on God completely.`,
    },
    {
      fruit: `Obedience`,
      body: `Mary and Joseph obey the law and bring their newborn son to the temple and offer a sacrifice. There they meet Simeon who has waited many years to meet the Messiah. I imagine Simeon gazing at Jesus. The Christ for whom he has waited has arrived just as God promised. He raises his eyes to heaven in thanks. He also warns Mary that her own heart will be pierced. She continues to trust God, not knowing what lies ahead. I pray for trust in God’s plan and patience in waiting for it to unfold.`,
    },
    {
      fruit: `Piety`,
      body: `After not knowing where he was for three days, Mary and Joseph find Jesus in the temple. I imagine the fear they felt when they realized Jesus was not with them as they returned from Jerusalem. I imagine how scared they felt as they looked for him and the increasing anxiety they experience as time passed. At last they find him in his father’s home. What relief and joy. We look for Jesus too and we can always find him in church. He is there waiting for us. I pray that I will not find reasons to avoid visiting Jesus regularly.`,
    },
  ],
  sorrowful: [
    {
      fruit: `conformity to God’s will`,
      body: `Jesus knows torture and death lie ahead and he prays that the cup will pass. He also prays God’s will be done. In his agony, he carries the weight of our sins so that we may be saved. I imagine the courage it took to give himself to God’s plan. We too suffer and while we may pray the suffering will end, we are given support from Our Lord to endure, as Jesus received strength from the angel in the garden. I pray for the courage to conform to God’s will especially when it may be difficult.`,
    },
    {
      fruit: `Mortification`,
      body: `Jesus is brutally tortured to near death. Scourging was more than mere beating; it involved using instruments to inflict the most pain and blood loss possible without actually killing. Jesus was beaten for our sins. His mother watched as her son’s blood spilled on the ground. I imagine the horror she felt watching her precious child be brutalized, and how hard it must have been to not run to his rescue. I pray for forgiveness for my sins, the sins that contributed to the torture of my Lord.`,
    },
    {
      fruit: `Moral Courage`,
      body: `Jesus is stripped, reclothed with a scarlet robe and crowned with thorns. He is mocked and spit upon by the soldiers. The people demand his crucifixion. Despite his innocence, he does not defend himself. He is strong in the face of hatred. I imagine his sadness at the people’s ignorance, his sorrow at their contempt. I pray for courage to defend God’s truth and strength to withstand the criticism and hatred of others.`,
    },
    {
      fruit: `Patience`,
      body: `Jesus’ humiliation continues as he carries the Cross he will be crucified on through the town and people continue to mock him. I imagine the pain of the heavy wood against his back, rubbing against the open wounds from the scourging, the hot sun on him, the thirst, and hunger. I imagine his grief at seeing Mary, knowing she is watching her son die. Jesus is patient in enduring this suffering for us. I pray for more forgiveness, knowing my sins add to the weight of that Cross. I pray for patience in my own times of difficulty.`,
    },
    {
      fruit: `Salvation`,
      body: `Jesus arrives and is nailed to the cross. As he hangs, slowly dying, he is comforted by the presence of Mary, her sister, John and Mary Magdalene. Mary is strong. She has watched him suffer and now die and she never leaves him. I imagine her heartache. In his words to Mary, “Woman, behold, your son” all of us are entrusted to her love. I pray in thanksgiving for Christ’s suffering and sacrifice so that I may be saved.`,
    },
  ],
  glorious: [
    {
      fruit: `Faith`,
      body: `Jesus did as he foretold, he rose from death, thus securing for us everlasting life in heaven with him and his father. An angel greets the women who went to visit him. He gives them this good news. They see him on their way to Galilee and he tells them to tell the disciples of his resurrection. I imagine the joy they feel when they see the one they love living again, the celebration of the disciples and Mary when they are able to touch him and talk to him. I pray for faith that I too may one day be with Jesus in heaven.`,
    },
    {
      fruit: `Hope`,
      body: `As Jesus ascends to heaven he tells his followers to go and make disciples. He sends them to the world to share his story and he promises he will always be with them. I imagine their surprise to see him lifted up and away to the clouds and their wonderment as all that occurred. I imagine them considering what will happen next and how they will do as he told them. They are filled with hope and maybe fear. I pray for hope when I don’t know the way forward or when times seem dark.`,
    },
    {
      fruit: `Wisdom`,
      body: `The apostles and Mary are hiding in the upper room in fear of the future. When the Holy Spirit, the Advocate Jesus said he would send, comes to them, they are filled with the seven gifts of the Holy Spirit. These are the gifts they need to go out into the world and spread the Good News of the Gospel: wisdom, understanding, counsel, fortitude, knowledge, piety, and fear of the Lord. We receive these same gifts at our baptism and confirmation. I pray that I can use these gifts to share the love of Jesus and the story of his Good News.`,
    },
    {
      fruit: `Devotion to Mary`,
      body: `Mary is taken to heaven to her rightful place with Jesus where she intercedes for us in prayer. I imagine her excitement at being with her son again, and her pleasure at being in heaven with God. I pray for her intercession and help in growing closer to Jesus, while asking her to help me love him more. She will keep pointing the way toward her son.`,
    },
    {
      fruit: `Eternal Happiness`,
      body: `Mary is the Queen of Heaven and Earth. She listened to God’s will and stayed true to his plan for her life. Mary suffered but her reward in heaven is great. She is our queen too, and if asked she will help us in all facets of our life. I imagine her lovingly looking down at us and her happiness at our requests for help. I pray for her humility, patience, and trust.`,
    },
  ],
  luminous: [
    {
      fruit: `Openness to the Holy Spirit`,
      body: `Though Jesus is without original sin, John baptizes him and God announces that Jesus is his son and he is pleased. I imagine standing in that cool river, feeling the water rush past me. The sounds of the crowd are muffled as my head goes below the surface. I imagine hearing God’s great voice proclaiming he is pleased with his son. I desire God to be pleased with me too, and pray that I can accept the movement of the Holy Spirit in my life.`,
    },
    {
      fruit: `Jesus Through Mary`,
      body: `It is here Jesus’ public life is put into motion. I imagine Mary noticing that the wine is running out and hearing her ask Jesus for help, confident in his assistance. His respect for Mary is so high, he performs his first miracle at her request. Her command, “Do whatever he tells you” is for us too. The wine stewards listen and water is turned into wine. When we pray the Rosary she intercedes with her Son on our behalf. I pray to grow closer to Jesus with Mary’s help.`,
    },
    {
      fruit: `Repentance`,
      body: `Jesus went about the land preaching the coming of the kingdom of heaven. He healed the sick and cast out demons. I imagine the awe of the people watching this man proclaim the importance of repenting of our sins as he healed people of their paralysis or leprosy. He preached about love and forgiveness. We too need healing and repentance. I pray for the ability to be humbly and genuinely sorry for my sins against others and against the God who loves me and made me.`,
    },
    {
      fruit: `Desire for Holiness`,
      body: `Peter, James and John accompany Jesus up Mount Tabor where Jesus is transformed before them in glorious light and Moses and Elijah appear. Peter desires to build tents for them so they may stay. God again proclaims pleasure in Jesus, his beloved Son and tells them to listen to him. I imagine the disciples seeing Jesus with the prophets of the past and hearing God’s voice. They received a beautiful gift from God and comforting words from Jesus to not be afraid. I pray for the desire to spend time with Christ thinking about his message and striving for holiness.`,
    },
    {
      fruit: `Eucharistic Adoration`,
      body: `Jesus gives us the greatest of gifts in his presence in the Eucharist—body, blood, soul and divinity. I imagine the disciples hearing these words of the New Covenant and the directive to do this in his remembrance. We reflect on this at every Mass as we genuflect before the tabernacle. We are also invited to visit Jesus in adoration. It takes great faith to believe in the Real Presence. I pray for the grace to have that faith, to seek him in adoration and surrender myself humbly to his service.`,
    },
  ],
};

const mysteries: Mystery[] = [];
const mystery_contents: MysteryContent[] = [];
mysteryData.forEach((set) => {
  const key = set.set.toLowerCase();
  set.items.forEach(([title, short, full], idx) => {
    const id = `${key}-${idx + 1}`;
    mysteries.push({ id, mystery_set_id: `set-${key}`, title, position: idx });
    // Built-in reflection body (the default): short + full lengths.
    mystery_contents.push(
      {
        id: `${id}-short`,
        mystery_id: id,
        variant: "short_description",
        body_key: "reflection",
        label: "Reflection",
        body: short,
      },
      {
        id: `${id}-full`,
        mystery_id: id,
        variant: "full_meditation",
        body_key: "reflection",
        label: "Reflection",
        body: full,
      },
    );
    // USCCB Scripture body — a scripture line + its fruit.
    const u = usccbBodies[key]?.[idx];
    if (u) {
      mystery_contents.push({
        id: `${id}-usccb`,
        mystery_id: id,
        variant: "scripture",
        body_key: "usccb-scripture",
        label: "USCCB \u2014 Scripture",
        scripture_ref: u.ref,
        scripture_text: u.text,
        fruit: u.fruit,
        // USCCB gives only the exact Scripture (no separate description) \u2014 the
        // passage lives in scripture_text; body stays empty.
        body: "",
        source_id: "src-usccb-rosary",
      });
    }
    // Ascension Press meditation body.
    const a = ascensionBodies[key]?.[idx];
    if (a) {
      mystery_contents.push({
        id: `${id}-ascension`,
        mystery_id: id,
        variant: "full_meditation",
        body_key: "ascension-meditation",
        label: "Ascension \u2014 Meditation",
        fruit: a.fruit,
        body: a.body,
        source_id: "src-ascension",
      });
    }
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

/**
 * The Caro Family Rosary, as the family prays it: it opens with the three family
 * consecration prayers, keeps the Fatima Prayer + Prayer for Peace after every
 * decade, and sings a verse of the Fatima Hymn (with its chorus) after decades
 * 1–4 — the hymn's four verses across the first four decades, the fifth decade
 * left un-sung.
 */
function caroRosaryItems(): TemplateItem[] {
  const templateId = "tpl-caro-rosary";
  const items: TemplateItem[] = [];
  let p = 0;
  const add = (partial: Partial<TemplateItem> & { kind: TemplateItem["kind"] }) =>
    items.push(ti(templateId, p++, partial));

  add({ kind: "prayer", prayer_id: "sign-of-the-cross" });
  add({ kind: "prayer", prayer_id: "family-consecration-immaculate-heart" });
  add({ kind: "prayer", prayer_id: "consecration-family-sacred-heart" });
  add({ kind: "prayer", prayer_id: "family-prayer" });
  add({ kind: "prayer", prayer_id: "apostles-creed" });
  add({ kind: "prayer", prayer_id: "our-father" });
  add({ kind: "prayer", prayer_id: "hail-mary", repetition_count: 3 });
  add({ kind: "prayer", prayer_id: "glory-be" });
  for (let d = 1; d <= 5; d++) {
    add({ kind: "mystery_placeholder", mystery_ordinal: d, label: `Decade ${d}` });
    add({ kind: "prayer", prayer_id: "our-father" });
    add({ kind: "prayer", prayer_id: "hail-mary", repetition_count: 10 });
    add({ kind: "prayer", prayer_id: "glory-be" });
    add({ kind: "prayer", prayer_id: "fatima-prayer" });
    add({ kind: "prayer", prayer_id: "prayer-for-peace" });
    // Verse d + chorus (ordinal 5) after decades 1–4; the fifth decade is un-sung.
    if (d <= 4) add({ kind: "song", prayer_id: "fatima-hymn", song_segments: [d, 5] });
  }
  add({ kind: "prayer", prayer_id: "hail-holy-queen" });
  add({ kind: "prayer", prayer_id: "sign-of-the-cross" });
  return items;
}
const caroItemsList = caroRosaryItems();

// The 54-day rosary is a plain daily Rosary devotion; its "54 days" lives in the
// devotion's default recurrence (daily × 54), not a separate novena subsystem.
const novenaItems: TemplateItem[] = rosaryItems("tpl-54-novena", {
  fatima: true,
  peace: false,
}).map((item) => ({ ...item, template_id: "tpl-54-novena" }));

// Pray with the Pope — a minimal, generic external-link devotion (no pre-added
// prayers). Starting it simply opens the selected/default source.
const popeItems: TemplateItem[] = [
  ti("tpl-pray-with-pope", 0, {
    kind: "external_link",
    label: "Pray with the Pope",
    external_options: [
      {
        label: "Click to Pray — Pope's Worldwide Prayer Network",
        url: "https://clicktopray.org/",
        is_default: true,
      },
      {
        label: "Vatican News — Pope's Monthly Intention",
        url: "https://www.vaticannews.va/en/pope/prayer-intentions.html",
      },
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
      [
        "Mt 3:13",
        "Then cometh Jesus from Galilee to the Jordan, unto John, to be baptized by him.",
      ],
      [
        "Mt 3:14",
        "But John stayed him, saying: I ought to be baptized by thee, and comest thou to me?",
      ],
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
      [
        "Jn 2:7",
        "Jesus saith to them: Fill the waterpots with water. And they filled them up to the brim.",
      ],
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
      [
        "Mt 17:1",
        "Jesus taketh Peter and James and John, and bringeth them up into a high mountain.",
      ],
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
      [
        "1 Cor 11:26",
        "As often as you shall eat this bread, you shall shew the death of the Lord.",
      ],
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
  add({
    kind: "custom",
    label: "Closing",
    body: "Lord Jesus, help us to persevere in living out our baptismal promises.",
  });
  return items;
}
const scripturalRosaryItemsList = scripturalRosaryItems();

const allPrayers = [...base, ...songs];

export function createSeedDatabase(): Database {
  return {
    settings: { bible_app_id: "youversion", bible_translation: "NIV" },
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
        id: "src-caro-rosary",
        source_type: "manual",
        name: "Caro Family Rosary",
        attribution: "Caro Family",
        created_at: now,
      },
      {
        id: "src-usccb",
        source_type: "web",
        name: "USCCB — Basic Prayers",
        url: "https://www.usccb.org/prayer-and-worship/prayers-and-devotions/prayers/basic-prayers",
        attribution: "United States Conference of Catholic Bishops",
        created_at: now,
      },
      {
        id: "src-usccb-rosary",
        source_type: "web",
        name: "USCCB — Scripture",
        url: "https://www.usccb.org/how-to-pray-the-rosary",
        attribution: "United States Conference of Catholic Bishops",
        created_at: now,
      },
      {
        id: "src-ascension",
        source_type: "web",
        name: "Ascension — Meditation",
        url: "https://ascensionpress.com/blogs/articles/quick-meditations-on-every-mystery-of-the-rosary",
        attribution: "Ascension Press",
        created_at: now,
      },
      {
        id: "src-focus-humility",
        source_type: "document",
        name: "Litany of Humility",
        file_reference: "How-to-Pray_-The-Litany-of-Humility-FOCUS.pdf",
        attribution: "Cardinal Rafael Merry del Val (public domain)",
        created_at: now,
      },
      {
        id: "src-ascension-litany",
        source_type: "web",
        name: "Litany of the Sacred Heart of Jesus",
        url: "https://ascensionpress.com/blogs/articles/litany-of-the-sacred-heart-of-jesus-full-prayer-text-video-and-meaning",
        attribution: "Approved for public use by Pope Leo XIII, 1899 (public domain)",
        created_at: now,
      },
      {
        id: "src-catholic-crusade",
        source_type: "web",
        name: "Litany of the Immaculate Heart of Mary",
        url: "https://thecatholiccrusade.com/litany-of-the-immaculate-heart-of-mary/",
        attribution: "Traditional (public domain)",
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
        default_mystery_body: "usccb-scripture",
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
        description: "A full Rosary prayed daily for 54 days.",
        kind: "rosary",
        mystery_presentation: "title_and_description",
        mystery_count: 5,
        default_recurrence: { freq: "daily", interval: 1, count: 54 },
        source_id: "src-54-day-pdf",
        built_in: true,
        created_at: now,
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
      {
        id: "tpl-litany-humility",
        name: "Litany of Humility",
        description:
          "Cardinal Merry del Val's prayer for a humble heart — to be freed from the desire for esteem and the fear of humiliation.",
        kind: "standard",
        mystery_presentation: "title_only",
        mystery_count: 0,
        notes:
          "Especially fruitful during Lent. Pray it slowly, reflecting on each line — let it become an examination of conscience and a conversation with the Lord.",
        source_id: "src-focus-humility",
        built_in: true,
        created_at: now,
      },
      {
        id: "tpl-litany-sacred-heart",
        name: "Litany of the Sacred Heart of Jesus",
        description:
          "The traditional litany to the Sacred Heart — thirty-three invocations, each answered “Have mercy on us.”",
        kind: "standard",
        mystery_presentation: "title_only",
        mystery_count: 0,
        notes:
          "Prayed especially on the First Friday of each month, on the Feast of the Sacred Heart, and during Eucharistic Adoration.",
        media: [
          {
            id: "media-litany-sacred-heart",
            kind: "video",
            source: "link",
            label: "Pray along — Fr. Mark-Mary & Mother Clare",
            url: "https://www.youtube.com/watch?v=5xjFIKo7ywQ",
            created_at: now,
          },
        ],
        source_id: "src-ascension-litany",
        built_in: true,
        created_at: now,
      },
      {
        id: "tpl-litany-immaculate-heart",
        name: "Litany of the Immaculate Heart of Mary",
        description: "Invocations to the Immaculate Heart of Mary, each answered “pray for us.”",
        kind: "standard",
        mystery_presentation: "title_only",
        mystery_count: 0,
        media: [
          {
            id: "media-litany-immaculate-heart",
            kind: "video",
            source: "link",
            label: "Pray along (video)",
            url: "https://youtu.be/c7F6ExYjsZM",
            created_at: now,
          },
        ],
        source_id: "src-catholic-crusade",
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
      ...litanyHumilityItems,
      ...litanySacredHeartItems,
      ...litanyImmaculateHeartItems,
    ],
    sessions: [],
    session_items: [],
    session_plans: [],
    intentions: [],
    import_drafts: [],
    reflections: [],
    mass_experiences: [],
    // Voices = the who behind content (individual/org/ministry), each with its
    // channels. Favorited channels surface on Home.
    voices: [
      {
        id: "voice-usccb",
        name: "USCCB",
        kind: "organization",
        channels: [
          {
            id: "chan-usccb-web",
            platform: "website",
            url: "https://www.usccb.org",
            favorite: true,
          },
        ],
        created_at: now,
      },
      {
        id: "voice-hallow",
        name: "Hallow",
        kind: "organization",
        channels: [
          { id: "chan-hallow-web", platform: "website", url: "https://hallow.com", favorite: true },
        ],
        created_at: now,
      },
      {
        id: "voice-youversion",
        name: "YouVersion",
        kind: "organization",
        channels: [
          { id: "chan-youversion-web", platform: "website", url: "https://www.bible.com" },
        ],
        created_at: now,
      },
      // Authors are Voices too — their books/content live under them.
      {
        id: "voice-francis-de-sales",
        name: "St. Francis de Sales",
        kind: "individual",
        created_at: now,
      },
      {
        id: "voice-trent-horn",
        name: "Trent Horn",
        kind: "individual",
        created_at: now,
      },
      {
        id: "voice-fr-mike",
        name: "Fr. Mike Schmitz",
        kind: "individual",
        created_at: now,
      },
      {
        id: "voice-padre-pio",
        name: "St. Padre Pio",
        kind: "individual",
        created_at: now,
      },
    ],
    knowledge_items: [
      {
        id: "know-devout-life",
        title: "Introduction to the Devout Life",
        category: "book",
        voice_id: "voice-francis-de-sales",
        source: "TAN Books",
        status: "in_progress",
        created_at: now,
      },
      {
        id: "know-why-we-are-catholic",
        title: "Why We Are Catholic",
        category: "book",
        voice_id: "voice-trent-horn",
        source: "Catholic Answers Press",
        links: [{ platform: "store", url: "https://a.co/d/0iRtwemk", label: "Amazon" }],
        status: "not_started",
        created_at: now,
      },
      {
        id: "know-bible-in-a-year",
        title: "Bible in a Year",
        category: "program",
        voice_id: "voice-fr-mike",
        source: "Ascension",
        links: [
          {
            platform: "podcast",
            url: "https://podcasts.apple.com/us/podcast/the-bible-in-a-year-with-fr-mike-schmitz/id1539568321",
          },
        ],
        status: "in_progress",
        reads_scripture: true,
        created_at: now,
      },
      {
        id: "know-pio-quote",
        title: "",
        category: "quote",
        voice_id: "voice-padre-pio",
        body: "Blessed is the crisis that made you grow, the fall that made you gaze up to heaven, the problem that made you look for God!",
        status: "not_started",
        created_at: now,
      },
    ],
    how_tos: [
      {
        id: "howto-rosary",
        title: "How to Pray the Rosary",
        summary: "Reference guides and pages that walk through praying the Rosary.",
        template_id: "tpl-rosary",
        steps: [],
        links: ["https://www.usccb.org/how-to-pray-the-rosary"],
      },
    ],
  };
}
