
'''
Python script used to generate items based on sprites in the "./Sprites/" folder, and store their values into JSON files.
'''

import os
import PIL.Image
import itertools
import math
import json
import argparse
import random	# used to shuffle things with a seed
random.seed(14)	# set the seed to "14" to get the same scrambled lists and things every time
				# NOTE: DON'T CHANGE THIS SEED (otherwise, all new items will be generated with different names than previous items which are supposed to remain the same, and possibly also different stats, types, rarities, ecc...)

# MAIN CONSTANTS ======================================================================================================

JSON_ITEMS_DIRECTORY = "./item_json_files/"

JSON_CLOTHING_ITEMS_FILE_NAME = "clothing_items.json"

# Used to map names of clothing pieces (hat and robes) which shouldn't be named as the default "Hat" or "Robe"
TYPES_GROUPS_CLOTHING_PIECE_NAME_MAPPINGS = {
	# NOTE: for hats, various types exist, refer to the already existing names when in doubts.
	#  		As a general rule, I consider to be the default name "Hat" all hats resembling wizard hats,
	#  		while other hats may have different names ("Sun-Hat", "Pointy-Hat", "Hood", "Beanie", "Coif", "Top-Hat", "Sheriff-Hat", "Homburg-Hat", "Night-Cap", "Helmet", "Bonnet-Cap", ecc...)
	"hat": {

		# "T1-G001": "Hat",
		"T1-G004": "Sun-Hat",
		"T1-G007": "Pointy-Hat",
		"T1-G008": "Hood",
		"T1-G010": "Beanie",
		"T1-G011": "Coif",
		# DONE until "T1-G011"

		"T2-G001": "Top-Hat",
		"T2-G002": "Cowboy-Hat",
		"T2-G003": "Homburg-Hat",
		"T2-G004": "Night-Cap",
		"T2-G005": "Night-Cap",
		"T2-G006": "Night-Cap",
		"T2-G008": "Pointy-Hat",
		"T2-G009": "Night-Cap",
		"T2-G011": "Beanie",
		"T2-G012": "Beanie",
		"T2-G013": "Night-Cap",
		"T2-G014": "Helmet",
		"T2-G015": "Bonnet-Cap",
		"T2-G017": "Boater-Hat",
		# DONE until "T2-G017"

		# "T3-G001": "Hat",
		"T3-G003": "Pointy-Hat",
		"T3-G004": "Helmet",
		# DONE until "T3-G004"

	},
	# NOTE: For robes, if the sprite has a belt, its probably a "robe" (default, leave blank), 
	# 		otherwise it may be a "cloak" or "cape" based on its shape.
	#		Other names might be used as well ("Drip", "Dress", "Poncho", ecc...)
	"robe": {
		"T1-G001": "Cloak",
		"T1-G002": "Cape",
		"T1-G003": "Drip",
		"T1-G004": "Cloak",
		# DONE until "T1-G004"

		# "T2-G001": "Robe",
		"T2-G002": "Cloak",
		"T2-G003": "Dress",
		"T2-G004": "Cape",
		"T2-G005": "Cape",
		"T2-G007": "Cloak",
		"T2-G009": "Cape",
		"T2-G011": "Poncho",
		"T2-G013": "Drip",
		"T2-G014": "Cloak",
		"T2-G015": "Cloak",
		"T2-G016": "Jacket",
		# DONE until "T2-G016"

		"T3-G001": "Cape",
		"T3-G002": "Cape",
		"T3-G005": "Cape",
		"T3-G007": "Drip",
		"T3-G008": "Cape",
		# DONE until "T3-G008"
	}
}	

# OTHER CONSTANTS =====================================================================================================

RARITY_ADJECTIVES_MAPPING = {
	"Useless": [
		"Tattered",
		"Frayed",
		"Worn",
		"Faded",
		"Threadbare",
		"Patchy",
		"Dilapidated",
		"Ragged",
		"Shabby",
		"Neglected"
	],
	"Common": [
		"Simple",
		"Ordinary",
		"Basic",
		"Plain",
		"Unadorned",
		"Standard",
		"Routine",
		"Everyday",
		"Conventional",
		"Normal"
	],
	"Rare": [
		"Intricate",
		"Exquisite",
		"Refined",
		"Sophisticated",
		"Elegant",
		"Unique",
		"Exceptional",
		"Precious",
		"Rarefied",
		"Uncommon"
	],
	"Epic": [
		"Enchanting",
		"Mystical",
		"Dazzling",
		"Ethereal",
		"Grand",
		"Illustrious",
		"Magnificent",
		"Opulent",
		"Spectacular",
		"Heroic"
	],
	"Legendary": [
		"Mythical",
		"Legendary",
		"Divine",
		"Transcendent",
		"Celestial",
		"Supreme",
		"Infinite",
		"Mythological",
		"Immortal",
		"Incomparable"
	]
}
ELEMENTS_ADJECTIVES_MAPPING = {
	"Darkness": [
		"Shadowed",
		"Enigmatic",
		"Mysterious",
		"Nocturnal",
		"Obsidian",
		"Umbral",
		"Stygian",
		"Abyssal",
		"Ebon",
		"Pitch-Black",
	],
	"Rock": [
		"Granite",
		"Ashen",
		"Slate",
		"Rocky",
		"Gneiss",
		"Meteoric",
		"Cobblestone",
		"Stonebound",
		"Pebble",
		"Gravel",
	],
	"Light": [
		"Luminous",
		"Ethereal",
		"Alabaster",
		"Ivory",
		"Crystal",
		"Pearly",
		"Divine",
		"Pristine",
		"Silvery",
		"Gleaming",
	],
	"Earth": [
		"Earthen",
		"Arboreal",
		"Canyon",
		"Rustic",
		"Sienna",
		"Umberstone",
		"Muddy",
		"Clayborne",
		"Ochrewood",
		"Terra",
	],
	"Fire": [
		"Infernal",
		"Crimson",
		"Fiery",
		"Scarlet",
		"Lavaforge",
		"Emberheart",
		"Flametongue",
		"Blazebringer",
		"Ruby",
		"Incendiary",
	],
	"Thunder": [
		"Electric",
		"Thunderstruck",
		"Voltweaver's",
		"Zephyr",
		"Shockwave",
		"Golden",
		"Jolt",
		"Thunderclap",
		"Electric",
		"Sparkstorm",
	],
	"Nature": [
		"Verdant",
		"Sylvan",
		"Ivyshade",
		"Herbalist's",
		"Mossy",
		"Viridian",
		"Fernwhisper",
		"Emerald",
		"Blossomshroud",
		"Nature's",
	],
	"Air": [
		"Nimbus",
		"Breezecaller's",
		"Sylph's",
		"Azure",
		"Zephyrwind",
		"Skyborne",
		"Celestial",
		"Gustborne",
		"Aerial",
		"Airborne",
	],
	"Water": [
		"Aquaborn",
		"Sapphire",
		"Mariner's",
		"Oceanic",
		"Iceflow",
		"Nautical",
		"Cobalt",
		"Torrential",
		"Deep Blue",
		"Crystal",
	],
	"Poison": [
		"Venomous",
		"Toxic",
		"Noxious",
		"Grimshade",
		"Orchid",
		"Virulent",
		"Malevolent",
		"Purple",
		"Blightbound",
		"Viper's",
	],
}
'''
ELEMENTS_EPITHETS_MAPPING = {
	"Darkness": [
		", Shadowweaver",
		" of Eternal Night",
		", Umbral Enchanter",
		" of the Stygian Abyss",
		", Whisperer of Shadows"
	],
	"Rock": [
		" of Granite Resilience",
		", Stoneguard's Attire",
		" of the Ashen Citadel",
		", Gneiss Resonance",
		" of the Meteoric Ward"
	],
	"Light": [
		", Luminous Bearer",
		" of Ethereal Brilliance",
		", Alabaster Beacon",
		" of Pristine Luminescence",
		", Silvery Seraph's Robes"
	],
	"Earth": [
		"from the Arboreal Sanctum",
		" of Canyonweaver's Retreat",
		", Rootbound Earthshaper",
		" of Rustic Attunement",
		", Ochrewood Druid's Garb"
	],
	"Fire": [
		"from the Infernal Forge",
		" of Crimson Pyromancy",
		", Fiery Emberweaver",
		" of Scarlet Pyroclasm",
		", Blazebringer's Incantation"
	],
	"Thunder": [
		" of Electric Infusion",
		", Thunderstruck Resonance",
		"from Stormweaver's Roost",
		", Golden Galvanizer",
		" of Sparkstorm Illumination"
	],
	"Nature": [
		", Verdant Canopy",
		" of Nature's Nurturing Haven",
		", Sylvan Enchanter",
		" of Ivyshade Essence",
		", Emerald Whisperer"
	],
	"Air": [
		"from Nimbus Skyhaven",
		" of Breezecaller's Aerie",
		", Whispering Zephyr",
		" of Azure Aero Resonance",
		", Celestial Zephyr's Aura"
	],
	"Water": [
		", Aquaborn Serenity",
		" of Sapphire Oceanic Refuge",
		", Mariner's Essence",
		" of Deep Blue Radiance",
		", Crystal Current Illumination"
	],
	"Poison": [
		", Venomous Infusion",
		" of Toxic Enchantment",
		", Noxious Nebula",
		" of Malevolent Resilience",
		", Viper's Infusion Robes"
	]
}
'''
ELEMENTS_EPITHETS_MAPPING = {
		"Darkness": [
			"of Shadows",
			"of the Eclipse",
			"of the Void",
			"of Midnight",
			"of the Night",
			"of the Moon",
			"of Darkness",
			"of Pluton",
			"of Darkweave",
			"of Obsidian"
		],
		"Rock": [
			"of Stoneweave",
			"of the Rocks",
			"of Granite",
			"of Rocky Bastion",
			"of Earthforge",
			"of Stoneheart",
			"of Stone",
			"of Marble",
			"of Gneiss",
			"of Solidheart"
		],
		"Light": [
			"of Luminance",
			"of Radiance",
			"of Grace",
			"of the Sun",
			"of Light",
			"of the Stars",
			"of the Lightray",
			"of Lightweaver",
			"of Dawn",
			"of Harmony"
		],
		"Earth": [
			"of the Mud",
			"of the Earth",
			"of Clay",
			"of Earthforge",
			"of Sandstone",
			"of Earthbound",
			"of the Earthshaper",
			"of the Grounded",
			"of Earthquake",
			"of the Fossils"
		],
		"Fire": [
			"of thr Blaze",
			"of Emberforge",
			"of Fury",
			"of Pyromancy",
			"of the Volcano",
			"of Magma",
			"of Flameheart",
			"of the Flames",
			"of Fire",
			"of Ignition"
		],
		"Thunder": [
			"of Stormcaller",
			"of Thunderclap",
			"of the Lightning",
			"of Thunderforge",
			"of the Thunder",
			"of the Storm",
			"of Electrospells",
			"of Stormweaver",
			"of Thunderstrike",
			"of the Sparks"
		],
		"Nature": [
			"of Growth",
			"of Nature",
			"of the Forest",
			"of Blossomweave",
			"of the Leaves",
			"of the Trees",
			"of the Woods",
			"of the Jungle",
			"of Life",
			"of the Plants"
		],
		"Air": [
			"of the Wind",
			"of Air",
			"of the Sky",
			"of the Breeze",
			"of Breezecaller",
			"of the Rain",
			"of the Clouds",
			"of Aetheria",
			"of the Zephyr",
			"of Windsong"
		],
		"Water": [
			"of Aquaborn",
			"of the Water",
			"of the Sea",
			"of the Ocean",
			"of the Waterfalls",
			"of the River",
			"of the Lake",
			"of Mermaids",
			"of the Abyss",
			"of Thalos"
		],
		"Poison": [
			"of Venom",
			"of Toxicity",
			"of Poison",
			"of the Snake",
			"of the Viper",
			"of Venomheart",
			"of Death",
			"of Plague",
			"of Lethality",
			"of the Scorpion"
		]
	}

