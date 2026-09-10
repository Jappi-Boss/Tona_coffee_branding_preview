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
    <article className="product-card group flex flex-col overflow-hidden border border-white/15 bg-[#061b18] text-[#fffdf8] transition-all">
      <div className="relative h-48 overflow-hidden bg-[#102520]">
        <img
          src={
            imageFailed ? fallbackImage : (product.imageUrl ?? fallbackImage)
          }
          alt={`${product.name} black coffee with roasted coffee beans`}
          width={720}
          height={360}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
          onError={() => setImageFailed(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061b18]/25 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="label-mono text-[#ef4a28]">{product.process}</p>
          <p className="label-mono text-right text-[#fffdf8]/72">
            {product.region}
          </p>
        </div>
        <h3 className="mt-4 font-display text-3xl font-black text-[#fffdf8]">
          {product.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#fffdf8]/82">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.tastingNotes.map((n) => (
            <span
              key={n}
              className="border border-[#e4d4ba] bg-[#e4d4ba] px-3 py-1 text-[.68rem] font-bold uppercase tracking-[.08em] text-[#151411]"
            >
              {n}
            </span>
          ))}
        </div>

        <p className="label-mono mt-4 text-[#fffdf8]/55">
          {product.altitude
            ? `Altitude ${product.altitude}`
            : "Ethiopian origin"}
        </p>

        <div className="mt-6 space-y-4 border-t border-white/15 pt-6">
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
          <div className="flex items-center gap-1 border border-white/25 p-1">
            <button
              type="button"
              aria-label={`Decrease ${product.name} quantity`}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="inline-flex h-8 w-8 items-center justify-center text-[#fffdf8] hover:bg-white/10"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
            <button
              type="button"
              aria-label={`Increase ${product.name} quantity`}
              onClick={() => setQty((q) => q + 1)}
              className="inline-flex h-8 w-8 items-center justify-center text-[#fffdf8] hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="brand-button inline-flex flex-1 items-center justify-center gap-2 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#ffb000] hover:text-[#151411]"
          >
            <ShoppingBag className="h-4 w-4" />
            Order now
          </button>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#090908]/80 backdrop-blur-md data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:animate-in data-[state=open]:fade-in" />
          <Dialog.Content className="order-dialog fixed left-1/2 top-1/2 z-[110] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-[#e4d4ba]/35 bg-[#061b18] p-6 text-[#fffdf8] shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 sm:p-8">
            <Dialog.Title className="font-display text-3xl font-black uppercase leading-none text-[#fffdf8] sm:text-4xl">
              Order {product.name}
            </Dialog.Title>
            <Dialog.Description className="mt-3 max-w-md text-sm leading-relaxed text-[#fffdf8]/65">
              {qty} × {size}, {format}. Your order will appear directly in
              Tona's dashboard.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close order form"
                className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center border border-[#e4d4ba]/35 bg-[#e4d4ba] text-[#151411] transition-colors hover:border-[#ffb000] hover:bg-[#ffb000]"
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
              <label className="text-sm font-semibold text-[#fffdf8]">
                Note (optional)
                <textarea
                  name="notes"
                  rows={3}
                  className="mt-2 w-full resize-none border border-[#e4d4ba]/45 bg-[#fff9ef] px-4 py-3 font-normal text-[#151411] outline-none transition-colors focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000]"
                />
              </label>
              <button
                disabled={busy}
                className="brand-button mt-2 inline-flex items-center justify-center gap-2 bg-[#ef4a28] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#ffb000] hover:text-[#151411] disabled:cursor-not-allowed disabled:opacity-60"
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
    <label className="text-sm font-semibold text-[#fffdf8]">
      {label}
      <input
        {...props}
        className="mt-2 h-12 w-full border border-[#e4d4ba]/45 bg-[#fff9ef] px-4 font-normal text-[#151411] outline-none transition-colors focus:border-[#ffb000] focus:ring-1 focus:ring-[#ffb000]"
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
      <p className="label-mono mb-2 text-[#fffdf8]/55">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              value === o
                ? "border-[#ef4a28] bg-[#ef4a28] text-[#fffdf8]"
                : "border-white/25 text-[#fffdf8]/72 hover:border-[#ffb000] hover:text-[#ffb000]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
