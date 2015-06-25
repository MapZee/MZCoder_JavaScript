# MapZee Code

MapZee Code later *MZ code* is an open standard to represent GEO location coordinates as a letter code. MZ code is much shorter and easier to use than full GPS coordinates in WGS84.

Geo location in WGS84 with an accuracy of 5 decimal places is represented as 9 Latin letters MZ code. 

For example WGS84 location(lat, lng): (-33.82827, 151.10137) becomes "ySNDWxzvx" MZ code. 

Letters can be in lower/upper case. Letters 'I' and 'l' are not allowed. That is done because in many fonts they look almost identical and it can be confusing.

First 3 letters of the code represent integer part of latitude and longitude. Letter 4-9 of the code represent rational part of latitude/longitude. Code is encoded in such a way, that each following letter gives larger precision on both latitude/longitude. 

Below is table with precision which gives each following letter of MZ Code:


Code Letters | Precision
--- | :---:
1-3 |	111 km
4 |	18.68 km
5 | 2.67 km
6 |	0.38 km
7 | 54.5 m
8 | 7.7 m
9 | 1.1 m

So MZ standard allows 1 or 2 last letters of 9 digit code to be omitted, if there is not need for high accuracy.

##Algorithm

###Encoding

First 3 letters calculation. 

Let's put latInt and lngInt as integer part of latitude and longitude respectively. Then we calculate single number, which determines both lat/lng integer part as following:

latLngNum = (lngInt + 180)*180 + (latInt + 90)

Note that (latInt + 90) belongs to interval [0, 180] and (lngInt + 180) to [0, 360]. 

We encode latLngNum to our working alphabet ([a-z, A-Z] except {'l', 'I'}) as converting to number system with a base equal to length of alphabet and replacing digits of that number with corresponding letters from alphabet.

For our alphabet length is 50 = 26(lower) + 26(upper) - 2('l','I').

symbol | represent number
:---: | :---:
a | 0
b | 1
... | ...
z | 24
A | 25
... | ...
Z | 49

So for example for location(lat, lng): (-33.82827, 151.10137)

latInt = -33, lngInt = 151
latLngNum = (151 + 180)*180 + (-33 + 90) = 59637 = 50*50*23 + 50*42 + 37
latLngNumCode = ySN

Last 6 letters. Let's put latRatio and lngRatio as rational part of latitude and longitude respectively. Then we convert latRatio and lngRatio to numeric system with a base of 7 (septenary numeric system).

For our example (-33.82827, 151.10137)

latRatio = 0.82827
lngRatio = 0.10137

latRatioBase7 = 0.463323
lngRatioBase7 = 0.041361

Then for each following code letter we combine rational digit from latRatioBase7 and lngRatioBase7 and consider it to be number in septenary numeric system which we convert to decimal numeric system and then find corresponding letter in working alphabet.

We combine digits for first digit after the point, then for second, etc. So for our example it will go as following (4 and 0, 6 and 4, 3 and 1, etc)

So:

6th letter is 'D' : 4(latDigit) + 0(lngDigit) => 40(septenary) => 28(decimal) => letter 'D' (with number 28 in working alphabet)

7th letter is 'W' : 6(latDigit) + 4(lngDigit) => 64(septenary) => 46(decimal) => letter 'W' (with number 46 in working alphabet)

...

###Decoding

After encoding algorithm description it should not be hard to figure out decoding algorithm. So decoding description is shorter.

From first triple of letters we receive latLngNum.

Then receive latInt, lngInt as following:

latInt = (latLngNum % 180) - 90
lngInt = (latLngNum / 180) - 180

(% - Modulus Operator, / - numeric devision operator)

For rational part:

We calculate latRatioBase7 and lngRatioBase7, by decoding each MZ code letter to decimal number, then receive corresponding septenary number and first digit will be latitude digit and second will be longitude digit.

Then we convert latRatioBase7 and lngRatioBase7 to latRatio and lngRatio by converting from septenary to decimal numeric system.
