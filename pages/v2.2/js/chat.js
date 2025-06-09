const StoreKey_Chat = '_v2.2_.chat';

var chats = {};

window.addEventListener('load', onLoad_Chat);

function onNewChatClick() {
	location.href = '?' + getNewChatId();
}

function onDeleteChatClick() {
	if(!confirm('Delete this chat. Are you sure?\n這會刪除此聊天資料，你確定嗎？')) return;
	
	localStorage.removeItem(chatId + '.field');
	localStorage.removeItem(chatId + '.post');
	
	delete chats[chatId];
	localStorage.setItem(StoreKey_Chat, JSON.stringify(chats));
	
	location.href = '?';
}

function onForkChatClick() {
	chatId = getNewChatId();
	
	onFieldChange();
	onPostChange();
	
	location.href = '?' + chatId;
}

function onChatChange() {
	chats[chatId] ||= {
		id:chatId,
	};
	
	chats[chatId].timestamp = Date.now();
	chats[chatId].content = posts[currentPostKey].contents['frontend']||posts[currentPostKey].contents['llm'];
	
	localStorage.setItem(StoreKey_Chat, JSON.stringify(chats));
}

function onLoad_Chat() {
	let data = localStorage.getItem(StoreKey_Chat);
	if(!data) return;
	
	data = JSON.parse(data);
	
	chats = data;
	
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
		node.querySelector('.title').textContent = `聊天室#${chat.id}`;
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
