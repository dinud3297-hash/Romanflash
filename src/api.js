export const sendChat = async (messages, apiKey) => {
  const res = await fetch('/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      stream: false
    })
  })
  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}
