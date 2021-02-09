const randomColor = require('randomcolor');
const Discord = require('discord.js');

const globalEmbed = new Discord.MessageEmbed()
    .setAuthor('EGC Bot', 'https://cdn.discordapp.com/icons/803260691766575155/305d3630cf15d37b771016ccc9be9772.png?size=128', 'https://www.toornament.com/en_GB/tournaments/4266282578304049152/')
    .setTimestamp();

function gameEmbed(interaction) {
    const infoEmbed = globalEmbed;
    switch (interaction.content) {
        case 'Brawlhalla':
            infoEmbed
                .setTitle('Brawlhalla').setURL('https://www.brawlhalla.com/').setColor('#fc7843').setDescription('Ruleset for Brawlhalla').setThumbnail('https://www.Brawlhalla.com/c/uploads/2019/09/Logo_BrawlhallaHammer512.png').addFields(
                    {
                        name: 'Game mode',
                        value: 'Stock'
                    },
                    {
                        name: 'Teams',
                        value: 'ON'
                    },
                    {
                        name: 'Teams damage',
                        value: 'ON'
                    },
                    {
                        name: 'Number of stocks',
                        value: '3'
                    },
                    {
                        name: 'Match length',
                        value: '8 min'
                    },
                    {
                        name: 'Map set',
                        value: '3v3'
                    },
                    {
                        name: 'Game mode',
                        value: 'Stock'
                    },
                    {
                        name: 'Map pick',
                        value: 'Tournament striking'
                    },
                    {
                        name: 'Blindpick',
                        value: 'OFF'
                    },
                    {
                        name: '*Win condition*',
                        value: 'First team who clears all enemies\' stocks'
                    }
                ).setFooter('Playoffs : BO3 | Final phase : BO5 | Grand Final : BO7');
            break;
        case 'Battlerite':
            infoEmbed
                .setTitle('Battlerite').setURL('https://arena.battlerite.com/').setColor('#f07a25').setDescription('Ruleset for Battlerite').setThumbnail('https://cdn.Battlerite.com/www3/images/static/logos/logo-small.png').addFields(
                    {
                        name: 'Game mode',
                        value: '3v3'
                    },
                    {
                        name: 'Victory score',
                        value: '2 rounds | Grand Final : 3 rounds'
                    },
                    {
                        name: 'Round length',
                        value: 'Playoffs : 1min30 | Final phase : 2min'
                    },
                    {
                        name: 'Double champions',
                        value: 'Disabled'
                    },
                    {
                        name: 'Soul orb',
                        value: 'Enabled'
                    },
                    {
                        name: 'Sudden death',
                        value: 'Enabled'
                    },
                    {
                        name: 'Map',
                        value: 'Random'
                    },
                    {
                        name: '*Win condition*',
                        value: 'First team to win 2 or 3 rounds'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'Counter-Strike : Global Offensive':
            infoEmbed
                .setTitle('Counter-Strike : Global Offensive').setURL('https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/').setColor('#fdbd1d').setDescription('Ruleset for Counter-Strike : Global Offensive').setThumbnail('https://seeklogo.com/images/C/csgo-logo-CAA0A4D48A-seeklogo.com.png').addFields(
                    {
                        name: 'Game mode',
                        value: 'Competitive'
                    },
                    {
                        name: 'Team size',
                        value: '3v3'
                    },
                    {
                        name: 'Map pool',
                        value: 'Junction - Atom - Mini Dust 2 - Beerhouse - Calavera - Eternity - Dashur'
                    },
                    {
                        name: 'Map selection',
                        value: 'Playoffs : 3 bans per team | Final phase : 2 bans per team'
                    },
                    {
                        name: '*Win condition*',
                        value: 'First team to win 16 rounds - Overtime if 15-15'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'Dofus':
            infoEmbed
                .setTitle('Dofus').setURL('https://www.dofus.com/fr/prehome').setColor('#b1e600').setDescription('Ruleset for Dofus').setThumbnail('https://upload.wikimedia.org/wikipedia/fr/3/3d/Dofus_Logo.png').addFields(
                    {
                        name: 'Server',
                        value: 'EGC Tournament'
                    },
                    {
                        name: 'Map',
                        value: 'Arène de Goultard'
                    },
                    {
                        name: 'Game mode',
                        value: '3v3'
                    },
                    {
                        name: 'Rounds limit',
                        value: '20'
                    },
                    {
                        name: 'Classes pick',
                        value: 'Draft (check rules)',
                    },
                    {
                        name: 'Characters per player',
                        value: '1'
                    },
                    {
                        name: '*Win condition*',
                        value: 'Team with the highest number of living characters'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'League of Legends':
            infoEmbed
                .setTitle('League of Legends').setURL('https://play.euw.leagueoflegends.com/fr_FR').setColor('#01273f').setDescription('Ruleset for League of Legends').setThumbnail('https://static.wikia.nocookie.net/leagueoflegends/images/0/07/League_of_Legends_icon.png/revision/latest?cb=20191018194326').addFields(
                    {
                        name: 'Map',
                        value: 'Howling Abbyss'
                    },
                    {
                        name: 'Game mode',
                        value: 'Tournament draft'
                    },
                    {
                        name: 'Time limit',
                        value: '30 min'
                    },
                    {
                        name: '*Win condition*',
                        value: 'Nexus destruction | Gold adavantage@30min'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'Minecraft':
            infoEmbed
                .setTitle('Minecraft').setURL('https://www.minecraft.net/en-us/about-minecraft').setColor('#8cba60').setDescription('Ruleset for Minecraft').setThumbnail('https://external-preview.redd.it/INBHMCNdcPNCBvgGn3yQ-RH4jiAhFP4bde7-wCC2xiw.png?auto=webp&s=7fbcf884991ea6c916da84752af364fbf962687b').addFields(
                    {
                        name: 'Game mode',
                        value: 'Multi-trial'
                    },
                    {
                        name: 'First trial',
                        value: 'PVP',
                        inline: true
                    },
                    {
                        name: 'Second trial',
                        value: 'Parkour',
                        inline: true
                    },
                    {
                        name: 'Version',
                        value: '1.16'
                    },
                    {
                        name: 'Authorized mods',
                        value: 'Optifine',
                    },
                    {
                        name: '*Win condition*',
                        value: 'First team who clears the 2 trials'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'Quake':
            infoEmbed
                .setTitle('Quake Champions').setURL('https://quake.bethesda.net/fr').setColor('#5b5753').setDescription('Ruleset for Quake Champions').setThumbnail('https://pbs.twimg.com/profile_images/1065281071774863360/P7kww_ed.jpg').addFields(
                    {
                        name: 'Game mode',
                        value: 'Team deathmatch'
                    },
                    {
                        name: 'Limit score',
                        value: '50 frags',
                    },
                    {
                        name: 'Time limit',
                        value: '10 min',
                    },
                    {
                        name: 'Map pool',
                        value: 'Blood Covenant - Ruins of Sranath - Blood run - Corrupted keep - Awoken'
                    },
                    {
                        name: 'Map selection',
                        value: '2 bans per team',
                    },
                    {
                        name: '*Win condition*',
                        value: 'First team with 50 frags | Highest score at the end of the match'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'Rocket League':
            infoEmbed
                .setTitle('Rocket League').setURL('https://www.rocketleague.com/fr/').setColor('#0085e0').setDescription('Ruleset for Rocket League').setThumbnail('https://img.icons8.com/ios/452/rocket-league.png').addFields(
                    {
                        name: 'Arena',
                        value: 'Competitive pool (check rules)'
                    },
                    {
                        name: 'Game mode',
                        value: '3v3',
                    },
                    {
                        name: 'Match length',
                        value: '5 min',
                    },
                    {
                        name: '*Win condition*',
                        value: 'Highest score at the end of the match'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
        case 'Starcraft II':
            infoEmbed
                .setTitle('Starcraft II').setURL('https://starcraft2.com/').setColor('#4e6376').setDescription('Ruleset for Starcraft II').setThumbnail('https://d1n0gwn2opdqwz.cloudfront.net/fr/sc2/original/1X/eb67887997d1b6100f9727324dcc9e2e6bad0efd.png').addFields(
                    {
                        name: 'Category',
                        value: 'Melee'
                    },
                    {
                        name: 'Game speed',
                        value: 'Faster',
                    },
                    {
                        name: 'Game length',
                        value: '30 min',
                    },
                    {
                        name: 'Map pool',
                        value: 'Augustine Fall LE - Canyon of Tribulation - Bone Temple - Realities Simulation LE - Whitewater Line LE - Slaying Field - Nephor I',
                    },
                    {
                        name: 'Map pick',
                        value: 'Playoffs : 3 bans per team | Final phase : 2 bans per team',
                    },
                    {
                        name: '*Win condition*',
                        value: 'Team with advantage@30 min | No more enemies before 30min'
                    }
                ).setFooter('Playoffs : BO1 | Final phase : BO3');
            break;
    }
    return infoEmbed;
}

function startEmbed() {

}

function pickEmbed(game) {
    const pickEmbed = globalEmbed;
    pickEmbed.setTitle(`⚔️ Draft phase between ${game.firstTeam.name} and ${game.secondTeam.name} started ! ⚔️`)
        .setColor(randomColor()).setDescription('List of available games below');
    game.sharedGames.forEach(availableGame => (pickEmbed.addField(availableGame, '🟡', true)));
    return pickEmbed;
    //🟢🔴
}

function editPickEmbedOnPick(interaction, game, pickEmbed) {
    pickEmbed.spliceFields(0, 9);
    game.sharedGames.forEach(availableGame => {
        if (availableGame === interaction.options[0].value) {
            pickEmbed.addField(availableGame, '🟢', true);
        }
        else {
            pickEmbed.addField(availableGame, '🟡', true);
        }
    });
}

function editPickEmbedOnPick(interaction, game, pickEmbed) {
    pickEmbed.spliceFields(0, 9);
    game.sharedGames.forEach(availableGame => {
        if (availableGame === interaction.options[0].value) {
            pickEmbed.addField(availableGame, '🔴', true);
        }
        else {
            pickEmbed.addField(availableGame, '🟡', true);
        }
    });
    return pickEmbed;
}

exports.gameEmbed = gameEmbed;
exports.pickEmbed = pickEmbed;
exports.editPickEmbedOnPick = editPickEmbedOnPick;