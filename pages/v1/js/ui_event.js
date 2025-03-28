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
	
	if(text) {
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
	if(!confirm('Delete  this chat. Are you sure?\n這會刪除此聊天資料，你確定嗎？')) return;
	removeChat();
	
	location.href = '?';
}

function onExportChatClick() {
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

function onImportChatFileChange(ev) {
	let file = event.target.files[0];
	if(!file) return;
	
	let reader = new FileReader();
	
	reader.onload = function(e) {
		onImportChatClick.data = JSON.parse(e.target.result);
	};
	
	reader.readAsText(file);
}

function onImportChatClick() {
	if(!onImportChatClick.data) {
		alert('讀取資料失敗!');
		return;
	}
	
	storeField(onImportChatClick.data.id, onImportChatClick.data.field);
	storeConversation(onImportChatClick.data.id, onImportChatClick.data.conversation);
	
	location.href = '?' + onImportChatClick.data.id;
}