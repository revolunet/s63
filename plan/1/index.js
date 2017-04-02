var infoclimat = require("infoclimat");


function callback({
  playStream,
  playText
}) {
  infoclimat.getNextWeatherInFrench("48.856578,2.351828").then(text => {
    const fullText = `Bonjour, Météo à Paris :  ${text}. Voila voila !`;
    playText(fullText)
  });
}

module.exports = callback

