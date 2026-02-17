const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");

/*
==============================
CREATE POLL
==============================
*/
router.post("/create", async (req, res) => {
  try {
    const { question, options } = req.body;

    const poll = await Poll.create({
      question,
      options: options.map(o => ({
        text: o,
        votes: 0
      })),
      voters: []
    });

    res.json(poll);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
==============================
GET POLL
==============================
*/
router.get("/:id", async (req, res) => {
  const poll = await Poll.findByPk(req.params.id);
  res.json(poll);
});

/*
==============================
VOTE (FINAL CORRECT VERSION)
==============================
*/
router.post("/vote/:id", async (req, res) => {
  try {

    const { optionIndex, voterId } = req.body;

    console.log("VOTE RECEIVED:", optionIndex, voterId);

    const poll = await Poll.findByPk(req.params.id);

    if (!poll)
      return res.status(404).json({ message: "Poll not found" });

    const voters = poll.voters || [];

    if (voters.includes(voterId))
      return res.status(400).json({ message: "Already voted" });

    /*
    ==========================
    CLONE JSON (CRITICAL)
    ==========================
    */
    const updatedOptions = JSON.parse(JSON.stringify(poll.options));
    updatedOptions[optionIndex].votes += 1;

    const updatedVoters = [...voters, voterId];

    /*
    ==========================
    FORCE SAVE JSON
    ==========================
    */
    poll.set("options", updatedOptions);
    poll.set("voters", updatedVoters);
    await poll.save();

    /*
    ==========================
    FETCH FRESH
    ==========================
    */
    const freshPoll = await Poll.findByPk(req.params.id);

    /*
    ==========================
    REALTIME BROADCAST
    ==========================
    */
    req.io.to(req.params.id.toString()).emit("update", freshPoll);

    res.json(freshPoll);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
