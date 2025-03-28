let chatId = (location.search||'?').substring(1);
document.querySelector('#nav_chat_name').textContent = '聊天室#' + chatId;

loadChats();
if(!chatId) {
	refreshChatNode();
} else {
	onMenuItemClick('對話');
	loadField();
	loadConversation();
	if(!currentPostKey) {
		addPost('assistant', '');
	}
	scrollPostToBottom();
}


document.body.addEventListener('click', ()=>{
	document.querySelector('header >menu').setAttribute('isShow', 'false');
});

document.querySelector('#menu_icon').addEventListener('click', onMenuIconClick);

document.querySelector('#conversation_button').addEventListener('click', onConversationButtonClick);
document.querySelector('#conversation_usertext').addEventListener('keydown', onConversationTextKeydown);