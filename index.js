const Discord = require('discord.js');
const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'] });
const interactions = require('discord-slash-commands-client');
const uuid = require('uuid');
const lodash = require('lodash');
const guildId = process.env.GUILD_ID;
const embed = require('./embed');

const interactionsClient = new interactions.Client(
    process.env.BOT_TOKEN,
    process.env.BOT_USER_ID
);

discordClient.interactions = interactionsClient;
const choices = [
    {
        name: 'Brawlhalla',
        value: 'Brawlhalla'
    },
    {
        name: 'Battlerite',
        value: 'Battlerite'
    },
    {
        name: 'Counter-Strike : Global Offensive',
        value: 'Counter-Strike : Global Offensive'
    },
    {
        name: 'Dofus',
        value: 'Dofus'
    },
    {
        name: 'League of Legends',
        value: 'League of Legends'
    },
    {
        name: 'Minecraft',
        value: 'Minecraft'
    },
    {
        name: 'Quake',
        value: 'Quake'
    },
    {
        name: 'Rocket League',
        value: 'Rocket League'
    },
    {
        name: 'Starcraft II',
        value: 'Starcraft II'
    }
];

const players = [];
const teams = [];
const activeGames = new Map();
let embedPick;
const debouncedUpdateFinishCommand = lodash.debounce(updateFinishCommand, 30000, { leading: true, trailing: true, maxWait: 60000 });
class Player {
    constructor(name, team) {
        this.name = name;
        this.team = team;
        players.push(this);
    }
}

class Team {
    voiceChannel = null;
    constructor(role) {
        this.players = [];
        this.name = role.name;
        this.role = role;
        this.hasPicked = false;
        this.currentGame = null;
        teams.push(this);
    }
}

class Game {
    textChannel = null;
    categoryChannel = null;
    constructor(firstTeam, secondTeam) {
        this.id = uuid.v4();
        this.firstTeam = firstTeam;
        this.secondTeam = secondTeam;
        this.sharedGames = choices.map(choice => choice.name);
        activeGames.set(this.id, this);
    }
}

function getPlayerByName(name) {
    return players.find(player => player.name === name);
}

function createTeamAndPlayers(teamRole) {
    const team = new Team(teamRole);
    const teamPlayers = teamRole.members.map(player => new Player(player.user.username, team));
    team.players = teamPlayers;
    return team;
}

function checkAdmin(interaction) {
    const roles = interaction.member.roles.cache;
    return roles.some(role => role.name === 'Admin Tournoi');
}

function checkPlayer(interaction) {
    const roles = interaction.member.roles.cache;
    return roles.some(role => role.name === 'Player');
}

function updateFinishCommand(activeMatches) {
    return interactionsClient
        .createCommand({
            name: 'finish',
            description: 'A command to use when the two teams finished their match',
            options: [
                {
                    name: 'Match',
                    description: 'The match played by the two teams',
                    type: 3,
                    required: true,
                    choices: activeMatches
                }
            ]
        }, guildId);
}

async function createAllCommands() {
    interactionsClient
        .createCommand({
            name: 'info',
            description: 'Get info about a specific game',
            options: [
                {
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true,
                    choices: choices
                }
            ]
        }, guildId);
    interactionsClient
        .createCommand({
            name: 'start',
            description: 'Starts a pick/ban phase between two teams',
            options: [
                {
                    name: 'firstTeamName',
                    description: 'Name of the first team',
                    type: 8,
                    required: true
                },
                {
                    name: 'secondTeamName',
                    description: 'Name of the second team',
                    type: 8,
                    required: true
                }
            ]
        }, guildId);
    interactionsClient
        .createCommand({
            name: 'finish',
            description: 'A command to use when the two teams finished their match',
            options: [
                {
                    name: 'Match',
                    description: 'The match played by the two teams',
                    type: 3,
                    required: true
                }
            ]
        }, guildId);
    interactionsClient
        .createCommand({
            name: 'pick',
            description: 'Pick a game',
            options: [
                {
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true,
                    choices
                }
            ]
        }, guildId);
    interactionsClient
        .createCommand({
            name: 'ban',
            description: 'Ban a game',
            options: [
                {
                    name: 'game',
                    description: 'Name of the game',
                    type: 3,
                    required: true,
                    choices
                }
            ]
        }, guildId);
}

