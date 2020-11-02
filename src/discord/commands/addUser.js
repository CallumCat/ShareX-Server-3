/*
    The command used to create a user
*/
const { MessageEmbed } = require('discord.js-light');

const { saveUser, getUserFromKey } = require('../../database/index');
const { createKey } = require('../../util/util');

let name = 'newuser';
let aliases = ['newu', 'nu'];
let owner = true;
let run = async (msg, args) => {
  if (!args[0]) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('You must include the name of a new user.')
      .setColor('#e9172b'));
  }
  let uName = args[0];

  let userCheck = await getUserFromKey(args[0]);
  if (userCheck !== null) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('User already exists.')
      .setColor('#e9172b'));
  }

  let key = await createKey();
  await saveUser({
    key: key,
    name: uName,
    owner: false,
    uploads: 0,
    redirects: 0,
    discord: 'none',
    CreatedAt: new Date(),
    subdomain: 'none',
    domain: 'none',
  });

  return msg.channel.send(new MessageEmbed()
    .setTitle('Created User')
    .setThumbnail('https://cdn.discordapp.com/attachments/686689269296922682/755359943242154005/0HL9FFhngVZRSKZ.png')
    .setDescription(`**Name**: \`${uName}\`\n**Key**: \`${key}\``)
    .setColor('#1eda61'));
};

module.exports = { name, aliases, run, owner };
