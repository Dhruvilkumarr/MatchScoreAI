document.getElementById("save").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  const resumeText = document.getElementById("resumeText").value;
  chrome.storage.local.set({
    openai_api_key: apiKey,
    resumeText: resumeText
  }, () => {
    alert("Settings saved!");
  });
});