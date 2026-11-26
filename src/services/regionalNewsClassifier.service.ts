
import type { NormalizedNewsArticle } from "../types/normalizedArticle.types.js";

type RegionalTopic =
  | "politics"
  | "government"
  | "crime"
  | "education"
  | "business"
  | "infrastructure"
  | "other";

interface ClassificationResult {
  regionalTopic: RegionalTopic;
  importanceScore: number;
  isCurated: boolean;
}

const TOPIC_KEYWORDS: Record<RegionalTopic, string[]> = {
  politics: [
    "election", "elections", "political party", "politics",
    "chief minister", "minister", "mla", "mp", "assembly",
    "opposition", "governor", "campaign", "voting",
    "தேர்தல்", "அரசியல்", "முதல்வர்", "அமைச்சர்",
    "ஆளுநர்", "சட்டமன்றம்", "வாக்குப்பதிவு",
    "எதிர்க்கட்சி", "கட்சி",
  ],

  government: [
    "government order", "government scheme", "policy",
    "government announcement", "public welfare",
    "cabinet decision", "government approval",
    "அரசு அறிவிப்பு", "அரசாணை", "அரசு திட்டம்",
    "நலத்திட்டம்", "அமைச்சரவை", "அரசு உத்தரவு",
  ],

  crime: [
    "murder", "arrest", "police", "crime", "fraud",
    "investigation", "court", "theft", "accused",
    "criminal", "assault", "custody", "rape",
    "கொலை", "கைது", "காவல்துறை", "குற்றம்",
    "மோசடி", "விசாரணை", "திருட்டு", "நீதிமன்றம்",
    "குற்றவாளி", "பாலியல் வன்கொடுமை",
  ],

  education: [
    "education", "school", "college", "university",
    "exam", "examination", "result", "students",
    "recruitment", "government jobs", "tnpsc",
    "teacher", "neet", "engineering admission",
    "கல்வி", "பள்ளி", "கல்லூரி", "பல்கலைக்கழகம்",
    "தேர்வு", "முடிவுகள்", "மாணவர்கள்",
    "வேலைவாய்ப்பு", "அரசு வேலை", "ஆசிரியர்",
    "கல்வித்துறை", "நீட்",
  ],

  business: [
    "investment", "industry", "industries",
    "business", "economy", "employment",
    "manufacturing", "company", "factory",
    "jobs created", "startup", "industrial park",
    "முதலீடு", "தொழில்", "பொருளாதாரம்",
    "வேலைவாய்ப்பு", "உற்பத்தி", "நிறுவனம்",
    "தொழிற்சாலை", "தொழில் பூங்கா",
  ],

  infrastructure: [
    "infrastructure", "highway", "metro rail",
    "airport", "railway", "bridge", "road project",
    "water supply", "drinking water", "dam",
    "transport", "electricity", "development project",
    "உள்கட்டமைப்பு", "நெடுஞ்சாலை", "மெட்ரோ",
    "விமான நிலையம்", "ரயில்வே", "பாலம்",
    "குடிநீர்", "அணை", "போக்குவரத்து",
    "மின்சாரம்", "வளர்ச்சி திட்டம்",
  ],

  other: [],
};

const HIGH_IMPACT_KEYWORDS = [
  "major decision", "historic decision", "statewide",
  "state-wide", "across tamil nadu", "thousands",
  "lakhs", "crores", "public affected", "emergency",
  "disaster", "major announcement", "new policy",
  "முக்கிய அறிவிப்பு", "வரலாற்று சிறப்பு",
  "மாநிலம் முழுவதும்", "ஆயிரக்கணக்கான",
  "லட்சக்கணக்கான", "அவசர நிலை",
  "பேரிடர்", "முக்கிய முடிவு",
];

const URGENT_KEYWORDS = [
  "emergency", "disaster", "flood", "cyclone",
  "earthquake", "major accident", "public safety",
  "அவசரம்", "பேரிடர்", "வெள்ளம்",
  "புயல்", "நிலநடுக்கம்", "விபத்து",
  "பொது பாதுகாப்பு",
];

class RegionalNewsClassifierService {
  classifyArticle(
    article: Pick<
      NormalizedNewsArticle,
      "title" | "description" | "content"
    >
  ): ClassificationResult {
    const title = (article.title || "").toLowerCase();

    const fullText = [
      article.title,
      article.description ?? "",
      article.content ?? "",
    ]
      .join(" ")
      .toLowerCase();

    let selectedTopic: RegionalTopic = "other";
    let highestTopicScore = 0;

    // Find the topic with the strongest keyword match.
    for (const [topic, keywords] of Object.entries(
      TOPIC_KEYWORDS
    ) as [RegionalTopic, string[]][]) {
      if (topic === "other") continue;

      const titleMatches = keywords.filter((keyword) =>
        title.includes(keyword)
      ).length;

      const contentMatches = keywords.filter((keyword) =>
        fullText.includes(keyword)
      ).length;

      const topicScore = titleMatches * 20 + contentMatches * 5;

      if (topicScore > highestTopicScore) {
        highestTopicScore = topicScore;
        selectedTopic = topic;
      }
    }

    // Calculate editorial importance.
    let importanceScore = 0;

    if (selectedTopic !== "other") {
      importanceScore += 35;
    }

    const titleTopicMatches =
      TOPIC_KEYWORDS[selectedTopic].filter((keyword) =>
        title.includes(keyword)
      ).length;

    if (titleTopicMatches > 0) {
      importanceScore += 15;
    }

    const impactMatches = HIGH_IMPACT_KEYWORDS.filter(
      (keyword) => fullText.includes(keyword)
    ).length;

    importanceScore += Math.min(impactMatches * 15, 30);

    const urgentMatches = URGENT_KEYWORDS.filter(
      (keyword) => fullText.includes(keyword)
    ).length;

    importanceScore += Math.min(urgentMatches * 10, 20);

    importanceScore = Math.min(importanceScore, 100);

    // Only articles with a recognized topic and sufficient
    // importance score are selected for the curated feed.
    const isCurated =
      selectedTopic !== "other" && importanceScore >= 50;

    return {
      regionalTopic: selectedTopic,
      importanceScore,
      isCurated,
    };
  }
}

const regionalNewsClassifierService =
  new RegionalNewsClassifierService();

export default regionalNewsClassifierService;
