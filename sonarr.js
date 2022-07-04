const { MessageEmbed } = require('discord.js');
const { sonarrApiKey } = require('./config.json');

async function seriesLookup(key) {
    try {
        const response = await fetch(`http://localhost:8989/api/series/lookup?term=${encodeURIComponent(key)}&apikey=${sonarrApiKey}`)
        const results = await response.json();
        return results.slice(0, 3)
    } catch (e) {
        console.log('error!', e)
    }
}

async function addSeries({ title, titleSlug, tvdbId, profileId, images, seasons, qualityProfileId }) {
    try {
        const body = {
            title,
            titleSlug,
            tvdbId,
            profileId,
            images,
            seasons,
            profileId: 1,
            rootFolderPath: `C:\\Test`,
        };
        const response = await fetch(`http://localhost:8989/api/series?apikey=${sonarrApiKey}`, {
            method: 'POST',
            body: JSON.stringify(body)
        })
        const results = await response.json();
        return results
    } catch (e) {
        console.log('error!', e)
    }
}

function formatSeries(series) {
    const { title, seasonCount, status, overview, network, year, tvdbId, titleSlug } = series
    return {
        title, seasonCount, status, overview, network, year, tvdbId, titleSlug
    }
}

function seriesToMessage(series) {
    return new MessageEmbed()
	.setTitle(`${series.title} (${series.year})`)
	.setAuthor({ name: series.network })
	.setDescription(series.overview)
	.setThumbnail(series.images?.[0]?.url)
	.setImage(series.images?.[0]?.url)
	.setTimestamp();
}

module.exports = {
    seriesLookup,
    addSeries,
    formatSeries,
    seriesToMessage,
}