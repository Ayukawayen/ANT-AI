import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, deleteField, writeBatch, collection, query, where, orderBy, documentId } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore-lite.js';

const StoreKey_Fb = '_ol3.1_.fb';
const Fb_Ref_Path = ['Ver', '3.1'];
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
	fbApp = fbAuth = fbDb = fbRef = null;
	
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
var fbRef;

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
	fbRef ||= doc(fbDb, ...Fb_Ref_Path);
	
	fbUserCred = await signInWithEmailAndPassword(fbAuth, firebase['fb_user_email'], firebase['fb_user_pw']);
	fbUserCred.expiresAt = Date.now() + 1000*fbUserCred._tokenResponse.expiresIn*0.5;
console.log(fbUserCred);

	document.querySelector('#login').classList.remove('show');
}

// -----------------------------------------------------------------------
// 內部共用：writeBatch 同時更新 chats 與 chatSummarys
//   chatUpdate	: 傳入 chats/{chatId} 的局部欄位
//   summaryUpdate : 傳入 chatSummarys/{chatId} 的局部欄位；null 代表不更新
// -----------------------------------------------------------------------
async function _batchUpdate(chatUpdate, summaryUpdate) {
	try {
		if(await refreshLoginToken() == -1) return;
		const batch = writeBatch(fbDb);
		batch.update(doc(fbRef, 'chats', chatId), chatUpdate);
		if(summaryUpdate) {
			batch.update(doc(fbRef, 'chatSummarys', chatId), summaryUpdate);
		}
		await batch.commit();
	} catch(e) {
		handleError(e);
	}
}

// 取得 chatSummarys 的 content+timestamp 更新物件
function _summaryContentUpdate() {
	return {
		content: (posts[currentPostKey] || {}).content || '',
		timestamp: Date.now(),
	};
}

// -----------------------------------------------------------------------
// [Post] Rotate Left / Right
//   JS 更新 currentPostKey 與 parentPost.latests 之後呼叫
//   parentKey: rotate 動作的 parent post key
// -----------------------------------------------------------------------
async function updateFirestore_Rotate(parentKey) {
	await _batchUpdate(
		{
			'currentPostKey': currentPostKey,
			[`posts.${parentKey}.latests`]: posts[parentKey].latests,
		},
		_summaryContentUpdate()
	);
}

// -----------------------------------------------------------------------
// [Post] Delete
//   JS 刪除節點子樹之後呼叫；整包覆寫 posts（子樹 key 數量不定，無法逐一 deleteField）
//   parentKey: 被刪除節點的 parent key
// -----------------------------------------------------------------------
async function updateFirestore_Delete(parentKey) {
	await _batchUpdate(
		{
			'posts': posts,
			'currentPostKey': currentPostKey,
		},
		_summaryContentUpdate()
	);
}

// -----------------------------------------------------------------------
// [Post] Added（新增單一 post）
//   含 Submit 兩個階段（user post、assistant post）
//   newKey	: 新增的 post key
//   parentKey : 新增節點的 parent key
// -----------------------------------------------------------------------
async function updateFirestore_Added(newKey, parentKey) {
	await _batchUpdate(
		{
			[`posts.${newKey}`]: posts[newKey],
			[`posts.${parentKey}.childs`]: posts[parentKey].childs,
			[`posts.${parentKey}.latests`]: posts[parentKey].latests,
			'currentPostKey': currentPostKey,
		},
		_summaryContentUpdate()
	);
}

