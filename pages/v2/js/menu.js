window.addEventListener('load', onLoad_Menu);

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
	document.body.addEventListener('click', ()=>{
		document.querySelector('header >menu').setAttribute('isShow', 'false');
	});
}
