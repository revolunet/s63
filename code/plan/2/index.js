
const pickRandom = items => items[Math.floor(Math.random() * items.length)];

function callback({
  playSilence,
  playText
}) {
  const blagues = require('./blagues.json');
  const devinettes = require('./devinettes.json');
  const blague = pickRandom(blagues.concat(devinettes));
  const { title, text } = blague;

  let promise = Promise.resolve()
  if (title) {
    promise = promise.then(() => playText(title, { sine: false }))
  }
  if (text) {
    if (title) {
      // add a silence if two parts
      promise = promise.then(() => playSilence(3));
    }
    promise = promise.then(() => playText(text));
  }
  return promise.then(() => {
    console.log('done');
  }).catch(e => {
    console.log("e", e);
  });
}

module.exports = callback