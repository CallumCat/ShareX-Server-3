/*
    The discord bot index.js for yes
*/
const config = require('../config.json');

const { Client, Collection, MessageEmbed } = require('discord.js-light');
const { readdirSync } = require('fs');
const { resolve } = require('path');

require('colors');

const { getUserFromDiscord } = require('../database/index');
let defaultOptions = require('./options.json');

let startBot = () => {
  if (!config.token) return console.log('Starting without a discord bot.'.red);
  try {
    let clientOptions = Object.assign(defaultOptions, config.botOptions);
    let client = new Client(clientOptions);

    client.commands = new Collection();
    client.cmdAliases = new Collection();

    let files = readdirSync(resolve(`${__dirname}/commands/`)).filter(f => f.endsWith('.js'));
    for (const file of files) {
      let command = require(`./commands/${file}`);
      client.commands.set(command.name, command);
      command.aliases.forEach(e => { client.cmdAliases.set(e, command.name); });
    }

    client.on('message', async msg => {
      if (!msg.content.startsWith('-')) return;

      let args = msg.content.split(' ').slice(1);

      let cmdName = msg.content.split(' ')[0].slice(1).toLowerCase();
      let cmd = client.commands.get(client.cmdAliases.get(cmdName) || cmdName);

      if (cmd === null) return;

      let userData = await getUserFromDiscord(msg.author.id);
      let owner = userData === null ? false : userData.owner;

      if (cmd.owner && !owner) {
        return msg.channel.send(new MessageEmbed()
          .setTitle('You do not have the required permissions to run this command.')
          .setColor('#e9172b'));
      }

      cmd.run(msg, args, owner);
    });

    client.on('ready', () => {
      console.log('Discord Bot has Started!'.green);
    });

    client.login(config.token);
    return;
  } catch (err) {
    return console.log(err);
  }
};

module.exports = { startBot };
