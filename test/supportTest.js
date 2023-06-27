const { assert } = require('chai');

const { userLookupByEmail, urlsForUser, generateRandomString } = require('../supportFunctions.js');

//test 1 - userLookupByEmail
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe(' userLookupByEmail', function() {
  it('should return a user with valid email', function() {
    const user =  userLookupByEmail ("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.deepStrictEqual(user, testUsers[expectedUserID])
  });

  it('should return null with email not in database', function() {
    const user =  userLookupByEmail ("user3@example.com", testUsers)
    assert.strictEqual(null, null)
  });

});

//test 2 -  urlsForUser
const testUrlDatabase = {
  abc: {
    longURL: "https://www.tsn.ca",
    userID: "123",
  },
  def: {
    longURL: "https://www.google.ca",
    userID: "123",
  },
};

describe(' urlsForUser ', function() {
  it('should returns the URLs where the userID is equal to the id of the currently logged-in user', function() {
    const user =  urlsForUser ("123", testUrlDatabase)
    assert.deepStrictEqual(user, {abc: {
      longURL: "https://www.tsn.ca",
      userID: "123",
    },
    def: {
      longURL: "https://www.google.ca",
      userID: "123",
    }})
  });

})

//test 3 - generateRandomString
console.log("Test for generateRandomString(5), which generates 5 random alphanumeric values")

for (let i = 0; i < 10; i++ ) {
console.log(generateRandomString(5))
}
console.log("----------------------")