ELEMENTS_PLACES_MAPPING = {
	"Darkness": [
		" of Shadowscape",
		" from the Voidrealm",
		" of the Darklands",
		" from the Umbralands",
		" of the Void Abyss"
	],
	"Rock": [
		" from Granite Valley",
		" of Fortrock",
		" of the Rock Stronghold",
		" from the Rocklands",
		" of Stonewall"
	],
	"Light": [
		" of the Sanctuary",
		" from the Ethereal Temple",
		" of Light Haven",
		" from the Heavens",
		" of the Celestial Realm"
	],
	"Earth": [
		" from the Mountain's Peak",
		" of Canyonweaver",
		" of the Rootlands",
		" from the Mudlands",
		" from Earth's Core"
	],
	"Fire": [
		" from the Infernal Pit",
		" of the Crimson Pyre",
		" from the Firelands",
		" of the Scarlet Citadel",
		" from the Volcanic Depths"
	],
	"Thunder": [
		" of Stormhold",
		" from the Thunderlands",
		" of Electrostorm",
		" from the Lighning Plains",
		" of Sparksreach"
	],
	"Nature": [
		" from Treehaven",
		" of Nature City",
		" from the Sylvan Plains",
		" of the Ivyshade Forest",
		" from Woodlands"
	],
	"Air": [
		" from Aetheria",
		" of Breeze City",
		" from the Zephyr Plains",
		" of the Flying Isles",
		" from Windlands"
	],
	"Water": [
		" of Aquaria",
		" from the Waterfalls",
		" of Atlantis",
		" from Bluewater Bay",
		" of the Deeps"
	],
	"Poison": [
		" of the Venom Pit",
		" from Toxiclands",
		" of Venomous Forests",
		" from Poison City",
		" of the Viper's Den"
	]
}

def get_actual_general_epithets_list():
	'''
	Returns the list of general epithets but with no repetitions and with epithets which are only 1 word except for "of" or "the"
	'''
	# NOTE: this list may contain duplicates or too long epithets, use the "get_actual_general_epithets_list()" function to get the actual list of epithets that can be used
	general_epithets_not_adjusted = [
		# " of Arcane Secrets",
		# " of Ethereal Whispers",
		# " of Celestial Harmony",
		# " of Astral Essence",
		# " of Shrouded Wisdom",
		# " of Cosmic Insight",
		# " of Tranquil Essence",
		# " of Timeless Arcana",
		# " of Endless Sorcery",
		# " of Eternal Enigma",
		# " of Astral Attunement",
		# " of Enchanted Realms",
		# " of Mystical Prowess",
		# " of Infinite Wisdom",
		# " of Timeless Enchantment",
		# " of Everlasting Arcana",
		# " of Eternal Echoes",
		# " of Infinite Realms",
		# " of Enigmatic Forces",
		# " of Harmonious Whispers",
		# " of Tranquil Reflection",
		# " of Veiled Secrets",
		# " of Astral Resonance",
		# " of Mystical Harmony",
		# " of Ethereal Insight",
		# " of Unseen Forces",
		# " of Celestial Radiance",
		# " of Timeless Wisdom",
		# " of Enchanted Echoes",
		# " of Arcane Elegance",
		# " of Harmonic Whispers",
		# " of Transcendent Knowledge",
		# " of Eternal Silence",
		# " of Enigmatic Presence",
		# " of Serene Reflection",
		# " of Astral Realms",
		# " of Mystic Serenity",
		# " of Celestial Echoes",
		# " of Harmonious Insight",
		# " of Ethereal Presence",
		# " of Tranquil Knowledge",
		# " of Celestial Essence",
		# " of Astral Knowledge",
		# " of Enchanted Knowledge",
		# " of Ancient Arcana",
		# " of Ancient Wisdom",
		# " of Ancient Knowledge",
		# " of Ancient Insight",
		# " of Ancient Presence",
		# " of Ancient Essence",
		# " of Ancient Enchantment",
		# " of Ancient Sorcery",
		# " of Ancient Whispers",
		# " of Ancient Radiance",
		# " of Ancient Echoes",
		# " of Ancient Serenity",
		# " of Ancient Reflection",
		# " of Stylish Elegance",

		# " of the Enigma",
		# " of the Mystic",
		# " of the Arcane",
		# " of the Unknown",
		# " of the Unseen",
		# " of the Mind",
		# " of the Runes",
		# " of the Unknown",
		# " of the Edges",
		# " of the Untold",
		# " of the Unspoken",
		# " of the Unheard",
		# " of the Unseen",
		# " of the Unrevealed",
		# " of the Elements",

		# Names and misc
		" of Silence",
		" of Serenity",
		" of Elegance",
		" of Mystery",
		" of Harmony",
		" of Tranquility",
		" of Wisdom",
		" of Prowess",
		" of Reflection",
		" of Insight",
		" of Silence",
		" of Knowledge",
		" of Veil",
		" of Infinity",
		" of Whispers",
		" of Presence",
		" of Echoes",
		" of Grace",
		" of Resonance",
		" of Enchantment",
		" of Secrets",
		" of Unfolding",
		" of Unbound",
		" of Unveiling",
		" of Wizardry",
		" of Sorcery",
		" of Respect",
		
		# Fun easter egg
		" of Valdis Gunn",

		# Human qualities
		" of Resistance",
		" of Resilience",
		" of Courage",
		" of Empathy",
		" of Compassion",
		" of Resilience",
		" of Courage",
		" of Integrity",
		" of Honesty",
		" of Generosity",
		" of Kindness",
		" of Patience",
		" of Curiosity",
		" of Creativity",
		" of Optimism",
		" of Adaptability",
		" of Perseverance",
		" of Gratitude",
		" of Caring",
		" of Empowerment",
		" of Tolerance",
		" of Humility",
		" of Tactfulness",
		" of Flexibility",
		" of Forgiveness",
		" of Wisdom",
		" of Loyalty",
		" of Diligence",
		" of Sensitivity",
		" of Humor",
		" of Reliability",
		" of Understanding",
		" of Assertiveness",
		" of Graciousness",
		" of Independence",
		" of Fairness",
		" of Altruism",
		" of Punctuality",
		" of Sincerity",
		" of Vivacity",
		" of Discernment",
		" of Maturity",
		" of Harmony",
		" of Candor",
		" of Thoroughness",
		" of Empowerment",
		" of Sagacity",
		" of Cautiousness",
		" of Equanimity",
		" of Inclusiveness",
		" of Versatility",
		" of Diplomacy",
		" of Graciousness",
		" of Magnanimity",
		" of Decisiveness",
		" of Vitality",
		" of Credibility",
		" of Sociability",
		" of Prudence",
		" of Grit",
		" of Imagination",
		" of Liberality",
		" of Harboring",
		" of Zeal",
		" of Tranquility",
		" of Cooperation",
		" of Modesty",
		" of Sincerity",
		" of Prowess",
		" of Dexterity",
		" of Pliability",
		" of Stoicism",
		" of Endurance",
		" of Enthusiasm",
		" of Tenacity",
		" of Serenity",
		" of Rationality",
		" of Exuberance",
		" of Cordiality",
		" of Intuition",
		" of Sensitivity",
		" of Punctuality",
		" of Sociability",
		" of Dynamism",
		" of Reticence",
		" of Consistency",
		" of Efficiency",
		" of Harmony",
		" of Decorum",
		" of Modesty",
		" of Mellowness",
		" of Cleverness",
		" of Munificence",
		" of Empathy",
		" of Sanguinity",
		" of Tactfulness",
		" of Fidelity",
		" of Discernment",
		" of Sagacity",
		" of Amiability",
		" of Liveliness"
	]
	epithets = []
	for epithet in general_epithets_not_adjusted:
		if epithet in epithets:
			continue
		epithet_words = epithet.strip().split(" ")
		if (len(epithet_words) == 1) \
			or (len(epithet_words) == 2 and epithet_words[0] in ["of", "the"]) \
			or (len(epithet_words) == 3 and epithet_words[0] in ["of", "the"] and epithet_words[1] in ["of", "the"]):
			epithets.append(epithet)
	return epithets

