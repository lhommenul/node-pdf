const Document = require('./modules/Document');
const Config = require('./modules/Config')

const example_data = require('./data.json')

// GENERATE PDF

const config = new Config({
  header:"<header>je suis le header</header>"
  ,footer:"<footer>je suis le footer</footer>"
  ,landscape:false
  ,format:'A4'
  ,margin:{
    top:50
    ,left:0
    ,right:0 
    ,bottom:0 
  }
});

const pdf = new Document({
  config:config
  ,data:[{
    type:'table'
    ,header:[
      {
        name:"column"
      },
      {
        name:"column2"
      },
      {
        name:"column3"
      },
    ]
    ,data:example_data
  }]
})

pdf.generateHtml();

pdf.generatePreview();

