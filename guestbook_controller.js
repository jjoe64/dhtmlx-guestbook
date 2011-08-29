/*
 * guestbook controller layer
 */

function GuestbookController() {
	this.guestbook_view = new GuestbookView()
	dhx.ui(this.guestbook_view.getRoot())
	
	this.guestbook_view.initEventHandler(this)
}

/**
 * submit a new guestbook entry
 */
GuestbookController.prototype.newGuestbookEntry = function(mdl) {
	if (!mdl) {
		dhx.notice("You have to fill in all fields.")
	} else {
		this.guestbook_view.addEntry(mdl)
		dhx.notice("New guestbook entry added.")
		this.guestbook_view.showGuestbookIndexUI()
	}
}

