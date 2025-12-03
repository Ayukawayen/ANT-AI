var fields = {
	'chat_name':'',
	'user':'',
	'user.description':'',
	'char':'',
	'char.description':'',
	'char.scenario':'',
	'char.example':'',
	'char.memory':'',
	'context_size':'',
	'prompt':'',
	'parameter':'',
};

function onFieldFocus(node) {
	node.style.height = (node.scrollHeight+4) + 'px';
}
function onFieldFocusOut(node) {
	node.style.height = 'auto';
}

function onResetClick() {
	refreshFieldNodes();
}

function onSaveClick() {
	for(let k in fields) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		fields[k] = node.value;
	}
	
	storeCurrentChat();
}

function onLoad_Field() {
	if(!isChatExist) return;
	
	refreshFieldNodes();
}

function refreshFieldNodes() {
	for(let k in fields) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		node.value = fields[k];
	}
}

function getFieldValue(fieldKey) {
	let node = document.querySelector(`[field-key="${fieldKey}"]`);
	
	return node.value;
}
