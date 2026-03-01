import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const logs = await prisma.communicationLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- Communication Logs ---');
    console.log(logs);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
