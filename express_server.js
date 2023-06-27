const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { generateRandomString, userLookupByEmail, urlsForUser } = require('./supportFunctions');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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
  const userID = req.cookies["user_id"];
  console.log(userID)
  const loginURL = urlsForUser(userID, urlDatabase)
  console.log(loginURL)
  const templateVars = {
    urls: loginURL,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //If the user is not logged in, respond with an HTML message that tells the user why they cannot shorten URLs.
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] }
  if(!templateVars.user){
    res.status(403).send("You need to login first")
    return
  }

  //add key value pair - randomString : newly entered long url - to urlDatabse
  const longURL = req.body.longURL.trim(); //delete space if there is any before/after entered URL to avoid errors in future redirecting
  const randomString = generateRandomString(6);
  urlDatabase[randomString] = {};
  urlDatabase[randomString]['longURL'] = longURL;
  urlDatabase[randomString]['userID'] = userID
  console.log(urlDatabase);
  //redirect to urls/:id after form submission
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/new",(req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  //If the user is not logged in, redirect to GET /login
  if(!templateVars.user){
    res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID] };
  //If the user is logged in, redirect to GET /urls
  //if(templateVars.user){
  // res.redirect("/urls")
  //} This logic is handled in login.ejs by showing "already logged in" message and a link back to /urls
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const user = userLookupByEmail(inputEmail, users);

  //If a user with that e-mail cannot be found, return a response with a 403 status code.
  if (user === null) {
    res.status(403).send("No matching email found, please register first");
    return;
  }

  const userID = user.id;
  const userPassword = user.password;

  //compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  if (inputPassword !== userPassword) {
    res.status(403).send("Incorrect Password");
    return;
  }
   
  //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  res.cookie('user_id', `${userID}`);

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { user: users[userID]};
  //If the user is logged in, redirect to GET /urls
  //if(templateVars.user){
   // res.redirect("/urls")
   //}  This logic is handled in registered.ejs by showing "already logged in" message and a link back to /urls
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  //If email/password are empty, send back response with 400 status code
  if (req.body.email === "") {
    res.status(400).send("Email address cannot be empty.");
    return;
  }
  //If email already exists in users object, send response back with 400 status code
  const matchingResult = userLookupByEmail(req.body.email, users);
  if (matchingResult !== null) {
    res.status(400).send("This email address has already been registered.");
    return;
  }
  //Add new user object to global users object ;
  const randomID = generateRandomString(2);
  req.body.id = randomID;
  users[randomID] = req.body;
  console.log(users);
  //Set userid cookie
  res.cookie('user_id', `${randomID}`);
  // Redirect user to /urls page
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const userData = urlDatabase[req.params.id]
   //If a user tries to access a shortened url that does not exist we should send them a relevant message
   if(!userData) {
    res.status(404).send("This short URL doesn't exist in database")
    return
  }
  //The individual URL pages should not be accessible to users who are not logged in
  if(!userID) {
    res.status(403).send("Avaialble for logged in users only");
    return
  }
  //The individual URL pages should not be accesible if the URL does not belong to them
  if(userData['userID'] !== userID){
    res.status(403).send("Not available for your access")
    return
  }

  const templateVars = {
    id: req.params.id,
    longURL: userData['longURL'],
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"]
  const userData = urlDatabase[req.params.id]
   //If a user tries to access a shortened url that does not exist we should send them a relevant message
   if(!userData) {
    res.status(404).send("This short URL doesn't exist in database")
    return
  }
  //The eidt page should not be accessible to users who are not logged in
  if(!userID) {
    res.status(403).send("Cannot edit if not logged in");
    return
  }
  //The eidt page should not be accesible if the URL does not belong to them
  if(userData['userID'] !== userID){
    res.status(403).send("Not available for your access")
    return
  }
  //take long url entered from uls_show form
  const newURL = req.body.newURL.trim();
  //substitue old long url with new url with same id (value in params)
  urlDatabase[req.params.id] = {} ;
  urlDatabase[req.params.id]['longURL'] = newURL;
  urlDatabase[req.params.id]['userID'] = userID;
  console.log(urlDatabase);
  //redirect to /urls after form submission
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  const userData = urlDatabase[req.params.id]
    //If a user tries to access a shortened url that does not exist we should send them a relevant message
    if(!userData) {
      res.status(404).send("This short URL doesn't exist in database")
      return
    }
  //The delete page should not be accessible to users who are not logged in
  if(!userID) {
    res.status(403).send("Cannot delete if not logged in");
    return
  }
  //The delete page should not be accesible if the URL does not belong to them
  if(userData['userID'] !== userID){
    res.status(403).send("Not available for your access")
    return
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// when click at shortened url from /urls/:id page (/u/:id link), redirect to its longURL address
app.get("/u/:id", (req, res) => {
  const userData = urlDatabase[req.params.id];
  const longURL = urlDatabase[req.params.id]['longURL']
  //If a user tries to access a shortened url that does not exist we should send them a relevant message
  if(!userData) {
    res.status(404).send("This short URL doesn't exist in database")
    return
  }
  console.log(userID);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

