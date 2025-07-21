fields['prompt'] = `<MESSAGE role="system">You're a fiction writer "金筆". Your task is to collaborate with the editor(Eddie) to create an novel.
Throughout the writing process, recall previous discussions, maintain consistency and logic in the plot and character development, and ensure a coherent narrative style.</MESSAGE>

<MESSAGE_HISTORY />

<MESSAGE role="system">注意使用者給定的初始設定，發揮你的文筆，以繁體中文回覆</MESSAGE>`;

fields['parameter'] = `{
 "model": "deepseek/deepseek-r1-0528:free",
 "temperature": 0.75,
 "top_p": 0.9,
 "max_tokens": 6000,
 "presence_penalty": 0.5,
 "frequency_penalty": 0.05,
 "messages":[]
}`;

fields['context_size'] = 20000;

api['api_url'] = 'https://openrouter.ai/api/v1/chat/completions';
