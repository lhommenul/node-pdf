const Footer = require('./Footer.js')
const Header = require('./Header.js')
const Group = require('./Group.js')

module.exports = class Page{
  constructor({
    header = Header
    ,footer = Footer
    ,page_number = Number
    ,groups = Group
  }){
    this.header = header;
    this.footer = footer;
    this.page_number = page_number;
    this.groups = groups;
  }
  addGroups(groups = Group){
    this.groups = groups;
  }
  generateHtml(){
  
    return `
      <section class="page" data-page-number="${this.page_number}" >
        ${
          this.groups.reduce((acc,group)=>acc+=group.generateHtml(),'')
        }
      </section>
    `
  }
}