# GENERAL_EPITHETS = get_actual_general_epithets_list()
GENERAL_EPITHETS = [
	# Names and misc
	" of Silence",
	" of Serenity",
	" of Elegance",
	" of Mystery",
	" of Harmony",
	" of Tranquility",
	" of Wisdom",
	" of Prowess",
	" of Reflection",
	" of Insight",
	" of Silence",
	" of Knowledge",
	" of Veil",
	" of Infinity",
	" of Whispers",
	" of Presence",
	" of Echoes",
	" of Grace",
	" of Resonance",
	" of Enchantment",
	" of Secrets",
	" of Unfolding",
	" of Unbound",
	" of Unveiling",
	" of Wizardry",
	" of Sorcery",
	" of Respect",
	
	# Fun easter egg
	" of Valdis Gunn",

	# Human qualities
	" of Resistance",
	" of Resilience",
	" of Courage",
	" of Empathy",
	" of Compassion",
	" of Resilience",
	" of Courage",
	" of Integrity",
	" of Honesty",
	" of Generosity",
	" of Kindness",
	" of Patience",
	" of Curiosity",
	" of Creativity",
	" of Optimism",
	" of Perseverance",
	" of Gratitude",
	" of Caring",
	" of Empowerment",
	" of Tolerance",
	" of Humility",
	" of Tactfulness",
	" of Flexibility",
	" of Forgiveness",
	" of Wisdom",
	" of Loyalty",
	" of Diligence",
	" of Sensitivity",
	" of Humor",
	" of Reliability",
	" of Fairness",
	" of Altruism",
	" of Punctuality",
	" of Sincerity",
	" of Vivacity",
	" of Discernment",
	" of Maturity",
	" of Harmony",
	" of Candor",
	" of Empowerment",
	" of Thoroughness",
	" of Sagacity",
	" of Equanimity",
	" of Versatility",
	" of Diplomacy",
	" of Graciousness",
	" of Magnanimity",
	" of Decisiveness",
	" of Vitality",
	" of Credibility",
	" of Sociability",
	" of Prudence",
	" of Grit",
	" of Imagination",
	" of Liberality",
	" of Harboring",
	" of Zeal",
	" of Tranquility",
	" of Cooperation",
	" of Modesty",
	" of Sincerity",
	" of Prowess",
	" of Dexterity",
	" of Pliability",
	" of Stoicism",
	" of Endurance",
	" of Enthusiasm",
	" of Tenacity",
	" of Serenity",
	" of Rationality",
	" of Exuberance",
	" of Cordiality",
	" of Intuition",
	" of Sensitivity",
	" of Punctuality",
	" of Sociability",
	" of Dynamism",
	" of Reticence",
	" of Consistency",
	" of Efficiency",
	" of Harmony",
	" of Decorum",
	" of Modesty",
	" of Mellowness",
	" of Cleverness",
	" of Munificence",
	" of Empathy",
	" of Sanguinity",
	" of Tactfulness",
	" of Fidelity",
	" of Discernment",
	" of Sagacity",
	" of Amiability",
	" of Liveliness"
]

# Scramble the epithets list deterministically
random.shuffle(GENERAL_EPITHETS)

# Get command line arguments ("--ignore-old-items-differences", ...)
parser = argparse.ArgumentParser()
parser.add_argument("--ignore-old-items-differences", action="store_true")
args = parser.parse_args()

# Used to sort items by their sprite name
def get_fixed_item_sprite_name(sprite_name):
	name = sprite_name.split(".")[0]
	# check if the sprite contains "-"
	if "-" in name:
		# get the number after the "-"
		return name.split("-")[1].zfill(3)
	else:
		# get the number after the "_"
		return "1".zfill(3)

