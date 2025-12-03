var posts = {
	0:{
		childs:[],
		latests:[null, null],
	},
};
var currentPostKey = 0;
var postTemps = {};

function onUsertextKeydown(ev) {
	if (!ev.shiftKey && ev.key === 'Enter') {
		ev.preventDefault();
		onUsertextSubmitClick();
	}
}
function onUsertextSubmitClick() {
	let node = document.querySelector('#conversation_usertext');
	let text = node.value;
	
	if(text) {
		addPost({
			role:'user',
			content:text,
			parent:currentPostKey
		});
		onPostChange();
	}
	
	node.value = '';
	
	sendRequest({parent:currentPostKey});
}

function onPostClick(node, ev) {
	let op = ev.target.getAttribute('op');
	if(!op) return;
	
	let key = parseInt(node.getAttribute('post-key'));
	let post = posts[key];
	
	let parent = post.parent;
	let parentPost = posts[parent];
	
	if(op == 'left' || op == 'right') {
		if(!parentPost) return;
		
		let offset = ({
			'left': parentPost.childs.length-1,
			'right': 1,
		})[op];

		let index = parentPost.childs.indexOf(key);
		index = (index+offset) % parentPost.childs.length;
		key = parentPost.childs[index];
		
		let k = getDescendantPostKey(key);
		updateCurrentPostKey(k);
		
		onPostChange();
	}
	
	if(op == 'delete') {
		removePost(key);
		
		let k = getDescendantPostKey(parent);
		updateCurrentPostKey(k);
		
		onPostChange();
	}
	if(op == 'add') {
		if(post.role == 'user' || !parent) {
			let k = addPost({
				role:post.role,
				content:'',
				parent:parent
			});
			
			document.querySelector(`[post-key="${k}"] [op="edit"]`).click();
		
			onPostChange();
		} else {
			sendRequest({parent:parent});
		}
	}
	if(op == 'regen') {
		if(post.role == 'assistant') {
			sendRequest({parent:parent, replace:key});
		
			onPostChange();
		} else {
		}
	}
	
	if(op == 'edit') {
		let height = node.querySelector('.text .content').offsetHeight;
		node.querySelector('.edit >textarea').style.height = `${height}px`;
		
		node.setAttribute('mode', 'edit');
		
		node.querySelector('.edit >textarea').focus();
	}
	
	if(op == 'cancel') {
		node.querySelector('.edit >textarea').value = post.content||'';
		
		node.setAttribute('mode', 'text');
	}
	if(op == 'save') {
		let content = node.querySelector('.edit >textarea').value;
		
		post.content = content;
		
		onPostChange();
		
		updatePostContentNode(node, content, (postTemps[key]||{}).reasoning, post.model);
		
		node.setAttribute('mode', 'text');
	}
}

function onPostChange() {
	storeCurrentChat();
}

function onLoad_Post() {
	refreshPostNodes();
}

function refreshPostNodes() {
	let keys = getReversedPostKeys(currentPostKey).reverse();
	let nodes = document.querySelectorAll('#對話 .posts >li');
	
	let i=0;
	for(; i<keys.length; ++i) {
		if(nodes.length <= i) break;
		
		if(nodes[i].getAttribute('key') == keys[i]) continue;
		
		updatePostNode(nodes[i], keys[i]);
	}
	for(; i<keys.length; ++i) {
		addPostNode(keys[i]);
	}
	for(i=nodes.length-1; i>=keys.length; --i) {
		nodes[i].remove();
	}
}

function addPostNode(key) {
    let parentNode = document.querySelector(`#對話 .posts`);

	let node = document.getElementById('html_post_item').content.cloneNode(true);
	parentNode.appendChild(node);
	node = parentNode.lastElementChild;
	
	updatePostNode(node, key);
}

function updatePostNode(node, key) {
	let post = posts[key];
	if(!post) return;
	
	node.setAttribute('post-key', key);
	node.setAttribute('role', post.role||'system');
	
	let parent = post.parent;
	if(!parent) {
		node.setAttribute('is_first', 'true');
	}
	
	let parentPost = posts[parent]||posts[0];
	
	refreshPostNavNode(node, key);
	updatePostContentNode(node, post.content, (postTemps[key]||{}).reasoning, post.model);
}

function refreshPostNavNode(node, key) {
	let post = posts[key];
	let parent = post.parent||0;
	let parentPost = posts[post.parent]||posts[0];
	
	let size = parentPost.childs.length;
	let index = parentPost.childs.indexOf(key);
	index = index<0 ? '-' : (index+1);
	
	node.querySelector('.control >span').textContent = index + ' / ' + size;
}

