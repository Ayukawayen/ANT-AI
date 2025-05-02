const CLIENT_ID = env.GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = env.GOOGLE_DRIVE_API_KEY;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const StoreKey_Gdrive_Token = '__.gdrive.token';
const folderName = 'AppData: ANT-AI';

let tokenClient;
let folderId = null;

let clientCallbacks = [];

initClient();

function exportGdrive(filename, content) {
	clientCallbacks.push(async ()=>{
		let loadingNode = document.querySelector('#loading');
		
		loadingNode.classList.add('show');
		
		await refreshFolderId();
		let response = await gapi.client.drive.files.list({
			q: `name='${filename}' and mimeType='application/json'`,
			fields: 'files(id)'
		});
		let fileId = response.result.files.length ? response.result.files[0].id : null;
		const fileMetadata = {
			name: filename,
			mimeType: 'application/json',
			properties: { clientId: CLIENT_ID },
		};
		if(!fileId) {
			fileMetadata.parents = [folderId];
		}
		const fileContent = new Blob([content], { type: 'application/json' });
		const form = new FormData();
		form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
		form.append('file', fileContent);
		const method = fileId ? 'PATCH' : 'POST';
		const url = fileId ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart` : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;
		response = await fetch(url, {
			method: method,
			headers: { 'Authorization': `Bearer ${gapi.client.getToken().access_token}` },
			body: form
		});
console.log(response);

		loadingNode.classList.remove('show');
		
		alert(response.ok ? '匯出成功' : '匯出失敗');
	});
	
	requestAccessToken();
}

function importGdrive(callback) {
	clientCallbacks.push(async ()=>{
		await refreshFolderId();
		const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
			.setIncludeFolders(false)
			.setMimeTypes("application/json")
			.setParent(folderId)
		;

		const picker = new google.picker.PickerBuilder()
			.setAppId(env.GOOGLE_DRIVE_CLIENT_ID.split('.')[0])
			.setOAuthToken(gapi.client.getToken().access_token)
			.setMaxItems(1)
			.addView(view)
			.hideTitleBar()
			.setCallback(async (data) => {
				if (data.action === google.picker.Action.PICKED) {
					const fileId = data.docs[0].id;
					const fileResponse = await gapi.client.drive.files.get({ fileId: fileId, alt: 'media' });
					callback(fileResponse.body);
				}
			})
			.build();
		picker.setVisible(true);
	});
	
	requestAccessToken();
}

function requestAccessToken() {
	let token = gapi.client.getToken();
	
	if(token) {
		onAuthed();
		return;
	}
	
	tokenClient.requestAccessToken();
}

function onAuthed() {
	while(clientCallbacks.length > 0) {
		(clientCallbacks.shift())();
	}
}

function loadGdriveToken() {
	let result = localStorage.getItem(StoreKey_Gdrive_Token);
	if(!result) return null;
	
	result = JSON.parse(result);
	if(Date.now() > result.expires_at) return null;
	
	return result;
}

function initClient() {
	gapi.load('client:auth2:picker', async () => {
		//await gapi.client.init({ apiKey: API_KEY, discoveryDocs: DISCOVERY_DOCS });
		await gapi.client.init({ discoveryDocs: DISCOVERY_DOCS });
		gapi.client.setToken(loadGdriveToken());
	});
	tokenClient = google.accounts.oauth2.initTokenClient({
		client_id: CLIENT_ID,
		scope: SCOPES,
		callback: (response)=>{
			response ||= {};
			
			if(response.error) {
				console.error(response);
				alert('連結Google Drive失敗!');
				return;
			}
			if(response.access_token) {
				response.expires_at = Date.now() + ((response.expires_in*1000)>>1);
				localStorage.setItem(StoreKey_Gdrive_Token, JSON.stringify(response));
				gapi.client.setToken(response);
			}
			
			onAuthed();
		},
	});
}

async function refreshFolderId() {
	if(folderId) return;
	
    const response = await gapi.client.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id)',
    });

    if (response.result.files.length > 0) {
        folderId = response.result.files[0].id;
    } else {
        const createResponse = await gapi.client.drive.files.create({
            resource: { name: folderName, mimeType: 'application/vnd.google-apps.folder' },
            fields: 'id'
        });
        folderId = createResponse.result.id;
    }
}