# ACO Loader Bar Generator
---

Live preview [here](https://webdeveloperukraine.github.io/acoloader/index.html)
ACO Loader is a tool that allows you to generate Assassin's Creed Origins loader bar, or any another similar loaders with huge customization options.

![](https://webdeveloperukraine.github.io/acoloader/imgs/aco.png)

Libruary based on [WebGL](https://en.wikipedia.org/wiki/WebGL) canvas engine. See the browser compatibility [here](https://caniuse.com/#feat=webgl).

## Table of Contest
* [How To Use](#how-to-use)
* [How To Customize](#how-to-customize)
* [Available Option Parameters](#available-option-parameters)
    * [speed](#speed)
    * [scale](#scale)
    * [color](#color)
    * [fadeColor](#fadecolor)
    * [gapColor](#gapcolor)
    * [anglesCount](#anglescount)
    * [shortLineLength](#shortlinelength)
    * [longLineLength](#longlinelength)
    * [lineTypesCount](#linetypescount)
    * [shortLineTime](#shortlinetime)
    * [longLineTime](#longlinetime)
    * [maxLength](#maxlength)
    * [lineWidth](#linewidth)
    * [fastRotateAngle](#fastrotateangle)
    * [slowRotateAngle](#slowrotateangle)
    * [rotateTypesCount](#rotatetypescount)
    * [fastRotateTime](#fastrotatetime)
    * [slowRotateTime](#slowrotatetime)
    * [gapWidth](#gapwidth)
    * [gapTime](#gaptime)
    * [gapTimeout](#gaptimeout)
* [Available Object Instance Methods](#available-object-instance-methods)
    * [setSettings](#setsettingsoptions-object)
    * [play](#play)
    * [stop](#stop)
    * [pause](#pause)
* [Available Object Instance Attributes](#available-object-instance-attributes)
    * [settings](#settings)
    * [DOM](#dom)
* [Tips And Hints](#tips-and-hints)
* [Some Cool Examples](#some-cool-examples)
* [License](#license)

## How To Use
---

Include the libruary file to your page
```
<script src="./lib/l.js"></script>
```
Create the Loading Object with ```new``` identifier.
```
let l = new ACOLoading();
```
Append the loading DOM anywhere you want
```
document.querySelector('#loader').appendChild(l.DOM);
```
And Start the Animation
```
l.play();
```
That's it :)

## How To Customize
---

```ACOLoading``` Construcotor accept one options parameter with `Object` type to be passed.
Or after object has initialized you can use `setSettings` method that accepts the same parameter as constructor, or you can set each options parameter manually throught the `settings` attribute.

For example:
```
let l = new ACOLoading({speed: 2, scale: 1.5});
```
Or
```
let l = new ACOLoading();
l.setSettings({speed: 2, scale: 1.5});
```
Or
```
let l = new ACOLoading();
l.settings.scale = 1.5;
l.settings.speed = 2;
```
All this examples works the same.


## Available Option Parameters
---

#### `speed` 
default: `1`
float value that means the speed of overral animation. If set to `2` the animation will be 2 times faster, if set to `0.5` the sanimation will be 2 times slower.

#### `scale`
default: `1`
float value that means the size of loader. If set ot `2` the the size of loader will be 2 times biggest, if set to `0.5` the loader will be 2 times smaller.

#### `color`
default: `#fef565`
Color of birth (appearing) end of animation. Initial color value of line gradient.

#### `fadeColor`
default: `ff3500`
Color of fade (disappearing) end of animation. Endest color value of line gradient.
Alpha is always `0` here.

#### `gapColor`
default: `rgba(0,0,0,0)`
Color of animated gap that slides throught the line

#### `anglesCount`
default: `3`
Number of angles of the polygon. Minimal value is `3`, if set to `4` the result shape will be a square, if set to `5` the result shape will be a pentagon, etc.

#### `shortLineLength`
default: `50`
The length (in pixels) of shortest line (polygon side) of animation progress.

#### `longLineLength`
default: `62`
The length (in pixels) of longest line (polygot side) pf animation progress.

#### `lineTypesCount`
default: `2`
The number of different line lengths of animation. By default animation progressing with 2 different lines: biggest (`longLineLength`) and smallest (`shortLineLength`), if set value to `3`, then animation will progress with one more different line with length of avarage value. Same algorithm for highest values.

#### `shortLineTime`
default: `350`
The speed (in milliseconds) of smallest line (polygon side) of animation progress.

#### `longLineTime`
default: `350`
The speed (in milliseconds) of biggest line (polygon side) of animation progress.

#### `maxLength`
default: `250`
The length (in pixels) of visible part of polygon.

#### `lineWidth`
default: `6`
The width (in pixels) of lines (polygon sides).

#### `fastRotateAngle`
default: `Math.PI/3 - Math.PI*2/54`
The angle (in rad) of fastest rotation of animation progress.

#### `slowRotateAngle`
default: `Math.PI*2/54`
The angle (in rad) of slowest rotate of animation progress.

#### `rotateTypesCount`
default: `2`
The number of different line rotate angles of animation. By default animation progressing with 2 different angles: biggest (fastRotateAngle) and smallest (slowRotateAngle), changing this value works the same as `lineTypesCount` attribute.

#### `fastRotateTime`
default: `525`
The speed (in milliseconds) of fastest rotation angle of the animation progress.

#### `slowRotateTime`
default: `175`
The speed (in milliseconds) of slowest rotation angle of the animation progress.

#### `gapWidth`
default: `3`
The width (in pixels) of gap that slides throught the line.

#### `gapTime`
default: `2100`
The speed (in milliseconds) of gap that slides throught the line.

#### `gapTimeout`
default: `0`
The time before the next gap sliding iteration.

## Available Object Instance Methods
---
#### `setSettings(options: Object)`
Allows you to set options of loading animation.

#### `play()`
Will start animation progress

#### `stop()`
Will stop animation progress

#### `pause()`
Will pause animation progress


## Available Object Instance Attributes
---
#### `settings`
Object that allows you to set or change any parameter of options object.

#### `DOM`
Readonly attribute, that returns you the DOM element of loader animation

## Tips And Hints
---
Color values (for `color`, `fadeColor` and `gapColor`) can be passed in 2 differents color formats - hex (for example `#fff` or `#ffffff` or even with alpha channel `#ffffff00`) and rgb or rgba (for example `rgb(255,255,255)` or `rgba(255,255,255,0)`)

You can change any parameter of option object through the `setSettings` method or `settings` attribute in any time you want. The animation will not be stopped, but will adapt to the new parameters immediately.

Be care of setting unlogical limits like `anglesCount: 1` or `lineTypesCount: 1` , I don't think it will works properly, probably some of them can freeze tab UI.

## Some Cool Examples
---

##### First one called "Star"
![](https://webdeveloperukraine.github.io/acoloader/imgs/star.jpg)
```
var l = new ACOLoading({
    anglesCount: 5,
    shortLineLength: 5,
    longLineLength: 70,
    maxLength: 430,
    longLineTime: 100,
    color: '#ffee12',
    fadeColor: '#c9006e'
});
```

##### Second one called "Fractangles"
![](https://webdeveloperukraine.github.io/acoloader/imgs/fraktangles.jpg)
```
var l = new ACOLoading({
    shortLineLength: 15,
    longLineLength: 100,
    maxLength: 830,
    gapWidth: 0,
    lineWidth: 4,
    lineTypesCount: 5,
    longLineTime: 100,
    color: '#0f12c1',
    fadeColor: '#c90000'
});
```

##### Third one called "Freak Petals"
![](https://webdeveloperukraine.github.io/acoloader/imgs/freakpetals.jpg)
```
var l = new ACOLoading({
	anglesCount: 6,
    shortLineLength: 10,
    maxLength: 1400,
    gapWidth: 3,
    lineWidth: 6,
	slowRotateAngle: 0,
	fastRotateTime: 0,
	slowRotateTime: 800,
    lineTypesCount: 7,
    color: '#259144',
    fadeColor: '#1d20bb'
});
```

##### And the last one called "Gold Radar"
![](https://webdeveloperukraine.github.io/acoloader/imgs/goldradar.jpg)
```
var l = new ACOLoading({
	anglesCount: 40,
    shortLineLength: 10,
    longLineLength: 10,
    maxLength: 360,
    gapWidth: 5,
    lineWidth: 35,
	slowRotateAngle: 0,
	fastRotateTime: 0,
	slowRotateTime: 800,
    lineTypesCount: 7,
	longLineTime: 100,
	shortLineTime: 100
});
```

Yeah, I am bad designed... I'm assured you can do better :)
Enjoy!

[Back to Top](#aco-loader-bar-generator)

## License
----

MIT