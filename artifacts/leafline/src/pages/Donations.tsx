import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Leaf, Loader2, Download, Gift, Plus, X, CheckCircle, BarChart3, Copy, MapPin, Trophy, Sprout } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/store/authStore";
import { apiFetch, getApiBase } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Plant {
  id: number;
  name: string;
  emoji: string;
  price: number;
  category: string;
}

interface Donation {
  id: number;
  plantName: string;
  donorName: string;
  location: string;
  certificateId: string;
  amount: number;
  createdAt: string;
}

const DEFAULT_LOCATIONS = [
  "School courtyard",
  "Community park",
  "Apartment lobby",
  "Office wellness corner",
  "Hospital garden",
  "Balcony food garden",
];

function normalizeLocation(value: string) {
  return value.trim().toLowerCase();
}

function buildImpactSummary(donations: Donation[], totalAmount: number, uniqueLocations: number) {
  if (donations.length === 0) {
    return "This donation hub turns every plant contribution into a trackable impact record with location, certificate, and donor history.";
  }

  const latestDonation = [...donations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return `I have completed ${donations.length} plant donation${donations.length === 1 ? "" : "s"} across ${uniqueLocations} location${uniqueLocations === 1 ? "" : "s"}, contributing $${totalAmount.toFixed(2)} in living greenery. My latest contribution placed ${latestDonation.plantName} in ${latestDonation.location} with certificate ${latestDonation.certificateId}.`;
}

function buildDonationPreview(plant: Plant | undefined, donorName: string, location: string) {
  if (!plant || !donorName || !location) return null;
  return `${donorName} is sponsoring ${plant.emoji} ${plant.name} for ${location}. This creates a certificate-backed donation entry and adds a visible green impact milestone to the dashboard.`;
}

function buildMilestones(donations: Donation[], totalAmount: number, uniqueLocations: number, plants: Plant[]) {
  const byPlantName = new Map(plants.map((plant) => [plant.name, plant]));
  const milestones: string[] = [];

  if (donations.length >= 1) milestones.push("First root planted");
  if (donations.length >= 3) milestones.push("Canopy builder");
  if (uniqueLocations >= 2) milestones.push("Multi-location giver");
  if (totalAmount >= 150) milestones.push("High-impact supporter");
  if (donations.some((donation) => byPlantName.get(donation.plantName)?.category === "Rare")) milestones.push("Rare plant patron");

  return milestones.slice(0, 4);
}

export default function Donations() {
  const { token, isAuthenticated, user } = useAuthStore();
  const [, navigate] = useLocation();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Donation | null>(null);
  const [form, setForm] = useState({ plantId: "", location: "", donorName: user?.name || "" });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      const [donRes, plantRes] = await Promise.all([
        apiFetch("/donations", {}, token!),
        fetch(`${getApiBase()}/api/plants`),
      ]);
      const donData = await donRes.json();
      const plantData = await plantRes.json();
      if (Array.isArray(donData)) setDonations(donData);
      if (Array.isArray(plantData)) setPlants(plantData);
      setLoading(false);
    };

    fetchData().catch(() => setLoading(false));
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      donorName: current.donorName || user?.name || "",
    }));
  }, [user]);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await apiFetch("/donations", {
        method: "POST",
        body: JSON.stringify({
          plantId: parseInt(form.plantId, 10),
          location: form.location,
          donorName: form.donorName || user?.name,
        }),
      }, token);

      if (!res.ok) throw new Error();

      const donation = await res.json();
      setDonations((prev) => [donation, ...prev]);
      setSuccess(donation);
      setShowForm(false);
      setForm({ plantId: "", location: "", donorName: form.donorName || user?.name || "" });
    } catch {
      toast({
        title: "Donation failed",
        description: "The donation request could not be completed right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadCertificate = (donation: Donation) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const w = 297;
    const h = 210;

    doc.setFillColor(240, 253, 244);
    doc.rect(0, 0, w, h, "F");

    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(3);
    doc.rect(10, 10, w - 20, h - 20, "S");
    doc.setLineWidth(1);
    doc.rect(14, 14, w - 28, h - 28, "S");

    doc.setFontSize(32);
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE OF PLANT DONATION", w / 2, 45, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(74, 74, 74);
    doc.setFont("helvetica", "normal");
    doc.text("This certifies that a plant has been donated in your honor", w / 2, 60, { align: "center" });

    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.5);
    doc.line(60, 68, w - 60, 68);

    doc.setFontSize(20);
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text(`${donation.donorName}`, w / 2, 82, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(74, 74, 74);
    doc.setFont("helvetica", "normal");
    doc.text("has donated a", w / 2, 92, { align: "center" });

    doc.setFontSize(22);
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text(donation.plantName, w / 2, 104, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(74, 74, 74);
    doc.setFont("helvetica", "normal");
    doc.text("to be planted in", w / 2, 114, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text(donation.location, w / 2, 125, { align: "center" });

    doc.line(60, 133, w - 60, 133);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    const date = new Date(donation.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.text(`Date: ${date}`, w / 2, 143, { align: "center" });
    doc.text(`Certificate ID: ${donation.certificateId}`, w / 2, 152, { align: "center" });
    doc.text(`Amount: $${donation.amount.toFixed(2)}`, w / 2, 161, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text("LEAFLINE - Premium Plants & Meaningful Giving", w / 2, 184, { align: "center" });

    doc.save(`leafline-certificate-${donation.certificateId}.pdf`);
  };

  const selectedPlant = plants.find((plant) => plant.id === parseInt(form.plantId, 10));

  const analytics = useMemo(() => {
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const uniqueLocations = new Set(donations.map((donation) => normalizeLocation(donation.location)).filter(Boolean)).size;
    const latestDonation = [...donations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
    const averageDonation = donations.length > 0 ? totalAmount / donations.length : 0;
    const milestones = buildMilestones(donations, totalAmount, uniqueLocations, plants);

    return { totalAmount, uniqueLocations, latestDonation, averageDonation, milestones };
  }, [donations, plants]);

  const locationSuggestions = useMemo(() => {
    const learned = Array.from(new Set(donations.map((donation) => donation.location.trim()).filter(Boolean)));
    return [...learned, ...DEFAULT_LOCATIONS].slice(0, 6);
  }, [donations]);

  const donationPreview = buildDonationPreview(selectedPlant, form.donorName.trim(), form.location.trim());

  const copyImpactSummary = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Impact summary copied",
        description: "You can paste it into your presentation notes or demo script.",
      });
    } catch {
      toast({
        title: "Copy not available",
        description: "Your browser blocked clipboard access for this action.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-7 h-7 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Plant Donations</h1>
                <p className="text-sm text-muted-foreground">A certificate-backed impact space for meaningful, trackable plant giving.</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Donate a Plant
            </button>
          </div>

          <AnimatePresence>
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl flex flex-col gap-3 sm:flex-row sm:items-start"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800 dark:text-green-300">Donation successful</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {success.plantName} has been donated in {success.location}. Certificate ID: <strong>{success.certificateId}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => downloadCertificate(success)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Download Certificate
                  </button>
                  <button onClick={() => copyImpactSummary(buildImpactSummary([success], success.amount, 1))} className="flex items-center gap-1.5 px-3 py-1.5 border border-green-600 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                    Copy Impact Note
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {donations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    icon: <Sprout className="w-5 h-5 text-green-600" />,
                    label: "Plants donated",
                    value: donations.length,
                    note: "Tracked across your account",
                  },
                  {
                    icon: <MapPin className="w-5 h-5 text-green-600" />,
                    label: "Locations reached",
                    value: analytics.uniqueLocations,
                    note: "Where your greenery will live",
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5 text-green-600" />,
                    label: "Total contribution",
                    value: `$${analytics.totalAmount.toFixed(2)}`,
                    note: `Avg. $${analytics.averageDonation.toFixed(2)} per donation`,
                  },
                  {
                    icon: <Trophy className="w-5 h-5 text-green-600" />,
                    label: "Latest gift",
                    value: analytics.latestDonation?.plantName || "None yet",
                    note: analytics.latestDonation ? analytics.latestDonation.location : "Your next impact starts here",
                  },
                ].map((card) => (
                  <div key={card.label} className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {card.icon}
                      <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.note}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <div className="rounded-2xl border border-border bg-background p-5">
                  <p className="text-sm font-semibold text-foreground mb-3">Impact milestones</p>
                  <div className="flex flex-wrap gap-2">
                    {analytics.milestones.length > 0 ? (
                      analytics.milestones.map((milestone) => (
                        <span key={milestone} className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 text-xs font-semibold">
                          {milestone}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Your first donation will unlock the first milestone.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          <AnimatePresence>
            {showForm ? (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <div className="bg-background rounded-2xl shadow-2xl border border-border w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-semibold">Donate a Plant</h2>
                      </div>
                      <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleDonate} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Choose a Plant</label>
                        <select required value={form.plantId} onChange={(e) => setForm((current) => ({ ...current, plantId: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                          <option value="">Select a plant...</option>
                          {plants.map((plant) => (
                            <option key={plant.id} value={plant.id}>{plant.emoji} {plant.name} - ${plant.price.toFixed(2)}</option>
                          ))}
                        </select>
                      </div>

                      {selectedPlant ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 flex items-center gap-3">
                          <span className="text-2xl">{selectedPlant.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-green-800 dark:text-green-300">{selectedPlant.name}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">Donation value: ${selectedPlant.price.toFixed(2)} • {selectedPlant.category}</p>
                          </div>
                        </motion.div>
                      ) : null}

                      <div>
                        <label className="text-sm font-medium mb-1 block">Donor Name</label>
                        <input required value={form.donorName} onChange={(e) => setForm((current) => ({ ...current, donorName: e.target.value }))} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-1 block">Donation Location</label>
                        <input required value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} placeholder="e.g. Central Park, New York" className="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                        <p className="text-xs text-muted-foreground mt-1">Where would you like this plant to grow?</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {locationSuggestions.map((location) => (
                            <button key={location} type="button" onClick={() => setForm((current) => ({ ...current, location }))} className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-accent transition-colors">
                              {location}
                            </button>
                          ))}
                        </div>
                      </div>

                      {donationPreview ? (
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-sm font-semibold text-foreground mb-1">Impact preview</p>
                          <p className="text-sm text-muted-foreground leading-6">{donationPreview}</p>
                        </div>
                      ) : null}

                      <button type="submit" disabled={submitting} className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
                        Complete Donation
                      </button>
                    </form>
                  </div>
                </motion.div>
              </>
            ) : null}
          </AnimatePresence>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-muted/20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No donations yet</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Start a certificate-backed plant donation and this page will turn into your impact dashboard with milestones, donation history, and presentation-ready summaries.
              </p>
              <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-green-700 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors">
                Donate Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {donations.map((donation, index) => {
                const relatedPlant = plants.find((plant) => plant.name === donation.plantName);
                return (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-background border border-border rounded-2xl p-5 hover:border-green-200 dark:hover:border-green-900 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center text-lg">
                          {relatedPlant?.emoji || "🌿"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{donation.plantName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(donation.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-green-600">${donation.amount.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {relatedPlant?.category ? (
                        <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">{relatedPlant.category}</span>
                      ) : null}
                      <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 text-xs font-medium">Certified</span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <p>Donor: <span className="font-medium text-foreground">{donation.donorName}</span></p>
                      <p>Location: {donation.location}</p>
                      <p>Certificate: <span className="font-mono">{donation.certificateId}</span></p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadCertificate(donation)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-green-600 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Certificate
                      </button>
                      <button
                        onClick={() => copyImpactSummary(`Plant donation: ${donation.plantName} sponsored by ${donation.donorName} for ${donation.location}. Certificate: ${donation.certificateId}.`)}
                        className="px-3 py-2 border border-border text-xs font-semibold rounded-lg hover:bg-accent transition-colors"
                        aria-label={`Copy impact summary for ${donation.plantName}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
