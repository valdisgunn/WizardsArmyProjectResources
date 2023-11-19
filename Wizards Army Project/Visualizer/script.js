
const default_sprite_size = 64;	// 64px x 64px
const wizard_sprite_size_multiplier = 4;

const use_additional_stroke = true;
const use_outline = true;

const hide_book = false;

// Get the root url of the website
// Equal to "http://localhost:8000" or "https://valdisgunn.github.io/WizardsArmyProjectResources/
let root_URL = window.location.href.split("Visualizer")[0];
// let project_folder = root_URL + "Wizards%20Army%20Project/";
let sprites_folder = root_URL + "Sprites/";
let visualizer_folder = root_URL + "Visualizer/";

// console.log("Root URL: " + root_URL);
// console.log("Sprites folder: " + sprites_folder);
// console.log("Visualizer folder: " + visualizer_folder);

let using_deployed_website = window.location.href.includes("valdisgunn.github.io");

if (using_deployed_website) {
	// Set the sprites folder to the GitHub repository API URL of my "Sprites" folder in my repository
	// sprites_folder = "https://api.github.com/repos/valdisgunn/WizardsArmyProjectResources/contents/Wizards%20Army%20Project/Sprites";
	let github_username = root_URL.split("https://")[1].split(".github.io")[0];
	let repository_name = root_URL.split("https://" + github_username + ".github.io/")[1].split("/")[0];
	sprites_folder = "https://api.github.com/repos/" + github_username + "/" + repository_name + "/contents/Wizards%20Army%20Project/Sprites";
	// console.log("Updated Sprites folder: " + sprites_folder);
}

// From closest to furthest (i.e. top to bottom): names indicate the IDs of the sprite elements
const sprite_layers = [

	"wizard-book-gem",
	"wizard-book-pages",
	"wizard-book-base",
	"wizard-book-outline",

	"wizard-nose",
	"wizard-beard",
	"wizard-hat",
	"wizard-face",
	"wizard-body",
	"wizard-hand",
	"wizard-staff",
]
const colors = [
	"#ff0000",
	"#ff6600m",
	"#ffcc00",
	"#00ff0c",
	"#00bbf1",
	"#1400d4",
	"#a018ff",
	"#df2cff",
	"#b65327",
	"#e5e5e5",
	"#4d4d4d",
];
const sprites_paths = get_list_of_sprites_names();

const grouped_sprites = {

	"wizard-hat": [],
	"wizard-body": [],
	"wizard-staff": [],

	"wizard-nose": [],
	"wizard-beard": [],

	"wizard-book": [],	// Used to group, in order: outline, base, pages, gem

	"wizard-other-sprites": [],	// Set to: [face, hand]

}
// Fill the grouped_sprites object (for all the keys of the grouped sprites object)
for (var key in grouped_sprites) {
	if (key == "wizard-book") {
		// Retrieve books from the sprites folder
		// Search for a sprite with "book" and "outline", then "base", then "pages", then "gem" in the name
		let book_outline = "";
		let book_base = "";
		let book_pages = "";
		let book_gem = "";

		for (var i = 0; i < sprites_paths.length; i++) {
			if (sprites_paths[i].includes("book") && sprites_paths[i].includes("outline")) {
				book_outline = sprites_paths[i];
			} else if (sprites_paths[i].includes("book") && sprites_paths[i].includes("base")) {
				book_base = sprites_paths[i];
			} else if (sprites_paths[i].includes("book") && sprites_paths[i].includes("pages")) {
				book_pages = sprites_paths[i];
			} else if (sprites_paths[i].includes("book") && sprites_paths[i].includes("gem")) {
				book_gem = sprites_paths[i];
			}
		}

		// Order is [outline, base, pages, gem]
		grouped_sprites[key].push(book_outline);
		grouped_sprites[key].push(book_base);
		grouped_sprites[key].push(book_pages);
		grouped_sprites[key].push(book_gem);

	} else if (key == "wizard-other-sprites") {
		// Search for a sprite with "face" and "hand" in the name
		let face_sprite = "";
		let hand_sprite = "";

		for (var i = 0; i < sprites_paths.length; i++) {
			if (sprites_paths[i].includes("face")) {
				face_sprite = sprites_paths[i];
			} else if (sprites_paths[i].includes("hand")) {
				hand_sprite = sprites_paths[i];
			}
		}

		// Order is [face, hand]
		grouped_sprites[key].push(face_sprite);
		grouped_sprites[key].push(hand_sprite);

	} else {
		if (grouped_sprites.hasOwnProperty(key)) {
			grouped_sprites[key] = get_sprites(key);
		}
	}
}

