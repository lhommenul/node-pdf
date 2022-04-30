const { add } = require('nodemon/lib/rules');
const Table = require('./Table.js')

module.exports = class Row{
  constructor({
    type = String||Number||Table
    ,data = undefined
  }){
    this.data = data;
    this.type = type;
  }
  generateHtml(){

    switch (this.type.constructor.name) {
      case "Table":
          return `
          <tr class="row" >
            ${ // generate body columns
              Object.values(this.data).reduce((acc,value)=> acc += `<td>${value}</td>` ,'')
            }
          </tr>
          `
      break;
          
      default:
        throw new Error(`unsupport parent type ${this.type.constructor.name}`);
    }
    
  }
}