const Discord = require('discord.js');
const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'] });
const interactions = require("discord-slash-commands-client");
const channelId = process.env.DISCORD_CHANNEL;
const uuid = require('uuid');
const guildId = process.env.GUILD_ID;
let finishCommand;

const interactionsClient = new interactions.Client(
    process.env.BOT_TOKEN,
    process.env.BOT_USER_ID
);

discordClient.interactions = interactionsClient;
const choices = [
    {
        name: "Brawlhalla",
        value: "brawlhalla"
    },
    {
        name: "Battlerite",
        value: "battlerite"
    },
    {
        name: "Counter-Strike : Global Offensive",
        value: "csgo"
    },
    {
        name: "Dofus",
        value: "dofus"
    },
    {
        name: "League of Legends",
        value: "lol"
    },
    {
        name: "Minecraft",
        value: "minecraft"
    },
    {
        name: "Quake",
        value: "quake"
    },
    {
        name: "Rocket League",
        value: "rl"
    },
    {
        name: "Starcraft II",
        value: "sc2"
    }
];

const teams = [];
const activeGames = new Map();

class Player {
    constructor(name, team) {
        this.name = name;
        this.team = team;
    }
}

class Team {
    constructor(role) {
        this.players = [];
        this.name = role.name;
        this.role = role;
        this.hasPicked = false;
        this.currentGame = null;
        teams.push(this);
    }
    getPlayersFromTeam() {
        return this.players;
    }
}

class Game {
    constructor(firstTeam, secondTeam) {
        this.id = uuid.v4();
        this.firstTeam = firstTeam;
        this.secondTeam = secondTeam;
        this.sharedGames = choices.map(choice => choice.name);
        activeGames.set(this.id, this);
    }
}

function createTeamAndPlayers(teamRole) {
    const team = new Team(teamRole);
    const teamPlayers = teamRole.members.map(player => new Player(player.user.username, team));
    team.players = teamPlayers;
    return team;
}

function checkAdmin(interaction) {
    const roles = interaction.member.roles.cache;
    return roles.some(role => role.name === "Admin Tournoi");
}

async function updateStartCommand(choices) {
    return await interactionsClient
        .createCommand({
            name: "finish",
            description: "A command to use when the two teams finished their match",
            options: [
                {
                    name: "Match",
                    description: "The match played by the two teams",
                    type: 3,
                    required: true,
                    choices: choices
                }
            ]
        }, channelId);
}

interactionsClient.getCommands({ guildID: guildId })
    .then(commands => {
        commands.forEach(command => interactionsClient.deleteCommand(command.id, guildId));
        console.log(commands);
    })
    .catch(console.error);

