//function returns a string of 6 random alphanumeric characters for helping generate random short URL ID
const generateRandomString = function (urlLength) {
  const characterBase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''

  for (let i = 0; i < urlLength; i++) {
    randomIndex = Math.floor(Math.random() * characterBase.length);
    randomString += characterBase[randomIndex]
  }
   return randomString;
} 

//user lookup helper function
const userLookupByEmail = function (emailInput, data) {
  for (let user in data) { console.log(data[user])
    if (data[user].email === emailInput) {
      return data[user]
    } 
}
   return null
}

//returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser = function (cookieID, dataURL) {
  let result = {}
  for (let dataID in dataURL) {
    if (result[!dataID]){
        result[dataID] = {};
    }
    if (cookieID === dataURL[dataID]['userID']){
        result[dataID]= dataURL[dataID]
    }
  }
  return result
}

module.exports = { generateRandomString, userLookupByEmail, urlsForUser }