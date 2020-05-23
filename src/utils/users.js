const users = [];

// add user
const addUser = ({id, username, room}) => {
    
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validation
    if(!username || !room){
        return {
            error: "Username and room is required."
        }
    }

    // check for existing user
    
    const existingUser = users.find( (user)  => {
        return user.room === room && user.username === username
    })

    // validate username
    if(existingUser){
        return{
            error: 'Username is in use'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    
    return { user }
}

//  remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

//  get user fn
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// get users in room fn
const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
}
 

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}