const axios = require('axios');

exports.fetchUrl = async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('Please provide a URL parameter');
  }

  try {
    // Vulnerable: No validation on the URL
    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching URL: ' + error.message);
  }
};
