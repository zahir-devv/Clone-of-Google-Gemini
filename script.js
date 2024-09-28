const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleThemeBtn = document.querySelector("#toggle-theme-btn");
const deleteChatBtn = document.querySelector("#delete-chat-btn");
const suggestions = document.querySelectorAll('.suggestion')

let userMessage = null;
const API_KEY = "Your Api key";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

/* Load from local storage  */
const loadLocalStotage = () => {
    const savedChats = localStorage.getItem("savedChats")
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  document.body.classList.toggle("light_mode", isLightMode);

  toggleThemeBtn.innerText = isLightMode ? "dark_mode" : "Light_mode";

  chatList.innerHTML=savedChats;
  document.body.classList.toggle("hide-header",savedChats)
  chatList.scrollTo(0,chatList.scrollHeight);
};
loadLocalStotage();


/* create a message element */
const createMessageElement = (content, ...className) => {
  const div = document.createElement("div");
  div.classList.add("message", ...className);
  div.innerHTML = content;
  return div;
};

/* Generate the Response from API */
const generateApiResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    const data = await response.json();
    const apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "<br/><strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/:\s*/g, ":");
    console.log(apiResponse)
    textElement.innerHTML = apiResponse;
    chatList.scrollTo(0,chatList.scrollHeight);
  } catch (error) {
    console.log(error);
  } finally {
    incomingMessageDiv.classList.remove("loading");
    localStorage.setItem('savedChats', chatList.innerHTML)
    chatList.scrollTo(0,chatList.scrollHeight);
  }
};
/* Loading Animation */
const showLoadingAnimation = () => {
  const msg2 = ` <div class="message-content">
                   <img src="/images/google-gemini-icon.png" alt="Gemini Image" class="avatar">
                   <p class="text"></p>
                   <div class="loading-indicator">
                     <div class="loading-bar"></div>
                     <div class="loading-bar"></div>
                     <div class="loading-bar"></div>
                   </div>
                </div>
                <span onclick="copyMessage(this)" class="icon material-symbols-rounded"> content_copy </span>
               `;
  const incomingMessageDiv = createMessageElement(msg2, "incoming", "loading");
  chatList.appendChild(incomingMessageDiv);
  chatList.scrollTo(0,chatList.scrollHeight);
  generateApiResponse(incomingMessageDiv);
};

/* Copy Message  */
const copyMessage = (copyIcon) => {
  const messageText = copyIcon.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyIcon.innerText = "Done";
};

/* Sending outgoing chat message */
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage ;
  if (!userMessage) return;

  const msg = `<div class="message-content">
                <img src="/images/male-icon.png" alt="User Image" class="avatar">
                <p class="text">${userMessage}</p>
            </div>`;

  const outgoingMessageDiv = createMessageElement(msg, "outgoing");
  chatList.appendChild(outgoingMessageDiv);
  document.body.classList.add('hide-header')
  typingForm.reset();
  setTimeout(showLoadingAnimation, 500);
};

/* Suggestions */
suggestions.forEach(suggestion=>{
  suggestion.addEventListener('click', ()=>{
    userMessage = suggestion.querySelector('.s-text').innerText;
    handleOutgoingChat()
  })
})

/* Toggele between light and dark mode */
toggleThemeBtn.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeBtn.innerHTML = isLightMode ? "dark_mode" : "light_mode";
});

/* Clear chatlist */
deleteChatBtn.addEventListener('click',()=>{
    if(confirm("Are you sure you want to delete all chats")){
        localStorage.removeItem('savedChats')
        loadLocalStotage()
        typingForm.reset();
        
    }
})


typingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  handleOutgoingChat();
});
