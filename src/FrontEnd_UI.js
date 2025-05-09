



/* @ts-ignore */
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  langPrefix: 'language-',
  highlight: (code, language) => {
    /* @ts-ignore */
    if (language && hljs.getLanguage(language)) {
      try {
        /* @ts-ignore */
        return hljs.highlight(code, { language }).value;
      } catch (err) {}
    }
    return code;
  }
});
function formatMessage(text) {
  /* @ts-ignore */
  return marked.parse(text);
}






/* @ts-ignore */
const vscode = acquireVsCodeApi();


let chatHistory= [] ;


function saveState() {
  // vscode.setState(state);
}





// @ts-ignore
function restoreHistory(chatBox) {
  for (const msg of chatHistory) {
    const wrapper = document.createElement('message');

    if (msg.sender === 'user') {
      wrapper.id = 'user';
      wrapper.innerHTML = `
        <userHeader id="message-header">You:</userHeader>
        <userMessage class="content">
          ${formatMessage(msg.text)}
        </userMessage>
      `;
    } else { // bot
      wrapper.id = 'bot';
      wrapper.innerHTML = `
        <botHeader id="message-header">Assistant:</botHeader>
        <botMessage id="${msg.id}" class="content message-content">
          ${formatMessage(msg.text)}
        </botMessage>
      `;
    }

    chatBox.appendChild(wrapper);
  }

  chatBox.querySelectorAll('pre code').forEach(block => {
    /* @ts-ignore */
    hljs.highlightElement(block);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}



let currnetMode =["default"];

window.onload = () => {

  console.log('Webview loaded, initializing chat UI…');

  const input   = document.getElementById('input');
  const chatBox = document.getElementById('chatArea');
  const sendBtn = document.getElementById('button');
  const loading = document.getElementById('load');
  const ragInfo = document.getElementById('inputArea');
  const currentFile = document.getElementById('checkbox');
  const commands = document.getElementById('commands');
  const commandList = document.querySelectorAll('#cmd');

  


         
  var flowButton = document.querySelectorAll(".flow_Download")
  console.log("List of all Flow buttons",flowButton);

  


  window.addEventListener('click', e => {
    // @ts-ignore
    console.log(e.target.className)

    // @ts-ignore
    console.log(e.target.className =="flow_Download")
    // @ts-ignore
    if(e.target.className =="flow_Download"){
      console.log(flowButton)
      // @ts-ignore
      const element=document.getElementById(`mermaid-${e.target.id}`)  //mermaid-${e.target.id}

      const scaleMultiple =1.5
      const width = element.scrollWidth * scaleMultiple;
      const height = element.scrollHeight * scaleMultiple;
      console.log(element.scrollWidth  , " --- " , element.scrollHeight ," ::: ", width,"x",height )

      
      const options = {
          quality: 0.95,
          backgroundColor: '#ffffff',
          width: width,
          height: height,
          pixelRatio: scaleMultiple,
          style: {
              transform: `scale(${scaleMultiple})`,
              transformOrigin: 'top left',
              width: `${element.scrollWidth}px`,
              height: `${element.scrollHeight}px`
          },
          skipFonts: true, // Skip font cause CORS issue
              filter: function(node) {
                  if (node.tagName === 'LINK' && 
                      node.getAttribute('rel') === 'stylesheet' && 
                      node.getAttribute('href') && 
                      node.getAttribute('href').startsWith('http')) {
                      return false;
                  }
                  return true;
              }
      };
      console.log(element)
      setTimeout(() => {
        console.log("Create a download link")

          // @ts-ignore
          htmlToImage.toPng(element, options)
              .then(function(dataUrl) {
                 console.log(" ---------Create a download link")
                  const link = document.createElement('a');
                  link.download = `Workspace Flow.png`;
                  link.href = dataUrl;
                  link.click();
                  console.log("----------Image downloaded successfully!");
                
              })
              .catch(function(error) {
                  console.error('Error generating image:', error);
                  console.log("Image downloaded error!");
              });
      }, 500);
     


    }


   })





















       // ========================================================restore saved chat=============================================

                let CurrentFile="All Files";
              
                if (chatHistory.length) {
                 restoreHistory(chatBox);
                }

         //==========================================================================================================


          sendBtn.addEventListener('click', () => {
            console.log('Send button clicked : ' , CurrentFile );
             flowButton = document.querySelectorAll(".flow_Download")

            sendMessage(input, chatBox, loading ,currentFile,CurrentFile)});
        

          input.addEventListener('input', e => {
             // @ts-ignore
             if (e.target.value.endsWith('/')) {
               commands.style.visibility = 'visible';
             }

              else {
                commands.style.visibility = 'hidden';
              }

              commandList.forEach((cmd) => {
                cmd.addEventListener('click', () => {
                  // @ts-ignore
                  input.value = cmd.textContent;
                  input.focus();
                  commands.style.visibility = 'hidden';
                  currnetMode.push(cmd.textContent);
                }
                );

                 });
          });

          input.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              flowButton = document.querySelectorAll(".flow_Download")

              sendMessage(input, chatBox, loading,currentFile,CurrentFile);
            }
           });        
        
          currentFile.addEventListener("click", () => {
            // @ts-ignore
            console.log("CheckMark CLicked", currentFile.checked);
            // @ts-ignore
            vscode.postMessage({ type: "currentFileStatus", value: currentFile.checked });
           });
        
       //==========================================================================================================



      window.addEventListener('message', event => {
            const msg = event.data;
            console.log('Received message from backend:', msg);

            if (msg.type === 'backendMessage') {  
               if(msg.mode !="/get flow") {
                 console.log("Backend message: Im execute the handleBackendStream function");   
                 currnetMode =["default"];
  
                 handleBackendStream(msg.value, chatBox, loading);
               }
               else{
                  console.log("Backend message: Im execute the mermaidContent function");
                  currnetMode =["default"];
                  mermaidContent(msg.value, chatBox, loading)
                  flowButton = document.querySelectorAll(".flow_Download")

               }
               }
        
            else if (msg.type === "currentFileStatus") {        
                CurrentFile = msg.value;
                console.log("CurrentFile", CurrentFile);
            
              }
        
        
            else if (msg.type ==="IntializeLoading"){
                  ragInfo.style.zIndex = '1';
            
                  ragInfo.innerHTML = `
                               <data>Fetching data , please wait &#128578; </data>
                               <ani>
                                 <loading-bubble class="three" style="background-color: rgb(221,208,28)"></loading-bubble>
                                 <loading-bubble class="one"   style="background-color: rgb(19,114,238)"></loading-bubble>
                                 <loading-bubble class="two"   style="background-color: rgb(39,179,11)"></loading-bubble>
                                 <loading-bubble class="three" style="background-color: red"></loading-bubble>
                               </ani>
                               `;      
              }
        
            else if (msg.type ==="ReRagLoading"){
                  ragInfo.style.zIndex = '1';
            
                  ragInfo.innerHTML = `
                                 <data>&#129528; please wait some modification happen in WorkSpace &#128296;</data>
                                 <ani>
                                   <loading-bubble class="three" style="background-color: rgb(221,208,28)"></loading-bubble>
                                   <loading-bubble class="one"   style="background-color: rgb(19,114,238)"></loading-bubble>
                                   <loading-bubble class="two"   style="background-color: rgb(39,179,11)"></loading-bubble>
                                   <loading-bubble class="three" style="background-color: red"></loading-bubble>
                                 </ani>
                               `;
            
          
              }
            else if (msg.type === 'done') {
                   ragInfo.style.zIndex = '-1';
        
               } 
            else if (msg.type === 'error') {
              ragInfo.innerHTML = `
                          <data>&#128194; Oops, error fetching files </data>
                          <ani>
                            <loading-bubble class="three" style="background-color: rgb(221,208,28)"></loading-bubble>
                            <loading-bubble class="one"   style="background-color: rgb(19,114,238)"></loading-bubble>
                            <loading-bubble class="two"   style="background-color: rgb(39,179,11)"></loading-bubble>
                            <loading-bubble class="three" style="background-color: red"></loading-bubble>
                          </ani>
                        `;
              ragInfo.style.zIndex = '1';
        
            }
       });

   };  // window.onload eND

