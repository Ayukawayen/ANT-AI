let chatId = (location.search||'?').substring(1);
document.querySelector('#nav_chat_name').textContent = '創作#' + chatId.substr(0,8);

loadChats();
if(!chatId) {
	refreshChatNode();
} else {
	onMenuItemClick('作品');
	loadField();
	let nodes = document.querySelectorAll('main>article#作品 label textarea.value');
	nodes.forEach((node)=>{
		node.style.height = 'auto';
		node.style.height = (node.scrollHeight+4) + 'px';
	});
	onMenuItemClick('內文');
	loadConversation();
	if(!currentPostKey) {
		addPost('assistant', '', {parent:0});
	}
	
	(()=>{
		let post = getPost(currentPostKey);
		if(post.parent) return;
		if(post.content) return;
		onPostIconClick('edit', currentPostKey);
	})();
	
	scrollPostToBottom();
}


document.body.addEventListener('click', ()=>{
	document.querySelector('header >menu').setAttribute('isShow', 'false');
});

document.querySelector('#menu_icon').addEventListener('click', onMenuIconClick);

document.querySelector('#conversation_button').addEventListener('click', onConversationButtonClick);
document.querySelector('#conversation_usertext').addEventListener('keydown', onConversationTextKeydown);

if(document.querySelector('#import_chat_file')) {
	document.querySelector('#import_chat_file').addEventListener('change', onImportFileChange);
}