discordClient.on("interactionCreate", async (interaction) => {
    if (interaction.name === "info") {
        const infoEmbed = new Discord.MessageEmbed()
            .setAuthor('EGC Bot', 'https://cdn.discordapp.com/icons/803260691766575155/305d3630cf15d37b771016ccc9be9772.png?size=128', 'https://www.toornament.com/en_GB/tournaments/4266282578304049152/')
            .setTimestamp();
        switch (interaction.content) {
            case "brawlhalla":
                infoEmbed
                    .setTitle("Brawlhalla").setURL("https://www.brawlhalla.com/").setColor("#fc7843").setDescription("Ruleset for Brawlhalla").setThumbnail("https://www.brawlhalla.com/c/uploads/2019/09/Logo_BrawlhallaHammer512.png").addFields(
                        {
                            name: "Game mode",
                            value: "Stock"
                        },
                        {
                            name: "Teams",
                            value: "ON"
                        },
                        {
                            name: "Teams damage",
                            value: "ON"
                        },
                        {
                            name: "Number of stocks",
                            value: "3"
                        },
                        {
                            name: "Match length",
                            value: "8 min"
                        },
                        {
                            name: "Map set",
                            value: "3v3"
                        },
                        {
                            name: "Game mode",
                            value: "Stock"
                        },
                        {
                            name: "Map pick",
                            value: "Tournament striking"
                        },
                        {
                            name: "Blindpick",
                            value: "OFF"
                        },
                        {
                            name: "*Win condition*",
                            value: "First team who clears all enemies' stocks"
                        }
                    ).setFooter("Playoffs : BO3 | Final phase : BO5 | Grand Final : BO7");
                break;
            case "battlerite":
                infoEmbed
                    .setTitle("Battlerite").setURL("https://arena.battlerite.com/").setColor("#f07a25").setDescription("Ruleset for Battlerite").setThumbnail("https://cdn.battlerite.com/www3/images/static/logos/logo-small.png").addFields(
                        {
                            name: "Game mode",
                            value: "3v3"
                        },
                        {
                            name: "Victory score",
                            value: "2 rounds | Grand Final : 3 rounds"
                        },
                        {
                            name: "Round length",
                            value: "Playoffs : 1min30 | Final phase : 2min"
                        },
                        {
                            name: "Double champions",
                            value: "Disabled"
                        },
                        {
                            name: "Soul orb",
                            value: "Enabled"
                        },
                        {
                            name: "Sudden death",
                            value: "Enabled"
                        },
                        {
                            name: "Map",
                            value: "Random"
                        },
                        {
                            name: "*Win condition*",
                            value: "First team to win 2 or 3 rounds"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "csgo":
                infoEmbed
                    .setTitle("Counter-Strike : Global Offensive").setURL("https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/").setColor("#fdbd1d").setDescription("Ruleset for Counter-Strike : Global Offensive").setThumbnail("https://seeklogo.com/images/C/csgo-logo-CAA0A4D48A-seeklogo.com.png").addFields(
                        {
                            name: "Game mode",
                            value: "Competitive"
                        },
                        {
                            name: "Team size",
                            value: "3v3"
                        },
                        {
                            name: "Map pool",
                            value: "Junction - Atom - Mini Dust 2 - Beerhouse - Calavera - Eternity - Dashur"
                        },
                        {
                            name: "Map selection",
                            value: "Playoffs : 3 bans per team | Final phase : 2 bans per team"
                        },
                        {
                            name: "*Win condition*",
                            value: "First team to win 16 rounds - Overtime if 15-15"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "dofus":
                infoEmbed
                    .setTitle("Dofus").setURL("https://www.dofus.com/fr/prehome").setColor("#b1e600").setDescription("Ruleset for Dofus").setThumbnail("https://upload.wikimedia.org/wikipedia/fr/3/3d/Dofus_Logo.png").addFields(
                        {
                            name: "Server",
                            value: "EGC Tournament"
                        },
                        {
                            name: "Map",
                            value: "Arène de Goultard"
                        },
                        {
                            name: "Game mode",
                            value: "3v3"
                        },
                        {
                            name: "Rounds limit",
                            value: "20"
                        },
                        {
                            name: "Classes pick",
                            value: "Draft (check rules)",
                        },
                        {
                            name: "Characters per player",
                            value: "1"
                        },
                        {
                            name: "*Win condition*",
                            value: "Team with the highest number of living characters"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "lol":
                infoEmbed
                    .setTitle("League of Legends").setURL("https://play.euw.leagueoflegends.com/fr_FR").setColor("#01273f").setDescription("Ruleset for League of Legends").setThumbnail("https://static.wikia.nocookie.net/leagueoflegends/images/0/07/League_of_Legends_icon.png/revision/latest?cb=20191018194326").addFields(
                        {
                            name: "Map",
                            value: "Howling Abbyss"
                        },
                        {
                            name: "Game mode",
                            value: "Tournament draft"
                        },
                        {
                            name: "Time limit",
                            value: "30 min"
                        },
                        {
                            name: "*Win condition*",
                            value: "Nexus destruction | Gold adavantage@30min"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "minecraft":
                infoEmbed
                    .setTitle("Minecraft").setURL("https://www.minecraft.net/en-us/about-minecraft").setColor("#8cba60").setDescription("Ruleset for Minecraft").setThumbnail("https://external-preview.redd.it/INBHMCNdcPNCBvgGn3yQ-RH4jiAhFP4bde7-wCC2xiw.png?auto=webp&s=7fbcf884991ea6c916da84752af364fbf962687b").addFields(
                        {
                            name: "Game mode",
                            value: "Multi-trial"
                        },
                        {
                            name: "First trial",
                            value: "PVP",
                            inline: true
                        },
                        {
                            name: "Second trial",
                            value: "Parkour",
                            inline: true
                        },
                        {
                            name: "Version",
                            value: "1.16"
                        },
                        {
                            name: "Authorized mods",
                            value: "Optifine",
                        },
                        {
                            name: "*Win condition*",
                            value: "First team who clears the 2 trials"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "quake":
                infoEmbed
                    .setTitle("Quake Champions").setURL("https://quake.bethesda.net/fr").setColor("#5b5753").setDescription("Ruleset for Quake Champions").setThumbnail("https://pbs.twimg.com/profile_images/1065281071774863360/P7kww_ed.jpg").addFields(
                        {
                            name: "Game mode",
                            value: "Team deathmatch"
                        },
                        {
                            name: "Limit score",
                            value: "50 frags",
                        },
                        {
                            name: "Time limit",
                            value: "10 min",
                        },
                        {
                            name: "Map pool",
                            value: "Blood Covenant - Ruins of Sranath - Blood run - Corrupted keep - Awoken"
                        },
                        {
                            name: "Map selection",
                            value: "2 bans per team",
                        },
                        {
                            name: "*Win condition*",
                            value: "First team with 50 frags | Highest score at the end of the match"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "rl":
                infoEmbed
                    .setTitle("Rocket League").setURL("https://www.rocketleague.com/fr/").setColor("#0085e0").setDescription("Ruleset for Rocket League").setThumbnail("https://img.icons8.com/ios/452/rocket-league.png").addFields(
                        {
                            name: "Arena",
                            value: "Competitive pool (check rules)"
                        },
                        {
                            name: "Game mode",
                            value: "3v3",
                        },
                        {
                            name: "Match length",
                            value: "5 min",
                        },
                        {
                            name: "*Win condition*",
                            value: "Highest score at the end of the match"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
            case "sc2":
                infoEmbed
                    .setTitle("Starcraft II").setURL("https://starcraft2.com/").setColor("#4e6376").setDescription("Ruleset for Starcraft II").setThumbnail("https://d1n0gwn2opdqwz.cloudfront.net/fr/sc2/original/1X/eb67887997d1b6100f9727324dcc9e2e6bad0efd.png").addFields(
                        {
                            name: "Category",
                            value: "Melee"
                        },
                        {
                            name: "Game speed",
                            value: "Faster",
                        },
                        {
                            name: "Game length",
                            value: "30 min",
                        },
                        {
                            name: "Map pool",
                            value: "Augustine Fall LE - Canyon of Tribulation - Bone Temple - Realities Simulation LE - Whitewater Line LE - Slaying Field - Nephor I",
                        },
                        {
                            name: "Map pick",
                            value: "Playoffs : 3 bans per team | Final phase : 2 bans per team",
                        },
                        {
                            name: "*Win condition*",
                            value: "Team with advantage@30 min | No more enemies before 30min"
                        }
                    ).setFooter("Playoffs : BO1 | Final phase : BO3");
                break;
        }
        interaction.channel.send(infoEmbed);
    }
    if (interaction.name === "start") {
        const roles = await interaction.guild.roles.fetch();
        if (!checkAdmin(interaction)) {
            return;
        }
        const firstTeamRole = roles.find(role => interaction.options[0].value === role.id);
        const firstTeam = createTeamAndPlayers(firstTeamRole);
        const secondTeamRole = roles.find(role => interaction.options[1].value === role.id);
        const secondTeam = createTeamAndPlayers(secondTeamRole);
        const game = new Game(firstTeam, secondTeam);
        firstTeam.currentGame = game;
        secondTeam.currentGame = game;
        const gameChoices = Array.from(activeGames).map(([id, activeGame]) => ({
            name: `${activeGame.firstTeam.name} vs ${activeGame.secondTeam.name}`,
            value: id
        }));
        // get then add
        interactionsClient.createCommand({
            name: "finish",
            description: "A command to use when the two teams finished their match",
            options: [
                {
                    name: "Match",
                    description: "The match played by the two teams",
                    type: 3,
                    required: true,
                    choices: gameChoices
                }
            ]
        }, guildId)
            .catch(error =>
                console.error(error));
        interaction.guild.channels.create(gameChoices[0].name, 'text');
    }
    if (interaction.name === "finish") {
        if (!checkAdmin(interaction)) {
            return;
        }
        const game = activeGames.get(interaction.options[0].value);
        game.firstTeam.hasPicked = false;
        game.secondTeam.hasPicked = false;
        activeGames.delete(game);
        const command = await interactionsClient.getCommands({ commandID: finishCommand.id, guildID: guildId });
        const choices = command.options[0].choices.filter(choice => { choice.name.includes(game.firstTeam.name) });
        console.log(choices);
        await updateStartCommand(choices);
    }
    if (interaction.name === "pick") {
        const pickingTeam = getTeamByPlayerName(interaction.author.username);
        if (pickingTeam?.hasPicked) {
            interaction.channel.send("You already picked a game !");
            return;
        }
        pickingTeam.players.forEach(player => {
            if (player.team.currentGame === null) {
                interaction.channel.send("You cannot pick a game yet !");
                return;
            }
        });
        getGameByTeam(pickingTeam).sharedGames = getGameByTeam(pickingTeam).sharedGames.filter(chosenGame =>
            chosenGame !== interaction.options[0].value
        );
        pickingTeam.hasPicked = true;
    }
    if (interaction.name === "ban") {
        const banningTeam = getTeamByPlayerName(interaction.author.username);
        if (!banningTeam.hasPicked) {
            interaction.channel.send("You didn't pick a game yet!");
            return;
        }
        banningTeam.players.forEach(player => {
            if (player.team.currentGame === null) {
                interaction.channel.send("You cannot ban a game yet !");
                return;
            }
        });
        getGameByTeam(banningTeam).sharedGames = getGameByTeam(banningTeam).sharedGames.filter(chosenGame =>
            chosenGame !== interaction.options[0].value
        );
    }
});

discordClient.on('ready', async () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
    interactionsClient
        .createCommand({
            name: "info",
            description: "Get info about a specific game",
            options: [
                {
                    name: "game",
                    description: "Name of the game",
                    type: 3,
                    required: true,
                    choices: choices
                }
            ]
        }, channelId)
        .then(console.log)
        .catch(console.error);
    interactionsClient
        .createCommand({
            name: "register",
            description: "Register a set of players and bind them to their team",
            options: [
                {
                    name: "firstPlayer",
                    description: "Discord@ of the first player",
                    type: 6,
                    required: true
                },
                {
                    name: "secondPlayer",
                    description: "Discord@ of the second player",
                    type: 6,
                    required: true
                },
                {
                    name: "thirdPlayer",
                    description: "Discord@ of the third player",
                    type: 6,
                    required: true
                },
                {
                    name: "teamName",
                    description: "Name of the team",
                    type: 8,
                    required: true
                }
            ]
        }, channelId)
        .then(console.log)
        .catch(console.error);
    interactionsClient
        .createCommand({
            name: "start",
            description: "Starts a pick/ban phase between two teams",
            options: [
                {
                    name: "firstTeamName",
                    description: "Name of the first team",
                    type: 8,
                    required: true
                },
                {
                    name: "secondTeamName",
                    description: "Name of the second team",
                    type: 8,
                    required: true
                }
            ]
        }, channelId)
        .then(console.log)
        .catch(console.error);
    finishCommand = await updateStartCommand();
    interactionsClient
        .createCommand({
            name: "pick",
            description: "Pick a game",
            options: [
                {
                    name: "game",
                    description: "Name of the game",
                    type: 3,
                    required: true,
                    choices: choices
                }
            ]
        }, channelId)
        .then(console.log)
        .catch(console.error);
    interactionsClient
        .createCommand({
            name: "ban",
            description: "Ban a game",
            options: [
                {
                    name: "game",
                    description: "Name of the game",
                    type: 3,
                    required: true,
                    choices: choices
                }
            ]
        }, channelId)
        .then(console.log)
        .catch(console.error);
});

discordClient.login(process.env.DISCORD_TOKEN);
