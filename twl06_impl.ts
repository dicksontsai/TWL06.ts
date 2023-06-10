import { Buffer } from "buffer";
import { unzipSync } from "zlib";

/*

Implemenst a Directed Acyclic Word Graph (DAWG). Assumes that the data is
stored in the following **little endian** 32-bit integer.

MLLLLLLL IIIIIIII IIIIIIII IIIIIIII

M - More Flag
L - ASCII Letter (lowercase or '$')
I - Index (Pointer)

The helper method get_record(index) will extract these three elements 
into an object such as (true, 'a', 26). 

All searches start at index 0 in the lookup table. Records are scanned 
sequentially as long as the More flag is set. These records represent all 
of the children of the current node in the DAWG. For example, the first
26 records are:

0 (true, 'a', 26)
1 (true, 'b', 25784)
2 (true, 'c', 11666)
3 (true, 'd', 39216)
4 (true, 'e', 33704)
5 (true, 'f', 50988)
6 (true, 'g', 46575)
7 (true, 'h', 60884)
8 (true, 'i', 56044)
9 (true, 'j', 67454)
10 (true, 'k', 65987)
11 (true, 'l', 76093)
12 (true, 'm', 68502)
13 (true, 'n', 83951)
14 (true, 'o', 79807)
15 (true, 'p', 89048)
16 (true, 'q', 88465)
17 (true, 'r', 113967)
18 (true, 's', 100429)
19 (true, 't', 125171)
20 (true, 'u', 119997)
21 (true, 'v', 134127)
22 (true, 'w', 131549)
23 (true, 'x', 136449)
24 (true, 'y', 136058)
25 (false, 'z', 136584)

The root node contains 26 children because there are words that start 
with all 26 letters. Other nodes will have fewer children. For example,
if we jump to the node for the prefix 'b', we see:

25784 (true, 'a', 25795)
25785 (true, 'd', 28639)
25786 (true, 'e', 27322)
25787 (true, 'h', 29858)
25788 (true, 'i', 28641)
25789 (true, 'l', 29876)
25790 (true, 'o', 30623)
25791 (true, 'r', 31730)
25792 (true, 'u', 32759)
25793 (true, 'w', 33653)
25794 (false, 'y', 33654)

So the prefix 'b' may be followed only by these letters:

a, d, e, h, i, l, o, r, u, w, y

The helper method get_child(index, letter) will return a new index
(or null if not found) when traversing an edge to a new node. For
example, get_child(0, 'b') returns 25784.

The search is performed iteratively until the sentinel value, $, is
found. If this value is found, the string is a word in the dictionary.
If at any point during the search the appropriate child is not found,
the search fails - the string is not a word.

See also:

http://code.activestate.com/recipes/577835-self-contained-twl06-dictionary-module-500-kb/
http://en.wikipedia.org/wiki/Official_Tournament_and_Club_Word_List
http://www.isc.ro/lists/twl06.zip
 */
export class Dawg {
  private data!: Buffer;

  constructor(buf: Buffer) {
    this.data = buf;
  }

  /*
   * Creates a DAWG from a base-64 encoded, zlib-compressed string.
   */
  static fromCompressed(base64CompressedData: string) {
    const decoded = Buffer.from(base64CompressedData, "base64");
    return new Dawg(unzipSync(decoded));
  }

  /*
   * Visible for testing only. Retrieves a single record from this DAWG.
   */
  get_record(index: number) {
    // Javascript does not have great bitwise operator support for unsigned
    // integers, so we read in 4 bytes as a signed integer.
    const num = this.data.readInt32LE(index * 4);
    // -0x80000000 is the smallest negative number, 1 bit followed by 0s.
    const more = (num & -0x80000000) === -0x80000000;
    const letter = String.fromCharCode((num >> 24) & 0x7f);
    const link = Number(num & 0xffffff);
    return {
      more,
      letter,
      link
    };
  }

  private get_child(index: number, letter: string) {
    while (true) {
      const record = this.get_record(index);
      if (record.letter === letter) {
        return record.link;
      }
      if (!record.more) {
        return null;
      }
      index++;
    }
  }

  /*
   * Returns whether this DAWG contains the given word.
   */
  public contains(word: string) {
    let index: number | null = 0;
    const letters = Array.prototype.concat(...word, "$");
    for (let i = 0; i < letters.length; i++) {
      index = this.get_child(index, letters[i]);
      if (index == null) {
        return false;
      }
    }
    return true;
  }
}
