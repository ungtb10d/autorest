/**
 * This is a copy of https://github.com/nodeca/js-yaml/blob/master/lib/common.js LICENSED under MIT
 * Used by yaml-dump.ts.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}

function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}

function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [sequence];
}

function extend(target, source) {
  let index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}

function repeat(string, count) {
  let result = "",
    cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}

function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}

module.exports.isNothing = isNothing;
module.exports.isObject = isObject;
module.exports.toArray = toArray;
module.exports.repeat = repeat;
module.exports.isNegativeZero = isNegativeZero;
module.exports.extend = extend;
