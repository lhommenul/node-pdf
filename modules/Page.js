const Footer = require('./Footer.js')
const Header = require('./Header.js')

module.exports = class Page{
  constructor({
    header = Header
    ,footer = Footer
    ,page_number = Number
  }){
    this.header = header;
    this.footer = footer;
    this.page_number = page_number;
  }

}