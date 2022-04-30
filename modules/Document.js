const puppeteer = require('puppeteer');
const fs = require('fs');
const Config = require('./Config.js') ;
const Row = require('./Row.js');
const Table = require('./Table.js'); 
const Page = require('./Page.js'); 

class Document{
  html;
  page_height;
  page_width;
  pages = []
  constructor({
    config = Config
    ,path = undefined
    ,data = Array
    ,format = String
  }){
    this.config = config;
    this.path = path??'./demo.html';
    this.data = data;
    this.#setPageFormat()
    this.#generateDocument()
  }  
  #setPageFormat(){

    let A4 = ()=> {
      this.page_height = 1754
      this.page_width = 1240
    }
    switch (this.config.format) {
      case "A4":
        A4()
        break;
      case "a4":
        A4()
        break;
      default:
        break;
    }
    
  }
  #generateDocument(){
    
    const document_data = this.data.map((row,index) => {

      let type;

      switch (row.type) { // Create a new instance by type

        case "table": // Generate a table
          type = new Table({
            id:index
            ,header:row.header
          })
          break;
      
        default: // The type doesnt exist
          throw new Error(`Unknow row type ${row.type}`)
      }


      type.addRows(
        row.data.map(element=>{
          return new Row({
            type:type
            ,data:element
          })
        })
      ) 
      
      return type;

    });

    this.html = document_data;

  }
  #parseContentIntoBody(){
    
    const content = this.html.reduce((acc,value)=> acc+=value.generateHtml(),'')
    
    return `
      <!DOCTYPE html>
      <html lang='fr'>
      <head>
          <meta charset='UTF-8'>
          <meta http-equiv='X-UA-Compatible' content='IE=edge'>
          <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>Document</title>
      </head>
      <body>
          <header>
                <nav>
                </nav>
          </header>
          <main>
            ${content}
          </main>
          <footer>
          </footer>
          <style>
            body{
              margin-top:${this.config.margin.top};
              margin-bottom:${this.config.margin.bottom};
              margin-left:${this.config.margin.left};
              margin-right:${this.config.margin.right};
            }
          </style>
      </body>
      </html>
    `

  }
  generateHtml(){

    if ( !this.html ) throw new Error('Your html document is empty');
    
    fs.writeFileSync(this.path,this.#parseContentIntoBody());

    return this.path;

  }
  async generatePreview(){

      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto('http://127.0.0.1:5500/demo.html', {
        waitUntil: 'networkidle2',
      });

      const document_height = await page.evaluate(() => document.querySelector('html').offsetHeight);
      // console.log(document_height);

      // GET THE POSITION OF ALL ROWS

      let all_rows = await page.evaluate(() => { // Get position of all rows inside the document
        let new_list = []
        const rows = document.querySelectorAll('.row')
        
        for (let index = 0; index < rows.length; index++) {

          const r = {
            x:rows[index].offsetTop // x position of the row
            ,height:rows[index].clientHeight // height of te row
          }

          new_list.push(r)

        }

        return new_list

      });

      // if ( all_rows[all_rows.length-1].x+all_rows[all_rows.length-1].height <= this.page_height ) return console.log("Only on page for this document => the this can be generated");

      // let page_current_height = this.page_height;
      // let current_page = 1;
      
      // const i = all_rows.map(r => { // Generating new pages
      //   if (r.x+r.height>page_current_height) {
      //     page_current_height += page_current_height;
      //     current_page+=1;
      //   }
      //   r.page = current_page;
      //   return r;
      // });

      // GET THE POSITION OF ALL GROUPS


      let all_groups = await page.evaluate(() => { 
        let new_list = []
        const groups = document.querySelectorAll('.group')
      
        for (let index = 0; index < groups.length; index++) {

          const r = {
            x:groups[index].offsetTop // x position of the row
            ,height:groups[index].clientHeight // height of te row
          }

          new_list.push(r)

        }

        return new_list

      });

      let margin_page = this.config.margin.top+this.config.margin.bottom; // Total margin top + bottom
      let pch = this.page_height-margin_page; // page height - ( margin top and bottom )
      let cp = 1;
      
      this.pages.push( // Add the first page of the document
        new Page({
          header : this.config.header
          ,footer : this.config.footer
          ,page_number:cp
          ,start:0
          ,end:pch
        })
      )
      
      Promise.all(

        all_groups.map( async (r,index) => { // Generating new pages

          let group_height = r.x+r.height;
          let group_specifications = undefined; // If this is a table or an other type of group spec
          let height_fix = 0; // fix the page size regarding to the margins, table headers ....
          let group_rows = this.html[index].rows;
          let last_index_row_add_to_a_page = 0; // start the next iterations of rows from this position

          const new_group = await getGroupType(this.html[index],false) // new group
          new_group.addRows(getRowsByPage(pch,0)) // add rows to the group

          this.pages[this.pages.length-1].addGroups([new_group])  // get the last page of the document

          if ( group_height > pch ) await getGroupType(this.html[index])

          while ( group_height > pch  ) {
            
            pch += this.page_height-margin_page; // Increase the page height
            cp+=1; // Increase the page number

            height_fix += group_specifications.height+margin_page

            group_height += height_fix // Increase the group height because of the header which will be added + the page config margin 

            this.pages.push( // Add a new page 
              new Page({
                header : this.config.header
                ,footer : this.config.footer
                ,page_number:cp
                ,start:pch+1-pch/2
                ,end:pch
              })
            )

            const new_group = await getGroupType(this.html[index],false) // new group
            new_group.addRows(getRowsByPage(pch,height_fix))
            this.pages[this.pages.length-1].addGroups([new_group])  // get the last page of the document

          }
  
          return r;
          
          function getRowsByPage(max_height,fix_height) {
            const page_height_without_margins = max_height-fix_height;
            console.log(`=== ${fix_height} / max-height ${page_height_without_margins} ===`);
            
            const { page_rows,new_group_rows } = group_rows.reduce((acc,row,index)=> {
              if ( all_rows[index+last_index_row_add_to_a_page].x+all_rows[index+last_index_row_add_to_a_page].height+fix_height<=page_height_without_margins ) acc.page_rows.push(row);
              else acc.new_group_rows.push(row)
              return acc;
            },{
              page_rows:[]
              ,new_group_rows:[]
            })

            group_rows = new_group_rows;

            last_index_row_add_to_a_page += page_rows.length;

            console.log(`total elements in the page : ${page_rows.length}`);

            return page_rows;

          }

          async function getGroupType(group,get_type = true) {
  
            switch (group.constructor.name) {
              case "Table":
              
                if (get_type) return getTableSpecs()

                return createTable(group.header)

                break;
            
              default:
                throw new Error('Unkown group type')

            }


            async function getTableSpecs() {

              const table_header = await page.$(`[data-parent-table="${group.id}"]`); // Get the table header

              const table_header_config = await table_header.evaluate((node) => { // Get the position and the height of the header
                
                return {
                  x:node.offsetTop,
                  height:node.clientHeight
                }

              })

              group_specifications = table_header_config;              

            }
            async function createTable(group_header) {

              return new Table({
                id : 151
                ,header : group_header
              })

            }

          }
  
        })
      )
      .then(response=>{
        // console.log(this.page_height);
        // console.log(this.page_width);
        // console.log(this.pages);

        this.pages.reduce((acc,page)=>{
          acc+=page.generateHtml()
          return acc;
        },'')

        response.forEach(group => {
          // console.log(group);
        });
        
      })
      .catch(err=>{

      })
      .finally(async ()=>{
        
        await browser.close();
      })
  
      // await page.this({ 
      //   path: 'hn.this'
      //   , format: 'a4' 
      // });

  }

}

module.exports = Document