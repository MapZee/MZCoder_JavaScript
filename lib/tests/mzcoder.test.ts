import mzCoder from '../index';

const dictionaryLength = 50;

describe('Test geo coder', () => {
  it('should test alphabet', () => {
    let alphabet = mzCoder.$.alphabet;

    expect(alphabet.length).toBe(dictionaryLength);
    expect(alphabet[0]).toBe('a');
    expect(alphabet[5]).toBe('f');
    expect(alphabet[25 + 1]).toBe('B');
  });

  it('should test septenary alphabet', () => {
    let septenaryAlphabet = mzCoder.$.septenaryAlphabet;

    expect(septenaryAlphabet[0]).toBe('0');
    expect(septenaryAlphabet[6]).toBe('6');
  });

  it('should test code number', () => {
    let codeNumber = mzCoder.$.codeNumber;

    expect(codeNumber(0)).toBe('a');
    expect(codeNumber(dictionaryLength)).toBe('ba');
    expect(codeNumber(dictionaryLength + 1)).toBe('bb');
    expect(codeNumber(5 * dictionaryLength + 5)).toBe('ff');
  });

  it('should test first triple', () => {
    let getFirstTriple = mzCoder.$.getFirstTriple;
    let codeNumber = mzCoder.$.codeNumber;

    expect(getFirstTriple(-90, -180)).toBe('aaa');
    expect(getFirstTriple(0, 0)).toBe(codeNumber(90 + 180 * 180));
    expect(getFirstTriple(90, 180)).toBe(codeNumber(180 + 360 * 180));
  });

  it('should test get code', () => {
    let getCode = mzCoder.getCode;

    expect(getCode(11.342045, 108.682251)).not.toBe('null');
    expect(getCode(11.342045, 108.682251)).toBe('vORtajRcz');
    expect(getCode(-26.273714, 137.109375)).toBe('xSzhHsREm');
  });

  it('should test get coordinates', () => {
    let getCoordinates = mzCoder.decode;
    let coordinates = getCoordinates('tkTsajPcr');

    expect(coordinates).not.toBeNull();
    expect(coordinates.Latitude).toBe(-87.34204);
    expect(coordinates.Longitude).toBe(73.51319);

    coordinates = getCoordinates('vnEwOtxtN');

    expect(coordinates.Latitude).toBe(-41.63278);
    expect(coordinates.Longitude).toBe(101.08654);

    coordinates = getCoordinates('vgChGrPDk');

    expect(coordinates.Latitude).toBe(17.27371);
    expect(coordinates.Longitude).toBe(99.08088);

    coordinates = getCoordinates('aaaaaaaaa');
    expect(coordinates).not.toBeNull();
  });

  it('should test code decode number', () => {
    let code = mzCoder.$.codeNumber(123456789);

    let decodeNumber = mzCoder.$.decodeNumber(code);

    expect(decodeNumber).toBe(123456789);
  });

  it('should test code decode', () => {
    let result = codeDecode(11.00186, 108.21945);

    expect(result.lat).toBe(result.roundedLat);
    expect(result.lng).toBe(result.roundedLng);

    result = codeDecode(11.34204, 108.682251);

    expect(result.lat).toBe(result.roundedLat);
    expect(result.lng).toBe(result.roundedLng);
  });

  it('fill with zeroes test', () => {
    let filledString = mzCoder.$.fillWithZeroesTillLimit('11', 6, '0');

    expect(filledString).toBe('000011');
  });

  it('should test pre defined array of codes', () => {
    let codeTestCases = [
      {
        code: 'funnnnnnn',
        lat: 52.19608,
        lng: -106.9804
      },
      {
        code: 'fxHkerTxv',
        lat: 42.1781,
        lng: -105.60773
      },
      {
        code: 'ySNLCFQEk',
        lat: -33.92884,
        lng: 151.15347
      }
    ];

    for (let testCase of codeTestCases) {
      let decodeResults = mzCoder.decode(testCase.code);
      expect(decodeResults.Latitude).toBe(testCase.lat);
      expect(decodeResults.Longitude).toBe(testCase.lng);

      let code = mzCoder.getCode(testCase.lat, testCase.lng);
      expect(code).toBe(testCase.code);
    }
  });

  it('should test calculating distance between coordinates', () => {
    let getDistance = mzCoder.getDistance;

    expect(getDistance([48.46799, 34.89118], [48.429505, 35.020269], 10)).toBe(10450);
    expect(getDistance([48.46799, 34.89118], [48.429505, 35.020269], 100)).toBe(10500);
    expect(getDistance([59.3293371, 13.4877472], [59.3225525, 13.4619422])).toBe(1649);
    expect(getDistance([59.3293371, 13.4877472], [59.3225525, 13.4619422], 10)).toBe(1650);
    expect(getDistance([52.518611, 13.408056], [55.751667, 37.617778], 100)).toBe(1610500);
  });
});

function codeDecode(lat, lng) {
  let result = {
    lat: null,
    lng: null,
    roundedLat: null,
    roundedLng: null
  };

  let code = mzCoder.getCode(lat, lng);

  let coordinates = mzCoder.decode(code);

  let roundedLat = Number(lat.toFixed(5));
  let roundedLng = Number(lng.toFixed(5));

  result.lat = coordinates.Latitude;
  result.lng = coordinates.Longitude;
  result.roundedLat = roundedLat;
  result.roundedLng = roundedLng;

  return result;
}
