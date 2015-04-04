var dataObject = {};
var parentChild = {};

$(document).ready(function(){
	// Read the JSON data and send to getDataStartApp function
	// TODO: It woud be useful to evaluate the JSON file to make sure it is valid...
	$.getJSON("data/taxa.json", getDataStartApp);
});

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

function addTaxaListEvent(targetElementId, taxonId) {
	$("#" + targetElementId).off(); // remove any previous listenter
	$("#" + targetElementId).on("click", function() {
		//console.log("Clicked on id " + eventTargetId + " targeting taxa id " + taxaId);
		showTaxaList(taxonId);
	});
}

function addTaxonEvent(taxonId) {
	$("#" + taxonId).off(); // remove any previous listener
	$("#" + taxonId).on("click", function() {
		// console.log("Clicked on taxon id " + id);
		showTaxon(taxonId);
	});
}

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
		addTopButton("back-button", "Back", backButtonTarget);
		addTopButton("home-button", "Home", "none");
	}
}

function addTopButton(buttonElementId, name, taxonId) {
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

function setupBottomNav() {
	$("#about-button").empty();
	$("#media-button").empty();
	addBottomButton("about-button", "About", "#about");
	addAboutEvent();
	addBottomButton("media-button", "Media", "#media");
	addMediaEvent();
}

function addBottomButton(elementId, name, targetElementId) {
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
	var mediaPlaceholder = $("<p></p>");
	mediaPlaceholder.addClass("taxon-data-text");
	mediaPlaceholder.text("Placeholder for media.");
	mediaDiv.append(mediaPlaceholder);

	// Add those two divs and make the content visible by setting parent div to class = current
	theTaxon.append(aboutDiv);
	theTaxon.append(mediaDiv);
	$("#taxon").append(theTaxon);
	$("#taxon").addClass("current");

	setupTopNav(parentTaxonId, false);
	setupBottomNav();
}
