/// <reference no-default-lib="true" />
/// <reference lib="deno.ns" />
/// <reference lib="dom" />

import {
  AttributeValueType,
  CombinatorType,
  Lexer,
  TokenType,
} from "./lexer.ts";
import type { Token } from "./lexer.ts";

import {
  DOMParser,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export class Quiksand {
  matches(tokens: Token[], el: Element) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      switch (token.type) {
        case TokenType.Attribute: {
          switch (token.valueType) {
            case AttributeValueType.Exact: {
              if (el.getAttribute(token.name) !== token.value) {
                return false;
              }
              break;
            }
            case AttributeValueType.Includes: {
              const val = el.getAttribute(token.name);
              if (val === null || !val.includes(token.value)) {
                return false;
              }
              break;
            }
            case AttributeValueType.Sep: {
              const val = el.getAttribute(token.name);
              if (val === null || token.value.split(" ").includes(val)) {
                return false;
              }
              break;
            }
            case AttributeValueType.Suffixed: {
              const val = el.getAttribute(token.name);
              if (val === null || !token.value.endsWith(token.value)) {
                return false;
              }
              break;
            }
          }

          break;
        }
      }
    }
    return true;
  }
}

// const doc = new DOMParser().parseFromString(
//   '<p hello="true">Hello World!</p><p>Hello from <a href="https://deno.land/">Deno!</a></p>',
//   "text/html",
// )!;

// const quiksand = new Quiksand();
// console.log(
//   quiksand.matches(
//     new Lexer().parse("[hello=   true   ]"),
//     doc.querySelector("p")!,
//   ),
// );
