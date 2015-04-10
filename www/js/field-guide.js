var dataObject = {};
var parentChild = {};

$(document).ready(function(){
	// Read the JSON data and send to getDataStartApp function
	// TODO: It woud be useful to evaluate the JSON file to make sure it is valid...
	$.getJSON("data/taxa.json", getDataStartApp);
});

/**
 * Reads JSON data and stores in two global objects
 * @param {JSON} data - json data to load into memory
 */
function getDataStartApp(data) {
	// Loop over each element in JSON file and store in:
	//	(1) dataObject, effectively an associative array indexed by id
	//	(2) parentChild, effectively an associative array of arrays, where the 
	//		key is the parent id and the value is the array of child ids;
	//		this one-time evaluation allows for more rapid traversal & retrieval
	$.each(data, function() {
		// Add to dataObject
		dataObject[this.id] = this;
		// Add to parentChild
		if (!parentChild[this.parentid]) {
			// Empty, so establish array
			parentChild[this.parentid] = [this.id];
		} else {
			// Not empty, so push to array
			parentChild[this.parentid].push(this.id);
		}
	});

	showTaxaList("none");

	/*
	var newItem = $("#taxa-template").clone();
	newItem.find("h2").text("Secondary addition");
	newItem.find("li").attr("id", "zero");
	newItem.children().appendTo("#taxa-list"); // just append the li element, not the wrapper div
	*/
}

/**
 * Displays list of taxa that are direct descendants of parentTaxonId
 * @param {String} parentTaxonId - the unique identifier of the parent taxon
 */
function showTaxaList(parentTaxonId) {
	// Need to clear out anything from taxa-list first...
	$("#taxa-list").empty();
	$("#taxa").addClass("current");
	// Turn off event listeners (if appropriate, they'll be turned on again, with different targets)
	$("#back-button").off("click");
	$("#home-button").off("click");
	$("#about-button").empty();
	$("#about-button").off("click");
	$("#media-button").empty();
	$("#media-button").off("click");
	
	// Also need to clean out any taxon content, but leave the template
	var taxonElement = $("#taxon");
	var taxonChildren = taxonElement.children();
	for (var ic = 0; ic < taxonChildren.length; ic++) {
		// The elements in the taxonChildren array are DOM elements, 
		// NOT jQuery objects, so jQuery methods are not available
		var child = taxonChildren[ic];
		if (child.id != "taxon-template") {
			child.parentNode.removeChild(child);
		}
	}
	taxonElement.removeClass("current");
	
	setupTopNav(parentTaxonId, true);

	taxaIds = parentChild[parentTaxonId];
	
	var odd = true;
	for (var taxaIndex = 0; taxaIndex < taxaIds.length; taxaIndex++) {
		taxaId = taxaIds[taxaIndex];
		// taxa-template is a div, wrapped around <li><a><h2></h2><span></span></a></li>
		var newItem = $("#taxa-template").clone();
		var listItem = newItem.find("li");
		listItem.attr("id", taxaId);
		if (!odd) {
			listItem.attr("class", "even");
			odd = true;
		} else {
			odd = false;
		}

		// assign the name
		listItem.find("h2").text(dataObject[taxaId].name);
		// Add a little arrow
		listItem.find("span").text(">");
		
		newItem.children().appendTo("#taxa-list");
		
		// Have to add these event listeners AFTER we have appended the list item to taxa list
		if (dataObject[taxaId].category == "internal") {
			addTaxaListEvent(taxaId, taxaId);
		}
		if (dataObject[taxaId].category == "terminal") {
			addTaxonEvent(taxaId);
		}
	} // end looping over taxa ids
}

/**
 * Add "click" listening to element, to call showTaxaList.
 * @param {String} targetElementId - unique identifier of element that will listen
 * @param {String} taxonId - unique identifier of taxon to show list of children
 */
function addTaxaListEvent(targetElementId, taxonId) {
	$("#" + targetElementId).off(); // remove any previous listenter
	$("#" + targetElementId).on("click", function() {
		//console.log("Clicked on id " + targetElementId + " targeting taxa id " + taxonId);
		showTaxaList(taxonId);
	});
}

/**
 * Add "click" listening to element, to call showTaxon
 * @param {String} taxonId - unique identifier of taxon to show data; also serves as unique identifier of element that will listen
 */
function addTaxonEvent(taxonId) {
	$("#" + taxonId).off(); // remove any previous listener
	$("#" + taxonId).on("click", function() {
		// console.log("Clicked on taxon id " + id);
		showTaxon(taxonId);
	});
}

/**
 * Setup top navigation bar with "Back" and "Home" buttons
 * @param {String} parentTaxonId - unique identifier of taxon
 * @param {Boolean} isList - indicates whether a list, in which case the parent name is displayed, or not, in which only Back and Home buttons appear
 */
function setupTopNav(parentTaxonId, isList) {
	if (parentTaxonId == "none") {
		// Starting point.  Turn off back and home buttons
		$("#back-button").empty();
		$("#home-button").empty();
		// Set the title to 'Field Guide'
		var contentTitleElement = $("#content-title");
		contentTitleElement.empty();
		contentTitleElement.text("Field Guide");
		$("#content-title-item").removeClass("fifty"); // so it can stretch out to 100%
	} else { // not the starting point, need to get name of parent
		document.getElementById("content-title-item").setAttribute("class", "fifty");
		backButtonTarget = parentTaxonId;
		$("#content-title").empty();
		if (isList) {
			$("#content-title").text(dataObject[parentTaxonId].name);
			backButtonTarget = dataObject[parentTaxonId].parentid; // get the grandparent id
		} else { // not a list, but a taxon page, so content title will just be empty
			$("#content-title").text(" ");
		}
		fillTopButton("back-button", "Back", backButtonTarget);
		fillTopButton("home-button", "Home", "none");
	}
}