let currentMessageId = null;
let fullMessage = '';
let currnetFLowId = null;




// =====================================================================================================================





async function sendMessage(input, chatBox, loading, currentFile ,CurrentFile) {
 
  vscode.postMessage({ type: "currentFileStatus", value: currentFile.checked });

   
        const text = input.value.trim();
        if (!text) return;
      
        console.log('Sending user message…');
      
        const userEl = document.createElement('message');
        userEl.id = 'user';
        userEl.innerHTML = ` <userHeader id="message-header">You:</userHeader>
                 <userMessage class="content">${formatMessage(text)}</userMessage>
               `;
        chatBox.appendChild(userEl);

        chatHistory.push({ sender: 'user', text });
        saveState();


        // --------------------------------------------------------------------------------------------------------------------


  loading.style.display = 'block';
  input.value = '';
  input.focus();


  fullMessage = '';

  const botId = 'botMessage-' + Date.now();
  const botFlowId = 'botFlow-' + Date.now();  
  currentMessageId = botId;
  currnetFLowId = botFlowId;




  const botWrapper = document.createElement('message'); 
  botWrapper.id = 'bot';
  if(currnetMode[currnetMode.length - 1] == "/get flow"){

    botWrapper.innerHTML = ` <botHeader id="message-header">Assistant:</botHeader>
    <botMessage id="${botId}" class="content message-content">     </botMessage>
                  
    <button id=${currnetFLowId} class ="flow_Download" >Download</button>

    <flowcontainer>
             <flowWraper  id="mermaid-${currnetFLowId}" class="flowWraper" >
             <flow  id="mermaidflow-${currnetFLowId}" class="mermaid">
             </flow>
              </flowWraper>
    </flowcontainer>
   
`;
  } else{
    botWrapper.innerHTML = ` <botHeader id="message-header">Assistant:</botHeader>
        <botMessage id="${botId}" class="content message-content"></botMessage>
  `;
  }

   if(currentFile!=="" && currentFile.checked){
    botWrapper.innerHTML += ` <Response class="currentFile" style="font-size : 10px ; ; padding : 12px 12px" >Current response based on : <mark style ="background-color:  rgb(27, 27, 27);  font-weight: bold ; background-color:  rgb(207, 204, 14) ; font-size : 10px ; padding : 1px 1px" > ${CurrentFile} </mark></Response>`;
    }
    if(currentFile!=="" && !currentFile.checked){
      botWrapper.innerHTML += ` <Response class="currentFile" style="font-size : 10px ; ; padding : 12px 12px" >Current response based on : <mark style ="background-color:  rgb(27, 27, 27);  font-weight: bold ; background-color:  rgb(207, 204, 14) ; font-size : 10px ; padding : 1px 1px" > ${"All files"} </mark></Response>`;
      }

  chatBox.appendChild(botWrapper);

  chatHistory.push({ sender: 'bot', text: '', id: botId });
  saveState();

  chatBox.scrollTop = chatBox.scrollHeight;






//---------------------------------------------------------------------------------------------------------------------

  vscode.postMessage({ 
    type: 'getdata', 
    value: text ,
    mode: currnetMode[currnetMode.length - 1],
  
  });
}


