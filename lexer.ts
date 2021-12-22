import {
  Dir,
  parsePseudoClassType,
  PseudoClassType,
} from "./constants/pseudo_class.ts";
import { PseudoElement } from "./constants/pseudo_element.ts";

/** The result and the number of characters taken. */
type IResult<T> = [T, number];

export const enum TokenType {
  Tag,
  Class,
  Id,
  MeshSelect,
  PseudoClass,
  PseudoElement,
  Combinator,
  GroupSeparator,
  Attribute,
  Universal,
}

/** https://www.w3.org/TR/selectors-4/#case-sensitive */
function isWhitespace(ch: string) {
  switch (ch) {
    case " ":
    case "\x20":
    case "\t":
    case "\r":
    case "\n":
    case "\f":
      return true;
    default:
      return false;
  }
}

/**
 * Note: Does not include whitespace for descendant combinator but includes
 * group separator character for ease of use in codebase.
 */
function isCombinatorChar(ch: string): boolean {
  switch (ch) {
    case ",":
    case ">":
    case "+":
    case "~":
      return true;
    default:
      return false;
  }
}

function isDigit(ch: string) {
  switch (ch) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return true;
    default:
      return false;
  }
}

/** Checks if the character has a reserved use. */
function isReservedChar(ch: string) {
  switch (ch) {
    case ":":
    case ",":
    case "+":
    case "~":
    case ">":
    case "#":
    case ".":
    case "=":
    case "(":
    case ")":
    case "[":
    case "]":
    case "|":
    case "*":
    case "^":
    case "$":
    case (isWhitespace(ch) ? ch : 0):
      return true;
    default:
      return false;
  }
}

export const enum CombinatorType {
  Descendant,
  Child,
  NextSibling,
  SubsequentSibling,
  // TODO: add column combinator once stable
}

/** https://drafts.csswg.org/selectors-4/#attribute-selectors */
export const enum AttributeValueType {
  /** = */
  Exact,
  /** ~= */
  Sep,
  /** |= */
  PrefixedDash,
  /** ^= */
  Prefixed,
  /** $= */
  Suffixed,
  /** *= */
  Includes,
}

type SpecificPseudoClassToken = {
  type: TokenType.PseudoClass;
  name: PseudoClassType.Dir;
  dir: Dir;
} | {
  type: TokenType.PseudoClass;
  name:
    | PseudoClassType.NthChild
    | PseudoClassType.NthLastChild
    | PseudoClassType.NthOfType
    | PseudoClassType.NthLastOfType;
  interval: CSSStepInterval;
};

export type Token =
  | {
    type: TokenType.Class | TokenType.Id;
    value: string;
  }
  | {
    type: TokenType.PseudoClass;
    name: Exclude<PseudoClassType, SpecificPseudoClassToken["name"]>;
  }
  | SpecificPseudoClassToken
  | {
    type: TokenType.PseudoElement;
    name: PseudoElement;
  }
  | {
    type: TokenType.Combinator;
    combinator: CombinatorType;
  }
  | {
    type: TokenType.GroupSeparator;
  }
  | {
    type: TokenType.Tag;
    name: string;
  }
  | (
    & {
      type: TokenType.Attribute;
    }
    & ({ valueType: null; name: string } | {
      valueType: AttributeValueType;
      name: string;
      value: string;
    })
  )
  | { type: TokenType.Universal };

/** An+B */
export interface CSSStepInterval {
  a: number;
  b: number;
}

