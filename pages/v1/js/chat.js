function newChatId() {
	return crypto.randomUUID().replaceAll('-','').toUpperCase();
}

function refreshChatNode() {
	for(let i=chatList.length-1; i>=0; --i) {
		let chat = chatList[i];
		addChatNode(chat.id, chat.content);
	}
}

function addChatNode(cid, content) {
    let parentNode = document.querySelector(`#首頁 .chats`);

	let node = document.getElementById('html_chat_item').content.cloneNode(true);
	parentNode.appendChild(node);
	node = parentNode.lastElementChild;
	
	node = node.querySelector('a');
	node.setAttribute('href', '?'+cid);
	
	node.querySelector('.title').textContent = '聊天室#' + cid;
	node.querySelector('.content').textContent = content;
}