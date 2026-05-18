import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { REFS } from "./constants/refs";
import { normalizeToAscii } from "./transforms/normalizeToAscii";
import {
  FetchProverbsForVersionEvent,
  FetchProverbsForVersionEventSchema,
  Output,
  Proverb,
  Secret,
} from "./types";

export const handler = async (
  event: FetchProverbsForVersionEvent,
): Promise<Output> => {
  console.debug("Event:", JSON.stringify(event));

  const parsed = FetchProverbsForVersionEventSchema.parse(event);

  const { version } = parsed;

  const secretName = process.env.API_BIBLE_SECRET_NAME!;
  if (!secretName) {
    throw new Error("API_BIBLE_SECRET_NAME environment variable not set");
  }

  const secretsClient = new SecretsManagerClient({});
  const secretResponse = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretName }),
  );

  if (!secretResponse.SecretString) {
    throw new Error("Secret value is empty");
  }

  const secret: Secret = JSON.parse(secretResponse.SecretString);
  const { apiKey, baseUrl } = secret;

  console.log(`Starting fetch for version: ${version}`);
  console.log(`Using base URL: ${baseUrl}`);

  const biblesUrl = `${baseUrl}/v1/bibles?language=eng&abbreviation=${version}`;
  console.log(
    `Fetching bibles list with params: language=eng, abbreviation=${version}`,
  );

  const biblesResponse = await fetch(biblesUrl, {
    headers: {
      "api-key": apiKey,
    },
  });

  if (!biblesResponse.ok) {
    const errorText = await biblesResponse.text();
    throw new Error(
      `Failed to fetch bibles: ${biblesResponse.status} ${biblesResponse.statusText} - ${errorText}`,
    );
  }

  const biblesData = (await biblesResponse.json()) as {
    data?: Array<{
      id: string;
      abbreviation: string;
      name: string;
    }>;
  };

  const bibles = biblesData.data || [];
  console.log(`Received ${bibles.length} bibles from API`);

  const matchingBible = bibles.find(
    (b) => b.abbreviation.toLowerCase() === version.toLowerCase(),
  );

  if (!matchingBible) {
    console.log(`Bible version "${version}" not found in response`);
    const availableVersions = bibles.map((b) => b.abbreviation).join(", ");
    throw new Error(
      `Bible version "${version}" not found. Available versions: ${availableVersions}`,
    );
  }

  const bibleId = matchingBible.id;
  console.log(`Found matching bible: ${matchingBible.name} (ID: ${bibleId})`);

  console.log(`Building chapter list from ${REFS.length} proverb references`);

  const chaptersSet = new Set<number>();
  for (const ref of REFS) {
    const match = ref.match(/^Proverbs (\d+):/);
    if (!match) continue;
    chaptersSet.add(parseInt(match[1], 10));
  }

  const proverbs: Proverb[] = [];
  const sortedChapters = Array.from(chaptersSet).sort((a, b) => a - b);
  console.log(`Prepared to fetch ${sortedChapters.length} chapters`);

  for (const chapter of sortedChapters) {
    console.log(`Fetching chapter ${chapter}...`);

    const url = `${baseUrl}/v1/bibles/${bibleId}/chapters/PRO.${chapter}?content-type=json`;

    console.debug(`Fetching chapter ${chapter}: ${url}`);

    const response = await fetch(url, {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch chapter ${chapter}: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = (await response.json()) as {
      data?: {
        content?: Array<{
          name?: string;
          type?: string;
          attrs?: Record<string, unknown>;
          items?: Array<{
            text?: string;
            type?: string;
            attrs?: Record<string, unknown>;
            name?: string;
            items?: Array<{ text?: string; type?: string }>;
          }>;
        }>;
      };
    };

    const content = data.data?.content || [];
    const versesMap = new Map<number, string>();

    for (const item of content) {
      if (item.type !== "tag") continue;
      const items = item.items || [];
      for (const subItem of items) {
        if (subItem.type !== "text") continue;
        const verseId = subItem.attrs?.verseId as string | undefined;
        const vid = subItem.attrs?.vid as string | undefined;
        let verseNum: number | null = null;

        if (verseId) {
          const match = verseId.match(/PRO\.(\d+)\.(\d+)/);
          if (match) {
            verseNum = parseInt(match[2], 10);
          }
        } else if (vid) {
          const match = vid.match(/PRO (\d+):(\d+)/);
          if (match) {
            verseNum = parseInt(match[2], 10);
          }
        }

        if (verseNum && subItem.text) {
          const existing = versesMap.get(verseNum) || "";
          versesMap.set(
            verseNum,
            existing + (existing ? " " : "") + subItem.text,
          );
        }
      }
    }

    const chapterProverbs: Proverb[] = [];

    for (const kjvRef of REFS) {
      const match = kjvRef.match(/^Proverbs (\d+):(\d+)(?:-(\d+))?$/);
      if (!match) continue;

      const refChapter = parseInt(match[1], 10);
      if (refChapter !== chapter) continue;

      const verseStart = parseInt(match[2], 10);
      const verseEnd = match[3] ? parseInt(match[3], 10) : verseStart;

      const proverbParts: string[] = [];
      for (let v = verseStart; v <= verseEnd; v++) {
        const verseText = versesMap.get(v);
        if (verseText) {
          proverbParts.push(normalizeToAscii(verseText));
        }
      }

      chapterProverbs.push({
        ref: kjvRef,
        proverb: proverbParts.join(" "),
      });
    }

    proverbs.push(...chapterProverbs);
    console.log(
      `Chapter ${chapter} complete - collected ${chapterProverbs.length} proverbs`,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const output: Output = {
    version,
    proverbs,
  };

  console.log(`Fetch complete - total proverbs: ${proverbs.length}`);

  return output;
};
