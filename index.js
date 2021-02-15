const Discord = require('discord.js');
const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'] });
const interactions = require('discord-slash-commands-client');
const uuid = require('uuid');
const embed = require('./embed');
const guildId = process.env.GUILD_ID;

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
        description: 'Une commande à utiliser quand les deux équipes ont fini leur match'
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
let categoryChannel = null;
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
        step: 0
    }
}
class Team {
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
    constructor(firstTeam, secondTeam, gamePhase) {
        this.id = uuid.v4();
        this.firstTeam = firstTeam;
        this.secondTeam = secondTeam;
        this.gamePhase = gamePhase;
        this.sharedGames = new Map(choices.filter(choice => {
            switch (this.gamePhase) {
                case 'groupsPhase': return true;
                case 'quarterFinals': return ['Rocket League', 'Minecraft', 'Starcraft II', 'Counter-Strike : Global Offensive', 'Dofus', 'Brawlhalla', 'Battlerite'].includes(choice.name);
                case 'semiFinals': return ['Battlerite', 'League of Legends', 'Minecraft', 'Starcraft II', 'Dofus', 'Brawlhalla', 'Quake Champions'].includes(choice.name);
                case 'finals': return ['Battlerite', 'Dofus', 'League of Legends', 'Starcraft II', 'Counter-Strike : Global Offensive', 'Rocket League', 'Brawlhalla'].includes(choice.name);
            }
        }).map(choice => [choice.name, 0]));
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
    return roles.find(role => role.name === 'Admin Tournoi');
}

function checkPlayer(interaction) {
    const roles = interaction.member.roles.cache;
    return roles.find(role => role.name === 'Player');
}

function deleteMatch(match) {
    match.textChannel.delete();
    if (categoryChannel.children.size - 1 === 0) {
        categoryChannel.delete();
    }
    activeMatches.delete(match.id);
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
    categoryChannel = interaction.guild.channels.cache.find(channel => channel.name === 'Matches' && channel.type === 'category');
    if (!categoryChannel) {
        categoryChannel = await interaction.guild.channels.create('Matches', {
            type: 'category'
        });
    }
    await interaction.guild.channels.create(`Match ${match.firstTeam.name} vs ${match.secondTeam.name}`, {
        type: 'text', parent: categoryChannel, permissionOverwrites: [
            {
                id: interaction.guild.roles.everyone.id,
                deny: ['SEND_MESSAGES'],
            },
            {
                id: process.env.BOT_USER_ID,
                allow: ['SEND_MESSAGES'],
            },
            {
                id: match.firstTeam.role.id,
                allow: ['SEND_MESSAGES'],
            },
            {
                id: match.secondTeam.role.id,
                allow: ['SEND_MESSAGES'],
            },
            {
                id: checkAdmin(interaction).id,
                allow: ['SEND_MESSAGES'],
            }
        ]
    }).then(channel => match.textChannel = channel);
}

function pickBanCheck(interaction) {
    const authorPlayer = getPlayerByName(interaction.author.username);
    const authorId = interaction.author.id;
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
    switch (team.currentMatch.gamePhase) {
        case 'groupsPhase':
            if (team.currentMatch.matchState.pickState.step < 2 && interaction.name === 'ban') {
                interaction.channel.send(`Vous ne pouvez pas bannir un jeu pour le moment, vous devez d'abord pick un jeu ! <@${authorId}>`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step > 2 && interaction.name === 'pick') {
                interaction.channel.send(`Vous ne pouvez plus pick de jeu pour le moment, veuillez bannir un jeu ! <@${authorId}>`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step >= 5) {
                interaction.channel.send(`Partie terminée, veuillez contacter un admin pour /finish ! <@${authorId}>`);
                return null;
            }
            return team;
        case 'final':
        default:
            if (team.currentMatch.matchState.pickState.step <= 1 && interaction.name === 'ban') {
                interaction.channel.send(`Vous ne pouvez pas bannir un jeu pour le moment, vous devez d'abord pick un jeu ! <@${authorId}>`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step > 1 && interaction.name === 'pick') {
                interaction.channel.send(`Vous ne pouvez plus pick de jeu pour le moment, veuillez bannir un jeu ! <@${authorId}>`);
                return null;
            }
    }
}

function generateRandomGame(match) {
    const games = Array.from(match.sharedGames).filter(([game, pickState]) => pickState === 0);
    const randomGame = games[Math.floor(Math.random() * games.length)];
    match.sharedGames.set(randomGame, 1);
    match.matchState.embedPickMessage.edit(embed.editPickEmbed(match));
    return randomGame;
}


function manageSteps(match, interaction) {
    const filter = (reaction, user) => {
        return (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') && user.id === interaction.author.id;
    };
    if (interaction.name === 'pick') {
        switch (match.gamePhase) {
            case 'groupsPhase':
                break;
            case 'final':
                break;
            default:
                if (match.matchState.pickState.step === 1) {
                    interaction.channel.send(`Le jeu aléatoire sera : **${generateRandomGame(match).name}**!`);
                }
                break;
        }
    }
    else {
        switch (match.gamePhase) {
            case 'groupsPhase':
                if (match.matchState.pickState.step >= 5) {
                    interaction.channel.send(`Le dernier jeu sera : **${generateRandomGame(match).name}**!`);
                }
                break;
            case 'final':
                break;
            default:
                if (match.matchState.pickState.step === 3) {
                    const firstRandomGame = generateRandomGame(match);
                    const secondRandomGame = generateRandomGame(match);
                    const randomGamesMessage = interaction.channel.send(`Les jeux aléatoires seront : (1) **${firstRandomGame.name}** et (2) **${secondRandomGame.name}** !`);
                    interaction.channel.send(`L\'équipe @<${match.matchState.pickState.currentTeam === match.firstTeam ? match.secondTeam : match.matchState.pickState.currentTeam}> a 30 secondes pour choisir l'ordre des jeux à jouer en cliquant sur l'emoji correspondant !`);
                    const collector = randomGamesMessage.createReactionCollector(filter, { time: 30000 });
                    collector.on('collect', (reaction, user) => {
                        interaction.channel.send(`Le premier jeu à jouer sera ${reaction.emoji.name === '1️⃣' ? firstRandomGame : secondRandomGame} et ${reaction.emoji.name === '2️⃣' ? firstRandomGame : secondRandomGame} le deuxième !`);
                    });
                }
                break;
        }
    }
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
            const match = new Match(firstTeam, secondTeam, interaction.options[2].value);
            firstTeam.currentMatch = match;
            secondTeam.currentMatch = match;
            await createAllChannels(interaction, match);
            match.matchState.embedPick = embed.pickEmbed(match);
            match.matchState.embedPickMessage = await match.textChannel.send(match.matchState.embedPick);
            const order = Math.floor(Math.random() * 2);
            match.matchState.pickState.currentTeam = order == 0 ? firstTeam : secondTeam;
            match.textChannel.send(`L'équipe ${firstTeam.first ? firstTeam.name : secondTeam.name} sera la première à pick !`);
        }
        if (interaction.name === 'finish' && checkAdmin(interaction)) {
            const match = Array.from(activeMatches.values()).find(match => (interaction.channel.name.includes(match.firstTeam.name)));
            if (!match) {
                return;
            }
            deleteMatch(match);
        }
        if (interaction.name === 'pick' && checkPlayer(interaction)) {
            const pickingTeam = pickBanCheck(interaction);
            if (!pickingTeam) {
                return;
            }
            pickingTeam.currentMatch.sharedGames.set(interaction.options[0].value, 1);
            pickingTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(pickingTeam.currentMatch));
            pickingTeam.currentMatch.matchState.pickState.currentTeam = pickingTeam.currentMatch.matchState.pickState.currentTeam === pickingTeam.currentMatch.firstTeam ? pickingTeam.currentMatch.secondTeam : pickingTeam.currentMatch.firstTeam;
            pickingTeam.currentMatch.matchState.pickState.step++;
            manageSteps(pickingTeam.currentMatch, interaction);
        }
        if (interaction.name === 'ban' && checkPlayer(interaction)) {
            const banningTeam = pickBanCheck(interaction);
            if (!banningTeam) {
                return;
            }
            banningTeam.currentMatch.sharedGames.set(interaction.options[0].value, 2);
            banningTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(banningTeam));
            banningTeam.currentMatch.matchState.pickState.currentTeam = banningTeam.currentMatch.matchState.pickState.currentTeam === banningTeam.currentMatch.firstTeam ? banningTeam.currentMatch.secondTeam : banningTeam.currentMatch.firstTeam;
            banningTeam.currentMatch.matchState.pickState.step++;
            manageSteps(banningTeam.currentMatch, interaction);
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
    //createAllCommands();
    interactionsClient.createCommand({
        name: "finish",
        description: "Une commande à utiliser quand les deux équipes ont fini leur match",
    }, guildId).then(console.log).catch(console.error);
});

discordClient.login(process.env.BOT_TOKEN);
