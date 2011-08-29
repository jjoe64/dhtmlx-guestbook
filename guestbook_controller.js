/*
 * guestbook controller layer
 */

function GuestbookController() {
	this.guestbook_view = new GuestbookView()
	dhx.ui(this.guestbook_view.getRoot())
	
	this.guestbook_view.initEventHandler(this)
	this.loadPersistant()
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
		this.makePersistant()
	}
}

/**
 * saves the list's data in the local storage
 */
GuestbookController.prototype.makePersistant = function() {
	localStorage.setItem('guestbookEntries', JSON.stringify(this.guestbook_view.getEntries()))
}

/**
 * reads the data from the local storage and fill the list
 */
GuestbookController.prototype.loadPersistant = function() {
	var data = localStorage.getItem('guestbookEntries')
	if (data) {
		var xdata = eval('('+data+')')
		for (var i in xdata)
			this.guestbook_view.addEntry(xdata[i])
	}
}

