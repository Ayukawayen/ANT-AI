let posts = {};
let currentPostKey = null;


function onPostIconClick(type, key) {
	let post = posts[key];
	let parent = post.parent;
	let parentPost = posts[parent];
	
	if(type == 'left' || type == 'right') {
		if(!parentPost) return;
		
		let offset = ({
			'left': parentPost.childs.length-1,
			'right': 1,
		})[type];
		
		let index = parentPost.childs.indexOf(key);
		index = (index+offset) % parentPost.childs.length;
		key = parentPost.childs[index];
		
		updateCurrentPostKey(key, {isAutoDescendant:true});
		
		return;
	}
	
	if(type == 'delete') {
		removePost(key);
	}
	if(type == 'add') {
		if(post.role == 'assistant') {
			sendRequest({parent:parent});
		} else {
			let k = addPost('user', '', {parent:parent});
			
			onPostIconClick('edit', k);
		}
	}
	if(type == 'regen') {
		if(post.role == 'assistant') {
			sendRequest({parent:parent, replace:key});
		} else {
			removePost(key);
			updateCurrentPostKey(parent);
		}
	}
	if(type == 'edit') {
		let node = document.querySelector(`#對話 .posts [key="${key}"]`);
		if(!node) return;
		
		let height = node.querySelector('.text .content').offsetHeight;
		node.querySelector('.edit>textarea').style.height = `${height}px`;
		
		node.setAttribute('mode', 'edit');
	}
	
	if(type == 'cancel') {
		let node = document.querySelector(`#對話 .posts [key="${key}"]`);
		if(!node) return;
		
		node.querySelector('.edit>textarea').value = post.content||'';
		
		node.setAttribute('mode', 'text');
	}
	if(type == 'save') {
		let node = document.querySelector(`#對話 .posts [key="${key}"]`);
		if(!node) return;
		
		setPost(key, node.querySelector('.edit>textarea').value);
		refreshPostText(key);
		storeConversation();
		
		node.setAttribute('mode', 'text');
	}
}

function updateCurrentPostKey(key, options) {
	if(!posts[key]) return false;
	
	options ||= {};
	
	if(options.isAutoDescendant) {
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
	}
	
	currentPostKey = key;
	
	let keys = getReversedPostKeys(null).reverse();
	
	for(let i=keys.length-2; i>=0; --i) {
		posts[keys[i]].latests = insertLatest(keys[i+1], posts[keys[i]].latests);
	}
	
	refreshPostChain(keys);
	
	storeConversation();
}

function getReversedPostKeys(key) {
	key ||= currentPostKey;
	
	let result = [];
	
	while(key) {
		result.push(key);
		
		key = (posts[key] || {}).parent;
	}
	
	return result;
}

function addPost(role, content, options) {
	options ||= {};
	let parent = options.parent || currentPostKey;
	
	let key = nextKey();
	
	posts[key] = {
		parent:parent,
		childs:[],
		latests:[null, null],
		role:role,
		content:content,
	};
	
	if(posts[parent]) {
		posts[parent].childs.push(key);
	}
	
	updateCurrentPostKey(key);
	//storeConversation();
	
	return key;
}
function removePost(key, options) {
	if(!posts[key]) return false;
	
	options ||= {};
	
	let parent = posts[key].parent;
	
	for(let i=0; i<posts[key].childs.length; ++i) {
		removePost(posts[key].childs[i], {ignoreParent:true});
	}
	
	delete posts[key];
	
	if(!options.ignoreParent) {
		((key, parent)=>{
			if(!parent) return;
			
			parentPost = posts[parent];
			if(!parentPost) return;
			
			for(let i=0; i<parentPost.latests.length; ++i) {
				if(parentPost.latests[i] != key) continue;
				
				parentPost.latests[i] = null;
			}
			
			let index = parentPost.childs.indexOf(key);
			if(index < 0) return;
			
			parentPost.childs.splice(index, 1);
			
			parentPost.childs.forEach(refreshPostNav);
		})(key, parent)
		
		if(document.querySelector(`#對話 .posts [key="${key}"]`)) {
			updateCurrentPostKey(parent, {isAutoDescendant:true});
		}
	}
	
	storeConversation();
}

function insertLatest(key, latests) {
	latests[1] = (latests[0]!==key && latests[0]!==null) ? latests[0] : latests[1];
	latests[0] = key;
	
	if(latests[1] == latests[0]) {
		latests[1] = null;
	}
	
	return latests;
}

function setPost(key, content) {
	if(!posts[key]) return false;
	
	posts[key].content = content;
}
function getPost(key) {
	return posts[key] || null;
}


function nextKey() {
	let key = currentPostKey || 1;
	while(posts[key]) {
		key++;
	}
	return key;
}
