
const {getEmbedding} = require('./LocalEmberd');
const lancedb = require("@lancedb/lancedb");
const { FixedSizeList, Float32, Field, Schema, Utf8 } = require('apache-arrow');





//=============================================================================================================================
//=============================================================================================================================






const clientPromise = lancedb.connect("./src/UserRagDB/LanceVB/my-lancedb");


const codeSnippet = `
                Hello this is  code assitent  I'm glade to assiste you  for following queries,
                
                `;




const dim = 384;


const f32Schema = new Schema([
                         new Field("id",new Utf8()),
                         new Field(
                                  "vector",
                                  new FixedSizeList(dim, new Field("vector", new Float32(), true)),
                                  false,
                                  ),
                         new Field("chunk" ,new Utf8())
                         ]);


const data = lancedb.makeArrowTable(
                          Array.from(Array(1), (_, i) => ({
                                    id: i,
                                    vector: Array.from(Array(dim), Math.random),
                                    chunk :codeSnippet
                                  })),
                          { schema: f32Schema },
                          );                       



async function getClient() {
       return clientPromise;
      }


const dummyData={
                id :"1",
                vector : [1.00,0.95],
                chunk : "This is my data"
            
               }






//=============================================================================================================================
//=============================================================================================================================





async function getOrCreateCollection(name, initialData) {
    const db = await getClient();
    let table;
    try {
              // console.log("Trying to open the tabel : ",name);        
              table = await db.openTable(name);
      
            const rowCount = await table.countRows();
          //   console.log(`Total records in the table  Checking in getorcreate():   ${rowCount}`);

    } catch (e) {
     
                    table = await db.createTable(name, data);
                   console.log(`Collection "${name}" created with schema. Dimension data.`);
          }

    return table;

  }
  



//=============================================================================================================================




async function embedd(data, user_ids) {

            const table = await getOrCreateCollection("Trail1");
          
            const embedding = await getEmbedding(data);
        
          const doc = {
            id: user_ids,        
            vector: embedding,   
            chunk: data         
          };
        
           //   console.log(doc);
          
          await table.add([doc]);
        
         const allRecords = await table.query().toArray();
           //   console.log("All records " ,allRecords);
        
        
        
        
          const rowCount = await table.countRows();
        //  console.log(`Total records in the table: ${rowCount}`);
         console.log("Documents upserted successfully.");
  
        
  return "success";
}





//=============================================================================================================================
//=============================================================================================================================





async function info() {
  const db = await getClient();
  const tables = await db.tableNames();

  const table = await getOrCreateCollection("Trail1");  
  const results = await table.query().toArray();  
  const count = await table.countRows();
  
  console.log("ID llist and Its count :",results.map(r=> r.id),"\nCount: ",count);

  console.log("Total collections: ", tables.length);
  console.log("Collections list: ", tables);
  
  return { count: tables.length, list: tables };
}




//=============================================================================================================================
//=============================================================================================================================

//                                           ANSWER Generation part

//=============================================================================================================================
//=============================================================================================================================




async function getAns(queryText) {
              const table = await getOrCreateCollection("Trail1");
              const queryEmbedding = await getEmbedding(queryText);
            
             const results = await table.search(queryEmbedding).limit(4).toArray();
           
              console.log('The Given Query is : ',queryText ,'\nRESULT COUNT IS  : ',results.map(r => r.ids))


            
  return results;
}




//=============================================================================================================================
//=============================================================================================================================




async function del_collection(name_c="Trail1") {
  const db = await getClient();
  await db.dropTable(name_c);
  console.log(`Collection "${name_c}" deleted.`);
  const remaining = await db.tableNames();
  console.log("Remaining collections:", remaining);
}

// del_collection("Trail1")
// const Currnet_collection = "Trail1";

// embedd("Tell about the project : ", "message1")
// info()
// getAns("Tell about the extension program file project? ")


//==============================================================================================================================
//=============================================================================================================================





async function delete_id(id) {
  try{
    const table = await getOrCreateCollection("Trail1");
    const result = await table.delete(`id = "${id}"`);
 
     console.log(`Deleted row with id "${id}"\nCount of rows : ${table.countRows()}`);
  }
  catch (error) {
    console.error("Error deleting row:", error);
  }
  


}


//=============================================================================================================================
//=============================================================================================================================


module.exports = {
  embedd,
  getAns,
  info,
  delete_id,
  del_collection
};





















