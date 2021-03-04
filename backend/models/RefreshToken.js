var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var RefreshSchema = new mongoose.Schema({
    uid: { type: String, unique: true, required: [true, "can't be blank"], index: true },
    exp: { type: Date, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

RefreshSchema.plugin(uniqueValidator, { message: 'Already exists!' });

RefreshSchema.methods.valid = function () {
    console.log(this.exp)
    return new Date() < this.exp
};

class RefreshClass {
static removeByUserID(user_id){
    console.log("removing tokens");
    this.deleteMany({user_id: user_id}, (err, data)=> {
        if (err) console.error(err);
        console.log("Removed Docs: ", data)
    });

}
}
RefreshSchema.loadClass(RefreshClass)

mongoose.model('RefreshToken', RefreshSchema);


