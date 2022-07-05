const { Client, Intents } = require('discord.js');
const { addSeries } = require('./discord');
const { token, myId } = require('./config.json');

// Create a new client instance
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS]
});

// only works when the process normally exits
// on windows, ctrl-c will not trigger this handler (it is unnormal)
// unless you listen on 'SIGINT'
process.on("exit", async (code) => {
	console.log("Process exit event with code: ", code);
	await client.user.setStatus('invisible');
	console.log('offline bot')
});

// catch ctrl-c, so that event 'exit' always works
process.on("SIGINT", async (signal) => {
	console.log(`Process ${process.pid} has been interrupted`);
	await client.user.setStatus('invisible');
	console.log('bot offline')
	process.exit(0);
});

// what about errors
// try remove/comment this handler, 'exit' event still works
process.on("uncaughtException", async (err) => {
	console.log(`Uncaught Exception: ${err.message}`);
	await client.user.setStatus('invisible');
	console.log('offline bot')
	process.exit(1);
});

client.once('ready', () => {
	client.user.setPresence({ activities: [{ name: 'Bot stuff' }], status: 'online' });
	console.log('Ready!');
});


client.on('interactionCreate', async interaction => {
	console.log('interaction!!', interaction);
	if (interaction.isCommand()) {
		if (interaction.user.id !== myId) {
			console.log(`Pinged by: ${interaction.user.username}#${interaction.user.discriminator}, not responding`)
			return;
		}
		if (interaction.commandName === 'add') {
			interaction.reply(`Results for: ${interaction.options.getString('name')}`)

			const addedSeries = await addSeries(interaction.options.getString('name'), interaction.channel)
			console.log('added series', addedSeries)
		}
	}
});

client.on('messageCreate', async message => {
	console.log(`recieved a message from ${message.author.username}, ${message.content}`)
	if (message.author.id === client.user.id) {
		console.log(`That was my message`)
		return;
	}
	if (message.author.id !== myId) {
		console.log(`Pinged by: ${message.author.username}#${message.author.discriminator}, not responding`)
		return;
	}
	await addSeries(message.content, message.channel)
	// conversation = true;
	// const filter = (reaction) => {
	// 	return reaction.emoji.name === '👍';
	// };
	// const series = await seriesLookup(message.content);
	// const correct = await Promise.race(series.map(async (serie) => new Promise(async (resolve, reject) => {
	// 	try {
	// 		const seriesMessage = await message.channel.send({ embeds: [seriesToMessage(serie)] });
	// 		seriesMessage.react('👍');
	// 		await seriesMessage.awaitReactions({ filter, max: 2, time: 60000, errors: ['time'] })
	// 		resolve(serie)
	// 	} catch (e) {
	// 		reject(e)
	// 	}
	// })))
	// const addedSeries = await addSeries(correct);
	// console.log('added series', addedSeries)
})

client.login(token);