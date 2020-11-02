const { MessageEmbed } = require('discord.js-light');

const { getUserFromKey, setUserDiscord, getUserFromDiscord } = require('../../database/index');

let name = 'linkaccount';
let aliases = ['la', 'linkacc', 'laccount'];
let owner = false;
let run = async (msg, args) => {
  let userCheck = await getUserFromDiscord(msg.author.id);
  if (userCheck !== null) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('You already have an account linked.')
      .setColor('#e9172b'));
  }

  if (!args[0]) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('You must include a key.')
      .setColor('#e9172b'));
  }

  let uKey = args[0];

  let userData = await getUserFromKey(uKey);

  if (userData === null) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('User does not exist.')
      .setColor('#e9172b'));
  }

  await setUserDiscord(uKey, msg.author.id);

  msg.delete().catch();

  return msg.channel.send(new MessageEmbed()
    .setTitle('User Updated.')
    .setDescription(`**User**: \`${userData.name}\`\n**Discord ID**: \`${msg.author.id}\`\n`)
    .setColor('#e9172b'));
};

module.exports = { name, aliases, run, owner };
