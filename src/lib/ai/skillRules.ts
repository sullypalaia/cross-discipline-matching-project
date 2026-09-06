// Built-in suggestions work without a provider or network connection.
const rules: [RegExp, string[]][] = [
  [/\b(web|website|app|software|dashboard)\b/i, ["Web development", "UI design", "Software testing"]],
  [/\b(garden|soil|crop|agriculture|irrigation|plant)\b/i, ["Horticulture", "Soil testing", "Irrigation planning"]],
  [/\b(basketball|sport|sports|fitness|soccer|training)\b/i, ["Coaching", "Sports analytics", "Event planning"]],
  [/\b(music|audio|song|soundtrack|band)\b/i, ["Music composition", "Audio production", "Sound design"]],
  [/\b(robot|robotics|sensor|circuit|electronics|inverter)\b/i, ["Electronics", "Embedded programming", "Prototyping"]],
  [/\b(art|design|film|video|animation)\b/i, ["Visual design", "Storytelling", "Media production"]],
  [/\b(business|startup|marketing|sales)\b/i, ["Market research", "Marketing", "Budgeting"]],
  [/\b(health|medical|wellness|nutrition)\b/i, ["Health research", "Data analysis", "Community outreach"]],
  [/\b(environment|sustainability|recycling|energy|water)\b/i, ["Environmental research", "Data collection", "Impact assessment"]],
];

export function skillRules(title: string, description: string): string[] {
  const matches = rules.filter(([pattern]) => pattern.test(`${title} ${description}`));
  // Interleave categories to retain complementary skills in mixed projects.
  const skills = [0, 1, 2].flatMap((index) => matches.map(([, values]) => values[index]));
  return skills.length ? [...new Set(skills)].slice(0, 6) : ["Research", "Project planning", "Communication"];
}
