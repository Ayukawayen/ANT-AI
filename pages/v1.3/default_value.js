(()=>{
	let node = document.querySelector('[field-key="prompt"]');
	if(!node) return;
	
	node.value = `<MESSAGE role="system">
As a role-player, play the characters given below: "{{char}}".
Continue this fictional role-playing chat.
</MESSAGE>

<MESSAGE role="user">
<IF {{char.description}}>
## Character Description
{{char.description}}

---
</IF>
<IF {{char.example}}>
## Example Reply
{{char.example}}

---
</IF>
<IF {{user.description}}>
## User Persona
{{user.description}}

---
</IF>
<IF {{char.scenario}}>
## Scenario
{{char.scenario}}

---
</IF>
<IF {{char.memory}}>
## Summary of Chat History
{{char.memory}}

---
</IF>
</MESSAGE>

<MESSAGE_HISTORY />`;

})();


(()=>{
	let node = document.querySelector('[field-key="parameter"]');
	if(!node) return;
	
	node.value = `{
 "model": "google/gemma-3-27b-it:free",
 "temperature": 0.9,
 "max_tokens": 1600,
 "presence_penalty": 0.5,
 "frequency_penalty": 0.02,
 "messages":[]
}`;

})();

(document.querySelector('[field-key="context_size"]')||{}).value = '16000';

(document.querySelector('[field-key="api_url"]')||{}).value = 'https://openrouter.ai/api/v1/chat/completions';
