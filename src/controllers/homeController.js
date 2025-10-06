const { get } = require("http");


let getHomePage = async (req, res) => {
    try {
        return res.render('homepage.ejs');
    

    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    getHomePage: getHomePage
}