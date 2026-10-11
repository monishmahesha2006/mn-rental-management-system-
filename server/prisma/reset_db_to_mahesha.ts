import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("==========================================================");
  console.log("  Purging all database records except MAHESHA SK owner   ");
  console.log("==========================================================\n");

  // 1. Delete dependent child records first
  const deletedCommLogs = await prisma.communicationLog.deleteMany({});
  console.log(`Deleted Communication Logs: ${deletedCommLogs.count}`);

  const deletedPaymentRefs = await prisma.paymentReference.deleteMany({});
  console.log(`Deleted Payment References: ${deletedPaymentRefs.count}`);

  const deletedInvoiceItems = await prisma.invoiceItem.deleteMany({});
  console.log(`Deleted Invoice Items: ${deletedInvoiceItems.count}`);

  const deletedInvoices = await prisma.invoice.deleteMany({});
  console.log(`Deleted Invoices: ${deletedInvoices.count}`);

  const deletedInspections = await prisma.inspectionRecord.deleteMany({});
  console.log(`Deleted Inspection Records: ${deletedInspections.count}`);

  const deletedDeposits = await prisma.securityDeposit.deleteMany({});
  console.log(`Deleted Security Deposits: ${deletedDeposits.count}`);

  const deletedBillingConfigs = await prisma.billingConfig.deleteMany({});
  console.log(`Deleted Billing Configs: ${deletedBillingConfigs.count}`);

  const deletedTenancies = await prisma.tenancy.deleteMany({});
  console.log(`Deleted Tenancies: ${deletedTenancies.count}`);

  const deletedOccupants = await prisma.occupant.deleteMany({});
  console.log(`Deleted Occupants: ${deletedOccupants.count}`);

  const deletedAssets = await prisma.asset.deleteMany({});
  console.log(`Deleted Assets: ${deletedAssets.count}`);

  const deletedMaintenance = await prisma.maintenanceTicket.deleteMany({});
  console.log(`Deleted Maintenance Tickets: ${deletedMaintenance.count}`);

  const deletedUnits = await prisma.unit.deleteMany({});
  console.log(`Deleted Units: ${deletedUnits.count}`);

  const deletedExpenses = await prisma.expense.deleteMany({});
  console.log(`Deleted Expenses: ${deletedExpenses.count}`);

  const deletedProperties = await prisma.property.deleteMany({});
  console.log(`Deleted Properties: ${deletedProperties.count}`);

  const deletedNotices = await prisma.notice.deleteMany({});
  console.log(`Deleted Notices: ${deletedNotices.count}`);

  const deletedVendors = await prisma.vendor.deleteMany({});
  console.log(`Deleted Vendors: ${deletedVendors.count}`);

  const deletedDocs = await prisma.tenantDocument.deleteMany({});
  console.log(`Deleted Tenant Documents: ${deletedDocs.count}`);

  const deletedServices = await prisma.serviceRequest.deleteMany({});
  console.log(`Deleted Service Requests: ${deletedServices.count}`);

  // 2. Delete all users EXCEPT mahesha.sk accounts
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      NOT: {
        email: {
          startsWith: "mahesha.sk"
        }
      }
    }
  });
  console.log(`Deleted Other User Accounts: ${deletedUsers.count}`);

  // 3. Verify remaining users
  const remainingUsers = await prisma.user.findMany();
  console.log("\n==========================================================");
  console.log("  Remaining Database Users:");
  console.log("==========================================================");
  for (const u of remainingUsers) {
    console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`);
  }
  console.log("\n✅ All data wiped successfully. Only MAHESHA SK remains.");
}

main()
  .catch((e) => {
    console.error("❌ Error while wiping database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
