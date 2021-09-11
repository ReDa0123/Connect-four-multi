const io = require("socket.io")(3000, {
    cors: {
        origin: ['http://localhost:8080']
    }
})

io.on("connection", socket => {
    console.log(socket.id)

    socket.on("roomJoin", room => {
        socket.room = room
        socket.join(room)

        const clients = io.sockets.adapter.rooms.get(room)
        const numberOfClients = clients.size
        if (numberOfClients === 1){
            socket.emit("waitForOtherPlayer")
        } else if (numberOfClients > 2){
            socket.emit("roomFull")
        } else {
            socket.to(room).emit("startGame", false)
            socket.emit("startGame", true)
        }
    })

    socket.on("move", tileID => {
        socket.to(socket.room).emit("move", tileID)
    })

    socket.on("newGame", () => {
        socket.to(socket.room).emit("newGame-recieve")
    })

    socket.on("disconnect", () => {
        io.to(socket.room).emit("otherDisconnected")
    })
})