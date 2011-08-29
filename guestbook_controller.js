/*
 * guestbook controller layer
 */

function GuestbookController() {
	this.guestbook_view = new GuestbookView()
	dhx.ui(this.guestbook_view.getRoot())
}

/**
 * let the user creates a new guestbook entry
 */
GuestbookController.prototype.newGuestbookEntry = function() {
	this.guestbook_view.showGuestbookEntryUI()
}

