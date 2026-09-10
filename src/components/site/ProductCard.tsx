import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { FORMATS, SIZES } from "@/lib/tona";
import { PRODUCT_IMAGES } from "@/lib/product-images";
import { submitOrder, type PublicProduct } from "@/lib/public-api";

export function ProductCard({ product }: { product: PublicProduct }) {
  const sizes = unique(product.variants.map((variant) => variant.size));
  const formats = unique(product.variants.map((variant) => variant.grind));
  const [size, setSize] = useState<string>(sizes[0] ?? SIZES[0]!);
  const [format, setFormat] = useState<string>(formats[0] ?? FORMATS[0]!);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const fallbackImage =
    PRODUCT_IMAGES[product.slug as keyof typeof PRODUCT_IMAGES] ??
    PRODUCT_IMAGES.yirgacheffe;

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const result = await submitOrder({
        data: {
          productId: product.id,
          customerName: String(form.get("name")),
          phone: String(form.get("phone")),
          email: nullable(form.get("email")),
          size,
          grind: format,
          quantity: qty,
          notes: nullable(form.get("notes")),
        },
      });
      toast.success(
        `Order ${result.orderNumber} received. Tona will contact you.`,
      );
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to place the order.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="group flex flex-col overflow-hidden border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={
            imageFailed ? fallbackImage : (product.imageUrl ?? fallbackImage)
          }
          alt={`${product.name} black coffee with roasted coffee beans`}
          width={720}
          height={360}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
        <span className="label-mono absolute left-5 top-5 border-l-4 border-primary bg-black/80 px-3 py-1.5 text-white">
          {product.process}
        </span>
        <span className="absolute bottom-5 left-6 font-display text-3xl font-bold text-primary-foreground">
          {product.name}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="label-mono text-muted-foreground">{product.region}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.tastingNotes.map((n) => (
            <span
              key={n}
              className="rounded-sm border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground/80"
            >
              {n}
            </span>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {product.altitude
            ? `Altitude ${product.altitude}`
            : "Ethiopian origin"}
        </p>

        <div className="mt-6 space-y-4">
          <Choice
            label="Size"
            options={sizes.length ? sizes : [...SIZES]}
            value={size}
            onChange={setSize}
          />
          <Choice
            label="Grind"
            options={formats.length ? formats : [...FORMATS]}
            value={format}
            onChange={setFormat}
          />
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <button
              type="button"
              aria-label={`Decrease ${product.name} quantity`}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              aria-label={`Increase ${product.name} quantity`}
              onClick={() => setQty((q) => q + 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="brand-button inline-flex flex-1 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <ShoppingBag className="h-4 w-4" />
            Order now
          </button>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-foreground/65 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[110] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border bg-card p-6 shadow-2xl sm:p-8">
            <Dialog.Title className="font-display text-3xl font-bold text-teal">
              Order {product.name}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {qty} × {size}, {format}. Your order will appear directly in
              Tona's dashboard.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close order form"
                className="absolute right-5 top-5 rounded-full bg-secondary p-2"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
            <form onSubmit={placeOrder} className="mt-6 grid gap-4">
              <OrderField
                name="name"
                label="Full name"
                autoComplete="name"
                required
              />
              <OrderField
                name="phone"
                label="Phone / WhatsApp"
                type="tel"
                autoComplete="tel"
                required
              />
              <OrderField
                name="email"
                label="Email (optional)"
                type="email"
                autoComplete="email"
              />
              <label className="text-sm font-semibold text-teal">
                Note (optional)
                <textarea
                  name="notes"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border bg-background px-4 py-3 font-normal outline-none focus:border-primary"
                />
              </label>
              <button
                disabled={busy}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <ShoppingBag className="h-4 w-4" />
                {busy ? "Submitting…" : "Place order"}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </article>
  );
}

function OrderField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="text-sm font-semibold text-teal">
      {label}
      <input
        {...props}
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 font-normal outline-none focus:border-primary"
      />
    </label>
  );
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function nullable(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="label-mono mb-2 text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              value === o
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground/70 hover:border-primary/50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
