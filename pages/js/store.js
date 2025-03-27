const StoreKey_Conversation = 'conversation';
const StoreKey_Field = 'field';
const StoreKey_Secret = 'secret';

function prepareConversation() {
	return {
		currentPostKey: currentPostKey,
		posts: posts,
	};
}

function storeConversation(id, value) {
	id ||= chatId;
	value ||= prepareConversation();
	
	let key = id + '.' + StoreKey_Conversation;
	value = JSON.stringify(value);
	
	localStorage.setItem(key, value);
}
function peekConversation(id) {
	id ||= chatId;
	let storeKey = id + '.' + StoreKey_Conversation;
	return localStorage.getItem(storeKey);
}

function loadConversation(id) {
	id ||= chatId;
	let key = id + '.' + StoreKey_Conversation;
	
	let value = localStorage.getItem(key);
	if(!value) return;
	
	value = JSON.parse(value);
	
	posts = value.posts;
	
	updateCurrentPostKey(value.currentPostKey);
}
function removeConversation(id) {
	id ||= chatId;
	let key = id + '.' + StoreKey_Conversation;
	
	localStorage.removeItem(key);
}

function prepareField() {
	let result = {public:{}, secret:{}};
	
	let nodes = document.querySelectorAll('*[field-key]');

	nodes.forEach((node)=>{
		let key = node.getAttribute('field-key');
		let isSecret = getFieldAttribute(key, 'type') == 'password';
		let value = getFieldValue(key);
		result[isSecret?'secret':'public'][key] = value;
	});
	
	return result;
}

function storeField(id, value) {
	id ||= chatId;
	value ||= prepareField();
	if(!value.public) {
		value = {public:value, secret:{}};
	}
	
	localStorage.setItem(id + '.' + StoreKey_Field, JSON.stringify(value.public));
	localStorage.setItem(id + '.' + StoreKey_Secret, JSON.stringify(value.secret));
}
function peekField(id) {
	id ||= chatId;

	return {
		public: localStorage.getItem(id + '.' + StoreKey_Field),
		secret: localStorage.getItem(id + '.' + StoreKey_Secret),
	};
}

function loadField(id) {
	id ||= chatId;
	
	let value = {};
	let stored;
	
	stored = localStorage.getItem(id + '.' + StoreKey_Field) || '{}';
	stored = JSON.parse(stored);
	for(let k in stored) {
		value[k] = stored[k];
	}
	stored = localStorage.getItem(id + '.' + StoreKey_Secret) || '{}';
	stored = JSON.parse(stored);
	for(let k in stored) {
		value[k] = stored[k];
	}
	
	for(let k in value) {
		let node = document.querySelectorAll(`[field-key="${k}"]`);
		if(!node) {
			//addField(k, parentNode, type, title, '', value[k]);
		} else {
			setFieldValue(k, value[k]);
		}
	}
}
function removeField(id) {
	id ||= chatId;
	
	localStorage.removeItem(id + '.' + StoreKey_Field);
	localStorage.removeItem(id + '.' + StoreKey_Secret);
}