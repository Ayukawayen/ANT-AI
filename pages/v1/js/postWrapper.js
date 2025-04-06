function refreshPostChain(keys) {
    let parentNode = document.querySelector('#對話 .posts');
	
	let nodes = document.querySelectorAll('#對話 .posts>li');
	
	let i=0;
	for(; i<keys.length; ++i) {
		if(nodes.length <= i) break;
		
		if(nodes[i].getAttribute('key') == keys[i]) continue;
		
		updatePostNode(nodes[i], keys[i], posts[keys[i]].role, posts[keys[i]].content);
	}
	for(; i<keys.length; ++i) {
		addPostNode(keys[i], posts[keys[i]].role, posts[keys[i]].content);
	}
	for(i=nodes.length-1; i>=keys.length; --i) {
		nodes[i].remove();
	}
}

function scrollPostToBottom() {
	document.querySelector('#對話 .content').lastElementChild.scrollIntoView(false);
}

function addPostNode(key, role, content) {
    let parentNode = document.querySelector(`#對話 .posts`);

	let node = document.getElementById('html_post_item').content.cloneNode(true);
	parentNode.appendChild(node);
	node = parentNode.lastElementChild;
	
	updatePostNode(node, key, role, content);
}

function updatePostNode(node, key, role, content) {
	node.setAttribute('key', key);
	node.setAttribute('role', role||'system');
	node.querySelector('textarea').value = content||'';
	
	node.querySelectorAll('button[event]').forEach((button)=>{
		let e = button.getAttribute('event');
		button.setAttribute('onclick', `onPostIconClick('${e}', ${key})`);
	});
	
	refreshPostNav(key);
	refreshPostText(key);
}

function refreshPostNav(key) {
    let node = document.querySelector(`#對話 .posts [key="${key}"]`);
	if(!node) return false;
	
	let navText = '- / -';
	let post = posts[key];
	let parentPost = posts[post.parent];
	if(parentPost) {
		let length = parentPost.childs.length;
		let index = parentPost.childs.indexOf(key);
		navText = `${index+1} / ${length}`;
	}
	node.querySelector('.control>span').textContent = navText;
}

function refreshPostText(key) {
    let node = document.querySelector(`#對話 .posts [key="${key}"]`);
	if(!node) return false;
	
	let textNode = node.querySelector('.text>.content');
	while(textNode.lastChild) {
		textNode.removeChild(textNode.lastChild);
	}
	
	let text = node.querySelector('textarea').value;
	text = mapPostText(text);
	
	text.split('\n').forEach((p)=>{
		if(p == '') return;
		
		let pNode = document.createElement('p');
		
		let regexp = /(\"[^\"]*\"|\「[^\」]*\」|\“[^\”]*\”)/g;
		
		let segments = p.split(regexp);
		for(let i=0; i<segments.length; ++i) {
			if(segments[i] == '') continue;
		
			let spanNode = document.createElement('span');
			
			segments[i] = segments[i].replace('<', '&lt;').replace('>', '&gt;');
			
			spanNode.innerHTML = segments[i].replace(/\*(.*?)\*/g, "<em>$1</em>");
			
			if(regexp.test(segments[i])) {
				spanNode.setAttribute('class', 'quotation');
			}
			
			pNode.appendChild(spanNode);
		}
		
		textNode.appendChild(pNode);
	});
}

function mapPostText(content) {
	let mappings = {
		'{{user}}': getFieldValue('user.name'),
		'{{char}}': getFieldValue('char.name'),
	};
	
	for(let k in mappings) {
		content = content.replaceAll(k, mappings[k]);
	}
	
	return content;
}
