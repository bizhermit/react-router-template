import { useText } from "$/shared/hooks/i18n";
import { createElement, type FC, type ReactNode } from "react";

type ReplaceMap = Record<string, FC<{ children: ReactNode; }>>;

type Props<K extends I18nTextKey> = {
  i18nKey: K;
  params?: I18nReplaceParams<K>;
  replaceMap?: ReplaceMap;
};

const SELF_CLOSING_TAGS = ["br", "hr"];
const ALLOWED_TAGS = [...SELF_CLOSING_TAGS, "b", "strong", "u", "i"];

export function Text<K extends I18nTextKey>({
  i18nKey,
  params,
  replaceMap = {},
}: Props<K>) {
  const t = useText();
  const text = t(i18nKey, params);

  return parseToReactNode(text, replaceMap);
};

function renderTag(
  tag: string,
  children: ReactNode[],
  key: number,
  replaceMap: ReplaceMap = {},
): ReactNode {
  switch (tag) {
    case "b":
      return <b key={key}>{children}</b>;
    case "strong":
      return <strong key={key}>{children}</strong>;
    case "u":
      return <u key={key}>{children}</u>;
    case "i":
      return <em key={key}>{children}</em>;
    case "br":
      return <br key={key} />;
    case "hr":
      return <hr key={key} />;
    default:
      return replaceMap[tag]
        ? createElement(replaceMap[tag], { key, children })
        : <span key={key} data-unknown={tag}>{children}</span>;
  }
};

export function parseToReactNode(str: string | undefined, replaceMap: ReplaceMap = {}): ReactNode[] {
  if (!str) return [];
  const tagRegex = new RegExp(
    `<\\s*(/?)\\s*(${[...ALLOWED_TAGS, ...Object.keys(replaceMap)].join("|")})\\s*(/?)\\s*>`,
    "gi"
  );

  const stack: Array<{ tag: string; children: ReactNode[]; }> = [];
  const output: ReactNode[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const push = (content: ReactNode) => {
    if (typeof content === "string") {
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (lines[i]) {
          (stack.length ? stack[stack.length - 1].children : output).push(lines[i]);
        }
        if (i < lines.length - 1) {
          const br = renderTag("br", [], Date.now() + Math.random(), replaceMap);
          (stack.length ? stack[stack.length - 1].children : output).push(br);
        }
      }
      return;
    }
    (stack.length ? stack[stack.length - 1].children : output).push(content);
  };

  while ((match = tagRegex.exec(str)) !== null) {
    const [_, closingSlash, rawTagName] = match;
    const tagName = rawTagName.toLowerCase();
    const index = match.index;

    const rawText = str.slice(lastIndex, index);

    if (rawText) {
      push(rawText);
    }

    const isSelfClosing = SELF_CLOSING_TAGS.includes(tagName);
    if (!closingSlash && isSelfClosing) {
      const rendered = renderTag(tagName, [], index, replaceMap);
      push(rendered);
    } else if (!closingSlash) {
      stack.push({ tag: tagName, children: [] });
    } else {
      const last = stack.pop();
      if (!last || last.tag !== tagName) {
        throw new Error(`Tag mismatch: expected </${last?.tag}> but got </${tagName}>`);
      }

      const rendered = renderTag(tagName, last.children, index, replaceMap);
      push(rendered);
    }

    lastIndex = tagRegex.lastIndex;
  }

  const remaining = str.slice(lastIndex);
  if (remaining) {
    push(remaining);
  }

  if (stack.length > 0) {
    throw new Error("Unclosed tags found");
  }

  return output;
};
