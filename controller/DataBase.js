const mongoose=require('mongoose')

mongoose.connect('mongodb://localhost:27017/Project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


 
  const userSchema = new mongoose.Schema({
    Name: String,
    email: String,
    password: String,
    Admin:Boolean,
    status: String
  });

  const User = mongoose.model('users', userSchema);

  module.exports=User
