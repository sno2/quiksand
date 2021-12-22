import { Lexer } from "./mod.ts";

const lexer = new Lexer();

// {
//   const tokens = lexer.parse("h1:hover  #🚑go💥.foo:hover, .foo, #foo");

//   console.log(tokens);
// }

// {
//   const tokens = lexer.parse("h1[attr] > h1, p ");

//   console.log(tokens);
// }

// {
//   const tokens = lexer.parse("h1[attr]\n, h1 [attr] *  ");

//   console.log(tokens);
// }

// {
//   const tokens = lexer.parse("*  h1 *");

//   console.log(tokens);
// }

/** Rounds to the n-th decimal place. */
function round(num: number, n: number) {
  return Math.round(num * (10 ** n)) / 10 ** n;
}

{
  const ITERS = 1_000_000;
  const start = performance.now();
  for (let i = 0; i < ITERS; i++) {
    lexer.parse('[ abcd  = "asdf3"  ] p');
  }
  const total = performance.now() - start;
  console.log(`${round(total, 5)}ms (${round(total / ITERS, 5)}ms / iter)`);
}
