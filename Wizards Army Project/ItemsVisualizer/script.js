

// Get the root url of the website
// Equal to "http://localhost:8000" or "https://valdisgunn.github.io/WizardsArmyProjectResources/
let root_URL = window.location.href.split("ItemsVisualizer")[0];
// let project_folder = root_URL + "Wizards%20Army%20Project/";
let sprites_folder = root_URL + "Sprites/";
let visualizer_folder = root_URL + "Visualizer/";
let items_visualizer_folder = root_URL + "ItemsVisualizer/";

let using_deployed_website = window.location.href.includes("valdisgunn.github.io");

// Sprites path
// sprites_folder = "../Sprites/";

// if (using_deployed_website) {
// 	// Set the sprites folder to the GitHub repository API URL of my "Sprites" folder in my repository
// 	// sprites_folder = "https://api.github.com/repos/valdisgunn/WizardsArmyProjectResources/contents/Wizards%20Army%20Project/Sprites";
// 	let github_username = root_URL.split("https://")[1].split(".github.io")[0];
// 	let repository_name = root_URL.split("https://" + github_username + ".github.io/")[1].split("/")[0];
// 	sprites_folder = "https://api.github.com/repos/" + github_username + "/" + repository_name + "/contents/Wizards%20Army%20Project/Sprites/";
// }

// Get the JSON content of file "../item_json_iles/clothing_items.json"
const CLOTHING_ITEMS = getJSONContent("../item_json_files/clothing_items.json");

const ITEMS_IMAGE_SIZE = 220;	// Size of the item's image (in pixels)

function getJSONContent(path) {
	// The json file is a list of JSON objects, hence [{...}, {...}, ...]
	var jsonContent = [];
	// Create a new XMLHttpRequest object
	var request = new XMLHttpRequest();
	// Set the path of the json file
	request.open("GET", path, false);
	// Send the request
	request.send(null);
	// If the request status is 200 (OK)
	if (request.status === 200) {
		// Parse the JSON content
		jsonContent = JSON.parse(request.responseText);
	}
	// Return the JSON content
	return jsonContent;
}

