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
				id: 'dataview_2',
				datatype: 'json',
				data: [
					{nickname: 'jjoe64', createDate: '2011-08-05', content: 'I like dhtmlx!'}
				]
			}, {
				view: 'button',
				label: 'New Guestbook Entry',
				id: 'control_button_3'
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
				id: 'form_2'
			}, {
				view: 'button',
				label: 'Submit',
				id: 'control_button_3'
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

GuestbookView.prototype.showGuestbookEntryUI = function() {
	$$('ui_guestbook_entry').show()
}

