async function sendRequest(options) {
console.log('sendRequest');

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
	
	options ||= {parent:currentPostKey};
	
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
			
			let reasoning = msg.reasoning;
			if(reasoning) {
				reasoning = reasoning.replaceAll('\\n','\n') + '\n\n----------\n\n\n';
			} else {
				reasoning = '';
			}
			
			let content = reasoning + msg.content;
			
			addPost({
				parent:options.parent,
				role:msg.role,
				content:content,
			});
			
			if(options.replace) {
				removePost(options.replace);
			}
			
			onPostChange();
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
	
	result = fields['api_parameter'];
	result = JSON.parse(result);
	result.messages = buildMessages(options);
	
	return result;
}

function buildMessages(options) {
	options ||= {};
	
	let result = [];
	
	let template = buildTemplate();
	
	template = template.replace(/<MESSAGE_HISTORY \/>/gis, '<MESSAGE role="list">$1</MESSAGE>');
	let msgs = [];
	let regex = /<MESSAGE role="([^"]*)">(.*?)<\/MESSAGE>/gis;
	let match;
	let countToken = 0;
	while ((match = regex.exec(template)) !== null) {
		let item = {
			role: match[1],
			content: match[2].replaceAll('<', '&lt;').replace('>', '&gt;'),
		};
		msgs.push(item);
		
		if(item.role != 'list') {
			countToken += estimateCountToken(item.content);
		}
	}
	
	let contentLimit = parseInt(fields['context_size']);
	
	let reversedPostKeys = getReversedPostKeys(options.parent||currentPostKey);
	
	msgs.forEach((msg)=>{
		if(msg.role == 'list') {
			let postMsgs = [];
			for(let i=0; i<reversedPostKeys.length; ++i) {
				let post = posts[reversedPostKeys[i]];
				if(!post) continue;
				
				let content = mapPostText(post.content);
				
				countToken += estimateCountToken(content);
				if(countToken > contentLimit) break;
				
				postMsgs.push({
					role: post.role,
					content: content.replaceAll('<', '&lt;').replace('>', '&gt;'),
				});
			}
			for(let i=postMsgs.length-1; i>=0; --i) {
				result.push(postMsgs[i]);
			}
			return;
		}
		result.push(msg);
	});
console.log(result);
	return result;
}

function buildTemplate() {
	let result = getContenteditableValue('prompt');
	let mappings = {
		'{{persona}}': getContenteditableValue('persona'),
		'{{user}}': fields['user'],
	};
	
	for(let k in mappings) {
		result = result.replaceAll(k, mappings[k]);
	}
	
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