def main():

	# Get the list of file names in the "./Sprites/" folder.
	sprites = os.listdir("./Sprites/")

	# create dictionaries to store hats and robes
	clothing_items = []

	'''
	Hats and robes objects have the following attributes:

	item = {
		
		(DONE) "clothing_type": string,			// Type of clothing (either "hat" or "robe")

		(DONE) "name": string,						// Name of the item
		(DONE) "sprite": string,					// Name of the sprite file (e.g. "hat-1.png")

		(DONE) "id_string": string,				// String used to identify the items (e.g. "HAT-T1-G001-N01")
												// NOTE: We have id constricted as follows:
												//		- first string is the type of item (either "HAT" or "ROBE")
												//		- second string is the number of element types of the item (either "T1", "T2" or "T3")
												//		- third string is the group number (group of 3 items) of the item (since each item usually has 3 color variations, but i may bump it to more color variations...)
												//		- fourth string is the number of the item in the group (usually from 1 to 3, but I could even have more in the future, so I keep it padded with 2 digits, hence we will usually have only "01", "02" or "03" for now)


		(DONE) "element_type": string[],			// List of element types of the item (list of string values in list [Darkness, Rock, Light, Earth, Fire, Thunder, Nature, Air, Water, Poison]) sorted from most frequent to least frequent associated pixel color in the sprite
		(DONE) "item_colors": {					// Pixel palette colors (dictionary containing the name of the color (key) and the number of pixels of that color (value)) in the item's sprite
				"red": int,							// Color name (in list [black, gray, white, brown, red, yellow, green, sky_blue, blue, purple]) and its associated number of pixels in the sprite
				"...": int,							// ...
			}

		(DONE) "rarity": int,						// Rarity of the item, int in range [1-6]

		"pixels_offset": [int, int],		// X and Y offsets of the image (such that the item's image sprite is centered)

		"healthPointsIncrement": float,		// ...
		"powerBoost": float,				// ...
		"skillBoost": float,				// ...
		"reachBoost": float,				// ...
		"energyBoost": float,				// ...
		"luckBoost": float,					// ...
		"weightIncrement": float,			// ...
	}

	'''

	# Iterate through the sprites
	for sprite_name in sprites:

		# Get the type of the sprite (split the name by - or _ or .)
		item_type = sprite_name.split("-")[0].split("_")[0].split(".")[0]

		if "placeholder" in sprite_name:
			# do nothing for now...
			continue
		if item_type == "nose" or item_type == "beard" or item_type == "face" or item_type == "hand":
			# do nothing for now...
			continue
		elif item_type == "hat" or item_type == "robe":
			# Create and add a new clothing item
			clothing_items.append(initialize_clothing_item(sprite_name, item_type))
		elif item_type == "staff":
			# TO IMPLEMENT
			continue
		elif item_type == "book":
			# TO IMPLEMENT
			continue

	# Add the "id_string" to clothing items
	clothing_items = generate_clothing_items_attributes(clothing_items)

	# sort items by their id_string
	clothing_items.sort(key=lambda item: item["id_string"])

	def get_item_string(item, ignore_unset_stats = False, print_in_json_format = True):
		default_item = get_empty_clothing_item()
		items_string = ""
		items_string += item["id_string"] + ": " + "\n"
		for key in item:
			if item[key] != default_item[key] or not ignore_unset_stats:
				items_string += "\t" + key + ": " + str(item[key]) + "\n"
		return items_string

	# Print items on console
	for item in clothing_items:
		print(get_item_string(item, False, False))

	def get_compact_item_string(item):
		items_string = ""
		# Append id_string
		items_string += item["id_string"] + "/"
		# Append sprite
		items_string += item["sprite"][0:-4] + " | "
		# Append name
		items_string += item["name"] + " | "
		# Append rarity
		items_string += str(item["rarity"])[0:3] + ". | "
		# Append element types (only as initials)
		items_string += "+".join([element_type[0] for element_type in item["element_type"]]) + " | "
		# Append stat values as a list (of only values)
		items_string += str([item["healthPointsIncrement"], item["powerBoost"], item["skillBoost"], item["reachBoost"], item["energyBoost"], item["luckBoost"], item["weightIncrement"]])
		return items_string

	# ==================================================================================================================
	# TESTS ===========================================================================================================

	print("\n>>>>> TESTS:")

	# check if there are 2 items with the same name (if there are, print them)
	found_duplicate_names = False
	for item1 in clothing_items:
		for item2 in clothing_items:
			if item1 != item2 and item1["name"] == item2["name"]:
				found_duplicate_names = True
				print("\t> ERROR: Found 2 clothing items with the same name: ", item1["name"])
				print("\t\t", item1["id_string"], " (",item1["element_type"],")", "  -  ", item1["sprite"],sep="")
				print("\t\t", item2["id_string"], " (",item2["element_type"],")", "  -  ", item2["sprite"],sep="")
	if not found_duplicate_names:
		print("\tOK: No duplicate names found (for hats and clothes).")

	# Check if among the 3 items of a same group there are 2 items with the same types (in any order)
	found_duplicate_types = False
	for item1 in clothing_items:
		for item2 in clothing_items:
			group_string_1 = item1["id_string"].split("-")[2]
			group_string_2 = item2["id_string"].split("-")[2]
			item_type_1 = item1["id_string"].split("-")[0]
			item_type_2 = item2["id_string"].split("-")[0]
			if item1 != item2 and group_string_1 == group_string_2 and item_type_1 == item_type_2:
				if set(item1["element_type"]) == set(item2["element_type"]):
					found_duplicate_types = True
					print("\t> ERROR: Found 2 clothing items with the same types in the same group: ", item1["element_type"])
					print("\t\t", item1["id_string"], " (",item1["element_type"],")", "  -  ", item1["sprite"],sep="")
					print("\t\t", item2["id_string"], " (",item2["element_type"],")", "  -  ", item2["sprite"],sep="")
	if not found_duplicate_types:
		print("\tOK: No duplicate types on the same group found (for hats and clothes).")

	# Get the content of the the currently existing JSON file (if it exists), and compare its content with the new items to write
	found_old_items_differences_with_new_items = False
	json_file_path = JSON_ITEMS_DIRECTORY + JSON_CLOTHING_ITEMS_FILE_NAME
	if os.path.exists(json_file_path):
		with open(json_file_path, "r") as json_file:
			json_file_content = json.load(json_file)
			# Compare the items in the JSON file with the new items
			# Group all the items into 3 groups for each glothing type:
			# 	The 3 groups correspond to a number of element types of the item (either "T1", "T2" or "T3")
			# Compare items, one by one, of the previous list with the new list (compare their element types lists, in order, their rarity, their name and their stats), until the old items are over (and only new items remain, but they are all after the old items' last element of the group)
			# 	If the items are the same, then do nothing, otherwise, print the old item and the new item as an "> ERROR"

			# Group the items in the JSON file by their number of element types
			grouped_old_items = {
				"hat": {
					"T1": [],
					"T2": [],
					"T3": [],
				},
				"robe": {
					"T1": [],
					"T2": [],
					"T3": [],
				},
			}
			grouped_new_items = {
				"hat": {
					"T1": [],
					"T2": [],
					"T3": [],
				},
				"robe": {
					"T1": [],
					"T2": [],
					"T3": [],
				},
			}
			for item in json_file_content:
				grouped_old_items[item["clothing_type"]][item["id_string"].split("-")[1]].append(item)
			for item in clothing_items:
				grouped_new_items[item["clothing_type"]][item["id_string"].split("-")[1]].append(item)
			# Sort all items in the groups by their fixed sprite name
			for clothing_type in grouped_old_items:
				for item_type in grouped_old_items[clothing_type]:
					grouped_old_items[clothing_type][item_type].sort(key=lambda item: get_fixed_item_sprite_name(item["sprite"]), reverse=True)
			for clothing_type in grouped_new_items:
				for item_type in grouped_new_items[clothing_type]:
					grouped_new_items[clothing_type][item_type].sort(key=lambda item: get_fixed_item_sprite_name(item["sprite"]), reverse=True)
			# Compare the items in the JSON file with the new items
			for clothing_type in grouped_old_items:
				for item_type in grouped_old_items[clothing_type]:
					for i in range(len(grouped_old_items[clothing_type][item_type])):
						# Get the old item and the new item
						old_item = grouped_old_items[clothing_type][item_type][i]
						new_item = grouped_new_items[clothing_type][item_type][i]
						# Compare their element types lists, in order, their rarity, their name and their stats
						if old_item["element_type"] != new_item["element_type"] \
							or old_item["rarity"] != new_item["rarity"] \
							or old_item["name"] != new_item["name"] \
							or old_item["healthPointsIncrement"] != new_item["healthPointsIncrement"] \
							or old_item["powerBoost"] != new_item["powerBoost"] \
							or old_item["skillBoost"] != new_item["skillBoost"] \
							or old_item["reachBoost"] != new_item["reachBoost"] \
							or old_item["energyBoost"] != new_item["energyBoost"] \
							or old_item["luckBoost"] != new_item["luckBoost"] \
							or old_item["weightIncrement"] != new_item["weightIncrement"]:
							found_old_items_differences_with_new_items = True
							print("\t> ERROR: The new items introduced changes to the old items, found 2 different items here: ")
							print("\t  ", "OLD: ", get_compact_item_string(old_item), sep="")
							print("\t  ", "NEW: ", get_compact_item_string(new_item), sep="")
			if not found_old_items_differences_with_new_items:
				print("\tOK: No differences in ordering found between the old items and the new items.")
			else:
				print("\n\t", "  NOTE: errors might be due to the fact that new items in the Photoshop file were created right next to old items, \n", 
		  					"\t\tinstead of at the top of the list of layers for a specific hat's/robe's group of sprites \n",
							"\t\t(grouped by number of elements).\n", 
							"\t\tCheck the layers of the photoshop file before continuing, and if you find there are no errors there \n",
							"\t\t(but this error is originated by something else), then re-run this script with parameter \n",
							"\t\t\"--ignore-old-items-differences\" to overwrite the items list with the new one.\n",
							"\t\tAlso, it might be good to create an additiona backup file of the current items somewhere...", sep="")

	# ==================================================================================================================
	# JSON ============================================================================================================

	# Check if command line arguments contain "--ignore-old-items-differences", if it doesnt, terminate the script
	if found_old_items_differences_with_new_items and not args.ignore_old_items_differences:
		print("\n\n>>>>> NOTE: To overwrite the JSON file with the new items, run this script with parameter \"--ignore-old-items-differences\".\n")
		return
		
	# Print items in JSON file (create file if it doesn't exist)
	json_file_path = JSON_ITEMS_DIRECTORY + JSON_CLOTHING_ITEMS_FILE_NAME
	input_val = input("\n>>>>> Do you want to overwrite the file \"" + json_file_path + "\"? (Y/n): ")
	if input_val == "Y":
		if not os.path.exists(JSON_ITEMS_DIRECTORY):
			os.makedirs(JSON_ITEMS_DIRECTORY)
		# Create a backup of the previous file (if it exists)
		if os.path.exists(json_file_path):
			backup_file_path = json_file_path + ".backup"
			if os.path.exists(backup_file_path):
				os.remove(backup_file_path)
			os.rename(json_file_path, backup_file_path)
			print("\t[OK] Current file \"" + json_file_path + "\" backed up as \"" + backup_file_path + "\".")
		# Write the JSON file
		with open(json_file_path, "w") as json_file:
			# json_file.write("[\n")
			# for item in clothing_items:
			# 	json_file.write(json.dumps(item, indent=4))
			# json_file.write("]")
			json.dump(clothing_items, json_file, indent=4)
		print("\t[OK] File \"" + json_file_path + "\" overwritten.")
	else:
		print("\t[NO EDITS] File \"" + json_file_path + "\" was NOT overwritten.")

