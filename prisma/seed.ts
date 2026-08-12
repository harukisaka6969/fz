import { PrismaClient, DiscountType, SenderType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

  await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  await prisma.blogPost.deleteMany();
  await prisma.therapistNote.deleteMany();
  await prisma.therapist.deleteMany();
  const therapists = await Promise.all(
    [
      {
        name: "めぐ",
        catchCopy: "癒しのひとときを、あなたに。",
        bio: "はじめまして、めぐです。お客様一人ひとりの疲れやお悩みに寄り添い、心と体の両方をほぐす施術を心がけています。当日の体調やご要望に合わせて力加減を調整しますので、お気軽にメッセージでお伝えください。",
        age: 26,
        height: 160,
        bodyType: "普通",
        bloodType: "A型",
        areaOfWork: "都内近郊 出張対応",
        workingHours: "平日 13:00〜22:00 / 土日 11:00〜20:00",
        snsUrl: "https://x.com/example",
        sortOrder: 1,
      },
      {
        name: "りん",
        catchCopy: "ゆっくり、じっくり、あなたのペースで。",
        bio: "はじめまして、りんです。強い力よりも、ゆっくりと圧をかけていくスタイルが得意です。会話はあまり得意ではないので静かに過ごしたい方にもおすすめです。お悩みの部位があればぜひ教えてください。",
        age: 24,
        height: 158,
        bodyType: "スレンダー",
        bloodType: "O型",
        areaOfWork: "都内近郊 出張対応",
        workingHours: "平日 15:00〜23:00 / 土日 12:00〜21:00",
        sortOrder: 2,
      },
      {
        name: "さくら",
        catchCopy: "元気と癒しをお届けします。",
        bio: "さくらです！明るく元気にお迎えするのが得意です。会話を楽しみながらリラックスしていただけたら嬉しいです。指圧強めのしっかりコースが人気です。",
        age: 29,
        height: 163,
        bodyType: "グラマー",
        bloodType: "B型",
        areaOfWork: "都内近郊 出張対応 / 一部店舗待機あり",
        workingHours: "平日 12:00〜21:00 / 土日祝 10:00〜19:00",
        sortOrder: 3,
      },
      {
        loginId: "nicole",
        passwordHash: await bcrypt.hash("nicole1234", 10),
        name: "ニコル",
        catchCopy: "いつでも笑顔でお迎えします。",
        bio: "はじめまして、ニコルです。会話を楽しみながら、しっかりコリをほぐす施術が得意です。ご予約はカレンダーからお気軽にどうぞ。",
        age: 27,
        height: 165,
        bodyType: "スレンダー",
        bloodType: "AB型",
        areaOfWork: "都内近郊 出張対応",
        workingHours: "火・木・土 10:00〜18:00",
        sortOrder: 4,
      },
    ].map((t) => prisma.therapist.create({ data: t }))
  );

  await prisma.availabilityRule.deleteMany();
  await prisma.availabilityRule.create({
    data: {
      therapistId: therapists[3].id,
      dayOfWeek: 2,
      startTime: "10:00",
      endTime: "18:00",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.blogPost.createMany({
    data: [
      {
        therapistId: therapists[0].id,
        title: "夏の疲れ、たまっていませんか？",
        body: "暑い日が続きますね。夏は冷房での冷えや寝苦しさで、気づかないうちに肩や首がガチガチになっている方が多いです。次回のご予約の際は、いつもより少し早めにいらしていただいて、ゆっくりお話を伺いながら施術できればと思います。",
      },
      {
        therapistId: therapists[1].id,
        title: "はじめまして、りんです",
        body: "本日からブログを始めました。普段はゆっくりとした施術を心がけています。緊張しやすい方、力加減が心配な方もお気軽にメッセージでご相談ください。",
      },
      {
        therapistId: therapists[2].id,
        title: "新メニューについてのお知らせ",
        body: "いつもありがとうございます！近々、新しいコースを追加予定です。詳細が決まり次第こちらでお知らせしますので楽しみにしていてくださいね。",
      },
    ],
  });

  const customer = await prisma.customer.upsert({
    where: { loginId: "customer01" },
    update: {},
    create: {
      loginId: "customer01",
      passwordHash: await bcrypt.hash("customer1234", 10),
      name: "田中様",
      phone: "090-1234-5678",
      email: "tanaka@example.com",
    },
  });

  await prisma.customerNote.deleteMany();
  await prisma.customerNote.create({
    data: {
      customerId: customer.id,
      body: "力加減は強めが好み。香りはラベンダー希望。",
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { loginId: "customer02" },
    update: {},
    create: {
      loginId: "customer02",
      passwordHash: await bcrypt.hash("customer1234", 10),
      name: "佐藤様",
      phone: "090-8765-4321",
      email: "sato@example.com",
    },
  });

  await prisma.menuItem.deleteMany();
  const menuItems = await Promise.all(
    [
      {
        name: "スタンダードコース",
        description: "全身をゆっくりほぐす基本コース。初めての方にもおすすめです。",
        durationMin: 60,
        price: 12000,
        sortOrder: 1,
      },
      {
        name: "ロングコース",
        description: "時間をかけてじっくり全身を癒すコース。",
        durationMin: 90,
        price: 17000,
        sortOrder: 2,
      },
      {
        name: "ヘッド&デコルテ集中コース",
        description: "頭・首・デコルテを中心にケアする集中コース。",
        durationMin: 45,
        price: 9000,
        sortOrder: 3,
      },
      {
        name: "アロマリラックスコース",
        description: "厳選アロマオイルを使用した全身リラクゼーション。",
        durationMin: 75,
        price: 15000,
        sortOrder: 4,
      },
    ].map((item) => prisma.menuItem.create({ data: item }))
  );

  await prisma.coupon.deleteMany();
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME500",
        title: "初回限定500円OFF",
        description: "はじめてご利用のお客様向けの割引クーポンです。",
        discountType: DiscountType.AMOUNT,
        discountValue: 500,
        validFrom: new Date("2026-01-01"),
        validTo: new Date("2026-12-31"),
        isActive: true,
      },
      {
        code: "SUMMER10",
        title: "夏の10%OFFクーポン",
        description: "夏季限定、全コース10%オフになります。",
        discountType: DiscountType.PERCENT,
        discountValue: 10,
        validFrom: new Date("2026-07-01"),
        validTo: new Date("2026-09-30"),
        isActive: true,
      },
      {
        code: "TANAKA-VIP",
        title: "田中様限定 特別クーポン",
        description: "いつもご利用いただきありがとうございます。次回1000円引きです。",
        discountType: DiscountType.AMOUNT,
        discountValue: 1000,
        validFrom: new Date("2026-01-01"),
        validTo: new Date("2026-12-31"),
        isActive: true,
        customerId: customer.id,
      },
    ],
  });

  await prisma.treatmentHistory.deleteMany();
  await prisma.treatmentHistory.createMany({
    data: [
      {
        customerId: customer.id,
        menuItemId: menuItems[0].id,
        date: new Date("2026-06-10T14:00:00"),
        durationMin: 60,
        price: 12000,
        note: "肩まわりが特に張っていたので重点的にほぐしました。",
      },
      {
        customerId: customer.id,
        menuItemId: menuItems[1].id,
        date: new Date("2026-07-15T15:00:00"),
        durationMin: 90,
        price: 17000,
        note: "前回より肩の張りが軽減。今回はロングコースでリクエスト。",
      },
      {
        customerId: customer2.id,
        menuItemId: menuItems[3].id,
        date: new Date("2026-07-20T18:00:00"),
        durationMin: 75,
        price: 15000,
        note: "アロマはラベンダーを使用。とてもリラックスされていました。",
      },
    ],
  });

  await prisma.review.deleteMany();
  await prisma.review.createMany({
    data: [
      {
        customerId: customer.id,
        rating: 5,
        comment: "とても丁寧な施術で、体がすごく軽くなりました。また予約します。",
        reply: "ご丁寧なレビューありがとうございます！また癒しに来てくださいね。",
        repliedAt: new Date("2026-07-16T10:00:00"),
        createdAt: new Date("2026-07-15T20:00:00"),
      },
      {
        customerId: customer2.id,
        rating: 4,
        comment: "アロマの香りが良くて癒されました。次はロングコースを試したいです。",
      },
    ],
  });

  await prisma.message.deleteMany();
  await prisma.message.createMany({
    data: [
      {
        customerId: customer.id,
        sender: SenderType.CUSTOMER,
        body: "次回の予約は来週の土曜19時は空いていますか？",
        readByAdmin: true,
      },
      {
        customerId: customer.id,
        sender: SenderType.ADMIN,
        body: "ご連絡ありがとうございます！土曜19時、空いておりますのでご予約可能です。",
        readByCustomer: true,
      },
      {
        customerId: customer2.id,
        sender: SenderType.CUSTOMER,
        body: "はじめまして、クーポンは当日でも使えますか？",
        readByAdmin: false,
      },
    ],
  });

  console.log("Seed data created.");
  console.log(`Admin login: ${adminUsername} / ${adminPassword}`);
  console.log("Customer logins: customer01 / customer1234, customer02 / customer1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
