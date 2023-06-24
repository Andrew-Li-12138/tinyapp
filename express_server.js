const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { generateRandomString } = require('./supportFunctions');


app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}; // JSON data

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req, res) => {
  res.render("urls_new")
});

app.post("/urls", (req, res) => {
  console.log(req.body);// Log the POST request body to the console
  //add key value pair - randomString : newly entered long url - to urlDatabse
  const longURL = req.body.longURL.trim(); //delete space if there is any before/after entered URL to avoid errors in future redirecting
  const randomString = generateRandomString(6);
  urlDatabase[randomString] = longURL;
  console.log(urlDatabase);
  //redirect to urls/:id after form submission
  res.redirect(`/urls/${randomString}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username
  console.log(username)
  res.cookie('username', `${username}`)
  res.redirect('/urls')
})

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  //take long url entered from uls_show form 
  const newURL = req.body.newURL.trim();
  //substitue old long url with new url with same id (value in params)
  urlDatabase[req.params.id] = newURL
  console.log(urlDatabase)
  //redirect to /urls after form submission
  res.redirect('/urls')
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
})

// when click at shortened url from /urls/:id page (/u/:id link), redirect to its longURL address
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log(longURL)
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});