const pageIds = ["camera-page", "video-page"];

function pageHandler(event, pageId) {
	removePageButtonActiveClass();
	event.currentTarget.classList.add("active");
	for (const id of pageIds) {
		if (pageId === id) {
			document.getElementById(id).classList.add("show");
		} else {
			document.getElementById(id).classList.remove("show");
		}
	}
}

function removePageButtonActiveClass() {
	for (const element of document.getElementsByClassName("page-button")) {
		element.classList.remove("active");
	}
}

export { pageHandler };
