//function returns a string of 6 random alphanumeric characters for helping generate random short URL ID
function generateRandomString(urlLength) {
  const characterBase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''

  for (let i = 0; i < urlLength; i++) {
    randomIndex = Math.floor(Math.random() * characterBase.length);
    randomString += characterBase[randomIndex]
  }
   return randomString;
} 

module.exports = { generateRandomString }