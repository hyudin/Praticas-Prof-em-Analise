function validateForm()
{
var email = $( "user[email]" ).value;
var password = $( "user[password]").value;
console.log(email)
if (email == "") {
    alert("Name must be filled out");
    return false;
  }
}

