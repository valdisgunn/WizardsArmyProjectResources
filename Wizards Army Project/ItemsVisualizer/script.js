

// Get the root url of the website
// Equal to "http://localhost:8000" or "https://valdisgunn.github.io/WizardsArmyProjectResources/
let root_URL = window.location.href.split("ItemsVisualizer")[0];
// let project_folder = root_URL + "Wizards%20Army%20Project/";
let sprites_folder = root_URL + "Sprites/";
let visualizer_folder = root_URL + "Visualizer/";
let items_visualizer_folder = root_URL + "ItemsVisualizer/";

let using_deployed_website = window.location.href.includes("valdisgunn.github.io");

let load_page_on_tab = "";
// load_page_on_tab = "hats";
// load_page_on_tab = "robes";
load_page_on_tab = "staffs";

// Sprites path
// sprites_folder = "../Sprites/";

// if (using_deployed_website) {
// 	// Set the sprites folder to the GitHub repository API URL of my "Sprites" folder in my repository
// 	// sprites_folder = "https://api.github.com/repos/valdisgunn/WizardsArmyProjectResources/contents/Wizards%20Army%20Project/Sprites";
// 	let github_username = root_URL.split("https://")[1].split(".github.io")[0];
// 	let repository_name = root_URL.split("https://" + github_username + ".github.io/")[1].split("/")[0];
// 	sprites_folder = "https://api.github.com/repos/" + github_username + "/" + repository_name + "/contents/Wizards%20Army%20Project/Sprites/";
// }

const SET_ID_STRING_TO_ALWAYS_BE_VISIBLE = false;

// Get the JSON content of file "../item_json_iles/clothing_items.json"
const CLOTHING_ITEMS = getJSONContent("../item_json_files/clothing_items.json");

// Get the JSON content of file "../item_json_iles/staff_items.json"
const STAFF_ITEMS = getJSONContent("../item_json_files/staff_items.json");

const ITEMS_IMAGE_SIZE = 220;	// Size of the item's image (in pixels)

const ITEMS_FOCUS_SIZE_MULTIPLIER = 1.175;	// Multiplier of the item's image size when focused

// Colors associated to the various rarities
const rarity_colors = {
	"Useless": "#cccccc",
	"Common": "#00ca0a",
	"Rare": "#009ecc",
	"Epic": "#a018ff",
	"Legendary": "#ffcc00"
};

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

	let stat_names_mapping = {
		"healthPointsIncrement": "HP",
		"powerBoost": "POW",
		"skillBoost": "SKL",
		"reachBoost": "RCH",
		"energyBoost": "ENR",
		"luckBoost": "LCK",
		"weightIncrement": "WGT",
	};

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
		if (CLOTHING_ITEMS[i].clothing_type == "hat") {
			document.getElementById("hats-container").appendChild(itemDiv);
		} else if (CLOTHING_ITEMS[i].clothing_type == "robe") {
			document.getElementById("robes-container").appendChild(itemDiv);
		}

	}

}

