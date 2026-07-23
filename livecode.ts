
// conmvert this into a class and use dependency injection for fs module

import fs from 'fs';
 

//code review
//donet pass this 

//dont pass userID 

// have cenbtrilize status code based error handling
// Result class for this 
// livuv to provide event loop.  cpu harware layer
// worker thread (livuv event loop can convert that into pralllelism )


// process user should not do file reading

// checking user canbe moved to another method and can be used in other places as well
// right status code and no new error 
export async function processUserFile(filePath: string, userId: string): Promise<string> {
    try {

        // cpu blocked operation as node is single thread so use worker thread

        const data =await  fs.readFileSync(filePath, 'utf-8');
        // close the connection and move this into another method

        const users = JSON.parse(data);


        // if we have users featch into respose and of json and check if iterator (array or list)
        // 
        if(Array.isArray(users) && users.length) {

            const filterUsers = users.filter((user) => {

                if(user.id === userId) return user;

            });

            const user = filterUsers[0];

            if(!user) {

                throw new Error('User not found');

            }

            if (!user.email || !user.name) {

               throw new Error('Missing user info');

            }

            return `User: ${user.name}, Email: ${user.email}`;

        }

      //  throw new Error('No Users')

      // returns status code 201 with msg called no users

    } catch(err) {

        throw Error(err);

    }

}