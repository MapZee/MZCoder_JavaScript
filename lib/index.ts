//used here to convert rational number to integer
declare function parseInt(num: number, radix: number): number;

interface GeoCoordinates {
  Latitude: number;
  Longitude: number;
}

let alphabet = getAlphabet();
let septenaryAlphabet = getSeptenaryAlphabet();

export default {
  validateCode,
  getCode,
  decode,
  getDistance,
  //utils methods
  $: {
    alphabet,
    septenaryAlphabet,
    codeNumber,
    decodeNumber,
    getFirstTriple,
    fillWithZeroesTillLimit
  }
};

function getAlphabet() {
  let result = [];

  //small letters except "l"
  let aChar = 'a';
  let aCharCode = aChar.charCodeAt(0);

  for (let i = 0; i < 26; i++) {
    let ch = String.fromCharCode(aCharCode + i);
    if (ch !== 'l') {
      result.push(ch);
    }
  }

  //capital letters except "I"
  let capitalAChar = 'A';
  let capitalACharCode = capitalAChar.charCodeAt(0);

  for (let i = 0; i < 26; i++) {
    let ch = String.fromCharCode(capitalACharCode + i);
    if (ch !== 'I') {
      result.push(ch);
    }
  }

  return result;
}

function getSeptenaryAlphabet() {
  let result = [];

  //0-9 symbols
  for (let i = 0; i <= 6; i++) {
    result.push(i.toString()[0]);
  }

  return result;
}

function validateCoordinates(lat, lng) {
  if (lat > 90 || lat < -90) {
    return false;
  }

  if (lng > 180 || lng < -180) {
    return false;
  }

  return true;
}

function getCode(lat, lng) {
  if (!validateCoordinates(lat, lng)) {
    throw new Error('wrong coordinates');
  }

  let firstTriple = getFirstTriple(lat, lng);

  let lastTwoTriples = getLastTwoTriples(lat, lng);

  return firstTriple + lastTwoTriples;
}

function getFirstTriple(lat, lng) {
  let latNum = getIntegerPart(lat);
  let lngNum = getIntegerPart(lng);

  let latPart = latNum + 90;
  let lngPart = lngNum + 180;
  lngPart *= 180;

  let numToCode = latPart + lngPart;

  let result = codeNumber(numToCode);

  result = fillWithZeroesTillLimit(result, 3, alphabet[0]);

  return result;
}

function getLastTwoTriples(lat, lng) {
  let result = '';

  let latNum = getRationalPlaces(lat, 5);
  let lngNum = getRationalPlaces(lng, 5);

  let latStrBase7 = convertToSeptenaryNumericalSystem(latNum);
  let lngStrBase7 = convertToSeptenaryNumericalSystem(lngNum);

  latStrBase7 = fillWithZeroesTillLimit(latStrBase7, 6, '0');
  lngStrBase7 = fillWithZeroesTillLimit(lngStrBase7, 6, '0');

  for (let i = 0; i < 6; i++) {
    let combinedStr = '';
    combinedStr += latStrBase7[i];
    combinedStr += lngStrBase7[i];

    let num = parseInt(convertFromSeptenaryNumericalSystem(combinedStr), 10);

    result += codeToSymbol(num, alphabet);
  }

  result = fillWithZeroesTillLimit(result, 6, alphabet[0]);

  return result;
}

function decode(code) {
  let result: GeoCoordinates = <any>{};
  let validationResult = validateCode(code);
  if (validationResult !== '') {
    throw new Error(validationResult);
  }

  let firstTripleNum = decodeNumber(code.substring(0, 3));

  let latPartNum = firstTripleNum % 180;
  result.Latitude = parseInt(latPartNum - 90, 10);

  let lngPartNum = parseInt(firstTripleNum / 180, 10);
  result.Longitude = lngPartNum - 180;

  let latRatBase7 = '';
  let lngRatBase7 = '';
  for (let i = 3; i < 9; i++) {
    let numFromSymbol = decodeNumber(code[i].toString()); //TODO code right here for performance
    let base7 = convertToSeptenaryNumericalSystem(numFromSymbol);
    base7 = fillWithZeroesTillLimit(base7, 2, '0');
    latRatBase7 += base7[0];
    lngRatBase7 += base7[1];
  }

  let latRat = convertFromSeptenaryNumericalSystem(latRatBase7) / 100000;
  let lngRat = convertFromSeptenaryNumericalSystem(lngRatBase7) / 100000;

  result.Latitude += result.Latitude > 0 ? latRat : -latRat;
  result.Longitude += result.Longitude > 0 ? lngRat : -lngRat;

  return result;
}

