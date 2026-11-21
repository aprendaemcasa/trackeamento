import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { Sale, Lead, AdSpend, Product } from "@prisma/client";

const mem = globalThis as unknown as { sales?: Sale[]; clicks?: number; leads?: Lead[]; spends?: AdSpend[]; products?: Product[] };
mem.sales ??= []; mem.clicks ??= 0; mem.leads ??= []; mem.spends ??= []; mem.products ??= [];
const persistent = () => Boolean(process.env.DATABASE_URL);

export async function getSales(): Promise<Sale[]> { return persistent() ? db.sale.findMany({ orderBy: { createdAt: "desc" }, take: 500 }) : mem.sales!; }
export async function getLeads(): Promise<Lead[]> { return persistent() ? db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 500 }) : mem.leads!; }
export async function getClicks() { return persistent() ? db.trackingEvent.count({ where: { type: "PAGE_VIEW" } }) : mem.clicks!; }
export async function getAdSpend(): Promise<AdSpend[]> { return persistent() ? db.adSpend.findMany({ orderBy: { spendDate: "desc" }, take: 500 }) : mem.spends!; }
export async function getProducts(): Promise<Product[]> { return persistent() ? db.product.findMany({ orderBy: { createdAt: "desc" } }) : mem.products!; }

export async function addClick(d: { eventId: string; url?: string; referrer?: string; source?: string; medium?: string; campaign?: string; content?: string; visitorId?: string; adId?: string; fbclid?: string }) {
  if (!persistent()) { mem.clicks!++; return; }
  await db.trackingEvent.upsert({ where: { eventId: d.eventId }, update: {}, create: { ...d, type: "PAGE_VIEW" } });
}
type LeadInput = { trackingId: string; phone?: string; name?: string; status?: string; amount?: number; paymentReference?: string; source?: string; medium?: string; campaign?: string; content?: string; adId?: string; fbclid?: string };
export async function createLead(d: LeadInput) {
  if (!persistent()) {
    const old = mem.leads!.find(x => x.trackingId === d.trackingId); if (old) return old;
    const now = new Date();
    const lead = { id: randomUUID(), trackingId: d.trackingId, phone: d.phone ?? null, name: d.name ?? null, status: d.status ?? "NEW", amount: d.amount ?? null, paymentReference: d.paymentReference ?? null, source: d.source ?? null, medium: d.medium ?? null, campaign: d.campaign ?? null, content: d.content ?? null, adId: d.adId ?? null, fbclid: d.fbclid ?? null, createdAt: now, updatedAt: now } as Lead;
    mem.leads!.unshift(lead); return lead;
  }
  return db.lead.upsert({ where: { trackingId: d.trackingId }, update: {}, create: { ...d, status: d.status ?? "NEW" } });
}
export async function updateLead(trackingId: string, d: Partial<LeadInput>) {
  if (!persistent()) { const lead = mem.leads!.find(x => x.trackingId === trackingId); if (!lead) return null; Object.assign(lead, d, { updatedAt: new Date() }); return lead; }
  return db.lead.update({ where: { trackingId }, data: d }).catch(() => null);
}
export async function addSale(d: { externalId: string; provider: string; product?: string; amount: number; currency?: string; status: string; email?: string; eventId?: string; source?: string; campaign?: string; adId?: string }) {
  if (!persistent()) {
    const old = mem.sales!.find(x => x.provider === d.provider && x.externalId === d.externalId);
    if (old) { old.status = d.status; old.amount = d.amount; old.updatedAt = new Date(); return { sale: old, duplicate: true }; }
    const now = new Date();
    const sale = { id: randomUUID(), externalId: d.externalId, provider: d.provider, product: d.product ?? "Produto", amount: d.amount, currency: d.currency ?? "BRL", status: d.status, email: d.email ?? null, eventId: d.eventId ?? null, source: d.source ?? null, campaign: d.campaign ?? null, adId: d.adId ?? null, createdAt: now, updatedAt: now } as Sale;
    mem.sales!.unshift(sale); return { sale, duplicate: false };
  }
  const old = await db.sale.findUnique({ where: { provider_externalId: { provider: d.provider, externalId: d.externalId } } });
  if (old) { const sale = await db.sale.update({ where: { id: old.id }, data: { status: d.status, amount: d.amount } }); return { sale, duplicate: true }; }
  const sale = await db.sale.create({ data: { ...d, product: d.product ?? "Produto", currency: d.currency ?? "BRL" } }); return { sale, duplicate: false };
}
export async function createAdSpend(d: { platform: string; campaign?: string; amount: number; spendDate: Date; notes?: string }) {
  if (!persistent()) { const row = { id: randomUUID(), ...d, campaign: d.campaign ?? null, notes: d.notes ?? null, createdAt: new Date() } as AdSpend; mem.spends!.unshift(row); return row; }
  return db.adSpend.create({ data: d });
}
export async function createProduct(d: { name: string; price?: number }) {
  if (!persistent()) { const row = { id: randomUUID(), name: d.name, price: d.price ?? null, active: true, createdAt: new Date(), updatedAt: new Date() } as Product; mem.products!.unshift(row); return row; }
  return db.product.create({ data: d });
}
