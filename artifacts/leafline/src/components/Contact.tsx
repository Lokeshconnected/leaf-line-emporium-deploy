import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone, CheckCircle } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = JSON.parse(window.localStorage.getItem("leafline-contact-messages") ?? "[]") as Array<{ name: string; email: string; message: string; createdAt: string }>;
    existing.push({ ...form, createdAt: new Date().toISOString() });
    window.localStorage.setItem("leafline-contact-messages", JSON.stringify(existing));
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border text-xs font-semibold text-primary uppercase tracking-wider mb-6">
              ✉️ Get In Touch
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-tight tracking-tight mb-6">
              We'd Love to<br />
              <span className="text-primary">Hear From You</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Have a question about a plant? Need advice on which variety is right for your space? Our team of botanists is here to help.
            </p>

            {/* Contact info */}
            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email us", value: "hello@leafline.co", href: "mailto:hello@leafline.co" },
                { icon: Phone, label: "Call us", value: "+1 (555) 234-5678", href: "tel:+15552345678" },
                { icon: MapPin, label: "Visit us", value: "124 Garden District, NY 10001", href: "https://maps.google.com/?q=124+Garden+District+NY+10001" },
              ].map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-card-border hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <item.icon className="w-4.5 h-4.5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                    <div className="text-sm font-semibold text-foreground">{item.value}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bg-card border border-card-border rounded-3xl p-8 lg:p-10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">
                    Your message is saved locally for the demo, and the contact links above now work too.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-black text-foreground mb-6">Send us a message</h3>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about the plant you're looking for..."
                      className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
