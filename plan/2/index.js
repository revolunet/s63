
const pickRandom = items => items[Math.floor(Math.random() * items.length)];

function callback({
  playStream,
  playText
}) {
  const blagues = require('./blagues.json');
  const devinettes = require('./devinettes.json');
  const blague = pickRandom(blagues.concat(devinettes))
  playText((blague.title || '') + '\n\n' + (blague.text || ''));
}

module.exports = callback