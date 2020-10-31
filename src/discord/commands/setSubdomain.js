const { MessageEmbed } = require('discord.js-light');

const { getUserFromDiscord, setUserSubDomain } = require('../../database/index');

let name = 'setsubdoman';
let aliases = ['setsub', 'ss', 'subdomain'];
let permissions = 0;
let run = async (msg, args) => {
  let userData = await getUserFromDiscord(msg.author.id);
  if (userData === null) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('You do not have an account.')
      .setColor('#e9172b'));
  }

  let subdomain = args[0];
  if (subdomain.length > 63) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('The subdomain given does not match the requirements.')
      .setColor('#e9172b'));
  }

  if (subdomain === userData.subdomain) {
    return msg.channel.send(new MessageEmbed()
      .setTitle(`Your subdomain is already \`${subdomain}\``)
      .setColor('#e9172b'));
  }

  let success = await setUserSubDomain(userData.key, subdomain);
  if (success) {
    return msg.channel.send(new MessageEmbed()
      .setTitle(`Success! Your subdomain is now \`${subdomain}\``)
      .setColor('#1eda61'));
  } else {
    return msg.channel.send(new MessageEmbed()
      .setTitle('An unknown error has occured, please try again..')
      .setColor('#e9172b'));
  }
};

module.exports = { name, aliases, run, permissions };
