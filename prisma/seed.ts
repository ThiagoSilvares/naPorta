import "dotenv/config";
import { OrderStatus, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STATUSES: OrderStatus[] = ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELED"];

const CUSTOMERS = [
    { name: "Thiago Oliveira", document: "123.456.789-09" },
    { name: "João Pereira", document: "987.654.321-00" },
    { name: "Mercado Acai", document: "12.345.678/0001-90" },
    { name: "Ana Souza", document: "111.222.333-44" },
    { name: "Padaria Dia e Cia", document: "98.765.432/0001-10" }
];

const ADDRESSES = [
    { street: "Av. Paulista", number: "1000", complement: "Sala 12", neighborhood: "Bela Vista", city: "São Paulo", state: "SP", zipCode: "01310-100" },
    { street: "Rua Augusta", number: "250", complement: null, neighborhood: "Consolação", city: "São Paulo", state: "SP", zipCode: "01305-000" },
    { street: "Rua da Consolação", number: "77", complement: "Apto 31", neighborhood: "Consolação", city: "São Paulo", state: "SP", zipCode: "01301-000" },
    { street: "Av. Brasil", number: "500", complement: null, neighborhood: "Centro", city: "Campinas", state: "SP", zipCode: "13015-000" }
];

const ITEMS = [
    { description: "Caixa de papelão 40x30", price: 12.9 },
    { description: "Fita adesiva 50m", price: 6.5 },
    { description: "Pacote de entrega expressa", price: 29.9 },
    { description: "Etiqueta térmica (rolo)", price: 18.0 },
    { description: "Seguro de carga", price: 9.99 }
];

const TOTAL_ORDERS = 20;
const DAY = 24 * 60 * 60 * 1000;

async function main() {
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.counter.deleteMany();

    await prisma.user.create({
        data: {
            email: "admin@naporta.com",
            passwordHash: await bcrypt.hash("123456", 10)
        }
    });

    for (let i = TOTAL_ORDERS - 1; i >= 0; i--) {
        const createdAt = new Date(Date.now() - i * DAY);

        const counter = await prisma.counter.upsert({
            where: { id: "order" },
            create: { id: "order", seq: 1 },
            update: { seq: { increment: 1 } }
        });

        await prisma.order.create({
            data: {
                number: counter.seq,
                status: STATUSES[i % STATUSES.length],
                expectedDeliveryDate: new Date(createdAt.getTime() + 3 * DAY),
                customer: CUSTOMERS[i % CUSTOMERS.length],
                deliveryAddress: ADDRESSES[i % ADDRESSES.length],
                items: [ITEMS[i % ITEMS.length], ITEMS[(i + 2) % ITEMS.length]],
                createdAt,
                deletedAt: null
            }
        });
    }

    console.log(`Seed finished: 1 user (admin@naporta.com / 123456) and ${TOTAL_ORDERS} orders.`);
}

main()
    .catch(error => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
