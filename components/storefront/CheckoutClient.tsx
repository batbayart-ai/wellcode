"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { PACKETA_WIDGET_URL, type PacketaPoint } from "@/lib/packeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, CreditCard, Building2, Truck, CheckCircle2 } from "lucide-react";

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  carrier: string | null;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  type: string;
  extraCharge: number;
  instructions: string | null;
}

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(9, "Phone number required"),
  street: z.string().min(3, "Street address required"),
  city: z.string().min(2, "City required"),
  zip: z.string().min(3, "ZIP code required"),
  country: z.string().default("CZ"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const paymentIcons: Record<string, React.ReactNode> = {
  STRIPE: <CreditCard className="size-4" />,
  BANK_TRANSFER: <Building2 className="size-4" />,
  CASH_ON_DELIVERY: <Truck className="size-4" />,
};

export function CheckoutClient({
  shippingMethods,
  paymentMethods,
}: {
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
}) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(
    shippingMethods[0] ?? null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    paymentMethods[0] ?? null
  );
  const [packetaPoint, setPacketaPoint] = useState<PacketaPoint | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packetaLoaded, setPacketaLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

  const cartSubtotal = subtotal();
  const shippingCost = selectedShipping?.price ?? 0;
  const paymentExtra = selectedPayment?.extraCharge ?? 0;
  const total = cartSubtotal + shippingCost + paymentExtra;

  const isPacketa = selectedShipping?.carrier?.toLowerCase() === "packeta";

  const openPacketaWidget = () => {
    if (!packetaLoaded || !window.Packeta) {
      alert("Packeta widget is loading, please try again.");
      return;
    }
    window.Packeta.Widget.pick(
      process.env.NEXT_PUBLIC_PACKETA_API_KEY || "",
      (point) => {
        if (point) setPacketaPoint(point);
      },
      { country: "cz", language: "cs" }
    );
  };

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) return;
    if (isPacketa && !packetaPoint) {
      setError("Please select a Packeta pickup point.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        customer: { name: data.name, email: data.email, phone: data.phone },
        shippingAddress: {
          street: isPacketa && packetaPoint ? packetaPoint.street : data.street,
          city: isPacketa && packetaPoint ? packetaPoint.city : data.city,
          zip: isPacketa && packetaPoint ? packetaPoint.zip : data.zip,
          country: data.country,
        },
        shippingMethodId: selectedShipping?.id,
        paymentMethodId: selectedPayment?.id,
        packetaPointId: packetaPoint?.id,
        packetaPointName: packetaPoint?.name,
        packetaPointAddress: packetaPoint?.nameStreet,
        notes: data.notes,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          imageUrl: i.imageUrl,
        })),
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Checkout failed");

      // If Stripe, redirect to Stripe Checkout
      if (json.stripeUrl) {
        clearCart();
        window.location.href = json.stripeUrl;
        return;
      }

      // Manual payment → order confirmation
      clearCart();
      router.push(`/order-confirmation/${json.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-heading text-2xl text-foreground/50 mb-4">Your cart is empty</p>
        <a href="/products" className="text-brand hover:underline">Continue Shopping</a>
      </div>
    );
  }

  return (
    <>
      <Script
        src={PACKETA_WIDGET_URL}
        onLoad={() => setPacketaLoaded(true)}
        strategy="afterInteractive"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading text-xl font-semibold mb-5">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register("name")} error={errors.name?.message} placeholder="Jana Nováková" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email")} error={errors.email?.message} placeholder="jana@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" {...register("phone")} error={errors.phone?.message} placeholder="+420 777 888 999" />
                </div>
              </div>
            </div>

            {/* Shipping method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading text-xl font-semibold mb-5">Shipping Method</h2>
              <div className="space-y-3">
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedShipping?.id === method.id
                        ? "border-brand bg-brand-light"
                        : "border-border hover:border-border/60 hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={method.id}
                      checked={selectedShipping?.id === method.id}
                      onChange={() => {
                        setSelectedShipping(method);
                        setPacketaPoint(null);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedShipping?.id === method.id
                          ? "border-brand"
                          : "border-border"
                      }`}
                    >
                      {selectedShipping?.id === method.id && (
                        <div className="w-2 h-2 rounded-full bg-brand" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{method.name}</p>
                      {method.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {method.description}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-sm">
                      {method.price === 0 ? "Free" : formatPrice(method.price, "CZK")}
                    </span>
                  </label>
                ))}
              </div>

              {/* Packeta point selector */}
              {isPacketa && (
                <div className="mt-4 p-4 bg-secondary rounded-xl">
                  {packetaPoint ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{packetaPoint.name}</p>
                        <p className="text-xs text-muted-foreground">{packetaPoint.nameStreet}</p>
                        <button
                          type="button"
                          onClick={openPacketaWidget}
                          className="text-xs text-brand hover:underline mt-1"
                        >
                          Change pickup point
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={openPacketaWidget}
                      className="flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                    >
                      <MapPin className="size-4" />
                      Select Packeta pickup point
                    </button>
                  )}
                </div>
              )}

              {/* Delivery address (non-Packeta) */}
              {!isPacketa && (
                <div className="mt-5 space-y-4">
                  <h3 className="font-medium text-sm text-foreground/70">Delivery Address</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="street">Street & House Number *</Label>
                    <Input id="street" {...register("street")} error={errors.street?.message} placeholder="Václavské náměstí 1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" {...register("city")} error={errors.city?.message} placeholder="Praha" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input id="zip" {...register("zip")} error={errors.zip?.message} placeholder="110 00" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading text-xl font-semibold mb-5">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPayment?.id === method.id
                        ? "border-brand bg-brand-light"
                        : "border-border hover:border-border/60 hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment?.id === method.id}
                      onChange={() => setSelectedPayment(method)}
                      className="sr-only"
                    />
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedPayment?.id === method.id ? "border-brand" : "border-border"
                      }`}
                    >
                      {selectedPayment?.id === method.id && (
                        <div className="w-2 h-2 rounded-full bg-brand" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {paymentIcons[method.type] ?? <CreditCard className="size-4" />}
                        </span>
                        <p className="font-medium text-sm">{method.name}</p>
                        {method.extraCharge > 0 && (
                          <span className="text-xs text-muted-foreground">
                            (+{formatPrice(method.extraCharge, "CZK")})
                          </span>
                        )}
                      </div>
                      {method.description && (
                        <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading text-xl font-semibold mb-5">Order Notes</h2>
              <Textarea
                {...register("notes")}
                placeholder="Special delivery instructions or notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-heading text-xl font-semibold mb-5">Order Summary</h2>

              <ul className="space-y-3 mb-5">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    </div>
                    <p className="text-sm font-semibold flex-shrink-0">
                      {formatPrice(item.price * item.quantity, "CZK")}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartSubtotal, "CZK")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost, "CZK")}
                  </span>
                </div>
                {paymentExtra > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment fee</span>
                    <span>{formatPrice(paymentExtra, "CZK")}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base border-t border-border pt-3 mt-1">
                  <span>Total</span>
                  <span>{formatPrice(total, "CZK")}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-5 text-base font-medium"
                style={{
                  backgroundColor: "var(--brand)",
                  color: "var(--brand-foreground)",
                }}
              >
                {isSubmitting
                  ? "Processing..."
                  : selectedPayment?.type === "STRIPE"
                  ? "Pay with Card"
                  : "Place Order"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Secure checkout · Your data is protected
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
