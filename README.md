# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product ScreeShots

### /ulrs is only accessible by logged in users and provided link for loggin or register
!["/ulrs is only accessible by logged in users and provided link for loggin or register"](https://github.com/Andrew-Li-12138/tinyapp/blob/main/docs/urls.png?raw=true)

### /register asks for users email and password
!["/register asks for users email and password"](https://github.com/Andrew-Li-12138/tinyapp/blob/main/docs/register.png?raw=true)

### Upon successful login or register, username(email) will show and user can click 'create new url' or use 'shorten a new URL' button to get to urls/new to enter a web address
!["Upon successful login or register, username(email) will show and user can click 'create new url' or use 'shorten a new URL' button to get to urls/new to enter a web address"](https://github.com/Andrew-Li-12138/tinyapp/blob/main/docs/urls_new.png?raw=true)

### After entering web address, tinyApp generate a short url
!["After entering web address, tinyApp generate a short url"](https://github.com/Andrew-Li-12138/tinyapp/blob/main/docs/urls_id.png?raw=true)

### If user wants to modify the web address, user can tyoe in the web address
!["If user wants to modify the web address, user can tyoe in the web address"](https://github.com/Andrew-Li-12138/tinyapp/blob/main/docs/urls_edit.png?raw=true)

### addresses are listed 
!["Final address will show the input results"](https://github.com/Andrew-Li-12138/tinyapp/blob/main/docs/urls_(result).png?raw=true)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## devDependencies: 

- chai
- mocha
- nodemon

## Getting Started

- Install all dependencies & devDependencies (using the `npm install` command). Nodemon is not necessary but nice you have.
- Run the development web server using the `node express_server.js` command. If Nodemon is installed, run `npm start`.
- Run `npm test` for testing support functions.
