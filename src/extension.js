
const vscode = require("vscode");
const path = require("path");
const { getAns ,del_collection } =require('./Embedding');
const chokidar = require('chokidar');
const {ollama_response ,ollama_flow_response} = require('./LLM _Response')
const  backend = require("./RAG_process.js");






//=============================================================================================================================
//=============================================================================================================================





function activate(context) {


    vscode.window.registerWebviewViewProvider("Code_Assitent",{
      resolveWebviewView(webviewView) { 

        webviewView.webview.options = {
          enableScripts: true,       
          
           };




 
        console.log("\n  ~~~~~~~~~~~~~~~~~~~~~~~~~~:::::::::  Page get IntializeD :::::::::::~~~~~~~~~~~~~~~~~~~~~~~~~~~~ \n");
   
        const scriptPath = vscode.Uri.file(path.join(context.extensionPath, "src", "FrontEnd_UI.js"));
        const scriptUri = webviewView.webview.asWebviewUri(scriptPath);


        webviewView.webview.html = getWebviewContent(scriptUri);

        //------------------------------------------------ :::: START :::  Folder process and operation Related to that ------------------------------------------------

        try{ 
              const currendir = vscode.workspace.workspaceFolders
              const folderPath = currendir[0].uri.fsPath;   

      
              if(folderPath!=undefined && folderPath !=''  && folderPath!=null){
      
      
                    (async() =>{
                      console.log("Process Begin message send to Script")
        
                       webviewView.webview.postMessage({
                       type: "IntializeLoading",

                        })
                      const result =await backend.RagFile(folderPath)   //   =================== Path passing to backend ==================
                      console.log("The message came from the RAG part is : ", result)
                    
                      if (result){
                           console.log("Process Done message send to Script")
                             webviewView.webview.postMessage({
                             type: "done",
                           })
          
                        }
          
                     if (result=="Error"){
                           webviewView.webview.postMessage({
                           type: "error",
                            })
          
                        }
          
                     })();     
  
                     //----------------------------------------------------------------------------------------------------------------
                     //                                     Re-Rag opration
                     //---------------------------------------------------------------------------------------------------------------
      
    
    
    
                 let modification_count = [];
    
                 function RagAfterModification(count){
                  console.log("The file is modified list: ",modification_count.length);
                     if(modification_count.length>4){
                    //  modification_count=0 ;   
                     console.log("The file is modified more than 4 times");
    
                     (async() =>{
                          console.log("---------------------Re-Rag Started--------------------------")
           
                          webviewView.webview.postMessage({
                          type: "ReRagLoading",
                             })
                          
                          const result =await backend.ModifiedFileRag(new Set(modification_count))   //=================== Path passing to backend ==================

                       
                              if (result){
                                console.log("-------------------Re-Rag-Finished-----------------------")
                                 webviewView.webview.postMessage({
                                     type: "done",
                                   })                     
                               }
                     
                              if (result==false){
                                webviewView.webview.postMessage({
                                  type: "error",
                                  })       
                               }
          
                      })();
                    }
                  }

                  //----------------------------------------------------------------------------------------------------------------
                  //                                          Watch the file
                  //----------------------------------------------------------------------------------------------------------------
    
                 
                 const watcher = chokidar.watch(folderPath, {
                   persistent: true,
                   ignoreInitial: true,
                   });
                 
                 watcher
                   .on('add' ,path =>    {     RagAfterModification(modification_count.push(path)) ;   console.log(` File added: ${path}`)})
                   .on('change', path => {   RagAfterModification(modification_count.push(path)) ; console.log(` File changed : ${path}`)})
                   .on('unlink', path => {   RagAfterModification(modification_count.push(path)) ; console.log(` File Removed: ${path}`)});
                 
 
              }   
      
              else {
                   console.log("THERE IS Undefine message")
                   webviewView.webview.postMessage({
                      type: "error",
                    })
             }
        }
   
        catch(err){
           console.error("There is no file found : ",err)
           webviewView.webview.postMessage({
             type: "error",
              })
         }
         
        //==============================================  << END >>  Folder process and operation Related to that ==================================================



        //---------------------------------------------- :::: START :::   Current File ACECESS and related process ------------------------------------------------
      
        let CurrentFileAcess =false ;   
            

          vscode.window.onDidChangeActiveTextEditor(editor => { 
            console.log("Update automate  : --> The active editor is : ",editor);
            if (editor) {
              const filePath = editor.document.fileName;
              const fileName = path.basename(filePath);
              console.log(`Update automate  : --> Active file: ${fileName}`);
              webviewView.webview.postMessage({
                type: "currentFileStatus",
                value : fileName   
                })
  
            }
          }
          );



        


         //============================================== << END >> Current File ACECESS and related process   ==================================================



         //------------------------------------------------ :::: START :::  Frontend and Backend communication ------------------------------------------------



        webviewView.webview.onDidReceiveMessage(
          async message => {
            console.log("~~~~ >>> ~~~~~~~ >>> ~~~~~~~~~>>> ~~~ >>>  \n\n The message from the frontend is : ",message ,"\n\n~~~~ >>> ~~~~~~~ >>> ~~~~~~~~~>>> ~~~ >>>  \n\n");

           if(message.type == "currentFileStatus" ){
            CurrentFileAcess = message.value;
            console.log("The current file is : ",CurrentFileAcess);
           

                if(message.type =="currentFileStatus" && message.value ==true){
     
                  console.log("The CHECKBOX is checked");
     
                  const editor= vscode.window.activeTextEditor;
                   console.log("The active editor is : ",editor);
                   if (editor) {
                     const filePath = editor.document.fileName;
                     const fileName = path.basename(filePath);
                     console.log(`Active file: ${fileName}`);
                     // console.log(`Active file content :\n\n ${editor.document.getText()}`);
                      webviewView.webview.postMessage({
                      type: "currentFileStatus",
                      value : fileName   
                    })
                   }                 
                
                }
                else if(message.type =="currentFileStatus" && message.value ==false){
                  console.log("The CHECKBOX is unchecked");
                  webviewView.webview.postMessage({
                    type: "currentFileStatus",
                    value : "All files"   
                  })
                }
          }
        
          else if(message.type == "getdata" && message.mode =="/get flow"){



            if(CurrentFileAcess ==false){
              const rag_data = await getAns(message.value);
              const data = JSON.stringify( rag_data.map(r => r.chunk+`
  
                ----------------------------------------------- End of file ------------------------------------------------------
  
                `.toString()))
             
              const val =  await ollama_flow_response(message.value ,data ,CurrentFileAcess,message.mode);

            
                  webviewView.webview.postMessage({
                      type: "backendMessage",
                      value : val,
                      mode : message.mode
                  })
              
                }

            
           

      //--------------------------------------------------------------------------------------------------------------------------------     
           else if(CurrentFileAcess ==true){

              const editor= vscode.window.activeTextEditor;
              if (editor) {
                 const filePath = editor.document.fileName;
                 const fileName = path.basename(filePath);
                 console.log(`Active file: ${fileName}`);
                 let LLM_data  = editor.document.getText();

                 webviewView.webview.postMessage({
                 type: "currentFileStatus",
                 value : fileName   
                 })



               const val = await ollama_flow_response(message.value ,LLM_data.replace(/^\s+|\s+$/gm, ''),CurrentFileAcess,message.mode);
              
            
                   
  
                  webviewView.webview.postMessage({
                      type: "backendMessage",
                      value : val,
                      mode : message.mode
                  })

              }
           }
          }
         else{
              //---------------------------------------------------------------------------------------------------------------------------------


               if(CurrentFileAcess ==false){
               const rag_data = await getAns(message.value);
               const data = JSON.stringify( rag_data.map(r => r.chunk+`
   
                 ----------------------------------------------- End of file ------------------------------------------------------
   
                 `.toString()))
              
               // console.log(  "This is the data get from the backend  :  \n\n" ,data );
               const val =  ollama_response(message.value ,data ,CurrentFileAcess,message.mode);

               while(true){
                  
                const { value , done } = await val.next();
               if(message.type =="getdata" && message.mode !="get flow"){
   
   
                    if(done) {
                       webviewView.webview.postMessage({
                           type: "backendMessage",
                           value : 'finished',
                           mode : message.mode

                       })
                       break ;
                    }
   
                   webviewView.webview.postMessage({
                       type: "backendMessage",
                       value : value,
                       mode : message.mode
                   })
               
                 }

                 else{

                   if(done) {
                      webviewView.webview.postMessage({
                          type: "backendMessage",
                          value : 'finished',
                          mode : message.mode


                      })
                      break ;
                   }
  
                  webviewView.webview.postMessage({
                      type: "backendMessage",
                      value : value,
                      mode : message.mode
                  })
              
                 }
             }
            }

       //--------------------------------------------------------------------------------------------------------------------------------     
            else if(CurrentFileAcess ==true){

               const editor= vscode.window.activeTextEditor;
               if (editor) {
                  const filePath = editor.document.fileName;
                  const fileName = path.basename(filePath);
                  console.log(`Active file: ${fileName}`);
                  let LLM_data  = editor.document.getText();

                  webviewView.webview.postMessage({
                  type: "currentFileStatus",
                  value : fileName   
                  })



                const val =  ollama_response(message.value ,LLM_data.replace(/^\s+|\s+$/gm, '') ,CurrentFileAcess,message.mode);
               
                while(true){
                   
                  
                const { value , done } = await val.next();
               if(message.type =="getdata" && message.mode !="get flow"){
   
   
                    if(done) {
                       webviewView.webview.postMessage({
                           type: "backendMessage",
                           value : 'finished',             
                           mode : message.mode

                       })
                       break ;
                    }
   
                   webviewView.webview.postMessage({
                       type: "backendMessage",
                       value : value,
                       mode : message.mode
                   })
               
                 }

                 else{
                  
                   if(done) {
                      webviewView.webview.postMessage({
                          type: "backendMessage",
                          value : 'finished',
                          mode : message.mode

                      })
                      break ;
                   }
  
                  webviewView.webview.postMessage({
                      type: "backendMessage",
                      value : value,
                      mode : message.mode
                  })
              
                 }
              }

               }
            }
          }

         });

        //============================================== << END >> Frontend and Backend communication ==========================================================







      }  // End of resolveWebviewView
    
    })  // End of webviewViewProvider   

}  // End of activate function





