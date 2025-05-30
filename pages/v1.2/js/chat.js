const StoreKey_Chat = '_1.2_.chat';

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
	let id = getNewChatId();
	
	while(localStorage.getItem(id + '.field') || localStorage.getItem(id + '.post')) {
		id = getNewChatId();
	}
	
	chatId = id;
	
	onFieldChange();
	onPostChange();
	
	location.href = '?' + id;
}

function onChatChange() {
	chats[chatId] ||= {
		id:chatId,
	};
	
	chats[chatId].timestamp = Date.now();
	chats[chatId].content = posts[currentPostKey].content;
	
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
	return crypto.randomUUID().replaceAll('-','').toUpperCase();
}