def get_exclude_pixels_indexes_from_robes():
	# Returns a set of [x,y] indexes of pixels to exclude when calculating the types of the robes,
	# 	hence the pixels' colors not to consider when calculating the types of the hat or robe, which are
	# 	the pixels with an alpha > 0 (i.e. not transparent pixels) of the "face" sprite.
	# These pixels are the ones that will cover the robe, hence they should not be considered when calculating the types of the robe.

	# Get the face image
	image = PIL.Image.open("./Sprites/face.png")

	# Get the size of the image
	size = image.size

	# Get the pixels of the image
	pixels = image.load()

	# Get the indexes of the pixels to exclude
	exclude_pixels_indexes = []
	for x in range(size[0]):
		for y in range(size[1]):
			if pixels[x, y][3] > 0:
				exclude_pixels_indexes.append([x, y])

	return exclude_pixels_indexes

COVERED_PIXELS_FOR_ROBES = get_exclude_pixels_indexes_from_robes()

COLOR_NAME_TO_ELEMENT_TYPE = {
	"black": "Darkness",
	"gray": "Rock",
	"white": "Light",
	"brown": "Earth",
	"red": "Fire",
	"yellow": "Thunder",
	"green": "Nature",
	"sky_blue": "Air",
	"blue": "Water",
	"purple": "Poison",
}

