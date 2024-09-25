const express = require('express');
const axios = require('axios').default;
const mysql = require('mysql');

const app = express();
const PORT = 3000;

const dbConfig = {
  host: 'db',
  user: 'root',
  password: 'password',
  database: 'nodedb',
};

app.get('/', async (_req, res) => {
  try {
    await insertName(res);
  } catch (error) {
    console.error('Error in request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Application running on Port: ${PORT}`);
});

async function getName() {
  try {
    const RANDOM = Math.floor(Math.random() * 10);
    const response = await axios.get('https://swapi.dev/api/people');
    return response.data.results[RANDOM].name;
  } catch (error) {
    console.error('Error fetching name:', error);
    throw new Error('Failed to fetch name');
  }
}

async function insertName(res) {
  const name = await getName();
  const connection = mysql.createConnection(dbConfig);
  const INSERT_QUERY = 'INSERT INTO people (name) VALUES (?)';

  connection.query(INSERT_QUERY, [name], (error) => {
    if (error) {
      console.error(`Error inserting name: ${error}`);
      res.status(500).send('Error inserting name');
      return;
    }
    console.log(`${name} inserted successfully in the database!`);
    getAll(res);
  });
}

function getAll(res) {
  const SELECT_QUERY = 'SELECT id, name FROM people';

  connection.query(SELECT_QUERY, (error, results) => {
    if (error) {
      console.error(`Error fetching people: ${error}`);
      res.status(500).send('Error fetching people');
      return;
    }

    const tableRows = results
      .map(
        (person) => `
        <tr>
          <td>${person.id}</td>
          <td>${person.name}</td>
        </tr>`
      )
      .join('');

    const table = `
      <table>
        <tr>
          <th>#</th>
          <th>Name</th>
        </tr>${tableRows}
      </table>`;

    res.send(`
      <h1>Full Cycle Rocks!</h1>
      ${table}
    `);
  });
}