function updatePostContentNode(node, content, reasoning, model) {
	reasoning ||= '';
	model ||= '';
	
	node.querySelector('.edit textarea').value = `${content}`;
	
	let textNode = node.querySelector('.content');
	
	textNode.innerHTML = '';
	
	let text = mapPostText(content);

	let reasonNode = document.getElementById('html_post_reasoning').content.cloneNode(true);
	textNode.appendChild(reasonNode);
	reasonNode = textNode.lastElementChild;
	reasonNode.appendChild(document.createTextNode(reasoning));
	reasonNode.querySelector('.length').textContent = reasoning.length;
	reasonNode.querySelector('.model').textContent = model;
	
	text.split('\n').forEach((p)=>{
		if(p == '') return;
		
		let pNode = document.createElement('p');
		
		let regexp = /(\"[^\"]*\"|\「[^\」]*\」|\“[^\”]*\”)/g;
		
		let segments = p.split(regexp);
		for(let i=0; i<segments.length; ++i) {
			if(segments[i] == '') continue;
		
			let spanNode = document.createElement('span');
			
			segments[i] = segments[i].replaceAll('<', '&lt;').replaceAll('>', '&gt;');
			
			spanNode.innerHTML = segments[i].replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>");
			
			if(regexp.test(segments[i])) {
				spanNode.setAttribute('class', 'quotation');
			}
			
			pNode.appendChild(spanNode);
		}
		
		textNode.appendChild(pNode);
	});
}

function addPost(arg) {
	let key = nextPostKey();
	
	let parent = arg.parent||0;
	
	posts[key] = {
		parent:parent,
		childs:[],
		latests:[null, null],
		role:arg.role||'system',
		content:arg.content||'',
		model:arg.model||{},
	};
	
	postTemps[key] = {
		reasoning:arg.reasoning||'',
	}
	
	if(posts[parent]) {
		posts[parent].childs.push(key);
	}
	
	updateCurrentPostKey(key);
	
	return key;
}

function removePost(key) {
	if(!posts[key]) return;
	
	removePostChild(posts[key].parent, key);
	removePostItems(key);
}

function removePostChild(key, child) {
	let post = posts[key];
	if(!post) return;
	
	for(let i=0; i<post.latests.length; ++i) {
		if(post.latests[i] != child) continue;
		
		post.latests[i] = null;
	}
	
	post.childs = post.childs.filter((item) => (item != child));
	
	post.childs.forEach((item)=>{
		let node = document.querySelector(`[post-key="${item}"]`);
		if(!node) return;
		
		refreshPostNavNode(node, item);
	});
}

function removePostItems(key) {
	if(!posts[key]) return;
	
	for(let i=0; i<posts[key].childs.length; ++i) {
		removePostItems(posts[key].childs[i]);
	}
	
	delete posts[key];
}

function updateCurrentPostKey(key) {
	if(!posts[key]) return;
	
	currentPostKey = key;
	
	let keys = getReversedPostKeys(key).reverse();
	
	for(let i=0; i<keys.length; ++i) {
		let k = keys[i];
		let parent = posts[k].parent;
		let parentPost = posts[parent];
		if(!parentPost) continue;
		
		parentPost.latests = [
			k,
			parentPost.latests[0]!=k ? parentPost.latests[0] : parentPost.latests[1],
		];
	}
	
	refreshPostNodes();
}

function getDescendantPostKey(key) {
	if(!posts[key]) return key;
	
	while(posts[key].childs) {
		let child = posts[key].childs.at(-1);
		
		for(let i=0;i<posts[key].latests.length;++i) {
			let latest = posts[key].latests[i];
			if(latest && posts[key].childs.includes(latest)) {
				child = latest;
				break;
			}
		}
		
		if(!posts[child]) break;
		
		key = child;
	}
	
	return key;
}

function getReversedPostKeys(key) {
	if(key == undefined) {
		key = currentPostKey;
	}
	
	let result = [];
	
	while(key) {
		result.push(key);
		
		key = (posts[key] || {}).parent;
	}
	
	return result;
}

function mapPostText(text) {
	text = text.replaceAll('{{user}}', fields['user']);
	text = text.replaceAll('{{char}}', fields['char']);
	return text;
}

function scrollPostToBottom() {
	document.querySelector('#對話 .grow').lastElementChild.scrollIntoView(false);
}

function nextPostKey() {
	let key = currentPostKey || 1;
	while(posts[key]) {
		key++;
	}
	return key;
}
