var dataObject = {};
var parentChild = {};

$(document).ready(function(){
	// Read the JSON data and send to getDataStartApp function
	$.getJSON("data/taxa.json", getDataStartApp);
});

function getDataStartApp(data) {
	// Loop over each element in JSON file and store in:
	//	(1) dataObject, effectively an associative array indexed by id
	//	(2) parentChild, effectively an associative array of arrays, where the 
	//		key is the parent id and the value is the array of child ids
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

function showTaxaList(parentId) {
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
		var child = taxonChildren[ic];
		if (child.id != "taxon-template") {
			child.remove();
		}
	}
	
	setupTopNav(parentId, true);

	taxaIds = parentChild[parentId];
	
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

function addTaxaListEvent(eventTargetId, taxaId) {
	$("#" + eventTargetId).on("click", function() {
		//console.log("Clicked on id " + eventTargetId + " targeting taxa id " + taxaId);
		showTaxaList(taxaId);
	});
}

function addTaxonEvent(id) {
	$("#" + id).on("click", function() {
		// console.log("Clicked on taxon id " + id);
		showTaxon(id);
	});
}

function setupTopNav(parentId, isList) {
	if (parentId == "none") {
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
		backButtonTarget = parentId;
		$("#content-title").empty();
		if (isList) {
			$("#content-title").text(dataObject[parentId].name);
			backButtonTarget = dataObject[parentId].parentid; // get the grandparent id
		} else { // not a list, but a taxon page, so content title will just be empty
			$("#content-title").text(" ");
		}
		addTopButton("back-button", "Back", backButtonTarget);
		addTopButton("home-button", "Home", "none");
	}
}

function addTopButton(id, name, targetId) {
	var button = document.getElementById(id);
	// Remove anything that is already there
	while (button.childNodes[0]) {
		button.removeChild(button.childNodes[0]);
	}
	// Now create elements
	var linkElement = document.createElement("a");
	linkElement.setAttribute("href", "#");
	var nameElement = document.createElement("h2");
	var nameElementValue = document.createTextNode(name);
	nameElement.appendChild(nameElementValue);
	linkElement.appendChild(nameElement);
	button.appendChild(linkElement);
	addTaxaListEvent(id, targetId);
	
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
	$("#about-button").on("click", function() {
		// when clicking on about, show that and hide media
		$("#media").removeClass("current");
		$("#about").addClass("current");
	});
}

function addMediaEvent() {
	$("#media-button").on("click", function() {
		// when clicking on media, show that and hide about
		$("#about").removeClass("current");
		$("#media").addClass("current");
	})
}


function addColorClick(id) {
	this.id = id;
	document.getElementById(this.id).addEventListener("click", function(){
	    this.style.backgroundColor = "red";
	});

}

function showTaxon(taxonId) {
	// Clear out event listeners
	$("#back-button").off("click");
	$("#home-button").off("click");
	$("#about-button").off("click");
	$("#media-button").off("click");

	// Need to make the taxa-list invisible
	$("#taxa").removeClass("current");

	$("#taxon").removeClass("hide");
	$("#taxon").addClass("current");
	var parentId = dataObject[taxonId].parentid;
	var theTaxon = $("#taxon-template").clone();
	theTaxon.attr("id", taxonId);
	theTaxon.addClass("current");
	var headerItem = theTaxon.find("h2");
	headerItem.text(dataObject[taxonId].name);
	$("#taxon").append(theTaxon);

	// Will have two content divs, about and media
	// about will be shown, media will be hidden

	// #about
	var aboutDiv = $("<div></div>");
	aboutDiv.attr("id", "about");
	aboutDiv.addClass("current");

	// TODO: redo description data so it is a single element in the json file
	// with an array of name/text pairs
	if (dataObject[taxonId].description.length > 0) {
		var title = "Description";
		var dataTitle = document.createElement("p");
		dataTitle.setAttribute("class", "taxon-data-title");
		var dataTitleValue = document.createTextNode(title);
		dataTitle.appendChild(dataTitleValue);
		var dataText = document.createElement("p");
		dataText.setAttribute("class", "taxon-data-text");
		var dataTextValue = document.createTextNode(dataObject[taxonId].description);
		dataText.appendChild(dataTextValue);
		aboutDiv.append(dataTitle);
		aboutDiv.append(dataText);
		var br = $("<br />");
		aboutDiv.append(br);
	}
	if (dataObject[taxonId].distribution.length > 0) {
		var title = "Distribution";
		var dataTitle = document.createElement("p");
		dataTitle.setAttribute("class", "taxon-data-title");
		var dataTitleValue = document.createTextNode(title);
		dataTitle.appendChild(dataTitleValue);
		var dataText = document.createElement("p");
		dataText.setAttribute("class", "taxon-data-text");
		var dataTextValue = document.createTextNode(dataObject[taxonId].distribution);
		dataText.appendChild(dataTextValue);
		aboutDiv.append(dataTitle);
		aboutDiv.append(dataText);
		var br = $("<br />");
		aboutDiv.append(br);
	}

	// #media
	var mediaDiv = $("<div></div>");
	mediaDiv.attr("id", "media");
	var mediaElement = document.createElement("p");
	mediaElement.setAttribute("class", "taxon-data-text");
	var mediaElementValue = document.createTextNode("Placeholder for media data");
	mediaElement.appendChild(mediaElementValue);
	mediaDiv.append(mediaElement);
//	mediaDiv.addClass("hide");

	// Add those two divs and make the content visible by setting parent div to class = current
	$("#taxon").append(aboutDiv);
	$("#taxon").append(mediaDiv);
	$("#taxon").addClass("current");

	setupTopNav(parentId, false);
	setupBottomNav();
}
