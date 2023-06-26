const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { generateRandomString, userLookupByEmail } = require('./supportFunctions');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}; // JSON data

const users = {
  aa: {
    id: "aa",
    email: "a@a.com",
    password: "123",
  },
  bb: {
    id: "bb",
    email: "b@b.com",
    password: "456",
  },
};


app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { 
    urls: urlDatabase,
    user: users[userID]
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new",(req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { user: users[userID] };
  res.render("urls_new", templateVars);
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
  const userID = req.body.user_id
  console.log(username)
  res.cookie('user_id', `${userID}`)
  res.redirect('/urls')
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("urls/")
})

app.get("/register", (req, res) => {
  res.render("urls_register")
})

app.post("/register", (req, res) => {
  if (req.body.email === ""){
    res.status(400).send("this email address is already registered.")
    return
  } 

  matchingResult = userLookupByEmail(req.body.email, users)
  if (matchingResult !== null) {
    res.status(400).send("this email address is already registered.")
    return
  }

  const randomID = generateRandomString(2);
  req.body.id = randomID
  users[randomID] = req.body;
  console.log(users);

  res.cookie('user_id', `${randomID}`)
  res.redirect("/urls")
}) 

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: users[userID]
  };
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

