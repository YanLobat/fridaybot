'use strict';

const BotSettings = require('./../../models/botsetting').BotSettings;
const UserMessages = require('./../../models/usermessage').UserMessages;
const Log = require('./../../models/log').Log;

const messagesRus = (num) => {
  num = Math.abs(num);
  num %= 100;
  if (num >= 5 && num <= 20) {
    return 'сообщений';
  }
  num %= 10;
  if (num === 1) {
    return 'сообщение';
  }
  if (num >= 2 && num <= 4) {
    return 'сообщения';
  }
  return 'сообщений';
};

function getParrotCount(text, callback) {
  BotSettings.findOne().then((r) => {
    if (r) {
      callback(`Всего отправлено: ${r.parrot_counts} шт.`, {});
    } else {
      callback('', { message: 'что то пошло не так :sad_parrot:' });
    }
  });
}

function getUserCount(text, callback) {
  UserMessages.find().sort([
      ['count_messages', 'descending'],
    ])
    .then((r) => {
      let mes = '';
      if (r.length > 10) {
        mes = 'TOP 10: \n';
        for (let i = 0; i < 10; i++) {
          mes += `${i + 1}. ${r[i].user_name}: ${r[i].count_messages} ${messagesRus(r[i].count_messages)}\n`;
        }
        callback(mes, {});
      } else {
        mes = 'Вот люди, которые подают признаки жизни: \n';
        for (let i = 0; i < r.length; i++) {
          mes += `${i + 1}. ${r[i].user_name}: ${r[i].count_messages} ${messagesRus(r[i].count_messages)}\n`;
        }
        callback(mes, {});
      }
    });
}

function getElite(text, callback) {
  UserMessages.find({ user_name: { $ne: 'slackbot' } }).sort([
      ['count_parrots', 'descending'],
    ])
    .then((r) => {
      let mes = '';
      if (r.length > 10) {
        mes = ':crown:Илита Friday:crown: \n';
        for (let i = 0; i < 10; i++) {
          if (r[i].count_parrots > 0) {
            mes += `${i + 1}. ${r[i].user_name}: ${r[i].count_parrots} ppm\n`;
          }
        }
        UserMessages.findOne({ user_name: 'slackbot' })
          .then((d) => {
            if (d) {
              mes += `----------------------\n:crown: ${d.user_name}: ${d.count_parrots} ppm\n`;
            }

            callback(mes, {});
          });
      } else {
        mes = ':crown:Илита Friday:crown: \n';
        for (let i = 0; i < r.length; i++) {
          mes += `${i + 1}. ${r[i].user_name}: ${r[i].count_parrots} ppm\n`;
        }
        UserMessages.findOne({ user_name: 'slackbot' })
          .then((d) => {
            if (d) {
              mes += `----------------------\n:crown: ${d.user_name}: ${d.count_parrots} ppm\n`;
            }

            callback(mes, {});
          });
      }
    });
}

function getLog(text, callback) {
  Log.aggregate([{
      $group: {
        _id: '$command',
        count: { $sum: 1 },
      },
    }, {
      $sort: { count: -1 },
    }, ],
    function(err, res) {
      let mes = 'Статистика вызова команд:\n';
      for (let i = 0; i < res.length; i++) {
        mes += `${i + 1}. ${res[i]._id} - ${res[i].count}\n`;
      }
      callback(mes, {});
      // bot.postMessageToChannel(botParams.channelName, mes, messageParams);
      mes = '';
    }
  );
}

module.exports = {
  parrotCount: function(text, callback) {
    getParrotCount(text, callback);
  },
  userCount: function(text, callback) {
    getUserCount(text, callback);
  },
  elite: function(text, callback) {
    getElite(text, callback);
  },
  log: function(text, callback) {
    getLog(text, callback);
  },
};