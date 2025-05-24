var api = {
	'api_url':'',
	'api_key':'',
};

window.addEventListener('load', onLoad_Api);

function onApiChange() {
	for(let k in api) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		api[k] = node.value;
	}
	
	localStorage.setItem('___.api', JSON.stringify(api));
}

function onExportFileClick() {
	let data = JSON.stringify({
		id:chatId,
		fields:fields,
		posts:posts,
		currentPostKey:currentPostKey,
	});
	
	let blob = new Blob([data], {type:'application/json'});
	let aNode = document.createElement('a');
	aNode.href = URL.createObjectURL(blob);
	aNode.download = `${chatId}.json`;
	aNode.click();
	
	URL.revokeObjectURL(aNode.href);
}

function onImportFileChange(ev) {
	let file = event.target.files[0];
	if(!file) return;
	
	let reader = new FileReader();
	
	reader.onload = function(e) {
		onImportFileClick.data = JSON.parse(e.target.result);
		onImportFileClick();
	};
	
	reader.readAsText(file);
}

function onImportFileClick() {
	if(!onImportFileClick.data) {
		document.querySelector('#import_chat_file').click();
		return;
	}
	
	let data = onImportFileClick.data;
	
	chatId = data.id;
	
	fields = data.fields;
	onFieldChange();
	
	posts = data.posts;
	updateCurrentPostKey(data.currentPostKey);
	onPostChange();
	
	location.href = '?' + chatId;
}

function onLoad_Api() {
	let data = localStorage.getItem('___.api');
	if(!data) return;
	
	data = JSON.parse(data);
	
	api = data;
	
	for(let k in api) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		node.value = api[k];
	}
}