function populate_staff_items() {

	/*
	For each item in the STAFF_ITEMS list, we have the following structure:

	
	item = {
		
		"name": string,							// Name of the item

		"sprite": string,				// Name of the sprite file (e.g. "staff-booster-2.png")

		"id_string": string,				// String used to identify the items (e.g. "STAFF-SUM-001")
												// NOTE: We have id constricted as follows:
												//		- first string is the type of item (always "STAFF")
												//		- second string is the type of the staff (from list of staff types, can be "melee", "shooter", "booster", "defender", ecc...), the first 3 letters of the type are used (e.g. "shooter" becomes "SHO")
												//		- fourth string is the number of the staff among staffs of that type (padded with 3 digits, hence we will usually have only "001", "002", ecc... for now)

		(~) "rarity": int,						// Rarity of the item, int in range [1-5]

		"pixels_offset": [int, int],		// X and Y offsets of the image (such that the item's image sprite is centered)

		// ===== Unit Stats (Actual stats of the staff item) =============================================================

		(~) "healthPointsIncrement": float,			// The HP value the staff adds or subtracts to the unit (usually 0, but some staffs might give some life to the unit, 
													e.g. defender staffs, while others might give negative values, like more powerful staff, e.g. spellcasters, others 
													are instead the stats of the unit summoned or trained, for summoners and trainers)
		"actionValue": float,					// The damage, heal amount, damage boost for other troops, ecc... of this staff (hence the main action value of the staff)
		"actionRate": float,					// The rate of the action of this staff (e.g. attack rate, shoot rate, heal rate, damage boost rate, ecc...)
		"actionRadius": float,					// The radius of the action of this staff (e.g. attack radius, shoot radius, heal radius, but also radius of the defender force field, ecc...)
		(~) "specialActionReghargeSpeed": float,	// The recharge speed of the special action of this staff (e.g. the percentage of the special attack/effect that recharges per second)
		"criticalChance": float,				// The critical chance of this staff (e.g. the percentage chance of critical hit, critical heal, critical damage boost, ecc...)
		"weightIncrement": float,				// The weight of this staff (that is added to the wizard unit wielding this staff)
		
		// ===== Unit Action Stats (Stats of the staff itself, like flags, staff type, ecc...) =============================================================

		"staff_type": string,				// Type of the staff, hence type of the wizard unit with this staff (from list of staff types, can be "melee", "shooter", "booster", "defender", ecc...)
		"criticalHitMultiplier": float,		// The multiplier of the critical hit of this staff (e.g. the multiplier of the critical hit, critical heal, critical damage boost, ecc...)
		
		// ===== Unit Action Stats for specific staff types (hence specific to melee, to shooters, to boosters, ecc...) =============================================================

		"shooterAndHealerStats": {
			"bulletPrefab": string,				// The name of the bullet prefab (e.g. "arrow")
			"isPiercing": bool,					// Whether the bullet pierces through enemies
			"bulletSpawnOffset": [float, float],	// The offset of the bullet spawn position from the position of the unit wielding this staff
			"bulletSpeedMultiplier": float				// The speed of the bullet
		}

		"meleeStats": {
			"actionKnockbackMultiplier": float,	// The knockback of the melee attack of this staff
			"areaDamageRadius": float,			// The radius of the area damage of this staff's melee attack
			"afterHitState": string, 			// The state of the unit after the hit of this staff's melee attack
		}

		"defenderStats": {
		}

		"boosterStats": {
			"boostColor": string,				// The color of the boost (e.g. "red", "purple", ecc...)
			"actionValueMultiplier": float,		// The multiplier of the action value of the boost (e.g. the multiplier of the damage boost, heal boost, ecc...)
			"actionRateMultiplier": float,		// The multiplier of the action rate of the boost (e.g. the multiplier of the damage boost rate, heal boost rate, ecc...)
			"actionRadiusMultiplier": float,	// The multiplier of the action radius of the boost (e.g. the multiplier of the damage boost radius, heal boost radius, ecc...)
			"speedMultiplier": float,			// The multiplier of the speed of the boost (e.g. the multiplier of the speed boost)
		}

		"summonerAndTrainerStats": {
			"summonedUnitPrefab": string,		// The name of the unit prefab (e.g. "skeleton-armor")
			"maxNumberOfSummonedUnitsinBattle": int,	// The maximum number of summoned units that can be in battle at the same time
			"unitsSummonedAtEachAction": int,	// The number of units summoned at each action
		}

		"spellcasterStats": {
		}

	}

	*/

	// Function used to create empty invisible divs to separate staff types
	function append_empty_invisible_item_div() {

		// Create an item div which is empty and invisible
		let itemDiv = document.createElement("div");
		itemDiv.className = "item invisible";
		itemDiv.style.borderColor = "transparent";
		itemDiv.style.backgroundColor = "transparent";
		itemDiv.style.boxShadow = "none";
		itemDiv.style.cursor = "default";
		itemDiv.style.opacity = "0";

		// Append the item div to the items container
		document.getElementById("staffs-container").appendChild(itemDiv);

	}


	// We create a div for each staff item, with nested divs for each of its properties
	let appended_staffs_for_current_type = 0;
	let current_staff_type = "";
	for (var i = 0; i < STAFF_ITEMS.length; i++) {

		if (current_staff_type == "") current_staff_type = STAFF_ITEMS[i].staff_type;
		if (current_staff_type != STAFF_ITEMS[i].staff_type) {
			let empty_divs_to_append = 3 - (appended_staffs_for_current_type % 3);
			if (empty_divs_to_append == 3) empty_divs_to_append = 0;
			for (var j = 0; j < empty_divs_to_append; j++) {
				append_empty_invisible_item_div();
			}
			current_staff_type = STAFF_ITEMS[i].staff_type;
			appended_staffs_for_current_type = 0;
		}
		appended_staffs_for_current_type += 1;

		// Create the container div for the item
		var itemDiv = document.createElement("div");
		itemDiv.className = "item";
		itemDiv.id = STAFF_ITEMS[i].id_string;

		// Create a new div for the item's name
		var nameDiv = document.createElement("div");
		nameDiv.className = "name";
		nameDiv.innerHTML = STAFF_ITEMS[i].name;
		itemDiv.appendChild(nameDiv);

		// Create a new div for the item's sprite
		var spriteDiv = document.createElement("div");
		spriteDiv.className = "sprite";
		// Offset the image by the horizontal_pixels_offset
		let pixelSize = ITEMS_IMAGE_SIZE / 64.0;
		let horizontal_pixels_offset = STAFF_ITEMS[i].pixels_offset[0] * pixelSize;
		let vertical_pixels_offset = STAFF_ITEMS[i].pixels_offset[1] * pixelSize;
		// Renser image pixelated, crispy
		let imgElement = document.createElement("img");
		imgElement.src = sprites_folder + STAFF_ITEMS[i].sprite;
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
		rarityDiv.style.color = rarity_colors[STAFF_ITEMS[i].rarity];
		rarityDiv.innerHTML = STAFF_ITEMS[i].rarity + " STAFF"
		rarityAndElementTypesContainerDiv.appendChild(rarityDiv);

		// Create a new div for the item's id string
		var idStringDiv = document.createElement("div");
		idStringDiv.className = "id-string";
		idStringDiv.innerHTML = STAFF_ITEMS[i].id_string;
		itemDiv.appendChild(idStringDiv);

		// Create a div for the staff type
		let staffTypeDiv = document.createElement("div");
		staffTypeDiv.className = "staff-type";
		staffTypeDiv.innerHTML = STAFF_ITEMS[i].staff_type.toUpperCase();
		rarityAndElementTypesContainerDiv.appendChild(staffTypeDiv);

		// Create a container div for stats
		var statsDiv = document.createElement("div");
		statsDiv.className = "stats-container";
		itemDiv.appendChild(statsDiv);



		// For now, just dump the content of the json item for this staff into a div
		function get_json_string_for_staff_item(item, dont_print_property_names) {
			// Get the keys of the item
			let keys = Object.keys(item);
			// Remove the keys in the dont_print_property_names list
			for (var i = 0; i < dont_print_property_names.length; i++) {
				keys = keys.filter(key => key != dont_print_property_names[i]);
			}
			// Remove keys that are objects and also that are NOT related to the staff item, based on its type
			// We therefore remove the keys that are objects and that dont contain the staff type in their name
			let staff_type_to_consider = item.staff_type.toLowerCase();
			keys = keys.filter(key => typeof item[key] != "object" || key.toLowerCase().includes(staff_type_to_consider));

			// Create a new object with only the keys in the keys list
			let new_item = {};
			for (var i = 0; i < keys.length; i++) {
				new_item[keys[i]] = item[keys[i]];
			}
			// Print the stats with the following syntax:
			/*
				statName: value
				statName: value
				objectStatName:
					statName: value
					statName: value
				statName: value
				listStatName: [listValue1, listValue2, ...]
				statName: value
				...
			*/
			function shorten_string(key) {
				let max_length = 30;
				if (key.length > max_length) {
					return key.substring(0, max_length - 3) + "...";
				}
				return key;
			}
			let jsonString = "";
			for (var key in new_item) {
				if (typeof new_item[key] == "object") {
					jsonString += "\n" + shorten_string(key) + ":\n";
					for (var subKey in new_item[key]) {
						if (Array.isArray(new_item[key][subKey])) {
							jsonString += "\t" + shorten_string(subKey) + ": [" + new_item[key][subKey].toString() + "]\n";
						} else {
							jsonString += "\t" + shorten_string(subKey) + ": " + new_item[key][subKey] + "\n";
						}
					}
				} else if (Array.isArray(new_item[key])) {
					jsonString += shorten_string(key) + ": [" + new_item[key].toString() + "]\n";
				} else {
					jsonString += shorten_string(key) + ": " + new_item[key] + "\n";
				}
			}
			// Return the json string
			return jsonString;
		}

		let staffItemContentDiv = document.createElement("div");
		let dont_print_property_names = ["name", "sprite", "id_string", "pixels_offset", "staff_type", "rarity"];
		staffItemContentDiv.className = "staff-item-content";
		staffItemContentDiv.style.fontSize = "0.8em";
		staffItemContentDiv.style.fontWeight = "normal";
		staffItemContentDiv.style.textAlign = "left";
		staffItemContentDiv.style.lineHeight = "1.2em";
		staffItemContentDiv.style.whiteSpace = "nowrap"
		staffItemContentDiv.innerHTML = get_json_string_for_staff_item(STAFF_ITEMS[i], dont_print_property_names).replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;");
		statsDiv.appendChild(staffItemContentDiv);


		// Set the itemDiv stroke color to the rarity color
		itemDiv.style.borderColor = rarity_colors[STAFF_ITEMS[i].rarity];


		// Append the item div to the items container
		document.getElementById("staffs-container").appendChild(itemDiv);

	}

}

