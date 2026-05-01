
// // You have a list of 20 IDs. Write a function that calls
// // this dummy function for ALL 20 IDs with a maximum of
// // 5 concurrent requests at any time. Results must be
// // returned in the SAME ORDER as the input list.

// //  

// // // Dummy function — do not change this
// // async function fetchUser(id: number) {
// //   await new Promise(r => setTimeout(r, 100));
// //   return { id, ok: true };
// // }

// //  

// // const ids = [42,7,15,3,99,21,56,8,34,77,
// //              11,63,29,84,5,47,92,18,71,38];

// //  

// // Requirements:
// // 1. All 20 IDs processed
// // 2. Never more than 5 running at the same time
// // 3. Output order matches input order

// // const ids = [42,7,15,3,99,21,56,8,34,77,
// //              11,63,29,84,5,47,92,18,71,38];


// class idfeatcher {
//     async featchids(ids: number[], concurrentLimit: number): Promise<{ id: number, ok: boolean }[]> {
//         let limit = concurrentLimit;
//         let result = [];
//         async function worker() {
//             while (limit) {
//                 const count = i++;
//                 result[count] = await featchids(ids[count]);
//             }
//         }
//         await Promise.all(Array.length(20, worker))
//         return result
//     }
// }