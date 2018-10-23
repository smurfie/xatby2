module.exports = {
  // get Cookie name where cookies is the string from document.cookies
  getCookie: function(name, cookies) {
    var value = "; " + cookies;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
  },
  
  // get a random number between ini and end
  random: function(ini, end) {
    return Math.floor((Math.random() * end) + ini);
  }
}