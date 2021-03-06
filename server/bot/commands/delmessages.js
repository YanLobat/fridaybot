const request = require('request');
const config = require('./../../../config.js');

const deleteParrots = channelId => {
  request(
    {
      url: `https://slack.com/api/channels.history?token=${config.bot
        .token}&channel=${channelId}&count=200&pretty=1`,
      encoding: null,
    },
    (err, res, body) => {
      const json = JSON.parse(body);
      if (json.ok) {
        const messages = json.messages;
        const botMessagesFiltred = messages.filter(item => {
          return item.subtype === 'bot_message';
        });

        botMessagesFiltred.map(elem => {
          request(
            {
              url: `https://slack.com/api/chat.delete?token=${config.bot
                .token}&channel=${channelId}&ts=${elem.ts}&pretty=1`,
              encoding: null,
            },
            (err, res, body) => {},
          );
        });
      }
    },
  );
};

module.exports = {
  deleteParrots,
};
