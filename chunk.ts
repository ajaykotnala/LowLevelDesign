//1)

// // You have a list of 20 IDs. Write a function that calls
// // this dummy function for ALL 20 IDs with a maximum of
// // 5 concurrent requests at any time. Results must be
// // returned in the SAME ORDER as the input list.

// //  

// // // Dummy function — do not change this
// // async function fetchUser(id: number) {
// //   await new Promise(r => setTimeout(r, 100));
// //   return { id, ok: true };
// // }

// //  

// // const ids = [42,7,15,3,99,21,56,8,34,77,
// //              11,63,29,84,5,47,92,18,71,38];

// //  

// // Requirements:
// // 1. All 20 IDs processed
// // 2. Never more than 5 running at the same time
// // 3. Output order matches input order

// // const ids = [42,7,15,3,99,21,56,8,34,77,
// //              11,63,29,84,5,47,92,18,71,38];

//------------------------------------------------------------------------------------------------

//2)

// you have a long string of text.
// Write a function chunkText(text, chunkSize, overlap) that:

//  

// - Splits the text into chunks of chunkSize characters
// - Each consecutive chunk overlaps by overlap characters
//   with the previous one
// - Returns an array/list of chunk strings

//  

// Test with:
// const text = "The quick brown fox jumps over the lazy dog. " +
//              "The dog barked at the fox and the fox ran away " +
//              "into the forest where it lived happily ever after.";

//  

// chunkSize = 20, overlap = 5

//

// you have a long string of text.
// Write a function chunkText(text, chunkSize, overlap) that:

//  

// - Splits the text into chunks of chunkSize characters
// - Each consecutive chunk overlaps by overlap characters
//   with the previous one
// - Returns an array/list of chunk strings

//  

// Test with:
// const text = "The quick brown fox jumps over the lazy dog. " +
//              "The dog barked at the fox and the fox ran away " +
//              "into the forest where it lived happily ever after.";

//  

// chunkSize = 20, overlap = 5

//  

// Print each chunk and its length.

class chunktextslider {

    chunkmystring(text, chunkSize, overlap) {
        const chuck = [];
        let steps = chunkSize - overlap;  // 15  total lenght  == 30
        for (let i = 0; i < text.length; i += steps) {
            chuck.push(text.substring(i, i + chunkSize));
        }
        return chuck;
    }
}

// chenk = 0-20
// chunk = 15
//check  = 15-30 

class clientcode {
    main() {
        const text = "The quick brown fox jumps over the lazy dog. " + "The dog barked at the fox and the fox ran away " + "into the forest where it lived happily ever after.";
        const chunkSize = 20;
        const overlap = 5;
        const chunks = new chunktextslider().chunkmystring(text, chunkSize, overlap);
        chunks.forEach((chunk, i) => {
            console.log(`Chunk ${String(i + 1).padStart(2, "0")} (len=${chunk.length}): "${chunk}"`);
          });

    }
}

new clientcode().main();
export { };