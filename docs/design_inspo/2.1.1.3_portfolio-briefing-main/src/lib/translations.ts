export type Language = "de" | "en";

export const translations = {
  de: {
    nav: {
      roi: "Der ROI",
      ritual: "Das Ritual",
      access: "Mitgliedschaft",
      login: "Login",
      demo: "Demo starten",
    },
    hero: {
      badge: "Ausgabe #267 • Bereitgestellt",
      headline_pre: "Personalisiertes Investment Briefing",
      headline_highlight: "Jetzt auch als Podcast",
      subline: "Mit KASONA zum individuellen Wissens-Vorsprung",
      cta: "Briefing generieren",
      sample: "Beispiel hören",
      time_saved: "Geschätzte Zeitersparnis",
      time_val: "~10 Stunden / Woche",
    },
    roi: {
      title_sub: "The ROI Case",
      title_main: "Wissen ist Rendite.",
      subtitle:
        "Relevante Entwicklungen zu erkennen ohne im Alltag in Nachrichten zu ertrinken ist als langfristiger Investor entscheidend. Das Briefing macht es möglich.",
      cards: [
        {
          title: "Zeit-Arbitrage",
          val: "10h",
          unit: "/Woche",
          desc: "Unsere KI scannt 14.000 Quellen während Sie schlafen. Sie konsumieren die Essenz in 5 Minuten.",
        },
        {
          title: "Risiken Einschätzen",
          val: "24",
          unit: "/7",
          desc: "Verpassen Sie nie wieder ein kritisches Filing. Wir warnen Sie, bevor der Markt die Nachricht eingepreist hat.",
        },
        {
          title: "Alpha Hunter",
          val: "∞",
          unit: "Upside",
          desc: "Die KI filtert die News nach deinem persönliches Portfolio und erkennt relevante unterliegende Entwicklungen.",
        },
      ],
    },
    player: {
      title: "The Briefing",
      vol: "VOL. 1 • DE",
      signal: "Kritische Signale",
      processing: "Generiere Audio...",
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
              "Patent-Datenbanken: Frühwarnsystem für technologische Durchbrüche.",
            ],
          },
          secondary: {
            title: "Sekundärquellen (Market Sentiment)",
            items: [
              "Analysten-Calls: Transkripte von Earnings Calls, analysiert auf Tonfall und Sentiment-Shifts.",
              "Expert Networks: Nischen-Blogs und verifizierte Substack-Autoren für Branchen-Deep-Dives.",
            ],
          },
          macro: {
            title: "Makro-Sensoren",
            items: ["Geopolitische Ticker und Zentralbank-Protokolle für das Big Picture."],
          },
        },
      },
      editor: {
        title: "The Human-in-the-Loop",
        subtitle: "The Chief Investment Editor",
        desc: "KI ist schnell, aber Kontext ist menschlich.",
        role: "Bevor das Briefing generiert wird, validiert ein Senior-Analyst die Kausalität der KI-Erkenntnisse.",
        promise: "Kein Signal verlässt das Haus, ohne dass ein Experte es signiert hat.",
      },
      delivery: {
        title: "Digital Delivery",
        subtitle: "Intelligenz, die Sie findet.",
        formats: [
          { title: "Audio (Morning Commute)", desc: "Studio-Qualität TTS mit natürlicher Intonation." },
          { title: "Text (Executive Summary)", desc: "Bullet-Points für den schnellen Scan zwischendurch." },
        ],
        platforms: [
          { title: "Push", desc: "Private RSS-Feed für Apple Podcasts/Spotify." },
          { title: "Pull", desc: "Web-App Dashboard für Archiv und Deep Dives." },
          { title: "Alert", desc: "WhatsApp/Signal für kritische Red Flag Warnungen." },
        ],
      },
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
        simulation: "Simuliert den Effekt von Panikverkäufen in Krisen vs. informiertes Halten.",
      },
      result: {
        impactTitle: "Generational Wealth Impact",
        withoutFilter: "Ohne Filter",
        withKasona: "Mit Kasona",
        advantage: "Ihr Vorteil",
        explanation:
          'Durch das Vermeiden von "Lärm" schützen Sie nicht nur Ihre Nerven, sondern erzielen langfristig einen signifikanten Zinseszinseffekt. Kasona ist Ihr Schutzschild gegen Marktpanik.',
      },
      disclaimer: "Modellrechnung basierend auf historischen Marktdaten. Keine Garantie für zukünftige Ergebnisse.",
    },
    podcastStructure: {
      badge: "Ihr persönliches Portfolio Briefing",
      title: "Die Struktur des Podcasts",
      subtitle: "5 Segmente. 10 Minuten. Volle Klarheit.",
      playButton: "1 Minute Probe hören",
      remaining: "verbleibend",
      segments: [
        {
          title: "Die Schlagzeilen (TL;DR)",
          description: "Startet direkt mit den 3 wichtigsten Themen für Ihr Portfolio.",
        },
        {
          title: "Deep Dive (Thesis-Check)",
          description: "Ausführliche Analyse: Hat sich das Geschäft fundamental verändert?",
        },
        {
          title: "Quickfire (News-Ticker)",
          description: "Schnelle Updates zu weiteren relevanten Portfolio-Ereignissen.",
        },
        {
          title: "Portfolio-Check",
          description: "Bestätigung der Positionen ohne wesentliche Nachrichten.",
        },
        {
          title: "Fazit & Ausblick",
          description: "Zusammenfassung zur 'Gesundheit' Ihres Portfolios.",
        },
      ],
    },
    faq: {
      badge: "FAQ",
      title: "Häufig gestellte Fragen",
      subtitle: "Alles, was Sie über Ihr personalisiertes Portfolio Briefing wissen müssen.",
      items: [
        {
          question: "Wann und wie oft erhalte ich mein Briefing?",
          answer: "Ihr persönlicher Podcast wird jeden Montagmorgen per E-Mail oder WhatsApp geliefert – perfekt für Ihren Wochenstart. Die Frequenz kann auf Wunsch angepasst werden.",
        },
        {
          question: "Wie lang ist ein typisches Briefing?",
          answer: "Jede Episode ist 4-7 Minuten lang – kompakt genug für Ihren Arbeitsweg, aber umfassend genug, um nichts Wichtiges zu verpassen.",
        },
        {
          question: "Kann ich den Inhalt anpassen?",
          answer: "Absolut! Sie entscheiden, ob Sie mehr 'Big Picture' möchten oder lieber konkrete Zahlen und Deep Dives in einzelne Geschäftsbereiche. Geben Sie uns jederzeit Feedback.",
        },
        {
          question: "Was löst eine Deep Dive Analyse aus?",
          answer: "Aktuell fokussieren wir uns auf Quartalsergebnisse, Management-Wechsel und fundamentale Veränderungen. Sie können jederzeit weitere Ereignisse anfordern, auf die Sie hingewiesen werden möchten.",
        },
        {
          question: "Welche Quellen nutzt Kasona?",
          answer: "Wir aggregieren Daten aus SEC Filings, Ad-hoc Meldungen, Patent-Datenbanken, Analysten-Calls, Expert Networks und geopolitischen Tickern – über 14.000 verifizierte Quellen.",
        },
        {
          question: "Kann ich auf Spotify oder Apple Podcasts hören?",
          answer: "Ja! Sie erhalten einen privaten RSS-Feed, den Sie Ihrer Lieblings-Podcast-App hinzufügen können. Alternativ gibt es die Web-App oder direkte Zustellung via WhatsApp/Signal.",
        },
        {
          question: "Wie gebe ich Feedback?",
          answer: "Schreiben Sie uns einfach an feedback@kasona.de oder antworten Sie direkt auf Ihre wöchentliche Nachricht. Wir nehmen jedes Feedback ernst und optimieren Ihr Briefing kontinuierlich.",
        },
      ],
      contact: {
        text: "Noch Fragen?",
        button: "Kontaktieren Sie uns",
      },
    },
    pricing: {
      title: "Investieren Sie in Ihren Vorsprung.",
      sub: "Für den Preis eines Business-Lunch erhalten Sie ein eigenes Research-Team, das niemals schläft.",
      cta: "Mitgliedschaft beantragen",
      cta_sec: "Demo anfordern",
      footer: "Limitierte Plätze für Beta-Kohorte Q3/2025.",
    },
    footer: {
      brand: "Kasona Briefing",
      tagline: "PART OF THE KASONA OS",
      links: {
        manifesto: "Manifesto",
        impressum: "Impressum",
        datenschutz: "Datenschutz",
      },
    },
  },
  en: {
    nav: {
      roi: "The ROI",
      ritual: "The Ritual",
      access: "Membership",
      login: "Login",
      demo: "Start Demo",
    },
    hero: {
      badge: "Issue #204 • Ready",
      headline_pre: "Good Morning. Here is your",
      headline_highlight: "Edge.",
      subline: "The feeling of the Sunday paper – filtered by AI, focused on your portfolio. No noise. Just alpha.",
      cta: "Generate Briefing",
      sample: "Listen to Sample",
      time_saved: "Estimated Time Saved",
      time_val: "~10 Hours / Week",
    },
    roi: {
      title_sub: "The ROI Case",
      title_main: "Knowledge is Yield.",
      subtitle:
        "Recognizing relevant developments without drowning in daily news is crucial as a long-term investor. The Briefing makes it possible.",
      cards: [
        {
          title: "Time Arbitrage",
          val: "10h",
          unit: "/Week",
          desc: "Our AI scans 14,000 sources while you sleep. You consume the essence in 5 minutes.",
        },
        {
          title: "Risk Assessment",
          val: "24",
          unit: "/7",
          desc: "Never miss a critical filing again. We warn you before the market prices in the news.",
        },
        {
          title: "Alpha Hunter",
          val: "∞",
          unit: "Upside",
          desc: "AI filters news by your personal portfolio and detects relevant underlying developments.",
        },
      ],
    },
    player: {
      title: "The Briefing",
      vol: "VOL. 1 • INT",
      signal: "Critical Signals",
      processing: "Generating Audio...",
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
              "Patent Databases: Early warning system for technological breakthroughs.",
            ],
          },
          secondary: {
            title: "Secondary Sources (Market Sentiment)",
            items: [
              "Analyst Calls: Earnings call transcripts, analyzed for tone and sentiment shifts.",
              "Expert Networks: Niche blogs and verified Substack authors for industry deep-dives.",
            ],
          },
          macro: {
            title: "Macro Sensors",
            items: ["Geopolitical tickers and central bank protocols for the big picture."],
          },
        },
      },
      editor: {
        title: "The Human-in-the-Loop",
        subtitle: "The Chief Investment Editor",
        desc: "AI is fast, but context is human.",
        role: "Before the briefing is generated, a Senior Analyst validates the causality of AI insights.",
        promise: "No signal leaves the house without an expert signing off.",
      },
      delivery: {
        title: "Digital Delivery",
        subtitle: "Intelligence that finds you.",
        formats: [
          { title: "Audio (Morning Commute)", desc: "Studio-quality TTS with natural intonation." },
          { title: "Text (Executive Summary)", desc: "Bullet-points for quick scanning." },
        ],
        platforms: [
          { title: "Push", desc: "Private RSS feed for Apple Podcasts/Spotify." },
          { title: "Pull", desc: "Web-App Dashboard for archive and deep dives." },
          { title: "Alert", desc: "WhatsApp/Signal for critical Red Flag warnings." },
        ],
      },
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
        simulation: "Simulates the effect of panic selling vs. informed holding.",
      },
      result: {
        impactTitle: "Generational Wealth Impact",
        withoutFilter: "Without Filter",
        withKasona: "With Kasona",
        advantage: "Your Advantage",
        explanation:
          'By avoiding "noise", you not only protect your nerves but also achieve a significant compound interest effect in the long term. Kasona is your shield against market panic.',
      },
      disclaimer: "Model calculation based on historical market data. No guarantee of future results.",
    },
    podcastStructure: {
      badge: "Your Personal Portfolio Briefing",
      title: "The Podcast Structure",
      subtitle: "5 segments. 10 minutes. Full clarity.",
      playButton: "Listen to 1 minute sample",
      remaining: "remaining",
      segments: [
        {
          title: "The Headlines (TL;DR)",
          description: "Starts with the 3 most important topics for your portfolio.",
        },
        {
          title: "Deep Dive (Thesis-Check)",
          description: "In-depth analysis: Has the business fundamentally changed?",
        },
        {
          title: "Quickfire (News-Ticker)",
          description: "Quick updates on other relevant portfolio events.",
        },
        {
          title: "Portfolio-Check",
          description: "Confirmation of positions with no significant news.",
        },
        {
          title: "Conclusion & Outlook",
          description: "Summary of your portfolio's overall 'health'.",
        },
      ],
    },
    faq: {
      badge: "FAQ",
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about your personalized Portfolio Briefing.",
      items: [
        {
          question: "When and how often will I receive my Briefing?",
          answer: "Your personal podcast is delivered every Monday morning via email or WhatsApp – perfect for your start to the week. The frequency can be adjusted upon request.",
        },
        {
          question: "How long is a typical Briefing?",
          answer: "Each episode is 4-7 minutes long – compact enough for your commute, but comprehensive enough not to miss anything important.",
        },
        {
          question: "Can I customize the content?",
          answer: "Absolutely! You decide whether you want more 'Big Picture' or prefer concrete numbers and deep dives into individual business areas. Give us feedback anytime.",
        },
        {
          question: "What triggers a Deep Dive analysis?",
          answer: "Currently we focus on quarterly results, management changes, and fundamental shifts. You can request additional events you want to be alerted to at any time.",
        },
        {
          question: "What sources does Kasona use?",
          answer: "We aggregate data from SEC filings, Ad-hoc announcements, patent databases, analyst calls, expert networks, and geopolitical tickers – over 14,000 verified sources.",
        },
        {
          question: "Can I listen on Spotify or Apple Podcasts?",
          answer: "Yes! You get a private RSS feed you can add to your favorite podcast app. Alternatively, there's the web app or direct delivery via WhatsApp/Signal.",
        },
        {
          question: "How do I give feedback?",
          answer: "Simply email us at feedback@kasona.de or respond directly to your weekly message. We take every piece of feedback seriously and continuously optimize your briefing.",
        },
      ],
      contact: {
        text: "Still have questions?",
        button: "Contact us",
      },
    },
    pricing: {
      title: "Invest in your Edge.",
      sub: "For the price of a business lunch, you get your own research team that never sleeps.",
      cta: "Apply for Membership",
      cta_sec: "Request Demo",
      footer: "Limited spots for Beta Cohort Q3/2025.",
    },
    footer: {
      brand: "Kasona Briefing",
      tagline: "PART OF THE KASONA OS",
      links: {
        manifesto: "Manifesto",
        impressum: "Legal Notice",
        datenschutz: "Privacy Policy",
      },
    },
  },
} as const;

export const useTranslation = (lang: Language) => translations[lang];
