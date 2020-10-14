
import 'regenerator-runtime/runtime';

import {
  Rec, doParsing,
  digit, char, oneOf,
  pair,
  maximalMunchDiscard,
  or, maximalReduce, maximalMunch,
} from "parsing-combinators";

import { nat } from "./number";

// === whitespace ===
const wsSymbol = oneOf([" ", "\t", "\n"]);
const ws = maximalMunchDiscard(wsSymbol);

// non-trivial whitespace
// const $_ = char(" ")._then(_);


// === IDENTIFIERS/LITERALS ===
const _letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+*-_~/!?#$><=:%'";

const letter = oneOf(_letters); // single letter
const letterOrDigit = or(letter, digit); // single letter or digit
const zeroOrMoreLettersOrDigits = maximalMunch(letterOrDigit).map(s => s.join(""));
// console.log(zeroOrMoreLettersOrDigits.consume("abc-fo?! xfoo"))
// console.log(zeroOrMoreLettersOrDigits.consume("  f"))



// === CONSTRUCTORS FOR THE AST ===
function Number(n) {
  return {
    type: "number",
    data: n,
  }
}

function Identifier(idf) {
  return {
    type: "identifier",
    data: idf,
  };
}

function List(xs) {
  return {
    type: "list",
    data: xs,
  };
}


// Parser(LExp)
const lispNat = nat.map(Number);
// console.log(lispNat.consume("123xx"));

// lispIdentifier := letter zero-or-more(letterOrDigit)
// Parser(LExp)


const lispIdentifier = doParsing(function* () {
  const c = yield letter.mapError(c => `Expected Identifier: Identifiers can't start with: ${c}`);
  const rest = yield zeroOrMoreLettersOrDigits;
  return Identifier(c + rest);
});
// console.log(lispIdentifier.consume("foo1"));
// console.log(lispIdentifier.consume("1foo1"));
// examples.
// "123 " // fail
// "a123 " // 'a123', ' '
// " a123" // fail
// TODO:
//  "-123" is valid...
//  "+123" is valid...


const lispPrimitive = or(lispNat, lispIdentifier);
// console.log(lispPrimitive.consume("123x"));
// console.log(lispPrimitive.consume("foo-bar"));

function list(p) {
  return doParsing(function* () {
    yield char("(");
    const xs = yield maximalMunch(ws._then(p));
    yield ws;
    yield char(")");
    return xs;
  });
}
// console.log(list(lispPrimitive).consume("(+ 12 13  )"));

export const lispExpression = Rec(() =>
  or(lispPrimitive, list(lispExpression))
);
// console.log(lispExpression.consume("123"));
// console.log(lispExpression.consume("foo"));
// console.log(lispExpression.consume("(+ 1 2 30)"));
// console.log(lispExpression.consume("(+ (* 20 30) 2 30)"));
// console.log(lispExpression.consume("(+ (* 20 30))"));
// console.log(lispExpression.consume("(+ (* 20 30  )  )"));
