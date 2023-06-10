import { Dawg } from "./twl06_impl";

describe("Dawg", () => {
  it("interprets a record correctly", () => {
    const hexArr = [0x1a, 0x0, 0x0, 0xe1];
    const buffer = Buffer.from(hexArr);
    const dawg = new Dawg(buffer);
    const record = dawg.get_record(0);
    expect(record.more).toBe(true);
    expect(record.letter).toBe("a");
    expect(record.link).toBe(26);
  });
});
