const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
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
  //note passwords are hashed by bcrypt
  aa: {
    id: "aa",
    email: "a@a.com",
    password: bcrypt.hashSync("123", 5),
  },
  bb: {
    id: "bb",
    email: "b@b.com",
    password: bcrypt.hashSync("456", 5),
  },
};


app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['encode'],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const userID = req.session.user_id
  if(!userID){
    res.redirect("/urls")
  }
    res.redirect("/login")
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  const loginURL = urlsForUser(userID, urlDatabase);

  const templateVars = {
    urls: loginURL,
    user: users[userID]
  };
  res.render("urls_index", templateVars);
  //please note logic of allowing only logged in visit is writte in urls_index
});

app.post("/urls", (req, res) => {
  //If the user is not logged in, respond with an HTML message that tells the user why they cannot shorten URLs.
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  if (!templateVars.user) {
    res.status(403).send("You need to login first");
    return;
  }

  //add key value pair - randomString : newly entered long url - to urlDatabse
  const longURL = req.body.longURL.trim(); //delete space if there is any before/after entered URL to avoid errors in future redirecting
  const randomString = generateRandomString(6);
  urlDatabase[randomString] = {};
  urlDatabase[randomString]['longURL'] = longURL;
  urlDatabase[randomString]['userID'] = userID;

  //redirect to urls/:id after form submission
  res.redirect(`/urls/${randomString}`);
});

app.get("/urls/new",(req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  //If the user is not logged in, redirect to GET /login
  if (!userID) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  //If the user is logged in, redirect to GET /urls
  //if(templateVars.user){
  // res.redirect("/urls")
  //} This logic is commented out because it is handled in login.ejs by showing "already logged in" message and a link back to /urls
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
  const userPassword = user.password; //userPassword was hashed by bcrypt when registered and in database

  //compare the password given in the form with the existing user's password. If it does not match, return a response with a 403 status code.
  if (!bcrypt.compareSync(inputPassword, userPassword)) {
    res.status(403).send("Incorrect Password");
    return;
  }
   
  //If both checks pass, set the user_id cookie with the matching user's random ID, then redirect to /urls.
  req.session.user_id = userID;

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID]};
  //If the user is logged in, redirect to GET /urls
  //if(templateVars.user){
  // res.redirect("/urls")
  //} This logic commented out because it is handled in registered.ejs by showing "already logged in" message and a link back to /urls
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {

  //If email/password are empty, send back response with 400 status code
  if (req.body.email === "") {
    res.status(400).send("Email address cannot be empty.");
    return;
  }

  if (req.body.password === "") {
    res.status(400).send("Password cannot be empty.");
    return;
  }
  //If email already exists in users object, send response back with 400 status code
  const matchingResult = userLookupByEmail(req.body.email, users);
  if (matchingResult !== null) {
    res.status(400).send("This email address has already been registered.");
    return;
  }
  
  const randomID = generateRandomString(2);
  
  req.body.id = randomID;
  //use bcrypt.hashSync and save the resulting hash of the password
  const hashedPassword = bcrypt.hashSync(req.body.password, 5);
  req.body.password = hashedPassword;
  
  //Add new user object to global users object ;
  users[randomID] = req.body;

  //Set user_id cookie
  req.session.user_id = randomID;

  // Redirect user to /urls page
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userData = urlDatabase[req.params.id];
  //If a user tries to access a shortened url that does not exist we should send them a relevant message
  if (!userData) {
    res.status(404).send("This short URL doesn't exist in database");
    return;
  }
  //The individual URL pages should not be accessible to users who are not logged in
  if (!userID) {
    res.status(403).send("Avaialble for logged in users only");
    return;
  }
  //The individual URL pages should not be accesible if the URL does not belong to them
  if (userData['userID'] !== userID) {
    res.status(403).send("Not available for your access");
    return;
  }

  const templateVars = {
    id: req.params.id,
    longURL: userData['longURL'],
    user: users[userID]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userData = urlDatabase[req.params.id];
  //If a user tries to access a shortened url that does not exist we should send them a relevant message
  if (!userData) {
    res.status(404).send("This short URL doesn't exist in database");
    return;
  }
  //The eidt page should not be accessible to users who are not logged in
  if (!userID) {
    res.status(403).send("Cannot edit if not logged in");
    return;
  }
  //The eidt page should not be accesible if the URL does not belong to them
  if (userData['userID'] !== userID) {
    res.status(403).send("Not available for your access");
    return;
  }
  //take long url entered from uls_show form
  const newURL = req.body.newURL.trim();
  //substitue old long url with new url with same id (value in params)
  urlDatabase[req.params.id] = {};
  urlDatabase[req.params.id]['longURL'] = newURL;
  urlDatabase[req.params.id]['userID'] = userID;
 
  //redirect to /urls after form submission
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const userData = urlDatabase[req.params.id];
  //If a user tries to access a shortened url that does not exist we should send them a relevant message
  if (!userData) {
    res.status(404).send("This short URL doesn't exist in database");
    return;
  }
  //The delete page should not be accessible to users who are not logged in
  if (!userID) {
    res.status(403).send("Cannot delete if not logged in");
    return;
  }
  //The delete page should not be accesible if the URL does not belong to them
  if (userData['userID'] !== userID) {
    res.status(403).send("Not available for your access");
    return;
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// when click at shortened url from /urls/:id page (/u/:id link), redirect to its longURL address
app.get("/u/:id", (req, res) => {
  const userData = urlDatabase[req.params.id];
  //If a user tries to access a shortened url that does not exist we should send them a relevant message
  if (!userData) {
    res.status(404).send("This short URL doesn't exist in database");
    return;
  }
  
  const longURL = userData['longURL'];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