class CurrentSpritesNumbers {
	constructor() {
		this.hat = 0;
		this.body = 0;
		this.staff = 0;
		this.nose = 0;
		this.beard = 0;
		this.book = 0;
	}
}

let current_sprites_numbers = new CurrentSpritesNumbers();

let generate_random_nose_and_beard = true;

// Total: 26 first syllables, 24 second syllables, and 24 third syllables
let name_parts_1 = [
	"Al",
	"Bal",
	"Cel",
	"Dol",
	"Eld",
	"Fal",
	"Gry",
	"He",
	"Il",
	"Jun",
	"Kor",
	"Lor",
	"Myr",
	"Nar",
	"Oth",
	"Pyr",
	"Quar",
	"Rav",
	"Ser",
	"Thal",
	"Ul",
	"Vy",
	"Wal",
	"Xan",
	"Yr",
	"Zan",
];
let name_parts_2 = [

	"ald",
	"al",
	"ar",

	"eth",
	"el",
	"er",

	"i",
	"ith",
	"ino",
	"ius",

	"on",
	"or",
	"oth",

	"us",
	"ur",
	"un",

	"ys",
	"yx",
	"yn",

	"wyn",
	"wyr",

];
let name_parts_3 = [

	"ara",
	"alf",

	"en",
	"enix",

	"ion",
	"ix",
	"is",
	"ian",
	"ir",

	"or",
	"os",

	"ur",
	"uk",

	"yx",

	"kel",
	"las",
	"ron",
	"th",

]


function get_wizard_name_based_on_nose_and_beard(nose_number, beard_number) {
	// NOTE: beard number determines the beginning of the name, nose number determines the middle of the name, while
	// 		the end of the name is randomly chosen from the name_parts_3 array (in the actual game, I might think of
	//		choosing this name at random but also based on what wizards the player already has, so that if duplicate wizards appear,
	//		they will always have different names)
	let raondom_number_for_name_part_3 = Math.floor(Math.random() * name_parts_3.length);
	// Return the name
	return name_parts_1[beard_number] + name_parts_2[nose_number] + name_parts_3[raondom_number_for_name_part_3];
}



