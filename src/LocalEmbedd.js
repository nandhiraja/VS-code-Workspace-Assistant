

const pipeline = async (...args) => {
    const { pipeline } = await import('@xenova/transformers');
    // @ts-ignore
    return pipeline(...args);
  };
  

//================================================================================================================================




    async function getEmbedding(text) {

        const pipe = await pipeline(
            'feature-extraction',
            'Supabase/gte-small',
          );
          
          const output = await pipe(text, {
            pooling: 'mean',
            normalize: true,
          });
          
          const embedding = Array.from(output.data);
          
          console.log("Embedding length:", embedding.length);
          return embedding;
   }




//================================================================================================================================

//                                 gte -small   ==>     embedding model

//================================================================================================================================


module.exports ={

               getEmbedding

               }

























// getEmbedding("function add(a, b) { return a + b; }")
//   .then(embedding => {
//     console.log("Embedding length:", embedding.length);
//    // console.log("Preview:", embedding.slice(0, 5));
//   });
