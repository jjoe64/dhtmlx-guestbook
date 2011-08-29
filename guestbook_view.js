/*
 * guestbook view layer
 */

/**
 * contructor guestbook view
 * initializes layouts
 */
function GuestbookView() {
	this.ui_guestbook_index = {
		view: 'layout', type: 'wide',
		rows: [
			{
				view: 'toolbar', type: 'MainBar',
				elements: [
					{view: 'label', label: 'Guestbook', id: 'control_label_2'}
				], id: 'toolbar_2'
			}, {
				view: 'dataview',
				template: 'html->tpl_container_index',
				select: 'single',
				type: {height: 50, width: '100%', padding: 7, margin: 0},
				id: 'dataview_index',
				datatype: 'json',
				data: [] // data will be loaded
			}, {
				view: 'button',
				label: 'New Guestbook Entry',
				id: 'btn_new_guestbook_entry'
			}
		],
		id: 'ui_guestbook_index'
	}
	this.ui_guestbook_entry = {
		view: 'layout',
		type: 'wide',
		animate:{type:"slide", subtype:"vertical"},
		rows: [
			{
				view: 'toolbar', type: 'MainBar',
				elements: [
					{ view: 'button', label: 'Back', id: 'btn_back'},
					{ view: 'label', label: 'New Entry', id: 'control_label_2'}
				],
				id: 'toolbar_2'
			}, {
				view: 'form',
				scroll: true,
				elements: [
					{ view: 'text', label: 'Nickname', labelPosition: 'left', labelAlign: 'left', id: 'txt_nickname'},
					{ view: 'text', label: 'Subject', labelPosition: 'left', labelAlign: 'left', id: 'txt_subject'},
					{ view: 'textarea', label: 'Content', id: 'txt_content'}
				],
				rules: {
					txt_nickname: dhx.rules.isNotEmpty,
					txt_subject: dhx.rules.isNotEmpty,
					txt_content: dhx.rules.isNotEmpty
				},
				id: 'form_new_entry'
			}, {
				view: 'button',
				label: 'Submit',
				id: 'btn_submit'
			}
		],
		id: 'ui_guestbook_entry'
	}
	this.ui_root = {
		id: 'app', view: 'multiview',
		rows: [
			this.ui_guestbook_index,
			this.ui_guestbook_entry
		]
	}
}

/**
 * @return the root layout
 */
GuestbookView.prototype.getRoot = function() {
	return this.ui_root
}

/**
 * shows the guetsbook entry ui
 */
GuestbookView.prototype.showGuestbookEntryUI = function() {
	$$('ui_guestbook_entry').show()
}

/**
 * shows the guetsbook entry ui
 */
GuestbookView.prototype.showGuestbookIndexUI = function() {
	$$('ui_guestbook_index').show()
}

GuestbookView.prototype.initEventHandler = function(controller) {
	// sets event handler 'new guestbook entry'
	$$('btn_new_guestbook_entry').attachEvent('onItemClick', this.showGuestbookEntryUI)
	
	// 'back'
	$$('btn_back').attachEvent('onItemClick', this.showGuestbookIndexUI)
	
	// 'submit'
	var guestbook_view_this = this
	$$('btn_submit').attachEvent('onItemClick', function() {
		controller.newGuestbookEntry(guestbook_view_this.getNewModel())
	})
}

/**
 * generate a model from the form input data
 */
GuestbookView.prototype.getNewModel = function() {
	if ($$('form_new_entry').validate() === false) return false
	return {
		nickname: $$('txt_nickname').getValue(),
		createDate: new Date(),
		content: $$('txt_content').getValue()
	}
}

/**
 * add a new entry to the index dataview
 * @param mdl new model
 */
GuestbookView.prototype.addEntry = function(mdl) {
	$$('dataview_index').add(mdl)
}

/**
 * @return the data of the list
 */
GuestbookView.prototype.getEntries = function() {
	return $$('dataview_index').data.serialize()
}

