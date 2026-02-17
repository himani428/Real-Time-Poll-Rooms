import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("https://real-time-poll-rooms-qqbp.onrender.com");

export default function PollRoom() {

  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  /*
  ==============================
  LOAD + REALTIME
  ==============================
  */
  useEffect(() => {
    if (!id) return;

    fetchPoll();

    socket.emit("joinPoll", id);

    const handler = (updatedPoll) => {
      console.log("REALTIME UPDATE RECEIVED");
      setPoll(updatedPoll);
    };

    socket.on("update", handler);

    return () => socket.off("update", handler);

  }, [id]);

  /*
  ==============================
  FETCH POLL
  ==============================
  */
  const fetchPoll = async () => {
    const res = await axios.get(`https://real-time-poll-rooms-qqbp.onrender.com/api/poll/${id}`);
    setPoll(res.data);
    setLoading(false);
  };

  /*
  ==============================
  VOTE
  ==============================
  */
  const vote = async (index) => {

    if (hasVoted) return;

    let voterId = localStorage.getItem("voterId");
    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("voterId", voterId);
    }

    setHasVoted(true);

    try {
      const res = await axios.post(
        `https://real-time-poll-rooms-qqbp.onrender.com/api/poll/vote/${id}`,
        { optionIndex: index, voterId }
      );

      setPoll(res.data);

    } catch (err) {
      alert(err.response?.data?.message);
      setHasVoted(false);
    }
  };

  if (loading) return <div className="loader"></div>;

  const totalVotes = poll.options.reduce((s,o)=>s+o.votes,0);

  return (
    <div className="container">

      <h1>{poll.question}</h1>
      <p>{totalVotes} total votes</p>

      {poll.options.map((opt,i)=>{

        const percent = totalVotes ? (opt.votes/totalVotes)*100 : 0;

        return (
          <div
            key={i}
            className={`poll-bar-wrapper ${hasVoted ? "disabled" : ""}`}
            onClick={()=>vote(i)}
          >
            <div
              className="poll-bar-fill"
              style={{width:`${percent}%`}}
            />

            <div className="poll-bar-content">
              {opt.text} — {opt.votes}
            </div>
          </div>
        )
      })}
    </div>
  );
}
