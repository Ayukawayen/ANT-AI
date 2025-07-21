let chatId = (location.search||'?').substring(1);
document.querySelector('#nav_chat_name >input').setAttribute('placeholder', chatId.substr(0,8));

window.addEventListener('load', onLoad);

function onLoad() {
	if(!chatId) return;
	
	onMenuItemClick('對話');
	
	scrollPostToBottom();
}
