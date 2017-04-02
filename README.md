# SOCOTEL S63

using RaspberryPi + NodeJS

ssh : pi / socotels63

## Dial Plan

defined by FS in `/plan` folder

ex:

 /plan
   /123/index.js: will be executed when calling "123"
   /456/*.mp3: a random mp3 will be picked when calling "456"


## Example plan

 - 1: prochaine météo
 - 2: blagues
 - 3: repliques de films
 - 42: surprise
 - 69: coluche
 - 99: random sounds
