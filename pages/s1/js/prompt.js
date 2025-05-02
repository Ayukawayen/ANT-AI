async function sendRequest(options) {
	let url = getFieldValue('param.api_url');
	if(!url) {
		alert('No API URL!');
		onMenuItemClick('參數');
		return false;
	}
	
	let apikey = getFieldValue('param.api_key');
	if(!apikey) {
		alert('No API KEY!');
		onMenuItemClick('參數');
		return false;
	}
	
	options ||= {};
	
	let data = buildRequest(options);
	
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
			addPost(msg.role, msg.content, {parent:options.parent});
			
			if(options.replace) {
				removePost(options.replace);
			}
		}
		
		scrollPostToBottom();
	} catch (error) {
		console.error(error);
		alert(error.toString());
	} finally {
		loadingNode.classList.remove('show');
	}
	
	
}

function buildRequest(options) {
	let result;
	
	result = document.querySelector('textarea[field-key="paramter"]').value;
	result = JSON.parse(result);
	result.messages = buildMessages(options);
	
	return result;
}

function buildMessages(options) {
	let result = [];
	
	let template = buildTemplate(options);
	let regex = /<message role="([^"]*)">([^<]*)<\/message>/g;
	let match;
	let countToken = 0;
	let conutMergedStory = 0;
	while ((match = regex.exec(template)) !== null) {
		let item = {
			role: match[1],
			content: match[2],
		};
		result.push(item);
		countToken += estimateCountToken(item.content);
		conutMergedStory += item.content.split('[[merged_story]]').length - 1;
	}
	
	let contentLimit = parseInt(getFieldValue('template.content_length'));
	
	let reversedPostKeys = getReversedPostKeys(options.parent);
	let merged = '';
	
	for(let i=0; i<reversedPostKeys.length; ++i) {
		let post = getPost(reversedPostKeys[i]);
		if(!post) continue;
		if(post.role != 'assistant') continue;
		
		let content = mapPostText(post.content);
		
		countToken += estimateCountToken(content) * conutMergedStory;
		if(countToken > contentLimit) break;
		
		merged = content + '\n\n' + merged;
	}
	for(let i=0; i<result.length; ++i) {
		result[i].content = result[i].content.replaceAll('[[merged_story]]', merged);
	}
console.log(result);
	return result;
}

function buildTemplate(options) {
	let result = document.querySelector('textarea[field-key="template"]').value;
	
	options ||= {};
	let parent = options.parent || currentPostKey;
	let post = posts[parent];
	let mappings = {
		'{{prompt}}': post.role=='user' ? post.content : '',
	};
	for(let from in mappings) {
		result = result.replaceAll(from, mappings[from]);
	};
    result = result.replace(/<!--[\s\S]*?-->/g, '');
	
    result = result.replace(/<if arg="{{(.*?)}}">([\s\S]*?)<\/if>/g, (match, k, content) => {
		if(!getFieldValue(k)) return '';
        return content || '';
    });
    result = result.replace(/{{(.*?)}}/g, (match, k, content) => {
        let value = getFieldValue(k, mappings);
        return value || '';
    });

    return result;
}

function buildConversation() {
	let result = [];
	return result;
}

function estimateCountToken(text) {
	let result = 0;
	for(let i=0; i<text.length; ++i) {
		let charCode = text.charCodeAt(i);
		if ((charCode >= 0x00 && charCode <= 0x7F) || (charCode >= 0x30 && charCode <= 0x39)) {
			result += 0.25;
		} else if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
			result += 1.5;
		} else {
			result += 1;
		}
	}
	return result;
}
