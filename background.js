chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "aiResumeMatch",
    title: "AI Resume Match & Interview Probability",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "aiResumeMatch") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runResumeMatch,
      args: [info.selectionText]
    });
  }
});

async function runResumeMatch(jobText) {
  chrome.storage.local.get(["openai_api_key", "resumeText"], async (items) => {
    const apiKey = items.openai_api_key;
    const resumeText = items.resumeText;

    if (!apiKey || !resumeText) {
      alert("Missing API key or pasted resume text.");
      return;
    }

    const prompt = `
You are an AI hiring assistant. The following job description has been highlighted by a user. They also provided their resume.
Please answer in this format:
1. Match Score (0–100)%:
2. Interview Probability (0–100)%:
3. Top Strengths:
4. Notable Weaknesses (if any):

Assume the job description is a subset of the resume. Do not penalize for skills not in the job post.

Job Description:
${jobText}

Resume:
${resumeText}
`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      });

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content || "No response";

      const box = document.createElement("div");
      box.style.position = "fixed";
      box.style.top = "20px";
      box.style.right = "20px";
      box.style.background = "#222";
      box.style.color = "white";
      box.style.padding = "15px";
      box.style.zIndex = "99999";
      box.style.borderRadius = "10px";
      box.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
      box.style.maxWidth = "400px";
      box.style.whiteSpace = "pre-wrap";
      box.innerText = message;
      document.body.appendChild(box);

      setTimeout(() => document.body.removeChild(box), 15000);
    } catch (err) {
      alert("OpenAI error: " + err.message);
    }
  });
}