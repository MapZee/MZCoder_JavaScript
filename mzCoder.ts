///<reference path="typings/node/node.d.ts"/>
//used here to convert rational number to integer
declare function parseInt(number: number): number;

interface IGeoCoordinates {
    Latitude: number;
    Longitude: number;
}

var geoCoder = function(){
    var alphabet = getAlphabet();
    var septenaryAlphabet = getSeptenaryAlphabet();

    function getAlphabet() {
        var _alphabet = [];

        //small letters except "l"
        var a_char = "a";
        var a_CharCode = a_char.charCodeAt(0);

        for (var i = 0; i < 26; i++)
        {
            var ch = String.fromCharCode(a_CharCode + i);
            if(ch != 'l') {
                _alphabet.push(ch);
            }
        }

        //capital letters except "I"
        var A_char = "A";
        var A_CharCode = A_char.charCodeAt(0);

        for (var i = 0; i < 26; i++)
        {
            var ch = String.fromCharCode(A_CharCode + i);
            if(ch != 'I') {
                _alphabet.push(ch);
            }
        }

        return _alphabet;
    }

    function getSeptenaryAlphabet() {
        var _septenaryAlphabet = [];

        //0-9 symbols
        for (var i = 0; i <= 6; i++)
        {
            _septenaryAlphabet.push(i.toString()[0]);
        }
        return _septenaryAlphabet;
    }

    function validateCoordinates(lat, lng) {
        if (lat > 90 || lat < -90)
        {
            return false;
        }

        if (lng > 180 || lng < -180)
        {
            return false;
        }

        return true;
    }

    function getCode(lat, lng) {
        if (!validateCoordinates(lat, lng))
        {
            throw new Error("wrong coordinates");
        }

        var firstTriple = getFirstTriple(lat, lng);

        var lastTwoTriples = getLastTwoTriples(lat, lng);

        return firstTriple + lastTwoTriples;
    }

    function getFirstTriple(lat, lng) {
        var latNum = getIntegerPart(lat);
        var lngNum = getIntegerPart(lng);

        var latPart = latNum + 90;
        var lngPart = lngNum + 180;
        lngPart *= 180;

        var numToCode = latPart + lngPart;

        var result = codeNumber(numToCode);

        result = fillWithZeroesTillLimit(result, 3, alphabet[0]);

        return result;
    }

    function getLastTwoTriples(lat, lng) {
        var result = "";

        var latNum = getRationalPlaces(lat, 5);
        var lngNum = getRationalPlaces(lng, 5);

        var latStrBase7 = convertToSeptenaryNumericalSystem(latNum);
        var lngStrBase7 = convertToSeptenaryNumericalSystem(lngNum);

        latStrBase7 = fillWithZeroesTillLimit(latStrBase7, 6, '0');
        lngStrBase7 = fillWithZeroesTillLimit(lngStrBase7, 6, '0');

        for (var i = 0; i < 6; i++) {
            var combinedStr = "";
            combinedStr += latStrBase7[i];
            combinedStr += lngStrBase7[i];

            var num = parseInt(convertFromSeptenaryNumericalSystem(combinedStr));

            result += codeToSymbol(num, alphabet);
        }

        result = fillWithZeroesTillLimit(result, 6, alphabet[0]);

        return result;
    }

    function decode(code) {
        var result: IGeoCoordinates = <any>{};
        var validationResult = validateCode(code);
        if(validationResult !== "") {
            throw new Error(validationResult);
        }

        var firstTripleNum = decodeNumber(code.substring(0, 3));

        var latPartNum = firstTripleNum % 180;
        result.Latitude = parseInt(latPartNum - 90);

        var lngPartNum = parseInt(firstTripleNum / 180);
        result.Longitude = lngPartNum - 180;

        var latRatBase7 = "";
        var lngRatBase7 = "";
        for (var i = 3; i < 9; i++)
        {
            var numFromSymbol = decodeNumber(code[i].toString()); //TODO code right here for performance
            var base7 = convertToSeptenaryNumericalSystem(numFromSymbol);
            base7 = fillWithZeroesTillLimit(base7, 2, '0');
            latRatBase7 += base7[0];
            lngRatBase7 += base7[1];
        }

        var latRat = convertFromSeptenaryNumericalSystem(latRatBase7) / 100000;
        var lngRat = convertFromSeptenaryNumericalSystem(lngRatBase7) / 100000;

        result.Latitude += result.Latitude > 0 ? latRat : -latRat;
        result.Longitude += result.Longitude > 0 ? lngRat : -lngRat;

        return result;
    }

    function codeNumberWithAlphabet(number, alphabet) {
        var result = "";
        var capacity = alphabet.length;
        var leftToCode = number;

        do {
            var toCode = parseInt(leftToCode % capacity);
            result = codeToSymbol(toCode, alphabet) + result;
            leftToCode = parseInt(leftToCode / capacity);

        } while (leftToCode != 0);

        return result;
    }

    function codeNumber(number) {
        return codeNumberWithAlphabet(number, alphabet);
    }

    function decodeNumberWithAlphabet(code, alphabet) {
        var result = 0;
        var capacity = alphabet.length;

        var pow = 1;
        for (var i = code.length - 1; i >= 0; i--)
        {
            var digit = alphabet.indexOf(code[i]);
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
        var digitsDeterminator =  Math.pow(10, numberOfPlaces);
        return round(Math.abs(num - getIntegerPart(num)) * digitsDeterminator);
    }

    function fillWithZeroesTillLimit(str, limit, zeroSymbol) {
        var iterations = limit - str.length;

        if (iterations <= 0) return str;

        for (var i = 0; i < iterations; i++)
        {
            str = zeroSymbol + str;
        }

        return str;
    }

    function codeToSymbol(symbolNumber, alphabet) {
        //TODO check
        return alphabet[symbolNumber];
    }

    function getIntegerPart(num) {
        return parseInt(num);
    }

    function round(num) {
        var intPart = getIntegerPart(num);
        if (num - intPart == 0.5)
        {
            num += 0.1;
        }
        return Math.round(num);
    }

    function validateCode(code) {
        var regex = /^[a-zA-Z]*$/;

        var isCodeValid = !(code.indexOf("l") > -1 || code.indexOf("I") > -1 || code.indexOf("Z") > -1);

        var firstTripleNum = decodeNumber(code.substring(0, 3));
        var latitude = parseInt((firstTripleNum % 180) - 90);
        var longitude = parseInt((firstTripleNum / 180) - 180);
        var isCoordinatesValid = validateCoordinates(latitude, longitude);

        if (code.length != 9) {
            return "LENGTH_ERROR";
        }
        if (!regex.exec(code)) {
            return "WRONG_LETTERS_ERROR";
        }
        if(!isCodeValid || !isCoordinatesValid) {
            return "INVALID_COORDINATES_ERROR";
        }
        return "";
    }

    function getDistance(start, end, accuracy) {
        accuracy = Math.floor(accuracy) || 1;

        var latStart = toRad(start[0]);
        var lngStart = toRad(start[1]);
        var latEnd = toRad(end[0]);
        var lngEnd = toRad(end[1]);

        var distance =
            Math.round(
                Math.acos(
                    Math.sin(
                        latEnd
                    ) *
                    Math.sin(
                        latStart
                    ) +
                    Math.cos(
                        latEnd
                    ) *
                    Math.cos(
                        latStart
                    ) *
                    Math.cos(
                        lngStart - lngEnd
                    )
                ) * 6378137
            );

        distance = Math.floor(Math.round(distance/accuracy)*accuracy);

        return distance;
    }

    function toRad(number) {
        return number * Math.PI / 180;
    }

    return {
        validateCode: validateCode,
        getCode: getCode,
        decode: decode,
        getDistance: getDistance,
        //utils methods
        $: {
            alphabet: alphabet,
            septenaryAlphabet: septenaryAlphabet,
            codeNumber: codeNumber,
            decodeNumber: decodeNumber,
            getFirstTriple: getFirstTriple,
            fillWithZeroesTillLimit: fillWithZeroesTillLimit
        }
    }
}();

module.exports = geoCoder;