function create_general_info_div() {

	// Create a div containing general information about the items
	var generalInfoDiv = document.createElement("div");
	generalInfoDiv.id = "general-info";

	// Create 2 divs, one to store infos about hats, the other about robes
	var hatsDiv = document.createElement("div");
	hatsDiv.className = "hats";
	var robesDiv = document.createElement("div");
	robesDiv.className = "robes";
	var staffsDiv = document.createElement("div");
	staffsDiv.className = "staffs";

	// Create a div for the number of hats
	let numOfHatsDiv = document.createElement("div");
	numOfHatsDiv.style.lineHeight = "1.3em";
	let totalNumOfHats = CLOTHING_ITEMS.filter(item => item.clothing_type == "hat").length;
	numOfHatsDiv.innerHTML = "<b>Number of <u>HATS</u></b>:<br/>> <b>" + totalNumOfHats + "</b> (" + (totalNumOfHats / 3) + " groups)";
	hatsDiv.appendChild(numOfHatsDiv);
	// Create a div for the number of robes
	let numOfRobesDiv = document.createElement("div");
	numOfRobesDiv.style.lineHeight = "1.3em";
	let totalNumOfRobes = CLOTHING_ITEMS.filter(item => item.clothing_type == "robe").length;
	numOfRobesDiv.innerHTML = "<b>Number of <u>ROBES</u></b>:<br/>> <b>" + totalNumOfRobes + "</b> (" + (totalNumOfRobes / 3) + " groups)";
	robesDiv.appendChild(numOfRobesDiv);
	// Create a div for the number of staffs
	let numOfStaffsDiv = document.createElement("div");
	numOfStaffsDiv.style.lineHeight = "1.3em";
	let totalNumOfStaffs = STAFF_ITEMS.length;
	numOfStaffsDiv.innerHTML = "<b>Number of <u>STAFFS</u></b>:<br/>> <b>" + totalNumOfStaffs + "</b>";
	staffsDiv.appendChild(numOfStaffsDiv);

	// Calculate number of items with certain rarities
	let hatsPerRarity = {
		"Useless": 0,
		"Common": 0,
		"Rare": 0,
		"Epic": 0,
		"Legendary": 0
	};
	let robesPerRarity = {
		"Useless": 0,
		"Common": 0,
		"Rare": 0,
		"Epic": 0,
		"Legendary": 0
	};
	let staffsPerRarity = {
		"Useless": 0,
		"Common": 0,
		"Rare": 0,
		"Epic": 0,
		"Legendary": 0
	};
	for (var i = 0; i < CLOTHING_ITEMS.length; i++) {
		if (CLOTHING_ITEMS[i].clothing_type == "hat") {
			hatsPerRarity[CLOTHING_ITEMS[i].rarity] += 1;
		} else if (CLOTHING_ITEMS[i].clothing_type == "robe") {
			robesPerRarity[CLOTHING_ITEMS[i].rarity] += 1;
		}
	}
	for (var i = 0; i < STAFF_ITEMS.length; i++) {
		staffsPerRarity[STAFF_ITEMS[i].rarity] += 1;
	}

	// Create a div for the number of hats per rarity
	let hatsPerRaritiesDiv = document.createElement("div");
	hatsPerRaritiesDiv.className = "hats-probabilities";
	hatsPerRaritiesDiv.style.marginTop = "10px";
	hatsPerRaritiesDiv.style.fontWeight = "normal";
	hatsPerRaritiesDiv.style.fontSize = "0.85em";
	hatsPerRaritiesDiv.innerHTML = "<b>Total hats per rarities</b>:<br>";
	for (var rarity in hatsPerRarity) {
		hatsPerRaritiesDiv.innerHTML += " - " + rarity + ": <b>" + hatsPerRarity[rarity] + " / " + totalNumOfHats + "</b><br>";
	}
	hatsDiv.appendChild(hatsPerRaritiesDiv);
	// Create a div for the number of robes per rarity
	let robesPerRaritiesDiv = document.createElement("div");
	robesPerRaritiesDiv.className = "robes-probabilities";
	robesPerRaritiesDiv.style.marginTop = "10px";
	robesPerRaritiesDiv.style.fontWeight = "normal";
	robesPerRaritiesDiv.style.fontSize = "0.85em";
	robesPerRaritiesDiv.innerHTML = "<b>Total robes per rarities</b>:<br>";
	for (var rarity in robesPerRarity) {
		robesPerRaritiesDiv.innerHTML += " - " + rarity + ": <b>" + robesPerRarity[rarity] + " / " + totalNumOfRobes + "</b><br>";
	}
	robesDiv.appendChild(robesPerRaritiesDiv);
	// Create a div for the number of staffs per rarity
	let staffsPerRaritiesDiv = document.createElement("div");
	staffsPerRaritiesDiv.className = "staffs-probabilities";
	staffsPerRaritiesDiv.style.marginTop = "10px";
	staffsPerRaritiesDiv.style.fontWeight = "normal";
	staffsPerRaritiesDiv.style.fontSize = "0.85em";
	staffsPerRaritiesDiv.innerHTML = "<b>Total staffs per rarities</b>:<br>";
	for (var rarity in staffsPerRarity) {
		staffsPerRaritiesDiv.innerHTML += " - " + rarity + ": <b>" + staffsPerRarity[rarity] + " / " + totalNumOfStaffs + "</b><br>";
	}
	staffsDiv.appendChild(staffsPerRaritiesDiv);

	// Append the hats, robes and staffs divs to the general info div
	generalInfoDiv.appendChild(hatsDiv);
	generalInfoDiv.appendChild(robesDiv);
	generalInfoDiv.appendChild(staffsDiv);

	// Append the general info div to the items container
	document.getElementById("info-container").prepend(generalInfoDiv);

}

