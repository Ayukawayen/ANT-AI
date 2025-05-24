var fields = {
	'user':'',
	'persona':'',
	'context_size':'',
	'prompt':'',
	'api_parameter':'',
};

window.addEventListener('load', onLoad_Field);

function onDisplayChange(fieldKey, tag, isDisplay) {
	document.querySelector(`[field-key="${fieldKey}"]`).setAttribute('hide_'+tag, !isDisplay);
}

function onResetClick() {
	refreshFieldNodes();
}

function onSaveClick() {
	for(let k in fields) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		if(node.getAttribute('contenteditable')) {
			fields[k] = node.innerHTML;
			continue;
		}
		
		fields[k] = node.value;
	}
	
	onFieldChange();
}

function onFieldChange() {
	localStorage.setItem(chatId + '.field', JSON.stringify(fields));
	onChatChange();
}

function onLoad_Field() {
	let data = localStorage.getItem(chatId + '.field');
	if(!data) return;
	
	data = JSON.parse(data);
	
	fields = data;
	
	refreshFieldNodes();
}

function refreshFieldNodes() {
	for(let k in fields) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		if(node.getAttribute('contenteditable')) {
			node.innerHTML = fields[k];
			continue;
		}
		
		node.value = fields[k];
	}
}

function getFieldValue(fieldKey) {
	let node = document.querySelector(`[field-key="${fieldKey}"]`);
	
	return node.value;
}

function getContenteditableValue(fieldKey) {
	let node = document.querySelector(`[field-key="${fieldKey}"]`);
	
	let mainNode = document.querySelector('main');
	mainNode.classList.add('showAll');

	let attrNames = ['hide_u', ];
	let attrValues = {};
	
	attrNames.forEach((name)=>{
		attrValues[name] = node.getAttribute(name);
		node.setAttribute(name, true);
	});
	
	let result = node.innerText;

	mainNode.classList.remove('showAll');

	attrNames.forEach((name)=>{
		node.setAttribute(name, attrValues[name]);
	});
	
	return result;
}
