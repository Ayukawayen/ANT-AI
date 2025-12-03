var chats = {};

function onNewChatClick() {
	location.href = '?' + getNewChatId();
}

function onDeleteChatClick() {
	if(!confirm('Delete this chat. Are you sure?\n這會刪除此聊天資料，你確定嗎？')) return;

	removeCurrentChat().then(()=>{
		location.href = '?';
	});
}

function onForkChatClick() {
	chatId = getNewChatId();
	
	storeCurrentChat().then(()=>{
		location.href = '?' + chatId;
	});
}

function onChatNameChange(value) {
	if(!chats[chatId]) return;
	
	fields['chat_name'] = value;
	
	storeCurrentChat();
}

function onLoad_Chat() {
	document.querySelector('#nav_chat_name >input').value = fields['chat_name'];
	
	refreshChatNodes();
}

function refreshChatNodes() {
	let parentNode = document.querySelector('#首頁 .chats');
	
	let cs = Object.values(chats);
	cs.sort((a, b) => (b.timestamp - a.timestamp));
	
	parentNode.innerHTML = '';
	cs.forEach((chat)=>{
		let node = document.getElementById('html_chat_item').content.cloneNode(true);
		parentNode.appendChild(node);
		node = parentNode.lastElementChild;
		
		node.querySelector('a').setAttribute('href', '?' + chat.id);
		node.querySelector('.title').textContent = `《${chat.name||''}》#${chat.id.substr(0,8)}`;
		node.querySelector('.content').textContent = chat.content;
	});
}

function getNewChatId() {
	while(true) {
		let id = crypto.randomUUID().replaceAll('-','').toUpperCase();
		
		if(localStorage.getItem(id + '.field') || localStorage.getItem(id + '.post')) continue;
		
		return id;
	}
}