function get_pixel_coordinates_on_sprite(event, spriteDiv) {

	// Get the pixel coordinates on the sprite
	let pixelCoordinates = [0, 0];

	// Get the pixel size of the sprite
	let pixelSize = ITEMS_IMAGE_SIZE * ITEMS_FOCUS_SIZE_MULTIPLIER / 64.0;

	let image = spriteDiv.children("img");

	// Get the offset of the sprite div
	let offset = image.offset();

	// Get the pixel coordinates of the mouse event
	let x = event.pageX - offset.left;
	let y = event.pageY - offset.top;

	// Get the pixel coordinates on the sprite
	pixelCoordinates[0] = Math.floor(x / pixelSize);
	pixelCoordinates[1] = Math.floor(y / pixelSize);

	// Return the pixel coordinates
	return pixelCoordinates;

}

function update_coordinates_tooltip(x, y, mousePosition) {
	// Show the coordinates tooltip
	if (!$("#coordinates-tooltip").is(":visible")) $("#coordinates-tooltip").show();
	// Update the coordinates tooltip
	if (x > 63 || y > 63) {
		$("#coordinates-tooltip").html("Out of bounds");
	} else {
		$("#coordinates-tooltip").html("[" + x + ", " + y + "]");
	}
	// Update the coordinates tooltip position
	$("#coordinates-tooltip").css("left", mousePosition[0] + 10);
	$("#coordinates-tooltip").css("top", mousePosition[1] + 10);
}