function mermaidContent(chunk, chatBox, loading){

  if (chunk === 'finished') {
    loading.style.display = 'none';
    chatBox.innerHTML+=`<hr>`
  
     saveState();
     return;
    }
      if (fullMessage === '') {
        loading.style.display = 'none';
      }
         
      fullMessage += chunk;
      const botMsgEl = document.getElementById(`mermaidflow-${currnetFLowId}`);
      if (!botMsgEl) {
        console.log("No botMsgEl found");
        return};  
        console.log("Modified String", fullMessage);
      if(fullMessage.includes("```mermaid") && fullMessage.includes("```")) {
        fullMessage = fullMessage.replace(/```mermaid/g, '');
        fullMessage = fullMessage.replace(/```/g, '');
        botMsgEl.innerHTML = fullMessage;    

      }
      else{
      botMsgEl.innerHTML = fullMessage;   
    } 
      // @ts-ignore
      mermaid.init();

       
      
      chatBox.scrollTop = chatBox.scrollHeight;

}


function handleBackendStream(chunk, chatBox, loading) {
  if (chunk === 'finished') {
    loading.style.display = 'none';
    chatBox.innerHTML+=`<hr>`
  
     saveState();
     return;
    }




  if (fullMessage === '') {
    loading.style.display = 'none';
  }



  fullMessage += chunk;
  const botMsgEl = document.getElementById(currentMessageId);
  if (!botMsgEl) return;




  botMsgEl.innerHTML = formatMessage(fullMessage);
  botMsgEl.querySelectorAll('pre code').forEach(block => {
    /* @ts-ignore */
    hljs.highlightElement(block);
  });



  chatBox.scrollTop = chatBox.scrollHeight;

  const entry = chatHistory.find(e => e.id === currentMessageId);
  if (entry) {
    entry.text = fullMessage;
  }
}
