export type Language = 'de' | 'en';

export const translations = {
  de: {
    nav: {
      roi: "Der ROI",
      ritual: "Das Ritual",
      access: "Mitgliedschaft",
      login: "Login",
      demo: "Demo starten"
    },
    hero: {
      badge: "Ausgabe #204 • Bereitgestellt",
      headline_pre: "Guten Morgen. Hier ist Ihr",
      headline_highlight: "Vorsprung.",
      subline: "Das Gefühl der klassischen Wochenzeitung – gefiltert durch KI, fokussiert auf Ihr Portfolio. Kein Lärm. Nur Rendite.",
      cta: "Briefing generieren",
      sample: "Beispiel hören",
      time_saved: "Geschätzte Zeitersparnis",
      time_val: "~10 Stunden / Woche"
    },
    roi: {
      title_sub: "The ROI Case",
      title_main: "Wissen ist Rendite.",
      subtitle: "Relevante Entwicklungen zu erkennen ohne im Alltag in Nachrichten zu ertrinken ist als langfristiger Investor entscheidend. Das Briefing macht es möglich.",
      cards: [
        {
          title: "Zeit-Arbitrage",
          val: "10h",
          unit: "/Woche",
          desc: "Unsere KI scannt 14.000 Quellen während Sie schlafen. Sie konsumieren die Essenz in 5 Minuten."
        },
        {
          title: "Risiken Einschätzen",
          val: "24",
          unit: "/7",
          desc: "Verpassen Sie nie wieder ein kritisches Filing. Wir warnen Sie, bevor der Markt die Nachricht eingepreist hat."
        },
        {
          title: "Alpha Hunter",
          val: "∞",
          unit: "Upside",
          desc: "Die KI filtert die News nach deinem persönliches Portfolio und erkennt relevante unterliegende Entwicklungen."
        }
      ]
    },
    player: {
      title: "The Briefing",
      vol: "VOL. 1 • DE",
      signal: "Kritische Signale",
      processing: "Generiere Audio..."
    },
    marquee: "360° Coverage. Institutional Data Quality.",
    coverage: {
      title_sub: "Data Integrity & 360° Coverage",
      title_main: "Wir filtern nicht nur Nachrichten. Wir kuratieren Wahrheit.",
      inputLayer: {
        title: "The Input Layer",
        subtitle: "Global Sensor Network",
        desc: "Wir verlassen uns nicht auf eine Quelle. Das System aggregiert Datenpunkte aus drei Dimensionen.",
        sources: {
          primary: {
            title: "Primärquellen (Hard Data)",
            items: [
              "SEC Filings & Ad-hoc Meldungen: Direkte Anbindung an EDGAR und Unternehmens-IR-Seiten.",
              "Patent-Datenbanken: Frühwarnsystem für technologische Durchbrüche."
            ]
          },
          secondary: {
            title: "Sekundärquellen (Market Sentiment)",
            items: [
              "Analysten-Calls: Transkripte von Earnings Calls, analysiert auf Tonfall und Sentiment-Shifts.",
              "Expert Networks: Nischen-Blogs und verifizierte Substack-Autoren für Branchen-Deep-Dives."
            ]
          },
          macro: {
            title: "Makro-Sensoren",
            items: [
              "Geopolitische Ticker und Zentralbank-Protokolle für das Big Picture."
            ]
          }
        }
      },
      editor: {
        title: "The Human-in-the-Loop",
        subtitle: "The Chief Investment Editor",
        desc: "KI ist schnell, aber Kontext ist menschlich.",
        role: "Bevor das Briefing generiert wird, validiert ein Senior-Analyst die Kausalität der KI-Erkenntnisse.",
        promise: "Kein Signal verlässt das Haus, ohne dass ein Experte es signiert hat."
      },
      delivery: {
        title: "Digital Delivery",
        subtitle: "Intelligenz, die Sie findet.",
        formats: [
          { title: "Audio (Morning Commute)", desc: "Studio-Qualität TTS mit natürlicher Intonation." },
          { title: "Text (Executive Summary)", desc: "Bullet-Points für den schnellen Scan zwischendurch." }
        ],
        platforms: [
          { title: "Push", desc: "Private RSS-Feed für Apple Podcasts/Spotify." },
          { title: "Pull", desc: "Web-App Dashboard für Archiv und Deep Dives." },
          { title: "Alert", desc: "WhatsApp/Signal für kritische Red Flag Warnungen." }
        ]
      }
    },
    calculator: {
      title: "The Cost of Noise",
      subtitle: "Der Zinseszins der Klarheit",
      desc: "Historisch gesehen verlieren Anleger 3-4% Rendite pro Jahr durch emotionales Handeln (Panikverkäufe, FOMO). Kasona ist Ihr rationaler Anker.",
      labels: {
        initialInvest: "Startkapital",
        monthlyInvest: "Monatlicher Sparplan",
        years: "Anlagehorizont",
        panicLabel: "Informations-Diät",
        panicZen: "Kasona (Klarheit)",
        panicNoise: "News Ticker (Lärm)",
        strategic: "Strategisch (8%)",
        reactive: "Reaktiv",
        simulation: "Simuliert den Effekt von Panikverkäufen in Krisen vs. informiertes Halten."
      },
      result: {
        impactTitle: "Generational Wealth Impact",
        withoutFilter: "Ohne Filter",
        withKasona: "Mit Kasona",
        advantage: "Ihr Vorteil",
        explanation: "Durch das Vermeiden von \"Lärm\" schützen Sie nicht nur Ihre Nerven, sondern erzielen langfristig einen signifikanten Zinseszinseffekt. Kasona ist Ihr Schutzschild gegen Marktpanik."
      },
      disclaimer: "Modellrechnung basierend auf historischen Marktdaten. Keine Garantie für zukünftige Ergebnisse."
    },
    pricing: {
      title: "Investieren Sie in Ihren Vorsprung.",
      sub: "Für den Preis eines Business-Lunch erhalten Sie ein eigenes Research-Team, das niemals schläft.",
      cta: "Mitgliedschaft beantragen",
      cta_sec: "Demo anfordern",
      footer: "Limitierte Plätze für Beta-Kohorte Q3/2025."
    },
    footer: {
      brand: "Kasona Briefing",
      tagline: "PART OF THE KASONA OS",
      links: {
        manifesto: "Manifesto",
        impressum: "Impressum",
        datenschutz: "Datenschutz"
      }
    }
  },
  en: {
    nav: {
      roi: "The ROI",
      ritual: "The Ritual",
      access: "Membership",
      login: "Login",
      demo: "Start Demo"
    },
    hero: {
      badge: "Issue #204 • Ready",
      headline_pre: "Good Morning. Here is your",
      headline_highlight: "Edge.",
      subline: "The feeling of the Sunday paper – filtered by AI, focused on your portfolio. No noise. Just alpha.",
      cta: "Generate Briefing",
      sample: "Listen to Sample",
      time_saved: "Estimated Time Saved",
      time_val: "~10 Hours / Week"
    },
    roi: {
      title_sub: "The ROI Case",
      title_main: "Knowledge is Yield.",
      subtitle: "Recognizing relevant developments without drowning in daily news is crucial as a long-term investor. The Briefing makes it possible.",
      cards: [
        {
          title: "Time Arbitrage",
          val: "10h",
          unit: "/Week",
          desc: "Our AI scans 14,000 sources while you sleep. You consume the essence in 5 minutes."
        },
        {
          title: "Risk Assessment",
          val: "24",
          unit: "/7",
          desc: "Never miss a critical filing again. We warn you before the market prices in the news."
        },
        {
          title: "Alpha Hunter",
          val: "∞",
          unit: "Upside",
          desc: "AI filters news by your personal portfolio and detects relevant underlying developments."
        }
      ]
    },
    player: {
      title: "The Briefing",
      vol: "VOL. 1 • INT",
      signal: "Critical Signals",
      processing: "Generating Audio..."
    },
    marquee: "360° Coverage. Institutional Data Quality.",
    coverage: {
      title_sub: "Data Integrity & 360° Coverage",
      title_main: "We don't just filter news. We curate truth.",
      inputLayer: {
        title: "The Input Layer",
        subtitle: "Global Sensor Network",
        desc: "We don't rely on a single source. The system aggregates data points from three dimensions.",
        sources: {
          primary: {
            title: "Primary Sources (Hard Data)",
            items: [
              "SEC Filings & Ad-hoc Reports: Direct connection to EDGAR and corporate IR pages.",
              "Patent Databases: Early warning system for technological breakthroughs."
            ]
          },
          secondary: {
            title: "Secondary Sources (Market Sentiment)",
            items: [
              "Analyst Calls: Earnings call transcripts, analyzed for tone and sentiment shifts.",
              "Expert Networks: Niche blogs and verified Substack authors for industry deep-dives."
            ]
          },
          macro: {
            title: "Macro Sensors",
            items: [
              "Geopolitical tickers and central bank protocols for the big picture."
            ]
          }
        }
      },
      editor: {
        title: "The Human-in-the-Loop",
        subtitle: "The Chief Investment Editor",
        desc: "AI is fast, but context is human.",
        role: "Before the briefing is generated, a Senior Analyst validates the causality of AI insights.",
        promise: "No signal leaves the house without an expert signing off."
      },
      delivery: {
        title: "Digital Delivery",
        subtitle: "Intelligence that finds you.",
        formats: [
          { title: "Audio (Morning Commute)", desc: "Studio-quality TTS with natural intonation." },
          { title: "Text (Executive Summary)", desc: "Bullet-points for quick scanning." }
        ],
        platforms: [
          { title: "Push", desc: "Private RSS feed for Apple Podcasts/Spotify." },
          { title: "Pull", desc: "Web-App Dashboard for archive and deep dives." },
          { title: "Alert", desc: "WhatsApp/Signal for critical Red Flag warnings." }
        ]
      }
    },
    calculator: {
      title: "The Cost of Noise",
      subtitle: "Compounding Clarity",
      desc: "Historically, investors lose 3-4% returns annually due to emotional trading (panic selling, FOMO). Kasona is your rational anchor.",
      labels: {
        initialInvest: "Initial Investment",
        monthlyInvest: "Monthly Contribution",
        years: "Investment Horizon",
        panicLabel: "Information Diet",
        panicZen: "Kasona (Clarity)",
        panicNoise: "News Ticker (Noise)",
        strategic: "Strategic (8%)",
        reactive: "Reactive",
        simulation: "Simulates the effect of panic selling vs. informed holding."
      },
      result: {
        impactTitle: "Generational Wealth Impact",
        withoutFilter: "Without Filter",
        withKasona: "With Kasona",
        advantage: "Your Advantage",
        explanation: "By avoiding \"noise\", you not only protect your nerves but also achieve a significant compound interest effect in the long term. Kasona is your shield against market panic."
      },
      disclaimer: "Model calculation based on historical market data. No guarantee of future results."
    },
    pricing: {
      title: "Invest in your Edge.",
      sub: "For the price of a business lunch, you get your own research team that never sleeps.",
      cta: "Apply for Membership",
      cta_sec: "Request Demo",
      footer: "Limited spots for Beta Cohort Q3/2025."
    },
    footer: {
      brand: "Kasona Briefing",
      tagline: "PART OF THE KASONA OS",
      links: {
        manifesto: "Manifesto",
        impressum: "Legal Notice",
        datenschutz: "Privacy Policy"
      }
    }
  }
} as const;

export const useTranslation = (lang: Language) => translations[lang];