/**
 * Fill in button in top navigation
 * @param {String} buttonElementId - unique identifier of element that is the button
 * @param {String} name - text to use for button
 * @param {String} taxonId - unique identifier of taxon to show list of children when button is pressed
 */
function fillTopButton(buttonElementId, name, taxonId) {
	var button = $("#" + buttonElementId);
	button.empty();
	var linkElement = $("<a></a>");
	linkElement.attr("href", "#");
	var nameElement = $("<h2></h2>");
	nameElement.text(name);
	linkElement.append(nameElement);
	button.append(linkElement);
	addTaxaListEvent(buttonElementId, taxonId);
}

/**
 * Set up bottom navigation bar
 */
function setupBottomNav() {
	$("#about-button").empty();
	$("#media-button").empty();
	fillBottomButton("about-button", "About", "#about");
	addAboutEvent();
	fillBottomButton("media-button", "Media", "#media");
	addMediaEvent();
}

//TODO: Comments to here
/**
 * Fill in button in bottom navigation
 * @param {String} elementId
 * @param name
 * @param targetElementId
 */
function fillBottomButton(elementId, name, targetElementId) {
	var button = $("#" + elementId);
	button.empty();
	var linkElement = $("<a></a>");
	linkElement.attr("href", "#");
	var nameElement = $("<h2></h2>");
	nameElement.text(name);
	linkElement.append(nameElement);
	button.append(linkElement);
}

function addAboutEvent() {
	$("#about-button").off("click"); // remove any previous listener
	$("#about-button").on("click", function() {
		// when clicking on about, show that and hide media
		$("#media").removeClass("current");
		$("#about").addClass("current");
	});
}

function addMediaEvent() {
	$("#media-button").off("click"); // remove any previous listener
	$("#media-button").on("click", function() {
		// when clicking on media, show that and hide about
		$("#about").removeClass("current");
		$("#media").addClass("current");
	})
}

function showTaxon(taxonId) {
	// Clear out event listeners
	$("#back-button").off("click");
	$("#home-button").off("click");

	// Need to make the taxa-list invisible
	$("#taxa").removeClass("current");

	$("#taxon").addClass("current");
	var parentTaxonId = dataObject[taxonId].parentid;
	var theTaxon = $("#taxon-template").clone();
	theTaxon.attr("id", taxonId);
	theTaxon.addClass("current");
	var headerItem = theTaxon.find("h2");
	headerItem.text(dataObject[taxonId].name);

	// Will have two content divs, about and media
	// about will be shown, media will be hidden

	// #about
	var aboutDiv = $("<div></div>");
	aboutDiv.attr("id", "about");
	aboutDiv.addClass("current");

	// Loop over any descriptions and add them to aboutDiv
	if (dataObject[taxonId].descriptions) {
		var descriptions = dataObject[taxonId].descriptions;
		for (var descIndex = 0; descIndex < descriptions.length; descIndex++) {
			var description = descriptions[descIndex];
			if (description.type && description.text) {
				var dataTitle = $("<p></p>");
				dataTitle.addClass("taxon-data-title");
				dataTitle.text(description.type);
				var dataText = $("<p></p>");
				dataText.addClass("taxon-data-text");
				dataText.text(description.text);
				aboutDiv.append(dataTitle);
				aboutDiv.append(dataText);
				var br = $("<br />");
				aboutDiv.append(br);
			}
		}
	}
	
	// #media
	var mediaDiv = $("<div></div>");
	mediaDiv.attr("id", "media");
	var addedMedia = false;
	if (dataObject[taxonId].media) {
		var mediaArray = dataObject[taxonId].media;
		for (var mediaIndex = 0; mediaIndex < mediaArray.length; mediaIndex++) {
			var media = mediaArray[mediaIndex];
			if (media.hasOwnProperty("type")) {
				// only support images for now
				if (media.type == "img" && media.src) { // make sure there is a source listed
					// TODO: Want to add labels? at least the alt attribute
					var imageElement = $("<img />");
					// TODO: add an id?
					imageElement.addClass("media-img");
					imageElement.attr("src", media.src); //TODO: would be great to add check for file exists
					if (media.alt) {
						imageElement.attr("alt", media.alt);
					}
					mediaDiv.append(imageElement);
					addedMedia = true;
				}
			}
		}
	} 
	if (!addedMedia) {
		var mediaPlaceholder = $("<p></p>");
		mediaPlaceholder.addClass("taxon-data-text");
		mediaPlaceholder.text("No media found.");
		mediaDiv.append(mediaPlaceholder);
	}
	
	

	// Add those two divs and make the content visible by setting parent div to class = current
	theTaxon.append(aboutDiv);
	theTaxon.append(mediaDiv);
	$("#taxon").append(theTaxon);
	$("#taxon").addClass("current");

	setupTopNav(parentTaxonId, false);
	setupBottomNav();
}
