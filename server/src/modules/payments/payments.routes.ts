import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../prisma/client";

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);

paymentsRouter.post("/create-intent", async (req, res, next) => {
  try {
    const { invoiceId, provider } = req.body as { invoiceId: string; provider: "RAZORPAY" | "STRIPE" };
    if (!invoiceId || !provider) {
      return res.status(400).json({ error: { message: "invoiceId and provider are required" } });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
      return res.status(404).json({ error: { message: "Invoice not found" } });
    }

    const paymentRef = await prisma.paymentReference.create({
      data: {
        invoiceId,
        provider,
        providerRef: `MOCK_${provider}_${Date.now()}`,
        status: "CREATED"
      }
    });

    res.json({
      paymentReferenceId: paymentRef.id,
      provider,
      mockPaymentUrl: `https://mock-pay.local/${paymentRef.id}`,
      amount: invoice.totalAmount
    });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post("/mock-complete", async (req, res, next) => {
  try {
    const { paymentReferenceId } = req.body as { paymentReferenceId: string };
    if (!paymentReferenceId) {
      return res.status(400).json({ error: { message: "paymentReferenceId is required" } });
    }

    const ref = await prisma.paymentReference.findUnique({
      where: { id: paymentReferenceId }
    });
    if (!ref) {
      return res.status(404).json({ error: { message: "Payment reference not found" } });
    }

    await prisma.$transaction([
      prisma.paymentReference.update({
        where: { id: ref.id },
        data: { status: "SUCCESS" }
      }),
      prisma.invoice.update({
        where: { id: ref.invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      })
    ]);

    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