function populate_clothing_items() {

	/*
	For each item in the CLOTHING_ITEMS list, we have the following structure:

	
	item = {
		
		"clothing_type": string,			// Type of clothing (either "hat" or "robe")

		"name": string,						// Name of the item
		"sprite": string,					// Name of the sprite file (e.g. "hat-1.png")

		"id_string": string,				// String used to identify the items (e.g. "HAT-T1-G001-N01")
												// NOTE: We have id constricted as follows:
												//		- first string is the type of item (either "HAT" or "ROBE")
												//		- second string is the number of element types of the item (either "T1", "T2" or "T3")
												//		- third string is the group number (group of 3 items) of the item (since each item usually has 3 color variations, but i may bump it to more color variations...)
												//		- fourth string is the number of the item in the group (usually from 1 to 3, but I could even have more in the future, so I keep it padded with 2 digits, hence we will usually have only "01", "02" or "03" for now)


		"element_type": string[],			// List of element types of the item (list of string values in list [Darkness, Rock, Light, Earth, Fire, Thunder, Nature, Air, Water, Poison]) sorted from most frequent to least frequent associated pixel color in the sprite
		"item_colors": {					// Pixel palette colors (dictionary containing the name of the color (key) and the number of pixels of that color (value)) in the item's sprite
			"red": int,							// Color name (in list [black, gray, white, brown, red, yellow, green, sky_blue, blue, purple]) and its associated number of pixels in the sprite
			"...": int,							// ...
		}

		"rarity": int,						// Rarity of the item, int in range [1-6]

		"pixels_offset": [int, int],		// X and Y offsets of the image (such that the item's image sprite is centered)

		"healthPointsIncrement": float,		// ...
		"powerBoost": float,				// ...
		"skillBoost": float,				// ...
		"reachBoost": float,				// ...
		"energyBoost": float,				// ...
		"luckBoost": float,					// ...
		"weightIncrement": float,			// ...
	}

	*/

	let palette_hex = {
		"black": ["#4d4d4d", "#333333", "#1a1a1a"],
		"gray": ["#999999", "#808080", "#666666"],
		"white": ["#e5e5e5", "#cccccc", "#b3b3b3"],
		"brown": ["#b65327", "#964420", "#703318"],
		"red": ["#ff4d3a", "#ff0000", "#ca0000"],
		"yellow": ["#ffe326", "#ffcc00", "#d2a800"],
		"green": ["#9cff5a", "#00ff0c", "#00ca0a"],
		"sky_blue": ["#47d6ff", "#00bbf1", "#009ecc"],
		"blue": ["#1400d4", "#1000aa", "#110079"],
		"purple": ["#a018ff", "#8200dd", "#6200a6"],
	}

	let element_to_color_mapping = {
		"Darkness": "black",
		"Rock": "gray",
		"Light": "white",
		"Earth": "brown",
		"Fire": "red",
		"Thunder": "yellow",
		"Nature": "green",
		"Air": "sky_blue",
		"Water": "blue",
		"Poison": "purple",
	};

	let element_types = [
		"Darkness",
		"Rock",
		"Light",
		"Earth",
		"Fire",
		"Thunder",
		"Nature",
		"Air",
		"Water",
		"Poison",
	];

	let rarity_colors = {
		"Useless": "#cccccc",
		"Common": "#00ca0a",
		"Rare": "#009ecc",
		"Epic": "#a018ff",
		"Legendary": "#ffcc00"
	};

	let stat_names_mapping = {
		"healthPointsIncrement": "HP",
		"powerBoost": "POW",
		"skillBoost": "SKL",
		"reachBoost": "RCH",
		"energyBoost": "ENR",
		"luckBoost": "LCK",
		"weightIncrement": "WGT",
	};

	// Create a div contianing general information about the items
	var generalInfoDiv = document.createElement("div");
	generalInfoDiv.id = "general-info";
	// Create a div for the number of items
	var numberOfItemsDiv = document.createElement("div");
	numberOfItemsDiv.className = "number-of-items";
	let numOfHatsDiv = document.createElement("div");
	numOfHatsDiv.className = "hats";
	numOfHatsDiv.innerHTML = "Number of hats: " + CLOTHING_ITEMS.filter(item => item.clothing_type == "hat").length;
	numberOfItemsDiv.appendChild(numOfHatsDiv);
	let numOfRobesDiv = document.createElement("div");
	numOfRobesDiv.className = "robes";
	numOfRobesDiv.innerHTML = "Number of robes: " + CLOTHING_ITEMS.filter(item => item.clothing_type == "robe").length;
	numberOfItemsDiv.appendChild(numOfRobesDiv);
	generalInfoDiv.appendChild(numberOfItemsDiv);

	// Calculate number of hats and clohes with certain rarities
	let hatsProbabilities = {
		"Useless": 0,
		"Common": 0,
		"Rare": 0,
		"Epic": 0,
		"Legendary": 0
	};
	let robesProbabilities = {
		"Useless": 0,
		"Common": 0,
		"Rare": 0,
		"Epic": 0,
		"Legendary": 0
	};
	for (var i = 0; i < CLOTHING_ITEMS.length; i++) {
		if (CLOTHING_ITEMS[i].clothing_type == "hat") {
			hatsProbabilities[CLOTHING_ITEMS[i].rarity] += 1;
		} else if (CLOTHING_ITEMS[i].clothing_type == "robe") {
			robesProbabilities[CLOTHING_ITEMS[i].rarity] += 1;
		}
	}
	let hatsProbabilitiesDiv = document.createElement("div");
	hatsProbabilitiesDiv.className = "hats-probabilities";
	hatsProbabilitiesDiv.innerHTML = "Hats probabilities: " + JSON.stringify(hatsProbabilities);
	generalInfoDiv.appendChild(hatsProbabilitiesDiv);
	let robesProbabilitiesDiv = document.createElement("div");
	robesProbabilitiesDiv.className = "robes-probabilities";
	robesProbabilitiesDiv.innerHTML = "Robes probabilities: " + JSON.stringify(robesProbabilities);
	generalInfoDiv.appendChild(robesProbabilitiesDiv);

	// Append the general info div to the items container
	document.getElementById("page-content").prepend(generalInfoDiv);


	// We create a div for each clothing item, with nested divs for each of its properties
	for (var i = 0; i < CLOTHING_ITEMS.length; i++) {

		// Create the container div for the item
		var itemDiv = document.createElement("div");
		itemDiv.className = "item";
		itemDiv.id = CLOTHING_ITEMS[i].id_string;

		// Create a new div for the item's name
		var nameDiv = document.createElement("div");
		nameDiv.className = "name";
		nameDiv.innerHTML = CLOTHING_ITEMS[i].name;
		itemDiv.appendChild(nameDiv);

		// Create a new div for the item's sprite
		var spriteDiv = document.createElement("div");
		spriteDiv.className = "sprite";
		// Offset the image by the horizontal_pixels_offset
		let pixelSize = ITEMS_IMAGE_SIZE / 64.0;
		let horizontal_pixels_offset = CLOTHING_ITEMS[i].pixels_offset[0] * pixelSize;
		let vertical_pixels_offset = CLOTHING_ITEMS[i].pixels_offset[1] * pixelSize;
		// Renser image pixelated, crispy
		let imgElement = document.createElement("img");
		imgElement.src = sprites_folder + CLOTHING_ITEMS[i].sprite;
		imgElement.style.imageRendering = "pixelated";
		imgElement.style.width = ITEMS_IMAGE_SIZE + "px";
		imgElement.style.height = ITEMS_IMAGE_SIZE + "px";
		imgElement.style.transform = "translate(" + horizontal_pixels_offset + "px, " + vertical_pixels_offset + "px)";
		spriteDiv.appendChild(imgElement);
		itemDiv.appendChild(spriteDiv);

		// Create a container for the rarity and element id
		var rarityAndElementTypesContainerDiv = document.createElement("div");
		rarityAndElementTypesContainerDiv.className = "rarity-and-types-container";
		itemDiv.appendChild(rarityAndElementTypesContainerDiv);

		// Create a new div for the item's rarity
		var rarityDiv = document.createElement("div");
		rarityDiv.className = "rarity";
		rarityDiv.style.color = rarity_colors[CLOTHING_ITEMS[i].rarity];
		rarityDiv.innerHTML = CLOTHING_ITEMS[i].rarity + " " + CLOTHING_ITEMS[i].clothing_type
		rarityAndElementTypesContainerDiv.appendChild(rarityDiv);

		// Create a new div for the item's element types
		var elementTypesDiv = document.createElement("div");
		elementTypesDiv.className = "element-types";
		// Add one div for each element type, with a background color corresponding to the element type, and a text content corresponding to the initial of the element type (sorted by their index in the element_type list)
		var element_types_sorted_list = CLOTHING_ITEMS[i].element_type.sort(function (a, b) {
			return element_types.indexOf(a) - element_types.indexOf(b);
		});
		for (var j = 0; j < element_types_sorted_list.length; j++) {
			var elementTypeDiv = document.createElement("div");
			elementTypeDiv.className = "element-type";
			elementTypeDiv.style.backgroundColor = palette_hex[element_to_color_mapping[element_types_sorted_list[j]]][1];
			elementTypeDiv.innerHTML = CLOTHING_ITEMS[i].element_type[j].toUpperCase()[0];
			elementTypesDiv.appendChild(elementTypeDiv);
		}
		rarityAndElementTypesContainerDiv.appendChild(elementTypesDiv);

		// Create a new div for the item's id string
		var idStringDiv = document.createElement("div");
		idStringDiv.className = "id-string";
		idStringDiv.innerHTML = CLOTHING_ITEMS[i].id_string;
		itemDiv.appendChild(idStringDiv);

		// Create a new div for the item's colors
		// var colorsDiv = document.createElement("div");
		// colorsDiv.className = "colors";
		// colorsDiv.innerHTML = JSON.stringify(CLOTHING_ITEMS[i].item_colors);
		// itemDiv.appendChild(colorsDiv);

		// Create a container div for stats
		var statsDiv = document.createElement("div");
		statsDiv.className = "stats-container";
		itemDiv.appendChild(statsDiv);

		function create_stat_container_div(stat_name) {
			let statContainerDiv = document.createElement("div");
			statContainerDiv.className = stat_name.toLowerCase().replace(" ", "-");
			let statNameDiv = document.createElement("div");
			statNameDiv.className = "stat-name";
			statNameDiv.innerHTML = stat_names_mapping[stat_name];
			statContainerDiv.appendChild(statNameDiv);
			let statValueDiv = document.createElement("div");
			statValueDiv.className = "stat-value";
			let valueString = CLOTHING_ITEMS[i][stat_name].toString();
			if (stat_name != "weightIncrement" && stat_name != "healthPointsIncrement") {
				// Append a "+" sign if the value is positive and it is not 0
				if (valueString[0] != "-" && valueString != "0") {
					valueString = "+" + valueString;
				} else if (valueString == "0") {
					valueString = "0";
				}
				valueString += "%";
				// Make text green if stat is positive, red if negative
				if (valueString[0] == "+") {
					statValueDiv.style.color = palette_hex["green"][2];
				} else if (valueString[0] == "-") {
					statValueDiv.style.color = palette_hex["red"][2];
				} else if (valueString == "0") {
					statValueDiv.style.color = palette_hex["gray"][0];
				}
			} else {
				// Make the text sky blue if the stat is the healthPointsIncrement or the weightIncrement
				if (stat_name == "healthPointsIncrement") {
					statValueDiv.style.color = palette_hex["yellow"][1];
				} else if (stat_name == "weightIncrement") {
					statValueDiv.style.color = palette_hex["sky_blue"][2];
				}
				valueString = "+" + valueString;
			}
			statValueDiv.innerHTML = valueString;
			statContainerDiv.appendChild(statValueDiv);
			statsDiv.appendChild(statContainerDiv);
		}

		// Create divs for the various stats
		create_stat_container_div("healthPointsIncrement");
		create_stat_container_div("weightIncrement");
		create_stat_container_div("energyBoost");
		create_stat_container_div("luckBoost");
		create_stat_container_div("powerBoost");
		create_stat_container_div("skillBoost");
		create_stat_container_div("reachBoost");

		// Set the itemDiv stroke color to the rarity color
		itemDiv.style.borderColor = rarity_colors[CLOTHING_ITEMS[i].rarity];

		// Append the item div to the items container
		document.getElementById("clothing-items-container").appendChild(itemDiv);

	}

}

$(document).ready(function () {

	// Populate the clothing items
	populate_clothing_items();

});


