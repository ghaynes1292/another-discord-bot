const { watch } = require('node:fs');
const path = require('path')
const express = require('express');
const app = express();
const port = 3000;

app.get('/', function(req, res) {
  res.send('Hello World!')
});

app.listen(port, async function() {
  console.log(`Example app listening on port ${port}!`)
	const preferenceResponse = await fetch('http://localhost:8080/api/v2/app/preferences');
	const preferences = await preferenceResponse.json();
	const { temp_path, save_path } = preferences;

	console.log('preferences', preferences)

	const watchPath = path.relative('.', path.resolve(save_path))
	console.log('path:', watchPath);
	const fsWatcher = watch(watchPath);
	fsWatcher.addListener('change', (eventType, fileName) => {
		console.log('change:', eventType, fileName)
	})
});