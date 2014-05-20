# Prototype Synergy

Synergy is a project which has been created during the "Digitale Medien 3" course at Erfurt University of Applied Sciences. We have developed a vision for a future interaction scenario with 3D globes. This repo contains the web based prototype of our vision. 
[You can also find a video about creating this prototype on YouTube.](http://www.youtube.com/watch?v=hne40wFncKc)


## Highlights
- Search places through Googles Web Speech API
- Controll the globe through a Leap Motion device
- Use "airplane" mode to fly through impressive landmarks
- Get additional information from Wikipedia

## Development

### Getting started

The first thing to do is to clone this repository and run
	
	npm install

in both, the root and the client folder in order to install all environment dependencies.
After that make sure to install all bower components in the client folder by running

	bower install

Synergy has only been tested against the latest Chrome(v34) version. We recommend using it during development.

### Develop the server side
To start the the node.js server go into the root directory and run 

	grunt serve

The server will watch any file changes, automatically lint your script and restart the server.

### Develop the client side
In order to develop the client just open an additional command line and run 

	grunt serve

in the client directory.

## Contributors
- [David König](https://github.com/DavidKoenig)
- [David Rochholz](https://github.com/VanGoghsCoffee)
- [Philipp Möhler](https://github.com/moehlone)
- [Thomas Blank](https://github.com/thoomi)

## License

Copyright (c) 2014 David König, David Rochholz, Philipp Möhler, Thomas Blank

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

