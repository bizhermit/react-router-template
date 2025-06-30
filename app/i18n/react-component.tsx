import { createElement, type ReactNode, type FC } from "react";
import { useText } from "./hooks";

type ReplaceMap = Record<string, FC<{ children: ReactNode }>>;

type Props = {
  i18nKey: I18nTextKey;
  params?: I18nReplaceParams;
  replaceMap?: ReplaceMap;
};

const SELF_CLOSING_TAGS = ["br", "hr"];
const ALLOWED_TAGS = [...SELF_CLOSING_TAGS, "b", "strong", "u", "i"];

export function Text({
  i18nKey,
  params,
  replaceMap = {},
}: Props) {
  const t = useText();
  const text = t(i18nKey, params);

  const renderTag = (tag: string, children: ReactNode[], key: number): ReactNode => {
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

  const parse = (str: string | undefined): ReactNode[] => {
    if (!str) return [];
    const tagRegex = new RegExp(
      `<\\s*(/?)\\s*(${[...ALLOWED_TAGS, ...Object.keys(replaceMap)].join("|")})\\s*(/?)\\s*>`,
      "gi"
    );

    const stack: Array<{ tag: string; children: ReactNode[] }> = [];
    const output: ReactNode[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(str)) !== null) {
      const [_, closingSlash, rawTagName] = match;
      const tagName = rawTagName.toLowerCase();
      const index = match.index;

      const rawText = str.slice(lastIndex, index);
      if (rawText) {
        (stack.length ? stack[stack.length - 1].children : output).push(rawText);
      }

      const isSelfClosing = SELF_CLOSING_TAGS.includes(tagName);
      if (!closingSlash && isSelfClosing) {
        const rendered = renderTag(tagName, [], index);
        (stack.length ? stack[stack.length - 1].children : output).push(rendered);
      } else if (!closingSlash) {
        stack.push({ tag: tagName, children: [] });
      } else {
        const last = stack.pop();
        if (!last || last.tag !== tagName) {
          throw new Error(`Tag mismatch: expected </${last?.tag}> but got </${tagName}>`);
        }

        const rendered = renderTag(tagName, last.children, index);
        (stack.length ? stack[stack.length - 1].children : output).push(rendered);
      }

      lastIndex = tagRegex.lastIndex;
    }

   const remaining = str.slice(lastIndex);
    if (remaining) {
      (stack.length ? stack[stack.length - 1].children : output).push(remaining);
    }

    if (stack.length > 0) {
      throw new Error("Unclosed tags found");
    }

    return output;
  };

  return parse(text);
};