$(document).ready(function () {

	// Set the height and width of the #wizard-container to the size of the wizard sprite
	$("#wizard-container").css("height", default_sprite_size * wizard_sprite_size_multiplier);
	$("#wizard-container").css("width", default_sprite_size * wizard_sprite_size_multiplier);

	// Add a black stroke of 1 pixel (times the size multiplier) to the #wizard-container
	// $("#wizard-container").css("border", (1 * wizard_sprite_size_multiplier) + "px solid black");

	// Append the wizard face and hand images to the #wizard-container
	$("#wizard-container").append("<img id='wizard-face' src='" + grouped_sprites["wizard-other-sprites"][0] + "' />");
	$("#wizard-container").append("<img id='wizard-hand' src='" + grouped_sprites["wizard-other-sprites"][1] + "' />");

	// Append the book sprites (take the sprites from the grouped_sprites object with key "wizard-book", stored in the order: [outline, base, pages, gem])
	$("#wizard-container").append("<img id='wizard-book-outline' src='" + grouped_sprites["wizard-book"][0] + "' />");
	$("#wizard-container").append("<img id='wizard-book-base' src='" + grouped_sprites["wizard-book"][1] + "' />");
	$("#wizard-container").append("<img id='wizard-book-pages' src='" + grouped_sprites["wizard-book"][2] + "' />");
	$("#wizard-container").append("<img id='wizard-book-gem' src='" + grouped_sprites["wizard-book"][3] + "' />");

	if (hide_book) {
		$("#wizard-book-outline").css("visibility", "hidden");
		$("#wizard-book-base").css("visibility", "hidden");
		$("#wizard-book-pages").css("visibility", "hidden");
		$("#wizard-book-gem").css("visibility", "hidden");
	}

	// Append remaining sprites (hat, nose, beard, body, staff) empty at first
	$("#wizard-container").append("<img id='wizard-hat' src='' />");
	$("#wizard-container").append("<img id='wizard-nose' src='' />");
	$("#wizard-container").append("<img id='wizard-beard' src='' />");
	$("#wizard-container").append("<img id='wizard-body' src='' />");
	$("#wizard-container").append("<img id='wizard-staff' src='' />");

	reset_z_ordering();

	// Append the remaining sprites, default sprites for start
	set_wizard_sprites(true);

	// Assign function to the "#random-nose-beard-checkbox"
	$("#random-nose-beard-checkbox").change(function () {
		if (this.checked) {
			generate_random_nose_and_beard = true;
		} else {
			generate_random_nose_and_beard = false;
		}
	});
	// Make the checkbox initially checked/unchecked based on the value of generate_random_nose_and_beard
	$("#random-nose-beard-checkbox").prop("checked", generate_random_nose_and_beard);
	// Assign function to the "#randomize-wizard-button"
	$("#random-wizard-button").click(function () {
		set_wizard_sprites(false, generate_random_nose_and_beard);
	});
	// When user presses "Space", prevent default action and click the button
	$(document).keypress(function (e) {
		if (e.which == 32) {
			e.preventDefault();
			$("#random-wizard-button").click();
		}
	});
	// Assign function to the "#random-wizard-face-button" (choose random nose and beard)
	$("#random-wizard-face-button").click(function () {
		set_random_beard_and_nose();
	});
	// Assign function to the "#random-wizard-hat-button"
	$("#random-wizard-hat-button").click(function () {
		set_random_hat();
	});
	// Assign function to the "#random-wizard-body-button"
	$("#random-wizard-body-button").click(function () {
		set_random_body();
	});
	// Assign function to the "#random-wizard-staff-button"
	$("#random-wizard-staff-button").click(function () {
		set_random_staff();
	});
	// Assign function to the "#random-wizard-book-button"
	$("#random-wizard-book-button").click(function () {
		set_random_book();
	});


});

function reset_z_ordering() {
	let layers = sprite_layers.slice();
	layers.reverse();
	for (var i = 0; i < layers.length; i++) {
		$("#" + layers[i]).css("z-index", i + 1);
	}
}

function get_list_of_sprites_names() {
	// Syncronous AJAX request
	var sprites = [];
	var xhr = new XMLHttpRequest();
	xhr.open("GET", sprites_folder, false);
	xhr.send();
	if (xhr.status == 200) {
		if (!using_deployed_website) {
			// Get the list of sprites as XML
			let fileList = xhr.responseText.split("\n");
			for (i = 0; i < fileList.length; i++) {
				var fileinfo = fileList[i].split(' ');
				if (fileinfo.length > 1 && fileinfo[1].includes("href=")) {
					// Get the href
					var href = fileinfo[1].split('"')[1];
					sprites.push(href);
				}
			}
		} else {
			// We are using the deployed website, so the sprites are already in JSON format
			let sprites_JSON = JSON.parse(xhr.responseText);
			for (i = 0; i < sprites_JSON.length; i++) {
				sprites.push(sprites_JSON[i].download_url);
			}
		}
	}
	// console.log(sprites);
	return sprites;
}

// Returns a list of ppaths for sprites of thegiven type (sprite_name)
// NOTE 1: this function might change if I change the name format for sprites that are exported from Photoshop,
//	but the rest of this script can stay the same
// NOTE 2: This currently works for sprites with name format similar to "wizards__0001s_0000s_0000_[sprite_name].png"
function get_sprites(sprite_name) {

	// Get list of all sprite paths for the given type
	var sprite_paths = [];
	switch (sprite_name) {

		case "wizard-hat":
			// Get all sprites containing "hat"
			for (var i = 0; i < sprites_paths.length; i++) {
				if (sprites_paths[i].includes("hat")) sprite_paths.push(sprites_paths[i]);
			}
			break;
		case "wizard-body":
			// Get all sprites containing "body"
			for (var i = 0; i < sprites_paths.length; i++) {
				if (sprites_paths[i].includes("body")) sprite_paths.push(sprites_paths[i]);
			}
			break;
		case "wizard-staff":
			// Get all sprites containing "staff"
			for (var i = 0; i < sprites_paths.length; i++) {
				if (sprites_paths[i].includes("staff")) sprite_paths.push(sprites_paths[i]);
			}
			break;

		case "wizard-nose":
			// Get all sprites containing "nose"
			for (var i = 0; i < sprites_paths.length; i++) {
				if (sprites_paths[i].includes("nose")) sprite_paths.push(sprites_paths[i]);
			}
			break;
		case "wizard-beard":
			// Get all sprites containing "beard"
			for (var i = 0; i < sprites_paths.length; i++) {
				if (sprites_paths[i].includes("beard")) sprite_paths.push(sprites_paths[i]);
			}
			break;

		// Book or wrong sprite name
		default:
			if (sprite_name.includes("wizard-book")) {
				console.log("ERROR: Books should be parsed differently...");
			} else {
				console.log("ERROR: Sprite name " + sprite_name + " not recognized.");
				return "";
			}
			break;
	}

	// Order sprites alphabetically (reverse order)
	sprite_paths.sort();
	sprite_paths.reverse();

	return sprite_paths;
}

