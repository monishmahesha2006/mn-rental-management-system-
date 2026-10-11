import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";
import { prisma } from "../../prisma/client";
import { NotificationService } from "../../services/NotificationService";
export const ownerRouter = Router();
ownerRouter.use(requireAuth, requireRole(["OWNER"]));
ownerRouter.get("/dashboard/summary", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const [unitCounts, invoices] = await Promise.all([
      prisma.unit.groupBy({
        by: ["status"],
        where: {
          property: {
            ownerId
          }
        },
        _count: { _all: true }
      }),
      prisma.invoice.findMany({
        where: {
          tenancy: {
            unit: {
              property: {
                ownerId
              }
            }
          }
        },
        select: {
          status: true,
          totalAmount: true,
          dueDate: true
        }
      })
    ]);
    const totalUnits = unitCounts.reduce((sum, u) => sum + u._count._all, 0);
    const occupiedCount =
      unitCounts.find((u) => u.status === "OCCUPIED" || u.status === "NOTICE_PERIOD")?._count._all || 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let totalMonthlyRevenue = 0;
    let pendingDues = 0;
    for (const inv of invoices) {
      const due = inv.dueDate;
      if (due.getFullYear() === currentYear && due.getMonth() === currentMonth) {
        totalMonthlyRevenue += inv.totalAmount;
      }
      if (inv.status === "PENDING" || inv.status === "OVERDUE") {
        pendingDues += inv.totalAmount;
      }
    }
    const occupancyRate = totalUnits === 0 ? 0 : Math.round((occupiedCount / totalUnits) * 100);
    res.json({
      totalMonthlyRevenue,
      pendingDues,
      occupancyRate,
      totalUnits,
      occupiedUnits: occupiedCount
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/dashboard/revenue", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const invoices = await prisma.invoice.findMany({
      where: {
        tenancy: {
          unit: {
            property: {
              ownerId
            }
          }
        }
      },
      select: {
        totalAmount: true,
        dueDate: true
      },
      orderBy: { dueDate: "asc" }
    });
    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;
    const quarterly: Record<string, number> = {};
    const annual: Record<string, number> = {};
    const ensureQuarter = (label: string) => {
      if (!quarterly[label]) quarterly[label] = 0;
    };
    for (const inv of invoices) {
      const year = inv.dueDate.getFullYear();
      const month = inv.dueDate.getMonth(); 
      const q = Math.floor(month / 3) + 1;
      const qLabel = `Q${q} ${year}`;
      ensureQuarter(qLabel);
      quarterly[qLabel] += inv.totalAmount;
      const aKey = String(year);
      if (!annual[aKey]) annual[aKey] = 0;
      annual[aKey] += inv.totalAmount;
    }
    const quarterlySeries = Object.entries(quarterly)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([label, value]) => ({ label, value }));
    const annualSeries = [
      { label: String(lastYear), value: annual[String(lastYear)] || 0 },
      { label: String(currentYear), value: annual[String(currentYear)] || 0 }
    ];
    res.json({
      quarterly: quarterlySeries,
      annual: annualSeries
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/dashboard/revenue-breakdown", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const invoices = await prisma.invoice.findMany({
      where: {
        tenancy: {
          unit: {
            property: {
              ownerId
            }
          }
        },
        status: "PAID" 
      },
      include: {
        tenancy: {
          include: {
            unit: {
              include: {
                property: true
              }
            }
          }
        }
      }
    });
    const propertyRevenue: Record<string, number> = {};
    const unitRevenue: Record<string, { revenue: number; property: string }> = {};
    invoices.forEach(inv => {
      const propName = inv.tenancy.unit.property.name;
      const unitName = inv.tenancy.unit.name;
      propertyRevenue[propName] = (propertyRevenue[propName] || 0) + inv.totalAmount;
      if (!unitRevenue[unitName]) {
        unitRevenue[unitName] = { revenue: 0, property: propName };
      }
      unitRevenue[unitName].revenue += inv.totalAmount;
    });
    const properties = Object.entries(propertyRevenue).map(([name, value]) => ({ name, value }));
    const units = Object.entries(unitRevenue).map(([name, data]) => ({ name, propertyName: data.property, value: data.revenue }));
    res.json({ properties, units });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/properties", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        units: {
          include: {
            tenancies: {
              where: { endDate: null },
              include: { tenant: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ properties });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/properties", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const { name, address, city, locality } = req.body as {
      name: string;
      address: string;
      city: string;
      locality: string;
    };
    if (!name || !address || !city || !locality) {
      return res.status(400).json({ error: { message: "name, address, city and locality are required" } });
    }
    const property = await prisma.property.create({
      data: {
        name,
        address,
        city,
        locality,
        ownerId
      }
    });
    res.status(201).json({ property });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/properties/:propertyId/units", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const propertyId = req.params.propertyId;
    const { name, rentAmount, deposit } = req.body as {
      name: string;
      rentAmount: number;
      deposit: number;
    };
    if (!name || !rentAmount || !deposit) {
      return res.status(400).json({ error: { message: "name, rentAmount and deposit are required" } });
    }
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId }
    });
    if (!property) {
      return res.status(404).json({ error: { message: "Property not found" } });
    }
    const unit = await prisma.unit.create({
      data: {
        name,
        rentAmount,
        deposit,
        propertyId,
        status: "AVAILABLE"
      }
    });
    res.status(201).json({ unit });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/tenants", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenancies = await prisma.tenancy.findMany({
      where: {
        unit: {
          property: {
            ownerId
          }
        }
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
            occupants: true
          }
        }
      }
    });
    const allTenants = await prisma.user.findMany({
      where: { role: "TENANT" },
      include: {
        tenancies: {
          include: {
            unit: {
              include: {
                property: true
              }
            }
          }
        }
      }
    });
    const assignedRows = tenancies.map((t) => ({
      tenantId: t.tenant.id,
      tenancyId: t.id,
      tenantName: t.tenant.name || t.tenant.email,
      tenantEmail: t.tenant.email,
      unitId: t.unit.id,
      unitName: t.unit.name,
      propertyId: t.unit.property.id,
      propertyName: t.unit.property.name,
      locality: t.unit.property.locality,
      status: t.noticeStart ? "NOTICE_PERIOD" : "ACTIVE",
      isAssigned: true,
      occupants: t.unit.occupants.slice(0, 5).map((o) => ({
        id: o.id,
        name: o.name,
        age: o.age,
        relation: o.relation
      }))
    }));
    const assignedTenantIds = new Set(tenancies.map((t) => t.tenant.id));
    const unassignedTenants = allTenants
      .filter((tenant) => !assignedTenantIds.has(tenant.id))
      .map((tenant) => ({
        tenantId: tenant.id,
        tenancyId: null,
        tenantName: tenant.name || tenant.email,
        tenantEmail: tenant.email,
        unitId: null,
        unitName: null,
        propertyId: null,
        propertyName: null,
        locality: null,
        status: "UNASSIGNED" as const,
        isAssigned: false,
        occupants: []
      }));
    res.json({ tenants: [...assignedRows, ...unassignedTenants] });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/billing/tanker-split", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const { propertyId, totalCost, unitIds } = req.body as { propertyId: string; totalCost: number; unitIds?: string[] };
    if (!propertyId || !totalCost || totalCost <= 0) {
      return res.status(400).json({ error: { message: "propertyId and positive totalCost are required" } });
    }
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      include: {
        units: {
          include: {
            occupants: true,
            tenancies: {
              where: { endDate: null },
              include: {
                billingConfig: true
              }
            }
          }
        }
      }
    });
    if (!property) {
      return res.status(404).json({ error: { message: "Property not found" } });
    }
    let activeUnits = property.units.filter((u) => u.tenancies.length > 0);
    if (unitIds && unitIds.length > 0) {
      activeUnits = activeUnits.filter((u) => unitIds.includes(u.id));
    }
    const totalResidents = activeUnits.reduce((acc, unit) => acc + (unit.occupants.length || 1), 0);
    if (totalResidents === 0) {
      return res.status(400).json({ error: { message: "No residents found for tanker split" } });
    }
    const perResident = totalCost / totalResidents;
    const now = new Date();
    const createdInvoices = [];
    for (const unit of activeUnits) {
      const tenancy = unit.tenancies[0];
      const residents = unit.occupants.length || 1;
      const waterAmount = Math.round(perResident * residents);
      let dueDate = new Date();
      if (tenancy.billingConfig) {
        dueDate = new Date(now.getFullYear(), now.getMonth(), tenancy.billingConfig.billDueDay);
      }
      const invoice = await prisma.invoice.create({
        data: {
          tenancyId: tenancy.id,
          dueDate: dueDate,
          status: "PENDING",
          totalAmount: waterAmount,
          items: {
            create: [
              {
                label: `Tanker Water - ${now.toLocaleString("default", { month: "short", year: "numeric" })}`,
                amount: waterAmount,
                category: "WATER"
              }
            ]
          }
        }
      });
      createdInvoices.push({
        invoiceId: invoice.id,
        unitName: unit.name,
        residents,
        amount: waterAmount
      });
    }
    res.json({
      totalCost,
      totalResidents,
      perResident,
      invoices: createdInvoices
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/automation-log", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const logs = await prisma.communicationLog.findMany({
      where: {
        invoice: {
          tenancy: {
            unit: {
              property: {
                ownerId
              }
            }
          }
        }
      },
      include: {
        invoice: {
          select: {
            id: true,
            dueDate: true,
            tenancy: {
              select: {
                unit: {
                  select: {
                    name: true,
                    property: {
                      select: { name: true, locality: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/security-deposits", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const deposits = await prisma.securityDeposit.findMany({
      where: {
        tenancy: {
          unit: {
            property: {
              ownerId
            }
          }
        }
      },
      include: {
        tenancy: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: true
              }
            }
          }
        }
      }
    });
    const rows = deposits.map((d) => {
      const totalDeductions = d.paintingDeduction + d.cleaningDeduction + d.otherDeduction;
      const balance = d.initialAmount - totalDeductions;
      return {
        tenancyId: d.tenancyId,
        tenantName: d.tenancy.tenant.name || d.tenancy.tenant.email,
        unitName: d.tenancy.unit.name,
        propertyName: d.tenancy.unit.property.name,
        initialAmount: d.initialAmount,
        paintingDeduction: d.paintingDeduction,
        cleaningDeduction: d.cleaningDeduction,
        otherDeduction: d.otherDeduction,
        status: d.status,
        balance
      };
    });
    res.json({ deposits: rows });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/security-deposits/:tenancyId/deductions", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenancyId = req.params.tenancyId;
    const { paintingDeduction = 0, cleaningDeduction = 0, otherDeduction = 0 } = req.body as {
      paintingDeduction?: number;
      cleaningDeduction?: number;
      otherDeduction?: number;
    };
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        id: tenancyId,
        unit: {
          property: {
            ownerId
          }
        }
      }
    });
    if (!tenancy) {
      return res.status(404).json({ error: { message: "Tenancy not found" } });
    }
    const deposit = await prisma.securityDeposit.upsert({
      where: { tenancyId },
      create: {
        tenancyId,
        initialAmount: 10 * 10000, 
        paintingDeduction,
        cleaningDeduction,
        otherDeduction
      },
      update: {
        paintingDeduction,
        cleaningDeduction,
        otherDeduction
      }
    });
    res.json({ deposit });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/security-deposits/:tenancyId/verify", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenancyId = req.params.tenancyId;
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        id: tenancyId,
        unit: { property: { ownerId } }
      }
    });
    if (!tenancy) {
      return res.status(404).json({ error: { message: "Tenancy not found" } });
    }
    const updated = await prisma.securityDeposit.update({
      where: { tenancyId },
      data: { status: "VERIFIED" }
    });
    res.json({ deposit: updated });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/tenants/create", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const { email, password, name } = req.body as {
      email: string;
      password: string;
      name?: string;
    };
    if (!email || !password) {
      return res.status(400).json({ error: { message: "email and password are required" } });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: { message: "Email already in use" } });
    }
    const SALT_ROUNDS = 10;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const tenant = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "TENANT",
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    res.status(201).json({
      message: "Tenant account created successfully",
      tenant
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/tenants/:tenantId/assign", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const { unitId, startDate } = req.body as {
      unitId: string;
      startDate?: string;
    };
    if (!unitId) {
      return res.status(400).json({ error: { message: "unitId is required" } });
    }
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: {
          ownerId
        }
      },
      include: {
        tenancies: {
          where: { endDate: null }
        }
      }
    });
    if (!unit) {
      return res.status(404).json({ error: { message: "Unit not found or doesn't belong to you" } });
    }
    if (unit.tenancies.length > 0) {
      return res.status(400).json({ error: { message: "Unit is already occupied" } });
    }
    const tenant = await prisma.user.findFirst({
      where: { id: tenantId, role: "TENANT" }
    });
    if (!tenant) {
      return res.status(404).json({ error: { message: "Tenant not found" } });
    }
    const tenancy = await prisma.tenancy.create({
      data: {
        tenantId,
        unitId,
        startDate: startDate ? new Date(startDate) : new Date()
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true
          }
        }
      }
    });
    await prisma.unit.update({
      where: { id: unitId },
      data: { status: "OCCUPIED" }
    });
    res.status(201).json({
      message: "Tenant assigned to unit successfully",
      tenancy
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/maintenance-tickets", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tickets = await prisma.maintenanceTicket.findMany({
      where: {
        OR: [
          {
            tenant: {
              tenancies: {
                some: {
                  unit: {
                    property: {
                      ownerId
                    }
                  }
                }
              }
            }
          },
          {
            unit: {
              property: {
                ownerId
              }
            }
          }
        ]
      },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                locality: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ tickets });
  } catch (err) {
    next(err);
  }
});
ownerRouter.patch("/maintenance-tickets/:ticketId", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const ticketId = req.params.ticketId;
    const { status } = req.body as { status: string };
    const ticket = await prisma.maintenanceTicket.findFirst({
      where: {
        id: ticketId,
        OR: [
          {
            tenant: {
              tenancies: {
                some: {
                  unit: {
                    property: {
                      ownerId
                    }
                  }
                }
              }
            }
          },
          {
            unit: {
              property: {
                ownerId
              }
            }
          }
        ]
      }
    });
    if (!ticket) {
      return res.status(404).json({ error: { message: "Ticket not found or doesn't belong to your properties" } });
    }
    const updated = await prisma.maintenanceTicket.update({
      where: { id: ticketId },
      data: { status }
    });
    res.json({ ticket: updated });
  } catch (err) {
    next(err);
  }
});
ownerRouter.patch("/tenants/:tenantId/password", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: { message: "Password must be at least 6 characters" } });
    }
    const tenant = await prisma.user.findFirst({
      where: { id: tenantId, role: "TENANT" }
    });
    if (!tenant) {
      return res.status(404).json({ error: { message: "Tenant not found" } });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await prisma.user.update({
      where: { id: tenantId },
      data: { passwordHash }
    });
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/tenants/:tenantId/profile", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const tenant = await prisma.user.findFirst({
      where: { id: tenantId, role: "TENANT" }
    });
    if (!tenant) {
      return res.status(404).json({ error: { message: "Tenant not found" } });
    }
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        unit: {
          property: {
            ownerId
          }
        }
      },
      include: {
        unit: {
          include: {
            property: true,
            occupants: true
          }
        },
        billingConfig: true
      }
    });
    if (!tenancy) {
      return res.json({
        tenantId: tenant.id,
        tenantName: tenant.name || tenant.email,
        tenantEmail: tenant.email,
        tenancyId: null,
        unitId: null,
        unitName: null,
        propertyId: null,
        propertyName: null,
        locality: null,
        rentAmount: null,
        deposit: null,
        status: "UNASSIGNED" as const,
        startDate: null,
        endDate: null,
        occupants: [],
        billingConfig: null
      });
    }
    res.json({
      tenantId: tenant.id,
      tenantName: tenant.name || tenant.email,
      tenantEmail: tenant.email,
      tenantPhone: tenant.phone,
      tenancyId: tenancy.id,
      unitId: tenancy.unit.id,
      unitName: tenancy.unit.name,
      propertyId: tenancy.unit.property.id,
      propertyName: tenancy.unit.property.name,
      locality: tenancy.unit.property.locality,
      rentAmount: tenancy.unit.rentAmount,
      deposit: tenancy.unit.deposit,
      status: tenancy.noticeStart ? "NOTICE_PERIOD" : "ACTIVE",
      startDate: tenancy.startDate,
      endDate: tenancy.endDate,
      occupants: tenancy.unit.occupants.map((o) => ({
        id: o.id,
        name: o.name,
        age: o.age,
        relation: o.relation,
        phoneNumber: o.phoneNumber,
        aadharId: o.aadharId,
        photoUrl: o.photoUrl
      })),
      billingConfig: tenancy.billingConfig
        ? {
          rentDueDay: tenancy.billingConfig.rentDueDay,
          billDueDay: tenancy.billingConfig.billDueDay
        }
        : null
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/tenants/:tenantId/billing-config", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const { rentDueDay, billDueDay } = req.body as {
      rentDueDay: number;
      billDueDay: number;
    };
    if (!rentDueDay || !billDueDay) {
      return res.status(400).json({ error: { message: "rentDueDay and billDueDay are required" } });
    }
    if (rentDueDay < 1 || rentDueDay > 31 || billDueDay < 1 || billDueDay > 31) {
      return res.status(400).json({ error: { message: "Due days must be between 1 and 31" } });
    }
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        unit: {
          property: {
            ownerId
          }
        }
      }
    });
    if (!tenancy) {
      return res.status(404).json({ error: { message: "Tenant not assigned to any of your units" } });
    }
    const billingConfig = await prisma.billingConfig.upsert({
      where: { tenancyId: tenancy.id },
      create: {
        tenancyId: tenancy.id,
        rentDueDay,
        billDueDay
      },
      update: {
        rentDueDay,
        billDueDay
      }
    });
    res.json({
      message: "Billing configuration updated successfully",
      billingConfig
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/tenants/:tenantId/generate-rent", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const tenancy = await prisma.tenancy.findFirst({
      where: {
        tenantId,
        unit: {
          property: {
            ownerId
          }
        },
        endDate: null
      },
      include: {
        unit: true,
        billingConfig: true
      }
    });
    if (!tenancy) {
      return res.status(404).json({ error: { message: "Active tenancy not found' or doesn't belong to you" } });
    }
    const now = new Date();
    const rentDueDay = tenancy.billingConfig?.rentDueDay || 5;
    const dueDate = new Date(now.getFullYear(), now.getMonth(), rentDueDay);
    const rentAmount = tenancy.unit.rentAmount;
    const invoice = await prisma.invoice.create({
      data: {
        tenancyId: tenancy.id,
        dueDate: dueDate,
        status: "PENDING",
        totalAmount: rentAmount,
        items: {
          create: [
            {
              label: `Monthly Rent - ${now.toLocaleString("default", { month: "long", year: "numeric" })}`,
              amount: rentAmount,
              category: "RENT"
            }
          ]
        }
      }
    });
    res.json({
      message: "Rent invoice generated successfully",
      invoice
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/analytics/rent-summary", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const { month, year } = req.query as { month?: string; year?: string };
    const targetMonth = month ? parseInt(month) : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    const tenancies = await prisma.tenancy.findMany({
      where: {
        unit: {
          property: { ownerId }
        }
      },
      include: {
        unit: { include: { property: true } },
        invoices: {
          include: { items: true },
          where: {
            dueDate: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        tenant: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    const summary = tenancies.map(t => {
      const rentInvoice = t.invoices.find(inv =>
        inv.items?.some(item => item.category === "RENT") || inv.totalAmount === t.unit.rentAmount
      );
      return {
        tenantId: t.tenant.id,
        tenantName: t.tenant.name || t.tenant.email,
        propertyName: t.unit.property.name,
        unitName: t.unit.name,
        rentAmount: t.unit.rentAmount,
        status: rentInvoice ? rentInvoice.status : "NOT_GENERATED",
        paidAt: rentInvoice?.paidAt || null,
        invoiceId: rentInvoice?.id || null
      };
    });
    const totalExpected = summary.length;
    const paidCount = summary.filter(s => s.status === "PAID").length;
    const pendingCount = summary.filter(s => s.status === "PENDING" || s.status === "OVERDUE").length;
    res.json({
      month: targetMonth,
      year: targetYear,
      totalExpected,
      paidCount,
      pendingCount,
      tenants: summary
    });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/tenants/:tenantId/payment-history", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const invoices = await prisma.invoice.findMany({
      where: {
        tenancy: {
          tenantId,
          unit: { property: { ownerId } }
        }
      },
      include: {
        items: true,
        paymentRefs: true
      },
      orderBy: { dueDate: "desc" }
    });
    res.json({ invoices });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/notices", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const notices = await prisma.notice.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" }
    });
    res.json({ notices });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post("/notices", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const { title, content, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: { message: "Title and content are required" } });
    }
    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || "NORMAL",
        ownerId
      }
    });
    res.status(201).json({ notice });
  } catch (err) {
    next(err);
  }
});
ownerRouter.delete("/notices/:id", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const noticeId = req.params.id;
    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, ownerId }
    });
    if (!notice) {
      return res.status(404).json({ error: { message: "Notice not found" } });
    }
    await prisma.notice.delete({
      where: { id: noticeId }
    });
    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    next(err);
  }
});
ownerRouter.get("/expenses", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const expenses = await prisma.expense.findMany({
      where: { property: { ownerId } },
      include: { property: true },
      orderBy: { date: "desc" }
    });
    res.json({ expenses });
  } catch (err) { next(err); }
});
ownerRouter.post("/expenses", async (req, res, next) => {
  try {
    const { label, amount, category, propertyId, description, date } = req.body;
    const expense = await prisma.expense.create({
      data: { label, amount, category, propertyId, description, date: date ? new Date(date) : undefined }
    });
    res.status(201).json({ expense });
  } catch (err) { next(err); }
});
ownerRouter.get("/vendors", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const vendors = await prisma.vendor.findMany({ where: { ownerId } });
    res.json({ vendors });
  } catch (err) { next(err); }
});
ownerRouter.post("/vendors", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const vendor = await prisma.vendor.create({
      data: { ...req.body, ownerId }
    });
    res.status(201).json({ vendor });
  } catch (err) { next(err); }
});
ownerRouter.get("/assets", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const assets = await prisma.asset.findMany({
      where: { unit: { property: { ownerId } } },
      include: { unit: { include: { property: true } } }
    });
    res.json({ assets });
  } catch (err) { next(err); }
});
ownerRouter.post("/assets", async (req, res, next) => {
  try {
    const asset = await prisma.asset.create({ data: { ...req.body } });
    res.status(201).json({ asset });
  } catch (err) { next(err); }
});
ownerRouter.post("/automation/generate-monthly-invoices", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenancies = await prisma.tenancy.findMany({
      where: { unit: { property: { ownerId } }, endDate: null },
      include: { unit: true, billingConfig: true }
    });
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let createdCount = 0;
    for (const tenancy of tenancies) {
      const existing = await prisma.invoice.findFirst({
        where: {
          tenancyId: tenancy.id,
          dueDate: {
            gte: new Date(currentYear, currentMonth, 1),
            lte: new Date(currentYear, currentMonth, 31)
          }
        }
      });
      if (!existing) {
        const dueDate = new Date(currentYear, currentMonth, tenancy.billingConfig?.rentDueDay || 5);
        await prisma.invoice.create({
          data: {
            tenancyId: tenancy.id,
            totalAmount: tenancy.unit.rentAmount,
            dueDate,
            status: "PENDING",
            items: {
              create: {
                label: "Monthly Rent",
                amount: tenancy.unit.rentAmount,
                category: "RENT"
              }
            }
          }
        });
        createdCount++;
      }
    }
    res.json({ message: `Successfully generated ${createdCount} invoices.` });
  } catch (err) { next(err); }
});
ownerRouter.post("/automation/send-reminders", async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        status: "PENDING",
        tenancy: { unit: { property: { ownerId } } }
      },
      include: { tenancy: { include: { tenant: true } } }
    });
    for (const inv of pendingInvoices) {
      const tenant = inv.tenancy.tenant as any;
      console.log(`[Automation] Processing reminder for ${tenant.name} (${tenant.email}). Phone: ${tenant.phone}`);
      const messageText = `Dear ${tenant.name}, this is a reminder for your rent of ₹${inv.totalAmount} due on ${inv.dueDate.toLocaleDateString()}. Please pay via the BLR Rental portal.`;
      await prisma.communicationLog.create({
        data: {
          invoiceId: inv.id,
          channel: tenant.phone ? "WHATSAPP_SMS" : "EMAIL_MOCK",
          type: "REMINDER",
          message: messageText
        }
      });
      if (tenant.phone) {
        await NotificationService.sendReminders(
          tenant.name || 'Tenant',
          tenant.phone,
          inv.totalAmount,
          inv.dueDate.toLocaleDateString()
        );
      }
    }
    res.json({ message: `Sent ${pendingInvoices.length} reminders.` });
  } catch (err) { next(err); }
});
ownerRouter.get('/tenants/:tenantId/lease', async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const tenantId = req.params.tenantId;
    const tenancy = await prisma.tenancy.findFirst({
      where: { tenantId, unit: { property: { ownerId } }, endDate: null },
      include: { tenant: true, unit: { include: { property: true } } }
    });
    if (!tenancy) {
      return res.status(404).json({ error: { message: 'Active tenancy not found' } });
    }
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Lease_Agreement.pdf');
    doc.pipe(res);
    doc.fontSize(25).text('RESIDENTIAL LEASE AGREEMENT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('This agreement is made between the Owner and the Tenant.');
    doc.moveDown();
    doc.text('PROPERTY: ' + tenancy.unit.property.name);
    doc.text('TENANT: ' + tenancy.tenant.name);
    doc.text('RENT: INR ' + tenancy.unit.rentAmount);
    doc.moveDown(5);
    doc.text('__________________________ Signature');
    doc.end();
  } catch (err) { next(err); }
});
ownerRouter.get('/pending-cash-payments', async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const pendingPayments = await prisma.invoice.findMany({
      where: {
        cashApprovalPending: true,
        paymentMethod: 'CASH',
        tenancy: {
          unit: {
            property: {
              ownerId
            }
          }
        }
      },
      include: {
        tenancy: {
          include: {
            tenant: true,
            unit: {
              include: {
                property: true
              }
            }
          }
        },
        paymentRefs: {
          where: {
            provider: 'CASH'
          }
        }
      },
      orderBy: {
        dueDate: 'desc'
      }
    });
    const formatted = pendingPayments.map(inv => ({
      invoiceId: inv.id,
      amount: inv.totalAmount,
      dueDate: inv.dueDate,
      tenantName: inv.tenancy.tenant.name,
      tenantEmail: inv.tenancy.tenant.email,
      propertyName: inv.tenancy.unit.property.name,
      unitName: inv.tenancy.unit.name,
      paymentRef: inv.paymentRefs[0]?.providerRef
    }));
    res.json({ pendingPayments: formatted });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post('/invoices/:invoiceId/approve-cash', async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const invoiceId = req.params.invoiceId;
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenancy: {
          unit: {
            property: {
              ownerId
            }
          }
        }
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: { message: 'Invoice not found' } });
    }
    if (!invoice.cashApprovalPending) {
      return res.status(400).json({ error: { message: 'No pending cash payment for this invoice' } });
    }
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        cashApprovalPending: false
      }
    });
    await prisma.paymentReference.updateMany({
      where: {
        invoiceId,
        provider: 'CASH'
      },
      data: {
        status: 'APPROVED'
      }
    });
    res.json({ message: 'Cash payment approved successfully' });
  } catch (err) {
    next(err);
  }
});
ownerRouter.post('/invoices/:invoiceId/reject-cash', async (req, res, next) => {
  try {
    const ownerId = req.user!.id;
    const invoiceId = req.params.invoiceId;
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenancy: {
          unit: {
            property: {
              ownerId
            }
          }
        }
      }
    });
    if (!invoice) {
      return res.status(404).json({ error: { message: 'Invoice not found' } });
    }
    if (!invoice.cashApprovalPending) {
      return res.status(400).json({ error: { message: 'No pending cash payment for this invoice' } });
    }
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'PENDING',
        paymentMethod: null,
        cashApprovalPending: false
      }
    });
    await prisma.paymentReference.updateMany({
      where: {
        invoiceId,
        provider: 'CASH'
      },
      data: {
        status: 'REJECTED'
      }
    });
    res.json({ message: 'Cash payment rejected' });
  } catch (err) {
    next(err);
  }
});