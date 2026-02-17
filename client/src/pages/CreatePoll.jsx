import { useState } from "react";
import axios from "axios";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [link, setLink] = useState("");

  const createPoll = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/poll/create", {
        question,
        options
      });

      setLink(`${window.location.origin}/poll/${res.data.id}`);

    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };

  return (
    <div className="container">
      <h1>Create Poll</h1>

      <input
        placeholder="Poll question"
        onChange={(e)=>setQuestion(e.target.value)}
      />

      {options.map((opt,i)=>(
        <input
          key={i}
          placeholder={`Option ${i+1}`}
          onChange={(e)=>{
            const arr=[...options];
            arr[i]=e.target.value;
            setOptions(arr);
          }}
        />
      ))}

      <button onClick={()=>setOptions([...options,""])}>
        Add Option
      </button>

      <button onClick={createPoll}>
        Create Poll
      </button>

      {link && (
        <div className="share-card">
          <h3>🎉 Poll Created Successfully</h3>

          <input value={link} readOnly />

          <button onClick={copyLink}>
            Copy Link
          </button>

          <p>Share this link to vote live.</p>
        </div>
      )}
    </div>
  );
}
