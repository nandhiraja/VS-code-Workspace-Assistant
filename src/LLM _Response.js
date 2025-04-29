
const { default: ollama } = require('ollama');
const { GoogleGenAI }= require( "@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyDKUpuq9tyeTV7Ei7cJGhs8euA20UBKcnc" });

var history_query_answer = {
  "user": "",
  "bot": ""
}
var history = []
async function main() {
        const response = await ai.models.generateContentStream({
          model: "gemini-2.0-flash",
          contents: "Explain how AI works",
          config: {
            systemInstruction: "You are a cat. Your name is Neko.",
          },
        });
      
        for await (const chunk of response) {
          console.log(chunk.text);
        }
      }
      


async function ollama_flow_response(query, relate_data, CurrentFileAcess, currnetMode) {
  console.log("Generating....!! Please Wait  : Get FLow Mode");

  
  console.log("Here is the data  : ",relate_data)
 
        

         const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Related data context: ${relate_data} \n\n User Query: ${query.slice(9, query.length)}`,
          config: {
            systemInstruction: `Task: Generate a valid Mermaid flowchart ('graph TD' or 'graph LR') with inline node styles based on the workflow described in the 'Query' and 'Code Context'. 
                               Follow the structure and styling method demonstrated in the provided examples (1 and 2). 
                               Ensure correct Mermaid syntax for nodes, connections, and inline 'style' attributes (fill, stroke, stroke-width). 
                               Output ONLY the Mermaid code string. **Important** - The  label  or promt  are must  be inside  " " -  quotes enclose with double quotes eg :[" hai('hello')"]  Inside double use single quotes`,
          },
        });




    console.log(response.text);
    return response.text;




}
//=====================================================================================================================================================================

//                                                                   LLM RESPONSE

//                                       / GET SUMMARY         CURRENT FILE SUMMARY        All file Summary(RAG)     
//=====================================================================================================================================================================


async function* ollama_response(query, relate_data, CurrentFileAcess, currnetMode) {


    console.log("The Currnet mode is : ", currnetMode)

    history_query_answer = {
        "user": query,
        "bot": ""
    }

    const isgeneralQuery = ["hai", "Hi", "how are you", "good", "Hai", "Good",
                           "Time", "time", , "previous", "goodmorning", "morning ", "afternoon",
                           "time", "afternoon", "hey", "thanks", "thankyou", "thank"]
    
    
    let isgeneral = false;
    isgeneralQuery.forEach(val => {
        if (query.includes(val)) {
            isgeneral = true;
        }
      })


    console.log("\n\nClassify the Message....!!     General message or not  : ", isgeneral);




   //=====================================================================================================================================================================


     if (currnetMode == "/get summary") {

      console.log("Generating....!! Please Wait  : Get Summary Mode");

     

                const response = await ai.models.generateContentStream({
                        model: "gemini-2.0-flash",
                        contents: `Related data context: ${relate_data} \n\n User Query: ${query}`,
                        config: {
                          systemInstruction:  `Task: Based on the user query and provided context (including the last two turns of conversation), generate a concise summary of the code or information. Act as a highly intelligent and focused code summary assistant within a VS Code environment. 
                                               last 2  convo history : ${JSON.stringify(history)} \n\n
                                                `,
                        },
                      });
                    
                   
                   let chunks = [];
            
                   for await (const chunk of response) {
            
            
                     const content = chunk.text || '';
                     history_query_answer.bot += content;
            
                     // yield chunk.message.content || '';
                     chunks.push(content);
                     if (chunks.length == 2) {
                         yield chunks.join("");
                         chunks = [];
                     }
                     }
                   yield chunks;

      // const response = await ollama.chat({

      //     model: 'llama3.2:latest',  //qwen2.5:0.5b     llama3.2:latest   qwen2.5-coder:7b
      //     stream: true,
      //     messages: [
      //       { role: 'user', content: Generalprompt }
      //       ]
      // });
   
      // let chunks = [];
      // for await (const chunk of response) {

      //     const content = chunk.message.content || '';
      //     history_query_answer.bot += content;
      //     process.stdout.write(content);

      //     // yield chunk.message.content || '';

      //     chunks.push(content);
      //     if (chunks.length == 2) {
      //         yield chunks.join("");
      //         chunks = [];
      //     }
      // }

      // yield chunks;
      // console.log("The response is : ", response[0].message.content)
      // yield response[0].message.content;
      console.log("Generation Done, Message Printed.. Summary Generation message.")




//==================================================================  General message LLM  ============================================================================

//=====================================================================================================================================================================

  }
    else if (isgeneral) {
        console.log("Generating....!! Please Wait  : General Mode");

        const Generalprompt = `
                                  You are a polite and professional **code assistant** working inside a VSCode environment.
                                   ### system Instruction.
                                   **Your Role:**
                                   - Respond kindly to general, casual queries such as greetings or polite small talk. (only general "ENGLISH")
                                   - Always be friendly, brief, and respectful.
                                   - Greet the user based on the current time of day (morning, afternoon, evening). today date time is (${new Date()}) get essential details
                                   - If the query is **not a greeting or small talk**, respond with:
                                     > "I'm here to help with code-related tasks. Could you please clarify your question?"
                                   
                                   **Current Date and Time**: ${new Date()}  
                                   (Use this if needed for time-based greetings.)
                                   
                                   ---
                                   
                                   
                                   Assistant Response:`
            ;


           const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: `last 2 convo history : ${JSON.stringify(history)} \n\n Related data context: ${relate_data} \n\n User Query: ${query}`,
            config: {
              systemInstruction: `Task: As a polite and professional code assistant in VS Code, respond to the user. If the query is a general greeting or small talk, offer a kind, brief, and respectful response, including a time-based greeting (morning, afternoon, evening) using the current date and time:[ only for  your referance${new Date()}(tell time date if need )]. If the query is code-related, respond with: "I'm here to help with code-related tasks. Could you please clarify your question?"`,
              
            },
          });
        
       
       let chunks = [];

       for await (const chunk of response) {


         const content = chunk.text || '';
         history_query_answer.bot += content;

         // yield chunk.message.content || '';
         chunks.push(content);
         if (chunks.length == 2) {
             yield chunks.join("");
             chunks = [];
         }
         }
       yield chunks;

        // const response = await ollama.chat({
        //     model: 'llama3.2:1b',  //qwen2.5:0.5b     llama3.2:latest   qwen2.5-coder:7b
        //     stream: true,
        //     messages: [{ role: 'user', content: Generalprompt }]
        // });
        // let chunks = [];

        // for await (const chunk of response) {

        //     const content = chunk.message.content || '';
        //     history_query_answer.bot += content;

        //     // yield chunk.message.content || '';

        //     chunks.push(content);
        //     if (chunks.length == 2) {
        //         yield chunks.join("");
        //         chunks = [];
        //     }
        // }

        // yield chunks;
        console.log("Generation Done, Message Printed.. General message.")

    }







//==================================================================  Rag message LLM  ============================================================================

//=================================================================================================================================================================  









    else if (CurrentFileAcess == false) {
        console.log("Generating....!! Please Wait  : code Mode");

        const RagPrompt = `
                                    You are a highly intelligent and focused **code assistant** integrated into a VS Code environment. You have current workspace datas
                                    You are backed by a Retrieval-Augmented Generation (RAG) system that provides up to 5 files as context.  1st file is the most relevant one.
                                    Your task is to analyze the provided files and generate the most relevant and accurate response based on the query.
                                
                                    ### **Your Behavior:**
                                    1. **Code Assistance:**
                                       - Carefully analyze the provided files and identify the most relevant file or snippet based on the query.
                                       - Use only the content from the most relevant file to generate your response.
                                       - If the query is unclear or unrelated to the provided files, politely ask for clarification or state:
                                         > "I couldn’t find anything directly related to that in the provided files. Could you clarify your question?"
                                
                                    2. **General Queries:**
                                       - Respond kindly to casual or polite queries like greetings or small talk.
                                       - Greet the user based on the current time of day (morning, afternoon, evening).
                                       - If the query is unrelated to code, respond with:
                                         > "I'm here to help with code-related tasks. Could you please clarify your question?"
                                
                                    3. **Context Awareness:**
                                       - Use the provided workspace context (e.g., code snippets, file paths, or project details) to generate responses.
                                       - Avoid inventing or adding code that isn’t in the provided context unless explicitly requested.
                                       - If multiple files seem relevant, prioritize the one with the closest match to the query.
                                
                                    4. **Professional Tone:**
                                       - Be polite, respectful, and professional in all interactions.
                                       - Avoid unnecessary verbosity; keep responses focused and actionable.
                                
                                    ### **Response Template:**
                                    - **For Code Queries:**
                                      > "Here’s what I found based on your query: [Explanation or Code Snippet code area]. **Give code in proper format**"
                                      > (Provide the exact code snippet or a brief explanation based solely on the most relevant file.)
                                
                                    - **For General Queries:**
                                      > "Good [morning/afternoon/evening]! How can I assist you today?"
                                      > (Respond kindly to greetings or small talk.)
                                
                                    - **For Unclear Queries:**
                                      > ## befor proceding check :  Analysis the Query and give Data , there is any matching  or answerable or not  
                                         -  if "not"  then  >  "I couldn’t find anything directly related to that in the provided files. Could you clarify your question?"
                                
                                  
                                   ## **Each file chunk end with "----end of file----"** use that to identify the end of each file.

                                   ## check the pervoius history of in case for query:
                               
                                    ### **Previous History (last 3 conversations):**
                                    ${JSON.stringify(history)}
                                
                                    
                                    ### **Answer: **
                                `;

                                // ### **Internal Reasoning (hidden from the user):**
                                // 1. Classify the query: code-related / general / unclear.
                                // 2. Analyze the provided files and identify the most relevant file or snippet based on the query.
                                // 3. Decide: Is the query answerable using the identified file? If yes, generate a response. If no, politely refuse or ask for clarification.
                                // 4. Ensure the response is concise, accurate, and based solely on the identified file.
                             
     
                const response = await ai.models.generateContentStream({
                  model: "gemini-2.0-flash",
                  contents: `Related data context: ${relate_data} \n\n User Query: ${query}`,
                  config: {
                    systemInstruction: `You are a helpful code assistant in VS Code. 
                                      Use the provided files to answer the developer's questions about their code. 
                                      If the answer isn't in the files, say you can't find it. \
                                      Be friendly and helpful  last 3 convo history : ${JSON.stringify(history)} `,
                  },
                });
              
             
             let chunks = [];
     
             for await (const chunk of response) {
     
     
               const content = chunk.text || '';
               history_query_answer.bot += content;
     
               // yield chunk.message.content || '';
               chunks.push(content);
               if (chunks.length == 2) {
                   yield chunks.join("");
                   chunks = [];
               }
               }
             yield chunks;
             console.log("Generation Done, Message Printed.. Rag message.")
     
                        
        // const response = await ollama.chat({
        //     model: 'gemma3:4b',  //qwen2.5:0.5b     llama3.2:latest   qwen2.5-coder:7b
        //     stream: true,

        //     messages: [{ role: 'user', content: prompt }]
        // });


        // for await (const chunk of response) {


        //     const content = chunk.message.content || '';
        //     history_query_answer.bot += content;

        //     // yield chunk.message.content || '';
        //     chunks.push(content);
        //     if (chunks.length == 2) {
        //         yield chunks.join("");
        //         chunks = [];
        //     }
        // }




    }




//==================================================================  Current file message LLM  ===================================================================

//================================================================================================================================================================= 

    else {

        console.log("Generating....!! Please Wait  : code Currnet File Mode");


        const CurrentFileLLmprompt = `### System Instructions:
                                    You are a highly intelligent and focused **code assistant** integrated into a VS Code environment. 
                                    Your primary role is to assist users with code-related tasks, technical queries, and project-related issues. 
                                    You are backed by a Retrieval-Augmented Generation (RAG) system that provides up to 5 files as context. 
                                    Your task is to analyze the provided files and generate the most relevant and accurate response based on the query.
                          
                              ### **Your Behavior:**
                              1. **Code Assistance:**
                                 - Carefully analyze the provided files and identify the most relevant file or snippet based on the query.
                                 - Use only the content from the most relevant file to generate your response.
                                 - If the query is unclear or unrelated to the provided files, politely ask for clarification or state:
                                   > "I couldn’t find anything directly related to that in the provided files. Could you clarify your question?"
                          
                              2. **General Queries:**
                                 - Respond kindly to casual or polite queries like greetings or small talk.
                                 - Greet the user based on the current time of day (morning, afternoon, evening).
                                 - If the query is unrelated to code, respond with:
                                   > "I'm here to help with code-related tasks. Could you please clarify your question?"
                          
                              3. **Context Awareness:**
                                 - Use the provided workspace context (e.g., code snippets, file paths, or project details) to generate responses.
                                 - Avoid inventing or adding code that isn’t in the provided context unless explicitly requested.
                                 - If multiple files seem relevant, prioritize the one with the closest match to the query.
                          
                              4. **Professional Tone:**
                                 - Be polite, respectful, and professional in all interactions.
                                 - Avoid unnecessary verbosity; keep responses focused and actionable.
                  
                          ### previous history of last 3 conversation : 
                          ${JSON.stringify(history)}
                        
                          
                          ### Assistant Response Template:
                          Answer:
                          
                         
                      `;

                      const response = await ai.models.generateContentStream({
                        model: "gemini-2.0-flash",
                        contents: `Related data context: ${relate_data} \n\n User Query: ${query}`,
                        config: {
                          systemInstruction: "You are a helpful code assistant in VS Code. Use the provided files to answer the developer's questions about their code. If the answer isn't in the files, say you can't find it. Be friendly and helpful",

                        },
                      });
                    
                   
                   let chunks = [];
           
                   for await (const chunk of response) {
           
           
                     const content = chunk.text || '';
                     history_query_answer.bot += content;
           
                     // yield chunk.message.content || '';
                     chunks.push(content);
                     if (chunks.length == 2) {
                         yield chunks.join("");
                         chunks = [];
                     }
                     }
                   yield chunks;

        // const response = await ollama.chat({
        //     model: 'llama3.2:latest',  //qwen2.5:0.5b     llama3.2:latest   qwen2.5-coder:7b
        //     stream: true,

        //     messages: [{role : "System" ,content :CurrentFileLLmprompt },{ role: 'user', content:  `Related data context: ${relate_data} \n\n User Query: ${query}` }]
        // });


        // let chunks = [];
        // for await (const chunk of response) {


        //     const content = chunk.message.content || '';
        //     history_query_answer.bot += content;
        //     chunks.push(content);
        //     if (chunks.length == 2) {
        //         yield chunks.join("");
        //         chunks = [];
        //     }
        // }

        // yield chunks;
        console.log("Generation Done, Message Printed.. Current FIle message.")

    }





    // ================================================ History update ==========================================================      

    history.push(history_query_answer);



    if (history.length >=3) {
        history.shift();
        console.log("New history updated", history.length)
    }


}    //OLLAMA RESPONSE END















module.exports = {
    ollama_response,
    ollama_flow_response
};































// ### System Instructions:
//                              You are a focused **code assistant** in VSCode, backed by Retrieval‑Augmented Generation (RAG).  
//                              -"the data  is in the formate of  json  {
//                                           "type": ,
//                                           "File name": ,
//                                           "file_path": ,
//                                           "language": ,
//                                           "code":  
//                                         }
//                                           each file end  with "----end of file --------"
  
//                                 - From this for output response use "code" property  that have actual from code area.  remaining are all additional properties 
//                           - **Only** answer code‑related queries using exactly **one** snippet from the context below.  
//                           - **Do not** invent or add any code that isn’t in that snippet.  
//                           - **History**  last 3 conversation histoy is add to you  use  when you need.(id user query need)
//                           -   If the query is unclear, non‑code, or no snippet applies, reply:
//                               “I couldn’t find anything related to that in your workspace.”
                          
//                           ### Internal Reasoning (hidden from user):
//                           1. Classify the query: code / unclear / general  
//                           2. Retrieve the single best-matching snippet from the context  
//                           3. Decide: answerable? yes / no  
//                           4. If no, refuse; if yes, extract and explain
                          
  
//                            ### **Example Context:**
//                                     - Up to 5 files are provided in JSON format:
//                                       [
//                                         {
//                                           "type": "file",
//                                           "file_name": "example1.js",
//                                           "file_path": "/src/example1.js",
//                                           "language": "JavaScript",
//                                           "code": "function example1() { console.log('Example 1'); }"
//                                         },
                                              
//                                          "----end of file----".
                                
//                                         {
//                                           "type": "file",
//                                           "file_name": "example2.js",
//                                           "file_path": "/src/example2.js",
//                                           "language": "JavaScript",
//                                           "code": "function example2() { console.log('Example 2'); }"
//                                         }
//                                       ]
//                                       Each file ends with "----end of file----".
                                
//                                     ### **Example Query and Response:**
//                                     - **User Query:** "How do I log a message in JavaScript?"
//                                     - **Assistant Response:** 
//                                       > "Here’s what I found based on your query:  
//                                       > \`\`\`javascript
//                                       > function example1() { console.log('Example 1'); }
//                                       > \`\`\`
//                                       > Use \`console.log()\` to log messages in JavaScript."
  
//                           ### Context:
//                           ${relate_data}
                          
//                           ### previous history of last 3 conversation : 
//                               ${JSON.stringify(history)}
//                           ### User Query:
//                           ${query}
                          
//                           ### Assistant Response Template:
//                           Answer:
//                           (Provide the exact code snippet or a 1–2 sentence explanation based solely on the chosen snippet.)
                          
                         