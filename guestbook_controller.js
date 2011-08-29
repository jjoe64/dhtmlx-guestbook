/*
 * guestbook controller layer
 */

function GuestbookController() {
	this.guestbook_view = new GuestbookView()
	dhx.ui(this.guestbook_view.getRoot())
	
	this.guestbook_view.initEventHandler()
}

/**
 * submit a new guestbook entry
 */
GuestbookController.prototype.newGuestbookEntry = function() {
}