// Returns the correct sprite, based on the format in which all sprites are saved in the sprites folder (0 is default sprite)
function get_sprite_path(sprite_name, sprite_number) {

	// Get the sprite paths
	var sprite_paths;
	if (grouped_sprites.hasOwnProperty(sprite_name)) {
		sprite_paths = grouped_sprites[sprite_name];
	} else {
		console.log("ERROR: Sprite name " + sprite_name + " not recognized.");
		return "";
	}

	// Select the correct sprite
	if (sprite_number < sprite_paths.length) {
		return sprite_paths[sprite_number];
	} else {
		console.log("ERROR: Sprite number " + sprite_number + " out of range for sprite type " + sprite_name + ".");
		return "";
	}

}
function get_num_of_sprites_of_type(sprite_name) {

	// Get the sprite paths
	var sprite_paths;
	if (grouped_sprites.hasOwnProperty(sprite_name)) {
		sprite_paths = grouped_sprites[sprite_name];
	} else {
		console.log("ERROR: Sprite name " + sprite_name + " not recognized.");
		return "";
	}

	// Return the number of sprites
	return sprite_paths.length;
}

function add_additional_stroke() {
	// For each image in the container, clone the image, move it up by one pixel (multiplied by the size multiplier), then reclone it and move it left, then right, then down, and add a black stroke of 1 pixel (times the size multiplier), then move the image in z-layer -1000
	// Remove any existing additional stroke

	$(".additional-stroke").remove();
	const stroke_width = 1 * wizard_sprite_size_multiplier;
	const rounded_stroke = true;
	let images = $("#wizard-container img:not(.additional-stroke):not(.added-outline)");
	images.each(function () {
		// if ($(this).attr("id").includes("wizard-book")) return;
		let thickness = 3;
		for (let i = 0; i < thickness; i++) {
			for (let j = 0; j < thickness; j++) {
				let skip =
					(i == Math.floor(thickness / 2) && j == Math.floor(thickness / 2))
					||
					(rounded_stroke && ((i == 0 && j == 0)
						|| (i == 0 && j == thickness - 1)
						|| (i == thickness - 1 && j == 0)
						|| (i == thickness - 1 && j == thickness - 1))
					)
				if (!skip) {
					let clone = $(this).clone().insertAfter(this);
					let x_offset = (i - Math.floor(thickness / 2)) * stroke_width;
					let y_offset = (j - Math.floor(thickness / 2)) * stroke_width;
					clone.css("top", y_offset);
					clone.css("left", x_offset);
					clone.css("z-index", "-1000");
					clone.css("filter", "brightness(0%)");
					// Set class to "additional-stroke" so that it can be removed later
					clone.addClass("additional-stroke");
				}
			}
		}
	});
}

