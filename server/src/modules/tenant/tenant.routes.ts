import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { prisma } from "../../prisma/client";
export const tenantRouter = Router();
tenantRouter.use(requireAuth, requireRole(["TENANT"]));
tenantRouter.get("/home/summary", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const invoices = await prisma.invoice.findMany({
      where: {
        tenancy: {
          tenantId
        }
      },
      orderBy: { dueDate: "desc" }
    });
    const activeTenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        endDate: null
      },
      include: {
        unit: {
          include: {
            property: true
          }
        },
        securityDeposit: true
      }
    });
    let outstanding = 0;
    let lastPaid: Date | null = null;
    for (const inv of invoices) {
      if (inv.status === "PENDING" || inv.status === "OVERDUE") {
        outstanding += inv.totalAmount;
      }
      if (inv.status === "PAID") {
        if (!lastPaid || inv.dueDate > lastPaid) {
          lastPaid = inv.dueDate;
        }
      }
    }
    res.json({
      outstanding,
      lastPaidAt: lastPaid,
      property: activeTenancy?.unit?.property
        ? {
          name: activeTenancy.unit.property.name,
          address: activeTenancy.unit.property.address,
          locality: activeTenancy.unit.property.locality,
          city: activeTenancy.unit.property.city
        }
        : null,
      unit: activeTenancy?.unit
        ? {
          name: activeTenancy.unit.name,
          rentAmount: activeTenancy.unit.rentAmount,
          deposit: activeTenancy.unit.deposit
        }
        : null,
      depositInfo: activeTenancy?.securityDeposit ? {
        amount: activeTenancy.securityDeposit.initialAmount,
        status: activeTenancy.securityDeposit.status
      } : null
    });
  } catch (err) {
    next(err);
  }
});
tenantRouter.get("/bills", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const tenancies = await prisma.tenancy.findMany({
      where: { tenantId },
      select: {
        id: true,
        invoices: {
          orderBy: { dueDate: "desc" },
          select: {
            id: true,
            dueDate: true,
            status: true,
            totalAmount: true,
            paymentMethod: true,
            cashApprovalPending: true,
            items: {
              select: {
                id: true,
                label: true,
                amount: true,
                category: true
              }
            }
          }
        }
      }
    });
    const invoices = tenancies.flatMap((t) =>
      t.invoices.map((inv) => ({
        ...inv,
        tenancyId: t.id
      }))
    );
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
});
import { PaymentService } from "../../services/PaymentService";
tenantRouter.post("/bills/:invoiceId/pay-cash", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const invoiceId = req.params.invoiceId;
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenancy: { tenantId }
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: { message: "Invoice not found" } });
    }
    if (invoice.status === "PAID") {
      return res.status(400).json({ error: { message: "Invoice already paid" } });
    }
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentMethod: "CASH",
        cashApprovalPending: true,
        status: "PENDING"
      }
    });
    await prisma.paymentReference.create({
      data: {
        invoiceId,
        provider: "CASH",
        providerRef: `CASH_${Date.now()}`,
        status: "PENDING_APPROVAL",
        amount: invoice.totalAmount,
        currency: "INR"
      }
    });
    res.json({ message: "Cash payment submitted. Awaiting owner confirmation." });
  } catch (err) {
    next(err);
  }
});
tenantRouter.post("/bills/:invoiceId/create-order", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const invoiceId = req.params.invoiceId;
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenancy: { tenantId }
      },
      include: {
        tenancy: {
          include: {
            tenant: true,
            unit: {
              include: { property: true }
            }
          }
        }
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: { message: "Invoice not found" } });
    }
    if (invoice.status === "PAID") {
      return res.status(400).json({ error: { message: "Invoice already paid" } });
    }
    const order = await PaymentService.createRazorpayOrder(
      invoice.totalAmount,
      invoiceId
    );
    await prisma.paymentReference.create({
      data: {
        invoiceId,
        provider: "RAZORPAY",
        providerRef: order.id,
        status: "CREATED",
        amount: invoice.totalAmount,
        currency: "INR"
      }
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentMethod: "ONLINE"
      }
    });
    res.json({
      orderId: order.id,
      amount: invoice.totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock",
      invoiceId: invoice.id,
      tenantName: invoice.tenancy.tenant.name,
      tenantEmail: invoice.tenancy.tenant.email,
      propertyName: invoice.tenancy.unit.property.name,
      isMock: !PaymentService.isConfigured()
    });
  } catch (err) {
    next(err);
  }
});
tenantRouter.post("/bills/:invoiceId/verify-payment", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const invoiceId = req.params.invoiceId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenancy: { tenantId }
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: { message: "Invoice not found" } });
    }
    const isValid = PaymentService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!isValid) {
      return res.status(400).json({ error: { message: "Invalid payment signature" } });
    }
    const paymentDetails = await PaymentService.getPaymentDetails(razorpay_payment_id);
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentMethod: "ONLINE"
      }
    });
    await prisma.paymentReference.updateMany({
      where: {
        invoiceId,
        providerRef: razorpay_order_id
      },
      data: {
        status: "CAPTURED",
        method: paymentDetails.method || "unknown"
      }
    });
    res.json({
      message: "Payment successful!",
      paymentId: razorpay_payment_id,
      status: "PAID"
    });
  } catch (err) {
    next(err);
  }
});
import PDFDocument from "pdfkit";
tenantRouter.get("/bills/:invoiceId/pdf", async (req, res, next) => {
  try {
    const invoiceId = req.params.invoiceId;
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        tenancy: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: {
                  include: {
                    owner: true
                  }
                }
              }
            }
          }
        },
        items: true
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: { message: "Invoice not found" } });
    }
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoiceId.slice(-6)}.pdf`);
    doc.pipe(res);
    const isPaid = invoice.status === "PAID";
    doc
      .fontSize(20)
      .text(isPaid ? "PAYMENT RECEIPT" : "RENTAL INVOICE", { align: "center" })
      .moveDown();
    doc.fontSize(10);
    doc.text(`Invoice ID:  ${invoice.id.toUpperCase()}`, { align: "right" });
    doc.text(`Date:        ${new Date().toLocaleDateString()}`, { align: "right" });
    doc.text(`Due Date:    ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: "right" });
    doc.moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("FROM (Property Owner):")
      .font("Helvetica")
      .fontSize(10)
      .text(invoice.tenancy.unit.property.owner.name || "Owner")
      .text(invoice.tenancy.unit.property.name)
      .text(`${invoice.tenancy.unit.property.address}, ${invoice.tenancy.unit.property.locality}`)
      .text(invoice.tenancy.unit.property.city)
      .moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("TO (Tenant):")
      .font("Helvetica")
      .fontSize(10)
      .text(invoice.tenancy.tenant.name || "Tenant")
      .text(invoice.tenancy.tenant.email)
      .moveDown();
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("UNIT DETAILS:")
      .font("Helvetica")
      .fontSize(10)
      .text(`Unit Name:  ${invoice.tenancy.unit.name}`)
      .text(`Type:       residential`)
      .moveDown();
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();
    const tableTop = doc.y;
    doc.font("Helvetica-Bold");
    doc.text("Description", 50, tableTop);
    doc.text("Category", 350, tableTop);
    doc.text("Amount", 450, tableTop, { align: "right" });
    doc.moveDown();
    doc.font("Helvetica");
    let y = doc.y;
    invoice.items.forEach((item) => {
      doc.text(item.label, 50, y);
      doc.text(item.category, 350, y);
      doc.text(`Rs. ${item.amount.toLocaleString()}`, 450, y, { align: "right" });
      y += 20;
    });
    doc.moveDown().moveDown();
    doc
      .moveTo(350, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    doc.moveDown(0.5);
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`TOTAL: Rs. ${invoice.totalAmount.toLocaleString()}`, 350, doc.y, { align: "right" });
    doc.moveDown();
    const statusColor = isPaid ? "#22c55e" : invoice.status === "PENDING" ? "#eab308" : "#f43f5e";
    doc
      .fillColor(statusColor)
      .text(`STATUS: ${invoice.status}`, { align: "right" })
      .fillColor("black");
    if (isPaid && invoice.paidAt) {
      doc.fontSize(10).text(`Paid On: ${new Date(invoice.paidAt).toLocaleDateString()}`, { align: "right" });
      if (invoice.paymentMethod) {
        doc.text(`Payment Method: ${invoice.paymentMethod}`, { align: "right" });
      }
    }
    doc
      .fontSize(8)
      .text("Thank you for your timely payment.", 50, 700, { align: "center", width: 500 });
    doc.end();
  } catch (err) {
    next(err);
  }
});
tenantRouter.get("/maintenance", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const tickets = await prisma.maintenanceTicket.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" }
    });
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
});
tenantRouter.post("/maintenance", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const { title, description, category } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: { message: "title, description and category are required" } });
    }
    const activeTenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        endDate: null
      },
      include: {
        unit: true
      }
    });
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        category,
        tenantId,
        unitId: activeTenancy?.unitId || null
      },
      include: {
        unit: {
          include: {
            property: true
          }
        }
      }
    });
    res.status(201).json({ ticket });
  } catch (err) {
    next(err);
  }
});
tenantRouter.patch("/maintenance/:id", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const id = req.params.id;
    const { status } = req.body;
    const existing = await prisma.maintenanceTicket.findFirst({
      where: { id, tenantId }
    });
    if (!existing) {
      return res.status(404).json({ error: { message: "Ticket not found" } });
    }
    const updated = await prisma.maintenanceTicket.update({
      where: { id },
      data: { status }
    });
    res.json({ ticket: updated });
  } catch (err) {
    next(err);
  }
});
tenantRouter.get("/vault/agreement", async (req, res, next) => {
  try {
    res.json({
      title: "11-Month Digital Rental Agreement",
      url: "/static/agreements/sample-agreement.pdf"
    });
  } catch (err) {
    next(err);
  }
});
tenantRouter.patch("/profile", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const { name, phone } = req.body;
    const updated = await prisma.user.update({
      where: { id: tenantId },
      data: { name, phone }
    });
    res.json({ user: updated });
  } catch (err) { next(err); }
});
tenantRouter.get("/profile", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { name: true, phone: true, email: true }
    });
    const activeTenancy = await prisma.tenancy.findFirst({
      where: { tenantId, endDate: null },
      include: { unit: { include: { occupants: true } } }
    });
    res.json({
      name: user?.name,
      phone: user?.phone,
      email: user?.email,
      unitId: activeTenancy?.unitId || null,
      occupants: activeTenancy?.unit?.occupants.map((o) => ({
        id: o.id,
        name: o.name,
        age: o.age,
        relation: o.relation,
        phoneNumber: o.phoneNumber,
        aadharId: o.aadharId,
        photoUrl: o.photoUrl
      })) || []
    });
  } catch (err) { next(err); }
});
tenantRouter.post("/occupants", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const { name, age, relation, phoneNumber, aadharId, photoUrl } = req.body as {
      name: string;
      age?: number;
      relation?: string;
      phoneNumber?: string;
      aadharId?: string;
      photoUrl?: string;
    };
    if (!name || !name.trim()) {
      return res.status(400).json({ error: { message: "Name is required" } });
    }
    const activeTenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        endDate: null
      }
    });
    if (!activeTenancy) {
      return res.status(400).json({ error: { message: "You must be assigned to a unit before adding occupants" } });
    }
    const occupant = await prisma.occupant.create({
      data: {
        name: name.trim(),
        age: age || null,
        relation: relation?.trim() || null,
        phoneNumber: phoneNumber?.trim() || null,
        aadharId: aadharId?.trim() || null,
        photoUrl: photoUrl?.trim() || null,
        unitId: activeTenancy.unitId
      }
    });
    res.status(201).json({
      message: "Occupant added successfully",
      occupant
    });
  } catch (err) {
    next(err);
  }
});
tenantRouter.delete("/occupants/:occupantId", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const occupantId = req.params.occupantId;
    const activeTenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        endDate: null
      }
    });
    if (!activeTenancy) {
      return res.status(400).json({ error: { message: "You must be assigned to a unit" } });
    }
    const occupant = await prisma.occupant.findFirst({
      where: {
        id: occupantId,
        unitId: activeTenancy.unitId
      }
    });
    if (!occupant) {
      return res.status(404).json({ error: { message: "Occupant not found or doesn't belong to your unit" } });
    }
    await prisma.occupant.delete({
      where: { id: occupantId }
    });
    res.json({ message: "Occupant removed successfully" });
  } catch (err) {
    next(err);
  }
});
tenantRouter.get("/payment-history", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const invoices = await prisma.invoice.findMany({
      where: {
        tenancy: { tenantId },
        status: "PAID"
      },
      include: {
        items: true,
        paymentRefs: true,
        tenancy: {
          include: {
            unit: {
              include: { property: true }
            }
          }
        }
      },
      orderBy: { paidAt: "desc" }
    });
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
});
tenantRouter.get("/notices", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const tenancy = await prisma.tenancy.findFirst({
      where: { tenantId },
      include: {
        unit: {
          include: {
            property: {
              select: { ownerId: true }
            }
          }
        }
      }
    });
    if (!tenancy) {
      return res.json({ notices: [] });
    }
    const ownerId = tenancy.unit.property.ownerId;
    const notices = await prisma.notice.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" }
    });
    res.json({ notices });
  } catch (err) {
    next(err);
  }
});
tenantRouter.post("/security-deposits/submit", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const { amount } = req.body;
    const tenancy = await prisma.tenancy.findFirst({
      where: { tenantId, endDate: null },
      orderBy: { startDate: "desc" }
    });
    if (!tenancy) {
      return res.status(404).json({ error: { message: "Active tenancy not found" } });
    }
    const deposit = await prisma.securityDeposit.upsert({
      where: { tenancyId: tenancy.id },
      create: {
        tenancyId: tenancy.id,
        initialAmount: amount,
        status: "PENDING"
      },
      update: {
        initialAmount: amount, 
        status: "PENDING" 
      }
    });
    res.json({ deposit });
  } catch (err) {
    next(err);
  }
});
tenantRouter.get("/service-requests", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const requests = await prisma.serviceRequest.findMany({
      where: { tenantId },
      orderBy: { preferredDate: "desc" }
    });
    res.json({ requests });
  } catch (err) { next(err); }
});
tenantRouter.post("/service-requests", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const { serviceType, preferredDate, notes } = req.body;
    const request = await prisma.serviceRequest.create({
      data: { tenantId, serviceType, preferredDate: new Date(preferredDate), notes, status: "PENDING" }
    });
    res.status(201).json({ request });
  } catch (err) { next(err); }
});
tenantRouter.get("/documents", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const documents = await prisma.tenantDocument.findMany({ where: { tenantId } });
    res.json({ documents });
  } catch (err) { next(err); }
});
tenantRouter.post("/documents/upload", async (req, res, next) => {
  try {
    const tenantId = req.user!.id;
    const { name, type, url } = req.body; 
    const document = await prisma.tenantDocument.create({
      data: { tenantId, name, type, url: url || "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=200" }
    });
    res.status(201).json({ document });
  } catch (err) { next(err); }
});
tenantRouter.get("/invoices/:id/receipt", async (req, res, next) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { tenancy: { include: { tenant: true, unit: { include: { property: true } } } }, items: true }
    });
    if (!invoice || invoice.status !== "PAID") {
      return res.status(400).json({ error: { message: "Receipt only available for paid invoices" } });
    }
    res.json({
      receiptUrl: `/api/tenant/invoices/${invoiceId}/download`,
      message: "Ready for download"
    });
  } catch (err) { next(err); }
});