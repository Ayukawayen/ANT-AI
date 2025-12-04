import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore-lite.js';

const StoreKey_Fb = '_fb_.fb';
var firebase = {
	'fb_proj_id':'',
	'fb_api_key':'',
	'fb_user_email':'',
	'fb_user_pw':'',
};

window.addEventListener('load', onLoad_Firebase);

function onLogoutClick() {
	firebase['fb_user_email'] = '';
	firebase['fb_user_pw'] = '';
	localStorage.setItem(StoreKey_Fb, JSON.stringify(firebase));
	
	location.reload();
}

function onFirebaseChange() {
	fbApp = fbAuth = fbDb = null;
	
	for(let k in firebase) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		firebase[k] = node.value;
	}
	
	localStorage.setItem(StoreKey_Fb, JSON.stringify(firebase));
}

async function onLoad_Firebase() {
	let data = localStorage.getItem(StoreKey_Fb);
	if(!data) {
		document.querySelector('#login').classList.add('show');
		document.querySelector('#loading').classList.remove('show');
		return;
	}
	
	data = JSON.parse(data);
	
	firebase = data;
	
	for(let k in firebase) {
		let node = document.querySelector(`[field-key="${k}"]`);
		if(!node) continue;
		
		node.value = firebase[k];
	}
	
	try {
		await loadChatSummarys();
		await loadCurrentChat();
	} catch(e) {
		document.querySelector('#loading').classList.remove('show');
		return;
	}
	
	onLoad_Api();
	onLoad_Chat();
	onLoad_Field();
	onLoad_Post();
	onLoad();
}


var fbApp;
var fbAuth;
var fbDb;

var fbUserCred;

async function refreshLoginToken() {
	if(fbUserCred && fbUserCred.expiresAt>Date.now()) return;
	
	if(!firebase['fb_api_key'] || !firebase['fb_proj_id'] || !firebase['fb_user_email'] || !firebase['fb_user_pw']) {
		document.querySelector('#login').classList.add('show');
		return -1;
	}

	fbApp ||= initializeApp({
		apiKey: firebase['fb_api_key'],
		projectId: firebase['fb_proj_id'],
		authDomain: firebase['fb_proj_id'] + '.firebaseapp.com',
	});
	fbAuth ||= getAuth(fbApp);
	fbDb ||= getFirestore(fbApp);
	
	fbUserCred = await signInWithEmailAndPassword(fbAuth, firebase['fb_user_email'], firebase['fb_user_pw']);
	fbUserCred.expiresAt = Date.now() + 1000*fbUserCred._tokenResponse.expiresIn*0.5;
console.log(fbUserCred);

	document.querySelector('#login').classList.remove('show');
}

async function storeCurrentChat() {
	let currentContent = posts[currentPostKey].content;
	
	let data = {
		id:chatId,
		fields:fields,
		posts:posts,
		currentPostKey:currentPostKey,
	};
	let summary = {
		id:chatId,
		name:fields['chat_name']||'',
		content:currentContent,
		timestamp:Date.now(),
	};
	
	try {
		if(await refreshLoginToken() == -1) return;
		
		await setDoc(doc(fbDb, 'chats', data.id), data);
		await setDoc(doc(fbDb, 'chatSummarys', summary.id), summary);
	} catch (e) {
		handleError(e);
		return;
	}
}

async function removeCurrentChat() {
	try {
		if(await refreshLoginToken() == -1) return;
		
		await deleteDoc(doc(fbDb, 'chats', chatId));
		await deleteDoc(doc(fbDb, 'chatSummarys', chatId));
	} catch (e) {
		handleError(e);
		return;
	}
}

async function loadCurrentChat() {
	if(!chatId) return;
	
	let result;
	
	try {
		if(await refreshLoginToken() == -1) return;
		
		result = await getDoc(doc(fbDb, 'chats', chatId));
	} catch (e) {
		handleError(e);
		throw(e);
	}
	
console.log(result);
	if(!result.exists()) return;
	
	isChatExist = true;
	
console.log(result.data());
	let data = result.data();
	
	fields = data.fields;
	posts = data.posts;
	currentPostKey = data.currentPostKey;
	
	return result;
}

async function loadChatSummarys() {
	let response;
	
	try {
		if(await refreshLoginToken() == -1) return;
		
		response = await getDocs(query(
			collection(fbDb, 'chatSummarys')
			//, orderBy('timestamp', 'desc')
		));
	} catch (e) {
		handleError(e);
		throw(e);
	}
	
console.log(response);

	response.docs.forEach((doc)=>{
		chats[doc.id] = doc.data();
	});
console.log(chats);
}

function handleError(e) {
	document.querySelector('#login').classList.add('show');
	
	alert('Firebase連線失敗');
console.error(e);
	return;
}

window.onLogoutClick = onLogoutClick;
window.onFirebaseChange = onFirebaseChange;

window.storeCurrentChat = storeCurrentChat;
window.removeCurrentChat = removeCurrentChat;
window.loadCurrentChat = loadCurrentChat;
window.loadChatSummarys = loadChatSummarys;

