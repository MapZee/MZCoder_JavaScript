var expect = require("chai").expect;
var mzCoder = require("../mzCoder");
var _ = require("lodash");

var dictionaryLength = 50;

describe("Test geo coder", function () {
    before(function () {
    });

    describe("mzCoder", function () {
        it("should test alphabet", function () {
            var alphabet = mzCoder.$.alphabet;

            expect(alphabet.length).to.equal(dictionaryLength);
            expect(alphabet[0]).to.equal("a");
            expect(alphabet[5]).to.equal("f");
            expect(alphabet[25 + 1]).to.equal("B");
        });

        it("should test septenary alphabet", function () {
            var septenaryAlphabet = mzCoder.$.septenaryAlphabet;

            expect(septenaryAlphabet[0]).to.equal("0");
            expect(septenaryAlphabet[6]).to.equal("6");
        });

        it("should test code number", function () {
            var codeNumber = mzCoder.$.codeNumber;

            expect(codeNumber(0)).to.equal("a");
            expect(codeNumber(dictionaryLength)).to.equal("ba");
            expect(codeNumber(dictionaryLength + 1)).to.equal("bb");
            expect(codeNumber(5 * dictionaryLength + 5)).to.equal("ff");
        });

        it("should test first triple", function () {
            var getFirstTriple = mzCoder.$.getFirstTriple;
            var codeNumber = mzCoder.$.codeNumber;

            expect(getFirstTriple(-90, -180)).to.equal("aaa");
            expect(getFirstTriple(0, 0)).to.equal(codeNumber(90 + 180 * 180));
            expect(getFirstTriple(90, 180)).to.equal(codeNumber(180 + 360 * 180));
        });

        it("should test get code", function () {
            var getCode = mzCoder.getCode;

            expect(getCode(11.342045, 108.682251)).to.not.be.a("null");
            expect(getCode(11.342045, 108.682251)).to.equal("vORtajRcz");
            expect(getCode(-26.273714, 137.109375)).to.equal("xSzhHsREm");
        });

        it("should test get coordinates", function () {
            var getCoordinates = mzCoder.decode;
            var coordinates = getCoordinates("tkTsajPcr");

            expect(coordinates).to.not.be.a("null");
            expect(coordinates.Latitude).to.equal(-87.34204);
            expect(coordinates.Longitude).to.equal(73.51319);

            coordinates = getCoordinates("vnEwOtxtN");

            expect(coordinates.Latitude).to.equal(-41.63278);
            expect(coordinates.Longitude).to.equal(101.08654);

            coordinates = getCoordinates("vgChGrPDk");

            expect(coordinates.Latitude).to.equal(17.27371);
            expect(coordinates.Longitude).to.equal(99.08088);

            coordinates = getCoordinates("aaaaaaaaa");
            expect(coordinates).to.not.be.a("null");
        });

        it("should test code decode number", function () {
            var code = mzCoder.$.codeNumber(123456789);

            var decodeNumber = mzCoder.$.decodeNumber(code);

            expect(decodeNumber).to.equal(123456789);
        });

        it("should test code decode", function () {
            var result = codeDecode(11.00186, 108.21945);

            expect(result.lat).to.equal(result.roundedLat);
            expect(result.lng).to.equal(result.roundedLng);

            result = codeDecode(11.34204, 108.682251);

            expect(result.lat).to.equal(result.roundedLat);
            expect(result.lng).to.equal(result.roundedLng);
        });

        it("fill with zeroes test", function () {
            var filledString = mzCoder.$.fillWithZeroesTillLimit("11", 6, "0");

            expect(filledString).to.equal("000011");
        });

        it("should test pre defined array of codes", function () {
            var codeTestCases = [
                {
                    code: "funnnnnnn",
                    lat: 52.19608,
                    lng: -106.98040
                }, {
                    code: "fxHkerTxv",
                    lat: 42.17810,
                    lng: -105.60773
                }, {
                    code: "ySNLCFQEk",
                    lat: -33.92884,
                    lng: 151.15347
                }
            ];

            _.forEach(codeTestCases, function (testCase) {
                var decodeResults = mzCoder.decode(testCase.code);
                expect(decodeResults.Latitude).to.equal(testCase.lat);
                expect(decodeResults.Longitude).to.equal(testCase.lng);

                var code = mzCoder.getCode(testCase.lat, testCase.lng);
                expect(code).to.equal(testCase.code);
            });
        });

        it("should test calculating distance between coordinates", function () {
            var getDistance = mzCoder.getDistance;

            expect(getDistance([48.467990, 34.891180], [48.429505, 35.020269], 10)).to.equal(10450);
            expect(getDistance([48.467990, 34.891180], [48.429505, 35.020269], 100)).to.equal(10500);
            expect(getDistance([59.3293371, 13.4877472], [59.3225525, 13.4619422])).to.equal(1649);
            expect(getDistance([59.3293371, 13.4877472], [59.3225525, 13.4619422], 10)).to.equal(1650);
            expect(getDistance([52.518611, 13.408056], [55.751667, 37.617778], 100)).to.equal(1610500);
        });
    });
});

function codeDecode(lat, lng) {
    var result = {};

    var code = mzCoder.getCode(lat, lng);

    var coordinates = mzCoder.decode(code);

    var roundedLat = Number((lat).toFixed(5));
    var roundedLng = Number((lng).toFixed(5));

    result["lat"] = coordinates.Latitude;
    result["lng"] = coordinates.Longitude;
    result["roundedLat"] = roundedLat;
    result["roundedLng"] = roundedLng;

    return result;
}