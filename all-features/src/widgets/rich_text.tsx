import { renderWidget, RNPlugin, RichTextInterface } from "@remnote/plugin-sdk";
import { TestResultMap } from "../lib/types";
import { TestRunner } from "../components/TestRunner";

export const createBoldRichText = (text: string): RichTextInterface => [
  {
    i: "m",
    ["b"]: true,
    text,
  },
];

const richTextNamespaceMethodTests: TestResultMap<RNPlugin["richText"]> = {
  findAllExternalURLs: async () => {
     return {
      actual: "ignore",
      expected: "ignore",
    }
  },
  getRemAndAliasIdsFromRichText: async (plugin) => {
    const richText = plugin.richText.rem("id").value();
    const actual = await plugin.richText.deepGetRemIdsFromRichText(richText)
    const expected = ["id"];
    return {
      actual,
      expected,
    }
  },
  getRemIdsFromRichText: async (plugin) => {
    const richText = plugin.richText.rem("id").value();
    const actual = await plugin.richText.deepGetRemIdsFromRichText(richText)
    const expected = ["id"];
    return {
      actual,
      expected,
    }
  },
  deepGetRemAndAliasIdsFromRichText: async (plugin) => {
    const richText = plugin.richText.rem("id").value();
    const actual = await plugin.richText.deepGetRemIdsFromRichText(richText)
    const expected = ["id"];
    return {
      actual,
      expected,
    }
  },
  deepGetRemIdsFromRichText: async (plugin) => {
    const richText = plugin.richText.rem("id").value();
    const actual = await plugin.richText.deepGetRemIdsFromRichText(richText)
    const expected = ["id"];
    return {
      actual,
      expected,
    }
  },
  split: async (plugin) => {
    const richText = ['12,3,4']
    const actual = await plugin.richText.split(richText, ',');
    const expected = [['12'], ['3'], ['4']];
    return {
      actual,
      expected,
    }
  },
  trimEnd: async (plugin) => {
    const actual = await plugin.richText.trimEnd([' dogs '])
    const expected = [' dogs'];
    return {
      actual,
      expected,
    }
  },
  trimStart: async (plugin) => {
    const actual = await plugin.richText.trimStart([' dogs '])
    const expected = ['dogs '];
    return {
      actual,
      expected,
    }
  },
  trim: async (plugin) => {
    const actual = await plugin.richText.trim([' dogs ', '', ' '])
    const expected = ['dogs'];
    return {
      actual,
      expected,
    }
  },
  length: async (plugin) => {
    const actual = await plugin.richText.length(['hello']);
    const expected = 5;
    return {
      actual,
      expected,
    }
  },
  toHTML: async (plugin) => {
    return {
      expected: "ignore",
      actual: "ignore",
    }
  },
  indexOf: async (plugin) => {
    const actual = await plugin.richText.indexOf(['hello'], 'o');
    const expected = 4;
    return {
      actual,
      expected,
    }
  },
  empty: async (plugin) => {
    const actual = await plugin.richText.empty(['']);
    const expected = true;
    return {
      expected,
      actual
    }
  },
  splitRichText: async (plugin) => {
    const actual = await plugin.richText.splitRichText(['123AA456AA'], ['AA'])
    const expected = [['123'], ['456'], [], ];
    return {
      actual,
      expected,
    }
  },
  replaceAllRichText: async (plugin) => {
    const actual = await plugin.richText.replaceAllRichText(['123AA456AA'], ['AA'], ['B'])
    const expected = ['123B456B'];
    return {
      actual,
      expected
    }
  },
  code: async (plugin) => {
    const actual = plugin.richText.code("print('hi!')", "python").value();
    return {
      expected: [
        {
          i: "m",
          text: "print('hi!')",
          code: true,
          language: "python",
        },
      ],
      actual,
    };
  },
  image: async (plugin) => {
    const actual = plugin.richText
      .image(
        "https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322868_1100-800x825.jpg",
        200,
        200
      )
      .value();
    return {
      expected: [
        {
          i: "i",
          url: "https://post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/02/322868_1100-800x825.jpg",
          width: 200,
          height: 200,
        },
      ],
      actual,
    };
  },
  rem: async (plugin) => {
    const actual = plugin.richText.rem("rem-id").value();
    return {
      expected: [
        {
          i: "q",
          _id: "rem-id",
        },
      ],
      actual,
    };
  },
  audio: async (plugin) => {
    const actual = plugin.richText.audio("").value();
    return {
      expected: [
        {
          i: "a",
          url: "",
          onlyAudio: true,
        },
      ],
      actual,
    };
  },
  latex: async (plugin) => {
    const actual = plugin.richText.latex("$ε$", false).value();
    return {
      expected: [
        {
          i: "x",
          text: "$ε$",
          block: false,
        },
      ],
      actual,
    };
  },
  text: async (plugin) => {
    const actual = plugin.richText
      .text("Hello World", ["underline", "bold",])
      .value();
    return {
      expected: [
        {
          i: "m",
          text: "Hello World",
          u: true,
          b: true,
        },
      ],
      actual,
    };
  },
  video: async (plugin) => {
    const actual = plugin.richText
      .video("https://www.youtube.com/watch?v=rTgj1HxmUbg")
      .value();
    return {
      expected: [
        {
          i: "a",
          url: "https://www.youtube.com/watch?v=rTgj1HxmUbg",
          onlyAudio: false,
        },
      ],
      actual,
    };
  },
  newline: async (plugin) => {
    const actual = plugin.richText.newline().value();
    return {
      expected: ["\n"],
      actual,
    };
  },
  equals: async (plugin) => {
    const rt1 = ["hello", "there"];
    const rt2 = ["hello", "bye"];
    const actual = [
      await plugin.richText.equals(rt1, rt1),
      await plugin.richText.equals(rt1, rt2),
    ];
    return {
      expected: [true, false],
      actual,
    };
  },
  substring: async (plugin) => {
    const rt = ["01234"];
    const actual = await plugin.richText.substring(rt, 3);
    return {
      expected: ["34"],
      actual,
    };
  },
  charAt: async (plugin) => {
    const rt = ["hello"];
    const actual = await plugin.richText.charAt(rt, 3);
    return {
      expected: "l",
      actual,
    };
  },
  toMarkdown: async (plugin) => {
    const rt = createBoldRichText("Hello");
    const actual = await plugin.richText.toMarkdown(rt);
    return {
      expected: "**Hello**",
      actual,
    };
  },
  parseFromMarkdown: async (plugin) => {
    const md = "**Hello**";
    const actual = await plugin.richText.parseFromMarkdown(md);
    return {
      expected: createBoldRichText("Hello"),
      actual,
    };
  },
  toString: async (plugin) => {
    const rt = ["Hello", " ", "World"];
    const actual = await plugin.richText.toString(rt);
    return {
      expected: "Hello World",
      actual,
    };
  },
};

renderWidget(() => <TestRunner tests={richTextNamespaceMethodTests} />);