function add_outline() {
	// For each image in the container, clone the image, move it up by one pixel (multiplied by the size multiplier), then reclone it and move it left, then right, then down, and add a black stroke of 1 pixel (times the size multiplier), then move the image in z-layer -1000
	// Remove any existing additional stroke
	$(".added-outline").remove();
	const stroke_width = 1 * wizard_sprite_size_multiplier;
	const rounded_stroke = true;
	let images;
	if (use_additional_stroke) {
		images = $("#wizard-container img.additional-stroke:not(.added-outline)");
	} else {
		images = $("#wizard-container img:not(.additional-stroke):not(.added-outline)");
	}
	images.each(function () {
		let thickness = 3;
		for (let i = 0; i < thickness; i++) {
			for (let j = 0; j < thickness; j++) {
				let skip =
					(i == Math.floor(thickness / 2) && j == Math.floor(thickness / 2))
					||
					(rounded_stroke && ((i == 0 && j == 0)
						|| (i == 0 && j == thickness - 1)
						|| (i == thickness - 1 && j == 0)
						|| (i == thickness - 1 && j == thickness - 1))
					)
				if (!skip) {
					let clone = $(this).clone().insertAfter(this);
					let x_offset = (i - Math.floor(thickness / 2)) * stroke_width;
					let y_offset = (j - Math.floor(thickness / 2)) * stroke_width;
					let original_x_offset = parseInt($(this).css("left"));
					let original_y_offset = parseInt($(this).css("top"));
					if (
						((original_x_offset > 0 && x_offset > 0)
							|| (original_x_offset < 0 && x_offset < 0)
							|| (original_x_offset == 0 && x_offset != 0)
						) || (
							(original_y_offset > 0 && y_offset > 0)
							|| (original_y_offset < 0 && y_offset < 0)
							|| (original_y_offset == 0 && y_offset != 0)
						)
					) {
						clone.css("top", original_y_offset + y_offset);
						clone.css("left", original_x_offset + x_offset);
						clone.css("z-index", "-1001");
						// Make image
						clone.css("filter", "invert(100%) brightness(50%)");
						// clone.css("filter", "invert(100%) sepia(100%) saturate(650%) hue-rotate(50deg)");	// For green background
						// Set class to "added-outline" so that it can be removed later
						clone.addClass("added-outline");
					}
				}
			}
		}
	});
}

function set_random_wizard_name() {
	let wizard_name = get_wizard_name_based_on_nose_and_beard(current_sprites_numbers.nose, current_sprites_numbers.beard);
	$("#wizard-name").text(wizard_name);
}

// Pass in the name of a sprite as indicated in the "sprite_layers" array
// Names can be: "wizard-hat", "wizard-body", "wizard-staff" plus "wizard-nose" and "wizard-beard" if include_nose_and_beard is true
function get_random_sprite_number(sprite_name, force_number = -1) {
	if (!sprite_name.includes("wizard-book")) {
		var num_of_sprites = force_number;
		if (num_of_sprites == -1) num_of_sprites = get_num_of_sprites_of_type(sprite_name);
		var sprite_number = Math.floor(Math.random() * num_of_sprites);
		// var sprite_path = get_sprite_path(sprite_name, sprite_number);
		// return sprite_path;
		return sprite_number;
	}
	return -1;
}

