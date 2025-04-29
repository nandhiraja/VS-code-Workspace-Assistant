const fs = require('fs');
const path = require('path')


const {embedd , delete_id} = require("./Emberding")

const Parser = require('tree-sitter');
const JavaScript = require("tree-sitter-javascript");
const  programLanguage =require('./Rag-Languages')
const Python = require('tree-sitter-python')
const Html = require('tree-sitter-html')
 


//================================================================================================================================
                                             


const parser_js = new Parser();
const parser_py = new Parser();
const parser_html= new Parser();


// @ts-ignore
parser_js.setLanguage(JavaScript); 
// @ts-ignore
parser_py.setLanguage(Python); 
// @ts-ignore
parser_html.setLanguage(Html);




//=============================================================================================================================
//=============================================================================================================================




const get_chunks = async (data, tree, fileName, url, parse_language, p_language ,isModifiedFile=false) => {

  for (const Treesitter_node of parse_language) {
      const deorder = tree.rootNode.descendantsOfType(Treesitter_node.node_name);
      let type_data = "";

      const ids = `${fileName}_${Treesitter_node.node_name}`;
      if(isModifiedFile){

        console.log("Is modified True  :  ",ids);

        const deleteId = await delete_id(ids);
        console.log("The delete id is : ", ids);

      }

      for (const range of deorder) {
          const content = data.slice(range.startIndex, range.endIndex);
          type_data += `\n\n ${content}`;
      }

      if (type_data !== "") {
          if (p_language == "html") {
             // console.log("Html data  : ", type_data);
          }

          const docData = `
          {
              metaData : {
                          "type": ${Treesitter_node.node_name},
                          "File name": ${fileName},
                          "file_path": ${url},
                          "language": ${p_language},
                        }
              "code": It contain ## ${Treesitter_node.node_name} from the file name : ${fileName} in language of '''${p_language}  code:\n ${type_data} 
          }
          `;

          console.log(ids);
          await embedd(docData, ids);
      } else {
          if (p_language == "html") {
              console.log("Html data is empty");
          }
          console.log("Empty contents", Treesitter_node.node_name, "file name", fileName);
      }
  }

  return true;
};






//=============================================================================================================================
//=============================================================================================================================






//================================================================================================================================
//                                                   RAG Function                    
//================================================================================================================================

async function RagFile(url){


     try { 
  
        const files = fs.readdirSync(url ,{withFileTypes :true});
      
        console.log("\n\nThe Backend recived the Url , now the process beging\n  :    " , url)
        const one  = await embedd(`current working directory vscode workspace is  : ${url}`, 1);
        const two  = await embedd(`you are the help assitent to help user quiries `, 2);
      
        // console.log("First call done : ", one , two )
        
      
      
        var  count =0;
      
            
       
        for (const file of files) {
          if (file.isFile()) {
              const check = path.extname(file.name);
      
              if (check == ".js") {
                  const file_data = fs.readFileSync(`${url}/${file.name}`, 'utf8');
                  const tree_js = parser_js.parse(file_data);
                  await get_chunks(file_data, tree_js, file.name, url, programLanguage.modules.jsChunkDescriptions, "javascript");
              }
      
              else if (check == ".py") {
                  const file_data = fs.readFileSync(`${url}/${file.name}`, 'utf8');
                  const tree_py = parser_py.parse(file_data);
                  await get_chunks(file_data, tree_py, file.name, url, programLanguage.modules.pythonChunkDescriptions, "python");
              }
      
              else if (check == ".html") {
                  const file_data = fs.readFileSync(`${url}/${file.name}`, 'utf8');
                  const tree_html = parser_html.parse(file_data);
                  await get_chunks(file_data, tree_html, file.name, url, programLanguage.modules.htmlChunkDescriptions, "html");
              }
          }
      
          else if (file.isDirectory() && file.name === "src") {
              await RagFile(`${url}/${file.name}`);
          }
      }
    return true;
                               
                             
    

          

      }  

     catch (err) 
        {
         console.log('Error:', err);
         return "Error"
      } 
     
}


//================================================================================================================================
//                                                  Modified RAG Function                    
//================================================================================================================================




async function ModifiedFileRag(files){
   try{

    for(let Uri of files){

        let check = path.extname(Uri);
        let file_name = path.basename(Uri);
        console.log("The file name is : ", file_name);
        console.log("The file extension is : ", check);

      
              if (check == ".js") {
                  const file_data = fs.readFileSync(Uri, 'utf8');
                  const tree_js = parser_js.parse(file_data);
                  await get_chunks(file_data, tree_js, file_name, Uri, programLanguage.modules.jsChunkDescriptions, "javascript", true);
              }
      
              else if (check == ".py") {
                  const file_data = fs.readFileSync(Uri, 'utf8');
                  const tree_py = parser_py.parse(file_data);
                  await get_chunks(file_data, tree_py, file_name, Uri, programLanguage.modules.pythonChunkDescriptions, "python", true);
              }
      
              else if (check == ".html") {
                  const file_data = fs.readFileSync(Uri, 'utf8');
                  const tree_html = parser_html.parse(file_data);
                  await get_chunks(file_data, tree_html, file_name, Uri, programLanguage.modules.htmlChunkDescriptions, "html", true);
              }
          
      



    }
    return true;
}
catch(err){
    console.log("Error in the file name : ", err);
    return false;
}
}


//================================================================================================================================
//                                                  Function call                    
//================================================================================================================================
// (async () => {
//     const getresponse = await  getAns("What this server js function module are there?")
//     console.log('------------------------------------------------------------------')
//     console.log(getresponse)
//     console.log('------------------------------------------------------------------')


// });





// getroot("./src");









//================================================================================================================================
//                                                  Exporting the function                    
//================================================================================================================================



module.exports = {
           RagFile,
           ModifiedFileRag
            
        }


































