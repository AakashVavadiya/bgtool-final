import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Mail, MessageSquare, Send, CheckCircle2, Clock, MapPin } from "lucide-react";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Enterprise Support | bg" },
      {
        name: "description",
        content:
          "Get in touch with the bg team. Support for high-volume API integration, custom background removal models, billing inquiries, and feedback.",
      },
      { property: "og:title", content: "Contact Us — bg" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Support");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please complete all required fields.");
      return;
    }
    
    // Save to server persistence
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
    } catch (err) {
      console.warn("Failed to post to /api/contact directly:", err);
    }

    // Save to Admin Support Desk Inbox
    import("@/admin/lib/admin-store").then(({ AdminStore }) => {
      AdminStore.addContactInquiry(name, email, subject, message);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(REALTIME_EVENT_NAME, {
            detail: { type: "contact_submission", name, email, subject },
          })
        );
      }
    });

    setSubmitted(true);
    toast.success("Message sent! Our support team will reply within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <SiteHeader />

        <main className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-6">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <span className="text-foreground">Contact Us</span>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 items-start">
            {/* Left Contact Info */}
            <div>
              <h1 className="font-display text-4xl font-extrabold sm:text-5xl md:text-6xl tracking-tight">
                Get in Touch with Team bg<span className="text-accent">.</span>
              </h1>
              <p className="mt-4 text-base md:text-lg font-medium text-muted-foreground leading-relaxed">
                Have questions about our AI models, custom enterprise API rates, or need assistance with your credits? We’re here to help.
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-bold">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Direct Email Support</h3>
                    <p className="text-sm font-semibold text-foreground mt-0.5">support@bgtool.ai</p>
                    <p className="text-xs text-muted-foreground mt-1">For general help, billing & account inquiries.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 font-bold">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Enterprise & High Volume API</h3>
                    <p className="text-sm font-semibold text-foreground mt-0.5">enterprise@bgtool.ai</p>
                    <p className="text-xs text-muted-foreground mt-1">Dedicated GPU nodes, custom SLAs & batch webhooks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">Response Guarantee</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Average reply time: <strong>&lt; 2 Hours</strong> (Mon – Sat)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="rounded-3xl border-2 border-border bg-card p-8 md:p-10 shadow-xl">
              {submitted ? (
                <div className="py-12 text-center rise-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 shadow-md">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold">Thank You!</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Your message has been sent directly to our support engineering team. We'll be in touch shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-6 rounded-full border border-border bg-background px-6 py-3 text-sm font-bold transition-all hover:bg-foreground hover:text-background"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-2xl font-bold text-foreground">Send Us a Message</h2>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Work Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Topic</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
                    >
                      <option value="General Support">General Support & Question</option>
                      <option value="Billing & Credits">Billing & Credits Inquiry</option>
                      <option value="Enterprise API">Enterprise API & High-Volume Batch</option>
                      <option value="Bug Report">Model Accuracy or Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your request or question…"
                      className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:border-foreground focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-8 py-4 text-base font-extrabold text-background shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <Send className="h-5 w-5" /> Send Message →
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
