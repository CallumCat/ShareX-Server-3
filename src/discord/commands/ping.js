/*
    Basic ping command
*/
const { MessageEmbed } = require('discord.js-light');

let name = 'ping';
let aliases = ['fuckoff'];
let permissions = 0;
let run = msg => msg.channel.send(new MessageEmbed()
  .setTitle(`Ping! | ${msg.client.ws.ping}ms`)
  .setColor('#1eda61'));

module.exports = { name, aliases, run, permissions };