$(document).ready(function () {

	// Create a general info div
	create_general_info_div();

	// Populate the clothing items
	populate_clothing_items();

	// Populate the staff items
	populate_staff_items();

	// Add event listeners to "#hats-tab-button", "#robes-tab-button" and "#staffs-tab-button"
	$("#hats-tab-button").click(function () {
		$("#hats-tab-button").addClass("active");
		$("#robes-tab-button").removeClass("active");
		$("#hats-container").addClass("active");
		$("#robes-container").removeClass("active");
		$("#staffs-tab-button").removeClass("active");
		$("#staffs-container").removeClass("active");
	});
	$("#robes-tab-button").click(function () {
		$("#robes-tab-button").addClass("active");
		$("#hats-tab-button").removeClass("active");
		$("#robes-container").addClass("active");
		$("#hats-container").removeClass("active");
		$("#staffs-tab-button").removeClass("active");
		$("#staffs-container").removeClass("active");
	});
	$("#staffs-tab-button").click(function () {
		$("#staffs-tab-button").addClass("active");
		$("#hats-tab-button").removeClass("active");
		$("#robes-tab-button").removeClass("active");
		$("#staffs-container").addClass("active");
		$("#hats-container").removeClass("active");
		$("#robes-container").removeClass("active");
	});

	// Simulate a click on one of the buttons based on the "load_page_on_tab" variable
	if (load_page_on_tab == "" || load_page_on_tab == "hats") {
		$("#hats-tab-button").click();
	} else if (load_page_on_tab == "robes") {
		$("#robes-tab-button").click();
	} else if (load_page_on_tab == "staffs") {
		$("#staffs-tab-button").click();
	}

	// Set the "--item-scale-factor: 1.175" root variable
	document.documentElement.style.setProperty("--item-scale-factor", ITEMS_FOCUS_SIZE_MULTIPLIER);

	// Set event listener to get pixel coordinates on the sprite in which the user is hovering while holding the mouse button
	document.addEventListener("mousemove", function (event) {
		if (event.buttons == 1) {
			// Check that the event target is a sprite div
			if ($(event.target).hasClass("sprite")) {
				// Get the pixel coordinates on the sprite
				let pixelCoordinates = get_pixel_coordinates_on_sprite(event, $(event.target));
				update_coordinates_tooltip(pixelCoordinates[0], pixelCoordinates[1], [event.pageX, event.pageY]);
			} else {
				// Hide the coordinates tooltip
				if ($("#coordinates-tooltip").is(":visible")) $("#coordinates-tooltip").hide();
			}
		}
	});
	// Hide the coordinates tooltip when mouse button is released
	document.addEventListener("mouseup", function (event) {
		if ($("#coordinates-tooltip").is(":visible")) $("#coordinates-tooltip").hide();
	});

	// Add class "always-visible" to all the "id-string" divs if the "SET_ID_STRING_TO_ALWAYS_BE_VISIBLE" variable is true
	if (SET_ID_STRING_TO_ALWAYS_BE_VISIBLE) {
		$(".id-string").addClass("always-visible");
	}

});

