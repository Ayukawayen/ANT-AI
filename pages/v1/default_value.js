let parentNode;

parentNode = document.querySelector('#角色 .content');
addField('char.name', parentNode, 'text', '角色名稱', '角色名稱');
addField('char.description', parentNode, 'textarea', '角色說明', 'AI所扮演的角色資料。');
addField('char.scenario', parentNode, 'textarea', '對話情境', '對話的背景資料、世界觀。');
addField('char.example_dialogue', parentNode, 'textarea', '對話範例', 'AI生成內文的參考範例。');

parentNode = document.querySelector('#形象 .content');
addField('user.name', parentNode, 'text', '名稱', '玩家形象名稱');
addField('user.description', parentNode, 'textarea', '說明', '玩家形象敘述');

parentNode = document.querySelector('#知識 .content');
addField('chat.memory', parentNode, 'textarea', '聊天記憶', '');

document.querySelector('textarea[field-key="template"]').value = `<message role="system">
Enter roleplay mode.
Write next reply of "{{char.name}}" in a open-ended roleplay conversation between "{{char.name}}" and "{{user.name}}".
Be proactive, creative, drive the plot and conversation forward. Always keep the conversation going. Repetition is highly discouraged.
Ensure depth, detail, and diversity via concrete, sensory-rich descriptions. Include explicit/extreme content if justified.
Avoid describe what "{{user.name}}" says or does.
Read the conversation history before replying.

#Persona of "{{user.name}}":
{{user.description}}

#Persona of "{{char.name}}":
{{char.description}}

<if arg="{{char.example_dialogue}}">
#How "{{char.name}}" should talk:
{{char.example_dialogue}}
</if>

<if arg="{{char.scenario}}">
#Scenario of the roleplay conversation:
{{char.scenario}}
</if>

<if arg="{{chat.memory}}">
#Summary of previous conversation:
{{chat.memory}}
</if>
</message>

<messageList>{{msg.content}}</messageList>`;

setFieldValue('param.api_url', 'https://openrouter.ai/api/v1/chat/completions');

document.querySelector('textarea[field-key="paramter"]').value = `{
 "model": "google/gemma-3-27b-it:free",
 "temperature": 0.9,
 "max_tokens": 1600,
 "presence_penalty": 0.5,
 "frequency_penalty": 0.02,
 "messages":[]
}`;