let parentNode;

parentNode = document.querySelector('#作品 .content');
addField('story.title', parentNode, 'text', '作品名稱', '');
addField('story.description', parentNode, 'textarea', '作品說明', '');
addField('story.characters', parentNode, 'textarea', '角色說明', '');
addField('story.outline', parentNode, 'textarea', '作品大綱', '');
addField('story.example', parentNode, 'textarea', '寫作範例', '');
addField('story.memory', parentNode, 'textarea', '劇情摘要', '');


document.querySelector('textarea[field-key="template"]').value = `<message role="system">
你是一個優秀的小說作家，在撰寫一個持續無盡的連載作品。
在撰寫新章節前先從頭閱讀過去章節的內容。
在文字風格、劇情發展上保持作品的一貫性。以創造力推動劇情發展，避免重覆的情節及敘述。
慢速發展劇情。使用豐富與生動的敘事手法。狀況需要時使用露骨極端的描寫。

user會提出對寫作成品的反饋、要求、或心得，參考其要求創作下一篇章節。

## 作品名稱 {
{{story.title}}
}

<if arg="{{story.description}}">
## 作品說明 {
{{story.description}}
}
</if>

<if arg="{{story.example}}">
## 寫作範例 {
{{story.example}}
}
</if>

<if arg="{{story.characters}}">
## 角色說明 {
{{story.characters}}
}
</if>

<if arg="{{story.outline}}">
## 作品大綱 {
{{story.outline}}
}
</if>

<if arg="{{story.memory}}">
## 劇情摘要 {
{{story.memory}}
}
</if>
</message>

<message role="system">
列出截至目前的最新章節內容
</message>

<message role="assistant">
[[merged_story]]
</message>

<message role="user">
{{prompt}}
[繼續撰寫]
</message>`;


setFieldValue('param.api_url', 'https://openrouter.ai/api/v1/chat/completions');
document.querySelector('textarea[field-key="paramter"]').value = `{
 "model": "google/gemma-3-27b-it:free",
 "temperature": 0.9,
 "max_tokens": 1600,
 "presence_penalty": 0.5,
 "frequency_penalty": 0.02,
 "messages":[]
}`;