//=============================================================================================================================
//                                            Front END  UI
//=============================================================================================================================




function getWebviewContent(scriptUri) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat UI</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js"></script>
  <script> mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'linear',
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'linear',
            nodeSpacing: 200,
            rankSpacing: 200,
            padding: 300
        }
    }
});</script>

        <script>hljs.highlightAll();</script>

    </head>

    <style>
        body{
          font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
        font-size: 14px;
       line-height: 1.3;
       letter-spacing: 0.2px;
          display: flex;
          max-height: 90vh;
          /* justify-content: center; */
          align-items: center;
          flex-direction: column;
          /* align-content: center; */
          background-color: rgb(7, 7, 7);

        }


        container {
            margin-top: 50px;
            height: 850px;
            width: 600px;
            background-color: rgb(12, 12, 12);
            display: flex;
            flex-direction: column;
            border-radius: 15px;
           /* box-shadow: 0px 0px 70px rgb(39, 55, 66);*/
        }

        header{
          text-align: center;
          font-size: large;
          font-weight: bolder;
          /* background-color: rgb(30, 98, 199); */
          color: aliceblue;

           padding: 20px 20px;
           border-bottom: 1px solid #bbbbbb;
         /* border-top-right-radius:20px ;
          border-top-left-radius:20px ; */

        }
        chatArea{
          background-color: rgb(14, 13, 13);
          flex-grow: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 0 10px;
        }
        message{
          display: flex;
          flex-direction: column;
          padding: 20px 20px;
          
        }

        #bot{
          display: flex;
          color: aliceblue; 
          align-self: flex-start;
          max-width: 90%;

        }

         
        #user{
          display: flex;
          color: rgb(246, 248, 250); 
          align-self: flex-end;
          max-width: 60%;
          background-color: rgb(26, 25, 25);
          border-radius: 30px;
          padding: 10px 30px;
          border-bottom-right-radius: 3px;
          
        }

        botHeader{
            color: rgb(7, 168, 56);
            font-size: 15px;
            font-weight: bolder;
        }   
        
        userHeader{
            color: rgb(233, 230, 44);
            font-size: 15px;
            font-weight: bolder;
       }     

        .content{
           padding: 7px 10px;
        }
      
        botMessage{

        }

        userMessage{

        }

        inputArea{         
          display: flex;
          flex-direction: row;
          padding: 10px 10px;
          border-bottom-left-radius: 20px;
          border-bottom-right-radius: 20px;
        }

        input{
          width:87%;
          background: transparent;
          padding: 10px 10px;
          border-radius: 4px;
          border: 1px solid rgb(87, 87, 88);
          color: rgb(240, 248, 255);
         /* outline: none;*/        
           
        }
       input:focus{
          background-color: rgb(12, 12, 12);
          outline-color : rgb(185, 34, 14) ;
          z-index: 1;
        }
           #inputArea{
          position: absolute; 
          align-items: center;
          background-color: rgb(12, 12, 12);     
          height: 50px;
          width: 530px;
          margin-top: 0px; 
          z-index: -1;
          display: flex;
          flex-direction: column;
          row-gap: 5px;
          display: flex;
        }

        ani {
        padding: 10px 10px;
        display :flex 
        }

        input::placeholder{
          color : rgb(245, 247, 248)
        }


        button{
          margin-top: 4px;
          margin-left: 10px;
           height: 35px;
           width: 35px;
           border-radius: 50%;
           padding: 1px 1px;
           background-color: rgb(240, 240, 243);
           /* box-shadow: 0 0 10px 0 white; */
           color: rgb(33, 34, 34);
           font-weight: bolder;
           font-size: 19px;
           cursor: pointer;

        }

        button:hover{
          background-color: rgb(212, 63, 17);
          color: aliceblue;
        }

        animate{

          /* align-self: flex-start; */
          display: none;
          position: sticky;
          z-index: 1;
          background-color: rgb(24, 24, 26);
          /* background: transparent; */



        }

         load {
          background-color: rgb(32, 32, 32);          
          padding: 15px 15px;
          border-radius: 30px;
          border-bottom-left-radius: 5px;
          align-self: flex-start;
          margin-bottom: 10px;
          margin-left: 20px;
          display: flex;
          max-width: 40px;
          gap: 2px;

        }
        loading-bubble {
           height: 9px;
           width: 9px;
          /* background-color: rgb(12, 86, 224);*/
           justify-items: space-around;
           border-radius: 50%;
           padding: 2px , 2px;
           animation: loading 1.3s ease-in-out infinite;
        }


        dash{
            color: rgb(48, 47, 47);
           }

         h1{
            display: flex;
            justify-content: center;
            color: aliceblue;
          }
      
        
       .input:focus ~ .inputArea {
         border:  2px solid rgb(14, 88, 185) ;
         z-index: 1;
            }


        ::-webkit-scrollbar{
         background-color: rgb(38, 39, 39);
         width: 0.1px;
            }


        @keyframes loading {
    
          0% ,100% { transform: translateY(0); }
          50% {
            opacity: .2; 
            transform: translateY(-3px); 
          } 
          100% {
            opacity: .7;
            transform: translateY(0);
          }
          }




           .message-content p {
      margin-bottom: 12px;
    }
    
    .message-content p:last-child {
      margin-bottom: 0;
    }
    
    .message-content h1 
    {
      margin-top: 14px;
      margin-bottom: 8px;
      color:rgb(47, 122, 207);
    }
    .message-content h2 
    {
      margin-top: 10px;
      margin-bottom: 8px;
      color:rgb(226, 215, 110);
    }
    .message-content h3 
    {
      margin-top: 8px;
      margin-bottom: 8px;
      color:rgb(16, 187, 116);
    }
    
    .message-content ul, 
    .message-content ol {
      margin-left: 3px;
      margin-bottom: 6px;
    }
    
    .message-content blockquote {
      border-left: 3px solid rgb(43, 175, 98);
      padding-left: 12px;
      margin: 12px 0;
      color: #bbbbbb;
    }
    
    .message-content a {
      color:rgb(36, 198, 219);
      text-decoration: none;
    }
    hr{
      width: 570px;
      border: .002em solid rgb(49, 49, 49);
      background-color: rgb(121, 118, 118);
    }
    .message-content a:hover {
      text-decoration: underline;
    }
    

       #checkbox{
      width: 10px;
      height: 10px;
    }
 
