const puppeteer = require('puppeteer');
const fs = require('fs');
const Config = require('./Config.js') ;
const Row = require('./Row.js');
const Table = require('./Table.js'); 

class Document{
  html;
  page_height;
  page_width;
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
    console.log(this.config.margin.bottom);
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
      console.log(document_height);

      // GET THE POSITION OF ALL ROWS

      const all_rows = await page.evaluate(() => { // Get position of all rows inside the document
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

      if ( all_rows[all_rows.length-1].x+all_rows[all_rows.length-1].height <= this.page_height ) return console.log("Only on page for this document => the this can be generated");

      let page_current_height = this.page_height;
      let current_page = 1;
      
      const i = all_rows.map(r => { // Generating new pages
        if (r.x+r.height>page_current_height) {
          page_current_height += page_current_height;
          current_page+=1;
        }
        r.page = current_page;
        return r;
      });

      // GET THE POSITION OF ALL GROUPS


      const all_groups = await page.evaluate(() => { 
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
      
      
      let margin_page = this.config.margin.top+this.config.margin.bottom;
      let pch = this.page_height-margin_page;
      let cp = 1;

      const li = all_groups.map((r,index) => { // Generating new pages

        let group_height = r.x+r.height;
        let group_specifications = undefined;

        r.page = [cp];

        if ( group_height > pch ) getGroupType(this.html[index]);

        while ( group_height > pch  ) {

          pch += pch; // Increase the page height
          cp+=1; // Increase the page umber
          r.page.push(cp);
    
        }

        return r;
        
        function getGroupType(group) {

          switch (group.constructor.name) {
            case "Table":
              console.log(group);
              break;
          
            default:
              throw new Error('Unkown group type')
              break;
          }

        }

      });
      

      console.log(li);
      // await page.this({ 
      //   path: 'hn.this'
      //   , format: 'a4' 
      // });

      await browser.close();

  }

}

module.exports = Document