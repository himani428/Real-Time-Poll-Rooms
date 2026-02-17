module.exports = (io) => {
  io.on("connection", (socket) => {

    console.log("Client connected:", socket.id);

    socket.on("joinPoll", (pollId) => {
      console.log("Joining poll room:", pollId);
      socket.join(pollId.toString());
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

  });
};
