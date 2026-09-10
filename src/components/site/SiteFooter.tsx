import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";
import { TonaLogo } from "./TonaLogo";
import { WHATSAPP_DISPLAY, waLink } from "@/lib/tona";

export function SiteFooter() {
  return (
    <footer className="leaf-field border-t-8 border-primary bg-teal-deep text-teal-foreground">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <TonaLogo tone="light" size="lg" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-teal-foreground/70">
              An African-led specialty coffee roaster rooted in Ethiopia's
              coffee heartlands. Stay for Tona, stay for the moment.
            </p>
          </div>

          <div>
            <h4 className="label-mono text-teal-foreground/50">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-teal-foreground/80">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About Tona
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary">
                  Our Coffee
                </Link>
              </li>
              <li>
                <Link to="/for-business" className="hover:text-primary">
                  For Business
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-primary">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="label-mono text-teal-foreground/50">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-teal-foreground/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a
                  href={waLink("Hi Tona, I have an enquiry.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href="mailto:hello@tonacoffee.com"
                  className="hover:text-primary"
                >
                  hello@tonacoffee.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-primary" />
                <span>@tonacoffee</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="label-mono text-teal-foreground/50">Order</h4>
            <p className="mt-4 text-sm text-teal-foreground/70">
              Retail bags, wholesale supply and samples are all arranged over
              WhatsApp.
            </p>
            <a
              href={waLink("Hi Tona, I'd like to place an order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-button mt-4 inline-flex bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-teal-foreground/15 pt-6 text-xs text-teal-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} Tona Coffee. Addis Ababa, Ethiopia.
          </span>
          <span className="label-mono">Stay for Tona, Stay for the Moment</span>
        </div>
      </div>
    </footer>
  );
}
