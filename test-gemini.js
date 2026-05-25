const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: 'You are Prerna...'
    });

    let history = [
      { role: 'model', parts: [{ text: 'Namaste ji!' }] },
      { role: 'user', parts: [{ text: 'Hi' }] },
      { role: 'model', parts: [{ text: 'Hello' }] }
    ];

    while (history.length > 0 && history[0].role === 'model') {
      history.shift();
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage("I want a wedding saree");
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
run();
