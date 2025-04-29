
const pythonChunkDescriptions = [
    {
      node_name: "module",
    },
    {
      node_name: "import_statement",
    },
    {
      node_name: "function_definition",
    },
    {
      node_name: "class_definition",
    },    
   
 
  ];
  

const jsChunkDescriptions = [
 
    {
      node_name: "program",
      description : "" 

    },
    {
      node_name: "function_declaration",      
    },
    
    {
      node_name: "class_declaration",
    },

    {
      node_name :"export_statement",
    }
  
    
       ]; 



       const htmlChunkDescriptions = [
        {
          node_name: "docnode_name",
        },
        
        {
          node_name: "html_element",
        },
      
        {
          node_name: "body_element",
        },
        {
          node_name: "script_element",
        },
        {
          node_name: "style_element",
        },
        {
          node_name: "element",
        },
        {
          node_name: "text",
        },
      
      ];
      








exports.modules ={
  pythonChunkDescriptions,
  jsChunkDescriptions,
  htmlChunkDescriptions
}