const Discord = require('discord.js');

const globalEmbed = () => new Discord.MessageEmbed()
    .setAuthor('EGC Bot', 'https://cdn.discordapp.com/icons/803260691766575155/305d3630cf15d37b771016ccc9be9772.png?size=128', 'https://www.toornament.com/en_GB/tournaments/4266282578304049152/')
    .setTimestamp();

function gameEmbed(interaction) {
    const infoEmbed = globalEmbed();
    switch (interaction.content) {
        case 'Brawlhalla':
            infoEmbed
                .setTitle('Brawlhalla').setURL('https://www.brawlhalla.com/').setColor('#fc7843').setDescription('Règles pour Brawlhalla').setThumbnail('https://www.Brawlhalla.com/c/uploads/2019/09/Logo_BrawlhallaHammer512.png').addFields(
                    {
                        name: 'Mode de jeu',
                        value: 'Stock',
                        inline: true
                    },
                    {
                        name: 'Équipes',
                        value: 'ON',
                        inline: true
                    },
                    {
                        name: 'Dégâts d\'équipe',
                        value: 'ON',
                        inline: true
                    },
                    {
                        name: 'Nombre de stocks',
                        value: '3',
                        inline: true
                    },
                    {
                        name: 'Durée du match',
                        value: '8 min',
                        inline: true
                    },
                    {
                        name: 'Taille de la carte',
                        value: '3v3',
                        inline: true
                    },
                    {
                        name: 'Choix de la map',
                        value: 'Tournament striking',
                        inline: true
                    },
                    {
                        name: 'Pick aveugle',
                        value: 'OFF',
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'Première équipe à éliminer toutes les stocks ennemies'
                    }
                ).setFooter('Phase de groupes : BO3 | Phase finale : BO5 | Finale : BO7');
            break;
        case 'Battlerite':
            infoEmbed
                .setTitle('Battlerite').setURL('https://arena.battlerite.com/').setColor('#f07a25').setDescription('Règles pour Battlerite').setThumbnail('https://cdn.Battlerite.com/www3/images/static/logos/logo-small.png').addFields(
                    {
                        name: 'Mode de jeu',
                        value: '3v3',
                        inline: true
                    },
                    {
                        name: 'Score de victoire',
                        value: '2 manches | Finale : 3 manches'
                    },
                    {
                        name: 'Durée de la manche',
                        value: 'Phase de groupes : 1min30 | Phase finale : 2min'
                    },
                    {
                        name: 'Champion en double',
                        value: 'Désactivé',
                        inline: true
                    },
                    {
                        name: 'Orbe d\'âme',
                        value: 'Activé',
                        inline: true
                    },
                    {
                        name: 'Mort subite',
                        value: 'Activé',
                        inline: true
                    },
                    {
                        name: 'Carte',
                        value: 'Aléatoire',
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: '*Condition de victoire*',
                        value: 'Première équiê à remporter 2 ou 3 manches'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'Counter-Strike : Global Offensive':
            infoEmbed
                .setTitle('Counter-Strike : Global Offensive').setURL('https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/').setColor('#fdbd1d').setDescription('Règles pour Counter-Strike : Global Offensive').setThumbnail('https://seeklogo.com/images/C/csgo-logo-CAA0A4D48A-seeklogo.com.png').addFields(
                    {
                        name: 'Mode de jeu',
                        value: 'Compétitif',
                        inline: true
                    },
                    {
                        name: 'Taille de l\'équipe',
                        value: '3v3',
                        inline: true
                    },
                    {
                        name: 'Cartes',
                        value: 'Junction - Atom - Mini Dust 2 - Beerhouse - Calavera - Eternity - Dashur'
                    },
                    {
                        name: 'Sélection de la carte',
                        value: 'Phase de groupes : 3 bans par équipe | Phase finale : 2 bans par équipe'
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'Première équipe à remporter 16 manches - Prolongations si 15-15'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'Dofus':
            infoEmbed
                .setTitle('Dofus').setURL('https://www.dofus.com/fr/prehome').setColor('#b1e600').setDescription('Règles pour Dofus').setThumbnail('https://upload.wikimedia.org/wikipedia/fr/3/3d/Dofus_Logo.png').addFields(
                    {
                        name: 'Serveur',
                        value: 'Tournament',
                        inline: true
                    },
                    {
                        name: 'Carte',
                        value: 'Arène de Goultard',
                        inline: true
                    },
                    {
                        name: 'Mode de jeu',
                        value: '3v3',
                        inline: true
                    },
                    {
                        name: 'Limite de tours',
                        value: '20',
                        inline: true
                    },
                    {
                        name: 'Choix des classes',
                        value: 'Draft (règles)',
                        inline: true
                    },
                    {
                        name: 'Personnages par joueur',
                        value: '1',
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'L\'équipe avec le plus de personnages en vie'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'League of Legends':
            infoEmbed
                .setTitle('League of Legends').setURL('https://play.euw.leagueoflegends.com/fr_FR').setColor('#01273f').setDescription('Règles pour League of Legends').setThumbnail('https://static.wikia.nocookie.net/leagueoflegends/images/0/07/League_of_Legends_icon.png/revision/latest?cb=20191018194326').addFields(
                    {
                        name: 'Carte',
                        value: 'Abîme Hurlant',
                        inline: true
                    },
                    {
                        name: 'Mode de jeu',
                        value: 'Draft de tournoi',
                        inline: true
                    },
                    {
                        name: 'Limite de temps',
                        value: '30 min',
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'Destruction du Nexus adverse | Avantage de POs à 30min'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'Minecraft':
            infoEmbed
                .setTitle('Minecraft').setURL('https://www.minecraft.net/en-us/about-minecraft').setColor('#8cba60').setDescription('Règles pour Minecraft').setThumbnail('https://external-preview.redd.it/INBHMCNdcPNCBvgGn3yQ-RH4jiAhFP4bde7-wCC2xiw.png?auto=webp&s=7fbcf884991ea6c916da84752af364fbf962687b').addFields(
                    {
                        name: 'Mode de jeu',
                        value: 'Multi-épreuves'
                    },
                    {
                        name: 'Première épreuve',
                        value: 'PVP',
                        inline: true
                    },
                    {
                        name: 'Seconde épreuve',
                        value: 'Parkour',
                        inline: true
                    },
                    {
                        name: 'Version',
                        value: '1.16'
                    },
                    {
                        name: 'Mods autorisés',
                        value: 'Optifine',
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: '(Parkour) Nombre de checkpoints du dernier joueur à 15 min | Parkour terminé en moins de 15 ou 13 (si PvP perdu) min'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'Quake Champions':
            infoEmbed
                .setTitle('Quake Champions').setURL('https://quake.bethesda.net/fr').setColor('#5b5753').setDescription('Règles pour Quake Champions').setThumbnail('https://pbs.twimg.com/profile_images/1065281071774863360/P7kww_ed.jpg').addFields(
                    {
                        name: 'Mode de jeu',
                        value: 'Match à mort par équipes',
                        inline: true
                    },
                    {
                        name: 'Score limite',
                        value: '50 frags',
                        inline: true
                    },
                    {
                        name: 'Limite de temps',
                        value: '10 min',
                        inline: true
                    },
                    {
                        name: 'Cartes',
                        value: 'Blood Covenant - Ruins of Sranath - Blood run - Corrupted keep - Awoken'
                    },
                    {
                        name: 'Sélection de la carte',
                        value: '2 bans par équipe',
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'Première équpe à 50 frags | Plus gros score à la fin du match'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'Rocket League':
            infoEmbed
                .setTitle('Rocket League').setURL('https://www.rocketleague.com/fr/').setColor('#0085e0').setDescription('Règles pour Rocket League').setThumbnail('https://cdn.discordapp.com/attachments/640872673634943006/809575449671368714/pngfind.com-rocket-league-ball-png-102118.png').addFields(
                    {
                        name: 'Arena',
                        value: 'Phase de groupes : DFH Stadium | Phase finale : DFH Stadium + Arènes compétitives (règles)'
                    },
                    {
                        name: 'Mode de jeu',
                        value: '3v3',
                        inline: true
                    },
                    {
                        name: 'Durée du match',
                        value: '5 min',
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'Plus gros score à la fin du match'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
        case 'Starcraft II':
            infoEmbed
                .setTitle('Starcraft II').setURL('https://starcraft2.com/').setColor('#4e6376').setDescription('Règles pour Starcraft II').setThumbnail('https://d1n0gwn2opdqwz.cloudfront.net/fr/sc2/original/1X/eb67887997d1b6100f9727324dcc9e2e6bad0efd.png').addFields(
                    {
                        name: 'Catégorie',
                        value: 'Mêlée',
                        inline: true
                    },
                    {
                        name: 'Vitesse du jeu',
                        value: 'Plus rapide',
                        inline: true
                    },
                    {
                        name: 'Durée d\'une partie',
                        value: '30 min',
                        inline: true
                    },
                    {
                        name: 'Cartes',
                        value: 'Augustine Fall LE - Canyon of Tribulation - Bone Temple - Realities Simulation LE - Whitewater Line LE - Slaying Field - Nephor I',
                    },
                    {
                        name: 'Choix de la carte',
                        value: 'Phase de groupes : 3 bans par équipe | Phase finale : 2 bans par équipe',
                    },
                    {
                        name: '\u200b',
                        value: '\u200b'
                    },
                    {
                        name: 'Condition de victoire',
                        value: 'Équipe avec l\'avantage à 30 min | Plus d\'ennemis avant 30 min'
                    }
                ).setFooter('Phase de groupes : BO1 | Phase finale : BO3');
            break;
    }
    return infoEmbed;
}

function pickEmbed(match) {
    const embedPick = globalEmbed();
    embedPick.setTitle(`⚔️ La phase de draft entre ${match.firstTeam.name} et ${match.secondTeam.name} commence ! ⚔️`).setThumbnail('https://cdn.discordapp.com/icons/803260691766575155/305d3630cf15d37b771016ccc9be9772.png?size=256')
        .setColor(match.matchState.pickState.currentTeam.role.color).setDescription('Liste des jeux disponibles ci-dessous');
    match.sharedGames.forEach((pickState, availableGame) => (embedPick.addField(availableGame, '🟡', true)));
    let footerPhase;
    switch (match.gamePhase) {
        case 'groupsPhase': footerPhase = 'Phase de groupes';
        case 'quarterFinals': footerPhase = 'Quart de finale';
        case 'semiFinals': footerPhase = 'Demi-finale';
        case 'finals': footerPhase = 'Grande finale';
    }
    embedPick.setFooter(footerPhase);
    return embedPick;
}

function editPickEmbed(match) {
    match.matchState.embedPick.spliceFields(0, 9);
    match.sharedGames.forEach((pickState, availableGame) => {
        let toDisplay;
        if (pickState === 0) {
            toDisplay = '🟡';
        }
        else if (pickState === 1) {
            toDisplay = '🟢';
        }
        else if (pickState === 2) {
            toDisplay = '🔴';
        }
        match.matchState.embedPick.addField(availableGame, toDisplay, true);
        match.matchState.embedPick.setColor(match.matchState.pickState.currentTeam === match.firstTeam ? match.secondTeam.role.color : match.firstTeam.role.color);
    });
    return match.matchState.embedPick;
}

function helpEmbed() {
    const embedHelp = globalEmbed();
    const colors = ['#22a9e1', '#f7921d', '#1c8e54'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    embedHelp.setTitle(`ℹ Donc, comment marche ce bot ? ℹ`).setThumbnail('https://cdn.discordapp.com/icons/803260691766575155/305d3630cf15d37b771016ccc9be9772.png?size=256')
        .setColor(color).setDescription('Liste des commandes disponibles ci-dessous').addFields(
            {
                name: '/help',
                value: 'Affiche ce message.'
            },
            {
                name: '/info <jeu>',
                value: 'Affiche les règles spécifiques d\'un jeu.'
            },
            {
                name: '/start <équipe1> <équipe2> <phase>',
                value: 'Commande Admin : Lance un match entre deux équipes (Maximum 10 matchs en même temps).'
            },
            {
                name: '/finish',
                value: 'Commande Admin : Termine un match entre deux équipes. À utiliser dans le canal du match. Veuillez noter qu\'il est **obligatoire** d\'utiliser cette commande après avoir lancé une partie.'
            },
            {
                name: '/pick <jeu>',
                value: 'Commande Joueur : Pick un jeu pour votre équipe. Utilisable après qu\'un admin ait utilisé la commande /start.'
            },
            {
                name: '/ban <jeu>',
                value: 'Commande Joueur : Bannit un jeu de la liste. Veuillez vous référer au processus de pick/ban sur les règles du Tournoi EGC.'
            }
        ).setFooter('Si le bot fait n\'importe quoi ou si vous l\'aimez bien, envoyez un DM sur Discord à moi (Ｌｏａｄ#1939) ou ArDu#4788. GL HF <3');
    return embedHelp;
}

exports.gameEmbed = gameEmbed;
exports.pickEmbed = pickEmbed;
exports.editPickEmbed = editPickEmbed;
exports.helpEmbed = helpEmbed;