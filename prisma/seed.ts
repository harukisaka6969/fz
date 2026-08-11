import { PrismaClient, DiscountType, InvoiceStatus, SenderType } from "@prisma/client";
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

  await prisma.therapist.deleteMany();
  await prisma.therapist.create({
    data: {
      name: "めぐ",
      catchCopy: "癒しのひとときを、あなたに。",
      bio: "はじめまして、めぐです。お客様一人ひとりの疲れやお悩みに寄り添い、心と体の両方をほぐす施術を心がけています。当日の体調やご要望に合わせて力加減を調整しますので、お気軽にメッセージでお伝えください。",
      age: 26,
      height: 160,
      bodyType: "普通",
      bloodType: "A型",
      areaOfWork: "都内近郊 出張対応",
      workingHours: "平日 13:00〜22:00 / 土日 11:00〜20:00",
      photoUrl: null,
      snsUrl: "https://x.com/example",
    },
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
      adminNote: "力加減は強めが好み。香りはラベンダー希望。",
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

  await prisma.invoice.deleteMany();
  await prisma.invoice.create({
    data: {
      customerId: customer.id,
      title: "2026年7月15日ご利用分",
      discount: 1000,
      status: InvoiceStatus.PAID,
      issuedAt: new Date("2026-07-15T16:30:00"),
      paidAt: new Date("2026-07-15T16:35:00"),
      items: {
        create: [
          {
            menuItemId: menuItems[1].id,
            name: "ロングコース",
            price: 17000,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      customerId: customer2.id,
      title: "2026年7月20日ご利用分",
      discount: 0,
      status: InvoiceStatus.UNPAID,
      issuedAt: new Date("2026-07-20T19:15:00"),
      dueAt: new Date("2026-07-27T00:00:00"),
      items: {
        create: [
          {
            menuItemId: menuItems[3].id,
            name: "アロマリラックスコース",
            price: 15000,
            quantity: 1,
          },
        ],
      },
    },
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
