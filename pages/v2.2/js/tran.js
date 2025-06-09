const StoreKey_Tran = '_v2.2_.tran';

const translateSplitter = '-------';
const translateTemplate = `
{{tran_prompt}}
## The the most recent translated sections (splitted by '${translateSplitter}'):
{{translated}}
`;
const translateSubPrompt = `Translate the following text to {{target_lang}}.`;

const translateMessages = [`{{tran_prompt}}
## The the most recent translated sections (splitted by '${translateSplitter}'):
{{translated}}`,
	`Translate the following text to {{target_lang}}.`
];

var trans = {
	'tran_lang_frontend':'繁體中文',
	'tran_lang_llm':'English',
	'tran_context_size':16000,
	'tran_parameter':`{
 "model": "google/gemma-3-27b-it:free",
 "temperature": 0.5,
 "messages":[]
}`,
	'tran_prompt':`You are a professional literary translator. Your task is to translate a new chapter of an ongoing literary work. After reviewing the background information and the most recent translated sections provided, translate the latest original-language chapter into the same target language. Ensure consistency in terminology with the earlier translations, and make the new translation flow seamlessly as a continuation of the translated text.

## About the creation: {
{{char.scenario}}

{{char.description}}

{{user.description}}
}`,
};

window.addEventListener('load', onLoad_Tran);

async function sendTranslateRequest(from, to, postKey, text) {
	let url = api['api_url'];
	if(!url) {
		alert('No API URL!');
		onMenuItemClick('管理');
		return false;
	}
	
	let apikey = api['api_key'];
	if(!apikey) {
		alert('No API KEY!');
		onMenuItemClick('管理');
		return false;
	}
	
	let data = trans['tran_parameter'];
	data = JSON.parse(data);
	data.messages = buildTranMessages(from, to, postKey, text);

	let loadingNode = document.querySelector('#loading');
	try {
		loadingNode.classList.add('show');
		
		let headers = {
			'Authorization': 'Bearer ' + apikey,
			'Content-Type': 'application/json',
		};
		if(url.includes('openrouter.ai/api')) {
			headers['X-Title'] = env.OPENROUTER_TITLE;
			headers['HTTP-Referer'] = env.OPENROUTER_REFERER;
		}
		
		let fetched = await fetch(url, {
			method:'POST',
			headers: headers,
			body: JSON.stringify(data),
		});
		
		let resp = await fetched.text();
		
		resp = resp.trim();
		
		resp = JSON.parse(resp);
console.log(resp);
		if(resp.error) {
			alert('Error: ' + (`'${resp.error.message}'` || 'Unknown'));
		} else if(resp.choices && resp.choices.length > 0) {
			let msg = resp.choices[0].message;
			
			let content = msg.content;
			
			return content;
		}
	} catch (error) {
		console.error(error);
		alert(error.toString());
	} finally {
		loadingNode.classList.remove('show');
	}
}

function buildTranMessages(from, to, postKey, content) {
	let key = postKey||currentPostKey;
	let post = posts[key];
	if(!post) return;
	
	content ||= post.contents[from];
	if(!content) return;
	['user','char'].forEach((item)=>{
		content = content.replaceAll(`{{${item}}}`, fields[item]);
	});
	
	let parent = post.parent||0;

	let countToken = 0;
	let msgs = [
		buildTranPrompt(from, to, postKey),
		translateSubPrompt.replaceAll('{{target_lang}}', trans[`tran_lang_${to}`]||'target language.'),
		content,
	];
	
	msgs.forEach((item)=>{
		countToken += estimateCountToken(item);
	});
	
	let tokenLimit = parseInt(trans['tran_context_size']);
	if(tokenLimit <= 0) {
		tokenLimit = 0;
	} else {
		tokenLimit = Math.max(1, tokenLimit-countToken);
	}
	
	let options = {
		postKey:parent,
		tokenLimit:tokenLimit,
	};

	let translated = buildTranslated(to, options);
	
	msgs[0] = msgs[0].replaceAll('{{translated}}', translated);
	
	let result = ['system', 'system', 'user'].map((role, i)=>({
		role:role,
		content:msgs[i],
	}));
	
	return result;
}

function buildTranPrompt() {
	let result = translateTemplate;
	
	result = result.replaceAll('{{tran_prompt}}', trans['tran_prompt']);
	['char.memory','user.description','char.description','char.scenario','char.example','user','char'].forEach((item)=>{
		result = result.replaceAll(`{{${item}}}`, fields[item]);
	});
	
	return result;
}

function buildTranslated(lang, options) {
	options ||= {};
	options.tokenLimit ||= 0;
	if(options.postKey == undefined) {
		options.postKey = currentPostKey;
	}
	
	let result = '';
	
	let countToken = 0;
	let sections = [];
	
	let reversedPostKeys = getReversedPostKeys(options.postKey);
	
	for(let i=0; i<reversedPostKeys.length; ++i) {
		let post = posts[reversedPostKeys[i]];
		if(!post) continue;
		
		let content = post.contents[lang] || '';
		content = mapPostText(content);
		
		countToken += estimateCountToken(content);
		if(options.tokenLimit>0 && countToken>options.tokenLimit) break;
		
		sections.push(content);
	}
	
	for(let i=sections.length-1; i>=0; --i) {
		result += `\n${translateSplitter}\n` + sections[i];
	}
	
	return result;
}


function onLoad_Tran() {
	let data = localStorage.getItem(StoreKey_Tran);
	
	if(!data) {
		localStorage.setItem(StoreKey_Tran, JSON.stringify(trans));
		data = '{}';
	}
	
	data = JSON.parse(data);
	
	for(let k in trans) {
		let node = document.querySelector(`[field-key="${k}"]`)||{};
		
		trans[k] = data[k]||trans[k];
		node.value = trans[k];
	}
}

function onTranChange() {
	for(let k in trans) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		trans[k] = node.value;
	}
	
	localStorage.setItem(StoreKey_Tran, JSON.stringify(trans));
}

function onTranResetClick() {
	for(let k in trans) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		node.value = trans[k];
	}
	
	onMenuItemClick('對話');
}

function onTranSaveClick() {
	for(let k in trans) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		trans[k] = node.value;
	}
	
	onTranChange();
	
	onMenuItemClick('對話');
}
