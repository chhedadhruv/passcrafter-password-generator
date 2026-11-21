import { randomInt } from "./password";

const ADJECTIVES = [
  "brave", "calm", "clever", "cosmic", "crisp", "daring", "eager", "electric",
  "fancy", "fierce", "gentle", "golden", "happy", "hidden", "icy", "jolly",
  "keen", "lively", "lucky", "mellow", "mighty", "nimble", "noble", "odd",
  "plucky", "proud", "quick", "quiet", "rapid", "rustic", "shiny", "silent",
  "sleepy", "smooth", "snowy", "solar", "sunny", "swift", "tidy", "vivid",
  "warm", "wild", "witty", "zesty", "amber", "bold", "breezy", "dusty",
  "frosty", "glowing", "humble", "lunar", "misty", "peppy", "rosy", "stormy",
];

const NOUNS = [
  "badger", "beacon", "bison", "breeze", "canyon", "comet", "coyote", "dolphin",
  "eagle", "ember", "falcon", "fox", "galaxy", "glacier", "harbor", "heron",
  "island", "jaguar", "koala", "lantern", "lynx", "maple", "meadow", "meteor",
  "nebula", "otter", "owl", "panda", "pebble", "phoenix", "pine", "quasar",
  "raven", "river", "robin", "sparrow", "summit", "tiger", "tundra", "valley",
  "voyager", "walrus", "willow", "wolf", "yak", "zephyr", "acorn", "aurora",
  "bamboo", "cedar", "dune", "fjord", "grove", "horizon", "lagoon", "orchid",
];

export const USERNAME_STYLES = ["camel", "snake", "lower"];

const cap = (w) => w[0].toUpperCase() + w.slice(1);

/** options: { style: "camel" | "snake" | "lower", digits: 0-4 } */
export function generateUsername({ style = "camel", digits = 2 } = {}) {
  if (!USERNAME_STYLES.includes(style)) throw new Error("Unknown style");
  if (!Number.isInteger(digits) || digits < 0 || digits > 4) {
    throw new RangeError("digits must be an integer from 0 to 4");
  }
  const a = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const n = NOUNS[randomInt(NOUNS.length)];
  let num = "";
  for (let i = 0; i < digits; i++) num += randomInt(10);

  if (style === "camel") return a + cap(n) + num;
  if (style === "snake") return `${a}_${n}${num ? "_" + num : ""}`;
  return a + n + num;
}