function add_stroke_and_outline() {
	// if (use_additional_stroke) add_additional_stroke();
	// if (use_outline) add_outline();

	// Remove any existing clone wrappers
	$("#clones-wrapper").remove();

	let image_elements = $("#wizard-container > img");	// Select only direct children of the #wizard-container

	let wrappers_shadow_color = "#757575";
	let clones_shadow_color = "#000000";

	// Wrapper for the clones
	let clones_wrapper = $("<div></div>");
	clones_wrapper.attr("id", "clones-wrapper");
	clones_wrapper.css("position", "relative");
	clones_wrapper.css("height", default_sprite_size * wizard_sprite_size_multiplier);
	clones_wrapper.css("width", default_sprite_size * wizard_sprite_size_multiplier);
	clones_wrapper.css("z-index", "-1000");
	// Add a filter for the outline
	clones_wrapper.css("filter",
		"drop-shadow(" + (1 * wizard_sprite_size_multiplier) + "px 0px 0px " + wrappers_shadow_color + ")" + " " +
		"drop-shadow(" + (-1 * wizard_sprite_size_multiplier) + "px 0px 0px " + wrappers_shadow_color + ")" + " " +
		"drop-shadow(0px " + (1 * wizard_sprite_size_multiplier) + "px 0px " + wrappers_shadow_color + ")" + " " +
		"drop-shadow(0px " + (-1 * wizard_sprite_size_multiplier) + "px 0px " + wrappers_shadow_color + ")" + " " +
		""
	);

	clones_wrapper.appendTo("#wizard-container");

	// Append clones to the clones wrapper
	image_elements.each(function () {

		// Clone for the horizontal stroke and outline
		let clone_horizontal = $(this).clone();
		clone_horizontal.css("top", 0);
		clone_horizontal.css("left", 0);
		clone_horizontal.css("z-index", "-1001");
		clone_horizontal.css("filter",
			"drop-shadow(" + (1 * wizard_sprite_size_multiplier) + "px 0px 0px " + clones_shadow_color + ")" + " " +
			"drop-shadow(" + (-1 * wizard_sprite_size_multiplier) + "px 0px 0px " + clones_shadow_color + ")" + " " +
			// "drop-shadow(0px " + (1 * wizard_sprite_size_multiplier) + "px 0px " + shadow_color + ")" + " " +
			// "drop-shadow(0px " + (-1 * wizard_sprite_size_multiplier) + "px 0px " + shadow_color + ")" + " " +
			""
		);
		clone_horizontal.appendTo(clones_wrapper);

		// Clone for the vertical stroke and outline
		let clone_vertical = $(this).clone();
		clone_vertical.css("top", 0);
		clone_vertical.css("left", 0);
		clone_vertical.css("z-index", "-1001");
		clone_vertical.css("filter",
			// "drop-shadow(" + (1 * wizard_sprite_size_multiplier) + "px 0px 0px " + shadow_color + ")" + " " +
			// "drop-shadow(" + (-1 * wizard_sprite_size_multiplier) + "px 0px 0px " + shadow_color + ")" + " " +
			"drop-shadow(0px " + (1 * wizard_sprite_size_multiplier) + "px 0px " + clones_shadow_color + ")" + " " +
			"drop-shadow(0px " + (-1 * wizard_sprite_size_multiplier) + "px 0px " + clones_shadow_color + ")" + " " +
			""
		);
		clone_vertical.appendTo(clones_wrapper);

	});


	return;

}

function set_wizard_sprites(use_default = false, include_nose_and_beard = true) {

	// Set the sprite for the hat
	set_random_hat(use_default, false);

	// Set the sprite for the body
	set_random_body(use_default, false);

	// Set the sprite for the staff
	set_random_staff(use_default, false);

	// Set the sprite for the book
	set_random_book();

	if (include_nose_and_beard) {
		// Set sprites for nose and beard
		set_random_beard_and_nose(false);
	}

	// Reogranize sprites and add additional stroke and outline
	reset_z_ordering();
	add_stroke_and_outline();

}


// Set a random sprite for the wizard book
// NOTE: might need to be reimplemented...
function set_random_book() {
	// Generate a random book type (i.e. change color of pages, color of base, color of gem, gem visible/invisible, color of outline)

	// Recolor the outline based on a random color
	let outline_color = colors[Math.floor(Math.random() * colors.length)];
	// Calculate the rotate degree value for the hue-rotate filter based on the outline color
	let rotate_deg_val = Math.floor(colors.indexOf(outline_color) * (360 / colors.length));
	$("#wizard-book-outline").css("filter", "contrast(50%) sepia(1) hue-rotate(" + rotate_deg_val + "deg) saturate(1000%)");

	// DELETE
	$("#wizard-book-outline").css("visibility", "hidden");

}

function set_random_beard_and_nose(setting_single_sprite = true) {

	// Set the sprite for the nose
	let nose_sprite_number = get_random_sprite_number("wizard-nose");
	let nose_sprite = get_sprite_path("wizard-nose", nose_sprite_number);
	$("#wizard-nose").attr("src", nose_sprite);
	current_sprites_numbers.nose = nose_sprite_number;

	// Set the sprite for the beard
	let beard_sprite_number = get_random_sprite_number("wizard-beard");
	let beard_sprite = get_sprite_path("wizard-beard", beard_sprite_number);
	$("#wizard-beard").attr("src", beard_sprite);
	current_sprites_numbers.beard = beard_sprite_number;

	// Set the wizard name based on the chosen nose and beard
	set_random_wizard_name();

	if (setting_single_sprite) {
		reset_z_ordering();
		add_stroke_and_outline();
	}

}