file{
  padding: 7px 2px; 
  display: flex;
  flex-direction: row;
  justify-content: end;
  margin-right: 10px;     
  border-top: 0.5px solid rgb(161, 157, 157);

}

        pre {
      position: relative;
      background-color: #1a1a1a !important;
      border-radius: 6px;
      padding: 12px 16px;
      margin: 12px 0;
      overflow-x: auto;
    }
    
    code {
      font-family: 'Cascadia Code', 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace;
      font-size: 14px;
      color:rgb(224, 186, 14) !important;
      background-color:rgb(15, 15, 15) !important;
      
    }
    
     commands{
      display: flex;
      position: absolute;
      margin-top: -70px;
      flex-direction: column;
      margin-left: 10px; 
      /* max-width: 30%;     */
      row-gap: 3px;
      background-color: black;
      border: 0.5px solid rgb(161, 157, 157);
      visibility: hidden;
    }

    #cmd{
      padding: 5px 10px;
      background-color: rgb(7, 7, 7) ;
      color: rgb(235, 240, 235) ;
      display: flex;
      cursor: pointer;
      font-weight: 600;     

    }
   #cmd:hover{
      background-color: rgb(245, 241, 241) ;
      color: rgb(15, 15, 15) ;
      cursor: pointer;
    }


      flowcontainer{
      width: 400px;
            height: 300px;
            border: 2px solid #333;
            overflow: auto; /* Enables scrolling */
            background-color: #0f0f0f;
            padding: 10px;
    }
            
    flowWraper{
      min-width: 100%;
      display: inline-block; 
  
    }


    </style>
    <body>
    
        <!-- <h2 style="color: azure;">Chat Assistant</h2> -->
        <!-- <h1>Hai this is the chat page from Mr.Nandhiraja K Extention. You can chat Now .</h1> -->

