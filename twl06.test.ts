import TWL06 from "./twl06";

describe("TWL06", () => {
  const valid_words = ["hello", "pointiest", "traveler", "qi"];
  it.each(valid_words)("valid word: TWL06.contains(%s)", word => {
    expect(TWL06.contains(word)).toBe(true);
  });

  const invalid_words = ["asoetnuhsaeo", "pointierst", "qa"];
  it.each(invalid_words)("invalid word: TWL06.contains(%s)", word => {
    expect(TWL06.contains(word)).toBe(false);
  });
});
