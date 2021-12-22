import { Lexer } from "./mod.ts";

const lexer = new Lexer();

// {
//   const tokens = lexer.parse("h1:hover  #🚑go💥.foo:hover, .foo, #foo");

//   console.log(tokens);
// }

{
  const tokens = lexer.parse("h1[name='a123 5']:hover:dir(rtl)");

  console.log(tokens);
}

{
  const tokens = lexer.parse(
    'h1[attr="hello 123"]:dir(  ltr)\n p, h1 + [attr] #a🚗b , h2  ',
  );

  console.log(tokens);
}

{
  const tokens = lexer.parse("h1:nth-of-type(-5n+2)");
  console.log(tokens);
}