<!--===================================================================================== -->


        <container id="chat-container">
 <!--==================================================================================== -->


        <header id="chat-header"> Code Assistent </header>


 <!--===================================================================================== -->

        <chatArea id="chatArea">
            <message id="bot" >
              <botHeader id="message-header">Assistent : </botHeader>
              <botMessage id="botMessage" class="content" >Hi, How can I Assist you ?    </botMessage>         </botMessage>

              
                             
              
              
              
            </message>
          <hr>
         <!-- <message id="user" >
              <userHeader id="message-header">Asistent : </userHeader>
              <userMessage id="userMessage" class="content" >Hai how can i Assist you</userMessage>
            </message>
<message id="bot" >
              <botHeader id="message-header">Asistent : </botHeader>
              <botMessage id="botMessage" class="content" >Hai how can i Assist you</botMessage>
            </message> 
            <dash>----------------------------------------------------------------------------------------------------------</dash>
            <message id="user" >
              <userHeader id="message-header">Asistent : </userHeader>
              <userMessage id="userMessage" class="content" >Hai how can i Assist you</userMessage>
            </message>
 <message id="bot" >
  <botHeader id="message-header">Asistent : </botHeader>
  <botMessage id="botMessage" class="content" >Hai how can i Assist you</botMessage>
</message>
<dash>----------------------------------------------------------------------------------------------------------</dash>
<message id="user" >
  <userHeader id="message-header">Asistent : </userHeader>
  <userMessage id="userMessage" class="content" >Hai how can i Assist you</userMessage>
