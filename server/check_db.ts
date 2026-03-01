import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, phone: true, email: true, role: true }
    });
    console.log('--- All Users ---');
    allUsers.forEach(u => {
        console.log(`ID: ${u.id}, Role: ${u.role}, Name: ${u.name}, Phone: ${u.phone}, Email: ${u.email}`);
    });

    const pendingInvoices = await prisma.invoice.findMany({
        where: { status: 'PENDING' },
        include: { tenancy: { include: { tenant: true } } }
    });
    console.log('\n--- Pending Invoices ---');
    pendingInvoices.forEach(inv => {
        console.log(`Invoice ID: ${inv.id}, Tenant: ${inv.tenancy.tenant.name}, Phone: ${inv.tenancy.tenant.phone}, Amount: ${inv.totalAmount}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
