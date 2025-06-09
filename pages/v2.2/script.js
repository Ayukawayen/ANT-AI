let chatId = (location.search||'?').substring(1);
document.querySelector('#nav_chat_name').textContent = '聊天室#' + chatId.substr(0,8);

window.addEventListener('load', onLoad);

function onLoad() {
	if(!chatId) return;
	
	onMenuItemClick('對話');

	if(!currentPostKey) {
		addPost({
			role:'assistant',
			content:'',
			parent:0,
		});
	}
	
	let post = posts[currentPostKey];

	if(!post.parent && !post.contents['llm']) {
		document.querySelector(`[post-key="${currentPostKey}"] [op="edit"]`).click();
	}
	
	scrollPostToBottom();
}
