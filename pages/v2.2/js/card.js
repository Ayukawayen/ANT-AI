window.addEventListener('load', onLoad_Card);

function onCardDrop(ev) {
	ev.preventDefault();
	ev.stopPropagation();

	let dt = ev.dataTransfer;
	if(!dt) return;
	let file = (dt.files||[])[0];
	if(!file) return;
	
	let reader = new FileReader();
	
	reader.onload = function(e) {
		let data = e.target.result;
		data = JSON.parse(data);
		if(!data || !data.data) {
			alert('Something Error');
			return;
		}
		
		handleData(data.data);
	}
	
	reader.readAsText(file);
}

function onLoad_Card() {
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach((item) => {
		document.querySelector('#首頁').addEventListener(item, (e)=>{e.preventDefault();}, false);
	});
	
	document.querySelector('#首頁').addEventListener('drop', onCardDrop);
}
		
function handleData(data) {
	chatId = getNewChatId();
	
	onSaveClick();
	
	fields['char'] = data.name;
	fields['char.description'] = data.description;
	fields['char.scenario'] = data.scenario;
	fields['char.example'] = data.mes_example;

	let greetings = [data.first_mes, ...(data.alternate_greetings||[]) ];
	greetings.forEach((item)=>{
		addPost({
			role:'assistant',
			content:item,
			parent:0,
		});
	});
	
	let k = posts[0].childs[0];
	if(k) {
		updateCurrentPostKey(k);
	}

	
	onFieldChange();
	onPostChange();
	
	location.href = '?' + chatId;
}