function codeNumberWithAlphabet(num, alphabet) {
  let result = '';
  let capacity = alphabet.length;
  let leftToCode = num;

  do {
    let toCode = parseInt(leftToCode % capacity, 10);
    result = codeToSymbol(toCode, alphabet) + result;
    leftToCode = parseInt(leftToCode / capacity, 10);
  } while (leftToCode !== 0);

  return result;
}

function codeNumber(num) {
  return codeNumberWithAlphabet(num, alphabet);
}

function decodeNumberWithAlphabet(code, alphabet) {
  let result = 0;
  let capacity = alphabet.length;

  let pow = 1;
  for (let i = code.length - 1; i >= 0; i--) {
    let digit = alphabet.indexOf(code[i]);
    result += digit * pow;
    pow *= capacity;
  }

  return result;
}

function decodeNumber(code) {
  return decodeNumberWithAlphabet(code, alphabet);
}

function convertToSeptenaryNumericalSystem(inputNum) {
  return codeNumberWithAlphabet(inputNum, septenaryAlphabet);
}

function convertFromSeptenaryNumericalSystem(inputStr) {
  return decodeNumberWithAlphabet(inputStr, septenaryAlphabet);
}

function getRationalPlaces(num, numberOfPlaces) {
  let digitsDeterminator = Math.pow(10, numberOfPlaces);
  return round(Math.abs(num - getIntegerPart(num)) * digitsDeterminator);
}

function fillWithZeroesTillLimit(str, limit, zeroSymbol) {
  let iterations = limit - str.length;

  if (iterations <= 0) return str;

  for (let i = 0; i < iterations; i++) {
    str = zeroSymbol + str;
  }

  return str;
}

function codeToSymbol(symbolNumber, alphabet) {
  //TODO check
  return alphabet[symbolNumber];
}

function getIntegerPart(num) {
  return parseInt(num, 10);
}

function round(num) {
  let intPart = getIntegerPart(num);
  if (num - intPart === 0.5) {
    num += 0.1;
  }
  return Math.round(num);
}

function validateCode(code) {
  let regex = /^[a-zA-Z]*$/;

  let isCodeValid = !(code.indexOf('l') > -1 || code.indexOf('I') > -1 || code.indexOf('Z') > -1);

  let firstTripleNum = decodeNumber(code.substring(0, 3));
  let latitude = parseInt(firstTripleNum % 180 - 90, 10);
  let longitude = parseInt(firstTripleNum / 180 - 180, 10);
  let isCoordinatesValid = validateCoordinates(latitude, longitude);

  if (code.length !== 9) {
    return 'LENGTH_ERROR';
  }
  if (!regex.exec(code)) {
    return 'WRONG_LETTERS_ERROR';
  }
  if (!isCodeValid || !isCoordinatesValid) {
    return 'INVALID_COORDINATES_ERROR';
  }
  return '';
}

function getDistance(start, end, accuracy = 1) {
  accuracy = Math.floor(accuracy) || 1;

  let latStart = toRad(start[0]);
  let lngStart = toRad(start[1]);
  let latEnd = toRad(end[0]);
  let lngEnd = toRad(end[1]);

  let distance = Math.round(
    Math.acos(
      Math.sin(latEnd) * Math.sin(latStart) + Math.cos(latEnd) * Math.cos(latStart) * Math.cos(lngStart - lngEnd)
    ) * 6378137
  );

  distance = Math.floor(Math.round(distance / accuracy) * accuracy);

  return distance;
}

function toRad(num) {
  return num * Math.PI / 180;
}
