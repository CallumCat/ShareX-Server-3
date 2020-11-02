/*
    The command to get info about a file
*/
const { MessageEmbed } = require('discord.js-light');

const { getFile } = require('../../database/index');

let name = 'fileinfo';
let aliases = ['fi'];
let owner = true;
let run = async (msg, args) => {
  if (!args[0]) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('You must include the name of a file (Include the file extention).')
      .setColor('#e9172b'));
  }

  let fName = args[0];

  let fileData = await getFile(fName);

  if (fileData === null) {
    return msg.channel.send(new MessageEmbed()
      .setTitle('File does not exist.')
      .setColor('#e9172b'));
  }

  return msg.channel.send(new MessageEmbed()
    .setTitle(`File: \`${fName}\``)
    .setDescription(`**Path**: \`${fileData.path}\`
**Uploader**: \`${fileData.uploader}\`
**Views**: \`${fileData.views}\`
**Date**: \`${fileData.UploadedAt}\``)
    .setColor('#e9172b'));
};

module.exports = { name, aliases, run, owner };
