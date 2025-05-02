function onNewChatClick() {
	location.href = '?' + newChatId();
}

function onMenuIconClick(ev) {
	let node = document.querySelector('header >menu');
	node.setAttribute('isShow', node.getAttribute('isShow')=='true' ? 'false' : 'true');
	ev.stopPropagation();
}

function onConversationTextKeydown(ev) {
	if (!ev.shiftKey && ev.key === 'Enter') {
		ev.preventDefault();
		onConversationButtonClick();
	}
}
function onConversationButtonClick() {
	let node = document.getElementById('conversation_usertext');
	let text = node.value;
	
	if(posts[currentPostKey].role != 'user') {
		addPost('user', text);
	}
	
	node.value = '';
	
	sendRequest({parent:currentPostKey});
}

function onMenuItemClick(aid) {
	document.querySelector('#style_active_article').textContent = `#${aid} {display:flex;}`;
	document.querySelector('#nav_active_article').textContent = aid;
}

function onForkChatClick() {
	let id = newChatId();
	if(peekField(id) || peekConversation(id)) {
		alert('Chat already exists.');
		return;
	}
	
	storeField(id);
	storeConversation(id);
	
	location.href = '?' + id;
}

function onDeleteChatClick() {
	if(!confirm('Delete this story. Are you sure?\n這會刪除此作品資料，你確定嗎？')) return;
	removeChat();
	
	location.href = '?';
}

function onExportGdriveClick() {
	let data = {
		id:chatId,
		conversation:prepareConversation(),
		field:prepareField().public,
	};
	
	exportGdrive(chatId+'.json', JSON.stringify(data));
}
function onImportGdriveClick() {
	importGdrive((response)=>{
		let data = JSON.parse(response);
		storeField(data.id, data.field);
		storeConversation(data.id, data.conversation);
		
		location.href = '?' + data.id;
	});
}

function onExportFileClick() {
	let data = JSON.stringify({
		id:chatId,
		conversation:prepareConversation(),
		field:prepareField().public,
	});
	
	let blob = new Blob([data], {type:'application/json'});
	let aNode = document.createElement('a');
	aNode.href = URL.createObjectURL(blob);
	aNode.download = `${chatId}.json`;
	aNode.click();
	
	URL.revokeObjectURL(aNode.href);
}

function onImportFileChange(ev) {
	let file = event.target.files[0];
	if(!file) return;
	
	let reader = new FileReader();
	
	reader.onload = function(e) {
		onImportFileClick.data = JSON.parse(e.target.result);
		onImportFileClick();
	};
	
	reader.readAsText(file);
}

function onImportFileClick() {
	if(!onImportFileClick.data) {
		document.querySelector('#import_chat_file').click();
		return;
	}
	
	storeField(onImportFileClick.data.id, onImportFileClick.data.field);
	storeConversation(onImportFileClick.data.id, onImportFileClick.data.conversation);
	
	location.href = '?' + onImportFileClick.data.id;
}