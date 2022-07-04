// Require the necessary discord.js classes
const { Client, Intents, MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { token, myId } = require('./config.json');
const { seriesLookup, seriesToMessage, addSeries } = require('./sonarr');

// Create a new client instance
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
});

async function commandInteraction(interaction) {
	const { commandName } = interaction;

	if (commandName === 'series') {
		const input = interaction.options.getString('input');
		await interaction.deferReply();
		const series = await seriesLookup(input);
		const seriesTitles = series.map((show) => show.title)
		const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Show')
					.addOptions(seriesTitles.map((title) => ({
						label: title,
						description: title,
						value: title,
					})))
			);
		await interaction.editReply({ content: 'Pong!', components: [row], fetchReply: true })
	}
}

async function selectInteraction(interaction) {
	console.log('select interaction', interaction.values)
}

client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	console.log('interaction!!', interaction);
	if (interaction.isCommand()) {
		return commandInteraction(interaction)
	}
	if (interaction.isSelectMenu()) {
		return selectInteraction(interaction)
	}
});

let conversation = false;
client.on('messageCreate', async message => {
	console.log(`recieved a message from ${message.author.username}, ${message.content}`)
	if (conversation) {
		console.log('in a conversation tho!')
		return;
	}
	if (message.author.id === client.user.id) {
		console.log(`That was my message`)
		return ;
	}
	if (message.author.id !== myId) {
		console.log(`Pinged by: ${message.author.username}#${message.author.discriminator}, not responding`)
		return ;
	}
	conversation = true;
	const filter = (reaction) => {
		return reaction.emoji.name === '👍';
	};
	const series = await seriesLookup(message.content);
	const correct = await Promise.race(series.map(async (serie) => {
		return new Promise(async (resolve, reject) => {
			try {
				const seriesMessage = await message.channel.send({ embeds: [seriesToMessage(serie)] });
				await seriesMessage.react('👍');
				await seriesMessage.awaitReactions({ filter, max: 2, time: 60000, errors: ['time'] })
				resolve(serie)
			} catch (e) {
				reject(e)
			}
		})
	}))
	await addSeries(correct)
})

client.login(token);