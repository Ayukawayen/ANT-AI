let chatId = (location.search||'?A').substring(1);
document.querySelector('#nav_chat_name').textContent = '聊天室#' + chatId;

loadField();
loadConversation();
if(!currentPostKey) {
	addPost('assistant', '');
}

(()=>{
	let post = getPost(currentPostKey);
	if(post.parent) return;
	if(post.content) return;
	onPostIconClick('edit', currentPostKey);
})();

scrollPostToBottom();



document.body.addEventListener('click', ()=>{
	document.querySelector('header >menu').setAttribute('isShow', 'false');
});

document.querySelector('#menu_icon').addEventListener('click', onMenuIconClick);

document.querySelector('#conversation_button').addEventListener('click', onConversationButtonClick);
document.querySelector('#conversation_usertext').addEventListener('keydown', onConversationTextKeydown);