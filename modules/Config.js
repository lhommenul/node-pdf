const Header = require('./Header.js')
const Footer = require('./Footer.js')

class Config{
  constructor({
    header = Header
    ,footer = Footer
    ,format = String
    ,landscape = String
    ,margin = Object
  }){
    this.header = header;
    this.footer = footer;
    this.format = format;
    this.landscape = landscape;
    this.margin = margin;
  }

}


module.exports = Config