async function createAllChannels(interaction, game) {
    game.categoryChannel = await interaction.guild.channels.create(`Match ${game.firstTeam.name} vs ${game.secondTeam.name}`, { type: 'category' });
    await Promise.all([
        interaction.guild.channels.create(`${game.firstTeam.name}`, { type: 'voice', parent: game.categoryChannel }).then(channel => game.firstTeam.voiceChannel = channel),
        interaction.guild.channels.create(`${game.secondTeam.name}`, { type: 'voice', parent: game.categoryChannel }).then(channel => game.secondTeam.voiceChannel = channel),
        interaction.guild.channels.create(`Match ${game.firstTeam.name} vs ${game.secondTeam.name}`, { type: 'text', parent: game.categoryChannel }).then(channel => game.textChannel = channel)
    ]);
}

discordClient.on('interactionCreate', async (interaction) => {
    if (interaction.name === 'info') {
        interaction.channel.send(embed.gameEmbed(interaction));
    }
    if (interaction.name === 'start' && checkAdmin(interaction)) {
        const roles = await interaction.guild.roles.fetch();
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
        debouncedUpdateFinishCommand(gameChoices);
        await createAllChannels(interaction, game);
        embedPick = embed.pickEmbed(game);
        game.textChannel.send(embedPick);
    }
    if (interaction.name === 'finish' && checkAdmin(interaction)) {
        const game = activeGames.get(interaction.options[0].value);
        game.firstTeam.hasPicked = false;
        game.secondTeam.hasPicked = false;
        game.textChannel.delete();
        game.firstTeam.voiceChannel.delete();
        game.secondTeam.voiceChannel.delete();
        game.categoryChannel.delete();
        activeGames.delete(game.id);
        const gameChoices = Array.from(activeGames).map(([id, activeGame]) => ({
            name: `${activeGame.firstTeam.name} vs ${activeGame.secondTeam.name}`,
            value: id
        }));
        debouncedUpdateFinishCommand(gameChoices);
    }
    if (interaction.name === 'pick' && checkPlayer(interaction)) {
        const authorPlayer = getPlayerByName(interaction.author.username);
        if (!authorPlayer) {
            interaction.channel.send('You\'re not in game !');
            return;
        }
        const pickingTeam = authorPlayer.team;
        if (!pickingTeam.currentGame) {
            interaction.channel.send('Your team is not in game !');
            return;
        }
        if (pickingTeam.hasPicked) {
            interaction.channel.send('You already picked a game !');
            return;
        }
        if (!pickingTeam.currentGame.sharedGames.includes(interaction.options[0].value)) {
            interaction.channel.send(`You cannot pick this game, ${interaction.options[0].value} has been banned !`);
            return;
        }
        pickingTeam.currentGame.sharedGames = pickingTeam.currentGame.sharedGames.filter(chosenGame =>
            chosenGame !== interaction.options[0].value
        );
        embedPick = embed.editPickEmbedOnPick(interaction, pickingTeam.currentGame, embedPick);
        embedPick.edit(embedPick);
        pickingTeam.hasPicked = true;
    }
    if (interaction.name === 'ban' && checkPlayer(interaction)) {
        const authorPlayer = getPlayerByName(interaction.author.username);
        if (!authorPlayer) {
            interaction.channel.send('You\'re not in game !');
            return;
        }
        const banningTeam = authorPlayer.team;
        if (!banningTeam.currentGame) {
            interaction.channel.send('Your team is not in game !');
            return;
        }
        if (!banningTeam.hasPicked) {
            interaction.channel.send('You didn\'t pick a game yet!');
            return;
        }
        if (!banningTeam.currentGame.sharedGames.includes(interaction.options[0].value)) {
            interaction.channel.send(`You cannot ban this game, ${interaction.options[0].value} has already been banned !`);
            return;
        }
        banningTeam.currentGame.sharedGames = banningTeam.currentGame.sharedGames.filter(chosenGame =>
            chosenGame !== interaction.options[0].value
        );
    }
});

discordClient.on('ready', async () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
    createAllCommands();
});

discordClient.login(process.env.BOT_TOKEN);
