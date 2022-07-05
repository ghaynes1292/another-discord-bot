const { seriesLookup, seriesToMessage, addSeriesToSonarr } = require('./sonarr');
let conversation = false;

async function addSeries(series, channel) {
	conversation = true;
	const filter = (reaction) => {
		return reaction.emoji.name === '👍';
	};
	const lookupResults = await seriesLookup(series);
	const correct = await Promise.race(lookupResults.map(async (serie) => new Promise(async (resolve, reject) => {
		try {
			const seriesMessage = await channel.send({ embeds: [seriesToMessage(serie)] });
			seriesMessage.react('👍');
			await seriesMessage.awaitReactions({ filter, max: 2, time: 60000, errors: ['time'] })
			resolve(serie)
		} catch (e) {
			reject(e)
		}
	})))
	console.log('selected series', correct)
	const addedSeries = await addSeriesToSonarr(correct);
	console.log('added series', addedSeries)
}

module.exports = {
    addSeries
}