def get_image_based_item_values(sprite_name):
	'''
	Returns a triple with:
		1) the element types of the item (list of string values in list [Darkness, Rock, Light, Earth, Fire, Thunder, Nature, Air, Water, Poison]) 
		2) the pixel palette colors (dictionary containing the name of the color (key) and the number of pixels of that color (value)) of the item
		3) the X and Y offset of the image (such that the image is centered)
	'''
	def rgb_to_hex(r, g, b):
		return '#{:02x}{:02x}{:02x}'.format(r, g, b)
	
	# Get the image
	image = PIL.Image.open("./Sprites/" + sprite_name)

	# Get the size of the image
	size = image.size

	# Get the pixels of the image
	pixels = image.load()

	# Palette of possible colors in the image
	palette_hex = {
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

	# Cycle through the pixels of the image, and get the color of each pixel, adding it to the dictionary of colors for the image, along with the number of pixels of that color
	colors = {}
	for x in range(size[0]):
		for y in range(size[1]):
			# check if the pixel is covered by the face
			if [x, y] in COVERED_PIXELS_FOR_ROBES and "robe" in sprite_name:
				continue
			color = pixels[x, y]	# tuple (r,g,b,a)
			if color[3] == 0:	# if the pixel is transparent, skip it
				continue
			hex_color = rgb_to_hex(color[0], color[1], color[2])
			# check if the hex color is in the palette_hex dictionary
			color_name = ""
			for color in palette_hex:
				if hex_color in palette_hex[color]:
					color_name = color
					break
			if color_name == "":
				continue
			if color_name in colors:
				colors[color_name] += 1
			else:
				colors[color_name] = 1
	
	# To fill in the pixel palette colors (which contains all the colors of the palette that will determin the "types" or "elements" of the wizard hat or color) we only add the palette color (type/element) if the number of pixels of that color (in the hat/clothes sprite) is x >= pixel_colors_min_count
	pixel_colors_min_count_for_hats = 2;	# Only sprites with a number of pixels GREATER OR EQUAL than this will have the associated color type/element added to the palette
	pixel_colors_min_count_for_robes = 5;	# Only sprites with a number of pixels GREATER OR EQUAL than this will have the associated color type/element added to the palette

	pixel_colors_min_count = pixel_colors_min_count_for_robes if "robe" in sprite_name else pixel_colors_min_count_for_hats

	# Dictionary containing the nae of the color (key) and the number of pixels of that color (value)
	pixel_palette_colors = {}
	for color in colors:
		if colors[color] >= pixel_colors_min_count:
			pixel_palette_colors[color] = colors[color]

	# Get the element types of the item (sorted from most frequent to least frequent associated pixel color in the sprite)
	#get the list of colors sorted by number of pixels
	sorted_colors = sorted(pixel_palette_colors, key=pixel_palette_colors.get, reverse=True)
	element_types = []
	for color in sorted_colors:
		element_types.append(COLOR_NAME_TO_ELEMENT_TYPE[color])

	# calculate how many transparent pixels are on the right and on the left of the image before the first pixel with a non-transparent pixel (in whatever column)
	# to do this, first construct a list of size "size[0]" (width of the image) with all false values, then cycle through the pixels and set to true the value of the list at the index of the pixel's x coordinate
	# then, cycle through the list and count the number of false values on the left and on the right of the list
	horizontal_flatten_pixels = [False] * size[0]
	vertical_flatten_pixels = [False] * size[1]
	for x in range(size[0]):
		for y in range(size[1]):
			if pixels[x, y][3] > 0:
				horizontal_flatten_pixels[x] = True
				vertical_flatten_pixels[y] = True
				break
	transparent_pixels_on_the_right = 0
	transparent_pixels_on_the_left = 0
	for x in range(size[0]):
		if horizontal_flatten_pixels[x]:
			break
		transparent_pixels_on_the_left += 1
	for x in range(size[0] - 1, -1, -1):
		if horizontal_flatten_pixels[x]:
			break
		transparent_pixels_on_the_right += 1
	transparent_pixels_on_the_top = 0
	transparent_pixels_on_the_bottom = 0
	for y in range(size[1]):
		if vertical_flatten_pixels[y]:
			break
		transparent_pixels_on_the_top += 1
	for y in range(size[1] - 1, -1, -1):
		if vertical_flatten_pixels[y]:
			break
		transparent_pixels_on_the_bottom += 1
	# calculate an horizontal offset (in pixels) for the image such that the image is centered horizontally
	horizontal_offset = -1 * round((float(transparent_pixels_on_the_left) - float(transparent_pixels_on_the_right)) / 2.0)
	# calculate a vertical offset (in pixels) for the image such that the image is centered vertically
	vertical_offset = -1 * round((float(transparent_pixels_on_the_top) - float(transparent_pixels_on_the_bottom)) / 2.0)
	
	return element_types, pixel_palette_colors, [horizontal_offset, vertical_offset]

def get_rarities_values():
	'''
	Returns a dictionary with a string in the form "['Common', 'Rare', 'Epic']" as key and the rarity value as value, 
		where the rarity value is a number between 1 and 10, where 10 is the most common rarity and 1 is the least 
		common rarity.
	The dictionary can be used to generate the rarity of the items, assinging to the 3 items the 3 rarities of an item
		of the dictionary, based on how frequent the rarity combination is (hence based on the value associated to the 
		rarity combination in the dictionary).
	Also, since values are from 1 to 10, this means that I should consider at least 55 groups of 3 items for each item 
		type (and then another 55 groups, then another 55, ecc...) and then assign to each of those 55 items, a certain
		combination based on the "rarity" value of the combination, e.g. for the most common combination (with value 10)
		I should assign it to 10 of the 55 items, for the second most common combination (with value 9) I should assign 
		it to 9 of the 55 items, and so on...
	As a final note, I should also consider that I must assign these rarity combinations in a distributed way, so that
		N consecutive items won't have the same rarity combination, but rather the most variated combinations possible.
	'''
	rarities = ["Common", "Rare", "Epic", "Legendary", "Useless"]
	rarity_values = [17, 12, 8, 5, 2]
	def get_rarity_value(rarity):
		return rarity_values[rarities.index(rarity)]
	def get_combination_rarity_value(combination):
		return sum([get_rarity_value(rarity) for rarity in combination]) - 14
	def get_min_max_combination_rarity_value(combinations):
		min_value = get_combination_rarity_value(combinations[0])
		max_value = get_combination_rarity_value(combinations[-1])
		return min_value, max_value
	def get_combination_probability(combination):
		# return the probability as the combination total rarity value / the sum of the rarity values of all the combinations
		return get_combination_rarity_value(combination) / sum([get_combination_rarity_value(combination) for combination in rarity_combinations])
	# Generate rarity combinations of 3 items with no repetition, taken one at a time, order doesn't matter
	rarity_combinations = set()
	for rarity1 in rarities:
		for rarity2 in rarities:
			for rarity3 in rarities:
				if rarity1 != rarity2 and rarity1 != rarity3 and rarity2 != rarity3:
					set_of_rarities = set([rarity1, rarity2, rarity3])
					rarity_combinations.add(frozenset(set_of_rarities))
	# convert the set of sets to a list of lists
	rarity_combinations = list(map(list, rarity_combinations))
	# sort each list item by rarity value (descending order)
	for rarity_combination in rarity_combinations:
		rarity_combination.sort(key=get_rarity_value, reverse=True)
	# sort the list of lists by the sum of the rarity values of the 3 rarities
	rarity_combinations.sort(key=lambda rarity_combination: get_rarity_value(rarity_combination[0]) + get_rarity_value(rarity_combination[1]) + get_rarity_value(rarity_combination[2]), reverse=True)
	# # Print the rarity combinations and their combined values
	# for rarity_combination in rarity_combinations:
	# 	print(round(get_combination_probability(rarity_combination) * 100, 1), "%", rarity_combination, get_combination_rarity_value(rarity_combination))
	# return the probabilities of the rarity combinations in a dictionary with the rarity combination as key and the probability as value
	rarities_values = {}
	for rarity_combination, index in zip(rarity_combinations, range(len(rarity_combinations))):
		rarities_values[str(rarity_combination)] = len(rarity_combinations) - index
	# for rarity_combination in rarities_values:
	# 	print(rarity_combination," -> ", rarities_values[rarity_combination],sep="")
	return rarities_values

def get_rarity_combinations_expanded_list():
	'''
	Returns a rarity combination (e.g. ['Common', 'Rare', 'Epic']) based on the group number of the item (group of 3 
		items) so that the 3 rarities of the combination can be assigned to the 3 items in the group.

	Build a list of 55 rarity combinations based on the following frequencies:
	- ['Common', 'Rare', 'Epic']			->	10 / 55
	- ['Common', 'Rare', 'Legendary']		->	9 / 55 
	- ['Common', 'Rare', 'Useless']			->	8 / 55 
	- ['Common', 'Epic', 'Legendary']		->	7 / 55 
	- ['Common', 'Epic', 'Useless']			->	6 / 55 
	- ['Rare', 'Epic', 'Legendary']			->	5 / 55 
	- ['Common', 'Legendary', 'Useless']	->	4 / 55 
	- ['Rare', 'Epic', 'Useless']			->	3 / 55 
	- ['Rare', 'Legendary', 'Useless']		->	2 / 55 
	- ['Epic', 'Legendary', 'Useless']		->	1 / 55 
	Then to the given group number maps an item in this list of rarity combinations.

	The list is also distributed, so that the first 10 items will have the first rarity combination, the next 9 items
		will have the same rarities combinations except for the last combination (which has rarity 1), the next will
		have 8 items with the same rarities combination except for the last 2 combinations (which have rarities 1 and 2),
		and so on...

	'''

	# get the list of rarity combinations with 55 elements, ordered as described above
	rarity_combinations_and_values = get_rarities_values()
	rarity_combinations_list = list(rarity_combinations_and_values.keys())
	# sort the list of rarity combinations by the rarity value
	rarity_combinations_list.sort(key=lambda rarity_combination: rarity_combinations_and_values[rarity_combination], reverse=True)
	# build the actual list with 55 rarity combinations as described above
	rarity_combination_items = []
	rarity_combinations_and_values_temp = rarity_combinations_and_values.copy()
	for rarity_combination in rarity_combinations_list:
		for rarity_combination in rarity_combinations_list:
			rarity_combinations_and_values_temp[rarity_combination] -= 1
			if rarity_combinations_and_values_temp[rarity_combination] > 0:
					rarity_combination_items.append(rarity_combination)

	# print the rarity combinations and their combined values
	# for rarity_combination in rarity_combination_items:
	# 	print(rarity_combination," -> ", rarity_combinations_and_values[rarity_combination],sep="")

	# for each single rarity, construct a dictionary with the rarity combination as key and the number of times the rarity appears in one of the items of the rarity_combination_items list as value
	rarities = ["Common", "Rare", "Epic", "Legendary", "Useless"]
	single_rarities_frequencies = {}
	for rarity in rarities:
		if rarity not in single_rarities_frequencies:
			single_rarities_frequencies[rarity] = 0
		for rarity_combination in rarity_combination_items:
			if rarity in rarity_combination:
				single_rarities_frequencies[rarity] += 1
	single_rarities_probabilities = {}
	sum_of_frequency_values = sum([single_rarities_frequencies[rarity] for rarity in single_rarities_frequencies])
	for rarity in single_rarities_frequencies:
		single_rarities_probabilities[rarity] = single_rarities_frequencies[rarity] / sum_of_frequency_values

	# the "rarity_combination_items" is a list of strings of the form "['Common', 'Rare', 'Epic']" (the rarity combination)
	# transform it in a list of lists of strings, where each string is a rarity
	rarity_combination_items = [rarity_combination[1:-1].split(", ") for rarity_combination in rarity_combination_items]

	return rarity_combination_items

RARITIES_COMBINATION_EXPANDED_LIST = get_rarity_combinations_expanded_list()

def get_rarity_combination(group_number):
	return RARITIES_COMBINATION_EXPANDED_LIST[(group_number-1) % len(RARITIES_COMBINATION_EXPANDED_LIST)]

def get_empty_clothing_item():
	return {
		"clothing_type": "",
		"name": "",
		"sprite": "",
		"id_string": "",
		"element_type": [],
		"item_colors": {},
		"rarity": 0,
		"pixels_offset": [0, 0],
		"healthPointsIncrement": 0,
		"powerBoost": 0,
		"skillBoost": 0,
		"reachBoost": 0,
		"energyBoost": 0,
		"luckBoost": 0,
		"weightIncrement": 0,
	}

def initialize_clothing_item(sprite_name, item_type):

	# create a new item
	item = get_empty_clothing_item()

	# set the clothing type
	item["clothing_type"] = item_type

	# set the sprite
	item["sprite"] = sprite_name

	# get the element types of the item
	item["element_type"], item["item_colors"], item["pixels_offset"] = get_image_based_item_values(sprite_name)

	# NOTE: the "id_string", "name" and "rarity" attributes will be set later, after all the items have been initialized
	# Also, does't set the stats of the item, since they will be set later, after all the items have been initialized (using rarity, id string, ecc... for random values generation)

	return item

def generate_clothing_items_attributes(items):
	'''
	Compiles the name, id_string, rarity and also the stats of each item (healthPointsIncrement, powerBoost, skillBoost, reachBoost, energyBoost, luckBoost, weightIncrement)

	The rarity of the item, with rarities [Useless, Common, Rare, Epic, Legendary], is generated considering the following:
		# Each group of 3 items must have 3 diffrent rarities, in order (based on the item number among the group)
		# Rarities should have the following frequencies: Common > Rare > Epic > Legendary > Useless
			(this means that a very few of the groups of items can contain one of the 3 items with the "Useless" rarity (and hence also the "Common" and "Rare")
		# The rarity of items should be deterministically generated based on the id_string (and therefore the number of element types of the item, the group number and the item number among the group)
			so that if the same item is generated again, it will have the same rarity (as long as sprites stay ordered the same way, hence as long as I dont move around layers in the Photoshop file)
	There are 10 combinations of 3 rarities from the 5 rarities available (taken one at a time, without repetition, order doesnt matter), which are:
		# [Common, Rare, Epic]
		# [Common, Rare, Legendary]
		# [Common, Epic, Legendary]
		# [Common, Rare, Useless]
		# [Common, Epic, Useless]
		# [Common, Legendary, Useless]
		# [Rare, Epic, Legendary]
		# [Rare, Epic, Useless]
		# [Rare, Legendary, Useless]
		# [Epic, Legendary, Useless]
			
	The name of the item should be generated also taking into account the rarity of the item (and, deterministically, in a similar way to the rarity, based on the id_string)

	The stats should be generated based on the rarity of the item (again, deterministically).
		One way to generate the stats is to consider a base total stats value for each rarity, maybe:
		 # Useless: 50, 
		 # Common: 75,
		 # Rare: 100,
		 # Epic: 125,
		 # Legendary: 150
		Then, we distribute the stat values (almost) uniformly among the stats, so that the total stats value is the base total stats value for the rarity.
		...
		NOTE: we must also consider negative valued stats for some items... and also consider that some stats have default values around 10 while others around 100...
	
	'''
	# Add the "id_string" to clothing items and also set their "rarity"
	temp_dict = {}
	def get_item_group_and_item_number(item):
		'''
		Get item and group number from id_string
		'''
		id_string = item["id_string"]
		# Get the type of the item
		item_type = id_string.split("-")[0]
		# Get the number of element types of the item
		item_element_types_count = int(id_string.split("-")[1][1:])
		# Get the group number of the item
		group_number = int(id_string.split("-")[2][1:])
		# Get the item number of the item
		item_number = int(id_string.split("-")[3][1:])
		return group_number, item_number
	def get_group_number_special_index(item):
		'''
		Used because the group number of each items is reset to 1 at each new element types count, so I can't just use the group number as it would lead to lost of duplicate names.
		Also, I can't even use the (group_number-1)*3 + item_number as, again, this is actually the formula to get the absolute item number among items with the same element types count, not the actual absolute element number.
		Finally, I should also avoid using the absolute item number in general as it varies when I add new items of 1 or 2 element counts (pushing the other ones by N positions based on how many new items of 1 or 2 element type couns I add)...
		'''
		group_number, _ = get_item_group_and_item_number(item)
		# Get the number of element types of the item
		item_element_types_count = len(item["element_type"])
		return (group_number-1)*3 + item_element_types_count - 1
	# Set the name of each item based on the id_string, the pixel's colors, and other attributes
	def generate_name(item):
		name = ""
		# Get the rarity of the item
		rarity = item["rarity"]
		# Get the element types of the item
		item_element_types = item["element_type"]
		# Get the number of element types of the item
		item_element_types_count = len(item_element_types)
		# Get the group number and item number of the item
		group_number, item_number = get_item_group_and_item_number(item)
		# Get the type of the item
		item_type = item["clothing_type"].upper()

		def get_clothing_piece_name():
			# Returns a string with the clothing piece name for the item, based on the sprite of the item itself (hence same for all items of a same group)
			# E.g. could be "Top-Hat", "Bobble-Hat", "Beret" or "Cap" ecc... (for hats), or "Cloak", "Robe", "Cape" ecc... (for robes)
			# TO DO...

			# Rule of thumb: if the hat loooks like a wizard hat, use default name "Hat", otherwise set an ad-hoc name based on how the hat looks
			default_hat_name = "Hat"
			default_robe_name = "Robe"

			# Check if the first part of the id_string is in the mapping (for the specific clothing type), if it is, assign the corresponding name, otherwise use the default name
			id_string_prefix = item["id_string"].split("-")[1] + "-" + item["id_string"].split("-")[2]
			if item["clothing_type"] in TYPES_GROUPS_CLOTHING_PIECE_NAME_MAPPINGS.keys() and id_string_prefix in TYPES_GROUPS_CLOTHING_PIECE_NAME_MAPPINGS[item["clothing_type"]].keys():
				return TYPES_GROUPS_CLOTHING_PIECE_NAME_MAPPINGS[item["clothing_type"]][id_string_prefix]
			else:
				return default_hat_name if item["clothing_type"] == "hat" else default_robe_name

		# Hats and clothing name mapping:
		# Each hat and clothing piece follows the folliwng naming scheme:
		# 	[ELEMENTS_ADJECTIVES_MAPPING (based on first element type and also group number)] 
		# + ["Hat"/"Robe" or similar (based on item type and also sprite shape of group)] 
		# + [
		# 		ELEMENTS_EPITHETS_MAPPING (based on element type) {if element type is only one}
		# 	OR 	ELEMENTS_PLACES_MAPPING (based on first element type) {if element type is 2}
		# 	OR  GENERAL_EPITHETS {if element type is 3}
		# 	]

		# Element adjective
		name_string_1 = ELEMENTS_ADJECTIVES_MAPPING[item_element_types[0]][get_group_number_special_index(item) % len(ELEMENTS_ADJECTIVES_MAPPING[item_element_types[0]])]
		# Item actual name (based on sprite of the items of the group)
		name_string_2 = get_clothing_piece_name()
		# General epithet (same for all items of the group)
		name_string_3 = GENERAL_EPITHETS[get_group_number_special_index(item) % len(GENERAL_EPITHETS)]

		# Assemble the name
		name = name_string_1 + " " + name_string_2 + name_string_3

		return name
	def get_positive_negative_stats_permutations(num_positive, num_negative):
			'''
			Returns a list of lists of num_positive + num_negative items where each item is a star name, and the otuer list contains all possible combinations of num_positive + num_negative items.
			'''
			percentage_stats = ["powerBoost", "skillBoost", "reachBoost", "energyBoost", "luckBoost"]
			# Get all permutations of all of the 5 stats
			permutations = list(itertools.permutations(percentage_stats, len(percentage_stats)))
			# Sort the permutations alphabetically based on their elements
			permutations.sort(key=lambda permutation: "".join(permutation))
			# Get all permutations of the first num_positive + num_negative stats
			permutations = [permutation[:num_positive+num_negative] for permutation in permutations]
			# Remove duplicates
			permutations = list(set([tuple(permutation) for permutation in permutations]))
			# Convert back to list
			permutations = [list(permutation) for permutation in permutations]
			# Sort the permutations alphabetically based on their elements
			permutations.sort(key=lambda permutation: "".join(permutation))
			return permutations
	def set_item_stats(item):
		# Set the stats positive and negative values of each item based on the rarity of the item, the id_string, ecc...
		# Lists contain 2 items, the first one is the positive stats total value, the second one is the negative stats total value
		# NOTE: We can spread these values among the 5 stats of the element (also probably making some of those stats not be affected by the item itself, usually affect 3/5 stats, but sometimes 4 and others even 5, based on the rarity)
		rarity_percentage_stat_values = {
			"Useless": [30, 30],
			"Common": [50, 25],
			"Rare": [70, 20],
			"Epic": [90, 15],
			"Legendary": [110, 10]
		}
		# Stat elements associations (for the 5 percentage stats)
		# NOTE: the 2 stats in the list are also ordered from the one that MOSTLY influences the stat to the one that LEAST influences the stat
		stat_elements_positive_associations = {
			"powerBoost": ["Fire", "Thunder"],
			"skillBoost": ["Air", "Rock"],
			"reachBoost": [ "Nature", "Earth"],
			"energyBoost": ["Darkness", "Poison"],
			"luckBoost": ["Light", "Water"]
		}
		# We consider the following types with their opposites:
		# 	- Fire / Water
		# 	- Air / Thunder
		# 	- Rock / Earth
		# 	- Darkness / Light
		# 	- Poison / Nature
		# NOTE: the 2 stats in the list are also ordered from the one that LEAST influences the stat to the one that MOSTLY influences the stat
		stat_elements_negative_associations = {
			"powerBoost": ["Water", "Air"],
			"skillBoost": ["Thunder", "Earth"],
			"reachBoost": ["Poison", "Rock"],
			"energyBoost": ["Light", "Nature"],
			"luckBoost": ["Darkness", "Fire"]
		}
		# Positive/Negative health points stats (they are also in order)
		health_points_increment_order = [
			"Rock", "Nature", "Earth", 				# Mostly positive
			"Light", "Air", "Water", "Darkness",	# Neutral
			"Thunder", "Fire", "Poison",			# Mostly negative
		]
		lighter_to_heavier_elements = [
			"Air", "Light", "Nature", "Fire", "Water", "Earth", "Darkness", "Poison", "Thunder", "Rock"
		]
		# Store the number of positively and negatively influenced stats respectively
		rarity_influenced_stats = {
			"Useless": [1, 2],
			"Common": [2, 2],
			"Rare": [3, 1],
			"Epic": [4, 1],
			"Legendary": [5, 0]
		}
		all_item_stats = ["healthPointsIncrement", "powerBoost", "skillBoost", "reachBoost", "energyBoost", "luckBoost", "weightIncrement"]
		all_items_percentage_stats = ["powerBoost", "skillBoost", "reachBoost", "energyBoost", "luckBoost"]

		# Get the element types of the item
		item_element_types = item["element_type"]

		# Get the item special index (based on the group number and item number among the group)
		group_number, item_number = get_item_group_and_item_number(item)
		item_special_index = get_group_number_special_index(item)
		
		# ===============================================================================================================
		# [WEIGHT INCREMENT] ============================================================================================

		# Set a weight for the item (base weight for hats is around 40, base height for robes is around 60)
		weight_multiplier = 1 + 0.1 * lighter_to_heavier_elements.index(item_element_types[0])	# In range [1.0, 2.0]
		# Set the weight increment of the item
		base_weight_value = round(40 * weight_multiplier)			# In range [40, 80]
		additional_weight_value = (3 * (group_number % 11) - 10)		# In range [-25, 25]
		weight_increment = base_weight_value + additional_weight_value
		item["weightIncrement"] = math.ceil(weight_increment / 5) * 5		# Round to the nearest multiple of 5

		# ===============================================================================================================
		# [HEALTH POINTS INCREMENT] =====================================================================================

		# Set the health points increment for the item
		def get_element_type_health_point_value(element_type, attenuator=1.0):
			# Returns the health point value of the element type (in range [0, 100])
			elem_types_index = health_points_increment_order.index(element_type)
			health_points_multiplier = math.ceil((4.5 - elem_types_index) ** 2 * (-1 if elem_types_index >= 5 else 1))		# In range [-21, 21]
			health_points_multiplier *= attenuator
			return health_points_multiplier
		
		health_points_increment_additional_value = 0
		for element_type, index in zip(item_element_types, range(len(item_element_types))):
			# Get the health point value of the element type
			val = get_element_type_health_point_value(element_type, 1.0 - 0.30 * index)
			# Add the health point value of the element type to the health point increment
			health_points_increment_additional_value += val
		# In range [X,Y] where X and Y are in given by "(-21) + (-21 * 0.7) + (-21 * 0.4)" hence range could be [-21*2.1, 21*2.1] = [-65, 65]

		# Set the base health points increment for the item
		health_point_increment_base_value = 50 + ((group_number * 10)) % 101		# In range [50, 150]
		# Add additional value based on the item rarity
		rarities = ["Useless", "Common", "Rare", "Epic", "Legendary"]
		rarity_index = rarities.index(item["rarity"])
		health_point_increment_rarity_value = 10 * rarity_index		# In range [0, 40]
		# Add additional value based on the item element types count
		health_points_final_value = health_point_increment_base_value + health_point_increment_rarity_value + health_points_increment_additional_value
		health_points_final_value = round(health_points_final_value / 5) * 5		# Round to the nearest multiple of 5
		item["healthPointsIncrement"] = health_points_final_value

		# ===============================================================================================================
		# [PERCENTAGE STATS] ============================================================================================

		# Set which stats to influence positively (deterministically, based on the special index, considering all combinations of N stats influenced positively and M stats influenced negatively, where N+M=5)
		num_positive, num_negative = rarity_influenced_stats[item["rarity"]]
		# add or remove 1 from the number of positive stats based on the group number (do % 3, if 0 do nothing, if 1 remove 1, if 2 add 1)
		num_positive += (group_number % 3) - 1	# Increment is -1, 0 or 1
		# add or remove 1 from the number of negative stats based on the item number (do % 3, if 0 do nothing, if 1 remove 1, if 2 add 1)
		num_negative += (item_number % 3) - 1	# Increment is -1, 0 or 1
		# clamp the number of positive stats to make it so that neither of them is above 5 or below 5 and also so that the sum of positive and negative stats is 5 (bias towards having more positive stats)
		num_positive = max(0, min(5, num_positive))		# Clamp between 0 and 5
		num_negative = max(0, min(5, num_negative)) 	# Clamp between 0 and 5
		num_positive = max(0, min(5 - num_negative, num_positive))	# Clamp the number of positive stats to make it so that the sum of positive and negative stats is 5 (bias towards having more positive stats)

		# Get all possible permutations of positive and negative stats
		positive_negative_stats_permutations = get_positive_negative_stats_permutations(num_positive, num_negative)

		# Get the permutation of positive and negative stats based on the item special index
		positive_negative_stats_permutation = positive_negative_stats_permutations[item_special_index % len(positive_negative_stats_permutations)]

		# Get the positive and negative stats
		positive_stats = positive_negative_stats_permutation[:num_positive]
		negative_stats = positive_negative_stats_permutation[num_positive:]

		total_stat_value_positive = rarity_percentage_stat_values[item["rarity"]][0]
		total_stat_value_negative = rarity_percentage_stat_values[item["rarity"]][1]

		# We order positive and negative stats based on the element type positive/negative stats associations
		ordered_positive_stats_dict = {}
		ordered_negative_stats_dict = {}
		for stat in all_items_percentage_stats:
			if stat in positive_stats:
				# Add the stat to the ordered positive stats
				val = 0
				for element_type in item_element_types:
					if element_type in stat_elements_positive_associations[stat]:
						val += (stat_elements_positive_associations.get(stat).index(element_type) + 1)
					elif element_type in stat_elements_negative_associations[stat]:
						val -= (2 - stat_elements_negative_associations.get(stat).index(element_type))
				ordered_positive_stats_dict[stat] = val
			elif stat in negative_stats:
				# Add the stat to the ordered negative stats
				val = 0
				for element_type in item_element_types:
					if element_type in stat_elements_negative_associations[stat]:
						val += (2 - stat_elements_negative_associations.get(stat).index(element_type))
					elif element_type in stat_elements_positive_associations[stat]:
						val -= (stat_elements_positive_associations.get(stat).index(element_type) + 1)
				ordered_negative_stats_dict[stat] = val
		# Sort the ordered positive stats by value (descending order)
		ordered_positive_stats = sorted(ordered_positive_stats_dict, key=ordered_positive_stats_dict.get, reverse=True)
		# Sort the ordered negative stats by value (descending order)
		ordered_negative_stats = sorted(ordered_negative_stats_dict, key=ordered_negative_stats_dict.get, reverse=True)

		# Stats multipliers (associated to the total number of stats to influence, such that their sum is always 1)
		stats_multipliers = {
			"1": [1],
			"2": [0.75, 1.25],
			"3": [0.6, 0.25, 0.15],
			"4": [0.5, 0.25, 0.15, 0.1],
			"5": [0.4, 0.25, 0.15, 0.1, 0.1]
		}

		# Set the positive stats
		if len(ordered_positive_stats) > 0:
			for stat, multiplier in zip(ordered_positive_stats, stats_multipliers[str(num_positive)]):
				item[stat] = math.ceil(total_stat_value_positive * multiplier / 5) * 5	# Round up to the nearest multiple of 5
		# Set the negative stats
		if len(ordered_negative_stats) > 0:
			for stat, multiplier in zip(ordered_negative_stats, stats_multipliers[str(num_negative)]):
				item[stat] = -1 * math.ceil(total_stat_value_negative * multiplier / 5) * 5	# Round up to the nearest multiple of 5

		# ===============================================================================================================

		# # print positive and negative stats
		# print(item["id_string"], " -> ", item["rarity"], sep="")
		# print("+ Positive stats:", positive_stats)
		# print("- Negative stats:", negative_stats)


		# DONE SETTING STATS ===============================================================================================================

		return item

	items.sort(key=lambda item: get_fixed_item_sprite_name(item["sprite"]), reverse=True)
	for item, index in zip(items, range(len(items))):
		# Get the type of the item
		item_type = item["clothing_type"].upper()
		# Get the number of element types of the item
		item_element_types = item["element_type"]
		item_element_types_count = len(item_element_types)
		# If the item type is not in the temp_dict, add it
		if item_type not in temp_dict:
			temp_dict[item_type] = {}
		# If the item type is in the temp_dict, but the item_element_types_count is not, add it
		if item_element_types_count not in temp_dict[item_type]:
			temp_dict[item_type][item_element_types_count] = {}
		# If the item type and item_element_types_count are in the temp_dict, but the group_number and item_number are not, add them
		if "group_number" not in temp_dict[item_type][item_element_types_count]:
			temp_dict[item_type][item_element_types_count]["group_number"] = 1
		# If the item type and item_element_types_count are in the temp_dict, but the item_number is not, add it
		if "item_number" not in temp_dict[item_type][item_element_types_count]:
			temp_dict[item_type][item_element_types_count]["item_number"] = 1
		# Set the id_string of the item
		item["id_string"] = item_type + "-T" + str(item_element_types_count) + "-G" + str(temp_dict[item_type][item_element_types_count]["group_number"]).zfill(3) + "-N" + str(temp_dict[item_type][item_element_types_count]["item_number"]).zfill(2)
		# Increase the item_number by 1
		temp_dict[item_type][item_element_types_count]["item_number"] += 1
		# If we added 3 items of the same type and element types count, increase the group_number by 1 and reset the item_number to 1
		if temp_dict[item_type][item_element_types_count]["item_number"] > 3:
			temp_dict[item_type][item_element_types_count]["group_number"] += 1
			temp_dict[item_type][item_element_types_count]["item_number"] = 1

		# set the rarity of the items (based on their group number)
		group_number = int(item["id_string"].split("-")[2][1:])
		in_group_number = int(item["id_string"].split("-")[3][1:])
		item["rarity"] = get_rarity_combination(group_number)[in_group_number-1].replace("'", "")

		# Generate the name of the item
		item["name"] = generate_name(item)

		# Set item stats
		item = set_item_stats(item)


	# Return the items
	return items

main()


