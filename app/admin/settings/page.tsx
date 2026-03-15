import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const metadata = { title: "Settings — Admin" };

export default async function SettingsPage() {
  const [shippingMethods, paymentMethods, settings] = await Promise.all([
    prisma.shippingMethod.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.paymentMethod.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.findMany(),
  ]);

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage site settings, shipping and payment methods</p>
      </div>
      <SettingsClient
        shippingMethods={shippingMethods.map((s) => ({
          ...s,
          price: Number(s.price),
        }))}
        paymentMethods={paymentMethods.map((p) => ({
          ...p,
          extraCharge: Number(p.extraCharge),
        }))}
        settings={settingsMap}
      />
    </div>
  );
}
