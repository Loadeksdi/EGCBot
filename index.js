const Discord = require('discord.js');
const discordClient = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'], ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_PRESENCES', 'GUILD_MESSAGE_REACTIONS'] } });
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
        value: 'finals'
    }
];

const commandsList = [
    {
        name: 'help',
        description: 'Affiche l\'aide'
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

let players = [];
const teams = [];
const activeMatches = new Map();
let categoryChannel = null;
class Player {
    constructor(id, name, team) {
        this.id = id;
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

function getPlayerById(id) {
    return players.find(player => player.id === id);
}

function createTeamAndPlayers(teamRole) {
    const team = new Team(teamRole);
    const teamPlayers = teamRole.members.map(member => new Player(member.user.id, member.user.username, team));
    team.players = teamPlayers;
    return team;
}

function checkAdmin(interaction) {
    const roles = interaction.member.roles.cache;
    return roles.find(role => role.name === 'Admin tournoi');
}

function checkPlayer(interaction) {
    const roles = interaction.member.roles.cache;
    return roles.find(role => role.name === 'Player');
}

function deleteMatch(match) {
    match.textChannel.delete();
    if (categoryChannel.children.size - 1 === 0) {
        console.error(`The "matches" category is now empty, deleting...`)
        categoryChannel.delete();
    }
    players = players.filter(player => !match.firstTeam.players.includes(player) && !match.secondTeam.players.includes(player));
    match.firstTeam.currentMatch = null;
    match.secondTeam.currentMatch = null;
    activeMatches.delete(match.id);
    console.log(`The match ${match.id} (in the channel ${match.textChannel.name}) has been successfully deleted`)
}

async function createAllCommands() {
    const commands = await interactionsClient.getCommands({ guildID: process.env.GUILD_ID });
    createACommand(commands, commandsList);
}

function createACommand(discordCommands, localCommands) {
    const currentCommand = localCommands.pop();
    if (!currentCommand) {
        console.log("Finished creating all commands")
        return;
    }
    const commandAlreadyExists = discordCommands.some((command) => command.name === currentCommand.name);
    if (!commandAlreadyExists) {
        interactionsClient.createCommand(currentCommand, guildId);
        console.log(`Succesfully created the ${currentCommand.name} command`);
        setTimeout(() => createACommand(discordCommands, localCommands), 30000);
    } else {
        console.log(`Command ${currentCommand.name} was already in the guild, moving on...`)
        createACommand(discordCommands, localCommands);
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
    const authorPlayer = getPlayerById(interaction.author.id);
    const authorId = interaction.author.id;
    if (!authorPlayer) {
        interaction.channel.send(`*Vous n'êtes pas en jeu ! <@${authorId}>*`);
        return null;
    }
    const team = authorPlayer.team;
    if (team.currentMatch.textChannel.id !== interaction.channel.id) {
        return null;
    }
    if (team.name !== team.currentMatch.matchState.pickState.currentTeam.name) {
        interaction.channel.send(`*Ce n'est pas votre tour de ${interaction.name} un jeu ! <@${authorId}>*`);
        return null;
    }
    if (team.currentMatch.sharedGames.get(interaction.options[0].value) !== 0) {
        interaction.channel.send(`*Vous ne pouvez pas ${interaction.name} ce jeu, ${interaction.options[0].value} n'est pas disponible ! <@${authorId}>*`);
        return null;
    }
    switch (team.currentMatch.gamePhase) {
        case 'groupsPhase':
            if (team.currentMatch.matchState.pickState.step < 2 && interaction.name === 'ban') {
                interaction.channel.send(`*Vous ne pouvez pas bannir un jeu pour le moment, vous devez d'abord pick un jeu ! <@${authorId}>*`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step >= 2 && interaction.name === 'pick') {
                interaction.channel.send(`*Vous ne pouvez plus pick de jeu pour le moment, veuillez bannir un jeu ! <@${authorId}>*`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step >= 6) {
                interaction.channel.send(`*Phase de draft terminée, veuillez contacter un admin pour /finish ! <@${authorId}>*`);
                return null;
            }
            return team;
        case 'finals':
            if (team.currentMatch.matchState.pickState.step >= 2) {
                interaction.channel.send(`*Phase de draft terminée, veuillez contacter un admin pour /finish ! <@${authorId}>*`);
                return null;
            }
            if (interaction.name === 'ban') {
                interaction.channel.send(`Pas de bans en finale !`);
                return null;
            }
            return team;
        case 'quarterFinals':
        case 'semiFinals':
            if (team.currentMatch.matchState.pickState.step < 2 && interaction.name === 'ban') {
                interaction.channel.send(`*Vous ne pouvez pas bannir un jeu pour le moment, vous devez d'abord pick un jeu ! <@${authorId}>*`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step > 1 && interaction.name === 'pick') {
                interaction.channel.send(`*Vous ne pouvez plus pick de jeu pour le moment, veuillez bannir un jeu ! <@${authorId}>*`);
                return null;
            }
            if (team.currentMatch.matchState.pickState.step >= 5) {
                interaction.channel.send(`*Partie terminée, veuillez contacter un admin pour /finish ! <@${authorId}>*`);
                return null;
            }
            return team;
    }
}

function generateRandomGame(match) {
    const games = Array.from(match.sharedGames).filter(([game, pickState]) => pickState === 0);
    const randomGame = games[Math.floor(Math.random() * games.length)][0];
    match.sharedGames.set(randomGame, 1);
    return randomGame;
}


async function manageSteps(match, interaction) {
    const filter = (reaction, user) => {
        return (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') && getPlayerById(user.id).team.name !== getPlayerById(interaction.author.id).team.name;
    };
    if (interaction.name === 'pick') {
        switch (match.gamePhase) {
            case 'groupsPhase':
                if (match.matchState.pickState.step === 2) {
                    interaction.channel.send(`*La prochaine équipe qui devra bannir un jeu est : ${match.matchState.pickState.currentTeam.role === match.firstTeam.role ? match.firstTeam.role : match.secondTeam.role}*`);
                }
                break;
            case 'finals':
                if (match.matchState.pickState.step === 1) {
                    interaction.channel.send(`1️⃣ Le premier jeu aléatoire sera : **${generateRandomGame(match)}** !`);
                    interaction.channel.send(`2️⃣ Le deuxième jeu aléatoire sera : **${generateRandomGame(match)}** !`);
                    interaction.channel.send(`3️⃣ Le troisième jeu aléatoire sera : **${generateRandomGame(match)}** !`);
                    interaction.channel.send(`4️⃣ Le dernier jeu aléatoire sera : **${generateRandomGame(match)}** !`);
                    match.matchState.embedPickMessage.edit(embed.editPickEmbed(match));
                }
                break;
            default:
                if (match.matchState.pickState.step === 2) {
                    interaction.channel.send(`Le jeu aléatoire sera : **${generateRandomGame(match)}** !`);
                    interaction.channel.send(`*La prochaine équipe qui devra bannir un jeu est : ${match.matchState.pickState.currentTeam.role === match.firstTeam.role ? match.firstTeam.role : match.secondTeam.role}*`);
                    match.matchState.embedPickMessage.edit(embed.editPickEmbed(match));
                }
                break;
        }
    }
    else {
        switch (match.gamePhase) {
            case 'groupsPhase':
                if (match.matchState.pickState.step === 5) {
                    interaction.channel.send(`Le dernier jeu sera : **${generateRandomGame(match)}**!`);
                    match.matchState.embedPickMessage.edit(embed.editPickEmbed(match));
                }
                break;
            default:
                if (match.matchState.pickState.step === 4) {
                    const firstRandomGame = generateRandomGame(match);
                    const secondRandomGame = generateRandomGame(match);
                    match.matchState.embedPickMessage.edit(embed.editPickEmbed(match));
                    const randomGamesMessage = await interaction.channel.send(`Les jeux aléatoires seront : 1️⃣ **${firstRandomGame}** et 2️⃣ **${secondRandomGame}** !`);
                    interaction.channel.send(`*L\'équipe ${match.matchState.pickState.currentTeam.role === match.firstTeam.role ? match.firstTeam.role : match.secondTeam.role} a 30 secondes pour choisir l'ordre des jeux à jouer en cliquant sur l'emoji correspondant !*`);
                    await Promise.all([randomGamesMessage.react('1️⃣'), randomGamesMessage.react('2️⃣')]);
                    const collector = randomGamesMessage.createReactionCollector(filter, { max: 1, time: 30000 });
                    collector.on('collect', (reaction, user) => {
                        interaction.channel.send(`Le premier jeu à jouer sera **${reaction.emoji.name === '1️⃣' ? firstRandomGame : secondRandomGame}** et **${reaction.emoji.name === '2️⃣' ? firstRandomGame : secondRandomGame}** le deuxième !`);
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
            const roles = interaction.guild.roles.cache;
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
            const firstTeamRole = roles.get(interaction.options[0].value);
            const firstTeam = createTeamAndPlayers(firstTeamRole);
            const secondTeamRole = roles.get(interaction.options[1].value);
            const secondTeam = createTeamAndPlayers(secondTeamRole);
            const match = new Match(firstTeam, secondTeam, interaction.options[2].value);
            firstTeam.currentMatch = match;
            secondTeam.currentMatch = match;
            await createAllChannels(interaction, match);
            const order = Math.floor(Math.random() * 2);
            match.matchState.pickState.currentTeam = (order === 0 ? firstTeam : secondTeam);
            match.matchState.embedPick = embed.pickEmbed(match);
            match.matchState.embedPickMessage = await match.textChannel.send(match.matchState.embedPick);
            match.textChannel.send(`*L'équipe ${match.matchState.pickState.currentTeam.role === firstTeam.role ? firstTeam.role : secondTeam.role} sera la première à pick !*`);
        }
        if (interaction.name === 'finish' && checkAdmin(interaction)) {
            const match = Array.from(activeMatches.values()).find(match => match.textChannel === interaction.channel);
            if (!match) {
                const errMsg = `Couldn't find match associated to the channel ${interaction.channel.id} (${interaction.channel.name})`
                console.error(errMsg)
                interaction.channel.send(errMsg)
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
            interaction.channel.send(`Le jeu **${interaction.options[0].value}** a été pick par l'équipe ${pickingTeam.role} !`);
            pickingTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(pickingTeam.currentMatch));
            pickingTeam.currentMatch.matchState.pickState.currentTeam = pickingTeam.currentMatch.matchState.pickState.currentTeam === pickingTeam.currentMatch.firstTeam ? pickingTeam.currentMatch.secondTeam : pickingTeam.currentMatch.firstTeam;
            manageSteps(pickingTeam.currentMatch, interaction);
            pickingTeam.currentMatch.matchState.pickState.step++;
        }
        if (interaction.name === 'ban' && checkPlayer(interaction)) {
            const banningTeam = pickBanCheck(interaction);
            if (!banningTeam) {
                return;
            }
            banningTeam.currentMatch.sharedGames.set(interaction.options[0].value, 2);
            interaction.channel.send(`Le jeu **${interaction.options[0].value}** a été banni par l'équipe ${banningTeam.role} !`);
            banningTeam.currentMatch.matchState.embedPickMessage.edit(embed.editPickEmbed(banningTeam.currentMatch));
            banningTeam.currentMatch.matchState.pickState.currentTeam = banningTeam.currentMatch.matchState.pickState.currentTeam === banningTeam.currentMatch.firstTeam ? banningTeam.currentMatch.secondTeam : banningTeam.currentMatch.firstTeam;
            manageSteps(banningTeam.currentMatch, interaction);
            banningTeam.currentMatch.matchState.pickState.step++;
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
