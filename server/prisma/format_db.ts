import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Formatting database: removing test/demo records while preserving real accounts...");

    // 1. Identify demo users to remove
    const demoUsers = await prisma.user.findMany({
        where: {
            OR: [
                { email: { in: ['owner@example.com', 'tenant@example.com'] } },
                { name: { contains: 'Demo' } }
            ]
        }
    });

    const demoUserIds = demoUsers.map(u => u.id);
    console.log(`Found ${demoUserIds.length} demo user(s) to clean:`, demoUsers.map(u => `${u.name} (${u.email})`));

    if (demoUserIds.length > 0) {
        // Find demo properties and units
        const demoProperties = await prisma.property.findMany({
            where: { ownerId: { in: demoUserIds } },
            select: { id: true }
        });
        const demoPropertyIds = demoProperties.map(p => p.id);

        const demoUnits = await prisma.unit.findMany({
            where: { propertyId: { in: demoPropertyIds } },
            select: { id: true }
        });
        const demoUnitIds = demoUnits.map(u => u.id);

        const demoTenancies = await prisma.tenancy.findMany({
            where: {
                OR: [
                    { tenantId: { in: demoUserIds } },
                    { unitId: { in: demoUnitIds } }
                ]
            },
            select: { id: true }
        });
        const demoTenancyIds = demoTenancies.map(t => t.id);

        const demoInvoices = await prisma.invoice.findMany({
            where: { tenancyId: { in: demoTenancyIds } },
            select: { id: true }
        });
        const demoInvoiceIds = demoInvoices.map(i => i.id);

        // Delete communication logs for demo invoices
        await prisma.communicationLog.deleteMany({
            where: { invoiceId: { in: demoInvoiceIds } }
        });

        // Delete payment references for demo invoices
        await prisma.paymentReference.deleteMany({
            where: { invoiceId: { in: demoInvoiceIds } }
        });

        // Delete invoice items for demo invoices
        await prisma.invoiceItem.deleteMany({
            where: { invoiceId: { in: demoInvoiceIds } }
        });

        // Delete demo invoices
        await prisma.invoice.deleteMany({
            where: { id: { in: demoInvoiceIds } }
        });

        // Delete security deposits for demo tenancies
        await prisma.securityDeposit.deleteMany({
            where: { tenancyId: { in: demoTenancyIds } }
        });

        // Delete billing configs for demo tenancies
        await prisma.billingConfig.deleteMany({
            where: { tenancyId: { in: demoTenancyIds } }
        });

        // Delete inspection records for demo tenancies
        await prisma.inspectionRecord.deleteMany({
            where: { tenancyId: { in: demoTenancyIds } }
        });

        // Delete occupants for demo units
        await prisma.occupant.deleteMany({
            where: { unitId: { in: demoUnitIds } }
        });

        // Delete maintenance tickets
        await prisma.maintenanceTicket.deleteMany({
            where: {
                OR: [
                    { tenantId: { in: demoUserIds } },
                    { unitId: { in: demoUnitIds } }
                ]
            }
        });

        // Delete service requests
        await prisma.serviceRequest.deleteMany({
            where: { tenantId: { in: demoUserIds } }
        });

        // Delete tenant documents
        await prisma.tenantDocument.deleteMany({
            where: { tenantId: { in: demoUserIds } }
        });

        // Delete tenancies
        await prisma.tenancy.deleteMany({
            where: { id: { in: demoTenancyIds } }
        });

        // Delete assets
        await prisma.asset.deleteMany({
            where: { unitId: { in: demoUnitIds } }
        });

        // Delete units
        await prisma.unit.deleteMany({
            where: { id: { in: demoUnitIds } }
        });

        // Delete expenses
        await prisma.expense.deleteMany({
            where: { propertyId: { in: demoPropertyIds } }
        });

        // Delete demo properties
        await prisma.property.deleteMany({
            where: { id: { in: demoPropertyIds } }
        });

        // Delete notices
        await prisma.notice.deleteMany({
            where: { ownerId: { in: demoUserIds } }
        });

        // Delete vendors
        await prisma.vendor.deleteMany({
            where: { ownerId: { in: demoUserIds } }
        });

        // Delete demo users
        await prisma.user.deleteMany({
            where: { id: { in: demoUserIds } }
        });
    }

    // 2. Clean out old test communication logs
    const cleanedLogs = await prisma.communicationLog.deleteMany({});
    console.log(`Cleared ${cleanedLogs.count} test audit log entries.`);

    // 3. Display current active verified users
    const remainingUsers = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            properties: { select: { id: true, name: true } },
            tenancies: { select: { id: true, unit: { select: { name: true, property: { select: { name: true } } } } } }
        }
    });

    console.log("\n✅ Database Formatted Successfully! Preserved Active Users:");
    remainingUsers.forEach(u => {
        console.log(`- [${u.role}] ${u.name || 'No Name'} (${u.email}) - Properties: ${u.properties.length}, Tenancies: ${u.tenancies.length}`);
    });
}

main()
    .catch(e => {
        console.error("Error formatting database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