// Set a random sprite for the wizard hat
function set_random_hat(use_default = false, setting_single_sprite = true) {

	// Set the sprite for the hat
	let hat_sprite_number = get_random_sprite_number("wizard-hat", (use_default ? 0 : -1));
	let hat_sprite = get_sprite_path("wizard-hat", hat_sprite_number);
	$("#wizard-hat").attr("src", hat_sprite);
	current_sprites_numbers.hat = hat_sprite_number;

	if (setting_single_sprite) {
		reset_z_ordering();
		add_stroke_and_outline();
	}

}

// Set a ranodm sprite for the wizard body
function set_random_body(use_default = false, setting_single_sprite = true) {

	// Set the sprite for the body
	let body_sprite_number = get_random_sprite_number("wizard-body", (use_default ? 0 : -1));
	let body_sprite = get_sprite_path("wizard-body", body_sprite_number);
	$("#wizard-body").attr("src", body_sprite);
	current_sprites_numbers.body = body_sprite_number;

	if (setting_single_sprite) {
		reset_z_ordering();
		add_stroke_and_outline();
	}

}

function set_random_staff(use_default = false, setting_single_sprite = true) {

	// Set the sprite for the staff
	let staff_sprite_number = get_random_sprite_number("wizard-staff", (use_default ? 0 : -1));
	let staff_sprite = get_sprite_path("wizard-staff", staff_sprite_number);
	$("#wizard-staff").attr("src", staff_sprite);
	current_sprites_numbers.staff = staff_sprite_number;

	if (setting_single_sprite) {
		reset_z_ordering();
		add_stroke_and_outline();
	}

}

// Prints debug info to the console (number of sprites, number of possinble combinations, possible errors in sprites, etc...)
function print_debug_info() {
	let stats_string = "";
	stats_string += "Total number of noses:				" + grouped_sprites["wizard-nose"].length + " noses\n";
	stats_string += "Total number of beards: 			" + grouped_sprites["wizard-beard"].length + " beards\n";
	stats_string += "> Unique wizards combinations:		" + (grouped_sprites["wizard-nose"].length * grouped_sprites["wizard-beard"].length).toString() + " wizards\n";
	stats_string += "\n";
	stats_string += "Total number of hats: 				" + get_num_of_sprites_of_type("wizard-hat") + " hats\n";
	stats_string += "Total number of clothes/bodies: 	" + get_num_of_sprites_of_type("wizard-body") + " clothes/bodies\n";
	stats_string += "Total number of staffs: 			" + get_num_of_sprites_of_type("wizard-staff") + " staffs\n";
	stats_string += "\n";

	// Cycle through all of the sprite paths, check if the path for the png image exists, and if it does, check the size of the image (if it's different than 64px, print the path)
	let found_images_with_wrong_size = [];
	sprites_paths.forEach((path, index) => {
		// Create a new image element
		let img = new Image();
		img.src = path;
		// Check if the image exists
		img.onload = function () {
			// Image exists
			if (img.width != default_sprite_size || img.height != default_sprite_size) {
				// stats_string += " > Sprite with a size different than 64px: " + path + "\n";
				found_images_with_wrong_size.push(path);
			}
		}
	});
	if (found_images_with_wrong_size.length > 0) {
		stats_string += "ERROR: Found sprites with a size different than 64px: \n";
		found_images_with_wrong_size.forEach((path, index) => {
			stats_string += "  - " + path + "\n";
		});
	} else {
		stats_string += "OK: No sprites with a size different than 64px found.\n";
	}

	// Cycle through all files in the sprites folder and check if some sprites contain the word "Layer" or "Livello" in the name (not case sensitive)
	let found_images_with_wrong_name = [];
	sprites_paths.forEach((path, index) => {
		if (path.toLowerCase().includes("layer") || path.toLowerCase().includes("livello")) {
			found_images_with_wrong_name.push(path);
		}
	});
	if (found_images_with_wrong_name.length > 0) {
		stats_string += "WARNING: Found some sprites with the word 'Layer' or 'Livello' in the name: \n";
		found_images_with_wrong_name.forEach((path, index) => {
			stats_string += "  - " + path + "\n";
		});
		stats_string += "  > This might mean that some sprites which should be named 'hat' or 'body' or 'staff' are not named correctly.\n";
	} else {
		stats_string += "OK: No sprites with the word 'Layer' or 'Livello' in the name found.\n";
	}

	console.log(stats_string);

}



print_debug_info();