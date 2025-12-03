var setting = {
	isDark:false,
};

window.addEventListener('load', onLoad_Menu);

function onDarkToggleClick() {
	setting.isDark = document.body.classList.toggle('dark');
	
	localStorage.setItem('___.setting', JSON.stringify(setting));
}

function onMenuIconClick(ev) {
	let node = document.querySelector('header >menu');
	node.setAttribute('isShow', node.getAttribute('isShow')=='true' ? 'false' : 'true');
	ev.stopPropagation();
}

function onMenuItemClick(aid) {
	document.querySelector('#style_active_article').textContent = `#${aid} {display:flex;}`;
	document.querySelector('#nav_active_article').textContent = aid;
}

function onLoad_Menu() {
	let data = localStorage.getItem('___.setting')||'{}';
	data = JSON.parse(data);
	
	setting = data;

	document.querySelector('body').classList.toggle('dark', !!setting.isDark);
	
	document.body.addEventListener('click', ()=>{
		document.querySelector('header >menu').setAttribute('isShow', 'false');
	});
}
