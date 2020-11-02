const { MessageEmbed } = require('discord.js-light');

const { getAllUsers } = require('../../database/index');

let name = 'listusers';
let aliases = ['lu', 'ls'];
let owner = true;
let run = async msg => {
  let data = await getAllUsers();

  let embed = new MessageEmbed()
    .setTitle('Users')
    .setColor('#1eda61');

  let dataArray = [];

  data.forEach(e => {
    dataArray.push(`\`${e.name}\``);
  });

  if (dataArray.join(', ').length > 2048) {
    embed.setDescription('Embed\'s description would exceed 2048 characters.');
    return msg.channel.send(embed);
  }

  embed.setDescription(dataArray.join(', '));
  return msg.channel.send(embed);
};

module.exports = { name, aliases, run, owner };
