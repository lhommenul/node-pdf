const Row = require('./Row.js');
const Group = require('./Group.js')

module.exports = class Table extends Group{
  rows;
  constructor({
    id = String||Number
    ,header = Array
  }){
    super();
    this.header = header;
    this.id = `table_${id}`;
  }
  addRows(rows = Row){
    this.rows = rows;
  }
  generateTableHeader(){
    
    return `
      <thead class="table-header" data-parent-table="${this.id}" >
        <tr>
          ${ // Generate header columns
            this.header.reduce((acc,element)=>{
              acc += `
                <td>
                  ${element.name}
                </td>
              `  
              return acc
            },'')
          }
        <tr>
      </thead>
    `
  }
  generateHtml(){

    return `
      <table class="type ${this.class_name}" >
        ${
          this.generateTableHeader()
        }
        <tbody>
          ${ 
            this.rows.reduce((acc,row)=> acc+=row.generateHtml(),'') 
          }
        </tbody>
      </table>
    `

  }
}


class TableHeader{
  constructor({

  }){

  }
}

// module.exports = {
//   Table,TableHeader
// }