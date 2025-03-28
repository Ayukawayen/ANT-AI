function saveField() {
	storeField();
}
function resetField() {
	loadField();
}

function addField(key, parentNode, type, title, placeholder, value) {
	let fieldTypeId = {
		'text':'html_field_text',
		'textarea':'html_field_textarea',
	}[type];
	
	let node = document.getElementById(fieldTypeId).content.cloneNode(true);
	parentNode.appendChild(node);
	node = parentNode.lastElementChild;

	node.setAttribute('field-key', key||'');
	node.querySelector('.title').textContent = title||'';
	node.querySelector('.key').textContent = key||'';
	node.querySelector('.value').setAttribute('placeholder', placeholder||'');
	node.querySelector('.value').setAttribute('value', value||'');
	
}

function deleteField(key) {
	let node = document.querySelector(`[key="${key}"]`);
	if(!node) return false;
	
	node.remove();
}

function setFieldValue(key, value) {
	let node = document.querySelector(`label[field-key="${key}"] >.value, .value[field-key="${key}"]`);
	if(!node) return false;
	
	node.value = value;
}

function getFieldValue(key, mappings) {
	let node = document.querySelector(`label[field-key="${key}"] >.value, .value[field-key="${key}"]`);
	if(!node) return null;
	
	let result = node.value;
	
	mappings ||= [];
	
	for(let from in mappings) {
		result = result.replaceAll(from, mappings[from]);
	};
	
	return result;
}

function getFieldAttribute(key, name) {
	let node = document.querySelector(`label[field-key="${key}"] >.value, .value[field-key="${key}"]`);
	if(!node) return null;
	
	return node.getAttribute(name);
}
