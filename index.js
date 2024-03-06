import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Paras@2002",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = await getFirstUser();
async function getFirstUser(){
  const result = await db.query("SELECT * FROM person");
  if(!result.rows[0]){
    return 0;
  }
  return result.rows[0].id;
}
let users = [];
async function checkVisisted() {
  try {
    const result = await db.query("SELECT country_code FROM family_visited WHERE id=$1",[currentUserId]);
    let countries = [];
    if (result) {
      result.rows.forEach((country) => {
        countries.push(country.country_code);
      });
    }
    return countries;
  } catch (error) {
    console.log(error);
  }
}

async function getCurrentUser() {
  try{
    const result = await db.query("SELECT * FROM person");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
  }catch(error){
    console.log(error);
  }
}

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM person");
    users=result.rows;
    const countries = await checkVisisted();
    const currentUser = await getCurrentUser();
  res.render("index.ejs", {
    countries: countries,
    total: countries?countries.length:0,
    users: users,
    color: currentUser?currentUser.color:"green",
  });
  } catch (error) {
    console.log(error);
  }
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO family_visited (id,country_code) VALUES ($1,$2)",
        [currentUserId,countryCode]
      );
      
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  } finally {
    res.redirect("/");
  }
});
app.post("/user", async (req, res) => {
  const user = req.body.user;
  const add = req.body.add;
  if (add) {
    res.render('new.ejs');
  } else {
    currentUserId=user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  try {
    await db.query("INSERT INTO person (name,color) VALUES ($1,$2)", [req.body.name, req.body.color]);
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