</message>

<message id="bot" >
  <botHeader id="message-header">Asistent : </botHeader>
  <botMessage id="botMessage" class="content message-content" >Hai how can i Assist you</botMessage>
</message>
<dash>----------------------------------------------------------------------------------------------------------</dash> -->


<!--------------------------------------------------------------------------------------------->




        </chatArea>
   
        <animate  id="load">
        
          <load >
         
            <loading-bubble class="three" style="background-color: rgb(221, 208, 28)"></loading-bubble>
            <loading-bubble class="one" style="background-color: rgb(19, 114, 238)"></loading-bubble>
            <loading-bubble class="two" style="background-color: rgb(39, 179, 11)"></loading-bubble>
            <loading-bubble class="three" style="background-color: red"></loading-bubble>
           </load>
          
        </animate>
<!--===================================================================================== -->
       
   <file>
     <label style="color: rgb(236, 231, 231); font-size : 9px ; cursor: pointer;"  for="checkbox">Answer from current file</label>
     <input id="checkbox" type="checkbox" ></input>
   </file> 
<!--===================================================================================== -->
         <inputArea > 
          <commands id ="commands"> 
            <li id="cmd">/get flow</li>
             <li id="cmd">/get summary</li>
  
      </commands>  
        <RAG id="inputArea"></RAG>

        <input id="input" class="input" type="text" placeholder="Ask Query...!"></input>
        <button id="button" onclick=send()>&#10148;</button>
        </inputArea>
     
<!--===================================================================================== -->

        </container>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}









function deactivate() {

    console.log("the extension is deactivated");
     del_collection()


}






//=============================================================================================================================
//                                            Export modules
//=============================================================================================================================



module.exports = {
    activate,
    deactivate
};






