const feedr = require("feedr").create({});

const feeds = {
  lemonde: "http://www.lemonde.fr/rss/une.xml"
};

const ITEMS_COUNT = 3;
const SILENCE_DURATION = 1;

// todo: handle hangup

function callback(
  {
    playSilence,
    playText,
    playSine,
    hangupButton$
  }
) {
  return new Promise((resolve, reject) => {
    let CONTINUE = true;
    const hangupListener = hangupButton$.addListener({
      next: value => {
        console.log("value", value)
        if (value === "hangup") {
          CONTINUE = false;
        }
      }
    });
    feedr.readFeeds(feeds, {}, function(err, result) {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      let promise = Promise.resolve();
      const news = result.lemonde.rss.channel[0];
      for (var i = 0; i < ITEMS_COUNT; i++) {
        let text = news.item[i].title[0];
        promise = promise
          .then(() => {
            console.log("text", text);
            if (!CONTINUE) {
              throw 'HANGUP'
            } else {
              return playText(text, { sine: false });
            }
          })
          .then(() => playSilence(SILENCE_DURATION));
      }
      promise
        .then(() => {
          console.log("unsubscribe");
          hangupButton$.removeListener(hangupListener);
          playSine();
          resolve();
        })
        .catch(e => {
          console.error(e);
        });
    });
  });
}

module.exports = callback;