/** The class for parsing selectors w/o copying. */
export class Lexer {
  parseIdent(
    input: string,
    i: number,
  ): string {
    const start = i;
    while (1) {
      const ch = input[i];

      if (ch === undefined) {
        if (start - i === 0) {
          throw this.createError(input);
        }
        return input.slice(start, i);
      }

      // check to make sure it starts with a valid character
      if (start - i === 0) {
        switch (ch) {
          case (isReservedChar(ch) ? ch : 0):
          case "-":
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            throw this.createError(input);
          }
        }
      }

      if (isReservedChar(ch)) {
        return input.slice(start, i);
      }

      i += 1;
    }
    // deno-lint-ignore no-unreachable
    throw this.createError(input);
  }

  createError(input: string) {
    return new DOMException(
      `Uncaught DOMException: '${input}' is not a valid selector`,
      "SyntaxError",
    );
  }

  /**
   * Tries to parse some text from
   */
  // @ts-expect-error ts isn't smart enough...yet
  parseMaybeString(input: string, i: number): [string, number] {
    let quoteType: "'" | '"' | null = null;

    switch (input[i]) {
      case '"': {
        quoteType = '"';
        i++;
        break;
      }
      case "'": {
        quoteType = "'";
        i++;
        break;
      }
    }

    if (quoteType === null) {
      const ident = this.parseIdent(input, i);
      return [ident, ident.length];
    }

    const start = i;

    while (1) {
      switch (input[i]) {
        case undefined: {
          throw this.createError(input);
        }
        case quoteType: {
          const s = input.slice(start, i);
          return [s, s.length + 2];
        }
        default: {
          i++;
        }
      }
    }
  }

  parseInteger(input: string, start = 0): IResult<number> {
    let taken = 0;
    let i = start;

    if (input[i] === "-" || input[i] === "+") {
      i++;
      taken++;
    }

    while (isDigit(input[i])) {
      i++;
      taken++;
    }

    return [
      parseInt(input.slice(start, start + taken)),
      taken,
    ];
  }

  /** [An+B Microsyntax](https://www.w3.org/TR/css-syntax-3/#anb-microsyntax) */
  parseStepInterval(input: string, i = 0): [CSSStepInterval, number] {
    while (isWhitespace(input[i])) {
      i++;
    }

    const [firstN, taken1] = this.parseInteger(input, i);
    i += taken1;
    const initialFinish = i;

    while (isWhitespace(input[i])) {
      i++;
    }

    if (input[i] !== "n") {
      return [{ a: 0, b: firstN }, initialFinish];
    }

    i++;

    while (isWhitespace(input[i])) {
      i++;
    }

    const [secondN, taken2] = this.parseInteger(input, i);
    i += taken2;

    return [{ a: firstN, b: secondN }, i];
  }

  parse(input: string) {
    const tokens: Token[] = [];

    main:
    for (let i = 0;;) {
      const ch = input[i];

      switch (ch) {
        // Parse the class '.'
        case ".": {
          const value = this.parseIdent(input, ++i);
          i += value.length;
          tokens.push({
            type: TokenType.Class,
            value,
          });
          break;
        }
        // Parse the id '#'
        case "#": {
          const value = this.parseIdent(input, ++i);
          i += value.length;
          tokens.push({
            type: TokenType.Id,
            value,
          });
          break;
        }
        // Parse an attribute
        case "[": {
          i++; // skip for '['

          while (isWhitespace(input[i])) {
            i++;
          }

          const name = this.parseIdent(input, i);
          i += name.length;

          while (isWhitespace(input[i])) {
            i++;
          }

          // short-circuit - only provided name
          if (input[i] === "]") {
            i++;
            tokens.push({
              type: TokenType.Attribute,
              name,
              valueType: null,
            });
            break;
          }

          let value: null | string = null;
          let valueType: AttributeValueType | null = null;

          switch (input[i]) {
            case "=": {
              i++; // skip for '='

              while (isWhitespace(input[i])) {
                i++;
              }

              const [val, taken] = this.parseMaybeString(input, i);
              i += taken;

              while (isWhitespace(input[i])) {
                i++;
              }

              value = val;
              valueType = AttributeValueType.Exact;
              break;
            }
            default: {
              if (input[i + 1] !== "=") {
                throw this.createError(input);
              }

              switch (input[i]) {
                case "~": {
                  valueType = AttributeValueType.Sep;
                  break;
                }
                case "|": {
                  valueType = AttributeValueType.PrefixedDash;
                  break;
                }
                case "^": {
                  valueType = AttributeValueType.Prefixed;
                  break;
                }
                case "$": {
                  valueType = AttributeValueType.Suffixed;
                  break;
                }
                case "*": {
                  valueType = AttributeValueType.Includes;
                  break;
                }
              }

              i += 2; // skip for two ops

              while (isWhitespace(input[i])) {
                i++;
              }

              const [val, taken] = this.parseMaybeString(input, i);
              i += taken;
              value = val;
            }
          }

          while (isWhitespace(input[i])) {
            i++;
          }

          if (input[i++] !== "]") {
            throw this.createError(input);
          }

          tokens.push({
            type: TokenType.Attribute,
            valueType,
            name,
            value,
          });
          break;
        }
        // Parse the comma for a group
        case ",": {
          i++;
          tokens.push({
            type: TokenType.GroupSeparator,
          });
          break;
        }
        // Parse the greater than sign for child combinator
        case ">": {
          i++;
          tokens.push({
            type: TokenType.Combinator,
            combinator: CombinatorType.Child,
          });
          break;
        }
        // Parse the plus sign for next-sibling combinator
        case "+": {
          i++;
          tokens.push({
            type: TokenType.Combinator,
            combinator: CombinatorType.NextSibling,
          });
          break;
        }
        // Parse the tilda for subsequent-sibling combinator
        case "~": {
          i++;
          tokens.push({
            type: TokenType.Combinator,
            combinator: CombinatorType.SubsequentSibling,
          });
          break;
        }
        // Parse pseudo-class / pseudo-element
        case ":": {
          i++; // inc for first ':'

          // Note: this does not ensure that it must be a pseudo class if false
          // because of compat allowing single colon for pseudo elements. We
          // simply know it must be a pseudo element if this is true.
          const isPseudoElement = input[i + 1] === ":";
          const name = this.parseIdent(
            input,
            isPseudoElement ? ++i : i, // allow extra ':' for backwards-compat
          );
          i += name.length;

          const pseudoName = parsePseudoClassType(name);
          if (pseudoName === null) {
            throw this.createError(input);
          }

          switch (pseudoName) {
            case PseudoClassType.Dir: {
              if (input[i++] !== "(") {
                throw this.createError(input);
              }

              while (isWhitespace(input[i])) {
                i++;
              }

              const ident = this.parseIdent(input, i);
              i += ident.length;

              let dir: Dir | null = null;
              switch (ident) {
                case "rtl": {
                  dir = Dir.Rtl;
                  break;
                }
                case "ltr": {
                  dir = Dir.Ltr;
                  break;
                }
              }

              while (isWhitespace(input[i])) {
                i++;
              }

              if (input[i++] !== ")") {
                throw this.createError(input);
              }

              // it's fine if the ident isn't valid - just skip
              if (dir === null) {
                break;
              }

              tokens.push({
                type: TokenType.PseudoClass,
                name: pseudoName,
                dir,
              });

              break;
            }
            case PseudoClassType.NthChild:
            case PseudoClassType.NthLastChild:
            case PseudoClassType.NthOfType:
            case PseudoClassType.NthLastOfType: {
              if (input[i++] !== "(") {
                throw this.createError(input);
              }

              while (isWhitespace(input[i])) {
                i++;
              }

              const [incrementor, taken] = this.parseStepInterval(input, i);
              i = taken;

              while (isWhitespace(input[i])) {
                i++;
              }

              if (input[i++] !== ")") {
                throw this.createError(input);
              }

              tokens.push({
                type: TokenType.PseudoClass,
                // @ts-expect-error doesn't work for some reason
                name: pseudoName,
                incrementor,
              });

              break;
            }
            // TODO: lang, current
            default: {
              tokens.push({ type: TokenType.PseudoClass, name: pseudoName });
              break;
            }
          }

          break;
        }

        // Parse universal character

        case "*": {
          i++;
          const lastToken = tokens[tokens.length - 1];

          switch (lastToken?.type) {
            // only allowed after beginning (trimmed), group sep, or combinator
            case undefined:
            case TokenType.GroupSeparator:
            case TokenType.Combinator: {
              break;
            }
            default: {
              throw this.createError(input);
            }
          }

          tokens.push({
            type: TokenType.Universal,
          });
          break;
        }
        // Parse whitespace and check if should be used as descendant
        // combinator
        case (isWhitespace(ch) ? ch : 0): {
          const start = i;
          while (isWhitespace(input[i])) {
            i++;
          }

          // only include descendant operator if either side is a combinator char
          if (
            start !== 0 && i !== input.length &&
            !isCombinatorChar(input[start - 1]) &&
            !isCombinatorChar(input[i])
          ) {
            tokens.push({
              type: TokenType.Combinator,
              combinator: CombinatorType.Descendant,
            });
          }
          break;
        }
        case undefined: {
          break main;
        }
        // try to parse as tag name
        default: {
          const start = i;

          while (1) {
            const ch = input[i];
            if (ch === undefined || isReservedChar(ch)) {
              // can't have a tag be empty
              if (start === i) {
                throw this.createError(input);
              }
              break;
            }
            i++;
          }

          tokens.push({
            type: TokenType.Tag,
            name: input.slice(start, i),
          });
        }
      }
    }

    if (tokens.length === 0) {
      throw this.createError(input);
    }

    // We should do a post-validation to make sure they aren't using more than
    // one universal selector per compound selector. However, none of the modern
    // browsers are doing this so I think we'll just keep it as-is.

    // See https://drafts.csswg.org/selectors-4/#the-universal-selector

    // let universalSelecCount = 0;
    // for (const token of tokens) {
    //   switch (token.type) {
    //     case TokenType.Combinator: {
    //       if (universalSelecCount > 1) {
    //         throw this.createError(input);
    //       }
    //       universalSelecCount = 0;
    //       break;
    //     }
    //     case TokenType.Universal: {
    //       universalSelecCount++;
    //       break;
    //     }
    //   }
    // }

    return tokens;
  }
}
