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
        name: 'Quake Champions',
        value: 'Quake Champions'
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

const phases = [
    {
        name: 'Phase de groupe',
        value: 'groupsPhase'
    },
    {
        name: 'Quarts de finale',
        value: 'quarterFinals'
    },
    {
        name: 'Demi-finale',
        value: 'semiFinals'
    },
    {
        name: 'Finale',
        value: 'final'
    }
];

const commandsList = [
    {
        name: 'help',
        description: 'Affiche l\'aide',
    },
    {
        name: 'info',
        description: 'Spécifie les informations relatives à un jeu',
        options: [
            {
                name: 'jeu',
                description: 'Nom du jeu',
                type: 3,
                required: true,
                choices
            }
        ]
    },
    {
        name: 'start',
        description: 'Lance une phase de pick/ban entre deux équipes',
        options: [
            {
                name: 'premierEquipeNom',
                description: 'Nom de la première équipe',
                type: 8,
                required: true
            },
            {
                name: 'secondeEquipeNom',
                description: 'Nom de la deuxième équipe',
                type: 8,
                required: true
            },
            {
                name: 'phaseDeJeu',
                description: 'Phase de jeu',
                type: 3,
                required: true,
                choices: phases
            }
        ]
    },
    {
        name: 'finish',
        description: 'Une commande à utiliser quand les deux équipes ont fini leur match',
        options: [
            {
                name: 'Match',
                description: 'Le match joué par les deux équipes',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: 'pick',
        description: 'Pick un jeu',
        options: [
            {
                name: 'jeu',
                description: 'Nom du jeu',
                type: 3,
                required: true,
                choices
            }
        ]
    },
    {
        name: 'ban',
        description: 'Ban un jeu',
        options: [
            {
                name: 'jeu',
                description: 'Nom du jeu',
                type: 3,
                required: true,
                choices
            }
        ]
    }
];

const players = [];
const teams = [];
const activeMatches = new Map();
const debouncedUpdateFinishCommand = lodash.debounce(updateFinishCommand, 30000, { leading: true, trailing: true, maxWait: 60000 });
class Player {
    constructor(name, team) {
        this.name = name;
        this.team = team;
        players.push(this);
    }
}
class MatchState {
    embedPick = null;
    embedPickMessage = null;
    pickState = {
        currentTeam: null,
        step: 0,
        timeout: null
    }
}
class Team {
    voiceChannel = null;
    constructor(role) {
        this.players = [];
        this.name = role.name;
        this.role = role;
        this.currentMatch = null;
        teams.push(this);
    }
}

class Match {
    textChannel = null;
    categoryChannel = null;
    constructor(firstTeam, secondTeam) {
        this.id = uuid.v4();
        this.firstTeam = firstTeam;
        this.secondTeam = secondTeam;
        this.sharedGames = new Map(choices.map(choice => [choice.name, 0]));
        activeMatches.set(this.id, this);
        this.matchState = new MatchState();
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
            description: 'Une commande à utiliser quand les deux équipes ont fini leur match',
            options: [
                {
                    name: 'Match',
                    description: 'Le match joué par les deux équipes',
                    type: 3,
                    required: true,
                    choices: activeMatches
                }
            ]
        }, guildId);
}

function deleteMatch(match, finishBool) {
    if (!finishBool) {
        discordClient.channels.cache.get(process.env.DISCORD_CHANNEL).send(`Temps écoulé pour la phase de bannissement ! Le match opposant ${match.firstTeam} à ${match.secondTeam} est annulé ! Veuillez relancer une nouvelle partie.`)
    }
    match.textChannel.delete();
    match.firstTeam.voiceChannel.delete();
    match.secondTeam.voiceChannel.delete();
    match.categoryChannel.delete();
    activeMatches.delete(match.id);
    const matchChoices = Array.from(activeMatches).map(([id, activeMatch]) => ({
        name: `${activeMatch.firstTeam.name} vs ${activeMatch.secondTeam.name}`,
        value: id
    }));
    debouncedUpdateFinishCommand(matchChoices);
}

async function createAllCommands() {
    const commands = await interactionsClient.getCommands({ guildID: process.env.GUILD_ID });
    for (const command of commandsList) {
        if (commands.some(discordCommand => command.name === discordCommand.name)) {
            continue;
        }
        await interactionsClient.createCommand(command, guildId);
    }
}

async function createAllChannels(interaction, match) {
    match.categoryChannel = await interaction.guild.channels.create(`Match ${match.firstTeam.name} vs ${match.secondTeam.name}`, { type: 'category' });
    await Promise.all([
        interaction.guild.channels.create(`${match.firstTeam.name}`, { type: 'voice', parent: match.categoryChannel }).then(channel => match.firstTeam.voiceChannel = channel),
        interaction.guild.channels.create(`${match.secondTeam.name}`, { type: 'voice', parent: match.categoryChannel }).then(channel => match.secondTeam.voiceChannel = channel),
        interaction.guild.channels.create(`Match ${match.firstTeam.name} vs ${match.secondTeam.name}`, { type: 'text', parent: match.categoryChannel }).then(channel => match.textChannel = channel)
    ]);
}

function pickBanCheck(interaction) {
    const authorId = interaction.author.id;
    const authorPlayer = getPlayerByName(interaction.author.username);
    if (!authorPlayer) {
        interaction.channel.send(`Vous n'êtes pas en jeu ! <@${authorId}>`);
        return null;
    }
    const team = authorPlayer.team;
    if (team.currentMatch.textChannel.id !== interaction.channel.id) {
        return null;
    }
    if (team != team.currentMatch.matchState.pickState.currentTeam) {
        interaction.channel.send(`Ce n'est pas votre tour de ${interaction.name} un jeu ! <@${authorId}>`);
        return null;
    }
    if (team.currentMatch.sharedGames.get(interaction.options[0].value) !== 0) {
        interaction.channel.send(`Vous ne pouvez pas ${interaction.name} ce jeu, ${interaction.options[0].value} a déjà été pick ou banni ! <@${authorId}>`);
        return null;
    }
    if (team.currentMatch.matchState.pickState.step < 2 && interaction.name === 'ban') {
        interaction.channel.send(`Vous ne pouvez pas bannir un jeu pour le moment, vous devez d'abord pick un jeu ! <@${authorId}>`);
        return null;
    }
    if (team.currentMatch.matchState.pickState.step > 2 && interaction.name === 'pick') {
        interaction.channel.send(`Vous ne pouvez plus pick de jeu pour le moment, veuillez bannir un jeu ! <@${authorId}>`);
        return null;
    }
    return team;
}

discordClient.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.name === 'info') {
            interaction.channel.send(embed.gameEmbed(interaction));
        }
        if (interaction.name === 'start' && checkAdmin(interaction)) {
            const roles = await interaction.guild.roles.fetch();
            let alreadyInGame = false;
            const argRoles = [interaction.options[0].value, interaction.options[1].value];
            activeMatches.forEach((match, key) => {
                if (argRoles.includes(match.firstTeam.role.id) || argRoles.includes(match.secondTeam.role.id)) {
                    interaction.channel.send(`Une des deux équipes est déjà en jeu !`);
                    alreadyInGame = true;
                }
            });
            if (alreadyInGame) {
                return;
            }
            const firstTeamRole = roles.find(role => interaction.options[0].value === role.id);
            const firstTeam = createTeamAndPlayers(firstTeamRole);
            const secondTeamRole = roles.find(role => interaction.options[1].value === role.id);
            const secondTeam = createTeamAndPlayers(secondTeamRole);
            const match = new Match(firstTeam, secondTeam);
            firstTeam.currentMatch = match;
            secondTeam.currentMatch = match;
            const matchChoices = Array.from(activeMatches).map(([id, activeMatch]) => ({
                name: `${activeMatch.firstTeam.name} vs ${activeMatch.secondTeam.name}`,
                value: id
            }));
            debouncedUpdateFinishCommand(matchChoices);
            await createAllChannels(interaction, match);
            match.matchState.embedPick = embed.pickEmbed(match);
            match.matchState.embedPickMessage = await match.textChannel.send(match.matchState.embedPick);
            const order = Math.floor(Math.random() * 2);
            match.matchState.pickState.currentTeam = order == 0 ? firstTeam : secondTeam;
            match.textChannel.send(`L'équipe ${firstTeam.first ? firstTeam.name : secondTeam.name} sera la première à pick !`);
        }
        if (interaction.name === 'finish' && checkAdmin(interaction)) {
            const match = activeMatches.get(interaction.options[0].value);
            clearTimeout(match.matchState.pickState.timeout);
            deleteMatch(match, true);
        }
        if (interaction.name === 'pick' && checkPlayer(interaction)) {
            const pickingTeam = pickBanCheck(interaction);
            if (!pickingTeam) {
                return;
            }
            pickingTeam.currentMatch.sharedGames.set(interaction.options[0].value, 1);
            pickingTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(pickingTeam));
            pickingTeam.currentMatch.matchState.pickState.currentTeam = pickingTeam.currentMatch.matchState.pickState.currentTeam === pickingTeam.currentMatch.firstTeam ? pickingTeam.currentMatch.secondTeam : pickingTeam.currentMatch.firstTeam;
            pickingTeam.currentMatch.matchState.pickState.step++;
        }
        if (interaction.name === 'ban' && checkPlayer(interaction)) {
            const banningTeam = pickBanCheck(interaction);
            if (!banningTeam) {
                return;
            }
            clearTimeout(banningTeam.currentMatch.matchState.pickState.timeout);
            banningTeam.currentMatch.sharedGames.set(interaction.options[0].value, 2);
            banningTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(banningTeam));
            banningTeam.currentMatch.matchState.pickState.currentTeam = banningTeam.currentMatch.matchState.pickState.currentTeam === banningTeam.currentMatch.firstTeam ? banningTeam.currentMatch.secondTeam : banningTeam.currentMatch.firstTeam;
            banningTeam.currentMatch.matchState.pickState.step++;
            if (banningTeam.currentMatch.matchState.pickState.step >= 5) {
                let games = Array.from(banningTeam.currentMatch.sharedGames);
                let randomGame = games[Math.floor(Math.random() * games.length)];
                banningTeam.currentMatch.sharedGames.set(randomGame, 1);
                banningTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(banningTeam));
                interaction.channel.send(`Le dernier jeu sera : **${randomGame.name}**!`);
            }
            else {
                banningTeam.currentMatch.matchState.pickState.timeout = setTimeout(() => deleteMatch(match, false), 2 * 60 * 1000);
            }
        }
        if (interaction.name === 'help') {
            interaction.channel.send(embed.helpEmbed());
        }

    } catch (err) {
        console.error(err);
    }
});

discordClient.on('ready', async () => {
    console.log(`Logged in as ${discordClient.user.tag}!`);
    createAllCommands();
});

discordClient.login(process.env.BOT_TOKEN);