// -----------------------------------------------------------------------
// [Post] Regen
//   oldKey	  : 被替換的舊 post key（JS removePost 之前取得）
//   newKey	  : 新產生的 post key
//   parentKey   : parent post key
//   hadChildren : 舊節點是否有子代（JS removePost 之前判斷）
//				 true  → 整包覆寫（子樹已遞迴刪除，無法逐一 deleteField）
//				 false → deleteField 局部寫入
// -----------------------------------------------------------------------
async function updateFirestore_Regen(oldKey, newKey, parentKey, hadChildren) {
	let chatUpdate;
	if(hadChildren) {
		chatUpdate = {
			'posts': posts,
			'currentPostKey': currentPostKey,
		};
	} else {
		chatUpdate = {
			[`posts.${oldKey}`]: deleteField(),
			[`posts.${newKey}`]: posts[newKey],
			[`posts.${parentKey}.childs`]: posts[parentKey].childs,
			[`posts.${parentKey}.latests`]: posts[parentKey].latests,
			'currentPostKey': currentPostKey,
		};
	}
	await _batchUpdate(chatUpdate, _summaryContentUpdate());
}

// -----------------------------------------------------------------------
// [Post] Edit and Save
//   postKey : 被編輯的 post key
// -----------------------------------------------------------------------
async function updateFirestore_EditSave(postKey) {
	const isCurrentPost = (postKey == currentPostKey);
	await _batchUpdate(
		{
			[`posts.${postKey}.content`]: posts[postKey].content,
		},
		{
			...(isCurrentPost ? { content: posts[postKey].content } : {}),
			timestamp: Date.now(),
		}
	);
}

// -----------------------------------------------------------------------
// [Field] Save
//   整包覆寫 fields；chatSummarys 不受影響
// -----------------------------------------------------------------------
async function updateFirestore_Fields() {
	await _batchUpdate(
		{ 'fields': fields },
		null
	);
}

// -----------------------------------------------------------------------
// [Chat] ChatName onchange
// -----------------------------------------------------------------------
async function updateFirestore_ChatName() {
	await _batchUpdate(
		{ 'fields.chat_name': fields['chat_name'] },
		{
			name: fields['chat_name'],
			timestamp: Date.now(),
		}
	);
}

// -----------------------------------------------------------------------
// 初次建立新對話（chats / chatSummarys 尚不存在，用 setDoc）
//   由 post.js 在第一次 Added 事件時判斷 isChatExist 後呼叫
// -----------------------------------------------------------------------
async function initFirestore_NewChat() {
	const data = {
		id: chatId,
		fields: fields,
		posts: posts,
		currentPostKey: currentPostKey,
	};
	const summary = {
		id: chatId,
		name: fields['chat_name'] || '',
		content: (posts[currentPostKey] || {}).content || '',
		timestamp: Date.now(),
	};
	try {
		if(await refreshLoginToken() == -1) return;
		const batch = writeBatch(fbDb);
		batch.set(doc(fbRef, 'chats', chatId), data);
		batch.set(doc(fbRef, 'chatSummarys', chatId), summary);
		await batch.commit();
		isChatExist = true;
	} catch(e) {
		handleError(e);
	}
}

async function removeCurrentChat() {
	try {
		if(await refreshLoginToken() == -1) return;
		
		await deleteDoc(doc(fbRef, 'chats', chatId));
		await deleteDoc(doc(fbRef, 'chatSummarys', chatId));
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
		
		result = await getDoc(doc(fbRef, 'chats', chatId));
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
			collection(fbRef, 'chatSummarys')
			, ...(chatId ? [where(documentId(), '==', chatId)] : [])
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

window.removeCurrentChat = removeCurrentChat;
window.loadCurrentChat = loadCurrentChat;
window.loadChatSummarys = loadChatSummarys;

window.initFirestore_NewChat = initFirestore_NewChat;
window.updateFirestore_Rotate = updateFirestore_Rotate;
window.updateFirestore_Delete = updateFirestore_Delete;
window.updateFirestore_Added = updateFirestore_Added;
window.updateFirestore_Regen = updateFirestore_Regen;
window.updateFirestore_EditSave = updateFirestore_EditSave;
window.updateFirestore_Fields = updateFirestore_Fields;
window.updateFirestore_ChatName = updateFirestore_ChatName;
