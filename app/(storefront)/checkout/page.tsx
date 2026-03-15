import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/storefront/CheckoutClient";

export const metadata = {
  title: "Checkout",
};

export default async function CheckoutPage() {
  const [shippingMethods, paymentMethods] = await Promise.all([
    prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="pt-20 lg:pt-24 min-h-screen bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Checkout</h1>
        <CheckoutClient
          shippingMethods={shippingMethods.map((s) => ({
            ...s,
            price: Number(s.price),
          }))}
          paymentMethods={paymentMethods.map((p) => ({
            ...p,
            extraCharge: Number(p.extraCharge),
          }))}
        />
      </div>
    </div>
  );
}
